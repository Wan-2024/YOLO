<script setup>
import { RouterLink } from 'vue-router'
import { siteContent } from '../data/siteContent'

const contactHints = [
  '项目合作优先邮件沟通，便于整理上下文。',
  '社媒适合快速联系与日常交流。',
  '消息会尽量在 24 小时内回复。'
]
</script>

<template>
  <section class="page-section section-reveal">
    <div class="page-container detail-wrap">
      <RouterLink to="/about" class="text-link back-link">&larr; 返回关于页</RouterLink>

      <div class="about-layout">
        <article class="glass-panel side-card">
          <div class="section-heading">
            <p class="eyebrow">About Contact</p>
            <h1 class="section-title">联系方式详情</h1>
            <p class="section-description">欢迎通过以下渠道联系，我会在看到消息后尽快回复。</p>
          </div>

          <ul class="contact-list">
            <li>
              <span class="contact-label">Email</span>
              <a :href="`mailto:${siteContent.profile.email}`" class="lift-click">{{ siteContent.profile.email }}</a>
            </li>
            <li v-for="item in siteContent.profile.socials" :key="item.name">
              <span class="contact-label">{{ item.name }}</span>
              <a :href="item.link" target="_blank" rel="noreferrer" class="lift-click">{{ item.value }}</a>
            </li>
          </ul>
        </article>

        <aside class="about-side">
          <section class="glass-panel side-card">
            <h2 class="sub-title">沟通建议</h2>
            <ul class="simple-list">
              <li v-for="hint in contactHints" :key="hint">{{ hint }}</li>
            </ul>
          </section>

          <section class="glass-panel side-card">
            <h2 class="sub-title">协作信息</h2>
            <ul class="simple-list">
              <li>
                <h3>合作类型</h3>
                <p>产品体验优化、前端实现、设计系统落地。</p>
              </li>
              <li>
                <h3>材料准备</h3>
                <p>建议附上目标、时间范围和已有素材，便于快速对齐。</p>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  </section>
</template>
