import { supabase } from './supabase';

// Cloudflare R2 uploads go through /api/upload (presigned PUT), so no R2 secrets reach the browser.
// Enable with VITE_STORAGE_PROVIDER=r2.
export const R2_PUBLIC_DOMAIN = (import.meta.env?.VITE_R2_PUBLIC_DOMAIN as string | undefined) || '';

export function isR2Selected(): boolean {
  return (import.meta.env?.VITE_STORAGE_PROVIDER as string | undefined) === 'r2';
}

export async function uploadFileToR2(
  file: File,
  folder: string = 'products'
): Promise<{ success: boolean; url?: string; path?: string; error?: string }> {
  try {
    if (file.size > 50 * 1024 * 1024) {
      return { success: false, error: 'Faylın həcmi 50 MB-dan çox ola bilməz.' };
    }
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return { success: false, error: 'Yükləmək üçün admin kimi daxil olun.' };

    const contentType = file.type || 'application/octet-stream';
    const signRes = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ filename: file.name, contentType, size: file.size, folder }),
    });
    const sign = await signRes.json().catch(() => ({}));
    if (!signRes.ok) return { success: false, error: sign.error || `R2 icazə xətası (${signRes.status})` };

    const putRes = await fetch(sign.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': sign.contentType },
      body: file,
    });
    if (!putRes.ok) {
      return { success: false, error: `R2 yükləmə xətası (${putRes.status}). Bucket CORS ayarlarını yoxlayın.` };
    }
    return { success: true, url: sign.publicUrl, path: sign.key };
  } catch (err: any) {
    return { success: false, error: err?.message || 'R2 yükləmə xətası' };
  }
}
