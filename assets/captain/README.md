# Captain Maker 3D — integration notes

Three.js-based interactive scene that loads a GLB model and plays its built-in animations. Lazy-loaded — Three.js doesn't download until the captain section scrolls near the viewport.

## Where to put the GLB

**Path:** `assets/models/captain-maker.glb`

Just drop the file there. No code changes needed.

## Expected GLB contents

- One root scene with the rigged character.
- Optional embedded animations. The loader looks for clip names matching:
  - **idle:** `/idle|breath|stand|loop/i` — plays on loop by default
  - **wave:** `/wave|greet|hello|hi|salute|tap/i` — triggered on click + first hover
  - **type:** `/typ|work|code/i` — reserved for a future "working on the laptop" idle
- If no clips match, the loader falls back to `clip[0]` for idle.
- If there's no wave clip, the engine substitutes a quick turn-toward-camera + bow tween.

## Recommended export settings

| | |
|--|--|
| **Format** | `.glb` (binary glTF 2.0) |
| **Up axis** | Y |
| **Units** | metres |
| **Mesh size** | ~2m tall (the engine auto-scales but starting close avoids precision issues) |
| **Materials** | PBR (metallic/roughness). Engine uses ACES tone mapping + `envMapIntensity` 0.6 |
| **Textures** | Power-of-two, embedded in the GLB |
| **Animations** | Embedded; name them per the table above |
| **File size target** | <2MB for fast load. Use Draco compression if your tool supports it |

If your GLB uses Draco compression, also add this in `assets/captain/captain-3d.js` just below the GLTFLoader import:

```js
const { DRACOLoader } = await import('three/addons/loaders/DRACOLoader.js');
const draco = new DRACOLoader();
draco.setDecoderPath('https://unpkg.com/three@0.160.0/examples/jsm/libs/draco/');
loader.setDRACOLoader(draco);
```

## Public API (after init)

Other scripts can drive the captain:

```js
window.captain.greet();              // wave / nod
window.captain.play('idle');         // jump to a named action
window.captain.setRotation(0.3);     // radians on Y
```

Listen for state changes:

```js
window.addEventListener('captain:loaded', () => { /* model is in the scene */ });
```

## Tuning

Edit the constants at the top of `assets/captain/captain-3d.js`:

- `CAMERA_FOV`, `CAMERA_POS`, `CAMERA_LOOK_AT` — frame the shot
- `ANIMATION_PATTERNS` — how the loader picks clips by name

## Fallbacks

- **No WebGL** → engine adds `.captain-desk--no-webgl` to the section, CSS hides the canvas and shows a static frame.
- **GLB missing** → engine adds `.captain-desk--no-model`, CSS displays a labeled debug message.
- **Reduced motion** → idle animation still plays but the hover-track and greet tween are short-circuited (see CSS).

## Performance

- Three.js (~600KB) is imported dynamically via `import()` and **only fetched when the captain section enters the viewport** (300px rootMargin).
- The render loop pauses when the section scrolls offscreen.
- DPR capped at 1.75 to keep mobile happy.
- Single directional light + ambient + a soft rim. One 1024×1024 shadow map.
- No physics, no controls, no post-processing.

## Alternative stacks

If you migrate the public site to Next.js / React, this same scene is one component away:

```jsx
import { Canvas } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'

function CaptainMaker() {
  const { scene, animations } = useGLTF('/assets/models/captain-maker.glb')
  const { actions } = useAnimations(animations, scene)
  // ... mirror the patterns in captain-3d.js
  return <primitive object={scene} />
}
```

The current setup uses plain Three.js because the public site is static HTML.
