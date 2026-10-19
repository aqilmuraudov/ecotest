import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Language, Product, Project } from '../types';
import { translations } from '../data/translations';
import { solutions } from '../data/solutions';
import { useData } from '../context/DataContext';
import { getLocalizedText } from '../utils/lang';
import { motion, animate, useMotionValue, useScroll, useTransform, useReducedMotion, useAnimate, MotionConfig, MotionValue } from 'motion/react';
import { FadeIn } from '../components/ui/FadeIn';
import { EdButton, EdLink, EdSectionHead, EdHairline } from '../components/ed/EditorialUI';
import { EdProductCard } from '../components/ed/EdProductCard';
import { EdCategoryPills } from '../components/ed/EdCategoryPills';
import { ArrowRight, Lightbulb, LightbulbOff } from 'lucide-react';

interface HomePageProps {
  currentLang: Language;
  onNavigate: (page: string, param?: string) => void;
  onOpenContact: () => void;
}
/**
 * Featured projects as a sticky stack: each project pins under the header and the
 * next one slides over it, the earlier card recedes (scale + dim). Pure CSS sticky
 * plus Motion scroll values, no scroll listeners. Collapses to a static stack when
 * the visitor prefers reduced motion.
 */
const ProjectStackCard: React.FC<{
  project: Project;
  index: number;
  total: number;
  progress: MotionValue<number>;
  lang: Language;
  viewLabel: string;
  onOpen: () => void;
}> = ({ project, index, total, progress, lang, viewLabel, onOpen }) => {
  const reduce = useReducedMotion();
  const isLast = index === total - 1;
  const start = index / total;
  const end = (index + 1) / total;
  const recede = useTransform(progress, [start, end], [1, 0.94]);
  const dim = useTransform(progress, [start, end], [0, 0.55]);

  return (
    <motion.div
      style={{ top: 88 + index * 14, scale: isLast || reduce ? 1 : recede, transformOrigin: 'top center' }}
      className="sticky mb-6 sm:mb-10 last:mb-0"
    >
      <button
        onClick={onOpen}
        className="group relative block w-full h-[62vh] min-h-[380px] lg:h-[72vh] overflow-hidden text-left"
      >
        <img
          src={project.coverImage}
          alt={project.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1d1d1b]/90 via-[#1d1d1b]/15 to-transparent" />
        {!isLast && !reduce && (
          <motion.div style={{ opacity: dim }} className="absolute inset-0 bg-[#08090A] pointer-events-none" />
        )}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div>
            <h3 className="ed-display-md font-display text-ivory max-w-3xl">{project.title}</h3>
            <div className="font-micro text-[9px] text-soft mt-4 flex flex-wrap gap-x-6 gap-y-1">
              <span>{project.location}</span>
              <span>{project.categoryName?.[lang] || project.category}</span>
              <span>{project.year}</span>
            </div>
          </div>
          <span className="font-micro text-[10px] text-ivory flex items-center gap-2 shrink-0">
            {viewLabel}
            <ArrowRight className="w-4 h-4 text-amber-warm transition-transform duration-300 group-hover:translate-x-1.5" />
          </span>
        </div>
      </button>
    </motion.div>
  );
};

const ProjectStack: React.FC<{
  projects: Project[];
  lang: Language;
  viewLabel: string;
  onOpen: (p: Project) => void;
}> = ({ projects, lang, viewLabel, onOpen }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  return (
    <div ref={ref} className="relative">
      {projects.map((p, i) => (
        <ProjectStackCard
          key={p.id}
          project={p}
          index={i}
          total={projects.length}
          progress={scrollYProgress}
          lang={lang}
          viewLabel={viewLabel}
          onOpen={() => onOpen(p)}
        />
      ))}
    </div>
  );
};

/**
 * Real-pendant behaviour: the lamp is lowered on its cord from the ceiling once,
 * settles with a decaying swing, then keeps a very slow, barely-there sway around
 * the ceiling mount (top centre of the artwork).
 *
 * This is the brand moment of the page and the movement is slow, small and single-object,
 * so it runs even when the OS asks for reduced motion (MotionConfig "never" below); the
 * rest of the site still honours the setting.
 */
const LampSwingInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    if (!scope.current) return;
    const el = scope.current as HTMLElement;
    let cancelled = false;
    const running: { stop: () => void }[] = [];
    const run = (target: Record<string, unknown>, options: Record<string, unknown>) => {
      const controls = animate(el, target, options);
      running.push(controls);
      return controls;
    };
    (async () => {
      try {
        // 1. lowered slowly from the ceiling on its cord
        await run({ y: ['-100%', '0%'] }, { duration: 2.4, ease: [0.33, 0.9, 0.4, 1] });
        if (cancelled) return;
        // 2. settle with a decaying pendulum swing
        for (const angle of [4.5, -3.6, 2.8, -2.1, 1.6, -1.2]) {
          await run({ rotate: angle }, { duration: 1.5, ease: 'easeInOut' });
          if (cancelled) return;
        }
        // 3. idle sway: slow, but clearly visible, around the ceiling mount
        let dir = 1;
        while (!cancelled) {
          const started = performance.now();
          await run({ rotate: 2.2 * dir }, { duration: 4.2, ease: 'easeInOut' });
          if (performance.now() - started < 500) break; // animations disabled: never spin
          dir = -dir;
        }
      } catch {
        /* interrupted on unmount */
      }
    })();
    return () => {
      cancelled = true;
      running.forEach(r => r.stop());
    };
  }, [animate, scope]);

  return (
    <motion.div
      ref={scope}
      style={{ transformOrigin: '50% 0%', y: '-100%' }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

const LampSwing: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MotionConfig reducedMotion="never">
    <LampSwingInner>{children}</LampSwingInner>
  </MotionConfig>
);

/**
 * Hero fixture: a suspended linear luminaire (Magnetic Rail "Surface hanging" in the catalogue),
 * built as a small CSS 3D scene instead of a flat render: an anodised aluminium body seen from
 * slightly below and at an angle (perspective), an opal diffuser face that actually emits,
 * steel suspension wires, bloom + anamorphic streak, and a grainy wall wash.
 *
 * Motion: lowered from the ceiling, decaying swing, then a slow visible sway. With two-point
 * suspension the bar stays level: wires rotate about their ceiling anchors, the bar translates.
 * It opts out of the global reduced-motion setting on purpose (slow, single object).
 */
const FX_W = 1000; // design width of the scene, scaled to the container
const FX_H = 44; // body height (design units)
const FX_D = 44; // body depth
const FX_YAW = -24;
const FX_PITCH = 24;

const NOISE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='160' height='160' filter='url(%23n)'/></svg>\")";

const LinearLight: React.FC<{ on: boolean; progress: MotionValue<number> }> = ({ on, progress }) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [wire, setWire] = useState(150); // wire length in design units
  const [yaw, setYaw] = useState(FX_YAW); // gentler angle on phones so the near end stays on screen
  const [body, setBody] = useState(44); // body height/depth in design units (thicker on phones)
  const [mode, setMode] = useState<'phone' | 'tablet' | 'desktop'>('desktop');
  const [pitch, setPitch] = useState(FX_PITCH);
  const amp = useRef(1); // swing amplitude factor (small screens need a bigger swing to read)
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const apply = () => {
      const s = el.clientWidth / FX_W;
      if (!s) return;
      const desktop = window.matchMedia('(min-width: 1024px)').matches;
      const tablet = !desktop && window.matchMedia('(min-width: 640px)').matches;
      setScale(s);
      setMode(desktop ? 'desktop' : tablet ? 'tablet' : 'phone');
      setBody(desktop ? 44 : tablet ? 64 : 88);
      setYaw(desktop ? FX_YAW : tablet ? -20 : -15);
      setPitch(desktop ? FX_PITCH : 8);
      amp.current = desktop ? 1 : tablet ? 1.6 : 2.2;
      // desktop: fixed wire; phones/tablets: hang the bar ~200 / ~230px below the top whatever the width
      setWire(desktop ? 120 : Math.round((tablet ? 230 : 200) / s));
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const drop = useMotionValue(0);
  const theta = useMotionValue(0);

  useEffect(() => {
    let cancelled = false;
    const running: { stop: () => void }[] = [];
    const go = (mv: MotionValue<number>, to: number, duration: number, ease: unknown) => {
      const controls = animate(mv, to, { duration, ease: ease as never });
      running.push(controls);
      return controls;
    };
    (async () => {
      try {
        await go(drop, 1, 2.8, [0.33, 0.9, 0.4, 1]);
        if (cancelled) return;
        for (const a of [3.4, -2.9, 2.3, -1.8, 1.4, -1.1]) {
          await go(theta, a * amp.current, 1.7, 'easeInOut');
          if (cancelled) return;
        }
        let dir = 1;
        while (!cancelled) {
          const t0 = performance.now();
          await go(theta, 2.5 * amp.current * dir, 4.6, 'easeInOut');
          if (performance.now() - t0 < 500) break; // animations disabled: never spin
          dir = -dir;
        }
      } catch {
        /* interrupted on unmount */
      }
    })();
    return () => {
      cancelled = true;
      running.forEach(r => r.stop());
    };
  }, [drop, theta]);

  const rad = (deg: number) => (deg * Math.PI) / 180;
  const barX = useTransform(theta, t => wire * Math.sin(rad(t)));
  const barY = useTransform([drop, theta] as const, ([d, t]: number[]) => (d - 1) * wire - wire * (1 - Math.cos(rad(t))));
  const flatX = useTransform(barX, x => x * Math.cos(rad(-FX_YAW)));
  const recede = useTransform(progress, [0, 0.7], [1, 0.15]);
  const twistDelta = useTransform(theta, t => t * 0.8); // the bar twists a little as it swings

  const warm = on ? 1 : 0;
  const bodyBottom = wire + body;
  const boost = mode === 'desktop' ? 1 : mode === 'tablet' ? 1.35 : 1.8;
  const washH = mode === 'desktop' ? 900 : Math.min(2200, Math.round(560 / scale));
  const glow = Math.max(18, Math.round(16 / scale)); // glow radius in design units ~ constant on screen
  const bloomH = Math.max(120, Math.round(70 / scale));
  const a = (v: number) => Math.min(0.92, v * boost);
  // phones/tablets look at the bar from below its own height so the lit underside is visible
  const camY = mode === 'desktop' ? 0 : wire + body / 2 + 140;

  return (
    <div
      ref={boxRef}
      className="absolute top-0 z-0 pointer-events-none left-1/2 -translate-x-[54%] w-[min(90vw,620px)] sm:w-[min(92vw,860px)] lg:w-[min(1380px,88vw)]"
      style={{ height: (bodyBottom + 40) * scale }}
    >
      <div style={{ width: FX_W, height: bodyBottom + 40, transform: `scale(${scale})`, transformOrigin: '0 0', perspective: 1500, perspectiveOrigin: `50% ${camY}px` }} className="relative">
        {/* screen-space light: wall wash, bloom and anamorphic streak (follow the swing) */}
        <motion.div style={{ x: flatX, y: barY, opacity: recede }} className="absolute left-0 right-0" aria-hidden="true">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: on ? [0, 0.45, 0.3, 1] : 0 }}
            transition={on ? { duration: 1.8, delay: 0.3, times: [0, 0.3, 0.45, 1], ease: 'easeOut' } : { duration: 0.35, ease: 'easeIn' }}
            style={{ position: 'absolute', left: 0, right: 0, top: bodyBottom - body / 2 }}
          >
            {/* soft wash on the wall below: no hard edges, falls off with distance, with film grain */}
            <div
              style={{
                position: 'absolute',
                left: -60,
                width: FX_W + 120,
                top: 10,
                height: washH,
                background:
                  `radial-gradient(ellipse 52% 100% at 50% 0%, rgba(255,226,176,${a(0.40)}) 0%, rgba(255,208,132,${a(0.17)}) 38%, rgba(255,200,120,${a(0.05)}) 62%, rgba(255,200,120,0) 80%)`,
                filter: 'blur(8px)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: -60,
                width: FX_W + 120,
                top: 10,
                height: washH,
                backgroundImage: NOISE,
                opacity: 0.16,
                mixBlendMode: 'overlay',
                WebkitMaskImage: 'radial-gradient(ellipse 52% 100% at 50% 0%, #000 0%, transparent 78%)',
                maskImage: 'radial-gradient(ellipse 52% 100% at 50% 0%, #000 0%, transparent 78%)',
              }}
            />
            {/* bloom around the diffuser */}
            <div
              style={{
                position: 'absolute',
                left: -40,
                width: FX_W + 80,
                top: -bloomH * 0.38,
                height: bloomH,
                background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,232,190,${a(0.55)}) 0%, rgba(255,214,150,${a(0.22)}) 45%, rgba(255,200,120,0) 100%)`,
                filter: `blur(${Math.round(glow * 0.8)}px)`,
              }}
            />
            {/* anamorphic streak */}
            <div
              style={{
                position: 'absolute',
                left: -240,
                width: FX_W + 480,
                top: -glow / 4,
                height: glow / 2,
                background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,240,215,0.85) 0%, rgba(255,220,160,0.25) 55%, rgba(255,210,140,0) 100%)',
                filter: 'blur(3px)',
              }}
            />
          </motion.div>
        </motion.div>

        {/* suspension wires (shared perspective + yaw with the body) */}
        <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `rotateY(${yaw}deg)`, transformOrigin: '50% 0%' }}>
          {[70, FX_W - 70].map((left, i) => (
            <motion.div
              key={i}
              aria-hidden="true"
              style={{ position: 'absolute', left, top: 0, width: 2, height: wire, rotate: theta, scaleY: drop, transformOrigin: '50% 0%' }}
            >
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, rgba(255,255,255,0.15), rgba(235,235,240,0.85), rgba(120,120,130,0.4))' }} />
            </motion.div>
          ))}
          {/* ceiling canopies */}
          {[70, FX_W - 70].map((left, i) => (
            <div key={'c' + i} style={{ position: 'absolute', left: left - 16, top: -4, width: 34, height: 9, borderRadius: 2, background: 'linear-gradient(180deg,#2c2c2f,#0c0c0d)' }} />
          ))}
        </div>

        {/* the luminaire body */}
        <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `rotateY(${yaw}deg)`, transformOrigin: '50% 0%' }}>
          <motion.div style={{ x: barX, y: barY, rotateY: twistDelta, transformStyle: 'preserve-3d', transformOrigin: '50% 0%', position: 'absolute', left: 0, top: wire, width: FX_W, height: body }}>
            <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `rotateX(${pitch}deg)`, transformOrigin: '50% 50%' }}>
              {/* front (matt anodised) */}
              <div
                style={{
                  position: 'absolute', inset: 0, transform: `translateZ(${body / 2}px)`, borderRadius: 2,
                  background:
                    'repeating-linear-gradient(90deg, rgba(255,255,255,0.018) 0 1px, rgba(0,0,0,0.05) 1px 3px), linear-gradient(180deg, #34343a 0%, #1a1a1d 14%, #0f0f11 55%, #070708 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(0,0,0,0.8)',
                }}
              />
              {/* underside: opal diffuser in a black frame */}
              <div
                style={{
                  position: 'absolute', left: 0, width: FX_W, height: body, top: body - body / 2, transform: 'rotateX(-90deg)',
                  background: '#050506', borderRadius: 2,
                }}
              >
                <div style={{ position: 'absolute', inset: '7px 8px', background: '#26262a', borderRadius: 1 }} />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: warm }}
                  transition={{ duration: on ? 1.4 : 0.35, delay: on ? 0.3 : 0 }}
                  style={{
                    position: 'absolute', inset: '7px 8px', borderRadius: 1,
                    background:
                      'linear-gradient(90deg, #ffd488 0%, #ffe6b3 18%, #fff6e2 50%, #ffe6b3 82%, #ffd488 100%)',
                    boxShadow: `0 0 ${glow}px ${Math.round(glow / 4)}px rgba(255,226,170,0.9)`,
                  }}
                />
              </div>
              {/* end caps */}
              <div style={{ position: 'absolute', left: -body / 2, width: body, height: body, top: 0, transform: 'rotateY(-90deg)', background: 'linear-gradient(180deg,#2a2a2e,#0a0a0b)' }} />
              <div style={{ position: 'absolute', left: FX_W - body / 2, width: body, height: body, top: 0, transform: 'rotateY(90deg)', background: 'linear-gradient(180deg,#2a2a2e,#0a0a0b)' }} />
              {/* wire clamps on top */}
              {[70, FX_W - 70].map((left, i) => (
                <div key={'k' + i} style={{ position: 'absolute', left: left - 12, top: -9, width: 26, height: 10, transform: `translateZ(${body / 2}px)`, borderRadius: 2, background: 'linear-gradient(180deg,#3a3a40,#0d0d0f)' }} />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const LAMP_PREF_KEY = 'ecolife-lamp';

const LampSwitch: React.FC<{ on: boolean; onToggle: () => void; lang: Language }> = ({ on, onToggle, lang }) => {
  const label = on
    ? (lang === 'az' ? 'Söndür' : lang === 'ru' ? 'Выключить' : 'Switch off')
    : (lang === 'az' ? 'Yandır' : lang === 'ru' ? 'Включить' : 'Switch on');
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      className="ed-pill absolute z-10 right-5 sm:right-8 lg:right-12 bottom-8 sm:bottom-10 lg:bottom-16 backdrop-blur-sm bg-[var(--ed-bg)]/40"
    >
      {on ? <Lightbulb className="w-4 h-4 text-amber-warm" /> : <LightbulbOff className="w-4 h-4" />}
      <span>{label}</span>
    </button>
  );
};

/**
 * Light pool under the pendant. On load it warms up like an LED driver (a short
 * stepped ramp, no strobing); on scroll it recedes so the lamp "stays behind".
 */
const HeroGlow: React.FC<{ progress: MotionValue<number>; on: boolean }> = ({ progress, on }) => {
  const recede = useTransform(progress, [0, 0.7], [1, 0.15]);
  return (
    <motion.div
      aria-hidden="true"
      style={{ opacity: recede }}
      className="absolute top-[48%] left-1/2 -translate-x-1/2 w-[130%] h-[85%] pointer-events-none"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: on ? [0, 0.4, 0.3, 1] : 0 }}
        transition={on
          ? { duration: 1.6, delay: 0.3, times: [0, 0.3, 0.45, 1], ease: 'easeOut' }
          : { duration: 0.35, ease: 'easeIn' }}
        className="w-full h-full bg-[radial-gradient(ellipse_at_50%_15%,_rgba(245,185,55,0.24)_0%,_rgba(245,180,50,0.08)_42%,_rgba(245,180,50,0.02)_65%,_transparent_80%)] blur-3xl"
      />
    </motion.div>
  );
};

export const HomePage: React.FC<HomePageProps> = ({
  currentLang,
  onNavigate,
  onOpenContact
}) => {
  const t = translations[currentLang];
  const ed = t.ed;
  const { products, projects, categories } = useData();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const heroRef = useRef<HTMLElement>(null);
  // Hero fixture: suspended linear luminaire (default). ?hero=pendant shows the previous pendant lamp.
  const heroVariant = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('hero') === 'pendant' ? 'pendant' : 'linear';

  // Lamp power: remembered across visits (per-viewer convenience only)
  const [lampOn, setLampOn] = useState<boolean>(() => {
    try { return localStorage.getItem(LAMP_PREF_KEY) !== 'off'; } catch { return true; }
  });
  const toggleLamp = () => {
    setLampOn(prev => {
      const next = !prev;
      try { localStorage.setItem(LAMP_PREF_KEY, next ? 'on' : 'off'); } catch { /* storage unavailable */ }
      return next;
    });
  };
  // Snappy toggles once the entrance sequence has finished
  const [introDone, setIntroDone] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setIntroDone(true), 2400);
    return () => window.clearTimeout(id);
  }, []);
  const lampMotion = {
    initial: { opacity: 0, scale: 0.96, filter: 'brightness(0.55)' },
    animate: { opacity: 1, scale: 1, filter: lampOn ? 'brightness(1)' : 'brightness(0.22)' },
    transition: {
      default: { duration: 1.2, ease: [0.22, 0.61, 0.36, 1] as const, delay: 0.1 },
      filter: { duration: lampOn ? 1.2 : 0.5, ease: 'easeOut' as const, delay: introDone ? 0 : 0.3 },
    },
  };

  // Subtle product parallax on the hero (max ±18px — calm, not gimmicky)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const productY = useTransform(scrollYProgress, [0, 1], [0, -18]);
  const titleY = useTransform(scrollYProgress, [0, 1], [0, 30]);

  // Hero product: a real featured product (fallback to first)
  const heroProduct = useMemo(
    () => products.find(p => p.featured) || products[0],
    [products]
  );

  // Random seed generated once per mount so Featured System shows a different product every time
  const [randomSeed] = useState(() => Math.random());

  // Featured collection product: pick a different random product on each visit/refresh
  const featuredCollection = useMemo(() => {
    if (!products || products.length === 0) return undefined;
    const validProducts = products.filter(p => p.image && p.name);
    const basePool = validProducts.length > 0 ? validProducts : products;
    let lastId: string | null = null;
    try {
      lastId = sessionStorage.getItem('ecolife_last_featured_id');
    } catch {}
    const pool = basePool.length > 1 && lastId ? basePool.filter(p => p.id !== lastId) : basePool;
    const picked = pool[Math.floor(randomSeed * pool.length)] || basePool[0];
    if (picked && basePool.length > 1) {
      try {
        sessionStorage.setItem('ecolife_last_featured_id', picked.id);
      } catch {}
    }
    return picked;
  }, [products, randomSeed]);

  // Home pills follow the real catalogue categories (first six that actually have products)
  const productCats = (p: Product): string[] =>
    Array.isArray(p.categories) && p.categories.length > 0 ? p.categories : [p.category];
  const catLabel = (cat: { nameAz: string; nameEn: string; nameRu: string }) =>
    currentLang === 'az' ? cat.nameAz : currentLang === 'ru' ? cat.nameRu : cat.nameEn;

  const pills = useMemo(() => {
    const withProducts = categories.filter(cat => cat.id !== 'all' && products.some(p => productCats(p).includes(cat.id)));
    return [
      { id: 'all', label: ed.catAll },
      ...withProducts.slice(0, 6).map(cat => ({ id: cat.id, label: catLabel(cat) })),
    ];
  }, [categories, products, ed, currentLang]);

  const gridProducts = useMemo(() => {
    if (activeCategory === 'all') return products.slice(0, 6);
    return products.filter(p => productCats(p).includes(activeCategory)).slice(0, 6);
  }, [products, activeCategory]);

  const featuredProjects = useMemo(() => {
    if (!projects || projects.length === 0) return [];
    const copy = [...projects];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(((Math.sin(randomSeed * 1000 + i) + 1) / 2) * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, 3);
  }, [projects, randomSeed]);
  const appImages = solutions.slice(0, 4);

  const productionSteps = [
    { num: '01', label: ed.prod1 },
    { num: '02', label: ed.prod2 },
    { num: '03', label: ed.prod3 },
    { num: '04', label: ed.prod4 },
  ];

  const solutionEntries = [
    { num: '01', label: ed.sol1, image: appImages[0]?.image, action: () => onNavigate('solutions', 'residential-lighting') },
    { num: '02', label: ed.sol2, image: appImages[2]?.image, action: () => onNavigate('configurator') },
    { num: '03', label: ed.sol3, image: appImages[3]?.image, action: () => onNavigate('solutions', 'office-lighting') },
    { num: '04', label: ed.sol4, image: appImages[1]?.image, action: onOpenContact },
  ];

  return (
    <div className="bg-[var(--ed-bg)] text-[var(--ed-ivory)] overflow-x-clip">

      {/* ============================================================ */}
      {/* HERO — asymmetric dark canvas, oversized type, glowing object */}
      {/* ============================================================ */}
      <section ref={heroRef} className="relative min-h-[auto] lg:min-h-screen flex items-center pt-20 sm:pt-24 pb-12 sm:pb-16 lg:py-20 overflow-hidden">
        <div className="max-w-[1440px] mx-auto w-full px-5 sm:px-8 lg:px-12 relative z-10">

          <div className="max-w-xl lg:max-w-2xl pt-64 sm:pt-72 md:pt-80 lg:pt-44">
            {/* Headline */}
            <motion.div style={{ y: titleY }} className="relative z-10">
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.22, 0.61, 0.36, 1], delay: 0.25 }}
                className="ed-display font-display text-ivory select-none tracking-tight leading-[0.92]"
              >
                <span className="block">{ed.heroTitleA}</span>
                <span className="block">{ed.heroTitleB}</span>
              </motion.h1>

              {/* Lower-left description + CTA */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.55 }}
                className="mt-6 sm:mt-8 lg:mt-10 max-w-md"
              >
                <p className="text-sm text-soft leading-relaxed whitespace-pre-line">
                  {ed.heroDesc}
                </p>

                <div className="mt-6 sm:mt-8">
                  <EdButton arrow onClick={() => onNavigate('catalog')}>
                    {ed.heroCta}
                  </EdButton>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {heroVariant === 'linear' ? (
          <LinearLight on={lampOn} progress={scrollYProgress} />
        ) : (
          <>
          {/* MOBILE Pendant Lamp (centered between logo & search) */}
          <motion.div
            style={{ y: productY }}
            {...lampMotion}
            className="ed-hero-lamp-wrap lg:hidden absolute top-0 left-1/2 -translate-x-1/2 w-[440px] sm:w-[500px] pointer-events-none z-0 flex flex-col items-center"
          >
            <HeroGlow progress={scrollYProgress} on={lampOn} />

            <LampSwing>
              <img
                src="/hero-pendant-light-mobile.webp"
                alt="Ecolife Architectural Lighting - Mobile"
                width={824}
                height={827}
                className="w-full h-auto object-contain select-none ed-hero-lamp-shadow"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </LampSwing>
          </motion.div>

          {/* DESKTOP Pendant Lamp (hanging from top right) */}
          <motion.div
            style={{ y: productY }}
            {...lampMotion}
            className="ed-hero-lamp-wrap hidden lg:flex absolute top-0 right-[-6%] xl:right-[-2%] translate-x-[60px] w-[940px] xl:w-[1230px] 2xl:w-[1440px] pointer-events-none z-0 flex-col items-center"
          >
            <HeroGlow progress={scrollYProgress} on={lampOn} />

            <LampSwing>
              <img
                src="/hero-pendant-light-desktop.webp"
                alt="Ecolife Architectural Lighting - Desktop"
                width={1024}
                height={880}
                className="w-full h-auto object-contain select-none ed-hero-lamp-shadow"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </LampSwing>
          </motion.div>
          </>
        )}

        <LampSwitch on={lampOn} onToggle={toggleLamp} lang={currentLang} />

        {/* Fade the warm hero glow into the next section—no hard line in either theme. */}
        <div
          aria-hidden="true"
          className="ed-hero-bottom-fade absolute inset-x-0 bottom-0 z-[2] h-36 sm:h-48 lg:h-56 pointer-events-none"
        />
      </section>

      {/* ============================================================ */}
      {/* PRODUCT DISCOVERY — centered headline, pills, editorial grid  */}
      {/* ============================================================ */}
      <section className="relative z-10 py-12 sm:py-16 lg:py-20">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">

          <FadeIn>
            <EdSectionHead
              align="center"
              titleA={ed.discoveryTitleA}
              titleB={ed.discoveryTitleB}
              sub={ed.discoverySub}
              className="mb-8 sm:mb-10"
            />
          </FadeIn>

          <FadeIn delay={0.1}>
            <EdCategoryPills
              items={pills.map(p => ({ id: p.id, label: p.label }))}
              activeId={activeCategory}
              onSelect={setActiveCategory}
              className="mb-8 sm:mb-10"
            />
          </FadeIn>

          {/* 3-column editorial grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8 sm:gap-y-12">
            {gridProducts.map((product: Product, i: number) => (
              <FadeIn key={product.id} delay={0.06 * i}>
                <EdProductCard
                  product={product}
                  currentLang={currentLang}
                  onNavigate={onNavigate}
                  exploreLabel={ed.explore}
                />
              </FadeIn>
            ))}
          </div>

          <div className="mt-12 sm:mt-16 text-center">
            <EdLink arrow onClick={() => onNavigate('catalog', activeCategory === 'all' ? undefined : activeCategory)}>
              {t.home.viewAllProducts}
            </EdLink>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FEATURED COLLECTION — random product on each visit            */}
      {/* ============================================================ */}
      {featuredCollection && (
        <section className="py-12 sm:py-16 lg:py-20 border-t border-[var(--ed-line-soft)]">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">

              <FadeIn direction="right">
                <div>
                  <p className="font-micro text-amber-warm mb-4 sm:mb-6">{ed.featuredEyebrow}</p>
                  <h2 className="ed-display-md font-display text-ivory">
                    {featuredCollection.name}
                  </h2>
                  <p className="text-sm text-soft leading-relaxed mt-4 sm:mt-6 max-w-md whitespace-pre-line">
                    {getLocalizedText(featuredCollection.description, currentLang) || ed.featuredDesc}
                  </p>

                  {/* Technical row (without 5Y warranty) */}
                  <div className="flex gap-10 mt-6 sm:mt-8">
                    {[ed.featuredSpec1, ed.featuredSpec2].filter(Boolean).map((spec, i) => (
                      <div key={i}>
                        <div className="ed-hairline mb-3 max-w-[72px]" />
                        <span className="font-mono-tech text-xs text-ivory">{spec}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-6">
                    <EdButton arrow onClick={() => onNavigate('configurator')}>
                      {ed.featuredCta}
                    </EdButton>
                    <EdLink onClick={() => onNavigate('catalog', featuredCollection.slug)}>
                      {ed.explore}
                    </EdLink>
                  </div>
                </div>
              </FadeIn>

              <FadeIn direction="left" className="relative">
                <div
                  onClick={() => onNavigate('catalog', featuredCollection.slug)}
                  className="group cursor-pointer relative aspect-[4/3] overflow-hidden ed-plate flex items-center justify-center p-6 sm:p-10"
                >
                  <img
                    src={featuredCollection.image}
                    alt={featuredCollection.name}
                    loading="lazy"
                    className="w-full h-full max-w-[84%] max-h-[84%] object-contain transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <span className="font-mono-tech text-[10px] text-[#1d1d1b]/60 absolute bottom-4 right-5">
                    {featuredCollection.code}
                  </span>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* FEATURED PROJECTS — full-width + two-column editorial spread  */}
      {/* ============================================================ */}
      {featuredProjects.length > 0 && (
        <section className="py-12 sm:py-16 lg:py-20 border-t border-[var(--ed-line-soft)]">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-8 sm:mb-10">
              <FadeIn>
                <EdSectionHead
                  eyebrow={ed.projEyebrow}
                  titleA={ed.projTitleA}
                  titleB={ed.projTitleB}
                />
              </FadeIn>
              <FadeIn delay={0.1}>
                <EdLink arrow onClick={() => onNavigate('projects')}>
                  {ed.viewAllProjects}
                </EdLink>
              </FadeIn>
            </div>

            <ProjectStack
              projects={featuredProjects}
              lang={currentLang}
              viewLabel={t.projects.viewProject}
              onOpen={(p) => onNavigate('projects', p.slug || p.id)}
            />
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* WHAT WE DO & CUSTOM PRODUCTION — compact architectural bands  */}
      {/* ============================================================ */}
      <section className="py-10 sm:py-14 border-t border-[var(--ed-line-soft)]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* Left: Compact Section Title */}
            <div className="lg:col-span-4">
              <FadeIn>
                <p className="font-micro text-amber-warm mb-3">{ed.solEyebrow}</p>
                <h2 className="ed-display-md font-display text-ivory">
                  {ed.solTitleA}{' '}
                  <span className="text-soft">{ed.solTitleB}</span>
                </h2>
              </FadeIn>
            </div>

            {/* Right: Compact 2x2 Grid of Services */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-l border-[var(--ed-line)]">
                {solutionEntries.map((entry, i) => (
                  <FadeIn key={entry.num} delay={0.04 * i}>
                    <button
                      onClick={entry.action}
                      className="group w-full flex items-center justify-between p-5 sm:p-6 border-r border-b border-[var(--ed-line)] text-left relative overflow-hidden hover:bg-[var(--ed-bg-2)] transition-colors duration-300"
                    >
                      <div className="flex items-baseline gap-4 relative z-10">
                        <span className="font-mono-tech text-[11px] text-amber-warm/80">{entry.num}</span>
                        <span className="text-base sm:text-lg font-medium text-ivory group-hover:text-amber-warm transition-colors duration-300">
                          {entry.label}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-mute group-hover:text-amber-warm group-hover:translate-x-1 transition-all duration-300 shrink-0" />
                    </button>
                  </FadeIn>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CUSTOM PRODUCTION — compact 01–04 grid + sleek dual visuals    */}
      {/* ============================================================ */}
      <section className="py-10 sm:py-14 border-t border-[var(--ed-line-soft)]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            <div className="lg:col-span-5">
              <FadeIn>
                <p className="font-micro text-amber-warm mb-3">{ed.prodEyebrow}</p>
                <h2 className="ed-display-md font-display text-ivory">
                  {ed.prodTitleA}{' '}
                  <span className="text-soft">{ed.prodTitleB}</span>
                </h2>
                <p className="text-xs text-mute mt-3 leading-relaxed">
                  {ed.prodSub}
                </p>
              </FadeIn>

              <div className="grid grid-cols-2 border-t border-l border-[var(--ed-line)] mt-6">
                {productionSteps.map((step, i) => (
                  <FadeIn key={step.num} delay={0.05 * i}>
                    <div className="p-4 sm:p-5 border-r border-b border-[var(--ed-line)] flex items-baseline gap-3">
                      <span className="font-mono-tech text-xs text-amber-warm">{step.num}</span>
                      <span className="font-micro text-[10px] text-ivory">{step.label}</span>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>

            {/* Compact side-by-side production imagery */}
            <div className="lg:col-span-7">
              <FadeIn direction="left">
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative overflow-hidden aspect-[16/11]">
                    <img
                      src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=900&q=80"
                      alt="Ecolife production"
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1d1d1b]/75 via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-3 font-micro text-[9px] text-ivory/90">{ed.facilityTag}</span>
                  </div>
                  <div className="relative overflow-hidden aspect-[16/11]">
                    <img
                      src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80"
                      alt="Ecolife assembly"
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1d1d1b]/75 via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-3 font-micro text-[9px] text-ivory/90">{ed.assemblyTag}</span>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FINAL CTA — compact, aesthetic horizontal architectural bar    */}
      {/* ============================================================ */}
      <section className="relative py-10 sm:py-14 border-t border-[var(--ed-line-soft)] overflow-hidden">
        {/* Subtle warm architectural glow */}
        <div className="absolute inset-x-0 bottom-[-40%] h-[90%] ed-glow-warm pointer-events-none opacity-75" />

        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 sm:gap-8 bg-[var(--ed-bg-2)]/70 border border-[var(--ed-line)] p-6 sm:p-8 lg:px-12 lg:py-10">
            <FadeIn>
              <div>
                <h2 className="ed-display-sm sm:ed-display-md font-display text-ivory leading-tight">
                  {ed.ctaTitleA}{' '}
                  <span className="text-amber-warm">{ed.ctaTitleB}</span>
                </h2>
                <p className="text-xs sm:text-sm text-soft mt-2.5 max-w-md">
                  {ed.ctaText}
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="flex flex-wrap items-center gap-4 shrink-0">
                <EdButton arrow onClick={onOpenContact}>
                  {ed.ctaBtn}
                </EdButton>
                <EdButton variant="ghost" onClick={() => onNavigate('configurator')}>
                  {t.nav.configurator}
                </EdButton>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
};
