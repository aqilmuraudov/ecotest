import { Product } from '../types';
import { ecolifeAllProducts } from './ecolifeAllProducts';

export const flagshipProducts: Product[] = [
  {
    id: 'linear-40',
    slug: 'linear-40',
    name: 'ECOLIFE LINEAR 40 CONTINUOUS',
    category: 'linear-profiles',
    categories: ['linear-profiles', 'led-profiles'],
    categoryName: {
      az: 'Xətti Profillər',
      en: 'Linear Profiles',
      ru: 'Линейные профили'
    },
    categoryNames: [
      { az: 'Xətti Profillər', en: 'Linear Profiles', ru: 'Линейные профили' },
      { az: 'LED Profillər', en: 'LED Profiles', ru: 'LED Профили' }
    ],
    subtitle: {
      az: 'Davamlı xətt birləşməli, yüksək lümenli alüminium profil',
      en: 'Continuous run architectural aluminium extrusion system',
      ru: 'Непрерывная линейная архитектурная система из анодированного алюминия'
    },
    code: 'ECL-LIN-040',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'
    ],
    description: {
      az: 'Müasir memarlıq layihələri üçün hazırlanmış LINEAR 40 sistemi tavan boyunca qaranlıq kəsik olmadan 50 metrədək davamlı xətt formalaşdırmağa imkan verir. 6063-T5 termik emal olunmuş alüminium ərintisi, mikro-prizmatik diffuzor və CRI >95 fotometrik göstəricilər yüksək vizual komfort təmin edir.',
      en: 'Engineered for contemporary architectural projects, the LINEAR 40 system creates seamless continuous illumination up to 50 meters without shadow breaks. 6063-T5 heat-treated extruded aluminium housing, micro-prismatic diffuser, and CRI >95 color fidelity guarantee superior visual comfort.',
      ru: 'Разработанная для современной архитектуры система LINEAR 40 формирует непрерывные световые линии длиной до 50 метров без темных стыков. Алюминиевый корпус 6063-T5, микропризматический рассеиватель и CRI >95 обеспечивают безупречный комфорт.'
    },
    specs: {
      material: 'Anodized Aluminium 6063-T5 / PMMA Diffuser',
      dimensions: '40 × 70 mm (En × Hündürlük)',
      length: '1000 / 1500 / 2000 / 3000 mm (Xüsusi kəsim mövcuddur)',
      ipRating: 'IP40 (IP54 opsional)',
      mounting: 'Asma (Pendant) / Səthə (Surface) / Gömülmüş (Recessed)',
      power: '24W/m - 38W/m (Tənzimlənən)',
      cct: '2700K / 3000K / 4000K / Tunable White',
      cri: 'Ra > 95 (R9 > 85)',
      lumen: '2800 Lm/m',
      voltage: '24V DC / 220-240V AC Driver',
      beamAngle: '110° Diffused / 80° Microprismatic',
      ugr: '< 16 (EN 12464-1 uyğun)',
      lifespan: '> 60,000 Saat (L80B10)',
      dimmable: 'DALI-2 / 0-10V / PUSH-DIM / TRIAC',
      warranty: '5 İl Rəsmi İstehsalçı Zəmanəti'
    },
    files: [
      { name: 'Ecolife LINEAR 40 IES Photometry', type: 'IES', size: '1.4 MB' },
      { name: 'LINEAR 40 Technical Datasheet (PDF)', type: 'PDF', size: '3.2 MB' },
      { name: 'BIM / Revit & CAD Çizgiləri (DWG)', type: 'CAD', size: '8.5 MB' }
    ],
    featured: true,
    isNew: false,
    applications: ['Biznes Mərkəzləri', 'Konfrans Zalları', 'Ticarət Mərkəzləri', 'Premium Yaşayış Məkanları']
  },
  {
    id: 'ultra-rail-48v',
    slug: 'ultra-rail-48v',
    name: 'ECOLIFE ULTRA RAIL 48V MAGNETIC',
    category: 'magnetic-systems',
    categories: ['magnetic-systems', 'track-systems'],
    categoryName: {
      az: 'Maqnit Sistemləri',
      en: 'Magnetic Systems',
      ru: 'Магнитные системы'
    },
    categoryNames: [
      { az: 'Maqnit Sistemləri', en: 'Magnetic Systems', ru: 'Магнитные системы' },
      { az: 'Trek Sistemləri', en: 'Track Systems', ru: 'Трековые системы' }
    ],
    subtitle: {
      az: '48V aşağı gərginlikli inteqrasiya olunmuş maqnit rels sistemi',
      en: '48V low-voltage architectural magnetic track system',
      ru: 'Низковольтная магнитная трековая система 48V с модульными светильниками'
    },
    code: 'ECL-MAG-048',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1558211583-d26f610c1eb1?auto=format&fit=crop&w=1200&q=80'
    ],
    description: {
      az: '48V ULTRA RAIL sistemi bir rels daxilində xətti modullar, fokus spotlar və qaranlıq reflektorlu dördbucaqlı işıqları istənilən an alət istifadə etmədən yerləşdirməyə imkan verir. Qara mat anod örtük relsin tavanda demək olar ki, görünməz qalmasını təmin edir.',
      en: 'The 48V ULTRA RAIL system allows tool-free repositioning of linear diffusers, precision spotlights, and dark-reflector modules along a single extrusion. Deep matte black anodizing keeps the profile practically imperceptible in ceiling slots.',
      ru: 'Система 48V ULTRA RAIL обеспечивает безинструментальную фиксацию линейных, спотовых и антибликовых модулей в одном треке.'
    },
    specs: {
      material: 'Extruded Aluminium Alloy / Copper Busbars',
      dimensions: '26 × 52 mm (Gömülmüş & Asma seçimlər)',
      ipRating: 'IP20',
      mounting: 'Gömülmüş (Trimless Recessed) / Asma (Suspended) / Səthə',
      voltage: '48V DC Təhlükəsiz Aşağı Gərginlik (SELV)',
      cct: '2700K / 3000K / 4000K',
      cri: 'Ra > 97',
      dimmable: 'DALI-2 Broadcast / Zigbee 3.0 / Tuya Smart',
      warranty: '5 İl Zəmanət'
    },
    files: [
      { name: 'ULTRA RAIL 48V Photometry Package', type: 'IES', size: '2.1 MB' },
      { name: 'System Specification Guide (PDF)', type: 'PDF', size: '4.8 MB' }
    ],
    featured: true,
    isNew: true,
    applications: ['İncəsənət Qalereyaları', 'Lüks Butiklər', 'Müasir Villalar', 'Kreativ Studiyalar']
  },
  {
    id: 'recessed-50-trimless',
    slug: 'recessed-50-trimless',
    name: 'ECOLIFE TRIMLESS 50 FLUSH RECESSED',
    category: 'recessed',
    categories: ['recessed', 'linear-profiles'],
    categoryName: {
      az: 'Gömülmüş Sistemlər',
      en: 'Recessed Systems',
      ru: 'Встраиваемые системы'
    },
    subtitle: {
      az: 'Gipsokarton tavanla tam eyni səthdə haşiyəsiz quraşdırma',
      en: 'Flangeless plaster-in seamless linear ceiling extrusion',
      ru: 'Бесщелевой встраиваемый профиль для гипсокартонных потолков'
    },
    code: 'ECL-REC-050',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80'
    ],
    description: {
      az: 'Haşiyəsiz (trimless) qanadları sayəsində gipsokarton tavanla monolit birləşərək sadəcə saf işıq xəttini görünən saxlayır. Tavan boyu uzanan qüsursuz həndəsi xətlər memarlıq məkanına hündürlük və dinamizm qatır.',
      en: 'Perforated trimless wings allow plastering flush to the ceiling edge, leaving only a pure blade of architectural light visible. Creates monumental geometric lines that extend room perspective.',
      ru: 'Перфорированные фланцы встраиваются в гипсокартон заподлицо, оставляя видимой лишь чистую световую линию.'
    },
    specs: {
      material: 'Perforated Extruded Aluminium / Opal Satin PMMA',
      dimensions: '50 × 45 mm (Tavan kəsiyi 52 mm)',
      ipRating: 'IP44',
      mounting: 'Haşiyəsiz Gömülmüş (Trimless Plaster-in)',
      power: '20W/m - 35W/m',
      cct: '3000K / 4000K',
      cri: 'Ra > 95',
      lumen: '2400 Lm/m',
      voltage: '24V DC Constant Voltage',
      warranty: '5 İl Zəmanət'
    },
    files: [
      { name: 'TRIMLESS 50 CAD Installation Detail', type: 'CAD', size: '3.6 MB' },
      { name: 'Datasheet & Photometry (PDF)', type: 'PDF', size: '2.4 MB' }
    ],
    featured: true,
    isNew: false,
    applications: ['Otel Dəhlizləri', 'Qəbul Otaqları', 'Minimalist İnteryerlər', 'Sərgi Məkanları']
  },
  {
    id: 'dark-reflector-10',
    slug: 'dark-reflector-10',
    name: 'ECOLIFE DARK REFLECTOR UGR<10',
    category: 'spot-downlight',
    categories: ['spot-downlight', 'linear-profiles'],
    categoryName: {
      az: 'Spot & Downlight',
      en: 'Spot & Downlight',
      ru: 'Споты и даунлайты'
    },
    subtitle: {
      az: 'Gözü qamaşdırmayan çoxhüceyrəli mikrofokuslu xətti modullar',
      en: 'Deep-recessed anti-glare louvred linear task luminaire',
      ru: 'Антибликовый линейный светильник с глубокими фасеточными ячейками'
    },
    code: 'ECL-DRK-010',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'
    ],
    description: {
      az: 'Xüsusi qara xrom və ya qara mat daxili reflektor hüceyrələri işıq mənbəyini baxış bucağından tamamilə gizlədir. İşıq yalnız iş masasına düşür, UGR <10 dəyəri ilə kompüter ekranlarında heç bir əks olunma yaratmır.',
      en: 'Individual deep specular micro-louvers eliminate glare at direct viewing angles. The luminaire appears dark from the room while projecting high-contrast photometric distribution onto work surfaces (UGR <10).',
      ru: 'Специальные ячеистые антибликовые отражатели полностью скрывают источник света от глаз. UGR <10 исключает блики на экранах.'
    },
    specs: {
      material: 'Die-cast Aluminium & Vacuum Metalized Polycarbonate Louver',
      dimensions: '45 × 55 mm',
      ipRating: 'IP20',
      mounting: 'Asma / Gömülmüş / 48V Trek İnteqrasiyası',
      power: '15W / 30W / 45W',
      cct: '2700K / 3000K / 4000K',
      cri: 'Ra > 98 (Special Architectural Grade)',
      ugr: '< 10 (Gözqamaşdırmayan)',
      beamAngle: '15° / 30° / 45° Dəqiq Şüa',
      warranty: '5 İl Zəmanət'
    },
    files: [
      { name: 'DARK REFLECTOR Dialux Plugin & IES', type: 'IES', size: '1.8 MB' },
      { name: 'Photometric Glare Certificate (PDF)', type: 'PDF', size: '1.9 MB' }
    ],
    featured: true,
    isNew: true,
    applications: ['İdarə Heyəti İclas Zalları', 'Bank Ofisləri', 'Kitabxanalar', 'VIP Məkanlar']
  }
];

