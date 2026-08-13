import { getDb } from '../database/database.js'
import { User } from '../models/userModel.js'

export async function createUser({ username, password, name, email }) {
  const database = await getDb()

  try {
    const result = await database.run(
      'INSERT INTO users (username, email, password, name) VALUES (?, ?, ?, ?)',
      [username, email || null, password, name],
    )

    return await findUserById(result.lastID)
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      const uniqueError = new Error('Usuário já cadastrado.')
      uniqueError.statusCode = 409
      throw uniqueError
    }
    throw error
  }
}

export async function findUserByUsername(username) {
  const database = await getDb()
  const user = await database.get('SELECT * FROM users WHERE username = ?', [
    username,
  ])
  return user ? new User(user) : null
}

export async function findUserByEmail(email) {
  const database = await getDb()
  const user = await database.get('SELECT * FROM users WHERE email = ?', [
    email,
  ])
  return user ? new User(user) : null
}

export async function findUserById(id) {
  const database = await getDb()
  const user = await database.get('SELECT * FROM users WHERE id = ?', [id])
  return user ? new User(user) : null
}

export async function findUserByCredentials({ username, password }) {
  const database = await getDb()

  const normalizedUsername = username?.trim()

  const user = await database.get(
    'SELECT * FROM users WHERE username = ? OR email = ?',
    [normalizedUsername, normalizedUsername],
  )

  if (!user) return null

  return new User(user)
}

export async function updateUser(id, userData) {
  const database = await getDb()

  const updates = []
  const values = []

  if (userData.name) {
    updates.push('name = ?')
    values.push(userData.name)
  }

  if (userData.email) {
    updates.push('email = ?')
    values.push(userData.email)
  }

  if (userData.password) {
    updates.push('password = ?')
    values.push(userData.password)
  }

  updates.push('updated_at = CURRENT_TIMESTAMP')
  values.push(id)

  await database.run(
    `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
    values,
  )

  return await findUserById(id)
}

export async function deactivateUser(id) {
  const database = await getDb()
  await database.run(
    'UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [id],
  )
  return await findUserById(id)
}

export async function activateUser(id) {
  const database = await getDb()
  await database.run(
    'UPDATE users SET is_active = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [id],
  )
  return await findUserById(id)
}

export async function getAllUsers() {
  const database = await getDb()
  const users = await database.all('SELECT * FROM users ORDER BY id DESC')
  return users.map((user) => new User(user))
}

export async function getTotalUsersStats() {
  const database = await getDb()
  const stats = await database.get(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS active,
      SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) AS inactive
    FROM users
  `)

  return {
    total: stats.total || 0,
    active: stats.active || 0,
    inactive: stats.inactive || 0,
  }
}

export async function deleteUser(id) {
  const database = await getDb()
  await database.run('DELETE FROM users WHERE id = ?', [id])
}
