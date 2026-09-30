import React, { useState, useEffect, useMemo } from 'react';
import { Language, Product, BlogPost, Project, Inquiry, UserProfile } from '../types';
import { useData } from '../context/DataContext';
import { getLocalizedText } from '../utils/lang';
import {
  SUPABASE_URL,
  SUPABASE_SQL_SCHEMA,
  testSupabaseConnection,
  getStorageBucketName,
  setStorageBucketName
} from '../lib/supabase';
import { signInWithEmail, signOut, hasAdminSessionMarker, getCurrentAdmin } from '../utils/auth';
import { sanitizeEmail, sanitizeText } from '../utils/sanitize';
import { normalizeImportedProducts } from '../utils/importProducts';
import { CategoryManagerModal } from '../components/CategoryManagerModal';
import { ProductFormModal } from '../components/admin/ProductFormModal';
import { BlogFormModal } from '../components/admin/BlogFormModal';
import { ProjectFormModal } from '../components/admin/ProjectFormModal';
import { InquiryViewModal } from '../components/admin/InquiryViewModal';
import { UsersTab } from '../components/admin/UsersTab';
import { adminTranslations } from '../data/adminTranslations';
import { 
  Database, 
  Plus, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  Copy, 
  Layers, 
  FileText, 
  Briefcase, 
  Mail, 
  Search, 
  Lock, 
  Unlock, 
  LogOut, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  UploadCloud,
  ChevronRight,
  FolderPlus,
  Globe,
  Users,
  UserPlus,
  UserCog,
  Phone,
  MessageSquare,
  Flame,
  Filter
} from 'lucide-react';

