import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class ARManager {
  constructor(renderer, camera, scene) {
    this.renderer = renderer;
    this.camera = camera;
    this.scene = scene;
    this.controls = null;
    this.isAR = false;
  }

  async checkXRSupport() {
    if ('xr' in navigator) {
      return await navigator.xr.isSessionSupported('immersive-ar');
    }
    return false;
  }

  initDesktopFallback() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.camera.position.set(0, 1.2, 2.5);
    this.controls.target.set(0, 0.5, 0);
    this.controls.update();
  }

  async startARSession(uiOverlayElement) {
    if (!('xr' in navigator)) return;

    try {
      const session = await navigator.xr.requestSession('immersive-ar', {
        optionalFeatures: ['local-floor', 'bounded-floor']
      });

      this.renderer.xr.enabled = true;
      await this.renderer.xr.setSession(session);
      this.isAR = true;

      if (this.controls) this.controls.enabled = false;
      if (uiOverlayElement) uiOverlayElement.style.display = 'none';

      session.addEventListener('end', () => {
        this.isAR = false;
        this.renderer.xr.enabled = false;
        if (this.controls) this.controls.enabled = true;
        if (uiOverlayElement) uiOverlayElement.style.display = 'flex';
      });
    } catch (err) {
      console.warn('Avvio sessione WebXR annullato o fallito:', err);
    }
  }

  update() {
    if (!this.isAR && this.controls) {
      this.controls.update();
    }
  }
}