/**
 * Notification Model
 * Gerencia notificações do sistema
 */

import { getDb } from '../database/database.js'

export async function createNotification(notificationData) {
  const db = await getDb()
  const { user_id, type, title, message, related_id } = notificationData

  const result = await db.run(
    `INSERT INTO notifications (user_id, type, title, message, related_id)
     VALUES (?, ?, ?, ?, ?)`,
    [user_id, type, title || null, message, related_id || null],
  )

  return {
    id: result.lastID,
    ...notificationData,
    is_read: false,
  }
}

export async function getNotification(id) {
  const db = await getDb()
  return await db.get(`SELECT * FROM notifications WHERE id = ?`, [id])
}

export async function getUserNotifications(userId, limit = 20, offset = 0) {
  const db = await getDb()
  return await db.all(
    `SELECT * FROM notifications WHERE user_id = ?
     ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [userId, limit, offset],
  )
}

export async function getUnreadNotifications(userId) {
  const db = await getDb()
  return await db.all(
    `SELECT * FROM notifications WHERE user_id = ? AND is_read = 0
     ORDER BY created_at DESC`,
    [userId],
  )
}

export async function markNotificationAsRead(id) {
  const db = await getDb()
  const now = new Date().toISOString()
  await db.run(
    `UPDATE notifications SET is_read = 1, read_at = ? WHERE id = ?`,
    [now, id],
  )
}

export async function markAllNotificationsAsRead(userId) {
  const db = await getDb()
  const now = new Date().toISOString()
  await db.run(
    `UPDATE notifications SET is_read = 1, read_at = ? WHERE user_id = ? AND is_read = 0`,
    [now, userId],
  )
}

export async function deleteNotification(id) {
  const db = await getDb()
  await db.run(`DELETE FROM notifications WHERE id = ?`, [id])
}
