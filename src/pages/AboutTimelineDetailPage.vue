<script setup>
import { computed, ref } from 'vue'
import { CalendarDays, BookOpen, Flag, FolderOpen, Heart, LineChart, Rocket, Star } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { aboutTimelineContent, getTimelineMilestones } from '../data/aboutTimelineContent'

const timelineMilestones = ref([])
const timelineLoadError = ref(false)

try {
  timelineMilestones.value = getTimelineMilestones()
} catch (error) {
  timelineLoadError.value = true
  console.error('[AboutTimelineDetailPage] Failed to load timeline milestones.', error)
}

const hasTimelineMilestones = computed(() => timelineMilestones.value.length > 0)
const showTimelineFallback = computed(() => timelineLoadError.value || !hasTimelineMilestones.value)
const timelineFallbackTitle = computed(() => (
  timelineLoadError.value ? 'Timeline unavailable' : 'Timeline is empty'
))
const timelineFallbackDescription = computed(() => (
  timelineLoadError.value
    ? 'Timeline data failed to load. Please go back to About and try again later.'
    : 'No timeline milestones are available yet. You can go back to About for now.'
))
const timelineFooterText = computed(() => {
  const raw = typeof aboutTimelineContent.footerQuote === 'string'
    ? aboutTimelineContent.footerQuote.trim()
    : ''

  if (!raw) {
    return '成长不是一蹴而就，而是每一步都算数。'
  }

  return raw.replace(/^[“”"'`]+/, '').replace(/[“”"'`]+$/, '').trim()
})
const timelineFooterSign = ''

const iconMap = {
  calendar: CalendarDays,
  folder: FolderOpen,
  star: Star,
  chart: LineChart,
  heart: Heart,
  'book-open': BookOpen,
  rocket: Rocket,
  flag: Flag
}

const resolveIcon = (iconKey) => iconMap[iconKey] || Star
const formatTimelineDate = (dateText) => dateText.replace(/-/g, '.')
</script>

<template>
  <section class="page-section section-reveal about-timeline-v2-page">
    <div class="page-container detail-wrap about-timeline-v2-wrap">
      <RouterLink to="/about" class="text-link back-link">&larr; 返回关于页</RouterLink>

      <article class="about-timeline-v2-shell">
        <header class="about-timeline-v2-hero">
          <div class="about-timeline-v2-hero-main">
            <p class="about-timeline-v2-eyebrow">{{ aboutTimelineContent.hero.eyebrow }}</p>
            <h1 class="section-title about-timeline-v2-title">{{ aboutTimelineContent.hero.title }}</h1>
            <p class="about-timeline-v2-description">{{ aboutTimelineContent.hero.description }}</p>
          </div>
          <p class="about-timeline-v2-note">{{ aboutTimelineContent.hero.note }}</p>
        </header>

        <ul class="about-timeline-v2-stats" aria-label="成长统计卡片">
          <li v-for="item in aboutTimelineContent.stats" :key="item.key" class="about-timeline-v2-stat-card">
            <span class="about-timeline-v2-stat-icon" aria-hidden="true">
              <component :is="resolveIcon(item.icon)" />
            </span>
            <div>
              <p class="about-timeline-v2-stat-label">{{ item.label }}</p>
              <p class="about-timeline-v2-stat-value">{{ item.value }}</p>
              <p class="about-timeline-v2-stat-desc">{{ item.description }}</p>
            </div>
          </li>
        </ul>

        <section v-if="showTimelineFallback" class="about-timeline-v2-empty" aria-live="polite">
          <h2 class="about-timeline-v2-empty-title">{{ timelineFallbackTitle }}</h2>
          <p class="about-timeline-v2-empty-desc">{{ timelineFallbackDescription }}</p>
          <RouterLink to="/about" class="about-timeline-v2-empty-link text-link">&larr; Back to About</RouterLink>
        </section>

        <ol v-else class="about-timeline-v2-milestones" aria-label="成长路径时间线">
          <li
            v-for="item in timelineMilestones"
            :key="item.date + item.title"
            class="about-timeline-v2-milestone"
            :class="[`is-${item.side}`, { 'is-current': item.isCurrent }]"
          >
            <div class="about-timeline-v2-track" aria-hidden="true">
              <span class="about-timeline-v2-track-dot"></span>
              <span v-if="item.isCurrent" class="about-timeline-v2-track-now">NOW</span>
            </div>

            <div class="about-timeline-v2-milestone-body">
              <article class="about-timeline-v2-milestone-card">
                <p class="about-timeline-v2-milestone-date">{{ formatTimelineDate(item.date) }}</p>
                <h3 class="about-timeline-v2-milestone-title">{{ item.title }}</h3>
                <p class="about-timeline-v2-milestone-desc">{{ item.description }}</p>
              </article>

              <figure class="about-timeline-v2-milestone-media">
                <img :src="item.image" :alt="item.title" loading="lazy" />
              </figure>
            </div>
          </li>
        </ol>

        <section class="about-timeline-v2-focus-grid" aria-label="当前与未来">
          <article v-for="panel in aboutTimelineContent.focusPanels" :key="panel.key" class="about-timeline-v2-focus-card">
            <div class="about-timeline-v2-focus-head">
              <span class="about-timeline-v2-focus-icon" aria-hidden="true">
                <component :is="resolveIcon(panel.icon)" />
              </span>
              <h3>{{ panel.title }}</h3>
            </div>

            <ul>
              <li v-for="point in panel.points" :key="panel.key + point">{{ point }}</li>
            </ul>

            <figure v-if="panel.image" class="about-timeline-v2-focus-media">
              <img :src="panel.image" :alt="panel.title" loading="lazy" />
            </figure>
          </article>
        </section>

        <footer class="about-timeline-v2-footer">
          <p class="about-timeline-v2-footer-text">{{ timelineFooterText }}</p>
          <span>{{ timelineFooterSign }}</span>
        </footer>
      </article>
    </div>
  </section>
</template>



