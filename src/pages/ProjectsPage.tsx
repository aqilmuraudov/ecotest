import React, { useState } from 'react';
import { Language, Project } from '../types';
import { translations } from '../data/translations';
import { useData } from '../context/DataContext';
import { FadeIn } from '../components/ui/FadeIn';
import { EdLink, EdHairline } from '../components/ed/EditorialUI';
import { EdCategoryPills } from '../components/ed/EdCategoryPills';
import { ArrowRight } from 'lucide-react';

interface ProjectsPageProps {
  currentLang: Language;
  onNavigate: (page: string, param?: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ currentLang, onNavigate }) => {
  const t = translations[currentLang];
  const { projects } = useData();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: t.projects.all },
    { id: 'commercial', label: currentLang === 'az' ? 'Ticarət' : currentLang === 'ru' ? 'Торговля' : 'Commercial' },
    { id: 'office', label: currentLang === 'az' ? 'Ofis' : currentLang === 'ru' ? 'Офисы' : 'Office' },
    { id: 'restaurant', label: currentLang === 'az' ? 'Restoran & Kafe' : currentLang === 'ru' ? 'Рестораны' : 'Hospitality' },
    { id: 'residential', label: currentLang === 'az' ? 'Yaşayış' : currentLang === 'ru' ? 'Жилые' : 'Residential' },
  ].filter(cat => cat.id === 'all' || projects.some(p => p.category === cat.id));

  const filteredProjects = selectedCategory === 'all'
    ? projects
    : projects.filter(p => p.category === selectedCategory);

  const lead = filteredProjects[0];
  const rest = filteredProjects.slice(1);

  return (
    <div className="bg-[var(--ed-bg)] text-[var(--ed-ivory)] pt-32 pb-24">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">

        {/* Header */}
        <div className="mb-14">
          <FadeIn>
            <p className="font-micro text-amber-warm mb-5">02 — {t.nav.projects}</p>
            <h1 className="ed-display-lg font-display text-ivory">
              {currentLang === 'az' ? 'seçilmiş' : currentLang === 'ru' ? 'избранные' : 'selected'}
              <br />
              <span className="text-soft">{currentLang === 'az' ? 'layihələr' : currentLang === 'ru' ? 'проекты' : 'projects'}</span>
            </h1>
            <p className="text-sm text-mute mt-6 max-w-lg leading-relaxed">
              {t.projects.subtitle}
            </p>
          </FadeIn>
        </div>

        {/* Category pills */}
        <div className="mb-6">
          <EdCategoryPills
            items={categories}
            activeId={selectedCategory}
            onSelect={setSelectedCategory}
            className="!justify-start"
          />
        </div>

        <EdHairline className="mb-16" />

        {filteredProjects.length === 0 ? (
          <div className="py-24 text-center">
            <h3 className="ed-display-sm font-display text-ivory">
              {t.catalog.noProducts}
            </h3>
          </div>
        ) : (
          <>
            {/* Lead project — full-width cinematic */}
            {lead && (
              <FadeIn>
                <button
                  onClick={() => onNavigate('projects', lead.slug || lead.id)}
                  className="group relative w-full aspect-[16/10] lg:aspect-[21/9] overflow-hidden text-left"
                >
                  <img
                    src={lead.coverImage}
                    alt={lead.title}
                    className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1d1d1b]/92 via-[#1d1d1b]/25 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-7 lg:p-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                    <div>
                      <h2 className="ed-display-md font-display text-ivory max-w-3xl">
                        {lead.title}
                      </h2>
                      <div className="font-micro text-[9px] text-soft mt-4 flex flex-wrap gap-x-6 gap-y-1">
                        <span className="text-amber-warm">{lead.categoryName?.[currentLang] || lead.category}</span>
                        <span>{lead.location}</span>
                        <span>{lead.client}</span>
                        <span>{lead.year}</span>
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

            {/* Two-column editorial spread */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mt-6 lg:mt-8">
              {rest.map((project, i) => (
                <FadeIn key={project.id} delay={0.06 * (i + 1)}>
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
                        <span className="text-amber-warm">{project.categoryName[currentLang]}</span>
                        <span>{project.location}</span>
                        <span>{project.year}</span>
                      </div>
                    </div>
                  </button>
                </FadeIn>
              ))}
            </div>
          </>
        )}

        {/* CTA */}
        <div className="mt-28">
          <EdHairline amber className="mb-14" />
          <FadeIn>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <h2 className="ed-display-md font-display text-ivory max-w-2xl">
                {t.projects.similarProjectCta}
              </h2>
              <div className="flex flex-col gap-4">
                <p className="text-sm text-mute max-w-sm leading-relaxed">
                  {t.projects.similarProjectDesc}
                </p>
                <EdLink arrow onClick={() => onNavigate('contact')}>
                  {t.projects.contactEngineer}
                </EdLink>
              </div>
            </div>
          </FadeIn>
        </div>

      </div>
    </div>
  );
};
