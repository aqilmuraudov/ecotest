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
