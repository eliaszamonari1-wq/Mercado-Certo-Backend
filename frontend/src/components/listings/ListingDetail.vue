<template>
  <div class="listing-detail">
    <div class="detail-container">
      <div class="detail-images">
        <div class="main-image">
          <img :src="currentImage" :alt="listing.title" />
        </div>
        <div class="thumbnail-list" v-if="listing.images?.length > 1">
          <img
            v-for="(img, idx) in listing.images"
            :key="idx"
            :src="img"
            @click="currentImage = img"
            :class="{ active: currentImage === img }"
          />
        </div>
      </div>

      <div class="detail-info">
        <div class="status-badge" v-if="listing.status === 'paused'">
          ⚠️ Este anúncio está pausado
        </div>

        <h1>{{ listing.title }}</h1>

        <div class="price-section">
          <span class="price">R$ {{ listing.price.toFixed(2) }}</span>
        </div>

        <div class="seller-info">
          <div class="seller-header">
            <h3>Vendedor</h3>
          </div>
          <p>
            <strong>{{ listing.seller.name }}</strong>
          </p>
          <p>📍 {{ listing.seller.location }}</p>
        </div>

        <div class="action-buttons">
          <button class="btn btn-primary" @click="startChat">
            💬 Enviar Mensagem
          </button>
          <button class="btn btn-secondary" @click="addToFavorites">
            ❤️ Favoritar
          </button>
        </div>

        <div class="external-links" v-if="listing.external_links?.length > 0">
          <h4>🔗 Onde mais comprar</h4>
          <p class="disclaimer">
            Liberdade comercial: você pode encontrar este produto em outras
            plataformas
          </p>
          <div class="links-list">
            <a
              v-for="link in listing.external_links"
              :key="link.id"
              :href="link.url"
              target="_blank"
              class="external-link"
            >
              <span class="icon">{{ link.platform_icon }}</span>
              <span class="name">{{ link.platform_name }}</span>
            </a>
          </div>
        </div>

        <div class="shipping-info">
          <h4>📦 Informações de Frete</h4>
          <p v-if="listing.shipping_options?.length > 0">
            {{ listing.shipping_options.join(', ') }}
          </p>
          <p v-else>A combinar com o vendedor</p>
        </div>

        <div class="description">
          <h4>Descrição</h4>
          <p>{{ listing.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, defineProps, onMounted } from 'vue'
  import { useRouter } from 'vue-router'

  const props = defineProps({
    listing: {
      type: Object,
      required: true,
    },
  })

  const router = useRouter()
  const currentImage = ref(
    props.listing.images?.[0] || 'https://via.placeholder.com/600x400',
  )

  const startChat = () => {
    router.push({
      name: 'chat',
      query: {
        seller_id: props.listing.seller_id,
        listing_id: props.listing.id,
        seller_name: props.listing.seller?.name || props.listing.seller_name,
        listing_title: props.listing.title,
        listing_category: props.listing.category,
        listing_price: props.listing.price,
      },
    })
  }

  const addToFavorites = () => {
    // TODO: Implementar favoritos
    alert('Funcionalidade de favoritos em desenvolvimento')
  }
</script>

<style scoped>
  .listing-detail {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  .detail-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
  }

  @media (max-width: 768px) {
    .detail-container {
      grid-template-columns: 1fr;
    }
  }

  .detail-images {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .main-image {
    width: 100%;
    height: 400px;
    background: #f0f0f0;
    border-radius: 8px;
    overflow: hidden;
  }

  .main-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .thumbnail-list {
    display: flex;
    gap: 8px;
    overflow-x: auto;
  }

  .thumbnail-list img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
    cursor: pointer;
    border: 2px solid transparent;
    transition: border-color 0.2s;
  }

  .thumbnail-list img.active {
    border-color: #1971c2;
  }

  .status-badge {
    background: #fff3cd;
    color: #856404;
    padding: 12px;
    border-radius: 4px;
    font-weight: 600;
    margin-bottom: 16px;
  }

  .detail-info h1 {
    font-size: 28px;
    margin: 0 0 16px 0;
    color: #333;
  }

  .price-section {
    margin: 20px 0;
  }

  .price {
    font-size: 32px;
    font-weight: bold;
    color: #2d8c2d;
  }

  .seller-info {
    background: #f9f9f9;
    padding: 16px;
    border-radius: 8px;
    margin: 20px 0;
  }

  .seller-info h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
  }

  .seller-info p {
    margin: 4px 0;
    color: #666;
  }

  .action-buttons {
    display: flex;
    gap: 12px;
    margin: 20px 0;
  }

  .btn {
    flex: 1;
    padding: 12px;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-primary {
    background: #1971c2;
    color: white;
  }

  .btn-primary:hover {
    background: #1566a8;
  }

  .btn-secondary {
    background: #f0f0f0;
    color: #333;
  }

  .btn-secondary:hover {
    background: #e0e0e0;
  }

  .external-links {
    background: #f0f8ff;
    padding: 16px;
    border-radius: 8px;
    margin: 20px 0;
    border-left: 4px solid #1971c2;
  }

  .external-links h4 {
    margin: 0 0 8px 0;
    color: #1971c2;
  }

  .disclaimer {
    font-size: 12px;
    color: #666;
    margin: 8px 0;
  }

  .links-list {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 12px;
  }

  .external-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    text-decoration: none;
    color: #333;
    transition: all 0.2s;
  }

  .external-link:hover {
    border-color: #1971c2;
    background: #fff;
    transform: translateY(-2px);
  }

  .icon {
    font-size: 16px;
  }

  .name {
    font-size: 13px;
    font-weight: 600;
  }

  .shipping-info,
  .description {
    margin: 20px 0;
  }

  .shipping-info h4,
  .description h4 {
    margin: 0 0 12px 0;
    font-size: 16px;
    color: #333;
  }

  .shipping-info p,
  .description p {
    color: #666;
    line-height: 1.6;
  }
</style>
