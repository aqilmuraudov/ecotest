import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicDomain: string; // e.g. https://pub-xxxx.r2.dev or https://media.ecolife.az
  enabled: boolean;
}

const STORAGE_R2_CONFIG_KEY = 'ecolife_r2_storage_config';

export const DEFAULT_R2_CONFIG: R2Config = {
  accountId: (import.meta.env?.VITE_R2_ACCOUNT_ID as string) || '',
  accessKeyId: (import.meta.env?.VITE_R2_ACCESS_KEY_ID as string) || '',
  secretAccessKey: (import.meta.env?.VITE_R2_SECRET_ACCESS_KEY as string) || '',
  bucketName: (import.meta.env?.VITE_R2_BUCKET_NAME as string) || 'ecolife',
  publicDomain: (import.meta.env?.VITE_R2_PUBLIC_DOMAIN as string) || '',
  enabled: true
};

/**
 * Retrieve current Cloudflare R2 configuration
 * (LocalStorage takes precedence over .env for live editing in Admin Panel)
 */
export function getR2Config(): R2Config {
  try {
    const raw = localStorage.getItem(STORAGE_R2_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        accountId: parsed.accountId || DEFAULT_R2_CONFIG.accountId,
        accessKeyId: parsed.accessKeyId || DEFAULT_R2_CONFIG.accessKeyId,
        secretAccessKey: parsed.secretAccessKey || DEFAULT_R2_CONFIG.secretAccessKey,
        bucketName: parsed.bucketName || DEFAULT_R2_CONFIG.bucketName || 'ecolife',
        publicDomain: parsed.publicDomain || DEFAULT_R2_CONFIG.publicDomain,
        enabled: parsed.enabled !== undefined ? parsed.enabled : true
      };
    }
  } catch (e) {
    console.warn('Failed to parse R2 config from localStorage:', e);
  }
  return { ...DEFAULT_R2_CONFIG };
}

/**
 * Save Cloudflare R2 configuration to LocalStorage
 */
export function saveR2Config(config: Partial<R2Config>): R2Config {
  const current = getR2Config();
  const updated: R2Config = {
    ...current,
    ...config,
    bucketName: (config.bucketName || current.bucketName || 'ecolife').trim(),
    publicDomain: (config.publicDomain || current.publicDomain || '').trim().replace(/\/+$/, '')
  };
  try {
    localStorage.setItem(STORAGE_R2_CONFIG_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save R2 config to localStorage:', e);
  }
  return updated;
}

/**
 * Check if Cloudflare R2 has the minimum required credentials configured
 */
export function isR2Configured(): boolean {
  const config = getR2Config();
  return !!(
    config.enabled &&
    config.accountId?.trim() &&
    config.accessKeyId?.trim() &&
    config.secretAccessKey?.trim() &&
    config.bucketName?.trim()
  );
}

/**
 * Instantiate an AWS S3 client configured for Cloudflare R2 endpoint
 */
export function getR2Client(customConfig?: Partial<R2Config>): S3Client | null {
  const config = { ...getR2Config(), ...customConfig };
  
  if (!config.accountId || !config.accessKeyId || !config.secretAccessKey) {
    return null;
  }

  const endpoint = `https://${config.accountId.trim()}.r2.cloudflarestorage.com`;

  return new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId: config.accessKeyId.trim(),
      secretAccessKey: config.secretAccessKey.trim()
    }
  });
}

/**
 * Upload a File or Blob directly to Cloudflare R2 bucket
 */
