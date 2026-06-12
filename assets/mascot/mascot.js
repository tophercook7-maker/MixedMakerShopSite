/*!
 * MascotEngine — staging + animation system for a transparent-video mascot.
 *
 *  ┌──────────────────────────────────────────────────────────────────┐
 *  │  This file is the framework only. It does NOT include character  │
 *  │  art. Drop transparent WebM (or other) files at the configured   │
 *  │  paths and they will be picked up automatically.                 │
 *  └──────────────────────────────────────────────────────────────────┘
 *
 * Asset paths (default — override via window.MASCOT_CONFIG):
 *   assets/mascot/idle.webm
 *   assets/mascot/walk.webm
 *   assets/mascot/tap.webm
 *   assets/mascot/scratch.webm
 *   assets/mascot/peek.webm     (optional — falls back to idle.webm)
 *   assets/mascot/exit.webm     (optional — falls back to walk.webm)
 *   assets/mascot/sounds/tap.mp3
 *   assets/mascot/sounds/scratch.mp3
 *
 * Markup required:
 *   <div class="mascot-layer" id="mascot" data-mascot-state="idle" aria-hidden="true"></div>
 *   <script src="assets/mascot/mascot.js" defer></script>
 *
 * Optional config (set BEFORE the <script> tag):
 *   <script>
 *     window.MASCOT_CONFIG = {
 *       audioEnabled: false,
 *       startPosition: 'bottom-right',
 *       mascotSize: { w: 220, h: 300 },
 *       safeZoneSelectors: ['[data-mascot-safe]', '.hero-cine__h1', '.btn'],
 *       autoIdleBehaviors: true,
 *       debugSafeZones: false,
 *     };
 *   </script>
 *
 * Public API (after init, exposed as `window.mascot`):
 *   mascot.setState('idle' | 'walk-left' | 'walk-right' | 'tap-glass' |
 *                   'scratch-glass' | 'peek' | 'exit')
 *   mascot.moveTo(x, y, { speed, onDone })
 *   mascot.moveToRandomSafePosition(opts)
 *   mascot.tap()           // setState + spawn tap effect + (optionally) play sound
 *   mascot.scratch()       // setState + spawn scratch effect + (optionally) play sound
 *   mascot.peek()          // setState('peek'); auto-reverts to idle
 *   mascot.exit()          // walks off-screen and hides
 *   mascot.enter()         // re-appear from left, walk to a random safe spot
 *   mascot.enableAudio()   // unmute sound effects
 *   mascot.disableAudio()
 *   mascot.recomputeSafeZones()  // call after DOM changes
 */

