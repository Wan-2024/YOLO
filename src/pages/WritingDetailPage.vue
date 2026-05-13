<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getWritingBySlug } from '../data/writingsContent'

const route = useRoute()

const writing = computed(() => getWritingBySlug(route.params.slug))
</script>

<template>
  <section class="page-section section-reveal compact-detail-scale writing-detail-page">
    <div class="page-container detail-wrap">
      <template v-if="writing">
        <RouterLink to="/writings" class="text-link back-link">← 返回文章列表</RouterLink>

        <article class="article-shell glass-panel">
          <header class="article-header">
            <p class="eyebrow">{{ writing.category }}</p>
            <h1 class="article-title">{{ writing.title }}</h1>
            <p class="article-date">{{ writing.date }}</p>
          </header>

          <div class="article-content">
            <p v-for="paragraph in writing.content" :key="paragraph">{{ paragraph }}</p>
          </div>
        </article>
      </template>

      <template v-else>
        <article class="glass-panel not-found-card">
          <h1 class="section-title">文章不存在</h1>
          <p>你访问的文章可能已删除或链接过期。</p>
          <RouterLink to="/writings" class="btn btn-primary">回到 Writings</RouterLink>
        </article>
      </template>
    </div>
  </section>
</template>
