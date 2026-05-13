<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { CalendarDays, Camera, CheckCircle2, Clock3, Disc3, Heart, Languages, Leaf, MapPin, Play, Star, Tag, UserRound } from 'lucide-vue-next'
import { getLifeModuleBySlug } from '../data/siteContent'
import { getPhotographyModuleContent, photographyItems } from '../data/photographyDetailContent'
import { outdoorDetailContent } from '../data/outdoorDetailContent'

const route = useRoute()
const router = useRouter()

const lifeModule = computed(() => getLifeModuleBySlug(route.params.moduleSlug))

const createItemPath = (itemSlug) => `/life/${route.params.moduleSlug}/${itemSlug}`

const getReadingExcerpt = (book) => (book.excerpt || book.intro || book.note || '').trim()
const SHOW_CAROUSEL_SCROLL_TOLERANCE = 2
const SHOW_CAROUSEL_FALLBACK_STEP = 320
const showCarouselTrackRef = ref(null)
const canScrollShowsPrev = ref(false)
const canScrollShowsNext = ref(false)

const getShowCardRating = (show) => {
  const rating = Number(show?.rating)
  if (Number.isFinite(rating) && rating > 0) {
    return rating.toFixed(1)
  }

  return '8.8'
}

const getShowCardRatingScale = (show) => {
  const ratingScale = Number(show?.ratingScale)
  if (Number.isFinite(ratingScale) && ratingScale > 0) {
    return Math.round(ratingScale)
  }

  return 10
}

const getShowCardGenres = (show) => {
  const genres = show?.genres
  if (Array.isArray(genres) && genres.length) {
    return genres
  }

  return ['Drama']
}

const updateShowsCarouselNavState = () => {
  const container = showCarouselTrackRef.value
  if (!container) {
    canScrollShowsPrev.value = false
    canScrollShowsNext.value = false
    return
  }

  const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth)
  if (maxScrollLeft <= SHOW_CAROUSEL_SCROLL_TOLERANCE) {
    canScrollShowsPrev.value = false
    canScrollShowsNext.value = false
    return
  }

  canScrollShowsPrev.value = container.scrollLeft > SHOW_CAROUSEL_SCROLL_TOLERANCE
  canScrollShowsNext.value = container.scrollLeft < maxScrollLeft - SHOW_CAROUSEL_SCROLL_TOLERANCE
}

const getShowsCarouselScrollStep = () => {
  const container = showCarouselTrackRef.value
  if (!container) {
    return SHOW_CAROUSEL_FALLBACK_STEP
  }

  const firstCard = container.querySelector('.shows-carousel-card')
  if (!firstCard || typeof window === 'undefined') {
    return Math.max(SHOW_CAROUSEL_FALLBACK_STEP, Math.round(container.clientWidth * 0.72))
  }

  const styles = window.getComputedStyle(container)
  const rawGap = Number.parseFloat(styles.columnGap || styles.gap || '0')
  const gap = Number.isFinite(rawGap) ? rawGap : 0
  return firstCard.getBoundingClientRect().width + gap
}

const scrollShowsCarouselByDirection = (direction) => {
  const container = showCarouselTrackRef.value
  if (!container) {
    return
  }

  const normalizedDirection = direction < 0 ? -1 : 1
  const step = getShowsCarouselScrollStep()
  container.scrollBy({
    left: normalizedDirection * step,
    behavior: 'smooth'
  })
}

const goToPrevShowCard = () => scrollShowsCarouselByDirection(-1)
const goToNextShowCard = () => scrollShowsCarouselByDirection(1)

const handleShowsCarouselResize = () => {
  if (lifeModule.value?.slug !== 'shows') {
    return
  }

  updateShowsCarouselNavState()
}

const outdoorModuleHero = {
  kicker: 'LIFE MODULE',
  title: '户外记录',
  description: '沿着山海与城市边缘，记录每一次出发与抵达。',
  image: '/bg.png',
  imageAlt: '户外记录模块头图',
  highlights: [
    {
      id: 'discover',
      icon: MapPin,
      title: '发现美景',
      text: '探索沿途绝佳机位'
    },
    {
      id: 'capture',
      icon: Camera,
      title: '记录瞬间',
      text: '定格每一次心动时刻'
    },
    {
      id: 'share',
      icon: Star,
      title: '热爱生活',
      text: '记录每一次出发与抵达。'
    }
  ]
}

const outdoorHeroMainImage = '/public/imags/outdoor/H6.jpg'
const outdoorHeroSubImage = '/public/imags/outdoor/H8.jpg'

const outdoorFeaturedSpots = computed(() =>
  outdoorDetailContent
    .map((item) => {
      const stars = Number(item?.route?.difficultyStars)
      const normalizedStars = Number.isFinite(stars) ? Math.max(1, Math.min(5, Math.round(stars))) : 1
      const linkSlug = typeof item?.slug === 'string' ? item.slug.trim() : ''
      const firstPhotoSrc = item?.journal?.photos?.[0]?.src

      return {
        title: item?.title || '户外记录',
        desc: item?.text || '',
        badge: item?.badge || '户外',
        image: typeof firstPhotoSrc === 'string' && firstPhotoSrc.trim() ? firstPhotoSrc : outdoorHeroMainImage,
        linkSlug,
        stars: normalizedStars,
        date: item?.hero?.date || '',
        distance: item?.hero?.distance || '',
        to: createItemPath(linkSlug)
      }
    })
    .filter((spot) => Boolean(spot.linkSlug))
)

const outdoorSpotsScrollRef = ref(null)

