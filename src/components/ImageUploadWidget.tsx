import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Link as LinkIcon, Check, AlertCircle, RefreshCw, X, Eye } from 'lucide-react';
import { uploadFile, getStorageDisplayInfo } from '../lib/storage';
import { Language } from '../types';
import { adminTranslations } from '../data/adminTranslations';

interface ImageUploadWidgetProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  currentLang?: Language;
}

export const ImageUploadWidget: React.FC<ImageUploadWidgetProps> = ({
  value,
  onChange,
  label = 'Şəkil',
  folder = 'products',
  placeholder,
  required = false,
  helpText,
  currentLang = 'az'
}) => {
  const t = adminTranslations[currentLang]?.uploader || adminTranslations.az.uploader;
  const [activeMode, setActiveMode] = useState<'upload' | 'url'>('upload');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const storageInfo = getStorageDisplayInfo();

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError(t.errorInvalidType);
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setUploadError(t.errorTooLarge);
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    const result = await uploadFile(file, folder);

    setIsUploading(false);

    if (result.success && result.url) {
      onChange(result.url);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } else {
      setUploadError(result.error || t.errorUpload);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // reset input value so re-selecting same file triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="space-y-2">
      {/* Header with Mode Switch */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-mono uppercase tracking-wider text-gray-300">
          {label} {required && <span className="text-[#FFD21A]">*</span>}
        </label>

        <div className="flex items-center gap-1 bg-[#0E0F14] border border-white/10 p-0.5 rounded-lg text-[10px] font-mono">
          <button
            type="button"
            onClick={() => setActiveMode('upload')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
              activeMode === 'upload'
                ? 'bg-[#FFD21A] text-black font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <UploadCloud className="w-3 h-3" />
            <span>{t.uploadTab}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('url')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
              activeMode === 'url'
                ? 'bg-[#FFD21A] text-black font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>{t.urlTab}</span>
          </button>
        </div>
      </div>

      {/* Main Upload / Input Area */}
      {activeMode === 'upload' ? (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileInputChange}
            className="hidden"
          />

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
              isDragOver
                ? 'border-[#FFD21A] bg-[#FFD21A]/10'
                : isUploading
                ? 'border-white/20 bg-white/5 opacity-70 cursor-wait'
                : 'border-white/15 bg-[#16181F] hover:border-[#FFD21A]/50 hover:bg-[#1a1d26]'
            }`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2 py-2">
                <RefreshCw className="w-6 h-6 text-[#FFD21A] animate-spin" />
                <span className="text-xs font-mono text-gray-300">
                  {t.uploading} ({storageInfo.providerName})
                </span>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-[#FFD21A]/10 border border-[#FFD21A]/30 text-[#FFD21A] flex items-center justify-center">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-white">
                    {t.dragPrompt} <span className="text-[#FFD21A] underline">{t.browseBtn}</span>
                  </p>
                  <p className="text-[10px] font-mono text-gray-400">
                    {t.fileLimit} • {storageInfo.providerName} ({storageInfo.bucketName})
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="relative">
            <LinkIcon className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder || t.urlPlaceholder}
              className="w-full bg-[#16181F] border border-white/15 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white font-mono focus:border-[#FFD21A] focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Success Banner */}
      {uploadSuccess && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{t.uploadedSuccess}</span>
        </div>
      )}

      {/* Error Banner with helpful tips */}
      {uploadError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs space-y-1">
          <div className="flex items-start gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{uploadError}</span>
          </div>
        </div>
      )}

      {/* Current Image Preview Bar */}
      {value && (
        <div className="flex items-center justify-between bg-[#0E0F14] border border-white/10 p-2.5 rounded-xl">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-black/60 border border-white/10 shrink-0">
              <img
                src={value}
                alt="Selected preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=300&q=80';
                }}
              />
            </div>
            <div className="overflow-hidden">
              <div className="text-[11px] font-bold text-white truncate max-w-[240px] sm:max-w-xs">
                {value.split('/').pop() || 'image.jpg'}
              </div>
              <div className="text-[10px] font-mono text-gray-400 truncate max-w-[240px] sm:max-w-xs">
                {value}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              title={t.previewBtn}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              title={t.removeBtn}
              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {helpText && (
        <p className="text-[10px] text-gray-400 leading-relaxed font-mono">
          💡 {helpText}
        </p>
      )}

      {/* Large Image Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-[#12141B] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <span className="text-xs font-mono text-gray-300 truncate max-w-md">{value}</span>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center max-h-[70vh] overflow-hidden bg-black/40">
              <img src={value} alt="Preview" className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

