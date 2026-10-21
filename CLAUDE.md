# ecolife.az

Architectural LED lighting company site (Baku). The owner writes Azerbaijani; reply in Azerbaijani, keep code/comments in English. Site languages: AZ, RU, EN (`Language` in `src/types.ts`; static texts in `src/data/translations.ts`, DB content as `{az, ru, en}` json).

## Stack
Vite + React 19 + TypeScript + Tailwind v4 + Motion. Supabase (REST, Auth, RLS). Vercel (static + `api/*.ts` Node functions, ESM imports end in `.js`). Cloudflare Turnstile, R2 images, Telegram Bot. Deploy = push to `main` (Vercel builds). Checks: `npx tsc --noEmit -p .` and `npm run build`.

## Layout
- `src/pages`, `src/components` (public site), `src/components/admin` + `src/pages/AdminPage.tsx` (admin, route `/manage`)
- `src/context/DataContext.tsx` all Supabase CRUD (errors are returned, RLS filtered deletes are checked)
- `src/index.css` design tokens (`--ed-*`), light theme = `html.light`; `.ed-dark-scope` keeps a surface dark in light theme (photo overlays, simulators)
- `src/admin-light.css` light palette for the admin (scoped `html.light .admin-root`), `src/components/chat/chat-light.css` same for the chat widget
- `api/chat.ts` AI sales chatbot (streaming SSE), `api/lead.ts` single lead pipeline, `api/vision.ts` room-photo analysis, `api/admin-ai.ts` AI settings admin API, `api/track.ts` events
- `api/_lib/`: `ai.ts` (prompt, tools, failover, calculator), `aiconfig.ts` (runtime provider/model config + AES-256-GCM key storage), `core.ts` (catalogue, Turnstile, rate limit, Telegram), `calc.ts`, `knowledge.ts`, `log.ts`

## Key behaviour (do not break)
- Chatbot (AISeller, AZ/RU/EN) always answers in the current site language, also after a mid-chat switch (`REPLY_IN` note on the last turn + `wrongLanguage` guard that fails over to the next model, `api/_lib/ai.ts`). It never states prices; hands leads to sales via the form -> Supabase `inquiries` + Telegram + WhatsApp.
- Every inquiry form posts to `/api/lead` with a `source`: ai-chat, product, configurator, project, contact-form, contact-page. Label + icon is the Telegram headline and the inquiry `subject`. Only name + phone are required; email/company are gone.
- AI providers: Groq is the primary (fast); CleanAPIs and Gonka are fallbacks. Config lives in Supabase `ai_settings` (edited in admin "AI Assistent"), keys encrypted with `AI_SECRETS_KEY` (Vercel env only). Env vars (`GROQ_API_KEY`, `CLEAN_API_KEY`/`VISION_API_KEY`, `AI_API_KEY`) are the fallback. Reasoning effort per model family is in `src/components/admin/reasoning.ts` (Groq qwen: none; gpt-oss: low+).
- Turnstile is enforced on chat, lead and admin login. Never bypass it for tests; test locally with mocks.
- Supabase project id `hpdmoomzuyxnzszywbxh`. Anon cannot INSERT `inquiries`; the server uses `SUPABASE_SERVICE_ROLE_KEY`. `ai_*` tables have RLS with no policies (service role only).
- Themes: never hard-code dark hex in public components; use tokens (`text-ivory`, `text-soft`, `bg-[var(--ed-bg-2)]`, `text-amber-warm`). Text over photos goes inside `.ed-dark-scope`.
- Production-only failure seen once: stale lazy chunk after deploy -> blank page. Handled by `src/utils/lazyRetry.ts` + `ErrorBoundary`.

## Working notes
- Windows + Git Bash/PowerShell. Python is handy for binary-safe multi-line edits (files may be CRLF).
- The preview pane runs hidden: disable CSS transitions when auditing colours.
- Env files: `.env.local` (not committed) holds local keys; the service-role key is NOT local.
