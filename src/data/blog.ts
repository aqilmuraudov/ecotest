import { BlogPost } from '../types';

export const blogPosts: BlogPost[] = [
  {
    id: 'linear-led-minimalist-architecture',
    slug: 'linear-led-minimalist-architecture',
    title: {
      az: 'Müasir Memarlıqda Xətti LED İşıqlandırmanın Rolu',
      en: 'The Role of Linear LED Lighting in Contemporary Architecture',
      ru: 'Роль линейного светодиодного освещения в современной архитектуре'
    },
    category: 'Architecture',
    date: '18 Fevral 2026',
    readTime: '5 dəq oxu',
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    author: 'Ecolife Lighting Design Team',
    summary: {
      az: 'Xətti işıq mənbələrinin məkanın həndəsəsini, dərinliyini və vizual oxlarını necə vurğuladığını araşdırırıq.',
      en: 'Exploring how linear architectural luminaires sculpt spatial geometry, depth, and structural axes.',
      ru: 'Исследуем, как линейные светильники подчеркивают геометрию и оси архитектурного пространства.'
    },
    content: {
      az: [
        'Müasir memarlıqda işıqlandırma artıq sadəcə qaranlığı aradan qaldıran utilitar vasitə deyil. O, məkanın sərhədlərini genişləndirən, divar və tavan müstəvilərinin material və toxumasını üzə çıxaran əsas dizayn elementidir.',
        'Xətti LED profilləri tavan və divarlarda fasiləsiz işıq xətləri yaradaraq insan baxışını istiqamətləndirir. Xüsusilə çərçivəsiz (trimless) quraşdırma sayəsində armatur tamamilə gizlənir və yalnız təmiz işıq effekti qalır.',
        'Ecolife olaraq biz layihələndirmə mərhələsində hər bir xəttin uzunluğunu və künc birləşmələrini (90°, 45° və xüsusi dərəcələr) mikron dəqiqliyi ilə hesablayaraq qüsursuz işıq bütövlüyü təmin edirik.'
      ],
      en: [
        'In contemporary architecture, lighting transcends utilitarian necessity. It becomes an active material that sculpts depth, articulates boundaries, and honors material materiality.',
        'Continuous linear profiles define rhythm and orientation. Plaster-in trimless detailing allows luminaires to merge invisibly into drywall finishes, releasing pure light devoid of visual clutter.',
        'At Ecolife, our custom miter cutting and continuous joiner systems guarantee zero light leaks and seamless corner transitions.'
      ],
      ru: [
        'В современной архитектуре свет является полноправным строительным материалом. Он подчеркивает пропорции и фактуру поверхностей.',
        'Линейные светильники задают динамику и направляют взгляд. Бесщелевые профили под шпаклевку делают сам светильник невидимым, оставляя лишь чистый свет.',
        'На фабрике Ecolife мы изготавливаем профили точной длины и создаем герметичные угловые стыки без световых разрывов.'
      ]
    }
  },
  {
    id: 'understanding-cri-and-color-quality',
    slug: 'understanding-cri-and-color-quality',
    title: {
      az: 'CRI 95+ Niyə Vacibdir? İşıqda Rəng Dəqiqliyi',
      en: 'Why CRI 95+ Matters: Chromatic Accuracy in Lighting',
      ru: 'Почему важен CRI 95+: Точность цветопередачи в освещении'
    },
    category: 'Technology',
    date: '04 Fevral 2026',
    readTime: '4 dəq oxu',
    coverImage: 'https://images.unsplash.com/photo-1540518614846-7ede433c4570?auto=format&fit=crop&w=1200&q=80',
    author: 'Dr. Emil Məmmədov (Optika Mühəndisi)',
    summary: {
      az: 'Aşağı keyfiyyətli LED-lərin rəngləri necə təhrif etdiyini və CRI > 95 spektrinin interyerə təsirini öyrənin.',
      en: 'Understanding how substandard LEDs distort hues and why CRI > 95 is indispensable for luxury interiors.',
      ru: 'Разбираем, как низкий CRI искажает оттенки материалов и почему важен спектр CRI > 95.'
    },
    content: {
      az: [
        'Rəngötürmə İndeksi (CRI - Color Rendering Index) süni işıq mənbəyinin günəş işığı ilə müqayisədə rəngləri nə dərəcədə düzgün əks etdirdiyini göstərir. Standart lampalarda bu göstərici 80 ətrafında olur, lakin premium interyerlərdə bu qəbuledilməzdir.',
        'Xüsusilə R9 parametri (qırmızı rəng spektri) insan dərisinin tonunu, təbii ağacın isti damarlarını və qida məhsullarını canlı göstərmək üçün həlledicidir. Ecolife məhsullarında CRI>95 və R9>85 olan xüsusi LED çipləri tətbiq olunur.',
        'Nəticədə məkanınız solğun görünmür, əksinə bütün materiallar öz orijinal parlaqlığını qoruyur.'
      ],
      en: [
        'Color Rendering Index (CRI) quantifies a light source’s ability to faithfully reveal object colors compared to natural daylight.',
        'The critical R9 value (saturated red spectrum) governs human skin tones, natural timber grains, and vibrant textiles. Ecolife utilizes LED chips with Ra > 95 and R9 > 85.',
        'The outcome is an authentic visual environment where materials maintain their tactile richness.'
      ],
      ru: [
        'Индекс цветопередачи (CRI) определяет, насколько естественно выглядят цвета предметов под искусственным светом.',
        'Параметр R9 особенно важен для передачи оттенков кожи и натурального дерева. В светильниках Ecolife используются чипы с CRI > 95 и R9 > 85.',
        'Благодаря этому интерьер выглядит живым, благородным и насыщенным.'
      ]
    }
  },
  {
    id: 'ugr-glare-control-in-office-design',
    slug: 'ugr-glare-control-in-office-design',
    title: {
      az: 'UGR < 19: Ofislərdə Göz Yorğunluğunun Qarşısını Necə Alırıq?',
      en: 'UGR < 19: Eliminating Glare and Visual Fatigue in Workspaces',
      ru: 'UGR < 19: Защита от ослепления и зрительной усталости в офисах'
    },
    category: 'Lighting Design',
    date: '22 Yanvar 2026',
    readTime: '6 dəq oxu',
    coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    author: 'Ecolife Mühəndislik Qrupu',
    summary: {
      az: 'Parıltı əmsalı (UGR), mikro-prizmatik diffuzorlar və birbaşa/dolayı asma sistemlərinin üstünlükləri.',
      en: 'Unified Glare Rating (UGR), microprismatic optics, and direct/indirect lighting dynamics.',
      ru: 'Коэффициент ослепленности UGR, микропризматические рассеиватели и стандарты освещения.'
    },
    content: {
      az: [
        'Kompüter qarşısında saatlarla çalışan işçilərin ən böyük problemlərindən biri tavan lampalarının monitorlarda yaratdığı parıltı və birbaşa gözə vuran kəskin işıqdır.',
        'UGR (Unified Glare Rating) 19-dan aşağı olduqda insan gözü işıq mənbəyini narahatedici hiss etmir. Ecolife LINEAR 40 və PANEL sistemlərində xüsusi mikroskopik prizma strukturlu diffuzorlardan istifadə olunur.',
        'Həmçinin işığın 30%-nin tavana (dolayı), 70%-nin isə aşağıya yönəldilməsi tavan qaranlığını aradan qaldırır və ofisdə tam balanslı işıq mühiti yaradır.'
      ],
      en: [
        'Glare from unshielded luminaires bouncing off computer screens is the chief culprit behind workplace headaches and eyestrain.',
        'A Unified Glare Rating (UGR) below 19 ensures comfortable sightlines. Our microprismatic diffusers collimate light strictly downward.',
        'Combining 30% uplight with 70% downlight eliminates cavernous ceilings and optimizes ambient balance.'
      ],
      ru: [
        'Слепящий свет от открытых светодиодов вызывает усталость глаз и снижение концентрации в офисе.',
        'Показатель UGR < 19 гарантирует отсутствие бликов на экранах. Мы используем микропризматические рассеиватели премиум-класса.',
        'Сочетание прямого и отраженного света создает мягкую и комфортную световую среду.'
      ]
    }
  }
];
