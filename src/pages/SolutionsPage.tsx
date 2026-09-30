import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { solutions } from '../data/solutions';
import { products } from '../data/products';
import { projects } from '../data/projects';
import { FadeIn } from '../components/ui/FadeIn';
import { EdButton, EdLink, EdHairline } from '../components/ed/EditorialUI';
import { EdProductCard } from '../components/ed/EdProductCard';
import { ArrowRight } from 'lucide-react';

interface SolutionsPageProps {
  currentLang: Language;
  onNavigate: (page: string, param?: string) => void;
  onOpenContact: () => void;
  initialSlug?: string;
}

export const SolutionsPage: React.FC<SolutionsPageProps> = ({
  currentLang,
  onNavigate,
  onOpenContact,
  initialSlug
}) => {
  const t = translations[currentLang];

  const defaultSolution = solutions.find(s => s.slug === initialSlug) || solutions[0];
  const [activeSolutionId, setActiveSolutionId] = useState<string>(defaultSolution.id);
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);

  const currentSolution = solutions.find(s => s.id === activeSolutionId) || solutions[0];

  const recommendedProds = products.filter(p =>
    currentSolution.recommendedProductIds.includes(p.id)
  );

  const relatedProjects = projects.filter(p =>
    currentSolution.projectIds?.includes(p.id)
  );

  return (
    <div className="bg-[var(--ed-bg)] text-[var(--ed-ivory)] pt-32 pb-24">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">

        {/* Header */}
        <div className="mb-16">
          <FadeIn>
            <p className="font-micro text-amber-warm mb-5">03 — {t.nav.solutions}</p>
            <h1 className="ed-display-lg font-display text-ivory">
              {currentLang === 'az' ? 'işıq' : currentLang === 'ru' ? 'световые' : 'lighting'}
              <br />
              <span className="text-soft">{currentLang === 'az' ? 'həlləri' : currentLang === 'ru' ? 'решения' : 'solutions'}</span>
            </h1>
            <p className="text-sm text-mute mt-6 max-w-lg leading-relaxed">
              {t.solutions.subtitle}
            </p>
          </FadeIn>
        </div>

        {/* Numbered solution list — hover reveals image */}
        <div className="mb-24">
          <div className="border-t border-[var(--ed-line)]">
            {solutions.map((sol, i) => {
              const isActive = activeSolutionId === sol.id;
              return (
                <FadeIn key={sol.id} delay={0.04 * i}>
                  <button
                    onClick={() => { setActiveSolutionId(sol.id); setHoveredImage(sol.image); }}
                    onMouseEnter={() => setHoveredImage(sol.image)}
                    className="group w-full flex items-center justify-between py-7 lg:py-9 border-b border-[var(--ed-line)] text-left relative overflow-hidden"
                  >
                    {/* Warm sweep on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(245,166,35,0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    <div className="flex items-baseline gap-8 lg:gap-14 relative z-10">
                      <span className={`font-mono-tech text-xs transition-colors ${isActive ? 'text-amber-warm' : 'text-mute'}`}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className={`ed-display-sm font-display transition-colors duration-300 ${
                        isActive ? 'text-amber-warm' : 'text-ivory group-hover:text-amber-warm'
                      }`}>
                        {sol.title[currentLang]}
                      </span>
                    </div>

                    <ArrowRight className={`w-5 h-5 relative z-10 transition-all duration-300 ${
                      isActive ? 'text-amber-warm translate-x-1' : 'text-mute group-hover:text-amber-warm group-hover:translate-x-1'
                    }`} />
                  </button>
                </FadeIn>
              );
            })}
          </div>

          {/* Hover image preview (desktop) */}
          {hoveredImage && (
            <div className="hidden lg:block mt-8 aspect-[21/9] overflow-hidden">
              <img
                src={hoveredImage}
                alt={currentSolution.title[currentLang]}
                className="w-full h-full object-cover animate-fadeIn"
              />
            </div>
          )}
        </div>

        {/* Active solution detail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-7">
            <FadeIn>
              <p className="font-micro text-amber-warm mb-5">
                {String(solutions.findIndex(s => s.id === currentSolution.id) + 1).padStart(2, '0')} — {currentSolution.title[currentLang]}
              </p>
              <h2 className="ed-display-md font-display text-ivory">
                {currentSolution.subtitle[currentLang]}
              </h2>
              <p className="text-sm text-soft leading-relaxed mt-8">
                {currentSolution.description[currentLang]}
              </p>
            </FadeIn>

            <FadeIn delay={0.12}>
              <div className="mt-12">
                <p className="font-micro text-[9px] text-mute mb-6">{t.solutions.keyFeaturesTitle}</p>
                <div className="space-y-0 border-t border-[var(--ed-line)]">
                  {currentSolution.keyFeatures[currentLang].map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-6 py-4 border-b border-[var(--ed-line)]">
                      <span className="font-mono-tech text-[10px] text-mute pt-0.5">{String(idx + 1).padStart(2, '0')}</span>
                      <span className="text-sm text-soft leading-relaxed">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.18}>
              <div className="mt-12 flex flex-wrap items-center gap-6">
                <EdButton arrow onClick={onOpenContact}>
                  {t.solutions.consultationBtn}
                </EdButton>
                <EdLink onClick={() => onNavigate('configurator')}>
                  {t.catalog.configureNow}
                </EdLink>
              </div>
            </FadeIn>
          </div>

          {/* Solution image */}
          <div className="lg:col-span-5">
            <FadeIn direction="left" delay={0.1}>
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={currentSolution.image}
                  alt={currentSolution.title[currentLang]}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-micro text-[9px] text-mute block mt-4">
                ECOLIFE — {currentSolution.title[currentLang]}
              </span>
            </FadeIn>
          </div>
        </div>

        {/* Recommended products */}
        {recommendedProds.length > 0 && (
          <div className="mt-28">
            <FadeIn>
              <h2 className="ed-display-md font-display text-ivory mb-12">
                {currentLang === 'az' ? 'tövsiyə olunan' : currentLang === 'ru' ? 'рекомендуемые' : 'recommended'}
                <br />
                <span className="text-soft">{currentLang === 'az' ? 'sistemlər' : currentLang === 'ru' ? 'системы' : 'systems'}</span>
              </h2>
            </FadeIn>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {recommendedProds.slice(0, 3).map((prod, i) => (
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

        {/* Related case studies */}
        {relatedProjects.length > 0 && (
          <div className="mt-28">
            <FadeIn>
              <h2 className="ed-display-md font-display text-ivory mb-12">
                {currentLang === 'az' ? 'real' : currentLang === 'ru' ? 'реальные' : 'real'}
                <br />
                <span className="text-soft">{currentLang === 'az' ? 'layihələr' : currentLang === 'ru' ? 'проекты' : 'projects'}</span>
              </h2>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {relatedProjects.map((proj, i) => (
                <FadeIn key={proj.id} delay={0.08 * i}>
                  <button
                    onClick={() => onNavigate('projects', proj.slug)}
                    className="group relative w-full aspect-[4/3] overflow-hidden text-left"
                  >
                    <img
                      src={proj.coverImage}
                      alt={proj.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-[1100ms] group-hover:scale-[1.05]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1d1d1b]/85 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-7 lg:p-8 flex items-end justify-between gap-4">
                      <div>
                        <h3 className="ed-display-sm font-display text-ivory">
                          {proj.title}
                        </h3>
                        <span className="font-micro text-[9px] text-soft mt-2 block">{proj.location}</span>
                      </div>
                      <ArrowRight className="w-5 h-5 text-amber-warm opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </div>
                  </button>
                </FadeIn>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
