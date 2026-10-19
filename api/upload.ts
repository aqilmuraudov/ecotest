import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Vercel serverless function: returns a short-lived presigned PUT URL for Cloudflare R2.
// Only authenticated admins (rows in public.admin_users) may request one.
// Server env: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_DOMAIN
// plus VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (already set for the frontend).

const MAX_BYTES = 50 * 1024 * 1024;

async function isAdmin(token: string): Promise<boolean> {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  const res = await fetch(`${url}/rest/v1/admin_users?select=user_id&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return false;
  const rows = await res.json();
  return Array.isArray(rows) && rows.length > 0;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_DOMAIN } = process.env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_DOMAIN) {
    return res.status(500).json({ error: 'R2 server environment is not configured.' });
  }

  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token || !(await isAdmin(token))) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const { filename, contentType, size, folder } = body as {
    filename?: string; contentType?: string; size?: number; folder?: string;
  };
  if (!filename || typeof size !== 'number' || size <= 0 || size > MAX_BYTES) {
    return res.status(400).json({ error: 'Invalid file (max 50 MB).' });
  }

  const ext = (filename.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) || 'bin';
  const base = (filename.lastIndexOf('.') > 0 ? filename.slice(0, filename.lastIndexOf('.')) : filename)
    .toLowerCase().replace(/[^a-z0-9_-]/g, '-').slice(0, 40) || 'upload';
  const safeFolder = (folder || 'products').toLowerCase().replace(/[^a-z0-9_/-]/g, '').replace(/\.\./g, '') || 'products';
  const key = `${safeFolder}/${base}-${Date.now()}.${ext}`;
  const type = contentType || 'application/octet-stream';

  const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
  });
  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key, ContentType: type }),
    { expiresIn: 300 }
  );

  const domain = R2_PUBLIC_DOMAIN.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  return res.status(200).json({ uploadUrl, publicUrl: `https://${domain}/${key}`, key, contentType: type });
}
