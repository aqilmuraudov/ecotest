import React, { useState, useEffect, useCallback } from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { useData } from '../context/DataContext';
import { FadeIn } from '../components/ui/FadeIn';
import { EdButton, EdLink, EdHairline } from '../components/ed/EditorialUI';
import { EdProductCard } from '../components/ed/EdProductCard';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Building2,
  ArrowRight,
  X
} from 'lucide-react';

interface ProjectDetailPageProps {
  projectSlug: string;
  currentLang: Language;
  onNavigate: (page: string, param?: string) => void;
  onOpenContact: () => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  projectSlug,
  currentLang,
  onNavigate,
  onOpenContact
}) => {
  const t = translations[currentLang];
  const { projects, products } = useData();
  const project = projects.find(
    p => p.slug === projectSlug || p.id === projectSlug || decodeURIComponent(p.slug || '') === decodeURIComponent(projectSlug || '')
  ) || projects[0];
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const usedProducts = products.filter(prod =>
    project?.productsUsed?.includes(prod.id) || project?.productsUsed?.includes(prod.name)
  );

  // Unified view set: cover first, then remaining gallery photos
  const allImages = Array.from(new Set([
    ...(project?.coverImage ? [project.coverImage] : []),
    ...(project?.gallery || [])
  ]));
  const sideImages = allImages.slice(1);
  const MAX_SIDE = 5;
  const visibleSide = sideImages.slice(0, MAX_SIDE);
  const hiddenCount = sideImages.length - visibleSide.length;

  const openLightbox = useCallback((img: string) => {
    setLightboxImg(img);
  }, []);

  const navigateLightbox = useCallback((dir: 1 | -1) => {
    setLightboxImg(prev => {
      if (!prev) return prev;
      const idx = allImages.indexOf(prev);
      if (idx === -1) return prev;
      return allImages[(idx + dir + allImages.length) % allImages.length];
    });
  }, [allImages]);

  useEffect(() => {
    if (!lightboxImg) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); navigateLightbox(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); navigateLightbox(-1); }
      else if (e.key === 'Escape') { e.preventDefault(); setLightboxImg(null); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxImg, navigateLightbox]);

  if (!project) {
    return (
      <div className="bg-[var(--ed-bg)] text-[var(--ed-ivory)] pt-32 pb-24 min-h-[60vh] flex items-center justify-center">
        <button
          onClick={() => onNavigate('projects')}
          className="inline-flex items-center gap-2 font-micro text-xs text-amber-warm hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.projects.backToProjects}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[var(--ed-bg)] text-[var(--ed-ivory)] pt-32 pb-24">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">

        {/* Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 font-micro text-[9px] text-mute">
            <button onClick={() => onNavigate('home')} className="hover:text-amber-warm transition-colors">{t.nav.home}</button>
            <span>/</span>
            <button onClick={() => onNavigate('projects')} className="hover:text-amber-warm transition-colors">{t.nav.projects}</button>
            <span>/</span>
            <span className="text-[var(--ed-ivory)]">{project.title}</span>
          </div>

          <button
            onClick={() => onNavigate('projects')}
            className="inline-flex items-center gap-1.5 font-micro text-[9px] text-mute hover:text-ivory transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.projects.backToProjects}</span>
          </button>
        </div>

        {/* Project Header: Category, Title & Metadata */}
        <div className="mb-10 lg:mb-12">
          <FadeIn>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="font-micro text-amber-warm tracking-wider uppercase">
                {project.categoryName[currentLang]}
              </span>
              <span className="text-[var(--ed-line)]">•</span>
              <span className="font-mono-tech text-xs text-mute">
                {project.year}
              </span>
            </div>
            <h1 className="ed-display-md lg:ed-display-lg font-display text-ivory max-w-4xl">
              {project.title}
            </h1>
          </FadeIn>

          {/* Metadata strip directly under Title */}
          <FadeIn delay={0.08}>
            <div className="border-y border-[var(--ed-line)] py-4 sm:py-5 mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {[
                { icon: <MapPin className="w-3.5 h-3.5 text-amber-warm" />, label: t.projects.location, value: project.location },
                { icon: <Building2 className="w-3.5 h-3.5 text-amber-warm" />, label: t.projects.client, value: project.client },
                { icon: <Calendar className="w-3.5 h-3.5 text-amber-warm" />, label: t.projects.year, value: project.year },
                ...(project.architect ? [{ icon: <ArrowRight className="w-3.5 h-3.5 text-amber-warm" />, label: t.projects.architect, value: project.architect }] : []),
              ].slice(0, 4).map((item, i) => (
                <div key={i}>
                  <div className="flex items-center gap-2 mb-1">
                    {item.icon}
                    <span className="font-micro text-[9px] text-mute uppercase tracking-wider">{item.label}</span>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-[var(--ed-ivory)]">{item.value}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>

        {/* Two-column layout: Left (Cover + Narrative) / Right (Gallery + Metrics + CTA) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-20 items-start">
          {/* Left Column: Main Cover Image + Narrative */}
          <div className="lg:col-span-7 space-y-10">
            <FadeIn>
              <div
                onClick={() => openLightbox(project.coverImage)}
                className="relative aspect-[16/10] overflow-hidden cursor-zoom-in group border border-[var(--ed-line)]"
              >
                <img
                  src={project.coverImage}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-[1100ms] group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1d1d1b]/60 via-transparent to-transparent" />
                {sideImages.length > 0 && (
                  <div className="absolute bottom-4 right-4 z-10 font-mono-tech text-[10px] tracking-widest text-ivory/90 bg-[#141412]/80 backdrop-blur-sm px-3 py-1.5 border border-white/10">
                    1 / {allImages.length}
                  </div>
                )}
              </div>
            </FadeIn>

            {/* Concept and Engineering Narrative */}
            <div className="space-y-8">
              <FadeIn delay={0.1}>
                <div>
                  <p className="font-micro text-amber-warm mb-3 uppercase tracking-wider">{t.projects.conceptTitle}</p>
                  <p className="text-base text-soft leading-relaxed whitespace-pre-line">
                    {project.fullDescription[currentLang]}
                  </p>
                </div>
              </FadeIn>

              {project.lightingSolution && project.lightingSolution[currentLang] && (
                <FadeIn delay={0.15}>
                  <div className="pt-6 border-t border-[var(--ed-line)]">
                    <p className="font-micro text-amber-warm mb-3 uppercase tracking-wider">{t.projects.engineeringTitle}</p>
                    <p className="text-sm text-mute leading-relaxed whitespace-pre-line">
                      {project.lightingSolution[currentLang]}
                    </p>
                  </div>
                </FadeIn>
              )}
            </div>
          </div>

          {/* Right Column: Gallery Photos + Metrics + CTA */}
          <div className="lg:col-span-5 space-y-8">
            {sideImages.length > 0 && (
              <div>
                <FadeIn delay={0.1}>
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-micro text-[9px] text-mute uppercase tracking-widest">{t.projects.galleryTitle}</p>
                    <span className="font-mono-tech text-[10px] text-mute">{sideImages.length} foto</span>
                  </div>
                </FadeIn>

                <div className="grid grid-cols-2 gap-3">
                  {visibleSide.map((img, idx) => (
                    <FadeIn key={idx} delay={0.05 * Math.min(idx, 4)} className={idx === 0 ? 'col-span-2' : ''}>
                      <button
                        onClick={() => openLightbox(img)}
                        className="group relative w-full overflow-hidden cursor-zoom-in aspect-[16/10] border border-[var(--ed-line)]"
                      >
                        <img
                          src={img}
                          alt={`Gallery ${idx + 1}`}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-[1100ms] group-hover:scale-[1.03]"
                        />
                        <div className="absolute inset-0 bg-[#1d1d1b]/0 group-hover:bg-[#1d1d1b]/20 transition-colors duration-300" />
                      </button>
                    </FadeIn>
                  ))}

                  {/* Overflow tile */}
                  {hiddenCount > 0 && (
                    <FadeIn delay={0.1}>
                      <button
                        onClick={() => openLightbox(sideImages[MAX_SIDE])}
                        className="group relative w-full overflow-hidden cursor-zoom-in aspect-[16/10] border border-[var(--ed-line)]"
                      >
                        <img
                          src={sideImages[MAX_SIDE]}
                          alt={`+${hiddenCount}`}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-[1100ms] group-hover:scale-[1.03]"
                        />
                        <div className="absolute inset-0 bg-[#141412]/85 flex flex-col items-center justify-center gap-1 group-hover:bg-[#141412]/70 transition-colors">
                          <span className="font-mono-tech text-2xl text-ivory">+{hiddenCount}</span>
                          <span className="font-micro text-[9px] tracking-widest text-[var(--ed-soft)] group-hover:text-amber-warm transition-colors">
                            {t.projects.galleryTitle}
                          </span>
                        </div>
                      </button>
                    </FadeIn>
                  )}
                </div>
              </div>
            )}

            {/* Metrics */}
            {project.metrics && project.metrics.length > 0 && (
              <FadeIn delay={0.15}>
                <div className="bg-[var(--ed-bg-2)] border border-[var(--ed-line)] p-6">
                  <p className="font-micro text-amber-warm mb-4 uppercase tracking-wider">{t.projects.metricsTitle}</p>
                  <div className="divide-y divide-[var(--ed-line)]">
                    {project.metrics.map((m, i) => (
                      <div key={i} className="py-3 flex justify-between items-center">
                        <span className="font-micro text-[9px] text-mute">{m.label[currentLang]}</span>
                        <span className="font-mono-tech text-sm text-[var(--ed-ivory)]">{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            )}

            {/* CTA */}
            <FadeIn delay={0.2}>
              <div className="bg-[var(--ed-bg-2)] border border-[var(--ed-line)] p-6 lg:p-8">
                <EdHairline amber />
                <h3 className="ed-display-sm font-display text-ivory mt-6">
                  {t.projects.similarProjectCta}
                </h3>
                <p className="text-xs text-mute mt-3 leading-relaxed">
                  {t.projects.similarProjectDesc}
                </p>
                <div className="mt-6">
                  <EdButton arrow onClick={onOpenContact}>
                    {t.projects.contactEngineer}
                  </EdButton>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Systems used */}
        {usedProducts.length > 0 && (
          <div>
            <FadeIn>
              <h2 className="ed-display-md font-display text-ivory mb-12">
                {currentLang === 'az' ? 'istifadə olunan' : currentLang === 'ru' ? 'использованные' : 'systems'}
                <br />
                <span className="text-soft">{currentLang === 'az' ? 'sistemlər' : currentLang === 'ru' ? 'системы' : 'used'}</span>
              </h2>
            </FadeIn>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {usedProducts.map((prod, i) => (
                <FadeIn key={prod.id} delay={0.06 * i}>
                  <EdProductCard
                    product={prod}
                    currentLang={currentLang}
                    onNavigate={onNavigate}
                    exploreLabel={t.projects.viewInCatalog}
                  />
                </FadeIn>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-[100] bg-[#141412]/98 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute -top-12 right-0 text-[var(--ed-soft)] hover:text-amber-warm p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={lightboxImg}
              alt="Full preview"
              className="max-h-[85vh] max-w-full object-contain"
            />
            <button
              onClick={() => navigateLightbox(-1)}
              aria-label="Previous photo"
              className="absolute left-2 lg:-left-16 top-1/2 -translate-y-1/2 p-2 text-[var(--ed-soft)] hover:text-amber-warm transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => navigateLightbox(1)}
              aria-label="Next photo"
              className="absolute right-2 lg:-right-16 top-1/2 -translate-y-1/2 p-2 text-[var(--ed-soft)] hover:text-amber-warm transition-colors"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono-tech text-[10px] tracking-widest text-[var(--ed-soft)]">
            {allImages.indexOf(lightboxImg) + 1} / {allImages.length}
          </div>
        </div>
      )}
    </div>
  );
};
