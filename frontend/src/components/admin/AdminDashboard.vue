<template>
  <main class="admin-page">
    <header class="admin-header">
      <div>
        <span class="eyebrow">Mercado Certo / Administração</span>
        <h1>Visão geral</h1>
        <p>Acompanhe usuários, anúncios e receita recorrente.</p>
      </div>
      <button type="button" class="refresh-button" @click="loadDashboard">
        Atualizar
      </button>
    </header>

    <p v-if="error" class="error-message">{{ error }}</p>
    <section v-if="loading" class="state">
      Carregando dados administrativos...
    </section>
    <section v-else class="metric-grid">
      <article class="metric-card">
        <span>Usuários</span><strong>{{ dashboard.users?.total || 0 }}</strong
        ><small>{{ dashboard.users?.active || 0 }} ativos</small>
      </article>
      <article class="metric-card">
        <span>Anúncios ativos</span
        ><strong>{{ dashboard.listings?.active || 0 }}</strong
        ><small>{{ dashboard.listings?.paused || 0 }} pausados</small>
      </article>
      <article class="metric-card">
        <span>Receita mensal</span
        ><strong>R$ {{ formatMoney(dashboard.financial?.mrr?.total) }}</strong
        ><small
          >{{ dashboard.financial?.mrr?.billing_count || 0 }} cobranças</small
        >
      </article>
      <article class="metric-card warning">
        <span>Inadimplentes</span
        ><strong>{{ dashboard.financial?.delinquent?.count || 0 }}</strong
        ><small>vendedores para acompanhar</small>
      </article>
    </section>

    <section v-if="!loading" class="listings-section">
      <div class="section-heading">
        <div>
          <span class="eyebrow">Cobrança por anúncio</span>
          <h2>Anúncios publicados</h2>
          <p>Cada card publicado gera uma cobrança fixa de R$ 100,00/mês.</p>
        </div>
        <strong class="section-total"
          >R$ {{ formatMoney(listingMonthlyTotal) }}/mês</strong
        >
      </div>

      <div v-if="listings.length" class="listing-grid">
        <article
          v-for="listing in listings"
          :key="listing.id"
          class="listing-card"
        >
          <div class="listing-card-top">
            <span
              class="listing-status"
              :class="getListingStatus(listing).class"
            >
              {{ getListingStatus(listing).label }}
            </span>
            <span class="listing-fee">R$ 100,00 / 30 dias</span>
          </div>
          <span v-if="listing.isTestListing" class="test-listing-badge">
            Teste autorizado
          </span>
          <h3>{{ listing.name || 'Anúncio sem título' }}</h3>
          <p class="listing-category">
            {{ listing.category || 'Sem categoria' }}
            <span v-if="listing.subcategory">/ {{ listing.subcategory }}</span>
          </p>
          <dl class="listing-details">
            <div>
              <dt>Vendedor</dt>
              <dd>
                {{ listing.ownerName || listing.supplier || 'Não informado' }}
              </dd>
            </div>
            <div>
              <dt>Preço</dt>
              <dd>R$ {{ formatMoney(listing.price) }}</dd>
            </div>
            <div>
              <dt>Aluguel</dt>
              <dd>
                30 dias · R$ {{ formatMoney(listing.rentalPrice || 100) }}
              </dd>
            </div>
            <div v-if="listing.rentalExpiresAt">
              <dt>Disponível até</dt>
              <dd>{{ formatRentalExpiry(listing.rentalExpiresAt) }}</dd>
            </div>
          </dl>
          <label class="owner-field">
            <span>Atribuir usuário</span>
            <select
              :value="listing.ownerId || ''"
              @change="assignListing(listing, $event.target.value)"
            >
              <option value="">Sem usuário atribuído</option>
              <option
                v-for="person in users"
                :key="person.id"
                :value="person.id"
              >
                {{ person.name }} · {{ person.email }}
              </option>
            </select>
          </label>
          <button
            type="button"
            class="delete-listing-button"
            @click="deleteListing(listing)"
          >
            Excluir card e notificar usuário
          </button>
        </article>
      </div>
      <p v-else class="empty-listings">Nenhum anúncio publicado ainda.</p>
    </section>

    <section v-if="!loading" class="users-section">
      <div class="section-heading">
        <div>
          <span class="eyebrow">Gestão de usuários</span>
          <h2>Usuários cadastrados</h2>
          <p>Veja quantos cards estão atribuídos a cada usuário.</p>
        </div>
      </div>
      <div v-if="users.length" class="users-grid">
        <article v-for="person in users" :key="person.id" class="user-card">
          <div class="user-card-avatar">
            {{ person.name.charAt(0).toUpperCase() }}
          </div>
          <div>
            <h3>{{ person.name }}</h3>
            <p>{{ person.email }}</p>
            <strong>{{ assignedCount(person.id) }} card(s) atribuído(s)</strong>
          </div>
        </article>
      </div>
      <p v-else class="empty-listings">Nenhum usuário cadastrado ainda.</p>
    </section>

    <section class="admin-section">
      <div>
        <h2>Regras administrativas</h2>
        <p>
          Somente usuários com `is_admin` podem acessar os dados financeiros e
          relatórios.
        </p>
      </div>
      <RouterLink to="/plans" class="secondary-link">Ver planos</RouterLink>
    </section>
  </main>
