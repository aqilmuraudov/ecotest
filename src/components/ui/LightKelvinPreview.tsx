import React, { useState } from 'react';
import { Language } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Check, Sparkles, Sliders } from 'lucide-react';

interface LightKelvinPreviewProps {
  currentLang: Language;
}

interface KelvinPreset {
  kelvin: number;
  label: { az: string; en: string; ru: string };
  atmosphere: { az: string; en: string; ru: string };
  colorHex: string;
  glowRgba: string;
  cri: string;
  typicalUse: { az: string; en: string; ru: string };
}

const KELVIN_PRESETS: KelvinPreset[] = [
  {
    kelvin: 2700,
    label: { az: '2700K İsti Ağ', en: '2700K Warm White', ru: '2700K Теплый белый' },
    atmosphere: { 
      az: 'Kamer mühit, dincəlmə və rahatlıq. Taxta və təbii teksturaları dərinləşdirir.', 
      en: 'Intimate, warm residential ambiance. Accentuates raw timber and natural stone.', 
      ru: 'Уютная атмосфера отдыха. Подчеркивает текстуру дерева и камня.' 
    },
    colorHex: '#FFB356',
    glowRgba: 'rgba(255, 179, 86, 0.45)',
    cri: 'Ra > 97',
    typicalUse: { az: 'Lüks Villalar, Restoranlar, Otel Qonaq Zonaları', en: 'Luxury Residences, Dining & Hospitality', ru: 'Виллы, рестораны, отели' }
  },
  {
    kelvin: 3000,
    label: { az: '3000K Ecolife İmzası', en: '3000K Ecolife Signature', ru: '3000K Фирменный нейтрально-теплый' },
    atmosphere: { 
      az: 'Mükəmməl balans. Memarlıq detalları və insan dəri tonu üçün qüsursuz işıq.', 
      en: 'The architectural gold standard. Optimal balance for human skin tones & finishes.', 
      ru: 'Архитектурный стандарт. Идеальный баланс для материалов и тонов.' 
    },
    colorHex: '#FFD21A',
    glowRgba: 'rgba(255, 210, 26, 0.45)',
    cri: 'Ra > 98',
    typicalUse: { az: 'Müasir İnteryerlər, Butiklər, İncəsənət Məkanları', en: 'Galleries, Flagship Stores, Architecture Studios', ru: 'Галереи, бутики, студии' }
  },
  {
    kelvin: 4000,
    label: { az: '4000K Neytral Gün İşığı', en: '4000K Crisp Neutral', ru: '4000K Нейтральный дневной' },
    atmosphere: { 
      az: 'Yüksək görmə dəqiqliyi və konsentrasiya. EN 12464-1 standartlarına tam uyğundur.', 
      en: 'High visual acuity and focus. EN 12464-1 compliant task lighting.', 
      ru: 'Четкость и концентрация внимания. Соответствует нормам офисного освещения.' 
    },
    colorHex: '#F6F3EB',
    glowRgba: 'rgba(246, 243, 235, 0.35)',
    cri: 'Ra > 95',
    typicalUse: { az: 'Biznes Mərkəzləri, Konfrans Zalları, Laboratoriyalar', en: 'Corporate Offices, Boardrooms, Financial Hubs', ru: 'Офисы, конференц-залы' }
  },
  {
    kelvin: 6500,
    label: { az: '6500K Təmiz Soyuq Gün', en: '6500K Pure Daylight', ru: '6500K Холодный дневной' },
    atmosphere: { 
      az: 'Maksimum kontrast və cərrahi / laborator dəqiqlik. Qüsursuz rəng testləri.', 
      en: 'High-contrast precision spectrum. Emulates clear open noon sky.', 
      ru: 'Максимальный контраст и точность для лабораторий и студий.' 
    },
    colorHex: '#DCE8FF',
    glowRgba: 'rgba(220, 232, 255, 0.35)',
    cri: 'Ra > 94',
    typicalUse: { az: 'Tibb Mərkəzləri, Dəqiq İstehsalat, Dizayn Studiyaları', en: 'Medical Facilities, Precision Drafting Labs', ru: 'Медицинские центры, лаборатории' }
  }
];

