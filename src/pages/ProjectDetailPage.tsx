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
  const project = projects.find(p => p.slug === projectSlug) || projects[0];
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

        {/* Editorial split hero: cover left, gallery column right */}
        <div className="relative mb-12 lg:mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

            {/* Cover — left, dominant */}
            <div className="lg:col-span-7">
              <FadeIn>
                <div className="lg:sticky lg:top-24">
                  <div
                    onClick={() => openLightbox(project.coverImage)}
                    className="relative aspect-[16/10] lg:aspect-[4/3] overflow-hidden cursor-zoom-in group"
                  >
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-[1100ms] group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1d1d1b]/90 via-transparent to-transparent" />
                    {sideImages.length > 0 && (
                      <div className="absolute bottom-4 right-4 z-10 font-mono-tech text-[10px] tracking-widest text-ivory/80 bg-[#141412]/70 backdrop-blur-sm px-3 py-1.5">
                        1 / {allImages.length}
                      </div>
                    )}
                  </div>

                  {/* Overlapping title block */}
                  <div className="relative z-10 -mt-10 sm:-mt-14 p-1">
                    <FadeIn delay={0.15}>
                      <p className="font-micro text-amber-warm mb-4">
                        {project.categoryName[currentLang]} — {project.year}
                      </p>
                      <h1 className="ed-display-md lg:ed-display-lg font-display text-ivory">
                        {project.title}
                      </h1>
                    </FadeIn>
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Gallery — right column, immediately visible */}
            {sideImages.length > 0 && (
              <div className="lg:col-span-5">
                <FadeIn delay={0.1}>
                  <div className="flex items-center justify-between mb-4 lg:mb-5">
                    <p className="font-micro text-[9px] text-mute">{t.projects.galleryTitle}</p>
                    <span className="font-mono-tech text-[10px] text-mute">{sideImages.length} foto</span>
                  </div>
                </FadeIn>
                <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 lg:gap-4">
                  {visibleSide.map((img, idx) => (
                    <FadeIn key={idx} delay={0.08 * Math.min(idx, 4)} className={idx === 0 ? 'col-span-2' : ''}>
                      <button
                        onClick={() => openLightbox(img)}
                        className="group relative w-full overflow-hidden cursor-zoom-in aspect-[16/10]"
                      >
                        <img
                          src={img}
                          alt={`Gallery ${idx + 1}`}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-[1100ms] group-hover:scale-[1.03]"
                        />
                        <div className="absolute inset-0 bg-[#1d1d1b]/0 group-hover:bg-[#1d1d1b]/10 transition-colors duration-300" />
                      </button>
                    </FadeIn>
                  ))}

                  {/* Overflow tile — reveals remaining photos in lightbox */}
                  {hiddenCount > 0 && (
                    <FadeIn delay={0.08 * Math.min(MAX_SIDE, 4)}>
                      <button
                        onClick={() => openLightbox(sideImages[MAX_SIDE])}
                        className="group relative w-full overflow-hidden cursor-zoom-in aspect-[16/10]"
                      >
                        <img
                          src={sideImages[MAX_SIDE]}
                          alt={`+${hiddenCount}`}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-[1100ms] group-hover:scale-[1.03]"
                        />
                        <div className="absolute inset-0 bg-[#141412]/75 flex flex-col items-center justify-center gap-1">
                          <span className="font-mono-tech text-2xl text-ivory">+{hiddenCount}</span>
                          <span className="font-micro text-[9px] tracking-widest text-[var(--ed-soft)] group-hover:text-amber-warm transition-colors">
                            {t.projects.galleryTitle}
                          </span>
                        </div>
                      </button>
                    </FadeIn>
                  )}
                </div>

                {/* Contact CTA — fills empty space when gallery is short */}
                <FadeIn delay={0.2}>
                  <div className="hidden lg:block mt-8">
                    <EdHairline amber />
                    <h3 className="ed-display-sm font-display text-ivory mt-6">
                      {t.projects.similarProjectCta}
                    </h3>
                    <p className="text-xs text-mute mt-3 leading-relaxed">
                      {t.projects.similarProjectDesc}
                    </p>
                    <div className="mt-5">
                      <EdButton arrow onClick={onOpenContact}>
                        {t.projects.contactEngineer}
                      </EdButton>
                    </div>
                  </div>
                </FadeIn>
              </div>
            )}
          </div>
        </div>

        {/* Metadata row */}
        <div className="border-t border-[var(--ed-line)] py-6 grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { icon: <MapPin className="w-3.5 h-3.5 text-amber-warm" />, label: t.projects.location, value: project.location },
            { icon: <Building2 className="w-3.5 h-3.5 text-amber-warm" />, label: t.projects.client, value: project.client },
            { icon: <Calendar className="w-3.5 h-3.5 text-amber-warm" />, label: t.projects.year, value: project.year },
            ...(project.architect ? [{ icon: <ArrowRight className="w-3.5 h-3.5 text-amber-warm" />, label: t.projects.architect, value: project.architect }] : []),
          ].slice(0, 4).map((item, i) => (
            <div key={i}>
              <div className="flex items-center gap-2 mb-2">
                {item.icon}
                <span className="font-micro text-[9px] text-mute">{item.label}</span>
              </div>
              <span className="text-sm text-[var(--ed-ivory)]">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Narrative + metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-20">
          <div className="lg:col-span-7 space-y-10">
            <FadeIn>
              <div>
                <p className="font-micro text-amber-warm mb-5">{t.projects.conceptTitle}</p>
                <p className="text-base text-soft leading-relaxed">
                  {project.fullDescription[currentLang]}
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div>
                <EdHairline amber />
                <p className="font-micro text-amber-warm mt-6 mb-3">{t.projects.engineeringTitle}</p>
                <p className="text-sm text-mute leading-relaxed">
                  {project.lightingSolution[currentLang]}
                </p>
              </div>
            </FadeIn>
          </div>


          {/* Metrics sidebar */}
          <div className="lg:col-span-5">
            <FadeIn delay={0.15}>
              {project.metrics && project.metrics.length > 0 && (
                <div>
                  <p className="font-micro text-amber-warm mb-6">{t.projects.metricsTitle}</p>
                  <div className="border-t border-[var(--ed-line)]">
                    {project.metrics.map((m, i) => (
                      <div key={i} className="py-5 flex justify-between items-center border-b border-[var(--ed-line)]">
                        <span className="font-micro text-[9px] text-mute">{m.label[currentLang]}</span>
                        <span className="font-mono-tech text-sm text-[var(--ed-ivory)]">{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </FadeIn>

            {/* Inquiry CTA */}
            <FadeIn delay={0.25}>
              <div className="mt-12 lg:mt-16 lg:hidden">
                <EdHairline amber />
                <h3 className="ed-display-sm font-display text-ivory mt-8">
                  {t.projects.similarProjectCta}
                </h3>
                <p className="text-xs text-mute mt-4 leading-relaxed">
                  {t.projects.similarProjectDesc}
                </p>
                <div className="mt-7">
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
