<script setup>
import { BookOpen, Code2, Coffee, FolderOpen, Heart, Leaf, PenLine, Star, UserRound } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

const careerCards = [
  {
    key: 'frontend',
    title: '代码开发',
    icon: Code2,
    tags: ['Vue 3', 'JavaScript', 'Node.js', 'Java', 'HTML / CSS', 'Vite', '小程序开发', '响应式布局','Python','C/C++','SQL','Linux'],
    heat: 80
  },
  {
    key: 'product',
    title: '产品能力',
    icon: UserRound,
    tags: ['用户研究', '信息架构', '产品思维', '需求拆解', 'A/B Testing', '数据分析', '原型设计','prd'],
    heat: 80
  },
  {
    key: 'design',
    title: '生产工具',
    icon: PenLine,
    tags: ['codex', 'chatgpt', 'VS','cursor','figma','PS','WPS','Notion','AI','HBuilder',],
    heat: 85
  },
]

const developmentPrinciples = [
  {
    key: 'motion',
    title: '轻量级开发',
    description: '保持代码简洁，避免复杂性',
    icon: Coffee
  },  
  {
    key: 'detail',
    title: '细节驱动',
    description: '像素级关注，追求兼容体验',
    icon: Star
  }, 
  {
    key: 'language',
    title: '统一视觉语言',
    description: '一致的风格，连贯的体验',
    icon: Code2
  },
  {
    key: 'motion',
    title: '轻量交互',
    description: '克制但恰到好处的动效表达',
    icon: Coffee
  },
  {
    key: 'calm',
    title: '低干扰设计',
    description: '减少视觉噪音，提升专注感',
    icon: PenLine
  }, 
]

const creativeTags = ['极简设计', '留白高级', '清爽克制',  '轻交互', '低冗余布局', '高效迭代开发', '注重细节','低干扰设计','统一']

const inspirationItems = [
  {
    key: 'think',
    title: '思考',
    image: 'https://static.vecteezy.com/system/resources/previews/020/350/825/non_2x/think-icon-vector.jpg',
    icon: Leaf
  },
  {
    key: 'life',
    title: '生活',
    image: 'https://www.bizhigq.com/pc-img/2023-05/g3184.jpg',
    icon: FolderOpen
  },
  {
    key: '自然',
    title: '图书',
    image: 'https://img95.699pic.com/photo/50077/1883.jpg_wh300.jpg!/fh/300/quality/90',
    icon: Coffee
  },
  {
    key: '自然',
    title: '自然',
    image: 'https://n.sinaimg.cn/sinakd20110/176/w1080h696/20220722/dfbe-636ba4a7985bbe1fd4d0240bc40bfa4b.jpg',
    icon: Star
  },
  {
    key: 'exhibition',
    title: '展览',
    image: 'https://p5.itc.cn/q_70/images03/20220926/18e90698113341e8a4272c863328fd1c.jpeg',
    icon: PenLine
  }
]

const explorationCards = [
  {
    key: 'site',
    title: '正在优化',
    focus: '个人主页',
    description: '提升个人品牌建设',
    icon: Leaf
  },
  {
    key: 'ui',
    title: '正在尝试的',
    focus: '设计',
    description: '审美表达',
    icon: PenLine
  },
  {
    key: 'motion',
    title: '职业',
    focus: '探索职业规划',
    description: '求职岗位投递',
    icon: Star
  },
  {
    key: 'study',
    title: '学习与沉淀',
    focus: '持续成长',
    description: '构建长期价值',
    icon: BookOpen
  }
]

const heroMainImage = '/public/imags/project-shot1.png'
const heroSubImage = '/public/imags/SX1.jpg'
</script>

