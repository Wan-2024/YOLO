<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getProjectBySlug, getProjectThemeBySlug } from '../data/portfolioContent'

const route = useRoute()

const project = computed(() => getProjectBySlug(route.params.slug))

const projectTheme = computed(() => getProjectThemeBySlug(project.value?.slug))

const themeVars = computed(() => ({
  '--project-accent': projectTheme.value.accent,
  '--project-accent-soft': projectTheme.value.soft,
  '--project-accent-border': projectTheme.value.border
}))

const activePreview = ref(null)

const getSafeShots = (shots) => (Array.isArray(shots) ? shots.filter(Boolean) : [])

const solutionDesignShots = computed(() => {
  const designShots = getSafeShots(project.value?.solutionDesigns)
  if (designShots.length) {
    return designShots
  }

  return getSafeShots(project.value?.screenshots)
})

const gallerySections = computed(() => {
  if (!project.value) {
    return []
  }

  const sections = [
    {
      key: 'result-gallery',
      title: '成果展示',
      description: '关键界面与流程展示',
      shots: getSafeShots(project.value.screenshots)
    },
    {
      key: 'solution-gallery',
      title: '方案设计',
      description: '设计思路与方案表达',
      shots: solutionDesignShots.value
    }
  ]

  return sections.filter((section) => section.shots.length > 0)
})

const openPreview = (sectionTitle, src, index) => {
  if (!src || !project.value) {
    return
  }

  activePreview.value = {
    src,
    sectionTitle,
    alt: `${project.value.title} ${sectionTitle} ${index + 1}`
  }
}

const closePreview = () => {
  activePreview.value = null
}

const handlePreviewBackdropClick = (event) => {
  if (event.target === event.currentTarget) {
    closePreview()
  }
}

const handleWindowKeydown = (event) => {
  if (event.key === 'Escape' && activePreview.value) {
    closePreview()
  }
}

const handleShotWheel = (event) => {
  const container = event.currentTarget
  if (!(container instanceof HTMLElement)) {
    return
  }

  const canScrollHorizontally = container.scrollWidth > container.clientWidth
  if (!canScrollHorizontally) {
    return
  }

  const horizontalDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
  if (!horizontalDelta) {
    return
  }

  container.scrollLeft += horizontalDelta
  event.preventDefault()
}

watch(
  () => route.params.slug,
  () => {
    closePreview()
  }
)

watch(activePreview, (preview) => {
  if (typeof document === 'undefined') {
    return
  }

  document.body.style.overflow = preview ? 'hidden' : ''
})

onMounted(() => {
  window.addEventListener('keydown', handleWindowKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleWindowKeydown)
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <section class="page-section section-reveal compact-detail-scale">
    <div class="page-container detail-wrap">
      <template v-if="project">
        <RouterLink to="/portfolio" class="text-link back-link">&larr; 返回项目列表</RouterLink>

        <header class="project-detail-hero glass-panel" :style="themeVars">
          <div class="project-detail-copy">
            <p class="eyebrow">Project Detail</p>
            <h1 class="section-title detail-title">{{ project.title }}</h1>
            <p class="section-description">{{ project.summary }}</p>

            <div class="tag-row project-detail-tags">
              <span v-for="item in project.techStack" :key="item" class="chip">{{ item }}</span>
            </div>
          </div>

          <div class="project-detail-cover-shell">
            <img :src="project.cover" :alt="project.title" class="project-detail-cover" />
          </div>
        </header>

        <div class="project-detail-grid">
          <article class="glass-panel detail-card project-detail-card" :style="themeVars">
            <h2 class="sub-title">项目背景</h2>
            <p>{{ project.background }}</p>
          </article>

          <article class="glass-panel detail-card project-detail-card" :style="themeVars">
            <h2 class="sub-title">我的角色</h2>
            <p>{{ project.role }}</p>
          </article>

          <article class="glass-panel detail-card project-detail-card project-detail-card-wide" :style="themeVars">
            <h2 class="sub-title">成果与影响</h2>
            <ul class="result-list">
              <li v-for="result in project.results" :key="result">{{ result }}</li>
            </ul>
          </article>
        </div>

        <section
          v-for="section in gallerySections"
          :key="section.key"
          class="glass-panel project-shot-section"
          :style="themeVars"
        >
          <div class="project-shot-head">
            <h2 class="sub-title">{{ section.title }}</h2>
            <p>{{ section.description }}</p>
          </div>
          <div class="project-shot-grid" :aria-label="`${section.title}图片列表，可左右滑动`" @wheel="handleShotWheel">
            <button
              v-for="(shot, index) in section.shots"
              :key="`${section.key}-${shot}-${index}`"
              type="button"
              class="project-shot-item"
              :aria-label="`查看${section.title}第${index + 1}张图片`"
              @click="openPreview(section.title, shot, index)"
            >
              <img :src="shot" :alt="`${project.title} ${section.title}`" class="project-shot-image" />
            </button>
          </div>
          <p class="project-shot-tip">左右滑动查看更多，点击图片可查看完整大图。</p>
        </section>

        <div
          v-if="activePreview"
          class="project-image-modal-overlay"
          role="dialog"
          aria-modal="true"
          :aria-label="`${activePreview.sectionTitle}大图预览`"
          @click="handlePreviewBackdropClick"
        >
          <article class="project-image-modal">
            <header class="project-image-modal-head">
              <p class="project-image-modal-title">{{ activePreview.sectionTitle }}</p>
              <button type="button" class="project-image-modal-close" aria-label="关闭图片预览" @click="closePreview">×</button>
            </header>
            <div class="project-image-modal-body">
              <img :src="activePreview.src" :alt="activePreview.alt" class="project-image-modal-image" />
            </div>
          </article>
        </div>
      </template>

      <template v-else>
        <article class="glass-panel not-found-card">
          <h1 class="section-title">项目不存在</h1>
          <p>该项目链接可能已变更，你可以先返回项目页查看全部内容。</p>
          <RouterLink to="/portfolio" class="btn btn-primary">回到 Portfolio</RouterLink>
        </article>
      </template>
    </div>
  </section>
</template>
