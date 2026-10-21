import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { EdButton } from './ed/EditorialUI';

interface SimilarProjectPopupProps {
  title: string;
  description: string;
  cta: string;
  /** hide while something else covers the page (photo lightbox) */
  suspended?: boolean;
  onContact: () => void;
}

const STORAGE_KEY = 'ecolife_similar_cta_closed';
// share of the scrollable page after which the card appears (a bit before the middle)
const SHOW_AT = 0.35;

const wasClosed = () => {
  try { return sessionStorage.getItem(STORAGE_KEY) === '1'; } catch { return false; }
};

/**
 * "Have a similar project?" card shown in the centre of the screen once the visitor has scrolled to about the middle of a project page.
 * Closing it (or using the button) keeps it away for the rest of the visit, so it never nags.
 */
export const SimilarProjectPopup: React.FC<SimilarProjectPopupProps> = ({ title, description, cta, suspended = false, onContact }) => {
  const [dismissed, setDismissed] = useState(wasClosed);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(max > 0 && window.scrollY / max > SHOW_AT);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [dismissed]);

  const close = () => {
    setDismissed(true);
    try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch { /* private mode: it just shows again next visit */ }
  };

  const open = !dismissed && scrolled && !suspended;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="similar-project"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[var(--ed-scrim)] backdrop-blur-sm"
          onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <motion.aside
            role="dialog"
            aria-label={title}
            initial={{ opacity: 0, y: 28, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 240, damping: 24 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[var(--ed-line)] bg-[var(--ed-modal)] text-[var(--ed-ivory)] shadow-[0_25px_80px_rgba(0,0,0,0.45)]"
          >
          {/* LED accent line + soft warm glow, same language as the inquiry window */}
          <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-[#FFD21A]/70 to-transparent pointer-events-none" />
          <div className="absolute -top-16 -left-10 w-48 h-40 rounded-full bg-[var(--ed-amber)]/10 blur-3xl pointer-events-none" />

          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute top-2.5 right-2.5 p-1.5 rounded-full text-[var(--ed-mute)] hover:text-amber-warm hover:bg-[var(--ed-line-soft)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative p-7 sm:p-8 pr-12">
            <span className="relative flex h-2 w-2 mb-4">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--ed-amber)] opacity-60 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--ed-amber)]" />
            </span>
            <h3 className="ed-display-sm font-display text-ivory leading-tight">{title}</h3>
            <p className="text-xs text-mute mt-2.5 leading-relaxed">{description}</p>
            <div className="mt-5">
              <EdButton arrow onClick={() => { close(); onContact(); }}>
                {cta}
              </EdButton>
            </div>
          </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
