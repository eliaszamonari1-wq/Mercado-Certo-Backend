<template>
  <div class="admin-shell">
    <header class="admin-navbar">
      <RouterLink to="/dashboard" class="admin-brand">Mercado Certo</RouterLink>
      <div class="admin-navbar-actions">
        <span class="admin-current-section">{{ activeSection }}</span>
        <RouterLink to="/dashboard" class="back-link"
          >Voltar ao site</RouterLink
        >
      </div>
    </header>

    <aside class="admin-sidebar">
      <span class="sidebar-label">Gestão</span>
      <a href="#overview" class="sidebar-link">Visão geral</a>
      <a href="#listings" class="sidebar-link">Anúncios e cobrança</a>
      <a href="#users" class="sidebar-link">Usuários</a>
      <a href="#operations" class="sidebar-link">Operações</a>
      <a href="#settings-panel" class="sidebar-link">Configurações</a>
    </aside>

    <main class="admin-page">
      <header id="overview" class="admin-header">
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

      <section id="listings" v-if="!loading" class="listings-section">
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
              <span v-if="listing.subcategory"
                >/ {{ listing.subcategory }}</span
              >
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

      <section id="users" v-if="!loading" class="users-section">
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
              <strong
                >{{ assignedCount(person.id) }} card(s) atribuído(s)</strong
              >
            </div>
          </article>
        </div>
        <p v-else class="empty-listings">Nenhum usuário cadastrado ainda.</p>
      </section>

      <section id="operations" class="admin-section admin-link-section">
        <div>
          <span class="eyebrow">Operação</span>
          <h2>Atalhos operacionais</h2>
          <p>Indicadores e acessos para a rotina da plataforma.</p>
        </div>
        <div class="admin-info-grid">
          <article class="admin-info-card">
            <span>Vendedores</span>
            <strong>{{ dashboard.users?.total || 0 }}</strong>
            <small>usuários com operação</small>
            <RouterLink to="/seller" class="admin-action-link"
              >Abrir painel</RouterLink
            >
          </article>
          <article class="admin-info-card">
            <span>Cobranças</span>
            <strong
              >R$ {{ formatMoney(dashboard.financial?.mrr?.total) }}</strong
            >
            <small>recorrência prevista</small>
            <RouterLink to="/billing" class="admin-action-link"
              >Ver cobrança</RouterLink
            >
          </article>
          <article class="admin-info-card">
            <span>Planos</span>
            <strong>30 dias</strong>
            <small>ciclo de aluguel por card</small>
            <RouterLink to="/plans" class="admin-action-link"
              >Gerenciar planos</RouterLink
            >
          </article>
        </div>
      </section>

      <section id="settings-panel" class="admin-section admin-link-section">
        <div>
          <span class="eyebrow">Configurações</span>
          <h2>Preferências da conta</h2>
          <p>Controle sua conta e as preferências administrativas.</p>
        </div>
        <article class="admin-info-card settings-card">
          <span>Perfil administrativo</span>
          <strong>Conta e segurança</strong>
          <small>Nome, senha e preferências de acesso</small>
          <RouterLink to="/settings" class="admin-action-link"
            >⚙️ Abrir configurações</RouterLink
          >
        </article>
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
  </div>
</template>

