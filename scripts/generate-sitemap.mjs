import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const siteUrl = 'https://ecolife.az';
const outputPath = path.resolve('public/sitemap.xml');
const staticPages = [
  ['/', 'weekly', '1.0'], ['/catalog', 'weekly', '0.9'], ['/projects', 'weekly', '0.8'],
  ['/solutions', 'monthly', '0.8'], ['/configurator', 'monthly', '0.8'], ['/blog', 'weekly', '0.7'],
  ['/about', 'monthly', '0.6'], ['/contact', 'monthly', '0.6'],
];

const xmlEscape = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const entry = (pathname, changefreq, priority, lastmod) => `  <url>\n    <loc>${siteUrl}${pathname}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;

let productEntries = [];
const apiUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
if (apiUrl && anonKey) {
  try {
    const response = await fetch(`${apiUrl}/rest/v1/products?select=slug,updated_at,archived&archived=eq.false`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const products = await response.json();
    productEntries = products
      .filter((product) => product.slug)
      .map((product) => entry(`/catalog/${encodeURIComponent(product.slug)}`, 'weekly', '0.7', product.updated_at?.slice(0, 10)));
  } catch (error) {
    console.warn(`[sitemap] Product URLs could not be refreshed: ${error.message}`);
  }
} else {
  console.warn('[sitemap] Supabase environment is unavailable; publishing static pages only.');
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${staticPages.map(([pathname, changefreq, priority]) => entry(xmlEscape(pathname), changefreq, priority)).join('\n')}\n${productEntries.join('\n')}\n</urlset>\n`;
await fs.writeFile(outputPath, xml, 'utf8');
console.log(`[sitemap] Wrote ${staticPages.length + productEntries.length} URLs.`);
