<template>
  <div class="external-links-manager">
    <div class="header">
      <h2>🔗 Onde Mais Comprar</h2>
      <p>Adicione links para suas outras lojas e plataformas</p>
    </div>

    <div class="add-link-form">
      <h3>Adicionar Novo Link</h3>
      <div class="form-group">
        <label>Plataforma/Nome</label>
        <input
          v-model="newLink.platform_name"
          type="text"
          placeholder="Ex: Mercado Livre"
        />
      </div>

      <div class="form-group">
        <label>URL</label>
        <input v-model="newLink.url" type="url" placeholder="https://..." />
      </div>

      <div class="form-group">
        <label>Tipo de Link</label>
        <select v-model="newLink.link_type">
          <option value="marketplace">Marketplace</option>
          <option value="social">Rede Social</option>
          <option value="website">Website</option>
          <option value="video">Vídeo</option>
          <option value="messaging">Mensagem</option>
        </select>
      </div>

      <button @click="addLink" class="btn btn-primary">Adicionar Link</button>
    </div>

    <div class="platforms-quick-add">
      <h3>Plataformas Populares</h3>
      <div class="platforms-grid">
        <button
          v-for="platform in popularPlatforms"
          :key="platform.id"
          @click="selectPlatform(platform)"
          class="platform-btn"
        >
          <span class="icon">{{ platform.icon }}</span>
          <span class="name">{{ platform.name }}</span>
        </button>
      </div>
    </div>

    <div class="links-list">
      <h3>Seus Links</h3>
      <div v-if="links.length === 0" class="empty">
        <p>Nenhum link adicionado ainda</p>
      </div>
      <div v-else class="links-container">
        <div v-for="link in links" :key="link.id" class="link-item">
          <span class="icon">{{ link.platform_icon }}</span>
          <div class="link-info">
            <h4>{{ link.platform_name }}</h4>
            <a :href="link.url" target="_blank">{{ link.url }}</a>
          </div>
          <button @click="deleteLink(link.id)" class="btn-delete">✕</button>
        </div>
      </div>
    </div>

    <div class="info-box">
      <h3>💡 Liberdade Comercial</h3>
      <p>
        No Mercado Certo, você tem a liberdade para divulgar seus canais de
        venda. Você pode compartilhar links para suas outras lojas, redes
        sociais e plataformas sem restrições. Isso torna seu anúncio uma central
        de divulgação do seu negócio!
      </p>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import api from '../../utils/api.js'

  const props = defineProps({
    listingId: {
      type: Number,
      required: true,
    },
  })

  const links = ref([])
  const newLink = ref({
    platform_name: '',
    url: '',
    link_type: 'marketplace',
  })

  const popularPlatforms = [
    {
      id: 'mercado-livre',
      name: 'Mercado Livre',
      icon: '🛒',
      url_placeholder: 'https://produto.mercadolivre.com.br',
    },
    {
      id: 'shopee',
      name: 'Shopee',
      icon: '🛍️',
      url_placeholder: 'https://shopee.com.br',
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: '🎥',
      url_placeholder: 'https://youtube.com/watch?v=',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: '📱',
      url_placeholder: 'https://instagram.com',
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: '📱',
      url_placeholder: 'https://tiktok.com/@',
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: '💬',
      url_placeholder: 'https://wa.me/',
    },
    {
      id: 'loja-propria',
      name: 'Sua Loja',
      icon: '🌐',
      url_placeholder: 'https://seu-site.com.br',
    },
  ]

  const selectPlatform = (platform) => {
    newLink.value.platform_name = platform.name
    newLink.value.platform_icon = platform.icon
    newLink.value.link_type = platform.id.includes('social')
      ? 'social'
      : platform.id === 'youtube'
        ? 'video'
        : platform.id.includes('whatsapp')
          ? 'messaging'
          : 'marketplace'
  }

  const addLink = async () => {
    if (!newLink.value.platform_name || !newLink.value.url) {
      alert('Preencha todos os campos')
      return
    }

    try {
      const response = await api.post('/external-links', {
        listing_id: props.listingId,
        ...newLink.value,
      })

      links.value.push(response.data.link)
      newLink.value = {
        platform_name: '',
        url: '',
        link_type: 'marketplace',
      }
      alert('Link adicionado com sucesso!')
    } catch (error) {
      console.error('Erro ao adicionar link:', error)
      alert('Erro ao adicionar link')
    }
  }

  const deleteLink = async (linkId) => {
    if (!confirm('Tem certeza que deseja remover este link?')) return

    try {
      await api.delete(`/external-links/${linkId}`)
      links.value = links.value.filter((l) => l.id !== linkId)
      alert('Link removido com sucesso!')
    } catch (error) {
      console.error('Erro ao remover link:', error)
      alert('Erro ao remover link')
    }
  }

  const loadLinks = async () => {
    try {
      const response = await api.get(`/external-links/${props.listingId}`)
      links.value = response.data.links
    } catch (error) {
      console.error('Erro ao carregar links:', error)
    }
  }

  onMounted(() => {
    loadLinks()
  })
