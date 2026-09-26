export interface RouteState {
  page: string;
  param?: string;
}

const KNOWN_ROUTES = [
  'home', 'ana-sehife', 'glavnaya',
  'catalog', 'kataloq', 'katalog', 'product', 'mehsul', 'tovar',
  'projects', 'layiheler', 'proekty',
  'solutions', 'heller', 'resheniya',
  'configurator', 'konfiqurator', 'konfigurator',
  'blog', 'xeberler', 'novosti', 'news', 'articles',
  'manage', 'admin',
  'about', 'haqqimizda', 'o-nas',
  'contact', 'elaqe', 'kontakty'
];

/**
 * Normalizes pathname and maps it to internal state
 * Supports Azerbaijani, English and Russian path variations,
 * GitHub Pages repository subpaths, and hash routing.
 */
export function parseUrlToRoute(pathname: string): RouteState {
  let path = pathname;

  // Check if hash-based routing is present (e.g. /#/catalog)
  if (typeof window !== 'undefined' && window.location.hash) {
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (hash) {
      path = `/${hash}`;
    }
  }

  // Clean pathname (remove trailing slashes and decode URI)
  const cleanPath = decodeURIComponent(path.replace(/\/+$/, '') || '/');
  let segments = cleanPath.split('/').filter(Boolean);

  if (segments.length === 0) {
    return { page: 'home', param: undefined };
  }

  // If first segment is a GitHub Pages repository name (e.g. /ecotest-main/catalog), find known route
  const knownIndex = segments.findIndex(s => KNOWN_ROUTES.includes(s.toLowerCase()));
  if (knownIndex > 0) {
    segments = segments.slice(knownIndex);
  }

  const root = segments[0].toLowerCase();
  const subParam = segments.length > 1 ? segments.slice(1).join('/') : undefined;

  switch (root) {
    case 'home':
    case 'ana-sehife':
    case 'glavnaya':
      return { page: 'home', param: undefined };

    case 'catalog':
    case 'kataloq':
    case 'katalog':
    case 'product':
    case 'mehsul':
    case 'tovar':
      return { page: 'catalog', param: subParam };

    case 'projects':
    case 'layiheler':
    case 'proekty':
      return { page: 'projects', param: subParam };

    case 'solutions':
    case 'heller':
    case 'resheniya':
      return { page: 'solutions', param: subParam };

    case 'configurator':
    case 'konfiqurator':
    case 'konfigurator':
      return { page: 'configurator', param: subParam };

    case 'blog':
    case 'xeberler':
    case 'novosti':
    case 'news':
    case 'articles':
      return { page: 'blog', param: subParam };

    case 'manage':
    case 'admin':
      return { page: 'admin', param: subParam };

    case 'about':
    case 'haqqimizda':
    case 'o-nas':
      return { page: 'about', param: undefined };

    case 'contact':
    case 'elaqe':
    case 'kontakty':
      return { page: 'contact', param: undefined };

    default:
      return { page: 'home', param: undefined };
  }
}

/**
 * Generates canonical clean browser URL for a page and parameter
 */
export function buildRoutePath(page: string, param?: string): string {
  switch (page) {
    case 'home':
      return '/';

    case 'catalog':
      if (!param || param === 'all') {
        return '/catalog';
      }
      return `/catalog/${encodeURIComponent(param)}`;

    case 'projects':
      if (!param) {
        return '/projects';
      }
      return `/projects/${encodeURIComponent(param)}`;

    case 'solutions':
      if (!param) {
        return '/solutions';
      }
      return `/solutions/${encodeURIComponent(param)}`;

    case 'configurator':
      return '/configurator';

    case 'blog':
      return param ? `/blog/${encodeURIComponent(param)}` : '/blog';

    case 'admin':
      return '/manage';

    case 'about':
      return '/about';

    case 'contact':
      return '/contact';

    default:
      return param ? `/${encodeURIComponent(page)}/${encodeURIComponent(param)}` : `/${encodeURIComponent(page)}`;
  }
}
