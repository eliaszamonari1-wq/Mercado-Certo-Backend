/**
 * Listing Controller
 * Manipula requisições relacionadas a anúncios
 */

import { getListingExternalLinks } from '../models/externalLinkModel.js'
import { getListingById } from '../models/listingModel.js'
import { findUserById } from '../repositories/userRepository.js'
import {
  createNewListing,
  getCategories as getListingCategories,
  getSellerListingsData,
  reactivateListingAfterPayment,
  searchActiveListings,
  updateListingDetails,
  viewListing,
} from '../services/listingService.js'

export async function createListing(req, res) {
  try {
    const {
      title,
      description,
      category,
      subcategory,
      price,
      images,
      videos,
      location,
      shipping_options,
    } = req.body
    const sellerId = req.user.id

    if (!title || !category || price === undefined) {
      return res.status(400).json({
        error: 'Título, categoria e preço são obrigatórios',
      })
    }

    const listing = await createNewListing(sellerId, {
      title,
      description,
      category,
      subcategory,
      price: parseFloat(price),
      images,
      videos,
      location,
      shipping_options,
    })

    res.status(201).json({
      success: true,
      message: 'Anúncio criado com sucesso',
      listing,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export async function updateListing(req, res) {
  try {
    const { id } = req.params
    const sellerId = req.user.id
    const updates = req.body

    const listing = await getListingById(id)
    if (!listing) {
      return res.status(404).json({ error: 'Anúncio não encontrado' })
    }

    if (listing.seller_id !== sellerId) {
      return res.status(403).json({ error: 'Acesso negado' })
    }

    const updated = await updateListingDetails(id, updates)
    res.json({ success: true, listing: updated })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export async function getListing(req, res) {
  try {
    const { id } = req.params
    let listing = await viewListing(id)

    if (!listing) {
      return res.status(404).json({ error: 'Anúncio não encontrado' })
    }

    // Obter informações do vendedor
    const seller = await findUserById(listing.seller_id)
    const externalLinks = await getListingExternalLinks(id)

    listing = {
      ...listing,
      seller: {
        id: seller.id,
        name: seller.name,
        location: seller.city
          ? `${seller.city}, ${seller.state}`
          : 'Não informado',
      },
      external_links: externalLinks,
    }

    res.json(listing)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export async function searchListings(req, res) {
  try {
    const {
      category,
      subcategory,
      keyword,
      minPrice,
      maxPrice,
      location,
      limit,
      offset,
    } = req.query

    const listings = await searchActiveListings({
      category,
      subcategory,
      keyword,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      location,
      limit: limit ? parseInt(limit) : 20,
      offset: offset ? parseInt(offset) : 0,
    })

    res.json({
      count: listings.length,
      listings,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export async function getSellerListings(req, res) {
  try {
    const { status = 'active', limit = 20, offset = 0 } = req.query
    const sellerId = req.user.id

    const listings = await getSellerListingsData(
      sellerId,
      status,
      parseInt(limit),
      parseInt(offset),
    )

    res.json({
      count: listings.length,
      listings,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export async function reactivateListing(req, res) {
  try {
    const { id } = req.params
    const sellerId = req.user.id

    const listing = await reactivateListingAfterPayment(id, sellerId)

    res.json({
      success: true,
      message: 'Anúncio reativado com sucesso',
      listing,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export async function getCategories(req, res) {
  try {
    const categories = getListingCategories()
    res.json(categories)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
