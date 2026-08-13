/**
 * Contact Model
 * Gerencia contatos/inquiries de compradores
 */

import { getDb } from '../database/database.js'

export async function createContact(contactData) {
  const db = await getDb()
  const { buyer_id, seller_id, listing_id, contact_type, message } = contactData

  const result = await db.run(
    `INSERT INTO contacts (buyer_id, seller_id, listing_id, contact_type, message)
     VALUES (?, ?, ?, ?, ?)`,
    [
      buyer_id,
      seller_id,
      listing_id,
      contact_type || 'inquiry',
      message || null,
    ],
  )

  return {
    id: result.lastID,
    ...contactData,
    status: 'new',
  }
}

export async function getContact(id) {
  const db = await getDb()
  return await db.get(`SELECT * FROM contacts WHERE id = ?`, [id])
}

export async function getSellerContacts(sellerId, limit = 50, offset = 0) {
  const db = await getDb()
  return await db.all(
    `SELECT * FROM contacts WHERE seller_id = ?
     ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [sellerId, limit, offset],
  )
}

export async function getUnreadContacts(sellerId) {
  const db = await getDb()
  return await db.all(
    `SELECT * FROM contacts WHERE seller_id = ? AND status = 'new'
     ORDER BY created_at DESC`,
    [sellerId],
  )
}

export async function updateContactStatus(id, status) {
  const db = await getDb()
  await db.run(`UPDATE contacts SET status = ? WHERE id = ?`, [status, id])
}

export async function deleteContact(id) {
  const db = await getDb()
  await db.run(`DELETE FROM contacts WHERE id = ?`, [id])
}
