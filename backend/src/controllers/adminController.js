/**
 * Admin Controller
 * Manipula requisições de administração
 */

import {
  generateAdminAlerts,
  getAdminCompleteDashboard,
  getMonthlyRevenueReport,
  getSellerAnalytics,
} from '../services/adminService.js'

export async function getDashboard(req, res) {
  try {
    if (req.user.is_admin !== 1) {
      return res
        .status(403)
        .json({ error: 'Acesso negado. Apenas administradores.' })
    }

    const dashboard = await getAdminCompleteDashboard()

    res.json(dashboard)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export async function getFinancialReport(req, res) {
  try {
    if (req.user.is_admin !== 1) {
      return res
        .status(403)
        .json({ error: 'Acesso negado. Apenas administradores.' })
    }

    const { year, month } = req.query

    if (!year || !month) {
      return res.status(400).json({
        error: 'Ano e mês são obrigatórios',
      })
    }

    const report = await getMonthlyRevenueReport(
      parseInt(year),
      parseInt(month),
    )

    res.json(report)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export async function getSellerReport(req, res) {
  try {
    if (req.user.is_admin !== 1) {
      return res
        .status(403)
        .json({ error: 'Acesso negado. Apenas administradores.' })
    }

    const { seller_id } = req.params

    const analytics = await getSellerAnalytics(parseInt(seller_id))

    res.json(analytics)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export async function getAlerts(req, res) {
  try {
    if (req.user.is_admin !== 1) {
      return res
        .status(403)
        .json({ error: 'Acesso negado. Apenas administradores.' })
    }

    const alerts = await generateAdminAlerts()

    res.json({
      count: alerts.length,
      alerts,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
