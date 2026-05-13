<script setup>
import { computed } from 'vue'
import { ArrowRight, Code2, Coffee, FolderOpen, Github, Heart, Leaf, Mail, PenLine, Star, UserRound } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { getTimelinePreview } from '../data/aboutTimelineContent'
import { siteContent } from '../data/siteContent'

const introStatement = '做有温度但不喧哗的产品表达，持续关注信息秩序、阅读体验与真实使用场景。'

const ABOUT_TIMELINE_PREVIEW_LIMIT = 5
const timelinePreview = computed(() => getTimelinePreview(ABOUT_TIMELINE_PREVIEW_LIMIT))
const ABOUT_SKILL_PREVIEW_LIMIT = 3

const skillGroupDefinitions = [
  {
    key: 'frontend',
    title: '前端开发',
    icon: FolderOpen,
    entries: ['Vue 3', 'TypeScript', 'Node.js', 'Pinia', 'HTML / CSS', 'Vite', '小程序开发', '响应式布局']
  },
  {
    key: 'design',
    title: 'UI / 设计',
    icon: PenLine,
    entries: ['Figma', 'Design System', 'Motion Design', '界面审美', '交互设计', '图标设计', '动效实现']
  },
  {
    key: 'product',
    title: '产品能力',
    icon: UserRound,
    entries: ['用户研究', '信息架构', '产品思维', '需求拆解', 'A/B Testing', '数据分析', '原型设计']
  },
  {
    key: 'principle',
    title: '开发风格',
    icon: Star,
    entries: ['细化开发', '低干扰设计', '细节驱动', '统一视觉语言', '轻量交互']
  },
  {
    key: 'creative',
    title: '创作表达',
    icon: Heart,
    entries: ['极简设计', '留白感', '治愈系', '校园风格', '轻交互', '情绪化表达', '生活记录', '自然光影']
  },
  {
    key: 'inspiration',
    title: '灵感来源',
    icon: Coffee,
    entries: ['摄影', '音乐', '天空与云层', '日常碎片', '户外记录']
  },
  {
    key: 'exploration',
    title: '当前探索',
    icon: Leaf,
    entries: ['个人主页', 'UI 设计', '动效', '持续成长']
  }
]

const skillGroups = computed(() =>
  skillGroupDefinitions.map((group) => ({
    key: group.key,
    title: group.title,
    icon: group.icon,
    entries: group.entries.slice(0, ABOUT_SKILL_PREVIEW_LIMIT)
  }))
)

const identityBadges = computed(() => [
  {
    key: 'value',
    title: '长期主义者',
    subtitle: '持续创造价值',
    icon: Star
  },
  {
    key: 'builder',
    title: '产品驱动开发',
    subtitle: '技术服务产品',
    icon: Code2
  },
  {
    key: 'growth',
    title: '持续学习者',
    subtitle: '保持好奇与成长',
    icon: Leaf
  }
])

const contactItems = computed(() => {
  const profileEmail = siteContent.profile.email

  const socialItems = siteContent.profile.socials.map((item) => {
    const lowerName = item.name.toLowerCase()
    const isGithub = lowerName.includes('github')
    const isCsdn = lowerName.includes('csdn')
    const isWechat = item.name.includes('\u5FAE\u4FE1')

    return {
      key: item.name,
      label: item.name,
      value: item.value,
      link: item.link,
      external: item.link.startsWith('http'),
      icon: isGithub ? Github : Heart,
      iconImage: isGithub ? '/public/imags/github.jpg' : isCsdn ? '/public/imags/csdn.jpg' : isWechat ? '/public/imags/wechat.jpg' : ''
    }
  })

  return [
    {
      key: 'email',
      label: 'Email',
      value: profileEmail,
      link: `mailto:${profileEmail}`,
      external: false,
      icon: Mail,
      iconImage: '/public/imags/qqemil.jpg'
    },
    ...socialItems
  ]
})

const formatTimelineDate = (dateText) => {
  return dateText.replace(/-/g, '.')
}
</script>