const handleOutdoorSpotsWheel = (event) => {
  const container = outdoorSpotsScrollRef.value
  if (!container) {
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

const musicTracks = computed(() => {
  if (lifeModule.value?.slug !== 'music') {
    return []
  }

  return Array.isArray(lifeModule.value.items) ? lifeModule.value.items : []
})

const selectedTrackSlug = ref('')
const musicCoverFallback = ref(false)
const isMusicPlaylistExpanded = ref(true)
const isCompactViewport = ref(false)
let compactViewportMediaQuery = null

watch(
  [musicTracks, () => route.query.track],
  ([tracks, queryTrack]) => {
    if (!tracks.length) {
      selectedTrackSlug.value = ''
      return
    }

    const querySlug = typeof queryTrack === 'string' ? queryTrack : ''
    const hasQueryTrack = tracks.some((track) => track.slug === querySlug)
    if (hasQueryTrack) {
      selectedTrackSlug.value = querySlug
      return
    }

    const hasSelectedTrack = tracks.some((track) => track.slug === selectedTrackSlug.value)
    if (!hasSelectedTrack) {
      selectedTrackSlug.value = tracks[0].slug
    }
  },
  { immediate: true }
)

watch(selectedTrackSlug, (nextSlug) => {
  if (!nextSlug || lifeModule.value?.slug !== 'music') {
    return
  }

  const currentQueryTrack = typeof route.query.track === 'string' ? route.query.track : ''
  if (currentQueryTrack === nextSlug) {
    return
  }

  router.replace({
    path: '/life/music',
    query: {
      ...route.query,
      track: nextSlug
    }
  })
})

const applyMusicViewportState = () => {
  if (!compactViewportMediaQuery) {
    return
  }

  const wasCompact = isCompactViewport.value
  isCompactViewport.value = compactViewportMediaQuery.matches

  if (!isCompactViewport.value) {
    isMusicPlaylistExpanded.value = true
    return
  }

  if (!wasCompact) {
    isMusicPlaylistExpanded.value = false
  }
}

const toggleMusicPlaylist = () => {
  if (!isCompactViewport.value) {
    return
  }

  isMusicPlaylistExpanded.value = !isMusicPlaylistExpanded.value
}

const handleMusicTrackSelect = (slug) => {
  selectedTrackSlug.value = slug

  if (isCompactViewport.value) {
    isMusicPlaylistExpanded.value = false
  }
}

const selectedTrack = computed(() => {
  if (!musicTracks.value.length) {
    return null
  }

  return musicTracks.value.find((track) => track.slug === selectedTrackSlug.value) || musicTracks.value[0]
})

watch(
  () => selectedTrack.value?.slug,
  () => {
    musicCoverFallback.value = false
  },
  { immediate: true }
)

const musicQuote = computed(() => selectedTrack.value?.quote || selectedTrack.value?.note || '适合在安静时段循环聆听。')
const musicChips = computed(() => {
  const chips = selectedTrack.value?.chips
  if (Array.isArray(chips) && chips.length) {
    return chips
  }

  return ['单曲循环']
})
const musicFeelings = computed(() => {
  const feelings = selectedTrack.value?.feelings
  if (Array.isArray(feelings) && feelings.length) {
    return feelings
  }

  const note = selectedTrack.value?.note
  return note ? [note] : ['这首歌的情绪和节奏都很耐听。']
})
const musicReasons = computed(() => {
  const reasons = selectedTrack.value?.reasons
  if (Array.isArray(reasons) && reasons.length) {
    return reasons
  }

  return ['旋律抓耳，记忆点明显', '适合在通勤和放松场景里反复聆听']
})
const musicTags = computed(() => {
  const tags = selectedTrack.value?.tags
  if (Array.isArray(tags) && tags.length) {
    return tags
  }

  return musicChips.value.slice(0, 6)
})
const musicMeta = computed(() => {
  const meta = selectedTrack.value?.meta || {}
  return {
    releaseDate: meta.releaseDate || '待补充',
    album: meta.album || '待补充',
    duration: meta.duration || '待补充',
    language: meta.language || '待补充'
  }
})

const getMusicTextDensityClass = (value, smThreshold, xsThreshold) => {
  const length = Array.from(String(value || '').trim()).length
  if (length >= xsThreshold) {
    return 'music-text-density-xs'
  }
  if (length >= smThreshold) {
    return 'music-text-density-sm'
  }

  return ''
}

const musicTitleDensityClass = computed(() => getMusicTextDensityClass(selectedTrack.value?.title, 14, 22))
const musicArtistDensityClass = computed(() => getMusicTextDensityClass(selectedTrack.value?.artist, 18, 28))
const musicQuoteDensityClass = computed(() => getMusicTextDensityClass(musicQuote.value, 54, 86))
const musicAlbumDensityClass = computed(() => getMusicTextDensityClass(musicMeta.value.album, 18, 30))

const handleMusicCoverError = () => {
  musicCoverFallback.value = true
}

onMounted(() => {
  compactViewportMediaQuery = window.matchMedia('(max-width: 900px)')
  applyMusicViewportState()

  if (typeof compactViewportMediaQuery.addEventListener === 'function') {
    compactViewportMediaQuery.addEventListener('change', applyMusicViewportState)
    return
  }

  compactViewportMediaQuery.addListener(applyMusicViewportState)
})

onBeforeUnmount(() => {
  if (!compactViewportMediaQuery) {
    return
  }

  if (typeof compactViewportMediaQuery.removeEventListener === 'function') {
    compactViewportMediaQuery.removeEventListener('change', applyMusicViewportState)
    return
  }

  compactViewportMediaQuery.removeListener(applyMusicViewportState)
})

watch(
  () => [lifeModule.value?.slug, Array.isArray(lifeModule.value?.items) ? lifeModule.value.items.length : 0],
  async ([slug]) => {
    if (slug !== 'shows') {
      canScrollShowsPrev.value = false
      canScrollShowsNext.value = false
      return
    }

    await nextTick()
    updateShowsCarouselNavState()
  },
  { immediate: true }
)

onMounted(() => {
  if (typeof window === 'undefined') {
    return
  }

  window.addEventListener('resize', handleShowsCarouselResize)
})

onBeforeUnmount(() => {
  if (typeof window === 'undefined') {
    return
  }

  window.removeEventListener('resize', handleShowsCarouselResize)
})

const outdoorModuleHeroStyle = computed(() => ({
  '--outdoor-hero-image': `url("${outdoorModuleHero.image}")`
}))

const photoModuleContent = computed(() => {
  if (lifeModule.value?.slug !== 'photography') {
    return null
  }

  return getPhotographyModuleContent()
})

const photoHeroVisualMainImage = computed(() => photoModuleContent.value?.hero?.visual?.mainImage || '/public/imags/project-shot1.png')
const photoHeroVisualMainAlt = computed(() => photoModuleContent.value?.hero?.visual?.mainAlt || '项目主视觉卡片')
const photoHeroVisualSubImage = computed(() => photoModuleContent.value?.hero?.visual?.subImage || '/public/imags/project-shot.png')
const photoHeroVisualSubAlt = computed(() => photoModuleContent.value?.hero?.visual?.subAlt || '项目界面卡片')

const photoFeaturedEntries = computed(() => {
  const featured = photoModuleContent.value?.featured
  return Array.isArray(featured) ? featured : []
})

const selectedPhotoFeaturedIndex = ref(0)

watch(
  photoFeaturedEntries,
  (entries) => {
    if (!entries.length) {
      selectedPhotoFeaturedIndex.value = 0
      return
    }

    if (selectedPhotoFeaturedIndex.value >= entries.length) {
      selectedPhotoFeaturedIndex.value = 0
    }
  },
  { immediate: true }
)

const activePhotoFeatured = computed(() => {
  if (!photoFeaturedEntries.value.length) {
    return null
  }

  return photoFeaturedEntries.value[selectedPhotoFeaturedIndex.value]
})

const setPhotoFeatured = (index) => {
  if (!photoFeaturedEntries.value.length) {
    return
  }

  const normalizedIndex = Number(index)
  if (!Number.isFinite(normalizedIndex)) {
    return
  }

  selectedPhotoFeaturedIndex.value = Math.max(0, Math.min(photoFeaturedEntries.value.length - 1, normalizedIndex))
}

const goToPrevPhotoFeatured = () => {
  const total = photoFeaturedEntries.value.length
  if (!total) {
    return
  }

  selectedPhotoFeaturedIndex.value = (selectedPhotoFeaturedIndex.value - 1 + total) % total
}

const goToNextPhotoFeatured = () => {
  const total = photoFeaturedEntries.value.length
  if (!total) {
    return
  }

  selectedPhotoFeaturedIndex.value = (selectedPhotoFeaturedIndex.value + 1) % total
}

const photoRecentItems = computed(() => {
  if (lifeModule.value?.slug !== 'photography') {
    return []
  }

  return photographyItems
})

const photoTotalShots = computed(() => {
  const configured = Number(photoModuleContent.value?.hero?.totalShots)
  if (Number.isFinite(configured) && configured > 0) {
    return Math.round(configured)
  }

  return photoRecentItems.value.length
})

const photoTotalShotsNote = computed(() => photoModuleContent.value?.hero?.totalShotsNote || '持续更新')

const photoRecentScrollRef = ref(null)

const handlePhotoRecentWheel = (event) => {
  const container = photoRecentScrollRef.value
  if (!container) {
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

const photoJournalEntries = computed(() => {
  const entries = photoModuleContent.value?.journal?.entries
  return Array.isArray(entries) ? entries : []
})

</script>

<template>
  <section class="page-section section-reveal compact-detail-scale">
    <div class="page-container detail-wrap">
      <template v-if="lifeModule">
        <RouterLink to="/life" class="text-link back-link">&larr; 返回生活馆</RouterLink>

        <header
          v-if="lifeModule.slug !== 'outdoors' && lifeModule.slug !== 'photography'"
          class="life-detail-head"
          :class="{
            'glass-panel': lifeModule.slug !== 'music' && lifeModule.slug !== 'shows',
            'life-detail-head--snippets': lifeModule.slug === 'snippets'
          }"
        >
          <p class="eyebrow">Life Module</p>
          <h1 class="section-title detail-title">{{ lifeModule.title }}</h1>
          <p class="section-description">{{ lifeModule.description }}</p>
        </header>

        <section v-if="lifeModule.slug === 'reading'" class="life-module-content">
          <div class="book-grid">
            <RouterLink
              v-for="book in lifeModule.items"
              :key="book.slug"
              :to="createItemPath(book.slug)"
              class="book-card lift-click card-link-reset"
              :aria-label="`查看《${book.title}》详情`"
            >
              <img :src="book.cover" :alt="book.title" class="book-cover" />
              <h3>{{ book.title }}</h3>
              <p class="muted">{{ book.author }}</p>
              <p class="book-excerpt">{{ getReadingExcerpt(book) }}</p>
            </RouterLink>
          </div>
        </section>

        <section v-else-if="lifeModule.slug === 'shows'" class="life-module-content life-card shows-module-card">
          <div class="shows-carousel-shell">
            <button
              type="button"
              class="shows-carousel-nav-btn shows-carousel-nav-btn-prev"
              :disabled="!canScrollShowsPrev"
              aria-label="Scroll shows left"
              @click="goToPrevShowCard"
            >
              &lt;
            </button>

            <div ref="showCarouselTrackRef" class="shows-carousel-track" @scroll="updateShowsCarouselNavState">
              <RouterLink
                v-for="show in lifeModule.items"
                :key="show.slug"
                :to="createItemPath(show.slug)"
                class="shows-carousel-card card-link-reset lift-click"
                :aria-label="`Open show detail for ${show.title}`"
              >
                <figure class="shows-carousel-poster-shell">
                  <img :src="show.posterUrl || '/bg.png'" :alt="show.title" class="shows-carousel-poster" loading="lazy" />
                </figure>

                <div class="shows-carousel-content">
                  <h3 class="shows-carousel-title">{{ show.title }}</h3>

                  <p class="shows-carousel-rating">
                    <span class="shows-carousel-rating-star" aria-hidden="true">&#9733;</span>
                    <span>{{ getShowCardRating(show) }}</span>
                    <span class="shows-carousel-rating-scale">/{{ getShowCardRatingScale(show) }}</span>
                  </p>

                  <div class="shows-carousel-genres" aria-label="Show genres">
                    <span v-for="genre in getShowCardGenres(show)" :key="`${show.slug}-${genre}`" class="shows-carousel-genre-pill">
                      {{ genre }}
                    </span>
                  </div>

                  <p class="shows-carousel-reason-pill" :title="show.reason || ''">{{ show.reason || 'Reason pending' }}</p>
                </div>
              </RouterLink>
            </div>

            <button
              type="button"
              class="shows-carousel-nav-btn shows-carousel-nav-btn-next"
              :disabled="!canScrollShowsNext"
              aria-label="Scroll shows right"
              @click="goToNextShowCard"
            >
              &gt;
            </button>
          </div>
        </section>
        <section v-else-if="lifeModule.slug === 'music'" class="life-module-content music-module-merged-shell">
          <aside class="glass-panel life-card music-playlist-panel" :class="{ 'music-playlist-panel-collapsed': isCompactViewport && !isMusicPlaylistExpanded }">
            <div class="music-playlist-head">
              <p class="music-playlist-title-row">
                <span class="music-playlist-title-dot" aria-hidden="true"></span>
                <span class="music-playlist-title">播放列表</span>
              </p>
              <span class="music-playlist-count">{{ musicTracks.length }}首</span>
            </div>

            <button
              type="button"
              class="music-playlist-toggle"
              aria-controls="music-playlist-scroll"
              :aria-expanded="isMusicPlaylistExpanded ? 'true' : 'false'"
              @click="toggleMusicPlaylist"
            >
              {{ isMusicPlaylistExpanded ? '收起列表' : '展开列表' }}
              <span class="music-playlist-toggle-arrow" :class="{ 'is-open': isMusicPlaylistExpanded }" aria-hidden="true">▾</span>
            </button>

            <p v-if="selectedTrack" class="music-playlist-current">{{ selectedTrack.title }} · {{ selectedTrack.artist }}</p>

            <div id="music-playlist-scroll" class="music-playlist-scroll" :hidden="isCompactViewport && !isMusicPlaylistExpanded">
              <button
                v-for="track in musicTracks"
                :key="track.slug"
                type="button"
                class="music-playlist-item"
                :class="{ 'is-active': track.slug === selectedTrackSlug }"
                :aria-label="`切换到歌曲 ${track.title}`"
                @click="handleMusicTrackSelect(track.slug)"
              >
                <img :src="track.coverUrl" :alt="track.title" class="music-playlist-cover" />
                <span class="music-playlist-copy">
                  <strong>{{ track.title }}</strong>
                  <span>{{ track.artist }}</span>
                </span>
                <span class="music-playlist-wave" aria-hidden="true">
                  <i></i>
                  <i></i>
                  <i></i>
                </span>
              </button>
            </div>
          </aside>

          <article v-if="selectedTrack" class="glass-panel life-card music-module-detail-panel music-detail-layout">
            <div class="music-detail-shell life-item-detail-content-single">
              <section class="music-detail-hero">
                <div class="music-detail-cover-stack">
                  <div class="music-detail-vinyl" aria-hidden="true"></div>
                  <figure class="music-detail-cover-frame">
                    <img
                      v-if="selectedTrack.coverUrl && !musicCoverFallback"
                      :src="selectedTrack.coverUrl"
                      :alt="selectedTrack.title"
                      class="music-detail-cover-image"
                      @error="handleMusicCoverError"
                    />
                    <div v-else class="music-detail-cover-placeholder" aria-hidden="true"></div>
                  </figure>
                </div>

                <div class="music-detail-main">
                  <h2 class="music-detail-title" :class="musicTitleDensityClass">{{ selectedTrack.title }}</h2>
                  <p class="music-detail-artist" :class="musicArtistDensityClass">{{ selectedTrack.artist }}</p>

                  <div class="music-detail-chip-row">
                    <span v-for="chip in musicChips" :key="chip" class="chip music-detail-chip">{{ chip }}</span>
                  </div>

                  <div class="music-detail-action-row">
                    <a :href="selectedTrack.playUrl || '#'" target="_blank" rel="noopener noreferrer" class="btn btn-primary music-detail-btn">
                      <Play class="music-detail-btn-icon" aria-hidden="true" />
                      播放
                    </a>
                    <button type="button" class="btn btn-outline music-detail-btn music-detail-btn-outline">
                      <Heart class="music-detail-btn-icon" aria-hidden="true" />
                      收藏
                    </button>
                  </div>
                </div>

                <blockquote class="music-detail-quote">
                  <span class="music-detail-quote-mark music-detail-quote-mark-open" aria-hidden="true">“</span>
                  <p class="music-detail-quote-copy" :class="musicQuoteDensityClass">{{ musicQuote }}</p>
                  <span class="music-detail-quote-mark music-detail-quote-mark-close" aria-hidden="true">”</span>
                </blockquote>

                <section class="music-detail-meta music-detail-meta-inline" aria-label="音乐元信息">
                  <article class="music-detail-meta-item">
                    <div class="music-detail-meta-label">
                      <CalendarDays class="music-detail-meta-icon" aria-hidden="true" />
                      发行时间
                    </div>
                    <p class="music-detail-meta-value">{{ musicMeta.releaseDate }}</p>
                  </article>
                  <article class="music-detail-meta-item">
                    <div class="music-detail-meta-label">
                      <Disc3 class="music-detail-meta-icon" aria-hidden="true" />
                      专辑
                    </div>
                    <p class="music-detail-meta-value music-detail-meta-album" :class="musicAlbumDensityClass">{{ musicMeta.album }}</p>
                  </article>
                  <article class="music-detail-meta-item">
                    <div class="music-detail-meta-label">
                      <Clock3 class="music-detail-meta-icon" aria-hidden="true" />
                      时长
                    </div>
                    <p class="music-detail-meta-value">{{ musicMeta.duration }}</p>
                  </article>
                  <article class="music-detail-meta-item">
                    <div class="music-detail-meta-label">
                      <Languages class="music-detail-meta-icon" aria-hidden="true" />
                      语言
                    </div>
                    <p class="music-detail-meta-value">{{ musicMeta.language }}</p>
                  </article>
                </section>
              </section>

              <section class="music-detail-panels">
                <article class="music-detail-panel">
                  <h3 class="music-detail-panel-title">
                    <UserRound class="music-detail-panel-icon" aria-hidden="true" />
                    歌曲简介
                  </h3>
                  <div class="music-detail-panel-body">
                    <p v-for="paragraph in musicFeelings" :key="paragraph">{{ paragraph }}</p>
                  </div>
                </article>

                <article class="music-detail-panel">
                  <h3 class="music-detail-panel-title">
                    <CheckCircle2 class="music-detail-panel-icon" aria-hidden="true" />
                    为什么推荐
                  </h3>
                  <div class="music-detail-panel-body">
                    <ul class="music-detail-reason-list">
                      <li v-for="reason in musicReasons" :key="reason">{{ reason }}</li>
                    </ul>
                  </div>
                </article>

                <article class="music-detail-panel music-detail-tags-panel">
                  <h3 class="music-detail-panel-title">
                    <Tag class="music-detail-panel-icon" aria-hidden="true" />
                    音乐标签
                  </h3>
                  <div class="music-detail-panel-body music-detail-panel-body-tags">
                    <div class="music-detail-tag-grid">
                      <span v-for="tag in musicTags" :key="tag" class="music-detail-tag-chip">#{{ tag }}</span>
                    </div>
                  </div>
                </article>
              </section>
            </div>
          </article>

          <article v-else class="glass-panel life-card">
            <p class="muted">暂无音乐数据。</p>
          </article>
        </section>

        <section v-else-if="lifeModule.slug === 'outdoors'" class="outdoor-module-shell">
          <article class="glass-panel outdoor-module-hero" :style="outdoorModuleHeroStyle">
            <div class="outdoor-module-hero-copy">
              <p class="outdoor-module-kicker">{{ outdoorModuleHero.kicker }}</p>
              <h1 class="outdoor-module-title">{{ outdoorModuleHero.title }}</h1>
              <p class="outdoor-module-desc">{{ outdoorModuleHero.description }}</p>

              <ul class="outdoor-module-point-list">
                <li v-for="point in outdoorModuleHero.highlights" :key="point.id" class="outdoor-module-point">
                  <span class="outdoor-module-point-icon-wrap">
                    <component :is="point.icon" class="outdoor-module-point-icon" aria-hidden="true" />
                  </span>
                  <div class="outdoor-module-point-copy">
                    <strong>{{ point.title }}</strong>
                    <p>{{ point.text }}</p>
                  </div>
                </li>
              </ul>
            </div>

            <div class="outdoor-module-hero-collage" aria-hidden="true">
              <figure class="outdoor-module-polaroid outdoor-module-polaroid-main">
                <img :src="outdoorHeroMainImage" alt="" />
              </figure>
              <figure class="outdoor-module-polaroid outdoor-module-polaroid-sub">
                <img :src="outdoorHeroSubImage" alt="" />
              </figure>
            </div>
          </article>

          <section id="outdoor-module-spots" class="glass-panel outdoor-module-featured">
            <header class="outdoor-module-featured-head">
              <div class="outdoor-module-featured-title-wrap">
                <h2 class="outdoor-module-featured-title">
                  <Leaf class="outdoor-module-featured-icon" aria-hidden="true" />
                  精选户外路线
                </h2>
                <p class="outdoor-module-featured-subtitle">精选近期徒步、骑行与露营记录，沿着路线继续出发。</p>
              </div>
            </header>

            <div
              ref="outdoorSpotsScrollRef"
              class="outdoor-module-spot-scroll"
              aria-label="精选户外路线列表，可左右滑动"
              @wheel="handleOutdoorSpotsWheel"
            >
              <div id="outdoor-module-spots-grid" class="outdoor-module-spot-grid">
              <RouterLink
                v-for="spot in outdoorFeaturedSpots"
                :key="spot.linkSlug"
                :to="spot.to"
                class="outdoor-module-spot-card card-link-reset lift-click"
                :aria-label="`查看${spot.title}户外记录详情`"
              >
                <figure class="outdoor-module-spot-media">
                  <img :src="spot.image" :alt="spot.title" />
                  <figcaption class="outdoor-module-spot-badge">
                    <Leaf class="outdoor-module-spot-badge-icon" aria-hidden="true" />
                    {{ spot.badge }}
                  </figcaption>
                </figure>

                <div class="outdoor-module-spot-body">
                  <p class="outdoor-module-spot-title-row">
                    <MapPin class="outdoor-module-spot-title-icon" aria-hidden="true" />
                    <span>{{ spot.title }}</span>
                  </p>
                  <p class="outdoor-module-spot-desc">{{ spot.desc }}</p>

                  <div class="outdoor-module-spot-meta">
                    <span class="outdoor-module-spot-time">记录日期：{{ spot.date || '待补充' }} · 路线距离：{{ spot.distance || '待补充' }}</span>
                    <span class="outdoor-module-spot-stars" aria-label="推荐指数">
                      <Star
                        v-for="index in 5"
                        :key="`${spot.linkSlug}-star-${index}`"
                        class="outdoor-module-spot-star"
                        :class="{ active: index <= spot.stars }"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </div>
              </RouterLink>
              </div>
            </div>
          </section>

          <p class="outdoor-module-tip">
            <Leaf class="outdoor-module-tip-icon" aria-hidden="true" />
            尊重自然与他人，注意安全出行，带上装备，记录每一次出发与抵达。
          </p>
        </section>

        <section v-else-if="lifeModule.slug === 'photography'" class="photo-module-shell">
          <article class="glass-panel photo-module-hero">
            <div class="photo-module-hero-main">
              <p class="photo-module-kicker">{{ photoModuleContent?.hero?.kicker || 'LIFE MODULE' }}</p>
              <h1 class="photo-module-title">{{ photoModuleContent?.hero?.title || lifeModule.title }}</h1>
              <p class="photo-module-desc">{{ photoModuleContent?.hero?.description || lifeModule.description }}</p>
              <div class="photo-module-total-card" aria-label="拍摄统计">
                <span class="photo-module-total-icon-wrap" aria-hidden="true">
                  <Camera class="photo-module-total-icon" />
                </span>
                <span class="photo-module-total-copy">
                  <strong class="photo-module-total-title">记录瞬间</strong>
                  <span class="photo-module-total-note">已拍摄 {{ photoTotalShots }} 张照片 · {{ photoTotalShotsNote }}</span>
                </span>
              </div>
            </div>

            <div class="photo-module-hero-visual">
              <figure class="photo-module-hero-card photo-module-hero-card-main">
                <img :src="photoHeroVisualMainImage" :alt="photoHeroVisualMainAlt" loading="lazy" />
              </figure>
              <figure class="photo-module-hero-card photo-module-hero-card-sub">
                <img :src="photoHeroVisualSubImage" :alt="photoHeroVisualSubAlt" loading="lazy" />
              </figure>
            </div>
          </article>

          <section class="glass-panel photo-module-featured">
            <header class="photo-module-section-head">
              <h2>今日精选</h2>
            </header>

            <article v-if="activePhotoFeatured" class="photo-module-featured-card">
              <button type="button" class="photo-module-featured-arrow" aria-label="查看上一张精选照片" @click="goToPrevPhotoFeatured">
                ‹
              </button>

              <RouterLink
                :to="createItemPath(activePhotoFeatured.photoSlug)"
                class="photo-module-featured-link card-link-reset"
                :aria-label="`查看精选摄影作品《${activePhotoFeatured.title}》详情`"
              >
                <img :src="activePhotoFeatured.image" :alt="activePhotoFeatured.title" class="photo-module-featured-image" />
                <div class="photo-module-featured-overlay">
                  <h3>{{ activePhotoFeatured.title }}</h3>
                  <p class="photo-module-featured-meta">{{ activePhotoFeatured.date }} · {{ activePhotoFeatured.location }}</p>
                  <p>{{ activePhotoFeatured.description }}</p>
                </div>
              </RouterLink>

              <button type="button" class="photo-module-featured-arrow" aria-label="查看下一张精选照片" @click="goToNextPhotoFeatured">
                ›
              </button>
            </article>

            <div class="photo-module-featured-dots" role="tablist" aria-label="今日精选切换">
              <button
                v-for="(featured, index) in photoFeaturedEntries"
                :key="featured.id"
                type="button"
                class="photo-module-featured-dot"
                :class="{ 'is-active': index === selectedPhotoFeaturedIndex }"
                :aria-label="`查看第 ${index + 1} 张精选照片`"
                :aria-selected="index === selectedPhotoFeaturedIndex ? 'true' : 'false'"
                @click="setPhotoFeatured(index)"
              ></button>
            </div>
          </section>

          <div class="photo-module-lower-grid">
            <section class="glass-panel photo-module-recent">
              <header class="photo-module-section-head photo-module-recent-head">
                <h2>最近拍摄</h2>
              </header>

              <div
                v-if="photoRecentItems.length"
                ref="photoRecentScrollRef"
                class="photo-module-recent-scroll"
                aria-label="最近拍摄列表，可左右滑动"
                @wheel="handlePhotoRecentWheel"
              >
                <div class="photo-module-recent-grid">
                  <figure v-for="photo in photoRecentItems" :key="photo.slug" class="photo-module-recent-card">
                    <RouterLink
                      :to="createItemPath(photo.slug)"
                      class="photo-module-recent-link card-link-reset lift-click"
                      :aria-label="`查看摄影作品《${photo.title}》详情`"
                    >
                      <img :src="photo.image" :alt="photo.title" class="photo-module-recent-image" />
                      <figcaption class="photo-module-recent-copy">
                        <p class="photo-module-recent-badges">
                          <span>{{ photo.weather }}</span>
                          <span>{{ photo.date }}</span>
                        </p>
                        <p class="photo-module-recent-location">{{ photo.location }}</p>
                        <p class="photo-module-recent-desc">{{ photo.description }}</p>
                        <p class="photo-module-recent-chips">
                          <span class="photo-module-recent-chip">{{ photo.music }}</span>
                          <span class="photo-module-recent-chip">{{ photo.mood }}</span>
                        </p>
                      </figcaption>
                    </RouterLink>
                  </figure>
                </div>
              </div>

              <p v-else class="photo-module-empty">暂无照片记录。</p>
            </section>

            <aside class="glass-panel photo-module-journal">
              <header class="photo-module-section-head photo-module-journal-head">
                <h2>{{ photoModuleContent?.journal?.title || '摄影小记' }}</h2>
                <button type="button" class="photo-module-journal-more">{{ photoModuleContent?.journal?.moreText || '更多' }}</button>
              </header>

              <ol v-if="photoJournalEntries.length" class="photo-module-journal-list">
                <li v-for="entry in photoJournalEntries" :key="entry.id" class="photo-module-journal-item">
                  <p class="photo-module-journal-date">{{ entry.date }}</p>
                  <p class="photo-module-journal-text">{{ entry.text }}</p>
                  <RouterLink
                    :to="createItemPath(entry.photoSlug)"
                    class="photo-module-journal-thumb card-link-reset lift-click"
                    :aria-label="`查看${entry.date}的摄影记录`"
                  >
                    <img :src="entry.image" :alt="entry.date" />
                  </RouterLink>
                </li>
              </ol>

              <p v-else class="photo-module-empty">暂无摄影小记。</p>

              <button type="button" class="photo-module-journal-cta">
                <Camera class="photo-module-journal-cta-icon" aria-hidden="true" />
                {{ photoModuleContent?.journal?.ctaText || '记录此刻' }}
              </button>
            </aside>
          </div>
        </section>

        <section
          v-else-if="lifeModule.slug === 'snippets'"
          class="life-module-content glass-panel life-card life-module-snippets-detail"
        >
          <ul class="quote-list">
            <li v-for="snippet in lifeModule.items" :key="snippet.slug" class="life-list-item life-list-item--text-link">
              <p class="quote-date">{{ snippet.date }}</p>
              <p class="quote-text">“{{ snippet.text }}”</p>
            </li>
          </ul>
        </section>
      </template>

      <template v-else>
        <article class="glass-panel not-found-card">
          <h1 class="section-title">模块不存在</h1>
          <p>你访问的生活馆模块可能已删除或链接有误。</p>
          <RouterLink to="/life" class="btn btn-primary">回到生活馆</RouterLink>
        </article>
      </template>
    </div>
  </section>
</template>

<style scoped>
.detail-wrap {
  width: min(1120px, calc(100% - 48px));
  margin: 0 auto;
}

.life-detail-head--snippets {
  border: 0 !important;
  background: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

.life-module-snippets-detail {
  border: 0 !important;
}

.shows-module-card {
  width: min(1000px, calc(100% - 84px));
  max-width: 100%;
  margin: 0 auto;
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgba(125, 175, 207, 0.2);
  background:
    linear-gradient(155deg, rgba(248, 253, 255, 0.44) 0%, rgba(232, 246, 254, 0.28) 100%);
  box-shadow:
    0 16px 34px rgba(39, 91, 125, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.58);
  backdrop-filter: blur(12px) saturate(112%);
  -webkit-backdrop-filter: blur(12px) saturate(112%);
}

.shows-carousel-shell {
  --shows-nav-edge-offset: 10px;
  position: relative;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
}

.shows-carousel-track {
  margin: 0;
  padding: 6px clamp(48px, 5vw, 58px) 10px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  display: flex;
  align-items: stretch;
  gap: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  scroll-snap-type: x proximity;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
  scrollbar-width: thin;
  scrollbar-color: rgba(86, 138, 173, 0.45) rgba(140, 180, 208, 0.14);
}

.shows-carousel-track::-webkit-scrollbar {
  height: 8px;
}

.shows-carousel-track::-webkit-scrollbar-track {
  border-radius: 999px;
  background: rgba(140, 180, 208, 0.14);
}

.shows-carousel-track::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(86, 138, 173, 0.45);
}

.shows-carousel-card {
  flex: 0 0 clamp(178px, 16vw, 214px);
  min-width: 0;
  border-radius: 18px;
  border: 1px solid rgba(108, 158, 190, 0.18);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.76) 0%, rgba(249, 253, 255, 0.68) 100%);
  box-shadow: 0 8px 18px rgba(37, 82, 112, 0.09);
  color: inherit;
  text-decoration: none;
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr;
  scroll-snap-align: start;
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}

.shows-carousel-card:hover,
.shows-carousel-card:focus-visible {
  transform: translateY(-3px);
  border-color: rgba(90, 143, 176, 0.28);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.84) 0%, rgba(250, 253, 255, 0.76) 100%);
  box-shadow: 0 12px 24px rgba(35, 79, 108, 0.12);
}

