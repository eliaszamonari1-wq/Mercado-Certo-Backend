/**
 * Listing Model
 * Gerencia operações de anúncios/listagens de produtos
 */

import { getDb } from '../database/database.js'

export async function createListing(listingData) {
  const db = await getDb()
  const {
    seller_id,
    title,
    description,
    category,
    subcategory,
    price,
    images,
    videos,
    location,
    shipping_options,
  } = listingData

  const result = await db.run(
    `INSERT INTO listings (seller_id, title, description, category, subcategory, price, images, videos, location, shipping_options, status, payment_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 'active')`,
    [
      seller_id,
      title,
      description || null,
      category,
      subcategory || null,
      price,
      images ? JSON.stringify(images) : null,
      videos ? JSON.stringify(videos) : null,
      location || null,
      shipping_options ? JSON.stringify(shipping_options) : null,
    ],
  )

  return {
    id: result.lastID,
    ...listingData,
    status: 'active',
    payment_status: 'active',
    views_count: 0,
    contacts_count: 0,
  }
}

export async function getListingById(id) {
  const db = await getDb()
  const listing = await db.get(`SELECT * FROM listings WHERE id = ?`, [id])

  if (listing) {
    return {
      ...listing,
      images: listing.images ? JSON.parse(listing.images) : [],
      videos: listing.videos ? JSON.parse(listing.videos) : [],
      shipping_options: listing.shipping_options
        ? JSON.parse(listing.shipping_options)
        : [],
    }
  }
  return null
}

export async function updateListing(id, updates) {
  const db = await getDb()
  const {
    title,
    description,
    price,
    images,
    videos,
    location,
    shipping_options,
  } = updates

  const updateClauses = []
  const values = []

  if (title !== undefined) {
    updateClauses.push('title = ?')
    values.push(title)
  }
  if (description !== undefined) {
    updateClauses.push('description = ?')
    values.push(description)
  }
  if (price !== undefined) {
    updateClauses.push('price = ?')
    values.push(price)
  }
  if (images !== undefined) {
    updateClauses.push('images = ?')
    values.push(images ? JSON.stringify(images) : null)
  }
  if (videos !== undefined) {
    updateClauses.push('videos = ?')
    values.push(videos ? JSON.stringify(videos) : null)
  }
  if (location !== undefined) {
    updateClauses.push('location = ?')
    values.push(location)
  }
  if (shipping_options !== undefined) {
    updateClauses.push('shipping_options = ?')
    values.push(shipping_options ? JSON.stringify(shipping_options) : null)
  }

  if (updateClauses.length === 0) {
    return await getListingById(id)
  }

  updateClauses.push('updated_at = CURRENT_TIMESTAMP')
  values.push(id)

  await db.run(
    `UPDATE listings SET ${updateClauses.join(', ')} WHERE id = ?`,
    values,
  )
  return await getListingById(id)
}

export async function getSellerListings(sellerId, status = 'active') {
  const db = await getDb()
  const listings = await db.all(
    `SELECT * FROM listings WHERE seller_id = ? AND status = ?
     ORDER BY created_at DESC`,
    [sellerId, status],
  )

  return listings.map((listing) => ({
    ...listing,
    images: listing.images ? JSON.parse(listing.images) : [],
    videos: listing.videos ? JSON.parse(listing.videos) : [],
    shipping_options: listing.shipping_options
      ? JSON.parse(listing.shipping_options)
      : [],
  }))
}

export async function searchListings(filters) {
  const db = await getDb()
  let query = `SELECT * FROM listings WHERE status = 'active' AND payment_status = 'active'`
  const params = []

  if (filters.category) {
    query += ` AND category = ?`
    params.push(filters.category)
  }

  if (filters.subcategory) {
    query += ` AND subcategory = ?`
    params.push(filters.subcategory)
  }

  if (filters.keyword) {
    query += ` AND (title LIKE ? OR description LIKE ?)`
    const keyword = `%${filters.keyword}%`
    params.push(keyword, keyword)
  }

  if (filters.minPrice !== undefined) {
    query += ` AND price >= ?`
    params.push(filters.minPrice)
  }

  if (filters.maxPrice !== undefined) {
    query += ` AND price <= ?`
    params.push(filters.maxPrice)
  }

  if (filters.location) {
    query += ` AND location LIKE ?`
    params.push(`%${filters.location}%`)
  }

  query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`
  params.push(filters.limit || 20, filters.offset || 0)

  const listings = await db.all(query, params)

  return listings.map((listing) => ({
    ...listing,
    images: listing.images ? JSON.parse(listing.images) : [],
    videos: listing.videos ? JSON.parse(listing.videos) : [],
    shipping_options: listing.shipping_options
      ? JSON.parse(listing.shipping_options)
      : [],
  }))
}

export async function incrementViewCount(id) {
  const db = await getDb()
  await db.run(
    `UPDATE listings SET views_count = views_count + 1 WHERE id = ?`,
    [id],
  )
}

export async function incrementContactCount(id) {
  const db = await getDb()
  await db.run(
    `UPDATE listings SET contacts_count = contacts_count + 1 WHERE id = ?`,
    [id],
  )
}

export async function pauseListing(id, reason = 'Payment overdue') {
  const db = await getDb()
  await db.run(
    `UPDATE listings SET status = 'paused', payment_status = 'paused', paused_at = CURRENT_TIMESTAMP, paused_reason = ?
     WHERE id = ?`,
    [reason, id],
  )
}

export async function reactivateListing(id) {
  const db = await getDb()
  await db.run(
    `UPDATE listings SET status = 'active', payment_status = 'active', paused_at = NULL, paused_reason = NULL
     WHERE id = ?`,
    [id],
  )
}

export async function deactivateListing(id) {
  const db = await getDb()
  await db.run(`UPDATE listings SET status = 'inactive' WHERE id = ?`, [id])
}

export async function getListingStats(sellerId) {
  const db = await getDb()
  const [active, paused, inactive, totalViews, totalContacts] =
    await Promise.all([
      db.get(
        `SELECT COUNT(*) as count FROM listings WHERE seller_id = ? AND status = 'active'`,
        [sellerId],
      ),
      db.get(
        `SELECT COUNT(*) as count FROM listings WHERE seller_id = ? AND status = 'paused'`,
        [sellerId],
      ),
      db.get(
        `SELECT COUNT(*) as count FROM listings WHERE seller_id = ? AND status = 'inactive'`,
        [sellerId],
      ),
      db.get(
        `SELECT SUM(views_count) as total FROM listings WHERE seller_id = ?`,
        [sellerId],
      ),
      db.get(
        `SELECT SUM(contacts_count) as total FROM listings WHERE seller_id = ?`,
        [sellerId],
      ),
    ])

  return {
    active: active.count,
    paused: paused.count,
    inactive: inactive.count,
    total_views: totalViews.total || 0,
    total_contacts: totalContacts.total || 0,
  }
}

export async function getActiveListingsCount() {
  const db = await getDb()
  const result = await db.get(
    `SELECT COUNT(*) as count FROM listings WHERE status = 'active' AND payment_status = 'active'`,
  )
  return result.count
}

export async function getPausedListingsCount() {
  const db = await getDb()
  const result = await db.get(
    `SELECT COUNT(*) as count FROM listings WHERE status = 'paused'`,
  )
  return result.count
}
