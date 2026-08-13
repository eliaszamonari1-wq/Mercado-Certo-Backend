/**
 * Admin Service
 * Serviço de administração e analytics da plataforma
 */

import {
  getDelinquentSellers,
  getMonthlyRevenue,
  getTotalMonthlyRevenue,
} from '../models/billingModel.js'
import {
  getActiveListingsCount,
  getListingStats,
  getPausedListingsCount,
} from '../models/listingModel.js'
import { getTotalPaymentsByStatus } from '../models/paymentModel.js'
import { getTotalUsersStats } from '../repositories/userRepository.js'

/**
 * Obtém dashboard financeiro da plataforma
 */
export async function getAdminFinancialDashboard() {
  const mrrData = await getTotalMonthlyRevenue()
  const paidPayments = await getTotalPaymentsByStatus('completed')
  const pendingPayments = await getTotalPaymentsByStatus('pending')
  const delinquentSellers = await getDelinquentSellers()

  return {
    mrr: {
      total: mrrData.total_mrrr || 0,
      paid: mrrData.paid_amount || 0,
      pending: mrrData.pending_amount || 0,
      billing_count: mrrData.total_billings || 0,
    },
    payments: {
      completed: {
        count: paidPayments.count || 0,
        total: paidPayments.total_amount || 0,
      },
      pending: {
        count: pendingPayments.count || 0,
        total: pendingPayments.total_amount || 0,
      },
    },
    delinquent: {
      count: delinquentSellers.length,
      sellers: delinquentSellers,
    },
  }
}

/**
 * Obtém dashboard de listagens
 */
export async function getAdminListingsDashboard() {
  const activeCount = await getActiveListingsCount()
  const pausedCount = await getPausedListingsCount()

  return {
    active: activeCount,
    paused: pausedCount,
    total: activeCount + pausedCount,
  }
}

/**
 * Obtém dashboard de usuários
 */
export async function getAdminUsersDashboard() {
  return await getTotalUsersStats()
}

/**
 * Obtém dashboard completo da administração
 */
export async function getAdminCompleteDashboard() {
  const [users, listings, financial] = await Promise.all([
    getAdminUsersDashboard(),
    getAdminListingsDashboard(),
    getAdminFinancialDashboard(),
  ])

  return {
    users,
    listings,
    financial,
    generated_at: new Date().toISOString(),
  }
}

/**
 * Obtém relatório mensal de receita
 */
export async function getMonthlyRevenueReport(year, month) {
  const revenue = await getMonthlyRevenue(year, month)
  const year_month = `${year}-${String(month).padStart(2, '0')}`

  return {
    period: year_month,
    total_revenue: revenue.total_revenue || 0,
    total_billings: revenue.total_billings || 0,
    paid_billings: revenue.paid_count || 0,
    pending_billings: revenue.pending_count || 0,
    paid_amount: revenue.total_revenue || 0,
  }
}

/**
 * Obtém relatório de vendedores
 */
export async function getSellerAnalytics(sellerId) {
  const stats = await getListingStats(sellerId)

  return {
    listings: stats,
    performance: {
      views_per_listing:
        stats.total_listings > 0 ? stats.total_views / stats.total_listings : 0,
      contacts_per_listing:
        stats.total_listings > 0
          ? stats.total_contacts / stats.total_listings
          : 0,
    },
  }
}

/**
 * Gera alertas para administrador
 */
export async function generateAdminAlerts() {
  const delinquentSellers = await getDelinquentSellers()
  const alerts = []

  if (delinquentSellers.length > 0) {
    alerts.push({
      type: 'delinquent_sellers',
      severity: 'warning',
      message: `${delinquentSellers.length} vendedores com pagamentos atrasados`,
      count: delinquentSellers.length,
    })
  }

  return alerts
}
