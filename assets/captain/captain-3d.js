/*!
 * Captain Maker — Three.js scene with FBX animation retargeting.
 *
 *   Character:   assets/models/captain-maker.glb     (you provide)
 *   Animation:   assets/animations/sitting-clap.fbx  (Mixamo FBX)
 *
 * The engine:
 *   1. Lazy-loads Three.js + GLTFLoader + FBXLoader + DRACOLoader
 *      only when the .captain-desk section enters the viewport.
 *   2. Loads both the character and the animation in parallel.
 *   3. Builds a 3D desk / monitor / chair / floor from primitive
 *      geometries (no extra assets).
 *   4. Extracts the AnimationClip from the FBX, applies it to the
 *      GLB skeleton via AnimationMixer.
 *   5. Adds office lighting (key + fill + monitor as emissive area light)
 *      and a soft shadow plane.
 *
 * Public API (window.captain):
 *   greet()           — replay the active animation from the top
 *   play(name)        — play a clip by name (case-insensitive substring)
 *   setRotation(rad)  — rotate the captain on Y
 *   listClips()       — debug: list available animations
 */

/* ========================================================================
   CHARACTER SOURCE — single point of configuration.

   Today: the FBX (sitting-clap from Mixamo) ships with the Y-Bot mesh +
   correct skinning + animation, so we use it as both model AND animation.

   When a properly-rigged Captain Maker GLB exists (skinning intact, i.e.
   JOINTS_0 + WEIGHTS_0 vertex attributes and a populated `skins` array),
   swap this config to:
     { type: 'glb', url: 'assets/models/captain-maker-rigged.glb',
       externalAnimations: ['assets/animations/sitting-clap.fbx'] }

   The loader will then take the GLB as the character and layer the
   FBX-sourced clip(s) on top via the AnimationMixer.
   ====================================================================== */
const CHARACTER_SOURCE = {
  type: 'fbx',                                          // 'fbx' | 'glb'
  url:  'assets/animations/sitting-clap.fbx',
  // Additional clip files (FBX/GLB). Their animation tracks are layered onto
  // the existing skeleton — the engine picks the right clip per state from
  // STATES[*].clipMatch regex below.
  // When you drop a Sitting Typing FBX in, uncomment the line.
  externalAnimations: [
    // 'assets/animations/sitting-typing.fbx',
  ]
};

const SECTION_SEL       = '.captain-desk';
const CANVAS_SEL        = '#captain-canvas';

const CAMERA_FOV        = 30;
const CAMERA_POS        = [1.8, 1.7, 4.4];
const CAMERA_LOOK_AT    = [0.0, 1.05, 0.0];

/* Per-character positioning. The Y-Bot from Mixamo is ~1m tall in FBX cm
   units (visually small), and the sitting-clap pivot is at the model's
   feet/hips. The values below align his rear with the chair seat.
   Yaw is in radians: π = facing the desk (-Z), 0 = facing the camera (+Z). */
const POSE_TUNING = {
  fbx: { targetHeight: 1.85, seatYOffset: -0.05, sit: true,  yawRad: Math.PI - 0.15 },
  glb: { targetHeight: 1.85, seatYOffset: -0.05, sit: false, yawRad: Math.PI - 0.15 }
};

/* ========================================================================
   STATE MACHINE — `working` (facing the desk, typing/clapping motion) and
   `waving` (turned toward the viewer, wave animation).

   Each state declares its base yaw + a regex describing the preferred clip
   from the loaded animation library. The current FBX only contains
   "mixamo.com" (the Sitting Clap clip) so both states fall back to it.

   When you add real Mixamo "Sitting Typing" / "Sitting Waving" downloads,
   put them in CHARACTER_SOURCE.externalAnimations and the matchers below
   will pick them up automatically (clip names contain the keywords).
   ====================================================================== */
const STATES = {
  working: { yawRad: Math.PI - 0.15, clipMatch: /typ|sitting.?typ|clap/i,  loop: true },
  waving:  { yawRad: -0.15,           clipMatch: /wave|greet|hello|clap/i, loop: true }
};

