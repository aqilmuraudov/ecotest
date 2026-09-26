import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { useData } from '../context/DataContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  ArrowUpRight,
  Maximize2,
  Check,
  Compass,
  Cpu,
  Layers,
  Sparkles,
  Sliders,
  ShieldCheck,
  DownloadCloud
} from 'lucide-react';
import { LightKelvinPreview } from '../components/ui/LightKelvinPreview';
import { ExplodedProfileViewer } from '../components/ui/ExplodedProfileViewer';

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

  // Curated flagship architectural products
  const displayProducts = products.filter(p => p.featured).slice(0, 4).length >= 4
    ? products.filter(p => p.featured).slice(0, 4)
    : products.slice(0, 4);

  // Top 3 architectural case studies
  const caseStudies = projects.slice(0, 3);

  // Interactive CRI material demonstration state
  const [criMode, setCriMode] = useState<'cri95' | 'cri80'>('cri95');

  return (
    <div className="min-h-screen bg-[#08090A] text-[#F4F4F2] selection:bg-[#FFD21A] selection:text-black overflow-x-hidden">
      
      {/* ========================================================================= */}
      {/* 01. MONUMENTAL ARCHITECTURAL HERO: LIGHT AS STRUCTURE                    */}
      {/* ========================================================================= */}
      <section className="relative min-h-[92vh] lg:min-h-screen flex flex-col justify-between pt-24 pb-12 px-4 sm:px-6 lg:px-12 border-b border-white/10 overflow-hidden">
        
        {/* Architectural Grid & Ambient Atmosphere */}
        <div className="absolute inset-0 architectural-grid opacity-30 pointer-events-none" />
        
        {/* Dynamic Architectural Backdrop Image with Physical Light Influence */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.img 
            initial={{ scale: 1.08, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 0.85 }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2200&q=85" 
            alt="Ecolife Architectural Linear Lighting Pavilion" 
            className="w-full h-full object-cover object-center filter grayscale-[15%] brightness-[0.75] contrast-[1.1]"
          />
          {/* Spatial Dark Gradients for Controlled Depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#08090A] via-[#08090A]/70 to-transparent lg:w-3/5" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08090A] via-[#08090A]/40 to-transparent" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#08090A]/50 to-[#08090A]" />
        </div>

        {/* Top Edge: Linear LED Profile Beam Ignition */}
        <div className="relative z-10 w-full mb-8">
          <div className="flex items-center justify-between text-[11px] font-mono tracking-widest text-[#8E929B] uppercase hairline-b pb-3">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-[#FFD21A] inline-block shadow-[0_0_8px_#FFD21A]" />
              <span>ECOLIFE ARCHITECTURAL LIGHTING SYSTEMS</span>
            </div>
            <div className="hidden sm:flex items-center gap-4 tabular-nums">
              <span>LAT: 40.4093° N</span>
              <span>·</span>
              <span>LON: 49.8671° E</span>
              <span>·</span>
              <span>BAKU, AZ</span>
            </div>
          </div>

          {/* Physical LED Beam Ignition Sweep */}
          <div className="relative w-full h-[2px] bg-white/10 overflow-hidden mt-1">
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 4.5, ease: 'linear' }}
              className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-[#FFD21A] to-transparent shadow-[0_0_12px_#FFD21A]"
            />
          </div>
        </div>

        {/* Hero Narrative: Monumental Typography */}
        <div className="relative z-10 max-w-4xl space-y-8 my-auto">
          {/* Editorial Technical Kicker */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.25em] text-[#FFD21A]"
          >
            <span className="w-8 h-[1px] bg-[#FFD21A]" />
            <span>
              {currentLang === 'az' ? 'MEMARLIQ VƏ MÜHƏNDİSLİK İŞIĞI' : currentLang === 'ru' ? 'АРХИТЕКТУРНОЕ И ИНЖЕНЕРНОЕ ОСВЕЩЕНИЕ' : 'ARCHITECTURAL & ENGINEERING LIGHT'}
            </span>
          </motion.div>

          {/* Structural Display Statement */}
          <motion.h1 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black uppercase tracking-tight text-[#F4F4F2] leading-[0.95]"
          >
            {currentLang === 'az' ? (
              <>
                İŞIQ <br />
                <span className="text-[#FFD21A] drop-shadow-[0_0_35px_rgba(255,210,26,0.3)]">MEMARLIĞA</span> <br />
                ÇEVRİLİR.
              </>
            ) : currentLang === 'ru' ? (
              <>
                СВЕТ <br />
                <span className="text-[#FFD21A] drop-shadow-[0_0_35px_rgba(255,210,26,0.3)]">СТАНОВИТСЯ</span> <br />
                АРХИТЕКТУРОЙ.
              </>
            ) : (
              <>
                LIGHT <br />
                <span className="text-[#FFD21A] drop-shadow-[0_0_35px_rgba(255,210,26,0.3)]">BECOMES</span> <br />
                ARCHITECTURE.
              </>
            )}
          </motion.h1>

          {/* Restrained Architectural Prose */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="text-sm sm:text-base lg:text-lg text-[#9E9EA4] max-w-xl font-normal leading-relaxed"
          >
            {t.hero.subtitle}
          </motion.p>

          {/* Primary & Secondary Architectural Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            <button
              onClick={() => onNavigate('catalog')}
              className="flex items-center gap-3 bg-[#FFD21A] hover:bg-[#F0C413] text-black font-bold text-xs uppercase tracking-widest px-8 py-4 transition-all duration-200 shadow-[0_0_25px_rgba(255,210,26,0.3)]"
            >
              <span>{t.hero.ctaPrimary}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('projects')}
              className="flex items-center gap-3 bg-[#0E1013]/80 hover:bg-[#14161B] text-[#F4F4F2] border border-white/20 hover:border-white font-mono text-xs uppercase tracking-widest px-7 py-4 transition-all duration-200"
            >
              <span>{t.hero.ctaSecondary}</span>
              <ArrowUpRight className="w-4 h-4 text-[#FFD21A]" />
            </button>
          </motion.div>
        </div>

        {/* Bottom Technical Specifications Strip (Replacing floating icons) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative z-10 pt-8 hairline-t mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono text-[#8E929B]"
        >
          <div>
            <span className="block text-[10px] text-gray-500 uppercase tracking-widest">GÖVDƏ MATERİALI</span>
            <span className="text-white font-semibold uppercase">6063-T5 ALÜMİNİUM</span>
          </div>
          <div>
            <span className="block text-[10px] text-gray-500 uppercase tracking-widest">RƏNGÖTÜRMƏ DƏQİQLİYİ</span>
            <span className="text-[#FFD21A] font-semibold uppercase">CRI &gt; 95 (R9 &gt; 85)</span>
          </div>
          <div>
            <span className="block text-[10px] text-gray-500 uppercase tracking-widest">OPTİK PARILTI NƏZARƏTİ</span>
            <span className="text-white font-semibold uppercase">UGR &lt; 16 STANDART</span>
          </div>
          <div>
            <span className="block text-[10px] text-gray-500 uppercase tracking-widest">MÜHƏNDİSLİK PROTOKOLU</span>
            <span className="text-white font-semibold uppercase">DALI-2 / 0-10V / TRIAC</span>
          </div>
        </motion.div>
      </section>

      {/* ========================================================================= */}
      {/* 02. EDITORIAL MONOGRAPH METRICS (Replacing Generic 4-Stat Box Row)        */}
      {/* ========================================================================= */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-12 border-b border-white/10 bg-[#0E1013]">
        <div className="max-w-7xl mx-auto">
          {/* Section Kicker */}
          <div className="flex items-center justify-between text-[11px] font-mono tracking-widest text-[#8E929B] uppercase mb-12 hairline-b pb-4">
            <span className="text-[#FFD21A]">01 // RƏQƏMLƏRLƏ ECOLIFE TƏCRÜBƏSİ</span>
            <span>ANNUAL ARCHITECTURAL AUDIT</span>
          </div>

          {/* Integrated Monograph Numbers with Large Spatial Rhythm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
            
            {/* Stat 01: 20+ */}
            <div className="pt-6 lg:pt-0 first:pt-0 lg:pr-8 group cursor-default">
              <div className="text-5xl sm:text-6xl lg:text-7xl font-black text-white font-mono tracking-tighter tabular-nums group-hover:text-[#FFD21A] transition-colors">
                20+
              </div>
              <div className="w-8 h-[2px] bg-[#FFD21A] my-4" />
              <div className="text-xs font-mono font-bold uppercase tracking-widest text-white">
                {t.stats.experience}
              </div>
              <p className="text-xs text-[#8E929B] mt-2 leading-relaxed">
                {currentLang === 'az' 
                  ? 'Azərbaycanda xətti və memarlıq işıqlandırma istehsalında dərin mühəndislik biliyi.'
                  : currentLang === 'ru'
                  ? 'Многолетний опыт производства архитектурных профилей и светотехники в Азербайджане.'
                  : 'Decades of deep manufacturing pedigree in architectural linear extrusions.'}
              </p>
            </div>

            {/* Stat 02: 500+ */}
            <div className="pt-6 lg:pt-0 lg:px-8 group cursor-default">
              <div className="text-5xl sm:text-6xl lg:text-7xl font-black text-white font-mono tracking-tighter tabular-nums group-hover:text-[#FFD21A] transition-colors">
                500+
              </div>
              <div className="w-8 h-[2px] bg-[#FFD21A] my-4" />
              <div className="text-xs font-mono font-bold uppercase tracking-widest text-white">
                {t.stats.projects}
              </div>
              <p className="text-xs text-[#8E929B] mt-2 leading-relaxed">
                {currentLang === 'az'
                  ? 'Biznes mərkəzləri, otellər, dövlət obyektləri və elit villalarda quraşdırılmış sistemlər.'
                  : currentLang === 'ru'
                  ? 'Реализованные проекты в бизнес-центрах, отелях, музеях и резиденциях.'
                  : 'Executed contracts across corporate headquarters, museums, and residences.'}
              </p>
            </div>

            {/* Stat 03: 1000+ */}
            <div className="pt-6 lg:pt-0 lg:px-8 group cursor-default">
              <div className="text-5xl sm:text-6xl lg:text-7xl font-black text-white font-mono tracking-tighter tabular-nums group-hover:text-[#FFD21A] transition-colors">
                1000+
              </div>
              <div className="w-8 h-[2px] bg-[#FFD21A] my-4" />
              <div className="text-xs font-mono font-bold uppercase tracking-widest text-white">
                {t.stats.products}
              </div>
              <p className="text-xs text-[#8E929B] mt-2 leading-relaxed">
                {currentLang === 'az'
                  ? 'Fərqli kəsik ölçülü xətti profillər, maqnit relslər, spotlar və aksesuarlar.'
                  : currentLang === 'ru'
                  ? 'Широкая номенклатура сечений профилей, магнитных систем и комплектующих.'
                  : 'Engineered profiles, magnetic tracks, glare louvers, and bespoke fittings.'}
              </p>
            </div>

            {/* Stat 04: 50+ */}
            <div className="pt-6 lg:pt-0 lg:pl-8 group cursor-default">
              <div className="text-5xl sm:text-6xl lg:text-7xl font-black text-white font-mono tracking-tighter tabular-nums group-hover:text-[#FFD21A] transition-colors">
                50+
              </div>
              <div className="w-8 h-[2px] bg-[#FFD21A] my-4" />
              <div className="text-xs font-mono font-bold uppercase tracking-widest text-white">
                {t.stats.export}
              </div>
              <p className="text-xs text-[#8E929B] mt-2 leading-relaxed">
                {currentLang === 'az'
                  ? 'Qlobal təchizatçılarla rəsmi partnyorluq və xarici layihələrlə əməkdaşlıq.'
                  : currentLang === 'ru'
                  ? 'Прямые партнерские отношения и поставки для зарубежных объектов.'
                  : 'Cross-border project delivery and verified international standards.'}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 03. TANGIBLE EVIDENCE CHAPTER (Destroying Generic Icon-Card Repetition)   */}
      {/* ========================================================================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-12 border-b border-white/10 max-w-7xl mx-auto">
        <div className="flex items-center justify-between text-[11px] font-mono tracking-widest text-[#8E929B] uppercase mb-12 hairline-b pb-4">
          <span className="text-[#FFD21A]">02 // MÜHƏNDİSLİK DƏLİLLƏRİ</span>
          <span>MATERIAL &amp; OPTICAL FIDELITY</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Asymmetric Statement & Evidence List */}
          <div className="lg:col-span-5 space-y-10">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-white leading-tight">
                {t.whyUs.title}
              </h2>
              <p className="text-sm sm:text-base text-[#9E9EA4] mt-4 leading-relaxed">
                {t.whyUs.subtitle}
              </p>
            </div>

            {/* Evidence 1: CRI & Color Fidelity */}
            <div className="space-y-3 pt-4 hairline-t">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-[#FFD21A] tracking-wider font-bold">
                  01. FOTOMETRİK DƏQİQLİK (CRI &gt; 95)
                </span>
                <span className="text-[11px] font-mono text-gray-500">EN 12464-1</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {t.whyUs.highQualityDesc} Standart CRI 80 diodlardan fərqli olaraq, Ecolife sistemləri təbii ağac, mərmər və dəri tonlarını təhrif etmədən tam spektrdə əks etdirir.
              </p>
            </div>

            {/* Evidence 2: 50m Continuous Run Without Dark Gaps */}
            <div className="space-y-3 pt-4 hairline-t">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-[#FFD21A] tracking-wider font-bold">
                  02. 50M QARANLIQ KƏSİKSİZ BİRLƏŞMƏ
                </span>
                <span className="text-[11px] font-mono text-gray-500">CNC JOINTS</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {t.whyUs.customSolutionsDesc} Xüsusi örtüşən diffuzor və kilid sistemi profil birləşmələrindəki kölgələri aradan qaldıraraq monolit işıq xətti yaradır.
              </p>
            </div>

            {/* Evidence 3: Dialux Simulation & Technical Assurance */}
            <div className="space-y-3 pt-4 hairline-t">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-[#FFD21A] tracking-wider font-bold">
                  03. DIALUX EVO HESABATI VƏ ZƏMANƏT
                </span>
                <span className="text-[11px] font-mono text-gray-500">5 YEAR WARRANTY</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {t.whyUs.expertSupportDesc} İstehsaldan öncə cizgiləriniz əsasında iş sahəsi lüks səviyyəsi və parıltı (UGR) simulyasiyası hazırlanır.
              </p>
            </div>
          </div>

          {/* Right Column: Interactive CRI Material Comparison Demonstration */}
          <div className="lg:col-span-7 bg-[#0E1013] border border-white/10 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between hairline-b pb-4">
              <div className="text-xs font-mono uppercase tracking-widest text-[#FFD21A]">
                MATERİAL RENQÖTÜRMƏ TESTİ (CRI FIDELITY)
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCriMode('cri95')}
                  className={`px-3 py-1 text-xs font-mono uppercase transition-all ${
                    criMode === 'cri95'
                      ? 'bg-[#FFD21A] text-black font-bold'
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  Ecolife CRI 98
                </button>
                <button
                  onClick={() => setCriMode('cri80')}
                  className={`px-3 py-1 text-xs font-mono uppercase transition-all ${
                    criMode === 'cri80'
                      ? 'bg-white/20 text-white font-bold'
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  Standart CRI 80
                </button>
              </div>
            </div>

            {/* Photographic Demonstration under Controlled Light */}
            <div className="relative aspect-[16/10] overflow-hidden border border-white/10 bg-black">
              <img 
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80" 
                alt="Executive Boardroom Linear Lighting"
                className={`w-full h-full object-cover transition-all duration-700 ${
                  criMode === 'cri95' 
                    ? 'saturate-110 contrast-105 filter' 
                    : 'saturate-[0.6] contrast-[0.9] brightness-90 filter'
                }`}
              />

              {/* Dynamic Annotation Overlay */}
              <div className="absolute bottom-4 left-4 right-4 bg-[#08090A]/90 p-4 border border-white/10 backdrop-blur-md flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">SPEKTR REJİMİ</span>
                  <span className="text-white font-bold">
                    {criMode === 'cri95' ? 'ECOLIFE HIGH-FIDELITY SPECTRUM (Ra 98 / R9 > 90)' : 'KOMMERSİYA DƏRƏCƏLİ STANDART LED (Ra 80)'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 block text-[10px] uppercase">PARILTI DƏRƏCƏSİ</span>
                  <span className="text-[#FFD21A] font-bold">UGR &lt; 14 COMPLIANT</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#8E929B] leading-relaxed">
              * Yüksək keyfiyyətli R9 (qırmızı spektr) indeksi sayəsində taxta panellər, dəri kreslolar və təbii teksturalar solğun görünmür, məkanın orijinal memarlıq dəyəri qorunur.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 04. INTERACTIVE LIGHTING INSTRUMENTS: CCT TUNING & EXPLODED PROFILE     */}
      {/* ========================================================================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-12 border-b border-white/10 max-w-7xl mx-auto space-y-16">
        <div className="flex items-center justify-between text-[11px] font-mono tracking-widest text-[#8E929B] uppercase hairline-b pb-4">
          <span className="text-[#FFD21A]">03 // İNTERAKTİV MÜHƏNDİS PANELİ</span>
          <span>SYSTEM ARCHITECTURE &amp; DIGITAL TWIN</span>
        </div>

        {/* 1. Exploded Architectural LED Profile Viewer */}
        <ExplodedProfileViewer currentLang={currentLang} />

        {/* 2. Interactive Light Temperature & Ambient Spectrum Instrument */}
        <LightKelvinPreview currentLang={currentLang} />
      </section>

      {/* ========================================================================= */}
      {/* 05. INDUSTRIAL DESIGN CATALOGUE (Product Experience)                     */}
      {/* ========================================================================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-12 border-b border-white/10 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 hairline-b pb-6">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-[#FFD21A] mb-2">
              04 // {t.home.popularEyebrow}
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white">
              {t.home.popularTitle}
            </h2>
            <p className="text-sm text-gray-400 mt-2 max-w-xl">
              {t.home.popularSubtitle}
            </p>
          </div>

          <button
            onClick={() => onNavigate('catalog')}
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#FFD21A] hover:text-white transition-colors group"
          >
            <span>{t.home.viewAllProducts}</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 4 Architectural Product Showcase Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.map((product, idx) => (
            <div
              key={product.id}
              onClick={() => onNavigate('catalog', product.slug)}
              className="group bg-[#0E1013] border border-white/10 hover:border-[#FFD21A] transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              {/* Image Frame */}
              <div className="relative aspect-[4/3] bg-[#08090A] overflow-hidden p-4 flex items-center justify-center">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Product Code Metadata */}
                <div className="absolute top-3 left-3 text-[10px] font-mono uppercase tracking-wider bg-[#08090A]/90 px-2 py-1 text-gray-300 border border-white/10">
                  {product.code}
                </div>
              </div>

              {/* Product Specifications & Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-[10px] font-mono text-[#FFD21A] uppercase tracking-wider">
                    {product.categoryName[currentLang]}
                  </div>
                  <h3 className="text-base font-bold text-white uppercase tracking-tight mt-1 group-hover:text-[#FFD21A] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {product.subtitle[currentLang]}
                  </p>
                </div>

                {/* Technical Annotation Line */}
                <div className="pt-3 hairline-t flex items-center justify-between text-xs font-mono text-gray-400">
                  <span className="tabular-nums">{product.specs.dimensions}</span>
                  <div className="w-6 h-6 bg-white/5 flex items-center justify-center text-white group-hover:bg-[#FFD21A] group-hover:text-black transition-colors">
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:-rotate-45 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 06. ARCHITECTURAL CASE STUDIES (Projects as Monograph Pages)              */}
      {/* ========================================================================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-12 border-b border-white/10 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4 hairline-b pb-6">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-[#FFD21A] mb-2">
              05 // {t.home.portfolioEyebrow}
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white">
              {t.home.portfolioTitle}
            </h2>
            <p className="text-sm text-gray-400 mt-2 max-w-xl">
              {t.home.portfolioSubtitle}
            </p>
          </div>

          <button
            onClick={() => onNavigate('projects')}
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#FFD21A] hover:text-white transition-colors group"
          >
            <span>{t.home.viewAllProjects}</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Varied Architectural Layout Rhythm across Case Studies */}
        <div className="space-y-16">
          {/* Case Study 01: Hero Horizontal Monograph */}
          {caseStudies[0] && (
            <div 
              onClick={() => onNavigate('projects', caseStudies[0].slug)}
              className="group cursor-pointer bg-[#0E1013] border border-white/10 hover:border-[#FFD21A] transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 overflow-hidden"
            >
              <div className="lg:col-span-8 relative aspect-[16/9] lg:aspect-auto overflow-hidden">
                <img 
                  src={caseStudies[0].coverImage} 
                  alt={caseStudies[0].title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-black/80 text-[#FFD21A] text-xs font-mono uppercase tracking-wider px-3 py-1 border border-white/10">
                  {caseStudies[0].categoryName[currentLang]} · {caseStudies[0].year}
                </div>
              </div>

              <div className="lg:col-span-4 p-8 flex flex-col justify-between space-y-6">
                <div>
                  <span className="text-[11px] font-mono text-[#8E929B] uppercase tracking-widest block mb-2">
                    {caseStudies[0].location}
                  </span>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-white group-hover:text-[#FFD21A] transition-colors">
                    {caseStudies[0].title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 mt-3 leading-relaxed">
                    {caseStudies[0].shortDescription[currentLang]}
                  </p>
                </div>

                <div className="space-y-4 pt-6 hairline-t">
                  <div className="text-xs font-mono text-gray-300">
                    <span className="text-gray-500 block text-[10px] uppercase">İŞIQLANDIRMA HƏLLİ:</span>
                    <span>{caseStudies[0].lightingSolution[currentLang]}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-[#FFD21A] font-bold">
                    <span>{t.projects.viewProject}</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Case Studies 02 & 03: Split Architectural Pair */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {caseStudies.slice(1, 3).map((project) => (
              <div
                key={project.id}
                onClick={() => onNavigate('projects', project.slug)}
                className="group cursor-pointer bg-[#0E1013] border border-white/10 hover:border-[#FFD21A] transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img 
                    src={project.coverImage} 
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-black/80 text-[#FFD21A] text-xs font-mono uppercase px-2.5 py-1 border border-white/10">
                    {project.categoryName[currentLang]} · {project.year}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">
                      {project.location}
                    </span>
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white group-hover:text-[#FFD21A] transition-colors mt-1">
                      {project.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                      {project.shortDescription[currentLang]}
                    </p>
                  </div>

                  <div className="pt-4 hairline-t flex items-center justify-between text-xs font-mono text-[#FFD21A] font-semibold">
                    <span>{t.projects.viewProject}</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 07. MONUMENTAL CLOSING CTA: LET'S DESIGN THE LIGHT                        */}
      {/* ========================================================================= */}
      <section className="relative py-28 px-4 sm:px-6 lg:px-12 overflow-hidden bg-[#08090A]">
        {/* Subtle Horizontal Expanding Line of Light */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="h-[2px] bg-gradient-to-r from-transparent via-[#FFD21A] to-transparent shadow-[0_0_25px_#FFD21A]" />
        </div>

        <div className="max-w-3xl mx-auto text-center space-y-8 relative z-10">
          <div className="text-xs font-mono uppercase tracking-[0.3em] text-[#FFD21A]">
            {currentLang === 'az' ? 'YENİ LAYİHƏ VƏ YA SMETA' : currentLang === 'ru' ? 'НОВЫЙ ПРОЕКТ ИЛИ РАСЧЕТ' : 'NEW CONTRACT & DIALUX QUOTE'}
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-tight">
            {currentLang === 'az' ? (
              <>İŞIQLA YARADAQ.</>
            ) : currentLang === 'ru' ? (
              <>СОЗДАДИМ СВЕТ ВМЕСТЕ.</>
            ) : (
              <>LET'S SHAPE THE LIGHT.</>
            )}
          </h2>

          <p className="text-sm sm:text-base text-[#9E9EA4] max-w-xl mx-auto leading-relaxed">
            {t.home.contactBannerSubtitle}
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onOpenContact}
              className="bg-[#FFD21A] hover:bg-[#F0C413] text-black font-bold text-xs uppercase tracking-widest px-8 py-4 transition-all duration-200 shadow-[0_0_25px_rgba(255,210,26,0.3)] flex items-center gap-3"
            >
              <span>{t.nav.writeUs}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('contact')}
              className="bg-[#0E1013] hover:bg-[#14161B] text-white border border-white/20 hover:border-white font-mono text-xs uppercase tracking-widest px-8 py-4 transition-all"
            >
              {t.home.contactInfoBtn}
            </button>
          </div>
        </div>

        {/* Ambient bottom light glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-[#FFD21A]/5 rounded-full blur-[100px] pointer-events-none" />
      </section>

    </div>
  );
};
