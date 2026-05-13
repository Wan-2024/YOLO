export const aboutTimelineContent = {
  hero: {
    eyebrow: 'ABOUT TIMELINE',
    title: '成长路径详情',
    description: '每一步探索都是向理想更靠近一步',
    note: '记录每一次尝试。'
  },
  stats: [
    {
      key: 'duration',
      label: '成长时间',
      value: '2 年 +',
      description: '持续探索与成长',
      icon: 'calendar'
    },
    {
      key: 'projects',
      label: '完成项目',
      value: '3 +',
      description: '独立/参与多项目',
      icon: 'folder'
    },
    {
      key: 'skills',
      label: '掌握技能',
      value: '18 +',
      description: '技术与软技能并进',
      icon: 'star'
    },
    {
      key: 'records',
      label: '持续记录',
      value: '180 + 天',
      description: '持续学习与复盘',
      icon: 'chart'
    },
    {
      key: 'mission',
      label: '人生信条',
      value: '持续热爱',
      description: '保持好奇，保持创造',
      icon: 'heart'
    }
  ],
  milestones: [
    {
      date: '2026-05',
      title: '个人网站开发建设',
      description: 'AI 协助完成网站设计开发，进一步实现AI 辅助设计与开发的最佳实践，持续优化个人品牌建设。',
      image: '/public/imags/grow/6.png',
      side: 'right',
      isCurrent: true
    },
    {
      date: '2026-05',
      title: '建设工作室推广小程序',
      description: 'AI 协助完成小程序开发与推广，初步尝试运营推广',
      image: '/public/imags/project-shot1.png',
      side: 'left',
      isCurrent: false
    },
    {
      date: '2026-03',
      title: '完成拾序录小程序开发',
      description: 'AI 协助完成小程序开发，深度学习 AI 辅助设计与开发的最佳实践,持续优化AI学习实践路线',
      image: '/public/imags/project-shot.png',
      side: 'right',
      isCurrent: false
    },

    {
      date: '2025-10',
      title: '正式退出 ACM 校队',
      description: '结束算法阶段经历，专注于自我探索，开启新的职业探索阶段。',
      image: '/public/imags/grow/5.jpg',
      side: 'left',
      isCurrent: false
    },
    {
      date: '2024-10',
      title: '担任 ACM 社团副社长',
      description: '负责队员训练选题与技术答疑，组织协调社团活动及竞赛开展，提升团队合作精神与活动效率。',
      image: '/public/imags/grow/4.jpg',
      side: 'right',
      isCurrent: false
    },
    {
      date: '2024-04',
      title: '尝试户外徒步',
      description: '正式开启 cityWalk，探索户外旅程，在行走中思考，在风景中成长。',
      image: '/public/imags/grow/3.jpg',
      side: 'left',
      isCurrent: false
    },
    {
      date: '2023-12',
      title: '进入校 ACM 校队开启算法生活',
      description: '不断学习算法知识，参与 ICPC、CCPC 等竞赛，提升问题解决能力与团队合作能力。',
      image: '/public/imags/grow/2.jpg',
      side: 'right',
      isCurrent: false
    },
    {
      date: '2023-09',
      title: '大学生活开启',
      description: '持续学习并关注行业动态，提升自我能力，为未来保持长期投入与期待。',
      image: '/public/imags/grow/1.jpg',
      side: 'left',
      isCurrent: false
    }
  ],
  focusPanels: [
    {
      key: 'learning',
      title: '正在学习',
      points: ['深入学习 AI 辅助开发技术', '提升前端与全栈开发能力', '学习 UI/UX 设计与用户体验', '探索更多创新技术与工具'],
      icon: 'book-open'
    },
    {
      key: 'doing',
      title: '正在进行',
      points: ['个人作品集网站持续优化', 'AI + Web 项目开发实践', '内容创作与技术分享', '品牌建设与运营探索'],
      icon: 'rocket'
    },
    {
      key: 'future',
      title: '未来方向',
      points: ['成为优秀的全栈开发者', '打造有影响力的个人品牌', '用技术创造有价值的产品', '持续学习，探索无限可能'],
      icon: 'flag'
    }
  ],
  footerQuote: '“成长不是一蹴而就，而是每一步都算数。”'
}

const TIMELINE_FALLBACK_IMAGE = '/public/imags/project-cover.jpg'

const normalizeMilestone = (item, index) => {
  const safeItem = item && typeof item === 'object' ? item : {}
  const fallbackIndexText = String(index + 1).padStart(2, '0')

  const date = typeof safeItem.date === 'string' && safeItem.date.trim()
    ? safeItem.date.trim()
    : `1970-01-${fallbackIndexText}`
  const title = typeof safeItem.title === 'string' && safeItem.title.trim()
    ? safeItem.title.trim()
    : `成长节点 ${fallbackIndexText}`
  const description = typeof safeItem.description === 'string' && safeItem.description.trim()
    ? safeItem.description.trim()
    : '暂无描述'
  const image = typeof safeItem.image === 'string' && safeItem.image.trim()
    ? safeItem.image.trim()
    : TIMELINE_FALLBACK_IMAGE
  const side = safeItem.side === 'left' ? 'left' : 'right'
  const isCurrent = safeItem.isCurrent === true
  const tags = Array.isArray(safeItem.tags)
    ? safeItem.tags
      .filter((tag) => typeof tag === 'string' && tag.trim())
      .map((tag) => tag.trim())
    : []

  return {
    date,
    title,
    description,
    image,
    side,
    isCurrent,
    tags
  }
}

const rawMilestones = Array.isArray(aboutTimelineContent.milestones)
  ? aboutTimelineContent.milestones
  : []
const normalizedMilestones = rawMilestones
  .map((item, index) => normalizeMilestone(item, index))
  .sort((left, right) => right.date.localeCompare(left.date))

export function getTimelineMilestones() {
  return normalizedMilestones.map((item) => ({
    ...item,
    tags: [...item.tags]
  }))
}

export function getTimelinePreview(limit = 5) {
  const safeLimit = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : normalizedMilestones.length

  return normalizedMilestones.slice(0, safeLimit).map((item) => ({
    date: item.date,
    title: item.title,
    description: item.description
  }))
}
