/**
 * Billing Model
 * Gerencia cobranças mensais de vendedores
 */

import { getDb } from '../database/database.js'

export const MONTHLY_LISTING_PRICE = 100 // R$ 100,00 por anúncio/mês
export const GRACE_PERIOD_DAYS = 30

export async function createBilling(sellerData) {
  const db = await getDb()
  const { seller_id, active_listings_count, due_date } = sellerData

  const amount = active_listings_count * MONTHLY_LISTING_PRICE
  const billing_month = due_date.substring(0, 7) // YYYY-MM

  const result = await db.run(
    `INSERT INTO billing (seller_id, billing_month, active_listings_count, amount, due_date, payment_status)
     VALUES (?, ?, ?, ?, ?, 'pending')`,
    [seller_id, billing_month, active_listings_count, amount],
  )

  return {
    id: result.lastID,
    seller_id,
    billing_month,
    active_listings_count,
    amount,
    due_date,
    payment_status: 'pending',
  }
}

export async function getBillingById(id) {
  const db = await getDb()
  return await db.get(`SELECT * FROM billing WHERE id = ?`, [id])
}

export async function getSellerActiveBilling(sellerId) {
  const db = await getDb()
  return await db.get(
    `SELECT * FROM billing WHERE seller_id = ? AND payment_status = 'active'`,
    [sellerId],
  )
}

export async function getSellerPendingBilling(sellerId) {
  const db = await getDb()
  return await db.get(
    `SELECT * FROM billing WHERE seller_id = ? AND payment_status = 'pending'`,
    [sellerId],
  )
}

export async function getSellerBillingHistory(
  sellerId,
  limit = 12,
  offset = 0,
) {
  const db = await getDb()
  return await db.all(
    `SELECT * FROM billing WHERE seller_id = ?
     ORDER BY billing_month DESC LIMIT ? OFFSET ?`,
    [sellerId, limit, offset],
  )
}

export async function updateBillingStatus(billingId, status, paymentData = {}) {
  const db = await getDb()
  const { payment_method, transaction_id, payment_date } = paymentData

  await db.run(
    `UPDATE billing SET payment_status = ?, payment_method = ?, transaction_id = ?, payment_date = ?, grace_period_end_date = NULL, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      status,
      payment_method || null,
      transaction_id || null,
      payment_date || null,
      billingId,
    ],
  )

  // Reativar listagens se pagamento foi confirmado
  if (status === 'active') {
    const billing = await getBillingById(billingId)
    await db.run(
      `UPDATE listings SET status = 'active', payment_status = 'active'
       WHERE seller_id = ? AND payment_status = 'paused'`,
      [billing.seller_id],
    )
  }
}

export async function setGracePeriod(billingId) {
  const db = await getDb()
  const gracePeriodDate = new Date()
  gracePeriodDate.setDate(gracePeriodDate.getDate() + GRACE_PERIOD_DAYS)

  await db.run(
    `UPDATE billing SET grace_period_end_date = ?, is_notified = 1
     WHERE id = ?`,
    [gracePeriodDate.toISOString().split('T')[0], billingId],
  )
}

export async function markNotified(billingId) {
  const db = await getDb()
  await db.run(`UPDATE billing SET is_notified = 1 WHERE id = ?`, [billingId])
}

export async function getOverdueListings() {
  const db = await getDb()
  const gracePeriodDate = new Date()
  gracePeriodDate.setDate(gracePeriodDate.getDate() - GRACE_PERIOD_DAYS)

  return await db.all(
    `SELECT DISTINCT listings.* FROM listings
     INNER JOIN billing ON listings.seller_id = billing.seller_id
     WHERE billing.payment_status = 'pending'
     AND billing.grace_period_end_date IS NOT NULL
     AND billing.grace_period_end_date <= ?
     AND listings.status = 'active'`,
    [gracePeriodDate.toISOString().split('T')[0]],
  )
}

export async function getPendingBillings() {
  const db = await getDb()
  return await db.all(
    `SELECT * FROM billing WHERE payment_status = 'pending'
     ORDER BY due_date ASC`,
  )
}

export async function getMonthlyRevenue(year, month) {
  const db = await getDb()
  const billing_month = `${year}-${String(month).padStart(2, '0')}`

  const result = await db.get(
    `SELECT
      SUM(amount) as total_revenue,
      COUNT(*) as total_billings,
      SUM(CASE WHEN payment_status = 'active' THEN 1 ELSE 0 END) as paid_count,
      SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) as pending_count
     FROM billing WHERE billing_month = ?`,
    [billing_month],
  )

  return result
}

export async function getTotalMonthlyRevenue() {
  const db = await getDb()
  return await db.get(
    `SELECT
      SUM(amount) as total_mrrr,
      COUNT(*) as total_billings,
      SUM(CASE WHEN payment_status = 'active' THEN amount ELSE 0 END) as paid_amount,
      SUM(CASE WHEN payment_status = 'pending' THEN amount ELSE 0 END) as pending_amount
     FROM billing WHERE payment_status IN ('active', 'pending')`,
  )
}

export async function getDelinquentSellers() {
  const db = await getDb()
  return await db.all(
    `SELECT DISTINCT b.seller_id, u.name, u.email, b.amount, b.due_date, b.grace_period_end_date
     FROM billing b
     INNER JOIN users u ON b.seller_id = u.id
     WHERE b.payment_status = 'pending'
     AND b.grace_period_end_date IS NOT NULL
     ORDER BY b.grace_period_end_date ASC`,
  )
}
