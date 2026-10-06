import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { solutions } from '../data/solutions';
import { products as staticProducts } from '../data/products';
import { projects as staticProjects } from '../data/projects';
import { useData } from '../context/DataContext';
import { FadeIn } from '../components/ui/FadeIn';
import { EdButton, EdLink, EdHairline } from '../components/ed/EditorialUI';
import { EdProductCard } from '../components/ed/EdProductCard';
import { ArrowRight, Sun, Sliders, Sparkles, Eye } from 'lucide-react';

interface SolutionsPageProps {
  currentLang: Language;
  onNavigate: (page: string, param?: string) => void;
  onOpenContact: () => void;
  initialSlug?: string;
}

const SOLUTION_TELEMETRY: Record<string, {
  lux: string;
  cri: string;
  cctDefault: '2700K' | '3000K' | '4000K';
  protocol: string;
  ugr: string;
  accentImages: string[];
}> = {
  commercial: {
    lux: '750 — 1000 LX',
    cri: 'CRI 95+ R9>90',
    cctDefault: '3000K',
    protocol: 'DALI-2 / 48V TRACK',
    ugr: 'UGR < 16',
    accentImages: [
      'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80',
    ]
  },
  office: {
    lux: '500 LX (EN 12464)',
    cri: 'CRI 90+',
    cctDefault: '4000K',
    protocol: 'TUNABLE WHITE / DALI',
    ugr: 'UGR < 19',
    accentImages: [
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80',
    ]
  },
  hospitality: {
    lux: '150 — 300 LX',
    cri: 'CRI 97+',
    cctDefault: '2700K',
    protocol: 'DIM-TO-WARM / SCENE',
    ugr: 'UGR < 14',
    accentImages: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80',
    ]
  },
  residential: {
    lux: '200 — 400 LX',
    cri: 'CRI 95+',
    cctDefault: '2700K',
    protocol: 'CASAMBI / HOMEKIT',
    ugr: 'TRIMLESS DARK-LIGHT',
    accentImages: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=900&q=80',
    ]
  }
};

const CCT_MODES: Array<{
  id: '2700K' | '3000K' | '4000K';
  label: { az: string; en: string; ru: string };
  overlay: string;
  glowColor: string;
}> = [
  {
    id: '2700K',
    label: { az: '2700K İsti', en: '2700K Warm', ru: '2700K Теплый' },
    overlay: 'radial-gradient(circle at 65% 30%, rgba(245, 166, 35, 0.28) 0%, rgba(245, 166, 35, 0.08) 55%, transparent 80%)',
    glowColor: '#f5a623'
  },
  {
    id: '3000K',
    label: { az: '3000K Memari', en: '3000K Architectural', ru: '3000K Архитектурный' },
    overlay: 'radial-gradient(circle at 65% 30%, rgba(255, 209, 128, 0.22) 0%, rgba(255, 209, 128, 0.05) 55%, transparent 80%)',
    glowColor: '#ffd180'
  },
  {
    id: '4000K',
    label: { az: '4000K Fokus', en: '4000K Daylight', ru: '4000K Дневной' },
    overlay: 'radial-gradient(circle at 65% 30%, rgba(235, 243, 255, 0.22) 0%, rgba(210, 228, 255, 0.06) 55%, transparent 80%)',
    glowColor: '#e8f1ff'
  }
];

