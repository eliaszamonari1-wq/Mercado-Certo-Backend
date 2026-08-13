<template>
  <div class="seller-dashboard">
    <div class="dashboard-header">
      <h1>Painel do Vendedor</h1>
      <p>Gerencie seus anúncios e pagamentos</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <h3>📊 Anúncios Ativos</h3>
        <span class="stat-value">{{ stats.active_listings || 0 }}</span>
        <p>Anúncios publicados e visíveis</p>
      </div>

      <div class="stat-card alert">
        <h3>⏸️ Anúncios Pausados</h3>
        <span class="stat-value">{{ stats.paused_listings || 0 }}</span>
        <p>Pausados por falta de pagamento</p>
      </div>

      <div class="stat-card">
        <h3>👁️ Visualizações</h3>
        <span class="stat-value">{{ stats.total_views || 0 }}</span>
        <p>Total de visualizações</p>
      </div>

      <div class="stat-card">
        <h3>💬 Contatos</h3>
        <span class="stat-value">{{ stats.total_contacts || 0 }}</span>
        <p>Mensagens de compradores</p>
      </div>
    </div>

    <div class="financial-section">
      <div class="financial-card">
        <h3>💰 Cobrança Mensal</h3>
        <div class="financial-info">
          <div class="info-item">
            <span class="label">Valor mensal:</span>
            <span class="value"
              >R$
              {{
                financialSummary.current_active_cost?.toFixed(2) || '0,00'
              }}</span
            >
          </div>
          <p class="note">
            Baseado em {{ stats.active_listings || 0 }} anúncio(s) × R$
            100,00/mês
          </p>
        </div>
      </div>

      <div class="financial-card alert" v-if="financialSummary.pending_payment">
        <h3>⚠️ Pagamento Pendente</h3>
        <div class="financial-info">
          <div class="info-item">
            <span class="label">Valor devido:</span>
            <span class="value"
              >R$
              {{
                financialSummary.pending_payment.amount?.toFixed(2) || '0,00'
              }}</span
            >
          </div>
          <div class="info-item">
            <span class="label">Vencimento:</span>
            <span class="value">{{
              new Date(
                financialSummary.pending_payment.due_date,
              ).toLocaleDateString('pt-BR')
            }}</span>
          </div>
          <div
            class="info-item"
            v-if="financialSummary.pending_payment.days_until_pause !== null"
          >
            <span class="label">Dias até pausa:</span>
            <span class="value danger">{{
              financialSummary.pending_payment.days_until_pause
            }}</span>
          </div>
          <button class="btn btn-danger" @click="goToBilling">
            Pagar Agora
          </button>
        </div>
      </div>
    </div>

    <div class="listings-section">
      <div class="section-header">
        <h2>Meus Anúncios</h2>
        <button class="btn btn-primary" @click="goToCreateListing">
          + Novo Anúncio
        </button>
      </div>

      <div class="listings-tabs">
        <button
          v-for="tab in ['active', 'paused', 'inactive']"
          :key="tab"
          :class="{ active: activeTab === tab }"
          @click="activeTab = tab"
          class="tab"
        >
          {{ getTabLabel(tab) }}
        </button>
      </div>

      <div class="listings-list">
        <div v-if="filteredListings.length === 0" class="empty-state">
          <p>
            Nenhum anúncio {{ getTabLabel(activeTab).toLowerCase() }} encontrado
          </p>
        </div>

        <div
          v-for="listing in filteredListings"
          :key="listing.id"
          class="listing-item"
        >
          <div class="listing-thumb">
            <img
              :src="
                listing.images?.[0] || 'https://via.placeholder.com/100x100'
              "
            />
          </div>
          <div class="listing-info">
            <h4>{{ listing.title }}</h4>
            <p>R$ {{ listing.price.toFixed(2) }}</p>
            <p class="status" :class="listing.status">{{ listing.status }}</p>
          </div>
          <div class="listing-actions">
            <button class="btn btn-sm" @click="goToEditListing(listing.id)">
              Editar
            </button>
            <button class="btn btn-sm" @click="goToListingDetail(listing.id)">
              Ver
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import api from '../../utils/api.js'

  const router = useRouter()
  const activeTab = ref('active')
  const listings = ref([])
  const stats = ref({})
  const financialSummary = ref({})

  const filteredListings = computed(() => {
    return listings.value.filter((l) => l.status === activeTab.value)
  })

  const getTabLabel = (status) => {
    const labels = {
      active: 'Ativos',
      paused: 'Pausados',
      inactive: 'Inativos',
    }
    return labels[status] || status
  }

  const loadData = async () => {
    try {
      const [listingsRes, summaryRes] = await Promise.all([
        api.get('/listings/seller/my-listings'),
        api.get('/billing/summary'),
      ])

      listings.value = listingsRes.data.listings
      financialSummary.value = summaryRes.data

      // Calcular stats
      stats.value = {
        active_listings: listings.value.filter((l) => l.status === 'active')
          .length,
        paused_listings: listings.value.filter((l) => l.status === 'paused')
          .length,
        total_views: listings.value.reduce(
          (sum, l) => sum + (l.views_count || 0),
          0,
        ),
        total_contacts: listings.value.reduce(
          (sum, l) => sum + (l.contacts_count || 0),
          0,
        ),
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  const goToCreateListing = () => {
    router.push('/create-listing')
  }

  const goToEditListing = (id) => {
    router.push(`/edit-listing/${id}`)
  }

  const goToListingDetail = (id) => {
    router.push(`/listing/${id}`)
  }

  const goToBilling = () => {
    router.push('/billing')
  }

  onMounted(() => {
    loadData()
  })
</script>

<style scoped>
  .seller-dashboard {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  .dashboard-header {
    margin-bottom: 30px;
  }

  .dashboard-header h1 {
    margin: 0;
    font-size: 28px;
    color: #333;
  }

  .dashboard-header p {
    color: #666;
    margin: 8px 0 0 0;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
    margin-bottom: 30px;
  }

  .stat-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    border-left: 4px solid #1971c2;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .stat-card.alert {
    border-left-color: #ff6b6b;
  }

  .stat-card h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    color: #666;
  }

  .stat-value {
    display: block;
    font-size: 36px;
    font-weight: bold;
    color: #1971c2;
    margin-bottom: 8px;
  }

  .stat-card.alert .stat-value {
    color: #ff6b6b;
  }

  .stat-card p {
    margin: 0;
    font-size: 13px;
    color: #999;
  }

  .financial-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
    margin-bottom: 30px;
  }

  .financial-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    border-left: 4px solid #1971c2;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .financial-card.alert {
    border-left-color: #ff6b6b;
    background: #fff5f5;
  }

  .financial-card h3 {
    margin: 0 0 16px 0;
    font-size: 18px;
  }

  .financial-info .info-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #eee;
  }

  .info-item .label {
    color: #666;
  }

  .info-item .value {
    font-weight: bold;
    color: #2d8c2d;
  }

  .info-item .value.danger {
    color: #ff6b6b;
  }

  .note {
    font-size: 12px;
    color: #999;
    margin-top: 12px;
  }

  .btn-danger {
    width: 100%;
    margin-top: 12px;
    background: #ff6b6b;
    color: white;
    border: none;
    padding: 8px;
    border-radius: 4px;
    cursor: pointer;
  }

  .btn-danger:hover {
    background: #ff5252;
  }

  .listings-section {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .section-header h2 {
    margin: 0;
  }

  .btn-primary {
    background: #1971c2;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
  }

  .btn-primary:hover {
    background: #1566a8;
  }

  .listings-tabs {
    display: flex;
    gap: 0;
    margin-bottom: 20px;
    border-bottom: 2px solid #eee;
  }

  .tab {
    padding: 12px 16px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    color: #666;
    font-weight: 600;
    transition: all 0.2s;
  }

  .tab.active {
    color: #1971c2;
    border-bottom-color: #1971c2;
  }

  .tab:hover {
    color: #1971c2;
  }

  .listings-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #999;
  }

  .listing-item {
    display: flex;
    gap: 16px;
    padding: 16px;
    border: 1px solid #eee;
    border-radius: 4px;
    align-items: center;
  }

  .listing-thumb {
    width: 100px;
    height: 100px;
    flex-shrink: 0;
    border-radius: 4px;
    overflow: hidden;
    background: #f0f0f0;
  }

  .listing-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .listing-info {
    flex: 1;
  }

  .listing-info h4 {
    margin: 0 0 8px 0;
    color: #333;
  }

  .listing-info p {
    margin: 4px 0;
    color: #666;
    font-size: 14px;
  }

  .status {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
  }

  .status.active {
    background: #d4edda;
    color: #155724;
  }

  .status.paused {
    background: #fff3cd;
    color: #856404;
  }

  .status.inactive {
    background: #f8d7da;
    color: #721c24;
  }

  .listing-actions {
    display: flex;
    gap: 8px;
  }

  .btn-sm {
    padding: 6px 12px;
    background: #f0f0f0;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
  }

  .btn-sm:hover {
    background: #e0e0e0;
  }
</style>
