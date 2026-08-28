import React, { useState } from 'react';
import { Language, Solution } from '../types';
import { translations } from '../data/translations';
import { solutions } from '../data/solutions';
import { products } from '../data/products';
import { projects } from '../data/projects';
import { 
  Building2, 
  Briefcase, 
  Utensils, 
  Home, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  Layers,
  MessageSquare
} from 'lucide-react';

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

  const currentSolution = solutions.find(s => s.id === activeSolutionId) || solutions[0];

  const recommendedProds = products.filter(p => 
    currentSolution.recommendedProductIds.includes(p.id)
  );

  const relatedProjects = projects.filter(p => 
    currentSolution.projectIds?.includes(p.id)
  );

  const icons = {
    commercial: <Building2 className="w-5 h-5" />,
    office: <Briefcase className="w-5 h-5" />,
    hospitality: <Utensils className="w-5 h-5" />,
    residential: <Home className="w-5 h-5" />
  };

  return (
    <div className="min-h-screen bg-[#08090A] text-[#F5F5F5] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="bg-[#101114] border border-white/10 rounded-2xl p-6 sm:p-10 mb-10 shadow-2xl">
          <div className="flex items-center space-x-2 text-xs text-gray-400 mb-3">
            <button onClick={() => onNavigate('home')} className="hover:text-[#FFD21A] transition-colors">
              {t.nav.home}
            </button>
            <span>/</span>
            <span className="text-[#FFD21A]">{t.nav.solutions}</span>
          </div>

          <div className="max-w-2xl space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white uppercase tracking-tight">
              {t.solutions.title}
            </h1>
            <p className="text-sm sm:text-base text-gray-300 font-normal leading-relaxed">
              {t.solutions.subtitle}
            </p>
          </div>

          {/* Solution Selector Tabs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-8">
            {solutions.map((sol) => {
              const isActive = activeSolutionId === sol.id;
              return (
                <button
                  key={sol.id}
                  onClick={() => setActiveSolutionId(sol.id)}
                  className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between ${
                    isActive 
                      ? 'bg-[#18191E] border-[#FFD21A] ring-1 ring-[#FFD21A] shadow-[0_0_20px_rgba(255,210,26,0.2)]' 
                      : 'bg-black/40 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <div className={`p-2 rounded-lg w-fit mb-3 ${isActive ? 'bg-[#FFD21A] text-black' : 'bg-white/5 text-gray-300'}`}>
                    {icons[sol.id as keyof typeof icons] || <Sparkles className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className={`text-xs sm:text-sm font-bold uppercase tracking-wide ${isActive ? 'text-[#FFD21A]' : 'text-white'}`}>
                      {sol.title[currentLang]}
                    </h3>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Solution Showcase */}
        <div className="bg-[#101114] border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-6 sm:p-10 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#FFD21A]">
                  Memarlıq Həlli
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight mt-1">
                  {currentSolution.title[currentLang]}
                </h2>
                <p className="text-base text-gray-300 mt-2 font-normal">
                  {currentSolution.subtitle[currentLang]}
                </p>
              </div>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {currentSolution.description[currentLang]}
              </p>

              {/* Key Features List */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  {t.solutions.keyFeaturesTitle}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentSolution.keyFeatures[currentLang].map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-black/40 border border-white/5 text-xs text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-[#FFD21A] flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consultation CTA */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  onClick={onOpenContact}
                  className="flex items-center gap-2 bg-[#FFD21A] text-black font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded hover:bg-[#F0C413] transition-all shadow-[0_0_20px_rgba(255,210,26,0.25)]"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{t.solutions.consultationBtn}</span>
                </button>
                <button
                  onClick={() => onNavigate('configurator')}
                  className="text-xs font-bold text-gray-300 hover:text-white border border-white/15 px-6 py-3.5 rounded hover:bg-white/5 transition-colors uppercase tracking-wider"
                >
                  {t.catalog.configureNow}
                </button>
              </div>
            </div>

            {/* Right Large Atmospheric Image */}
            <div className="lg:col-span-5 aspect-[4/3] rounded-xl overflow-hidden border border-white/10 relative shadow-xl">
              <img 
                src={currentSolution.image} 
                alt={currentSolution.title[currentLang]} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-6">
                <div className="text-xs font-bold uppercase tracking-wider text-[#FFD21A]">
                  Ecolife • {t.whyUs.imageTagline}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Recommended Products for this Solution */}
        {recommendedProds.length > 0 && (
          <div className="mb-14">
            <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-6">
              {t.solutions.recommendedSystemsTitle}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {recommendedProds.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => onNavigate('catalog', prod.slug)}
                  className="group bg-[#101114] border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-[#FFD21A]/50 transition-all p-4 flex flex-col justify-between"
                >
                  <div className="aspect-[4/3] bg-[#16181D] rounded-lg overflow-hidden mb-3">
                    <img src={prod.image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase group-hover:text-[#FFD21A] transition-colors">{prod.name}</h4>
                    <div className="text-[11px] text-gray-400 mt-0.5">{prod.specs.dimensions}</div>
                  </div>
                  <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#FFD21A]">
                    <span>{t.projects.viewInCatalog}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Case Studies */}
        {relatedProjects.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-6">
              {t.solutions.realProjectsTitle}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedProjects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => onNavigate('projects', proj.slug)}
                  className="group bg-[#101114] border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-[#FFD21A]/50 transition-all p-6 flex flex-col sm:flex-row gap-6 items-center"
                >
                  <div className="w-full sm:w-48 aspect-[4/3] rounded-lg overflow-hidden flex-shrink-0">
                    <img src={proj.coverImage} alt={proj.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFD21A]">
                      {proj.location}
                    </span>
                    <h4 className="text-base font-bold text-white uppercase group-hover:text-[#FFD21A] transition-colors">
                      {proj.title}
                    </h4>
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {proj.shortDescription[currentLang]}
                    </p>
                    <div className="pt-2 text-xs font-bold text-[#FFD21A] flex items-center gap-1">
                      <span>{t.solutions.inspectProject}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