export const LightKelvinPreview: React.FC<LightKelvinPreviewProps> = ({ currentLang }) => {
  const [selectedKelvin, setSelectedKelvin] = useState<number>(3000);
  const activePreset = KELVIN_PRESETS.find(p => p.kelvin === selectedKelvin) || KELVIN_PRESETS[1];

  return (
    <div className="w-full bg-[#0E1013] border border-white/10 p-6 lg:p-8 relative overflow-hidden">
      {/* Drafting Axes Markers */}
      <div className="flex items-center justify-between text-[11px] font-mono tracking-widest text-[#8E929B] uppercase hairline-b pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#FFD21A] inline-block" />
          <span>FOTOMETRİK SPEKTRUM // CCT INSTRUMENT</span>
        </div>
        <div className="tabular-nums">
          INDEX: {selectedKelvin}K · CRI {activePreset.cri}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Interactive Luminaire Cross-Section & Emitted Beam Visual */}
        <div className="lg:col-span-6 relative aspect-[16/10] bg-[#08090A] border border-white/10 overflow-hidden flex flex-col items-center justify-center p-6">
          {/* Subtle architectural wall texture */}
          <div className="absolute inset-0 architectural-grid opacity-20" />
          
          {/* Dynamic Light Beam Emitter simulating downward luminaire dispersion */}
          <motion.div 
            animate={{ 
              backgroundColor: activePreset.colorHex,
              boxShadow: `0 0 60px 20px ${activePreset.glowRgba}, 0 20px 100px 40px ${activePreset.glowRgba}` 
            }}
            transition={{ duration: 0.4 }}
            className="w-4/5 h-[3px] absolute top-8 rounded-full z-10"
          />

          {/* Optical Beam Projection Angle */}
          <motion.div 
            animate={{ 
              background: `radial-gradient(ellipse at 50% 0%, ${activePreset.glowRgba} 0%, rgba(0,0,0,0) 70%)` 
            }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 pointer-events-none z-0"
          />

          {/* Architectural Space Vignette with Light Falloff */}
          <div className="relative z-10 w-full max-w-sm border border-white/10 bg-[#14161B]/80 p-5 mt-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3 text-[10px] font-mono uppercase tracking-wider text-gray-400">
              <span>SƏTHİN İŞIQLANMASI</span>
              <span className="text-white font-bold tabular-nums">~680 LUX</span>
            </div>
            
            {/* Architectural Profile Silhouette Cross-Section (40x70mm) */}
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-16 border-2 border-white/40 bg-black flex flex-col justify-end p-1 transition-colors duration-300"
                style={{ borderColor: activePreset.colorHex }}
              >
                <div 
                  className="w-full h-3 transition-colors duration-300 shadow-sm"
                  style={{ backgroundColor: activePreset.colorHex }}
                />
              </div>
              
              <div className="flex-1 space-y-1 text-xs">
                <div className="font-mono text-white font-bold text-sm">
                  {selectedKelvin} KELVIN
                </div>
                <div className="text-[11px] text-gray-400">
                  {activePreset.typicalUse[currentLang]}
                </div>
                <div className="text-[10px] font-mono text-[#FFD21A]">
                  XROMATİK DƏQİQLİK: {activePreset.cri}
                </div>
              </div>
            </div>
          </div>

          {/* Drafting Dimensions Overlay */}
          <div className="absolute bottom-3 left-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
            BEAM ANGLE: 110° · UGR &lt;16
          </div>
        </div>

        {/* Right: Technical Preset Selectors & Architectural Atmosphere */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#FFD21A] block mb-1">
              {currentLang === 'az' ? 'RƏNG TEMPERATURU TƏNZİMLƏNMƏSİ' : currentLang === 'ru' ? 'РЕГУЛИРОВКА ТЕМПЕРАТУРЫ СВЕТА' : 'COLOR TEMPERATURE TUNING'}
            </span>
            <h4 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white">
              {activePreset.label[currentLang]}
            </h4>
            <p className="text-xs sm:text-sm text-gray-400 mt-2 leading-relaxed">
              {activePreset.atmosphere[currentLang]}
            </p>
          </div>

          {/* 4 Interactive Selector Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {KELVIN_PRESETS.map((preset) => {
              const isSelected = preset.kelvin === selectedKelvin;
              return (
                <button
                  key={preset.kelvin}
                  onClick={() => setSelectedKelvin(preset.kelvin)}
                  className={`p-3 text-left border transition-all relative ${
                    isSelected 
                      ? 'border-[#FFD21A] bg-[#14161B] text-white shadow-[0_0_20px_rgba(255,210,26,0.15)]' 
                      : 'border-white/10 bg-[#08090A] text-gray-400 hover:border-white/30 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span 
                      className="w-3 h-3 rounded-full inline-block border border-white/20"
                      style={{ backgroundColor: preset.colorHex }}
                    />
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#FFD21A]" />}
                  </div>
                  <div className="text-sm font-bold font-mono tracking-tight text-white tabular-nums">
                    {preset.kelvin}K
                  </div>
                  <div className="text-[10px] font-mono text-gray-500 uppercase mt-0.5">
                    {preset.cri}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Technical Dialux & Photometric Guarantee */}
          <div className="p-4 bg-[#08090A] border border-white/5 flex items-start gap-3 text-xs text-gray-400">
            <Sparkles className="w-4 h-4 text-[#FFD21A] flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-white font-medium block">
                {currentLang === 'az' ? 'Tunable White & DALI-2 DT8 Dəstəyi' : currentLang === 'ru' ? 'Поддержка Tunable White и DALI-2 DT8' : 'Tunable White & DALI-2 DT8 Architecture'}
              </span>
              <span className="text-[11px] text-gray-400">
                {currentLang === 'az' 
                  ? 'Bütün xətti sistemlər sirkadiyan ritmə uyğun olaraq günün saatlarına görə avtomatik spektr keçidi təmin edən ağıllı sensorlarla təchiz edilə bilər.'
                  : currentLang === 'ru'
                  ? 'Все линейные системы поддерживают суточные биодинамические сценарии с автоматической сменой температуры.'
                  : 'Circadian rhythm synchronization supported through intelligent DALI-2 protocols for human-centric architectural lighting.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