(function () {
  'use strict';

  // ------------------------------------------------------------------
  // DEFAULTS
  // ------------------------------------------------------------------
  var DEFAULTS = {
    container: '#mascot',
    videoBasePath: 'assets/mascot/',
    soundBasePath: 'assets/mascot/sounds/',
    states: {
      // state name → { asset file, flip horizontally?, loop?, auto-revert ms }
      'idle':           { asset: 'idle.webm',    flip: false, loop: true,  duration: null  },
      'walk-left':      { asset: 'walk.webm',    flip: false, loop: true,  duration: null  },
      'walk-right':     { asset: 'walk.webm',    flip: true,  loop: true,  duration: null  },
      'tap-glass':      { asset: 'tap.webm',     flip: false, loop: false, duration: 900   },
      'scratch-glass':  { asset: 'scratch.webm', flip: false, loop: false, duration: 1200  },
      'peek':           { asset: 'peek.webm',    flip: false, loop: false, duration: 1500, fallback: 'idle.webm' },
      'exit':           { asset: 'exit.webm',    flip: false, loop: true,  duration: null, fallback: 'walk.webm' }
    },
    sounds: {
      'tap':     'tap.mp3',
      'scratch': 'scratch.mp3'
    },
    // Any element matching these selectors is treated as a safe zone:
    // the mascot will not be moved on top of it.
    safeZoneSelectors: [
      '[data-mascot-safe]',
      '.hero-cine__h1', '.hero-cine__sub', '.hero-cine__cta',
      '.h1', 'h1',
      '.btn', '.btn-cta-primary',
      'header.nav', 'nav.nav-links',
      '.kicker'
    ],
    safeZonePadding: 24,
    walkSpeed: 220,                       // px per second when moving
    audioEnabled: false,                  // muted by default
    autoIdleBehaviors: true,              // self-driving behavior loop
    idleBehaviorInterval: [8000, 14000],  // [min, max] ms between auto behaviors
    mascotSize: { w: 220, h: 300 },       // CSS px
    startPosition: 'bottom-right',
    debugSafeZones: false                 // outline safe zones in magenta (dev only)
  };

  // ------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------
  function rectsOverlap(a, b) {
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
  }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function mergeConfig(user) {
    user = user || {};
    var cfg = Object.assign({}, DEFAULTS, user);
    cfg.states = Object.assign({}, DEFAULTS.states, user.states || {});
    cfg.sounds = Object.assign({}, DEFAULTS.sounds, user.sounds || {});
    cfg.mascotSize = Object.assign({}, DEFAULTS.mascotSize, user.mascotSize || {});
    return cfg;
  }

  // ------------------------------------------------------------------
  // MascotEngine
  // ------------------------------------------------------------------
  function MascotEngine(config) {
    this.config = config;
    this.container = typeof config.container === 'string'
      ? document.querySelector(config.container)
      : config.container;
    if (!this.container) {
      console.warn('[mascot] container not found:', config.container);
      return;
    }

    this.state = null;
    this.position = { x: 0, y: 0 };
    this.heading = 'right';
    this.safeZones = [];
    this.videos = {};               // state name → <video>
    this.currentVideo = null;
    this.audio = {};                // sound name → <audio>
    this.effectsLayer = null;
    this.stateTimer = null;
    this.idleTimer = null;
    this.moveRafId = null;
    this._missingAssets = 0;

    this._init();
  }

  MascotEngine.prototype._init = function () {
    var self = this;
    var cfg = this.config;

    this.container.classList.add('mascot-layer--initialized');
    this.container.style.setProperty('--mascot-w', cfg.mascotSize.w + 'px');
    this.container.style.setProperty('--mascot-h', cfg.mascotSize.h + 'px');

    // Build the inner structure
    var pool = document.createElement('div');
    pool.className = 'mascot-layer__video-pool';
    this.container.appendChild(pool);

    var fx = document.createElement('div');
    fx.className = 'mascot-layer__effects';
    this.container.appendChild(fx);
    this.effectsLayer = fx;

    // Video pool — dedupe identical assets so we don't load the same file twice.
    var pooled = {};
    Object.keys(cfg.states).forEach(function (stateName) {
      var def = cfg.states[stateName];
      var assetKey = def.asset + (def.flip ? ':flip' : '');
      if (pooled[assetKey]) {
        self.videos[stateName] = pooled[assetKey];
        return;
      }
      var v = document.createElement('video');
      v.className = 'mascot-layer__video';
      v.dataset.state = stateName;
      v.src = cfg.videoBasePath + def.asset;
      v.muted = true;
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.preload = 'auto';
      v.loop = !!def.loop;
      if (def.flip) v.classList.add('is-flipped');
      v.addEventListener('error', function () {
        self._missingAssets++;
        // Try fallback asset for this state, once.
        if (def.fallback && v.src.indexOf(def.fallback) === -1) {
          v.src = cfg.videoBasePath + def.fallback;
          return;
        }
        if (self._missingAssets >= Object.keys(self.videos).length / 2) {
          self.container.classList.add('mascot-layer--no-video');
        }
      });
      pool.appendChild(v);
      pooled[assetKey] = v;
      self.videos[stateName] = v;
    });

    // Audio pool (preload=none; muted until enableAudio())
    Object.keys(cfg.sounds).forEach(function (name) {
      var a = new Audio(cfg.soundBasePath + cfg.sounds[name]);
      a.preload = 'none';
      a.muted = true;
      self.audio[name] = a;
    });

    // Safe zones
    this._recomputeSafeZones();
    var schedule = (function () {
      var pending = false;
      return function () {
        if (pending) return;
        pending = true;
        requestAnimationFrame(function () {
          self._recomputeSafeZones();
          pending = false;
        });
      };
    })();
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('scroll', schedule, { passive: true });

    if (cfg.debugSafeZones) this._drawDebugSafeZones();

    // Initial placement + state
    this._setPosition(this._initialPosition());
    this.setState('idle');

    if (cfg.autoIdleBehaviors) this._scheduleNextBehavior();
  };

  MascotEngine.prototype._initialPosition = function () {
    var vw = window.innerWidth, vh = window.innerHeight;
    var m = this.config.mascotSize, pad = 24;
    switch (this.config.startPosition) {
      case 'top-left':     return { x: pad,              y: pad              };
      case 'top-right':    return { x: vw - m.w - pad,   y: pad              };
      case 'bottom-left':  return { x: pad,              y: vh - m.h - pad   };
      case 'bottom-right':
      default:             return { x: vw - m.w - pad,   y: vh - m.h - pad   };
    }
  };

  MascotEngine.prototype.setState = function (newState) {
    if (newState === this.state) return;
    var def = this.config.states[newState];
    if (!def) { console.warn('[mascot] unknown state:', newState); return; }

    if (this.currentVideo) {
      this.currentVideo.classList.remove('is-active');
      try { this.currentVideo.pause(); } catch (_) {}
    }
    var v = this.videos[newState];
    if (v) {
      v.classList.add('is-active');
      try {
        v.currentTime = 0;
        var p = v.play();
        if (p && p.catch) p.catch(function () {/* autoplay or missing-asset; silent */});
      } catch (_) {}
      this.currentVideo = v;
    }

    this.state = newState;
    this.container.dataset.mascotState = newState;
    this.container.dispatchEvent(new CustomEvent('mascot:statechange', { detail: { state: newState }}));

    clearTimeout(this.stateTimer);
    if (def.duration) {
      var self = this;
      this.stateTimer = setTimeout(function () {
        if (self.state === newState) self.setState('idle');
      }, def.duration);
    }
  };

  MascotEngine.prototype._setPosition = function (p) {
    this.position = p;
    this.container.style.setProperty('--mascot-x', p.x + 'px');
    this.container.style.setProperty('--mascot-y', p.y + 'px');
  };

  MascotEngine.prototype.moveTo = function (targetX, targetY, options) {
    options = options || {};
    var adjusted = this._nudgeOutOfSafeZones(targetX, targetY);
    var tx = adjusted.x, ty = adjusted.y;

    var dx = tx - this.position.x;
    var dy = ty - this.position.y;
    var distance = Math.sqrt(dx*dx + dy*dy);
    if (distance < 4) {
      this.setState('idle');
      if (options.onDone) options.onDone();
      return;
    }

    var speed = options.speed || this.config.walkSpeed;
    var duration = Math.max(300, (distance / speed) * 1000);

    this.heading = dx >= 0 ? 'right' : 'left';
    this.setState(dx >= 0 ? 'walk-right' : 'walk-left');

    var start = performance.now();
    var startPos = { x: this.position.x, y: this.position.y };
    var self = this;
    if (this.moveRafId) cancelAnimationFrame(this.moveRafId);

    function step(now) {
      var t = Math.min(1, (now - start) / duration);
      // ease-in-out cubic
      var e = t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
      self._setPosition({
        x: startPos.x + dx * e,
        y: startPos.y + dy * e
      });
      if (t < 1) {
        self.moveRafId = requestAnimationFrame(step);
      } else {
        self.moveRafId = null;
        self.setState('idle');
        if (options.onDone) options.onDone();
      }
    }
    self.moveRafId = requestAnimationFrame(step);
  };

  MascotEngine.prototype.moveToRandomSafePosition = function (options) {
    var vw = window.innerWidth, vh = window.innerHeight;
    var m = this.config.mascotSize, pad = 40;
    for (var i = 0; i < 40; i++) {
      var x = pad + Math.random() * (vw - m.w - pad*2);
      var y = pad + Math.random() * (vh - m.h - pad*2);
      if (this._isPositionSafe(x, y)) return this.moveTo(x, y, options);
    }
    // Fallback: bottom corner (unlikely to collide)
    return this.moveTo(vw - m.w - pad, vh - m.h - pad, options);
  };

  MascotEngine.prototype._isPositionSafe = function (x, y) {
    var m = this.config.mascotSize;
    var rect = { left: x, top: y, right: x + m.w, bottom: y + m.h };
    for (var i = 0; i < this.safeZones.length; i++) {
      if (rectsOverlap(rect, this.safeZones[i])) return false;
    }
    return true;
  };

  MascotEngine.prototype._nudgeOutOfSafeZones = function (x, y) {
    var m = this.config.mascotSize;
    var rect = { left: x, top: y, right: x + m.w, bottom: y + m.h };
    var collision = null;
    for (var i = 0; i < this.safeZones.length; i++) {
      if (rectsOverlap(rect, this.safeZones[i])) { collision = this.safeZones[i]; break; }
    }
    if (!collision) return { x: x, y: y };

    // Push to the nearest edge of the collision rect.
    var dxL = collision.left  - m.w - x;
    var dxR = collision.right - x;
    var dyT = collision.top   - m.h - y;
    var dyB = collision.bottom - y;
    var moves = [
      { x: x + dxL, y: y,        cost: Math.abs(dxL) },
      { x: x + dxR, y: y,        cost: Math.abs(dxR) },
      { x: x,       y: y + dyT,  cost: Math.abs(dyT) },
      { x: x,       y: y + dyB,  cost: Math.abs(dyB) }
    ].sort(function (a, b) { return a.cost - b.cost; });

    // Clamp to viewport
    var vw = window.innerWidth, vh = window.innerHeight;
    return {
      x: clamp(moves[0].x, 0, vw - m.w),
      y: clamp(moves[0].y, 0, vh - m.h)
    };
  };

  MascotEngine.prototype._recomputeSafeZones = function () {
    var pad = this.config.safeZonePadding;
    var els = [];
    this.config.safeZoneSelectors.forEach(function (sel) {
      try { Array.prototype.push.apply(els, document.querySelectorAll(sel)); } catch (_) {}
    });
    this.safeZones = els.map(function (el) {
      var r = el.getBoundingClientRect();
      return {
        left:   r.left   - pad,
        top:    r.top    - pad,
        right:  r.right  + pad,
        bottom: r.bottom + pad
      };
    });
    if (this.config.debugSafeZones) this._drawDebugSafeZones();
  };

  MascotEngine.prototype.recomputeSafeZones = function () {
    this._recomputeSafeZones();
  };

  MascotEngine.prototype._drawDebugSafeZones = function () {
    var existing = document.getElementById('mascot-debug-zones');
    if (existing) existing.remove();
    var root = document.createElement('div');
    root.id = 'mascot-debug-zones';
    root.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99999;';
    this.safeZones.forEach(function (z) {
      var d = document.createElement('div');
      d.style.cssText =
        'position:absolute;' +
        'left:'   + z.left + 'px;' +
        'top:'    + z.top  + 'px;' +
        'width:'  + (z.right - z.left) + 'px;' +
        'height:' + (z.bottom - z.top) + 'px;' +
        'border:1px dashed #ff00ff;background:rgba(255,0,255,.08);';
      root.appendChild(d);
    });
    document.body.appendChild(root);
  };

  // ----------------------------------------------------------------------
  // EFFECT SPAWNERS
  // ----------------------------------------------------------------------
  MascotEngine.prototype._mascotForwardPoint = function () {
    var m = this.config.mascotSize;
    return {
      x: this.position.x + m.w / 2,
      y: this.position.y + m.h * 0.55
    };
  };

  MascotEngine.prototype.spawnTapEffect = function (x, y) {
    var p = (x === undefined) ? this._mascotForwardPoint() : { x: x, y: y };
    var root = document.createElement('div');
    root.className = 'mascot-fx mascot-fx--tap';
    root.style.left = p.x + 'px';
    root.style.top  = p.y + 'px';
    root.innerHTML =
      '<span class="mascot-fx__ripple mascot-fx__ripple--1"></span>' +
      '<span class="mascot-fx__ripple mascot-fx__ripple--2"></span>' +
      '<span class="mascot-fx__smudge"></span>' +
      '<svg class="mascot-fx__crack" viewBox="-40 -40 80 80" aria-hidden="true">' +
      '  <path d="M -28 -10 L -8 -2 L -14 8 L -24 14 M -8 -2 L 8 6 L 18 14 L 24 8 M 8 6 L 6 -12 L 12 -22" stroke="rgba(255,255,255,.85)" stroke-width="1" fill="none" stroke-linecap="round"/>' +
      '</svg>';
    this.effectsLayer.appendChild(root);
    setTimeout(function () { root.remove(); }, 2400);
  };

  MascotEngine.prototype.spawnScratchEffect = function (x, y) {
    var p = (x === undefined) ? this._mascotForwardPoint() : { x: x, y: y };
    var root = document.createElement('div');
    root.className = 'mascot-fx mascot-fx--scratch';
    root.style.left = p.x + 'px';
    root.style.top  = p.y + 'px';

    var html = '';
    // 3–5 white scratch lines
    var lineCount = 4 + Math.floor(Math.random() * 2);
    for (var i = 0; i < lineCount; i++) {
      var angle = -10 + Math.random() * 20;
      var yOff  = -16 + i * 8;
      var delay = i * 70;
      html += '<span class="mascot-fx__scratch-line" style="--angle:' + angle + 'deg;--y:' + yOff + 'px;--delay:' + delay + 'ms"></span>';
    }
    // 6–10 dust particles
    var dustCount = 6 + Math.floor(Math.random() * 5);
    for (var j = 0; j < dustCount; j++) {
      var tx = -36 + Math.random() * 72;
      var ty = -40 + Math.random() * 30;
      var d = j * 35;
      html += '<span class="mascot-fx__dust" style="--tx:' + tx + 'px;--ty:' + ty + 'px;--d:' + d + 'ms"></span>';
    }
    root.innerHTML = html;
    this.effectsLayer.appendChild(root);
    setTimeout(function () { root.remove(); }, 2400);
  };

  // ----------------------------------------------------------------------
  // BEHAVIORS — composable actions
  // ----------------------------------------------------------------------
  MascotEngine.prototype.tap = function () {
    this.setState('tap-glass');
    this.spawnTapEffect();
    this.playSound('tap');
  };
  MascotEngine.prototype.scratch = function () {
    this.setState('scratch-glass');
    this.spawnScratchEffect();
    this.playSound('scratch');
  };
  MascotEngine.prototype.peek = function () { this.setState('peek'); };

  MascotEngine.prototype.exit = function () {
    var vw = window.innerWidth;
    var m = this.config.mascotSize;
    var self = this;
    this.setState('exit');
    this.moveTo(vw + m.w + 50, this.position.y, {
      speed: this.config.walkSpeed * 1.6,
      onDone: function () { self.container.style.opacity = '0'; }
    });
  };

  MascotEngine.prototype.enter = function () {
    var vw = window.innerWidth, vh = window.innerHeight;
    var m = this.config.mascotSize;
    this.container.style.opacity = '1';
    this._setPosition({ x: -m.w - 50, y: vh - m.h - 40 });
    this.moveToRandomSafePosition();
  };

  // ----------------------------------------------------------------------
  // AUDIO
  // ----------------------------------------------------------------------
  MascotEngine.prototype.playSound = function (name) {
    if (!this.config.audioEnabled) return;
    var a = this.audio[name];
    if (!a) return;
    a.muted = false;
    try { a.currentTime = 0; a.play().catch(function () {}); } catch (_) {}
  };
  MascotEngine.prototype.enableAudio  = function () { this.config.audioEnabled = true; };
  MascotEngine.prototype.disableAudio = function () { this.config.audioEnabled = false; };

  // ----------------------------------------------------------------------
  // AUTO-DRIVE LOOP — random idle behaviors so the mascot feels alive.
  // Disable by setting config.autoIdleBehaviors = false.
  // ----------------------------------------------------------------------
  MascotEngine.prototype._scheduleNextBehavior = function () {
    clearTimeout(this.idleTimer);
    var range = this.config.idleBehaviorInterval;
    var delay = range[0] + Math.random() * (range[1] - range[0]);
    var self = this;
    this.idleTimer = setTimeout(function () { self._performRandomBehavior(); }, delay);
  };

  MascotEngine.prototype._performRandomBehavior = function () {
    if (document.hidden) { this._scheduleNextBehavior(); return; }
    var r = Math.random();
    if      (r < 0.45) this.moveToRandomSafePosition();
    else if (r < 0.70) this.tap();
    else if (r < 0.85) this.scratch();
    else               this.peek();
    this._scheduleNextBehavior();
  };

  // ----------------------------------------------------------------------
  // BOOTSTRAP
  // ----------------------------------------------------------------------
  function boot() {
    var cfg = mergeConfig(window.MASCOT_CONFIG);
    var container = typeof cfg.container === 'string'
      ? document.querySelector(cfg.container)
      : cfg.container;
    if (!container) { console.warn('[mascot] container not found:', cfg.container); return; }
    window.mascot = new MascotEngine(cfg);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