// Combine flagship architectural luminaires with all catalog products
export const products: Product[] = [
  ...flagshipProducts,
  ...ecolifeAllProducts.filter(p => !flagshipProducts.some(fp => fp.id === p.id))
];

export const productCategoriesList = [
  { id: 'all', nameAz: 'Hamısı', nameEn: 'All', nameRu: 'Все' },
  { id: 'linear-profiles', nameAz: 'Xətti Profillər', nameEn: 'Linear Profiles', nameRu: 'Линейные профили' },
  { id: 'magnetic-systems', nameAz: 'Maqnit Sistemləri', nameEn: 'Magnetic Systems', nameRu: 'Магнитные системы' },
  { id: 'recessed', nameAz: 'Gömülmüş Profillər', nameEn: 'Recessed Profiles', nameRu: 'Встраиваемые профили' },
  { id: 'spot-downlight', nameAz: 'Spot & Downlight', nameEn: 'Spot & Downlight', nameRu: 'Споты и даунлайты' },
  { id: 'strip-lights', nameAz: 'LED Lentlər', nameEn: 'LED Strips', nameRu: 'Светодиодные ленты' },
  { id: 'track-systems', nameAz: 'Trek Sistemləri', nameEn: 'Track Systems', nameRu: 'Трековые системы' },
  { id: 'drivers', nameAz: 'Qidalandırıcılar (Drivers)', nameEn: 'Power Drivers', nameRu: 'Блоки питания' },
  { id: 'accessories', nameAz: 'Aksesuarlar', nameEn: 'Accessories', nameRu: 'Аксессуары' },
];


