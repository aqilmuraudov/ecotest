import { env, rateLimit, clientIp, sendTelegram, escapeHtml, loadCatalog, SALES_WHATSAPP, SITE_URL } from './_lib/core.js';
import { summarize, type ChatMsg } from './_lib/ai.js';

// POST /api/lead  { name, phone, message?, source, lang, products?: string[], transcript?: ChatMsg[], consent, website }
// One pipeline for every request: validate -> save to Supabase (inquiries) -> notify the sales team on Telegram.

const SOURCES: Record<string, string> = {
  'ai-chat': 'AI söhbət',
  'contact-form': 'Əlaqə forması',
  product: 'Məhsul səhifəsi',
  configurator: 'Konfiqurator',
};

function normalizePhone(input: string): string | null {
  const d = input.replace(/\D/g, '');
  let full = d;
  if (d.length === 9) full = '994' + d; // 50 450 70 07
  else if (d.length === 10 && d.startsWith('0')) full = '994' + d.slice(1); // 050 450 70 07
  return full.length >= 11 && full.length <= 15 ? full : null;
}

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

  const name = String(body.name || '').trim().slice(0, 80);
  const phone = normalizePhone(String(body.phone || ''));
  const lang: 'az' | 'ru' = body.lang === 'ru' ? 'ru' : 'az';
  if (name.length < 2) return res.status(400).json({ error: 'name' });
  if (!phone) return res.status(400).json({ error: 'phone' });
  if (body.consent !== true) return res.status(400).json({ error: 'consent' });

  const sourceKey = SOURCES[String(body.source)] ? String(body.source) : 'contact-form';
  const history: ChatMsg[] = (Array.isArray(body.transcript) ? body.transcript : [])
    .map((m: any) => ({ role: m?.role === 'assistant' ? 'assistant' : 'user', content: String(m?.content ?? '').slice(0, 1200) }) as ChatMsg)
    .filter((m: ChatMsg) => m.content.trim())
    .slice(-20);

  // products referenced by the customer/AI (validated against the real catalogue)
  const catalog = await loadCatalog();
  const wanted: string[] = Array.isArray(body.products) ? body.products.map(String).slice(0, 5) : [];
  const products = wanted.map(c => catalog.find(i => i.code.toLowerCase() === c.toLowerCase())).filter(Boolean) as typeof catalog;

  const userMessage = String(body.message || '').trim().slice(0, 1500);
  const summary = history.length ? await summarize(history) : '';

  const id = `inq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const short = id.slice(-4).toUpperCase();
  const transcriptText = history.map(m => `${m.role === 'user' ? 'Müştəri' : 'AISeller'}: ${m.content}`).join('\n').slice(0, 9000);

  // 1) save (public INSERT is allowed by RLS for status = 'new')
  let saved = false;
  const sbUrl = env('VITE_SUPABASE_URL');
  const sbKey = env('VITE_SUPABASE_ANON_KEY');
  if (sbUrl && sbKey) {
    const row = {
      id,
      name,
      email: '-',
      phone: '+' + phone,
      subject: SOURCES[sourceKey],
      message: (summary || userMessage || 'Müştəri sorğu göndərdi').slice(0, 4900),
      product_code: products[0]?.code || null,
      product_name: products[0]?.name?.slice(0, 290) || null,
      product_category: products[0]?.categoryName.az || null,
      config_summary: transcriptText || null,
      status: 'new',
      user_agent: String(req.headers?.['user-agent'] || '').slice(0, 250),
    };
    try {
      const r = await fetch(`${sbUrl}/rest/v1/inquiries`, {
        method: 'POST',
        headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
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
  if (products.length) {
    lines.push('', '<b>Məhsullar:</b>', ...products.map(p => `• <a href="${p.url}">${escapeHtml(p.code)}</a> ${escapeHtml(p.name)}`));
  }
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
  return res.status(200).json({
    ok: true,
    id,
    short,
    notified,
    whatsappUrl: `https://wa.me/${SALES_WHATSAPP()}?text=${encodeURIComponent(wa)}`,
    site: SITE_URL(),
  });
}
