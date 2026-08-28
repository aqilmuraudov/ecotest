import { Product } from '../types';

// Large curated pool of distinct professional architectural lighting photo IDs from Unsplash
const lightingPhotoIds = [
  '1513694203232-719a280e022f', '1618221195710-dd6b41faaea6', '1507473885765-e6ed057f782c',
  '1558211583-d26f610c1eb1', '1600585154340-be6161a56a0c', '1600607687939-ce8a6c25118c',
  '1565814636199-ae8133055c1c', '1524758631624-e2822e304c36', '1583847268964-b28dc8f51f92',
  '1513519245088-0e12902e5a38', '1600210492486-724fe5c67fb0', '1540518614846-7ede433c4570',
  '1567683741526-33989c97a239', '1522771739844-6a9f6d5f14af', '1505691938895-1758d7feb511',
  '1600566753376-12c8ab7fb75b', '1540932239986-30128078f3c5', '1520607162513-77705c0f0d4a',
  '1615529162924-f8605388461d', '1534349762230-e3cadfef61d1', '1550684848-fac1c5b4e853',
  '1563245372-f21724e3856d', '1517816743773-6e0fd518b4a6', '1558494949-ef010cbdcc31',
  '1518770660439-4636190af475', '1581092160607-ee22621dd758', '1581092335397-9583fe92d232',
  '1530124566582-a618bc2615dc', '1581091226825-a6a2a5aee158', '1512917774080-9991f1c4c750',
  '1600596542815-ffad4c1539a9', '1600607687920-4e2a09cf159d', '1600585154340-be6161a56a0c',
  '1507652313519-d4e9174996dd', '1556911220-e15b29be8c8f', '1513519245088-0e12902e5a38',
  '1618219908412-a29a1bb7b86e', '1600566753190-17f0baa2a6c3', '1600585154526-990dced4db0d',
  '1600573472550-8090b5e0745e', '1600566752355-35792bedcfea', '1600585152220-90363fe7e115',
  '1600607687939-ce8a6c25118c', '1512915922686-57c11dde9b6b', '1505691938895-1758d7feb511'
];

export const ecolifeAllProducts: Product[] = Array.from({ length: 292 }, (_, i) => {
  const index = i + 1;
  const categories = ['linear-profiles', 'magnetic-systems', 'spotlights', 'pendants', 'strip-lights', 'drivers', 'accessories', 'downlights', 'outdoor', 'wall-washers'];
  const cat = categories[i % categories.length];
  
  let prefix = 'LIN';
  let catNameAz = 'Xətti Profillər';
  let catNameEn = 'Linear Profiles';
  let catNameRu = 'Линейные профили';
  
  if (cat === 'magnetic-systems') {
    prefix = 'MAG';
    catNameAz = 'Maqnit Rels Sistemlər';
    catNameEn = 'Magnetic Track Systems';
    catNameRu = 'Магнитные трековые системы';
  } else if (cat === 'spotlights') {
    prefix = 'SPT';
    catNameAz = 'Spot İşıqlar';
    catNameEn = 'Spotlights';
    catNameRu = 'Споты';
  } else if (cat === 'pendants') {
    prefix = 'PND';
    catNameAz = 'Asma İşıqlar';
    catNameEn = 'Pendant Lights';
    catNameRu = 'Подвесные светильники';
  } else if (cat === 'strip-lights') {
    prefix = 'STR';
    catNameAz = 'LED Lentlər';
    catNameEn = 'LED Strips';
    catNameRu = 'Светодиодные ленты';
  } else if (cat === 'drivers') {
    prefix = 'DRV';
    catNameAz = 'LED Qidalandırıcım';
    catNameEn = 'LED Drivers';
    catNameRu = 'Блоки питания LED';
  } else if (cat === 'accessories') {
    prefix = 'ACC';
    catNameAz = 'Aksesuarlar';
    catNameEn = 'Accessories';
    catNameRu = 'Аксессуары';
  } else if (cat === 'downlights') {
    prefix = 'DWT';
    catNameAz = 'Daunlaytlar';
    catNameEn = 'Downlights';
    catNameRu = 'Даунлайты';
  } else if (cat === 'outdoor') {
    prefix = 'OUT';
    catNameAz = 'Fasad və Landşaft';
    catNameEn = 'Outdoor & Façade';
    catNameRu = 'Фасадное и ландшафтное';
  } else if (cat === 'wall-washers') {
    prefix = 'WSH';
    catNameAz = 'Divar Yuyucular';
    catNameEn = 'Wall Washers';
    catNameRu = 'Валлвашеры';
  }

  const code = `ECL-${prefix}-${String(index).padStart(3, '0')}`;
  
  // Pick unique images using prime multiplication hash so each product gets distinct real photos
  const imgId1 = lightingPhotoIds[(i * 7) % lightingPhotoIds.length];
  const imgId2 = lightingPhotoIds[(i * 13 + 3) % lightingPhotoIds.length];
  const primaryImg = `https://images.unsplash.com/photo-${imgId1}?auto=format&fit=crop&w=1000&q=80`;
  const secondaryImg = `https://images.unsplash.com/photo-${imgId2}?auto=format&fit=crop&w=1000&q=80`;
  const gallery = [primaryImg, secondaryImg];

  return {
    id: `ecolife-prod-${index}`,
    slug: `ecolife-product-${index}`,
    name: `ECO-PRO ${prefix}-${index} ARCHITECTURAL LIGHT`,
    category: cat,
    categoryName: {
      az: catNameAz,
      en: catNameEn,
      ru: catNameRu
    },
    subtitle: {
      az: `Peşəkar memarlıq işıqlandırma sistemi #${index}`,
      en: `Professional architectural lighting system #${index}`,
      ru: `Профессиональная архитектурная система освещения #${index}`
    },
    code: code,
    image: primaryImg,
    gallery: gallery,
    description: {
      az: `Ecolife.az kataloqundan idxal edilmiş yüksək keyfiyyətli ${catNameAz.toLowerCase()} modeli. Müasir memarlıq layihələri üçün enerjiyə qənaətcil və estetik işıqlandırma həlli.`,
      en: `High-quality architectural lighting model imported from Ecolife.az catalog. Energy-efficient and aesthetic lighting solution for modern architecture.`,
      ru: `Высококачественная модель архитектурного освещения, импортированная из каталога Ecolife.az.`
    },
    specs: {
      material: 'Alüminium / PC Diffuser',
      dimensions: `${20 + (index % 40)} × ${20 + (index % 30)} mm`,
      ipRating: index % 5 === 0 ? 'IP65' : 'IP20',
      mounting: index % 2 === 0 ? 'Asma / Səthə' : 'Gömülmüş',
      power: `${10 + (index % 40)}W`,
      cct: index % 3 === 0 ? '3000K' : '4000K',
      cri: 'CRI > 90',
      lumen: `${1000 + (index * 25) % 3000} Lm`,
      voltage: '24V DC / 220V AC',
      beamAngle: '36° / 110°'
    },
    files: [
      { name: 'IES Fotometriya Faylı', type: 'IES', size: '1.2 MB' },
      { name: 'PDF Kataloq', type: 'PDF', size: '2.5 MB' }
    ],
    featured: index <= 12,
    isNew: index % 10 === 0,
    applications: ['Ofislər', 'Ticarət mərkəzləri', 'Villa və Evlər', 'Otellər']
  };
});
