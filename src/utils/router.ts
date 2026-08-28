export interface RouteState {
  page: string;
  param?: string;
}

/**
 * Normalizes pathname and maps it to internal state
 * Supports Azerbaijani, English and Russian path variations
 */
export function parseUrlToRoute(pathname: string): RouteState {
  // Clean pathname (remove trailing slashes and decode URI)
  const cleanPath = decodeURIComponent(pathname.replace(/\/+$/, '') || '/');
  const segments = cleanPath.split('/').filter(Boolean);

  if (segments.length === 0) {
    return { page: 'home', param: undefined };
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
      return { page: 'catalog', param: subParam };

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
      // If root matches any page directly
      if (['home', 'catalog', 'projects', 'solutions', 'configurator', 'blog', 'about', 'contact'].includes(root)) {
        return { page: root, param: subParam };
      }
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
