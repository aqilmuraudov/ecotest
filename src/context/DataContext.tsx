import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, BlogPost, Project, Inquiry, CategoryItem } from '../types';
import { products as initialProducts, productCategoriesList } from '../data/products';
import { blogPosts as initialBlogPosts } from '../data/blog';
import { projects as initialProjects } from '../data/projects';
import { supabase } from '../lib/supabase';

// Convert productCategoriesList to CategoryItem array (excluding 'all')
const defaultCategories: CategoryItem[] = productCategoriesList
  .filter(c => c.id !== 'all')
  .map((c, idx) => ({
    id: c.id,
    nameAz: c.nameAz,
    nameEn: c.nameEn,
    nameRu: c.nameRu,
    order: idx + 1
  }));

interface DataContextType {
  products: Product[];
  categories: CategoryItem[];
  blogPosts: BlogPost[];
  projects: Project[];
  inquiries: Inquiry[];
  isLoading: boolean;
  isSyncing: boolean;
  supabaseConnected: boolean;
  supabaseError: string | null;
  
  // Product Operations
  addProduct: (product: Omit<Product, 'id'> & { id?: string }) => Promise<{ success: boolean; error?: string }>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<{ success: boolean; error?: string }>;
  deleteProduct: (id: string) => Promise<{ success: boolean; error?: string }>;
  deleteAllProducts: () => Promise<{ success: boolean; error?: string }>;
  bulkImportProducts: (products: Product[]) => Promise<{ success: boolean; count: number; error?: string }>;

