import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import { getLocalizedText } from '../../utils/lang';

interface EdProductCardProps {
  product: Product;
  currentLang: 'az' | 'en' | 'ru';
  onNavigate: (page: string, param?: string) => void;
  exploreLabel?: string;
}

/**
 * Editorial product presentation: dominant imagery on a warm cream plate,
 * quiet typography below. No heavy borders or card chrome.
 */
export const EdProductCard: React.FC<EdProductCardProps> = ({
  product,
  currentLang,
  onNavigate,
  exploreLabel = 'Explore'
}) => {
  const handleClick = () => onNavigate('catalog', product.slug);

  return (
    <article
      onClick={handleClick}
      className="group cursor-pointer flex flex-col"
      aria-label={product.name}
    >
      {/* Cream plate with product */}
      <div className="ed-plate relative overflow-hidden aspect-[4/3] flex items-center justify-center">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.045]"
          onError={(e) => {
            (e.target as HTMLImageElement).style.opacity = '0';
          }}
        />
        {/* Warm light activation on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <div className="absolute inset-x-0 bottom-0 h-1/2 ed-glow-floor" />
        </div>
        {product.isNew && (
          <span className="absolute top-4 left-4 font-micro text-[10px] text-[#1d1d1b] bg-[var(--ed-amber)] px-2.5 py-1 rounded-full">
            {currentLang === 'az' ? 'YENİ' : currentLang === 'ru' ? 'НОВИНКА' : 'NEW'}
          </span>
        )}
      </div>

      {/* Quiet caption */}
      <div className="pt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-ivory tracking-tight group-hover:text-amber-warm transition-colors duration-300">
            {product.name}
          </h3>
          <p className="text-xs text-mute mt-1 truncate">
            {getLocalizedText(product.subtitle, currentLang) || getLocalizedText(product.categoryName, currentLang)}
          </p>
        </div>
        <span className="font-mono-tech text-[10px] text-mute whitespace-nowrap pt-1">
          {product.code}
        </span>
      </div>

      <div className="pt-3 flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
        <span className="font-micro text-[10px] text-ivory">{exploreLabel}</span>
        <ArrowRight className="w-3 h-3 text-amber-warm transition-transform duration-300 group-hover:translate-x-1" />
      </div>
    </article>
  );
};