</script>

<style scoped>
  .external-links-manager {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 24px;
  }

  .header {
    margin-bottom: 24px;
  }

  .header h2 {
    margin: 0;
    font-size: 20px;
  }

  .header p {
    margin: 6px 0 0 0;
    color: #666;
    font-size: 14px;
  }

  .add-link-form {
    background: #f9f9f9;
    padding: 16px;
    border-radius: 4px;
    margin-bottom: 24px;
  }

  .add-link-form h3 {
    margin: 0 0 12px 0;
    font-size: 14px;
  }

  .form-group {
    margin-bottom: 12px;
  }

  .form-group label {
    display: block;
    margin-bottom: 4px;
    font-size: 13px;
    font-weight: 600;
    color: #333;
  }

  .form-group input,
  .form-group select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 13px;
  }

  .form-group input:focus,
  .form-group select:focus {
    outline: none;
    border-color: #1971c2;
    box-shadow: 0 0 4px rgba(25, 113, 194, 0.2);
  }

  .btn {
    padding: 10px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
  }

  .btn-primary {
    background: #1971c2;
    color: white;
  }

  .btn-primary:hover {
    background: #1566a8;
  }

  .platforms-quick-add {
    margin-bottom: 24px;
  }

  .platforms-quick-add h3 {
    margin: 0 0 12px 0;
    font-size: 14px;
  }

  .platforms-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
  }

  .platform-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 12px;
    background: #f0f0f0;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 13px;
    font-weight: 600;
  }

  .platform-btn:hover {
    background: #e0e0e0;
    border-color: #1971c2;
  }

  .icon {
    font-size: 24px;
  }

  .links-list h3 {
    margin: 0 0 12px 0;
    font-size: 14px;
  }

  .empty {
    text-align: center;
    padding: 24px;
    background: #f9f9f9;
    border-radius: 4px;
    color: #999;
  }

  .links-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .link-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: #f9f9f9;
    border-radius: 4px;
    border-left: 4px solid #1971c2;
  }

  .link-item .icon {
    font-size: 24px;
    flex-shrink: 0;
  }

  .link-info {
    flex: 1;
  }

  .link-info h4 {
    margin: 0;
    font-size: 14px;
    color: #333;
  }

  .link-info a {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    color: #1971c2;
    text-decoration: none;
    word-break: break-all;
  }

  .link-info a:hover {
    text-decoration: underline;
  }

  .btn-delete {
    background: #ff6b6b;
    color: white;
    border: none;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 14px;
    flex-shrink: 0;
  }

  .btn-delete:hover {
    background: #ff5252;
  }

  .info-box {
    background: #f0f8ff;
    padding: 16px;
    border-radius: 4px;
    border-left: 4px solid #1971c2;
    margin-top: 24px;
  }

  .info-box h3 {
    margin: 0 0 8px 0;
    color: #1971c2;
    font-size: 14px;
  }

  .info-box p {
    margin: 0;
    color: #333;
    font-size: 13px;
    line-height: 1.6;
  }
</style>