</template>

<script setup>
  import {
    collection,
    doc,
    getDocs,
    updateDoc,
    writeBatch,
  } from 'firebase/firestore'
  import { computed, onMounted, ref } from 'vue'
  import { db } from '../../firebase.js'

  const dashboard = ref({})
  const listings = ref([])
  const users = ref([])
  const loading = ref(true)
  const error = ref('')
  const listingMonthlyFee = 100

  const listingMonthlyTotal = computed(
    () => listings.value.length * listingMonthlyFee,
  )

  function formatMoney(value = 0) {
    return Number(value || 0)
      .toFixed(2)
      .replace('.', ',')
  }

  async function loadDashboard() {
    loading.value = true
    error.value = ''
    try {
      const [productsSnapshot, subscriptionsSnapshot, usersSnapshot] =
        await Promise.all([
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'subscriptions')),
          getDocs(collection(db, 'users')),
        ])

      const products = productsSnapshot.docs.map((item) => item.data())
      listings.value = productsSnapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }))
      const storedUsers = usersSnapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }))
      const inferredUsers = listings.value
        .filter(
          (item) =>
            item.ownerId &&
            !storedUsers.some((person) => person.id === item.ownerId),
        )
        .map((item) => ({
          id: item.ownerId,
          name: item.ownerName || item.supplier || 'Usuário',
          email: item.ownerEmail || 'Email não informado',
        }))
      users.value = [...storedUsers, ...inferredUsers]
      const subscriptions = subscriptionsSnapshot.docs.map((item) =>
        item.data(),
      )
      const activeSubscriptions = subscriptions.filter(
        (item) => item.status === 'active',
      )
      const owners = new Set(
        products.map((item) => item.ownerId).filter(Boolean),
      )
      const monthlyRevenue = products.length * listingMonthlyFee

      dashboard.value = {
        users: {
          total: owners.size,
          active: owners.size,
        },
        listings: {
          active: products.filter((item) => item.isSold !== true).length,
          paused: products.filter((item) => item.status === 'paused').length,
        },
        financial: {
          mrr: {
            total: monthlyRevenue,
            billing_count: products.length,
          },
          delinquent: {
            count: subscriptions.filter(
              (item) =>
                item.status === 'delinquent' || item.status === 'pending',
            ).length,
          },
        },
      }
    } catch (requestError) {
      console.error('Erro ao carregar painel Firestore:', requestError)
      error.value = 'Não foi possível carregar os dados do Firestore.'
    } finally {
      loading.value = false
    }
  }

  function getListingStatus(listing) {
    if (listing.status === 'paused') {
      return { label: 'Pausado', class: 'paused' }
    }
    if (listing.isSold === true) {
      return { label: 'Vendido', class: 'sold' }
    }
    return { label: 'Ativo', class: 'active' }
  }

  function formatRentalExpiry(value) {
    const date = value?.toDate ? value.toDate() : new Date(value)
    return Number.isNaN(date.getTime())
      ? 'Data não informada'
      : date.toLocaleDateString('pt-BR')
  }

  function assignedCount(userId) {
    return listings.value.filter((listing) => listing.ownerId === userId).length
  }

  async function assignListing(listing, userId) {
    const person = users.value.find((item) => item.id === userId)
    const updates = userId
      ? {
          ownerId: userId,
          ownerName: person?.name || null,
          ownerEmail: person?.email || null,
        }
      : { ownerId: null, ownerName: null, ownerEmail: null }

    try {
      await updateDoc(doc(db, 'products', listing.id), updates)
      Object.assign(listing, updates)
    } catch (requestError) {
      console.error('Erro ao atribuir card:', requestError)
      error.value = 'Não foi possível atribuir este card ao usuário.'
    }
  }

  async function deleteListing(listing) {
    const listingName = listing.name || 'Anúncio sem título'
    const reason = window.prompt(
      `Informe o motivo da exclusão de "${listingName}":`,
      'Card excluído pela administração.',
    )

    if (reason === null) return
    if (!window.confirm(`Excluir "${listingName}" e notificar o usuário?`)) {
      return
    }

    try {
      const batch = writeBatch(db)
      batch.delete(doc(db, 'products', listing.id))

      if (listing.ownerId) {
        const notificationRef = doc(collection(db, 'notifications'))
        batch.set(notificationRef, {
          recipientId: listing.ownerId,
          recipientEmail: listing.ownerEmail || null,
          type: 'listing_deleted',
          title: 'Card excluído pela administração',
          message: `O card "${listingName}" foi excluído. Motivo: ${reason}`,
          listingId: listing.id,
          listingName,
          read: false,
          createdAt: new Date().toISOString(),
        })
      }

      await batch.commit()
      listings.value = listings.value.filter((item) => item.id !== listing.id)
    } catch (requestError) {
      console.error('Erro ao excluir card:', requestError)
      error.value = 'Não foi possível excluir o card.'
    }
  }

  onMounted(loadDashboard)