<template>
  <section class="page-section section-reveal">
    <div class="page-container about-v2-shell">
      <header class="about-v2-hero">
        <div class="about-v2-hero-main">
          <p class="about-v2-eyebrow">
            <span class="about-v2-eyebrow-dot" aria-hidden="true"></span>
            ABOUT ME
          </p>
          <h1 class="section-title about-v2-title">
            关于我
          </h1>
          <p class="about-v2-lead">
            用户产品和技术，让<span>学习与生活</span>更有节奏感。
          </p>
          <p class="about-v2-body">{{ siteContent.profile.bio }}</p>
          <p class="about-v2-body">{{ introStatement }}</p>
        </div>

        <div class="about-v2-hero-side">
          <div class="about-v2-avatar-wrap">
            <img :src="siteContent.profile.avatar" :alt="siteContent.profile.headline" class="about-v2-avatar" />
          </div>

          <ul class="about-v2-badge-list">
            <li v-for="badge in identityBadges" :key="badge.key" class="about-v2-badge">
              <span class="about-v2-badge-icon">
                <component :is="badge.icon" aria-hidden="true" />
              </span>
              <div>
                <p class="about-v2-badge-title">{{ badge.title }}</p>
                <p class="about-v2-badge-subtitle">{{ badge.subtitle }}</p>
              </div>
            </li>
          </ul>
        </div>
      </header>

      <div class="about-v2-grid">
        <article class="glass-panel about-v2-card about-v2-timeline-card">
          <div class="about-v2-card-head">
            <h2 class="about-v2-card-title">
              <FolderOpen class="about-v2-card-icon" aria-hidden="true" />
              成长路径
            </h2>
            <RouterLink to="/about/timeline" class="about-v2-card-link lift-click" aria-label="Go to About timeline detail page">
              成长路径详情
              <ArrowRight class="about-v2-link-icon" aria-hidden="true" />
            </RouterLink>
          </div>

          <p class="about-v2-card-note">每一步探索都是向理想更靠近一步。</p>

          <ol class="about-v2-timeline-list">
            <li v-for="item in timelinePreview" :key="item.date + item.title" class="about-v2-timeline-item">
              <p class="about-v2-timeline-date">{{ formatTimelineDate(item.date) }}</p>
              <div class="about-v2-timeline-content">
                <h3>{{ item.title }}</h3>
                <p>{{ item.description }}</p>
              </div>
            </li>
          </ol>
        </article>

        <section class="glass-panel about-v2-card about-v2-skills-card">
          <div class="about-v2-card-head">
            <h2 class="about-v2-card-title">
              <PenLine class="about-v2-card-icon" aria-hidden="true" />
              技能图谱
            </h2>
            <RouterLink to="/about/skills" class="about-v2-card-link lift-click" aria-label="Go to About skills detail page">
              查看更多
              <ArrowRight class="about-v2-link-icon" aria-hidden="true" />
            </RouterLink>
          </div>

          <p class="about-v2-card-note">我常用的工具与方法。</p>

          <div class="about-v2-skill-groups">
            <article v-for="group in skillGroups" :key="group.key" class="about-v2-skill-group">
              <h3 class="about-v2-skill-group-title">
                <component :is="group.icon" class="about-v2-group-icon" aria-hidden="true" />
                {{ group.title }}
              </h3>
              <div class="about-v2-skill-tags">
                <span v-for="skill in group.entries" :key="group.key + skill" class="about-v2-skill-pill">
                  {{ skill }}
                </span>
              </div>
            </article>
          </div>
        </section>

        <section class="glass-panel about-v2-card about-v2-contact-card">
          <div class="about-v2-card-head">
            <h2 class="about-v2-card-title">
              <Mail class="about-v2-card-icon" aria-hidden="true" />
              联系我
            </h2>
            <RouterLink to="/about/contact" class="about-v2-card-link lift-click" aria-label="Go to About contact detail page">
              一起做点有意思的事
              <ArrowRight class="about-v2-link-icon" aria-hidden="true" />
            </RouterLink>
          </div>

          <p class="about-v2-card-note">如果你有想法或项目，欢迎交流合作。</p>

          <ul class="about-v2-contact-list">
            <li v-for="item in contactItems" :key="item.key" class="about-v2-contact-item">
              <span class="about-v2-contact-icon" :class="{ 'about-v2-contact-icon--image': item.iconImage }">
                <img v-if="item.iconImage" :src="item.iconImage" :alt="item.label" class="about-v2-contact-icon-image" />
                <component v-else :is="item.icon" aria-hidden="true" />
              </span>
              <span class="about-v2-contact-label">{{ item.label }}</span>
              <a
                :href="item.link"
                class="about-v2-contact-link"
                :target="item.external ? '_blank' : undefined"
                :rel="item.external ? 'noreferrer' : undefined"
              >
                {{ item.value }}
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </section>
</template>



