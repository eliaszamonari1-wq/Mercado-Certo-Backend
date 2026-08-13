/**
 * Message Model
 * Gerencia mensagens de chat entre comprador e vendedor
 */

import { getDb } from '../database/database.js'

export async function createMessage(messageData) {
  const db = await getDb()
  const {
    sender_id,
    receiver_id,
    listing_id,
    subject,
    content,
    attachments = [],
  } = messageData

  const result = await db.run(
    `INSERT INTO messages (sender_id, receiver_id, listing_id, subject, content, attachments)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      sender_id,
      receiver_id,
      listing_id || null,
      subject || null,
      content,
      attachments.length > 0 ? JSON.stringify(attachments) : null,
    ],
  )

  return {
    id: result.lastID,
    ...messageData,
    is_read: false,
  }
}

export async function getMessageById(id) {
  const db = await getDb()
  const message = await db.get(`SELECT * FROM messages WHERE id = ?`, [id])
  if (message) {
    return {
      ...message,
      attachments: message.attachments ? JSON.parse(message.attachments) : [],
    }
  }
  return null
}

export async function getConversationMessages(
  buyerId,
  sellerId,
  listingId = null,
) {
  const db = await getDb()
  let query = `SELECT * FROM messages
    WHERE (sender_id = ? AND receiver_id = ?)
    OR (sender_id = ? AND receiver_id = ?)`
  const params = [buyerId, sellerId, sellerId, buyerId]

  if (listingId) {
    query += ` AND listing_id = ?`
    params.push(listingId)
  }

  query += ` ORDER BY created_at ASC`

  const messages = await db.all(query, params)

  return messages.map((m) => ({
    ...m,
    attachments: m.attachments ? JSON.parse(m.attachments) : [],
  }))
}

export async function markMessagesAsRead(receiverId, senderId) {
  const db = await getDb()
  const now = new Date().toISOString()
  await db.run(
    `UPDATE messages SET is_read = 1, read_at = ?
     WHERE receiver_id = ? AND sender_id = ? AND is_read = 0`,
    [now, receiverId, senderId],
  )
}

export async function getUnreadMessageCount(userId) {
  const db = await getDb()
  const result = await db.get(
    `SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0`,
    [userId],
  )
  return result.count
}

export async function getUserMessages(userId, limit = 50, offset = 0) {
  const db = await getDb()
  const messages = await db.all(
    `SELECT * FROM messages WHERE receiver_id = ?
     ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [userId, limit, offset],
  )

  return messages.map((m) => ({
    ...m,
    attachments: m.attachments ? JSON.parse(m.attachments) : [],
  }))
}

export async function getConversationThreads(userId, limit = 20, offset = 0) {
  const db = await getDb()
  const threads = await db.all(
    `SELECT DISTINCT
      CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END as other_user_id,
      listing_id,
      MAX(created_at) as last_message_at
     FROM messages
     WHERE sender_id = ? OR receiver_id = ?
     GROUP BY other_user_id, listing_id
     ORDER BY last_message_at DESC
     LIMIT ? OFFSET ?`,
    [userId, userId, userId, limit, offset],
  )

  return threads
}

export async function searchMessages(userId, keyword) {
  const db = await getDb()
  const searchTerm = `%${keyword}%`
  const messages = await db.all(
    `SELECT * FROM messages
     WHERE (sender_id = ? OR receiver_id = ?)
     AND (subject LIKE ? OR content LIKE ?)
     ORDER BY created_at DESC`,
    [userId, userId, searchTerm, searchTerm],
  )

  return messages.map((m) => ({
    ...m,
    attachments: m.attachments ? JSON.parse(m.attachments) : [],
  }))
}
