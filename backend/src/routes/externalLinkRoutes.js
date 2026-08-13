/**
 * External Links Routes
 */

import express from 'express'
import {
  addExternalLink,
  editLink,
  getLinks,
  getPlatforms,
  removeLink,
} from '../controllers/externalLinkController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Rotas públicas
router.get('/platforms', getPlatforms)
router.get('/:listing_id', getLinks)

// Rotas protegidas (vendedor)
router.post('/', authMiddleware, addExternalLink)
router.put('/:id', authMiddleware, editLink)
router.delete('/:id', authMiddleware, removeLink)

export default router
