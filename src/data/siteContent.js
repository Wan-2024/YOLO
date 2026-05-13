import { outdoorDetailListSummaries } from './outdoorDetailContent'
import { musicShareDatabase } from './musicShareDatabase'
import { photographyItems } from './photographyDetailContent'
import { getTimelinePreview } from './aboutTimelineContent'
import { getReadingShareBooks } from './readingContentDetail'
import { getShowShareItems } from './showShareDatabase'
import { getSnippetItems } from './snippetsContent'

export const siteContent = {
  profile: {
    headline: "I'm YOLO",
    bio: '希望成为一个有趣的灵魂，做好玩的东西',
    avatar: '/TX.jpg',
    email: '787209294@qq.com',
    socials: [
      {
        name: 'GitHub',
        value: 'github.com/YOLO',
        link: 'https://github.com/Wan-2024'
      },
      {
        name: 'CSDN',
        value: '瑞士卷@',
        link: 'https://blog.csdn.net/2303_80166945?spm=1010.2135.3001.5343'
      },
      {
        name: '微信公众号',
        value: '拾小满',
        link: '#'
      }
    ]
  },
  timeline: getTimelinePreview(Number.POSITIVE_INFINITY),
  skills: [
    'html/css',
    'TypeScript',
    'Vite',
    'Pinia',
    'Node.js',
    'Figma',
    'Design System',
    'Motion Design',
    'Data Visualization',
    'Product Thinking',
    'A/B Testing',
    '用户研究'
  ],
  portfolioSection: {
    title: '\u9879\u76ee / \u4f5c\u54c1\u96c6',
    slogan: '\u4ece\u6784\u60f3\u5230\u5b9e\u73b0\uff0c\u6bcf\u4e2a\u9879\u76ee\u90fd\u662f\u4e00\u6b21\u5b8c\u6574\u7684\u5b9e\u8df5\u8bb0\u5f55'
  },
  sections: {
    writings: {
      eyebrow: 'WRITINGS',
      title: '笔记',
      description: '记录学习与思考的片段，沉淀属于自己的成长轨迹。',
      slogan: '记录学习与思考的片段，沉淀属于自己的成长轨迹。'
    },
    snippets: {
      title: '碎碎念',
      description: '日常想法和片刻感受。',
      slogan: '把那些短暂却真实的感受，好好收起来。'
    }
  },
  life: {
    music: musicShareDatabase,
    photography: photographyItems.map((item) => ({
      slug: item.slug,
      title: item.title,
      image: item.image
    })),
    outdoors: outdoorDetailListSummaries
  }
}

export const lifeModules = [
  {
    slug: 'reading',
    title: '\u8BFB\u4E66\u5206\u4EAB',
    description: '\u8BFB\u4E66\u5206\u4EAB\u7684\u56FE\u4E66\u4E0E\u9605\u8BFB\u7B14\u8BB0\u3002'
  },
  {
    slug: 'shows',
    title: '好剧分享',
    description: '在故事与镜头里，慢慢认识世界。'
  },
  {
    slug: 'music',
    title: '音乐分享',
    description: '最近单曲循环的歌与那一刻的心情。'
  },
  {
    slug: 'outdoors',
    title: '户外记录',
    description: '徒步、骑行与露营的真实记录。'
  },
  {
    slug: 'photography',
    title: '摄影',
    description: '沿途观察与镜头下的片段。'
  },
  {
    slug: 'snippets',
    title: siteContent.sections.snippets.title,
    description: siteContent.sections.snippets.description
  }
]

const lifeModuleMap = Object.fromEntries(
  lifeModules.map((moduleItem) => [moduleItem.slug, moduleItem])
)

export function getLifeModuleBySlug(moduleSlug) {
  const moduleMeta = lifeModuleMap[moduleSlug]
  if (!moduleMeta) {
    return null
  }

  let items
  if (moduleMeta.slug === 'reading') {
    items = getReadingShareBooks()
  } else if (moduleMeta.slug === 'shows') {
    items = getShowShareItems()
  } else if (moduleMeta.slug === 'snippets') {
    items = getSnippetItems()
  } else {
    items = siteContent.life[moduleMeta.slug]
  }
  if (!Array.isArray(items)) {
    return null
  }

  return {
    ...moduleMeta,
    items
  }
}

export function getLifeItemBySlug(moduleSlug, itemSlug) {
  if (typeof itemSlug !== 'string' || !itemSlug.trim()) {
    return null
  }

  const moduleData = getLifeModuleBySlug(moduleSlug)
  if (!moduleData) {
    return null
  }

  const normalizedItemSlug = itemSlug.trim()
  const item = moduleData.items.find((entry) => entry.slug === normalizedItemSlug)
  if (!item) {
    return null
  }

  return {
    module: moduleData,
    item
  }
}