.shows-carousel-card:focus-visible {
  outline: 2px solid rgba(70, 134, 185, 0.38);
  outline-offset: 2px;
}

.shows-carousel-poster-shell {
  margin: 0;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border-bottom: 1px solid rgba(99, 148, 180, 0.2);
}

.shows-carousel-poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.shows-carousel-content {
  min-width: 0;
  padding: 9px;
  display: grid;
  align-content: start;
  gap: 7px;
}

.shows-carousel-title {
  margin: 0;
  color: #133654;
  font-size: 0.92rem;
  line-height: 1.2;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.shows-carousel-rating {
  margin: 0;
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  color: #3e6a8e;
  font-size: 0.82rem;
  font-weight: 700;
}

.shows-carousel-rating-star {
  color: #5fa24a;
  font-size: 0.84rem;
  line-height: 1;
}

.shows-carousel-rating-scale {
  color: #6c8ca6;
  font-size: 0.76rem;
  font-weight: 600;
}

.shows-carousel-genres {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  min-height: 50px;
  max-height: 50px;
  overflow: hidden;
  gap: 6px;
}

.shows-carousel-genre-pill,
.shows-carousel-reason-pill {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  border-radius: 999px;
  border: 1px solid rgba(111, 161, 191, 0.28);
  padding: 0 8px;
  font-size: 0.72rem;
  line-height: 1.2;
}

.shows-carousel-genre-pill {
  color: #4d7494;
  background: rgba(246, 251, 255, 0.9);
}

.shows-carousel-reason-pill {
  margin: auto 0 0;
  max-width: 100%;
  width: fit-content;
  color: #2f6da0;
  background: rgba(233, 245, 253, 0.88);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.shows-carousel-nav-btn {
  position: absolute;
  top: 50%;
  z-index: 2;
  width: 38px;
  height: 38px;
  border-radius: 999px;
  border: 1px solid rgba(113, 160, 190, 0.34);
  background: rgba(248, 253, 255, 0.92);
  color: #316d9d;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0;
  line-height: 1;
  transform: translateY(-50%);
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
}

.shows-carousel-nav-btn::before {
  display: block;
  font-size: clamp(1.04rem, 1.4vw, 1.26rem);
  line-height: 1;
  font-weight: 700;
  transform: translateY(-1px);
}

.shows-carousel-nav-btn-prev::before {
  content: '\2039';
}

.shows-carousel-nav-btn-next::before {
  content: '\203A';
}

.shows-carousel-nav-btn:hover:not(:disabled),
.shows-carousel-nav-btn:focus-visible:not(:disabled) {
  background: rgba(235, 247, 255, 0.98);
  border-color: rgba(102, 152, 184, 0.4);
  color: #245d88;
}

.shows-carousel-nav-btn:focus-visible {
  outline: 2px solid rgba(67, 131, 184, 0.4);
  outline-offset: 2px;
}

.shows-carousel-nav-btn:disabled {
  cursor: default;
  opacity: 0.42;
}

.shows-carousel-nav-btn-prev {
  left: var(--shows-nav-edge-offset);
}

.shows-carousel-nav-btn-next {
  right: var(--shows-nav-edge-offset);
}

.music-module-merged-shell {
  --music-desktop-panel-height: clamp(580px, calc(100vh - 142px), 760px);
  --music-desktop-hero-height: clamp(332px, 45%, 372px);
  display: grid;
  grid-template-columns: minmax(240px, 300px) minmax(0, 1fr);
  gap: 14px;
  align-items: start;
}

.music-playlist-panel {
  --playlist-visible-items: 5;
  --playlist-item-height: 64px;
  --playlist-item-gap: 10px;
  position: sticky;
  top: 104px;
  display: grid;
  grid-template-rows: auto auto auto auto;
  gap: 10px;
  padding: 16px;
  background: transparent !important;
  box-shadow: none !important;
}

.music-playlist-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.music-playlist-title-row {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.music-playlist-title-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #4c93d3;
  box-shadow: 0 0 0 4px rgba(76, 147, 211, 0.16);
}

.music-playlist-title {
  color: var(--text-strong);
  font-size: 1.02rem;
  font-weight: 700;
}

.music-playlist-count {
  flex-shrink: 0;
  min-width: 52px;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(123, 170, 204, 0.38);
  background: transparent;
  color: #426586;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
}

.music-playlist-toggle {
  display: none;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 38px;
  border-radius: 10px;
  border: 1px solid rgba(115, 165, 201, 0.3);
  background: transparent;
  color: #345979;
  padding: 0 12px;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
}

.music-playlist-toggle-arrow {
  transition: transform 0.2s ease;
}

.music-playlist-toggle-arrow.is-open {
  transform: rotate(180deg);
}

.music-playlist-current {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.84rem;
  line-height: 1.5;
}

.music-playlist-scroll {
  display: grid;
  gap: var(--playlist-item-gap);
  max-height: calc(var(--playlist-visible-items) * var(--playlist-item-height) + (var(--playlist-visible-items) - 1) * var(--playlist-item-gap));
  overflow-y: auto;
  padding-right: 6px;
  scrollbar-width: thin;
  scrollbar-color: rgba(88, 145, 188, 0.82) rgba(214, 232, 246, 0.58);
}

.music-playlist-scroll::-webkit-scrollbar {
  width: 8px;
}

.music-playlist-scroll::-webkit-scrollbar-track {
  border-radius: 999px;
  background: rgba(214, 232, 246, 0.58);
}

.music-playlist-scroll::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: linear-gradient(180deg, #6aa7dc 0%, #4a87c3 100%);
}

.music-playlist-item {
  min-height: var(--playlist-item-height);
  width: 100%;
  border-radius: 14px;
  border: 1px solid rgba(121, 166, 199, 0.22);
  background: transparent;
  padding: 8px 10px;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
}

.music-playlist-item:hover,
.music-playlist-item:focus-visible {
  transform: translateY(-1px);
  border-color: rgba(90, 145, 189, 0.34);
  box-shadow: 0 8px 16px rgba(38, 89, 125, 0.12);
}

.music-playlist-item:focus-visible {
  outline: 2px solid rgba(62, 130, 188, 0.38);
  outline-offset: 2px;
}

.music-playlist-item.is-active {
  border-color: rgba(97, 148, 191, 0.4);
  background: transparent;
  box-shadow: none;
}

.music-playlist-cover {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  object-fit: cover;
  border: 1px solid rgba(109, 152, 183, 0.24);
}

.music-playlist-copy {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.music-playlist-copy strong {
  color: #173858;
  font-size: 0.96rem;
  line-height: 1.2;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.music-playlist-copy span {
  color: #5a7996;
  font-size: 0.84rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.music-playlist-wave {
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
  width: 14px;
  height: 14px;
  opacity: 0;
}

.music-playlist-wave i {
  width: 3px;
  border-radius: 999px;
  background: #3f8ed2;
}

.music-playlist-wave i:nth-child(1) {
  height: 7px;
}

.music-playlist-wave i:nth-child(2) {
  height: 12px;
}

.music-playlist-wave i:nth-child(3) {
  height: 9px;
}

.music-playlist-item.is-active .music-playlist-wave {
  opacity: 1;
}

.music-module-detail-panel {
  padding: 16px 18px 18px;
  border: 1px solid rgba(96, 146, 183, 0.34);
  background: transparent !important;
  box-shadow: none !important;
}

@media (min-width: 1201px) {
  .music-module-merged-shell {
    align-items: stretch;
  }

  .music-playlist-panel,
  .music-module-detail-panel {
    height: var(--music-desktop-panel-height);
    min-height: var(--music-desktop-panel-height);
    max-height: var(--music-desktop-panel-height);
  }

  .music-playlist-panel {
    grid-template-rows: auto auto auto minmax(0, 1fr);
    overflow: hidden;
  }

  .music-playlist-scroll {
    min-height: 0;
    height: 100%;
    max-height: none;
    align-content: start;
    padding-right: 8px;
  }

  .music-module-detail-panel.music-detail-layout {
    overflow: hidden;
  }

  .music-module-detail-panel .music-detail-shell {
    height: 100%;
    min-height: 0;
    grid-template-rows: minmax(0, var(--music-desktop-hero-height)) minmax(0, 1fr);
  }

  .music-module-detail-panel .music-detail-hero,
  .music-module-detail-panel .music-detail-panels {
    min-height: 0;
  }

  .music-module-detail-panel .music-detail-hero {
    overflow: hidden;
  }

  .music-module-detail-panel .music-detail-panels {
    align-items: stretch;
  }

  .music-module-detail-panel .music-detail-panel {
    min-height: 0;
    grid-template-rows: auto minmax(0, 1fr);
    overflow: hidden;
  }

  .music-module-detail-panel .music-detail-panel-body {
    min-height: 0;
    overflow-y: auto;
    padding-right: 6px;
    scrollbar-width: thin;
    scrollbar-color: rgba(88, 145, 188, 0.72) rgba(214, 232, 246, 0.42);
  }

  .music-module-detail-panel .music-detail-panel-body::-webkit-scrollbar {
    width: 6px;
  }

  .music-module-detail-panel .music-detail-panel-body::-webkit-scrollbar-track {
    border-radius: 999px;
    background: rgba(214, 232, 246, 0.42);
  }

  .music-module-detail-panel .music-detail-panel-body::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: linear-gradient(180deg, #6aa7dc 0%, #4a87c3 100%);
  }
}

.outdoor-module-shell {
  position: relative;
  display: grid;
  gap: 14px;
  padding: clamp(14px, 2vw, 24px);
  background: transparent;
  box-shadow: none;
  overflow: visible;
}

.outdoor-module-shell::before {
  content: none;
  display: none;
  pointer-events: none;
}

.outdoor-module-hero,
.outdoor-module-featured,
.outdoor-module-tip {
  position: relative;
  z-index: 1;
  animation: outdoorModuleRise 0.48s ease both;
}

.outdoor-module-featured {
  animation-delay: 0.08s;
}

.outdoor-module-tip {
  animation-delay: 0.14s;
}

.outdoor-module-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(210px, 340px);
  gap: clamp(14px, 2vw, 24px);
  align-items: center;
  min-height: clamp(200px, 19vw, 260px);
  border-radius: 26px;
  border: 0;
  background: transparent;
  background-image: none;
  padding: clamp(12px, 1.4vw, 16px);
  box-shadow: none;
  overflow: visible;
}

.outdoor-module-hero::before {
  content: none;
}

.outdoor-module-hero-copy {
  min-width: 0;
  position: relative;
  z-index: 1;
  display: grid;
  align-content: start;
  gap: 8px;
  max-width: 100%;
}

.outdoor-module-hero-collage {
  min-width: 0;
  min-height: clamp(188px, 18vw, 244px);
  position: relative;
}

.outdoor-module-hero-collage::before {
  content: '';
  position: absolute;
  inset: 16% 10% 8% 6%;
  border-radius: 24px;
  background: radial-gradient(circle at 32% 28%, rgba(180, 218, 244, 0.36) 0%, rgba(180, 218, 244, 0) 62%);
  filter: blur(10px);
  pointer-events: none;
}

.outdoor-module-polaroid {
  position: absolute;
  margin: 0;
  border-radius: 10px;
  border: 1px solid rgba(230, 244, 255, 0.94);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 16px 30px rgba(30, 73, 103, 0.2);
  padding: 9px 9px 14px;
}

.outdoor-module-polaroid img {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid rgba(201, 223, 240, 0.46);
}

.outdoor-module-polaroid-main {
  width: min(78%, 308px);
  aspect-ratio: 4 / 3;
  right: 18px;
  top: 8px;
  transform: rotate(-5deg);
}

.outdoor-module-polaroid-sub {
  width: min(40%, 150px);
  aspect-ratio: 1 / 1.08;
  right: 0;
  bottom: 0;
  transform: rotate(7deg);
}

.outdoor-module-kicker {
  margin: 0;
  color: #2b79bb;
  font-size: 0.82rem;
  letter-spacing: 0.1em;
  font-weight: 800;
}

.outdoor-module-title {
  margin: 0;
  color: #09223c;
  font-size: clamp(1.9rem, 3.8vw, 2.8rem);
  line-height: 1.04;
  letter-spacing: -0.02em;
}

.outdoor-module-desc {
  margin: 0;
  max-width: 100%;
  color: #3e607e;
  font-size: 1rem;
  line-height: 1.56;
}

.outdoor-module-point-list {
  margin: 2px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
}

.outdoor-module-point {
  border: 0;
  background: transparent;
  padding: 4px 12px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 6px;
  align-items: center;
}

.outdoor-module-point + .outdoor-module-point {
  border-left: 1px solid rgba(120, 166, 196, 0.24);
}

.outdoor-module-point-icon-wrap {
  width: 22px;
  height: 22px;
  border-radius: 0;
  background: transparent;
  border: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.outdoor-module-point-icon {
  width: 14px;
  height: 14px;
  color: #2f7fb8;
}

.outdoor-module-point-copy strong {
  display: block;
  color: #14344f;
  font-size: 0.9rem;
  line-height: 1.2;
}

.outdoor-module-point-copy p {
  margin: 4px 0 0;
  color: #587793;
  font-size: 0.8rem;
  line-height: 1.42;
}

.outdoor-module-featured {
  border-radius: 24px;
  border: 1px solid rgba(92, 145, 180, 0.22);
  background: rgba(255, 255, 255, 0.86);
  padding: clamp(14px, 1.9vw, 22px);
  display: grid;
  gap: 12px;
}

.outdoor-module-featured-head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
}

.outdoor-module-featured-title-wrap {
  min-width: 0;
}

.outdoor-module-featured-title {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #123451;
  font-size: 1.55rem;
}

.outdoor-module-featured-icon {
  width: 20px;
  height: 20px;
  color: #4c9856;
}

.outdoor-module-featured-subtitle {
  margin: 8px 0 0;
  color: #607f98;
  font-size: 0.95rem;
}

.outdoor-module-spot-scroll {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x proximity;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 4px;
  scrollbar-width: thin;
  scrollbar-color: rgba(86, 138, 173, 0.45) rgba(140, 180, 208, 0.14);
  overscroll-behavior-x: contain;
  scroll-behavior: smooth;
}

.outdoor-module-spot-scroll::-webkit-scrollbar {
  height: 8px;
}

.outdoor-module-spot-scroll::-webkit-scrollbar-track {
  border-radius: 999px;
  background: rgba(140, 180, 208, 0.14);
}

.outdoor-module-spot-scroll::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(86, 138, 173, 0.45);
}

.outdoor-module-spot-grid {
  display: flex;
  gap: 12px;
  width: max-content;
  min-width: 100%;
}

.outdoor-module-spot-card {
  flex: 0 0 calc((100% - 24px) / 3);
  scroll-snap-align: start;
  border-radius: 18px;
  border: 1px solid rgba(95, 148, 181, 0.24);
  background: #ffffff;
  overflow: hidden;
  box-shadow: 0 10px 22px rgba(36, 84, 120, 0.14);
  transition: transform 0.24s ease, box-shadow 0.24s ease;
}

.outdoor-module-spot-card:hover,
.outdoor-module-spot-card:focus-visible {
  transform: translateY(-3px);
  box-shadow: 0 16px 30px rgba(26, 68, 100, 0.2);
}

.outdoor-module-spot-media {
  position: relative;
  margin: 0;
  height: clamp(152px, 15vw, 186px);
  overflow: hidden;
}

.outdoor-module-spot-media::after {
  content: '';
  position: absolute;
  inset: auto 0 0;
  height: 55%;
  background: linear-gradient(180deg, transparent 0%, rgba(4, 21, 34, 0.3) 100%);
}

.outdoor-module-spot-media img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.outdoor-module-spot-card:hover .outdoor-module-spot-media img,
.outdoor-module-spot-card:focus-visible .outdoor-module-spot-media img {
  transform: scale(1.03);
}

.outdoor-module-spot-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  margin: 0;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border-radius: 999px;
  border: 1px solid rgba(131, 178, 118, 0.44);
  background: rgba(53, 98, 54, 0.8);
  padding: 5px 10px;
  color: #f0fff0;
  font-size: 0.84rem;
  font-weight: 700;
}

.outdoor-module-spot-badge-icon {
  width: 14px;
  height: 14px;
}

.outdoor-module-spot-body {
  padding: 12px;
  display: grid;
  gap: 8px;
}

.outdoor-module-spot-title-row {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #173c5d;
  font-size: 1.12rem;
  font-weight: 700;
}

.outdoor-module-spot-title-icon {
  width: 16px;
  height: 16px;
  color: #3c84bf;
}

.outdoor-module-spot-desc {
  margin: 0;
  color: #567591;
  font-size: 0.89rem;
  line-height: 1.58;
}

.outdoor-module-spot-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.outdoor-module-spot-time {
  color: #4e7ea7;
  font-size: 0.84rem;
  font-weight: 600;
}

.outdoor-module-spot-stars {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.outdoor-module-spot-star {
  width: 14px;
  height: 14px;
  color: rgba(105, 146, 174, 0.45);
}

.outdoor-module-spot-star.active {
  color: #2c7fc0;
  fill: #2c7fc0;
}

.outdoor-module-tip {
  margin: 0;
  border-radius: 16px;
  border: 0;
  background: transparent;
  padding: 12px 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #4d7190;
  font-size: 0.9rem;
  line-height: 1.5;
}

.outdoor-module-tip-icon {
  width: 16px;
  height: 16px;
  color: #3f9a4b;
  flex-shrink: 0;
}

.photo-module-shell {
  display: grid;
  gap: 14px;
}

.photo-module-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 360px);
  gap: clamp(14px, 2vw, 24px);
  align-items: center;
  min-height: clamp(200px, 19vw, 260px);
  border-radius: 26px;
  border: 0;
  background: transparent;
  box-shadow: none;
  padding: clamp(12px, 1.4vw, 16px);
  overflow: visible;
}

.photo-module-hero-main {
  min-width: 0;
  position: relative;
  z-index: 1;
  display: grid;
  align-content: start;
  gap: 8px;
  max-width: 100%;
}

.photo-module-kicker {
  margin: 0;
  color: #2b79bb;
  font-size: 0.82rem;
  letter-spacing: 0.1em;
  font-weight: 800;
}

.photo-module-title {
  margin: 0;
  color: #09223c;
  font-size: clamp(1.9rem, 3.8vw, 2.8rem);
  line-height: 1.04;
  letter-spacing: -0.02em;
}

.photo-module-desc {
  margin: 0;
  max-width: 100%;
  color: #3e607e;
  font-size: 1rem;
  line-height: 1.56;
}

.photo-module-total-card {
  margin: 4px 0 0;
  width: fit-content;
  max-width: 100%;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border-radius: 14px;
  border: 0;
  background: linear-gradient(135deg, rgba(240, 248, 255, 0.92) 0%, rgba(220, 236, 249, 0.84) 100%);
  padding: 8px 12px;
}

.photo-module-total-icon-wrap {
  width: 22px;
  height: 22px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #2f79b4;
}

.photo-module-total-icon {
  width: 15px;
  height: 15px;
}

.photo-module-total-copy {
  display: grid;
  gap: 2px;
}

.photo-module-total-title {
  color: #123958;
  font-size: 0.98rem;
  line-height: 1.1;
  font-weight: 800;
}

.photo-module-total-note {
  color: #6e8ca7;
  font-size: 0.84rem;
  line-height: 1.35;
  font-weight: 500;
}

.photo-module-hero-visual {
  min-width: 0;
  min-height: clamp(188px, 18vw, 244px);
  position: relative;
}

.photo-module-hero-visual::before {
  content: '';
  position: absolute;
  inset: 8% 6% 6%;
  border-radius: 24px;
  background:
    radial-gradient(circle at 25% 22%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 46%),
    linear-gradient(180deg, rgba(141, 208, 255, 0.48) 0%, rgba(221, 241, 255, 0.3) 100%);
  filter: blur(3px);
  pointer-events: none;
}

.photo-module-hero-card {
  position: absolute;
  margin: 0;
  border-radius: 12px;
  border: 1px solid rgba(230, 244, 255, 0.94);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 16px 30px rgba(30, 73, 103, 0.2);
  padding: 8px;
}

.photo-module-hero-card img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  border-radius: 8px;
}

