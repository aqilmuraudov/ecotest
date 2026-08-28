import { Product } from '../types';

export const products: Product[] = [
  {
    id: 'linear-40',
    slug: 'linear-40',
    name: 'LINEAR 40',
    category: 'linear-profiles',
    categoryName: {
      az: 'Xətti Profillər',
      en: 'Linear Profiles',
      ru: 'Линейные профили'
    },
    subtitle: {
      az: 'Xətti LED Profil',
      en: 'Linear LED Profile',
      ru: 'Линейный LED Профиль'
    },
    code: 'ECO-LIN-40',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80'
    ],
    description: {
      az: 'Müxtəlif məkanlarda istifadə üçün ideal xətti LED profil. Minimal dizaynı, yüksək keyfiyyətli materialı və effektiv işıqlandırma parametrləri ilə seçilir. Memarlıq tavanlarında səlis xətlər yaradır.',
      en: 'An ideal linear LED profile engineered for diverse architectural spaces. Distinguished by minimalist aesthetics, high-grade extruded aluminum, and high luminous efficiency.',
      ru: 'Идеальный линейный LED профиль для современных интерьеров. Отличается минималистичным дизайном, высококачественным алюминием и эффективным светораспределением.'
    },
    specs: {
      material: 'Alüminium / PMMA Diffuser',
      dimensions: '40 × 40 mm',
      length: 'Custom (500mm - 6000mm)',
      ipRating: 'IP20 / IP54 (opsional)',
      colorOptions: ['Gümüş', 'Qara', 'Ağ', 'Xüsusi RAL'],
      mounting: 'Səthə / Asma / Gömülən',
      power: '14W/m - 28W/m',
      cct: '2700K / 3000K / 4000K / Tunable White',
      cri: 'CRI > 95 (R9 > 80)',
      lumenOutput: '1400 - 2800 lm/m',
      voltage: '24V DC / 220-240V AC',
      beamAngle: '110° Bərabər diffuziya',
      diffuserType: 'Opal / Mikroprizmatik (UGR<19)'
    },
    files: [
      { name: 'IES Fotometriya Faylı', type: 'IES', size: '1.2 MB' },
      { name: 'LDT Dialux Məlumatı', type: 'LDT', size: '940 KB' },
      { name: 'PDF Məhsul Kataloqu', type: 'PDF', size: '3.4 MB' },
      { name: 'Montaj və Quraşdırma Təlimatı', type: 'PDF', size: '2.1 MB' },
      { name: 'AutoCAD 2D/3D DWG Modeli', type: 'CAD', size: '4.8 MB' }
    ],
    featured: true,
    isNew: true,
    applications: ['Ofislər', 'Qonaq otaqları', 'Ticarət zalları', 'Koridorlar']
  },
  {
    id: 'ultra-rail',
    slug: 'ultra-rail',
    name: 'ULTRA RAIL',
    category: 'magnetic-systems',
    categoryName: {
      az: 'Magnetic Sistemlər',
      en: 'Magnetic Systems',
      ru: 'Магнитные системы'
    },
    subtitle: {
      az: 'Magnetic Rail',
      en: 'Magnetic Rail Track',
      ru: 'Магнитный трековый шинопровод'
    },
    code: 'ECO-MAG-RAIL',
    image: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1540518614846-7ede433c4570?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80'
    ],
    description: {
      az: '48V aşağı gərginlikli təhlükəsiz maqnit rels sistemi. Modulları asanlıqla yerləşdirmək və yerini dəyişmək mümkündür. Minimalist qara və ağ dizaynda təqdim olunur.',
      en: '48V low-voltage safe magnetic track system. Enables instantaneous module repositioning and tool-free reconfiguration.',
      ru: 'Безопасная низковольтная 48V магнитная трековая система. Позволяет легко перемещать и комбинировать световые модули.'
    },
    specs: {
      material: 'Ekstruziya Alüminium / Mis keçiricilər',
      dimensions: '25 × 50 mm',
      length: '1000mm, 2000mm, 3000mm (Kəsilə bilən)',
      ipRating: 'IP20',
      colorOptions: ['Mat Qara', 'Mat Ağ'],
      mounting: 'Gömülmüş / Səthə / Asma',
      power: 'Maks. 200W / Rels',
      voltage: '48V DC',
      diffuserType: 'Maqnit kilidli mexanizm'
    },
    files: [
      { name: 'IES Fotometriya Paketi', type: 'IES', size: '2.4 MB' },
      { name: 'LDT Rel Sistem Məlumatı', type: 'LDT', size: '1.1 MB' },
      { name: 'PDF Sistem Kataloqu', type: 'PDF', size: '4.8 MB' },
      { name: 'Montaj sxemi və detalları', type: 'PDF', size: '1.9 MB' }
    ],
    featured: true,
    applications: ['Restoranlar', 'Müasir mənzillər', 'Sərgi salonları', 'Butiklər']
  },
  {
    id: 'downlight-20w',
    slug: 'downlight-20w',
    name: 'DOWNLIGHT 20W',
    category: 'spot-downlight',
    categoryName: {
      az: 'Spot & Downlight',
      en: 'Spot & Downlight',
      ru: 'Споты и даунлайты'
    },
    subtitle: {
      az: 'Yuvarlaq Gömülən',
      en: 'Round Recessed',
      ru: 'Круглый встраиваемый'
    },
    code: 'ECO-DWN-20',
    image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80'
    ],
    description: {
      az: 'Dərin reflektorlu parıltısız (Dark Light) optikaya malik premium downlight. Məkanlarda vizual rahatlığı maksimuma çatdırır.',
      en: 'Deep reflector low-glare architectural downlight engineered for superior visual comfort and high color rendering.',
      ru: 'Премиальный даунлайт с глубоким антибликовым отражателем для максимального зрительного комфорта.'
    },
    specs: {
      material: 'Döküm Alüminium Gövdə',
      dimensions: 'Ø95 × 110 mm (Kəsim: Ø85mm)',
      length: 'Standart',
      ipRating: 'IP44 / IP65 ön hissə',
      colorOptions: ['Mat Ağ', 'Mat Qara', 'Qızılı Reflektor'],
      mounting: 'Gips tavanlara gömülən',
      power: '20W (Seçim: 12W / 18W / 24W)',
      cct: '2700K / 3000K / 4000K',
      cri: 'CRI > 97',
      lumenOutput: '1850 lm',
      voltage: '220-240V AC',
      beamAngle: '15° / 24° / 36° / 60° Dəyişdirilə bilən'
    },
    files: [
      { name: 'IES Fotometriya Faylı', type: 'IES', size: '890 KB' },
      { name: 'PDF Texniki Pasport', type: 'PDF', size: '2.2 MB' },
      { name: 'Quraşdırma Təlimatı', type: 'PDF', size: '1.4 MB' }
    ],
    featured: true
  },
  {
    id: 'panel-96w',
    slug: 'panel-96w',
    name: 'PANEL 96W',
    category: 'panels',
    categoryName: {
      az: 'Panel',
      en: 'Panel Lights',
      ru: 'LED Панели'
    },
    subtitle: {
      az: 'Memarlıq LED Panel',
      en: 'Architectural LED Panel',
      ru: 'Архитектурная LED панель'
    },
    code: 'ECO-PNL-96',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80'
    ],
    description: {
      az: 'Geniş ofis və konfrans zalları üçün ultranazik çərçivəli, titrəməsiz (Flicker-Free) premium akustik və işıq paneli.',
      en: 'Ultra-slim framed, flicker-free acoustic and ambient LED panel designed for corporate environments.',
      ru: 'Ультратонкая офисная светодиодная панель без пульсации с равномерным светораспределением.'
    },
    specs: {
      material: 'Anodlaşdırılmış Alüminium / Mikrooptik LGP',
      dimensions: '600 × 600 × 12 mm / 1200 × 300 × 12 mm',
      length: 'Standart ölçülər',
      ipRating: 'IP40',
      colorOptions: ['Ağ', 'Qara', 'Alüminium'],
      mounting: 'Asma / Tavan modullarına quraşdırma',
      power: '96W (Yüksək effektivlik)',
      cct: '4000K / 5000K',
      cri: 'CRI > 90',
      lumenOutput: '11,500 lm',
      voltage: '220-240V AC (DALI hazır)'
    },
    files: [
      { name: 'IES Faylı', type: 'IES', size: '1.5 MB' },
      { name: 'PDF Kataloq Vərəqi', type: 'PDF', size: '2.8 MB' }
    ]
  },
  {
    id: 'strip-lent-24v',
    slug: 'strip-lent-24v',
    name: 'STRIP LENT 24V',
    category: 'strip-lights',
    categoryName: {
      az: 'Lent İşıqlar',
      en: 'LED Strips',
      ru: 'Светодиодные ленты'
    },
    subtitle: {
      az: 'Yüksək Sıxlıqlı LED Lent',
      en: 'High-Density LED Strip',
      ru: 'Высокоплотная LED лента'
    },
    code: 'ECO-STP-24V',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1000&q=80'
    ],
    description: {
      az: 'COB texnologiyalı, nöqtəsiz bütöv xətt yaradan 24V peşəkar LED lent. 50,000 saat davamlı iş ömrü və yüksək rəng dəqiqliyi.',
      en: 'Dotless COB architectural flexible LED strip delivering continuous uniform light without hotspots.',
      ru: 'Бесточечная COB светодиодная лента 24V с непрерывным мягким свечением и высоким CRI.'
    },
    specs: {
      material: '3-qat Mis PCB / Silikon örtük',
      dimensions: 'En: 8mm / 10mm',
      length: '5 metr rulon (50mm aralıqla kəsilə bilən)',
      ipRating: 'IP20 / IP67 Suya davamlı',
      colorOptions: ['2400K', '2700K', '3000K', '4000K', 'RGBW', 'Tunable'],
      mounting: '3M 300LSE yapışqan qat / Profil içinə',
      power: '12W/m - 19.2W/m',
      cri: 'CRI > 98 (R9 > 90)',
      lumenOutput: '1600 lm/m',
      voltage: '24V DC Sabit gərginlik'
    },
    files: [
      { name: 'IES Məlumatları', type: 'IES', size: '750 KB' },
      { name: 'PDF Spesifikasiya', type: 'PDF', size: '1.8 MB' }
    ]
  },
  {
    id: 'driver-48v',
    slug: 'driver-48v',
    name: 'DRIVER 48V',
    category: 'drivers',
    categoryName: {
      az: 'Driver',
      en: 'Power Drivers',
      ru: 'Блоки питания'
    },
    subtitle: {
      az: 'Sabit Gərginlik Qida Bloku',
      en: 'Constant Voltage Power Supply',
      ru: 'Блок питания постоянного напряжения'
    },
    code: 'ECO-DRV-48',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80'
    ],
    description: {
      az: 'Səssiz, yüksək effektivlikli (>94%), alüminium soyutmalı 48V sənaye səviyyəli drayver. DALI-2 və Push-DIM inteqrasiyası ilə.',
      en: 'Silent, ultra-efficient (>94%) aluminum heatsink 48V power driver supporting DALI-2 protocol and 0-10V.',
      ru: 'Бесшумный промышленный блок питания 48V с поддержкой диммирования DALI-2 и защитой от перегрузок.'
    },
    specs: {
      material: 'Alüminium Korpus / Epoksi İzolyasiya',
      dimensions: '220 × 65 × 32 mm',
      length: 'Kompakt',
      ipRating: 'IP67 / IP20',
      colorOptions: ['Gümüş Alüminium'],
      mounting: 'Tavan arxası / DIN Rels',
      power: '100W / 150W / 240W / 320W',
      voltage: 'Giriş: 180-264V AC | Çıxış: 48V DC'
    },
    files: [
      { name: 'Sertifikatlar və PDF Pasport', type: 'PDF', size: '2.5 MB' }
    ]
  },
  {
    id: 'tracklight-spot',
    slug: 'tracklight-spot',
    name: 'TRACKLIGHT SPOT',
    category: 'track-systems',
    categoryName: {
      az: 'Trek Sistemləri',
      en: 'Track Systems',
      ru: 'Трековые системы'
    },
    subtitle: {
      az: 'Maqnit Fırlanan Spot',
      en: 'Magnetic Adjustable Spot',
      ru: 'Поворотный магнитный спот'
    },
    code: 'ECO-TRK-SPT',
    image: 'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?auto=format&fit=crop&w=1000&q=80'
    ],
    description: {
      az: '360° üfüqi və 90° şaquli fırlanma qabiliyyətinə malik minimalist silindrik maqnit trek spotu. Vurğulayıcı işıq üçün ideal həll.',
      en: 'Minimalist cylindrical magnetic spot with 360° horizontal and 90° vertical rotation for precision accent lighting.',
      ru: 'Поворотный трековый спот с прецизионной оптикой для акцентного освещения картин и зон интерьера.'
    },
    specs: {
      material: 'CNC Alüminium',
      dimensions: 'Ø45 × 120 mm',
      length: 'Kompakt',
      ipRating: 'IP20',
      colorOptions: ['Mat Qara', 'Mat Ağ', 'Brünc'],
      mounting: '48V Maqnit Rel',
      power: '10W / 15W',
      cct: '2700K / 3000K / 4000K',
      cri: 'CRI > 97',
      lumenOutput: '950 - 1400 lm',
      beamAngle: '15° / 24° / 38° Lens'
    },
    files: [
      { name: 'IES Faylı', type: 'IES', size: '1.1 MB' },
      { name: 'PDF Vərəqi', type: 'PDF', size: '1.9 MB' }
    ]
  },
  {
    id: 'magnetic-system',
    slug: 'magnetic-system',
    name: 'MAGNETIC SYSTEM',
    category: 'magnetic-systems',
    categoryName: {
      az: 'Magnetic Sistemlər',
      en: 'Magnetic Systems',
      ru: 'Магнитные системы'
    },
    subtitle: {
      az: 'Maqnit Modul Kompleksi',
      en: 'Magnetic Modular Grid System',
      ru: 'Комплекс магнитных модулей'
    },
    code: 'ECO-MAG-MOD',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80'
    ],
    description: {
      az: 'Xətti opal diffuzor, çoxnöqtəli qaranlıq reflektor və spot modullarını tək maqnit xəttində birləşdirən bütöv memarlıq sistemi.',
      en: 'Comprehensive modular architectural system unifying linear opal diffusers, dark-reflector dot arrays, and adjustable spots on a single unified track.',
      ru: 'Универсальная модульная система, объединяющая линейные опаловые модули, решетки антиблик и споты в едином треке.'
    },
    specs: {
      material: 'Anodlaşdırılmış Alüminium',
      dimensions: '300mm / 600mm / 1200mm modullar',
      length: 'Sonsuz birləşmə',
      ipRating: 'IP20',
      colorOptions: ['Mat Qara', 'Mat Ağ'],
      mounting: 'Maqnit Klik Mexanizmi',
      power: 'Modula görə 12W - 36W',
      cct: '3000K / 4000K / Tunable'
    },
    files: [
      { name: 'Sistem Kataloqu PDF', type: 'PDF', size: '6.2 MB' }
    ]
  },
  {
    id: 'slim-linear-20',
    slug: 'slim-linear-20',
    name: 'SLIM LINEAR 20',
    category: 'led-profiles',
    categoryName: {
      az: 'LED Profillər',
      en: 'LED Profiles',
      ru: 'LED Профили'
    },
    subtitle: {
      az: 'Ultranazik Quraşdırma Profili',
      en: 'Ultra-Slim Architectural Profile',
      ru: 'Ультратонкий профиль'
    },
    code: 'ECO-SLM-20',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80'
    ],
    description: {
      az: 'Mebel, rəf və dekorativ divar panellərinə inteqrasiya olunan incə 20x15mm ölçülü LED profil sistemi.',
      en: 'Ultra-compact profile for bespoke joinery, cabinetry, and cove architectural details.',
      ru: 'Компактный профиль для интеграции в мебель, ниши и гипсокартонные конструкции.'
    },
    specs: {
      material: 'Alüminium',
      dimensions: '20 × 15 mm',
      length: '2000mm / 3000mm',
      ipRating: 'IP20',
      colorOptions: ['Qara', 'Gümüş', 'Ağ'],
      mounting: 'Səthə / Gömülən',
      power: '9.6W/m - 14.4W/m'
    },
    files: [
      { name: 'PDF Vərəqi', type: 'PDF', size: '1.4 MB' }
    ]
  },
  {
    id: 'recessed-50',
    slug: 'recessed-50',
    name: 'RECESSED ARCHITECTURAL 50',
    category: 'recessed',
    categoryName: {
      az: 'Gömülən',
      en: 'Recessed Profiles',
      ru: 'Встраиваемые профили'
    },
    subtitle: {
      az: 'Çərçivəsiz Tavan Profili',
      en: 'Trimless Ceiling Recessed Profile',
      ru: 'Бесщелевой встраиваемый профиль'
    },
    code: 'ECO-REC-50',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80'
    ],
    description: {
      az: 'Gips tavanın daxilində tam çərçivəsiz (Trimless) suvanan və yalnız təmiz işıq xətti buraxan arxitektural profil.',
      en: 'Trimless plaster-in profile creating clean, uninterrupted lines of light embedded seamlessly in drywall ceilings.',
      ru: 'Встраиваемый профиль под шпаклевку для создания эффекта парящего чистого света без видимых рамок.'
    },
    specs: {
      material: 'Xam Alüminium qanadlar + Anodlaşdırılmış iç kanal',
      dimensions: '50 × 45 mm',
      length: 'Custom',
      ipRating: 'IP20',
      colorOptions: ['Ağ Diffuzorlu'],
      mounting: 'Gips karkasa inteqrasiya',
      power: '18W/m - 32W/m'
    },
    files: [
      { name: 'IES və CAD Çertyojlar', type: 'CAD', size: '5.2 MB' }
    ]
  }
];

