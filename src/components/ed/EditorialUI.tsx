import React from 'react';
import { ArrowRight } from 'lucide-react';

interface EdButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost';
  className?: string;
  arrow?: boolean;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

/** Warm amber pill button (primary) or quiet outline pill (ghost). */
export const EdButton: React.FC<EdButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  className = '',
  arrow = false,
  type = 'button',
  disabled = false
}) => {
  const base = variant === 'primary' ? 'ed-btn-primary' : 'ed-btn-ghost';
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <span>{children}</span>
      {arrow && <ArrowRight className="w-3.5 h-3.5" />}
    </button>
  );
};

interface EdLinkProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  arrow?: boolean;
  amber?: boolean;
}

/** Small text link with warm amber underline animation. */
export const EdLink: React.FC<EdLinkProps> = ({ children, onClick, className = '', arrow = false, amber = false }) => (
  <button
    onClick={onClick}
    className={`ed-link ${amber ? 'text-amber-warm' : ''} ${className}`}
  >
    <span>{children}</span>
    {arrow && <ArrowRight className="w-3.5 h-3.5" />}
  </button>
);

interface EdSectionHeadProps {
  eyebrow?: string;
  titleA?: string;
  titleB?: string;
  sub?: string;
  align?: 'left' | 'center';
  className?: string;
}

/** Editorial section header: micro eyebrow, oversized two-tone title, small sub. */
export const EdSectionHead: React.FC<EdSectionHeadProps> = ({
  eyebrow,
  titleA,
  titleB,
  sub,
  align = 'left',
  className = ''
}) => (
  <div className={`${align === 'center' ? 'text-center' : ''} ${className}`}>
    {eyebrow && (
      <p className={`font-micro text-amber-warm mb-5 ${align === 'center' ? '' : ''}`}>{eyebrow}</p>
    )}
    {(titleA || titleB) && (
      <h2 className="ed-display-lg font-display text-ivory">
        {titleA}
        {titleB && (
          <>
            <br />
            <span className="text-soft">{titleB}</span>
          </>
        )}
      </h2>
    )}
    {sub && (
      <p className={`text-sm text-mute mt-6 max-w-md leading-relaxed ${align === 'center' ? 'mx-auto' : ''}`}>
        {sub}
      </p>
    )}
  </div>
);

/** Thin divider line. */
export const EdHairline: React.FC<{ amber?: boolean; className?: string }> = ({ amber = false, className = '' }) => (
  <div className={`${amber ? 'ed-hairline-amber' : 'ed-hairline'} ${className}`} />
);

/** Micro metadata row used across pages (e.g. "01 / CATALOG — 24 SYSTEMS"). */
export const EdMeta: React.FC<{ items: string[]; className?: string }> = ({ items, className = '' }) => (
  <div className={`font-micro text-mute flex flex-wrap gap-x-6 gap-y-1 ${className}`}>
    {items.map((it, i) => (
      <span key={i}>{it}</span>
    ))}
  </div>
);
