import { uploadFileToSupabase, getStorageBucketName } from './supabase';

export type StorageProviderType = 'supabase';

/**
 * Get currently active storage provider ('supabase')
 */
export function getActiveStorageProvider(): StorageProviderType {
  return 'supabase';
}

/**
 * Set active storage provider
 */
export function setActiveStorageProvider(_provider: StorageProviderType): void {
  // Pure Supabase setup
}

/**
 * Unified file upload function that sends file to Supabase Storage
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
  return {
    provider: 'supabase',
    providerName: 'Supabase Storage',
    bucketName: getStorageBucketName(),
    isReady: true
  };
}