export async function uploadFileToR2(
  file: File,
  folder: string = 'products',
  customConfig?: Partial<R2Config>
): Promise<{ success: boolean; url?: string; path?: string; key?: string; error?: string }> {
  try {
    const config = { ...getR2Config(), ...customConfig };

    if (!config.accountId || !config.accessKeyId || !config.secretAccessKey || !config.bucketName) {
      return {
        success: false,
        error: 'Cloudflare R2 parametrləri (Account ID, Access Key, Secret Key, Bucket Name) tam doldurulmayıb.'
      };
    }

    // Validate file size (under 50MB for R2 direct upload)
    if (file.size > 50 * 1024 * 1024) {
      return { success: false, error: 'Faylın həcmi 50 MB-dan çox ola bilməz.' };
    }

    const client = getR2Client(config);
    if (!client) {
      return { success: false, error: 'Cloudflare R2 Client yaradıla bilmədi.' };
    }

    // Sanitize file name
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'upload';
    const cleanName = baseName.toLowerCase().replace(/[^a-z0-9_-]/g, '-').substring(0, 40);
    const timestamp = Date.now();
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
    const key = cleanFolder ? `${cleanFolder}/${cleanName}-${timestamp}.${ext}` : `${cleanName}-${timestamp}.${ext}`;

    // Convert file to Uint8Array for reliable browser upload across all environments
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: config.bucketName.trim(),
      Key: key,
      Body: uint8Array,
      ContentType: file.type || 'application/octet-stream',
      CacheControl: 'public, max-age=31536000, immutable'
    });

    await client.send(command);

    // Build public URL
    let publicUrl = '';
    if (config.publicDomain) {
      const base = config.publicDomain.trim().replace(/\/+$/, '');
      publicUrl = `${base}/${key}`;
    } else {
      // Fallback: If no public domain or custom domain configured, warn or use standard r2.dev pattern
      publicUrl = `https://${config.bucketName.trim()}.${config.accountId.trim()}.r2.cloudflarestorage.com/${key}`;
    }

    return {
      success: true,
      url: publicUrl,
      path: key,
      key
    };
  } catch (err: any) {
    console.error('Cloudflare R2 upload error:', err);

    let errorMsg = err?.message || 'Cloudflare R2-ə yükləmə zamanı xəta baş verdi.';

    if (err?.name === 'TypeError' && err?.message?.includes('Failed to fetch')) {
      errorMsg = 'Cloudflare R2 CORS xətası: Zəhmət olmasa Cloudflare panelində R2 Bucket -> Settings -> CORS Policy bölməsinə icazələri əlavə edin.';
    } else if (err?.name === 'InvalidAccessKeyId' || err?.Code === 'InvalidAccessKeyId') {
      errorMsg = 'Cloudflare R2 Access Key ID və ya Secret Access Key yanlışdır.';
    } else if (err?.name === 'NoSuchBucket' || err?.Code === 'NoSuchBucket') {
      errorMsg = `"${customConfig?.bucketName || getR2Config().bucketName}" adlı R2 Bucket tapılmadı. Adı dəqiqləşdirin.`;
    }

    return { success: false, error: errorMsg };
  }
}

/**
 * Test connection to Cloudflare R2 by listing objects in the bucket
 */
export async function testR2Connection(
  customConfig?: Partial<R2Config>
): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    const config = { ...getR2Config(), ...customConfig };

    if (!config.accountId?.trim() || !config.accessKeyId?.trim() || !config.secretAccessKey?.trim() || !config.bucketName?.trim()) {
      return {
        success: false,
        message: 'Account ID, Access Key ID, Secret Key və Bucket Name mütləq daxil edilməlidir.'
      };
    }

    const client = getR2Client(config);
    if (!client) {
      return { success: false, message: 'R2 Client başladılmadı.' };
    }

    const command = new ListObjectsV2Command({
      Bucket: config.bucketName.trim(),
      MaxKeys: 5
    });

    const response = await client.send(command);

    return {
      success: true,
      message: `Cloudflare R2 (${config.bucketName}) ilə əlaqə uğurla quruldu! Bucket aktivdir.`,
      details: {
        bucket: config.bucketName,
        keyCount: response.KeyCount || 0
      }
    };
  } catch (err: any) {
    console.error('Test R2 Connection error:', err);

    let msg = err?.message || 'Bağlantı xətası';

    if (err?.name === 'TypeError' && err?.message?.includes('Failed to fetch')) {
      msg = 'CORS Xətası: Brauzerdən Cloudflare R2-ə birbaşa sorğu göndərmək üçün Cloudflare Dashboard -> R2 -> Bucket -> Settings -> CORS bölməsinə CORS siyasətini əlavə etməlisiniz.';
    } else if (err?.name === 'InvalidAccessKeyId' || err?.Code === 'InvalidAccessKeyId') {
      msg = 'Access Key ID və ya Secret Access Key yanlışdır.';
    } else if (err?.name === 'NoSuchBucket' || err?.Code === 'NoSuchBucket') {
      msg = `Bucket tapılmadı. "${customConfig?.bucketName || getR2Config().bucketName}" adının düzgünlüyünü yoxlayın.`;
    }

    return { success: false, message: msg };
  }
}

/**
 * Standard CORS configuration snippet for Cloudflare R2 Bucket
 */
export const R2_CORS_POLICY_JSON = `[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "HEAD", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]`;
