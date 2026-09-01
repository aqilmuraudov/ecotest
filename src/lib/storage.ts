import { uploadFileToSupabase, getStorageBucketName } from './supabase';
import { uploadFileToCloudinary, isCloudinaryConfigured, CLOUDINARY_CLOUD_NAME } from './cloudinary';

export type StorageProviderType = 'supabase' | 'cloudinary';

export function getActiveStorageProvider(): StorageProviderType {
  return isCloudinaryConfigured() ? 'cloudinary' : 'supabase';
}

export function setActiveStorageProvider(_provider: StorageProviderType): void {
  // handled by configuration
}

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
  if (isCloudinaryConfigured()) {
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

export function getStorageDisplayInfo(): {
  provider: StorageProviderType;
  providerName: string;
  bucketName: string;
  isReady: boolean;
} {
  if (isCloudinaryConfigured()) {
    return {
      provider: 'cloudinary',
      providerName: 'Cloudinary CDN',
      bucketName: CLOUDINARY_CLOUD_NAME,
      isReady: true
    };
  }

  return {
    provider: 'supabase',
    providerName: 'Supabase Storage',
    bucketName: getStorageBucketName(),
    isReady: true
  };
}
