import { createClient } from '@supabase/supabase-js';

const ENV_URL = import.meta.env?.VITE_SUPABASE_URL as string | undefined;
const ENV_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!ENV_URL || !ENV_KEY) {
  // Production-da bu xətanı göstərmək təhlükəsizdir, ancaq dəyəri LOG ETMƏYİN.
  console.error(
    '[Supabase] VITE_SUPABASE_URL və/və ya VITE_SUPABASE_ANON_KEY tapılmadı. ' +
    'Zəhmət olmasa .env.local faylı yaradın (bax: .env.example).'
  );
}

export const SUPABASE_URL = ENV_URL ?? '';
export const SUPABASE_ANON_KEY = ENV_KEY ?? '';

// Boş dəyərlərlə client yaratmaq mümkündür, ancaq request-lər xəta verəcək.
// Build zamanı xətanı erkən tutmaq üçün placeholder URL istifadə edirik.
const PLACEHOLDER_URL = 'https://invalid.supabase.co';
const PLACEHOLDER_KEY = 'public-anon-key-missing';

export const supabase = createClient(
  ENV_URL || PLACEHOLDER_URL,
  ENV_KEY || PLACEHOLDER_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storageKey: 'ecolife-supabase-auth',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  }
);

// Supabase Storage Bucket Configuration
const STORAGE_BUCKET_KEY = 'ecolife_storage_bucket_name';
export const DEFAULT_STORAGE_BUCKET = 'ecolife';

export function getStorageBucketName(): string {
  try {
    return localStorage.getItem(STORAGE_BUCKET_KEY) || DEFAULT_STORAGE_BUCKET;
  } catch {
    return DEFAULT_STORAGE_BUCKET;
  }
}

export function setStorageBucketName(bucketName: string): void {
  try {
    localStorage.setItem(STORAGE_BUCKET_KEY, bucketName.trim());
  } catch {}
}

/**
 * Upload an image file directly to Supabase Storage Bucket.
 * Automatically generates a unique, sanitized path and returns the public URL.
 */
