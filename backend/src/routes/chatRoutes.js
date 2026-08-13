/**
 * Chat Routes
 */

import express from 'express'
import {
  getMessages,
  getTemplates,
  getUnreadCount,
  getUserChats,
  initializeChat,
  sendChatMessage,
} from '../controllers/chatController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Rotas protegidas
router.post('/start', authMiddleware, initializeChat)
router.post('/send', authMiddleware, sendChatMessage)
router.get('/conversations', authMiddleware, getUserChats)
router.get('/unread', authMiddleware, getUnreadCount)
router.get('/templates', getTemplates)
router.get('/:seller_id/:listing_id?', authMiddleware, getMessages)

export default router
