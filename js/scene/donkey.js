import * as THREE from 'three';
import { loadGlb, fitToHeight } from './loaders.js';

/**
 * Asinello con le animazioni del GLB (AnimationMixer).
 * Clip disponibili: idle, grazing, walk, trot, run, call, sleep, laydown, wake up, ...
 * Qui: idle in loop; ogni tanto una brucata, poi torna a idle con dissolvenza.
 */
export async function createDonkey({ height = 0.28 } = {}) {
  const gltf = await loadGlb('donkey.glb');
  const model = gltf.scene;
  model.traverse((o) => { if (o.isSkinnedMesh) o.frustumCulled = false; });

  const root = fitToHeight(model, height);

  const mixer = new THREE.AnimationMixer(model);
  const clips = Object.fromEntries(gltf.animations.map((c) => [c.name.replace('Armature|', ''), c]));
  const actions = {};
  const action = (name) => (actions[name] ??= mixer.clipAction(clips[name]));

  const idleName = clips.idle ? 'idle' : Object.keys(clips)[0];
  let current = null;

  function play(name, { once = false, fade = 0.6 } = {}) {
    if (!clips[name]) return;
    const next = action(name);
    next.reset();
    next.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, once ? 1 : Infinity);
    next.clampWhenFinished = once;
    if (current) next.crossFadeFrom(current, fade, false);
    next.play();
    current = next;
  }

  mixer.addEventListener('finished', () => play(idleName));
  if (idleName) play(idleName, { fade: 0 });

  let timer = 5 + Math.random() * 5;
  return {
    root,
    clips: Object.keys(clips),
    update(dt) {
      mixer.update(dt);
      timer -= dt;
      if (timer <= 0) {
        timer = 10 + Math.random() * 8;
        play('grazing', { once: true });
      }
    },
  };
}