interface AdminPageProps {
  currentLang: Language;
  onNavigate: (page: string, param?: string) => void;
  onLanguageChange?: (lang: Language) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ 
  currentLang, 
  onNavigate, 
  onLanguageChange 
}) => {
  const t = adminTranslations[currentLang] || adminTranslations.az;
  const {
    products,
    categories,
    blogPosts,
    projects,
    inquiries,
    isLoading,
    isSyncing,
    addProduct,
    updateProduct,
    deleteProduct,
    deleteAllProducts,
    bulkImportProducts,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    addProject,
    updateProject,
    deleteProject,
    updateInquiryStatus,
    deleteInquiry,
    seedAllToSupabase,
    refreshData
  } = useData();

  // Authentication State - Supabase Auth istifadə edir
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return hasAdminSessionMarker();
  });
  const [userRole, setUserRole] = useState<'admin' | 'moderator'>('moderator'); // Default to moderator for safety
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  useEffect(() => {
    const checkSession = async () => {
      const session = await getCurrentAdmin();
      if (session) {
        setIsAuthenticated(true);
        setUserRole(session.role as 'admin' | 'moderator');
      } else {
        setIsAuthenticated(false);
      }
    };
    
    if (isAuthenticated) {
      checkSession();
    }
  }, [isAuthenticated]);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'blog' | 'projects' | 'inquiries' | 'import_export' | 'database'>('overview');

  // Inquiries Search & Filter
  const [inquirySearch, setInquirySearch] = useState<string>('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<'all' | 'new' | 'in_progress' | 'contacted' | 'completed'>('all');

  const newInquiriesCount = useMemo(() => {
    return inquiries.filter(i => i.status === 'new').length;
  }, [inquiries]);

  const filteredInquiries = useMemo(() => {
    return inquiries.filter(inq => {
      // Status filter
      if (inquiryStatusFilter !== 'all' && inq.status !== inquiryStatusFilter) {
        return false;
      }
      // Search query
      const q = inquirySearch.toLowerCase().trim();
      if (!q) return true;
      return (
        inq.name.toLowerCase().includes(q) ||
        inq.phone.toLowerCase().includes(q) ||
        inq.email.toLowerCase().includes(q) ||
        (inq.company && inq.company.toLowerCase().includes(q)) ||
        (inq.productName && inq.productName.toLowerCase().includes(q)) ||
        (inq.productCode && inq.productCode.toLowerCase().includes(q)) ||
        inq.message.toLowerCase().includes(q)
      );
    });
  }, [inquiries, inquiryStatusFilter, inquirySearch]);

  // Import / Export states
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExportCatalog = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ecolife_catalog_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Kataloq uğurla ixrac olundu (JSON)!");
  };

  const parseCSVToProducts = (csvText: string): Product[] => {
    const lines = csvText.split('\n').filter(l => l.trim().length > 0);
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]+/g, ''));
    
    const products: Product[] = [];
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(val => val.trim().replace(/^["']|["']$/g, ''));
      if (row.length < 2) continue;
      
      const getCol = (name: string) => {
        const idx = headers.indexOf(name);
        return idx !== -1 && row[idx] ? row[idx] : '';
      };

      const code = getCol('code') || `ECL-IMP-${i}`;
      const name = getCol('name') || `Product ${i}`;
      const category = getCol('category') || 'linear-profiles';
      const subtitle = getCol('subtitle') || 'Peşəkar İşıqlandırma';
      const description = getCol('description') || 'Yüksək keyfiyyətli memarlıq işıqlandırma məhsulu.';
      const image = getCol('image') || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80';

      products.push({
        id: `imported-${Date.now()}-${i}`,
        slug: `imported-product-${i}-${Date.now()}`,
        name,
        code,
        category,
        categoryName: { az: category, en: category, ru: category },
        subtitle: { az: subtitle, en: subtitle, ru: subtitle },
        image,
        gallery: [image],
        description: { az: description, en: description, ru: description },
        specs: {
          material: 'Alüminium',
          dimensions: '1000 x 50 x 30 mm',
          ipRating: 'IP20',
          mounting: 'Səthə',
          power: '24W',
          cct: '4000K',
          cri: 'CRI > 90',
          lumen: '2200 Lm',
          voltage: '24V DC',
          beamAngle: '120°'
        },
        files: [],
        featured: false,
        isNew: true,
        applications: ['Ofislər', 'Evlər']
      });
    }
    return products;
  };

  const handleDownloadCsvTemplate = () => {
    const csvContent = "code,name,category,subtitle,description,image\nECL-LIN-001,LINEAR ARCHITECTURAL 50,linear-profiles,Peşəkar xətti profil,Yüksək keyfiyyətli işıqlandırma,https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'ecolife_product_template.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast("CSV şablon faylı endirildi!");
  };

  const handleImportCatalog = async () => {
    try {
      const text = importJsonText.trim();
      if (!text) {
        setImportStatus("Zəhmət olmasa JSON və ya CSV məlumatlarını daxil edin.");
        return;
      }
      
      let parsedProducts: Product[] = [];
      if (text.startsWith('[') || text.startsWith('{')) {
        const parsed = JSON.parse(text);
        const rawItems = Array.isArray(parsed) ? parsed : [parsed];
        // Xam JSON (ad, kod, kateqoriya, şəkil...) tam Product strukturasına çevrilir:
        // unikal id/slug, lokalizə description/subtitle, categoryName map, gallery, specs...
        parsedProducts = normalizeImportedProducts(rawItems, categories);
      } else {
        parsedProducts = normalizeImportedProducts(parseCSVToProducts(text), categories);
      }

      if (parsedProducts.length === 0) {
        setImportStatus("Xəta: Heç bir məhsul tapılmadı. Formatı yoxlayın.");
        return;
      }

      const res = await bulkImportProducts(parsedProducts);
      if (res.success) {
        setImportStatus(`Uğurlu! Cəmi ${res.count} məhsul idxal olundu.`);
        showToast(`${res.count} məhsul bazaya əlavə edildi!`);
        setImportJsonText('');
      } else {
        setImportStatus(`Xəta: ${res.error}`);
      }
    } catch (e: any) {
      setImportStatus(`İdxal xətası: ${e.message}`);
    }
  };

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Modals state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);

  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState<boolean>(false);

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState<boolean>(false);

  const [viewingInquiry, setViewingInquiry] = useState<Inquiry | null>(null);

  // Storage bucket config state
  const [bucketNameInput, setBucketNameInput] = useState<string>(() => getStorageBucketName());

  // Status feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Login handler - Supabase Auth ilə təhlükəsiz giriş
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const cleanEmail = sanitizeEmail(emailInput);
    if (!cleanEmail) {
      setAuthError('Düzgün email daxil edin.');
      return;
    }
    if (!passwordInput || passwordInput.length < 8) {
      setAuthError('Parol ən azı 8 simvol olmalıdır.');
      return;
    }

    setIsAuthenticating(true);
    try {
      const result = await signInWithEmail(cleanEmail, passwordInput);
      if (result.success) {
        setIsAuthenticated(true);
        setEmailInput('');
        setPasswordInput('');
      } else {
        setAuthError(result.error || t.auth.errorMsg);
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Autentifikasiya xətası.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setIsAuthenticated(false);
  };

  // Copy SQL schema
  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    showToast(t.database.copiedToast);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // One-click Seed
  const handleSeedData = async () => {
    if (!window.confirm(t.overview.seedConfirm)) return;
    const res = await seedAllToSupabase();
    showToast(res.message);
  };

  // Language Switcher Helper
  const handleLangSelect = (lang: Language) => {
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
  };

  // ==========================================
  // AUTHENTICATION LOGIN SCREEN
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#08090A] text-white pt-24 pb-16 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-[#101115] border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFD21A]/10 rounded-full blur-3xl pointer-events-none" />
          
          {/* Language Toggle in Login */}
          <div className="flex justify-end mb-4">
            <div className="flex items-center gap-1 bg-[#16181F] border border-white/10 p-1 rounded-xl text-xs font-mono">
              {(['az', 'en', 'ru'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => handleLangSelect(lang)}
                  className={`px-2.5 py-1 rounded-lg uppercase transition-all ${
                    currentLang === lang 
                      ? 'bg-[#FFD21A] text-black font-bold' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="text-center space-y-3 mb-8">
            <div className="w-14 h-14 bg-[#FFD21A]/10 border border-[#FFD21A]/30 rounded-2xl mx-auto flex items-center justify-center text-[#FFD21A]">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold uppercase tracking-wide">{t.auth.title}</h1>
            <p className="text-xs text-gray-400 leading-relaxed">
              {t.auth.subtitle}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="E-mail daxil edin"
                autoComplete="email"
                className="w-full bg-[#16181F] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFD21A] transition-colors font-mono"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-1.5">
                {t.auth.passwordLabel}
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder={t.auth.passwordPlaceholder}
                autoComplete="current-password"
                className="w-full bg-[#16181F] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFD21A] transition-colors font-mono"
              />
              {authError && (
                <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{authError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full bg-[#FFD21A] text-black font-bold uppercase tracking-wider text-xs py-3.5 rounded-xl hover:bg-[#F0C413] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,210,26,0.25)] cursor-pointer disabled:opacity-50 disabled:cursor-wait"
            >
              <Unlock className="w-4 h-4" />
              <span>{isAuthenticating ? 'Giriş edilir...' : t.auth.loginBtn}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.az?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.en?.toLowerCase().includes(searchQuery.toLowerCase());
    const pCats: string[] = Array.isArray(p.categories) && p.categories.length > 0
      ? p.categories
      : [p.category];
    const matchesCategory = filterCategory === 'all' || pCats.includes(filterCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#08090A] text-white pt-20 pb-24">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#16181F] border border-[#FFD21A] text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#FFD21A]" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* TOP BAR / ADMIN HEADER */}
      <div className="border-b border-white/10 bg-[#0E0F14] sticky top-16 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFD21A]/10 border border-[#FFD21A]/30 flex items-center justify-center text-[#FFD21A]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold uppercase tracking-wide">{t.header.title}</h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {t.header.supabaseLive}
                </span>
              </div>
              <p className="text-xs text-gray-400">{t.header.subtitle}</p>
            </div>
          </div>

          {/* Quick Actions, Language Switcher & Logout */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-[#16181F] border border-white/10 p-1 rounded-xl text-xs font-mono">
              <Globe className="w-3.5 h-3.5 text-[#FFD21A] ml-1 mr-0.5" />
              {(['az', 'en', 'ru'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => handleLangSelect(lang)}
                  className={`px-2.5 py-1 rounded-lg uppercase transition-all font-bold ${
                    currentLang === lang 
                      ? 'bg-[#FFD21A] text-black' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <button
              onClick={() => refreshData()}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-lg font-mono transition-colors text-gray-300"
              title={t.header.refresh}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{t.header.refresh}</span>
            </button>

            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-lg text-gray-300 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{t.header.goToSite}</span>
            </button>

            <div className="flex items-center gap-1.5 text-xs bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-gray-300 font-mono uppercase">
              <span className={userRole === 'admin' ? 'text-[#FFD21A]' : 'text-blue-400'}>
                {userRole}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-2 rounded-lg transition-colors font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.header.logout}</span>
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5 pt-3 pb-3">
          <div className="flex overflow-x-auto no-scrollbar gap-1.5 pb-1">
            {[
              { id: 'overview', label: t.tabs.overview, icon: Sparkles },
              { id: 'products', label: t.tabs.products, count: products.length, icon: Layers },
              { id: 'blog', label: t.tabs.blog, count: blogPosts.length, icon: FileText },
              { id: 'projects', label: t.tabs.projects, count: projects.length, icon: Briefcase },
              { 
                id: 'inquiries', 
                label: t.tabs.inquiries, 
                count: inquiries.length, 
                highlightCount: newInquiriesCount, 
                icon: Mail 
              },
              ...(userRole === 'admin' ? [
                { id: 'users', label: t.tabs.users, icon: Users },
                { id: 'import_export', label: t.tabs.import_export, icon: UploadCloud },
                { id: 'database', label: t.tabs.database, icon: Database }
              ] : [])
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`group flex items-center gap-2 px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap flex-shrink-0 border ${
                    isActive
                      ? 'bg-[#FFD21A] text-black border-[#FFD21A] shadow-[0_0_20px_rgba(255,210,26,0.15)]'
                      : 'bg-[#12131A] text-gray-400 border-white/5 hover:border-white/10 hover:text-white hover:bg-[#1A1C23]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black/80' : 'text-gray-500 group-hover:text-gray-400 transition-colors'}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono leading-none flex items-center justify-center min-w-[20px] ${
                      tab.highlightCount && tab.highlightCount > 0
                        ? 'bg-amber-400 text-black font-bold animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                        : isActive ? 'bg-black/20 text-black' : 'bg-white/5 text-gray-500 group-hover:bg-white/10 group-hover:text-gray-400'
                    }`}>
                      {tab.highlightCount && tab.highlightCount > 0 ? `+${tab.highlightCount}` : tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ========================================================================= */}
        {/* TAB 0: OVERVIEW & STATS */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div 
                onClick={() => setActiveTab('products')}
                className="bg-[#12141A] border border-white/10 hover:border-[#FFD21A]/50 p-6 rounded-2xl cursor-pointer transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-400 uppercase">{t.overview.totalProducts}</span>
                  <div className="w-8 h-8 rounded-lg bg-[#FFD21A]/10 text-[#FFD21A] flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold mt-3 text-white">{products.length}</div>
                <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <span>{t.overview.manageProducts}</span>
                  <ChevronRight className="w-3 h-3 text-[#FFD21A]" />
                </div>
              </div>

              <div 
                onClick={() => setActiveTab('blog')}
                className="bg-[#12141A] border border-white/10 hover:border-[#FFD21A]/50 p-6 rounded-2xl cursor-pointer transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-400 uppercase">{t.overview.totalArticles}</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold mt-3 text-white">{blogPosts.length}</div>
                <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <span>{t.overview.manageArticles}</span>
                  <ChevronRight className="w-3 h-3 text-blue-400" />
                </div>
              </div>

              <div 
                onClick={() => setActiveTab('projects')}
                className="bg-[#12141A] border border-white/10 hover:border-[#FFD21A]/50 p-6 rounded-2xl cursor-pointer transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-400 uppercase">{t.overview.totalProjects}</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Briefcase className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold mt-3 text-white">{projects.length}</div>
                <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <span>{t.overview.manageProjects}</span>
                  <ChevronRight className="w-3 h-3 text-purple-400" />
                </div>
              </div>

              <div 
                onClick={() => setActiveTab('inquiries')}
                className="bg-[#12141A] border border-white/10 hover:border-[#FFD21A]/50 p-6 rounded-2xl cursor-pointer transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-400 uppercase">{t.overview.totalInquiries}</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold mt-3 text-white">{inquiries.length}</div>
                <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <span>{t.overview.customerInquiries}</span>
                  <ChevronRight className="w-3 h-3 text-emerald-400" />
                </div>
              </div>
            </div>

            {/* Supabase Status Banner */}
            <div className="bg-gradient-to-r from-[#12151E] via-[#101217] to-[#161320] border border-[#FFD21A]/30 rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 bg-[#FFD21A]/10 text-[#FFD21A] px-2.5 py-1 rounded text-xs font-mono font-bold uppercase">
                    <Database className="w-3.5 h-3.5" />
                    <span>{t.overview.supabaseBannerTitle}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {t.overview.supabaseBannerHeading}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                    {t.overview.supabaseBannerText}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleSeedData}
                    disabled={isSyncing}
                    className="flex items-center gap-2 bg-[#FFD21A] text-black font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl hover:bg-[#F0C413] transition-all shadow-[0_0_15px_rgba(255,210,26,0.3)] disabled:opacity-50"
                  >
                    <UploadCloud className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
                    <span>{isSyncing ? t.overview.syncing : t.overview.seedBtn}</span>
                  </button>

                  <button
                    onClick={handleCopySql}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all"
                  >
                    <Copy className="w-4 h-4 text-[#FFD21A]" />
                    <span>{copiedSql ? t.overview.copied : t.overview.sqlScriptBtn}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Products & Inquiries Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Products */}
              <div className="bg-[#101115] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-200">{t.overview.recentProducts}</h4>
                  <button onClick={() => setActiveTab('products')} className="text-xs text-[#FFD21A] hover:underline font-mono">
                    {t.overview.viewAll} →
                  </button>
                </div>
                <div className="space-y-3">
                  {products.slice(0, 4).map((p) => (
                    <div key={p.id} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-black" />
                        <div>
                          <div className="text-xs font-bold text-white">{p.name}</div>
                          <div className="text-[10px] font-mono text-gray-400">
                            {p.code} • {
                              (Array.isArray(p.categories) && p.categories.length > 1)
                                ? `${p.categories.length} kateqoriya: ${p.categories.join(', ')}`
                                : p.category
                            }
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setIsProductModalOpen(true);
                        }}
                        className="text-xs text-gray-400 hover:text-white p-1.5 rounded bg-white/5 hover:bg-white/10"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Inquiries */}
              <div className="bg-[#101115] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-200">{t.overview.recentInquiries}</h4>
                  <button onClick={() => setActiveTab('inquiries')} className="text-xs text-[#FFD21A] hover:underline font-mono">
                    {t.overview.viewAll} →
                  </button>
                </div>
                {inquiries.length === 0 ? (
                  <div className="text-center py-8 text-xs text-gray-500">{t.overview.noInquiries}</div>
                ) : (
                  <div className="space-y-3">
                    {inquiries.slice(0, 4).map((inq) => (
                      <div key={inq.id} className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white">{inq.name} ({inq.phone})</div>
                          <div className="text-[10px] text-gray-400 truncate max-w-xs">{inq.message}</div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FFD21A]/10 text-[#FFD21A]">
                          {inq.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: PRODUCTS (KATALOQ MƏHSULLARI) */}
        {/* ========================================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#101115] p-4 rounded-2xl border border-white/10">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.products.searchPlaceholder}
                    className="w-full bg-[#16181F] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD21A]"
                  />
                </div>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-[#16181F] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFD21A]"
                >
                  <option value="all">{t.products.allCategories}</option>
                  {categories.map((cat) => {
                    const catName = currentLang === 'ru' ? cat.nameRu : currentLang === 'en' ? cat.nameEn : cat.nameAz;
                    return (
                      <option key={cat.id} value={cat.id}>
                        {catName} ({cat.id})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="flex items-center justify-center gap-2 bg-[#1C1F2A] text-white hover:text-[#FFD21A] border border-white/15 hover:border-[#FFD21A]/50 font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-xl transition-all shadow-md whitespace-nowrap"
                  title={t.products.manageCategories}
                >
                  <FolderPlus className="w-4 h-4 text-[#FFD21A]" />
                  <span>{t.products.manageCategories} ({categories.length})</span>
                </button>

                {userRole === 'admin' && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm("Bütün məhsulları silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarılmır.")) {
                        const res = await deleteAllProducts();
                        if (res.success) {
                          alert("Bütün məhsullar uğurla silindi.");
                        } else {
                          alert(`Xəta: ${res.error}`);
                        }
                      }
                    }}
                    className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-xl transition-all whitespace-nowrap cursor-pointer"
                    title="Hamısını sil"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hamısını sil ({products.length})</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setIsProductModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 bg-[#FFD21A] text-black font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl hover:bg-[#F0C413] transition-all shadow-[0_0_15px_rgba(255,210,26,0.3)] whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.products.addNew}</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-[#101115] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-[#16181F] text-gray-400 uppercase font-mono text-[10px] tracking-wider border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3.5">{t.products.tableImage}</th>
                      <th className="px-4 py-3.5">{t.products.tableName}</th>
                      <th className="px-4 py-3.5">{t.products.tableCodeCategory}</th>
                      <th className="px-4 py-3.5">{t.products.tableSpecs}</th>
                      <th className="px-4 py-3.5">{t.products.tableStatus}</th>
                      <th className="px-4 py-3.5 text-right">{t.products.tableActions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">
                          <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover bg-black/60 border border-white/10" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-white text-sm">{p.name}</div>
                          <div className="text-[11px] text-gray-400 truncate max-w-xs">{p.subtitle?.az || p.subtitle?.en}</div>
                        </td>
                         <td className="px-4 py-3 font-mono text-[11px]">
                          <div className="text-[#FFD21A] font-bold">{p.code}</div>
                          <div className="text-gray-400 capitalize">
                            {(Array.isArray(p.categories) && p.categories.length > 1)
                              ? `${p.categories.length} kateqoriya`
                              : p.category}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-gray-300">
                          <div>{p.specs?.power || '—'} / {p.specs?.cct || '—'}</div>
                          <div className="text-gray-400">{p.specs?.ipRating || 'IP20'} • {p.specs?.mounting || 'Surface'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            {p.featured && (
                              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 w-fit">
                                Featured
                              </span>
                            )}
                            {p.isNew && (
                              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 w-fit">
                                NEW
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onNavigate('catalog', p.slug)}
                              title={t.products.viewOnSite}
                              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setIsProductModalOpen(true);
                              }}
                              title={t.products.edit}
                              className="p-2 rounded-lg bg-[#FFD21A]/10 hover:bg-[#FFD21A]/20 text-[#FFD21A] transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {userRole === 'admin' && (
                              <button
                                onClick={async () => {
                                  if (window.confirm(t.products.deleteConfirm.replace('{name}', p.name))) {
                                    await deleteProduct(p.id);
                                    showToast(`"${p.name}" ${t.products.deletedSuccess}`);
                                  }
                                }}
                                title={t.products.delete}
                                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: BLOG & NEWS (XƏBƏRLƏR VƏ MƏQALƏLƏR) */}
        {/* ========================================================================= */}
        {activeTab === 'blog' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-[#101115] p-4 rounded-2xl border border-white/10">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">{t.blog.heading}</h3>
                <p className="text-xs text-gray-400">{t.blog.subheading}</p>
              </div>
              <button
                onClick={() => {
                  setEditingBlog(null);
                  setIsBlogModalOpen(true);
                }}
                className="flex items-center gap-2 bg-[#FFD21A] text-black font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl hover:bg-[#F0C413] transition-all shadow-[0_0_15px_rgba(255,210,26,0.3)] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.blog.addNew}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <div key={post.id} className="bg-[#101115] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-[#FFD21A]/40 transition-all">
                  <div>
                    <div className="relative h-44 overflow-hidden">
                      <img src={post.coverImage} alt={getLocalizedText(post.title, 'az')} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-mono uppercase text-[#FFD21A] border border-white/10">
                        {post.category}
                      </div>
                    </div>
                    <div className="p-5 space-y-2">
                      <div className="text-[10px] font-mono text-gray-400">{post.date} • {post.readTime}</div>
                      <h4 className="text-sm font-bold text-white line-clamp-2">{getLocalizedText(post.title, currentLang)}</h4>
                      <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">{getLocalizedText(post.summary, currentLang)}</p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-white/5 flex items-center justify-between mt-4">
                    <span className="text-[11px] font-mono text-gray-400 truncate max-w-[120px]">{post.author}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingBlog(post);
                          setIsBlogModalOpen(true);
                        }}
                        className="p-2 rounded-lg bg-[#FFD21A]/10 hover:bg-[#FFD21A]/20 text-[#FFD21A] transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {userRole === 'admin' && (
                        <button
                          onClick={async () => {
                            if (window.confirm(t.blog.deleteConfirm)) {
                              await deleteBlogPost(post.id);
                              showToast(t.blog.deletedSuccess);
                            }
                          }}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PROJECTS (LAYİHƏLƏR) */}
        {/* ========================================================================= */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-[#101115] p-4 rounded-2xl border border-white/10">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">{t.projects.heading}</h3>
                <p className="text-xs text-gray-400">{t.projects.subheading}</p>
              </div>
              <button
                onClick={() => {
                  setEditingProject(null);
                  setIsProjectModalOpen(true);
                }}
                className="flex items-center gap-2 bg-[#FFD21A] text-black font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl hover:bg-[#F0C413] transition-all shadow-[0_0_15px_rgba(255,210,26,0.3)] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.projects.addNew}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((proj) => (
                <div key={proj.id} className="bg-[#101115] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-[#FFD21A]/40 transition-all">
                  <div>
                    <div className="relative h-48 overflow-hidden">
                      <img src={proj.coverImage} alt={proj.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-mono uppercase text-[#FFD21A] border border-white/10">
                        {proj.category}
                      </div>
                    </div>
                    <div className="p-5 space-y-2">
                      <div className="text-[10px] font-mono text-gray-400">{proj.location} • {proj.year}</div>
                      <h4 className="text-sm font-bold text-white">{proj.title}</h4>
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{proj.shortDescription?.az || proj.shortDescription?.en}</p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-white/5 flex items-center justify-between mt-4">
                    <span className="text-[11px] font-mono text-gray-400 truncate max-w-[120px]">{proj.client}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onNavigate('projects', proj.slug)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingProject(proj);
                          setIsProjectModalOpen(true);
                        }}
                        className="p-2 rounded-lg bg-[#FFD21A]/10 hover:bg-[#FFD21A]/20 text-[#FFD21A] transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {userRole === 'admin' && (
                        <button
                          onClick={async () => {
                            if (window.confirm(t.projects.deleteConfirm)) {
                              await deleteProject(proj.id);
                              showToast(t.projects.deletedSuccess);
                            }
                          }}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: INQUIRIES (MÜŞTƏRİ SORĞULARI VƏ SMETALAR) */}
        {/* ========================================================================= */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6">
            {/* Header with live status */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#101115] p-5 rounded-2xl border border-white/10 shadow-lg">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-bold uppercase tracking-wider text-white">{t.inquiries.heading}</h3>
                  {newInquiriesCount > 0 && (
                    <span className="flex items-center gap-1 text-[11px] font-mono font-bold bg-amber-400 text-black px-2 py-0.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                      <Flame className="w-3 h-3" />
                      {newInquiriesCount} Yeni
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">{t.inquiries.subheading}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-gray-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-gray-400">Canlı Əlaqə:</span>
                  <span className="text-emerald-400 font-bold">Realtime Aktiv</span>
                </div>
                <span className="text-xs font-mono px-3 py-1.5 bg-[#FFD21A]/10 text-[#FFD21A] rounded-lg border border-[#FFD21A]/30">
                  {t.inquiries.totalLabel}: {inquiries.length}
                </span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#101115] p-3 rounded-xl border border-white/10">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={inquirySearch}
                  onChange={(e) => setInquirySearch(e.target.value)}
                  placeholder="Müştəri adı, telefon, email, məhsul kodu üzrə axtar..."
                  className="w-full bg-[#16181F] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD21A] transition-colors"
                />
              </div>

              {/* Status Filter Pills */}
              <div className="flex overflow-x-auto no-scrollbar gap-1.5 flex-shrink-0">
                {[
                  { id: 'all', label: 'Hamısı', count: inquiries.length },
                  { id: 'new', label: '🟡 Yeni', count: inquiries.filter(i => i.status === 'new').length },
                  { id: 'in_progress', label: '🔵 Baxılır', count: inquiries.filter(i => i.status === 'in_progress').length },
                  { id: 'contacted', label: '🟣 Əlaqə saxlanıldı', count: inquiries.filter(i => i.status === 'contacted').length },
                  { id: 'completed', label: '🟢 Tamamlandı', count: inquiries.filter(i => i.status === 'completed').length },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setInquiryStatusFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap flex items-center gap-1.5 border ${
                      inquiryStatusFilter === f.id
                        ? 'bg-[#FFD21A] text-black font-bold border-[#FFD21A]'
                        : 'bg-[#16181F] text-gray-400 hover:text-white border-white/5 hover:border-white/15'
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded ${inquiryStatusFilter === f.id ? 'bg-black/20 text-black' : 'bg-white/10 text-gray-400'}`}>
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {filteredInquiries.length === 0 ? (
              <div className="bg-[#101115] border border-white/10 rounded-2xl p-12 text-center text-gray-400 space-y-3">
                <Mail className="w-12 h-12 mx-auto text-gray-600" />
                <h4 className="text-base font-bold text-white">
                  {inquirySearch || inquiryStatusFilter !== 'all' ? 'Axtarışa uyğun sorğu tapılmadı' : t.inquiries.noInquiriesTitle}
                </h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  {inquirySearch || inquiryStatusFilter !== 'all' ? 'Filtrləri sıfırlayaraq bütün müştəri sorğularını görə bilərsiniz.' : t.inquiries.noInquiriesDesc}
                </p>
                {(inquirySearch || inquiryStatusFilter !== 'all') && (
                  <button
                    onClick={() => { setInquirySearch(''); setInquiryStatusFilter('all'); }}
                    className="px-4 py-2 text-xs font-bold bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                  >
                    Filtrləri Sıfırla
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-[#101115] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-[#16181F] text-gray-400 uppercase font-mono text-[10px] tracking-wider border-b border-white/10">
                      <tr>
                        <th className="px-4 py-3.5">{t.inquiries.tableDate}</th>
                        <th className="px-4 py-3.5">{t.inquiries.tableCustomer}</th>
                        <th className="px-4 py-3.5">Sorğu Edilən Məhsul</th>
                        <th className="px-4 py-3.5">{t.inquiries.tableMessage}</th>
                        <th className="px-4 py-3.5">{t.inquiries.tableStatus}</th>
                        <th className="px-4 py-3.5 text-right">{t.inquiries.tableActions}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredInquiries.map((inq) => {
                        const cleanPhone = inq.phone?.replace(/[^0-9+]/g, '') || '';
                        const waNumber = cleanPhone.replace(/^\+/, '');
                        const isNew = inq.status === 'new';

                        return (
                          <tr 
                            key={inq.id} 
                            className={`hover:bg-white/5 transition-colors ${isNew ? 'bg-amber-500/[0.04]' : ''}`}
                          >
                            {/* Date */}
                            <td className="px-4 py-3 font-mono text-[10px] text-gray-400 whitespace-nowrap align-top">
                              <div>{new Date(inq.createdAt).toLocaleDateString('az-AZ')}</div>
                              <div className="text-gray-500 text-[9px]">{new Date(inq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                              {isNew && (
                                <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                                  YENİ
                                </span>
                              )}
                            </td>

                            {/* Customer */}
                            <td className="px-4 py-3 align-top min-w-[180px]">
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>{inq.name}</span>
                              </div>
                              {inq.company && <div className="text-[10px] text-gray-400 font-medium">{inq.company}</div>}
                              
                              {/* Quick contact buttons */}
                              <div className="flex items-center gap-2 mt-1 text-[11px] font-mono">
                                <a
                                  href={`tel:${cleanPhone}`}
                                  className="text-[#FFD21A] hover:underline flex items-center gap-0.5"
                                  title="Zəng et"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>{inq.phone}</span>
                                </a>
                              </div>
                              <div className="text-gray-400 text-[10px] font-mono mt-0.5">{inq.email}</div>
                            </td>

                            {/* Product Info */}
                            <td className="px-4 py-3 align-top min-w-[200px]">
                              {(inq.productName || inq.productCode || inq.productImage) ? (
                                <div className="flex items-center gap-2.5 bg-black/40 p-2 rounded-lg border border-white/5">
                                  {inq.productImage && (
                                    <img
                                      src={inq.productImage}
                                      alt={inq.productName || 'Məhsul'}
                                      className="w-10 h-10 object-cover rounded bg-black/60 border border-white/10 flex-shrink-0"
                                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                                    />
                                  )}
                                  <div className="min-w-0">
                                    <div className="font-bold text-white text-xs truncate uppercase">
                                      {inq.productName || 'Məhsul'}
                                    </div>
                                    {inq.productCode && (
                                      <div className="text-[10px] font-mono text-[#FFD21A]">
                                        {inq.productCode}
                                      </div>
                                    )}
                                    {inq.productCategory && (
                                      <div className="text-[9px] text-gray-400 truncate">
                                        {inq.productCategory}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : inq.configSummary ? (
                                <div className="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono p-2 rounded border border-emerald-500/20 max-w-[220px] truncate">
                                  Konfiqurator Sorğusu
                                </div>
                              ) : (
                                <span className="text-[11px] text-gray-500 italic">Ümumi Əlaqə</span>
                              )}
                            </td>

                            {/* Message */}
                            <td className="px-4 py-3 align-top min-w-[220px]">
                              <div className="line-clamp-2 text-xs text-gray-200 leading-relaxed">
                                {inq.message}
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3 align-top whitespace-nowrap">
                              <select
                                value={inq.status}
                                onChange={(e) => updateInquiryStatus(inq.id, e.target.value as any)}
                                className="bg-[#16181F] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-[#FFD21A] transition-colors"
                              >
                                <option value="new">🟡 {t.inquiries.statusNew}</option>
                                <option value="in_progress">🔵 {t.inquiries.statusInProgress}</option>
                                <option value="contacted">🟣 {t.inquiries.statusContacted}</option>
                                <option value="completed">🟢 {t.inquiries.statusCompleted}</option>
                              </select>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3 text-right align-top whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Quick WhatsApp */}
                                {cleanPhone && (
                                  <a
                                    href={`https://wa.me/${waNumber}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-lg bg-green-600/10 hover:bg-green-600/20 text-green-400 border border-green-600/20 transition-colors"
                                    title="WhatsApp ilə yaz"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </a>
                                )}

                                {/* Detailed View Modal */}
                                <button
                                  onClick={() => setViewingInquiry(inq)}
                                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                                  title="Ətraflı Bax"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete */}
                                {userRole === 'admin' && (
                                  <button
                                    onClick={async () => {
                                      if (window.confirm(t.inquiries.deleteConfirm)) {
                                        await deleteInquiry(inq.id);
                                        showToast(t.inquiries.deletedSuccess);
                                      }
                                    }}
                                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                                    title="Sorğunu Sil"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5.5: USERS */}
        {/* ========================================================================= */}
        {activeTab === 'users' && userRole === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <UsersTab />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: DATABASE & STORAGE (SUPABASE) */}
        {/* ========================================================================= */}
        {activeTab === 'database' && (
          <div className="space-y-8">
            {/* Supabase Database Connection & Migration */}
            <div className="bg-[#101115] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-[#FFD21A]" />
                    Supabase PostgreSQL Verilənlər Bazası
                  </h3>
                  <p className="text-xs text-gray-400">{t.database.subheading}</p>
                </div>
                <button
                  onClick={async () => {
                    const res = await testSupabaseConnection();
                    showToast(res.message);
                  }}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/15 px-4 py-2 rounded-xl text-xs font-mono text-white transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#FFD21A]" />
                  <span>{t.database.testConnectionBtn}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#16181F] p-4 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-gray-400">{t.database.projectUrlLabel}</span>
                  <div className="font-mono text-xs text-[#FFD21A] break-all">{SUPABASE_URL}</div>
                </div>

                <div className="bg-[#16181F] p-4 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-gray-400">{t.database.statusLabel}</span>
                  <div className="font-mono text-xs text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.database.statusConnected}</span>
                  </div>
                </div>
              </div>

              {/* Supabase Storage Bucket Settings */}
              <div className="bg-[#16181F] p-5 rounded-xl border border-[#FFD21A]/20 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-[#FFD21A]" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {t.database.storageBucketTitle}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      {t.database.storageBucketDesc}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={bucketNameInput}
                      onChange={(e) => setBucketNameInput(e.target.value)}
                      placeholder="ecolife"
                      className="bg-[#0E0F14] border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-[#FFD21A] focus:outline-none w-32"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setStorageBucketName(bucketNameInput);
                        showToast(`${t.database.bucketUpdatedToast} "${bucketNameInput}"`);
                      }}
                      className="bg-[#FFD21A] text-black font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-[#F0C413] transition-colors whitespace-nowrap cursor-pointer"
                    >
                      {t.database.applyBtn}
                    </button>
                  </div>
                </div>
              </div>

              {/* SQL Migration Script Copy Area */}
              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-gray-300 font-bold">
                    {t.database.sqlScriptTitle}
                  </span>
                  <button
                    onClick={handleCopySql}
                    className="flex items-center gap-1.5 bg-[#FFD21A] text-black font-bold text-xs px-4 py-2 rounded-xl hover:bg-[#F0C413] transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedSql ? t.database.copiedBtn : t.database.copySqlBtn}</span>
                  </button>
                </div>
                <div className="relative">
                  <pre className="bg-[#08090A] border border-white/10 rounded-xl p-4 text-[11px] font-mono text-gray-300 overflow-x-auto max-h-72">
                    {SUPABASE_SQL_SCHEMA}
                  </pre>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  💡 <strong className="text-white">{t.database.howToUseTitle}:</strong> {t.database.howToUseDesc}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: IMPORT / EXPORT CATALOG */}
        {/* ========================================================================= */}
        {activeTab === 'import_export' && (
          <div className="bg-[#12141A] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold uppercase text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#FFD21A]" />
                Kataloq İdxal və İxrac (Import / Export)
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Məhsul məlumatlarını JSON və ya CSV formatında sistemə toplu şəkildə əlavə edin və ya cari məhsul bazasını JSON formatında ehtiyat nüsxə olaraq endirin.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Export Box */}
              <div className="bg-[#16181F] border border-white/10 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase text-white mb-1">1. Cari Kataloqu İxrac Et (Backup)</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Sistemdə mövcud olan bütün məhsulları (şəkillər, qiymətlər, texniki parametrlər və təsvirlərlə birlikdə) JSON formatında kompüterinizə endirin.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportCatalog}
                  className="w-full bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Copy className="w-4 h-4 text-[#FFD21A]" />
                  <span>Kataloqu JSON olaraq endir ({products.length} məhsul)</span>
                </button>
              </div>

              {/* Import from File Box */}
              <div className="bg-[#16181F] border border-white/10 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase text-white mb-1">2. Fayldan Yüklə və ya Şablon Endir</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Kompüterinizdən <code>.json</code> və ya <code>.csv</code> faylı seçərək aşağıdakı mətn qutusuna doldurun və ya nümunə CSV şablonunu endirin.
                  </p>
                </div>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept=".json,.csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        setImportJsonText(evt.target?.result as string || '');
                      };
                      reader.readAsText(file);
                    }}
                    className="text-xs text-gray-400 file:mr-2 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#FFD21A] file:text-black hover:file:bg-[#F0C413] cursor-pointer w-full"
                  />
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleDownloadCsvTemplate}
                      className="text-xs text-[#FFD21A] hover:underline flex items-center gap-1 cursor-pointer font-mono"
                    >
                      <span>📥 CSV Şablon Faylını Endir (Nümunə)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Textarea for JSON/CSV pasting */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-mono uppercase text-gray-300 font-bold">
                JSON və ya CSV Məlumatları (və ya fayl yüklədikdən sonra burada görünəcək):
              </label>
              <textarea
                rows={9}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='[{"code":"ECL-001","name":"LINEAR 50","category":"linear-profiles","image":"https://..."}]'
                className="w-full bg-[#0E0F14] border border-white/15 rounded-xl p-4 text-xs font-mono text-white focus:border-[#FFD21A] focus:outline-none"
              />

              {importStatus && (
                <div className={`p-3.5 rounded-xl border text-xs font-mono ${
                  importStatus.includes('Xəta') || importStatus.includes('Zəhmət olmasa') || importStatus.includes('İdxal xətası')
                    ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                }`}>
                  {importStatus}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleImportCatalog}
                  className="px-6 py-3.5 rounded-xl bg-[#FFD21A] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#F0C413] transition-all shadow-[0_0_15px_rgba(255,210,26,0.3)] flex items-center gap-2 cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Kataloqu Toplu İdxal Et (Bulk Import)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: MANAGE CATEGORIES */}
      {/* ========================================================================= */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        currentLang={currentLang}
      />

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT PRODUCT */}
      {/* ========================================================================= */}
      {isProductModalOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={async (savedData) => {
            if (editingProduct) {
              await updateProduct(editingProduct.id, savedData);
              showToast(t.products.updatedSuccess);
            } else {
              await addProduct(savedData);
              showToast(t.products.addedSuccess);
            }
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }}
          currentLang={currentLang}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT BLOG POST */}
      {/* ========================================================================= */}
      {isBlogModalOpen && (
        <BlogFormModal
          post={editingBlog}
          onClose={() => {
            setIsBlogModalOpen(false);
            setEditingBlog(null);
          }}
          onSave={async (savedData) => {
            if (editingBlog) {
              await updateBlogPost(editingBlog.id, savedData);
              showToast(t.blog.updatedSuccess);
            } else {
              await addBlogPost(savedData);
              showToast(t.blog.addedSuccess);
            }
            setIsBlogModalOpen(false);
            setEditingBlog(null);
          }}
          currentLang={currentLang}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT PROJECT */}
      {/* ========================================================================= */}
      {isProjectModalOpen && (
        <ProjectFormModal
          project={editingProject}
          onClose={() => {
            setIsProjectModalOpen(false);
            setEditingProject(null);
          }}
          onSave={async (savedData) => {
            if (editingProject) {
              await updateProject(editingProject.id, savedData);
              showToast(t.projects.updatedSuccess);
            } else {
              await addProject(savedData);
              showToast(t.projects.addedSuccess);
            }
            setIsProjectModalOpen(false);
            setEditingProject(null);
          }}
          currentLang={currentLang}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW INQUIRY DETAILS */}
      {/* ========================================================================= */}
      {viewingInquiry && (
        <InquiryViewModal
          inquiry={viewingInquiry}
          onClose={() => setViewingInquiry(null)}
          currentLang={currentLang}
        />
      )}
    </div>
  );
};
