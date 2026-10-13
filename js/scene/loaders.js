import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder); // i GLB di public/models sono compressi con meshopt

export const modelUrl = (name) => `${import.meta.env.BASE_URL}models/${name}`;
export const loadGlb = (name) => loader.loadAsync(modelUrl(name));

/**
 * Scala `obj` fino a `height` metri, lo centra in x/z e lo appoggia a y = 0.
 * Restituisce un Group contenitore (la posizione/rotazione si danno al contenitore).
 */
export function fitToHeight(obj, height) {
  const wrapper = new THREE.Group();
  wrapper.add(obj);
  wrapper.updateMatrixWorld(true);

  let box = new THREE.Box3().setFromObject(wrapper);
  obj.scale.multiplyScalar(height / box.getSize(new THREE.Vector3()).y);
  wrapper.updateMatrixWorld(true);

  box = new THREE.Box3().setFromObject(wrapper);
  const c = box.getCenter(new THREE.Vector3());
  obj.position.set(obj.position.x - c.x, obj.position.y - box.min.y, obj.position.z - c.z);
  wrapper.updateMatrixWorld(true);
  return wrapper;
}