export const SolutionsPage: React.FC<SolutionsPageProps> = ({
  currentLang,
  onNavigate,
  onOpenContact,
  initialSlug
}) => {
  const t = translations[currentLang];
  const { products: contextProducts, projects: contextProjects } = useData();
  const allProducts = contextProducts?.length ? contextProducts : staticProducts;
  const allProjects = contextProjects?.length ? contextProjects : staticProjects;

  const [randomSeed] = useState(() => Math.random());

  const defaultSolution = solutions.find(s => s.slug === initialSlug) || solutions[0];
  const [activeSolutionId, setActiveSolutionId] = useState<string>(defaultSolution.id);
  const [activeCct, setActiveCct] = useState<'2700K' | '3000K' | '4000K'>(
    SOLUTION_TELEMETRY[defaultSolution.id]?.cctDefault || '3000K'
  );
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState<number>(0);

  const currentSolution = solutions.find(s => s.id === activeSolutionId) || solutions[0];
  const currentIndex = solutions.findIndex(s => s.id === currentSolution.id);
  const telemetry = SOLUTION_TELEMETRY[currentSolution.id] || SOLUTION_TELEMETRY.commercial;

  // Pick 3 random real projects from DataContext (shuffled per solution & visit)
  const relatedProjects = React.useMemo(() => {
    if (!allProjects || allProjects.length === 0) return [];
    const copy = [...allProjects];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(((Math.sin((randomSeed + (currentIndex + 1) * 0.17) * 1000 + i) + 1) / 2) * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, 3);
  }, [allProjects, randomSeed, currentIndex]);

  // Pick 3 random real products from DataContext
  const recommendedProds = React.useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    const valid = allProducts.filter(p => p.image && p.name);
    const pool = valid.length > 0 ? [...valid] : [...allProducts];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(((Math.sin((randomSeed + (currentIndex + 1) * 0.31) * 1000 + i) + 1) / 2) * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 3);
  }, [allProducts, randomSeed, currentIndex]);

  const galleryImages = React.useMemo(() => {
    const realProjectImgs = relatedProjects.map(p => p.coverImage).filter(Boolean);
    if (realProjectImgs.length >= 2) {
      return [currentSolution.image, ...realProjectImgs.slice(0, 2)];
    }
    return [currentSolution.image, ...telemetry.accentImages];
  }, [currentSolution.image, relatedProjects, telemetry.accentImages]);

  const activeVisual = galleryImages[selectedGalleryIndex] || currentSolution.image;
  const activeCctObj = CCT_MODES.find(c => c.id === activeCct) || CCT_MODES[1];

  const handleSelectSolution = (solId: string) => {
    setActiveSolutionId(solId);
    setSelectedGalleryIndex(0);
    const nextTelemetry = SOLUTION_TELEMETRY[solId];
    if (nextTelemetry) {
      setActiveCct(nextTelemetry.cctDefault);
    }
  };

  return (
    <div className="bg-[var(--ed-bg)] text-[var(--ed-ivory)] pt-32 pb-20 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">

        {/* 1. EDITORIAL HEADER + INTERACTIVE VISUAL SHOWCASE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-end mb-12">
          <div className="lg:col-span-6">
            <FadeIn>
              <p className="font-micro text-amber-warm mb-4">03 — {t.nav.solutions}</p>
              <h1 className="ed-display-lg font-display text-ivory">
                {currentLang === 'az' ? 'işıq' : currentLang === 'ru' ? 'световые' : 'lighting'}
                {' '}
                <span className="text-soft">{currentLang === 'az' ? 'həlləri' : currentLang === 'ru' ? 'решения' : 'solutions'}</span>
              </h1>
            </FadeIn>
          </div>
          <div className="lg:col-span-6 lg:text-right">
            <FadeIn delay={0.08}>
              <p className="text-sm text-mute max-w-md lg:ml-auto leading-relaxed">
                {t.solutions.subtitle}
              </p>
            </FadeIn>
          </div>
        </div>

        <EdHairline className="mb-12" />

        {/* 2. SPLIT INTERACTIVE STAGE: SELECTOR (LEFT) + LIVE ARCHITECTURAL VIEWPORT (RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch mb-20">
          {/* Left: Interactive Solution Chapters */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="border-t border-[var(--ed-line)]">
              {solutions.map((sol, i) => {
                const isActive = activeSolutionId === sol.id;
                const solTel = SOLUTION_TELEMETRY[sol.id] || SOLUTION_TELEMETRY.commercial;
                return (
                  <button
                    key={sol.id}
                    type="button"
                    onClick={() => handleSelectSolution(sol.id)}
                    className={`group w-full text-left py-6 px-4 sm:px-5 border-b border-[var(--ed-line)] relative overflow-hidden transition-all duration-500 ${
                      isActive ? 'bg-[rgba(245,166,35,0.06)]' : 'hover:bg-[rgba(255,255,255,0.02)]'
                    }`}
                  >
                    {/* Active left amber light bar */}
                    <span
                      className={`absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--ed-amber)] transition-transform duration-500 origin-center ${
                        isActive ? 'scale-y-100 shadow-[0_0_16px_rgba(245,166,35,0.8)]' : 'scale-y-0 group-hover:scale-y-50'
                      }`}
                    />

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-baseline gap-5">
                        <span className={`font-mono-tech text-xs transition-colors duration-300 ${
                          isActive ? 'text-amber-warm' : 'text-mute group-hover:text-ivory'
                        }`}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <span className={`block font-display text-lg sm:text-xl tracking-tight transition-colors duration-300 ${
                            isActive ? 'text-amber-warm' : 'text-ivory group-hover:text-amber-warm'
                          }`}>
                            {sol.title[currentLang]}
                          </span>
                          <span className="font-mono-tech text-[10px] text-mute mt-1.5 block">
                            {solTel.lux} · {solTel.cri} · {solTel.ugr}
                          </span>
                        </div>
                      </div>

                      <ArrowRight className={`w-4 h-4 flex-shrink-0 transition-all duration-300 ${
                        isActive ? 'text-amber-warm translate-x-1' : 'text-mute group-hover:text-amber-warm group-hover:translate-x-1'
                      }`} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Interactive Kelvin Atmosphere Switcher */}
            <div className="mt-8 p-5 border border-[var(--ed-line)] bg-[var(--ed-surface)]/60">
              <div className="flex items-center justify-between mb-3">
                <span className="font-micro text-[9px] text-amber-warm flex items-center gap-2">
                  <Sun className="w-3.5 h-3.5" />
                  {currentLang === 'az' ? 'İŞIQ TEMPERATURU SİMULYASİYASI' : currentLang === 'ru' ? 'СИМУЛЯЦИЯ ТЕМПЕРАТУРЫ СВЕТА' : 'SPECTRUM ATMOSPHERE PREVIEW'}
                </span>
                <span className="font-mono-tech text-[10px] text-mute">{activeCct}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {CCT_MODES.map((mode) => {
                  const isCctActive = activeCct === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setActiveCct(mode.id)}
                      className={`py-2 px-3 text-center font-mono-tech text-[11px] border transition-all duration-300 ${
                        isCctActive
                          ? 'border-[var(--ed-amber)] bg-[rgba(245,166,35,0.14)] text-ivory'
                          : 'border-[var(--ed-line)] text-mute hover:text-ivory hover:border-white/25'
                      }`}
                    >
                      {mode.label[currentLang]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Animated Visual Stage + Thumbnail Switcher */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="relative aspect-[16/10] w-full overflow-hidden border border-[var(--ed-line)] bg-[#141413]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={`${currentSolution.id}-${selectedGalleryIndex}`}
                  src={activeVisual}
                  alt={currentSolution.title[currentLang]}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Dynamic Kelvin light simulation overlay */}
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-700 mix-blend-screen"
                style={{ background: activeCctObj.overlay }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141413]/90 via-[#141413]/20 to-transparent pointer-events-none" />

              {/* Top Telemetry Bar */}
              <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
                <span className="px-3 py-1 bg-[#141413]/80 backdrop-blur-md border border-white/10 font-mono-tech text-[10px] text-amber-warm">
                  {String(currentIndex + 1).padStart(2, '0')} // {telemetry.protocol}
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-[#141413]/80 backdrop-blur-md border border-white/10 font-mono-tech text-[10px] text-ivory">
                    {telemetry.lux}
                  </span>
                  <span className="px-3 py-1 bg-[#141413]/80 backdrop-blur-md border border-white/10 font-mono-tech text-[10px] text-ivory">
                    {telemetry.cri}
                  </span>
                </div>
              </div>

              {/* Bottom Caption Inside Stage */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSolution.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p className="font-micro text-[9px] text-amber-warm mb-1.5">
                      ECOLIFE ARCHITECTURAL SCENE · {activeCct}
                    </p>
                    <h2 className="ed-display-sm font-display text-ivory max-w-lg">
                      {currentSolution.subtitle[currentLang]}
                    </h2>
                  </motion.div>
                </AnimatePresence>

                {/* Perspective Thumbnail Switcher */}
                <div className="flex items-center gap-2">
                  {galleryImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedGalleryIndex(idx)}
                      className={`w-14 h-10 overflow-hidden border transition-all duration-300 ${
                        selectedGalleryIndex === idx
                          ? 'border-[var(--ed-amber)] scale-105 shadow-[0_0_12px_rgba(245,166,35,0.4)]'
                          : 'border-white/20 opacity-60 hover:opacity-100'
                      }`}
                      aria-label={`View angle ${idx + 1}`}
                    >
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. SMOOTH ANIMATED NARRATIVE + ARCHITECTURAL FEATURE CARDS */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSolution.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start py-12 border-y border-[var(--ed-line)]">
              {/* Overview & Action */}
              <div className="lg:col-span-5 space-y-6">
                <p className="font-micro text-amber-warm">
                  {String(currentIndex + 1).padStart(2, '0')} — {currentSolution.title[currentLang]}
                </p>
                <p className="text-base text-soft leading-relaxed">
                  {currentSolution.description[currentLang]}
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-5">
                  <EdButton arrow onClick={onOpenContact}>
                    {t.solutions.consultationBtn}
                  </EdButton>
                  <EdLink arrow onClick={() => onNavigate('configurator')}>
                    {t.catalog.configureNow}
                  </EdLink>
                </div>
              </div>

              {/* 2x2 Visual Feature Matrix */}
              <div className="lg:col-span-7">
                <p className="font-micro text-[9px] text-mute mb-4">{t.solutions.keyFeaturesTitle}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentSolution.keyFeatures[currentLang].map((feat, idx) => (
                    <div
                      key={idx}
                      className="group p-5 border border-[var(--ed-line)] bg-[var(--ed-surface)]/40 hover:border-[var(--ed-amber)]/60 transition-all duration-500 relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--ed-amber)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono-tech text-xs text-amber-warm">
                          0{idx + 1}
                        </span>
                        <Sparkles className="w-3.5 h-3.5 text-mute group-hover:text-amber-warm transition-colors" />
                      </div>
                      <p className="text-sm text-ivory/90 leading-relaxed">
                        {feat}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. RECOMMENDED SYSTEMS FOR THIS SOLUTION */}
            {recommendedProds.length > 0 && (
              <div className="mt-20">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                  <div>
                    <p className="font-micro text-amber-warm mb-3">
                      {currentLang === 'az' ? 'OPTİK UYĞUNLUQ' : currentLang === 'ru' ? 'ОПТИЧЕСКИЙ ПОДБОР' : 'OPTICAL MATCH'}
                    </p>
                    <h2 className="ed-display-md font-display text-ivory">
                      {currentLang === 'az' ? 'tövsiyə olunan' : currentLang === 'ru' ? 'рекомендуемые' : 'recommended'}{' '}
                      <span className="text-soft">{currentLang === 'az' ? 'sistemlər' : currentLang === 'ru' ? 'системы' : 'systems'}</span>
                    </h2>
                  </div>
                  <EdLink arrow onClick={() => onNavigate('catalog')}>
                    {t.projects.viewInCatalog}
                  </EdLink>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                  {recommendedProds.slice(0, 3).map((prod) => (
                    <EdProductCard
                      key={prod.id}
                      product={prod}
                      currentLang={currentLang}
                      onNavigate={onNavigate}
                      exploreLabel={t.projects.viewInCatalog}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 5. REAL ARCHITECTURAL PROJECTS */}
            {relatedProjects.length > 0 && (
              <div className="mt-20">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                  <div>
                    <p className="font-micro text-amber-warm mb-3">
                      {currentLang === 'az' ? 'TƏTBİQ NÜMUNƏLƏRİ' : currentLang === 'ru' ? 'ПРИМЕРЫ РЕАЛИЗАЦИИ' : 'CASE STUDIES'}
                    </p>
                    <h2 className="ed-display-md font-display text-ivory">
                      {currentLang === 'az' ? 'real' : currentLang === 'ru' ? 'реальные' : 'real'}{' '}
                      <span className="text-soft">{currentLang === 'az' ? 'layihələr' : currentLang === 'ru' ? 'проекты' : 'projects'}</span>
                    </h2>
                  </div>
                  <EdLink arrow onClick={() => onNavigate('projects')}>
                    {t.nav.projects}
                  </EdLink>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                  {relatedProjects.map((proj) => (
                    <button
                      key={proj.id}
                      type="button"
                      onClick={() => onNavigate('projects', proj.slug || proj.id)}
                      className="group relative w-full aspect-[4/3] overflow-hidden text-left border border-[var(--ed-line)]"
                    >
                      <img
                        src={proj.coverImage}
                        alt={proj.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-[1100ms] group-hover:scale-[1.05]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#141413]/90 via-[#141413]/25 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-7 flex items-end justify-between gap-4">
                        <div>
                          <span className="font-micro text-[9px] text-amber-warm block mb-1.5">{proj.location}</span>
                          <h3 className="ed-display-sm font-display text-ivory">
                            {proj.title}
                          </h3>
                        </div>
                        <ArrowRight className="w-5 h-5 text-amber-warm opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
};
