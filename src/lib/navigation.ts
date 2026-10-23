/**
 * A full page load, on purpose: it throws away every cached query and any half-typed state,
 * which is what we want when a session ends or the signed-in user changes.
 */
export function hardNavigate(path: string) {
  if (typeof window === "undefined") return;
  window.location.assign(path);
}
