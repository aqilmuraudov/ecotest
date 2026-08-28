import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Link as LinkIcon, 
  Plus, 
  X, 
  Eye, 
  Star, 
  ArrowLeft, 
  ArrowRight, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  Trash2, 
  Image as ImageIcon,
  Sparkles,
  Layers
} from 'lucide-react';
import { uploadFileToSupabase, getStorageBucketName } from '../../lib/supabase';
import { Language } from '../../types';
import { adminTranslations } from '../../data/adminTranslations';

interface ProductGalleryManagerProps {
  mainImage: string;
  onMainImageChange: (url: string) => void;
  additionalImages: string[];
  onAdditionalImagesChange: (urls: string[]) => void;
  folder?: string;
  mainTitle?: string;
  mainSubtitle?: string;
  galleryTitle?: string;
  gallerySubtitle?: string;
  mainPlaceholderWarning?: string;
  currentLang?: Language;
}

export const ProductGalleryManager: React.FC<ProductGalleryManagerProps> = ({
  mainImage,
  onMainImageChange,
  additionalImages,
  onAdditionalImagesChange,
  folder = 'products',
  mainTitle = '1. Əsas Şəkil (Üz Qabığı)',
  mainSubtitle = 'Kataloq kartlarında və ilkin baxışda görünən əsas şəkil.',
  galleryTitle = '2. Əlavə Şəkillər (Qalereya) — Limitsiz',
  gallerySubtitle = 'Səhifədəki slayder və qalereyada nümayiş olunacaq istənilən sayda şəkil.',
  mainPlaceholderWarning = 'Əsas şəkil hələ təyin edilməyib. Yuxarıdan fayl yükləyin və ya URL yazın.',
  currentLang = 'az'
}) => {
  const t = adminTranslations[currentLang] || adminTranslations.az;
  const modalT = t?.productModal || adminTranslations.az.productModal;
  const uploadT = t?.uploader || adminTranslations.az.uploader;

  // Tabs for Main Image
  const [mainMode, setMainMode] = useState<'upload' | 'url'>('upload');
  const [mainUrlInput, setMainUrlInput] = useState<string>('');
  const [isUploadingMain, setIsUploadingMain] = useState<boolean>(false);
  const [mainDragOver, setMainDragOver] = useState<boolean>(false);
  const mainFileInputRef = useRef<HTMLInputElement>(null);

  // Tabs for Additional Images
  const [galleryMode, setGalleryMode] = useState<'upload' | 'url'>('upload');
  const [galleryUrlInput, setGalleryUrlInput] = useState<string>('');
  const [isUploadingGallery, setIsUploadingGallery] = useState<boolean>(false);
  const [galleryUploadProgress, setGalleryUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [galleryDragOver, setGalleryDragOver] = useState<boolean>(false);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  // Preview Lightbox
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const bucketName = getStorageBucketName();

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // ==========================================
  // MAIN IMAGE HANDLERS
  // ==========================================
  const handleMainFileUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showStatus('error', uploadT.errorInvalidType);
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      showStatus('error', uploadT.errorTooLarge);
      return;
    }

    setIsUploadingMain(true);
    const res = await uploadFileToSupabase(file, folder);
    setIsUploadingMain(false);

    if (res.success && res.url) {
      onMainImageChange(res.url);
      showStatus('success', uploadT.uploadedSuccess);
    } else {
      showStatus('error', res.error || uploadT.errorUpload);
    }
  };

  const handleApplyMainUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainUrlInput.trim()) return;
    onMainImageChange(mainUrlInput.trim());
    setMainUrlInput('');
    showStatus('success', 'Əsas şəkil linki təyin edildi!');
  };

  // ==========================================
  // ADDITIONAL IMAGES (GALLERY) HANDLERS
  // ==========================================
  const handleGalleryFilesUpload = async (files: FileList | File[]) => {
    const fileList = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (fileList.length === 0) {
      showStatus('error', uploadT.errorInvalidType);
      return;
    }

    setIsUploadingGallery(true);
    setGalleryUploadProgress({ current: 0, total: fileList.length });

    const newUrls: string[] = [];
    let failureCount = 0;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      setGalleryUploadProgress({ current: i + 1, total: fileList.length });
      
      const res = await uploadFileToSupabase(file, folder);
      if (res.success && res.url) {
        newUrls.push(res.url);
      } else {
        failureCount++;
      }
    }

    setIsUploadingGallery(false);
    setGalleryUploadProgress(null);

    if (newUrls.length > 0) {
      // Append unique URLs
      const combined = Array.from(new Set([...additionalImages, ...newUrls]));
      onAdditionalImagesChange(combined);
      showStatus('success', `${newUrls.length} ədəd əlavə şəkil uğurla yükləndi!`);
    }

    if (failureCount > 0) {
      showStatus('error', `${failureCount} fayl yüklənərkən xəta baş verdi.`);
    }
  };

  const handleAddGalleryUrls = (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryUrlInput.trim()) return;

    // Support single URL or multiple URLs separated by newline, comma or space
    const urls = galleryUrlInput
      .split(/[\n,\s]+/)
      .map(u => u.trim())
      .filter(u => u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:image/'));

    if (urls.length === 0) {
      showStatus('error', 'Düzgün şəkil linki daxil edin (http:// və ya https:// ilə)');
      return;
    }

    const combined = Array.from(new Set([...additionalImages, ...urls]));
    onAdditionalImagesChange(combined);
    setGalleryUrlInput('');
    showStatus('success', `${urls.length} ədəd şəkil linki əlavə edildi!`);
  };

  const handleRemoveAdditionalImage = (index: number) => {
    const updated = additionalImages.filter((_, idx) => idx !== index);
    onAdditionalImagesChange(updated);
  };

  const handleSetAsMain = (index: number) => {
    const selected = additionalImages[index];
    if (!selected) return;

    // Swap: old main becomes an additional image, selected becomes main
    const remaining = additionalImages.filter((_, idx) => idx !== index);
    const updatedAdditional = mainImage ? [mainImage, ...remaining] : remaining;
    
    onMainImageChange(selected);
    onAdditionalImagesChange(updatedAdditional);
    showStatus('success', 'Seçilmiş şəkil əsas şəkil təyin edildi!');
  };

  const handleMoveAdditional = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= additionalImages.length) return;

    const copy = [...additionalImages];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    onAdditionalImagesChange(copy);
  };

  const handleClearAllAdditional = () => {
    if (additionalImages.length === 0) return;
    if (window.confirm('Bütün əlavə şəkilləri qalereyadan silmək istəyirsiniz?')) {
      onAdditionalImagesChange([]);
      showStatus('success', 'Bütün əlavə şəkillər silindi.');
    }
  };

  return (
    <div className="space-y-6 bg-[#0E0F14] border border-white/10 rounded-2xl p-4 sm:p-6">
      
      {/* Toast Feedback */}
      {statusMessage && (
        <div className={`p-3 rounded-xl flex items-center gap-2.5 text-xs font-mono transition-all animate-in fade-in duration-200 ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
            : 'bg-red-500/10 border border-red-500/30 text-red-300'
        }`}>
          {statusMessage.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Side-by-side 2-Column Horizontal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        
        {/* ========================================================================= */}
        {/* COLUMN 1: MAIN PRODUCT / ITEM COVER IMAGE */}
        {/* ========================================================================= */}
        <div className="bg-[#13151D] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FFD21A]"></span>
                  <label className="text-xs font-mono uppercase font-bold text-white tracking-wider">
                    {mainTitle} <span className="text-[#FFD21A]">*</span>
                  </label>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {mainSubtitle}
                </p>
              </div>

              <div className="flex items-center gap-1 bg-[#16181F] border border-white/10 p-0.5 rounded-lg text-[10px] font-mono shrink-0">
                <button
                  type="button"
                  onClick={() => setMainMode('upload')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                    mainMode === 'upload' ? 'bg-[#FFD21A] text-black font-bold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <UploadCloud className="w-3 h-3" />
                  <span>{uploadT.uploadTab}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMainMode('url')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                    mainMode === 'url' ? 'bg-[#FFD21A] text-black font-bold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <LinkIcon className="w-3 h-3" />
                  <span>{uploadT.urlTab}</span>
                </button>
              </div>
            </div>

            {/* Main Image Upload / URL Input */}
            {mainMode === 'upload' ? (
              <div>
                <input
                  ref={mainFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleMainFileUpload(file);
                    if (mainFileInputRef.current) mainFileInputRef.current.value = '';
                  }}
                  className="hidden"
                />
                <div
                  onDragOver={(e) => { e.preventDefault(); setMainDragOver(true); }}
                  onDragLeave={() => setMainDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setMainDragOver(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleMainFileUpload(file);
                  }}
                  onClick={() => !isUploadingMain && mainFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                    mainDragOver
                      ? 'border-[#FFD21A] bg-[#FFD21A]/10'
                      : isUploadingMain
                      ? 'border-white/20 bg-white/5 opacity-70 cursor-wait'
                      : 'border-white/15 bg-[#16181F] hover:border-[#FFD21A]/50 hover:bg-[#1a1d26]'
                  }`}
                >
                  {isUploadingMain ? (
                    <div className="flex flex-col items-center gap-2 py-1">
                      <RefreshCw className="w-5 h-5 text-[#FFD21A] animate-spin" />
                      <span className="text-xs font-mono text-gray-300">
                        Əsas şəkil Supabase-ə yüklənir...
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#FFD21A]/10 border border-[#FFD21A]/30 text-[#FFD21A] flex items-center justify-center shrink-0">
                        <UploadCloud className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-medium text-white">
                          Əsas şəkli buraxın və ya <span className="text-[#FFD21A] underline font-bold">kompüterdən seçin</span>
                        </p>
                        <p className="text-[10px] font-mono text-gray-400">
                          PNG, JPG, WEBP, SVG • Supabase ({bucketName})
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleApplyMainUrl} className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={mainUrlInput}
                    onChange={(e) => setMainUrlInput(e.target.value)}
                    placeholder="https://... əsas şəkil linkini daxil edin"
                    className="w-full bg-[#16181F] border border-white/15 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white font-mono focus:border-[#FFD21A] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#FFD21A] text-black font-bold text-xs rounded-xl hover:bg-[#F0C413] transition-colors shrink-0"
                >
                  Tətbiq Et
                </button>
              </form>
            )}
          </div>

          {/* Main Image Current Preview Box */}
          <div className="pt-2">
            {mainImage ? (
              <div className="flex items-center justify-between bg-[#16181F] border border-[#FFD21A]/30 p-3 rounded-xl">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-black/60 border border-white/10 shrink-0">
                    <img
                      src={mainImage}
                      alt="Main cover"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=300&q=80';
                      }}
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-[#FFD21A] text-black text-[8px] font-extrabold text-center uppercase tracking-wider py-0.5">
                      ƏSAS
                    </span>
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="truncate max-w-[140px] sm:max-w-[220px]">{mainImage.split('/').pop() || 'cover.jpg'}</span>
                      <span className="text-[10px] font-mono text-[#FFD21A] bg-[#FFD21A]/10 border border-[#FFD21A]/20 px-1.5 py-0.5 rounded shrink-0">
                        Aktiv Üz Qabığı
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-gray-400 truncate max-w-[160px] sm:max-w-[240px] mt-0.5">
                      {mainImage}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPreviewImage(mainImage)}
                    title="Böyüt"
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMainImageChange('')}
                    title="Təmizlə"
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{mainPlaceholderWarning}</span>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COLUMN 2: UNLIMITED ADDITIONAL IMAGES (GALLERY) */}
        {/* ========================================================================= */}
        <div className="bg-[#13151D] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#FFD21A]" />
                  <label className="text-xs font-mono uppercase font-bold text-white tracking-wider">
                    {galleryTitle}
                  </label>
                  <span className="text-[10px] font-mono font-bold bg-[#FFD21A] text-black px-2 py-0.5 rounded-full">
                    {additionalImages.length} ədəd
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {gallerySubtitle}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {additionalImages.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllAdditional}
                    className="text-[10px] font-mono text-red-400 hover:text-red-300 px-2 py-1 rounded bg-red-500/10 border border-red-500/20 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Hamısını Təmizlə</span>
                  </button>
                )}

                <div className="flex items-center gap-1 bg-[#16181F] border border-white/10 p-0.5 rounded-lg text-[10px] font-mono">
                  <button
                    type="button"
                    onClick={() => setGalleryMode('upload')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                      galleryMode === 'upload' ? 'bg-[#FFD21A] text-black font-bold' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <UploadCloud className="w-3 h-3" />
                    <span>Çoxlu Fayl</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGalleryMode('url')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                      galleryMode === 'url' ? 'bg-[#FFD21A] text-black font-bold' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>URL</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Gallery Upload / URL Box */}
            {galleryMode === 'upload' ? (
              <div>
                <input
                  ref={galleryFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleGalleryFilesUpload(e.target.files);
                    }
                    if (galleryFileInputRef.current) galleryFileInputRef.current.value = '';
                  }}
                  className="hidden"
                />
                <div
                  onDragOver={(e) => { e.preventDefault(); setGalleryDragOver(true); }}
                  onDragLeave={() => setGalleryDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setGalleryDragOver(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      handleGalleryFilesUpload(e.dataTransfer.files);
                    }
                  }}
                  onClick={() => !isUploadingGallery && galleryFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                    galleryDragOver
                      ? 'border-[#FFD21A] bg-[#FFD21A]/10 scale-[1.01]'
                      : isUploadingGallery
                      ? 'border-white/20 bg-white/5 opacity-80 cursor-wait'
                      : 'border-white/15 bg-[#16181F] hover:border-[#FFD21A]/50 hover:bg-[#1a1d26]'
                  }`}
                >
                  {isUploadingGallery ? (
                    <div className="flex flex-col items-center gap-2 py-1">
                      <RefreshCw className="w-5 h-5 text-[#FFD21A] animate-spin" />
                      <span className="text-xs font-mono text-white font-bold">
                        Yüklənir: {galleryUploadProgress?.current} / {galleryUploadProgress?.total}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#FFD21A]/10 border border-[#FFD21A]/30 text-[#FFD21A] flex items-center justify-center shrink-0">
                        <Plus className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-medium text-white">
                          Şəkilləri bura atın və ya <span className="text-[#FFD21A] underline font-bold">Kompüterdən Seçin</span>
                        </p>
                        <p className="text-[10px] font-mono text-gray-400">
                          Limitsiz sayda çoxlu seçim dəstəklənir
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleAddGalleryUrls} className="space-y-2">
                <textarea
                  rows={2}
                  value={galleryUrlInput}
                  onChange={(e) => setGalleryUrlInput(e.target.value)}
                  placeholder="https://... şəkil linklərini daxil edin"
                  className="w-full bg-[#16181F] border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-[#FFD21A] focus:outline-none"
                />
                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-[#FFD21A] text-black font-bold text-xs rounded-lg hover:bg-[#F0C413] transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Qalereyaya Əlavə Et</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Gallery Thumbnails Grid */}
          <div className="pt-2">
            {additionalImages.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                {additionalImages.map((imgUrl, index) => (
                  <div
                    key={`${imgUrl}-${index}`}
                    className="group relative bg-[#16181F] border border-white/10 rounded-xl overflow-hidden shadow-md hover:border-[#FFD21A]/50 transition-all flex flex-col justify-between"
                  >
                    {/* Thumbnail Image */}
                    <div className="relative aspect-[4/3] bg-black/60 overflow-hidden flex items-center justify-center">
                      <img
                        src={imgUrl}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=300&q=80';
                        }}
                      />
                      <div className="absolute top-1 left-1">
                        <span className="text-[8px] font-mono font-bold bg-black/80 text-gray-300 px-1 py-0.5 rounded border border-white/10">
                          #{index + 1}
                        </span>
                      </div>

                      {/* Top Right Quick Actions */}
                      <div className="absolute top-1 right-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => setPreviewImage(imgUrl)}
                          className="p-1 rounded bg-black/80 hover:bg-black text-gray-300 hover:text-white"
                          title="Böyüt"
                        >
                          <Eye className="w-2.5 h-2.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveAdditionalImage(index)}
                          className="p-1 rounded bg-red-500/80 hover:bg-red-500 text-white"
                          title="Sil"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Control Bar */}
                    <div className="p-1 bg-[#0E0F14] border-t border-white/5 flex items-center justify-between text-[9px]">
                      {/* Set As Main Button */}
                      <button
                        type="button"
                        onClick={() => handleSetAsMain(index)}
                        title="Əsas şəkil et"
                        className="flex items-center gap-0.5 text-[9px] font-bold text-gray-300 hover:text-[#FFD21A] transition-colors py-0.5 px-1 rounded hover:bg-white/5"
                      >
                        <Star className="w-2.5 h-2.5 text-[#FFD21A]" />
                        <span>Əsas</span>
                      </button>

                      {/* Order Changers */}
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveAdditional(index, 'left')}
                          className={`p-0.5 rounded hover:bg-white/10 ${index === 0 ? 'opacity-30 cursor-not-allowed text-gray-600' : 'text-gray-400 hover:text-white'}`}
                          title="Sola"
                        >
                          <ArrowLeft className="w-2.5 h-2.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === additionalImages.length - 1}
                          onClick={() => handleMoveAdditional(index, 'right')}
                          className={`p-0.5 rounded hover:bg-white/10 ${index === additionalImages.length - 1 ? 'opacity-30 cursor-not-allowed text-gray-600' : 'text-gray-400 hover:text-white'}`}
                          title="Sağa"
                        >
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 px-3 rounded-xl border border-white/5 bg-black/20 text-center space-y-0.5">
                <ImageIcon className="w-5 h-5 text-gray-500 mx-auto stroke-[1.5]" />
                <p className="text-[11px] text-gray-400">Qalereyada hələ əlavə şəkil yoxdur.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* FULLSCREEN LIGHTBOX PREVIEW MODAL */}
      {/* ========================================================================= */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-[#12141B] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <span className="text-xs font-mono text-gray-300 truncate max-w-md">{previewImage}</span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center max-h-[75vh] overflow-hidden bg-black/50">
              <img
                src={previewImage}
                alt="Full Preview"
                className="max-h-[65vh] max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export const GalleryManager = ProductGalleryManager;

