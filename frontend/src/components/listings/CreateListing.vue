<template>
  <div class="create-listing-page">
    <div class="page-header">
      <h1>Criar Novo Anúncio</h1>
      <p>Publique seu produto e comece a receber contatos de compradores</p>
    </div>

    <form @submit.prevent="submitForm" class="listing-form">
      <div class="form-section">
        <h3>📝 Informações do Produto</h3>

        <div class="form-group">
          <label>Título do Anúncio *</label>
          <input
            v-model="form.title"
            type="text"
            placeholder="Ex: iPhone 13 Pro 256GB"
            required
          />
        </div>

        <div class="form-group">
          <label>Descrição *</label>
          <textarea
            v-model="form.description"
            placeholder="Descreva em detalhes o produto..."
            required
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Categoria *</label>
            <select
              v-model="form.category"
              required
              @change="updateSubcategories"
            >
              <option value="">Selecione uma categoria</option>
              <option v-for="(cat, key) in categories" :key="key" :value="key">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Subcategoria</label>
            <select v-model="form.subcategory">
              <option value="">Selecione uma subcategoria</option>
              <option
                v-for="subcat in subcategories"
                :key="subcat"
                :value="subcat"
              >
                {{ subcat }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Preço (R$) *</label>
            <input
              v-model="form.price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0,00"
              required
            />
          </div>

          <div class="form-group">
            <label>Localização</label>
            <input
              v-model="form.location"
              type="text"
              placeholder="Cidade, Estado"
            />
          </div>
        </div>
      </div>

      <div class="form-section">
        <h3>🖼️ Fotos e Vídeos</h3>

        <div class="form-group">
          <label>Fotos do Produto</label>
          <div class="file-upload">
            <input
              type="file"
              multiple
              accept="image/*"
              @change="handleImageUpload"
            />
            <p>
              Arraste imagens aqui ou clique para selecionar (máx 5 imagens)
            </p>
          </div>
          <div class="image-preview" v-if="form.images?.length">
            <img v-for="(img, idx) in form.images" :key="idx" :src="img" />
          </div>
        </div>

        <div class="form-group">
          <label>Links de Vídeos</label>
          <input
            v-model="form.videos"
            type="text"
            placeholder="Ex: https://youtube.com/watch?v=..."
          />
        </div>
      </div>

      <div class="form-section">
        <h3>🚚 Informações de Frete</h3>

        <div class="form-group">
          <label>Opções de Envio</label>
          <div class="checkbox-group">
            <label>
              <input
                type="checkbox"
                value="Retirada no local"
                v-model="form.shipping_options"
              />
              Retirada no local
            </label>
            <label>
              <input
                type="checkbox"
                value="Entrega pelo vendedor"
                v-model="form.shipping_options"
              />
              Entrega pelo vendedor
            </label>
            <label>
              <input
                type="checkbox"
                value="Correios"
                v-model="form.shipping_options"
              />
              Correios
            </label>
            <label>
              <input
                type="checkbox"
                value="Transportadora"
                v-model="form.shipping_options"
              />
              Transportadora
            </label>
          </div>
        </div>
      </div>

      <div class="form-section info-box">
        <h3>💰 Cobrança</h3>
        <p>
          Este card será alugado por <strong>R$ 100,00 por 30 dias</strong>.
        </p>
        <p>
          O prazo começa quando o anúncio for publicado. Não há comissão sobre
          vendas.
        </p>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="goBack">
          Cancelar
        </button>
        <button type="submit" class="btn btn-primary">Publicar Anúncio</button>
      </div>
    </form>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { addDoc, collection, Timestamp } from 'firebase/firestore'
  import { auth, db } from '../../firebase.js'
  import { categories as defaultCategories } from '../../utils/categories.js'
  import api from '../../utils/api.js'

  const router = useRouter()
  const categories = ref(defaultCategories)
  const subcategories = computed(() => {
    return form.value.category
      ? categories.value[form.value.category]?.subcategories || []
      : []
  })

  const form = ref({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    price: 0,
    location: '',
    images: [],
    videos: '',
    shipping_options: [],
  })

  const toVideoArray = (videos) => {
    if (Array.isArray(videos)) return videos.filter(Boolean)
    if (!videos) return []

    return String(videos)
      .split(/[\n,;]+/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  const getUserFacingError = (error) => {
    const code = error?.code || ''
    const backendMessage =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      ''

    if (code === 'permission-denied') {
      return 'Seu plano atual não permite publicar nesta categoria. Verifique sua assinatura e categoria liberada em Planos.'
    }

    if (code === 'unauthenticated') {
      return 'Sua sessão expirou. Entre novamente para publicar o anúncio.'
    }

    if (/token inválido|token invalido|token expirado/i.test(backendMessage)) {
      return 'Sua sessão está inválida para o backend. Entre novamente para continuar.'
    }

    if (/pagamentos pendentes/i.test(backendMessage)) {
      return backendMessage
    }

    if (backendMessage) {
      return backendMessage
    }

    return 'Não foi possível criar o anúncio. Tente novamente em instantes.'
  }

  const updateSubcategories = () => {
    form.value.subcategory = ''
  }

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files)
    if (files.length + form.value.images.length > 5) {
      alert('Máximo 5 imagens permitidas')
      return
    }

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        form.value.images.push(e.target.result)
      }
      reader.readAsDataURL(file)
    })
  }

  const submitForm = async () => {
    const ownerId =
      auth.currentUser?.uid ||
      JSON.parse(localStorage.getItem('user') || 'null')?.id

    if (!ownerId) {
      alert('Entre na sua conta para publicar um anúncio.')
      return
    }

    const normalizedPayload = {
      title: String(form.value.title || '').trim(),
      description: String(form.value.description || '').trim(),
      category: form.value.category,
      subcategory: form.value.subcategory || '',
      price: Number(form.value.price) || 0,
      location: String(form.value.location || '').trim(),
      images: Array.isArray(form.value.images) ? form.value.images : [],
      videos: toVideoArray(form.value.videos),
      shipping_options: Array.isArray(form.value.shipping_options)
        ? form.value.shipping_options
        : [],
    }

    if (!normalizedPayload.title || !normalizedPayload.category) {
      alert('Preencha pelo menos título e categoria para publicar.')
      return
    }

    try {
      const createdAt = new Date().toISOString()
      const rentalExpiresAt = Timestamp.fromDate(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      )
      const isAdminTest =
        auth.currentUser?.email?.toLowerCase() === 'elias@test.com'
      const firestorePayload = {
        name: normalizedPayload.title,
        description:
          normalizedPayload.description || 'Produto anunciado na plataforma.',
        category: normalizedPayload.category,
        subcategory: normalizedPayload.subcategory || null,
        price: normalizedPayload.price,
        supplier: 'Anunciante Mercado Certo',
        supplier_contact: auth.currentUser?.email || null,
        color: 'Sem cor',
        stock_quantity: 1,
        sold_quantity: 0,
        isSold: false,
        location: normalizedPayload.location || null,
        images: normalizedPayload.images,
        videos: normalizedPayload.videos,
        shipping_options: normalizedPayload.shipping_options,
        ownerId,
        ownerName:
          auth.currentUser?.displayName ||
          JSON.parse(localStorage.getItem('user') || 'null')?.name ||
          null,
        ownerEmail:
          auth.currentUser?.email ||
          JSON.parse(localStorage.getItem('user') || 'null')?.email ||
          null,
        createdAt,
        updatedAt: createdAt,
        rentalPrice: 100,
        rentalDays: 30,
        rentalStartedAt: createdAt,
        rentalExpiresAt,
        isTestListing: isAdminTest,
      }

      await addDoc(collection(db, 'products'), firestorePayload)

      alert('Anúncio criado com sucesso!')
      router.push('/dashboard')
      return
    } catch (firestoreError) {
      console.error('Erro ao criar anúncio no Firestore:', firestoreError)
      alert(getUserFacingError(firestoreError))
    }
  }

  const goBack = () => {
    router.back()
  }

  const loadCategories = async () => {
    try {
      const response = await api.get('/listings/categories')
      const remoteCategories = response.data
      const hasValidRemoteCategories =
        remoteCategories &&
        Object.entries(remoteCategories).every(
          ([key, category]) =>
            defaultCategories[key] &&
            category?.name &&
            Array.isArray(category.subcategories),
        )

      if (hasValidRemoteCategories) {
        categories.value = Object.fromEntries(
          Object.keys(defaultCategories).map((key) => [
            key,
            {
              ...defaultCategories[key],
              ...remoteCategories[key],
              subcategories: [
                ...new Set([
                  ...defaultCategories[key].subcategories,
                  ...remoteCategories[key].subcategories,
                ]),
              ],
            },
          ]),
        )
      }
    } catch (error) {
      console.warn('Usando categorias locais:', error.message)
    }
  }

  onMounted(() => {
    loadCategories()
  })
