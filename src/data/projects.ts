import { Project } from '../types';

export const projects: Project[] = [
  {
    id: 'sensum-coffee-bakery',
    slug: 'sensum-coffee-bakery',
    title: 'SENSUM COFFEE & BAKERY',
    category: 'restaurant',
    categoryName: {
      az: 'Restoran & Kafe',
      en: 'Restaurant & Cafe',
      ru: 'Ресторан и кафе'
    },
    client: 'Sensum Group',
    location: 'Bakı, Azərbaycan',
    year: '2024',
    architect: 'ArchStudio Baku',
    coverImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=1200&q=80'
    ],
    shortDescription: {
      az: 'Müasir minimalist kafe interyerində xüsusi qaranlıq reflektorlu xətti LED və isti 2700K vurğu işıqlandırması.',
      en: 'Dark-reflector linear LED fixtures and warm 2700K accent spots curated for a moody, minimalist bakery atmosphere.',
      ru: 'Линейное освещение с антибликовыми модулями и теплый свет 2700К для атмосферной современной кофейни.'
    },
    fullDescription: {
      az: 'Sensum Coffee & Bakery layihəsində məqsəd qonaqlara rahatlıq və komfort bəxş edən, eyni zamanda qəhvə hazırlığı zonasında yüksək görmə dəqiqliyi təmin edən balanslı işıq mühiti formalaşdırmaq idi.',
      en: 'The architectural mandate for Sensum Coffee was to forge an intimate, visually relaxing environment while maintaining precise task lighting over the barista bar.',
      ru: 'Основная концепция проекта Sensum — создание камерного уюта для посетителей и функционального рабочего света для бариста.'
    },
    lightingSolution: {
      az: 'Qara mat örtüklü LINEAR 40 xətti profilləri və 48V ULTRA RAIL maqnit sistemləri tavan cizgilərinə paralel inteqrasiya olundu. 2700K isti spektr və CRI 98 dəyəri ilə interyerin təbii ağac və beton fakturası qabardıldı.',
      en: 'Matte black LINEAR 40 continuous extrusions and 48V ULTRA RAIL magnetic tracks integrated into ceiling recesses. Ultra-high CRI 98 and 2700K warm glow accentuates raw walnut and micro-cement textures.',
      ru: 'Были применены матовые черные профили LINEAR 40 и магнитные треки 48V с цветовой температурой 2700К и CRI 98.'
    },
    productsUsed: ['linear-40', 'ultra-rail', 'tracklight-spot', 'strip-lent-24v'],
    metrics: [
      { label: { az: 'Ümumi Sahə', en: 'Total Area', ru: 'Общая площадь' }, value: '380 m²' },
      { label: { az: 'Enerji Səmərəliliyi', en: 'Energy Efficiency', ru: 'Энергоэффективность' }, value: 'A++ (7.2 W/m²)' },
      { label: { az: 'Orta Parıltı Dərəcəsi', en: 'Glare Rating', ru: 'Показатель ослепления' }, value: 'UGR < 16' }
    ],
    featured: true
  },
  {
    id: 'savtour-office',
    slug: 'savtour-office',
    title: 'SAVTOUR OFİS',
    category: 'office',
    categoryName: {
      az: 'Ofis',
      en: 'Corporate Office',
      ru: 'Корпоративный офис'
    },
    client: 'Savtour Global',
    location: 'Bakı, Azərbaycan',
    year: '2024',
    architect: 'DesignLab Azerbaijan',
    coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'
    ],
    shortDescription: {
      az: 'DALI protokolu ilə idarə olunan, insan mərkəzli (Human-Centric) 4000K xətti asma işıqlandırma sistemi.',
      en: 'Human-centric smart office lighting featuring DALI-controlled 4000K continuous linear suspensions and direct/indirect optics.',
      ru: 'Интеллектуальная система освещения офиса с управлением DALI и светильниками прямого/отраженного света.'
    },
    fullDescription: {
      az: 'Savtour Baş Qərargahında 1200 m² açıq iş sahəsi və idarə heyəti kabinetləri üçün vizual yorğunluğu aradan qaldıran premium işıqlandırma konsepti həyata keçirildi.',
      en: 'For the headquarters of Savtour, an ergonomic lighting schema was implemented across open workspaces and executive boardrooms to mitigate optical fatigue.',
      ru: 'В головном офисе Savtour реализована концепция биодинамического освещения для 1200 кв.м открытых пространств и переговорных.'
    },
    lightingSolution: {
      az: 'Düzbucaqlı və qapalı xətti karkaslar yaradan xüsusi birləşdiricili LINEAR 40 asma sistemləri və mikro-prizmatik UGR<19 diffuzorlar quraşdırıldı.',
      en: 'Continuous suspended geometric grids with bespoke 90-degree internal corner couplings and microprismatic glare-control optics.',
      ru: 'Подвесные замкнутые геометрические контуры LINEAR 40 с микропризматическими рассеивателями UGR<19.'
    },
    productsUsed: ['linear-40', 'panel-96w', 'downlight-20w', 'driver-48v'],
    metrics: [
      { label: { az: 'İşıqlanma Səviyyəsi', en: 'Illuminance Level', ru: 'Уровень освещенности' }, value: '500 Lux (İş masası)' },
      { label: { az: 'UGR Dərəcəsi', en: 'UGR Glare Rating', ru: 'UGR' }, value: 'UGR < 18' },
      { label: { az: 'İdarəetmə', en: 'Control System', ru: 'Управление' }, value: 'DALI-2 Smart Sensor' }
    ],
    featured: true
  },
  {
    id: 'papa-johns-restaurant',
    slug: 'papa-johns-restaurant',
    title: 'PAPA JOHN’S RESTORAN',
    category: 'restaurant',
    categoryName: {
      az: 'Restoran',
      en: 'Restaurant',
      ru: 'Ресторан'
    },
    client: 'PJ Baku Franchise',
    location: 'Bakı, Azərbaycan',
    year: '2023',
    architect: 'InSpace Interiors',
    coverImage: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80'
    ],
    shortDescription: {
      az: 'Brendin dinamik interyer üslubuna uyğunlaşdırılmış radial əyri xətti LED və künc profilləri.',
      en: 'Curvilinear architectural LED profiles and vibrant warm perimeter linear coves tailored for dining dynamics.',
      ru: 'Радиальные изогнутые линейные LED конструкции и скрытая закарнизная подсветка.'
    },
    fullDescription: {
      az: 'Restoranın həm ailəvi yemək zonasında, həm də sürətli xidmət hissəsində enerjili və xoş atmosfer yaratmaq üçün fərdi radiuslu işıq fiqurları hazırlandı.',
      en: 'Bespoke curved luminaires were engineered to match the franchise interior identity, providing comfortable ambient warmth and vibrant food presentation.',
      ru: 'Специально изготовленные радиальные светильники создают теплую и живую атмосферу в обеденных залах ресторана.'
    },
    lightingSolution: {
      az: 'Xüsusi bükülmüş CURVED LINEAR profillər və tavan girintilərində IP54 24V COB lentlər istifadə edildi.',
      en: 'Engineered roll-formed curved aluminum profiles paired with 24V dotless strips and dimmable drivers.',
      ru: 'Радиусные алюминиевые профили с высокоплотными COB лентами 24V.'
    },
    productsUsed: ['linear-40', 'strip-lent-24v', 'downlight-20w'],
    metrics: [
      { label: { az: 'Armatur Sayı', en: 'Fixture Units', ru: 'Количество приборов' }, value: '140+ ədəd' },
      { label: { az: 'Rəngötürmə', en: 'Color Rendering', ru: 'Цветопередача' }, value: 'CRI > 95' }
    ],
    featured: true
  },
  {
    id: 'baku-white-city-residence',
    slug: 'baku-white-city-residence',
    title: 'BAKU WHITE CITY RESIDENCE',
    category: 'residential',
    categoryName: {
      az: 'Premium Yaşayış',
      en: 'Luxury Residential',
      ru: 'Элитное жилье'
    },
    client: 'Fərdi Sifarişçi',
    location: 'Ağ Şəhər, Bakı',
    year: '2024',
    architect: 'Kamil Aliyev Studio',
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
    ],
    shortDescription: {
      az: 'Çərçivəsiz (Trimless) gömülən xətlər, gizli qaranlıq relslər və Casambi simsiz idarəetməli penthaus.',
      en: 'Seamless trimless plaster-in linear channels and wireless Casambi scene management across a luxury duplex penthouse.',
      ru: 'Бесщелевые профили под шпаклевку и беспроводное управление Casambi в пентхаусе в White City.'
    },
    fullDescription: {
      az: 'Minimalist arxitekturanın tələbi olaraq tavanlarda heç bir çərçivə və çıxıntı görünməməli idi. Bütün işıq mənbələri divar və tavanın memarlıq müstəvisinə inteqrasiya olundu.',
      en: 'Architectural minimalism dictated zero surface protrusions; all luminaires blend flush with drywall surfaces.',
      ru: 'Интерьер в стиле бескомпромиссного минимализма, где весь свет встроен заподлицо со стенами и потолком.'
    },
    lightingSolution: {
      az: 'RECESSED 50 çərçivəsiz profillər, SLIM 20 mebel işıqları və Tunable White 2400K-5000K sirkadiyan rejimi tətbiq edildi.',
      en: 'Integrated RECESSED 50 trimless profiles, ultra-slim joinery lighting, and circadian Tunable White.',
      ru: 'Интеграция профилей RECESSED 50, скрытой подсветки мебели и биодинамического света Tunable White.'
    },
    productsUsed: ['recessed-50', 'slim-linear-20', 'strip-lent-24v', 'ultra-rail'],
    metrics: [
      { label: { az: 'İdarəetmə', en: 'Control Protocol', ru: 'Управление' }, value: 'Casambi Bluetooth Mesh' },
      { label: { az: 'Xətti Profil', en: 'Linear Length', ru: 'Длина профилей' }, value: '260 metr' }
    ]
  },
  {
    id: 'caspian-waterfront-hotel',
    slug: 'caspian-waterfront-hotel',
    title: 'CASPIAN WATERFRONT HOTEL',
    category: 'hotel',
    categoryName: {
      az: 'Otel & Qonaqpərvərlik',
      en: 'Hospitality & Hotel',
      ru: 'Отели и гостиницы'
    },
    client: 'Caspian Hospitality',
    location: 'Xəzər Sahili, Bakı',
    year: '2023',
    architect: 'Studio V',
    coverImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
    ],
    shortDescription: {
      az: '5 ulduzlu otel lobbisi, restoranı və spa zonası üçün monumental dekorativ və arxitektural LED kompozisiyaları.',
      en: 'Monumental architectural linear compositions and cove grazing across luxury lobby, ballrooms, and wellness suites.',
      ru: 'Монументальные световые инсталляции и скрытая подсветка для 5-звездочного отеля на набережной.'
    },
    fullDescription: {
      az: 'Qonaqlara daxil olduqları andan möhtəşəm vizual təsir bağışlayan, 8 metr hündürlüklü lobbi tavanı üçün xüsusi asma qızılı xətti konstruksiyalar hazırlandı.',
      en: 'For the 8-meter high hotel grand atrium, custom bronze-anodized suspended linear modules were engineered.',
      ru: 'Для гранд-лобби отеля с высотой потолков 8 метров были созданы индивидуальные подвесные системы.'
    },
    lightingSolution: {
      az: 'LINEAR 40 fərdi qızılı örtüklə, IP65 suya davamlı hovuz kənarı profillər və DMX dinamik ssenariləri tətbiq edildi.',
      en: 'Custom gold-anodized LINEAR 40 fixtures, IP65 waterproof spa linear channels, and DMX architectural scenes.',
      ru: 'Профили LINEAR 40 в золотой анодировке, влагозащищенные профили IP65 и DMX сценарии.'
    },
    productsUsed: ['linear-40', 'strip-lent-24v', 'downlight-20w', 'magnetic-system'],
    metrics: [
      { label: { az: 'Tavan Hündürlüyü', en: 'Ceiling Height', ru: 'Высота потолков' }, value: '8.4 metr' },
      { label: { az: 'Zəmanət Müddəti', en: 'Warranty Period', ru: 'Гарантия' }, value: '5 İl Rəsmi' }
    ]
  },
  {
    id: 'port-baku-boutique',
    slug: 'port-baku-boutique',
    title: 'PORT BAKU LUXURY BOUTIQUE',
    category: 'commercial',
    categoryName: {
      az: 'Ticarət & Butik',
      en: 'Luxury Retail',
      ru: 'Торговые пространства'
    },
    client: 'Retail Group AZ',
    location: 'Port Baku Mall',
    year: '2024',
    architect: 'Milano Design Studio',
    coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80'
    ],
    shortDescription: {
      az: 'Məhsulların rənglərini 100% təbii göstərən CRI 98+ maqnit trek sistemləri və vitrin işıqlandırması.',
      en: 'Museum-grade CRI 98+ magnetic track systems and retail display grazing that reveals true fabric textures and hues.',
      ru: 'Магнитные трековые системы с CRI 98+ для безупречной цветопередачи премиальных коллекций.'
    },
    fullDescription: {
      az: 'Port Baku Mall-da yerləşən beynəlxalq moda brendinin butiki üçün kolleksiyaları ən cəlbedici şəkildə nümayiş etdirən işıq həlli yaradıldı.',
      en: 'Delivering precision accentuation and zero thermal degradation for luxury garments in Port Baku Mall.',
      ru: 'Прецизионное акцентное освещение бутиков высокой моды с минимальным нагревом витрин.'
    },
    lightingSolution: {
      az: 'ULTRA RAIL maqnit relsləri və dəyişdirilə bilən 15°/24°/36° optikalı TRACKLIGHT SPOT modulları.',
      en: 'ULTRA RAIL magnetic channels equipped with interchangeable 15°/24°/36° precision lens spotlights.',
      ru: 'Магнитные шинопроводы ULTRA RAIL со сменными линзами 15°/24°/36°.'
    },
    productsUsed: ['ultra-rail', 'tracklight-spot', 'slim-linear-20'],
    metrics: [
      { label: { az: 'Rəng Dəqiqliyi', en: 'Color Fidelity', ru: 'Цветопередача' }, value: 'CRI 98 (R9 > 95)' }
    ]
  }
];
