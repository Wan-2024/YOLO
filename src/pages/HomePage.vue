<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Coffee,
  FolderOpen,
  Github,
  Heart,
  Mail,
  PenLine,
  UserRound
} from 'lucide-vue-next'
import { RouterLink, useRouter } from 'vue-router'
import { getTimelinePreview } from '../data/aboutTimelineContent'
import { siteContent } from '../data/siteContent'
import { getProjectThemeBySlug, portfolioProjects } from '../data/portfolioContent'
import { getReadingShareBooks } from '../data/readingContentDetail'
import { getShowShareItems } from '../data/showShareDatabase'
import { writings } from '../data/writingsContent'

const slides = [
  { key: 'home', label: 'Home' },
  { key: 'about', label: 'About' },
  { key: 'portfolio', label: 'Portfolio' },
  { key: 'writings', label: 'Writings' },
  { key: 'life', label: 'Life' }
]

const carouselRef = ref(null)
const slideRefs = ref([])
const activeSlideIndex = ref(0)
const prefersReducedMotion = ref(false)
const router = useRouter()

let slideObserver
const slideStates = new Map()
const slideIndexMap = new WeakMap()

const isCurtainOpen = computed(() => activeSlideIndex.value > 0)

const aboutTimeline = computed(() => getTimelinePreview(5))
const aboutSkillsPreview = computed(() => siteContent.skills.slice(0, 8))
const aboutContactPreview = computed(() => {
  const email = siteContent.profile.email
  const socialEntries = siteContent.profile.socials.slice(0, 2).map((item) => ({
    key: item.name,
    label: item.name,
    value: item.value,
    link: item.link,
    external: item.link.startsWith('http'),
    icon: item.name.toLowerCase().includes('github') ? Github : Heart
  }))

  return [
    {
      key: 'email',
      label: 'Email',
      value: email,
      link: `mailto:${email}`,
      external: false,
      icon: Mail
    },
    ...socialEntries
  ]
})
const featuredProjects = computed(() =>
  portfolioProjects.slice(0, 3).map((project) => ({
    ...project,
    theme: getProjectThemeBySlug(project.slug)
  }))
)

const goToProjectDetail = (slug) => {
  router.push(`/portfolio/${slug}`)
}

const latestWritings = computed(() => {
  return [...writings]
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
    .slice(0, 4)
})

const HOME_READING_EXCERPT_LIMIT = 20

const truncateHomeLifePreview = (text) => {
  const sourceText = (text || '').trim()
  const chars = Array.from(sourceText)

  if (chars.length <= HOME_READING_EXCERPT_LIMIT) {
    return sourceText
  }

  return chars.slice(0, HOME_READING_EXCERPT_LIMIT).join('') + '...'
}

const getHomeReadingExcerpt = (reading) => truncateHomeLifePreview(reading?.excerpt || reading?.intro || reading?.note || '')

const lifePreviewCards = computed(() => {
  const reading = getReadingShareBooks()[0]
  const show = getShowShareItems()[0]
  const music = siteContent.life.music[0]
  const photo = siteContent.life.photography[0]

  return [
    {
      key: 'reading',
      title: '读书分享',
      highlight: reading?.title || 'Reading Notes',
      description: getHomeReadingExcerpt(reading) || '持续记录阅读中的想法与触发点。',
      to: '/life#reading-share',
      icon: BookOpen
    },
    {
      key: 'shows',
      title: '好剧分享',
      highlight: show?.title || 'Show Journal',
      description: truncateHomeLifePreview(show?.reason || '\u6536\u85cf\u90a3\u4e9b\u503c\u5f97\u53cd\u590d\u56de\u770b\u7684\u53d9\u4e8b\u8282\u594f\u3002'),
      to: '/life/shows',
      icon: Heart
    },
    {
      key: 'music',
      title: '音乐分享',
      highlight: music?.title || 'Music Notes',
      description: truncateHomeLifePreview(music?.note || '\u6536\u96c6\u6700\u8fd1\u5faa\u73af\u7684\u6b4c\u548c\u5f53\u4e0b\u7684\u5fc3\u60c5\u3002'),
      to: '/life/music',
      icon: PenLine
    },
    {
      key: 'photography',
      title: '摄影',
      highlight: photo?.title || 'Photo Essays',
      description: truncateHomeLifePreview(photo?.note || '\u7528\u5f71\u50cf\u6536\u85cf\u8def\u4e0a\u7684\u5149\u548c\u98ce\u3002'),
      to: '/life/photography',
      icon: Coffee
    }
  ]
})

