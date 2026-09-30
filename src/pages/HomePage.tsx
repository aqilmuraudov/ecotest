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

  // Featured collection product: prefer the LINEAR 40 system
  const featuredCollection = useMemo(
    () => products.find(p => p.slug?.includes('linear-40')) || heroProduct,
    [products, heroProduct]
  );

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

  const featuredProjects = projects.slice(0, 3);
  const appImages = solutions.slice(0, 4);
  // Keep labels paired with their image order: retail, office, hospitality, residential.
  const appLabels = [ed.appRetail, ed.appOffice, ed.appHospitality, ed.appResidential];

  const productionSteps = [
    { num: '01', label: ed.prod1 },
    { num: '02', label: ed.prod2 },
    { num: '03', label: ed.prod3 },
    { num: '04', label: ed.prod4 },
  ];

  const whyItems = [ed.why1, ed.why2, ed.why3, ed.why4, ed.why5];

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
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
        <div className="max-w-[1440px] mx-auto w-full px-5 sm:px-8 lg:px-12 relative z-10">

          <div className="max-w-xl lg:max-w-2xl">
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
                className="mt-8 lg:mt-10 max-w-md"
              >
                <p className="text-sm text-soft leading-relaxed whitespace-pre-line">
                  {ed.heroDesc}
                </p>

                <div className="mt-8">
                  <EdButton arrow onClick={() => onNavigate('catalog')}>
                    {ed.heroCta}
                  </EdButton>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Pendant Lamp hanging from top right */}
        <motion.div
          style={{ y: productY }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 0.61, 0.36, 1], delay: 0.35 }}
          className="absolute top-0 right-[-24%] sm:right-[-16%] md:right-[-10%] lg:right-[-6%] xl:right-[-2%] lg:translate-x-[60px] w-[720px] sm:w-[900px] md:w-[1050px] lg:w-[1230px] xl:w-[1440px] pointer-events-none z-0 flex flex-col items-center"
        >
          {/* Warm ambient downward light pool */}
          <div className="absolute top-[48%] left-1/2 -translate-x-1/2 w-[130%] h-[85%] bg-[radial-gradient(ellipse_at_50%_15%,_rgba(245,185,55,0.24)_0%,_rgba(245,180,50,0.08)_42%,_rgba(245,180,50,0.02)_65%,_transparent_80%)] blur-3xl pointer-events-none" />

          <img
            src="/hero-pendant-light.png"
            alt="Ecolife Architectural Lighting"
            className="w-full h-auto object-contain select-none drop-shadow-[0_30px_80px_rgba(0,0,0,0.85)]"
            loading="eager"
          />
        </motion.div>

        {/* Fade the warm hero glow into the next section—no hard line or glass panel. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 z-[1] h-56 bg-[linear-gradient(to_bottom,rgba(29,29,27,0)_0%,rgba(29,29,27,0.35)_45%,var(--ed-bg)_100%)] backdrop-blur-[3px] pointer-events-none"
        />
      </section>

      {/* ============================================================ */}
      {/* PRODUCT DISCOVERY — centered headline, pills, editorial grid  */}
      {/* ============================================================ */}
      <section className="relative z-10 py-24 lg:py-32">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">

          <FadeIn>
            <EdSectionHead
              align="center"
              titleA={ed.discoveryTitleA}
              titleB={ed.discoveryTitleB}
              sub={ed.discoverySub}
              className="mb-12"
            />
          </FadeIn>

          <FadeIn delay={0.1}>
            <EdCategoryPills
              items={pills.map(p => ({ id: p.id, label: p.label }))}
              activeId={activeCategory}
              onSelect={setActiveCategory}
              className="mb-16"
            />
          </FadeIn>

          {/* 3-column editorial grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
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

          <div className="mt-20 text-center">
            <EdLink arrow onClick={() => onNavigate('catalog', activeCategory === 'all' ? undefined : activeCategory)}>
              {t.home.viewAllProducts}
            </EdLink>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FEATURED COLLECTION — oversized title left, glowing product right */}
      {/* ============================================================ */}
      {featuredCollection && (
        <section className="py-24 lg:py-32 border-t border-[var(--ed-line-soft)]">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

              <FadeIn direction="right">
                <div>
                  <p className="font-micro text-amber-warm mb-8">{ed.featuredEyebrow}</p>
                  <h2 className="ed-display-lg font-display text-ivory">
                    {featuredCollection.name}
                  </h2>
                  <p className="text-sm text-soft leading-relaxed mt-8 max-w-md whitespace-pre-line">
                    {getLocalizedText(featuredCollection.description, currentLang) || ed.featuredDesc}
                  </p>

                  {/* Technical row */}
                  <div className="flex gap-10 mt-10">
                    {[ed.featuredSpec1, ed.featuredSpec2, ed.featuredSpec3].map((spec, i) => (
                      <div key={i}>
                        <div className="ed-hairline mb-3 max-w-[72px]" />
                        <span className="font-mono-tech text-xs text-ivory">{spec}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-12 flex flex-wrap items-center gap-6">
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
                <div className="relative aspect-[3/2] overflow-hidden bg-[var(--ed-bg-2)]">
                  <img
                    src={featuredCollection.image}
                    alt={featuredCollection.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[rgba(29,29,27,0.74)] to-transparent pointer-events-none" />
                  <span className="font-mono-tech text-[10px] text-[var(--ed-warmwhite)] absolute bottom-5 right-5">
                    {featuredCollection.code}
                  </span>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* ARCHITECTURAL APPLICATIONS — large compositions, overlapping type */}
      {/* ============================================================ */}
      <section className="py-24 lg:py-32 border-t border-[var(--ed-line-soft)]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
            <FadeIn>
              <EdSectionHead
                eyebrow={ed.appsEyebrow}
                titleA={ed.appsTitleA}
                titleB={ed.appsTitleB}
              />
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="font-micro text-[10px] text-mute max-w-[280px] leading-loose">{ed.appsSub}</p>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {appImages.map((sol, i) => (
              <FadeIn key={sol.id} delay={0.08 * i}>
                <button
                  onClick={() => onNavigate('solutions', sol.slug)}
                  className="group relative w-full aspect-[4/3] overflow-hidden text-left"
                >
                  <img
                    src={sol.image}
                    alt={sol.title[currentLang]}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.05]"
                  />
                  {/* Dark overlay only where type sits */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1d1d1b]/85 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-7 lg:p-9 flex items-end justify-between">
                    <div>
                      <span className="font-micro text-[9px] text-amber-warm block mb-2">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="ed-display-sm font-display text-ivory">
                        {appLabels[i] || sol.title[currentLang]}
                      </h3>
                    </div>
                    <ArrowRight className="w-5 h-5 text-ivory opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-400" />
                  </div>
                </button>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FEATURED PROJECTS — full-width + two-column editorial spread  */}
      {/* ============================================================ */}
      {featuredProjects.length > 0 && (
        <section className="py-24 lg:py-32 border-t border-[var(--ed-line-soft)]">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
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
                  onClick={() => onNavigate('projects', featuredProjects[0].slug)}
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
                        <span>{featuredProjects[0].categoryName[currentLang]}</span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mt-6 lg:mt-8">
              {featuredProjects.slice(1).map((project, i) => (
                <FadeIn key={project.id} delay={0.1 * i}>
                  <button
                    onClick={() => onNavigate('projects', project.slug)}
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
                        <span>{project.categoryName[currentLang]}</span>
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
      {/* LIGHTING SOLUTIONS — minimal numbered list with hover reveal   */}
      {/* ============================================================ */}
      <section className="py-24 lg:py-32 border-t border-[var(--ed-line-soft)]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <FadeIn>
            <EdSectionHead
              eyebrow={ed.solEyebrow}
              titleA={ed.solTitleA}
              titleB={ed.solTitleB}
              className="mb-16"
            />
          </FadeIn>

          <div>
            {solutionEntries.map((entry, i) => (
              <FadeIn key={entry.num} delay={0.05 * i}>
                <button
                  onClick={entry.action}
                  className="group w-full flex items-center justify-between py-8 lg:py-10 border-t border-[var(--ed-line)] text-left relative overflow-hidden"
                >
                  {/* Warm illumination sweep on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(245,166,35,0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                  <div className="flex items-baseline gap-8 lg:gap-16 relative z-10">
                    <span className="font-mono-tech text-xs text-mute">{entry.num}</span>
                    <span className="ed-display-sm font-display text-ivory group-hover:text-amber-warm transition-colors duration-400">
                      {entry.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-8 relative z-10">
                    {/* Image reveal on hover (desktop) */}
                    {entry.image && (
                      <div className="hidden lg:block w-40 h-24 overflow-hidden opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                        <img src={entry.image} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <ArrowRight className="w-5 h-5 text-mute group-hover:text-amber-warm group-hover:translate-x-1.5 transition-all duration-300" />
                  </div>
                </button>
              </FadeIn>
            ))}
            <div className="border-t border-[var(--ed-line)]" />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CUSTOM PRODUCTION — 01–04, technical, large numbers           */}
      {/* ============================================================ */}
      <section className="py-24 lg:py-32 border-t border-[var(--ed-line-soft)]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14">

            <div className="lg:col-span-5">
              <FadeIn>
                <EdSectionHead
                  eyebrow={ed.prodEyebrow}
                  titleA={ed.prodTitleA}
                  titleB={ed.prodTitleB}
                  sub={ed.prodSub}
                />
              </FadeIn>

              <div className="mt-14 space-y-0">
                {productionSteps.map((step, i) => (
                  <FadeIn key={step.num} delay={0.06 * i}>
                    <div className="flex items-baseline gap-10 py-7 border-t border-[var(--ed-line)]">
                      <span className="ed-display-sm font-display text-amber-warm/80 leading-none">{step.num}</span>
                      <span className="font-micro text-[11px] text-ivory">{step.label}</span>
                    </div>
                  </FadeIn>
                ))}
                <div className="border-t border-[var(--ed-line)]" />
              </div>
            </div>

            {/* Close-up production photography */}
            <div className="lg:col-span-7">
              <FadeIn direction="left" className="h-full">
                <div className="grid grid-cols-2 gap-6 h-full">
                  <div className="relative overflow-hidden aspect-[3/4]">
                    <img
                      src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=900&q=80"
                      alt="Ecolife production"
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-4 left-4 font-micro text-[9px] text-ivory/80">{ed.facilityTag}</span>
                  </div>
                  <div className="relative overflow-hidden aspect-[3/4] mt-12">
                    <img
                      src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80"
                      alt="Ecolife assembly"
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-4 left-4 font-micro text-[9px] text-ivory/80">{ed.assemblyTag}</span>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* WHY ECOLIFE — large typography, thin lines, no icons          */}
      {/* ============================================================ */}
      <section className="py-24 lg:py-32 border-t border-[var(--ed-line-soft)]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <FadeIn>
            <EdSectionHead
              eyebrow={ed.whyEyebrow}
              titleA={ed.whyTitleA}
              titleB={ed.whyTitleB}
              className="mb-16"
            />
          </FadeIn>

          <div>
            {whyItems.map((item, i) => (
              <FadeIn key={item} delay={0.05 * i}>
                <div className="group flex items-center justify-between py-6 lg:py-8 border-t border-[var(--ed-line)]">
                  <span className="ed-display-md font-display text-ivory/90 group-hover:text-ivory group-hover:translate-x-2 transition-all duration-500">
                    {item}
                  </span>
                  <span className="font-mono-tech text-xs text-mute">{String(i + 1).padStart(2, '0')}</span>
                </div>
              </FadeIn>
            ))}
            <div className="border-t border-[var(--ed-line)]" />
          </div>

          {/* Real counts from live data */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 mt-20">
            {[
              { value: `${products.length}+`, label: ed.statProducts },
              { value: `${projects.length}+`, label: ed.statProjects },
              { value: 'CRI 95+', label: ed.featuredSpec1 },
              { value: 'UGR < 19', label: ed.featuredSpec2 },
            ].map((stat, i) => (
              <FadeIn key={i} delay={0.06 * i}>
                <div>
                  <div className="ed-display-sm font-display text-amber-warm">{stat.value}</div>
                  <div className="font-micro text-[9px] text-mute mt-3">{stat.label}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FINAL CTA — dramatic dark close                               */}
      {/* ============================================================ */}
      <section className="relative py-32 lg:py-44 border-t border-[var(--ed-line-soft)] overflow-hidden">
        {/* Warm architectural glow */}
        <div className="absolute inset-x-0 bottom-[-30%] h-[70%] ed-glow-warm pointer-events-none" />
        {/* Let the warm light dissolve into the footer instead of ending on a visible edge. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 z-[1] h-56 bg-[linear-gradient(to_bottom,rgba(29,29,27,0)_0%,rgba(29,29,27,0.42)_48%,var(--ed-bg)_100%)] backdrop-blur-[3px] pointer-events-none"
        />

        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">

            <div className="lg:col-span-8">
              <FadeIn>
                <h2 className="ed-display-lg font-display text-ivory">
                  {ed.ctaTitleA}<br />
                  <span className="text-amber-warm">{ed.ctaTitleB}</span>
                </h2>
              </FadeIn>
              <FadeIn delay={0.15}>
                <p className="text-sm text-soft leading-relaxed mt-8 max-w-md whitespace-pre-line">
                  {ed.ctaText}
                </p>
                <div className="mt-10">
                  <EdButton arrow onClick={onOpenContact}>
                    {ed.ctaBtn}
                  </EdButton>
                </div>
              </FadeIn>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};
