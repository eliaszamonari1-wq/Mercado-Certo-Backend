/**
 * Billing Controller
 * Manipula requisições de cobrança e pagamentos
 */

import {
  getBillingById,
  getSellerActiveBilling,
  getSellerBillingHistory,
  getSellerPendingBilling,
} from '../models/billingModel.js'
import {
  generateMonthlySelling,
  getSellerFinancialSummary,
  markPaymentFailed,
  processPayment,
} from '../services/billingService.js'

export async function createMonthlyBilling(req, res) {
  try {
    const sellerId = req.user.id

    const billing = await generateMonthlySelling(sellerId)

    if (!billing) {
      return res.status(400).json({
        error: 'Nenhum anúncio ativo para gerar cobrança',
      })
    }

    res.status(201).json({
      success: true,
      message: 'Cobrança mensal gerada com sucesso',
      billing,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export async function getActiveBilling(req, res) {
  try {
    const sellerId = req.user.id
    const billing = await getSellerActiveBilling(sellerId)

    if (!billing) {
      return res.status(404).json({
        error: 'Nenhuma cobrança ativa encontrada',
      })
    }

    res.json(billing)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export async function getPendingBilling(req, res) {
  try {
    const sellerId = req.user.id
    const billing = await getSellerPendingBilling(sellerId)

    if (!billing) {
      return res.status(404).json({
        error: 'Nenhuma cobrança pendente',
      })
    }

    res.json(billing)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export async function getBillingHistory(req, res) {
  try {
    const sellerId = req.user.id
    const { limit = 12, offset = 0 } = req.query

    const history = await getSellerBillingHistory(
      sellerId,
      parseInt(limit),
      parseInt(offset),
    )

    res.json({
      count: history.length,
      history,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export async function processPaymentRequest(req, res) {
  try {
    const { billing_id } = req.params
    const { payment_method, transaction_id } = req.body
    const sellerId = req.user.id

    const billing = await getBillingById(billing_id)

    if (!billing || billing.seller_id !== sellerId) {
      return res.status(403).json({ error: 'Acesso negado' })
    }

    const result = await processPayment(billing_id, {
      payment_method,
      transaction_id,
    })

    res.json({
      success: true,
      message: 'Pagamento processado com sucesso',
      billing: result,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export async function handlePaymentFailure(req, res) {
  try {
    const { billing_id } = req.params
    const sellerId = req.user.id

    const billing = await getBillingById(billing_id)

    if (!billing || billing.seller_id !== sellerId) {
      return res.status(403).json({ error: 'Acesso negado' })
    }

    await markPaymentFailed(billing_id)

    res.json({
      success: true,
      message:
        'Período de graça iniciado. Você tem 30 dias para regularizar o pagamento.',
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export async function getFinancialSummary(req, res) {
  try {
    const sellerId = req.user.id
    const summary = await getSellerFinancialSummary(sellerId)

    res.json(summary)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
