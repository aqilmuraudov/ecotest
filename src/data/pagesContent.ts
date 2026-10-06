import { SitePagesData } from '../types';

export const initialPagesContent: SitePagesData = {
  about: {
    badge: {
      az: '04 — HAQQIMIZDA',
      en: '04 — ABOUT US',
      ru: '04 — О НАС'
    },
    titleA: {
      az: 'işığın',
      en: 'the architecture',
      ru: 'архитектура'
    },
    titleB: {
      az: 'arxitekturası',
      en: 'of light',
      ru: 'света'
    },
    subtitle: {
      az: 'Biz sadəcə işıq satmırıq, məkanların xarakterini və atmosferini formalaşdıran mühəndislik həlləri yaradırıq.',
      en: 'We do not just sell luminaires; we create architectural lighting solutions that define spatial identity and atmosphere.',
      ru: 'Мы создаем инженерные световые решения, формирующие характер и атмосферу пространства.'
    },
    storyTitle: {
      az: 'Ecolife Hekayəsi',
      en: 'The Ecolife Story',
      ru: 'История Ecolife'
    },
    storyP1: {
      az: 'Ecolife, müasir memarlıq və interyer dizaynının tələblərinə cavab verən yüksək dəqiqlikli xətti LED profillər və işıq sistemlərinin Azərbaycandakı aparıcı istehsalçısı və mühəndislik tərəfdaşıdır.',
      en: 'Ecolife is the leading manufacturer and engineering partner for high-precision linear LED profiles and architectural luminaires in Azerbaijan, answering the stringent demands of contemporary spaces.',
      ru: 'Ecolife — ведущий производитель и инженерный партнер в Азербайджане по выпуску высокоточных линейных LED профилей и архитектурных систем.'
    },
    storyP2: {
      az: 'Bakıda yerləşən müasir istehsal və montaj emalatxanamızda hər bir məhsul memarın və işıq dizaynerinin dəqiq cizgilərinə uyğun fərdiləşdirilir.',
      en: 'At our specialized fabrication facility in Baku, every luminaire is custom manufactured to the exact architectural specifications and lighting design drawings.',
      ru: 'На нашей производственной базе в Баку каждое изделие кастомизируется по точным чертежам архитекторов и светодизайнеров.'
    },
    facilityPoints: {
      az: [
        'Bakıda müasir avropasayağı alüminium profil emalı və yığım xətti',
        'Dialux Evo proqramında dəqiq fotometrik hesabat və lüks xəritələri',
        'CRI 95+ və UGR < 19 optika standartları',
        'İstənilən ölçüdə və həndəsi konfiqurasiyada fərdi istehsal'
      ],
      en: [
        'Modern European-standard aluminum profile processing line in Baku',
        'Accurate photometric calculations and lux maps in Dialux Evo',
        'CRI 95+ and UGR < 19 glare-free optical standards',
        'Custom fabrication to any continuous length and geometric angle'
      ],
      ru: [
        'Современная линия сборки и обработки алюминиевых профилей в Баку',
        'Точные фотометрические расчеты и карты освещенности в Dialux Evo',
        'Стандарты оптики CRI 95+ и UGR < 19',
        'Индивидуальное производство любых размеров и геометрических форм'
      ]
    },
    images: {
      mainFacility: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
      workshop1: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=700&q=80',
      workshop2: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=700&q=80'
    },
    pillarsTitle: {
      az: 'Dəqiq Mühəndislik',
      en: 'Precision Engineering',
      ru: 'Точная Инженерия'
    },
    pillars: [
      {
        id: 'high-quality',
        label: {
          az: 'YÜKSƏK KEYFİYYƏT',
          en: 'HIGH QUALITY',
          ru: 'ВЫСОКОЕ КАЧЕСТВО'
        },
        desc: {
          az: 'Avropa standartlarına uyğun yüksək lümen çıxışı və CRI>95 fotometrik göstəricilər.',
          en: 'High lumen output and CRI>95 photometric standards compliant with European norms.',
          ru: 'Высокая светоотдача и фотометрические показатели CRI>95 по европейским стандартам.'
        }
      },
      {
        id: 'engineering',
        label: {
          az: 'DƏQİQ MÜHƏNDİSLİK',
          en: 'PRECISION ENGINEERING',
          ru: 'ТОЧНАЯ ИНЖЕНЕРИЯ'
        },
        desc: {
          az: 'Mikron səviyyəsində alüminium kəsimi, effektiv istilik ötürmə və uzunömürlü drayverlər.',
          en: 'Micron-level aluminum extrusion cutting, optimal thermal dissipation and premium drivers.',
          ru: 'Высокоточная резка алюминия, эффективный теплоотвод и долговечные драйверы.'
        }
      },
      {
        id: 'expert-support',
        label: {
          az: 'PEŞƏKAR DƏSTƏK',
          en: 'EXPERT SUPPORT',
          ru: 'ЭКСПЕРТНАЯ ПОДДЕРЖКА'
        },
        desc: {
          az: 'Layihələndirmə mərhələsindən tətbiqə qədər tam mühəndis və Dialux hesablama dəstəyi.',
          en: 'Comprehensive engineering guidance, project consulting and Dialux calculations from concept to install.',
          ru: 'Полная инженерная поддержка и расчеты в Dialux от проектирования до монтажа.'
        }
      }
    ]
  },

  contact: {
    title: {
      az: 'İŞIĞINIZI LAYİHƏLƏNDİRƏK.',
      en: 'LET US ENGINEER YOUR LIGHT.',
      ru: 'СПРОЕКТИРУЕМ ВАШ СВЕТ.'
    },
    subtitle: {
      az: 'Layihəniz haqqında danışın. Biz sizə uyğun işıqlandırma həllini hazırlayaq.',
      en: 'Tell us about your project. We will engineer the optimal architectural lighting solution.',
      ru: 'Расскажите о вашем проекте. Мы подготовим индивидуальное световое решение.'
    },
    phone: '+994 50 450 70 07',
    email: 'info@ecolife.az',
    address: {
      az: 'Bakı ş., Nərimanov r., Əhməd Rəcəbli küç. 46B',
      en: '46B Ahmad Rajabli St., Narimanov, Baku',
      ru: 'г. Баку, Наримановский р-н, ул. Ахмеда Раджабли 46B'
    },
    hours: {
      az: 'Bazar ertəsi - Şənbə: 09:00 - 18:00',
      en: 'Monday - Saturday: 09:00 - 18:00',
      ru: 'Понедельник - Суббота: 09:00 - 18:00'
    }
  },

  home: {
    heroTitleA: {
      az: 'işıq',
      en: 'the light',
      ru: 'архитектура'
    },
    heroTitleB: {
      az: 'memarlığı',
      en: 'architecture',
      ru: 'света'
    },
    heroDesc: {
      az: 'Müasir məkanlar üçün layihələndirilmiş arxitektur işıqlandırma.\nDəqiqlik, atmosfer və yüksək performans.',
      en: 'Architectural lighting engineered for contemporary spaces.\nPrecision, atmosphere and high performance.',
      ru: 'Архитектурное освещение для современных пространств.\nТочность, атмосфера и высокая производительность.'
    },
    heroCta: {
      az: 'Kolleksiyanı kəşf edin',
      en: 'Explore Collection',
      ru: 'Исследовать коллекцию'
    },
    desktopLampImage: '/hero-pendant-light-desktop.png',
    mobileLampImage: '/hero-pendant-light-mobile.png',
    discoveryTitleA: {
      az: 'arxitektur',
      en: 'architectural',
      ru: 'архитектурные'
    },
    discoveryTitleB: {
      az: 'kolleksiyalar',
      en: 'collections',
      ru: 'коллекции'
    },
    discoverySub: {
      az: 'Xətti, maqnit və profil işıqlandırma sistemləri.',
      en: 'Linear, magnetic and profile lighting systems.',
      ru: 'Линейные, магнитные и профильные системы.'
    },
    featuredEyebrow: {
      az: '02 — SEÇİLMİŞ SİSTEM',
      en: '02 — FEATURED SYSTEM',
      ru: '02 — ИЗБРАННАЯ СИСТЕМА'
    },
    featuredDesc: {
      az: 'Memarlıq layihələri üçün fasiləsiz xətti işıqlandırma xətləri, mikron dəqiqlikli alüminium kəsimi və parıltısız UGR<19 optika.',
      en: 'Seamless continuous linear lighting lines for architectural projects with micron-precision aluminum fabrication and glare-free optics.',
      ru: 'Бесшовные непрерывные линии освещения для архитектурных проектов с оптикой без бликов UGR<19.'
    },
    appsEyebrow: {
      az: '03 — TƏTBİQ SAHƏLƏRİ',
      en: '03 — APPLICATIONS',
      ru: '03 — СФЕРЫ ПРИМЕНЕНИЯ'
    },
    appsTitleA: {
      az: 'məkan və',
      en: 'space and',
      ru: 'пространство и'
    },
    appsTitleB: {
      az: 'atmosfer',
      en: 'atmosphere',
      ru: 'атмосфера'
    }
  }
};
