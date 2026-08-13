import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Dashboard from './components/Dashboard.vue'
import AdminAccessDenied from './components/admin/AdminAccessDenied.vue'
import AdminDashboard from './components/admin/AdminDashboard.vue'
import CreateListing from './components/listings/CreateListing.vue'
import ListingDetail from './components/listings/ListingDetail.vue'
import PricingPlans from './components/plans/PricingPlans.vue'
import BillingPage from './components/user/BillingPage.vue'
import ChatView from './components/user/ChatView.vue'
import SellerDashboard from './components/user/SellerDashboard.vue'
import SettingsPage from './components/user/SettingsPage.vue'
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
    component: SettingsPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/plans',
    name: 'Plans',
    component: PricingPlans,
  },
  {
    path: '/seller',
    name: 'SellerDashboard',
    component: SellerDashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/billing',
    name: 'Billing',
    component: BillingPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/create-listing',
    name: 'CreateListing',
    component: CreateListing,
    meta: { requiresAuth: true },
  },
  {
    path: '/listing/:id',
    name: 'ListingDetail',
    component: ListingDetail,
  },
  {
    path: '/chat',
    name: 'chat',
    component: ChatView,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/access-denied',
    name: 'AdminAccessDenied',
    component: AdminAccessDenied,
    meta: { requiresAuth: true },
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
    if (!isAdmin) {
      return next({ name: 'AdminAccessDenied', query: { from: to.fullPath } })
    }
  }

  return next()
})

const app = createApp(App)
app.use(router)
app.mount('#app')
startTabAnimation()
