import { env, rateLimit, clientIp, sendTelegram, escapeHtml, loadCatalog, checkHuman, SALES_WHATSAPP, SITE_URL } from './_lib/core.js';
import { summarize, type ChatMsg } from './_lib/ai.js';
import { linkLead } from './_lib/log.js';

// POST /api/lead  { name, phone, message?, source, lang, products?: string[], transcript?: ChatMsg[], consent, website }
// One pipeline for every request: validate -> save to Supabase (inquiries) -> notify the sales team on Telegram.

const SOURCES: Record<string, string> = {
  'ai-chat': 'AI söhbət',
  'contact-form': 'Əlaqə forması',
  product: 'Məhsul səhifəsi',
  configurator: 'Konfiqurator',
};

// when the customer wants the call (labels are for the sales team, in Azerbaijani)
const CALLBACK: Record<string, string> = {
  asap: 'Mümkün qədər tez',
  'today-am': 'Bu gün 09:00-12:00',
  'today-noon': 'Bu gün 12:00-15:00',
  'today-pm': 'Bu gün 15:00-18:00',
  'tmrw-am': 'Sabah 09:00-12:00',
  'tmrw-noon': 'Sabah 12:00-15:00',
  'tmrw-pm': 'Sabah 15:00-18:00',
};

function normalizePhone(input: string): string | null {
  const d = input.replace(/\D/g, '');
  let full = d;
  if (d.length === 9) full = '994' + d; // 50 450 70 07
  else if (d.length === 10 && d.startsWith('0')) full = '994' + d.slice(1); // 050 450 70 07
  // Azerbaijan numbers are exactly 994 + 9 digits; other countries may be 11-15 digits
  if (full.startsWith('994')) return full.length === 12 && /^994[1-9]\d{8}$/.test(full) ? full : null;
  return full.length >= 11 && full.length <= 15 ? full : null;
}