.photo-module-hero-card-main {
  width: min(82%, 322px);
  aspect-ratio: 1 / 0.88;
  right: 18px;
  top: 4px;
  transform: rotate(-5deg);
}

.photo-module-hero-card-sub {
  width: min(46%, 168px);
  aspect-ratio: 1 / 1.08;
  right: 0;
  bottom: 0;
  transform: rotate(7deg);
}

.photo-module-section-head {
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.photo-module-section-head h2 {
  margin: 0;
  color: #123958;
  font-size: 1.52rem;
}

.photo-module-featured {
  border-radius: 24px;
  border: 1px solid rgba(92, 146, 181, 0.22);
  background: rgba(255, 255, 255, 0.86);
  padding: clamp(14px, 1.9vw, 22px);
  display: grid;
  gap: 12px;
}

.photo-module-featured-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
}

.photo-module-featured-arrow {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(114, 163, 193, 0.34);
  background: rgba(248, 253, 255, 0.88);
  color: #316d9d;
  font-size: 1.34rem;
  line-height: 1;
  cursor: pointer;
}

.photo-module-featured-link {
  position: relative;
  display: block;
  overflow: hidden;
  border-radius: 18px;
  min-height: 184px;
  height: clamp(196px, 25vw, 238px);
  border: 1px solid rgba(94, 145, 179, 0.26);
}

