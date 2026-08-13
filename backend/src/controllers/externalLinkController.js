/**
 * External Links Controller
 * Manipula links externos ("Onde mais comprar")
 */

import {
  createExternalLink,
  deleteExternalLink,
  getExternalLink,
  getListingExternalLinks,
  POPULAR_PLATFORMS,
  updateExternalLink,
} from '../models/externalLinkModel.js'
import { getListingById } from '../models/listingModel.js'

export async function addExternalLink(req, res) {
  try {
    const {
      listing_id,
      platform_name,
      platform_icon,
      url,
      display_text,
      link_type,
    } = req.body
    const sellerId = req.user.id

    // Verificar se o vendedor é o dono do anúncio
    const listing = await getListingById(listing_id)
    if (!listing || listing.seller_id !== sellerId) {
      return res.status(403).json({ error: 'Acesso negado' })
    }

    if (!platform_name || !url) {
      return res.status(400).json({
        error: 'Nome da plataforma e URL são obrigatórios',
      })
    }

    const link = await createExternalLink({
      listing_id,
      platform_name,
      platform_icon,
      url,
      display_text,
      link_type: link_type || 'marketplace',
    })

    res.status(201).json({
      success: true,
      message: 'Link adicionado com sucesso',
      link,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export async function getLinks(req, res) {
  try {
    const { listing_id } = req.params

    const links = await getListingExternalLinks(listing_id)

    res.json({
      count: links.length,
      links,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export async function editLink(req, res) {
  try {
    const { id } = req.params
    const sellerId = req.user.id
    const updates = req.body

    const link = await getExternalLink(id)
    if (!link) {
      return res.status(404).json({ error: 'Link não encontrado' })
    }

    // Verificar se o vendedor é o dono
    const listing = await getListingById(link.listing_id)
    if (listing.seller_id !== sellerId) {
      return res.status(403).json({ error: 'Acesso negado' })
    }

    const updated = await updateExternalLink(id, updates)

    res.json({
      success: true,
      message: 'Link atualizado com sucesso',
      link: updated,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export async function removeLink(req, res) {
  try {
    const { id } = req.params
    const sellerId = req.user.id

    const link = await getExternalLink(id)
    if (!link) {
      return res.status(404).json({ error: 'Link não encontrado' })
    }

    const listing = await getListingById(link.listing_id)
    if (listing.seller_id !== sellerId) {
      return res.status(403).json({ error: 'Acesso negado' })
    }

    await deleteExternalLink(id)

    res.json({
      success: true,
      message: 'Link removido com sucesso',
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export async function getPlatforms(req, res) {
  try {
    res.json({
      platforms: POPULAR_PLATFORMS,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
