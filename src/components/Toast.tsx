import React, { useEffect } from 'react';
import { CheckCircle2, Download, X } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  type?: 'success' | 'download' | 'info';
}

export const Toast: React.FC<ToastProps> = ({
  message,
  isVisible,
  onClose,
  type = 'download'
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
      <div className="flex items-center gap-3 bg-[#131418] border border-[#FFD21A]/40 text-white px-5 py-3.5 rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.8)] glow-yellow-sm">
        {type === 'download' ? (
          <Download className="w-5 h-5 text-[#FFD21A] flex-shrink-0 animate-bounce" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-[#FFD21A] flex-shrink-0" />
        )}
        <div className="text-xs font-medium pr-2">
          {message}
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors ml-2"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
