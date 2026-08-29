import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  SunMedium, 
  Sliders, 
  Sparkles, 
  Check, 
  Zap, 
  ShieldCheck, 
  Layers, 
  Activity,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { Language } from '../../types';

interface LedInteractiveShowcaseProps {
  currentLang: Language;
  onOpenContact: () => void;
}

interface CctOption {
  kelvin: number;
  label: Record<Language, string>;
  description: Record<Language, string>;
  hexColor: string;
  glowColor: string;
  roomFilter: string;
  recommendedFor: Record<Language, string>;
}

const cctOptions: CctOption[] = [
  {
    kelvin: 2700,
    label: { az: '2700K İsti Kəhrəba', en: '2700K Warm Amber', ru: '2700K Теплый янтарь' },
    description: { 
      az: 'Yumşaq, sakitləşdirici və komfortlu interyer atmosferi yaradır.', 
      en: 'Creates a relaxing, cozy, and luxurious residential ambiance.', 
      ru: 'Создает расслабляющую, уютную и премиальную атмосферу.' 
    },
    hexColor: '#FF9E3B',
    glowColor: 'rgba(255, 158, 59, 0.45)',
    roomFilter: 'sepia(0.35) saturate(1.4) hue-rotate(-15deg)',
    recommendedFor: { az: 'Restoranlar, Otellər, Lüks Mənzillər', en: 'Restaurants, Hotels, Luxury Homes', ru: 'Рестораны, Отели, Элитное жилье' }
  },
  {
    kelvin: 3000,
    label: { az: '3000K İsti Ağ', en: '3000K Warm White', ru: '3000K Теплый белый' },
    description: { 
      az: 'Müasir memarlıqda ən çox tələb olunan təbii qızılı parlaqlıq.', 
      en: 'Most popular natural golden balance in high-end modern architecture.', 
      ru: 'Самый востребованный естественный баланс в современной архитектуре.' 
    },
    hexColor: '#FFCA6E',
    glowColor: 'rgba(255, 202, 110, 0.45)',
    roomFilter: 'sepia(0.2) saturate(1.2) hue-rotate(-5deg)',
    recommendedFor: { az: 'Qonaq Otaqları, Butiklər, Qalereyalar', en: 'Living Areas, Boutiques, Art Galleries', ru: 'Гостиные, Бутики, Галереи' }
  },
  {
    kelvin: 4000,
    label: { az: '4000K Neytral Ağ', en: '4000K Neutral White', ru: '4000K Нейтральный белый' },
    description: { 
      az: 'Təmiz, diqqəti artıran və günəş işığına ən yaxın dəqiq işıq balansı.', 
      en: 'Crisp, focus-enhancing lighting closely resembling natural noon sunlight.', 
      ru: 'Чистый, повышающий концентрацию свет, близкий к полуденному солнцу.' 
    },
    hexColor: '#FFF1DD',
    glowColor: 'rgba(255, 241, 221, 0.45)',
    roomFilter: 'contrast(1.05) brightness(1.03)',
    recommendedFor: { az: 'Biznes Mərkəzləri, Ofislər, Şou-rumlar', en: 'Business Centers, Modern Offices, Showrooms', ru: 'Бизнес-центры, Офисы, Шоу-румы' }
  },
  {
    kelvin: 6500,
    label: { az: '6500K Soyuq Gün İşığı', en: '6500K Cool Daylight', ru: '6500K Холодный дневной' },
    description: { 
      az: 'Maksimum kontrast və detalların aydın görünməsi üçün peşəkar işıq.', 
      en: 'Maximum optical clarity and high-precision visual task performance.', 
      ru: 'Максимальный оптический контраст и четкость для прецизионных зон.' 
    },
    hexColor: '#D8ECFF',
    glowColor: 'rgba(216, 236, 255, 0.45)',
    roomFilter: 'hue-rotate(15deg) saturate(1.1) brightness(1.05)',
    recommendedFor: { az: 'Klinikalar, Dizayn Studiyaları, Laboratoriyalar', en: 'Clinics, Design Studios, Tech Labs', ru: 'Клиники, Студии дизайна, Лаборатории' }
  }
];

