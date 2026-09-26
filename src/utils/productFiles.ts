import { ProductFile } from '../types';

/** Bayt sayını oxunaqla ölçüyə çevirir (1536 → "1.5 MB", 48 → "48 KB") */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Fayl adının uzantısından ProductFile tipini təyin edir */
export function guessProductFileType(fileName: string): ProductFile['type'] {
  const ext = (fileName.split('.').pop() || '').toLowerCase();
  if (ext === 'pdf') return 'PDF';
  if (ext === 'ies') return 'IES';
  if (ext === 'ldt') return 'LDT';
  if (ext === 'dwg' || ext === 'dxf' || ext === 'rvt' || ext === 'obj' || ext === 'skp') return 'CAD';
  return 'DOC';
}

/**
 * URL-dən faylı REAL olaraq yükləyir: fetch → blob → müvəqqəti link klik.
 * fetch alınmadıqda (CORS və s.) faylı yeni tabda açır.
 */
export async function downloadFileFromUrl(url: string, fileName: string): Promise<void> {
  if (!url) return;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = fileName || 'file';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 4000);
  } catch {
    // Fallback: birbaşa aç (Supabase public URL üçün adətən işləyir)
    window.open(url, '_blank', 'noopener');
  }
}

/** Məhsulun yüklənə bilən (URL-i olan) real fayllarını qaytarır */
export function getDownloadableFiles(files: ProductFile[] | undefined): ProductFile[] {
  if (!Array.isArray(files)) return [];
  return files.filter(f => f && typeof f.url === 'string' && f.url.trim());
}
