export type Language = 'az' | 'en' | 'ru';
export type Theme = 'dark' | 'light';

export type ProductCategory = 
  | 'all'
  | 'linear-profiles'
  | 'led-profiles'
  | 'strip-lights'
  | 'recessed'
  | 'track-systems'
  | 'spot-downlight'
  | 'drivers'
  | 'accessories'
  | 'panels'
  | 'magnetic-systems'
  | string;

export interface CategoryItem {
  id: string;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  description?: string;
  order?: number;
}

export interface ProductSpec {
  material: string;
  dimensions: string;
  length?: string;
  ipRating: string;
  colorOptions?: string[];
  mounting: string;
  power?: string;
  cct?: string;
  cri?: string;
  lumen?: string;
  lumenOutput?: string;
  voltage?: string;
  beamAngle?: string;
  diffuserType?: string;
  finish?: string;
  ugr?: string;
  lifespan?: string;
  dimmable?: string;
  warranty?: string;
}

export interface ProductFile {
  name: string;
  type: 'IES' | 'LDT' | 'PDF' | 'CAD' | 'DOC';
  size: string;
  url?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  categories?: ProductCategory[];
  categoryName: {
    az: string;
    en: string;
    ru: string;
  };
  categoryNames?: {
    az: string;
    en: string;
    ru: string;
  }[];
  subtitle: {
    az: string;
    en: string;
    ru: string;
  };
  code: string;
  image: string;
  gallery: string[];
  description: {
    az: string;
    en: string;
    ru: string;
  };
  specs: ProductSpec;
  files: ProductFile[];
  featured?: boolean;
  isNew?: boolean;
  applications?: string[];
}

export type ProjectCategory = 'all' | 'commercial' | 'office' | 'restaurant' | 'hotel' | 'residential';

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: ProjectCategory;
  categoryName: {
    az: string;
    en: string;
    ru: string;
  };
  client: string;
  location: string;
  year: string;
  architect?: string;
  coverImage: string;
  gallery: string[];
  shortDescription: {
    az: string;
    en: string;
    ru: string;
  };
  fullDescription: {
    az: string;
    en: string;
    ru: string;
  };
  lightingSolution: {
    az: string;
    en: string;
    ru: string;
  };
  productsUsed: string[]; // product ids or names
  metrics?: {
    label: { az: string; en: string; ru: string };
    value: string;
  }[];
  featured?: boolean;
}

export interface Solution {
  id: string;
  slug: string;
  title: {
    az: string;
    en: string;
    ru: string;
  };
  subtitle: {
    az: string;
    en: string;
    ru: string;
  };
  description: {
    az: string;
    en: string;
    ru: string;
  };
  image: string;
  gallery?: string[];
  keyFeatures: {
    az: string[];
    en: string[];
    ru: string[];
  };
  recommendedProductIds: string[];
  projectIds: string[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: {
    az: string;
    en: string;
    ru: string;
  };
  category: string;
  date: string;
  readTime: string;
  coverImage: string;
  gallery?: string[];
  author: string;
  summary: {
    az: string;
    en: string;
    ru: string;
  };
  content: {
    az: string[];
    en: string[];
    ru: string[];
  };
}

export interface ConfiguratorState {
  profileType: 'linear-40' | 'slim-20' | 'recessed-50' | 'ultra-rail' | string;
  mounting: 'suspended' | 'surface' | 'recessed' | 'trimless' | string;
  length: number; // in mm
  cct: '2700k' | '3000k' | '4000k' | 'tunable' | string;
  finish: 'black' | 'white' | 'anodized' | 'custom' | string;
  control: 'on-off' | 'dali' | 'triac' | 'wireless' | string;
  diffuser: 'microprismatic' | 'opal' | 'dark-reflector' | string;
  accessories?: string[];
  powerWPerM?: number;
  cctKelvin?: number;
  profileId?: string;
  lengthMm?: number;
  finishColor?: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  subject?: string;
  message: string;
  productCode?: string;
  productName?: string;
  productImage?: string;
  productCategory?: string;
  productSpecs?: Record<string, any>;
  roomPreset?: string;
  configSummary?: string;
  projectType?: string;
  ipHash?: string;
  userAgent?: string;
  createdAt: string;
  status: 'new' | 'in_progress' | 'contacted' | 'completed';
}

export type UserRole = 'admin' | 'moderator';

export interface UserProfile {
  id: string;
  role: UserRole;
  email?: string;
}

export interface AboutPagePillar {
  id: string;
  label: { az: string; en: string; ru: string };
  desc: { az: string; en: string; ru: string };
}

export interface AboutPageContent {
  badge: { az: string; en: string; ru: string };
  titleA: { az: string; en: string; ru: string };
  titleB: { az: string; en: string; ru: string };
  subtitle: { az: string; en: string; ru: string };
  storyTitle: { az: string; en: string; ru: string };
  storyP1: { az: string; en: string; ru: string };
  storyP2: { az: string; en: string; ru: string };
  facilityPoints: {
    az: string[];
    en: string[];
    ru: string[];
  };
  images: {
    mainFacility: string;
    workshop1: string;
    workshop2: string;
  };
  pillarsTitle: { az: string; en: string; ru: string };
  pillars: AboutPagePillar[];
}

export interface ContactPageContent {
  title: { az: string; en: string; ru: string };
  subtitle: { az: string; en: string; ru: string };
  phone: string;
  email: string;
  address: { az: string; en: string; ru: string };
  hours: { az: string; en: string; ru: string };
}

export interface HomePageContent {
  heroTitleA: { az: string; en: string; ru: string };
  heroTitleB: { az: string; en: string; ru: string };
  heroDesc: { az: string; en: string; ru: string };
  heroCta: { az: string; en: string; ru: string };
  desktopLampImage: string;
  mobileLampImage: string;
  discoveryTitleA: { az: string; en: string; ru: string };
  discoveryTitleB: { az: string; en: string; ru: string };
  discoverySub: { az: string; en: string; ru: string };
  featuredEyebrow: { az: string; en: string; ru: string };
  featuredDesc: { az: string; en: string; ru: string };
  appsEyebrow: { az: string; en: string; ru: string };
  appsTitleA: { az: string; en: string; ru: string };
  appsTitleB: { az: string; en: string; ru: string };
}

export interface SitePagesData {
  about: AboutPageContent;
  contact: ContactPageContent;
  home: HomePageContent;
}
