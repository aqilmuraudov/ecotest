import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PHONE_CASES } from './phoneCases';

// POST /api/lead with every outside service stubbed: fetch is routed by URL to fake Turnstile, Supabase and
// Telegram answers, and any other URL throws. The env holds fake values only.

const SB = 'https://sb.test';

interface NetOpts {
  turnstile?: boolean | 'down'; // siteverify answer, or Cloudflare unreachable
  save?: boolean | 'throw'; // Supabase inquiries insert
  telegram?: boolean;
}

interface Call { url: string; body: any }

function mockNetwork(o: NetOpts = {}) {
  const calls: Call[] = [];
  const json = (v: unknown, status = 200) => new Response(JSON.stringify(v), { status, headers: { 'Content-Type': 'application/json' } });
  vi.stubGlobal('fetch', vi.fn(async (input: unknown, init?: RequestInit) => {
    const url = String(input);
    let body: any = init?.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { /* form body */ } }
    calls.push({ url, body });
    if (url === 'https://challenges.cloudflare.com/turnstile/v0/siteverify') {
      if (o.turnstile === 'down') throw new Error('connect ECONNREFUSED');
      return json({ success: o.turnstile ?? true });
    }
    if (url.startsWith(`${SB}/rest/v1/products?`)) {
      return json([{ code: 'EL-100', slug: 'el-100', name: 'Track 20W 3000K', category: 'track-lights', category_name: { az: 'Trek', en: 'Track', ru: 'Трек' }, image: '' }]);
    }
    if (url === `${SB}/rest/v1/inquiries`) {
      if (o.save === 'throw') throw new Error('fetch failed');
      return o.save === false ? new Response('db down', { status: 500 }) : new Response(null, { status: 201 });
    }
    if (url.startsWith('https://api.telegram.org/bot')) return json({ ok: o.telegram !== false }, o.telegram === false ? 500 : 200);
    throw new Error(`Unexpected network request in a test: ${url}`);
  }));
  const of = (part: string) => calls.filter(c => c.url.includes(part));
  return {
    calls,
    saves: () => of('/rest/v1/inquiries'),
    telegrams: () => of('api.telegram.org'),
    captchas: () => of('challenges.cloudflare.com'),
  };
}

interface Res { statusCode: number; body: any; headers: Record<string, string> }

async function post(body: unknown, { ip = '203.0.113.7', method = 'POST' } = {}): Promise<Res> {
  const res = {
    statusCode: 200,
    body: undefined as any,
    headers: {} as Record<string, string>,
    status(c: number) { this.statusCode = c; return this; },
    json(o: unknown) { this.body = o; return this; },
    setHeader(k: string, v: string) { this.headers[k] = v; },
  };
  await handler({ method, body, headers: { 'x-forwarded-for': ip, 'user-agent': 'vitest' } }, res);
  return res;
}

const valid = (extra: Record<string, unknown> = {}) => ({
  name: 'Aqil Test',
  phone: '050 450 70 07',
  consent: true,
  source: 'contact-page',
  lang: 'az',
  cfToken: 'turnstile-test-token',
  ...extra,
});

let handler: (req: any, res: any) => Promise<unknown>;

beforeEach(async () => {
  vi.stubEnv('VITE_SUPABASE_URL', SB);
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon-test-key');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-test-key');
  vi.stubEnv('TELEGRAM_BOT_TOKEN', 'telegram-test-token');
  vi.stubEnv('TELEGRAM_CHAT_ID', '-100test');
  vi.stubEnv('TURNSTILE_SECRET_KEY', 'turnstile-test-secret');
  vi.stubEnv('SITE_URL', 'https://site.test');
  vi.stubEnv('SALES_WHATSAPP', '994500000000');
  vi.spyOn(console, 'error').mockImplementation(() => {});
  // fresh module per test: the rate limiter, the dedupe memory and the catalogue cache live in module scope
  vi.resetModules();
  handler = (await import('../api/lead')).default;
});

describe('method and honeypot', () => {
  it('refuses anything but POST', async () => {
    const net = mockNetwork();
    const r = await post(valid(), { method: 'GET' });
    expect(r.statusCode).toBe(405);
    expect(r.headers.Allow).toBe('POST');
    expect(net.calls).toEqual([]);
  });

  it('honeypot filled: answers 200 ok and stores / sends nothing', async () => {
    const net = mockNetwork();
    const r = await post(valid({ website: 'http://spam.example' }));
    expect(r.statusCode).toBe(200);
    expect(r.body).toEqual({ ok: true });
    expect(net.calls).toEqual([]); // no captcha check, no database, no Telegram
  });

  it('accepts a JSON string body', async () => {
    const net = mockNetwork();
    const r = await post(JSON.stringify(valid()));
    expect(r.statusCode).toBe(200);
    expect(net.saves()).toHaveLength(1);
  });
});

