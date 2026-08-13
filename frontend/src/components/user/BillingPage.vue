<template>
  <div class="billing-page">
    <div class="page-header">
      <h1>Cobrança e Pagamentos</h1>
      <p>Gerencie suas cobranças mensais</p>
    </div>

    <div class="billing-info">
      <div class="info-card active">
        <h3>Cobrança Ativa</h3>
        <div v-if="activeBilling" class="billing-details">
          <div class="detail-row">
            <span>Período:</span>
            <strong>{{ activeBilling.billing_month }}</strong>
          </div>
          <div class="detail-row">
            <span>Anúncios ativos:</span>
            <strong>{{ activeBilling.active_listings_count }}</strong>
          </div>
          <div class="detail-row">
            <span>Valor mensal:</span>
            <strong>R$ {{ activeBilling.amount.toFixed(2) }}</strong>
          </div>
          <div class="detail-row">
            <span>Vencimento:</span>
            <strong>{{
              new Date(activeBilling.due_date).toLocaleDateString('pt-BR')
            }}</strong>
          </div>
          <div class="detail-row">
            <span>Status:</span>
            <span class="status" :class="activeBilling.payment_status">
              {{
                activeBilling.payment_status === 'active'
                  ? '✅ Pago'
                  : '⏳ Pendente'
              }}
            </span>
          </div>
        </div>
        <div v-else class="empty">
          <p>Nenhuma cobrança ativa</p>
        </div>
      </div>

      <div class="info-card warning" v-if="pendingBilling">
        <h3>⚠️ Pagamento Pendente</h3>
        <div class="billing-details">
          <div class="detail-row">
            <span>Valor devido:</span>
            <strong>R$ {{ pendingBilling.amount.toFixed(2) }}</strong>
          </div>
          <div class="detail-row">
            <span>Vencimento:</span>
            <strong>{{
              new Date(pendingBilling.due_date).toLocaleDateString('pt-BR')
            }}</strong>
          </div>
          <div class="detail-row" v-if="pendingBilling.grace_period_end_date">
            <span>Período de graça até:</span>
            <strong>{{
              new Date(pendingBilling.grace_period_end_date).toLocaleDateString(
                'pt-BR',
              )
            }}</strong>
          </div>
          <button class="btn btn-pay" @click="processPayment">
            💳 Pagar Agora
          </button>
        </div>
      </div>
    </div>

    <div class="history-section">
      <h2>Histórico de Pagamentos</h2>
      <div v-if="history.length === 0" class="empty">
        <p>Nenhum pagamento registrado</p>
      </div>
      <table v-else class="history-table">
        <thead>
          <tr>
            <th>Período</th>
            <th>Anúncios</th>
            <th>Valor</th>
            <th>Vencimento</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in history" :key="item.id">
            <td>{{ item.billing_month }}</td>
            <td>{{ item.active_listings_count }}</td>
            <td>R$ {{ item.amount.toFixed(2) }}</td>
            <td>{{ new Date(item.due_date).toLocaleDateString('pt-BR') }}</td>
            <td>
              <span class="status" :class="item.payment_status">
                {{
                  item.payment_status === 'active' ? '✅ Pago' : '⏳ Pendente'
                }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="info-box">
      <h3>📋 Como funciona a cobrança?</h3>
      <ul>
        <li><strong>R$ 100,00</strong> por anúncio ativo/mês</li>
        <li>Cobrança realizada mensalmente</li>
        <li>Período de graça: <strong>30 dias</strong> após vencimento</li>
        <li>
          Após 30 dias: seus anúncios serão
          <strong>pausados automaticamente</strong>
        </li>
        <li><strong>Sem comissão</strong> sobre vendas</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import api from '../../utils/api.js'

  const activeBilling = ref(null)
  const pendingBilling = ref(null)
  const history = ref([])

  const loadData = async () => {
    try {
      const [activeRes, pendingRes, historyRes] = await Promise.all([
        api.get('/billing/active').catch(() => null),
        api.get('/billing/pending').catch(() => null),
        api.get('/billing/history'),
      ])

      if (activeRes) activeBilling.value = activeRes.data
      if (pendingRes) pendingBilling.value = pendingRes.data
      history.value = historyRes.data.history || []
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  const processPayment = async () => {
    try {
      // TODO: Integrar com gateway de pagamento
      alert('Redirecionando para gateway de pagamento...')
    } catch (error) {
      console.error('Erro ao processar pagamento:', error)
    }
  }

  onMounted(() => {
    loadData()
  })
</script>

<style scoped>
  .billing-page {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
  }

  .page-header {
    margin-bottom: 30px;
  }

  .page-header h1 {
    margin: 0;
    font-size: 28px;
  }

  .page-header p {
    color: #666;
    margin: 8px 0 0 0;
  }

  .billing-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
    margin-bottom: 30px;
  }

  .info-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    border-left: 4px solid #1971c2;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .info-card.warning {
    border-left-color: #ff6b6b;
    background: #fff5f5;
  }

  .info-card h3 {
    margin: 0 0 16px 0;
    font-size: 18px;
  }

  .billing-details {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #eee;
  }

  .detail-row span {
    color: #666;
  }

  .detail-row strong {
    color: #333;
    font-weight: 600;
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

  .status.pending {
    background: #fff3cd;
    color: #856404;
  }

  .empty {
    text-align: center;
    padding: 40px 20px;
    color: #999;
  }

  .btn-pay {
    width: 100%;
    margin-top: 12px;
    padding: 10px;
    background: #2d8c2d;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
  }

  .btn-pay:hover {
    background: #257325;
  }

  .history-section {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 30px;
  }

  .history-section h2 {
    margin: 0 0 20px 0;
  }

  .history-table {
    width: 100%;
    border-collapse: collapse;
  }

  .history-table th {
    background: #f9f9f9;
    padding: 12px;
    text-align: left;
    font-weight: 600;
    border-bottom: 2px solid #eee;
    color: #666;
  }

  .history-table td {
    padding: 12px;
    border-bottom: 1px solid #eee;
  }

  .history-table tbody tr:hover {
    background: #f9f9f9;
  }

  .info-box {
    background: #f0f8ff;
    padding: 20px;
    border-radius: 8px;
    border-left: 4px solid #1971c2;
  }

  .info-box h3 {
    margin: 0 0 12px 0;
    color: #1971c2;
  }

  .info-box ul {
    margin: 0;
    padding-left: 20px;
  }

  .info-box li {
    margin: 6px 0;
    color: #333;
    line-height: 1.6;
  }
</style>
