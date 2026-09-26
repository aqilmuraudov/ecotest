/**
 * Cloudinary unsigned upload integration.
 *
 * This restores the original upload path: new product/blog/project images
 * are sent directly to Cloudinary (client-side, unsigned upload) instead of
 * Supabase Storage. Existing images already stored as Cloudinary URLs in
 * Supabase (in the `image`/`gallery` columns) are unaffected either way —
 * the app just renders whatever URL string is saved.
 *
 * Config is stored in localStorage so it can be changed from the Admin
 * Panel without a code edit (same pattern as getStorageBucketName/
 * setStorageBucketName in supabase.ts), defaulting to the values provided.
 */

const CLOUDINARY_CONFIG_KEY = 'ecolife_cloudinary_config';
const DEFAULT_CLOUD_NAME = 'sdektval';
const DEFAULT_UPLOAD_PRESET = 'ecolife_preset';

export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
}

export function getCloudinaryConfig(): CloudinaryConfig {
  try {
    const saved = localStorage.getItem(CLOUDINARY_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.cloudName && parsed?.uploadPreset) return parsed;
    }
  } catch {
    // fall through to defaults
  }
  return { cloudName: DEFAULT_CLOUD_NAME, uploadPreset: DEFAULT_UPLOAD_PRESET };
}

export function setCloudinaryConfig(config: CloudinaryConfig): void {
  try {
    localStorage.setItem(CLOUDINARY_CONFIG_KEY, JSON.stringify(config));
  } catch {
    // ignore storage errors (private mode, quota, etc.)
  }
}

/**
 * Upload a file directly to Cloudinary via an unsigned upload preset.
 * Mirrors the return shape of uploadFileToSupabase() in supabase.ts so
 * storage.ts can route between providers transparently.
 */
export async function uploadFileToCloudinary(
  file: File,
  folder: string = 'products'
): Promise<{ success: boolean; url?: string; path?: string; error?: string }> {
  try {
    if (file.size > 15 * 1024 * 1024) {
      return { success: false, error: 'Faylın həcmi 15 MB-dan çox ola bilməz.' };
    }

    const { cloudName, uploadPreset } = getCloudinaryConfig();
    if (!cloudName || !uploadPreset) {
      return { success: false, error: 'Cloudinary Cloud Name və ya Upload Preset təyin olunmayıb.' };
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', `ecolife/${folder}`);

    const resourceType = file.type.startsWith('video/') ? 'video' : 'image';
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      { method: 'POST', body: formData }
    );

    const data = await response.json();

    if (!response.ok) {
      const message: string = data?.error?.message || 'Cloudinary yükləmə xətası.';
      let hint = message;
      if (message.toLowerCase().includes('preset')) {
        hint = `Upload Preset "${uploadPreset}" tapılmadı və ya "Unsigned" rejimində deyil. Cloudinary panelində Settings -> Upload -> Upload presets bölməsindən yoxlayın.`;
      } else if (message.toLowerCase().includes('cloud')) {
        hint = `Cloud Name "${cloudName}" düzgün deyil. Cloudinary Dashboard-da Cloud Name-i yenidən yoxlayın.`;
      }
      return { success: false, error: hint };
    }

    return {
      success: true,
      url: data.secure_url,
      path: data.public_id
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Cloudinary yükləmə zamanı gözlənilməz xəta baş verdi.' };
  }
}
