import { uploadFileToSupabase, getStorageBucketName } from './supabase';
import { uploadFileToCloudinary, getCloudinaryConfig } from './cloudinary';

export type StorageProviderType = 'supabase' | 'cloudinary';

const STORAGE_PROVIDER_KEY = 'ecolife_storage_provider';

/**
 * Get currently active storage provider ('cloudinary' | 'supabase').
 * Defaults to 'cloudinary' — the original working setup — unless the
 * admin explicitly switched it from the Admin Panel.
 */
export function getActiveStorageProvider(): StorageProviderType {
  try {
    const saved = localStorage.getItem(STORAGE_PROVIDER_KEY);
    if (saved === 'supabase' || saved === 'cloudinary') return saved;
  } catch {
    // ignore, fall back to default below
  }
  return 'cloudinary';
}

/**
 * Set active storage provider
 */
export function setActiveStorageProvider(provider: StorageProviderType): void {
  try {
    localStorage.setItem(STORAGE_PROVIDER_KEY, provider);
  } catch {
    // ignore storage errors
  }
}

/**
 * Unified file upload function. Routes to Cloudinary or Supabase Storage
 * depending on the active provider — every caller (product gallery, blog
 * cover, project cover, file manager) goes through this single function,
 * so switching providers here changes the whole app at once.
 */
export async function uploadFile(
  file: File,
  folder: string = 'products'
): Promise<{
  success: boolean;
  url?: string;
  path?: string;
  provider: StorageProviderType;
  error?: string;
}> {
  const provider = getActiveStorageProvider();

  if (provider === 'cloudinary') {
    const res = await uploadFileToCloudinary(file, folder);
    return {
      ...res,
      provider: 'cloudinary'
    };
  }

  const supRes = await uploadFileToSupabase(file, folder);
  return {
    ...supRes,
    provider: 'supabase'
  };
}

/**
 * Helper to display current active storage badge/info in UI
 */
export function getStorageDisplayInfo(): {
  provider: StorageProviderType;
  providerName: string;
  bucketName: string;
  isReady: boolean;
} {
  const provider = getActiveStorageProvider();

  if (provider === 'cloudinary') {
    const { cloudName, uploadPreset } = getCloudinaryConfig();
    return {
      provider: 'cloudinary',
      providerName: 'Cloudinary',
      bucketName: `${cloudName} / ${uploadPreset}`,
      isReady: Boolean(cloudName && uploadPreset)
    };
  }

  return {
    provider: 'supabase',
    providerName: 'Supabase Storage',
    bucketName: getStorageBucketName(),
    isReady: true
  };
}