<script setup>
  import {
    collection,
    doc,
    getDocs,
    updateDoc,
    writeBatch,
  } from 'firebase/firestore'
  import { computed, onMounted, onUnmounted, ref } from 'vue'
  import { db } from '../../firebase.js'

  const dashboard = ref({})
  const listings = ref([])
  const users = ref([])
  const loading = ref(true)
  const error = ref('')
  const listingMonthlyFee = 100
  const activeSection = ref('Visão geral')

  const sectionLabels = {
    overview: 'Visão geral',
    listings: 'Anúncios e cobrança',
    users: 'Usuários',
    operations: 'Operações',
    'settings-panel': 'Configurações',
  }

  const listingMonthlyTotal = computed(
    () => listings.value.length * listingMonthlyFee,
  )

  function formatMoney(value = 0) {
    return Number(value || 0)
      .toFixed(2)
      .replace('.', ',')
  }

  function syncActiveSection() {
    const key = window.location.hash.replace('#', '') || 'overview'
    activeSection.value = sectionLabels[key] || 'Visão geral'
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

  onMounted(() => {
    syncActiveSection()
    window.addEventListener('hashchange', syncActiveSection)
    loadDashboard()
  })

  onUnmounted(() => {
    window.removeEventListener('hashchange', syncActiveSection)
  })
</script>

<style scoped>
  .admin-shell {
    min-height: 100vh;
    padding-top: 56px;
    padding-left: 188px;
    background: #f4fbf5;
  }

  .admin-navbar {
    position: fixed;
    z-index: 10;
    top: 0;
    right: 0;
    left: 0;
    display: flex;
    height: 56px;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    border-bottom: 1px solid #dce8df;
    background: rgba(255, 255, 255, 0.96);
    backdrop-filter: blur(14px);
  }

  .admin-brand {
    color: #18352a;
    font-size: 1rem;
    font-weight: 900;
    text-decoration: none;
  }

  .admin-navbar-actions {
    display: flex;
    align-items: center;
    gap: 16px;
    color: #64766b;
    font-size: 0.85rem;
    font-weight: 700;
  }

  .admin-current-section {
    color: #16804b;
    font-size: 0.82rem;
    font-weight: 800;
  }

  .back-link {
    color: #16804b;
    text-decoration: none;
  }

  .admin-sidebar {
    position: fixed;
    z-index: 9;
    top: 56px;
    bottom: 0;
    left: 0;
    display: flex;
    width: 188px;
    flex-direction: column;
    gap: 3px;
    padding: 16px 10px;
    border-right: 1px solid #dce8df;
    background: #fff;
  }

  .sidebar-label {
    margin: 7px 8px 3px;
    color: #8a9a90;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .secondary-label {
    margin-top: 16px;
  }

  .sidebar-link {
    padding: 8px 10px;
    border-radius: 8px;
    color: #365344;
    font-size: 0.82rem;
    font-weight: 700;
    text-decoration: none;
  }

  .sidebar-link:hover,
  .sidebar-link.router-link-active {
    background: #eaf7ee;
    color: #16804b;
  }

  .admin-page {
    width: 100%;
    min-width: 0;
    max-width: 1180px;
    margin: 0 auto;
    padding: 28px 24px 44px;
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
    align-self: center;
    white-space: nowrap;
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
  .admin-link-section {
    display: block;
    margin-top: 20px;
    padding: 18px 0;
  }
  .admin-link-section h2 {
    margin: 5px 0;
  }
  .admin-link-section p {
    margin: 0;
  }
  .admin-info-grid {
    display: flex;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr));
    gap: 12px;
    margin-top: 14px;
  }

  .admin-info-card {
    display: grid;
    min-width: 0;
    gap: 5px;
    padding: 15px;
    border: 1px solid #dce8df;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 8px 20px rgba(27, 68, 45, 0.06);
  }

  .admin-info-card span,
  .admin-info-card small {
    color: #64766b;
    font-size: 0.78rem;
  }

  .admin-info-card strong {
    min-width: 0;
    overflow-wrap: anywhere;
    color: #18352a;
    font-size: 1.15rem;
  }

  .admin-info-card .admin-action-link {
    justify-self: start;
    margin-top: 7px;
  }
  .admin-action-link {
    display: inline-flex;
    min-height: 36px;
    align-items: center;
    padding: 8px 11px;
    border: 1px solid #c9dbcf;
    border-radius: 7px;
    color: #18352a;
    font-size: 0.82rem;
    font-weight: 800;
    text-decoration: none;
  }
  .admin-action-link:hover {
    background: #eaf7ee;
    color: #16804b;
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
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
    gap: 16px;
  }
  .listing-card {
    min-width: 0;
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
    min-width: 0;
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
    min-width: 0;
    overflow-wrap: anywhere;
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

  .delete-listing-button {
    width: 100%;
    min-width: 0;
    overflow-wrap: anywhere;
    padding: 9px 10px;
    border: 1px solid #e7caca;
    border-radius: 6px;
    background: #fff7f7;
    color: #a33b3b;
    cursor: pointer;
    font: inherit;
    font-size: 0.82rem;
    font-weight: 800;
  }
  .users-section {
    margin-top: 36px;
  }
  .users-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr));
    gap: 16px;
  }
  .user-card {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 18px;
    border: 1px solid #dce8df;
    border-radius: 8px;
    background: #fff;
  }
  .user-card > div:last-child {
    min-width: 0;
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
    overflow-wrap: anywhere;
  }
  .user-card p {
    margin: 0 0 6px;
    color: #64766b;
    font-size: 0.88rem;
    overflow-wrap: anywhere;
  }
  .user-card strong {
    color: #16804b;
    font-size: 0.82rem;
    overflow-wrap: anywhere;
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
    .admin-shell {
      padding-left: 0;
    }

    .admin-sidebar {
      position: static;
      width: auto;
      height: auto;
      flex-direction: row;
      align-items: center;
      overflow-x: auto;
      padding: 10px 14px;
      border-right: 0;
      border-bottom: 1px solid #dce8df;
    }

    .sidebar-label,
    .secondary-label {
      display: none;
    }

    .sidebar-link {
      flex: 0 0 auto;
      white-space: nowrap;
    }

    .metric-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .admin-header,
    .admin-section,
    .section-heading {
      align-items: flex-start;
      flex-direction: column;
    }
    .admin-info-grid {
      grid-template-columns: 1fr;
    }
    .listing-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .users-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @media (max-width: 480px) {
    .admin-navbar {
      padding: 0 16px;
    }

    .admin-navbar-actions > span {
      display: none;
    }

    .admin-page {
      padding: 24px 16px 40px;
    }

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
