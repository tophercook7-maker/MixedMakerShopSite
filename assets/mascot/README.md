# Mascot Engine

Staging + animation framework for a transparent-video site-wide mascot.
**This directory ships the engine code only.** Drop your character assets in here and they will be picked up automatically.

---

## Expected files

| State          | Default path                          | Notes |
| -------------- | ------------------------------------- | ----- |
| idle           | `assets/mascot/idle.webm`             | Looping. Required. |
| walk-left      | `assets/mascot/walk.webm`             | Looping. Faces left by default. |
| walk-right     | `assets/mascot/walk.webm` *(mirrored)*| Reuses `walk.webm`, flipped via CSS. |
| tap-glass      | `assets/mascot/tap.webm`              | One-shot. Auto-reverts to `idle` after 900ms. |
| scratch-glass  | `assets/mascot/scratch.webm`          | One-shot. Auto-reverts to `idle` after 1200ms. |
| peek           | `assets/mascot/peek.webm`             | Optional. Falls back to `idle.webm`. |
| exit           | `assets/mascot/exit.webm`             | Optional. Falls back to `walk.webm`. |
| tap sound      | `assets/mascot/sounds/tap.mp3`        | Muted by default. |
| scratch sound  | `assets/mascot/sounds/scratch.mp3`    | Muted by default. |

### Asset specs (recommended)

- **Format:** transparent WebM (VP9 + alpha channel) for best browser support, or HEVC with alpha for Safari-only.
- **Aspect ratio:** ~2:3 portrait works best with the default `mascotSize: { w: 220, h: 300 }`.
- **Resolution:** target 2× the rendered size (e.g., 440×600) for crisp display on retina.
- **Background:** fully transparent.
- **Looping animations** (idle, walk): seamless loop, ~1–2s.
- **One-shot animations** (tap, scratch, peek): clear start and end frame; engine will revert to `idle` automatically.

### Alternative asset types

The engine creates `<video>` elements by default. If you want a different asset type:

- **Lottie:** swap the `<video>` element for `<dotlottie-player>` and load the player script. Change `_init()` in `mascot.js` to instantiate the right tag per state.
- **Spline:** wrap the container with an `<iframe>` instead, sized to `--mascot-w` / `--mascot-h`.
- **Three.js / glTF:** replace the video element with a `<canvas>` and bind a renderer; keep the state machine and just listen for `mascot:statechange` events.

---

## Configuration

Set `window.MASCOT_CONFIG` **before** including `mascot.js`:

```html
<script>
  window.MASCOT_CONFIG = {
    container: '#mascot',
    videoBasePath: 'assets/mascot/',
    soundBasePath: 'assets/mascot/sounds/',
    mascotSize: { w: 220, h: 300 },
    walkSpeed: 220,                       // px / second
    audioEnabled: false,                  // unmute via mascot.enableAudio()
    autoIdleBehaviors: true,              // self-driving loop
    idleBehaviorInterval: [8000, 14000],  // ms between random behaviors
    startPosition: 'bottom-right',        // bottom-right | bottom-left | top-right | top-left
    safeZoneSelectors: [
      '[data-mascot-safe]', 'h1', '.btn',
      'header.nav', '.kicker', '.hero-cine__h1', '.hero-cine__cta'
    ],
    safeZonePadding: 24,                  // px
    debugSafeZones: false                 // outline safe zones in magenta
  };
</script>
<script src="assets/mascot/mascot.js" defer></script>
```

## Marking safe zones in markup

Any element with `data-mascot-safe` is treated as a safe zone:

```html
<form data-mascot-safe>…</form>
<aside class="contact-card" data-mascot-safe>…</aside>
```

The engine recomputes safe zones on `resize` and `scroll`. Call `mascot.recomputeSafeZones()` after dynamic DOM changes.

## Public API

```js
mascot.setState('tap-glass');             // direct state push
mascot.moveTo(800, 400);                  // viewport coords
mascot.moveToRandomSafePosition();
mascot.tap();                             // state + tap effects
mascot.scratch();                         // state + scratch effects
mascot.peek();
mascot.exit();                            // walks off-screen and hides
mascot.enter();                           // re-enters from left
mascot.enableAudio() / disableAudio();
mascot.recomputeSafeZones();

mascot.spawnTapEffect(x, y);              // effects on demand at any point
mascot.spawnScratchEffect(x, y);
```

Subscribe to state changes:

```js
document.getElementById('mascot').addEventListener('mascot:statechange', (e) => {
  console.log('state →', e.detail.state);
});
```

## When assets are missing

If more than half the videos fail to load, the engine adds a `mascot-layer--no-video` class to the container. CSS then renders a dashed-outline ghost box with the label `MASCOT — drop transparent WebM into /assets/mascot/`. The state machine, positioning, safe-zone avoidance, and effects (ripples, scratches, dust) all still run — only the character is invisible.

## Performance notes

- Videos preload eagerly so state changes are seamless. If you have many states with large files, set `preload="metadata"` in `_init()` instead.
- The auto-drive loop pauses when `document.hidden` is true.
- Effect DOM nodes auto-remove after their animation completes.
- All animations respect `prefers-reduced-motion: reduce`.
