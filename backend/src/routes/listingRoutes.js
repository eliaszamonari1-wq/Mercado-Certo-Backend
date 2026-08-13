/**
 * Listing Routes
 */

import express from 'express'
import {
  createListing,
  getCategories,
  getListing,
  getSellerListings,
  reactivateListing,
  searchListings,
  updateListing,
} from '../controllers/listingController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Rotas públicas
router.get('/search', searchListings)
router.get('/categories', getCategories)
router.get('/:id', getListing)

// Rotas protegidas (vendedor)
router.post('/', authMiddleware, createListing)
router.put('/:id', authMiddleware, updateListing)
router.get('/seller/my-listings', authMiddleware, getSellerListings)
router.post('/:id/reactivate', authMiddleware, reactivateListing)

export default router
