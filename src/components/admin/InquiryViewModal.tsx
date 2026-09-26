import React, { useState } from 'react';
import { Inquiry, Language } from '../../types';
import { adminTranslations } from '../../data/adminTranslations';
import { useData } from '../../context/DataContext';
import { 
  X, 
  Phone, 
  Mail, 
  MessageSquare, 
  Copy, 
  Check, 
  ExternalLink, 
  Clock, 
  Building2, 
  Layers, 
  Tag, 
  Sliders,
  CheckCircle2,
  Trash2
} from 'lucide-react';

interface InquiryViewModalProps {
  inquiry: Inquiry;
  onClose: () => void;
  currentLang: Language;
}

export const InquiryViewModal: React.FC<InquiryViewModalProps> = ({
  inquiry,
  onClose,
  currentLang
}) => {
  const t = adminTranslations[currentLang] || adminTranslations.az;
  const modalT = t?.inquiryModal || adminTranslations.az.inquiryModal;
  const commonT = t?.common || adminTranslations.az.common;
  const { updateInquiryStatus, deleteInquiry } = useData();

  const [copiedText, setCopiedText] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<Inquiry['status']>(inquiry.status || 'new');

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(inquiry.message);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleStatusChange = async (newStatus: Inquiry['status']) => {
    setCurrentStatus(newStatus);
    await updateInquiryStatus(inquiry.id, newStatus);
  };

  const cleanPhone = inquiry.phone?.replace(/[^0-9+]/g, '') || '';
  const waNumber = cleanPhone.replace(/^\+/, '');

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-[#12141B] border border-white/15 rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-7 space-y-5 shadow-2xl relative text-[#F5F5F5]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 pr-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#FFD21A] uppercase tracking-wider bg-[#FFD21A]/10 px-2 py-0.5 rounded border border-[#FFD21A]/30">
                {modalT.title || 'Müştəri Sorğusu'}
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3 text-gray-500" />
                {new Date(inquiry.createdAt).toLocaleString('az-AZ')}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight mt-1">{inquiry.name}</h3>
          </div>

          {/* Status Selector in Header */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-400 font-mono">Status:</span>
            <select
              value={currentStatus}
              onChange={(e) => handleStatusChange(e.target.value as Inquiry['status'])}
              className="bg-[#181B24] border border-white/20 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-[#FFD21A] transition-colors"
            >
              <option value="new">🟡 {t.inquiries.statusNew}</option>
              <option value="in_progress">🔵 {t.inquiries.statusInProgress}</option>
              <option value="contacted">🟣 {t.inquiries.statusContacted}</option>
              <option value="completed">🟢 {t.inquiries.statusCompleted}</option>
            </select>
          </div>
        </div>

        {/* Quick Contact Action Bar */}
        <div className="grid grid-cols-3 gap-2.5">
          <a
            href={`tel:${cleanPhone}`}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Zəng Et</span>
          </a>

          <a
            href={`https://wa.me/${waNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-green-600/10 hover:bg-green-600/20 text-green-400 border border-green-600/20 text-xs font-bold transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>

          <a
            href={`mailto:${inquiry.email}?subject=Ecolife - Sorğunuz haqqında`}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#FFD21A]/10 hover:bg-[#FFD21A]/20 text-[#FFD21A] border border-[#FFD21A]/20 text-xs font-bold transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>E-mail</span>
          </a>
        </div>

        {/* Product Details Card (If quote is for a specific product) */}
        {(inquiry.productName || inquiry.productCode) && (
          <div className="bg-[#181B24] border border-[#FFD21A]/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FFD21A] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                <span>Sorğu Edilən Məhsul</span>
              </span>
              {inquiry.productCode && (
                <span className="text-xs font-mono font-bold bg-black/60 text-gray-300 px-2 py-0.5 rounded border border-white/10">
                  {inquiry.productCode}
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {inquiry.productImage && (
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-black/80 border border-white/10 flex-shrink-0">
                  <img
                    src={inquiry.productImage}
                    alt={inquiry.productName || 'Məhsul'}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="text-base font-bold text-white uppercase tracking-tight">
                  {inquiry.productName}
                </h4>
                {inquiry.productCategory && (
                  <p className="text-xs text-gray-400">
                    Kateqoriya: <span className="text-gray-200">{inquiry.productCategory}</span>
                  </p>
                )}

                {/* Specs chips */}
                {inquiry.productSpecs && (
                  <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-mono text-gray-300">
                    {inquiry.productSpecs.dimensions && (
                      <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-[#FFD21A]">
                        {inquiry.productSpecs.dimensions}
                      </span>
                    )}
                    {inquiry.productSpecs.mounting && (
                      <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10">
                        {inquiry.productSpecs.mounting}
                      </span>
                    )}
                    {inquiry.productSpecs.ipRating && (
                      <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10">
                        {inquiry.productSpecs.ipRating}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Custom Configurator Specs */}
        {inquiry.configSummary && (
          <div className="bg-[#181B24] border border-emerald-500/30 rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>Xüsusi Konfiqurasiya Təfərrüatları</span>
            </span>
            <div className="text-xs font-mono text-gray-200 whitespace-pre-line leading-relaxed bg-black/40 p-3 rounded-lg border border-white/5">
              {inquiry.configSummary}
            </div>
          </div>
        )}

        {/* Customer Information Grid */}
        <div className="bg-[#16181F] border border-white/5 rounded-xl p-4 space-y-2.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-gray-400 font-mono block text-[10px] uppercase">{modalT.phoneLabel}:</span>
              <a href={`tel:${cleanPhone}`} className="text-[#FFD21A] font-mono font-bold hover:underline">
                {inquiry.phone}
              </a>
            </div>
            <div>
              <span className="text-gray-400 font-mono block text-[10px] uppercase">{modalT.emailLabel}:</span>
              <a href={`mailto:${inquiry.email}`} className="text-white font-mono hover:underline">
                {inquiry.email}
              </a>
            </div>
            {inquiry.company && (
              <div>
                <span className="text-gray-400 font-mono block text-[10px] uppercase">{modalT.companyLabel}:</span>
                <span className="text-white">{inquiry.company}</span>
              </div>
            )}
            {inquiry.projectType && (
              <div>
                <span className="text-gray-400 font-mono block text-[10px] uppercase">Layihə Növü:</span>
                <span className="text-white capitalize">{inquiry.projectType}</span>
              </div>
            )}
          </div>
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-gray-400 tracking-wider">
              {modalT.messageLabel}:
            </span>
            <button
              onClick={handleCopyMessage}
              className="text-[11px] text-gray-400 hover:text-[#FFD21A] flex items-center gap-1 transition-colors"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedText ? 'Kopyalandı' : 'Mesajı Kopyala'}</span>
            </button>
          </div>
          <p className="bg-[#16181F] border border-white/10 p-4 rounded-xl text-xs text-gray-200 leading-relaxed whitespace-pre-wrap">
            {inquiry.message}
          </p>
        </div>

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between border-t border-white/10">
          <button
            onClick={async () => {
              if (window.confirm(t.inquiries.deleteConfirm)) {
                await deleteInquiry(inquiry.id);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 py-2 px-3 rounded-lg hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.inquiries.deleteInquiryBtn || 'Sorğunu Sil'}</span>
          </button>

          <button
            onClick={onClose}
            className="bg-[#FFD21A] text-black font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl hover:bg-[#F0C413] transition-colors"
          >
            {modalT.closeBtn || commonT.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};
