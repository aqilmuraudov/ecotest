import React from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { 
  DraftingCompass, 
  ShieldCheck, 
  Cpu, 
  Users2, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface AboutPageProps {
  currentLang: Language;
  onNavigate: (page: string, param?: string) => void;
  onOpenContact: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  currentLang,
  onNavigate,
  onOpenContact
}) => {
  const t = translations[currentLang];

  return (
    <div className="min-h-screen bg-[#08090A] text-[#F5F5F5] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Header */}
        <div className="bg-[#101114] border border-white/10 rounded-2xl p-6 sm:p-10 mb-10 shadow-2xl">
          <div className="flex items-center space-x-2 text-xs text-gray-400 mb-3">
            <button onClick={() => onNavigate('home')} className="hover:text-[#FFD21A] transition-colors">
              {t.nav.home}
            </button>
            <span>/</span>
            <span className="text-[#FFD21A]">{t.nav.about}</span>
          </div>

          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 bg-[#FFD21A]/10 border border-[#FFD21A]/30 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider text-[#FFD21A]">
              <span>ECOLIFE AZƏRBAYCAN</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white uppercase tracking-tight">
              {t.about.title}
            </h1>
            <p className="text-sm sm:text-base text-gray-300 font-normal leading-relaxed">
              {t.about.subtitle}
            </p>
          </div>
        </div>

        {/* Narrative & Factory Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16">
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight">
              {t.about.storyTitle}
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              {t.about.storyP1}
            </p>
            <p className="text-sm text-gray-300 leading-relaxed">
              {t.about.storyP2}
            </p>

            <div className="space-y-3 pt-2">
              {[
                currentLang === 'az' ? 'Bakıda müasir avropasayağı alüminium profil emalı və yığım xətti' : currentLang === 'ru' ? 'Современная линия сборки и обработки алюминиевых профилей в Баку' : 'Modern European-standard aluminum profile processing line in Baku',
                currentLang === 'az' ? 'Dialux Evo proqramında dəqiq fotometrik hesabat və lüks xəritələri' : currentLang === 'ru' ? 'Точные фотометрические расчеты и карты освещенности в Dialux Evo' : 'Accurate photometric calculations and lux maps in Dialux Evo',
                currentLang === 'az' ? 'CRI 95+ və UGR < 19 optika standartları' : currentLang === 'ru' ? 'Стандарты оптики CRI 95+ и UGR < 19' : 'CRI 95+ and UGR < 19 glare-free optical standards',
                currentLang === 'az' ? 'İstənilən ölçüdə və həndəsi konfiqurasiyada fərdi istehsal' : currentLang === 'ru' ? 'Индивидуальное производство любых размеров и геометрических форм' : 'Custom fabrication to any continuous length and geometric angle'
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-[#FFD21A] flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80" 
              alt="Ecolife Engineering Facility" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FFD21A]">
                Ecolife • {t.whyUs.imageTagline}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Pillars of Excellence */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-[#101114] border border-white/10 rounded-xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-lg bg-[#FFD21A]/10 text-[#FFD21A] flex items-center justify-center">
              <DraftingCompass className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-bold text-white uppercase">{t.stats.experience}</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {t.whyUs.customSolutionsDesc}
            </p>
          </div>

          <div className="bg-[#101114] border border-white/10 rounded-xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-lg bg-[#FFD21A]/10 text-[#FFD21A] flex items-center justify-center">
              <Cpu className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-bold text-white uppercase">{t.about.values.engineering}</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {t.about.values.engineeringDesc}
            </p>
          </div>

          <div className="bg-[#101114] border border-white/10 rounded-xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-lg bg-[#FFD21A]/10 text-[#FFD21A] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-bold text-white uppercase">{t.whyUs.warranty}</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {t.whyUs.warrantyDesc}
            </p>
          </div>

          <div className="bg-[#101114] border border-white/10 rounded-xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-lg bg-[#FFD21A]/10 text-[#FFD21A] flex items-center justify-center">
              <Users2 className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-bold text-white uppercase">{t.whyUs.expertSupport}</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {t.whyUs.expertSupportDesc}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#101114] border border-[#FFD21A]/40 rounded-2xl p-8 sm:p-12 text-center space-y-6">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white uppercase">
            {t.home.contactBannerTitle}
          </h3>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto">
            {t.home.contactBannerSubtitle}
          </p>
          <button
            onClick={onOpenContact}
            className="inline-flex items-center gap-2 bg-[#FFD21A] text-black font-bold text-xs uppercase tracking-wider px-8 py-4 rounded hover:bg-[#F0C413] transition-all shadow-[0_0_20px_rgba(255,210,26,0.25)]"
          >
            <span>{t.nav.writeUs}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
