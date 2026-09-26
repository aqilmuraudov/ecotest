import React, { useState } from 'react';
import { Language } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, Eye, Shield, CheckCircle2, ChevronRight, Sliders } from 'lucide-react';

interface ExplodedProfileViewerProps {
  currentLang: Language;
}

interface ProfileLayer {
  id: string;
  name: { az: string; en: string; ru: string };
  material: { az: string; en: string; ru: string };
  spec: { az: string; en: string; ru: string };
  offsetY: number;
  color: string;
}

const LAYERS_DATA: ProfileLayer[] = [
  {
    id: 'diffuser',
    name: { az: 'Mikro-Prizmatik PMMA Diffuzor', en: 'Microprismatic PMMA Diffuser', ru: 'Микропризматический PMMA рассеиватель' },
    material: { az: 'Optik Polikarbonat (Saralmayan)', en: 'Non-yellowing optical grade PMMA', ru: 'Оптический поликарбонат' },
    spec: { az: 'UGR <16, Parıltısız bərabər yayılma, 89% işıq keçiriciliyi', en: 'UGR <16 glare suppression, 89% transmission', ru: 'UGR <16, 89% светопропускание' },
    offsetY: -55,
    color: '#F4F4F2'
  },
  {
    id: 'pcb',
    name: { az: 'Alüminium Əsaslı LED PCB Platalar', en: 'Constant-Current MCPCB LED Board', ru: 'Алюминиевая плата MCPCB со светодиодами' },
    material: { az: 'SMD 2835 Sanan/Epistar (120 LED/m)', en: 'SMD 2835 High-density diodes (120/m)', ru: 'Светодиоды SMD 2835 высокой плотности' },
    spec: { az: 'CRI >95 (R9 >85), 24V DC sabit gərginlik, 3-Step MacAdam', en: 'CRI >95, 24V DC constant voltage, 3-step MacAdam', ru: 'CRI >95, 24V DC, шаг МакАдама 3' },
    offsetY: -15,
    color: '#FFD21A'
  },
  {
    id: 'housing',
    name: { az: '6063-T5 Ekstruziya Alüminium Gövdə', en: '6063-T5 Extruded Aluminium Housing', ru: 'Корпус из экструдированного алюминия 6063-T5' },
    material: { az: 'Qara Anodlaşdırılmış / Toz Boyalı (RAL)', en: 'Black Anodized / Powder Coated (RAL)', ru: 'Анодированный / порошковая покраска' },
    spec: { az: '40 × 70 mm profil, passiv soyutma kanalı, 50 metrədək kəsiksiz birləşmə', en: '40 × 70 mm dimension, thermal cooling sink', ru: 'Профиль 40х70 мм, пассивный теплоотвод' },
    offsetY: 25,
    color: '#2A2E38'
  },
  {
    id: 'mounting',
    name: { az: 'Gömülmüş & Asma Bərkidici Mexanizm', en: 'Quick-Lock Suspension & Mounting Clips', ru: 'Система быстрого подвеса и крепления' },
    material: { az: 'Paslanmaz Polad & Neodim Maqnitlər', en: 'Stainless Steel & Neodymium Magnets', ru: 'Нержавеющая сталь и магниты' },
    spec: { az: 'Alətsiz montaj, hündürlüyü tənzimlənən 1.5m polad troslar', en: 'Tool-free clip locking, adjustable 1.5m wire kit', ru: 'Безинструментальный монтаж, регулируемые тросы' },
    offsetY: 65,
    color: '#555C6B'
  }
];

