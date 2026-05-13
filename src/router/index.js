import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import AboutPage from '../pages/AboutPage.vue'
import AboutTimelineDetailPage from '../pages/AboutTimelineDetailPage.vue'
import AboutSkillsDetailPage from '../pages/AboutSkillsDetailPage.vue'
import AboutContactDetailPage from '../pages/AboutContactDetailPage.vue'
import PortfolioPage from '../pages/PortfolioPage.vue'
import WritingsPage from '../pages/WritingsPage.vue'
import LifePage from '../pages/LifePage.vue'
import LifeModuleDetailPage from '../pages/LifeModuleDetailPage.vue'
import LifeItemDetailPage from '../pages/LifeItemDetailPage.vue'
import ProjectDetailPage from '../pages/ProjectDetailPage.vue'
import WritingDetailPage from '../pages/WritingDetailPage.vue'
import NotFoundPage from '../pages/NotFoundPage.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
    meta: { title: 'Home' }
  },
  {
    path: '/about',
    name: 'about',
    component: AboutPage,
    meta: { title: 'About' }
  },
  {
    path: '/about/timeline',
    name: 'about-timeline',
    component: AboutTimelineDetailPage,
    meta: { title: 'About Timeline' }
  },
  {
    path: '/about/skills',
    name: 'about-skills',
    component: AboutSkillsDetailPage,
    meta: { title: 'About Skills' }
  },
  {
    path: '/about/contact',
    name: 'about-contact',
    component: AboutContactDetailPage,
    meta: { title: 'About Contact' }
  },
  {
    path: '/portfolio',
    name: 'portfolio',
    component: PortfolioPage,
    meta: { title: 'Portfolio' }
  },
  {
    path: '/writings',
    name: 'writings',
    component: WritingsPage,
    meta: { title: 'Writings' }
  },
  {
    path: '/life',
    name: 'life',
    component: LifePage,
    meta: { title: 'Life' }
  },
  {
    path: '/life/snippets/:itemSlug',
    redirect: '/life/snippets'
  },
  {
    path: '/life/music/:itemSlug',
    name: 'music-item-removed',
    component: NotFoundPage,
    meta: { title: 'Not Found' }
  },
  {
    path: '/life/:moduleSlug/:itemSlug',
    name: 'life-item-detail',
    component: LifeItemDetailPage,
    meta: { title: 'Life Item Detail' }
  },
  {
    path: '/life/:moduleSlug(reading|shows|music|outdoors|photography|snippets)',
    name: 'life-module-detail',
    component: LifeModuleDetailPage,
    meta: { title: 'Life Module Detail' }
  },
  {
    path: '/portfolio/:slug',
    name: 'project-detail',
    component: ProjectDetailPage,
    meta: { title: 'Project Detail' }
  },
  {
    path: '/writings/:slug',
    name: 'writing-detail',
    component: WritingDetailPage,
    meta: { title: 'Writing Detail' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundPage,
    meta: { title: 'Not Found' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    if (to.hash) {
      return {
        el: to.hash,
        top: 108,
        behavior: 'smooth'
      }
    }

    return { top: 0, behavior: 'smooth' }
  }
})

router.afterEach((to) => {
  const pageTitle = to.meta?.title ? `${to.meta.title} | YOLO website` : 'YOLO'
  document.title = pageTitle
})

export default router

