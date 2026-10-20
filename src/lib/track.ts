/**
 * Funnel events for the chat A/B test (no personal data): which nudge text was shown, whether it was opened,
 * whether a lead followed. Batched, fire-and-forget, never blocks the page.
 */
const SID_KEY = 'ecolife-chat-sid';
const AB_KEY = 'ecolife-ab';

export type Variant = 'A' | 'B';

export function getSid(): string {
  try {
    let s = sessionStorage.getItem(SID_KEY);
    if (!s) {
      s = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      sessionStorage.setItem(SID_KEY, s);
    }
    return s;
  } catch {
    return 'nosid' + Math.random().toString(36).slice(2, 8);
  }
}

/** Half of the visitors see variant B; the choice is remembered so one person always sees the same copy. */
export function getVariant(): Variant {
  try {
    const v = localStorage.getItem(AB_KEY);
    if (v === 'A' || v === 'B') return v;
    const pick: Variant = Math.random() < 0.5 ? 'A' : 'B';
    localStorage.setItem(AB_KEY, pick);
    return pick;
  } catch {
    return 'A';
  }
}

interface QueuedEvent { name: string; meta?: Record<string, unknown> }
let queue: QueuedEvent[] = [];
let page = '';
let timer = 0;

function flush() {
  window.clearTimeout(timer);
  timer = 0;
  if (!queue.length) return;
  const body = JSON.stringify({ sid: getSid(), variant: getVariant(), page, events: queue.slice(0, 8) });
  queue = queue.slice(8);
  try {
    if (navigator.sendBeacon && navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }))) return;
    void fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => undefined);
  } catch { /* analytics must never break the page */ }
}

export function track(name: string, pageType?: string, meta?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  page = pageType || page;
  queue.push({ name, meta });
  if (!timer) timer = window.setTimeout(flush, 1500);
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flush);
}
