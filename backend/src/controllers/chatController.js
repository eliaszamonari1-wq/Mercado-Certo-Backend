/**
 * Chat Controller
 * Manipula requisições de mensagens e conversas
 */

import {
  getConversation,
  getMessageTemplates,
  getUserConversations,
  getUserUnreadCount,
  sendMessage,
  startConversation,
} from '../services/chatService.js'

export async function initializeChat(req, res) {
  try {
    const { seller_id, listing_id, initial_message } = req.body
    const buyerId = req.user.id

    if (buyerId === seller_id) {
      return res
        .status(400)
        .json({ error: 'Você não pode conversar com você mesmo' })
    }

    const conversation = await startConversation(
      buyerId,
      seller_id,
      listing_id,
      initial_message,
    )

    res.status(201).json({
      success: true,
      message: 'Conversa iniciada com sucesso',
      conversation,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export async function sendChatMessage(req, res) {
  try {
    const { receiver_id, listing_id, subject, content, attachments } = req.body
    const senderId = req.user.id

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Mensagem não pode estar vazia' })
    }

    const message = await sendMessage(senderId, receiver_id, {
      listing_id,
      subject,
      content,
      attachments,
    })

    res.status(201).json({
      success: true,
      message: 'Mensagem enviada com sucesso',
      data: message,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export async function getMessages(req, res) {
  try {
    const { seller_id, listing_id } = req.params
    const buyerId = req.user.id

    const messages = await getConversation(
      buyerId,
      parseInt(seller_id),
      listing_id ? parseInt(listing_id) : null,
    )

    res.json({
      count: messages.length,
      messages,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export async function getUserChats(req, res) {
  try {
    const userId = req.user.id
    const { limit = 20, offset = 0 } = req.query

    const conversations = await getUserConversations(
      userId,
      parseInt(limit),
      parseInt(offset),
    )

    res.json({
      count: conversations.length,
      conversations,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export async function getUnreadCount(req, res) {
  try {
    const userId = req.user.id
    const count = await getUserUnreadCount(userId)

    res.json({ unread_count: count })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export async function getTemplates(req, res) {
  try {
    const { role } = req.query
    const templates = getMessageTemplates()

    const result = role && templates[role] ? templates[role] : templates

    res.json(result)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
