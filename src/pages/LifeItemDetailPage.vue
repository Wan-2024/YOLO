<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  Activity,
  Bike,
  BookCopy,
  BookOpenCheck,
  BookOpenText,
  BookText,
  CalendarDays,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Footprints,
  Flame,
  MapPin,
  MapPinned,
  Mountain,
  NotebookPen,
  Play,
  Quote,
  Route,
  Sun,
  Star,
  TentTree,
  Thermometer,
  Trees,
  Tv,
  UserRound,
  Wind
} from 'lucide-vue-next'
import { getLifeItemBySlug, getLifeModuleBySlug } from '../data/siteContent'
import { getOutdoorDetailBySlug } from '../data/outdoorDetailContent'
import { getReadingContentBySlug } from '../data/readingContentDetail'
import { getPhotographyItemBySlug } from '../data/photographyDetailContent'

const route = useRoute()

const lifeDetail = computed(() => getLifeItemBySlug(route.params.moduleSlug, route.params.itemSlug))

const fallbackModulePath = computed(() => {
  const moduleData = getLifeModuleBySlug(route.params.moduleSlug)
  if (!moduleData) {
    return '/life'
  }

  if (moduleData.slug === 'reading') {
    return '/life#reading-share'
  }

  return `/life/${moduleData.slug}`
})

const modulePath = computed(() => {
  if (!lifeDetail.value) {
    return fallbackModulePath.value
  }

  if (lifeDetail.value.module.slug === 'reading') {
    return '/life#reading-share'
  }

  return `/life/${lifeDetail.value.module.slug}`
})

const READING_PREVIEW_LIMIT = 200
const READING_HIGHLIGHTS_PREVIEW_COUNT = 3

const itemTitle = computed(() => {
  if (!lifeDetail.value) {
    return ''
  }

  if (lifeDetail.value.module.slug === 'snippets') {
    return '碎碎念详情'
  }

  return lifeDetail.value.item.title
})

const isReadingDetail = computed(() => lifeDetail.value?.module.slug === 'reading')
const isShowDetail = computed(() => lifeDetail.value?.module.slug === 'shows')
const isOutdoorsDetail = computed(() => lifeDetail.value?.module.slug === 'outdoors')
const isPhotographyDetail = computed(() => lifeDetail.value?.module.slug === 'photography')
const showPosterFallback = ref(false)
const activeReadingModal = ref('')
const activePhotoIndex = ref(0)
const outdoorJournalPreview = ref(null)
const SHOW_DETAIL_VISIBLE_HIGHLIGHTS = 3
const SHOW_DETAIL_FIT_LEVELS = ['xl', 'lg', 'md', 'sm', 'xs']
const SHOW_DETAIL_DEFAULT_FIT = 'lg'
const SHOW_DETAIL_DESKTOP_BREAKPOINT = 1180

const showPanelsRef = ref(null)
const showPosterContainerRef = ref(null)
const showMainContainerRef = ref(null)
const showQuoteContainerRef = ref(null)
const showCreditsContainerRef = ref(null)
const showHighlightsListRef = ref(null)
const showPanelBodyHeight = ref(0)
const photographyThumbsScrollRef = ref(null)

const outdoorBadgeIconMap = {
  徒步: Footprints,
  骑行: Bike,
  露营: TentTree
}

const OUTDOOR_FIXED_TRACK_TEMPLATE = {
  mapPath: 'M 36 186 C 72 188 90 146 124 142 C 158 138 174 110 214 98 C 250 86 268 62 300 44',
  startPoint: { x: '9%', y: '74%' },
  endPoint: { x: '86%', y: '18%' }
}

const createOutdoorFallbackDetail = (item = {}) => ({
  slug: item.slug || 'outdoor-fallback',
  title: item.title || '户外记录',
  text: item.text || '记录每一次出发与抵达。',
  badge: '徒步',
  hero: {
    distance: '0km',
    duration: '0h',
    elevationGain: '0m',
    quote: item.text || '把自然当作节奏，把脚步当作记录。',
    date: '待补充',
    weather: '待补充',
    temp: '--',
    wind: '待补充'
  },
  metrics: {
    steps: '0',
    ascent: '0',
    timeUsed: '0h',
    status: '进行中'
  },
  route: {
    start: '待补充',
    end: '待补充',
    distance: '0km',
    ascent: '0m',
    difficultyLabel: '待评估',
    difficultyStars: 1,
    mapPath: 'M 36 194 C 80 170 118 150 154 126 C 190 102 232 80 300 44',
    startPoint: { x: '10%', y: '76%' },
    endPoint: { x: '86%', y: '20%' }
  },
  
  footer: '享受自然  ·  记录生活'
})

const getOutdoorItem = () => (isOutdoorsDetail.value ? lifeDetail.value.item : null)

const outdoorDetailData = computed(() => {
  const outdoorItem = getOutdoorItem()
  if (!outdoorItem) {
    return null
  }

  const detail = getOutdoorDetailBySlug(outdoorItem.slug) || createOutdoorFallbackDetail(outdoorItem)
  const trail = detail.route || {}
  const normalizedStars = Number.isFinite(Number(trail.difficultyStars))
    ? Math.max(1, Math.min(5, Math.round(Number(trail.difficultyStars))))
    : 1

  return {
    ...detail,
    hero: {
      ...createOutdoorFallbackDetail(outdoorItem).hero,
      ...(detail.hero || {})
    },
    metrics: {
      ...createOutdoorFallbackDetail(outdoorItem).metrics,
      ...(detail.metrics || {})
    },
    route: {
      ...createOutdoorFallbackDetail(outdoorItem).route,
      ...trail,
      difficultyStars: normalizedStars,
      ...OUTDOOR_FIXED_TRACK_TEMPLATE
    },
    journal: {
      ...createOutdoorFallbackDetail(outdoorItem).journal,
      ...(detail.journal || {})
    },
    footer: detail.footer || '享受自然  ·  记录生活'
  }
})

const outdoorDifficultyStates = computed(() => {
  const stars = outdoorDetailData.value?.route?.difficultyStars || 1
  return Array.from({ length: 5 }, (_, index) => index < stars)
})

const outdoorBadgeIcon = computed(() => {
  const badge = outdoorDetailData.value?.badge
  return outdoorBadgeIconMap[badge] || Trees
})

const outdoorJournalPhotos = computed(() => {
  const photos = outdoorDetailData.value?.journal?.photos
  if (!Array.isArray(photos)) {
    return []
  }

  return photos
    .map((photo, index) => ({
      src: String(photo?.src || '').trim(),
      alt: String(photo?.alt || '').trim() || `户外记录图 ${index + 1}`
    }))
    .filter((photo) => photo.src)
})

const openOutdoorJournalPreview = (photo, index) => {
  if (!photo?.src) {
    return
  }

  outdoorJournalPreview.value = {
    src: photo.src,
    alt: photo.alt || `户外记录图 ${Number(index) + 1}`,
    sectionTitle: '户外记录'
  }
}

const closeOutdoorJournalPreview = () => {
  outdoorJournalPreview.value = null
}

const handleOutdoorJournalPreviewBackdropClick = (event) => {
  if (event.target === event.currentTarget) {
    closeOutdoorJournalPreview()
  }
}

