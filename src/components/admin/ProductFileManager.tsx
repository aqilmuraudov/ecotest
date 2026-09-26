import React, { useRef, useState } from 'react';
import { FileText, Box, Layers, FileText as File, UploadCloud, Trash2, Loader2, AlertCircle, Download } from 'lucide-react';
import { Language, ProductFile } from '../../types';
import { uploadFile, getStorageDisplayInfo } from '../../lib/storage';
import { formatFileSize, guessProductFileType } from '../../utils/productFiles';

interface ProductFileManagerProps {
  files: ProductFile[];
  onChange: (files: ProductFile[]) => void;
  currentLang: Language;
}

const ACCEPTED = '.pdf,.ies,.ldt,.dwg,.dxf,.doc,.docx,.zip,.rvt';

function FileIcon({ type, className }: { type: ProductFile['type']; className?: string }) {
  if (type === 'IES' || type === 'LDT') return <Box className={className} />;
  if (type === 'CAD') return <Layers className={className} />;
  return <FileText className={className} />;
}

export const ProductFileManager: React.FC<ProductFileManagerProps> = ({ files, onChange, currentLang }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const storageInfo = getStorageDisplayInfo();

  const T = {
    az: {
      title: 'Texniki Fayllar (Datasheet, IES/LDT, CAD)',
      hint: `PDF, IES, LDT, DWG, DOC, ZIP faylları yükləyə bilərsiniz. Fayllar ${storageInfo.providerName}-a yüklənir və məhsul səhifəsində dərhal görünür.`,
      upload: 'Fayl Yüklə',
      uploading: 'Yüklənir...',
      empty: 'Hələ fayl yüklənməyib. "Fayl Yüklə" düyməsi ilə əlavə edin.',
      delete: 'Sil'
    },
    en: {
      title: 'Technical Files (Datasheet, IES/LDT, CAD)',
      hint: `You can upload PDF, IES, LDT, DWG, DOC, ZIP files. Files are stored in ${storageInfo.providerName} and appear on the product page instantly.`,
      upload: 'Upload File',
      uploading: 'Uploading...',
      empty: 'No files uploaded yet. Use the "Upload File" button to add.',
      delete: 'Delete'
    },
    ru: {
      title: 'Технические файлы (Datasheet, IES/LDT, CAD)',
      hint: `Можно загружать файлы PDF, IES, LDT, DWG, DOC, ZIP. Файлы сохраняются в ${storageInfo.providerName} и сразу появляются на странице товара.`,
      upload: 'Загрузить файл',
      uploading: 'Загрузка...',
      empty: 'Файлы ещё не загружены. Нажмите «Загрузить файл», чтобы добавить.',
      delete: 'Удалить'
    }
  }[currentLang];

  const handleFilesSelected = async (selected: FileList | null) => {
    if (!selected || selected.length === 0) return;
    setError(null);
    setUploading(true);
    const added: ProductFile[] = [];

    try {
      for (const file of Array.from(selected)) {
        const res = await uploadFile(file, 'product-files');
        if (res.success && res.url) {
          added.push({
            name: file.name,
            type: guessProductFileType(file.name),
            size: formatFileSize(file.size),
            url: res.url
          });
        } else {
          setError(res.error || 'Yükləmə xətası');
        }
      }
      if (added.length) {
        onChange([...files, ...added]);
      }
    } catch (e: any) {
      setError(e?.message || 'Yükləmə xətası');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-[#0E0F14] border border-white/10 rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FFD21A]"></span>
          <span className="text-xs font-mono uppercase font-bold text-white tracking-wider">{T.title}</span>
        </div>
        <div className="flex items-center gap-2">
          {uploading && (
            <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> {T.uploading}
            </span>
          )}
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1.5 bg-[#FFD21A] hover:bg-[#F0C413] disabled:opacity-50 text-black text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            {T.upload}
          </button>
        </div>
      </div>

      <p className="text-[11px] text-gray-500 leading-relaxed">{T.hint}</p>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => handleFilesSelected(e.target.files)}
      />

      {error && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-[11px] text-red-300">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {files.length === 0 ? (
        <div className="py-6 text-center text-xs text-gray-500 italic">{T.empty}</div>
      ) : (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-[#16181F] border border-white/10"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <FileIcon type={file.type} className="w-4 h-4 text-[#FFD21A] flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate max-w-[260px]">{file.name}</div>
                  <div className="text-[10px] text-gray-500 font-mono">{file.type} • {file.size || '—'}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {file.url && (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Yoxla"
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  title={T.delete}
                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
