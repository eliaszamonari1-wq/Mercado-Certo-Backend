/**
 * Listing Service
 * Serviço de gerenciamento de anúncios
 */

import { getSellerActiveBilling } from '../models/billingModel.js'
import {
  createListing,
  getListingById,
  getSellerListings,
  incrementViewCount,
  pauseListing,
  reactivateListing,
  searchListings,
  updateListing,
} from '../models/listingModel.js'
import { createNotification } from '../models/notificationModel.js'

/**
 * Cria novo anúncio
 * Vendedor é cobrado automaticamente R$ 100,00 por novo anúncio
 */
export async function createNewListing(sellerId, listingData) {
  // Verificar se vendedor está em dia com pagamentos
  const activeBilling = await getSellerActiveBilling(sellerId)

  if (activeBilling && activeBilling.payment_status !== 'active') {
    throw new Error(
      'Você não pode criar novos anúncios enquanto houver pagamentos pendentes',
    )
  }

  const listing = await createListing({
    seller_id: sellerId,
    ...listingData,
  })

  // Notificar vendedor
  await createNotification({
    user_id: sellerId,
    type: 'listing_created',
    title: 'Anúncio criado com sucesso',
    message: `Seu anúncio "${listing.title}" foi criado. Você será cobrado R$ 100,00 mensais por este anúncio.`,
    related_id: listing.id,
  })

  return listing
}

/**
 * Atualiza anúncio existente
 */
export async function updateListingDetails(listingId, updates) {
  const listing = await updateListing(listingId, updates)

  if (!listing) {
    throw new Error('Anúncio não encontrado')
  }

  // Registrar histórico
  await createListingHistory(
    listingId,
    'updated',
    listing.status,
    listing.status,
  )

  return listing
}

/**
 * Visualiza anúncio (incrementa contador de visualizações)
 */
export async function viewListing(listingId) {
  const listing = await getListingById(listingId)

  if (!listing) {
    throw new Error('Anúncio não encontrado')
  }

  if (listing.status !== 'active' || listing.payment_status !== 'active') {
    throw new Error('Anúncio não está disponível')
  }

  await incrementViewCount(listingId)

  return listing
}

/**
 * Busca anúncios com filtros
 */
export async function searchActiveListings(filters) {
  const results = await searchListings({
    ...filters,
    limit: filters.limit || 20,
    offset: filters.offset || 0,
  })

  return results
}

/**
 * Obtém anúncios do vendedor
 */
export async function getSellerListingsData(
  sellerId,
  status = 'active',
  limit = 20,
  offset = 0,
) {
  const listings = await getSellerListings(sellerId, status)

  return listings.slice(offset, offset + limit)
}

/**
 * Inicia processo de pausa de anúncio
 */
export async function pauseListingByPaymentIssue(
  listingId,
  sellerId,
  reason = 'Anúncio pausado por falta de pagamento',
) {
  const listing = await getListingById(listingId)

  if (!listing || listing.seller_id !== sellerId) {
    throw new Error('Anúncio não encontrado ou acesso negado')
  }

  await pauseListing(listingId, reason)
  await createListingHistory(listingId, 'paused', 'active', 'paused', reason)

  return listing
}

/**
 * Reativa anúncio após pagamento
 */
export async function reactivateListingAfterPayment(listingId, sellerId) {
  const listing = await getListingById(listingId)

  if (!listing || listing.seller_id !== sellerId) {
    throw new Error('Anúncio não encontrado ou acesso negado')
  }

  await reactivateListing(listingId)
  await createListingHistory(listingId, 'reactivated', 'paused', 'active')

  // Notificar vendedor
  await createNotification({
    user_id: sellerId,
    type: 'listing_reactivated',
    title: 'Anúncio reativado',
    message: `Seu anúncio "${listing.title}" foi reativado com sucesso.`,
    related_id: listingId,
  })

  return listing
}

/**
 * Obter categorias e subcategorias disponíveis
 */
export function getCategories() {
  return {
    eletronicos: {
      name: 'Eletrônicos',
      subcategories: [
        'Smartphones',
        'Notebooks',
        'Tablets',
        'Acessórios',
        'Áudio',
        'Câmeras',
      ],
    },
    moda: {
      name: 'Moda',
      subcategories: [
        'Camisetas',
        'Calças',
        'Vestidos',
        'Jaquetas',
        'Sapatos',
        'Acessórios',
      ],
    },
    casa: {
      name: 'Casa e Móveis',
      subcategories: [
        'Móveis',
        'Decoração',
        'Cozinha',
        'Banheiro',
        'Iluminação',
        'Utensílios',
      ],
    },
    esportes: {
      name: 'Esportes',
      subcategories: [
        'Fitness',
        'Outdoor',
        'Bicicletas',
        'Equipamentos',
        'Vestuário',
      ],
    },
    beleza: {
      name: 'Beleza e Saúde',
      subcategories: [
        'Cosméticos',
        'Skincare',
        'Suplementos',
        'Vitaminas',
        'Higiene',
      ],
    },
    livros: {
      name: 'Livros e Educação',
      subcategories: [
        'Livros',
        'E-books',
        'Cursos',
        'Material Escolar',
        'Apostilas',
      ],
    },
    automotivo: {
      name: 'Automotivo',
      subcategories: ['Acessórios', 'Peças', 'Pneus', 'Óleo', 'Ferramentas'],
    },
    servicos: {
      name: 'Serviços',
      subcategories: [
        'Consultoria',
        'Design',
        'Programação',
        'Marketing',
        'Outros',
      ],
    },
  }
}

async function createListingHistory(
  listingId,
  action,
  previousStatus,
  newStatus,
  reason = null,
) {
  const db = await getDb()
  await db.run(
    `INSERT INTO listing_history (listing_id, action, previous_status, new_status, reason)
     VALUES (?, ?, ?, ?, ?)`,
    [listingId, action, previousStatus, newStatus, reason],
  )
}

import { getDb } from '../database/database.js'
