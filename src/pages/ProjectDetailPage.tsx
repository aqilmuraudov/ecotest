import React, { useState } from 'react';
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

        {/* Cinematic hero with overlapping title */}
        <div className="relative mb-16">
          <FadeIn>
            <div
              onClick={() => setLightboxImg(project.coverImage)}
              className="relative aspect-[16/10] lg:aspect-[21/9] overflow-hidden cursor-zoom-in"
            >
              <img
                src={project.coverImage}
                alt={project.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1d1d1b]/90 via-transparent to-transparent" />
            </div>
          </FadeIn>

          {/* Overlapping title block */}
          <div className="lg:absolute lg:bottom-0 lg:left-12 lg:right-12 lg:p-10 p-6 -mt-16 lg:mt-0 relative z-10">
            <FadeIn delay={0.15}>
              <p className="font-micro text-amber-warm mb-4">
                {project.categoryName[currentLang]} — {project.year}
              </p>
              <h1 className="ed-display-lg font-display text-ivory">
                {project.title}
              </h1>
            </FadeIn>
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
              <div className="mt-12 lg:mt-16">
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

        {/* Gallery — large architectural compositions */}
        {project.gallery && project.gallery.length > 0 && (
          <div className="mb-24">
            <FadeIn>
              <div className="flex items-end justify-between mb-10">
                <h2 className="ed-display-md font-display text-ivory">
                  {currentLang === 'az' ? 'layihə' : currentLang === 'ru' ? 'проект' : 'project'}
                  <br />
                  <span className="text-soft">{currentLang === 'az' ? 'qalereyası' : currentLang === 'ru' ? 'галерея' : 'gallery'}</span>
                </h2>
                <span className="font-mono-tech text-xs text-mute">{project.gallery.length} foto</span>
              </div>
            </FadeIn>

            <div className="space-y-6 lg:space-y-8">
              {project.gallery.map((img, idx) => (
                <FadeIn key={idx} delay={0.05 * Math.min(idx, 4)}>
                  <button
                    onClick={() => setLightboxImg(img)}
                    className={`group relative w-full overflow-hidden cursor-zoom-in ${
                      idx % 3 === 0 ? 'aspect-[16/9]' : 'aspect-[4/3] md:w-3/4'
                    } ${idx % 3 === 1 ? 'md:ml-auto' : ''} ${idx % 3 === 2 ? 'md:w-3/4' : ''}`}
                  >
                    <img
                      src={img}
                      alt={`Gallery ${idx + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-[1100ms] group-hover:scale-[1.03]"
                    />
                  </button>
                </FadeIn>
              ))}
            </div>
          </div>
        )}

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
          </div>
        </div>
      )}
    </div>
  );
};