export const ExplodedProfileViewer: React.FC<ExplodedProfileViewerProps> = ({ currentLang }) => {
  const [isExploded, setIsExploded] = useState<boolean>(true);
  const [activeLayerId, setActiveLayerId] = useState<string>('diffuser');

  const activeLayer = LAYERS_DATA.find(l => l.id === activeLayerId) || LAYERS_DATA[0];

  return (
    <div className="w-full bg-[#0E1013] border border-white/10 p-6 lg:p-10 relative overflow-hidden">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 hairline-b gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-[#FFD21A] uppercase mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>MÜHƏNDİS KƏSİYİ // DIGITAL TWIN EXTRUSION</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white">
            {currentLang === 'az' ? 'Ecolife Linear 40 Daxili Qatları' : currentLang === 'ru' ? 'Внутреннее строение Linear 40' : 'Linear 40 Extrusion Layers'}
          </h3>
        </div>

        {/* View Mode Toggle: Assembled vs Exploded */}
        <div className="flex items-center gap-1 p-1 bg-[#08090A] border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setIsExploded(false)}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all ${
              !isExploded 
                ? 'bg-white/10 text-white font-bold' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {currentLang === 'az' ? 'Yığılmış (0°)' : currentLang === 'ru' ? 'В сборе' : 'Assembled'}
          </button>
          <button
            onClick={() => setIsExploded(true)}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all ${
              isExploded 
                ? 'bg-[#FFD21A] text-black font-bold shadow-[0_0_15px_rgba(255,210,26,0.3)]' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {currentLang === 'az' ? 'Ayrılmış Qatlar' : currentLang === 'ru' ? 'Взрыв-схема' : 'Exploded View'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Visual 3D/Isometric Layer Representation */}
        <div className="lg:col-span-7 relative h-[360px] sm:h-[420px] bg-[#08090A] border border-white/10 flex items-center justify-center overflow-hidden p-6">
          <div className="absolute inset-0 architectural-grid opacity-25" />

          {/* Dimension Gridlines */}
          <div className="absolute top-4 left-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
            PROFIL KƏSİYİ: 40 × 70 MM · ALLOY 6063-T5
          </div>
          <div className="absolute bottom-4 right-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
            EN 12464-1 & CE CERTIFIED
          </div>

          {/* Central Layer Canvas with dynamic Isometric projection */}
          <div className="relative w-full max-w-md h-64 flex flex-col items-center justify-center">
            {LAYERS_DATA.map((layer, idx) => {
              const isActive = activeLayerId === layer.id;
              const yOffset = isExploded ? layer.offsetY * 1.8 : 0;
              const scale = isExploded && isActive ? 1.05 : 1;

              return (
                <motion.div
                  key={layer.id}
                  animate={{ 
                    y: yOffset,
                    scale: scale,
                    opacity: isExploded && !isActive ? 0.75 : 1
                  }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => setActiveLayerId(layer.id)}
                  className={`absolute w-4/5 h-12 cursor-pointer transition-shadow rounded-sm flex items-center justify-between px-4 border ${
                    isActive 
                      ? 'border-[#FFD21A] shadow-[0_0_25px_rgba(255,210,26,0.2)] z-30' 
                      : 'border-white/10 hover:border-white/30 z-10'
                  }`}
                  style={{
                    backgroundColor: layer.id === 'pcb' 
                      ? '#101114' 
                      : layer.id === 'diffuser' 
                      ? '#F8F9FA' 
                      : layer.id === 'housing'
                      ? '#181A20'
                      : '#252932',
                    color: layer.id === 'diffuser' ? '#0F172A' : '#FFFFFF',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span 
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: layer.color }}
                    />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider">
                      {layer.name[currentLang]}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono opacity-60 uppercase">
                    0{idx + 1}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right: Technical Inspector for the Selected Layer */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-[#14161B] border border-white/10 relative">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-[#FFD21A] mb-2">
              <span>DETAL İNSPEKTORU</span>
              <span>LAYER_0{LAYERS_DATA.findIndex(l => l.id === activeLayerId) + 1}</span>
            </div>

            <h4 className="text-lg font-bold text-white uppercase tracking-tight mb-2">
              {activeLayer.name[currentLang]}
            </h4>

            <div className="space-y-4 text-xs pt-3 hairline-t">
              <div>
                <span className="text-gray-400 block text-[11px] font-mono uppercase">
                  {currentLang === 'az' ? 'Material Tərkibi' : currentLang === 'ru' ? 'Состав материала' : 'Material Composition'}
                </span>
                <span className="text-white font-medium text-sm mt-0.5 block">
                  {activeLayer.material[currentLang]}
                </span>
              </div>

              <div>
                <span className="text-gray-400 block text-[11px] font-mono uppercase">
                  {currentLang === 'az' ? 'Mühəndislik Spesifikasiyası' : currentLang === 'ru' ? 'Инженерные параметры' : 'Engineering Specification'}
                </span>
                <span className="text-gray-300 leading-relaxed block mt-0.5">
                  {activeLayer.spec[currentLang]}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Layer Switchers */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 block">
              {currentLang === 'az' ? 'QAT SEÇİMİ VƏ TƏHLİL:' : currentLang === 'ru' ? 'ВЫБОР СЛОЯ ДЛЯ АНАЛИЗА:' : 'SELECT LAYER TO INSPECT:'}
            </span>
            <div className="grid grid-cols-2 gap-2">
              {LAYERS_DATA.map((l, idx) => (
                <button
                  key={l.id}
                  onClick={() => {
                    setActiveLayerId(l.id);
                    setIsExploded(true);
                  }}
                  className={`p-2.5 text-left text-xs font-mono transition-all border ${
                    activeLayerId === l.id 
                      ? 'border-[#FFD21A] bg-[#14161B] text-white' 
                      : 'border-white/5 bg-[#08090A] text-gray-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <span className="text-[10px] text-[#FFD21A] block">0{idx + 1}.</span>
                  <span className="truncate block font-semibold">{l.name[currentLang]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
