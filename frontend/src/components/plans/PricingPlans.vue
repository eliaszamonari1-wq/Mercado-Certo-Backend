<template>
  <main class="plans-page">
    <header class="plans-header">
      <span class="eyebrow">Mercado Certo</span>
      <h1>Escolha como vender</h1>
      <p>Planos claros para publicar produtos e acompanhar seu negócio.</p>
    </header>

    <section class="plans-grid" aria-label="Planos disponíveis">
      <article
        v-for="plan in plans"
        :key="plan.id"
        class="plan-card"
        :class="{ featured: plan.featured }"
      >
        <span v-if="plan.featured" class="plan-badge">Mais escolhido</span>
        <h2>{{ plan.name }}</h2>
        <p class="plan-description">{{ plan.description }}</p>
        <div class="plan-price">
          <strong>{{ plan.price }}</strong>
          <span>{{ plan.period }}</span>
        </div>
        <ul>
          <li v-for="feature in plan.features" :key="feature">{{ feature }}</li>
        </ul>
        <button type="button" class="plan-action" @click="selectPlan(plan)">
          {{ plan.action }}
        </button>
      </article>
    </section>

    <p class="pricing-note">
      O plano vendedor cobra R$ 100,00 por anúncio ativo ao mês, sem comissão
      sobre as vendas.
    </p>
  </main>
</template>

<script setup>
  import { useRouter } from 'vue-router'

  const router = useRouter()

  const plans = [
    {
      id: 'buyer',
      name: 'Comprar',
      description: 'Para quem quer encontrar ofertas e falar com vendedores.',
      price: 'Grátis',
      period: 'para sempre',
      features: [
        'Navegação no catálogo',
        'Contato direto com vendedores',
        'Favoritos e histórico',
      ],
      action: 'Começar a comprar',
    },
    {
      id: 'seller',
      name: 'Vendedor',
      description: 'Para publicar seus produtos com liberdade comercial.',
      price: 'R$ 100',
      period: 'por anúncio / mês',
      features: [
        'Sem comissão sobre vendas',
        'Chat com compradores',
        'Links para outras lojas',
        '30 dias de tolerância para pagamento',
      ],
      action: 'Quero vender',
      featured: true,
    },
    {
      id: 'business',
      name: 'Negócio',
      description: 'Para equipes que precisam acompanhar operação e receita.',
      price: 'Sob consulta',
      period: 'atendimento dedicado',
      features: [
        'Visão administrativa',
        'Relatórios financeiros',
        'Suporte prioritário',
      ],
      action: 'Falar com a equipe',
    },
  ]

  function selectPlan(plan) {
    if (plan.id === 'seller') {
      router.push('/seller')
      return
    }

    if (plan.id === 'business') {
      router.push('/settings')
      return
    }

    router.push('/dashboard')
  }
</script>

<style scoped>
  .plans-page {
    max-width: 1180px;
    margin: 0 auto;
    padding: 56px 24px;
    color: #18352a;
  }
  .plans-header {
    max-width: 680px;
    margin-bottom: 32px;
  }
  .eyebrow {
    color: #16804b;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  h1 {
    margin: 8px 0;
    font-size: clamp(2rem, 5vw, 3.8rem);
    line-height: 1;
  }
  .plans-header p,
  .plan-description,
  .pricing-note {
    color: #61746a;
  }
  .plans-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }
  .plan-card {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 28px;
    border: 1px solid #d8e5dc;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 14px 35px rgba(34, 77, 55, 0.08);
  }
  .plan-card.featured {
    border-color: #2d9c63;
    box-shadow: 0 18px 40px rgba(22, 128, 75, 0.18);
    transform: translateY(-8px);
  }
  .plan-badge {
    position: absolute;
    top: 14px;
    right: 16px;
    color: #16804b;
    font-size: 0.72rem;
    font-weight: 800;
  }
  h2 {
    margin: 0 0 10px;
  }
  .plan-price {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin: 24px 0;
  }
  .plan-price strong {
    font-size: 2rem;
  }
  .plan-price span {
    color: #74857b;
    font-size: 0.8rem;
  }
  ul {
    display: grid;
    gap: 10px;
    min-height: 126px;
    margin: 0 0 24px;
    padding: 0;
    list-style: none;
  }
  li::before {
    content: '✓';
    margin-right: 8px;
    color: #16804b;
    font-weight: 800;
  }
  .plan-action {
    width: 100%;
    margin-top: auto;
    padding: 12px 16px;
    border: 0;
    border-radius: 6px;
    background: #18352a;
    color: #fff;
    cursor: pointer;
    font-weight: 800;
  }
  .plan-card.featured .plan-action {
    background: #16804b;
  }
  .pricing-note {
    margin: 28px 0 0;
    font-size: 0.9rem;
  }
  @media (max-width: 820px) {
    .plans-grid {
      grid-template-columns: 1fr;
    }
    .plan-card.featured {
      transform: none;
    }
  }
</style>