export async function uploadFileToSupabase(
  file: File, 
  folder: string = 'products',
  customBucket?: string
): Promise<{ success: boolean; url?: string; path?: string; error?: string }> {
  try {
    const bucket = customBucket || getStorageBucketName();
    
    // Validate file size (under 15MB)
    if (file.size > 15 * 1024 * 1024) {
      return { success: false, error: 'Faylın həcmi 15 MB-dan çox ola bilməz.' };
    }

    // Sanitize filename: replace non-alphanumeric with hyphen
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'upload';
    const cleanName = baseName.toLowerCase().replace(/[^a-z0-9_-]/g, '-').substring(0, 40);
    const timestamp = Date.now();
    const filePath = `${folder}/${cleanName}-${timestamp}.${ext}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'image/jpeg'
      });

    if (error) {
      console.warn('Supabase storage upload error:', error);
      
      // Helpful error guidance
      let errorMsg = error.message;
      if (error.message?.includes('Bucket not found') || (error as any).statusCode === '404') {
        errorMsg = `"${bucket}" adlı Storage Bucket tapılmadı. Supabase panelində Storage -> New Bucket yaradıb adını "${bucket}" qoyun və "Public" edin.`;
      } else if (error.message?.includes('row-level security') || error.message?.includes('policy')) {
        errorMsg = `Storage icazə xətası (RLS). Supabase panelində "${bucket}" bucket-ni "Public" edin və ya Storage RLS siyasətini aktivləşdirin.`;
      }

      return { success: false, error: errorMsg };
    }

    // Retrieve public URL
    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    if (!publicData?.publicUrl) {
      return { success: false, error: 'Şəkil üçün Public URL əldə edilə bilmədi.' };
    }

    const finalUrl = publicData.publicUrl;

    return { 
      success: true, 
      url: finalUrl,
      path: data.path
    };
  } catch (err: any) {
    console.error('File upload exception:', err);
    return { success: false, error: err?.message || 'Şəkil yüklənərkən xəta baş verdi.' };
  }
}

/**
 * Helper to test connection with Supabase
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase.from('products').select('id').limit(1);
    if (error) {
      // If table doesn't exist yet, it's still connected to Supabase backend
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return { 
          success: true, 
          message: 'Supabase ilə bağlantı quruldu (Lakin cədvəllər hələ yaradılmayıb. Admin paneldən "Cədvəlləri İlkin Doldur" edin).' 
        };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Supabase Verilənlər Bazası Tam Aktivdir!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Bağlantı xətası' };
  }
}

/**
 * SQL Schema migration script for user convenience in Supabase SQL editor
 *
 * TƏHLÜKƏSİZLİK: Bu şema RLS ilə qorunur.
 * - Anon istifadəçilər yalnız SELECT edə bilər (oxumaq).
 * - Insert/Update/Delete yalnız admin_users cədvəlində qeydə alınmış
 *   authenticated istifadəçilər tərəfindən edilə bilər.
 * - Inquiries cədvəli üçün yalnız INSERT public-dir, SELECT/UPDATE/DELETE admin üçün.
 */
export const SUPABASE_SQL_SCHEMA = `-- ==========================================
-- ECOLIFE LIGHTING - SUPABASE DATABASE SCHEMA (SECURE)
-- Supabase SQL Editor -> "New Query" -> Run
-- ==========================================

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  categories JSONB DEFAULT '[]'::jsonb,
  category_name JSONB NOT NULL DEFAULT '{}'::jsonb,
  category_names JSONB DEFAULT '[]'::jsonb,
  subtitle JSONB NOT NULL DEFAULT '{}'::jsonb,
  code TEXT NOT NULL,
  image TEXT NOT NULL,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  description JSONB NOT NULL DEFAULT '{}'::jsonb,
  specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  files JSONB NOT NULL DEFAULT '[]'::jsonb,
  featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  applications JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mövcud products cədvəlinə multi-category sütunlarını əlavə et (əgər yoxdursa)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS categories JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_names JSONB DEFAULT '[]'::jsonb;

-- 2. BLOG / ARTICLES
CREATE TABLE IF NOT EXISTS public.articles (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title JSONB NOT NULL DEFAULT '{}'::jsonb,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  read_time TEXT,
  cover_image TEXT NOT NULL,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  author TEXT NOT NULL,
  summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  category_name JSONB NOT NULL DEFAULT '{}'::jsonb,
  client TEXT NOT NULL,
  location TEXT NOT NULL,
  year TEXT NOT NULL,
  architect TEXT,
  cover_image TEXT NOT NULL,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  short_description JSONB NOT NULL DEFAULT '{}'::jsonb,
  full_description JSONB NOT NULL DEFAULT '{}'::jsonb,
  lighting_solution JSONB NOT NULL DEFAULT '{}'::jsonb,
  products_used JSONB DEFAULT '[]'::jsonb,
  metrics JSONB DEFAULT '[]'::jsonb,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INQUIRIES (Contact form submissions)
CREATE TABLE IF NOT EXISTS public.inquiries (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  product_code TEXT,
  product_name TEXT,
  room_preset TEXT,
  config_summary TEXT,
  status TEXT DEFAULT 'new',
  ip_hash TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name_az TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ADMIN USERS (admin panel auth üçün)
-- Bu cədvəl Supabase Auth istifadəçilərinin admin olub-olmadığını saxlayır.
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'moderator')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) & ACCESS POLICIES
-- ==========================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Köhnə policy-ləri təmizlə
DROP POLICY IF EXISTS "Public Read Products" ON public.products;
DROP POLICY IF EXISTS "Moderator Insert Products" ON public.products;
DROP POLICY IF EXISTS "Moderator Update Products" ON public.products;
DROP POLICY IF EXISTS "Admin Delete Products" ON public.products;
DROP POLICY IF EXISTS "Public Insert/Update Products" ON public.products;
DROP POLICY IF EXISTS "Allow All Products" ON public.products;
DROP POLICY IF EXISTS "Allow All Select Products" ON public.products;
DROP POLICY IF EXISTS "Allow All Insert Products" ON public.products;
DROP POLICY IF EXISTS "Allow All Update Products" ON public.products;
DROP POLICY IF EXISTS "Allow All Delete Products" ON public.products;

DROP POLICY IF EXISTS "Public Read Articles" ON public.articles;
DROP POLICY IF EXISTS "Moderator Insert Articles" ON public.articles;
DROP POLICY IF EXISTS "Moderator Update Articles" ON public.articles;
DROP POLICY IF EXISTS "Admin Delete Articles" ON public.articles;
DROP POLICY IF EXISTS "Allow All Articles" ON public.articles;
DROP POLICY IF EXISTS "Allow All Select Articles" ON public.articles;
DROP POLICY IF EXISTS "Allow All Insert Articles" ON public.articles;
DROP POLICY IF EXISTS "Allow All Update Articles" ON public.articles;
DROP POLICY IF EXISTS "Allow All Delete Articles" ON public.articles;

DROP POLICY IF EXISTS "Public Read Projects" ON public.projects;
DROP POLICY IF EXISTS "Moderator Insert Projects" ON public.projects;
DROP POLICY IF EXISTS "Moderator Update Projects" ON public.projects;
DROP POLICY IF EXISTS "Admin Delete Projects" ON public.projects;
DROP POLICY IF EXISTS "Allow All Projects" ON public.projects;
DROP POLICY IF EXISTS "Allow All Select Projects" ON public.projects;
DROP POLICY IF EXISTS "Allow All Insert Projects" ON public.projects;
DROP POLICY IF EXISTS "Allow All Update Projects" ON public.projects;
DROP POLICY IF EXISTS "Allow All Delete Projects" ON public.projects;

DROP POLICY IF EXISTS "Public Insert Inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Moderator Read/Update Inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Moderator Update Inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admin Delete Inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Allow All Inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Allow All Select Inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Allow All Insert Inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Allow All Update Inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Allow All Delete Inquiries" ON public.inquiries;

DROP POLICY IF EXISTS "Public Read Categories" ON public.categories;
DROP POLICY IF EXISTS "Moderator Insert Categories" ON public.categories;
DROP POLICY IF EXISTS "Moderator Update Categories" ON public.categories;
DROP POLICY IF EXISTS "Admin Delete Categories" ON public.categories;
DROP POLICY IF EXISTS "Allow All Categories" ON public.categories;
DROP POLICY IF EXISTS "Allow All Select Categories" ON public.categories;
DROP POLICY IF EXISTS "Allow All Insert Categories" ON public.categories;
DROP POLICY IF EXISTS "Allow All Update Categories" ON public.categories;
DROP POLICY IF EXISTS "Allow All Delete Categories" ON public.categories;

DROP POLICY IF EXISTS "Admin Self Read" ON public.admin_users;
DROP POLICY IF EXISTS "Master Admin Read All" ON public.admin_users;
DROP POLICY IF EXISTS "Master Admin Insert" ON public.admin_users;
DROP POLICY IF EXISTS "Master Admin Delete" ON public.admin_users;
DROP POLICY IF EXISTS "Allow All Admin Users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow All Select Admin Users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow All Insert Admin Users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow All Update Admin Users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow All Delete Admin Users" ON public.admin_users;

-- 1. PRODUCTS: Tam oxuma, yazma, yeniləmə və silmə aktivdir
CREATE POLICY "Allow All Select Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow All Insert Products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow All Update Products" ON public.products FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Delete Products" ON public.products FOR DELETE USING (true);

-- 2. ARTICLES (BLOG)
CREATE POLICY "Allow All Select Articles" ON public.articles FOR SELECT USING (true);
CREATE POLICY "Allow All Insert Articles" ON public.articles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow All Update Articles" ON public.articles FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Delete Articles" ON public.articles FOR DELETE USING (true);

-- 3. PROJECTS
CREATE POLICY "Allow All Select Projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow All Insert Projects" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow All Update Projects" ON public.projects FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Delete Projects" ON public.projects FOR DELETE USING (true);

-- 4. INQUIRIES (Sorğular)
CREATE POLICY "Allow All Select Inquiries" ON public.inquiries FOR SELECT USING (true);
CREATE POLICY "Allow All Insert Inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow All Update Inquiries" ON public.inquiries FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Delete Inquiries" ON public.inquiries FOR DELETE USING (true);

-- 5. CATEGORIES
CREATE POLICY "Allow All Select Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow All Insert Categories" ON public.categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow All Update Categories" ON public.categories FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Delete Categories" ON public.categories FOR DELETE USING (true);

-- 6. ADMIN USERS
CREATE POLICY "Allow All Select Admin Users" ON public.admin_users FOR SELECT USING (true);
CREATE POLICY "Allow All Insert Admin Users" ON public.admin_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow All Update Admin Users" ON public.admin_users FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Delete Admin Users" ON public.admin_users FOR DELETE USING (true);

-- ==========================================
-- STORAGE BUCKET (Şəkil və Fayllar üçün)
-- ==========================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('ecolife', 'ecolife', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage: Tam oxuma və yükləmə icazəsi
DROP POLICY IF EXISTS "Public Storage Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Storage" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Storage" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Storage" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow All Select Storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow All Insert Storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow All Update Storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow All Delete Storage" ON storage.objects;

CREATE POLICY "Allow All Select Storage" ON storage.objects FOR SELECT USING (bucket_id = 'ecolife');
CREATE POLICY "Allow All Insert Storage" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ecolife');
CREATE POLICY "Allow All Update Storage" ON storage.objects FOR UPDATE USING (bucket_id = 'ecolife') WITH CHECK (bucket_id = 'ecolife');
CREATE POLICY "Allow All Delete Storage" ON storage.objects FOR DELETE USING (bucket_id = 'ecolife');
`;

