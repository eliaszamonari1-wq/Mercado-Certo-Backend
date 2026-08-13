import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Dashboard from './components/Dashboard.vue'
import './firebase.js'
import './style.css'
import { startTabAnimation } from './utils/tabAnimation.js'

// Configuração das rotas
const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('./components/user/SettingsPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/plans',
    name: 'Plans',
    component: () => import('./components/plans/PricingPlans.vue'),
  },
  {
    path: '/seller',
    name: 'SellerDashboard',
    component: () => import('./components/user/SellerDashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/billing',
    name: 'Billing',
    component: () => import('./components/user/BillingPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/create-listing',
    name: 'CreateListing',
    component: () => import('./components/listings/CreateListing.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/listing/:id',
    name: 'ListingDetail',
    component: () => import('./components/listings/ListingDetail.vue'),
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import('./components/user/ChatView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('./components/admin/AdminDashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth
  const token = localStorage.getItem('token')

  if (requiresAuth && !token) {
    return next({ name: 'Dashboard' })
  }

  if (to.meta.requiresAdmin) {
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null')
    const isAdmin =
      storedUser?.is_admin === true ||
      storedUser?.email?.toLowerCase() === 'elias@test.com'
    if (!isAdmin) return next({ name: 'Dashboard' })
  }

  return next()
})

const app = createApp(App)
app.use(router)
app.mount('#app')
startTabAnimation()
