import { uploadFileToSupabase, getStorageBucketName } from './supabase';
import { uploadFileToCloudinary, isCloudinaryConfigured, CLOUDINARY_CLOUD_NAME } from './cloudinary';
import { uploadFileToR2, isR2Selected, R2_PUBLIC_DOMAIN } from './r2';

export type StorageProviderType = 'supabase' | 'cloudinary' | 'r2';

export function getActiveStorageProvider(): StorageProviderType {
  if (isR2Selected()) return 'r2';
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
  if (isR2Selected()) {
    const res = await uploadFileToR2(file, folder);
    return { ...res, provider: 'r2' };
  }

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
  if (isR2Selected()) {
    return {
      provider: 'r2',
      providerName: 'Cloudflare R2',
      bucketName: R2_PUBLIC_DOMAIN || 'R2',
      isReady: true
    };
  }

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
