import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createStage } from './scene/stage.js';
import { checkArSupport, startAr } from './xr.js';
import { createDebugHud } from './debug.js';

const DEBUG = new URLSearchParams(location.search).has('debug');
const PLACE_DISTANCE = 1.3; // metri: centro del presepe davanti all'utente all'avvio AR

const $ = (id) => document.getElementById(id);
const statusEl = $('status'), hintEl = $('hint'), enterBtn = $('enter-ar');

// ---------- Renderer: sfondo trasparente (serve al passthrough) ----------
const renderer = new THREE.WebGLRenderer({
  canvas: $('scene'), antialias: true, alpha: true, powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType('local-floor');
renderer.xr.setFoveation(1); // risparmia GPU ai bordi dell'immagine

const scene = new THREE.Scene(); // niente background, niente cielo, niente terreno opaco
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.05, 30);
camera.position.set(0, 1.0, 1.9);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.25, 0);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI * 0.49;
controls.update();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
renderer.setSize(innerWidth, innerHeight);

// ---------- Scena ----------
let stageApi = null;
let placed = false;
const hud = createDebugHud(renderer);
const clock = new THREE.Clock();

/** Mette il presepe sul pavimento, davanti a dove guarda l'utente, rivolto verso di lui. */
function placeInFrontOfUser(frame) {
  const pose = frame.getViewerPose(renderer.xr.getReferenceSpace());
  if (!pose) return;
  const { position: p, orientation: q } = pose.transform;
  const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(new THREE.Quaternion(q.x, q.y, q.z, q.w));
  dir.y = 0;
  if (dir.lengthSq() < 1e-4) dir.set(0, 0, -1);
  dir.normalize();

  const stage = stageApi.stage;
  stage.position.set(p.x + dir.x * PLACE_DISTANCE, 0, p.z + dir.z * PLACE_DISTANCE);
  stage.rotation.set(0, Math.atan2(-dir.x, -dir.z), 0);
  placed = true;
}

renderer.setAnimationLoop((_time, frame) => {
  const dt = Math.min(clock.getDelta(), 0.1);
  const inXr = renderer.xr.isPresenting;
  if (inXr && !placed && frame && stageApi) placeInFrontOfUser(frame);
  if (!inXr) controls.update();
  stageApi?.update(dt, clock.elapsedTime);
  renderer.render(scene, camera);
  hud?.update(dt);
});

// ---------- Sessione AR ----------
renderer.xr.addEventListener('sessionstart', () => {
  document.body.classList.add('in-xr');
  controls.enabled = false;
  placed = false;
  // FASE 6: qui parte la musica (serve il gesto utente del click su "Entra in AR").
});
renderer.xr.addEventListener('sessionend', () => {
  document.body.classList.remove('in-xr');
  controls.enabled = true;
  placed = false;
  stageApi?.stage.position.set(0, 0, 0);
  stageApi?.stage.rotation.set(0, 0, 0);
  enterBtn.disabled = false;
});

enterBtn.addEventListener('click', async () => {
  enterBtn.disabled = true;
  try {
    await startAr(renderer);
  } catch (err) {
    console.error(err);
    enterBtn.disabled = false;
    statusEl.textContent = 'Non riesco ad avviare la realtà aumentata. Riprova, oppure guarda la versione 3D qui sotto.';
  }
});

// ---------- Avvio ----------
const FALLBACK_TEXT = {
  insecure: 'Questa pagina non è in HTTPS, quindi WebXR è bloccato.',
  'no-webxr': 'Questo browser non supporta la realtà aumentata (WebXR).',
  'no-ar': 'Questo dispositivo non supporta la realtà aumentata.',
  error: 'Non riesco a verificare il supporto alla realtà aumentata.',
};

async function init() {
  const [{ stage, warnings, update }, support] = await Promise.all([
    createStage({ debug: DEBUG }),
    checkArSupport(),
  ]);
  stageApi = { stage, update };
  scene.add(stage);

  if (support.ok) {
    statusEl.textContent = 'Il presepe è pronto. Entra in AR per vederlo nella tua stanza.';
    enterBtn.disabled = false;
  } else {
    statusEl.textContent = `${FALLBACK_TEXT[support.reason]} Qui sotto vedi il presepe in 3D: trascina per girarci intorno, rotella per avvicinarti.`;
    enterBtn.hidden = true;
  }

  if (warnings.length) {
    hintEl.textContent = `Modelli non caricati: ${warnings.join(', ')}. Lancia "npm run models" (vedi README).`;
  }
}

init().catch((err) => {
  console.error(err);
  statusEl.textContent = 'Errore nel preparare la scena. Apri la console del browser per i dettagli.';
});
