<script setup>
import { computed, onMounted, ref } from 'vue'
import { Moon, Sun } from 'lucide-vue-next'
import { RouterLink, RouterView, useRoute } from 'vue-router'
const baseUrl = import.meta.env.VITE_APP_URL
const route = useRoute()

const navItems = [
  { to: '/', key: 'home', label: 'Home' },
  { to: '/about', key: 'aboutMe', label: 'AboutMe' },
  { to: '/portfolio', key: 'portfolio', label: 'Portfolio' },
  { to: '/writings', key: 'writings', label: 'Writings' },
  { to: '/life', key: 'life', label: 'Life' }
]

const themeStorageKey = 'site-theme'
const theme = ref('light')

const getRouteNavKey = (path) => {
  if (path === '/') {
    return 'home'
  }

  if (path === '/about' || path.startsWith('/about/')) {
    return 'aboutMe'
  }

  if (path === '/portfolio' || path.startsWith('/portfolio/')) {
    return 'portfolio'
  }

  if (path === '/writings' || path.startsWith('/writings/')) {
    return 'writings'
  }

  if (path === '/life' || path.startsWith('/life/')) {
    return 'life'
  }

  return ''
}

const activeNavKey = computed(() => getRouteNavKey(route.path))
const isNavActive = (key) => activeNavKey.value === key
const isBusinessRoute = computed(() => {
  const routeName = typeof route.name === 'string' ? route.name : ''
  if (!routeName) {
    return false
  }

  return routeName !== 'home' && routeName !== 'not-found'
})
const businessHubRouteNames = new Set(['about', 'portfolio', 'writings', 'life'])
const isBusinessHubRoute = computed(() => {
  const routeName = typeof route.name === 'string' ? route.name : ''
  return businessHubRouteNames.has(routeName)
})
const siteBgSrc = `${import.meta.env.BASE_URL}bg.png`

const applyTheme = (nextTheme) => {
  theme.value = nextTheme

  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', nextTheme)
  }

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(themeStorageKey, nextTheme)
  }
}

const toggleTheme = () => {
  applyTheme(theme.value === 'dark' ? 'light' : 'dark')
}

onMounted(() => {
  let nextTheme = 'light'

  if (typeof window !== 'undefined') {
    const storedTheme = window.localStorage.getItem(themeStorageKey)

    if (storedTheme === 'light' || storedTheme === 'dark') {
      nextTheme = storedTheme
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      nextTheme = 'dark'
    }
  }

  applyTheme(nextTheme)
})
</script>

<template>
  <div class="site-bg" aria-hidden="true">
    <img class="site-bg-image" :src="siteBgSrc" alt="" />
    <div class="site-bg-overlay"></div>
  </div>
  <div class="app-shell">
    <header class="app-header">
      <div class="header-inner header-inner-transparent">
        <RouterLink to="/" class="brand lift-click">YOLO</RouterLink>

        <div class="header-actions">
          <nav class="top-nav" aria-label="Primary navigation">
            <RouterLink
              v-for="item in navItems"
              :key="item.key"
              :to="item.to"
              class="nav-link lift-click"
              :class="{ active: isNavActive(item.key) }"
              :aria-current="isNavActive(item.key) ? 'page' : undefined"
            >
              {{ item.label }}
            </RouterLink>
          </nav>

          <button
            type="button"
            class="theme-toggle lift-click"
            :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
            @click="toggleTheme"
          >
            <Sun v-if="theme === 'dark'" class="theme-toggle-icon" aria-hidden="true" />
            <Moon v-else class="theme-toggle-icon" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>

    <main
      class="app-main"
      :class="{ 'app-main-business': isBusinessRoute, 'app-main-business-hub': isBusinessHubRoute }"
    >
      <RouterView />
    </main>

    <footer class="app-footer">
      <div class="page-container footer-inner">
        <p>&copy; 2026 Welcome to YOLO's website</p>
      </div>
    </footer>
  </div>
</template>