const handleOutdoorJournalWheel = (event) => {
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

const getReadingExcerpt = (book) => (book.excerpt || book.intro || book.note || '').trim()

const getReadingReview = (book) => (book.review || book.note || '').trim()

const getReadingItem = () => (isReadingDetail.value ? lifeDetail.value.item : null)

const toPreviewText = (value, maxChars = READING_PREVIEW_LIMIT) => {
  const normalizedText = String(value || '').trim()
  if (!normalizedText) {
    return ''
  }

  if (normalizedText.length <= maxChars) {
    return normalizedText
  }

  return `${normalizedText.slice(0, maxChars)}...`
}

const toParagraphs = (value) => {
  return String(value || '')
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

const resolveDensityByLength = (value, compactThreshold, denseThreshold) => {
  const contentLength = String(value || '').trim().length
  if (contentLength >= denseThreshold) {
    return 'dense'
  }

  if (contentLength >= compactThreshold) {
    return 'compact'
  }

  return 'normal'
}

const normalizeHighlights = (items) => {
  if (!Array.isArray(items)) {
    return []
  }

  return items
    .map((item, index) => ({
      id: [String(item.url || '').trim(), String(item.title || '').trim(), index + 1].join('|'),
      text: String(item.text || '').trim(),
      chapter: String(item.chapter || '').trim()
    }))
    .filter((item) => item.text)
}

const readingDetailData = computed(() => {
  const book = getReadingItem()
  if (!book) {
    return null
  }

  const readingContent = getReadingContentBySlug(book.slug) || {}
  const rawMeta = book.meta || {}
  const rawProgress = book.progress || {}
  const parsedTotalPages = Number(rawProgress.totalPages ?? rawMeta.pages)
  const totalPages = Number.isFinite(parsedTotalPages) && parsedTotalPages > 0 ? Math.round(parsedTotalPages) : 320
  const parsedReadPages = Number(rawProgress.readPages)
  const readPages = Number.isFinite(parsedReadPages)
    ? Math.max(0, Math.min(totalPages, Math.round(parsedReadPages)))
    : Math.round(totalPages * 0.35)
  const progressPercent = totalPages > 0 ? Math.round((readPages / totalPages) * 100) : 0
  const parsedTodayMinutes = Number(rawProgress.todayMinutes)
  const todayMinutes = Number.isFinite(parsedTodayMinutes) && parsedTodayMinutes >= 0 ? Math.round(parsedTodayMinutes) : 25
  const parsedStreakDays = Number(rawProgress.streakDays)
  const streakDays = Number.isFinite(parsedStreakDays) && parsedStreakDays >= 0 ? Math.round(parsedStreakDays) : 3
  const startDate = rawProgress.startDate || '待补充'
  const tags = Array.isArray(book.tags) && book.tags.length ? book.tags : ['阅读记录']
  const introFull = (readingContent.intro || book.intro || getReadingExcerpt(book) || '暂无内容简介。').trim()
  const quote = (book.quote || getReadingExcerpt(book) || '在阅读里，找到与自己对话的时刻。').trim()
  const sourceHighlights = normalizeHighlights(readingContent.highlights)
  const fallbackHighlights = normalizeHighlights(book.highlights)
  const highlights = sourceHighlights.length
    ? sourceHighlights
    : fallbackHighlights.length
      ? fallbackHighlights
      : [
        {
          id: 'fallback-1',
          text: getReadingExcerpt(book) || '摘录待补充。',
          chapter: '阅读笔记'
        }
      ]
  const reviewFull = (readingContent.review || book.review || getReadingReview(book) || '暂无读后感。').trim()
  const reviewParagraphs = toParagraphs(reviewFull)
  const ctaNote = (book.ctaNote || '每一次阅读，都是与作者的一次对话。').trim()
  const mainDensity = resolveDensityByLength(`${book.title || ''}${book.author || ''}${quote}${tags.join('')}`, 150, 230)
  const progressDensity = resolveDensityByLength(`${ctaNote}${startDate}`, 40, 70)

  return {
    slug: book.slug,
    title: book.title,
    author: book.author || '未知作者',
    cover: book.cover,
    status: book.status || '正在读',
    quote,
    tags,
    meta: {
      publisher: rawMeta.publisher || '待补充',
      publishDate: rawMeta.publishDate || '待补充',
      pagesLabel: `${totalPages} 页`
    },
    progress: {
      readPages,
      totalPages,
      startDate,
      todayMinutes,
      streakDays,
      percent: progressPercent
    },
    mainDensity,
    progressDensity,
    introFull,
    highlights,
    highlightsPreview: highlights.slice(0, READING_HIGHLIGHTS_PREVIEW_COUNT),
    reviewFull,
    reviewPreview: toPreviewText(reviewFull),
    reviewParagraphs,
    ctaNote
  }
})

const readingProgressStyle = computed(() => {
  const percent = readingDetailData.value?.progress.percent || 0
  return {
    '--reading-progress': `${percent}%`
  }
})

const getPhotographyItem = () => {
  if (!isPhotographyDetail.value) {
    return null
  }

  const routeSlug = typeof route.params.itemSlug === 'string' ? route.params.itemSlug.trim() : ''
  const photoItemFromData = routeSlug ? getPhotographyItemBySlug(routeSlug) : null
  return photoItemFromData || lifeDetail.value?.item || null
}

const normalizePhotographyGallery = (item) => {
  const sourceGallery = Array.isArray(item?.gallery) ? item.gallery : []
  const normalizedGallery = sourceGallery
    .map((entry, index) => ({
      src: String(entry?.src || '').trim(),
      alt: String(entry?.alt || '').trim() || `${item?.title || '摄影记录'} ${index + 1}`
    }))
    .filter((entry) => entry.src)

  if (normalizedGallery.length) {
    return normalizedGallery
  }

  const fallbackImage = String(item?.image || '').trim()
  if (!fallbackImage) {
    return []
  }

  return [
    {
      src: fallbackImage,
      alt: String(item?.title || '摄影记录').trim() || '摄影记录'
    }
  ]
}

const toPhotographyFieldValue = (value, fallback = '待补充') => {
  const normalized = String(value || '').trim()
  return normalized || fallback
}

const photographyDetailData = computed(() => {
  const photoItem = getPhotographyItem()
  if (!photoItem) {
    return null
  }

  const tags = Array.isArray(photoItem.tags)
    ? photoItem.tags.map((tag) => String(tag || '').trim()).filter(Boolean)
    : []
  const gallery = normalizePhotographyGallery(photoItem)
  const description = toPhotographyFieldValue(photoItem.description, '暂无描述。')

  return {
    slug: String(photoItem.slug || '').trim(),
    title: toPhotographyFieldValue(photoItem.title, '摄影记录'),
    date: toPhotographyFieldValue(photoItem.date),
    time: toPhotographyFieldValue(photoItem.time, '--:--'),
    location: toPhotographyFieldValue(photoItem.location),
    weather: toPhotographyFieldValue(photoItem.weather),
    device: toPhotographyFieldValue(photoItem.device),
    lighting: toPhotographyFieldValue(photoItem.lighting),
    mood: toPhotographyFieldValue(photoItem.mood),
    music: toPhotographyFieldValue(photoItem.music),
    description,
    quote: toPhotographyFieldValue(photoItem.quote, description),
    tags,
    gallery
  }
})

const activePhotoSafeIndex = computed(() => {
  const total = photographyDetailData.value?.gallery.length || 0
  if (!total) {
    return 0
  }

  return Math.max(0, Math.min(activePhotoIndex.value, total - 1))
})

const activePhoto = computed(() => {
  const gallery = photographyDetailData.value?.gallery || []
  if (!gallery.length) {
    return null
  }

  return gallery[activePhotoSafeIndex.value]
})

const setActivePhoto = (index) => {
  const gallery = photographyDetailData.value?.gallery || []
  if (!gallery.length) {
    activePhotoIndex.value = 0
    return
  }

  const normalizedIndex = Number(index)
  if (!Number.isFinite(normalizedIndex)) {
    return
  }

  activePhotoIndex.value = Math.max(0, Math.min(gallery.length - 1, Math.round(normalizedIndex)))
}

const handlePhotographyThumbsWheel = (event) => {
  const scrollContainer = photographyThumbsScrollRef.value
  if (!scrollContainer) {
    return
  }

  const canScrollHorizontally = scrollContainer.scrollWidth > scrollContainer.clientWidth
  if (!canScrollHorizontally) {
    return
  }

  const horizontalDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
  if (!horizontalDelta) {
    return
  }

  scrollContainer.scrollLeft += horizontalDelta
  event.preventDefault()
}

const isReadingHighlightsModalOpen = computed(() => activeReadingModal.value === 'highlights')
const isReadingReviewModalOpen = computed(() => activeReadingModal.value === 'review')

const openReadingModal = (type) => {
  activeReadingModal.value = type
}

const closeReadingModal = () => {
  activeReadingModal.value = ''
}

const handleReadingModalBackdropClick = (event) => {
  if (event.target === event.currentTarget) {
    closeReadingModal()
  }
}

const handleWindowKeydown = (event) => {
  if (event.key !== 'Escape') {
    return
  }

  if (activeReadingModal.value) {
    closeReadingModal()
  }

  if (outdoorJournalPreview.value) {
    closeOutdoorJournalPreview()
  }
}

watch(
  () => lifeDetail.value?.item?.slug,
  () => {
    showPosterFallback.value = false
    closeReadingModal()
    closeOutdoorJournalPreview()
    activePhotoIndex.value = 0
  }
)

watch(
  () => photographyDetailData.value?.gallery.length || 0,
  (galleryLength) => {
    if (!galleryLength) {
      activePhotoIndex.value = 0
      return
    }

    if (activePhotoIndex.value >= galleryLength) {
      activePhotoIndex.value = 0
    }
  },
  { immediate: true }
)

const hasAnyDetailModalOpen = computed(() => Boolean(activeReadingModal.value || outdoorJournalPreview.value))

watch(hasAnyDetailModalOpen, (isOpen) => {
  if (typeof document === 'undefined') {
    return
  }

  document.body.style.overflow = isOpen ? 'hidden' : ''
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

const getShowItem = () => (isShowDetail.value ? lifeDetail.value.item : null)

const showPosterUrl = computed(() => getShowItem()?.posterUrl || '')

const showRating = computed(() => {
  const rawScore = Number(getShowItem()?.rating)
  if (Number.isFinite(rawScore) && rawScore > 0) {
    return rawScore.toFixed(1)
  }

  return '8.8'
})

const showRatingScale = computed(() => {
  const rawScale = Number(getShowItem()?.ratingScale)
  if (Number.isFinite(rawScale) && rawScale > 0) {
    return rawScale
  }

  return 10
})

const showGenres = computed(() => {
  const genres = getShowItem()?.genres
  if (Array.isArray(genres) && genres.length) {
    return genres
  }

  return ['剧情']
})

const showMeta = computed(() => {
  const meta = getShowItem()?.meta || {}
  return {
    year: meta.year || '待补充',
    episodeDuration: meta.episodeDuration || '待补充',
    seasons: meta.seasons || '待补充'
  }
})

const showQuote = computed(() => getShowItem()?.quote || getShowItem()?.reason || '这是一部值得反复回看的剧。')

const showCredits = computed(() => {
  const credits = getShowItem()?.credits || {}
  const rawStars = Number(credits.recommendStars)
  const recommendStars = Number.isFinite(rawStars) ? Math.min(5, Math.max(1, Math.round(rawStars))) : 4

  return {
    director: credits.director || '待补充',
    cast: credits.cast || '待补充',
    status: credits.status || '待补充',
    recommendStars
  }
})

const showStarStates = computed(() => {
  return Array.from({ length: 5 }, (_, index) => index < showCredits.value.recommendStars)
})

const showWatchUrl = computed(() => getShowItem()?.watchUrl || '#')

const showReviews = computed(() => {
  const reviews = getShowItem()?.reviews
  if (Array.isArray(reviews) && reviews.length) {
    return reviews
  }

  return [getShowItem()?.reason || '这是一部值得推荐的作品。']
})

const showHighlights = computed(() => {
  const highlights = getShowItem()?.highlights
  if (Array.isArray(highlights) && highlights.length) {
    return highlights.map((item, index) => ({
      key: [String(item.url || '').trim(), String(item.title || '').trim(), index + 1].join('|'),
      title: item.title || '高光片段',
      summary: item.summary || '剧情节奏与情绪表达都很抓人。',
      thumbnailUrl: item.thumbnailUrl || `https://picsum.photos/seed/show-highlight-${index + 1}/560/320`,
      url: item.url || '#'
    }))
  }

  return []
})

const showRecommendReasons = computed(() => {
  const reasons = getShowItem()?.recommendReasons
  if (Array.isArray(reasons) && reasons.length) {
    return reasons.map((reason, index) => ({
      id: reason.id || `reason-${index + 1}`,
      title: reason.title || '推荐点',
      description: reason.description || '这部作品在多个维度都有稳定发挥。'
    }))
  }

  return [
    {
      id: 'reason-fallback',
      title: '整体完成度高',
      description: '叙事节奏、人物关系和氛围塑造都比较稳定。'
    }
  ]
})

const showPanelBodyStyle = computed(() => {
  if (showPanelBodyHeight.value <= 0) {
    return {}
  }

  return {
    '--show-panel-body-height': `${showPanelBodyHeight.value}px`
  }
})

const showHeroFitState = reactive({
  poster: SHOW_DETAIL_DEFAULT_FIT,
  main: SHOW_DETAIL_DEFAULT_FIT,
  quote: SHOW_DETAIL_DEFAULT_FIT,
  credits: SHOW_DETAIL_DEFAULT_FIT,
  scrollMain: false,
  scrollQuote: false,
  scrollCredits: false
})

let showHeroResizeObserver = null
let showHeroFitFrameId = 0
let showPanelsResizeObserver = null
let showPanelHeightFrameId = 0

const isShowDesktopViewport = () => {
  if (typeof window === 'undefined') {
    return false
  }

  return window.innerWidth > SHOW_DETAIL_DESKTOP_BREAKPOINT
}

const hasContainerOverflow = (element) => {
  if (!element) {
    return false
  }

  return element.scrollHeight - element.clientHeight > 1 || element.scrollWidth - element.clientWidth > 1
}

const resetShowHeroFitState = () => {
  showHeroFitState.poster = SHOW_DETAIL_DEFAULT_FIT
  showHeroFitState.main = SHOW_DETAIL_DEFAULT_FIT
  showHeroFitState.quote = SHOW_DETAIL_DEFAULT_FIT
  showHeroFitState.credits = SHOW_DETAIL_DEFAULT_FIT
  showHeroFitState.scrollMain = false
  showHeroFitState.scrollQuote = false
  showHeroFitState.scrollCredits = false
}

const getShowPanelBaseHeight = () => {
  if (typeof window === 'undefined') {
    return 0
  }

  const highlightsListElement = showHighlightsListRef.value
  if (!highlightsListElement) {
    return 0
  }

  const highlightItems = Array.from(highlightsListElement.children || [])
  if (!highlightItems.length) {
    return 0
  }

  const visibleItems = highlightItems.slice(0, SHOW_DETAIL_VISIBLE_HIGHLIGHTS)
  const styles = window.getComputedStyle(highlightsListElement)
  const rowGap = Number.parseFloat(styles.rowGap || styles.gap || '0') || 0
  const itemsHeight = visibleItems.reduce((totalHeight, element) => totalHeight + element.getBoundingClientRect().height, 0)
  const fallbackItemHeight = visibleItems[0]?.getBoundingClientRect().height || 0
  const normalizedItemsHeight = visibleItems.length >= SHOW_DETAIL_VISIBLE_HIGHLIGHTS
    ? itemsHeight
    : fallbackItemHeight * SHOW_DETAIL_VISIBLE_HIGHLIGHTS
  const totalGap = rowGap * Math.max(0, SHOW_DETAIL_VISIBLE_HIGHLIGHTS - 1)

  return Math.ceil(normalizedItemsHeight + totalGap)
}

const applyShowPanelBodyHeight = () => {
  if (!isShowDetail.value) {
    showPanelBodyHeight.value = 0
    return
  }

  const baseHeight = getShowPanelBaseHeight()
  showPanelBodyHeight.value = baseHeight > 0 ? baseHeight : 0
}

const scheduleShowPanelBodyHeight = () => {
  if (typeof window === 'undefined') {
    return
  }

  if (showPanelHeightFrameId) {
    window.cancelAnimationFrame(showPanelHeightFrameId)
  }

  showPanelHeightFrameId = window.requestAnimationFrame(() => {
    showPanelHeightFrameId = 0
    applyShowPanelBodyHeight()
  })
}

const disconnectShowPanelsResizeObserver = () => {
  if (showPanelsResizeObserver) {
    showPanelsResizeObserver.disconnect()
    showPanelsResizeObserver = null
  }
}

const connectShowPanelsResizeObserver = () => {
  disconnectShowPanelsResizeObserver()

  if (typeof window === 'undefined' || !('ResizeObserver' in window) || !isShowDetail.value) {
    return
  }

  showPanelsResizeObserver = new window.ResizeObserver(() => {
    scheduleShowPanelBodyHeight()
  })

  ;[showPanelsRef.value, showHighlightsListRef.value]
    .filter(Boolean)
    .forEach((element) => showPanelsResizeObserver.observe(element))
}

const refreshShowPanelBodyHeight = async () => {
  if (!isShowDetail.value) {
    disconnectShowPanelsResizeObserver()
    showPanelBodyHeight.value = 0
    return
  }

  await nextTick()
  connectShowPanelsResizeObserver()
  scheduleShowPanelBodyHeight()
}

const resolveFitLevel = (element) => {
  const originalFit = element.dataset.fit
  const originalScrollClass = element.classList.contains('is-scroll')

  for (const level of SHOW_DETAIL_FIT_LEVELS) {
    element.dataset.fit = level
    element.classList.remove('is-scroll')
    if (!hasContainerOverflow(element)) {
      if (originalFit) {
        element.dataset.fit = originalFit
      } else {
        element.removeAttribute('data-fit')
      }
      if (originalScrollClass) {
        element.classList.add('is-scroll')
      }
      return { fit: level, isScroll: false }
    }
  }

  const minLevel = SHOW_DETAIL_FIT_LEVELS[SHOW_DETAIL_FIT_LEVELS.length - 1]
  element.dataset.fit = minLevel
  element.classList.remove('is-scroll')
  const isScroll = hasContainerOverflow(element)

  if (originalFit) {
    element.dataset.fit = originalFit
  } else {
    element.removeAttribute('data-fit')
  }
  if (originalScrollClass) {
    element.classList.add('is-scroll')
  }

  return { fit: minLevel, isScroll }
}

const disconnectShowHeroResizeObserver = () => {
  if (showHeroResizeObserver) {
    showHeroResizeObserver.disconnect()
    showHeroResizeObserver = null
  }
}

const connectShowHeroResizeObserver = () => {
  disconnectShowHeroResizeObserver()

  if (typeof window === 'undefined' || !('ResizeObserver' in window) || !isShowDetail.value) {
    return
  }

  showHeroResizeObserver = new window.ResizeObserver(() => {
    scheduleShowHeroFit()
  })

  ;[showPosterContainerRef.value, showMainContainerRef.value, showQuoteContainerRef.value, showCreditsContainerRef.value]
    .filter(Boolean)
    .forEach((element) => showHeroResizeObserver.observe(element))
}

const applyShowHeroFit = () => {
  if (!isShowDetail.value || !isShowDesktopViewport()) {
    resetShowHeroFitState()
    return
  }

  showHeroFitState.poster = SHOW_DETAIL_DEFAULT_FIT

  const mainElement = showMainContainerRef.value
  if (mainElement) {
    const { fit, isScroll } = resolveFitLevel(mainElement)
    showHeroFitState.main = fit
    showHeroFitState.scrollMain = isScroll
  }

  const quoteElement = showQuoteContainerRef.value
  if (quoteElement) {
    const { fit, isScroll } = resolveFitLevel(quoteElement)
    showHeroFitState.quote = fit
    showHeroFitState.scrollQuote = isScroll
  }

  const creditsElement = showCreditsContainerRef.value
  if (creditsElement) {
    const { fit, isScroll } = resolveFitLevel(creditsElement)
    showHeroFitState.credits = fit
    showHeroFitState.scrollCredits = isScroll
  }
}

const scheduleShowHeroFit = () => {
  if (typeof window === 'undefined') {
    return
  }

  if (showHeroFitFrameId) {
    window.cancelAnimationFrame(showHeroFitFrameId)
  }

  showHeroFitFrameId = window.requestAnimationFrame(() => {
    showHeroFitFrameId = 0
    applyShowHeroFit()
  })
}

const refreshShowHeroAutoFit = async () => {
  if (!isShowDetail.value) {
    disconnectShowHeroResizeObserver()
    resetShowHeroFitState()
    return
  }

  await nextTick()
  connectShowHeroResizeObserver()
  scheduleShowHeroFit()
}

const handleShowHeroViewportResize = () => {
  if (isShowDetail.value) {
    scheduleShowHeroFit()
    scheduleShowPanelBodyHeight()
  }
}

watch(
  () => [isShowDetail.value, lifeDetail.value?.item?.slug],
  () => {
    void refreshShowHeroAutoFit()
    void refreshShowPanelBodyHeight()
  },
  { flush: 'post', immediate: true }
)

watch(
  () => [
    lifeDetail.value?.item?.title,
    showRating.value,
    showRatingScale.value,
    showGenres.value.join('|'),
    showMeta.value.year,
    showMeta.value.episodeDuration,
    showMeta.value.seasons,
    showQuote.value,
    showCredits.value.director,
    showCredits.value.cast,
    showCredits.value.status,
    showCredits.value.recommendStars,
    showReviews.value.join('|'),
    showHighlights.value.map((item) => `${item.key}|${item.thumbnailUrl}`).join('|'),
    showRecommendReasons.value.map((reason) => `${reason.id}|${reason.title}|${reason.description}`).join('|')
  ],
  () => {
    if (isShowDetail.value) {
      scheduleShowHeroFit()
      scheduleShowPanelBodyHeight()
    }
  },
  { flush: 'post' }
)

onMounted(() => {
  window.addEventListener('resize', handleShowHeroViewportResize)
  void refreshShowHeroAutoFit()
  void refreshShowPanelBodyHeight()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleShowHeroViewportResize)
  if (showHeroFitFrameId && typeof window !== 'undefined') {
    window.cancelAnimationFrame(showHeroFitFrameId)
  }
  if (showPanelHeightFrameId && typeof window !== 'undefined') {
    window.cancelAnimationFrame(showPanelHeightFrameId)
  }
  disconnectShowHeroResizeObserver()
  disconnectShowPanelsResizeObserver()
})

const handleShowPosterError = () => {
  showPosterFallback.value = true
}
</script>

<template>
  <section class="page-section section-reveal compact-detail-scale">
    <div class="page-container detail-wrap">
      <template v-if="lifeDetail">
        <RouterLink :to="modulePath" class="text-link back-link">&larr; 返回{{ lifeDetail.module.title }}</RouterLink>

        <header
          v-if="!isShowDetail && !isReadingDetail && !isOutdoorsDetail"
          class="glass-panel life-detail-head"
          :class="{ 'life-detail-head--photography': isPhotographyDetail }"
        >
          <p class="eyebrow">Life Item Detail</p>
          <h1 class="section-title detail-title">{{ itemTitle }}</h1>
          <p class="section-description">{{ lifeDetail.module.title }}</p>
        </header>

          <article
            class="glass-panel life-item-detail-card"
            :class="{
              'reading-detail-layout': isReadingDetail,
              'show-detail-layout': isShowDetail,
              'outdoor-detail-layout': isOutdoorsDetail,
              'photography-detail-layout': isPhotographyDetail
            }"
          >
          <template v-if="lifeDetail.module.slug === 'reading'">
            <div v-if="readingDetailData" class="reading-detail-v2-shell life-item-detail-content-single">
              <section class="reading-detail-v2-hero">
                <div class="reading-detail-v2-cover-wrap">
                  <img :src="readingDetailData.cover" :alt="readingDetailData.title" class="reading-detail-v2-cover" />
                </div>

                <div class="reading-detail-v2-main" :class="`density-${readingDetailData.mainDensity}`">
                  <p class="reading-detail-v2-status-chip">
                    <BookOpenCheck class="reading-detail-v2-status-icon" aria-hidden="true" />
                    {{ readingDetailData.status }}
                  </p>
                  <h2 class="reading-detail-v2-title">{{ readingDetailData.title }}</h2>
                  <p class="reading-detail-v2-author">{{ readingDetailData.author }}</p>

                  <blockquote class="reading-detail-v2-quote">
                    <span class="reading-detail-v2-quote-mark reading-detail-v2-quote-mark-open" aria-hidden="true">“</span>
                    <p>{{ readingDetailData.quote }}</p>
                    <span class="reading-detail-v2-quote-mark reading-detail-v2-quote-mark-close" aria-hidden="true">”</span>
                  </blockquote>

                  <div class="reading-detail-v2-tags">
                    <span v-for="tag in readingDetailData.tags" :key="tag" class="reading-detail-v2-tag">{{ tag }}</span>
                  </div>

                  <div class="reading-detail-v2-meta" aria-label="图书元信息">
                    <p class="reading-detail-v2-meta-item">
                      <BookCopy class="reading-detail-v2-meta-icon" aria-hidden="true" />
                      {{ readingDetailData.meta.publisher }}
                    </p>
                    <p class="reading-detail-v2-meta-item">
                      <CalendarDays class="reading-detail-v2-meta-icon" aria-hidden="true" />
                      {{ readingDetailData.meta.publishDate }}
                    </p>
                    <p class="reading-detail-v2-meta-item">
                      <BookOpenText class="reading-detail-v2-meta-icon" aria-hidden="true" />
                      {{ readingDetailData.meta.pagesLabel }}
                    </p>
                  </div>
                </div>

                <aside class="reading-detail-v2-progress-card" :class="`density-${readingDetailData.progressDensity}`">
                  <div class="reading-detail-v2-progress-head">
                    <div class="reading-detail-v2-progress-ring" :style="readingProgressStyle" aria-label="阅读进度百分比">
                      <span>{{ readingDetailData.progress.percent }}%</span>
                    </div>
                    <div class="reading-detail-v2-progress-copy">
                      <p class="reading-detail-v2-progress-label">阅读进度</p>
                      <p class="reading-detail-v2-progress-pages">
                        已读 {{ readingDetailData.progress.readPages }} / {{ readingDetailData.progress.totalPages }} 页
                      </p>
                    </div>
                  </div>

                  <ul class="reading-detail-v2-progress-list">
                    <li>
                      <CalendarCheck class="reading-detail-v2-progress-icon" aria-hidden="true" />
                      <span>开始时间</span>
                      <strong>{{ readingDetailData.progress.startDate }}</strong>
                    </li>
                    <li>
                      <Clock3 class="reading-detail-v2-progress-icon" aria-hidden="true" />
                      <span>今日阅读</span>
                      <strong>{{ readingDetailData.progress.todayMinutes }} min</strong>
                    </li>
                    <li>
                      <Flame class="reading-detail-v2-progress-icon" aria-hidden="true" />
                      <span>连续阅读</span>
                      <strong>{{ readingDetailData.progress.streakDays }} 天</strong>
                    </li>
                  </ul>

                  <p class="reading-detail-v2-cta-note">
                    <BookText class="reading-detail-v2-cta-icon" aria-hidden="true" />
                    {{ readingDetailData.ctaNote }}
                  </p>
                </aside>
              </section>

              <section class="reading-detail-v2-panels">
                <article class="reading-detail-v2-panel reading-detail-v2-panel-intro">
                  <h3 class="reading-detail-v2-panel-title">
                    <BookText class="reading-detail-v2-panel-icon" aria-hidden="true" />
                    内容简介
                  </h3>
                  <div class="reading-detail-v2-panel-scroll reading-detail-v2-intro-scroll">
                    <p>{{ readingDetailData.introFull }}</p>
                  </div>
                </article>

                <article class="reading-detail-v2-panel">
                  <h3 class="reading-detail-v2-panel-title">
                    <Quote class="reading-detail-v2-panel-icon" aria-hidden="true" />
                    摘录
                  </h3>
                  <ul class="reading-detail-v2-highlight-list">
                    <li v-for="item in readingDetailData.highlightsPreview" :key="item.id">
                      <p class="reading-detail-v2-highlight-text">{{ item.text }}</p>
                      <p v-if="item.chapter" class="reading-detail-v2-highlight-chapter">—— {{ item.chapter }}</p>
                    </li>
                  </ul>
                  <button type="button" class="reading-detail-v2-more-link reading-detail-v2-more-btn" @click="openReadingModal('highlights')">
                    查看更多
                    <span aria-hidden="true">→</span>
                  </button>
                </article>

                <article class="reading-detail-v2-panel">
                  <h3 class="reading-detail-v2-panel-title">
                    <NotebookPen class="reading-detail-v2-panel-icon" aria-hidden="true" />
                    读后感
                  </h3>
                  <p class="reading-detail-v2-review-preview">{{ readingDetailData.reviewPreview }}</p>
                  <button type="button" class="reading-detail-v2-more-link reading-detail-v2-more-btn" @click="openReadingModal('review')">
                    查看更多
                    <span aria-hidden="true">→</span>
                  </button>
                </article>
              </section>

              <div
                v-if="isReadingHighlightsModalOpen"
                class="reading-note-modal-overlay"
                role="dialog"
                aria-modal="true"
                aria-labelledby="reading-highlights-modal-title"
                @click="handleReadingModalBackdropClick"
              >
                <article class="reading-note-modal">
                  <header class="reading-note-modal-head">
                    <h4 id="reading-highlights-modal-title" class="reading-note-modal-title">摘录记录</h4>
                    <button type="button" class="reading-note-modal-close" aria-label="关闭摘录弹窗" @click="closeReadingModal">×</button>
                  </header>
                  <div class="reading-note-modal-body">
                    <p class="reading-note-modal-subtitle">《{{ readingDetailData.title }}》</p>
                    <ul class="reading-note-lines">
                      <li v-for="item in readingDetailData.highlights" :key="`modal-${item.id}`">
                        <p class="reading-note-line-text">{{ item.text }}</p>
                        <p v-if="item.chapter" class="reading-note-line-meta">—— {{ item.chapter }}</p>
                      </li>
                    </ul>
                  </div>
                </article>
              </div>

              <div
                v-if="isReadingReviewModalOpen"
                class="reading-note-modal-overlay"
                role="dialog"
                aria-modal="true"
                aria-labelledby="reading-review-modal-title"
                @click="handleReadingModalBackdropClick"
              >
                <article class="reading-note-modal">
                  <header class="reading-note-modal-head">
                    <h4 id="reading-review-modal-title" class="reading-note-modal-title">读后感</h4>
                    <button type="button" class="reading-note-modal-close" aria-label="关闭读后感弹窗" @click="closeReadingModal">×</button>
                  </header>
                  <div class="reading-note-modal-body">
                    <p class="reading-note-modal-subtitle">《{{ readingDetailData.title }}》</p>
                    <div class="reading-note-paragraphs">
                      <p v-for="(paragraph, index) in readingDetailData.reviewParagraphs" :key="`modal-review-${index}`">{{ paragraph }}</p>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </template>

          <template v-else-if="lifeDetail.module.slug === 'shows'">
            <div class="show-detail-shell life-item-detail-content-single">
              <section class="show-detail-hero">
                <div ref="showPosterContainerRef" class="show-detail-poster-shell" :data-fit="showHeroFitState.poster">
                  <figure class="show-detail-poster-frame">
                    <img
                      v-if="showPosterUrl && !showPosterFallback"
                      :src="showPosterUrl"
                      :alt="lifeDetail.item.title"
                      class="show-detail-poster-image"
                      @error="handleShowPosterError"
                    />
                    <div v-else class="show-detail-poster-placeholder" aria-hidden="true"></div>
                  </figure>
                </div>

                <div
                  ref="showMainContainerRef"
                  class="show-detail-main"
                  :data-fit="showHeroFitState.main"
                  :class="{ 'is-scroll': showHeroFitState.scrollMain }"
                >
                  <p class="show-detail-kicker">Life Item Detail</p>
                  <h2 class="show-detail-title">{{ lifeDetail.item.title }}</h2>

                  <div class="show-detail-rating-row" aria-label="评分信息">
                    <span class="show-detail-rating-star" aria-hidden="true">★</span>
                    <span class="show-detail-rating-score">{{ showRating }}</span>
                    <span class="show-detail-rating-scale">/{{ showRatingScale }}</span>
                    <span v-for="genre in showGenres" :key="genre" class="show-detail-genre-chip">{{ genre }}</span>
                  </div>

                  <div class="show-detail-meta-row" aria-label="基础信息">
                    <p class="show-detail-meta-item">
                      <CalendarDays class="show-detail-meta-icon" aria-hidden="true" />
                      {{ showMeta.year }}
                    </p>
                    <p class="show-detail-meta-item">
                      <Clock3 class="show-detail-meta-icon" aria-hidden="true" />
                      {{ showMeta.episodeDuration }}
                    </p>
                    <p class="show-detail-meta-item">
                      <Tv class="show-detail-meta-icon" aria-hidden="true" />
                      {{ showMeta.seasons }}
                    </p>
                  </div>

                  <div class="show-detail-action-row">
                    <a :href="showWatchUrl" target="_blank" rel="noopener noreferrer" class="btn btn-primary show-detail-watch-btn">
                      <Play class="show-detail-watch-icon" aria-hidden="true" />
                      立即观看
                    </a>
                  </div>
                </div>

                <aside class="show-detail-side">
                  <blockquote
                    ref="showQuoteContainerRef"
                    class="show-detail-quote"
                    :data-fit="showHeroFitState.quote"
                    :class="{ 'is-scroll': showHeroFitState.scrollQuote }"
                  >
                    <span class="show-detail-quote-mark show-detail-quote-mark-open" aria-hidden="true">“</span>
                    <p>{{ showQuote }}</p>
                    <span class="show-detail-quote-mark show-detail-quote-mark-close" aria-hidden="true">”</span>
                  </blockquote>

                  <div
                    ref="showCreditsContainerRef"
                    class="show-detail-credit-grid"
                    :data-fit="showHeroFitState.credits"
                    :class="{ 'is-scroll': showHeroFitState.scrollCredits }"
                    aria-label="演职员和状态"
                  >
                    <article class="show-detail-credit-item">
                      <p class="show-detail-credit-label">导演</p>
                      <p class="show-detail-credit-value">{{ showCredits.director }}</p>
                    </article>
                    <article class="show-detail-credit-item">
                      <p class="show-detail-credit-label">主演</p>
                      <p class="show-detail-credit-value">{{ showCredits.cast }}</p>
                    </article>
                    <article class="show-detail-credit-item">
                      <p class="show-detail-credit-label">状态</p>
                      <p class="show-detail-credit-value">{{ showCredits.status }}</p>
                    </article>
                    <article class="show-detail-credit-item">
                      <p class="show-detail-credit-label">推荐指数</p>
                      <p class="show-detail-star-row" aria-label="推荐星级">
                        <Star
                          v-for="(isActive, index) in showStarStates"
                          :key="`star-${index}`"
                          class="show-detail-star-icon"
                          :class="{ active: isActive }"
                          aria-hidden="true"
                        />
                      </p>
                    </article>
                  </div>
                </aside>
              </section>

              <section ref="showPanelsRef" class="show-detail-panels" :style="showPanelBodyStyle">
                <article class="show-detail-panel">
                  <h3 class="show-detail-panel-title">
                    <UserRound class="show-detail-panel-icon" aria-hidden="true" />
                    影片简介
                  </h3>
                  <div class="show-detail-panel-scroll">
                    <p v-for="paragraph in showReviews" :key="paragraph">{{ paragraph }}</p>
                  </div>
                </article>

                <article class="show-detail-panel">
                  <h3 class="show-detail-panel-title">
                    <Play class="show-detail-panel-icon" aria-hidden="true" />
                    高光片段
                  </h3>
                  <div class="show-detail-panel-scroll">
                    <ul ref="showHighlightsListRef" class="show-detail-highlight-list">
                      <li v-for="highlight in showHighlights" :key="highlight.key">
                        <a
                          :href="highlight.url || '#'"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="show-detail-highlight-item card-link-reset lift-click"
                        >
                          <div class="show-detail-highlight-thumb-wrap">
                            <img :src="highlight.thumbnailUrl" :alt="highlight.title" class="show-detail-highlight-thumb" @load="scheduleShowPanelBodyHeight" />
                            <span class="show-detail-highlight-play" aria-hidden="true">
                              <Play class="show-detail-highlight-play-icon" />
                            </span>
                          </div>
                          <div class="show-detail-highlight-copy">
                            <h4>{{ highlight.title }}</h4>
                            <p>{{ highlight.summary }}</p>
                          </div>
                        </a>
                      </li>
                    </ul>
                  </div>
                </article>

                <article class="show-detail-panel">
                  <h3 class="show-detail-panel-title">
                    <CheckCircle2 class="show-detail-panel-icon" aria-hidden="true" />
                    为什么推荐
                  </h3>
                  <div class="show-detail-panel-scroll">
                    <ul class="show-detail-reason-list">
                      <li v-for="reason in showRecommendReasons" :key="reason.id">
                        <CheckCircle2 class="show-detail-reason-icon" aria-hidden="true" />
                        <div class="show-detail-reason-copy">
                          <p class="show-detail-reason-title">{{ reason.title }}</p>
                          <p class="show-detail-reason-desc">{{ reason.description }}</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </article>
              </section>
            </div>
          </template>

          <template v-else-if="lifeDetail.module.slug === 'outdoors'">
            <div v-if="outdoorDetailData" class="outdoor-detail-shell life-item-detail-content-single">
              <section class="glass-panel outdoor-detail-hero">
                <div class="outdoor-detail-hero-head">
                  <p class="outdoor-detail-kicker">Life Item Detail</p>
                  <span class="outdoor-detail-badge">
                    <component :is="outdoorBadgeIcon" class="outdoor-detail-badge-icon" aria-hidden="true" />
                    {{ outdoorDetailData.badge }}
                  </span>
                </div>

                <h2 class="outdoor-detail-title">{{ outdoorDetailData.title }}</h2>

                <p class="outdoor-detail-hero-stats">
                  <span>{{ outdoorDetailData.hero.distance }}</span>
                  <span aria-hidden="true">•</span>
                  <span>{{ outdoorDetailData.hero.duration }}</span>
                  <span aria-hidden="true">•</span>
                  <span>海拔↑{{ outdoorDetailData.hero.elevationGain }}</span>
                </p>

                <blockquote class="outdoor-detail-quote">
                  <span aria-hidden="true">“</span>
                  <p>{{ outdoorDetailData.hero.quote }}</p>
                  <span aria-hidden="true">”</span>
                </blockquote>

                <div class="outdoor-detail-meta-row" aria-label="户外记录元信息">
                  <p class="outdoor-detail-meta-item">
                    <CalendarDays class="outdoor-detail-meta-icon" aria-hidden="true" />
                    {{ outdoorDetailData.hero.date }}
                  </p>
                  <p class="outdoor-detail-meta-item">
                    <Sun class="outdoor-detail-meta-icon" aria-hidden="true" />
                    {{ outdoorDetailData.hero.weather }}
                  </p>
                  <p class="outdoor-detail-meta-item">
                    <Thermometer class="outdoor-detail-meta-icon" aria-hidden="true" />
                    {{ outdoorDetailData.hero.temp }}
                  </p>
                  <p class="outdoor-detail-meta-item">
                    <Wind class="outdoor-detail-meta-icon" aria-hidden="true" />
                    {{ outdoorDetailData.hero.wind }}
                  </p>
                </div>

                <div class="outdoor-detail-stamp" aria-hidden="true">
                  <Mountain class="outdoor-detail-stamp-icon" />
                  <span>户外记录</span>
                </div>
              </section>

              <section class="outdoor-detail-metrics">
                <article class="glass-panel outdoor-detail-metric-card">
                  <p class="outdoor-detail-metric-label">
                    <Footprints class="outdoor-detail-metric-icon" aria-hidden="true" />
                    步数
                  </p>
                  <p class="outdoor-detail-metric-value">
                    {{ outdoorDetailData.metrics.steps }}
                    <span>步</span>
                  </p>
                </article>

                <article class="glass-panel outdoor-detail-metric-card">
                  <p class="outdoor-detail-metric-label">
                    <Mountain class="outdoor-detail-metric-icon" aria-hidden="true" />
                    累计爬升
                  </p>
                  <p class="outdoor-detail-metric-value">
                    {{ outdoorDetailData.metrics.ascent }}
                    <span>m</span>
                  </p>
                </article>

                <article class="glass-panel outdoor-detail-metric-card">
                  <p class="outdoor-detail-metric-label">
                    <Clock3 class="outdoor-detail-metric-icon" aria-hidden="true" />
                    用时
                  </p>
                  <p class="outdoor-detail-metric-value">{{ outdoorDetailData.metrics.timeUsed }}</p>
                </article>

                <article class="glass-panel outdoor-detail-metric-card">
                  <p class="outdoor-detail-metric-label">
                    <Activity class="outdoor-detail-metric-icon" aria-hidden="true" />
                    状态
                  </p>
                  <p class="outdoor-detail-metric-value outdoor-detail-metric-value-status">
                    {{ outdoorDetailData.metrics.status }}
                    <span class="outdoor-detail-status-dot" aria-hidden="true"></span>
                  </p>
                </article>
              </section>

              <section class="outdoor-detail-route-grid">
                <article class="glass-panel outdoor-detail-route-card">
                  <h3 class="outdoor-detail-section-title">
                    <MapPinned class="outdoor-detail-section-icon" aria-hidden="true" />
                    路线信息
                  </h3>

                  <ul class="outdoor-detail-route-list">
                    <li>
                      <MapPin class="outdoor-detail-list-icon" aria-hidden="true" />
                      <span>起点：</span>
                      <strong>{{ outdoorDetailData.route.start }}</strong>
                    </li>
                    <li>
                      <MapPin class="outdoor-detail-list-icon" aria-hidden="true" />
                      <span>终点：</span>
                      <strong>{{ outdoorDetailData.route.end }}</strong>
                    </li>
                    <li>
                      <Route class="outdoor-detail-list-icon" aria-hidden="true" />
                      <span>全程：</span>
                      <strong>{{ outdoorDetailData.route.distance }}</strong>
                    </li>
                    <li>
                      <Mountain class="outdoor-detail-list-icon" aria-hidden="true" />
                      <span>累计爬升：</span>
                      <strong>{{ outdoorDetailData.route.ascent }}</strong>
                    </li>
                    <li>
                      <Activity class="outdoor-detail-list-icon" aria-hidden="true" />
                      <span>难度：</span>
                      <strong>{{ outdoorDetailData.route.difficultyLabel }}</strong>
                      <p class="outdoor-detail-difficulty-stars" aria-label="路线难度星级">
                        <Star
                          v-for="(isActive, index) in outdoorDifficultyStates"
                          :key="`outdoor-star-${index}`"
                          class="outdoor-detail-difficulty-star"
                          :class="{ active: isActive }"
                          aria-hidden="true"
                        />
                      </p>
                    </li>
                  </ul>
                </article>

                <article class="glass-panel outdoor-detail-route-card outdoor-detail-route-map-card">
                  <h3 class="outdoor-detail-section-title">
                    <Route class="outdoor-detail-section-icon" aria-hidden="true" />
                    路线轨迹
                  </h3>

                  <div class="outdoor-detail-track-map">
                    <svg viewBox="0 0 340 240" class="outdoor-detail-track-svg" aria-hidden="true">
                      <path :d="outdoorDetailData.route.mapPath" class="outdoor-detail-track-line-shadow" />
                      <path :d="outdoorDetailData.route.mapPath" class="outdoor-detail-track-line" />
                    </svg>

                    <div
                      class="outdoor-detail-track-marker outdoor-detail-track-marker-start"
                      :style="{
                        left: outdoorDetailData.route.startPoint.x,
                        top: outdoorDetailData.route.startPoint.y
                      }"
                    >
                      <span class="outdoor-detail-track-dot">起</span>
                      <strong>{{ outdoorDetailData.route.start }}</strong>
                    </div>

                    <div
                      class="outdoor-detail-track-marker outdoor-detail-track-marker-end"
                      :style="{
                        left: outdoorDetailData.route.endPoint.x,
                        top: outdoorDetailData.route.endPoint.y
                      }"
                    >
                      <span class="outdoor-detail-track-dot">终</span>
                      <strong>{{ outdoorDetailData.route.end }}</strong>
                    </div>
                  </div>
                </article>
              </section>

              <section class="glass-panel outdoor-detail-journal">
                <h3 class="outdoor-detail-section-title">
                  <NotebookPen class="outdoor-detail-section-icon" aria-hidden="true" />
                  记录
                </h3>

                <div class="outdoor-detail-journal-copy">
                  <p v-for="paragraph in outdoorDetailData.journal.paragraphs" :key="paragraph">{{ paragraph }}</p>
                </div>

                <div
                  v-if="outdoorJournalPhotos.length"
                  class="project-shot-grid outdoor-detail-journal-shot-grid"
                  aria-label="户外记录图片列表，可左右滑动"
                  @wheel="handleOutdoorJournalWheel"
                >
                  <button
                    v-for="(photo, index) in outdoorJournalPhotos"
                    :key="`outdoor-journal-${photo.src}-${index}`"
                    type="button"
                    class="project-shot-item outdoor-detail-journal-shot-item"
                    :aria-label="`查看记录第${index + 1}张图片`"
                    @click="openOutdoorJournalPreview(photo, index)"
                  >
                    <img :src="photo.src" :alt="photo.alt" class="project-shot-image outdoor-detail-journal-shot-image" />
                  </button>
                </div>
                <p v-if="outdoorJournalPhotos.length" class="project-shot-tip outdoor-detail-journal-shot-tip">左右滑动查看更多，点击图片可查看完整大图。</p>
              </section>

              <div
                v-if="outdoorJournalPreview"
                class="project-image-modal-overlay"
                role="dialog"
                aria-modal="true"
                :aria-label="`${outdoorJournalPreview.sectionTitle}大图预览`"
                @click="handleOutdoorJournalPreviewBackdropClick"
              >
                <article class="project-image-modal">
                  <header class="project-image-modal-head">
                    <p class="project-image-modal-title">{{ outdoorJournalPreview.sectionTitle }}</p>
                    <button type="button" class="project-image-modal-close" aria-label="关闭图片预览" @click="closeOutdoorJournalPreview">×</button>
                  </header>
                  <div class="project-image-modal-body">
                    <img :src="outdoorJournalPreview.src" :alt="outdoorJournalPreview.alt" class="project-image-modal-image" />
                  </div>
                </article>
              </div>

              <p class="outdoor-detail-footer-mark">
                <Trees class="outdoor-detail-footer-icon" aria-hidden="true" />
                {{ outdoorDetailData.footer }}
              </p>
            </div>
          </template>

          <template v-else-if="lifeDetail.module.slug === 'photography'">
            <div v-if="photographyDetailData" class="photography-detail-shell life-item-detail-content-single">
              <section class="photography-detail-gallery">
                <figure class="photography-detail-main-photo">
                  <img
                    v-if="activePhoto"
                    :src="activePhoto.src"
                    :alt="activePhoto.alt || photographyDetailData.title"
                    class="photography-detail-main-image"
                  />
                  <div v-else class="photography-detail-main-image photography-detail-main-image-empty" aria-hidden="true"></div>
                  <figcaption class="photography-detail-main-caption">
                    <div class="photography-detail-main-meta-chip">
                      <p class="photography-detail-main-meta-time">{{ photographyDetailData.date }} {{ photographyDetailData.time }}</p>
                      <p class="photography-detail-main-meta-location">
                        <MapPin class="photography-detail-main-meta-icon" aria-hidden="true" />
                        {{ photographyDetailData.location }}
                      </p>
                    </div>
                    <span class="photography-detail-main-counter">{{ activePhotoSafeIndex + 1 }}/{{ photographyDetailData.gallery.length || 1 }}</span>
                  </figcaption>
                </figure>

                <div
                  v-if="photographyDetailData.gallery.length"
                  ref="photographyThumbsScrollRef"
                  class="photography-detail-thumbs-scroll"
                  aria-label="摄影缩略图列表"
                  @wheel="handlePhotographyThumbsWheel"
                >
                  <div class="photography-detail-thumbs-track">
                    <button
                      v-for="(thumb, index) in photographyDetailData.gallery"
                      :key="`${thumb.src}-${index}`"
                      type="button"
                      class="photography-detail-thumb-btn"
                      :class="{ 'is-active': index === activePhotoSafeIndex }"
                      :aria-label="`查看第 ${index + 1} 张照片`"
                      @click="setActivePhoto(index)"
                    >
                      <img :src="thumb.src" :alt="thumb.alt" class="photography-detail-thumb-image" />
                    </button>
                  </div>
                </div>
              </section>

              <aside class="photography-detail-panel" aria-label="摄影信息">
                <p class="photography-detail-kicker">摄影记录</p>
                <h2 class="section-title detail-title photography-detail-title">{{ photographyDetailData.title }}</h2>
                <p class="photography-detail-module-note">这张照片收录在“{{ lifeDetail.module.title }}”模块中。</p>

                <blockquote class="photography-detail-quote">
                  <span class="photography-detail-quote-mark photography-detail-quote-mark-open" aria-hidden="true">“</span>
                  <p>{{ photographyDetailData.quote }}</p>
                  <span class="photography-detail-quote-mark photography-detail-quote-mark-close" aria-hidden="true">”</span>
                </blockquote>

                <dl class="photography-detail-meta">
                  <div class="photography-detail-meta-row">
                    <dt>拍摄时间</dt>
                    <dd>{{ photographyDetailData.date }}</dd>
                  </div>
                  <div class="photography-detail-meta-row">
                    <dt>拍摄地点</dt>
                    <dd>{{ photographyDetailData.location }}</dd>
                  </div>
                  <div class="photography-detail-meta-row">
                    <dt>天气</dt>
                    <dd>{{ photographyDetailData.weather }}</dd>
                  </div>
                  <div class="photography-detail-meta-row">
                    <dt>设备</dt>
                    <dd>{{ photographyDetailData.device }}</dd>
                  </div>
                  <div class="photography-detail-meta-row">
                    <dt>光线</dt>
                    <dd>{{ photographyDetailData.lighting }}</dd>
                  </div>
                  <div class="photography-detail-meta-row">
                    <dt>心情</dt>
                    <dd>{{ photographyDetailData.mood }}</dd>
                  </div>
                  <div class="photography-detail-meta-row">
                    <dt>当时在听</dt>
                    <dd>{{ photographyDetailData.music }}</dd>
                  </div>
                </dl>

                <div class="photography-detail-tags" aria-label="摄影标签">
                  <span v-for="tag in photographyDetailData.tags" :key="`photo-tag-${tag}`" class="photography-detail-tag"># {{ tag }}</span>
                  <span v-if="!photographyDetailData.tags.length" class="photography-detail-tag is-empty"># 待补充</span>
                </div>
              </aside>
            </div>
          </template>

          <template v-else-if="lifeDetail.module.slug === 'snippets'">
            <div class="life-item-detail-content life-item-detail-content-single">
              <p class="quote-date">{{ lifeDetail.item.date }}</p>
              <p class="quote-text">“{{ lifeDetail.item.text }}”</p>
            </div>
          </template>
        </article>
      </template>

      <template v-else>
        <article class="glass-panel not-found-card">
          <h1 class="section-title">内容不存在</h1>
          <p>你访问的生活馆内容可能已删除或链接有误。</p>
          <RouterLink :to="fallbackModulePath" class="btn btn-primary">返回模块页</RouterLink>
        </article>
      </template>
    </div>
  </section>
</template>


