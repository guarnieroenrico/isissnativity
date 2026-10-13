// Pannello di debug: si attiva aggiungendo ?debug all'indirizzo (utile col PC / emulatore).
// Mostra FPS e budget grafico. Obiettivo Quest 2: < 100.000 triangoli in totale.
export function createDebugHud(renderer) {
  if (!new URLSearchParams(location.search).has('debug')) return null;
  const el = document.getElementById('debug');
  el.hidden = false;
  let acc = 0, frames = 0;

  return {
    update(dt) {
      acc += dt; frames++;
      if (acc < 0.5) return;
      const r = renderer.info.render, m = renderer.info.memory;
      el.textContent =
        `FPS        ${(frames / acc).toFixed(0)}\n` +
        `Triangoli  ${r.triangles.toLocaleString('it-IT')}  (budget 100.000)\n` +
        `Draw calls ${r.calls}\n` +
        `Geometrie  ${m.geometries}   Texture ${m.textures}`;
      acc = 0; frames = 0;
    },
  };
}
