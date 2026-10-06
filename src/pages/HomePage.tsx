import React, { useState, useMemo, useRef } from 'react';
import { Language, Product } from '../types';
import { translations } from '../data/translations';
import { solutions } from '../data/solutions';
import { useData } from '../context/DataContext';
import { getLocalizedText } from '../utils/lang';
import { motion, useScroll, useTransform } from 'motion/react';
import { FadeIn } from '../components/ui/FadeIn';
import { EdButton, EdLink, EdSectionHead, EdHairline } from '../components/ed/EditorialUI';
import { EdProductCard } from '../components/ed/EdProductCard';
import { EdCategoryPills } from '../components/ed/EdCategoryPills';
import { ArrowRight } from 'lucide-react';

interface HomePageProps {
  currentLang: Language;
  onNavigate: (page: string, param?: string) => void;
  onOpenContact: () => void;
}

/** Editorial pill → real product category ids */
const PILL_DEFS: { id: string; match: string[] }[] = [
  { id: 'linear-profiles', match: ['linear-profiles', 'led-profiles'] },
  { id: 'magnetic-systems', match: ['magnetic-systems', 'track-systems'] },
  { id: 'spot-downlight', match: ['spot-downlight', 'recessed', 'downlights'] },
  { id: 'pendants', match: ['pendants'] },
  { id: 'outdoor', match: ['outdoor', 'wall-washers', 'floodlight'] },
  { id: 'strip-lights', match: ['strip-lights'] },
];

