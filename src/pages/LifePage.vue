<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRight, BookOpen, Camera, Clapperboard, MapPin, MessageCircle, Music2 } from 'lucide-vue-next'
import { siteContent } from '../data/siteContent'
import { getReadingShareBooks } from '../data/readingContentDetail'
import { getShowShareItems } from '../data/showShareDatabase'
import { getSnippetItems } from '../data/snippetsContent'

const LIFE_MODULE_PREVIEW_LIMIT = 4
const LIFE_PREVIEW_LIMIT = 3
const OUTDOOR_PREVIEW_LIMIT = 3
const PHOTO_PREVIEW_LIMIT = 3
const READING_EXCERPT_LIMIT = 30

const truncateText = (text, limit) => {
  const sourceText = (text || '').trim()
  const chars = Array.from(sourceText)

  if (chars.length <= limit) {
    return sourceText
  }

  return chars.slice(0, limit).join('') + '...'
}

const getReadingExcerpt = (book) => truncateText(book?.excerpt || book?.intro || book?.note || '', READING_EXCERPT_LIMIT)

const splitOutdoorTitle = (rawTitle = '') => {
  const match = rawTitle.match(/(.+?)\s+(\d+(?:\.\d+)?\s*km)$/i)
  if (!match) {
    return {
      title: rawTitle,
      distance: ''
    }
  }

  return {
    title: match[1].trim(),
    distance: match[2].trim()
  }
}