.photo-module-featured-image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.photo-module-featured-overlay {
  position: absolute;
  inset: auto 0 0;
  padding: 18px;
  background: linear-gradient(180deg, rgba(7, 24, 37, 0) 0%, rgba(6, 24, 38, 0.8) 100%);
  color: #ecf6ff;
  display: grid;
  gap: 6px;
}

.photo-module-featured-overlay h3 {
  margin: 0;
  font-size: 2rem;
  line-height: 1.06;
}

.photo-module-featured-overlay p {
  margin: 0;
  font-size: 0.94rem;
}

.photo-module-featured-meta {
  opacity: 0.92;
}

.photo-module-featured-dots {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.photo-module-featured-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  border: 0;
  background: rgba(113, 160, 190, 0.42);
  cursor: pointer;
}

.photo-module-featured-dot.is-active {
  width: 18px;
  background: #3e85be;
}

.photo-module-lower-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 322px);
  gap: 14px;
  align-items: stretch;
}

.photo-module-recent,
.photo-module-journal {
  border-radius: 24px;
  border: 1px solid rgba(92, 146, 181, 0.22);
  background: rgba(255, 255, 255, 0.86);
  padding: clamp(14px, 1.9vw, 20px);
  height: 100%;
}

.photo-module-recent {
  display: grid;
  gap: 12px;
}

