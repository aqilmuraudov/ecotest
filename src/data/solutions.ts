import { Solution } from '../types';

export const solutions: Solution[] = [
  {
    id: 'commercial',
    slug: 'commercial-lighting',
    title: {
      az: 'Ticarət və İctimai Məkanlar',
      en: 'Commercial & Retail Lighting',
      ru: 'Торговые и коммерческие пространства'
    },
    subtitle: {
      az: 'Yüksək tələbli kommersiya məkanları üçün funksional və etibarlı sistemlər.',
      en: 'Functional and robust lighting systems designed for demanding commercial environments.',
      ru: 'Надежные и функциональные системы освещения для коммерческих объектов.'
    },
    description: {
      az: 'Mağazalar, alış-veriş mərkəzləri, avtosalonlar və sərgi zalları üçün müştəri diqqətini məhsula yönəldən, yüksək rəng dəqiqliyinə malik işıqlandırma həlləri təqdim edirik.',
      en: 'We engineer high-CRI, dynamic lighting layouts that direct consumer attention to products, maximize dwell time, and reduce energy overhead.',
      ru: 'Разрабатываем освещение для магазинов, торговых центров и шоурумов с высоким индексом цветопередачи.'
    },
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    keyFeatures: {
      az: [
        'Məhsul fakturasını və rənglərini vurğulayan CRI 95+ optika',
        'Asanlıqla dəyişdirilə bilən 48V maqnit trek konfiqurasiyası',
        'Uzunmüddətli 50,000+ saat fasiləsiz iş rejimi',
        'DALI və ağıllı ssenarilərlə enerji qənaəti'
      ],
      en: [
        'CRI 95+ optics showcasing true fabric textures and product hues',
        'Tool-free repositioning with 48V magnetic track modules',
        'Continuous 50,000+ hour industrial operating reliability',
        'DALI-2 automated dimming schedules for maximum efficiency'
      ],
      ru: [
        'Оптика CRI 95+ для точной цветопередачи товаров',
        'Быстрая перестановка спотов в магнитной системе 48V',
        'Ресурс работы более 50 000 часов',
        'Энергосберегающие сценарии управления DALI'
      ]
    },
    recommendedProductIds: ['ultra-rail', 'tracklight-spot', 'linear-40', 'panel-96w'],
    projectIds: ['port-baku-boutique', 'sensum-coffee-bakery']
  },
  {
    id: 'office',
    slug: 'office-lighting',
    title: {
      az: 'Ofis və Biznes Mərkəzləri',
      en: 'Office & Corporate Lighting',
      ru: 'Офисы и бизнес-центры'
    },
    subtitle: {
      az: 'Məhsuldarlığı artıran və göz yorğunluğunu azaldan insan mərkəzli işıqlandırma.',
      en: 'Human-centric ergonomics engineered to boost focus and eradicate optical fatigue.',
      ru: 'Биодинамическое освещение для продуктивности и визуального комфорта сотрудников.'
    },
    description: {
      az: 'Günün saatlarına uyğun rəng temperaturunu tənzimləyən Tunable White texnologiyası və parıltısız (UGR<19) diffuzorlarla müasir iş məkanlarını daha komfortlu edirik.',
      en: 'Incorporating daylight-harvesting sensors, low-glare microprismatic diffusers, and circadian Tunable White spectra into contemporary work hubs.',
      ru: 'Применение биодинамического света Tunable White и антибликовых рассеивателей для офисов класса А.'
    },
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    keyFeatures: {
      az: [
        'Avropa EN 12464-1 standartına uyğun 500 Lux və UGR<19 təminatı',
        'Birbaşa və dolayı (Direct/Indirect) asma xətti profillər',
        'Titrəməsiz (Flicker-Free) yüksək keyfiyyətli drayverlər',
        'İclas zalları üçün fərdiləşdirilmiş həndəsi fiqurlar'
      ],
      en: [
        'Compliance with EN 12464-1 workplace standards (500 Lux, UGR<19)',
        'Direct/indirect suspended extrusions for uniform ceiling illuminance',
        'Zero-flicker certified industrial power supplies',
        'Custom geometric continuous loops for executive boardrooms'
      ],
      ru: [
        'Соответствие европейским нормам EN 12464-1 (UGR<19)',
        'Светильники прямого и отраженного света',
        'Отсутствие пульсации (Flicker-Free)',
        'Индивидуальные геометрические формы для переговорных'
      ]
    },
    recommendedProductIds: ['linear-40', 'panel-96w', 'downlight-20w'],
    projectIds: ['savtour-office']
  },
  {
    id: 'hospitality',
    slug: 'hospitality-lighting',
    title: {
      az: 'Otel və Restoranlar',
      en: 'Hospitality & Dining Lighting',
      ru: 'Отели и рестораны'
    },
    subtitle: {
      az: 'Qonaqlarda unudulmaz təəssürat və emosional bağlılıq yaradan zərif işıq.',
      en: 'Atmospheric warmth and theatrical contrast shaping indelible guest experiences.',
      ru: 'Атмосферный свет, создающий неповторимый уют и впечатление у гостей.'
    },
    description: {
      az: 'Restoran masalarına yönələn dəqiq mikro-spotlar, bar tezgahını işıqlandıran xətti profillər və sakitləşdirici 2400K-2700K isti spektr.',
      en: 'Micro-spot task illumination over dining tables, architectural bar-cove grazing, and soothing 2400K warm twilight tones.',
      ru: 'Точечные акценты на столиках, подсветка барных зон и теплые янтарные тона для ресторанных залов.'
    },
    image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80',
    keyFeatures: {
      az: [
        '2400K - 2700K ultra-isti və rahatlaşdırıcı işıq spektri',
        'Dərin quraşdırılmış Dark Light optika ilə sıfır parıltı',
        'IP65 nəm və suya davamlı spa / hovuz həlləri',
        'Gecə / Gündüz dinamik dimming rejimləri'
      ],
      en: [
        '2400K - 2700K warm ambient spectrum',
        'Deep-recessed Dark Light optics ensuring glare-free sightlines',
        'IP65 rated moisture-sealed options for spa and pool areas',
        'Dynamic daytime-to-twilight mood scene transitions'
      ],
      ru: [
        'Теплый спектр 2400К - 2700К для релаксации',
        'Глубокая посадка оптики без слепящего эффекта',
        'Влагозащита IP65 для спа и террас',
        'Плавное диммирование вечерних сцен'
      ]
    },
    recommendedProductIds: ['linear-40', 'downlight-20w', 'ultra-rail', 'strip-lent-24v'],
    projectIds: ['sensum-coffee-bakery', 'caspian-waterfront-hotel', 'papa-johns-restaurant']
  },
  {
    id: 'residential',
    slug: 'residential-lighting',
    title: {
      az: 'Fərdi Yaşayış və Villalar',
      en: 'High-End Residential Lighting',
      ru: 'Премиальные жилые интерьеры'
    },
    subtitle: {
      az: 'Müasir minimalist arxitektura ilə tam inteqrasiya olunan görünməz işıq.',
      en: 'Pure architectural integration where fixtures disappear into ceiling planes.',
      ru: 'Невидимый в интерьере свет, подчеркивающий архитектуру дома.'
    },
    description: {
      az: 'Tavanla bir bütöv təşkil edən çərçivəsiz gömülən xətlər, mebel və pilləkən arxası gizli lentlər, smart ev idarəetməsi.',
      en: 'Flush trimless channels, concealed cove linear runs, and smartphone-controlled Bluetooth mesh scenes.',
      ru: 'Бесщелевые профили под шпаклевку, скрытая подсветка ступеней и ниш, управление со смартфона.'
    },
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    keyFeatures: {
      az: [
        'Gips tavanlara tam suvanan çərçivəsiz (Trimless) profillər',
        'Mebel və şkaflar üçün ultranazik 15mm profillər',
        'Casambi / Apple HomeKit simsiz inteqrasiyası',
        'Gecə oriyentasiyası üçün yumşaq döşəmə xətləri'
      ],
      en: [
        'Trimless plaster-in ceiling channels with clean shadow gaps',
        'Ultra-slim 15mm profiles for bespoke millwork and shelving',
        'Casambi & smart home ecosystem integration',
        'Soft nocturnal low-level path lighting'
      ],
      ru: [
        'Профили под шпаклевку без видимых стыков',
        'Миниатюрные профили для мебели и полок',
        'Интеграция с умным домом и Casambi',
        'Деликатная ночная навигационная подсветка'
      ]
    },
    recommendedProductIds: ['recessed-50', 'slim-linear-20', 'strip-lent-24v', 'ultra-rail'],
    projectIds: ['baku-white-city-residence']
  }
];
