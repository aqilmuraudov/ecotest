/**
 * Inquiries are confirmed to the visitor at once and delivered in the background. If delivery fails
 * (offline, server down) the request waits here and is retried on the next load / when the browser is back online.
 */
const KEY = 'ecolife_inquiry_outbox';
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
export const MAX_TRIES = 3;

export interface QueuedInquiry { data: any; at: number; tries: number }

export function readOutbox(): QueuedInquiry[] {
  try {
    const list: QueuedInquiry[] = JSON.parse(localStorage.getItem(KEY) || '[]');
    return list.filter(q => q && q.data && Date.now() - q.at < MAX_AGE_MS && q.tries < MAX_TRIES);
  } catch { return []; }
}

export function writeOutbox(list: QueuedInquiry[]): void {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* storage unavailable: nothing to keep */ }
}

/** `name` / `phone` refusals are not retried: the same data would be refused again. */
export function queueInquiry(data: any, error?: string): void {
  if (error === 'name' || error === 'phone') return;
  writeOutbox([...readOutbox(), { data, at: Date.now(), tries: 0 }]);
}