  // Category Operations
  addCategory: (category: CategoryItem) => Promise<{ success: boolean; error?: string }>;
  updateCategory: (id: string, category: Partial<CategoryItem>) => Promise<{ success: boolean; error?: string }>;
  deleteCategory: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Blog / News Operations
  addBlogPost: (post: Omit<BlogPost, 'id'> & { id?: string }) => Promise<{ success: boolean; error?: string }>;
  updateBlogPost: (id: string, post: Partial<BlogPost>) => Promise<{ success: boolean; error?: string }>;
  deleteBlogPost: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Project Operations
  addProject: (project: Omit<Project, 'id'> & { id?: string }) => Promise<{ success: boolean; error?: string }>;
  updateProject: (id: string, project: Partial<Project>) => Promise<{ success: boolean; error?: string }>;
  deleteProject: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Inquiries / Leads Operations
  addInquiry: (inquiry: Omit<Inquiry, 'id' | 'createdAt' | 'status'>) => Promise<{ success: boolean; error?: string }>;
  updateInquiryStatus: (id: string, status: Inquiry['status']) => Promise<{ success: boolean; error?: string }>;
  deleteInquiry: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Database Sync & Seeding
  seedAllToSupabase: () => Promise<{ success: boolean; message: string }>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const LOCAL_STORAGE_PRODUCTS = 'ecolife_custom_products';
const LOCAL_STORAGE_CATEGORIES = 'ecolife_custom_categories';
const LOCAL_STORAGE_BLOG = 'ecolife_custom_blog';
const LOCAL_STORAGE_PROJECTS = 'ecolife_custom_projects';
const LOCAL_STORAGE_INQUIRIES = 'ecolife_custom_inquiries';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PRODUCTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialProducts;
  });

  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CATEGORIES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultCategories;
  });

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_BLOG);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialBlogPosts;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PROJECTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialProjects;
  });

  const [inquiries, setInquiries] = useState<Inquiry[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_INQUIRIES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  // Helper to persist local fallback
  const saveToLocal = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  };

  // Convert DB product record to Product interface
  const mapDbToProduct = (dbRow: any): Product => {
    const rawCategories: string[] = Array.isArray(dbRow.categories) && dbRow.categories.length > 0
      ? dbRow.categories
      : (dbRow.category ? [dbRow.category] : []);
    return {
      id: dbRow.id,
      slug: dbRow.slug,
      name: dbRow.name,
      category: dbRow.category,
      categories: rawCategories,
      categoryName: dbRow.category_name || { az: dbRow.category, en: dbRow.category, ru: dbRow.category },
      categoryNames: Array.isArray(dbRow.category_names) && dbRow.category_names.length > 0
        ? dbRow.category_names
        : [{ az: dbRow.category, en: dbRow.category, ru: dbRow.category }],
      subtitle: dbRow.subtitle || { az: '', en: '', ru: '' },
      code: dbRow.code,
      image: dbRow.image,
      gallery: dbRow.gallery || [dbRow.image],
      description: dbRow.description || { az: '', en: '', ru: '' },
      specs: dbRow.specs || { material: 'Aluminium', dimensions: '', ipRating: 'IP20', mounting: 'Surface' },
      files: dbRow.files || [],
      featured: dbRow.featured || false,
      isNew: dbRow.is_new || false,
      applications: dbRow.applications || []
    };
  };

  // Convert Product interface to DB product record
  const mapProductToDb = (p: any) => {
    const cats: string[] = Array.isArray(p.categories) && p.categories.length > 0
      ? p.categories
      : (p.category ? [p.category] : []);
    const catNames = Array.isArray(p.categoryNames) && p.categoryNames.length > 0
      ? p.categoryNames
      : (p.categoryName ? [p.categoryName] : []);
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      categories: cats,
      category_name: p.categoryName,
      category_names: catNames,
      subtitle: p.subtitle,
      code: p.code,
      image: p.image,
      gallery: p.gallery,
      description: p.description,
      specs: p.specs,
      files: p.files,
      featured: p.featured || false,
      is_new: p.isNew || false,
      applications: p.applications || [],
      updated_at: new Date().toISOString()
    };
  };

  // Convert DB article record to BlogPost interface
  const mapDbToBlog = (dbRow: any): BlogPost => ({
    id: dbRow.id,
    slug: dbRow.slug,
    title: dbRow.title || { az: '', en: '', ru: '' },
    category: dbRow.category,
    date: dbRow.date,
    readTime: dbRow.read_time || '5 min',
    coverImage: dbRow.cover_image,
    gallery: dbRow.gallery || (dbRow.cover_image ? [dbRow.cover_image] : []),
    author: dbRow.author,
    summary: dbRow.summary || { az: '', en: '', ru: '' },
    content: dbRow.content || { az: [], en: [], ru: [] }
  });

  // Convert BlogPost interface to DB record
  const mapBlogToDb = (b: BlogPost) => ({
    id: b.id,
    slug: b.slug,
    title: b.title,
    category: b.category,
    date: b.date,
    read_time: b.readTime,
    cover_image: b.coverImage,
    gallery: b.gallery || (b.coverImage ? [b.coverImage] : []),
    author: b.author,
    summary: b.summary,
    content: b.content,
    updated_at: new Date().toISOString()
  });

  // Convert DB project record to Project interface
  const mapDbToProject = (dbRow: any): Project => ({
    id: dbRow.id,
    slug: dbRow.slug,
    title: dbRow.title,
    category: dbRow.category,
    categoryName: dbRow.category_name || { az: dbRow.category, en: dbRow.category, ru: dbRow.category },
    client: dbRow.client,
    location: dbRow.location,
    year: dbRow.year,
    architect: dbRow.architect,
    coverImage: dbRow.cover_image,
    gallery: dbRow.gallery || [dbRow.cover_image],
    shortDescription: dbRow.short_description || { az: '', en: '', ru: '' },
    fullDescription: dbRow.full_description || { az: '', en: '', ru: '' },
    lightingSolution: dbRow.lighting_solution || { az: '', en: '', ru: '' },
    productsUsed: dbRow.products_used || [],
    metrics: dbRow.metrics || [],
    featured: dbRow.featured || false
  });

  // Convert Project interface to DB record
  const mapProjectToDb = (pr: Project) => ({
    id: pr.id,
    slug: pr.slug,
    title: pr.title,
    category: pr.category,
    category_name: pr.categoryName,
    client: pr.client,
    location: pr.location,
    year: pr.year,
    architect: pr.architect,
    cover_image: pr.coverImage,
    gallery: pr.gallery,
    short_description: pr.shortDescription,
    full_description: pr.fullDescription,
    lighting_solution: pr.lightingSolution,
    products_used: pr.productsUsed,
    metrics: pr.metrics,
    featured: pr.featured || false
  });

  // Fetch all data from Supabase
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setSupabaseError(null);

    try {
      // 1. Fetch Products
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (prodError) {
        throw prodError;
      }

      if (prodData && prodData.length > 0) {
        const loadedProducts = prodData.map(mapDbToProduct);
        setProducts(loadedProducts);
        saveToLocal(LOCAL_STORAGE_PRODUCTS, loadedProducts);
      }

      // 2. Fetch Blog Articles
      const { data: blogData, error: blogErr } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!blogErr && blogData && blogData.length > 0) {
        const loadedBlog = blogData.map(mapDbToBlog);
        setBlogPosts(loadedBlog);
        saveToLocal(LOCAL_STORAGE_BLOG, loadedBlog);
      }

      // 3. Fetch Projects
      const { data: projData, error: projErr } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (!projErr && projData && projData.length > 0) {
        const loadedProjects = projData.map(mapDbToProject);
        setProjects(loadedProjects);
        saveToLocal(LOCAL_STORAGE_PROJECTS, loadedProjects);
      }

      // 4. Fetch Inquiries
      const { data: inqData, error: inqErr } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (!inqErr && inqData) {
        const loadedInquiries: Inquiry[] = inqData.map(d => ({
          id: d.id,
          name: d.name,
          email: d.email,
          phone: d.phone,
          company: d.company,
          subject: d.subject,
          message: d.message,
          productCode: d.product_code,
          productName: d.product_name,
          roomPreset: d.room_preset,
          configSummary: d.config_summary,
          status: d.status || 'new',
          createdAt: d.created_at || new Date().toISOString()
        }));
        setInquiries(loadedInquiries);
        saveToLocal(LOCAL_STORAGE_INQUIRIES, loadedInquiries);
      }

      // 5. Fetch Categories
      const { data: catData, error: catErr } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (!catErr && catData && catData.length > 0) {
        const loadedCategories: CategoryItem[] = catData.map(c => ({
          id: c.id,
          nameAz: c.name_az,
          nameEn: c.name_en,
          nameRu: c.name_ru,
          description: c.description || '',
          order: c.display_order || 0
        }));
        setCategories(loadedCategories);
        saveToLocal(LOCAL_STORAGE_CATEGORIES, loadedCategories);
      }

      setSupabaseConnected(true);
    } catch (err: any) {
      console.warn('Supabase fetch notice:', err?.message || err);
      // If table does not exist or connection failed, keep fallback
      setSupabaseError(err?.message || 'Supabase cədvəlləri hazırda aktivləşdirilməyib');
      setSupabaseConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Category CRUD
  const addCategory = async (catData: CategoryItem): Promise<{ success: boolean; error?: string }> => {
    const cleanId = catData.id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const newCategory: CategoryItem = {
      ...catData,
      id: cleanId,
      order: catData.order || categories.length + 1
    };

    // Check if ID already exists
    if (categories.some(c => c.id === cleanId)) {
      return { success: false, error: `"${cleanId}" ID-li kateqoriya artıq mövcuddur.` };
    }

    const updated = [...categories, newCategory];
    setCategories(updated);
    saveToLocal(LOCAL_STORAGE_CATEGORIES, updated);

    try {
      const dbRow = {
        id: newCategory.id,
        name_az: newCategory.nameAz,
        name_en: newCategory.nameEn,
        name_ru: newCategory.nameRu,
        description: newCategory.description || '',
        display_order: newCategory.order || 0
      };
      const { error } = await supabase.from('categories').upsert([dbRow]);
      if (error) {
        return { success: true, error: `Lokal yaddaşa yazıldı. (Supabase bildirişi: ${error.message})` };
      }
      return { success: true };
    } catch (e: any) {
      return { success: true, error: e?.message };
    }
  };

  const updateCategory = async (id: string, updatedFields: Partial<CategoryItem>): Promise<{ success: boolean; error?: string }> => {
    const updated = categories.map(c => c.id === id ? { ...c, ...updatedFields } : c);
    setCategories(updated);
    saveToLocal(LOCAL_STORAGE_CATEGORIES, updated);

    try {
      const target = updated.find(c => c.id === id);
      if (target) {
        const dbRow = {
          id: target.id,
          name_az: target.nameAz,
          name_en: target.nameEn,
          name_ru: target.nameRu,
          description: target.description || '',
          display_order: target.order || 0
        };
        const { error } = await supabase.from('categories').upsert([dbRow]);
        if (error) return { success: true, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      return { success: true, error: e?.message };
    }
  };

  const deleteCategory = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    saveToLocal(LOCAL_STORAGE_CATEGORIES, updated);

    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) return { success: true, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: true, error: e?.message };
    }
  };

  // Product CRUD
  const addProduct = async (productData: Omit<Product, 'id'> & { id?: string }): Promise<{ success: boolean; error?: string }> => {
    const newId = productData.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newProduct: Product = {
      ...productData,
      id: newId,
      slug: productData.slug || newId
    } as Product;

    // Update local state immediately for responsive UI
    const updated = [newProduct, ...products];
    setProducts(updated);
    saveToLocal(LOCAL_STORAGE_PRODUCTS, updated);

    // Sync to Supabase
    try {
      const dbRow = mapProductToDb(newProduct);
      const { error } = await supabase.from('products').upsert([dbRow]);
      if (error) {
        console.warn('Supabase add product notice:', error.message);
        return { success: true, error: `Lokal yaddaşa yazıldı. (Supabase bildirişi: ${error.message})` };
      }
      return { success: true };
    } catch (e: any) {
      return { success: true, error: e?.message };
    }
  };

  const updateProduct = async (id: string, updatedFields: Partial<Product>): Promise<{ success: boolean; error?: string }> => {
    const updated = products.map(p => p.id === id ? { ...p, ...updatedFields } : p);
    setProducts(updated);
    saveToLocal(LOCAL_STORAGE_PRODUCTS, updated);

    try {
      const target = updated.find(p => p.id === id);
      if (target) {
        const dbRow = mapProductToDb(target);
        const { error } = await supabase.from('products').upsert([dbRow]);
        if (error) {
          return { success: true, error: error.message };
        }
      }
      return { success: true };
    } catch (e: any) {
      return { success: true, error: e?.message };
    }
  };

  const deleteProduct = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    saveToLocal(LOCAL_STORAGE_PRODUCTS, updated);

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        return { success: true, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      return { success: true, error: e?.message };
    }
  };

  const deleteAllProducts = async (): Promise<{ success: boolean; error?: string }> => {
    setProducts([]);
    saveToLocal(LOCAL_STORAGE_PRODUCTS, []);

    try {
      const { error } = await supabase.from('products').delete().neq('id', '___none___');
      if (error) {
        return { success: true, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      return { success: true, error: e?.message };
    }
  };

  const bulkImportProducts = async (newProducts: Product[]): Promise<{ success: boolean; count: number; error?: string }> => {
    try {
      // QORUMA: id/slug olmayan (xam JSON) məhsullara unikal id + slug ver.
      // Əks halda aşağıdakı Map birləşməsində bütün məhsullar eyni (undefined) açara
      // düşür və hamısı son məhsulla əvəz olunaraq 1-ə enir.
      const seenBatch = new Set<string>();
      const stamped = (newProducts || []).map((p, i) => {
        let id = typeof p?.id === 'string' && p.id.trim() ? p.id.trim() : '';
        if (!id) {
          id = `imported-${Date.now()}-${i}`;
          while (seenBatch.has(id)) {
            id = `imported-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`;
          }
        }
        seenBatch.add(id);
        const slug = typeof p?.slug === 'string' && p.slug.trim() ? p.slug.trim() : id;
        return { ...p, id, slug };
      });

      const existingMap = new Map(products.map(p => [p.id, p]));
      for (const p of stamped) {
        existingMap.set(p.id, p);
      }
      const combined = Array.from(existingMap.values());
      setProducts(combined);
      saveToLocal(LOCAL_STORAGE_PRODUCTS, combined);

      const dbRows = combined.map(mapProductToDb);
      const { error } = await supabase.from('products').upsert(dbRows);
      if (error) {
        return { success: true, count: stamped.length, error: `Lokal yaddaşa yazıldı, Supabase xətası: ${error.message}` };
      }
      return { success: true, count: stamped.length };
    } catch (e: any) {
      return { success: false, count: 0, error: e?.message };
    }
  };

  // Blog / News CRUD
  const addBlogPost = async (postData: Omit<BlogPost, 'id'> & { id?: string }): Promise<{ success: boolean; error?: string }> => {
    const newId = postData.id || `post-${Date.now()}`;
    const newPost: BlogPost = {
      ...postData,
      id: newId,
      slug: postData.slug || newId
    } as BlogPost;

    const updated = [newPost, ...blogPosts];
    setBlogPosts(updated);
    saveToLocal(LOCAL_STORAGE_BLOG, updated);

    try {
      const dbRow = mapBlogToDb(newPost);
      const { error } = await supabase.from('articles').upsert([dbRow]);
      if (error) return { success: true, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: true, error: e?.message };
    }
  };

  const updateBlogPost = async (id: string, updatedFields: Partial<BlogPost>): Promise<{ success: boolean; error?: string }> => {
    const updated = blogPosts.map(b => b.id === id ? { ...b, ...updatedFields } : b);
    setBlogPosts(updated);
    saveToLocal(LOCAL_STORAGE_BLOG, updated);

    try {
      const target = updated.find(b => b.id === id);
      if (target) {
        const dbRow = mapBlogToDb(target);
        const { error } = await supabase.from('articles').upsert([dbRow]);
        if (error) return { success: true, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      return { success: true, error: e?.message };
    }
  };

  const deleteBlogPost = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const updated = blogPosts.filter(b => b.id !== id);
    setBlogPosts(updated);
    saveToLocal(LOCAL_STORAGE_BLOG, updated);

    try {
      const { error } = await supabase.from('articles').delete().eq('id', id);
      if (error) return { success: true, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: true, error: e?.message };
    }
  };

  // Projects CRUD
  const addProject = async (projData: Omit<Project, 'id'> & { id?: string }): Promise<{ success: boolean; error?: string }> => {
    const newId = projData.id || `proj-${Date.now()}`;
    const newProject: Project = {
      ...projData,
      id: newId,
      slug: projData.slug || newId
    } as Project;

    const updated = [newProject, ...projects];
    setProjects(updated);
    saveToLocal(LOCAL_STORAGE_PROJECTS, updated);

    try {
      const dbRow = mapProjectToDb(newProject);
      const { error } = await supabase.from('projects').upsert([dbRow]);
      if (error) return { success: true, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: true, error: e?.message };
    }
  };

  const updateProject = async (id: string, updatedFields: Partial<Project>): Promise<{ success: boolean; error?: string }> => {
    const updated = projects.map(p => p.id === id ? { ...p, ...updatedFields } : p);
    setProjects(updated);
    saveToLocal(LOCAL_STORAGE_PROJECTS, updated);

    try {
      const target = updated.find(p => p.id === id);
      if (target) {
        const dbRow = mapProjectToDb(target);
        const { error } = await supabase.from('projects').upsert([dbRow]);
        if (error) return { success: true, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      return { success: true, error: e?.message };
    }
  };

  const deleteProject = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    saveToLocal(LOCAL_STORAGE_PROJECTS, updated);

    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) return { success: true, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: true, error: e?.message };
    }
  };

  // Inquiries CRUD
  const addInquiry = async (inqData: Omit<Inquiry, 'id' | 'createdAt' | 'status'>): Promise<{ success: boolean; error?: string }> => {
    const newInquiry: Inquiry = {
      ...inqData,
      id: `inq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      status: 'new'
    };

    const updated = [newInquiry, ...inquiries];
    setInquiries(updated);
    saveToLocal(LOCAL_STORAGE_INQUIRIES, updated);

    try {
      const dbRow = {
        name: inqData.name,
        email: inqData.email,
        phone: inqData.phone,
        company: inqData.company || null,
        subject: inqData.subject || null,
        message: inqData.message,
        product_code: inqData.productCode || null,
        product_name: inqData.productName || null,
        room_preset: inqData.roomPreset || null,
        config_summary: inqData.configSummary || null,
        status: 'new',
        ip_hash: (inqData as any).ipHash || null,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 250) : null,
      };
      const { error } = await supabase.from('inquiries').insert([dbRow]);
      if (error) {
        console.warn('Inquiry insert warning:', error.message);
      }
      return { success: true };
    } catch (e: any) {
      console.error('Inquiry insert error:', e);
      return { success: true };
    }
  };

  const updateInquiryStatus = async (id: string, status: Inquiry['status']): Promise<{ success: boolean; error?: string }> => {
    const updated = inquiries.map(i => i.id === id ? { ...i, status } : i);
    setInquiries(updated);
    saveToLocal(LOCAL_STORAGE_INQUIRIES, updated);

    try {
      await supabase.from('inquiries').update({ status }).eq('id', id);
      return { success: true };
    } catch (e: any) {
      return { success: true, error: e?.message };
    }
  };

  const deleteInquiry = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const updated = inquiries.filter(i => i.id !== id);
    setInquiries(updated);
    saveToLocal(LOCAL_STORAGE_INQUIRIES, updated);

    try {
      await supabase.from('inquiries').delete().eq('id', id);
      return { success: true };
    } catch (e: any) {
      return { success: true, error: e?.message };
    }
  };

  // One-click Seeder to upload all initial catalog items, projects, and articles to Supabase
  const seedAllToSupabase = async (): Promise<{ success: boolean; message: string }> => {
    setIsSyncing(true);
    try {
      // 1. Seed Products
      const prodRows = initialProducts.map(mapProductToDb);
      const { error: prodErr } = await supabase.from('products').upsert(prodRows);
      if (prodErr) throw new Error(`Products xətası: ${prodErr.message}`);

      // 2. Seed Articles
      const blogRows = initialBlogPosts.map(mapBlogToDb);
      const { error: blogErr } = await supabase.from('articles').upsert(blogRows);
      if (blogErr) throw new Error(`Articles xətası: ${blogErr.message}`);

      // 3. Seed Projects
      const projRows = initialProjects.map(mapProjectToDb);
      const { error: projErr } = await supabase.from('projects').upsert(projRows);
      if (projErr) throw new Error(`Projects xətası: ${projErr.message}`);

      // 4. Seed Categories
      const catRows = categories.map(c => ({
        id: c.id,
        name_az: c.nameAz,
        name_en: c.nameEn,
        name_ru: c.nameRu,
        description: c.description || '',
        display_order: c.order || 0
      }));
      const { error: catErr } = await supabase.from('categories').upsert(catRows);
      if (catErr) console.warn('Categories seed warning:', catErr.message);

      // Refresh to confirm
      await refreshData();
      setSupabaseConnected(true);
      return { 
        success: true, 
        message: `Uğurla tamamlandı! ${initialProducts.length} məhsul, ${categories.length} kateqoriya, ${initialProjects.length} layihə və ${initialBlogPosts.length} məqalə Supabase bazasına yükləndi.` 
      };
    } catch (err: any) {
      console.error('Seed error:', err);
      return { 
        success: false, 
        message: err.message || 'Supabase bazasına yazarkən xəta baş verdi. Əvvəlcə SQL Editor-da cədvəlləri yaradın.' 
      };
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <DataContext.Provider
      value={{
        products,
        categories,
        blogPosts,
        projects,
        inquiries,
        isLoading,
        isSyncing,
        supabaseConnected,
        supabaseError,
        addProduct,
        updateProduct,
        deleteProduct,
        deleteAllProducts,
        bulkImportProducts,
        addCategory,
        updateCategory,
        deleteCategory,
        addBlogPost,
        updateBlogPost,
        deleteBlogPost,
        addProject,
        updateProject,
        deleteProject,
        addInquiry,
        updateInquiryStatus,
        deleteInquiry,
        seedAllToSupabase,
        refreshData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