/* Auto-cycle: every N ms while the section is visible, do a greet sequence
   (turn → wave → turn back to work). Set to null/false to disable — when
   disabled, he stays facing the desk and only turns when CLICKED.
   Re-enable from the console with `captain.startAutoGreet([12000, 18000])`. */
const AUTO_GREET_INTERVAL_MS = null;            // disabled by default
const WAVE_HOLD_MS           = 3500;            // how long the wave plays

/* How quickly the body rotates between states (per render frame, ~60 fps).
   0.05 ≈ ~1 second to complete a 180° turn. Smaller = slower / more deliberate. */
const YAW_EASE               = 0.05;

let booted = false;

// ------------------------------------------------------------------------
// LAZY BOOT
// ------------------------------------------------------------------------
function lazyBoot() {
  const section = document.querySelector(SECTION_SEL);
  if (!section) return;

  if (!hasWebGL()) {
    section.classList.add('captain-desk--no-webgl');
    return;
  }

  const start = () => {
    if (booted) return;
    booted = true;
    boot(section).catch(err => {
      console.warn('[captain] boot failed:', err);
      section.classList.add('captain-desk--no-model');
    });
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { io.disconnect(); start(); }
    }, { rootMargin: '300px' });
    io.observe(section);
  } else {
    start();
  }
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl'));
  } catch (_) { return false; }
}

/* Wrap angle delta into [-π, π] so rotation tweens take the shorter path
   around the circle (avoids spinning 270° when 90° would do). */
function wrapAngle(d) {
  const TAU = Math.PI * 2;
  while (d >  Math.PI) d -= TAU;
  while (d < -Math.PI) d += TAU;
  return d;
}

