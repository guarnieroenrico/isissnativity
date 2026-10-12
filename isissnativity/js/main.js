import * as THREE from 'three';
import { ARManager } from './arManager.js';

let scene, camera, renderer, arManager;

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.01,
    100
  );

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  // TRASPARENZA FONDAMENTALE per il Passthrough su Meta Quest
  renderer.setClearColor(0x000000, 0);
  document.body.appendChild(renderer.domElement);

  // Luci base
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xfffaed, 1.2);
  dirLight.position.set(1, 3, 2);
  scene.add(dirLight);

  // Cubo di prova temporaneo
  const cubeGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
  const cubeMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3 });
  const testCube = new THREE.Mesh(cubeGeo, cubeMat);
  testCube.position.set(0, 0.15, -1);
  scene.add(testCube);

  // Inizializzazione AR / Desktop Fallback
  arManager = new ARManager(renderer, camera, scene);

  const arButton = document.getElementById('ar-button');
  const statusInfo = document.getElementById('status-info');
  const overlayUI = document.getElementById('overlay-ui');

  arManager.checkXRSupport().then((supported) => {
    if (supported) {
      statusInfo.textContent = 'Visore rilevato! Premi il pulsante ed entra nel presepe.';
      arButton.disabled = false;
      arButton.addEventListener('click', () => {
        arManager.startARSession(overlayUI);
      });
    } else {
      statusInfo.textContent = 'Modalità 3D PC attiva. Usa il mouse per esplorare la scena.';
      arButton.style.display = 'none';
      arManager.initDesktopFallback();
    }
  });

  window.addEventListener('resize', onWindowResize);

  // Loop di rendering WebXR
  renderer.setAnimationLoop(render);
}

function render() {
  arManager.update();
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

init();