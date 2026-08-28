import React from 'react';
import { Inquiry, Language } from '../../types';
import { adminTranslations } from '../../data/adminTranslations';
import { X } from 'lucide-react';

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

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#12141B] border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <span className="text-[10px] font-mono text-[#FFD21A] uppercase tracking-wider">{modalT.title}</span>
          <h3 className="text-lg font-bold text-white">{inquiry.name}</h3>
          <p className="text-xs text-gray-400">{new Date(inquiry.createdAt).toLocaleString()}</p>
        </div>

        <div className="bg-[#16181F] p-4 rounded-xl space-y-2 text-xs">
          <div><strong className="text-gray-400">{modalT.phoneLabel}:</strong> <span className="text-white font-mono">{inquiry.phone}</span></div>
          <div><strong className="text-gray-400">{modalT.emailLabel}:</strong> <span className="text-white font-mono">{inquiry.email}</span></div>
          {inquiry.company && <div><strong className="text-gray-400">{modalT.companyLabel}:</strong> <span className="text-white">{inquiry.company}</span></div>}
          {inquiry.productName && <div><strong className="text-gray-400">{modalT.productLabel}:</strong> <span className="text-[#FFD21A]">{inquiry.productName} ({inquiry.productCode})</span></div>}
          {inquiry.configSummary && <div><strong className="text-gray-400">{modalT.configLabel}:</strong> <span className="text-emerald-400 font-mono">{inquiry.configSummary}</span></div>}
        </div>

        <div className="space-y-1">
          <span className="text-xs font-mono uppercase text-gray-400">{modalT.messageLabel}:</span>
          <p className="bg-[#16181F] p-4 rounded-xl text-xs text-gray-200 leading-relaxed whitespace-pre-wrap">
            {inquiry.message}
          </p>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#FFD21A] text-black font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-[#F0C413]"
          >
            {modalT.closeBtn || commonT.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};