// ------------------------------------------------------------------------
// BOOT
// ------------------------------------------------------------------------
async function boot(section) {
  const canvas = section.querySelector(CANVAS_SEL);
  if (!canvas) throw new Error('canvas not found');

  // Dynamic imports
  const THREE = await import('three');
  const [
    { GLTFLoader },
    { FBXLoader },
    { DRACOLoader }
  ] = await Promise.all([
    import('three/addons/loaders/GLTFLoader.js'),
    import('three/addons/loaders/FBXLoader.js'),
    import('three/addons/loaders/DRACOLoader.js')
  ]);

  // ---- Renderer ----
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  // ---- Scene & camera ----
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 60);
  camera.position.set(...CAMERA_POS);
  camera.lookAt(...CAMERA_LOOK_AT);

  // ---- Office lighting ----
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));

  const key = new THREE.DirectionalLight(0xfff1c2, 1.1);
  key.position.set(-3, 4.5, 3.5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left   = -3;
  key.shadow.camera.right  = 3;
  key.shadow.camera.top    = 3;
  key.shadow.camera.bottom = -1;
  key.shadow.camera.near   = 0.5;
  key.shadow.camera.far    = 12;
  key.shadow.bias = -0.0008;
  key.shadow.normalBias = 0.02;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x88aacc, 0.4);
  fill.position.set(3, 3, 2);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xf0a51a, 0.55);
  rim.position.set(2, 2.2, -2);
  scene.add(rim);

  // ---- 3D office: floor, desk, monitor, chair ----
  buildOffice(scene, THREE);

  // ---- State machine variables (declared up-front so functions defined
  //      later can safely read/write them after the model loads) ----
  let currentStateName = 'working';
  let stateBaseYaw     = STATES.working.yawRad;
  let greetTimeoutId   = null;
  let autoGreetTimerId = null;
  let autoGreetRange   = AUTO_GREET_INTERVAL_MS;       // mutable; toggled via API
  let cursorOffset     = 0;
  let cursorActive     = false;
  let visible          = true;
  let sitSnapped       = false;
  // Where the model's HIPS bone snaps to in world space.
  // Seat top is at y = 0.55 (new lower chair). Hips sit above that with
  // ~10 cm of pelvis above the seat surface → 0.65.
  const SEAT_Y_TARGET  = 0.65;
  // Where the model centers in Z (away from desk = +Z). Chair seat is at
  // z = 0.55; character anchored there too.
  const SEAT_Z_TARGET  = 0.55;

  // ---- Loaders ----
  const draco = new DRACOLoader();
  draco.setDecoderPath('https://unpkg.com/three@0.160.0/examples/jsm/libs/draco/');
  draco.setDecoderConfig({ type: 'js' });

  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(draco);
  const fbxLoader = new FBXLoader();

  // ---- State ----
  let model = null;
  let mixer = null;
  let activeAction = null;
  let availableClips = [];

  // Load the character (FBX or GLB depending on CHARACTER_SOURCE.type) plus
  // any external animation files configured.
  const charPromise = loadCharacter(CHARACTER_SOURCE);
  const externalAnimPromises = (CHARACTER_SOURCE.externalAnimations || [])
    .map(loadExternalAnimation);

  const [charResult, ...externalResults] = await Promise.allSettled([
    charPromise,
    ...externalAnimPromises
  ]);

  if (charResult.status === 'rejected') {
    console.warn('[captain] character load failed:', charResult.reason);
    section.classList.add('captain-desk--no-model');
  } else {
    placeCaptain(charResult.value);
  }

  // Merge in any external animation clips
  externalResults.forEach((r) => {
    if (r.status === 'fulfilled' && r.value && r.value.length) {
      availableClips = availableClips.concat(r.value);
    }
  });

  // Kick the state machine off in `working` (typing facing the desk).
  if (model) setState('working');
  scheduleAutoGreet();

  // -------------- loaders --------------
  async function loadCharacter(src) {
    if (src.type === 'fbx') {
      const obj = await loadFBX(fbxLoader, src.url);
      return { object: obj, animations: obj.animations || [], kind: 'fbx' };
    }
    if (src.type === 'glb') {
      const gltf = await loadGLB(gltfLoader, src.url);
      return { object: gltf.scene, animations: gltf.animations || [], kind: 'glb' };
    }
    throw new Error('[captain] unknown CHARACTER_SOURCE.type: ' + src.type);
  }
  async function loadExternalAnimation(url) {
    // Determine by extension which loader to use; only the animations are kept.
    const isFBX = /\.fbx($|\?)/i.test(url);
    const loaded = isFBX
      ? await loadFBX(fbxLoader, url)
      : await loadGLB(gltfLoader, url);
    return (loaded.animations || []).map(c => c.clone());
  }
  function loadGLB(loader, url) {
    return new Promise((res, rej) => loader.load(url, res, undefined, rej));
  }
  function loadFBX(loader, url) {
    return new Promise((res, rej) => loader.load(url, res, undefined, rej));
  }

  function placeCaptain(loaded) {
    model = loaded.object;
    const tune = POSE_TUNING[loaded.kind] || POSE_TUNING.fbx;

    // Auto-fit: scale so the rest-pose model is `targetHeight` tall, then
    // plant feet (or rest pose floor contact) on y=0.
    const box  = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = tune.targetHeight / Math.max(size.y, 0.001);
    model.scale.setScalar(scale);
    model.position.x -= center.x * scale;
    model.position.y -= box.min.y * scale;
    model.position.z -= center.z * scale;

    // Tuning — push back to the chair's Z plane and apply per-character offsets
    model.position.z += SEAT_Z_TARGET;
    model.position.y += tune.seatYOffset;
    model.rotation.y  = tune.yawRad;

    // If the rest-pose root is at the feet and the animation is a SITTING one,
    // the character will appear to "float up" when the clip starts because
    // the bones move the hips above ground. To keep him seated on the chair
    // the simplest fix is to anchor the root just above the chair seat once
    // we observe where the animation places the hips. We do this on first
    // mixer update (see the render loop).

    model.traverse(o => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        if (o.material && 'envMapIntensity' in o.material) o.material.envMapIntensity = 0.7;
      }
      if (o.isSkinnedMesh) {
        o.frustumCulled = false; // avoid disappearing when skeleton extends past mesh bbox
      }
    });

    scene.add(model);
    mixer = new THREE.AnimationMixer(model);

    // Stash the clip list (cloned so re-play works cleanly).
    // NOTE: we deliberately do NOT strip Hips tracks here — Mixamo encodes
    //       the seated pose in the Hips position offset; removing it would
    //       leave the figure in T-pose. The engine controls world yaw on
    //       the outer model node, which the animation doesn't target.
    availableClips = (loaded.animations || []).map(c => c.clone());

    section.classList.add('captain-desk--ready');
    canvas.classList.add('is-ready');
  }

  function playAnimation(clip) {
    if (!mixer || !clip) return null;
    if (activeAction) activeAction.fadeOut(0.25);
    const a = mixer.clipAction(clip);
    a.reset();
    a.setLoop(THREE.LoopRepeat);
    a.fadeIn(0.25).play();
    activeAction = a;
    return a;
  }

  function findClip(query) {
    if (!query) return availableClips[0];
    if (query instanceof RegExp) {
      return availableClips.find(c => query.test(c.name || '')) || availableClips[0];
    }
    const q = String(query).toLowerCase();
    return availableClips.find(c => (c.name || '').toLowerCase().includes(q));
  }

  // ----- STATE MACHINE (variables hoisted earlier in the function) -----
  function setState(stateName) {
    const s = STATES[stateName];
    if (!s) return;
    currentStateName = stateName;
    stateBaseYaw = s.yawRad;
    const clip = findClip(s.clipMatch);
    if (clip) playAnimation(clip);
  }

  function greetSequence() {
    // working → waving (held) → working
    clearTimeout(greetTimeoutId);
    setState('waving');
    greetTimeoutId = setTimeout(() => setState('working'), WAVE_HOLD_MS);
    if (hint) hint.classList.add('is-hidden');
  }

  function scheduleAutoGreet() {
    clearTimeout(autoGreetTimerId);
    if (!autoGreetRange || !autoGreetRange[1]) return;     // disabled
    const [lo, hi] = autoGreetRange;
    const delay = lo + Math.random() * (hi - lo);
    autoGreetTimerId = setTimeout(() => {
      if (visible && currentStateName === 'working') greetSequence();
      scheduleAutoGreet();
    }, delay);
  }

  // ---- Resize ----
  function resize() {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(2, r.width);
    const h = Math.max(2, r.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(canvas);
  window.addEventListener('resize', resize, { passive: true });

  // ---- Interaction: cursor offset + click triggers greet sequence ----
  canvas.style.cursor = 'pointer';

  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) - 0.5;
    cursorOffset = nx * 0.25;             // small bias on top of state's base yaw
    cursorActive = true;
  }, { passive: true });
  canvas.addEventListener('pointerleave', () => { cursorActive = false; });
  canvas.addEventListener('click', () => greetSequence());

  // Hint chip
  const hint = section.querySelector('.captain-desk__hint');
  if (hint) {
    canvas.addEventListener('click', () => hint.classList.add('is-hidden'), { once: true });
    canvas.addEventListener('pointerenter', () => hint.classList.add('is-hidden'), { once: true });
  }

  // Public API
  window.captain = {
    greet:          () => greetSequence(),
    setState:       (name) => setState(name),
    play:           (name) => { const c = findClip(name); if (c) playAnimation(c); },
    setBaseYaw:     (y) => { stateBaseYaw = y; },
    setPosition:    (x, y, z) => { if (model) { model.position.set(x, y, z); } },
    listClips:      () => availableClips.map(c => c.name || '<unnamed>'),
    listStates:     () => Object.keys(STATES),
    raw:            () => ({ model, mixer, scene, camera, renderer }),
    // Auto-greet controls — disabled by default; turn on with these.
    startAutoGreet: (range) => {
      if (Array.isArray(range)) autoGreetRange = range;
      scheduleAutoGreet();
    },
    stopAutoGreet:  () => { clearTimeout(autoGreetTimerId); autoGreetRange = null; }
  };

  // ---- Render loop (pause when offscreen).
  //      (sitSnapped, SEAT_Y_TARGET, and `visible` are hoisted up top.) ----
  const clock = new THREE.Clock();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(section);
  }

  function tick() {
    requestAnimationFrame(tick);
    if (!visible) return;
    const dt = clock.getDelta();
    if (mixer) mixer.update(dt);
    if (model) {
      // Target yaw = current state's base yaw + small cursor-tracking bias
      const offset = cursorActive ? cursorOffset : 0;
      const targetYaw = stateBaseYaw + offset;
      // Smooth shortest-angle interpolation so 180° turns rotate the short way
      const delta = wrapAngle(targetYaw - model.rotation.y);
      model.rotation.y += delta * YAW_EASE;

      // After the first animation frame, snap the model so the hips land on
      // the chair seat. Skipped if POSE_TUNING.sit is false.
      const tune = POSE_TUNING[CHARACTER_SOURCE.type] || POSE_TUNING.fbx;
      if (tune.sit && !sitSnapped && mixer && clock.elapsedTime > 0.1) {
        const hips = model.getObjectByName('mixamorigHips')
                  || model.getObjectByName('mixamorig:Hips')
                  || model.getObjectByName('Hips');
        if (hips) {
          const worldPos = new THREE.Vector3();
          hips.getWorldPosition(worldPos);
          const dy = SEAT_Y_TARGET - worldPos.y;
          model.position.y += dy;
          sitSnapped = true;
        }
      }
    }
    renderer.render(scene, camera);
  }
  tick();
}