describe('rate limit (5 per IP per 10 minutes)', () => {
  it('the 6th request from one IP gets 429, before any check or write', async () => {
    const net = mockNetwork();
    for (let i = 0; i < 5; i++) expect((await post(valid({ name: 'x' }))).statusCode).toBe(400);
    const before = net.calls.length;
    const r = await post(valid());
    expect(r.statusCode).toBe(429);
    expect(net.calls.length).toBe(before); // nothing reached Turnstile, Supabase or Telegram
  });

  it('counts per IP (x-forwarded-for, first address)', async () => {
    mockNetwork();
    for (let i = 0; i < 5; i++) await post(valid({ name: 'x' }), { ip: '198.51.100.1, 10.0.0.1' });
    expect((await post(valid({ name: 'x' }), { ip: '198.51.100.1, 10.0.0.2' })).statusCode).toBe(429);
    expect((await post(valid({ name: 'x' }), { ip: '198.51.100.2' })).statusCode).toBe(400);
  });

  it('opens again after the 10 minute window', async () => {
    mockNetwork();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-24T10:00:00Z'));
    for (let i = 0; i < 5; i++) await post(valid({ name: 'x' }));
    expect((await post(valid({ name: 'x' }))).statusCode).toBe(429);
    vi.setSystemTime(new Date('2026-10-24T10:10:01Z'));
    expect((await post(valid({ name: 'x' }))).statusCode).toBe(400);
  });
});

describe('human check (Turnstile, mocked)', () => {
  it('siteverify says no -> 403 captcha, nothing stored or sent', async () => {
    const net = mockNetwork({ turnstile: false });
    const r = await post(valid());
    expect(r.statusCode).toBe(403);
    expect(r.body).toEqual({ error: 'captcha' });
    expect(net.captchas()).toHaveLength(1);
    expect(net.captchas()[0].body).toBeInstanceOf(URLSearchParams);
    expect((net.captchas()[0].body as URLSearchParams).get('response')).toBe('turnstile-test-token');
    expect(net.saves()).toEqual([]);
    expect(net.telegrams()).toEqual([]);
  });

  it('no token -> 403 without calling Cloudflare', async () => {
    const net = mockNetwork();
    const r = await post(valid({ cfToken: '' }));
    expect(r.statusCode).toBe(403);
    expect(net.calls).toEqual([]);
  });

  it('runs before validation: a bad name with a bad token is still 403', async () => {
    mockNetwork({ turnstile: false });
    expect((await post(valid({ name: '', cfToken: 'bad' }))).statusCode).toBe(403);
  });

  it('a valid signed pass from the chat is accepted without a new challenge', async () => {
    const net = mockNetwork();
    const { issuePass } = await import('../api/_lib/core');
    const r = await post(valid({ cfToken: '', pass: issuePass() }));
    expect(r.statusCode).toBe(200);
    expect(net.captchas()).toEqual([]);
  });

  it('a forged pass is refused', async () => {
    mockNetwork();
    expect((await post(valid({ cfToken: '', pass: `${Math.floor(Date.now() / 1000) + 600}.AAAAAAAAAAAAAAAAAAAAAAAAAAA` }))).statusCode).toBe(403);
  });

  // current design (api/_lib/core.ts verifyTurnstile): if Cloudflare cannot be reached the request is let through
  it('Cloudflare unreachable -> allowed (fail-open by design)', async () => {
    const net = mockNetwork({ turnstile: 'down' });
    const r = await post(valid());
    expect(r.statusCode).toBe(200);
    expect(net.saves()).toHaveLength(1);
  });

  it('check is skipped when TURNSTILE_SECRET_KEY is not set', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', '');
    const net = mockNetwork();
    const r = await post(valid({ cfToken: '' }));
    expect(r.statusCode).toBe(200);
    expect(net.captchas()).toEqual([]);
  });
});