export const productCategoriesList = [
  { id: 'all', nameAz: 'Hamısı', nameEn: 'All', nameRu: 'Все' },
  { id: 'linear-profiles', nameAz: 'Xətti Profillər', nameEn: 'Linear Profiles', nameRu: 'Линейные профили' },
  { id: 'led-profiles', nameAz: 'LED Profillər', nameEn: 'LED Profiles', nameRu: 'LED Профили' },
  { id: 'strip-lights', nameAz: 'Lent İşıqlar', nameEn: 'LED Strips', nameRu: 'Светодиодные ленты' },
  { id: 'recessed', nameAz: 'Gömülmüş', nameEn: 'Recessed', nameRu: 'Встраиваемые' },
  { id: 'track-systems', nameAz: 'Trek Sistemləri', nameEn: 'Track Systems', nameRu: 'Трековые системы' },
  { id: 'spot-downlight', nameAz: 'Spot & Downlight', nameEn: 'Spot & Downlight', nameRu: 'Споты и даунлайты' },
  { id: 'drivers', nameAz: 'Driver', nameEn: 'Drivers', nameRu: 'Блоки питания' },
  { id: 'accessories', nameAz: 'Aksesuarlar', nameEn: 'Accessories', nameRu: 'Аксессуары' },
  { id: 'panels', nameAz: 'Panel', nameEn: 'Panels', nameRu: 'Панели' },
  { id: 'magnetic-systems', nameAz: 'Magnetic Sistemlər', nameEn: 'Magnetic Systems', nameRu: 'Магнитные системы' },
];
