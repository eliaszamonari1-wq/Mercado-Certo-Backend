/**
 * Admin Routes
 */

import express from 'express'
import {
  getAlerts,
  getDashboard,
  getFinancialReport,
  getSellerReport,
} from '../controllers/adminController.js'
import { authMiddleware, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

// Rotas protegidas (admin)
router.use(authMiddleware, requireAdmin)
router.get('/dashboard', getDashboard)
router.get('/financial-report', getFinancialReport)
router.get('/seller/:seller_id', getSellerReport)
router.get('/alerts', getAlerts)

export default router