.photo-module-recent-head {
  align-items: start;
  gap: 12px;
  flex-wrap: wrap;
}

.photo-module-recent-scroll {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x proximity;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 4px;
  scrollbar-width: thin;
  scrollbar-color: rgba(86, 138, 173, 0.45) rgba(140, 180, 208, 0.14);
  overscroll-behavior-x: contain;
  scroll-behavior: smooth;
}

.photo-module-recent-scroll::-webkit-scrollbar {
  height: 8px;
}

.photo-module-recent-scroll::-webkit-scrollbar-track {
  border-radius: 999px;
  background: rgba(140, 180, 208, 0.14);
}

.photo-module-recent-scroll::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(86, 138, 173, 0.45);
}

.photo-module-recent-grid {
  display: flex;
  gap: 10px;
  width: max-content;
  min-width: 100%;
}

.photo-module-recent-card {
  margin: 0;
  flex: 0 0 clamp(232px, 22vw, 272px);
  scroll-snap-align: start;
}

.photo-module-recent-link {
  display: block;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(98, 148, 181, 0.24);
  background: #ffffff;
  box-shadow: 0 8px 18px rgba(35, 80, 112, 0.12);
}

.photo-module-recent-image {
  width: 100%;
  height: clamp(118px, 13vw, 146px);
  object-fit: cover;
  display: block;
}

.photo-module-recent-copy {
  display: grid;
  gap: 6px;
  padding: 8px 9px 9px;
}

.photo-module-recent-badges {
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: #6d8ca7;
  font-size: 0.8rem;
}

.photo-module-recent-location {
  margin: 0;
  color: #2a4f6f;
  font-size: 0.9rem;
  font-weight: 700;
}

.photo-module-recent-desc {
  margin: 0;
  color: #527490;
  font-size: 0.82rem;
  line-height: 1.46;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.photo-module-recent-chips {
  margin: 0;
  display: inline-flex;
  flex-wrap: wrap;
  gap: 8px;
}

.photo-module-recent-chip {
  border-radius: 999px;
  border: 1px solid rgba(115, 162, 192, 0.28);
  padding: 4px 10px;
  color: #5f819f;
  font-size: 0.78rem;
  background: rgba(247, 251, 255, 0.88);
}

.photo-module-journal {
  display: grid;
  gap: 12px;
  align-content: start;
}

.photo-module-journal-head h2 {
  font-size: 1.26rem;
}

.photo-module-journal-more {
  border: 0;
  background: transparent;
  color: #5f819e;
  font-size: 0.82rem;
  cursor: pointer;
}

.photo-module-journal-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 12px;
}

