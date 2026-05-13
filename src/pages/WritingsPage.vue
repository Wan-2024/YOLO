<script setup>
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { siteContent } from '../data/siteContent'
import { writingCategories, writings } from '../data/writingsContent'

const activeCategory = ref('全部')
const router = useRouter()

const goToWriting = (slug) => {
  router.push(`/writings/${slug}`)
}

const filteredWritings = computed(() => {
  if (activeCategory.value === '全部') {
    return writings
  }

  return writings.filter((item) => item.category === activeCategory.value)
})
</script>

<template>
  <section class="page-section section-reveal writings-page">
    <div class="page-container">
      <div class="section-heading">
        <p class="eyebrow-accent">
          <span class="eyebrow-accent-dot" aria-hidden="true"></span>
          {{ siteContent.sections.writings.eyebrow }}
        </p>
        <h1 class="section-title">{{ siteContent.sections.writings.title }}</h1>
        <p class="section-description">{{ siteContent.sections.writings.description }}</p>
      </div>

      <div class="category-row glass-panel">
        <button
          v-for="category in writingCategories"
          :key="category"
          type="button"
          class="category-btn"
          :class="{ active: activeCategory === category }"
          @click="activeCategory = category"
        >
          {{ category }}
        </button>
      </div>

      <div class="writing-list">
        <article
          v-for="writing in filteredWritings"
          :key="writing.slug"
          class="writing-card glass-panel card-hover writing-card-clickable"
          role="link"
          tabindex="0"
          :aria-label="`阅读全文：${writing.title}`"
          @click="goToWriting(writing.slug)"
          @keydown.enter.prevent="goToWriting(writing.slug)"
          @keydown.space.prevent="goToWriting(writing.slug)"
        >
          <div class="writing-meta">
            <span>{{ writing.date }}</span>
            <span class="chip chip-solid">{{ writing.category }}</span>
          </div>
          <h2>{{ writing.title }}</h2>
          <p>{{ writing.excerpt }}</p>
          <RouterLink :to="`/writings/${writing.slug}`" class="text-link" @click.stop>阅读全文 →</RouterLink>
        </article>
      </div>
    </div>
  </section>
</template>
