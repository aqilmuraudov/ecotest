import { lazy, type ComponentType } from 'react';

/**
 * After a deploy the hashed chunk files of the previous build disappear. A tab that still runs the old bundle then fails
 * on the next lazy import ("Failed to fetch dynamically imported module", or the host answers with index.html). That used
 * to unmount the whole app and leave a blank page (typically after the Back button or a long-open tab). The fix is to load
 * the fresh build once; the guard stops a reload loop when the failure is real.
 */
const RELOAD_KEY = 'ecolife_chunk_reload_at';
const RELOAD_GAP_MS = 30_000;

export function isChunkLoadError(err: unknown): boolean {
  const msg = String((err as { message?: string } | null)?.message ?? err ?? '');
  return /dynamically imported module|importing a module script failed|Loading chunk|Loading CSS chunk|ChunkLoadError|error loading dynamically|Unable to preload CSS|is not a valid JavaScript MIME type|Failed to fetch/i.test(msg);
}

/** Reloads the page once per RELOAD_GAP_MS; returns false when it already did (so the caller can show a fallback). */
export function reloadOnce(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - last < RELOAD_GAP_MS) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    /* storage blocked: still try a single reload below */
  }
  window.location.reload();
  return true;
}

export function lazyRetry<T extends ComponentType<any>>(factory: () => Promise<{ default: T }>) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (err) {
      try {
        return await factory(); // a flaky network: one quick retry before giving up
      } catch (err2) {
        if (isChunkLoadError(err2 || err) && reloadOnce()) return new Promise<{ default: T }>(() => {}); // page is reloading
        throw err2;
      }
    }
  });
}
