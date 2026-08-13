<template>
  <div class="listing-card">
    <div class="listing-image">
      <img
        :src="listing.images?.[0] || 'https://via.placeholder.com/300x200'"
        :alt="listing.title"
      />
      <span v-if="listing.status === 'paused'" class="badge-paused"
        >Pausado</span
      >
    </div>

    <div class="listing-content">
      <div class="listing-header">
        <h3>{{ listing.title }}</h3>
        <span class="category-badge">{{ listing.category }}</span>
      </div>

      <p class="listing-description">
        {{ listing.description?.substring(0, 100) }}...
      </p>

      <div class="listing-price">
        <span class="price">R$ {{ listing.price.toFixed(2) }}</span>
        <span class="views">👁️ {{ listing.views_count }} visualizações</span>
      </div>

      <div class="listing-location">
        <span>📍 {{ listing.seller.location }}</span>
      </div>

      <div class="listing-footer">
        <button class="btn btn-primary" @click="goToListing">
          Ver Detalhes
        </button>
        <button class="btn btn-secondary" @click="startChat">
          💬 Conversar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { defineProps } from 'vue'
  import { useRouter } from 'vue-router'

  defineProps({
    listing: {
      type: Object,
      required: true,
    },
  })

  const router = useRouter()

  const goToListing = (listing) => {
    router.push(`/listing/${listing.id}`)
  }

  const startChat = (listing) => {
    router.push({
      name: 'chat',
      query: {
        seller_id: listing.seller_id,
        listing_id: listing.id,
        seller_name: listing.seller?.name || listing.seller_name,
        listing_title: listing.title,
        listing_category: listing.category,
        listing_price: listing.price,
      },
    })
  }
</script>

<style scoped>
  .listing-card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition:
      transform 0.2s,
      box-shadow 0.2s;
  }

  .listing-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  .listing-image {
    position: relative;
    width: 100%;
    height: 200px;
    overflow: hidden;
    background: #f0f0f0;
  }

  .listing-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .badge-paused {
    position: absolute;
    top: 10px;
    right: 10px;
    background: #ff6b6b;
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
  }

  .listing-content {
    padding: 16px;
  }

  .listing-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
  }

  .listing-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }

  .category-badge {
    background: #e7f5ff;
    color: #1971c2;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
  }

  .listing-description {
    margin: 8px 0;
    color: #666;
    font-size: 14px;
    line-height: 1.4;
  }

  .listing-price {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 12px 0;
    font-size: 14px;
  }

  .price {
    font-size: 18px;
    font-weight: bold;
    color: #2d8c2d;
  }

  .views {
    color: #888;
    font-size: 12px;
  }

  .listing-location {
    margin: 8px 0;
    font-size: 13px;
    color: #666;
  }

  .listing-footer {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }

  .btn {
    flex: 1;
    padding: 8px;
    border: none;
    border-radius: 4px;
    font-size: 13px;
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
</style>