describe('validation', () => {
  it.each([
    ['', 'empty'],
    ['A', 'one letter'],
    ['  B  ', 'one letter with spaces'],
    [undefined, 'missing'],
  ])('name %j (%s) -> 400 name', async name => {
    const net = mockNetwork();
    const r = await post(valid({ name }));
    expect(r.statusCode).toBe(400);
    expect(r.body).toEqual({ error: 'name' });
    expect(net.saves()).toEqual([]);
    expect(net.telegrams()).toEqual([]);
  });

  it('two letters is enough', async () => {
    mockNetwork();
    expect((await post(valid({ name: 'Al' }))).statusCode).toBe(200);
  });

  it.each(['12345', '', 'abc', '+994 050 450 70 07', undefined])('phone %j -> 400 phone', async phone => {
    const net = mockNetwork();
    const r = await post(valid({ phone }));
    expect(r.statusCode).toBe(400);
    expect(r.body).toEqual({ error: 'phone' });
    expect(net.saves()).toEqual([]);
  });

  it('name is checked before phone', async () => {
    mockNetwork();
    expect((await post(valid({ name: 'A', phone: '1' }))).body).toEqual({ error: 'name' });
  });

  it.each([undefined, false, 'true', 1, 'yes'])('consent %j -> 400 consent', async consent => {
    const net = mockNetwork();
    const r = await post(valid({ consent }));
    expect(r.statusCode).toBe(400);
    expect(r.body).toEqual({ error: 'consent' });
    expect(net.saves()).toEqual([]);
    expect(net.telegrams()).toEqual([]);
  });
});

describe('phone normalisation through the handler (same table as the browser check)', () => {
  it.each(PHONE_CASES)('$note: "$input" -> $stored', async ({ input, stored }) => {
    const net = mockNetwork();
    const r = await post(valid({ phone: input }));
    if (stored === null) {
      expect(r.statusCode).toBe(400);
      expect(r.body).toEqual({ error: 'phone' });
      return;
    }
    expect(r.statusCode).toBe(200);
    expect(net.saves()[0].body.phone).toBe(`+${stored}`);
    expect(net.telegrams()[0].body.text).toContain(`<code>+${stored}</code>`);
    expect(net.telegrams()[0].body.reply_markup.inline_keyboard[0][0].url).toContain(`https://wa.me/${stored}?`);
  });
});

describe('successful lead', () => {
  it('saves one inquiry and notifies Telegram', async () => {
    const net = mockNetwork();
    const r = await post(valid({ source: 'product', productCode: 'el-100', message: 'Salam' }));
    expect(r.statusCode).toBe(200);
    expect(r.body).toMatchObject({ ok: true, notified: true, site: 'https://site.test' });
    expect(r.body.id).toMatch(/^inq-\d+-[a-z0-9]{4}$/);
    expect(r.body.short).toBe(r.body.id.slice(-4).toUpperCase());
    expect(r.body.whatsappUrl).toMatch(/^https:\/\/wa\.me\/994500000000\?text=/);

    const row = net.saves()[0].body;
    expect(row).toMatchObject({
      id: r.body.id, name: 'Aqil Test', phone: '+994504507007', email: '-', status: 'new',
      subject: 'Satış sorğusu (məhsul)', product_code: 'EL-100', message: 'Salam',
    });
    const tg = net.telegrams()[0];
    expect(tg.url).toBe('https://api.telegram.org/bottelegram-test-token/sendMessage');
    expect(tg.body.chat_id).toBe('-100test');
    expect(tg.body.text).toContain(`🛒 <b>Satış sorğusu (məhsul)</b> · №${r.body.short}`);
  });

  it('uses the service-role key for the insert', async () => {
    const net = mockNetwork();
    await post(valid());
    const init = (fetch as any).mock.calls.find((c: any[]) => String(c[0]) === `${SB}/rest/v1/inquiries`)[1];
    expect(init.headers.apikey).toBe('service-test-key');
    expect(net.saves()).toHaveLength(1);
  });

  it('an unknown source falls back to contact-form', async () => {
    const net = mockNetwork();
    await post(valid({ source: 'evil' }));
    expect(net.saves()[0].body.subject).toBe('Layihə sorğusu');
  });

  it('escapes HTML in the Telegram message', async () => {
    const net = mockNetwork();
    await post(valid({ name: '<b>Ali</b>', message: 'a < b & c' }));
    const text: string = net.telegrams()[0].body.text;
    expect(text).toContain('&lt;b&gt;Ali&lt;/b&gt;');
    expect(text).toContain('a &lt; b &amp; c');
  });
});