</script>

<style scoped>
  .admin-page {
    max-width: 1180px;
    margin: 0 auto;
    padding: 48px 24px;
    color: #172b22;
  }
  .admin-header {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 30px;
  }
  .eyebrow {
    color: #16804b;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  h1 {
    margin: 8px 0;
    font-size: 2.8rem;
  }
  .admin-header p,
  .admin-section p {
    color: #64766b;
  }
  .refresh-button,
  .secondary-link {
    padding: 11px 16px;
    border: 1px solid #c9dbcf;
    border-radius: 6px;
    background: #fff;
    color: #18352a;
    cursor: pointer;
    font-weight: 700;
    text-decoration: none;
  }
  .metric-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
  .metric-card {
    display: grid;
    gap: 8px;
    padding: 22px;
    border: 1px solid #dce8df;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 12px 28px rgba(27, 68, 45, 0.08);
  }
  .metric-card span {
    color: #64766b;
    font-size: 0.9rem;
  }
  .metric-card strong {
    font-size: 2rem;
  }
  .metric-card small {
    color: #16804b;
  }
  .metric-card.warning strong {
    color: #b45f25;
  }
  .admin-section {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    margin-top: 24px;
    padding: 24px;
    border-top: 1px solid #dce8df;
  }
  .listings-section {
    margin-top: 32px;
  }
  .section-heading {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 16px;
  }
  .section-heading h2 {
    margin: 8px 0 4px;
  }
  .section-heading p {
    margin: 0;
    color: #64766b;
  }
  .section-total {
    color: #16804b;
    font-size: 1.25rem;
    white-space: nowrap;
  }
  .listing-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }
  .listing-card {
    display: grid;
    gap: 12px;
    padding: 20px;
    border: 1px solid #dce8df;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 12px 28px rgba(27, 68, 45, 0.08);
  }
  .listing-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .listing-status,
  .listing-fee {
    font-size: 0.78rem;
    font-weight: 800;
  }
  .listing-status {
    color: #16804b;
  }
  .listing-status.paused {
    color: #b45f25;
  }
  .listing-status.sold {
    color: #64766b;
  }
  .listing-fee {
    color: #18352a;
  }
  .test-listing-badge {
    width: fit-content;
    padding: 4px 8px;
    border-radius: 999px;
    background: #fff4d6;
    color: #8a5a00;
    font-size: 0.72rem;
    font-weight: 800;
  }
  .listing-card h3 {
    margin: 0;
    color: #172b22;
    font-size: 1.15rem;
  }
  .listing-category {
    margin: -6px 0 0;
    color: #64766b;
    font-size: 0.9rem;
  }
  .listing-details {
    display: grid;
    gap: 8px;
    margin: 0;
  }
  .listing-details div {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    border-top: 1px solid #edf3ee;
    padding-top: 8px;
  }
  .listing-details dt {
    color: #64766b;
  }
  .listing-details dd {
    margin: 0;
    color: #18352a;
    font-weight: 700;
    text-align: right;
  }
  .empty-listings {
    padding: 20px;
    border: 1px dashed #c9dbcf;
    color: #64766b;
  }
  .owner-field {
    display: grid;
    gap: 6px;
    margin-top: 4px;
    color: #64766b;
    font-size: 0.82rem;
    font-weight: 700;
  }
  .owner-field select {
    width: 100%;
    min-width: 0;
    padding: 9px 10px;
    border: 1px solid #c9dbcf;
    border-radius: 6px;
    background: #f8fbf9;
    color: #18352a;
    font: inherit;
  }
  .users-section {
    margin-top: 36px;
  }
  .users-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }
  .user-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 18px;
    border: 1px solid #dce8df;
    border-radius: 8px;
    background: #fff;
  }
  .user-card-avatar {
    display: grid;
    flex: 0 0 42px;
    width: 42px;
    height: 42px;
    place-items: center;
    border-radius: 50%;
    background: #dff2e5;
    color: #16804b;
    font-size: 1.2rem;
    font-weight: 800;
  }
  .user-card h3 {
    margin: 0 0 3px;
    color: #18352a;
  }
  .user-card p {
    margin: 0 0 6px;
    color: #64766b;
    font-size: 0.88rem;
  }
  .user-card strong {
    color: #16804b;
    font-size: 0.82rem;
  }
  .admin-section h2 {
    margin: 0 0 8px;
  }
  .error-message,
  .state {
    padding: 16px;
    border-radius: 6px;
    background: #fff3ed;
    color: #9a4520;
  }
  @media (max-width: 820px) {
    .metric-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .admin-header,
    .admin-section,
    .section-heading {
      align-items: flex-start;
      flex-direction: column;
    }
    .listing-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .users-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @media (max-width: 480px) {
    .metric-grid {
      grid-template-columns: 1fr;
    }
    .listing-grid {
      grid-template-columns: 1fr;
    }
    .users-grid {
      grid-template-columns: 1fr;
    }
    h1 {
      font-size: 2.2rem;
    }
  }
</style>
