import { useEffect } from 'react';
import { Language, Product } from '../types';
import { getLocalizedText } from '../utils/lang';
import { buildRoutePath } from '../utils/router';

const SITE_URL = 'https://ecolife.az';
const DEFAULT_TITLE = 'Ecolife | Architectural Lighting & LED Solutions';
const DEFAULT_DESCRIPTION = 'Ecolife - memar və dizaynerlər üçün memarlıq işıqlandırması, LED profillər və peşəkar işıq həlləri.';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

const absoluteUrl = (value: string) => value.startsWith('http') ? value : `${SITE_URL}${value.startsWith('/') ? '' : '/'}${value}`;

function setMeta(selector: string, attribute: 'name' | 'property', value: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, selector.match(/="([^"]+)"/)?.[1] || '');
    document.head.appendChild(element);
  }
  element.content = value;
}

interface SeoManagerProps { page: string; param?: string; language: Language; product?: Product; }

export function SeoManager({ page, param, language, product }: SeoManagerProps) {
  useEffect(() => {
    const isProduct = page === 'catalog' && Boolean(product);
    const title = isProduct ? `${product!.name} | Ecolife` : DEFAULT_TITLE;
    const description = isProduct
      ? getLocalizedText(product!.description, language).slice(0, 155) || `${product!.name} - memarlıq işıqlandırma həlli.`
      : DEFAULT_DESCRIPTION;
    const image = isProduct ? absoluteUrl(product!.image || DEFAULT_IMAGE) : DEFAULT_IMAGE;
    const canonical = `${SITE_URL}${buildRoutePath(page, param)}`;

    document.title = title;
    setMeta('meta[name="description"]', 'name', description);
    setMeta('meta[property="og:title"]', 'property', title);
    setMeta('meta[property="og:description"]', 'property', description);
    setMeta('meta[property="og:image"]', 'property', image);
    setMeta('meta[property="og:url"]', 'property', canonical);
    setMeta('meta[name="twitter:title"]', 'name', title);
    setMeta('meta[name="twitter:description"]', 'name', description);
    setMeta('meta[name="twitter:image"]', 'name', image);

    let canonicalLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonical;

    const schemaId = 'ecolife-structured-data';
    document.getElementById(schemaId)?.remove();
    const schema = isProduct ? {
      '@context': 'https://schema.org', '@type': 'Product', name: product!.name,
      sku: product!.code, image: [image], description,
      brand: { '@type': 'Brand', name: 'Ecolife' },
      category: getLocalizedText(product!.categoryName, language),
      ...(product!.price !== undefined ? { offers: { '@type': 'Offer', priceCurrency: 'AZN', price: product!.price, availability: 'https://schema.org/InStock', url: canonical } } : {})
    } : {
      '@context': 'https://schema.org', '@type': 'Organization', name: 'Ecolife', url: SITE_URL,
      logo: `${SITE_URL}/favicon.png`, email: 'info@ecolife.az', telephone: '+994504507007'
    };
    const script = document.createElement('script');
    script.id = schemaId;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
  }, [page, param, language, product]);

  return null;
}