</script>

<style scoped>
  .create-listing-page {
    max-width: 800px;
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

  .listing-form {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .form-section {
    padding: 24px;
    border-bottom: 1px solid #eee;
  }

  .form-section:last-of-type {
    border-bottom: none;
  }

  .form-section h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    color: #333;
  }

  .form-group {
    margin-bottom: 16px;
  }

  .form-group label {
    display: block;
    margin-bottom: 6px;
    font-weight: 600;
    color: #333;
  }

  .form-group input[type='text'],
  .form-group input[type='number'],
  .form-group textarea,
  .form-group select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    font-family: inherit;
  }

  .form-group input:focus,
  .form-group textarea:focus,
  .form-group select:focus {
    outline: none;
    border-color: #1971c2;
    box-shadow: 0 0 4px rgba(25, 113, 194, 0.2);
  }

  .form-group textarea {
    resize: vertical;
    min-height: 120px;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  @media (max-width: 600px) {
    .form-row {
      grid-template-columns: 1fr;
    }
  }

  .file-upload {
    border: 2px dashed #ddd;
    border-radius: 4px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
  }

  .file-upload:hover {
    border-color: #1971c2;
    background: #f0f8ff;
  }

  .file-upload input {
    display: none;
  }

  .file-upload p {
    margin: 0;
    color: #666;
    font-size: 14px;
  }

  .image-preview {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    flex-wrap: wrap;
  }

  .image-preview img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
  }

  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .checkbox-group label {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-weight: normal;
    cursor: pointer;
  }

  .checkbox-group input[type='checkbox'] {
    width: auto;
  }

  .info-box {
    background: #f0f8ff;
    border-left: 4px solid #1971c2;
  }

  .info-box p {
    margin: 8px 0;
    color: #333;
    line-height: 1.6;
  }

  .form-actions {
    display: flex;
    gap: 12px;
    padding: 24px;
    justify-content: flex-end;
  }

  .btn {
    padding: 12px 24px;
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

  .btn-secondary {
    background: #f0f0f0;
    color: #333;
  }

  .btn-secondary:hover {
    background: #e0e0e0;
  }
</style>
