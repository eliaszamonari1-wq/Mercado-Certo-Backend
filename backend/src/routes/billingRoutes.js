/**
 * Billing Routes
 */

import express from 'express'
import {
  createMonthlyBilling,
  getActiveBilling,
  getBillingHistory,
  getFinancialSummary,
  getPendingBilling,
  handlePaymentFailure,
  processPaymentRequest,
} from '../controllers/billingController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Rotas protegidas (vendedor)
router.post('/create-monthly', authMiddleware, createMonthlyBilling)
router.get('/active', authMiddleware, getActiveBilling)
router.get('/pending', authMiddleware, getPendingBilling)
router.get('/history', authMiddleware, getBillingHistory)
router.get('/summary', authMiddleware, getFinancialSummary)
router.post('/:billing_id/pay', authMiddleware, processPaymentRequest)
router.post('/:billing_id/failed', authMiddleware, handlePaymentFailure)

export default router