const heroStats = [
  { label: '独立项目', value: '2+' },
  { label: '代码提交', value: '10k+' },
  { label: '技术栈', value: '5+' }
]

const heroSocials = [
  {
    key: 'github',
    label: 'GitHub',
    icon: Github,
    link: siteContent.profile.socials[0]?.link || 'https://github.com',
    external: true
  },
  {
    key: 'insight',
    label: '知识沉淀',
    icon: BookOpen,
    link: siteContent.profile.socials[1]?.link || '#',
    external: false
  },
  {
    key: 'connect',
    label: '交流',
    icon: UserRound,
    link: siteContent.profile.socials[2]?.link || '#',
    external: false
  },
  {
    key: 'email',
    label: 'Email',
    icon: Mail,
    link: `mailto:${siteContent.profile.email}`,
    external: false
  }
]

const curtainCards = [
  {
    key: 'portfolio',
    title: siteContent.portfolioSection.title,
    description: '从构想到实现，每个项目都是一次完整的实践记录',
    to: '/portfolio',
    icon: FolderOpen,
    shiftClass: 'shift-left'
  },
  {
    key: 'about',
    title: '关于我',
    description: '希望成为一个有趣的灵魂，做好玩的东西',
    to: '/about',
    icon: UserRound,
    shiftClass: 'shift-left-soft'
  },
  {
    key: 'writings',
    title: siteContent.sections.writings.title,
    description: siteContent.sections.writings.slogan,
    to: '/writings',
    icon: PenLine,
    shiftClass: 'shift-right-soft'
  },
  {
    key: 'life',
    title: '生活馆',
    description: '把喜欢的事慢慢收集，记录生活里的点滴美好与片刻热爱。',
    to: '/life',
    icon: Coffee,
    shiftClass: 'shift-right'
  }
]

const setSlideRef = (element, index) => {
  if (element) {
    slideRefs.value[index] = element
  }
}

const disconnectSlideObserver = () => {
  if (slideObserver) {
    slideObserver.disconnect()
    slideObserver = undefined
  }

  slideStates.clear()
}

const resolveActiveSlide = () => {
  const visibleSlides = Array.from(slideStates.entries()).filter(([, state]) => state.isIntersecting)

  if (!visibleSlides.length) {
    return
  }

  visibleSlides.sort((left, right) => {
    if (right[1].intersectionRatio !== left[1].intersectionRatio) {
      return right[1].intersectionRatio - left[1].intersectionRatio
    }

    return Math.abs(left[1].top) - Math.abs(right[1].top)
  })

  activeSlideIndex.value = visibleSlides[0][0]
}

const observeSlides = async () => {
  disconnectSlideObserver()
  await nextTick()

  const track = carouselRef.value
  const slidesInDom = slideRefs.value.filter(Boolean)

  if (!track || !slidesInDom.length) {
    return
  }

  slideObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const index = slideIndexMap.get(entry.target)
        if (typeof index !== 'number') {
          return
        }

        slideStates.set(index, {
          isIntersecting: entry.isIntersecting,
          intersectionRatio: entry.intersectionRatio,
          top: entry.boundingClientRect.top
        })
      })

      resolveActiveSlide()
    },
    {
      root: track,
      threshold: [0.38, 0.56, 0.75, 1]
    }
  )

  slidesInDom.forEach((slideElement, index) => {
    slideIndexMap.set(slideElement, index)
    slideObserver.observe(slideElement)
  })
}

