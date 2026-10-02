export const DEFAULT_CLOUDINARY_CLOUD_NAME = 'sdektval';
export const DEFAULT_CLOUDINARY_UPLOAD_PRESET = 'ecolife_preset';

const ENV_CLOUD_NAME = import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const ENV_UPLOAD_PRESET = import.meta.env?.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

export const CLOUDINARY_CLOUD_NAME =
  ENV_CLOUD_NAME ||
  (typeof window !== 'undefined' ? localStorage.getItem('cloudinary_cloud_name') : null) ||
  DEFAULT_CLOUDINARY_CLOUD_NAME;

export const CLOUDINARY_UPLOAD_PRESET =
  ENV_UPLOAD_PRESET ||
  (typeof window !== 'undefined' ? localStorage.getItem('cloudinary_upload_preset') : null) ||
  DEFAULT_CLOUDINARY_UPLOAD_PRESET;

export function isCloudinaryConfigured(): boolean {
  return Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET);
}

export function saveCloudinaryConfig(cloudName: string, uploadPreset: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cloudinary_cloud_name', cloudName.trim());
    localStorage.setItem('cloudinary_upload_preset', uploadPreset.trim());
    setTimeout(() => window.location.reload(), 500);
  }
}

export async function uploadFileToCloudinary(file: File, folder: string = 'ecolife'): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!isCloudinaryConfigured()) {
    return { success: false, error: 'Cloudinary API mlumatlar daxil edilmyib.' };
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);

    const response = await fetch("https://api.cloudinary.com/v1_1/" + CLOUDINARY_CLOUD_NAME + "/auto/upload", {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error?.message || 'Cloudinary yükləmə xətası' };
    }

    return { 
      success: true, 
      url: data.secure_url 
    };
  } catch (err: any) {
    console.error('Cloudinary upload exception:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}
