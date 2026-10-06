import React from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { useData } from '../context/DataContext';
import { FadeIn } from '../components/ui/FadeIn';
import { EdButton, EdLink, EdHairline } from '../components/ed/EditorialUI';
import { CheckCircle2 } from 'lucide-react';

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
  const { pagesContent } = useData();
  const aboutData = pagesContent?.about;

  const defaultFacilityPoints = [
    currentLang === 'az' ? 'Bakıda müasir avropasayağı alüminium profil emalı və yığım xətti' : currentLang === 'ru' ? 'Современная линия сборки и обработки алюминиевых профилей в Баку' : 'Modern European-standard aluminum profile processing line in Baku',
    currentLang === 'az' ? 'Dialux Evo proqramında dəqiq fotometrik hesabat və lüks xəritələri' : currentLang === 'ru' ? 'Точные фотометрические расчеты и карты освещенности в Dialux Evo' : 'Accurate photometric calculations and lux maps in Dialux Evo',
    currentLang === 'az' ? 'CRI 95+ və UGR < 19 optika standartları' : currentLang === 'ru' ? 'Стандарты оптики CRI 95+ и UGR < 19' : 'CRI 95+ and UGR < 19 glare-free optical standards',
    currentLang === 'az' ? 'İstənilən ölçüdə və həndəsi konfiqurasiyada fərdi istehsal' : currentLang === 'ru' ? 'Индивидуальное производство любых размеров и геометрических форм' : 'Custom fabrication to any continuous length and geometric angle'
  ];

  const facilityPoints = (aboutData?.facilityPoints?.[currentLang]?.length ? aboutData.facilityPoints[currentLang] : defaultFacilityPoints);

  const pillars = aboutData?.pillars?.length 
    ? aboutData.pillars
        .filter(p => p.id !== 'warranty' && !/zəmanət|warranty|гарант/i.test(p.label?.az || ''))
        .map(p => ({
          label: p.label[currentLang] || p.label.az,
          desc: p.desc[currentLang] || p.desc.az
        }))
    : [
        { label: t.whyUs.highQuality, desc: t.whyUs.highQualityDesc },
        { label: t.about.values.engineering, desc: t.about.values.engineeringDesc },
        { label: t.whyUs.expertSupport, desc: t.whyUs.expertSupportDesc },
      ];

  const badgeText = aboutData?.badge?.[currentLang] || `04 — ${t.nav.about}`;
  const titleA = aboutData?.titleA?.[currentLang] || (currentLang === 'az' ? 'işığın' : currentLang === 'ru' ? 'архитектура' : 'the architecture');
  const titleB = aboutData?.titleB?.[currentLang] || (currentLang === 'az' ? 'arxitekturası' : currentLang === 'ru' ? 'света' : 'of light');
  const subtitle = aboutData?.subtitle?.[currentLang] || t.about.subtitle;
  const storyTitle = aboutData?.storyTitle?.[currentLang] || t.about.storyTitle;
  const storyP1 = aboutData?.storyP1?.[currentLang] || t.about.storyP1;
  const storyP2 = aboutData?.storyP2?.[currentLang] || t.about.storyP2;
  const mainImage = aboutData?.images?.mainFacility || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80';
  const workshopImg1 = aboutData?.images?.workshop1 || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=700&q=80';
  const workshopImg2 = aboutData?.images?.workshop2 || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=700&q=80';
  const pillarsTitle = aboutData?.pillarsTitle?.[currentLang] || t.about.values.engineering;

  return (
    <div className="bg-[var(--ed-bg)] text-[var(--ed-ivory)] pt-32 pb-24">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">

        {/* Header */}
        <div className="mb-20">
          <FadeIn>
            <p className="font-micro text-amber-warm mb-5">{badgeText}</p>
            <h1 className="ed-display-lg font-display text-ivory">
              {titleA}
              <br />
              <span className="text-soft">{titleB}</span>
            </h1>
            <p className="text-sm text-mute mt-6 max-w-lg leading-relaxed">
              {subtitle}
            </p>
          </FadeIn>
        </div>

        {/* Story + facility imagery */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 mb-28">
          <div className="lg:col-span-6">
            <FadeIn>
              <p className="font-micro text-amber-warm mb-6">{storyTitle}</p>
              <p className="text-base text-soft leading-relaxed">
                {storyP1}
              </p>
              <p className="text-sm text-mute leading-relaxed mt-6">
                {storyP2}
              </p>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="mt-12 space-y-0 border-t border-[var(--ed-line)]">
                {facilityPoints.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-5 py-4 border-b border-[var(--ed-line)]">
                    <CheckCircle2 className="w-4 h-4 text-amber-warm flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-soft leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          <div className="lg:col-span-6">
            <FadeIn direction="left" delay={0.1}>
              <div className="relative aspect-[4/3] overflow-hidden bg-[var(--ed-bg-2)]">
                <img
                  src={mainImage}
                  alt="Ecolife facility"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-2 gap-6 mt-6">
                <div className="aspect-[4/3] overflow-hidden bg-[var(--ed-bg-2)]">
                  <img
                    src={workshopImg1}
                    alt="Ecolife assembly"
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-[4/3] overflow-hidden bg-[var(--ed-bg-2)]">
                  <img
                    src={workshopImg2}
                    alt="Ecolife workshop"
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Pillars — large typography list */}
        <div className="mb-28">
          <FadeIn>
            <h2 className="ed-display-md font-display text-ivory mb-14">
              {pillarsTitle}
            </h2>
          </FadeIn>

          <div>
            {pillars.map((pillar, i) => (
              <FadeIn key={pillar.label} delay={0.05 * i}>
                <div className="group py-8 border-t border-[var(--ed-line)]">
                  <div className="flex items-baseline justify-between gap-8">
                    <h3 className="ed-display-sm font-display text-ivory group-hover:text-amber-warm transition-colors duration-300">
                      {pillar.label}
                    </h3>
                    <span className="font-mono-tech text-xs text-mute">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <p className="text-xs text-mute leading-relaxed mt-4 max-w-xl">
                    {pillar.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
            <div className="border-t border-[var(--ed-line)]" />
          </div>
        </div>

        {/* CTA */}
        <FadeIn>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <h2 className="ed-display-lg font-display text-ivory">
              {t.home.contactBannerTitle}
            </h2>
            <div>
              <p className="text-sm text-mute leading-relaxed max-w-md">
                {t.home.contactBannerSubtitle}
              </p>
              <div className="mt-8 flex items-center gap-6">
                <EdButton arrow onClick={onOpenContact}>
                  {t.nav.writeUs}
                </EdButton>
                <EdLink onClick={() => onNavigate('contact')}>
                  {t.contact.directInfo}
                </EdLink>
              </div>
            </div>
          </div>
        </FadeIn>

      </div>
    </div>
  );
};
