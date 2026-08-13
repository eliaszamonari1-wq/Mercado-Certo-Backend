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
  import { collection, getDocs } from 'firebase/firestore'
  import { onMounted, ref } from 'vue'
  import { db } from '../../firebase.js'

  const dashboard = ref({})
  const loading = ref(true)
  const error = ref('')

  function formatMoney(value = 0) {
    return Number(value || 0)
      .toFixed(2)
      .replace('.', ',')
  }

  async function loadDashboard() {
    loading.value = true
    error.value = ''
    try {
      const [productsSnapshot, subscriptionsSnapshot] = await Promise.all([
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'subscriptions')),
      ])

      const products = productsSnapshot.docs.map((item) => item.data())
      const subscriptions = subscriptionsSnapshot.docs.map((item) =>
        item.data(),
      )
      const activeSubscriptions = subscriptions.filter(
        (item) => item.status === 'active',
      )
      const owners = new Set(
        products.map((item) => item.ownerId).filter(Boolean),
      )
      const monthlyRevenue = activeSubscriptions.reduce(
        (total, item) => total + Number(item.amount || item.price || 0),
        0,
      )

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
            billing_count: activeSubscriptions.length,
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
    .admin-section {
      align-items: flex-start;
      flex-direction: column;
    }
  }
  @media (max-width: 480px) {
    .metric-grid {
      grid-template-columns: 1fr;
    }
    h1 {
      font-size: 2.2rem;
    }
  }
</style>