.photo-module-journal-item {
  position: relative;
  margin: 0;
  padding: 0 0 10px 18px;
  border-left: 2px solid rgba(113, 160, 191, 0.28);
  display: grid;
  grid-template-columns: minmax(0, 1fr) 84px;
  gap: 10px;
  align-items: start;
}

.photo-module-journal-item::before {
  content: '';
  position: absolute;
  left: -6px;
  top: 4px;
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #448bc3;
  box-shadow: 0 0 0 4px rgba(68, 139, 195, 0.16);
}

.photo-module-journal-item:last-child {
  padding-bottom: 0;
}

.photo-module-journal-date,
.photo-module-journal-text {
  margin: 0;
}

.photo-module-journal-date {
  color: #3d6d91;
  font-size: 0.9rem;
  font-weight: 700;
}

.photo-module-journal-text {
  grid-column: 1 / 2;
  color: #587995;
  font-size: 0.82rem;
  line-height: 1.48;
}

.photo-module-journal-thumb {
  grid-column: 2 / 3;
  grid-row: 1 / span 2;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(102, 154, 187, 0.26);
  display: block;
}

.photo-module-journal-thumb img {
  width: 100%;
  height: 100%;
  min-height: 64px;
  max-height: 78px;
  object-fit: cover;
  display: block;
}

.photo-module-journal-cta {
  min-height: 42px;
  border-radius: 12px;
  border: 1px solid rgba(112, 160, 191, 0.28);
  background: rgba(233, 245, 253, 0.9);
  color: #2f77af;
  font-size: 0.88rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  margin-top: auto;
}

.photo-module-journal-cta-icon {
  width: 15px;
  height: 15px;
}

.photo-module-empty {
  margin: 0;
  color: #6f8ea8;
  font-size: 0.9rem;
}

@keyframes outdoorModuleRise {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1200px) {
  .detail-wrap {
    width: min(1040px, calc(100% - 36px));
  }

  .shows-carousel-card {
    flex-basis: clamp(168px, 20vw, 198px);
  }

  .music-module-merged-shell {
    grid-template-columns: 1fr;
  }

  .music-playlist-panel {
    position: static;
    height: auto;
    min-height: 0;
    max-height: none;
    overflow: visible;
  }

  .music-module-detail-panel {
    height: auto;
    min-height: 0;
    max-height: none;
    overflow: visible;
  }

  .music-module-detail-panel .music-detail-shell {
    height: auto;
    grid-template-rows: auto auto;
  }

  .music-module-detail-panel .music-detail-panel-body {
    overflow: visible;
    padding-right: 0;
  }

  .outdoor-module-point-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .outdoor-module-hero {
    grid-template-columns: minmax(0, 1fr) minmax(190px, 286px);
    min-height: clamp(188px, 22vw, 236px);
    padding: clamp(10px, 1.4vw, 14px);
  }

  .outdoor-module-hero-copy {
    max-width: 100%;
  }

  .outdoor-module-hero-collage {
    min-height: clamp(176px, 20vw, 220px);
  }

  .outdoor-module-spot-card {
    flex-basis: calc((100% - 12px) / 2);
  }

  .photo-module-lower-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .shows-carousel-track {
    gap: 8px;
    padding-inline: 44px;
  }

  .shows-carousel-card {
    flex-basis: clamp(156px, 36vw, 184px);
  }

  .shows-carousel-nav-btn {
    width: 34px;
    height: 34px;
  }

  .music-playlist-panel {
    --playlist-item-height: 60px;
    padding: 14px;
  }

  .music-playlist-toggle {
    display: inline-flex;
  }

  .music-playlist-panel-collapsed .music-playlist-current {
    margin-top: -2px;
  }

  .outdoor-module-hero-copy {
    max-width: 100%;
  }

  .outdoor-module-hero {
    grid-template-columns: 1fr;
    gap: 14px;
    min-height: 0;
  }

  .outdoor-module-hero-collage {
    min-height: 198px;
    width: min(322px, 92%);
    margin: 0 auto;
  }

  .outdoor-module-featured-head {
    flex-direction: column;
    align-items: stretch;
  }

  .photo-module-hero {
    grid-template-columns: 1fr;
    gap: 14px;
    min-height: 0;
  }

  .photo-module-hero-visual {
    min-height: 198px;
    width: min(322px, 92%);
    margin: 0 auto;
  }

  .photo-module-featured-link {
    height: 208px;
  }

  .photo-module-recent-card {
    flex-basis: clamp(216px, 54vw, 252px);
  }

  .photo-module-journal-item {
    grid-template-columns: minmax(0, 1fr) 78px;
  }
}

@media (max-width: 767px) {
  .detail-wrap {
    width: calc(100% - 24px);
  }

  .shows-module-card {
    width: calc(100% - 12px);
  }
}

@media (max-width: 640px) {
  .shows-carousel-shell {
    --shows-nav-edge-offset: 8px;
  }

  .shows-carousel-track {
    padding-inline: 40px;
    padding-bottom: 4px;
  }

  .shows-carousel-card {
    flex-basis: min(62vw, 172px);
  }

  .shows-carousel-nav-btn {
    width: 30px;
    height: 30px;
  }

  .music-playlist-panel {
    --playlist-item-height: 58px;
    --playlist-item-gap: 8px;
    padding: 12px;
  }

  .music-module-detail-panel {
    padding: 14px;
  }

  .outdoor-module-shell {
    padding: 12px;
  }

  .outdoor-module-title {
    font-size: clamp(1.68rem, 8.2vw, 2.2rem);
  }

  .outdoor-module-hero {
    min-height: 0;
    padding: 10px;
    gap: 12px;
  }

  .outdoor-module-hero-collage {
    min-height: 174px;
    width: min(268px, 94%);
  }

  .outdoor-module-polaroid-main {
    right: 12px;
  }

  .outdoor-module-polaroid-sub {
    width: min(44%, 142px);
    right: 0;
  }

  .outdoor-module-point-list {
    grid-template-columns: 1fr;
  }

  .outdoor-module-point {
    padding: 6px 0;
  }

  .outdoor-module-point + .outdoor-module-point {
    border-left: 0;
  }

  .outdoor-module-spot-card {
    flex-basis: 100%;
  }

  .outdoor-module-spot-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .photo-module-hero,
  .photo-module-featured,
  .photo-module-recent,
  .photo-module-journal {
    border-radius: 18px;
    padding: 12px;
  }

  .photo-module-title {
    font-size: clamp(1.76rem, 9.2vw, 2.2rem);
  }

  .photo-module-hero {
    min-height: 0;
    gap: 12px;
  }

  .photo-module-hero-visual {
    min-height: 174px;
    width: min(268px, 94%);
  }

  .photo-module-hero-card-main {
    right: 12px;
  }

  .photo-module-hero-card-sub {
    width: min(44%, 142px);
    right: 0;
  }

  .photo-module-featured-card {
    grid-template-columns: 1fr;
  }

  .photo-module-featured-arrow {
    display: none;
  }

  .photo-module-featured-link {
    min-height: 170px;
    height: 186px;
  }

  .photo-module-featured-overlay {
    padding: 12px;
  }

  .photo-module-featured-overlay h3 {
    font-size: 1.48rem;
  }

  .photo-module-journal-item {
    grid-template-columns: minmax(0, 1fr);
    padding-left: 14px;
  }

  .photo-module-journal-thumb {
    grid-column: 1 / 2;
    grid-row: auto;
    width: 94px;
  }

  .photo-module-recent-card {
    flex-basis: min(76vw, 240px);
  }

  .photo-module-recent-image {
    height: 112px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .shows-carousel-card,
  .shows-carousel-nav-btn,
  .photo-module-featured-link,
  .photo-module-featured-arrow,
  .photo-module-featured-dot,
  .photo-module-recent-link,
  .photo-module-journal-thumb,
  .outdoor-module-hero,
  .outdoor-module-featured,
  .outdoor-module-tip,
  .outdoor-module-spot-card,
  .outdoor-module-spot-media img {
    animation: none !important;
    transition: none !important;
  }

  .shows-carousel-card:hover,
  .shows-carousel-card:focus-visible,
  .outdoor-module-spot-card:hover,
  .outdoor-module-spot-card:focus-visible,
  .photo-module-recent-link:hover,
  .photo-module-recent-link:focus-visible {
    transform: none;
  }
}

:global(:root[data-theme='dark']) .shows-module-card {
  border-color: rgba(120, 176, 213, 0.22);
  background:
    linear-gradient(155deg, rgba(18, 43, 62, 0.48) 0%, rgba(16, 38, 55, 0.28) 100%);
  box-shadow:
    0 16px 34px rgba(5, 16, 24, 0.22),
    inset 0 1px 0 rgba(207, 234, 250, 0.1);
}

:global(:root[data-theme='dark']) .shows-carousel-card {
  border-color: rgba(120, 176, 213, 0.28);
  background: rgba(14, 33, 49, 0.9);
  box-shadow: 0 12px 24px rgba(5, 15, 24, 0.28);
}

:global(:root[data-theme='dark']) .shows-carousel-card:hover,
:global(:root[data-theme='dark']) .shows-carousel-card:focus-visible {
  border-color: rgba(132, 188, 224, 0.44);
  box-shadow: 0 14px 26px rgba(6, 18, 28, 0.34);
}

:global(:root[data-theme='dark']) .shows-carousel-title {
  color: #e3f2fc;
}

:global(:root[data-theme='dark']) .shows-carousel-rating {
  color: #9fc0d6;
}

:global(:root[data-theme='dark']) .shows-carousel-rating-scale {
  color: #89a9c0;
}

:global(:root[data-theme='dark']) .shows-carousel-genre-pill {
  border-color: rgba(120, 176, 213, 0.34);
  background: rgba(16, 35, 52, 0.88);
  color: #b5cfdf;
}

:global(:root[data-theme='dark']) .shows-carousel-reason-pill {
  border-color: rgba(120, 176, 213, 0.34);
  background: rgba(18, 41, 60, 0.9);
  color: #c4deef;
}

:global(:root[data-theme='dark']) .shows-carousel-track {
  scrollbar-color: rgba(132, 182, 219, 0.8) rgba(22, 47, 68, 0.76);
}

:global(:root[data-theme='dark']) .shows-carousel-track::-webkit-scrollbar-track {
  background: rgba(22, 47, 68, 0.76);
}

:global(:root[data-theme='dark']) .shows-carousel-track::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #8ec4ea 0%, #669fd1 100%);
}

