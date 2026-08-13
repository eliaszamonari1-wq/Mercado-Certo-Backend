<template>
  <main class="access-page">
    <section class="access-card">
      <div class="access-icon">🛡️</div>
      <span class="eyebrow">Mercado Certo / Acesso restrito</span>
      <h1>Esta área é exclusiva para administradores</h1>
      <p>
        Seu usuário ainda não possui autorização para acessar a gestão de
        usuários, anúncios e cobranças.
      </p>
      <div class="access-actions">
        <RouterLink to="/plans" class="primary-action">
          Ver planos e contratar acesso
        </RouterLink>
        <RouterLink to="/dashboard" class="secondary-action">
          Voltar ao catálogo
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
  .access-page {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 24px;
    background: #f4fbf5;
    color: #18352a;
  }

  .access-card {
    width: min(560px, 100%);
    padding: 42px 34px;
    border: 1px solid #d8e8dc;
    border-radius: 18px;
    background: #fff;
    box-shadow: 0 24px 70px rgba(27, 68, 45, 0.12);
    text-align: center;
  }

  .access-icon {
    display: grid;
    width: 64px;
    height: 64px;
    margin: 0 auto 18px;
    place-items: center;
    border-radius: 50%;
    background: #e4f4e8;
    font-size: 30px;
  }

  .eyebrow {
    color: #16804b;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  h1 {
    margin: 12px 0;
    font-size: clamp(1.8rem, 5vw, 2.8rem);
    line-height: 1.1;
  }

  p {
    margin: 0 auto;
    max-width: 440px;
    color: #64766b;
    line-height: 1.6;
  }

  .access-actions {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 28px;
  }

  .primary-action,
  .secondary-action {
    display: inline-flex;
    min-height: 44px;
    align-items: center;
    justify-content: center;
    padding: 11px 16px;
    border-radius: 8px;
    font-weight: 800;
    text-decoration: none;
  }

  .primary-action {
    background: #16804b;
    color: #fff;
  }

  .secondary-action {
    border: 1px solid #c9dbcf;
    color: #18352a;
  }

  @media (max-width: 520px) {
    .access-card {
      padding: 32px 20px;
    }

    .access-actions {
      align-items: stretch;
      flex-direction: column;
    }
  }
</style>