export const HomePage: React.FC<HomePageProps> = ({
  currentLang,
  onNavigate,
  onOpenContact
}) => {
  const t = translations[currentLang];
  const ed = t.ed;
  const { products, projects } = useData();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const heroRef = useRef<HTMLElement>(null);

  // Subtle product parallax on the hero (max ±18px — calm, not gimmicky)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const productY = useTransform(scrollYProgress, [0, 1], [0, -18]);
  const titleY = useTransform(scrollYProgress, [0, 1], [0, 30]);

  // Hero product: a real featured product (fallback to first)
  const heroProduct = useMemo(
    () => products.find(p => p.featured) || products[0],
    [products]
  );

  // Random seed generated once per mount so Featured System shows a different product every time
  const [randomSeed] = useState(() => Math.random());

  // Featured collection product: pick a different random product on each visit/refresh
  const featuredCollection = useMemo(() => {
    if (!products || products.length === 0) return undefined;
    const validProducts = products.filter(p => p.image && p.name);
    const basePool = validProducts.length > 0 ? validProducts : products;
    let lastId: string | null = null;
    try {
      lastId = sessionStorage.getItem('ecolife_last_featured_id');
    } catch {}
    const pool = basePool.length > 1 && lastId ? basePool.filter(p => p.id !== lastId) : basePool;
    const picked = pool[Math.floor(randomSeed * pool.length)] || basePool[0];
    if (picked && basePool.length > 1) {
      try {
        sessionStorage.setItem('ecolife_last_featured_id', picked.id);
      } catch {}
    }
    return picked;
  }, [products, randomSeed]);

  const pills = useMemo(() => {
    const base = [
      { id: 'all', label: ed.catAll, match: [] as string[] },
      ...PILL_DEFS.map((d, i) => ({
        id: d.id,
        match: d.match,
        label: [ed.catLinear, ed.catMagnetic, ed.catSpot, ed.catPendant, ed.catOutdoor, ed.catDecorative][i] || d.id
      }))
    ];
    // Only keep pills that have at least one real product (plus "all")
    const hasProducts = (match: string[]) =>
      products.some(p => {
        const cats = Array.isArray(p.categories) && p.categories.length > 0 ? p.categories : [p.category];
        return cats.some(c => match.includes(c));
      });
    return base.filter(b => b.id === 'all' || hasProducts(b.match));
  }, [products, ed]);

  const gridProducts = useMemo(() => {
    const def = PILL_DEFS.find(d => d.id === activeCategory);
    if (!def) {
      return products.slice(0, 6);
    }
    const matched = products.filter(p => {
      const cats = Array.isArray(p.categories) && p.categories.length > 0 ? p.categories : [p.category];
      return cats.some(c => def.match.includes(c));
    });
    // If a curated pill has no real inventory, fall back to featured items
    return (matched.length > 0 ? matched : products.filter(p => p.featured).length > 0 ? products.filter(p => p.featured) : products).slice(0, 6);
  }, [products, activeCategory]);

  const featuredProjects = useMemo(() => {
    if (!projects || projects.length === 0) return [];
    const copy = [...projects];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(((Math.sin(randomSeed * 1000 + i) + 1) / 2) * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, 3);
  }, [projects, randomSeed]);
  const appImages = solutions.slice(0, 4);

  const productionSteps = [
    { num: '01', label: ed.prod1 },
    { num: '02', label: ed.prod2 },
    { num: '03', label: ed.prod3 },
    { num: '04', label: ed.prod4 },
  ];

  const solutionEntries = [
    { num: '01', label: ed.sol1, image: appImages[0]?.image, action: () => onNavigate('solutions', 'residential-lighting') },
    { num: '02', label: ed.sol2, image: appImages[2]?.image, action: () => onNavigate('configurator') },
    { num: '03', label: ed.sol3, image: appImages[3]?.image, action: () => onNavigate('solutions', 'office-lighting') },
    { num: '04', label: ed.sol4, image: appImages[1]?.image, action: onOpenContact },
  ];

  return (
    <div className="bg-[var(--ed-bg)] text-[var(--ed-ivory)] overflow-hidden">

      {/* ============================================================ */}
      {/* HERO — asymmetric dark canvas, oversized type, glowing object */}
      {/* ============================================================ */}
      <section ref={heroRef} className="relative min-h-[auto] lg:min-h-screen flex items-center pt-20 sm:pt-24 pb-12 sm:pb-16 lg:py-20 overflow-hidden">
        <div className="max-w-[1440px] mx-auto w-full px-5 sm:px-8 lg:px-12 relative z-10">

          <div className="max-w-xl lg:max-w-2xl pt-64 sm:pt-72 md:pt-80 lg:pt-0">
            {/* Headline */}
            <motion.div style={{ y: titleY }} className="relative z-10">
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.22, 0.61, 0.36, 1], delay: 0.25 }}
                className="ed-display font-display text-ivory select-none tracking-tight leading-[0.92]"
              >
                <span className="block">{ed.heroTitleA}</span>
                <span className="block">{ed.heroTitleB}</span>
              </motion.h1>

              {/* Lower-left description + CTA */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.55 }}
                className="mt-6 sm:mt-8 lg:mt-10 max-w-md"
              >
                <p className="text-sm text-soft leading-relaxed whitespace-pre-line">
                  {ed.heroDesc}
                </p>

                <div className="mt-6 sm:mt-8">
                  <EdButton arrow onClick={() => onNavigate('catalog')}>
                    {ed.heroCta}
                  </EdButton>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* MOBILE Pendant Lamp (centered between logo & search) */}
        <motion.div
          style={{ y: productY }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 0.61, 0.36, 1], delay: 0.35 }}
          className="lg:hidden absolute top-0 left-1/2 -translate-x-1/2 w-[440px] sm:w-[500px] pointer-events-none z-0 flex flex-col items-center"
        >
          {/* Warm ambient downward light pool */}
          <div className="absolute top-[48%] left-1/2 -translate-x-1/2 w-[130%] h-[85%] bg-[radial-gradient(ellipse_at_50%_15%,_rgba(245,185,55,0.24)_0%,_rgba(245,180,50,0.08)_42%,_rgba(245,180,50,0.02)_65%,_transparent_80%)] blur-3xl pointer-events-none" />

          <img
            src="/hero-pendant-light-mobile.png"
            alt="Ecolife Architectural Lighting - Mobile"
            className="w-full h-auto object-contain select-none drop-shadow-[0_30px_80px_rgba(0,0,0,0.85)]"
            loading="eager"
          />
        </motion.div>

        {/* DESKTOP Pendant Lamp (hanging from top right) */}
        <motion.div
          style={{ y: productY }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 0.61, 0.36, 1], delay: 0.35 }}
          className="hidden lg:flex absolute top-0 right-[-6%] xl:right-[-2%] translate-x-[60px] w-[1230px] xl:w-[1440px] pointer-events-none z-0 flex-col items-center"
        >
          {/* Warm ambient downward light pool */}
          <div className="absolute top-[48%] left-1/2 -translate-x-1/2 w-[130%] h-[85%] bg-[radial-gradient(ellipse_at_50%_15%,_rgba(245,185,55,0.24)_0%,_rgba(245,180,50,0.08)_42%,_rgba(245,180,50,0.02)_65%,_transparent_80%)] blur-3xl pointer-events-none" />

          <img
            src="/hero-pendant-light-desktop.png"
            alt="Ecolife Architectural Lighting - Desktop"
            className="w-full h-auto object-contain select-none drop-shadow-[0_30px_80px_rgba(0,0,0,0.85)]"
            loading="eager"
          />
        </motion.div>

        {/* Fade the warm hero glow into the next section—no hard line or glass panel. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 z-[1] h-28 sm:h-36 bg-[linear-gradient(to_bottom,rgba(29,29,27,0)_0%,rgba(29,29,27,0.35)_45%,var(--ed-bg)_100%)] backdrop-blur-[3px] pointer-events-none"
        />
      </section>

      {/* ============================================================ */}
      {/* PRODUCT DISCOVERY — centered headline, pills, editorial grid  */}
      {/* ============================================================ */}
      <section className="relative z-10 py-12 sm:py-16 lg:py-20">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">

          <FadeIn>
            <EdSectionHead
              align="center"
              titleA={ed.discoveryTitleA}
              titleB={ed.discoveryTitleB}
              sub={ed.discoverySub}
              className="mb-8 sm:mb-10"
            />
          </FadeIn>

          <FadeIn delay={0.1}>
            <EdCategoryPills
              items={pills.map(p => ({ id: p.id, label: p.label }))}
              activeId={activeCategory}
              onSelect={setActiveCategory}
              className="mb-8 sm:mb-10"
            />
          </FadeIn>

          {/* 3-column editorial grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8 sm:gap-y-12">
            {gridProducts.map((product: Product, i: number) => (
              <FadeIn key={product.id} delay={0.06 * i}>
                <EdProductCard
                  product={product}
                  currentLang={currentLang}
                  onNavigate={onNavigate}
                  exploreLabel={ed.explore}
                />
              </FadeIn>
            ))}
          </div>

          <div className="mt-12 sm:mt-16 text-center">
            <EdLink arrow onClick={() => onNavigate('catalog', activeCategory === 'all' ? undefined : activeCategory)}>
              {t.home.viewAllProducts}
            </EdLink>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FEATURED COLLECTION — random product on each visit            */}
      {/* ============================================================ */}
      {featuredCollection && (
        <section className="py-12 sm:py-16 lg:py-20 border-t border-[var(--ed-line-soft)]">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">

              <FadeIn direction="right">
                <div>
                  <p className="font-micro text-amber-warm mb-4 sm:mb-6">{ed.featuredEyebrow}</p>
                  <h2 className="ed-display-md font-display text-ivory">
                    {featuredCollection.name}
                  </h2>
                  <p className="text-sm text-soft leading-relaxed mt-4 sm:mt-6 max-w-md whitespace-pre-line">
                    {getLocalizedText(featuredCollection.description, currentLang) || ed.featuredDesc}
                  </p>

                  {/* Technical row (without 5Y warranty) */}
                  <div className="flex gap-10 mt-6 sm:mt-8">
                    {[ed.featuredSpec1, ed.featuredSpec2].filter(Boolean).map((spec, i) => (
                      <div key={i}>
                        <div className="ed-hairline mb-3 max-w-[72px]" />
                        <span className="font-mono-tech text-xs text-ivory">{spec}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-6">
                    <EdButton arrow onClick={() => onNavigate('configurator')}>
                      {ed.featuredCta}
                    </EdButton>
                    <EdLink onClick={() => onNavigate('catalog', featuredCollection.slug)}>
                      {ed.explore}
                    </EdLink>
                  </div>
                </div>
              </FadeIn>

              <FadeIn direction="left" className="relative">
                <div
                  onClick={() => onNavigate('catalog', featuredCollection.slug)}
                  className="group cursor-pointer relative aspect-[4/3] overflow-hidden ed-plate flex items-center justify-center p-6 sm:p-10"
                >
                  <img
                    src={featuredCollection.image}
                    alt={featuredCollection.name}
                    loading="lazy"
                    className="w-full h-full max-w-[84%] max-h-[84%] object-contain transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <span className="font-mono-tech text-[10px] text-[#1d1d1b]/60 absolute bottom-4 right-5">
                    {featuredCollection.code}
                  </span>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* FEATURED PROJECTS — full-width + two-column editorial spread  */}
      {/* ============================================================ */}
      {featuredProjects.length > 0 && (
        <section className="py-12 sm:py-16 lg:py-20 border-t border-[var(--ed-line-soft)]">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-8 sm:mb-10">
              <FadeIn>
                <EdSectionHead
                  eyebrow={ed.projEyebrow}
                  titleA={ed.projTitleA}
                  titleB={ed.projTitleB}
                />
              </FadeIn>
              <FadeIn delay={0.1}>
                <EdLink arrow onClick={() => onNavigate('projects')}>
                  {ed.viewAllProjects}
                </EdLink>
              </FadeIn>
            </div>

            {/* Lead project — full-width cinematic */}
            {featuredProjects[0] && (
              <FadeIn>
                <button
                  onClick={() => onNavigate('projects', featuredProjects[0].slug || featuredProjects[0].id)}
                  className="group relative w-full aspect-[16/10] lg:aspect-[21/9] overflow-hidden text-left"
                >
                  <img
                    src={featuredProjects[0].coverImage}
                    alt={featuredProjects[0].title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1d1d1b]/90 via-[#1d1d1b]/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-7 lg:p-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                    <div>
                      <h3 className="ed-display-md font-display text-ivory max-w-3xl">
                        {featuredProjects[0].title}
                      </h3>
                      <div className="font-micro text-[9px] text-soft mt-4 flex flex-wrap gap-x-6 gap-y-1">
                        <span>{featuredProjects[0].location}</span>
                        <span>{featuredProjects[0].categoryName?.[currentLang] || featuredProjects[0].category}</span>
                        <span>{featuredProjects[0].year}</span>
                      </div>
                    </div>
                    <span className="font-micro text-[10px] text-ivory flex items-center gap-2 shrink-0">
                      {t.projects.viewProject}
                      <ArrowRight className="w-4 h-4 text-amber-warm transition-transform duration-300 group-hover:translate-x-1.5" />
                    </span>
                  </div>
                </button>
              </FadeIn>
            )}

            {/* Two-column composition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
              {featuredProjects.slice(1).map((project, i) => (
                <FadeIn key={project.id} delay={0.1 * i}>
                  <button
                    onClick={() => onNavigate('projects', project.slug || project.id)}
                    className="group relative w-full aspect-[4/3] overflow-hidden text-left"
                  >
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.05]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1d1d1b]/85 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-7 lg:p-9">
                      <h3 className="ed-display-sm font-display text-ivory">
                        {project.title}
                      </h3>
                      <div className="font-micro text-[9px] text-soft mt-3 flex flex-wrap gap-x-5 gap-y-1">
                        <span>{project.location}</span>
                        <span>{project.categoryName?.[currentLang] || project.category}</span>
                        <span>{project.year}</span>
                      </div>
                    </div>
                  </button>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* WHAT WE DO & CUSTOM PRODUCTION — compact architectural bands  */}
      {/* ============================================================ */}
      <section className="py-10 sm:py-14 border-t border-[var(--ed-line-soft)]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* Left: Compact Section Title */}
            <div className="lg:col-span-4">
              <FadeIn>
                <p className="font-micro text-amber-warm mb-3">{ed.solEyebrow}</p>
                <h2 className="ed-display-md font-display text-ivory">
                  {ed.solTitleA}{' '}
                  <span className="text-soft">{ed.solTitleB}</span>
                </h2>
              </FadeIn>
            </div>

            {/* Right: Compact 2x2 Grid of Services */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-l border-[var(--ed-line)]">
                {solutionEntries.map((entry, i) => (
                  <FadeIn key={entry.num} delay={0.04 * i}>
                    <button
                      onClick={entry.action}
                      className="group w-full flex items-center justify-between p-5 sm:p-6 border-r border-b border-[var(--ed-line)] text-left relative overflow-hidden hover:bg-[var(--ed-bg-2)] transition-colors duration-300"
                    >
                      <div className="flex items-baseline gap-4 relative z-10">
                        <span className="font-mono-tech text-[11px] text-amber-warm/80">{entry.num}</span>
                        <span className="text-base sm:text-lg font-medium text-ivory group-hover:text-amber-warm transition-colors duration-300">
                          {entry.label}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-mute group-hover:text-amber-warm group-hover:translate-x-1 transition-all duration-300 shrink-0" />
                    </button>
                  </FadeIn>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CUSTOM PRODUCTION — compact 01–04 grid + sleek dual visuals    */}
      {/* ============================================================ */}
      <section className="py-10 sm:py-14 border-t border-[var(--ed-line-soft)]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            <div className="lg:col-span-5">
              <FadeIn>
                <p className="font-micro text-amber-warm mb-3">{ed.prodEyebrow}</p>
                <h2 className="ed-display-md font-display text-ivory">
                  {ed.prodTitleA}{' '}
                  <span className="text-soft">{ed.prodTitleB}</span>
                </h2>
                <p className="text-xs text-mute mt-3 leading-relaxed">
                  {ed.prodSub}
                </p>
              </FadeIn>

              <div className="grid grid-cols-2 border-t border-l border-[var(--ed-line)] mt-6">
                {productionSteps.map((step, i) => (
                  <FadeIn key={step.num} delay={0.05 * i}>
                    <div className="p-4 sm:p-5 border-r border-b border-[var(--ed-line)] flex items-baseline gap-3">
                      <span className="font-mono-tech text-xs text-amber-warm">{step.num}</span>
                      <span className="font-micro text-[10px] text-ivory">{step.label}</span>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>

            {/* Compact side-by-side production imagery */}
            <div className="lg:col-span-7">
              <FadeIn direction="left">
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative overflow-hidden aspect-[16/11]">
                    <img
                      src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=900&q=80"
                      alt="Ecolife production"
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1d1d1b]/75 via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-3 font-micro text-[9px] text-ivory/90">{ed.facilityTag}</span>
                  </div>
                  <div className="relative overflow-hidden aspect-[16/11]">
                    <img
                      src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80"
                      alt="Ecolife assembly"
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1d1d1b]/75 via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-3 font-micro text-[9px] text-ivory/90">{ed.assemblyTag}</span>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FINAL CTA — compact, aesthetic horizontal architectural bar    */}
      {/* ============================================================ */}
      <section className="relative py-10 sm:py-14 border-t border-[var(--ed-line-soft)] overflow-hidden">
        {/* Subtle warm architectural glow */}
        <div className="absolute inset-x-0 bottom-[-40%] h-[90%] ed-glow-warm pointer-events-none opacity-75" />

        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 sm:gap-8 bg-[var(--ed-bg-2)]/70 border border-[var(--ed-line)] p-6 sm:p-8 lg:px-12 lg:py-10">
            <FadeIn>
              <div>
                <h2 className="ed-display-sm sm:ed-display-md font-display text-ivory leading-tight">
                  {ed.ctaTitleA}{' '}
                  <span className="text-amber-warm">{ed.ctaTitleB}</span>
                </h2>
                <p className="text-xs sm:text-sm text-soft mt-2.5 max-w-md">
                  {ed.ctaText}
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="flex flex-wrap items-center gap-4 shrink-0">
                <EdButton arrow onClick={onOpenContact}>
                  {ed.ctaBtn}
                </EdButton>
                <EdButton variant="ghost" onClick={() => onNavigate('configurator')}>
                  {t.nav.configurator}
                </EdButton>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
};
