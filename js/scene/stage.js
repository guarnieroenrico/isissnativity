import * as THREE from 'three';
import { createHolyFamily } from './holyFamily.js';
import { createDonkey } from './donkey.js';

// Tavola del presepe (metri, scala reale in AR): ellisse circa 1,5 x 1,1 m.
export const TABLE = { rx: 0.75, rz: 0.55, h: 0.05 };

function buildTable() {
  // Colori scelti per il passthrough in bianco e nero: piano chiaro, bordo scuro.
  const top = new THREE.MeshLambertMaterial({ color: 0xd9c7a0 });
  const side = new THREE.MeshLambertMaterial({ color: 0x4a3220 });
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, TABLE.h, 64), [side, top, side]);
  mesh.scale.set(TABLE.rx, 1, TABLE.rz);
  mesh.position.y = TABLE.h / 2;
  mesh.name = 'table';
  return mesh;
}

/**
 * Costruisce il presepe. Se un modello manca o non si carica, la scena parte lo stesso
 * e il problema finisce in `warnings`.
 * Luci: 2 (emisferica + punto caldo di Gesù). Nessuna ombra, nessuna post-produzione.
 */
export async function createStage({ debug = false } = {}) {
  const stage = new THREE.Group();
  stage.name = 'stage';
  const warnings = [];
  const updaters = [];

  stage.add(buildTable());
  stage.add(new THREE.HemisphereLight(0xfff1dc, 0x7a6a58, 2.0));

  const settle = async (label, promise) => {
    try { return await promise; } catch (err) {
      console.warn(`[${label}]`, err);
      warnings.push(label);
      return null;
    }
  };

  const [family, donkey] = await Promise.all([
    settle('holy-family.glb', createHolyFamily()),
    settle('donkey.glb', createDonkey()),
  ]);

  const ground = TABLE.h;

  let jesusLight = null;
  if (family) {
    family.root.position.set(0, ground, -0.08);
    stage.add(family.root);

    // Luce calda di Gesù Bambino.
    jesusLight = new THREE.PointLight(0xffb45e, 0.35, 1.2, 2);
    jesusLight.position.copy(family.anchor).add(family.root.position);
    stage.add(jesusLight);

    if (debug) {
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.012, 12, 8),
        new THREE.MeshBasicMaterial({ color: 0xffe08a }),
      );
      dot.position.copy(jesusLight.position);
      stage.add(dot);
    }
  }

  if (donkey) {
    donkey.root.position.set(-0.34, ground, 0.02);
    donkey.root.rotation.y = 0.6; // provvisorio: guarda verso il centro
    stage.add(donkey.root);
    updaters.push((dt) => donkey.update(dt));
    if (debug) console.info('[donkey] animazioni:', donkey.clips.join(', '));
  }

  if (jesusLight) {
    updaters.push((dt, t) => { jesusLight.intensity = 0.35 * (1 + 0.06 * Math.sin(t * 2.1)); });
  }

  return {
    stage,
    warnings,
    update(dt, t) { for (const u of updaters) u(dt, t); },
  };
}
