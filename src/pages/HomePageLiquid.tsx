import React, { useEffect, useMemo, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { Language } from '../types';
import { useData } from '../context/DataContext';
import type { LightingSceneMode } from '../components/hero/LiquidLightingScene';

const LiquidLightingScene = React.lazy(() =>
  import('../components/hero/LiquidLightingScene').then((module) => ({ default: module.LiquidLightingScene }))
);

interface HomePageProps {
  currentLang: Language;
  onNavigate: (page: string, param?: string) => void;
  onOpenContact: () => void;
}

const benefits = [
  ['Yüksək keyfiyyət', 'Avropa standartlarına uyğun yüksək lümen çıxışı və CRI >95 fotometrik göstəricilər.'],
  ['Fərdi həllər', 'Hər layihə üçün xüsusi ölçü, rəng temperaturu və montaj detallarının istehsalı.'],
  ['Peşəkar dəstək', 'Layihələndirmədən tətbiqə qədər mühəndis və Dialux hesablama dəstəyi.'],
  ['Zəmanət', 'Xətti və profil sistemlərinə rəsmi zəmanət və davamlı servis xidməti.'],
];

export const HomePageLiquid: React.FC<HomePageProps> = ({ currentLang, onNavigate, onOpenContact }) => {
  const { products, projects } = useData();
  const [sceneMode, setSceneMode] = useState<LightingSceneMode>('focus');
  const px = useSpring(useMotionValue(0), { stiffness: 45, damping: 18 });
  const py = useSpring(useMotionValue(0), { stiffness: 45, damping: 18 });

  const featuredProducts = useMemo(() => {
    const active = products.filter((product) => !product.archived);
    const featured = active.filter((product) => product.featured);
    return (featured.length >= 4 ? featured : active).slice(0, 4);
  }, [products]);

  const featuredProjects = projects.slice(0, 3);
  const lightColor = sceneMode === 'warm' ? '#ffad55' : sceneMode === 'ambient' ? '#d7e8ff' : '#ffd21a';

  useEffect(() => {
    const modes: LightingSceneMode[] = ['focus', 'warm', 'ambient'];
    let index = 0;
    const timer = window.setInterval(() => {
      index = (index + 1) % modes.length;
      setSceneMode(modes[index]);
    }, 4200);
    return () => window.clearInterval(timer);
  }, []);

  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const xRatio = (event.clientX - rect.left) / rect.width;
    const yRatio = (event.clientY - rect.top) / rect.height;
    px.set((xRatio - 0.5) * -28);
    py.set((yRatio - 0.5) * -18);
    event.currentTarget.style.setProperty('--light-x', `${Math.round(xRatio * 100)}%`);
    event.currentTarget.style.setProperty('--light-y', `${Math.round(yRatio * 100)}%`);
  };

  const resetHero = (event: React.PointerEvent<HTMLElement>) => {
    px.set(0);
    py.set(0);
    event.currentTarget.style.setProperty('--light-x', '72%');
    event.currentTarget.style.setProperty('--light-y', '42%');
  };

  return (
    <div className="liquid-home min-h-screen overflow-hidden text-[#f8f4ee]">
      <section
        className="relative isolate min-h-screen overflow-hidden px-5 pb-16 pt-32 sm:px-8 lg:px-12"
        onPointerMove={onPointerMove}
        onPointerLeave={resetHero}
        style={{ '--light-x': '72%', '--light-y': '42%', '--hero-light-color': lightColor } as React.CSSProperties}
      >
        <motion.img
          src="/hero-led-systems.png"
          alt="Ecolife architectural lighting"
          className="absolute inset-0 h-[calc(100%+42px)] w-[calc(100%+58px)] max-w-none -translate-x-7 -translate-y-5 object-cover opacity-50 saturate-75 contrast-110"
          style={{ x: px, y: py }}
        />
        <div className="hero-light-vignette absolute inset-0" />
        <motion.div
          className="hero-live-light pointer-events-none absolute inset-0 z-[1]"
          animate={{ opacity: [0.58, 1, 0.72, 0.58] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="hero-light-scan pointer-events-none absolute -inset-[25%] z-[1]"
          animate={{ x: ['-35%', '45%', '-35%'], opacity: [0, .8, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="pointer-events-none absolute right-[4%] top-[18%] z-[1] h-[34rem] w-[34rem] rounded-full blur-[95px]"
          style={{ background: lightColor }}
          animate={{ opacity: [.08, .22, .1], scale: [.86, 1.08, .9], x: [0, -26, 12], y: [0, 18, -8] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="absolute inset-y-16 right-0 left-[38%] z-[2] hidden lg:block opacity-100">
          <React.Suspense fallback={null}><LiquidLightingScene mode={sceneMode} /></React.Suspense>
        </div>

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-10rem)] max-w-7xl items-center">
          <div className="w-full">
            <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
              <div className="mb-6 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[.26em] text-[#ffd21a]"><span className="h-px w-9 bg-[#ffd21a]" /> Memarlıq işığının yeni forması</div>
              <h1 className="text-5xl font-black leading-[.92] tracking-[-.055em] sm:text-7xl lg:text-[88px]">Məkanları<br />işıqlandırırıq.</h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/62 sm:text-lg">Memar və dizaynerlər üçün premium xətti LED sistemləri, maqnit treklər və layihəyə özəl işıq həlləri.</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <button onClick={() => onNavigate('catalog')} className="rounded-full bg-[#ffd21a] px-7 py-3.5 text-sm font-extrabold text-black shadow-[0_0_35px_rgba(255,210,26,.25)] transition hover:-translate-y-1">Məhsullara bax <ArrowRight className="ml-2 inline h-4 w-4" /></button>
                <button onClick={() => onNavigate('projects')} className="liquid-pill px-7 py-3.5 text-sm font-bold text-white">Layihələr</button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-12">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-[#ffd21a]">Premium kataloq</p><h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Ən çox seçilən sistemlər</h2></div><button onClick={() => onNavigate('catalog')} className="text-sm font-bold text-[#ffd21a]">Bütün kataloqa bax <ArrowRight className="ml-2 inline h-4 w-4" /></button></div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{featuredProducts.map((product) => <button key={product.id} onClick={() => onNavigate('catalog', product.slug)} className="liquid-card group p-3 text-left transition duration-500 hover:-translate-y-2"><div className="relative aspect-square overflow-hidden rounded-[18px] bg-black/30"><img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" /><div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" /></div><div className="p-3"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#ffd21a]">{product.code}</p><h3 className="mt-2 line-clamp-2 min-h-12 text-base font-extrabold leading-5">{product.name}</h3><span className="mt-5 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-white/50">Ətraflı bax <ArrowUpRight className="h-4 w-4 text-[#ffd21a]" /></span></div></button>)}</div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
        <div className="mb-10"><p className="text-xs font-bold uppercase tracking-[.22em] text-[#ffd21a]">Niyə Ecolife?</p><h2 className="mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">İşıqlandırmanı mühəndislik və estetika ilə birləşdiririk.</h2></div>
        <div className="grid gap-5 md:grid-cols-2">{benefits.map(([title, description], index) => <motion.div key={title} whileHover={{ y: -5 }} className="liquid-surface p-7"><div className="flex items-start gap-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ffd21a] text-black"><Check className="h-4 w-4" /></span><div><span className="text-xs text-white/35">0{index + 1}</span><h3 className="mt-1 text-xl font-extrabold">{title}</h3><p className="mt-3 leading-7 text-white/55">{description}</p></div></div></motion.div>)}</div>
        <div className="liquid-surface mt-6 grid grid-cols-2 gap-4 p-7 text-center sm:grid-cols-4">{[['20+', 'illik təcrübə'], ['500+', 'tamamlanmış layihə'], ['1000+', 'məhsul mövqeyi'], ['50+', 'ölkəyə ixrac']].map(([value, label]) => <div key={label} className="border-white/10 py-4 sm:border-r sm:last:border-0"><strong className="block text-4xl font-black text-[#ffd21a]">{value}</strong><span className="mt-2 block text-xs text-white/45">{label}</span></div>)}</div>
      </section>

      {featuredProjects.length > 0 && <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12"><div className="mb-10 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-[#ffd21a]">Portfolio</p><h2 className="mt-3 text-4xl font-black sm:text-5xl">İşıqla formalaşan layihələr</h2></div></div><div className="grid gap-5 md:grid-cols-3">{featuredProjects.map((project) => <button key={project.id} onClick={() => onNavigate('projects', project.slug)} className="liquid-card group overflow-hidden text-left"><div className="aspect-[4/3] overflow-hidden"><img src={project.coverImage} alt={project.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" /></div><div className="p-5"><h3 className="text-xl font-extrabold">{project.title}</h3><p className="mt-2 text-sm text-white/45">{project.location} · {project.year}</p></div></button>)}</div></section>}

      <section className="px-5 py-24 sm:px-8 lg:px-12"><div className="liquid-surface mx-auto max-w-6xl px-6 py-16 text-center sm:px-12"><p className="text-xs font-bold uppercase tracking-[.22em] text-[#ffd21a]">Layihənizi birlikdə işıqlandıraq</p><h2 className="mx-auto mt-5 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">İşıqlandırma layihənizi bizimlə həyata keçirin</h2><p className="mx-auto mt-5 max-w-2xl text-white/55">Memarlıq çertyojlarınızı göndərin, mühəndislərimiz Dialux hesablamasını və smetanı hazırlasın.</p><button onClick={onOpenContact} className="mt-8 rounded-full bg-[#ffd21a] px-8 py-4 font-extrabold text-black">Bizə yazın <ArrowRight className="ml-2 inline h-4 w-4" /></button></div></section>
    </div>
  );
};
