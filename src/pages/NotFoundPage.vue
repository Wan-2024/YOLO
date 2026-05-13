<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="page-section section-reveal">
    <div class="page-container">
      <article class="glass-panel not-found-card">
        <p class="eyebrow">404</p>
        <h1 class="section-title">页面未找到</h1>
        <p>你访问的页面不存在，可能是链接变更或输入错误。</p>
        <RouterLink to="/" class="btn btn-primary">返回首页</RouterLink>
      </article>
    </div>
  </section>
</template>
