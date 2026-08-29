import React from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { solutions } from '../data/solutions';
import { useData } from '../context/DataContext';
import { motion } from 'motion/react';
import { FadeIn } from '../components/ui/FadeIn';
import { TiltCard } from '../components/ui/TiltCard';
import { LedLightBeam } from '../components/ui/LedLightBeam';
import { LedAmbientGlow } from '../components/ui/LedAmbientGlow';
import { 
  ArrowRight, 
  ArrowUpRight,
  DraftingCompass, 
  Building, 
  LampCeiling, 
  Globe2, 
  Gem, 
  SlidersHorizontal, 
  Users2, 
  ShieldCheck, 
  SunMedium,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface HomePageProps {
  currentLang: Language;
  onNavigate: (page: string, param?: string) => void;
  onOpenContact: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  currentLang,
  onNavigate,
  onOpenContact
}) => {
  const t = translations[currentLang];
  const { products, projects } = useData();
  const featuredProducts = products.filter(p => p.featured).slice(0, 4).length > 0
    ? products.filter(p => p.featured).slice(0, 4)
    : products.slice(0, 4);
  const featuredProjects = projects.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#08090A] text-[#F5F5F5] pt-20 overflow-hidden relative">
      {/* Interactive Ambient LED Cursor Illumination */}
      <LedAmbientGlow />

      {/* ========================================================================= */}
      {/* SECTION 01: HERO (Matching Reference Image 1) */}
      {/* ========================================================================= */}
      <section className="relative min-h-[85vh] lg:min-h-[90vh] flex flex-col justify-between overflow-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-full rounded-2xl lg:rounded-3xl overflow-hidden border border-white/10 bg-[#0E0F12] my-4 shadow-2xl flex-1 flex flex-col justify-center"
        >
          {/* Linear LED Profile Top Edge Accent */}
          <LedLightBeam orientation="horizontal" color="#FFD21A" glowIntensity="medium" />

          {/* Architectural Background Photography with Linear Lighting */}
          <div className="absolute inset-0 z-0">
            <motion.img 
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85" 
              alt="Ecolife Architectural Linear LED Lighting Interior" 
              className="w-full h-full object-cover object-center"
            />
            {/* Architectural Subtle Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#08090A]/95 via-[#08090A]/70 to-transparent lg:w-3/5" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08090A] via-transparent to-transparent opacity-80" />
            
            {/* Optional glow effect */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FFD21A]/5 rounded-full blur-[120px]" />
          </div>

          {/* Hero Content (Left Positioned matching Reference 1) */}
          <div className="relative z-10 p-6 sm:p-10 lg:p-16 max-w-2xl">
            {/* Small Eyebrow */}
            <FadeIn delay={0.2} direction="up">
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="text-xs sm:text-sm font-bold tracking-[0.25em] text-[#FFD21A] uppercase font-['Plus_Jakarta_Sans',sans-serif]">
                  {t.hero.eyebrow}
                </span>
              </div>
            </FadeIn>

            {/* Main Headline */}
            <FadeIn delay={0.3} direction="up">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white uppercase leading-[1.1] mb-6 drop-shadow-2xl">
                {t.hero.headline1}<br />
                {t.hero.headline2}
              </h1>
            </FadeIn>

            {/* Supporting Line */}
            <FadeIn delay={0.4} direction="up">
              <p className="text-base sm:text-lg text-gray-300 font-normal leading-relaxed mb-8 max-w-lg">
                {t.hero.subtitle}
              </p>
            </FadeIn>

            {/* Action CTAs */}
            <FadeIn delay={0.5} direction="up">
              <div className="flex flex-wrap items-center gap-4">
                {/* Primary CTA */}
                <button
                  onClick={() => onNavigate('catalog')}
                  className="flex items-center gap-3 bg-[#FFD21A] text-black font-bold text-xs sm:text-sm uppercase tracking-wider px-6 sm:px-8 py-3.5 sm:py-4 rounded hover:bg-[#F0C413] transition-all duration-200 shadow-[0_0_25px_rgba(255,210,26,0.3)] hover:scale-[1.02]"
                >
                  <span>{t.hero.ctaPrimary}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Secondary CTA */}
                <button
                  onClick={() => onNavigate('projects')}
                  className="flex items-center gap-3 bg-black/40 backdrop-blur-sm border border-[#FFD21A]/60 text-white hover:text-[#FFD21A] hover:border-[#FFD21A] font-bold text-xs sm:text-sm uppercase tracking-wider px-6 sm:px-8 py-3.5 sm:py-4 rounded hover:bg-black/60 transition-all duration-200 hover:scale-[1.02]"
                >
                  <span>{t.hero.ctaSecondary}</span>
                  <ArrowRight className="w-4 h-4 text-[#FFD21A]" />
                </button>
              </div>
            </FadeIn>
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* FOUR STATISTICS BAR (Matching Reference 1 Bottom Bar) */}
        {/* ========================================================================= */}
        <FadeIn delay={0.6} direction="up">
          <div className="w-full bg-[#101114] border border-white/10 rounded-xl lg:rounded-2xl p-6 lg:p-8 my-4 shadow-xl">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
              
              {/* Stat 1: 20+ */}
              <div className="flex items-center gap-4 pt-4 lg:pt-0 first:pt-0 hover:-translate-y-1 transition-transform cursor-default">
                <div className="w-12 h-12 rounded-lg bg-[#FFD21A]/10 border border-[#FFD21A]/30 flex items-center justify-center text-[#FFD21A] flex-shrink-0">
                  <DraftingCompass className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    20+
                  </div>
                  <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {t.stats.experience}
                  </div>
                </div>
              </div>

              {/* Stat 2: 500+ */}
              <div className="flex items-center gap-4 pt-4 lg:pt-0 lg:pl-8 hover:-translate-y-1 transition-transform cursor-default">
                <div className="w-12 h-12 rounded-lg bg-[#FFD21A]/10 border border-[#FFD21A]/30 flex items-center justify-center text-[#FFD21A] flex-shrink-0">
                  <Building className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    500+
                  </div>
                  <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {t.stats.projects}
                  </div>
                </div>
              </div>

              {/* Stat 3: 1000+ */}
              <div className="flex items-center gap-4 pt-4 lg:pt-0 lg:pl-8 hover:-translate-y-1 transition-transform cursor-default">
                <div className="w-12 h-12 rounded-lg bg-[#FFD21A]/10 border border-[#FFD21A]/30 flex items-center justify-center text-[#FFD21A] flex-shrink-0">
                  <LampCeiling className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    1000+
                  </div>
                  <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {t.stats.products}
                  </div>
                </div>
              </div>

              {/* Stat 4: 50+ */}
              <div className="flex items-center gap-4 pt-4 lg:pt-0 lg:pl-8 hover:-translate-y-1 transition-transform cursor-default">
                <div className="w-12 h-12 rounded-lg bg-[#FFD21A]/10 border border-[#FFD21A]/30 flex items-center justify-center text-[#FFD21A] flex-shrink-0">
                  <Globe2 className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    50+
                  </div>
                  <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {t.stats.export}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </FadeIn>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 02: "NIYƏ ECOLIFE?" (Matching Reference Image 1 Middle Section) */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-[#101114] border border-white/10 rounded-2xl lg:rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#FFD21A]/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Heading & 4 Advantages */}
            <div className="lg:col-span-7 space-y-10">
              <FadeIn direction="left">
                <div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
                    {t.whyUs.title}
                  </h2>
                  <p className="text-base sm:text-lg text-gray-300 font-normal leading-relaxed max-w-xl">
                    {t.whyUs.subtitle}
                  </p>
                </div>
              </FadeIn>

              {/* 4 Minimalist Advantage Cards with Yellow Underline Bars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                
                {/* 1: YÜKSƏK KEYFİYYƏT */}
                <FadeIn delay={0.1}>
                  <div className="space-y-3 group cursor-default">
                    <div className="w-14 h-14 rounded-xl bg-black/40 border border-[#FFD21A]/40 flex items-center justify-center text-[#FFD21A] transition-all duration-300 shadow-[0_0_15px_rgba(255,210,26,0.1)] group-hover:scale-110 group-hover:bg-[#FFD21A]/10">
                      <Gem className="w-7 h-7 stroke-[1.5]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                        {t.whyUs.highQuality}
                      </h3>
                      <div className="w-10 h-[2px] bg-[#FFD21A] mt-2 mb-2 transition-all duration-300 group-hover:w-full" />
                      <p className="text-xs text-gray-400 leading-relaxed">
                        {t.whyUs.highQualityDesc}
                      </p>
                    </div>
                  </div>
                </FadeIn>

                {/* 2: FƏRDİ HƏLLƏR */}
                <FadeIn delay={0.2}>
                  <div className="space-y-3 group cursor-default">
                    <div className="w-14 h-14 rounded-xl bg-black/40 border border-[#FFD21A]/40 flex items-center justify-center text-[#FFD21A] transition-all duration-300 shadow-[0_0_15px_rgba(255,210,26,0.1)] group-hover:scale-110 group-hover:bg-[#FFD21A]/10">
                      <SlidersHorizontal className="w-7 h-7 stroke-[1.5]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                        {t.whyUs.customSolutions}
                      </h3>
                      <div className="w-10 h-[2px] bg-[#FFD21A] mt-2 mb-2 transition-all duration-300 group-hover:w-full" />
                      <p className="text-xs text-gray-400 leading-relaxed">
                        {t.whyUs.customSolutionsDesc}
                      </p>
                    </div>
                  </div>
                </FadeIn>

                {/* 3: PEŞƏKAR DƏSTƏK */}
                <FadeIn delay={0.3}>
                  <div className="space-y-3 group cursor-default">
                    <div className="w-14 h-14 rounded-xl bg-black/40 border border-[#FFD21A]/40 flex items-center justify-center text-[#FFD21A] transition-all duration-300 shadow-[0_0_15px_rgba(255,210,26,0.1)] group-hover:scale-110 group-hover:bg-[#FFD21A]/10">
                      <Users2 className="w-7 h-7 stroke-[1.5]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                        {t.whyUs.expertSupport}
                      </h3>
                      <div className="w-10 h-[2px] bg-[#FFD21A] mt-2 mb-2 transition-all duration-300 group-hover:w-full" />
                      <p className="text-xs text-gray-400 leading-relaxed">
                        {t.whyUs.expertSupportDesc}
                      </p>
                    </div>
                  </div>
                </FadeIn>

                {/* 4: ZƏMANƏT */}
                <FadeIn delay={0.4}>
                  <div className="space-y-3 group cursor-default">
                    <div className="w-14 h-14 rounded-xl bg-black/40 border border-[#FFD21A]/40 flex items-center justify-center text-[#FFD21A] transition-all duration-300 shadow-[0_0_15px_rgba(255,210,26,0.1)] group-hover:scale-110 group-hover:bg-[#FFD21A]/10">
                      <ShieldCheck className="w-7 h-7 stroke-[1.5]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                        {t.whyUs.warranty}
                      </h3>
                      <div className="w-10 h-[2px] bg-[#FFD21A] mt-2 mb-2 transition-all duration-300 group-hover:w-full" />
                      <p className="text-xs text-gray-400 leading-relaxed">
                        {t.whyUs.warrantyDesc}
                      </p>
                    </div>
                  </div>
                </FadeIn>

              </div>
            </div>

            {/* Right Column: Architectural Photography Showing Recessed Linear Lighting in Executive Boardroom */}
            <FadeIn direction="right" className="lg:col-span-5 h-full">
              <TiltCard className="h-[400px] sm:h-[480px]">
                <div className="w-full h-full rounded-xl overflow-hidden border border-white/10 relative shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  <img 
                    src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80" 
                    alt="Ecolife Linear Lighting in Modern Boardroom" 
                    className="w-full h-full object-cover scale-[1.03] hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-6">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#FFD21A]">
                      <SunMedium className="w-4 h-4" />
                      <span>{t.whyUs.imageTagline}</span>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </FadeIn>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 03: FEATURED PRODUCTS PREVIEW */}
      {/* ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <FadeIn direction="up">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#FFD21A] mb-2">
                {t.home.popularEyebrow}
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
                {t.home.popularTitle}
              </h2>
              <p className="text-sm text-gray-400 mt-2 max-w-xl">
                {t.home.popularSubtitle}
              </p>
            </div>

            <button
              onClick={() => onNavigate('catalog')}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#FFD21A] hover:text-white transition-colors group"
            >
              <span>{t.home.viewAllProducts}</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </FadeIn>

        {/* 4 Column Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, index) => (
            <FadeIn key={product.id} delay={0.1 * index} direction="up">
              <TiltCard>
                <div
                  onClick={() => onNavigate('catalog', product.slug)}
                  className="group h-full bg-[#101114] border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-[#FFD21A]/50 transition-all duration-300 shadow-xl hover:shadow-[0_0_30px_rgba(255,210,26,0.15)] flex flex-col relative z-10"
                >
                  {/* Subtle LED Profile Edge */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <LedLightBeam color="#FFD21A" glowIntensity="high" />
                  </div>

                  {/* Product Image on Clean Dark Neutral Surface */}
                  <div className="relative aspect-[4/3] bg-[#16181D] overflow-hidden flex items-center justify-center p-4">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover rounded transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-black/70 text-gray-300 px-2.5 py-1 rounded border border-white/10 product-code-badge shadow-sm backdrop-blur-md">
                        {product.code}
                      </span>
                    </div>
                  </div>

                  {/* Details & Yellow Arrow */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white uppercase tracking-wide group-hover:text-[#FFD21A] transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        {product.subtitle[currentLang]}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-400">
                        {product.specs.dimensions}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#FFD21A] group-hover:bg-[#FFD21A] group-hover:text-black transition-all">
                        <ArrowRight className="w-4 h-4 transform group-hover:-rotate-45 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 04: FEATURED ARCHITECTURAL PROJECTS (Editorial Style) */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <FadeIn direction="up">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#FFD21A] mb-2">
                {t.home.portfolioEyebrow}
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
                {t.home.portfolioTitle}
              </h2>
              <p className="text-sm text-gray-400 mt-2 max-w-xl">
                {t.home.portfolioSubtitle}
              </p>
            </div>

            <button
              onClick={() => onNavigate('projects')}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#FFD21A] hover:text-white transition-colors group"
            >
              <span>{t.home.viewAllProjects}</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </FadeIn>

        {/* Editorial Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {featuredProjects.map((project, index) => (
            <FadeIn key={project.id} delay={0.15 * index} direction="up">
              <TiltCard>
                <div
                  onClick={() => onNavigate('projects', project.slug)}
                  className="group h-full bg-[#101114] border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-[#FFD21A]/50 transition-all duration-300 shadow-xl hover:shadow-[0_10px_40px_rgba(255,210,26,0.1)] flex flex-col relative z-10"
                >
                  {/* Cover Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img 
                      src={project.coverImage} 
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-3 left-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider bg-black/80 backdrop-blur-md text-[#FFD21A] px-2.5 py-1 rounded border border-white/10">
                        {project.categoryName[currentLang]}
                      </span>
                    </div>
                  </div>

                  {/* Text Info */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-wide group-hover:text-[#FFD21A] transition-colors">
                        {project.title}
                      </h3>
                      <div className="text-xs text-gray-400 mt-1">
                        {project.location}
                      </div>
                      <p className="text-xs text-gray-300 mt-3 line-clamp-2 leading-relaxed">
                        {project.shortDescription[currentLang]}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-[#FFD21A]">
                      <span>{t.projects.viewProject}</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </TiltCard>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 05: PROJECT INQUIRY CTA BANNER */}
      {/* ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-24">
        <FadeIn direction="up">
          <TiltCard className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-[#101114] to-[#16181D] border border-[#FFD21A]/20 rounded-2xl p-8 sm:p-14 text-center relative overflow-hidden shadow-[0_0_50px_rgba(255,210,26,0.1)]">
              {/* Background Glow */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,rgba(255,210,26,0.08)_0%,transparent_50%)]" />
              </div>
              
              <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight drop-shadow-lg">
                  {t.home.contactBannerTitle}
                </h2>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                  {t.home.contactBannerSubtitle}
                </p>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
                  <button
                    onClick={onOpenContact}
                    className="group bg-[#FFD21A] text-black font-bold text-xs uppercase tracking-wider px-8 py-4 rounded hover:bg-[#F0C413] transition-all shadow-[0_0_25px_rgba(255,210,26,0.25)] flex items-center gap-2"
                  >
                    <span>{t.nav.writeUs}</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => onNavigate('contact')}
                    className="bg-transparent border border-white/20 hover:border-white text-white font-bold text-xs uppercase tracking-wider px-8 py-4 rounded transition-all"
                  >
                    {t.home.contactInfoBtn}
                  </button>
                </div>
              </div>
            </div>
          </TiltCard>
        </FadeIn>
      </section>
    </div>
  );
};

