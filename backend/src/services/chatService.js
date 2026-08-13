/**
 * Chat Service
 * Serviço de mensagens entre comprador e vendedor
 */

import {
  getListingById,
  incrementContactCount,
} from '../models/listingModel.js'
import {
  createMessage,
  getConversationMessages,
  getConversationThreads,
  getUnreadMessageCount,
  markMessagesAsRead,
} from '../models/messageModel.js'
import { createNotification } from '../models/notificationModel.js'

/**
 * Inicia conversa entre comprador e vendedor
 */
export async function startConversation(
  buyerId,
  sellerId,
  listingId,
  initialMessage = null,
) {
  if (buyerId === sellerId) {
    throw new Error('Você não pode conversar com você mesmo')
  }

  const listing = await getListingById(listingId)
  if (!listing) {
    throw new Error('Anúncio não encontrado')
  }

  // Incrementar contador de contatos
  await incrementContactCount(listingId)

  let message = null
  if (initialMessage) {
    message = await createMessage({
      sender_id: buyerId,
      receiver_id: sellerId,
      listing_id: listingId,
      subject: `Dúvida sobre: ${listing.title}`,
      content: initialMessage,
    })

    // Notificar vendedor
    await createNotification({
      user_id: sellerId,
      type: 'new_message',
      title: 'Nova mensagem',
      message: `Você recebeu uma mensagem sobre "${listing.title}"`,
      related_id: listing.id,
    })
  }

  return {
    listing_id: listingId,
    buyer_id: buyerId,
    seller_id: sellerId,
    first_message: message,
  }
}

/**
 * Envia mensagem em conversa
 */
export async function sendMessage(senderId, receiverId, messageData) {
  const { listing_id, subject, content, attachments } = messageData

  const message = await createMessage({
    sender_id: senderId,
    receiver_id: receiverId,
    listing_id: listing_id || null,
    subject: subject || null,
    content,
    attachments: attachments || [],
  })

  // Notificar receptor
  const subject_text = subject || 'Nova mensagem'
  await createNotification({
    user_id: receiverId,
    type: 'new_message',
    title: 'Nova mensagem',
    message: subject_text,
    related_id: listing_id,
  })

  return message
}

/**
 * Obtém histórico de conversa
 */
export async function getConversation(buyerId, sellerId, listingId = null) {
  const messages = await getConversationMessages(buyerId, sellerId, listingId)

  // Marcar como lida
  await markMessagesAsRead(buyerId, sellerId)
  await markMessagesAsRead(sellerId, buyerId)

  return messages
}

/**
 * Obtém lista de conversas do usuário
 */
export async function getUserConversations(userId, limit = 20, offset = 0) {
  const threads = await getConversationThreads(userId, limit, offset)

  // Enriquecer com informações do usuário
  const enriched = await Promise.all(
    threads.map(async (thread) => {
      const unreadCount = await getUnreadMessageCount(userId)
      return {
        ...thread,
        unread_count: unreadCount,
      }
    }),
  )

  return enriched
}

/**
 * Obtém contagem de mensagens não lidas
 */
export async function getUserUnreadCount(userId) {
  return await getUnreadMessageCount(userId)
}

/**
 * Tópicos de conversa pré-definidos para facilitar comunicação
 */
export function getMessageTemplates() {
  return {
    buyer: [
      {
        id: 'price_negotiation',
        title: 'Negociar preço',
        content: 'Olá! Qual é o melhor preço que você consegue oferecer?',
      },
      {
        id: 'shipping',
        title: 'Informações de frete',
        content:
          'Como você faz a entrega? Aceita fazer o frete? Qual seria o custo?',
      },
      {
        id: 'payment',
        title: 'Forma de pagamento',
        content:
          'Quais são as formas de pagamento que você aceita? Possui parcelamento?',
      },
      {
        id: 'product_details',
        title: 'Detalhes do produto',
        content: 'Gostaria de saber mais detalhes sobre este produto.',
      },
      {
        id: 'availability',
        title: 'Disponibilidade',
        content: 'Este produto ainda está disponível? Quando você pode enviar?',
      },
    ],
    seller: [
      {
        id: 'greeting',
        title: 'Resposta padrão',
        content: 'Olá! Obrigado pelo interesse. Como posso ajudar?',
      },
      {
        id: 'accept_offer',
        title: 'Aceitar oferta',
        content: 'Ótimo! Aceito sua proposta. Como gostaríamos de proceder?',
      },
      {
        id: 'reject_offer',
        title: 'Recusar oferta',
        content:
          'Obrigado pelo interesse, mas não consigo oferecer por esse valor. Qual seria sua melhor oferta?',
      },
      {
        id: 'shipping_info',
        title: 'Informações de frete',
        content:
          'Fazemos entrega via Correios ou transportadora. Qual endereço de entrega?',
      },
    ],
  }
}
