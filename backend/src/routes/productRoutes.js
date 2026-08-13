import express from 'express'
import {
  createProductController,
  listProductsController,
  updateProductController,
} from '../controllers/productController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.get('/', listProductsController)
router.post('/', authMiddleware, createProductController)
router.patch('/:id', authMiddleware, updateProductController)

export default router
