// Supporto e avvio della sessione WebXR (immersive-ar).

/** Dice se l'AR è disponibile e, se no, perché (per scrivere un messaggio chiaro). */
export async function checkArSupport() {
  if (!window.isSecureContext) return { ok: false, reason: 'insecure' };
  if (!navigator.xr) return { ok: false, reason: 'no-webxr' };
  try {
    const ok = await navigator.xr.isSessionSupported('immersive-ar');
    return { ok, reason: ok ? null : 'no-ar' };
  } catch {
    return { ok: false, reason: 'error' };
  }
}

/**
 * Avvia la sessione AR. DEVE essere chiamata dentro un gesto utente (click/tap).
 * - local-floor: l'origine è sul pavimento reale.
 * - hit-test: solo opzionale (fase 3); se manca, si usa il posizionamento davanti all'utente.
 */
export async function startAr(renderer) {
  const session = await navigator.xr.requestSession('immersive-ar', {
    requiredFeatures: ['local-floor'],
    optionalFeatures: ['hit-test'],
  });
  await renderer.xr.setSession(session);
  return session;
}
