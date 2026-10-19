/**
 * Cloudflare Turnstile helper. Everything is a no-op until VITE_TURNSTILE_SITE_KEY is set, so forms and the
 * chat keep working exactly as before. The widget is "interaction-only": visitors normally never see it.
 */
declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      remove: (id: string) => void;
    };
  }
}

const SITE_KEY = (import.meta.env.VITE_TURNSTILE_SITE_KEY || '').trim();
export const turnstileEnabled = SITE_KEY.length > 0;

let scriptReady: Promise<boolean> | null = null;
function loadScript(): Promise<boolean> {
  if (scriptReady) return scriptReady;
  scriptReady = new Promise<boolean>(resolve => {
    if (window.turnstile) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.defer = true;
    s.onload = () => resolve(!!window.turnstile);
    s.onerror = () => { scriptReady = null; resolve(false); };
    document.head.appendChild(s);
  });
  return scriptReady;
}

/** A single-use token, or null when the check is off or could not be completed (the server then decides). */
export async function getTurnstileToken(): Promise<string | null> {
  if (!turnstileEnabled || typeof document === 'undefined') return null;
  if (!(await loadScript()) || !window.turnstile) return null;
  return new Promise<string | null>(resolve => {
    const host = document.createElement('div');
    host.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:2147483000';
    document.body.appendChild(host);
    let widgetId = '';
    let settled = false;
    const finish = (token: string | null) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      try { if (widgetId) window.turnstile?.remove(widgetId); } catch { /* ignore */ }
      host.remove();
      resolve(token);
    };
    const timer = window.setTimeout(() => finish(null), 30000);
    try {
      widgetId = window.turnstile!.render(host, {
        sitekey: SITE_KEY,
        appearance: 'interaction-only',
        callback: (token: string) => finish(token),
        'error-callback': () => finish(null),
        'timeout-callback': () => finish(null),
      });
    } catch {
      finish(null);
    }
  });
}

/** Chat pass issued by the server after a solved challenge ("<expiry>.<signature>"), kept for the tab session. */
const PASS_KEY = 'ecolife-chat-pass';
export function readPass(): string {
  try {
    const p = sessionStorage.getItem(PASS_KEY) || '';
    const exp = Number(p.split('.')[0]);
    return exp && exp > Date.now() / 1000 + 60 ? p : '';
  } catch { return ''; }
}
export function storePass(p: string): void {
  try { sessionStorage.setItem(PASS_KEY, p); } catch { /* ignore */ }
}
export function clearPass(): void {
  try { sessionStorage.removeItem(PASS_KEY); } catch { /* ignore */ }
}