// the same person pressing "send" twice (or a retry after a slow response) must create one inquiry, not two
const recent = new Map<string, { at: number; body: Record<string, unknown> }>();
const DEDUPE_MS = 5 * 60 * 1000;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

  if (body.website) return res.status(200).json({ ok: true }); // honeypot: pretend success to bots
  if (!rateLimit(`lead:${clientIp(req)}`, 5, 10 * 60 * 1000)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  const human = await checkHuman(body, clientIp(req));
  if (!human.ok) return res.status(403).json({ error: 'captcha' });

  const name = String(body.name || '').trim().slice(0, 80);
  const phone = normalizePhone(String(body.phone || ''));
  const lang: 'az' | 'ru' = body.lang === 'ru' ? 'ru' : 'az';
  if (name.length < 2) return res.status(400).json({ error: 'name' });
  if (!phone) return res.status(400).json({ error: 'phone' });
  // the classic forms state the consent next to the submit button; the chat asks for an explicit tick
  if (body.consent !== true) return res.status(400).json({ error: 'consent' });

  const sourceForKey = SOURCES[String(body.source)] ? String(body.source) : 'contact-form';
  const dedupeKey = `${phone}|${sourceForKey}|${String(body.productCode || '')}`;
  const seen = recent.get(dedupeKey);
  if (seen && Date.now() - seen.at < DEDUPE_MS) return res.status(200).json({ ...seen.body, duplicate: true });

  const emailRaw = String(body.email || '').trim().toLowerCase().slice(0, 200);
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailRaw) ? emailRaw : '-';
  const company = String(body.company || '').trim().slice(0, 190) || null;
  const projectType = String(body.projectType || '').trim().slice(0, 190) || null;
  const roomPreset = String(body.roomPreset || '').trim().slice(0, 190) || null;
  const configSummary = String(body.configSummary || '').trim().slice(0, 4000);
  const sourceKey = SOURCES[String(body.source)] ? String(body.source) : 'contact-form';
  const history: ChatMsg[] = (Array.isArray(body.transcript) ? body.transcript : [])
    .map((m: any) => ({ role: m?.role === 'assistant' ? 'assistant' : 'user', content: String(m?.content ?? '').slice(0, 1200) }) as ChatMsg)
    .filter((m: ChatMsg) => m.content.trim())
    .slice(-20);

  // products referenced by the customer/AI (validated against the real catalogue)
  const catalog = await loadCatalog();
  // what the customer starred in the chat wins; otherwise the products that were shown
  const starred: string[] = (Array.isArray(body.shortlist) ? body.shortlist.map(String) : []).slice(0, 12);
  const wanted: string[] = starred.length
    ? starred
    : (Array.isArray(body.products) ? body.products.map(String) : []).concat(body.productCode ? [String(body.productCode)] : []).slice(0, 5);
  const products = wanted.map(c => catalog.find(i => i.code.toLowerCase() === c.toLowerCase())).filter(Boolean) as typeof catalog;

  const userMessage = String(body.message || '').trim().slice(0, 1500);
  const callbackLabel = CALLBACK[String(body.callback)] || '';
  const sid = String(body.sid || '').replace(/[^\w\-.]/g, '').slice(0, 40);
  const summary = history.length ? await summarize(history) : '';

  const id = `inq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const short = id.slice(-4).toUpperCase();
  const transcriptText = history.map(m => `${m.role === 'user' ? 'Müştəri' : 'AISeller'}: ${m.content}`).join('\n').slice(0, 9000);

  // 1) save (public INSERT is allowed by RLS for status = 'new')
  let saved = false;
  const sbUrl = env('VITE_SUPABASE_URL');
  // server-only key (bypasses RLS) when configured; the public anon INSERT policy can then be removed from the database
  const sbKey = env('SUPABASE_SERVICE_ROLE_KEY') || env('VITE_SUPABASE_ANON_KEY');
  if (sbUrl && sbKey) {
    const row = {
      id,
      name,
      email,
      phone: '+' + phone,
      subject: SOURCES[sourceKey],
      message: ((callbackLabel ? `Zəng vaxtı: ${callbackLabel}. ` : '') + (summary || userMessage || 'Müştəri sorğu göndərdi')).slice(0, 4900),
      product_code: products[0]?.code || null,
      product_name: products[0]?.name?.slice(0, 290) || null,
      product_category: products[0]?.categoryName.az || null,
      company,
      project_type: projectType,
      room_preset: roomPreset,
      config_summary: (configSummary || transcriptText || null),
      status: 'new',
      user_agent: String(req.headers?.['user-agent'] || '').slice(0, 250),
    };
    try {
      const r = await fetch(`${sbUrl}/rest/v1/inquiries`, {
        method: 'POST',
        headers: { apikey: sbKey, ...(sbKey.startsWith('eyJ') ? { Authorization: `Bearer ${sbKey}` } : {}), 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify(row),
      });
      saved = r.ok;
      if (!r.ok) console.error('[lead] save failed', r.status, (await r.text()).slice(0, 200));
    } catch (e) {
      console.error('[lead] save error', e);
    }
  }

  // 2) notify the sales team
  const greet = lang === 'ru'
    ? `Здравствуйте, ${name}! Это Ecolife. Получили вашу заявку №${short}.`
    : `Salam, ${name}! Ecolife-dan yazırıq. Sorğunuz (№${short}) qəbul olundu.`;
  const lines = [
    `<b>Yeni sorğu №${short}</b> · ${escapeHtml(SOURCES[sourceKey])}`,
    `Ad: <b>${escapeHtml(name)}</b>`,
    `Telefon: <code>+${phone}</code>`,
    `Dil: ${lang.toUpperCase()}`,
  ];
  if (email !== '-') lines.push(`E-poçt: ${escapeHtml(email)}`);
  if (company) lines.push(`Şirkət: ${escapeHtml(company)}`);
  if (projectType) lines.push(`Layihə: ${escapeHtml(projectType)}`);
  if (callbackLabel) lines.push(`Zəng vaxtı: <b>${escapeHtml(callbackLabel)}</b>`);
  if (products.length) {
    lines.push('', starred.length ? `<b>Müştərinin seçdikləri (${products.length}):</b>` : '<b>Məhsullar:</b>', ...products.map(p => `• <a href="${p.url}">${escapeHtml(p.code)}</a> ${escapeHtml(p.name)}`));
  }
  if (configSummary) lines.push('', '<b>Konfiqurasiya:</b>', escapeHtml(configSummary.slice(0, 700)));
  if (summary) lines.push('', '<b>Xülasə:</b>', escapeHtml(summary));
  else if (userMessage) lines.push('', '<b>Mesaj:</b>', escapeHtml(userMessage));
  const notified = await sendTelegram(lines.join('\n'), [
    { text: 'WhatsApp-da yaz', url: `https://wa.me/${phone}?text=${encodeURIComponent(greet)}` },
  ]);

  // 3) hand the customer a ready WhatsApp message to the consultant (optional follow-up)
  const wa = lang === 'ru'
    ? `Здравствуйте! Пишу с сайта Ecolife. Заявка №${short}.${products.length ? ' Интересуют: ' + products.map(p => p.code).join(', ') + '.' : ''} Меня зовут ${name}.`
    : `Salam! Ecolife saytından yazıram. Sorğu №${short}.${products.length ? ' Maraqlandığım məhsullar: ' + products.map(p => p.code).join(', ') + '.' : ''} Adım ${name}.`;

  // the lead is considered received if it is stored or the team was notified
  if (!saved && !notified) return res.status(502).json({ error: 'unavailable' });
  if (saved && sid) await linkLead(sid, id);
  const out = {
    ok: true,
    id,
    short,
    notified,
    whatsappUrl: `https://wa.me/${SALES_WHATSAPP()}?text=${encodeURIComponent(wa)}`,
    site: SITE_URL(),
  };
  recent.set(dedupeKey, { at: Date.now(), body: out });
  for (const [k, v] of recent) if (Date.now() - v.at > DEDUPE_MS) recent.delete(k);
  return res.status(200).json(out);
}