:global(:root[data-theme='dark']) .shows-carousel-nav-btn {
  border-color: rgba(120, 176, 213, 0.34);
  background: rgba(16, 35, 52, 0.88);
  color: #c4deef;
}

:global(:root[data-theme='dark']) .shows-carousel-nav-btn:hover:not(:disabled),
:global(:root[data-theme='dark']) .shows-carousel-nav-btn:focus-visible:not(:disabled) {
  border-color: rgba(132, 188, 224, 0.46);
  background: rgba(19, 44, 64, 0.92);
  color: #e1f2ff;
}

:global(:root[data-theme='dark']) .music-playlist-count {
  border-color: rgba(120, 176, 213, 0.38);
  background: transparent;
  color: #c3ddef;
}

:global(:root[data-theme='dark']) .music-playlist-toggle {
  border-color: rgba(120, 176, 213, 0.34);
  background: transparent;
  color: #c3ddef;
}

:global(:root[data-theme='dark']) .music-module-detail-panel {
  border-color: rgba(126, 182, 219, 0.42);
}

:global(:root[data-theme='dark']) .music-playlist-current {
  color: #9fc0d6;
}

:global(:root[data-theme='dark']) .music-playlist-scroll {
  scrollbar-color: rgba(132, 182, 219, 0.8) rgba(22, 47, 68, 0.76);
}

:global(:root[data-theme='dark']) .music-playlist-scroll::-webkit-scrollbar-track {
  background: rgba(22, 47, 68, 0.76);
}

:global(:root[data-theme='dark']) .music-playlist-scroll::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #8ec4ea 0%, #669fd1 100%);
}

:global(:root[data-theme='dark']) .music-module-detail-panel .music-detail-panel-body {
  scrollbar-color: rgba(132, 182, 219, 0.78) rgba(22, 47, 68, 0.72);
}

:global(:root[data-theme='dark']) .music-module-detail-panel .music-detail-panel-body::-webkit-scrollbar-track {
  background: rgba(22, 47, 68, 0.72);
}

:global(:root[data-theme='dark']) .music-module-detail-panel .music-detail-panel-body::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #8ec4ea 0%, #669fd1 100%);
}

:global(:root[data-theme='dark']) .music-playlist-item {
  border-color: rgba(120, 176, 213, 0.28);
  background: transparent;
}

:global(:root[data-theme='dark']) .music-playlist-item:hover,
:global(:root[data-theme='dark']) .music-playlist-item:focus-visible {
  border-color: rgba(132, 188, 224, 0.42);
  box-shadow: 0 10px 18px rgba(6, 18, 28, 0.3);
}

:global(:root[data-theme='dark']) .music-playlist-item.is-active {
  border-color: rgba(132, 188, 224, 0.48);
  background: transparent;
}

:global(:root[data-theme='dark']) .music-playlist-copy strong {
  color: #e3f2fc;
}

:global(:root[data-theme='dark']) .music-playlist-copy span {
  color: #9fc0d6;
}

:global(:root[data-theme='dark']) .outdoor-module-shell {
  background: transparent;
  box-shadow: none;
}

:global(:root[data-theme='dark']) .outdoor-module-hero {
  border: 0;
  background: transparent;
  background-image: none;
  box-shadow: none;
}

:global(:root[data-theme='dark']) .outdoor-module-hero::before {
  content: none;
}

:global(:root[data-theme='dark']) .outdoor-module-hero-collage::before {
  background: radial-gradient(circle at 32% 28%, rgba(108, 166, 205, 0.3) 0%, rgba(108, 166, 205, 0) 64%);
}

:global(:root[data-theme='dark']) .outdoor-module-polaroid {
  border-color: rgba(126, 182, 219, 0.44);
  background: rgba(17, 38, 56, 0.9);
  box-shadow: 0 14px 26px rgba(6, 18, 28, 0.34);
}

:global(:root[data-theme='dark']) .outdoor-module-polaroid img {
  border-color: rgba(110, 166, 202, 0.5);
}

:global(:root[data-theme='dark']) .outdoor-module-title,
:global(:root[data-theme='dark']) .outdoor-module-featured-title,
:global(:root[data-theme='dark']) .outdoor-module-spot-title-row,
:global(:root[data-theme='dark']) .outdoor-module-point-copy strong {
  color: #e3f2fc;
}

:global(:root[data-theme='dark']) .outdoor-module-kicker,
:global(:root[data-theme='dark']) .outdoor-module-desc,
:global(:root[data-theme='dark']) .outdoor-module-featured-subtitle,
:global(:root[data-theme='dark']) .outdoor-module-spot-desc,
:global(:root[data-theme='dark']) .outdoor-module-spot-time,
:global(:root[data-theme='dark']) .outdoor-module-tip,
:global(:root[data-theme='dark']) .outdoor-module-point-copy p {
  color: #b5cfdf;
}

:global(:root[data-theme='dark']) .outdoor-module-point,
:global(:root[data-theme='dark']) .outdoor-module-featured,
:global(:root[data-theme='dark']) .outdoor-module-spot-card {
  border-color: rgba(120, 176, 213, 0.28);
  background: rgba(18, 40, 58, 0.82);
}

:global(:root[data-theme='dark']) .outdoor-module-tip {
  border: 0;
  background: transparent;
}

:global(:root[data-theme='dark']) .outdoor-module-point + .outdoor-module-point {
  border-left-color: rgba(128, 176, 208, 0.22);
}

:global(:root[data-theme='dark']) .outdoor-module-point-icon-wrap {
  border: 0;
  background: transparent;
}

:global(:root[data-theme='dark']) .outdoor-module-spot-scroll {
  scrollbar-color: rgba(132, 182, 219, 0.8) rgba(22, 47, 68, 0.76);
}

:global(:root[data-theme='dark']) .outdoor-module-spot-scroll::-webkit-scrollbar-track {
  background: rgba(22, 47, 68, 0.76);
}

:global(:root[data-theme='dark']) .outdoor-module-spot-scroll::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #8ec4ea 0%, #669fd1 100%);
}

:global(:root[data-theme='dark']) .outdoor-module-spot-title-icon,
:global(:root[data-theme='dark']) .outdoor-module-featured-icon {
  color: #81c48d;
}

:global(:root[data-theme='dark']) .outdoor-module-spot-star {
  color: rgba(151, 189, 215, 0.48);
}

:global(:root[data-theme='dark']) .outdoor-module-spot-star.active {
  color: #8ac39c;
  fill: #8ac39c;
}

:global(:root[data-theme='dark']) .outdoor-module-tip-icon,
:global(:root[data-theme='dark']) .outdoor-module-point-icon {
  color: #8bc798;
}

:global(:root[data-theme='dark']) .photo-module-featured,
:global(:root[data-theme='dark']) .photo-module-recent,
:global(:root[data-theme='dark']) .photo-module-journal,
:global(:root[data-theme='dark']) .photo-module-recent-link,
:global(:root[data-theme='dark']) .photo-module-journal-thumb,
:global(:root[data-theme='dark']) .photo-module-journal-cta {
  border-color: rgba(120, 176, 213, 0.28);
}

:global(:root[data-theme='dark']) .photo-module-featured,
:global(:root[data-theme='dark']) .photo-module-recent,
:global(:root[data-theme='dark']) .photo-module-journal {
  background: rgba(18, 40, 58, 0.82);
}

:global(:root[data-theme='dark']) .photo-module-recent-link {
  background: rgba(12, 32, 47, 0.76);
}

:global(:root[data-theme='dark']) .photo-module-recent-scroll {
  scrollbar-color: rgba(132, 182, 219, 0.8) rgba(22, 47, 68, 0.76);
}

:global(:root[data-theme='dark']) .photo-module-recent-scroll::-webkit-scrollbar-track {
  background: rgba(22, 47, 68, 0.76);
}

:global(:root[data-theme='dark']) .photo-module-recent-scroll::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #8ec4ea 0%, #669fd1 100%);
}

:global(:root[data-theme='dark']) .photo-module-title,
:global(:root[data-theme='dark']) .photo-module-section-head h2,
:global(:root[data-theme='dark']) .photo-module-recent-location,
:global(:root[data-theme='dark']) .photo-module-journal-date {
  color: #e3f2fc;
}

:global(:root[data-theme='dark']) .photo-module-kicker,
:global(:root[data-theme='dark']) .photo-module-desc,
:global(:root[data-theme='dark']) .photo-module-total-note,
:global(:root[data-theme='dark']) .photo-module-featured-overlay p,
:global(:root[data-theme='dark']) .photo-module-recent-badges,
:global(:root[data-theme='dark']) .photo-module-recent-desc,
:global(:root[data-theme='dark']) .photo-module-journal-text,
:global(:root[data-theme='dark']) .photo-module-empty {
  color: #b5cfdf;
}

:global(:root[data-theme='dark']) .photo-module-total-card {
  border: 0;
  background: linear-gradient(135deg, rgba(16, 35, 52, 0.88) 0%, rgba(25, 50, 70, 0.78) 100%);
}

:global(:root[data-theme='dark']) .photo-module-total-icon-wrap {
  color: #95caef;
}

:global(:root[data-theme='dark']) .photo-module-total-title {
  color: #d8ebf9;
}

:global(:root[data-theme='dark']) .photo-module-hero {
  border: 0;
  background: transparent;
  box-shadow: none;
}

:global(:root[data-theme='dark']) .photo-module-featured-arrow,
:global(:root[data-theme='dark']) .photo-module-recent-chip,
:global(:root[data-theme='dark']) .photo-module-journal-cta {
  border-color: rgba(120, 176, 213, 0.34);
  background: rgba(16, 35, 52, 0.88);
  color: #c4deef;
}

:global(:root[data-theme='dark']) .photo-module-hero-visual::before {
  background:
    radial-gradient(circle at 28% 24%, rgba(108, 166, 205, 0.3) 0%, rgba(108, 166, 205, 0) 62%),
    linear-gradient(180deg, rgba(23, 56, 83, 0.36) 0%, rgba(23, 56, 83, 0.1) 100%);
}

:global(:root[data-theme='dark']) .photo-module-hero-card {
  border-color: rgba(126, 182, 219, 0.44);
  background: rgba(17, 38, 56, 0.9);
  box-shadow: 0 14px 26px rgba(6, 18, 28, 0.34);
}

:global(:root[data-theme='dark']) .photo-module-journal-item {
  border-left-color: rgba(120, 176, 213, 0.32);
}
</style>
