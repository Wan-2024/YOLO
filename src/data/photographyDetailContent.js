export const photographyItems = [
  {
    slug: 'sunrise',
    title: '日出',
    image: '/public/imags/photo/1.jpg',
    gallery: [
      { src: '/public/imags/photo/1.jpg' },
      { src: '/public/imags/photo/3(1).jpg' },
      { src: '/public/imags/photo/3.jpg' },

    ],
    date: '2025.09.03',
    time: '6:20',
    location: '南岳 · 衡山',
    weather: '晴天',
    description: '日出时分。',
    quote: '日出时分。',
    device: 'Redmi Note 12 Speed Pro',
    lighting: '晨光',
    mood: '平静',
    music: 'Sparks',
    tags: ['日出', '山顶', '徒步碎片'],
    periodBucket: 'today'
  },
  {
    slug: 'sunset',
    title: '傍晚',
    image: '/public/imags/photo/6.jpg',
    gallery: [
      { src: '/public/imags/photo/6.jpg' },
      { src: '/public/imags/photo/8.jpg' },
    ],
    date: '2025.07.08',
    time: '19:42',
    location: '傍晚 · 校园',
    weather: '晴天',
    description: '饭后散步的悠闲',
    quote: '',
    device: 'Redmi Note 12 Speed Pro',
    lighting: '夕阳',
    mood: '放松',
    music: '小半',
    tags: ['傍晚', '胶片感', '校园', '散步'],
    periodBucket: 'yesterday'
  },
  {
    slug: 'Hibiscus flower',
    title: '海桐花',
    image: '/public/imags/photo/4.jpg',
    gallery: [
      { src: '/public/imags/photo/4.jpg' },
      { src: '/public/imags/photo/5.jpg' }
    ],
    date: '2026.04.15',
    time: '15:10',
    location: '校园 · 悠闲的下午',
    weather: '晴',
    description: '悠闲的下午',
    quote: '悠闲放松',
    device: 'Redmi Note 12 Speed Pro',
    lighting: '日光',
    mood: '治愈',
    music: '小半',
    tags: ['悠闲', , '慢节奏'],
    periodBucket: 'lastWeek'
  },
  {
    slug: 'mountain-view',
    title: '山脉图',
    image: '/public/imags/photo/11(1).jpg',
    gallery: [
      { src: '/public/imags/photo/11(1).jpg' },
      { src: '/public/imags/photo/11.jpg' },
    ],
    date: '2026.04.03',
    time: '14:22',
    location: '西岳 · 华山',
    weather: '晚霞',
    description: '感受山脉的壮阔',
    quote: '山脉辽阔，非常震撼',
    device: 'Redmi Note 12 Speed Pro',
    lighting: '逆光',
    mood: '壮阔',
    music: 'Welcome to New York',
    tags: ['徒步', '自然', '山脉'],
    periodBucket: 'lastWeek'
  },
  {
    slug: 'snowfall',
    title: '大雪',
    image: '/public/imags/photo/9.jpg',
    gallery: [
      { src: '/public/imags/photo/9.jpg' }
    ],
    date: '2025.12.12',
    time: '22：00',
    location: '雪景 · 校园',
    weather: '大学',
    description: '雪似乎能把一切都变干净',
    quote: '从图书馆出来，看到白茫茫的雪景，很美',
    device: 'Redmi Note 12 Pro',
    lighting: '夜景混合光',
    mood: '沉浸',
    music: 'Runaway',
    tags: ['雪景', '夜晚', '放松'],
    periodBucket: 'april'
  },
  {
    slug: 'camping-golden-hour',
    title: '光影',
    image: '/public/imags/photo/14.jpg',
    gallery: [
      { src: '/public/imags/photo/14.jpg' }
    ],
    date: '2026.01.15',
    time: '14:09',
    location: '校园 · 湖边',
    weather: '晴天',
    description: '冬日的阳光很暖',
    quote: '冬日的阳光温暖而不刺眼',
    device: 'Redmi Note 12 Speed Pro',
    lighting: '自然光',
    mood: '松弛',
    music: '情歌',
    tags: ['自然光', '悠闲', '校园'],
    periodBucket: 'april'
  },
]

export const photographyModuleContent = {
  hero: {
    kicker: 'LIFE MODULE',
    title: '摄影',
    description: '沿途观察与镜头下的片段。',
    quote: '有些风景，只适合路过时收藏。',
    totalShots: 128,
    totalShotsNote: '持续更新',
    visual: {
      mainImage: '/public/imags/photo/2.jpg',
      subImage: '/public/imags/photo/1.jpg',
    }
  },
  tags: ['城市漫步', '黄昏', '雨后', '海边风', '胶片感', '山路', '日常碎片'],
  featured: [
    {
      id: 'feature-1',
      photoSlug: 'mountain-road-after-rain',
      title: '嵖岈山',
      date: '2024.04',
      location: ' 嵖岈山',
      description: '水中倒影与山体的互动',
      image: '/public/imags/outdoor/C3.jpg',
    },
    {
      id: 'feature-2',
      photoSlug: 'city-dusk',
      title: '山顶日出',
      date: '2025.04.03',
      location: '衡山',
      description: '山顶日出美爆了',
      image: '/public/imags/outdoor/H5.jpg'
    },
    {
      id: 'feature-3',
      photoSlug: 'seaside-at-dawn',
      title: '海桐花',
      date: '2026.04.15',
      location: '校园',
      description: '悠闲的校园午后',
      image: '/public/imags/photo/4.jpg'
    }
  ],
  recent: {
    filters: [
      { id: 'all', label: '全部' },
      { id: 'today', label: '今天' },
      { id: 'yesterday', label: '昨天' },
      { id: 'lastWeek', label: '上周' },
      { id: 'april', label: '四月' }
    ]
  },
  journal: {
    title: '摄影小记',
    moreText: '更多',
    ctaText: '记录此刻',
    entries: [
      {
        id: 'journal-2026-05-06',
        date: '2025.09.02',
        text: '在桥上走走',
        image: '/public/imags/photo/15.jpg',
        photoSlug: 'seaside-at-dawn'
      },
      {
        id: 'journal-2026-05-05',
        date: '2023.07.03',
        text: '夕阳时分',
        image: '/public/imags/photo/16.jpg',
        photoSlug: 'mountain-road-after-rain'
      },
      {
        id: 'journal-2026-05-04',
        date: '2023.07.012',
        text: '某个夏日的午后',
        image: '/public/imags/photo/17.jpg',
        photoSlug: 'city-dusk'
      }
    ]
  }
}

export function getPhotographyItemBySlug(slug) {
  return photographyItems.find((item) => item.slug === slug) || null
}

export function getPhotographyModuleContent() {
  return photographyModuleContent
}
