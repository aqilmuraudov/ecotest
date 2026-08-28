import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';
import { useData } from '../context/DataContext';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Layers,
  Eye,
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
    <div className="min-h-screen bg-[#08090A] text-[#F5F5F5] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Back */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <button onClick={() => onNavigate('home')} className="hover:text-[#FFD21A] transition-colors">
              {t.nav.home}
            </button>
            <span>/</span>
            <button onClick={() => onNavigate('projects')} className="hover:text-[#FFD21A] transition-colors">
              {t.nav.projects}
            </button>
            <span>/</span>
            <span className="text-[#FFD21A]">{project.title}</span>
          </div>

          <button
            onClick={() => onNavigate('projects')}
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.projects.backToProjects}</span>
          </button>
        </div>

        {/* Hero Banner with Title and Metadata */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#101114] mb-10 shadow-2xl group">
          <div 
            onClick={() => setLightboxImg(project.coverImage)}
            className="relative aspect-[21/9] min-h-[360px] w-full cursor-pointer"
          >
            <img 
              src={project.coverImage} 
              alt={project.title} 
              className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#101114] via-[#101114]/60 to-transparent" />
            
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#FFD21A]" />
              <span>Böyüt</span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 flex flex-col justify-end pointer-events-none">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider bg-[#FFD21A] text-black px-3 py-1 rounded">
                  {project.categoryName[currentLang]}
                </span>
                <span className="text-xs font-mono text-gray-300 bg-black/60 px-3 py-1 rounded border border-white/10">
                  {project.year}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white uppercase tracking-tight">
                {project.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 mt-4 text-xs text-gray-300">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#FFD21A]" />
                  {project.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#FFD21A]" />
                  {t.projects.client}: <strong>{project.client}</strong>
                </span>
                {project.architect && (
                  <span className="flex items-center gap-1.5 text-gray-400">
                    {t.projects.architect}: {project.architect}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2 Column Details: Story & Engineering Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Narrative / Lighting Solution */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#101114] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl">
              <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#FFD21A] rounded-full" />
                <span>{t.projects.conceptTitle}</span>
              </h2>

              <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-normal">
                {project.fullDescription[currentLang]}
              </p>

              <div className="p-5 bg-black/40 border border-[#FFD21A]/30 rounded-xl space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[#FFD21A] flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>{t.projects.engineeringTitle}</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  {project.lightingSolution[currentLang]}
                </p>
              </div>
            </div>

            {/* Project Gallery Images */}
            {project.gallery && project.gallery.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-white tracking-wider">
                    <Layers className="w-4 h-4 text-[#FFD21A]" />
                    <span>Layihə Qalereyası ({project.gallery.length} foto)</span>
                  </div>
                  <span className="text-[11px] font-mono text-gray-400">Böyütmək üçün fotonun üzərinə klikləyin</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.gallery.map((img, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setLightboxImg(img)}
                      className="group relative rounded-xl overflow-hidden border border-white/10 aspect-[4/3] bg-black/40 cursor-pointer"
                    >
                      <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="w-6 h-6 text-[#FFD21A]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Metrics & Inquiry Column */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Key Project Metrics */}
            {project.metrics && (
              <div className="bg-[#101114] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#FFD21A]">
                  {t.projects.metricsTitle}
                </h3>
                <div className="divide-y divide-white/10">
                  {project.metrics.map((m, i) => (
                    <div key={i} className="py-3 flex justify-between text-xs">
                      <span className="text-gray-400">{m.label[currentLang]}</span>
                      <span className="text-white font-bold">{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inquiry CTA */}
            <div className="bg-[#101114] border border-[#FFD21A]/40 rounded-2xl p-6 shadow-xl space-y-4 text-center">
              <h3 className="text-lg font-bold text-white uppercase">
                {t.projects.similarProjectCta}
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                {t.projects.similarProjectDesc}
              </p>
              <button
                onClick={onOpenContact}
                className="w-full bg-[#FFD21A] text-black font-bold text-xs uppercase tracking-wider py-3.5 rounded hover:bg-[#F0C413] transition-all shadow-[0_0_20px_rgba(255,210,26,0.25)]"
              >
                {t.projects.contactEngineer} →
              </button>
            </div>

          </div>

        </div>

        {/* Products Used in this Project */}
        {usedProducts.length > 0 && (
          <div className="mt-12 pt-10 border-t border-white/10">
            <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-6">
              {t.projects.systemsUsedTitle}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {usedProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => onNavigate('catalog', prod.slug)}
                  className="group bg-[#101114] border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-[#FFD21A]/50 transition-all p-4 flex flex-col justify-between"
                >
                  <div className="aspect-[4/3] bg-[#16181D] rounded-lg overflow-hidden mb-3">
                    <img src={prod.image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase group-hover:text-[#FFD21A] transition-colors">{prod.name}</h3>
                    <div className="text-[11px] text-gray-400 mt-0.5">{prod.code}</div>
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

        {/* Fullscreen Lightbox Modal */}
        {lightboxImg && (
          <div 
            onClick={() => setLightboxImg(null)}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          >
            <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setLightboxImg(null)}
                className="absolute -top-12 right-0 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={lightboxImg}
                alt="Full preview"
                className="max-h-[85vh] max-w-full object-contain rounded-xl border border-white/10 shadow-2xl"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
