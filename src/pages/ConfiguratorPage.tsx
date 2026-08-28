import React, { useState } from 'react';
import { Language, ConfiguratorState } from '../types';
import { translations } from '../data/translations';
import { 
  Sliders, 
  Send, 
  RotateCcw,
  Sparkles,
  SunMedium,
  Power,
  Maximize2,
  Box,
  Layers,
  Check,
  Eye
} from 'lucide-react';

interface ConfiguratorPageProps {
  currentLang: Language;
  onNavigate: (page: string, param?: string) => void;
  onOpenInquiryWithSummary: (summary: string) => void;
  onDownloadFile?: (fileName: string) => void;
}

export const ConfiguratorPage: React.FC<ConfiguratorPageProps> = ({
  currentLang,
  onNavigate,
  onOpenInquiryWithSummary,
}) => {
  const t = translations[currentLang];

  const [config, setConfig] = useState<ConfiguratorState>({
    profileType: 'linear-40',
    mounting: 'suspended',
    length: 2500, // in mm
    cct: '3000k',
    finish: 'black',
    control: 'dali',
    diffuser: 'microprismatic'
  });

  const [shape, setShape] = useState<'straight' | 'l-corner' | 'rectangle'>('straight');
  const [viewMode, setViewMode] = useState<'elevation' | '3d' | 'effect'>('elevation');
  const [isLightOn, setIsLightOn] = useState<boolean>(true);
  const [dimLevel, setDimLevel] = useState<number>(100); // 10% - 100%

  // Mathematical power & lumen calculations based on choices
  const lengthMeters = config.length / 1000;
  const wattsPerMeter = config.profileType === 'slim-20' ? 18 : config.profileType === 'ultra-rail' ? 30 : 24;
  const shapeMultiplier = shape === 'l-corner' ? 1.6 : shape === 'rectangle' ? 3.2 : 1;
  const totalWatts = Math.round(lengthMeters * wattsPerMeter * shapeMultiplier);
  const lumensPerWatt = config.diffuser === 'microprismatic' ? 125 : config.diffuser === 'dark-reflector' ? 110 : 120;
  const totalLumens = Math.round(totalWatts * lumensPerWatt * (dimLevel / 100));
  const estimatedUGR = config.diffuser === 'microprismatic' ? '< 19' : config.diffuser === 'dark-reflector' ? '< 13' : '< 22';

  // Dynamic colors for real-time visualization
  const finishStyles = {
    black: {
      bg: '#141518',
      border: '#2C2E35',
      accent: '#0A0B0D',
      label: t.configurator.finishes.black,
      name: 'Matte Black RAL 9005'
    },
    white: {
      bg: '#E2E8F0',
      border: '#CBD5E1',
      accent: '#F8FAFC',
      label: t.configurator.finishes.white,
      name: 'Matte White RAL 9016'
    },
    anodized: {
      bg: '#B89047',
      border: '#D4AF37',
      accent: '#8C6824',
      label: t.configurator.finishes.anodized,
      name: 'Anodized Champagne Gold'
    },
    custom: {
      bg: '#3F444E',
      border: '#64748B',
      accent: '#1E293B',
      label: t.configurator.finishes.custom,
      name: 'Anthracite Titanium'
    }
  }[config.finish];

  const cctStyles = {
    '2700k': {
      hex: '#FFA947',
      glow: 'rgba(255, 169, 71, 0.65)',
      softGlow: 'rgba(255, 169, 71, 0.25)',
      tempLabel: '2700K Ultra Warm'
    },
    '3000k': {
      hex: '#FFD39B',
      glow: 'rgba(255, 211, 155, 0.65)',
      softGlow: 'rgba(255, 211, 155, 0.25)',
      tempLabel: '3000K Warm White'
    },
    '4000k': {
      hex: '#F4F8FF',
      glow: 'rgba(244, 248, 255, 0.7)',
      softGlow: 'rgba(244, 248, 255, 0.25)',
      tempLabel: '4000K Neutral White'
    },
    'tunable': {
      hex: '#FFEAC2',
      glow: 'rgba(255, 234, 194, 0.65)',
      softGlow: 'rgba(255, 234, 194, 0.25)',
      tempLabel: '2700K-6500K Tunable White'
    }
  }[config.cct];

  // Profile dimensions & specs info
  const profileInfo = {
    'linear-40': { name: t.configurator.models.linear40, dim: '40 x 60 mm', heightPx: 28, slotPx: 12 },
    'slim-20': { name: t.configurator.models.slim20, dim: '20 x 20 mm', heightPx: 16, slotPx: 8 },
    'recessed-50': { name: t.configurator.models.recessed50, dim: 'Trimless 50 mm', heightPx: 32, slotPx: 14 },
    'ultra-rail': { name: t.configurator.models.ultraRail, dim: '48V Magnetic', heightPx: 30, slotPx: 10 },
  }[config.profileType];

  // Summary generation in selected language
  const configSummaryText = currentLang === 'az'
    ? `ECOLIFE XƏTTİ LED KONFİQURASİYA HESABATI:
- Profil Modeli: ${profileInfo.name} (${profileInfo.dim})
- Montaj Növü: ${t.configurator.mountings[config.mounting]}
- Forma: ${shape === 'straight' ? t.configurator.shapes.straight : shape === 'l-corner' ? t.configurator.shapes.lCorner : t.configurator.shapes.rectangle}
- Uzunluq: ${config.length} mm (${lengthMeters.toFixed(2)} metr)
- Rəng Temperaturu (CCT): ${cctStyles.tempLabel} (CRI > 95)
- Korpus Rəngi: ${finishStyles.label} (${finishStyles.name})
- İdarəetmə Protokolu: ${t.configurator.controls[config.control === 'on-off' ? 'onOff' : config.control === 'dali' ? 'dali' : config.control === '0-10v' ? 'analog' : 'casambi']}
- Optika & Diffuzor: ${t.configurator.diffusers[config.diffuser === 'microprismatic' ? 'microprismatic' : config.diffuser === 'opal' ? 'opal' : 'darkReflector']} (UGR ${estimatedUGR})
- Hesablanmış Ümumi Güc: ${totalWatts} W
- İşıq Axını: ~${totalLumens} lm`.trim()
    : currentLang === 'ru'
    ? `ОТЧЕТ КОНФИГУРАЦИИ СВЕТИЛЬНИКА ECOLIFE:
- Модель Профиля: ${profileInfo.name} (${profileInfo.dim})
- Тип Монтажа: ${t.configurator.mountings[config.mounting]}
- Форма: ${shape === 'straight' ? t.configurator.shapes.straight : shape === 'l-corner' ? t.configurator.shapes.lCorner : t.configurator.shapes.rectangle}
- Длина: ${config.length} мм (${lengthMeters.toFixed(2)} м)
- Цветовая Температура (CCT): ${cctStyles.tempLabel} (CRI > 95)
- Цвет Корпуса: ${finishStyles.label} (${finishStyles.name})
- Протокол Управления: ${t.configurator.controls[config.control === 'on-off' ? 'onOff' : config.control === 'dali' ? 'dali' : config.control === '0-10v' ? 'analog' : 'casambi']}
- Оптика / Рассеиватель: ${t.configurator.diffusers[config.diffuser === 'microprismatic' ? 'microprismatic' : config.diffuser === 'opal' ? 'opal' : 'darkReflector']} (UGR ${estimatedUGR})
- Расчетная Мощность: ${totalWatts} Вт
- Световой Поток: ~${totalLumens} лм`.trim()
    : `ECOLIFE LINEAR LED CONFIGURATION SUMMARY:
- Profile Model: ${profileInfo.name} (${profileInfo.dim})
- Mounting: ${t.configurator.mountings[config.mounting]}
- Geometry: ${shape === 'straight' ? t.configurator.shapes.straight : shape === 'l-corner' ? t.configurator.shapes.lCorner : t.configurator.shapes.rectangle}
- Length: ${config.length} mm (${lengthMeters.toFixed(2)} m)
- Color Temperature (CCT): ${cctStyles.tempLabel} (CRI > 95)
- Finish: ${finishStyles.label} (${finishStyles.name})
- Control Protocol: ${t.configurator.controls[config.control === 'on-off' ? 'onOff' : config.control === 'dali' ? 'dali' : config.control === '0-10v' ? 'analog' : 'casambi']}
- Optics / Diffuser: ${t.configurator.diffusers[config.diffuser === 'microprismatic' ? 'microprismatic' : config.diffuser === 'opal' ? 'opal' : 'darkReflector']} (UGR ${estimatedUGR})
- Calculated Power: ${totalWatts} W
- Luminous Flux: ~${totalLumens} lm`.trim();

  const handleInquiry = () => {
    onOpenInquiryWithSummary(configSummaryText);
  };

  // Length calculation for SVG width scaling
  // Map 500mm - 10000mm to 35% - 92% width
  const visualWidthPercent = Math.min(92, Math.max(35, 35 + ((config.length - 500) / 9500) * 57));

  return (
    <div className="min-h-screen bg-[#08090A] text-[#F5F5F5] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="bg-[#101114] border border-white/10 rounded-2xl p-6 sm:p-8 mb-8 shadow-2xl">
          <div className="flex items-center space-x-2 text-xs text-gray-400 mb-3">
            <button onClick={() => onNavigate('home')} className="hover:text-[#FFD21A] transition-colors">
              {t.nav.home}
            </button>
            <span>/</span>
            <span className="text-[#FFD21A]">{t.nav.configurator}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#FFD21A]/10 border border-[#FFD21A]/30 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider text-[#FFD21A] mb-2">
                <Sliders className="w-3.5 h-3.5" />
                <span>{t.configurator.badge}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
                {t.configurator.title}
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 mt-2 max-w-2xl leading-relaxed">
                {t.configurator.subtitle}
              </p>
            </div>

            <button
              onClick={() => {
                setConfig({
                  profileType: 'linear-40',
                  mounting: 'suspended',
                  length: 2500,
                  cct: '3000k',
                  finish: 'black',
                  control: 'dali',
                  diffuser: 'microprismatic'
                });
                setShape('straight');
                setIsLightOn(true);
                setDimLevel(100);
                setViewMode('elevation');
              }}
              className="self-start md:self-auto flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-3.5 py-2 rounded bg-white/5 border border-white/10 hover:border-white/25 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.configurator.reset}</span>
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Configuration Controls */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Profile Model Selection */}
            <div className="bg-[#101114] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#FFD21A]">
                  {t.configurator.section1}
                </h3>
                <span className="text-xs font-mono text-gray-400">{t.configurator.sectionSize}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'linear-40', name: t.configurator.models.linear40, sub: t.configurator.models.linear40Sub, icon: '■' },
                  { id: 'slim-20', name: t.configurator.models.slim20, sub: t.configurator.models.slim20Sub, icon: '▪' },
                  { id: 'recessed-50', name: t.configurator.models.recessed50, sub: t.configurator.models.recessed50Sub, icon: '⊔' },
                  { id: 'ultra-rail', name: t.configurator.models.ultraRail, sub: t.configurator.models.ultraRailSub, icon: '☰' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setConfig({ ...config, profileType: item.id as any })}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      config.profileType === item.id 
                        ? 'border-[#FFD21A] bg-[#FFD21A]/10 text-white ring-1 ring-[#FFD21A]' 
                        : 'border-white/10 bg-black/40 text-gray-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <div className="text-base sm:text-lg font-bold text-[#FFD21A] mb-1">{item.icon}</div>
                    <div className="text-xs font-bold uppercase">{item.name}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{item.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Mounting & Geometric Shape */}
            <div className="bg-[#101114] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#FFD21A]">
                  {t.configurator.section2}
                </h3>
              </div>

              {/* Mounting Typology */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'suspended', label: t.configurator.mountings.suspended },
                  { id: 'recessed', label: t.configurator.mountings.recessed },
                  { id: 'surface', label: t.configurator.mountings.surface },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setConfig({ ...config, mounting: m.id as any })}
                    className={`p-3 rounded-xl text-xs font-semibold border transition-all text-center flex items-center justify-center gap-2 ${
                      config.mounting === m.id 
                        ? 'border-[#FFD21A] bg-[#FFD21A]/15 text-[#FFD21A] ring-1 ring-[#FFD21A]' 
                        : 'border-white/10 bg-black/40 text-gray-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {config.mounting === m.id && <Check className="w-3.5 h-3.5 text-[#FFD21A]" />}
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>

              {/* Geometry Selection */}
              <div className="pt-2">
                <label className="block text-xs font-medium text-gray-400 mb-2.5">
                  {t.configurator.shapeTitle}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'straight', label: t.configurator.shapes.straight },
                    { id: 'l-corner', label: t.configurator.shapes.lCorner },
                    { id: 'rectangle', label: t.configurator.shapes.rectangle },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setShape(s.id as any)}
                      className={`p-3 rounded-lg text-xs border transition-all flex items-center justify-center gap-2 ${
                        shape === s.id 
                          ? 'border-white text-white bg-white/10 font-bold ring-1 ring-white/20' 
                          : 'border-white/10 bg-black/40 text-gray-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {shape === s.id && <Check className="w-3.5 h-3.5 text-white" />}
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Length Slider */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex justify-between items-center text-xs mb-2.5">
                  <span className="text-gray-300 font-bold uppercase">{t.configurator.lengthTitle}</span>
                  <span className="text-lg font-mono font-bold text-[#FFD21A]">
                    {config.length} mm <span className="text-xs text-gray-400 font-normal">({(config.length / 1000).toFixed(2)} {t.configurator.meterUnit})</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="10000"
                  step="100"
                  value={config.length}
                  onChange={(e) => setConfig({ ...config, length: Number(e.target.value) })}
                  className="w-full h-2.5 bg-[#18191E] rounded-lg appearance-none cursor-pointer accent-[#FFD21A]"
                />
                <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-1.5">
                  <span>0.5 m</span>
                  <span>2.5 m</span>
                  <span>5.0 m</span>
                  <span>7.5 m</span>
                  <span>10.0 m+</span>
                </div>
              </div>
            </div>

            {/* 3. CCT, Diffuser, Finish & Control */}
            <div className="bg-[#101114] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
              
              {/* Color Temperature (CCT) */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#FFD21A]">
                  {t.configurator.section3}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: '2700k', name: t.configurator.cct.cct2700, sub: t.configurator.cct.cct2700Sub, color: '#FFA947' },
                    { id: '3000k', name: t.configurator.cct.cct3000, sub: t.configurator.cct.cct3000Sub, color: '#FFD39B' },
                    { id: '4000k', name: t.configurator.cct.cct4000, sub: t.configurator.cct.cct4000Sub, color: '#F4F8FF' },
                    { id: 'tunable', name: t.configurator.cct.tunable, sub: t.configurator.cct.tunableSub, color: 'linear-gradient(90deg, #FFA947, #F4F8FF)' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setConfig({ ...config, cct: c.id as any })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        config.cct === c.id 
                          ? 'border-[#FFD21A] bg-[#FFD21A]/10 ring-1 ring-[#FFD21A]' 
                          : 'border-white/10 bg-black/40 text-gray-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full mb-2 border border-white/30 shadow-inner" style={{ background: c.color }} />
                      <div className="text-xs font-bold text-white">{c.name}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{c.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Diffuser / Glare Control */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <label className="block text-xs font-medium text-gray-300">
                  {t.configurator.diffuserTitle}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'microprismatic', name: t.configurator.diffusers.microprismatic, ugr: t.configurator.diffusers.microprismaticSub },
                    { id: 'opal', name: t.configurator.diffusers.opal, ugr: t.configurator.diffusers.opalSub },
                    { id: 'dark-reflector', name: t.configurator.diffusers.darkReflector, ugr: t.configurator.diffusers.darkReflectorSub },
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setConfig({ ...config, diffuser: d.id as any })}
                      className={`p-3 rounded-xl border text-left text-xs transition-all ${
                        config.diffuser === d.id 
                          ? 'border-[#FFD21A] bg-[#FFD21A]/15 text-white font-bold ring-1 ring-[#FFD21A]' 
                          : 'border-white/10 bg-black/40 text-gray-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <div className="font-semibold text-white">{d.name}</div>
                      <div className="text-[10px] text-gray-400 mt-1">{d.ugr}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Profile Body Finish */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <label className="block text-xs font-medium text-gray-300">
                  {t.configurator.finishTitle}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'black', name: t.configurator.finishes.black, hex: '#141518' },
                    { id: 'white', name: t.configurator.finishes.white, hex: '#E2E8F0' },
                    { id: 'anodized', name: t.configurator.finishes.anodized, hex: '#B89047' },
                    { id: 'custom', name: t.configurator.finishes.custom, hex: '#3F444E' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setConfig({ ...config, finish: f.id as any })}
                      className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs transition-all ${
                        config.finish === f.id 
                          ? 'border-[#FFD21A] bg-white/10 text-white font-bold ring-1 ring-[#FFD21A]' 
                          : 'border-white/10 bg-black/40 text-gray-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full border border-white/40 flex-shrink-0" style={{ background: f.hex }} />
                      <span className="truncate">{f.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Control System */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <label className="block text-xs font-medium text-gray-300">
                  {t.configurator.controlTitle}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'on-off', label: t.configurator.controls.onOff },
                    { id: 'dali', label: t.configurator.controls.dali },
                    { id: '0-10v', label: t.configurator.controls.analog },
                    { id: 'casambi', label: t.configurator.controls.casambi },
                  ].map((ctrl) => (
                    <button
                      key={ctrl.id}
                      onClick={() => setConfig({ ...config, control: ctrl.id as any })}
                      className={`px-3 py-2.5 rounded-lg text-xs border transition-all text-center ${
                        config.control === ctrl.id 
                          ? 'border-[#FFD21A] bg-[#FFD21A]/15 text-[#FFD21A] font-bold ring-1 ring-[#FFD21A]' 
                          : 'border-white/10 bg-black/40 text-gray-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {ctrl.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: Real-Time Simulation Studio */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            
            {/* Real-time Luminaire Preview Stage */}
            <div className="bg-[#101114] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5">
              
              {/* Studio Header with View Mode Switchers */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#FFD21A]">
                    {t.configurator.simulationTitle}
                  </span>
                  <span className="text-[10px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded text-gray-300">
                    {t.configurator.simulationBadge}
                  </span>
                </div>

                {/* Perspective View Switcher */}
                <div className="flex items-center bg-black/60 border border-white/10 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode('elevation')}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                      viewMode === 'elevation' ? 'bg-[#FFD21A] text-black font-bold' : 'text-gray-400 hover:text-white'
                    }`}
                    title={t.configurator.viewElevation}
                  >
                    {t.configurator.viewElevation}
                  </button>
                  <button
                    onClick={() => setViewMode('3d')}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                      viewMode === '3d' ? 'bg-[#FFD21A] text-black font-bold' : 'text-gray-400 hover:text-white'
                    }`}
                    title={t.configurator.view3d}
                  >
                    {t.configurator.view3d}
                  </button>
                  <button
                    onClick={() => setViewMode('effect')}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                      viewMode === 'effect' ? 'bg-[#FFD21A] text-black font-bold' : 'text-gray-400 hover:text-white'
                    }`}
                    title={t.configurator.viewEffect}
                  >
                    {t.configurator.viewEffect}
                  </button>
                </div>
              </div>

              {/* Interactive Stage Canvas */}
              <div className="h-72 sm:h-80 bg-[#07080A] border border-white/10 rounded-xl relative overflow-hidden flex flex-col justify-between p-4 select-none">
                
                {/* Architectural Grid & Ambient Ceiling */}
                <div className="absolute inset-0 architectural-grid opacity-15 pointer-events-none" />
                
                {/* Ceiling Plane Marker */}
                <div className="relative z-10 w-full flex justify-between items-center text-[10px] font-mono text-gray-500 border-b border-dashed border-gray-700/60 pb-1">
                  <span>CEILING PLANE</span>
                  <span>{config.mounting.toUpperCase()} MOUNT</span>
                </div>

                {/* Main Dynamic Luminaire SVG / Render Box */}
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-2 py-4">
                  
                  {/* VIEW MODE 1: Architectural Elevation View */}
                  {viewMode === 'elevation' && (
                    <div className="w-full flex flex-col items-center justify-center relative">
                      
                      {/* Straight Line Elevation */}
                      {shape === 'straight' && (
                        <div 
                          className="relative transition-all duration-300 flex flex-col items-center"
                          style={{ width: `${visualWidthPercent}%` }}
                        >
                          {/* Suspension Wires / Mount Anchors */}
                          {config.mounting === 'suspended' && (
                            <div className="w-full relative h-12 flex justify-between px-3">
                              {/* Left Anchor & Wire */}
                              <div className="flex flex-col items-center">
                                <div className="w-2.5 h-1.5 bg-gray-400 rounded-t-sm" />
                                <div className="w-[1px] h-10 bg-gradient-to-b from-gray-400 to-gray-500" />
                              </div>
                              {/* Transparent Power Feed Cable */}
                              <div className="absolute left-6 top-0 flex flex-col items-center opacity-60">
                                <div className="w-[1.5px] h-10 bg-gray-600 border-dashed" />
                              </div>
                              {/* Right Anchor & Wire */}
                              <div className="flex flex-col items-center">
                                <div className="w-2.5 h-1.5 bg-gray-400 rounded-t-sm" />
                                <div className="w-[1px] h-10 bg-gradient-to-b from-gray-400 to-gray-500" />
                              </div>
                            </div>
                          )}

                          {config.mounting === 'surface' && (
                            <div className="w-full relative h-3 flex justify-between px-6">
                              <div className="w-3 h-2 bg-gray-600 rounded-sm" />
                              <div className="w-3 h-2 bg-gray-600 rounded-sm" />
                            </div>
                          )}

                          {config.mounting === 'recessed' && (
                            <div className="w-full relative h-2 flex items-center justify-center">
                              {/* Trimless Plaster Flanges */}
                              <div className="w-full h-0.5 bg-gray-600/60" />
                            </div>
                          )}

                          {/* Dimension Callout Top */}
                          <div className="w-full flex items-center justify-between text-[10px] font-mono text-[#FFD21A] mb-1.5 px-0.5">
                            <span className="text-gray-500">|←</span>
                            <span className="bg-black/80 px-2 py-0.5 rounded border border-[#FFD21A]/30">
                              {config.length} mm
                            </span>
                            <span className="text-gray-500">→|</span>
                          </div>

                          {/* Profile Body Extrusion */}
                          <div 
                            className="w-full rounded-sm transition-all duration-300 relative overflow-hidden flex flex-col justify-end shadow-2xl"
                            style={{ 
                              height: `${profileInfo.heightPx}px`,
                              backgroundColor: finishStyles.bg,
                              border: `1.5px solid ${finishStyles.border}`,
                              boxShadow: isLightOn 
                                ? `0 ${profileInfo.heightPx / 2}px ${30 * (dimLevel / 100)}px ${cctStyles.softGlow}`
                                : '0 4px 15px rgba(0,0,0,0.8)'
                            }}
                          >
                            {/* Metallic Bevel Highlight */}
                            <div className="absolute top-0 inset-x-0 h-[2px] bg-white/20" />
                            
                            {/* Light Emitter Strip / Diffuser Aperture */}
                            <div 
                              className="w-full transition-all duration-300 relative flex items-center justify-center overflow-hidden"
                              style={{ 
                                height: `${profileInfo.slotPx}px`,
                                backgroundColor: isLightOn ? cctStyles.hex : '#222',
                                opacity: isLightOn ? (0.3 + (dimLevel / 100) * 0.7) : 0.2,
                                boxShadow: isLightOn ? `0 0 ${20 * (dimLevel / 100)}px ${cctStyles.glow}` : 'none'
                              }}
                            >
                              {/* Diffuser Texture Simulation */}
                              {config.diffuser === 'microprismatic' && isLightOn && (
                                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:4px_4px]" />
                              )}
                              {config.diffuser === 'dark-reflector' && (
                                <div className="absolute inset-0 flex justify-around items-center px-1">
                                  {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-black/80 border border-white/20" />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Downward Light Wash Cone Projection */}
                          {isLightOn && (
                            <div 
                              className="w-[120%] h-20 transition-all duration-300 pointer-events-none -mt-0.5"
                              style={{
                                background: `linear-gradient(to bottom, ${cctStyles.softGlow}, transparent)`,
                                opacity: (dimLevel / 100) * 0.9,
                                clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)'
                              }}
                            />
                          )}
                        </div>
                      )}

                      {/* L-Corner Elevation / Plan Mix */}
                      {shape === 'l-corner' && (
                        <div className="relative flex flex-col items-center">
                          {config.mounting === 'suspended' && (
                            <div className="w-48 h-8 relative flex justify-between px-4">
                              <div className="w-[1px] h-8 bg-gray-400" />
                              <div className="w-[1px] h-8 bg-gray-400" />
                              <div className="w-[1px] h-8 bg-gray-400" />
                            </div>
                          )}

                          <svg viewBox="0 0 160 120" className="w-52 h-40">
                            {/* Shadow/Glow under L-shape */}
                            {isLightOn && (
                              <path 
                                d="M 30 30 L 130 30 L 130 100" 
                                fill="none" 
                                stroke={cctStyles.glow} 
                                strokeWidth="24" 
                                strokeLinecap="square"
                                opacity={(dimLevel / 100) * 0.5}
                                style={{ filter: 'blur(8px)' }}
                              />
                            )}

                            {/* Aluminum Profile Body */}
                            <path 
                              d="M 30 30 L 130 30 L 130 100" 
                              fill="none" 
                              stroke={finishStyles.bg} 
                              strokeWidth="20" 
                              strokeLinecap="square"
                            />
                            <path 
                              d="M 30 30 L 130 30 L 130 100" 
                              fill="none" 
                              stroke={finishStyles.border} 
                              strokeWidth="20" 
                              strokeLinecap="square"
                              strokeDasharray="1,12"
                            />

                            {/* Light Emitter Lens */}
                            <path 
                              d="M 30 30 L 130 30 L 130 100" 
                              fill="none" 
                              stroke={isLightOn ? cctStyles.hex : '#333'} 
                              strokeWidth="8" 
                              strokeLinecap="square"
                              opacity={isLightOn ? (0.4 + (dimLevel / 100) * 0.6) : 0.3}
                              style={{ 
                                filter: isLightOn ? `drop-shadow(0 0 6px ${cctStyles.glow})` : 'none' 
                              }}
                            />

                            {/* L-Corner Mitre Joint Line */}
                            <line x1="120" y1="20" x2="140" y2="40" stroke="#FFF" strokeWidth="1" opacity="0.4" />
                            
                            {/* Dimension Callouts */}
                            <text x="75" y="18" fill="#FFD21A" fontSize="9" textAnchor="middle" fontFamily="monospace">
                              {Math.round(config.length * 0.6)} mm
                            </text>
                            <text x="145" y="65" fill="#FFD21A" fontSize="9" textAnchor="middle" fontFamily="monospace" transform="rotate(90, 145, 65)">
                              {Math.round(config.length * 0.4)} mm
                            </text>
                          </svg>
                        </div>
                      )}

                      {/* Box / Rectangle Closed Frame */}
                      {shape === 'rectangle' && (
                        <div className="relative flex flex-col items-center">
                          {config.mounting === 'suspended' && (
                            <div className="w-48 h-8 relative flex justify-between px-4">
                              <div className="w-[1px] h-8 bg-gray-400" />
                              <div className="w-[1px] h-8 bg-gray-400" />
                            </div>
                          )}

                          <svg viewBox="0 0 180 110" className="w-56 h-36">
                            {/* Light Glow */}
                            {isLightOn && (
                              <rect 
                                x="25" 
                                y="20" 
                                width="130" 
                                height="70" 
                                fill="none" 
                                stroke={cctStyles.glow} 
                                strokeWidth="22" 
                                opacity={(dimLevel / 100) * 0.4}
                                style={{ filter: 'blur(8px)' }}
                              />
                            )}

                            {/* Outer Aluminum Frame */}
                            <rect 
                              x="25" 
                              y="20" 
                              width="130" 
                              height="70" 
                              fill="none" 
                              stroke={finishStyles.bg} 
                              strokeWidth="16" 
                            />
                            <rect 
                              x="25" 
                              y="20" 
                              width="130" 
                              height="70" 
                              fill="none" 
                              stroke={finishStyles.border} 
                              strokeWidth="16" 
                              strokeDasharray="2,8"
                            />

                            {/* Light Lens */}
                            <rect 
                              x="25" 
                              y="20" 
                              width="130" 
                              height="70" 
                              fill="none" 
                              stroke={isLightOn ? cctStyles.hex : '#333'} 
                              strokeWidth="6" 
                              opacity={isLightOn ? (0.4 + (dimLevel / 100) * 0.6) : 0.3}
                              style={{ 
                                filter: isLightOn ? `drop-shadow(0 0 6px ${cctStyles.glow})` : 'none' 
                              }}
                            />

                            {/* Miter Joint 45° Lines at Corners */}
                            <line x1="17" y1="12" x2="33" y2="28" stroke="#FFF" strokeWidth="0.8" opacity="0.4" />
                            <line x1="147" y1="28" x2="163" y2="12" stroke="#FFF" strokeWidth="0.8" opacity="0.4" />
                            <line x1="17" y1="98" x2="33" y2="82" stroke="#FFF" strokeWidth="0.8" opacity="0.4" />
                            <line x1="147" y1="82" x2="163" y2="98" stroke="#FFF" strokeWidth="0.8" opacity="0.4" />

                            {/* Dimension Callout */}
                            <text x="90" y="12" fill="#FFD21A" fontSize="9" textAnchor="middle" fontFamily="monospace">
                              {Math.round(config.length * 0.6)} mm
                            </text>
                            <text x="170" y="58" fill="#FFD21A" fontSize="9" textAnchor="middle" fontFamily="monospace" transform="rotate(90, 170, 58)">
                              {Math.round(config.length * 0.4)} mm
                            </text>
                          </svg>
                        </div>
                      )}

                    </div>
                  )}

                  {/* VIEW MODE 2: 3D Isometric View */}
                  {viewMode === '3d' && (
                    <div className="w-full flex items-center justify-center">
                      <svg viewBox="0 0 240 140" className="w-64 h-40">
                        {/* 3D Extruded Linear Profile Isometric Projection */}
                        {shape === 'straight' && (
                          <g transform="translate(30, 30)">
                            {/* Suspension wires */}
                            {config.mounting === 'suspended' && (
                              <>
                                <line x1="20" y1="10" x2="20" y2="-20" stroke="#777" strokeWidth="1" />
                                <line x1="160" y1="10" x2="160" y2="-20" stroke="#777" strokeWidth="1" />
                              </>
                            )}

                            {/* Top Face */}
                            <polygon 
                              points="20,10 160,10 180,25 40,25" 
                              fill={finishStyles.bg} 
                              stroke={finishStyles.border} 
                              strokeWidth="1" 
                            />

                            {/* Front Face (Housing) */}
                            <polygon 
                              points="20,10 20,40 40,55 40,25" 
                              fill={finishStyles.accent} 
                              stroke={finishStyles.border} 
                              strokeWidth="1" 
                            />

                            {/* Side Long Face */}
                            <polygon 
                              points="40,25 180,25 180,55 40,55" 
                              fill={finishStyles.bg} 
                              stroke={finishStyles.border} 
                              strokeWidth="1" 
                            />

                            {/* Bottom Light Aperture Face */}
                            <polygon 
                              points="40,55 180,55 160,65 20,65" 
                              fill={isLightOn ? cctStyles.hex : '#222'} 
                              stroke={finishStyles.border} 
                              strokeWidth="1" 
                              opacity={isLightOn ? 0.9 : 0.3}
                              style={{ filter: isLightOn ? `drop-shadow(0 4px 10px ${cctStyles.glow})` : 'none' }}
                            />

                            {/* End Cap Detail */}
                            <line x1="20" y1="10" x2="20" y2="40" stroke="#FFF" strokeWidth="1" opacity="0.3" />
                            <text x="100" y="44" fill="#FFF" fontSize="8" opacity="0.5" fontFamily="monospace">ECOLIFE {profileInfo.name}</text>
                          </g>
                        )}

                        {shape === 'l-corner' && (
                          <g transform="translate(40, 20)">
                            {/* L-Shape 3D Isometric */}
                            <path 
                              d="M 10 20 L 110 20 L 110 90 L 90 90 L 90 40 L 10 40 Z" 
                              fill={finishStyles.bg} 
                              stroke={finishStyles.border} 
                              strokeWidth="1.5"
                            />
                            <path 
                              d="M 15 25 L 105 25 L 105 85 L 95 85 L 95 35 L 15 35 Z" 
                              fill={isLightOn ? cctStyles.hex : '#333'} 
                              opacity={isLightOn ? 0.9 : 0.3}
                              style={{ filter: isLightOn ? `drop-shadow(0 2px 8px ${cctStyles.glow})` : 'none' }}
                            />
                          </g>
                        )}

                        {shape === 'rectangle' && (
                          <g transform="translate(30, 20)">
                            {/* Rectangle 3D Frame */}
                            <polygon points="20,10 160,10 180,25 40,25" fill={finishStyles.bg} stroke={finishStyles.border} />
                            <polygon points="40,25 180,25 180,85 40,85" fill={finishStyles.accent} stroke={finishStyles.border} />
                            <rect x="55" y="38" width="110" height="35" fill="#07080A" stroke={finishStyles.border} />
                            {isLightOn && (
                              <rect x="50" y="34" width="120" height="43" fill="none" stroke={cctStyles.hex} strokeWidth="3" opacity="0.9" style={{ filter: `drop-shadow(0 0 8px ${cctStyles.glow})` }} />
                            )}
                          </g>
                        )}
                      </svg>
                    </div>
                  )}

                  {/* VIEW MODE 3: Beam Effect / Room Ambience */}
                  {viewMode === 'effect' && (
                    <div className="w-full flex flex-col items-center justify-center">
                      <div className="w-4/5 flex flex-col items-center">
                        {/* Luminaire Bar */}
                        <div 
                          className="w-full h-4 rounded-sm"
                          style={{ 
                            backgroundColor: finishStyles.bg,
                            border: `1px solid ${finishStyles.border}` 
                          }}
                        />
                        {/* Volumetric Light Beam Wash */}
                        <div 
                          className="w-full h-32 transition-all duration-300"
                          style={{
                            background: isLightOn 
                              ? `radial-gradient(ellipse at top, ${cctStyles.glow} 0%, ${cctStyles.softGlow} 40%, transparent 75%)`
                              : 'transparent',
                            opacity: (dimLevel / 100)
                          }}
                        />
                        {/* Floor Light Pool */}
                        {isLightOn && (
                          <div 
                            className="w-[110%] h-6 rounded-full -mt-3 blur-md transition-all duration-300"
                            style={{ 
                              backgroundColor: cctStyles.hex,
                              opacity: (dimLevel / 100) * 0.6
                            }}
                          />
                        )}
                      </div>
                    </div>
                  )}

                </div>

                {/* Bottom Studio Controls: Light Switch & Dimmer Bar */}
                <div className="relative z-10 w-full pt-2 border-t border-white/10 flex items-center justify-between gap-3 text-xs">
                  
                  {/* Light Power Toggle */}
                  <button
                    onClick={() => setIsLightOn(!isLightOn)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      isLightOn 
                        ? 'border-[#FFD21A] bg-[#FFD21A]/20 text-[#FFD21A]' 
                        : 'border-white/10 bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{isLightOn ? 'LIGHT ON' : 'LIGHT OFF'}</span>
                  </button>

                  {/* Dimming Slider */}
                  {isLightOn && (
                    <div className="flex items-center gap-2 flex-1 max-w-[190px]">
                      <SunMedium className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={dimLevel}
                        onChange={(e) => setDimLevel(Number(e.target.value))}
                        className="w-full h-1.5 bg-[#18191E] rounded-lg appearance-none cursor-pointer accent-[#FFD21A]"
                      />
                      <span className="font-mono text-[10px] text-[#FFD21A] w-7 text-right">{dimLevel}%</span>
                    </div>
                  )}

                  {/* Floating Measurement Stamp */}
                  <div className="text-[10px] font-mono bg-black/80 px-2 py-1 rounded border border-white/10 text-gray-300 flex-shrink-0">
                    {config.length}mm • {config.cct.toUpperCase()}
                  </div>
                </div>

              </div>

              {/* Technical Realtime Metrics Display */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-3 bg-black/40 border border-white/5 rounded-xl">
                  <div className="text-gray-400 text-[10px] uppercase">{t.configurator.metricPower}</div>
                  <div className="text-white font-mono font-bold mt-1 text-sm">{totalWatts} W</div>
                </div>
                <div className="p-3 bg-black/40 border border-white/5 rounded-xl">
                  <div className="text-gray-400 text-[10px] uppercase">{t.configurator.metricLumen}</div>
                  <div className="text-white font-mono font-bold mt-1 text-sm">~{totalLumens} lm</div>
                </div>
                <div className="p-3 bg-black/40 border border-white/5 rounded-xl">
                  <div className="text-gray-400 text-[10px] uppercase">{t.configurator.metricUgr}</div>
                  <div className="text-[#FFD21A] font-mono font-bold mt-1 text-sm">{estimatedUGR}</div>
                </div>
              </div>

              {/* Primary Action Button: Request Quotation */}
              <div className="pt-2">
                <button
                  onClick={handleInquiry}
                  className="w-full flex items-center justify-center gap-2 bg-[#FFD21A] text-black font-bold text-xs uppercase tracking-wider py-4 rounded-xl hover:bg-[#F0C413] transition-all shadow-[0_0_25px_rgba(255,210,26,0.3)] hover:scale-[1.01]"
                >
                  <Send className="w-4 h-4" />
                  <span>{t.configurator.sendInquiry}</span>
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