describe('client reference (ref)', () => {
  it('a valid 4-char ref becomes the end of the id and the short number', async () => {
    const net = mockNetwork();
    const r = await post(valid({ ref: 'ab12' }));
    expect(r.body.id).toMatch(/^inq-\d+-ab12$/);
    expect(r.body.short).toBe('AB12');
    expect(net.saves()[0].body.id).toBe(r.body.id);
    expect(net.telegrams()[0].body.text).toContain('№AB12');
  });

  it('upper-case ref is accepted (lower-cased)', async () => {
    mockNetwork();
    const r = await post(valid({ ref: 'XY9Z' }));
    expect(r.body.id.endsWith('-xy9z')).toBe(true);
    expect(r.body.short).toBe('XY9Z');
  });

  it.each(['ab1', 'abcde', 'ab-1', 'ab 1', 'аб12', '<b>!'])('invalid ref %j is ignored (server picks its own)', async ref => {
    mockNetwork();
    const r = await post(valid({ ref }));
    expect(r.statusCode).toBe(200);
    expect(r.body.id).toMatch(/^inq-\d+-[a-z0-9]{4}$/);
    expect(r.body.id.endsWith(`-${String(ref).toLowerCase()}`)).toBe(false);
  });
});

describe('dedupe (same phone + source + productCode within 5 minutes)', () => {
  it('a second identical request returns the first result with duplicate: true and writes nothing', async () => {
    const net = mockNetwork();
    const first = await post(valid({ ref: 'aaaa' }));
    const second = await post(valid({ ref: 'bbbb', phone: '+994 50 450 70 07' })); // same number, other format
    expect(second.statusCode).toBe(200);
    expect(second.body).toEqual({ ...first.body, duplicate: true });
    // the server keeps the first number (AAAA); the chat takes `short` from this answer instead of its own BBBB
    expect(second.body.short).toBe('AAAA');
    expect(net.saves()).toHaveLength(1);
    expect(net.telegrams()).toHaveLength(1);
  });

  it('a different productCode or source is a new inquiry', async () => {
    const net = mockNetwork();
    await post(valid({ source: 'product', productCode: 'EL-100' }));
    expect((await post(valid({ source: 'product', productCode: 'EL-200' }))).body.duplicate).toBeUndefined();
    expect((await post(valid({ source: 'configurator', productCode: 'EL-100' }))).body.duplicate).toBeUndefined();
    expect(net.saves()).toHaveLength(3);
  });

  it('after 5 minutes the same request is a new inquiry', async () => {
    const net = mockNetwork();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-24T10:00:00Z'));
    await post(valid());
    vi.setSystemTime(new Date('2026-10-24T10:04:59Z'));
    expect((await post(valid())).body.duplicate).toBe(true);
    vi.setSystemTime(new Date('2026-10-24T10:05:01Z'));
    expect((await post(valid())).body.duplicate).toBeUndefined();
    expect(net.saves()).toHaveLength(2);
  });

  it('a failed (502) attempt is not remembered, so the retry is processed', async () => {
    mockNetwork({ save: false, telegram: false });
    expect((await post(valid())).statusCode).toBe(502);
    const net = mockNetwork();
    const r = await post(valid());
    expect(r.statusCode).toBe(200);
    expect(r.body.duplicate).toBeUndefined();
    expect(net.saves()).toHaveLength(1);
  });
});

describe('delivery outcome', () => {
  it('database fails, Telegram works -> still ok', async () => {
    const net = mockNetwork({ save: false });
    const r = await post(valid());
    expect(r.statusCode).toBe(200);
    expect(r.body).toMatchObject({ ok: true, notified: true });
    expect(net.saves()).toHaveLength(1);
  });

  it('database throws, Telegram works -> still ok', async () => {
    mockNetwork({ save: 'throw' });
    expect((await post(valid())).body).toMatchObject({ ok: true, notified: true });
  });

  it('database works, Telegram fails -> ok with notified: false', async () => {
    mockNetwork({ telegram: false });
    const r = await post(valid());
    expect(r.statusCode).toBe(200);
    expect(r.body).toMatchObject({ ok: true, notified: false });
  });

  it('both fail -> 502 unavailable', async () => {
    mockNetwork({ save: false, telegram: false });
    const r = await post(valid());
    expect(r.statusCode).toBe(502);
    expect(r.body).toEqual({ error: 'unavailable' });
  });

  it('database throws and Telegram fails -> 502 unavailable', async () => {
    mockNetwork({ save: 'throw', telegram: false });
    expect((await post(valid())).statusCode).toBe(502);
  });

  it('nothing configured (no Supabase, no Telegram) -> 502 unavailable', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('TELEGRAM_BOT_TOKEN', '');
    const net = mockNetwork();
    const r = await post(valid());
    expect(r.statusCode).toBe(502);
    expect(net.saves()).toEqual([]);
    expect(net.telegrams()).toEqual([]);
  });
});