const scrollToSlide = (index) => {
  const track = carouselRef.value
  const target = slideRefs.value[index]

  if (!track || !target) {
    return
  }

  activeSlideIndex.value = index

  track.scrollTo({
    top: target.offsetTop,
    behavior: prefersReducedMotion.value ? 'auto' : 'smooth'
  })
}

onMounted(() => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  observeSlides()
})

onBeforeUnmount(() => {
  disconnectSlideObserver()
})
</script>

<template>
  <section class="home-carousel-page section-reveal">
    <div class="home-carousel-shell">
      <nav class="home-carousel-dots" aria-label="Home section progress">
        <button
          v-for="(slide, index) in slides"
          :key="slide.key"
          type="button"
          class="home-carousel-dot-btn"
          :class="{ active: activeSlideIndex === index }"
          :aria-label="`Jump to ${slide.label}`"
          :aria-current="activeSlideIndex === index ? 'true' : undefined"
          @click="scrollToSlide(index)"
        >
          <span class="home-carousel-dot"></span>
        </button>
      </nav>

      <div ref="carouselRef" class="home-carousel-track" aria-live="polite">
        <section :ref="(element) => setSlideRef(element, 0)" class="home-carousel-slide home-carousel-slide-home">
          <div class="page-container home-carousel-content home-hero-stage" :class="{ 'curtain-open': isCurtainOpen }">
            <div class="home-hero-main">
              <div class="home-hero-copy">
                <p class="home-hero-greeting">Hi, 欢迎来到我的主页 👋</p>
                <h1 class="home-hero-title">I'm YOLO</h1>
                <p class="home-hero-role">产品设计 /项目策划 / 审美创作</p>
                <p class="home-hero-description">
                  正在构建个人品牌体系，<br />
                  专注于审美的创作，为用户提供更优质的体验。
                </p>

                <div class="home-hero-actions">
                  <RouterLink to="/portfolio" class="btn btn-primary lift-click">
                    查看作品集
                    <ArrowRight class="btn-icon" aria-hidden="true" />
                  </RouterLink>
                  <a :href="`mailto:${siteContent.profile.email}`" class="btn btn-outline lift-click">
                    <Mail class="btn-icon" aria-hidden="true" />
                    联系我
                  </a>
                </div>

                <div class="home-hero-socials">
                  <a
                    v-for="item in heroSocials"
                    :key="item.key"
                    :href="item.link"
                    :target="item.external ? '_blank' : undefined"
                    :rel="item.external ? 'noreferrer' : undefined"
                    class="home-hero-social-btn lift-click"
                    :aria-label="item.label"
                  >
                    <component :is="item.icon" class="home-hero-social-icon" aria-hidden="true" />
                  </a>
                </div>

                <ul class="home-hero-stats">
                  <li v-for="stat in heroStats" :key="stat.label">
                    <strong>{{ stat.value }}</strong>
                    <span>{{ stat.label }}</span>
                  </li>
                </ul>
              </div>

              <div class="home-hero-visual">
                <div class="home-hero-orbit home-hero-orbit-outer" aria-hidden="true"></div>
                <div class="home-hero-orbit home-hero-orbit-inner" aria-hidden="true"></div>

                <div class="home-hero-avatar-shell glass-panel">
                  <img :src="siteContent.profile.avatar" alt="Profile" class="home-hero-avatar" />
                </div>

                <span class="home-hero-badge home-hero-badge-top">
                  <Heart class="home-hero-badge-icon" aria-hidden="true" />
                  热爱创造
                </span>
                <span class="home-hero-badge home-hero-badge-left">
                  <BookOpen class="home-hero-badge-icon" aria-hidden="true" />
                  持续学习
                </span>
                <span class="home-hero-badge home-hero-badge-bottom">
                  <UserRound class="home-hero-badge-icon" aria-hidden="true" />
                  长期主义
                </span>
              </div>
            </div>

            <button
              type="button"
              class="home-hero-scroll-hint home-hero-scroll-trigger"
              aria-label="Scroll to next section"
              @click="scrollToSlide(1)"
            >
              <ArrowDown class="home-hero-scroll-icon" />
              <span>Welcome</span>
            </button>

            <div class="home-hero-curtain-zone" :class="{ open: isCurtainOpen }" aria-hidden="true">
              <div class="home-hero-curtain-shell">
                <div class="home-hero-curtain">
                  <RouterLink
                    v-for="card in curtainCards"
                    :key="card.key"
                    :to="card.to"
                    class="home-curtain-card card-link-reset"
                    :class="card.shiftClass"
                  >
                    <div class="home-curtain-card-head">
                      <span class="home-curtain-icon-wrap">
                        <component :is="card.icon" class="home-curtain-icon" aria-hidden="true" />
                      </span>
                      <span class="home-curtain-arrow">
                        <ArrowRight class="home-curtain-arrow-icon" aria-hidden="true" />
                      </span>
                    </div>
                    <h3>{{ card.title }}</h3>
                    <p>{{ card.description }}</p>
                  </RouterLink>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section :ref="(element) => setSlideRef(element, 1)" class="home-carousel-slide">
          <div class="page-container home-carousel-content">
            <article class="home-carousel-panel glass-panel">
              <p class="eyebrow">AboutMe</p>
              <h2 class="section-title">关于我</h2>
              <div class="about-v2-grid home-about-v2-grid">
                <article class="glass-panel about-v2-card about-v2-timeline-card home-about-v2-card home-note-ref-card">
                  <div class="about-v2-card-head">
                    <h3 class="about-v2-card-title">
                      <FolderOpen class="about-v2-card-icon" aria-hidden="true" />
                      成长路径
                    </h3>
                  </div>

                  <ol class="about-v2-timeline-list">
                    <li v-for="item in aboutTimeline" :key="item.date + item.title" class="about-v2-timeline-item">
                      <p class="about-v2-timeline-date">{{ item.date }}</p>
                      <div class="about-v2-timeline-content">
                        <h3>{{ item.title }}</h3>
                        <p>{{ item.description }}</p>
                      </div>
                    </li>
                  </ol>
                </article>

                <section class="glass-panel about-v2-card home-about-v2-card home-note-ref-card">
                  <div class="about-v2-card-head">
                    <h3 class="about-v2-card-title">
                      <PenLine class="about-v2-card-icon" aria-hidden="true" />
                      技能展示
                    </h3>
                  </div>

                  <p class="about-v2-card-note">当前常用的能力与工具。</p>

                  <div class="about-v2-skill-tags home-about-v2-skill-tags">
                    <span v-for="skill in aboutSkillsPreview" :key="skill" class="about-v2-skill-pill">
                      {{ skill }}
                    </span>
                  </div>
                </section>

                <section class="glass-panel about-v2-card about-v2-contact-card home-about-v2-card home-note-ref-card">
                  <div class="about-v2-card-head">
                    <h3 class="about-v2-card-title">
                      <Mail class="about-v2-card-icon" aria-hidden="true" />
                      联系方式
                    </h3>
                  </div>

                  <p class="about-v2-card-note">欢迎交流想法，或一起做有意思的项目。</p>

                  <ul class="about-v2-contact-list home-about-v2-contact-list">
                    <li v-for="item in aboutContactPreview" :key="item.key" class="about-v2-contact-item">
                      <span class="about-v2-contact-icon">
                        <component :is="item.icon" aria-hidden="true" />
                      </span>
                      <span class="about-v2-contact-label">{{ item.label }}</span>
                      <a
                        :href="item.link"
                        class="about-v2-contact-link home-about-v2-contact-link"
                        :target="item.external ? '_blank' : undefined"
                        :rel="item.external ? 'noreferrer' : undefined"
                      >
                        {{ item.value }}
                      </a>
                    </li>
                  </ul>
                </section>
              </div>

              <RouterLink to="/about" class="btn btn-outline lift-click home-carousel-panel-link">
                查看关于我
              </RouterLink>
            </article>
          </div>
        </section>

        <section :ref="(element) => setSlideRef(element, 2)" class="home-carousel-slide">
          <div class="page-container home-carousel-content">
            <article class="home-carousel-panel glass-panel">
              <p class="eyebrow">Portfolio</p>
              <h2 class="section-title">{{ siteContent.portfolioSection.title }}</h2>

              <div class="home-carousel-project-grid">
                <article
                  v-for="project in featuredProjects"
                  :key="project.slug"
                  class="portfolio-card portfolio-card-compact home-portfolio-card home-note-ref-card glass-panel card-hover"
                  role="link"
                  tabindex="0"
                  :aria-label="`查看 ${project.title} 详情`"
                  @click="goToProjectDetail(project.slug)"
                  @keydown.enter.prevent="goToProjectDetail(project.slug)"
                  @keydown.space.prevent="goToProjectDetail(project.slug)"
                  :style="{
                    '--project-accent': project.theme.accent,
                    '--project-accent-soft': project.theme.soft,
                    '--project-accent-border': project.theme.border
                  }"
                >
                  <div class="portfolio-cover-shell">
                    <span class="portfolio-cover-badge">{{ project.techStack[0] }}</span>
                    <img :src="project.cover" :alt="project.title" class="portfolio-cover" />
                  </div>
                  <div class="portfolio-content">
                    <div class="tag-row portfolio-tag-row">
                      <span v-for="item in project.techStack.slice(0, 3)" :key="item" class="chip">{{ item }}</span>
                    </div>
                    <h3>{{ project.title }}</h3>
                    <p>{{ project.summary }}</p>
                    <div class="portfolio-card-actions">
                      <RouterLink :to="`/portfolio/${project.slug}`" class="portfolio-detail-link" @click.stop>
                        查看详情
                        <ArrowUpRight class="portfolio-detail-link-icon" aria-hidden="true" />
                      </RouterLink>
                    </div>
                  </div>
                </article>
              </div>

              <RouterLink to="/portfolio" class="btn btn-outline lift-click home-carousel-panel-link">
                浏览全部项目
              </RouterLink>
            </article>
          </div>
        </section>

        <section :ref="(element) => setSlideRef(element, 3)" class="home-carousel-slide">
          <div class="page-container home-carousel-content">
            <article class="home-carousel-panel glass-panel">
              <p class="eyebrow">Writings</p>
              <h2 class="section-title">{{ siteContent.sections.writings.title }}</h2>

              <div class="home-carousel-writing-grid">
                <RouterLink
                  v-for="writing in latestWritings"
                  :key="writing.slug"
                  :to="`/writings/${writing.slug}`"
                  class="home-carousel-mini-card card-link-reset lift-click"
                >
                  <div class="home-carousel-writing-meta">
                    <span>{{ writing.date }}</span>
                    <span class="chip chip-solid">{{ writing.category }}</span>
                  </div>
                  <h3>{{ writing.title }}</h3>
                  <p>{{ writing.excerpt }}</p>
                </RouterLink>
              </div>

              <RouterLink to="/writings" class="btn btn-outline lift-click home-carousel-panel-link">
                进入笔记页
              </RouterLink>
            </article>
          </div>
        </section>

        <section :ref="(element) => setSlideRef(element, 4)" class="home-carousel-slide">
          <div class="page-container home-carousel-content">
            <article class="home-carousel-panel glass-panel">
              <p class="eyebrow">Life</p>
              <h2 class="section-title">生活馆</h2>

              <div class="home-carousel-life-grid">
                <RouterLink
                  v-for="card in lifePreviewCards"
                  :key="card.key"
                  :to="card.to"
                  class="home-carousel-mini-card card-link-reset lift-click"
                >
                  <p class="home-carousel-life-kicker">
                    <component :is="card.icon" class="home-carousel-life-icon" aria-hidden="true" />
                    {{ card.title }}
                  </p>
                  <h3>{{ card.highlight }}</h3>
                  <p>{{ card.description }}</p>
                </RouterLink>
              </div>

              <RouterLink to="/life" class="btn btn-outline lift-click home-carousel-panel-link">
                进入生活馆
              </RouterLink>
            </article>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>