<template>
  <section class="page-section section-reveal compact-detail-scale skills-map-page">
    <div class="page-container skills-map-wrap">
      <RouterLink to="/about" class="text-link back-link">&larr; 返回关于页</RouterLink>

      <header class="skills-map-hero">
        <div class="skills-map-hero-copy">
          <p class="skills-map-hero-eyebrow">
            <PenLine class="skills-map-hero-eyebrow-icon" aria-hidden="true" />
            技能图谱
          </p>
          <h1 class="skills-map-hero-title">技能图谱</h1>
          <p class="skills-map-hero-lead">我常用的工具与方法，也在不断探索新的可能。</p>
        </div>

        <div class="skills-map-hero-collage" aria-hidden="true">
          <figure class="skills-map-polaroid skills-map-polaroid-main">
            <img :src="heroMainImage" alt="" />
          </figure>
          <figure class="skills-map-polaroid skills-map-polaroid-sub">
            <img :src="heroSubImage" alt="" />
          </figure>
        </div>
      </header>

      <section class="skills-map-section">
        <header class="skills-map-section-head">
          <h2 class="skills-map-section-title">
            <FolderOpen class="skills-map-section-icon" aria-hidden="true" />
            <span class="skills-map-section-index">01</span>
            职业能力
          </h2>
          <p class="skills-map-section-note">专业能力让我能够解决问题，创造价值。</p>
        </header>

        <div class="skills-map-career-grid">
          <article v-for="card in careerCards" :key="card.key" class="skills-map-career-card">
            <h3 class="skills-map-card-title">
              <component :is="card.icon" class="skills-map-card-icon" aria-hidden="true" />
              {{ card.title }}
            </h3>

            <div class="skills-map-tag-cloud">
              <span v-for="tag in card.tags" :key="card.key + tag" class="skills-map-tag">
                {{ tag }}
              </span>
            </div>

            <div class="skills-map-heat">
              <div class="skills-map-heat-track" role="presentation">
                <span class="skills-map-heat-fill" :style="{ width: `${card.heat}%` }"></span>
              </div>
              <p>熟练度 {{ card.heat }}%</p>
            </div>
          </article>
        </div>
      </section>

      <section class="skills-map-section">
        <header class="skills-map-section-head">
          <h2 class="skills-map-section-title">
            <Star class="skills-map-section-icon" aria-hidden="true" />
            <span class="skills-map-section-index">02</span>
            开发风格
          </h2>
          <p class="skills-map-section-note">我在意代码质量，也在意体验与细节。</p>
        </header>

        <div class="skills-map-principle-grid">
          <article v-for="item in developmentPrinciples" :key="item.key" class="skills-map-principle-card">
            <component :is="item.icon" class="skills-map-principle-icon" aria-hidden="true" />
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </article>
        </div>
      </section>

      <section class="skills-map-section">
        <header class="skills-map-section-head">
          <h2 class="skills-map-section-title">
            <Heart class="skills-map-section-icon" aria-hidden="true" />
            <span class="skills-map-section-index">03</span>
            创作表达
          </h2>
          <p class="skills-map-section-note">生活与兴趣，是我持续创作的灵感来源。</p>
        </header>

        <div class="skills-map-creative-grid">
          <article class="skills-map-creative-card">
            <h3 class="skills-map-card-title">
              <Heart class="skills-map-card-icon" aria-hidden="true" />
              创作偏好
            </h3>
            <div class="skills-map-tag-cloud">
              <span v-for="tag in creativeTags" :key="tag" class="skills-map-tag">{{ tag }}</span>
            </div>
          </article>

          <article class="skills-map-creative-card">
            <h3 class="skills-map-card-title">
              <BookOpen class="skills-map-card-icon" aria-hidden="true" />
              灵感来源
            </h3>

            <div class="skills-map-inspiration-row">
              <figure v-for="item in inspirationItems" :key="item.key" class="skills-map-inspiration-item">
                <div class="skills-map-inspiration-avatar" :class="{ 'is-fallback': !item.image }">
                  <img v-if="item.image" :src="item.image" :alt="item.title" loading="lazy" />
                  <component :is="item.icon" v-else aria-hidden="true" />
                </div>
                <figcaption>{{ item.title }}</figcaption>
              </figure>
            </div>
          </article>
        </div>
      </section>

      <section class="skills-map-section">
        <header class="skills-map-section-head">
          <h2 class="skills-map-section-title">
            <Leaf class="skills-map-section-icon" aria-hidden="true" />
            <span class="skills-map-section-index">04</span>
            当前探索
          </h2>
          <p class="skills-map-section-note">保持好奇心，持续学习与成长。</p>
        </header>

        <div class="skills-map-exploration-grid">
          <article v-for="item in explorationCards" :key="item.key" class="skills-map-exploration-card">
            <component :is="item.icon" class="skills-map-exploration-icon" aria-hidden="true" />
            <h3>{{ item.title }}</h3>
            <p class="skills-map-exploration-focus">{{ item.focus }}</p>
            <p>{{ item.description }}</p>
          </article>
        </div>
      </section>

      <footer class="skills-map-quote">
        <p class="skills-map-quote-text">技术是工具，表达是语音，而热爱让一切变得有意义。</p>
      </footer>
    </div>
  </section>
</template>