// ------------------------------------------------------------------------
// 3D OFFICE — built from primitives, no extra assets.
// Coords: +Y up, character at origin facing -Z.
// ------------------------------------------------------------------------
function buildOffice(scene, THREE) {
  // ---- Floor ----
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 8),
    new THREE.MeshStandardMaterial({
      color: 0x141210,
      roughness: 0.9,
      metalness: 0.0
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.receiveShadow = true;
  scene.add(floor);

  // Wood-grain warm rug under the desk to ground the scene
  const rug = new THREE.Mesh(
    new THREE.CircleGeometry(2.2, 48),
    new THREE.MeshStandardMaterial({
      color: 0x3a2614,
      roughness: 0.95,
      metalness: 0.0
    })
  );
  rug.rotation.x = -Math.PI / 2;
  rug.position.y = 0.001;
  rug.receiveShadow = true;
  scene.add(rug);

  // ---- DESK ----
  const deskGroup = new THREE.Group();
  // Top
  const deskTop = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.06, 1.0),
    new THREE.MeshStandardMaterial({
      color: 0x4a3220,
      roughness: 0.55,
      metalness: 0.15
    })
  );
  deskTop.position.set(0, 0.92, -0.4);
  deskTop.castShadow = true;
  deskTop.receiveShadow = true;
  deskGroup.add(deskTop);
  // Edge highlight (top trim)
  const deskTrim = new THREE.Mesh(
    new THREE.BoxGeometry(2.42, 0.008, 1.02),
    new THREE.MeshStandardMaterial({ color: 0xc88c4a, roughness: 0.4, metalness: 0.3 })
  );
  deskTrim.position.set(0, 0.955, -0.4);
  deskGroup.add(deskTrim);
  // Legs (4)
  const legMat = new THREE.MeshStandardMaterial({ color: 0x1a1410, roughness: 0.7, metalness: 0.3 });
  [[-1.15, -0.85], [1.15, -0.85], [-1.15, 0.05], [1.15, 0.05]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.92, 0.06), legMat);
    leg.position.set(x, 0.46, z);
    leg.castShadow = true;
    deskGroup.add(leg);
  });
  scene.add(deskGroup);

  // ---- MONITOR ----
  const monGroup = new THREE.Group();
  // Bezel
  const bezel = new THREE.Mesh(
    new THREE.BoxGeometry(1.05, 0.62, 0.04),
    new THREE.MeshStandardMaterial({ color: 0x0a0d10, roughness: 0.4, metalness: 0.4 })
  );
  bezel.position.set(0, 1.55, -0.7);
  bezel.castShadow = true;
  monGroup.add(bezel);
  // Screen (emissive — acts as a soft light source onto the captain)
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.97, 0.56),
    new THREE.MeshStandardMaterial({
      color: 0x0a1418,
      emissive: 0x6acfff,
      emissiveIntensity: 0.55,
      roughness: 0.3,
      metalness: 0.0
    })
  );
  screen.position.set(0, 1.55, -0.679);
  monGroup.add(screen);
  // Code-line overlay on the screen — bars of warm + cool
  const codeMat = (color) => new THREE.MeshStandardMaterial({
    color: 0x000,
    emissive: color,
    emissiveIntensity: 0.9,
    transparent: true,
    opacity: 0.85
  });
  const codeColors = [0xf0a51a, 0x6acfff, 0x9affc8, 0xf0a51a, 0xff8aa5];
  const codeWidths = [0.62, 0.40, 0.78, 0.32, 0.55];
  codeColors.forEach((c, i) => {
    const bar = new THREE.Mesh(
      new THREE.PlaneGeometry(codeWidths[i], 0.02),
      codeMat(c)
    );
    bar.position.set(-0.20 + (codeWidths[i] / 2 - 0.41), 1.70 - i * 0.06, -0.677);
    monGroup.add(bar);
  });
  // Stand
  const standCol = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.045, 0.32, 12),
    new THREE.MeshStandardMaterial({ color: 0x1a1d20, roughness: 0.4, metalness: 0.5 })
  );
  standCol.position.set(0, 1.10, -0.7);
  standCol.castShadow = true;
  monGroup.add(standCol);
  const standFoot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.20, 0.02, 24),
    new THREE.MeshStandardMaterial({ color: 0x1a1d20, roughness: 0.4, metalness: 0.5 })
  );
  standFoot.position.set(0, 0.96, -0.7);
  standFoot.castShadow = true;
  monGroup.add(standFoot);
  scene.add(monGroup);

  // ---- Monitor glow (point light on the captain) ----
  const screenLight = new THREE.PointLight(0x6acfff, 0.85, 4, 2);
  screenLight.position.set(0, 1.55, -0.5);
  scene.add(screenLight);

  // ---- KEYBOARD + MOUSE ----
  const keyboard = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.025, 0.22),
    new THREE.MeshStandardMaterial({ color: 0x1a1d20, roughness: 0.5, metalness: 0.4 })
  );
  keyboard.position.set(0, 0.965, -0.18);
  keyboard.castShadow = true;
  keyboard.receiveShadow = true;
  scene.add(keyboard);
  const mouse = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 12, 8),
    new THREE.MeshStandardMaterial({ color: 0x1a1d20, roughness: 0.5, metalness: 0.4 })
  );
  mouse.scale.set(1.2, 0.5, 1.6);
  mouse.position.set(0.5, 0.965, -0.18);
  mouse.castShadow = true;
  scene.add(mouse);

  // ---- A coffee mug for character ----
  const mugBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.05, 0.10, 18),
    new THREE.MeshStandardMaterial({ color: 0xc88c4a, roughness: 0.6, metalness: 0.1 })
  );
  mugBody.position.set(-0.85, 1.005, -0.3);
  mugBody.castShadow = true;
  mugBody.receiveShadow = true;
  scene.add(mugBody);
  const mugHandle = new THREE.Mesh(
    new THREE.TorusGeometry(0.035, 0.010, 8, 16, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0xc88c4a, roughness: 0.6, metalness: 0.1 })
  );
  mugHandle.rotation.z = Math.PI / 2;
  mugHandle.position.set(-0.79, 1.005, -0.3);
  scene.add(mugHandle);

  // ---- OFFICE CHAIR ----
  //
  // Anchored at the chair-base center in world space:
  //   chair seat center  (x, z) = (0, 0.55)
  //   seat top y                = 0.92
  //   floor y                    = 0
  //
  // Construction order (bottom → top): wheels → arms → post → seat cushion →
  //   lumbar cushion → backrest → headrest → armrests.
  const chairGroup = new THREE.Group();
  chairGroup.position.set(0, 0, 0.55);

  // Material palette
  const upholsteryMat = new THREE.MeshStandardMaterial({
    color: 0x14181c, roughness: 0.85, metalness: 0.0
  });
  const lumbarMat = new THREE.MeshStandardMaterial({
    color: 0x1c2227, roughness: 0.78, metalness: 0.0
  });
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x2c3036, roughness: 0.35, metalness: 0.75
  });
  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x14171a, roughness: 0.3, metalness: 0.85
  });
  const wheelTreadMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a0a, roughness: 0.55, metalness: 0.2
  });

  // ---- 5-star wheelbase ----
  // Each spoke is a long box pivoted at the center and rotated outward.
  // The wheel sits at the end of the spoke; a fork holds it.
  const WHEEL_RADIUS = 0.045;
  const SPOKE_LEN    = 0.42;
  const SPOKE_HEIGHT = 0.06;   // y of spoke top surface
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2;
    const cx  = Math.cos(ang);
    const cz  = Math.sin(ang);

    // Spoke — a tapered box that widens toward the wheel for visual weight.
    const spoke = new THREE.Mesh(
      new THREE.BoxGeometry(SPOKE_LEN, 0.045, 0.07),
      metalMat
    );
    // Box default axis = X. Position center along the radial direction at half-length.
    spoke.position.set(cx * (SPOKE_LEN / 2), SPOKE_HEIGHT, cz * (SPOKE_LEN / 2));
    spoke.rotation.y = -ang;       // align X-axis of box with radial direction
    spoke.castShadow = true;
    spoke.receiveShadow = true;
    chairGroup.add(spoke);

    // Fork housing — small block that holds the wheel
    const fork = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.045, 0.05),
      darkMetalMat
    );
    fork.position.set(cx * SPOKE_LEN, WHEEL_RADIUS + 0.005, cz * SPOKE_LEN);
    fork.rotation.y = -ang;
    fork.castShadow = true;
    chairGroup.add(fork);

    // Wheel — cylinder oriented so the axis is perpendicular to the radial
    // direction (i.e. the wheel "rolls forward" if pushed outward).
    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(WHEEL_RADIUS, WHEEL_RADIUS, 0.04, 18),
      wheelTreadMat
    );
    // Default cylinder axis = Y; rotate so axis is horizontal & perpendicular
    // to the spoke direction. After rotation by Z by π/2 the axis points along X.
    wheel.rotation.z = Math.PI / 2;
    // Then rotate around Y by `-ang` so the axis aligns with the tangent of
    // the radial direction (so the wheel rolls outward).
    wheel.rotation.y = -ang + Math.PI / 2;
    wheel.position.set(cx * SPOKE_LEN, WHEEL_RADIUS, cz * SPOKE_LEN);
    wheel.castShadow = true;
    chairGroup.add(wheel);
  }

  // ---- Hub at center of wheelbase ----
  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.10, 0.10, 24),
    metalMat
  );
  hub.position.set(0, 0.05, 0);
  hub.castShadow = true;
  chairGroup.add(hub);

  // ---- Hydraulic post (two-piece: lower cylinder + upper bellows) ----
  // Seat top target: y = 0.55. Wheelbase to seat ≈ 0.50m total (realistic
  // ergonomic chair height: seat 40-50cm above the floor).
  const postLower = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.055, 0.20, 18),
    darkMetalMat
  );
  postLower.position.set(0, 0.20, 0);
  postLower.castShadow = true;
  chairGroup.add(postLower);
  // Bellows ridges — three thin discs for a hydraulic gas-lift look
  for (let k = 0; k < 3; k++) {
    const ridge = new THREE.Mesh(
      new THREE.TorusGeometry(0.048, 0.008, 8, 24),
      metalMat
    );
    ridge.rotation.x = Math.PI / 2;
    ridge.position.set(0, 0.30 + k * 0.025, 0);
    chairGroup.add(ridge);
  }
  // Upper post
  const postUpper = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.045, 0.10, 16),
    metalMat
  );
  postUpper.position.set(0, 0.43, 0);
  postUpper.castShadow = true;
  chairGroup.add(postUpper);

  // ---- Tilt mechanism (plate under seat) ----
  const tilt = new THREE.Mesh(
    new THREE.BoxGeometry(0.30, 0.04, 0.30),
    darkMetalMat
  );
  tilt.position.set(0, 0.49, 0);
  tilt.castShadow = true;
  chairGroup.add(tilt);

  // ---- Seat cushion ----
  const seatCushion = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 0.08, 0.58),
    upholsteryMat
  );
  seatCushion.position.set(0, 0.53, 0);
  seatCushion.castShadow = true;
  seatCushion.receiveShadow = true;
  chairGroup.add(seatCushion);

  // Seat cushion contour cap
  const seatCap = new THREE.Mesh(
    new THREE.BoxGeometry(0.60, 0.025, 0.56),
    lumbarMat
  );
  seatCap.position.set(0, 0.575, 0);
  chairGroup.add(seatCap);

  // ---- Lumbar (lower back) cushion ----
  const lumbar = new THREE.Mesh(
    new THREE.BoxGeometry(0.50, 0.22, 0.08),
    upholsteryMat
  );
  lumbar.position.set(0, 0.78, 0.27);
  lumbar.castShadow = true;
  chairGroup.add(lumbar);

  // ---- Backrest (mid-back support) ----
  const back = new THREE.Mesh(
    new THREE.BoxGeometry(0.54, 0.42, 0.07),
    upholsteryMat
  );
  // Slight recline — tilt backward 6°
  back.position.set(0, 1.05, 0.30);
  back.rotation.x = -0.10;
  back.castShadow = true;
  chairGroup.add(back);
  // Backrest center stripe (mesh-back look)
  const backStripe = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.40, 0.005),
    lumbarMat
  );
  backStripe.position.set(0, 1.05, 0.34);
  backStripe.rotation.x = -0.10;
  chairGroup.add(backStripe);

  // ---- Headrest ----
  const headrest = new THREE.Mesh(
    new THREE.BoxGeometry(0.36, 0.14, 0.10),
    upholsteryMat
  );
  headrest.position.set(0, 1.32, 0.28);
  headrest.rotation.x = -0.05;
  headrest.castShadow = true;
  chairGroup.add(headrest);

  // ---- Armrests (left + right) ----
  for (const side of [-1, 1]) {
    const stem = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.20, 0.05),
      darkMetalMat
    );
    stem.position.set(side * 0.32, 0.66, -0.04);
    stem.castShadow = true;
    chairGroup.add(stem);

    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(0.10, 0.035, 0.28),
      upholsteryMat
    );
    pad.position.set(side * 0.32, 0.78, -0.06);
    pad.castShadow = true;
    chairGroup.add(pad);
  }

  scene.add(chairGroup);

  // ---- Back wall hint (depth) ----
  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 4),
    new THREE.MeshStandardMaterial({
      color: 0x0a1310,
      roughness: 0.9,
      metalness: 0.0
    })
  );
  wall.position.set(0, 2, -1.6);
  wall.receiveShadow = true;
  scene.add(wall);
  // Subtle window glow on the wall
  const windowGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.4, 1.6),
    new THREE.MeshBasicMaterial({
      color: 0xf0a51a,
      transparent: true,
      opacity: 0.18
    })
  );
  windowGlow.position.set(-2.1, 2.2, -1.59);
  scene.add(windowGlow);
}

// ------------------------------------------------------------------------
// Bootstrap
// ------------------------------------------------------------------------
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', lazyBoot);
} else {
  lazyBoot();
}
