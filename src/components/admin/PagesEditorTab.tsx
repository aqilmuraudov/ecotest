import React, { useState } from 'react';
import { Language, SitePagesData, AboutPageContent, ContactPageContent, HomePageContent, AboutPagePillar } from '../../types';
import { useData } from '../../context/DataContext';
import { ImageUploadWidget } from '../ImageUploadWidget';
import { 
  Globe, 
  Save, 
  RotateCcw, 
  ExternalLink, 
  Check, 
  Plus, 
  Trash2, 
  Eye, 
  Layers, 
  FileText, 
  Building2, 
  Phone, 
  Home, 
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface PagesEditorTabProps {
  currentLang: Language;
  onNavigate: (page: string, param?: string) => void;
}

export const PagesEditorTab: React.FC<PagesEditorTabProps> = ({ currentLang, onNavigate }) => {
  const { pagesContent, updatePageContent, resetPageContent } = useData();

  // Active page to edit
  const [selectedPage, setSelectedPage] = useState<'about' | 'home' | 'contact'>('about');

  // Active language for content editing
  const [editLang, setEditLang] = useState<Language>('az');

  // Local working copies of page data
  const [aboutForm, setAboutForm] = useState<AboutPageContent>(() => pagesContent.about);
  const [contactForm, setContactForm] = useState<ContactPageContent>(() => pagesContent.contact);
  const [homeForm, setHomeForm] = useState<HomePageContent>(() => pagesContent.home);

  // Keep in sync if pagesContent changes externally
  React.useEffect(() => {
    setAboutForm(pagesContent.about);
    setContactForm(pagesContent.contact);
    setHomeForm(pagesContent.home);
  }, [pagesContent]);

  // Save states
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // New bullet point input state for About page
  const [newPointInput, setNewPointInput] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    let res = { success: true, error: undefined as string | undefined };
    if (selectedPage === 'about') {
      res = await updatePageContent('about', aboutForm);
    } else if (selectedPage === 'contact') {
      res = await updatePageContent('contact', contactForm);
    } else if (selectedPage === 'home') {
      res = await updatePageContent('home', homeForm);
    }

    setIsSaving(false);
    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } else {
      setSaveError(res.error || 'Dəyişiklikləri yadda saxlayarkən xəta baş verdi.');
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Bu səhifənin məlumatlarını ilkin zavod vəziyyətinə qaytarmaq istədiyinizdən əminsiniz?')) {
      return;
    }
    await resetPageContent(selectedPage);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Facility points helpers for About page
  const addFacilityPoint = () => {
    if (!newPointInput.trim()) return;
    const currentList = aboutForm.facilityPoints[editLang] || [];
    setAboutForm({
      ...aboutForm,
      facilityPoints: {
        ...aboutForm.facilityPoints,
        [editLang]: [...currentList, newPointInput.trim()]
      }
    });
    setNewPointInput('');
  };

  const removeFacilityPoint = (idx: number) => {
    const currentList = aboutForm.facilityPoints[editLang] || [];
    setAboutForm({
      ...aboutForm,
      facilityPoints: {
        ...aboutForm.facilityPoints,
        [editLang]: currentList.filter((_, i) => i !== idx)
      }
    });
  };

  const updateFacilityPoint = (idx: number, val: string) => {
    const currentList = [...(aboutForm.facilityPoints[editLang] || [])];
    currentList[idx] = val;
    setAboutForm({
      ...aboutForm,
      facilityPoints: {
        ...aboutForm.facilityPoints,
        [editLang]: currentList
      }
    });
  };

  // Pillar updates helper for About page
  const updatePillar = (pillarId: string, field: 'label' | 'desc', val: string) => {
    setAboutForm({
      ...aboutForm,
      pillars: aboutForm.pillars.map(p => {
        if (p.id === pillarId) {
          return {
            ...p,
            [field]: {
              ...p[field],
              [editLang]: val
            }
          };
        }
        return p;
      })
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Bar: Page Selector, Language Selector, and Action Buttons */}
      <div className="bg-[#12131A] border border-white/5 p-4 sm:p-5 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Page Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'about', label: 'Haqqımızda (About)', icon: Building2 },
            { id: 'home', label: 'Ana Səhifə (Home)', icon: Home },
            { id: 'contact', label: 'Əlaqə (Contact)', icon: Phone },
          ].map((p) => {
            const Icon = p.icon;
            const isSelected = selectedPage === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPage(p.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FFD21A] text-black shadow-[0_0_15px_rgba(255,210,26,0.2)]'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Language Tabs & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Active Editing Language */}
          <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-1">
            <span className="text-[10px] font-mono text-gray-500 uppercase px-2">DİL:</span>
            {(['az', 'en', 'ru'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setEditLang(lang)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                  editLang === lang
                    ? 'bg-amber-400 text-black shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {lang === 'az' ? 'AZ' : lang === 'en' ? 'EN' : 'RU'}
              </button>
            ))}
          </div>

          {/* View Live Page */}
          <button
            onClick={() => onNavigate(selectedPage)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Səhifəyə canlı baxış keçir"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span>Səhifəyə Bax</span>
          </button>

          {/* Reset to Defaults */}
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 hover:text-red-400 hover:border-red-500/30 transition-colors cursor-pointer"
            title="İlkin standart vəziyyətə qaytar"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sıfırla</span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 bg-[#FFD21A] text-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#F0C413] transition-all cursor-pointer shadow-[0_0_20px_rgba(255,210,26,0.2)] disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Saxlanılır...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Yadda Saxla</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-emerald-400 text-xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Səhifə məlumatları uğurla yeniləndi və canlı saytda tətbiq edildi!</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-400 text-xs animate-fadeIn">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. ABOUT US PAGE EDITOR                                                   */}
      {/* ========================================================================= */}
      {selectedPage === 'about' && (
        <div className="space-y-6">

          {/* Section A: Hero & Header */}
          <div className="bg-[#12131A] border border-white/5 rounded-xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">1. Giriş və Başlıq Hissəsi ({editLang.toUpperCase()})</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1.5">Bölmə Nişanı (Badge):</label>
                <input
                  type="text"
                  value={aboutForm.badge[editLang] || ''}
                  onChange={(e) => setAboutForm({
                    ...aboutForm,
                    badge: { ...aboutForm.badge, [editLang]: e.target.value }
                  })}
                  className="w-full bg-[#181922] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  placeholder="04 — HAQQIMIZDA"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1.5">Alt Başlıq (Subtitle):</label>
                <input
                  type="text"
                  value={aboutForm.subtitle[editLang] || ''}
                  onChange={(e) => setAboutForm({
                    ...aboutForm,
                    subtitle: { ...aboutForm.subtitle, [editLang]: e.target.value }
                  })}
                  className="w-full bg-[#181922] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  placeholder="Biz sadəcə işıq satmırıq..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1.5">Əsas Başlıq Sətir 1 (Title Line 1):</label>
                <input
                  type="text"
                  value={aboutForm.titleA[editLang] || ''}
                  onChange={(e) => setAboutForm({
                    ...aboutForm,
                    titleA: { ...aboutForm.titleA, [editLang]: e.target.value }
                  })}
                  className="w-full bg-[#181922] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  placeholder="işığın"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1.5">Əsas Başlıq Sətir 2 (Title Line 2):</label>
                <input
                  type="text"
                  value={aboutForm.titleB[editLang] || ''}
                  onChange={(e) => setAboutForm({
                    ...aboutForm,
                    titleB: { ...aboutForm.titleB, [editLang]: e.target.value }
                  })}
                  className="w-full bg-[#181922] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  placeholder="arxitekturası"
                />
              </div>
            </div>
          </div>

          {/* Section B: Story & Narrative */}
          <div className="bg-[#12131A] border border-white/5 rounded-xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/5">
              <FileText className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">2. Ecolife Hekayəsi və Təsviri ({editLang.toUpperCase()})</h3>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-gray-400 mb-1.5">Hekayə Başlığı:</label>
              <input
                type="text"
                value={aboutForm.storyTitle[editLang] || ''}
                onChange={(e) => setAboutForm({
                  ...aboutForm,
                  storyTitle: { ...aboutForm.storyTitle, [editLang]: e.target.value }
                })}
                className="w-full bg-[#181922] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                placeholder="Ecolife Hekayəsi"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-gray-400 mb-1.5">Əsas Mətn (1-ci Abzas):</label>
              <textarea
                rows={3}
                value={aboutForm.storyP1[editLang] || ''}
                onChange={(e) => setAboutForm({
                  ...aboutForm,
                  storyP1: { ...aboutForm.storyP1, [editLang]: e.target.value }
                })}
                className="w-full bg-[#181922] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 leading-relaxed"
                placeholder="Ecolife, müasir memarlıq və interyer dizaynının tələblərinə cavab verən..."
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-gray-400 mb-1.5">İkinci Mətn (2-ci Abzas):</label>
              <textarea
                rows={3}
                value={aboutForm.storyP2[editLang] || ''}
                onChange={(e) => setAboutForm({
                  ...aboutForm,
                  storyP2: { ...aboutForm.storyP2, [editLang]: e.target.value }
                })}
                className="w-full bg-[#181922] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 leading-relaxed"
                placeholder="Bakıda yerləşən müasir istehsal və montaj emalatxanamızda..."
              />
            </div>
          </div>

          {/* Section C: Dynamic Facility Bullet Points */}
          <div className="bg-[#12131A] border border-white/5 rounded-xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  3. Mühəndislik və İstehsalat Üstünlükləri ({editLang.toUpperCase()})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-gray-400">
                {aboutForm.facilityPoints[editLang]?.length || 0} bənd
              </span>
            </div>

            {/* List of existing bullet points */}
            <div className="space-y-2.5">
              {(aboutForm.facilityPoints[editLang] || []).map((point, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-amber-400 w-5 text-right">{idx + 1}.</span>
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => updateFacilityPoint(idx, e.target.value)}
                    className="flex-1 bg-[#181922] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={() => removeFacilityPoint(idx)}
                    className="p-2 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                    title="Bu bəndi sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new point */}
            <div className="pt-2 flex items-center gap-2">
              <input
                type="text"
                value={newPointInput}
                onChange={(e) => setNewPointInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addFacilityPoint();
                  }
                }}
                className="flex-1 bg-[#181922] border border-dashed border-white/20 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                placeholder="Yeni üstünlük və ya keyfiyyət bəndi yazın..."
              />
              <button
                type="button"
                onClick={addFacilityPoint}
                className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Əlavə Et</span>
              </button>
            </div>
          </div>

          {/* Section D: Images & Visual Media */}
          <div className="bg-[#12131A] border border-white/5 rounded-xl p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-white/5">
              <Layers className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">4. İstehsalat və Emalatxana Şəkilləri</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-2">Əsas İstehsalat Şəkli (Main 4:3):</label>
                <ImageUploadWidget
                  value={aboutForm.images.mainFacility}
                  onChange={(url) => setAboutForm({
                    ...aboutForm,
                    images: { ...aboutForm.images, mainFacility: url }
                  })}
                  folder="about"
                  label="Əsas İstehsalat Şəkli"
                  currentLang={currentLang}
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-2">Emalatxana Şəkli 1 (Workshop 1):</label>
                <ImageUploadWidget
                  value={aboutForm.images.workshop1}
                  onChange={(url) => setAboutForm({
                    ...aboutForm,
                    images: { ...aboutForm.images, workshop1: url }
                  })}
                  folder="about"
                  label="Emalatxana 1"
                  currentLang={currentLang}
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-2">Emalatxana Şəkli 2 (Workshop 2):</label>
                <ImageUploadWidget
                  value={aboutForm.images.workshop2}
                  onChange={(url) => setAboutForm({
                    ...aboutForm,
                    images: { ...aboutForm.images, workshop2: url }
                  })}
                  folder="about"
                  label="Emalatxana 2"
                  currentLang={currentLang}
                />
              </div>
            </div>
          </div>

          {/* Section E: Values & Engineering Pillars */}
          <div className="bg-[#12131A] border border-white/5 rounded-xl p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  5. Dəyərlərimiz və Mühəndislik Sütunları ({editLang.toUpperCase()})
                </h3>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-gray-400 mb-1.5">Sütunlar Bölməsinin Ümumi Başlığı:</label>
              <input
                type="text"
                value={aboutForm.pillarsTitle[editLang] || ''}
                onChange={(e) => setAboutForm({
                  ...aboutForm,
                  pillarsTitle: { ...aboutForm.pillarsTitle, [editLang]: e.target.value }
                })}
                className="w-full bg-[#181922] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                placeholder="Dəqiq Mühəndislik"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {aboutForm.pillars.map((pillar, idx) => (
                <div key={pillar.id} className="p-4 bg-[#181922] border border-white/10 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-amber-400 font-bold">0{idx + 1}</span>
                    <span className="text-[10px] font-mono text-gray-500 uppercase">{pillar.id}</span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 mb-1">Başlıq ({editLang.toUpperCase()}):</label>
                    <input
                      type="text"
                      value={pillar.label[editLang] || ''}
                      onChange={(e) => updatePillar(pillar.id, 'label', e.target.value)}
                      className="w-full bg-[#12131A] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 mb-1">Təsvir ({editLang.toUpperCase()}):</label>
                    <textarea
                      rows={2}
                      value={pillar.desc[editLang] || ''}
                      onChange={(e) => updatePillar(pillar.id, 'desc', e.target.value)}
                      className="w-full bg-[#12131A] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CONTACT PAGE EDITOR                                                    */}
      {/* ========================================================================= */}
      {selectedPage === 'contact' && (
        <div className="space-y-6">
          <div className="bg-[#12131A] border border-white/5 rounded-xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/5">
              <Phone className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Əlaqə Səhifəsi Məlumatları ({editLang.toUpperCase()})</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1.5">Səhifə Başlığı:</label>
                <input
                  type="text"
                  value={contactForm.title[editLang] || ''}
                  onChange={(e) => setContactForm({
                    ...contactForm,
                    title: { ...contactForm.title, [editLang]: e.target.value }
                  })}
                  className="w-full bg-[#181922] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  placeholder="İŞIĞINIZI LAYİHƏLƏNDİRƏK."
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1.5">Səhifə Alt Başlığı:</label>
                <input
                  type="text"
                  value={contactForm.subtitle[editLang] || ''}
                  onChange={(e) => setContactForm({
                    ...contactForm,
                    subtitle: { ...contactForm.subtitle, [editLang]: e.target.value }
                  })}
                  className="w-full bg-[#181922] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  placeholder="Layihəniz haqqında danışın..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1.5">Əlaqə Telefonu:</label>
                <input
                  type="text"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({
                    ...contactForm,
                    phone: e.target.value
                  })}
                  className="w-full bg-[#181922] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  placeholder="+994 50 450 70 07"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1.5">E-mail Ünvanı:</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({
                    ...contactForm,
                    email: e.target.value
                  })}
                  className="w-full bg-[#181922] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  placeholder="info@ecolife.az"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono text-gray-400 mb-1.5">Fiziki Ünvan ({editLang.toUpperCase()}):</label>
                <input
                  type="text"
                  value={contactForm.address[editLang] || ''}
                  onChange={(e) => setContactForm({
                    ...contactForm,
                    address: { ...contactForm.address, [editLang]: e.target.value }
                  })}
                  className="w-full bg-[#181922] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  placeholder="Bakı ş., Nərimanov r., Əhməd Rəcəbli küç. 46B"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono text-gray-400 mb-1.5">İş Saatları ({editLang.toUpperCase()}):</label>
                <input
                  type="text"
                  value={contactForm.hours[editLang] || ''}
                  onChange={(e) => setContactForm({
                    ...contactForm,
                    hours: { ...contactForm.hours, [editLang]: e.target.value }
                  })}
                  className="w-full bg-[#181922] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  placeholder="Bazar ertəsi - Şənbə: 09:00 - 18:00"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. HOME PAGE EDITOR                                                       */}
      {/* ========================================================================= */}
      {selectedPage === 'home' && (
        <div className="space-y-6">
          <div className="bg-[#12131A] border border-white/5 rounded-xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/5">
              <Home className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Ana Səhifə Hero Bölməsi ({editLang.toUpperCase()})</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1.5">Hero Başlıq Sətir 1:</label>
                <input
                  type="text"
                  value={homeForm.heroTitleA[editLang] || ''}
                  onChange={(e) => setHomeForm({
                    ...homeForm,
                    heroTitleA: { ...homeForm.heroTitleA, [editLang]: e.target.value }
                  })}
                  className="w-full bg-[#181922] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  placeholder="işıq"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1.5">Hero Başlıq Sətir 2:</label>
                <input
                  type="text"
                  value={homeForm.heroTitleB[editLang] || ''}
                  onChange={(e) => setHomeForm({
                    ...homeForm,
                    heroTitleB: { ...homeForm.heroTitleB, [editLang]: e.target.value }
                  })}
                  className="w-full bg-[#181922] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  placeholder="memarlığı"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono text-gray-400 mb-1.5">Hero Təsviri:</label>
                <textarea
                  rows={2}
                  value={homeForm.heroDesc[editLang] || ''}
                  onChange={(e) => setHomeForm({
                    ...homeForm,
                    heroDesc: { ...homeForm.heroDesc, [editLang]: e.target.value }
                  })}
                  className="w-full bg-[#181922] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  placeholder="Müasir məkanlar üçün layihələndirilmiş arxitektur işıqlandırma..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1.5">Hero CTA Düymə Mətni:</label>
                <input
                  type="text"
                  value={homeForm.heroCta[editLang] || ''}
                  onChange={(e) => setHomeForm({
                    ...homeForm,
                    heroCta: { ...homeForm.heroCta, [editLang]: e.target.value }
                  })}
                  className="w-full bg-[#181922] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  placeholder="Kolleksiyanı kəşf edin"
                />
              </div>
            </div>

            {/* Lamp Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-2">Desktop Asma Lampa Şəkli (PNG):</label>
                <ImageUploadWidget
                  value={homeForm.desktopLampImage}
                  onChange={(url) => setHomeForm({ ...homeForm, desktopLampImage: url })}
                  folder="hero"
                  label="Desktop Lampa"
                  currentLang={currentLang}
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-2">Mobil Asma Lampa Şəkli (PNG):</label>
                <ImageUploadWidget
                  value={homeForm.mobileLampImage}
                  onChange={(url) => setHomeForm({ ...homeForm, mobileLampImage: url })}
                  folder="hero"
                  label="Mobil Lampa"
                  currentLang={currentLang}
                />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