const opticalModes = [
  { id: 'linear_direct', name: { az: 'Asma Xətti İşıq', en: 'Suspended Linear', ru: 'Подвесной линейный' }, angle: '120° Geniş Diffuziya' },
  { id: 'cove_indirect', name: { az: 'Gizli Tavan (Cove)', en: 'Indirect Cove', ru: 'Скрытый карнизный' }, angle: 'Yumşaq Əks-olunma' },
  { id: 'wall_washer', name: { az: 'Divar Yuyucu (Wallwash)', en: 'Wall Washer', ru: 'Заливка стен' }, angle: '30°x60° Asimmetrik' },
  { id: 'magnetic_track', name: { az: 'Maqnit Şin Spot', en: 'Magnetic Track', ru: 'Магнитный трек' }, angle: '24° Fokuslu Şüa' }
];

export const LedInteractiveShowcase: React.FC<LedInteractiveShowcaseProps> = ({
  currentLang,
  onOpenContact
}) => {
  const [selectedKelvin, setSelectedKelvin] = useState<number>(3000);
  const [brightness, setBrightness] = useState<number>(85);
  const [selectedMode, setSelectedMode] = useState<string>('linear_direct');
  const [isPowerOn, setIsPowerOn] = useState<boolean>(true);

  const currentCct = cctOptions.find(c => c.kelvin === selectedKelvin) || cctOptions[1];
  
  // Simulated optical metrics
  const calculatedLumens = isPowerOn ? Math.round(2800 * (brightness / 100)) : 0;
  const calculatedWatts = isPowerOn ? (24 * (brightness / 100)).toFixed(1) : '0.0';
  const effectiveBrightness = isPowerOn ? brightness / 100 : 0.05;

  return (
    <div className="w-full bg-[#0E1015] border border-white/10 rounded-2xl lg:rounded-3xl p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.6)]">
      
      {/* Background Architectural Ambient Glow based on selected Kelvin */}
      <div 
        className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none transition-all duration-700 opacity-60"
        style={{
          backgroundColor: isPowerOn ? currentCct.hexColor : 'transparent',
          opacity: isPowerOn ? (brightness / 100) * 0.25 : 0
        }}
      />

      {/* Header of the Showcase */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/10 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD21A]/10 border border-[#FFD21A]/30 text-[#FFD21A] text-xs font-bold uppercase tracking-wider mb-3">
            <SunMedium className="w-3.5 h-3.5 animate-pulse" />
            <span>
              {currentLang === 'az' ? 'İnteraktiv LED İşıq Simulyatoru' : currentLang === 'ru' ? 'Интерактивный LED Симулятор' : 'Interactive LED Light Studio'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white uppercase tracking-tight">
            {currentLang === 'az' ? 'İşıq Temperaturu və Dimmer Tənzimləyicisi' : currentLang === 'ru' ? 'Управление Цветовой Температурой и Диммированием' : 'Color Temperature & Dimming Studio'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-xl">
            {currentLang === 'az' 
              ? 'Ecolife LED profillərinin real interyerdə işıq təsirini, spektrini və gücünü dərhal test edin.'
              : currentLang === 'ru'
              ? 'Проверьте влияние цветовой температуры и мощности профилей Ecolife на интерьер в реальном времени.'
              : 'Experience the real-time optical effect, CCT Kelvin spectrum, and dimming behavior of Ecolife LED luminaires.'}
          </p>
        </div>

        {/* Master Power Switch */}
        <div className="flex items-center gap-3 bg-black/50 border border-white/10 p-2 rounded-xl backdrop-blur-md self-start md:self-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-300 pl-2">
            {currentLang === 'az' ? 'LED Gücü' : currentLang === 'ru' ? 'Питание' : 'LED Power'}
          </span>
          <button
            onClick={() => setIsPowerOn(!isPowerOn)}
            className={`px-4 py-2 rounded-lg font-extrabold text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
              isPowerOn 
                ? 'bg-[#FFD21A] text-black shadow-[0_0_20px_rgba(255,210,26,0.4)]' 
                : 'bg-white/10 text-gray-400 hover:bg-white/20'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isPowerOn ? 'bg-black animate-ping' : 'bg-gray-500'}`} />
            <span>{isPowerOn ? 'ON (Aktiv)' : 'OFF (Sönük)'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Controls, Right Realtime Visual Room Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-8 relative z-10 items-stretch">
        
        {/* Left Column: Interactive Controls */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          
          {/* 1. CCT Kelvin Spectrum Buttons */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center justify-between">
              <span>{currentLang === 'az' ? '1. Rəng Temperaturu (Kelvin CCT)' : currentLang === 'ru' ? '1. Цветовая Температура (Kelvin)' : '1. Color Temperature (CCT)'}</span>
              <span className="text-[#FFD21A] font-extrabold text-sm">{selectedKelvin}K</span>
            </label>
            
            <div className="grid grid-cols-2 gap-2.5">
              {cctOptions.map((option) => {
                const isSelected = selectedKelvin === option.kelvin;
                return (
                  <button
                    key={option.kelvin}
                    onClick={() => {
                      setSelectedKelvin(option.kelvin);
                      if (!isPowerOn) setIsPowerOn(true);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all duration-300 relative overflow-hidden group ${
                      isSelected
                        ? 'border-[#FFD21A] bg-black/60 shadow-[0_0_20px_rgba(255,210,26,0.15)]'
                        : 'border-white/10 bg-black/30 hover:border-white/25 hover:bg-black/50'
                    }`}
                  >
                    {/* Glowing Accent Indicator */}
                    <div 
                      className="w-full h-1.5 rounded-full mb-2.5 transition-all duration-300"
                      style={{ 
                        backgroundColor: option.hexColor,
                        boxShadow: isSelected ? `0 0 10px ${option.hexColor}` : 'none'
                      }}
                    />
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>{option.kelvin}K</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#FFD21A]" />}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5 truncate">
                      {option.label[currentLang].split(' ')[1] || option.label[currentLang]}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected CCT Detailed Note */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs text-gray-300">
              <p className="leading-relaxed font-medium text-white mb-1">
                {currentCct.description[currentLang]}
              </p>
              <div className="text-[11px] text-[#FFD21A] flex items-center gap-1.5 pt-1">
                <Sparkles className="w-3 h-3 flex-shrink-0" />
                <span>{currentLang === 'az' ? 'Tövsiyə:' : currentLang === 'ru' ? 'Рекомендовано:' : 'Ideal for:'} {currentCct.recommendedFor[currentLang]}</span>
              </div>
            </div>
          </div>

          {/* 2. Dimmer Slider (0 - 100%) */}
          <div className="space-y-3 bg-black/40 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-300">
              <span className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#FFD21A]" />
                {currentLang === 'az' ? '2. Dimmer / Parlaqlıq' : currentLang === 'ru' ? '2. Диммирование / Яркость' : '2. Dimmer / Brightness'}
              </span>
              <span className="text-sm font-extrabold text-[#FFD21A]">{isPowerOn ? `${brightness}%` : '0%'}</span>
            </div>

            <div className="relative pt-1">
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={brightness}
                disabled={!isPowerOn}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#FFD21A] focus:outline-none disabled:opacity-30"
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-semibold mt-1">
                <span>10% (Gecə rejimi)</span>
                <span>50% (Axşam rahatlıq)</span>
                <span>100% (Maksimum)</span>
              </div>
            </div>
          </div>

          {/* 3. Optical Form Factor */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
              {currentLang === 'az' ? '3. Memarlıq İşıqlandırma Növü' : currentLang === 'ru' ? '3. Тип Светового Профиля' : '3. Luminaire Optical Profile'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {opticalModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`p-2.5 rounded-lg border text-xs font-bold transition-all text-left truncate ${
                    selectedMode === mode.id
                      ? 'border-[#FFD21A] bg-[#FFD21A]/10 text-white'
                      : 'border-white/10 bg-black/20 text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="truncate">{mode.name[currentLang]}</div>
                  <div className="text-[10px] text-[#FFD21A] font-normal mt-0.5">{mode.angle}</div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Real-Time Dynamic Architectural Room Visualizer */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          
          {/* Visual Simulation Canvas */}
          <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden border border-white/15 bg-black shadow-2xl">
            
            {/* Base Room Architecture Image */}
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85"
              alt="Ecolife LED Architectural Room Simulator"
              className="w-full h-full object-cover transition-all duration-700"
              style={{
                filter: isPowerOn 
                  ? `${currentCct.roomFilter} brightness(${0.5 + effectiveBrightness * 0.6})`
                  : 'brightness(0.2) contrast(1.2) grayscale(0.5)'
              }}
            />

            {/* Ceiling Linear LED Glow Strips (Simulated Overhead Profiles) */}
            {isPowerOn && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: effectiveBrightness }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 pointer-events-none"
              >
                {/* Horizontal Overhead Linear LED Profile 1 */}
                <div 
                  className="absolute top-12 left-1/4 right-1/4 h-[3px] rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: '#FFFFFF',
                    boxShadow: `0 0 ${20 * effectiveBrightness}px ${10 * effectiveBrightness}px ${currentCct.hexColor}, 0 0 ${60 * effectiveBrightness}px ${30 * effectiveBrightness}px ${currentCct.hexColor}`
                  }}
                />

                {/* Horizontal Overhead Linear LED Profile 2 */}
                <div 
                  className="absolute top-24 left-1/3 right-12 h-[3px] rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: '#FFFFFF',
                    boxShadow: `0 0 ${15 * effectiveBrightness}px ${8 * effectiveBrightness}px ${currentCct.hexColor}, 0 0 ${45 * effectiveBrightness}px ${20 * effectiveBrightness}px ${currentCct.hexColor}`
                  }}
                />

                {/* Cove Lighting / Wall Wash Light Beam Cascade */}
                <div 
                  className="absolute top-0 left-0 right-0 h-2/3 bg-gradient-to-b from-transparent to-transparent transition-all duration-500"
                  style={{
                    background: `radial-gradient(ellipse at 50% 0%, ${currentCct.glowColor} 0%, transparent 70%)`,
                    opacity: effectiveBrightness * 0.9
                  }}
                />
              </motion.div>
            )}

            {/* Overlay Status Badge */}
            <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 z-10">
              <div className="px-3 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/20 text-xs font-bold text-white flex items-center gap-2">
                <div 
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: isPowerOn ? currentCct.hexColor : '#555' }}
                />
                <span>{isPowerOn ? `${selectedKelvin}K @ ${brightness}%` : 'SİSTEM SÖNÜK'}</span>
              </div>
              <div className="hidden sm:inline-flex px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-gray-300">
                CRI Ra &gt; 97 (Yüksək Rəng Dəqiqliyi)
              </div>
            </div>

            {/* Bottom Floating Telemetry */}
            <div className="absolute bottom-4 inset-x-4 flex items-center justify-between p-3 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 text-white z-10">
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">İşıq Seli</div>
                  <div className="text-sm sm:text-base font-extrabold text-[#FFD21A]">
                    {calculatedLumens} <span className="text-[10px] font-normal text-gray-400">lm / m</span>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Enerji Sərfiyyatı</div>
                  <div className="text-sm sm:text-base font-extrabold text-white">
                    {calculatedWatts} <span className="text-[10px] font-normal text-gray-400">W / m</span>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">İdarəetmə</div>
                  <div className="text-xs font-bold text-gray-300">
                    DALI-2 / 0-10V / TRIAC
                  </div>
                </div>
              </div>

              <button
                onClick={onOpenContact}
                className="px-3.5 py-2 rounded-lg bg-[#FFD21A] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#F0C413] transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,210,26,0.3)] flex-shrink-0"
              >
                <span>{currentLang === 'az' ? 'Layihə üçün sorğu' : currentLang === 'ru' ? 'Запросить расчет' : 'Request Dialux'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 4 Quick Technical Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-black/40 border border-white/10 rounded-xl">
              <div className="text-[10px] uppercase font-bold text-gray-400">Rəng Spektri</div>
              <div className="text-xs sm:text-sm font-extrabold text-[#FFD21A] mt-0.5">CRI &gt; 97</div>
            </div>
            <div className="p-3 bg-black/40 border border-white/10 rounded-xl">
              <div className="text-[10px] uppercase font-bold text-gray-400">MacAdam Pilləsi</div>
              <div className="text-xs sm:text-sm font-extrabold text-white mt-0.5">Step 3 SDCM</div>
            </div>
            <div className="p-3 bg-black/40 border border-white/10 rounded-xl">
              <div className="text-[10px] uppercase font-bold text-gray-400">Göz Qamaşma</div>
              <div className="text-xs sm:text-sm font-extrabold text-white mt-0.5">UGR &lt; 16</div>
            </div>
            <div className="p-3 bg-black/40 border border-white/10 rounded-xl">
              <div className="text-[10px] uppercase font-bold text-gray-400">İstismar Ömrü</div>
              <div className="text-xs sm:text-sm font-extrabold text-[#FFD21A] mt-0.5">L90B10 50,000h</div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