const formatOutdoorDate = (rawDate = '') => {
  const sourceDate = (rawDate || '').trim()
  if (!sourceDate) {
    return ''
  }

  const normalizedDate = sourceDate.replace(/[./]/g, '-')
  const match = normalizedDate.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (!match) {
    return sourceDate
  }

  const [, year, month, day] = match
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

const lifePreview = computed(() => ({
  reading: getReadingShareBooks(),
  shows: getShowShareItems().slice(0, LIFE_MODULE_PREVIEW_LIMIT),
  music: siteContent.life.music.slice(0, LIFE_MODULE_PREVIEW_LIMIT),
  outdoors: siteContent.life.outdoors.slice(0, OUTDOOR_PREVIEW_LIMIT),
  photography: siteContent.life.photography.slice(0, PHOTO_PREVIEW_LIMIT),
  snippets: getSnippetItems().slice(0, LIFE_PREVIEW_LIMIT)
}))

const outdoorPreview = computed(() =>
  lifePreview.value.outdoors.map((item) => {
    const parsedTitle = splitOutdoorTitle(item?.title || '')

    return {
      ...item,
      plainTitle: parsedTitle.title,
      distance: parsedTitle.distance,
      date: formatOutdoorDate(item?.date || '')
    }
  })
)

const readingScrollRef = ref(null)

const handleReadingWheel = (event) => {
  const container = readingScrollRef.value
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

</script>

<template>
  <section class="page-section section-reveal life-hall-page">
    <div class="page-container life-hall-container">
      <header class="life-hall-hero">
        <div class="life-hall-hero-content">
          <p class="eyebrow-accent life-hall-eyebrow">
            <span class="eyebrow-accent-dot" aria-hidden="true"></span>
            LIFE
          </p>
          <h1 class="section-title life-hall-title-main">生活馆</h1>
          <p class="section-description life-hall-description">把喜欢的事慢慢收集，记录生活里的点滴美好与片刻热爱。</p>
        </div>
      </header>

      <section id="reading-share" class="life-hall-card life-reading-panel">
        <div class="life-hall-card-head">
          <h2 class="life-hall-title">
            <BookOpen class="life-hall-title-icon" aria-hidden="true" />
            &#35835;&#20070;&#20998;&#20139;
          </h2>
        </div>

        <div
          ref="readingScrollRef"
          class="life-reading-scroll"
          aria-label="&#35835;&#20070;&#20998;&#20139;&#21015;&#34920;&#65292;&#21487;&#24038;&#21491;&#28369;&#21160;"
          @wheel="handleReadingWheel"
        >
          <div class="life-reading-track">
            <RouterLink
              v-for="book in lifePreview.reading"
              :key="book.slug"
              :to="`/life/reading/${book.slug}`"
              class="life-reading-item card-link-reset lift-click"
              :aria-label="`\u67E5\u770B\u300A${book.title}\u300B\u8BE6\u60C5`"
            >
              <img :src="book.cover" :alt="book.title" class="life-reading-cover" />
              <div class="life-reading-copy">
                <h3>{{ book.title }}</h3>
                <p class="life-reading-author">{{ book.author }}</p>
                <p class="life-reading-excerpt">{{ getReadingExcerpt(book) }}</p>
                <p class="life-reading-status">
                  <span class="life-reading-status-dot" aria-hidden="true"></span>
                  {{ book.status || '\u9605\u8BFB\u4E2D' }}
                </p>
              </div>
            </RouterLink>
          </div>
        </div>

        <p class="life-reading-tip">&#24038;&#21491;&#28369;&#21160;&#26597;&#30475;&#26356;&#22810;&#65292;&#28857;&#20987;&#20070;&#31821;&#26597;&#30475;&#35814;&#24773;&#12290;</p>
      </section>

      <section class="life-hall-grid life-hall-grid-three">
        <article class="life-hall-card life-module-panel">
          <div class="life-hall-card-head">
            <h2 class="life-hall-title">
              <Clapperboard class="life-hall-title-icon" aria-hidden="true" />
              好剧分享
            </h2>
            <RouterLink to="/life/shows" class="life-view-all card-link-reset" aria-label="查看好剧分享模块详情">
              查看全部
              <span class="life-view-all-arrow" aria-hidden="true">
                <ArrowRight class="life-view-all-arrow-icon" />
              </span>
            </RouterLink>
          </div>

          <ul class="life-media-list life-media-vertical-list">
            <li v-for="show in lifePreview.shows" :key="show.slug">
              <RouterLink
                :to="`/life/shows/${show.slug}`"
                class="life-media-vertical-item card-link-reset lift-click"
                :aria-label="`查看《${show.title}》详情`"
              >
                <span class="life-media-vertical-rail" aria-hidden="true">
                  <span class="life-media-vertical-marker"></span>
                </span>
                <div class="life-media-vertical-main">
                  <p class="life-media-vertical-title">{{ show.title }}</p>
                  <p class="life-media-vertical-desc">{{ show.reason }}</p>
                </div>
                <img :src="show.posterUrl" :alt="show.title" class="life-media-vertical-cover" />
              </RouterLink>
            </li>
          </ul>
        </article>

        <article class="life-hall-card life-module-panel">
          <div class="life-hall-card-head">
            <h2 class="life-hall-title">
              <Music2 class="life-hall-title-icon" aria-hidden="true" />
              音乐分享
            </h2>
            <RouterLink to="/life/music" class="life-view-all card-link-reset" aria-label="查看音乐分享模块详情">
              查看全部
              <span class="life-view-all-arrow" aria-hidden="true">
                <ArrowRight class="life-view-all-arrow-icon" />
              </span>
            </RouterLink>
          </div>

          <ul class="life-media-list life-media-vertical-list">
            <li v-for="track in lifePreview.music" :key="track.slug">
              <RouterLink
                :to="{ path: '/life/music', query: { track: track.slug } }"
                class="life-media-vertical-item card-link-reset lift-click"
                :aria-label="`查看《${track.title}》详情`"
              >
                <span class="life-media-vertical-rail" aria-hidden="true">
                  <span class="life-media-vertical-marker"></span>
                </span>
                <div class="life-media-vertical-main">
                  <p class="life-media-vertical-title">{{ track.title }}</p>
                  <p class="life-media-vertical-desc">{{ track.artist }}</p>
                </div>
                <img :src="track.coverUrl" :alt="track.title" class="life-media-vertical-cover" />
              </RouterLink>
            </li>
          </ul>
        </article>

        <article class="life-hall-card life-module-panel">
          <div class="life-hall-card-head">
            <h2 class="life-hall-title">
              <MessageCircle class="life-hall-title-icon" aria-hidden="true" />
              {{ siteContent.sections.snippets.title }}
            </h2>
            <RouterLink to="/life/snippets" class="life-view-all card-link-reset" aria-label="查看碎碎念模块详情">
              查看全部
              <span class="life-view-all-arrow" aria-hidden="true">
                <ArrowRight class="life-view-all-arrow-icon" />
              </span>
            </RouterLink>
          </div>

          <ul class="life-snippet-list">
            <li v-for="snippet in lifePreview.snippets" :key="snippet.slug">
              <article class="life-snippet-item">
                <p class="life-snippet-date">{{ snippet.date }}</p>
                <p class="life-snippet-text">“{{ snippet.text }}”</p>
              </article>
            </li>
          </ul>
        </article>
      </section>

      <section class="life-hall-grid life-hall-grid-two">
        <article class="life-hall-card life-module-panel">
          <div class="life-hall-card-head">
            <h2 class="life-hall-title">
              <MapPin class="life-hall-title-icon" aria-hidden="true" />
              户外记录
            </h2>
            <RouterLink to="/life/outdoors" class="life-view-all card-link-reset" aria-label="查看户外记录模块详情">
              查看全部
              <span class="life-view-all-arrow" aria-hidden="true">
                <ArrowRight class="life-view-all-arrow-icon" />
              </span>
            </RouterLink>
          </div>

          <ul class="life-outdoor-list">
            <li v-for="item in outdoorPreview" :key="item.slug">
              <RouterLink
                :to="`/life/outdoors/${item.slug}`"
                class="life-outdoor-item card-link-reset lift-click"
                :aria-label="`查看${item.plainTitle}详情`"
              >
                <div class="life-outdoor-main">
                  <p class="life-outdoor-title-row">
                    <span class="life-outdoor-marker" aria-hidden="true"></span>
                    <span class="life-outdoor-title">{{ item.plainTitle }}</span>
                    <span v-if="item.distance" class="life-outdoor-distance">{{ item.distance }}</span>
                  </p>
                  <p class="life-outdoor-desc">{{ item.text }}</p>
                </div>
                <p v-if="item.date" class="life-outdoor-date">{{ item.date }}</p>
              </RouterLink>
            </li>
          </ul>
        </article>

        <article class="life-hall-card life-module-panel">
          <div class="life-hall-card-head">
            <h2 class="life-hall-title">
              <Camera class="life-hall-title-icon" aria-hidden="true" />
              摄影
            </h2>
            <RouterLink
              to="/life/photography"
              class="life-view-all card-link-reset"
              aria-label="查看摄影模块详情"
            >
              查看全部
              <span class="life-view-all-arrow" aria-hidden="true">
                <ArrowRight class="life-view-all-arrow-icon" />
              </span>
            </RouterLink>
          </div>

          <div class="life-photo-grid">
            <figure v-for="photo in lifePreview.photography" :key="photo.slug" class="life-photo-card">
              <RouterLink
                :to="`/life/photography/${photo.slug}`"
                class="life-photo-link card-link-reset lift-click"
                :aria-label="`查看摄影作品《${photo.title}》详情`"
              >
                <img :src="photo.image" :alt="photo.title" class="life-photo-image" />
                <figcaption>{{ photo.title }}</figcaption>
              </RouterLink>
            </figure>
          </div>
        </article>
      </section>

      <section class="life-bottom-quote">
        <p class="life-bottom-quote-text">生活不是等待风暴过去，而是学会在雨中跳舞。</p>
        <span>— Viva la vida</span>
      </section>
    </div>
  </section>
</template>

<style scoped>
.life-hall-page {
  padding-top: 24px;
}

.life-hall-container {
  display: grid;
  gap: 16px;
  min-width: 0;
}

.life-hall-hero {
  position: relative;
  overflow: visible;
  min-height: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  padding: 8px 0 14px;
}

.life-hall-hero-content {
  position: relative;
  z-index: 1;
  max-width: 620px;
}

.life-hall-eyebrow {
  margin-bottom: 10px;
}

.life-hall-title-main {
  margin: 0;
}

.life-hall-description {
  margin-top: 12px;
  color: #335878;
  font-size: 1rem;
  line-height: 1.72;
}

.life-hall-card {
  border-radius: 24px;
  border: 1px solid rgba(113, 159, 191, 0.22);
  background: linear-gradient(158deg, rgba(255, 255, 255, 0.9) 0%, rgba(245, 251, 255, 0.8) 100%);
  box-shadow:
    0 16px 32px rgba(45, 84, 112, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
  padding: clamp(18px, 2.6vw, 28px);
  min-width: 0;
}

.life-reading-panel {
  min-width: 0;
  overflow: hidden;
}

.life-hall-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.life-hall-title {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #163958;
  font-size: clamp(1.12rem, 1.3vw, 1.34rem);
  font-weight: 700;
}

.life-hall-title-icon {
  width: 20px;
  height: 20px;
  color: #4c93d3;
}

.life-view-all {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #517496;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.life-view-all:hover {
  color: #357cb8;
}

.life-view-all-arrow {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: 1px solid rgba(106, 150, 185, 0.28);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.82);
}

.life-view-all-arrow-icon {
  width: 15px;
  height: 15px;
}

.life-reading-scroll {
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

.life-reading-scroll::-webkit-scrollbar {
  height: 8px;
}

.life-reading-scroll::-webkit-scrollbar-track {
  border-radius: 999px;
  background: rgba(140, 180, 208, 0.14);
}

.life-reading-scroll::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(86, 138, 173, 0.45);
}

.life-reading-track {
  display: flex;
  gap: 12px;
  width: max-content;
  min-width: 100%;
}

.life-reading-item {
  flex: 0 0 clamp(250px, 30vw, 350px);
  scroll-snap-align: start;
  display: grid;
  grid-template-columns: 138px minmax(0, 1fr);
  gap: 0;
  align-items: stretch;
  border-radius: 18px;
  border: 1px solid rgba(114, 157, 189, 0.22);
  background: rgba(255, 255, 255, 0.72);
  padding: 0;
  overflow: hidden;
  min-height: 212px;
}

.life-reading-cover {
  width: 100%;
  height: 100%;
  min-height: 212px;
  border-radius: 18px;
  aspect-ratio: auto;
  object-fit: cover;
  object-position: center;
  box-shadow: 0 8px 16px rgba(40, 88, 125, 0.18);
}

.life-reading-copy {
  min-width: 0;
  padding: 14px 16px 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.life-reading-copy h3 {
  margin: 0;
  color: #1c3c5b;
  font-size: 1.02rem;
}

.life-reading-author {
  margin: 5px 0 0;
  color: #527390;
  font-size: 0.95rem;
}

.life-reading-excerpt {
  margin: 10px 0 0;
  max-width: 10em;
  color: #44647f;
  font-size: 0.9rem;
  line-height: 1.68;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.life-reading-status {
  margin: 0;
  margin-top: auto;
  padding-top: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #5d81a4;
  font-size: 0.86rem;
  font-weight: 600;
}

.life-reading-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #5ca4e4;
  box-shadow: 0 0 0 4px rgba(92, 164, 228, 0.18);
}

.life-reading-tip {
  margin: 10px 2px 0;
  color: #5a7d9d;
  font-size: 0.85rem;
  line-height: 1.5;
}

.life-hall-grid {
  display: grid;
  gap: 14px;
}

.life-hall-grid-three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.life-hall-grid-two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.life-module-panel {
  min-height: 100%;
}

.life-media-list,
.life-outdoor-list,
.life-snippet-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 10px;
}

.life-media-vertical-list {
  gap: 0;
}

.life-media-vertical-item {
  display: grid;
  grid-template-columns: 10px minmax(0, 1fr) 52px;
  align-items: center;
  gap: 12px;
  padding: 8px 0 10px;
  border-bottom: 1px solid rgba(109, 152, 183, 0.2);
}

.life-media-vertical-list li:last-child .life-media-vertical-item {
  border-bottom: 0;
  padding-bottom: 0;
}

.life-media-vertical-rail {
  grid-column: 1;
  align-self: stretch;
  display: inline-flex;
  justify-content: center;
  align-items: stretch;
}

.life-media-vertical-cover {
  grid-column: 3;
  justify-self: end;
  width: 52px;
  height: 52px;
  border-radius: 10px;
  object-fit: cover;
  border: 1px solid rgba(115, 157, 188, 0.24);
  box-shadow: 0 6px 14px rgba(38, 82, 114, 0.14);
}

.life-media-vertical-main {
  grid-column: 2;
  min-width: 0;
  display: grid;
  gap: 4px;
}

.life-media-vertical-marker {
  width: 3px;
  height: 100%;
  min-height: 34px;
  border-radius: 999px;
  background: #6aa7dc;
  box-shadow: 0 0 0 2px rgba(106, 167, 220, 0.18);
  flex: 0 0 auto;
}

.life-media-vertical-title {
  margin: 0;
  color: #173858;
  font-size: 0.94rem;
  font-weight: 700;
  line-height: 1.36;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

.life-media-vertical-desc {
  margin: 0;
  color: #567795;
  font-size: 0.84rem;
  line-height: 1.46;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

.life-snippet-list {
  position: relative;
  padding-left: 2px;
}

.life-snippet-item {
  position: relative;
  display: block;
  padding: 0 0 14px 22px;
}

.life-snippet-item::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 22px;
  bottom: -3px;
  width: 2px;
  background: rgba(92, 156, 210, 0.24);
}

.life-snippet-item::after {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #6eade2;
  box-shadow: 0 0 0 4px rgba(110, 173, 226, 0.16);
}

.life-snippet-list li:last-child .life-snippet-item {
  padding-bottom: 0;
}

.life-snippet-list li:last-child .life-snippet-item::before {
  display: none;
}

.life-snippet-date {
  margin: 0;
  color: #6484a2;
  font-size: 0.84rem;
  font-weight: 600;
}

.life-snippet-text {
  margin: 6px 0 0;
  color: #456782;
  font-size: 0.9rem;
  line-height: 1.6;
}

.life-outdoor-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  align-items: start;
  padding: 4px 0 8px;
}

.life-outdoor-main {
  min-width: 0;
}

.life-outdoor-title-row {
  margin: 0;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.life-outdoor-marker {
  width: 3px;
  height: 18px;
  border-radius: 999px;
  background: #6aa7dc;
  box-shadow: 0 0 0 2px rgba(106, 167, 220, 0.18);
  flex: 0 0 auto;
}

.life-outdoor-title {
  color: #173858;
  font-size: 0.95rem;
  font-weight: 700;
}

.life-outdoor-desc {
  margin: 4px 0 0;
  color: #547694;
  font-size: 0.84rem;
  line-height: 1.48;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

.life-outdoor-distance {
  margin: 0;
  color: #315f85;
  font-size: 0.92rem;
  font-weight: 700;
  white-space: nowrap;
}

.life-outdoor-date {
  margin: 0;
  align-self: start;
  padding-top: 1px;
  color: #8b9daf;
  font-size: 0.83rem;
  font-weight: 400;
  white-space: nowrap;
}

.life-photo-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.life-photo-card {
  margin: 0;
}

.life-photo-link {
  display: block;
}

.life-photo-image {
  width: 100%;
  height: 140px;
  border-radius: 12px;
  object-fit: cover;
  border: 1px solid rgba(109, 152, 183, 0.24);
  box-shadow: 0 8px 16px rgba(40, 88, 125, 0.14);
}

.life-photo-card figcaption {
  margin-top: 6px;
  color: #547694;
  text-align: center;
  font-size: 0.82rem;
}

.life-bottom-quote {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 2px;
}

.life-bottom-quote-text {
  margin: 0;
  color: #3f6586;
  font-size: 1.06rem;
  font-family: var(--font-serif);
  line-height: 1.62;
}

.life-bottom-quote-text::before,
.life-bottom-quote-text::after {
  color: #4c93d3;
  font-size: clamp(1.32rem, 1.9vw, 1.78rem);
  line-height: 1;
  font-weight: 700;
  font-family: var(--font-serif);
}

.life-bottom-quote-text::before {
  content: '“';
  margin-right: 0.16em;
}

.life-bottom-quote-text::after {
  content: '”';
  margin-left: 0.14em;
}

.life-bottom-quote span {
  color: #6687a5;
  font-size: 0.92rem;
  white-space: nowrap;
}

@media (max-width: 1200px) {
  .life-reading-item {
    flex-basis: clamp(242px, 40vw, 328px);
    grid-template-columns: 118px minmax(0, 1fr);
    min-height: 194px;
  }

  .life-reading-cover {
    min-height: 194px;
  }

}

@media (max-width: 1024px) {
  .life-hall-grid-three {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .life-hall-grid-three > :last-child {
    grid-column: 1 / -1;
  }

  .life-reading-item {
    flex-basis: min(64vw, 318px);
  }

}

@media (max-width: 820px) {
  .life-hall-page {
    padding-top: 6px;
  }

  .life-hall-hero {
    min-height: 0;
    padding: 6px 0 10px;
    border-radius: 0;
  }

  .life-hall-card {
    border-radius: 18px;
    padding: 16px;
  }

  .life-hall-grid-three,
  .life-hall-grid-two {
    grid-template-columns: 1fr;
  }

  .life-hall-grid-three > :last-child {
    grid-column: auto;
  }

  .life-photo-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .life-bottom-quote {
    flex-direction: column;
    align-items: flex-start;
  }

  .life-bottom-quote-text::before,
  .life-bottom-quote-text::after {
    font-size: 1.46rem;
  }
}

@media (max-width: 560px) {
  .life-hall-title {
    font-size: 1rem;
  }

  .life-view-all {
    font-size: 12px;
    gap: 6px;
  }

  .life-view-all-arrow {
    width: 24px;
    height: 24px;
  }

  .life-reading-item {
    flex-basis: min(78vw, 276px);
    grid-template-columns: 1fr;
    min-height: auto;
    padding: 12px;
    gap: 12px;
  }

  .life-reading-cover {
    width: min(140px, 100%);
    min-height: 0;
    height: auto;
    aspect-ratio: 4 / 5;
    border-radius: 12px;
    justify-self: start;
  }

  .life-reading-copy {
    padding: 0;
  }

  .life-reading-excerpt {
    -webkit-line-clamp: 3;
  }

  .life-reading-scroll::-webkit-scrollbar {
    height: 7px;
  }

  .life-media-vertical-item {
    grid-template-columns: 9px minmax(0, 1fr) 46px;
    gap: 10px;
  }

  .life-media-vertical-cover {
    width: 46px;
    height: 46px;
  }

  .life-media-vertical-marker {
    min-height: 30px;
  }

  .life-photo-grid {
    grid-template-columns: 1fr;
  }

  .life-photo-image {
    height: 168px;
  }

  .life-bottom-quote-text::before {
    margin-right: 0.12em;
  }

  .life-bottom-quote-text::after {
    margin-left: 0.1em;
  }

  .life-bottom-quote-text::before,
  .life-bottom-quote-text::after {
    font-size: 1.34rem;
  }

}

:root[data-theme='dark'] .life-hall-card {
  border-color: rgba(118, 172, 210, 0.3);
  background: linear-gradient(158deg, rgba(19, 42, 60, 0.88) 0%, rgba(17, 37, 54, 0.82) 100%);
}

:root[data-theme='dark'] .life-reading-item {
  border-color: rgba(118, 172, 210, 0.26);
  background: rgba(18, 41, 58, 0.8);
}

:root[data-theme='dark'] .life-media-vertical-item {
  border-bottom-color: rgba(118, 172, 210, 0.26);
}

:root[data-theme='dark'] .life-hall-description,
:root[data-theme='dark'] .life-reading-excerpt,
:root[data-theme='dark'] .life-media-vertical-desc,
:root[data-theme='dark'] .life-snippet-text,
:root[data-theme='dark'] .life-outdoor-desc,
:root[data-theme='dark'] .life-bottom-quote-text {
  color: #b5cddd;
}

:root[data-theme='dark'] .life-hall-title,
:root[data-theme='dark'] .life-reading-copy h3,
:root[data-theme='dark'] .life-media-vertical-title,
:root[data-theme='dark'] .life-outdoor-title {
  color: #e2f1fb;
}

:root[data-theme='dark'] .life-view-all,
:root[data-theme='dark'] .life-reading-author,
:root[data-theme='dark'] .life-reading-status,
:root[data-theme='dark'] .life-snippet-date,
:root[data-theme='dark'] .life-outdoor-distance,
:root[data-theme='dark'] .life-photo-card figcaption,
:root[data-theme='dark'] .life-bottom-quote span {
  color: #9fbcd0;
}

:root[data-theme='dark'] .life-outdoor-date {
  color: #89a0b4;
  font-weight: 400;
}

:root[data-theme='dark'] .life-outdoor-marker {
  background: #79b6e9;
  box-shadow: 0 0 0 2px rgba(121, 182, 233, 0.22);
}

:root[data-theme='dark'] .life-media-vertical-marker {
  background: #79b6e9;
  box-shadow: 0 0 0 2px rgba(121, 182, 233, 0.22);
}

:root[data-theme='dark'] .life-bottom-quote-text::before,
:root[data-theme='dark'] .life-bottom-quote-text::after {
  color: #89c3ef;
}

:root[data-theme='dark'] .life-view-all-arrow {
  border-color: rgba(121, 178, 216, 0.36);
  background: rgba(20, 43, 61, 0.92);
}

:root[data-theme='dark'] .life-snippet-item::before {
  background: rgba(121, 178, 216, 0.3);
}

:root[data-theme='dark'] .life-snippet-item::after {
  background: #7fb7e6;
}

:root[data-theme='dark'] .life-reading-tip {
  color: #9fbcd0;
}

:root[data-theme='dark'] .life-reading-scroll {
  scrollbar-color: rgba(121, 178, 216, 0.58) rgba(65, 96, 121, 0.34);
}

:root[data-theme='dark'] .life-reading-scroll::-webkit-scrollbar-track {
  background: rgba(65, 96, 121, 0.34);
}

:root[data-theme='dark'] .life-reading-scroll::-webkit-scrollbar-thumb {
  background: rgba(121, 178, 216, 0.58);
}
</style>


