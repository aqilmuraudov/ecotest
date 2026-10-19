import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';

/**
 * Runs the Vercel-style handlers in /api locally (npm run dev), so the chatbot and the
 * lead pipeline can be tested without deploying. Production uses Vercel's own runtime.
 */
function localApi(): Plugin {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        if (!url.startsWith('/api/')) return next();
        const name = url.split('?')[0].replace(/^\/api\//, '').replace(/\/+$/, '');
        if (!/^[a-z0-9-]+$/i.test(name)) return next();
        try {
          const mod = await server.ssrLoadModule(`/api/${name}.ts`);
          const chunks: Buffer[] = [];
          for await (const c of req) chunks.push(c as Buffer);
          const raw = Buffer.concat(chunks).toString('utf8');
          (req as any).body = raw && String(req.headers['content-type'] || '').includes('json') ? JSON.parse(raw) : raw || {};
          (res as any).status = (code: number) => { res.statusCode = code; return res; };
          (res as any).json = (obj: unknown) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)); };
          await mod.default(req, res);
        } catch (e: any) {
          console.error(`[local-api] /api/${name} failed:`, e?.message || e);
          if (!res.headersSent) { res.statusCode = 500; res.setHeader('Content-Type', 'application/json'); }
          res.end(JSON.stringify({ error: 'server_error' }));
        }
      });
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  // expose .env.local to the local /api handlers (Vercel injects these in production)
  for (const [k, v] of Object.entries(env)) if (process.env[k] === undefined) process.env[k] = v;
  return {
    base: '/',
    plugins: [react(), tailwindcss(), localApi()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-supabase': ['@supabase/supabase-js'],
            'vendor-icons': ['lucide-react'],
          },
        },
      },
    },
    server: {
      // Proxy /storage to Supabase public bucket for local development
      proxy: {
        '/storage': {
          target: `${env.VITE_SUPABASE_URL}/storage/v1/object/public/ecolife`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/storage/, ''),
        },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
