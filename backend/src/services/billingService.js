/**
 * Billing Service
 * Serviço de cobrança e pagamentos
 * Implementa toda a lógica de negócio de faturamento
 */

import {
  createBilling,
  getBillingById,
  getOverdueListings,
  getSellerActiveBilling,
  getSellerPendingBilling,
  GRACE_PERIOD_DAYS,
  markNotified,
  MONTHLY_LISTING_PRICE,
  setGracePeriod,
  updateBillingStatus,
} from '../models/billingModel.js'
import {
  getSellerListings,
  pauseListing,
  reactivateListing,
} from '../models/listingModel.js'
import { createNotification } from '../models/notificationModel.js'

/**
 * Gera cobrança mensal para um vendedor
 * Baseado no número de anúncios ativos
 */
export async function generateMonthlySelling(sellerId) {
  const listings = await getSellerListings(sellerId, 'active')
  const activeListingsCount = listings.length

  if (activeListingsCount === 0) {
    return null
  }

  // Data de vencimento: 1º dia do próximo mês
  const today = new Date()
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
  const dueDate = nextMonth.toISOString().split('T')[0]

  const billing = await createBilling({
    seller_id: sellerId,
    active_listings_count: activeListingsCount,
    due_date: dueDate,
  })

  return billing
}

/**
 * Processa pagamento de cobrança
 */
export async function processPayment(billingId, paymentData) {
  const billing = await getBillingById(billingId)

  if (!billing) {
    throw new Error('Cobrança não encontrada')
  }

  if (billing.payment_status === 'active') {
    throw new Error('Cobrança já foi paga')
  }

  // Simulando processamento de pagamento
  // Em produção, integrar com gateway de pagamento (Stripe, PagSeguro, etc)

  await updateBillingStatus(billingId, 'active', {
    ...paymentData,
    payment_date: new Date().toISOString(),
  })

  // Criar notificação para vendedor
  await createNotification({
    user_id: billing.seller_id,
    type: 'payment_confirmed',
    title: 'Pagamento confirmado',
    message: `Pagamento de R$ ${billing.amount.toFixed(2)} foi processado com sucesso.`,
    related_id: billingId,
  })

  return billing
}

/**
 * Marca cobrança como não paga e inicia período de graça
 */
export async function markPaymentFailed(billingId) {
  const billing = await getBillingById(billingId)

  if (!billing) {
    throw new Error('Cobrança não encontrada')
  }

  if (billing.payment_status === 'active') {
    return billing // Já foi paga
  }

  await setGracePeriod(billingId)
  await markNotified(billingId)

  // Notificar vendedor sobre pendência
  await createNotification({
    user_id: billing.seller_id,
    type: 'payment_overdue',
    title: 'Pagamento pendente',
    message: `Você tem ${GRACE_PERIOD_DAYS} dias para regularizar o pagamento de R$ ${billing.amount.toFixed(2)}. Após este período, seus anúncios serão pausados.`,
    related_id: billingId,
  })

  return billing
}

/**
 * Pausa anúncios de vendedores com cobrança vencida
 * Executar diariamente via cron job
 */
export async function pauseOverdueListings() {
  const overdueListings = await getOverdueListings()

  for (const listing of overdueListings) {
    await pauseListing(
      listing.id,
      'Anúncio pausado automaticamente por falta de pagamento',
    )

    // Notificar vendedor
    await createNotification({
      user_id: listing.seller_id,
      type: 'listing_paused',
      title: 'Anúncio pausado',
      message: `Seu anúncio "${listing.title}" foi pausado automaticamente por falta de pagamento.`,
      related_id: listing.id,
    })
  }

  return overdueListings.length
}

/**
 * Recarga anúncios após pagamento regularizado
 */
export async function reactivateListingsAfterPayment(sellerId) {
  const listings = await getSellerListings(sellerId, 'paused')

  for (const listing of listings) {
    if (listing.paused_reason && listing.paused_reason.includes('pagamento')) {
      await reactivateListing(listing.id)
    }
  }

  return listings.length
}

/**
 * Calcula cobrança mensal para um vendedor
 */
export function calculateMonthlyCost(activeListingsCount) {
  return activeListingsCount * MONTHLY_LISTING_PRICE
}

/**
 * Gera resumo financeiro do vendedor
 */
export async function getSellerFinancialSummary(sellerId) {
  const activeBilling = await getSellerActiveBilling(sellerId)
  const pendingBilling = await getSellerPendingBilling(sellerId)

  return {
    current_active_cost: activeBilling ? activeBilling.amount : 0,
    pending_payment: pendingBilling
      ? {
          amount: pendingBilling.amount,
          due_date: pendingBilling.due_date,
          days_until_pause: pendingBilling.grace_period_end_date
            ? Math.max(
                0,
                Math.ceil(
                  (new Date(pendingBilling.grace_period_end_date) -
                    new Date()) /
                    (1000 * 60 * 60 * 24),
                ),
              )
            : GRACE_PERIOD_DAYS,
        }
      : null,
  }
}
