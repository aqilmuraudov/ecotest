import { uploadFileToR2, isR2Configured, getR2Config, R2Config } from './r2';
import { uploadFileToSupabase, getStorageBucketName } from './supabase';

export type StorageProviderType = 'r2' | 'supabase';

const ACTIVE_STORAGE_PROVIDER_KEY = 'ecolife_active_storage_provider';

/**
 * Get currently active storage provider ('r2' or 'supabase')
 * Defaults to 'r2' if R2 is configured, otherwise 'supabase'
 */
export function getActiveStorageProvider(): StorageProviderType {
  try {
    const saved = localStorage.getItem(ACTIVE_STORAGE_PROVIDER_KEY);
    if (saved === 'r2' || saved === 'supabase') {
      return saved;
    }
  } catch {}

  // Auto-detect: If R2 is configured, prefer R2
  if (isR2Configured()) {
    return 'r2';
  }
  return 'supabase';
}

/**
 * Set active storage provider
 */
export function setActiveStorageProvider(provider: StorageProviderType): void {
  try {
    localStorage.setItem(ACTIVE_STORAGE_PROVIDER_KEY, provider);
  } catch {}
}

/**
 * Unified file upload function that sends file to the active storage provider (Cloudflare R2 or Supabase)
 * with automatic fallback if the primary provider fails.
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
  const activeProvider = getActiveStorageProvider();

  // 1. Try Cloudflare R2 if active or configured
  if (activeProvider === 'r2') {
    if (!isR2Configured()) {
      // Fall back to Supabase if R2 not configured
      console.warn('[Storage] R2 is selected but not configured, falling back to Supabase...');
      const supRes = await uploadFileToSupabase(file, folder);
      return {
        ...supRes,
        provider: 'supabase'
      };
    }

    const r2Res = await uploadFileToR2(file, folder);
    if (r2Res.success && r2Res.url) {
      return {
        success: true,
        url: r2Res.url,
        path: r2Res.key || r2Res.path,
        provider: 'r2'
      };
    }

    // Return R2 error with clear context
    return {
      success: false,
      error: r2Res.error || 'Cloudflare R2 yükləmə xətası',
      provider: 'r2'
    };
  }

  // 2. Supabase Storage upload
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
  if (provider === 'r2') {
    const r2Conf = getR2Config();
    return {
      provider: 'r2',
      providerName: 'Cloudflare R2 Storage',
      bucketName: r2Conf.bucketName || 'ecolife',
      isReady: isR2Configured()
    };
  }
  return {
    provider: 'supabase',
    providerName: 'Supabase Storage',
    bucketName: getStorageBucketName(),
    isReady: true
  };
}
