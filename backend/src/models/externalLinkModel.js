/**
 * External Links Model
 * Gerencia links externos ("Onde mais comprar")
 * Permite que vendedores adicionem links para outras plataformas
 */

import { getDb } from '../database/database.js'

export async function createExternalLink(linkData) {
  const db = await getDb()
  const {
    listing_id,
    platform_name,
    platform_icon,
    url,
    display_text,
    link_type = 'marketplace',
  } = linkData

  const result = await db.run(
    `INSERT INTO external_links (listing_id, platform_name, platform_icon, url, display_text, link_type)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      listing_id,
      platform_name,
      platform_icon || null,
      url,
      display_text || platform_name,
      link_type,
    ],
  )

  return {
    id: result.lastID,
    ...linkData,
  }
}

export async function getExternalLink(id) {
  const db = await getDb()
  return await db.get(`SELECT * FROM external_links WHERE id = ?`, [id])
}

export async function getListingExternalLinks(listingId) {
  const db = await getDb()
  return await db.all(
    `SELECT * FROM external_links WHERE listing_id = ?
     ORDER BY link_type ASC, platform_name ASC`,
    [listingId],
  )
}

export async function updateExternalLink(id, updates) {
  const db = await getDb()
  const { platform_name, platform_icon, url, display_text, link_type } = updates

  const updateClauses = []
  const values = []

  if (platform_name !== undefined) {
    updateClauses.push('platform_name = ?')
    values.push(platform_name)
  }
  if (platform_icon !== undefined) {
    updateClauses.push('platform_icon = ?')
    values.push(platform_icon)
  }
  if (url !== undefined) {
    updateClauses.push('url = ?')
    values.push(url)
  }
  if (display_text !== undefined) {
    updateClauses.push('display_text = ?')
    values.push(display_text)
  }
  if (link_type !== undefined) {
    updateClauses.push('link_type = ?')
    values.push(link_type)
  }

  if (updateClauses.length === 0) {
    return await getExternalLink(id)
  }

  values.push(id)
  await db.run(
    `UPDATE external_links SET ${updateClauses.join(', ')} WHERE id = ?`,
    values,
  )
  return await getExternalLink(id)
}

export async function deleteExternalLink(id) {
  const db = await getDb()
  await db.run(`DELETE FROM external_links WHERE id = ?`, [id])
}

export async function deleteListingExternalLinks(listingId) {
  const db = await getDb()
  await db.run(`DELETE FROM external_links WHERE listing_id = ?`, [listingId])
}

/**
 * Plataformas pré-configuradas com ícones
 */
export const POPULAR_PLATFORMS = [
  {
    id: 'mercado-livre',
    name: 'Mercado Livre',
    icon: '🛒',
    type: 'marketplace',
  },
  {
    id: 'shopee',
    name: 'Shopee',
    icon: '🛍️',
    type: 'marketplace',
  },
  {
    id: 'amazon',
    name: 'Amazon',
    icon: '📦',
    type: 'marketplace',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '🎥',
    type: 'video',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📱',
    type: 'social',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '📱',
    type: 'social',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '📱',
    type: 'social',
  },
  {
    id: 'loja-propria',
    name: 'Loja Própria',
    icon: '🌐',
    type: 'website',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: '💬',
    type: 'messaging',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: '💬',
    type: 'messaging',
  },
]

export function getPlatformIcon(platformName) {
  const platform = POPULAR_PLATFORMS.find(
    (p) => p.name.toLowerCase() === platformName.toLowerCase(),
  )
  return platform ? platform.icon : '🔗'
}
