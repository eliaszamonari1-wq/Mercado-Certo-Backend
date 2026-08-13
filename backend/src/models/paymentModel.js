/**
 * Payment Model
 * Gerencia transações de pagamento
 */

import { getDb } from '../database/database.js'

export async function createPayment(paymentData) {
  const db = await getDb()
  const {
    billing_id,
    seller_id,
    amount,
    payment_method,
    transaction_id,
    metadata = {},
  } = paymentData

  const result = await db.run(
    `INSERT INTO payments (billing_id, seller_id, amount, payment_method, transaction_id, status, metadata)
     VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
    [
      billing_id,
      seller_id,
      amount,
      payment_method,
      transaction_id || null,
      JSON.stringify(metadata),
    ],
  )

  return {
    id: result.lastID,
    ...paymentData,
    status: 'pending',
  }
}

export async function getPaymentById(id) {
  const db = await getDb()
  const payment = await db.get(`SELECT * FROM payments WHERE id = ?`, [id])
  if (payment) {
    return {
      ...payment,
      metadata: payment.metadata ? JSON.parse(payment.metadata) : {},
    }
  }
  return null
}

export async function updatePaymentStatus(paymentId, status, paidAt = null) {
  const db = await getDb()
  await db.run(
    `UPDATE payments SET status = ?, paid_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [status, paidAt, paymentId],
  )
}

export async function getSellerPaymentHistory(
  sellerId,
  limit = 20,
  offset = 0,
) {
  const db = await getDb()
  const payments = await db.all(
    `SELECT * FROM payments WHERE seller_id = ?
     ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [sellerId, limit, offset],
  )

  return payments.map((p) => ({
    ...p,
    metadata: p.metadata ? JSON.parse(p.metadata) : {},
  }))
}

export async function getPaymentsByBilling(billingId) {
  const db = await getDb()
  const payments = await db.all(
    `SELECT * FROM payments WHERE billing_id = ? ORDER BY created_at DESC`,
    [billingId],
  )

  return payments.map((p) => ({
    ...p,
    metadata: p.metadata ? JSON.parse(p.metadata) : {},
  }))
}

export async function getTotalPaymentsByStatus(status) {
  const db = await getDb()
  const result = await db.get(
    `SELECT
      COUNT(*) as count,
      SUM(amount) as total_amount
     FROM payments WHERE status = ?`,
    [status],
  )
  return result
}

export async function getSellerTotalPaid(sellerId) {
  const db = await getDb()
  const result = await db.get(
    `SELECT
      SUM(amount) as total_paid,
      COUNT(*) as total_payments
     FROM payments WHERE seller_id = ? AND status = 'completed'`,
    [sellerId],
  )
  return result
}
