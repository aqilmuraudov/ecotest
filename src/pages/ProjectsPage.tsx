import React, { useState } from 'react';
import { Language, Project } from '../types';
import { translations } from '../data/translations';
import { useData } from '../context/DataContext';
import { ArrowRight, MapPin } from 'lucide-react';

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
  ];

  const filteredProjects = selectedCategory === 'all' 
    ? projects 
    : projects.filter(p => p.category === selectedCategory);

  return (
    <div className="liquid-page min-h-screen text-[#F5F5F5] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="liquid-surface p-6 sm:p-10 mb-10">
          <div className="flex items-center space-x-2 text-xs font-mono uppercase text-gray-400 mb-3">
            <button onClick={() => onNavigate('home')} className="hover:text-[#FFD21A] transition-colors">
              {t.nav.home}
            </button>
            <span>/</span>
            <span className="text-[#FFD21A]">{t.nav.projects}</span>
          </div>

          <div className="max-w-2xl space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
              {t.projects.title}
            </h1>
            <p className="text-sm sm:text-base text-gray-300 font-normal leading-relaxed">
              {t.projects.subtitle}
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 pt-6">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                    className={`liquid-pill px-4 py-2 text-xs font-medium tracking-wide transition-all ${
                    isActive 
                      ? 'bg-[#FFD21A] text-black font-bold shadow-[0_0_15px_rgba(255,210,26,0.25)]' 
                      : 'bg-[#08090A] border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => onNavigate('projects', project.slug)}
              className="liquid-card group overflow-hidden cursor-pointer hover:border-[#FFD21A] transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
            >
              {/* Image Container */}
              <div className="relative aspect-[16/11] overflow-hidden bg-black/40">
                <img 
                  src={project.coverImage} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider bg-black/90 text-[#FFD21A] px-2.5 py-1 border border-white/10">
                    {project.categoryName[currentLang]}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="text-[11px] font-mono bg-black/90 text-gray-300 px-2.5 py-0.5 border border-white/10 tabular-nums">
                    {project.year}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                    <MapPin className="w-3.5 h-3.5 text-[#FFD21A]" />
                    <span>{project.location}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white uppercase tracking-tight group-hover:text-[#FFD21A] transition-colors">
                    {project.title}
                  </h3>

                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed pt-1">
                    {project.shortDescription[currentLang]}
                  </p>
                </div>

                <div className="pt-5 mt-4 hairline-t flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-400">
                    {t.projects.client}: <strong className="text-white">{project.client}</strong>
                  </span>
                  <div className="flex items-center gap-1.5 font-bold text-[#FFD21A] group-hover:underline">
                    <span>{t.projects.viewProject}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
