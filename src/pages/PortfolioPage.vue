<script setup>
import { computed } from 'vue'
import { ArrowUpRight } from 'lucide-vue-next'
import { RouterLink, useRouter } from 'vue-router'
import { siteContent } from '../data/siteContent'
import { getProjectThemeBySlug, portfolioProjects } from '../data/portfolioContent'

const themedProjects = computed(() =>
  portfolioProjects.map((project) => ({
    ...project,
    theme: getProjectThemeBySlug(project.slug)
  }))
)

const router = useRouter()

const goToProjectDetail = (slug) => {
  router.push(`/portfolio/${slug}`)
}
</script>

<template>
  <section class="page-section section-reveal">
    <div class="page-container">
      <div class="section-heading">
        <p class="eyebrow-accent">
          <span class="eyebrow-accent-dot" aria-hidden="true"></span>
          PORTFOLIO
        </p>
        <h1 class="section-title">{{ siteContent.portfolioSection.title }}</h1>
        <p class="section-description">{{ siteContent.portfolioSection.slogan }}</p>
      </div>

      <div class="portfolio-grid">
        <article
          v-for="project in themedProjects"
          :key="project.slug"
          class="portfolio-card glass-panel card-hover"
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
            <h2>{{ project.title }}</h2>
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
    </div>
  </section>
</template>
