import * as THREE from 'three';
import { loadGlb, fitToHeight } from './loaders.js';

// Punto dove sta Gesù Bambino, in frazioni del box del gruppo (x, y dal basso, z).
// Stimato guardando un'anteprima della scansione: se la luce non cade bene, ritoccare qui.
// Con ?debug compare una sferetta gialla nel punto.
const JESUS_ANCHOR = new THREE.Vector3(0.51, 0.30, 0.88);

export async function createHolyFamily({ height = 0.42 } = {}) {
  const gltf = await loadGlb('holy-family.glb');
  const model = gltf.scene;

  // La scansione guarda verso -Z: la giriamo perché guardi verso +Z (verso i visitatori).
  model.rotation.y = Math.PI;

  // Materiale originale = unlit (nessuna luce lo tocca). Lo sostituiamo con Lambert
  // (economico) mantenendo i colori nei vertici, così la luce di Gesù si vede.
  model.traverse((o) => {
    if (!o.isMesh) return;
    o.material = new THREE.MeshLambertMaterial({
      vertexColors: !!o.geometry.getAttribute('color'),
    });
  });

  const root = fitToHeight(model, height);

  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const anchor = box.min.clone().add(size.multiply(JESUS_ANCHOR));
  return { root, anchor };
}
