import { env } from './_lib/core.js';

// Temporary diagnostics for the AI seller set-up: reports only whether each variable is present (never the value).
export default async function handler(_req: any, res: any) {
  const names = ['AI_BASE_URL', 'AI_API_KEY', 'AI_MODEL_LIGHT', 'AI_MODEL_THINK', 'AI_MODEL_FALLBACK', 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID', 'SALES_WHATSAPP', 'SITE_URL', 'VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const present: Record<string, boolean> = {};
  for (const n of names) present[n] = env(n).length > 0;
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ env: process.env.VERCEL_ENV || 'local', present });
}
