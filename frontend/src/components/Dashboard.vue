<template>
  <!-- cSpell:disable -->
  <div class="dashboard">
    <!-- === NAVBAR PREMIUM === -->
    <header class="navbar-premium">
      <div class="navbar-inner">
        <div class="navbar-left">
          <div class="brand-mark">🤝</div>
          <div class="brand-copy">
            <span class="header-tag">Painel</span>
            <strong class="brand-name" aria-label="Mercado Certo">
              <span
                v-for="(ch, idx) in brandLetters"
                :key="idx"
                class="brand-letter"
                :style="{ '--delay': idx * 0.05 + 's' }"
                >{{ ch === ' ' ? '\u00A0' : ch }}</span
              >
            </strong>
            <span class="vip-label" aria-hidden="true">⭐ Premium</span>
          </div>
        </div>

        <div class="navbar-center">
          <div class="search-box search-center">
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Buscar produtos..."
              aria-label="Buscar produtos"
              @input="handleSearch"
            />
            <button type="button" class="btn-search" aria-label="Pesquisar">
              🔎
            </button>
          </div>
        </div>

        <div class="navbar-right">
          <nav class="app-nav" aria-label="Navegação principal">
            <RouterLink to="/plans" class="app-nav-link">Planos</RouterLink>
            <RouterLink v-if="isLoggedIn" to="/seller" class="app-nav-link">
              Vender
            </RouterLink>
          </nav>
          <template v-if="isLoggedIn">
            <div class="user-chip" @click="openProfileDrawer">
              <span class="user-avatar">👤</span>
              <span class="user-name">{{ user?.name || user?.username }}</span>
              <span class="user-badge">▼</span>
            </div>
          </template>
          <template v-else>
            <button class="btn-login" @click="openDrawer('login')">
              Entrar
            </button>
            <button class="btn-register" @click="openDrawer('register')">
              Registrar
            </button>
          </template>
        </div>
      </div>

      <!-- Navbar Categories -->
      <div class="navbar-categories centered-categories">
        <div class="category-scroll">
          <button
            type="button"
            class="nav-chip"
            :class="{ active: selectedCategory === 'all' }"
            @click="setSelectedCategory('all')"
          >
            🏷️ Todos
          </button>
          <button
            v-for="category in categoryFilterOptions"
            :key="category.title"
            type="button"
            class="nav-chip"
            :class="{ active: selectedCategory === category.title }"
            @click="setSelectedCategory(category.title)"
          >
            {{ category.icon }} {{ category.title }}
          </button>
        </div>
      </div>
    </header>

    <section v-if="notifications.length" class="notifications-panel">
      <div class="notifications-heading">
        <strong>🔔 Notificações</strong>
        <button type="button" @click="clearNotifications">
          Marcar como lidas
        </button>
      </div>
      <article
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-item"
        @click="openNotification(notification)"
      >
        <strong>{{ notification.title }}</strong>
        <p>{{ notification.message }}</p>
      </article>
    </section>

    <!-- === HERO BANNER === -->
    <section class="hero-banner">
      <div class="hero-copy">
        <p class="hero-kicker">Exploração rápida</p>
        <h2>Encontre ofertas com uma navegação mais leve e clara.</h2>
        <p>
          A experiência foi organizada para destacar produtos, promoções e
          informações principais sem poluição visual.
        </p>
      </div>
      <div class="hero-card">
        <span class="hero-card-label">🚀 Entrega expressa</span>
        <strong>Frete grátis em compras acima de R$ 100</strong>
      </div>
    </section>

    <!-- === MAIN CONTENT === -->
    <main class="main-content">
      <section class="product-section">
        <div class="product-header">
          <div>
            <strong>🛍️ Produtos disponíveis</strong>
            <span>Visualize os detalhes do produto antes de comprar.</span>
          </div>
          <div class="product-actions">
            <span v-if="filteredProducts.length" class="product-count">
              {{ filteredProducts.length }} produtos
            </span>
            <button
              v-if="isLoggedIn"
              type="button"
              class="link-button"
              @click="openProductForm"
            >
              ➕ Adicionar produto
            </button>
            <button
              type="button"
              class="link-button"
              @click="refreshProducts"
              :disabled="productsLoading"
            >
              {{ productsLoading ? '⏳ Carregando...' : '🔄 Atualizar lista' }}
            </button>
          </div>
        </div>

        <div v-if="productsError" class="error-banner">
          <span class="error-icon">⚠️</span>
          {{ productsError }}
          <button @click="loadProducts" class="btn-retry">
            Tentar novamente
          </button>
        </div>

        <div
          v-if="productsLoading && !filteredProducts.length"
          class="product-grid"
        >
          <div v-for="i in 6" :key="i" class="product-skeleton">
            <div class="skeleton-image"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
            <div class="skeleton-line medium"></div>
          </div>
        </div>

        <div v-else-if="filteredProducts.length" class="product-grid">
          <article
            v-for="product in filteredProducts"
            :key="product.id"
            class="product-card"
            @click="handleBuy(product)"
          >
            <div class="product-image">
              <span>📦</span>
              <div class="product-badge" v-if="product.discount">
                {{ product.discount }}% OFF
              </div>
            </div>

            <div class="product-card-body">
              <h3 class="product-title">{{ product.name }}</h3>
              <div class="product-meta-badge">
                {{ getCategoryLabel(product) }}
              </div>

              <div class="sold-badge" v-if="product.isSold">🔴 Vendido</div>

              <div class="product-rating" v-if="product.rating">
                <span class="rating-stars">{{
                  '★'.repeat(Math.round(product.rating))
                }}</span>
                <span class="rating-value">({{ product.rating }})</span>
              </div>

              <p class="product-description">
                {{ product.description || 'Descrição breve não disponível.' }}
              </p>

              <div class="product-supplier" v-if="product.supplier">
                <span class="supplier-label">
                  🏷️ Fornecedor: {{ product.supplier }}
                </span>
                <button
                  type="button"
                  class="supplier-chat-btn"
                  @click.stop="openChat(product)"
                  aria-label="Abrir chat com o fornecedor"
                >
                  💬 Chat
                </button>
                <span class="owner-badge" v-if="isOwnedByCurrentUser(product)">
                  • Seu anúncio
                </span>
              </div>
              <div class="product-owner-status">
                {{ getProductOwnerStatus(product) }}
              </div>

              <div
                class="product-colors"
                v-if="getColorOptions(product).length"
              >
                <small>Cores:</small>
                <div class="color-list">
                  <button
                    v-for="color in getColorOptions(product)"
                    :key="color"
                    class="product-meta-chip"
                    :class="{ selected: isColorSelected(product, color) }"
                    @click.stop="toggleColorSelection(product.id, color)"
                  >
                    {{ color }}
                  </button>
                </div>
              </div>

              <div class="price-row">
                <div>
                  <span class="reference-price" v-if="product.price">
                    R$ {{ formatCurrency(getReferencePrice(product.price)) }}
                  </span>
                  <strong class="product-price">
                    R$ {{ formatCurrency(product.price) }}
                  </strong>
                </div>
                <div
                  class="stock-note"
                  :class="{ 'out-of-stock': product.stock_quantity === 0 }"
                >
                  {{
                    product.stock_quantity > 0
                      ? `📦 Estoque: ${product.stock_quantity}`
                      : '❌ Esgotado'
                  }}
                </div>
              </div>

              <div class="product-card-footer">
                <button
                  v-if="isOwnedByCurrentUser(product)"
                  class="btn-secondary"
                  @click.stop="toggleSoldStatus(product)"
                >
                  {{
                    product.isSold ? '🔁 Reabrir venda' : '✅ Marcar vendido'
                  }}
                </button>
                <button
                  v-if="isOwnedByCurrentUser(product) && !product.isSold"
                  class="btn-secondary"
                  @click.stop="openEditProduct(product)"
                >
                  ✏️ Editar
                </button>
                <button
                  v-if="isOwnedByCurrentUser(product)"
                  class="btn-secondary"
                  @click.stop="deleteProduct(product)"
                >
                  🗑️ Excluir
                </button>
                <button
                  class="btn-buy"
                  v-if="!isOwnedByCurrentUser(product)"
                  @click.stop="handleBuy(product)"
                  :disabled="product.stock_quantity === 0 || product.isSold"
                >
                  {{
                    product.stock_quantity === 0 || product.isSold
                      ? 'Indisponível'
                      : '🛒 Comprar'
                  }}
                </button>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          <strong>🤷 Nenhum produto encontrado</strong>
          <p>
            {{
              searchTerm
                ? 'Tente buscar por outro termo.'
                : 'Adicione produtos para começar.'
            }}
          </p>
        </div>
      </section>
    </main>

    <ProductForm
      v-if="showProductForm"
      :product="editingProduct"
      :mode="editingProduct ? 'edit' : 'create'"
      @close="
        () => {
          showProductForm = false
          editingProduct.value = null
        }
      "
      @save="handleSaveProduct"
    />

    <!-- === PRODUCT PREVIEW MODAL === -->
    <Transition name="fade">
      <div
        v-if="selectedProduct"
        class="purchase-preview"
        @click.self="closePreview"
      >
        <div class="preview-card">
          <div class="preview-top">
            <div class="preview-store">
              <span class="preview-store-chip">🏪 Acesse a Loja Oficial</span>
              <span class="preview-sold">🆕 Novo • +100 vendidos</span>
            </div>
            <button class="btn-close-preview" @click="closePreview">✕</button>
          </div>

          <div class="preview-grid">
            <div class="preview-image">📦</div>

            <div class="preview-info">
              <h2 class="preview-title">{{ selectedProduct.name }}</h2>
              <p class="preview-description">
                {{
                  selectedProduct.description ||
                  'Produto com muito estilo, tecnologia e entrega rápida.'
                }}
              </p>

              <div class="preview-meta">
                <div v-if="selectedProduct.supplier">
                  🏷️ Fornecedor: {{ selectedProduct.supplier }}
                </div>
                <div v-if="selectedProduct.rating" class="preview-rating">
                  <span class="rating-stars">{{
                    '★'.repeat(Math.round(selectedProduct.rating))
                  }}</span>
                  <span class="rating-value">{{ selectedProduct.rating }}</span>
                </div>
                <div
                  class="preview-colors"
                  v-if="getColorOptions(selectedProduct).length"
                >
                  <strong>Cores:</strong>
                  <div style="display: flex; gap: 8px; margin-top: 6px">
                    <span
                      v-for="c in getColorOptions(selectedProduct)"
                      :key="c"
                      class="product-meta-chip"
                    >
                      {{ c }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="preview-price-row">
                <div>
                  <span class="reference-price">
                    R$
                    {{
                      formatCurrency(getReferencePrice(selectedProduct.price))
                    }}
                  </span>
                  <strong class="product-price">
                    R$ {{ formatCurrency(selectedProduct.price) }}
                  </strong>
                </div>
                <span class="preview-tag">🎯 10% OFF</span>
              </div>

              <p class="installment-text">
                ou R$ {{ formatCurrency(selectedProduct.price / 10) }} em 10x
                sem juros
              </p>

              <div class="preview-details">
                <p class="preview-shipping">
                  🚚 Chegará grátis amanhã por ser sua primeira compra.
                </p>
                <p
                  class="preview-stock"
                  :class="{
                    'out-of-stock': selectedProduct.stock_quantity === 0,
                  }"
                >
                  📦 Estoque disponível:
                  {{ selectedProduct.stock_quantity ?? 0 }} unidades
                </p>
              </div>

              <div class="preview-actions">
                <div class="preview-buy-row">
                  <button
                    class="btn-buy"
                    @click="addToCart(selectedProduct)"
                    :disabled="
                      selectedProduct.stock_quantity === 0 ||
                      selectedProduct.isSold
                    "
                  >
                    {{
                      selectedProduct.stock_quantity === 0 ||
                      selectedProduct.isSold
                        ? 'Indisponível'
                        : '🛒 Comprar agora'
                    }}
                  </button>
                </div>

                <div class="preview-secondary-row">
                  <button
                    class="btn-chat preview-chat-btn"
                    @click="openChat(selectedProduct)"
                    type="button"
                  >
                    💬 Conversar com o fornecedor
                  </button>

                  <button
                    class="btn-secondary"
                    @click="addToCart(selectedProduct)"
                    :disabled="selectedProduct.isSold"
                  >
                    ➕ Adicionar ao carrinho
                  </button>
                </div>
              </div>

              <div class="coupon-chip">🎫 Cupom R$ 300 OFF</div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- === FLOATING CHAT === -->
    <Transition name="fade">
      <div v-if="showChat" class="drawer-backdrop" @click.self="closeChat">
        <aside
          class="chat-drawer floating-chat"
          @click.stop
          role="dialog"
          aria-label="Chat do produto"
        >
          <button
            type="button"
            class="drawer-close"
            @click="closeChat"
            aria-label="Fechar chat"
          >
            ✕
          </button>
          <ChatView
            :seller-id="
              activeChatProduct?.ownerId ||
              activeChatProduct?.owner_id ||
              activeChatProduct?.seller_id
            "
            :listing-id="activeChatProduct?.id"
            :seller-name="activeChatProduct?.supplier || 'vendedor'"
            :listing-title="activeChatProduct?.name"
            :listing-category="activeChatProduct?.category"
            :listing-price="activeChatProduct?.price"
          />
        </aside>
      </div>
    </Transition>

    <!-- === AUTH DRAWER === -->
    <Transition name="fade">
      <div v-if="showDrawer" class="drawer-backdrop" @click.self="closeDrawer">
        <aside
          class="auth-drawer"
          @click.stop
          role="dialog"
          aria-labelledby="drawer-title"
        >
          <button
            type="button"
            class="drawer-close"
            @click="closeDrawer"
            aria-label="Fechar"
          >
            ✕
          </button>
          <div class="drawer-header">
            <div>
              <h2 id="drawer-title" class="drawer-title">
                {{
                  drawerMode === 'auth'
                    ? authMode === 'login'
                      ? '🔐 Entrar na conta'
                      : '📝 Criar nova conta'
                    : '👤 Meu Perfil'
                }}
              </h2>
              <p class="drawer-subtitle">
                {{
                  drawerMode === 'auth'
                    ? 'Use suas credenciais para acessar o painel de gestão.'
                    : 'Veja seus dados rápidos e acesse configurações.'
                }}
              </p>
            </div>
          </div>

          <template v-if="drawerMode === 'auth'">
            <AuthForm
              :mode="authMode"
              @switchMode="handleSwitchMode"
              @authSuccess="handleAuthSuccess"
              @error="handleAuthError"
            />
          </template>

          <template v-else>
            <div class="drawer-profile">
              <div class="profile-summary">
                <div>
                  <p class="profile-label">👤 Nome</p>
                  <p class="profile-value">
                    {{ user?.name || user?.username }}
                  </p>
                </div>
                <div>
                  <p class="profile-label">👥 Usuário</p>
                  <p class="profile-value">@{{ user?.username }}</p>
                </div>
                <div>
                  <p class="profile-label">✉️ Email</p>
                  <p class="profile-value">
                    {{ user?.email || 'Não informado' }}
                  </p>
                </div>
                <div>
                  <p class="profile-label">📅 Membro desde</p>
                  <p class="profile-value">{{ formattedCreatedAt }}</p>
                </div>
              </div>

              <div class="profile-actions">
                <button class="btn-secondary" @click="router.push('/billing')">
                  💳 Cobrança
                </button>
                <button class="btn-secondary" @click="router.push('/seller')">
                  🏪 Painel vendedor
                </button>
                <button
                  v-if="user?.is_admin"
                  class="btn-secondary"
                  @click="router.push('/admin')"
                >
                  🛡️ Administração
                </button>
                <button class="btn-secondary" @click="goToSettings">
                  ⚙️ Configurações
                </button>
                <button class="btn-logout" @click="handleLogout">
                  🚪 Sair
                </button>
              </div>
            </div>
          </template>
        </aside>
      </div>
    </Transition>

    <!-- === TOAST NOTIFICATION === -->
    <Teleport to="body">
      <div v-if="toastMessage" class="toast-container">
        <div class="toast" :class="toastType">
          <span class="toast-icon">{{ toastIcon }}</span>
          <span class="toast-message">{{ toastMessage }}</span>
          <button class="toast-close" @click="clearToast">✕</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
  import {
    computed,
    onMounted,
    onBeforeUnmount,
    ref,
    watch,
    nextTick,
  } from 'vue'
  import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    where,
    updateDoc,
  } from 'firebase/firestore'
  import { useRouter } from 'vue-router'
  import { useAuth } from '../composables/useAuth.js'
  import { auth, db } from '../firebase.js'
  import AuthForm from './shared/AuthForm.vue'
  import ProductForm from './shared/ProductForm.vue'
  import ChatView from './user/ChatView.vue'
  import api, { initApi } from '../utils/api.js'

  const router = useRouter()
  const { user, logout, checkAuth, getProfile } = useAuth()
  const productsCollection = collection(db, 'products')

  // Estado
  const products = ref([])
  const searchTerm = ref('')
  const selectedCategory = ref('all')
  const productsLoading = ref(false)
  const productsError = ref(null)
  const notifications = ref([])
  const lastUpdated = ref(null)
  let refreshTimer = null
  let searchTimeout = null
  let notificationsUnsubscribe = null

  // Categorias
  const categories = ref([
    { title: 'Todos', icon: '🏷️' },
    { title: 'Carros, Motos e Outros', icon: '🚗' },
    { title: 'Celulares e Telefones', icon: '📱' },
    { title: 'Eletrodomésticos', icon: '🧺' },
    { title: 'Ferramentas', icon: '🛠️' },
  ])

  // Drawer
  const showDrawer = ref(false)
  const drawerMode = ref('auth')
  const authMode = ref('login')
  const loadingProfile = ref(true)
  const profileError = ref('')
  const showProductForm = ref(false)

  // Product preview
  const selectedProduct = ref(null)
  const editingProduct = ref(null)
  const activeChatProduct = ref(null)
  const showChat = ref(false)

  // Toast
  const toastMessage = ref('')
  const toastType = ref('success')
  const toastTimeout = ref(null)

  // Product selection
  const selectedMeta = ref({})

  const currentUserId = computed(() => user.value?.id || null)
  const currentUserOnline = computed(() => !!user.value)

  // Computed
  const isLoggedIn = computed(() => !!user.value)

  // Brand animation letters
  const brandText = 'Mercado Certo '
  const brandLetters = brandText.split('')

  const formattedCreatedAt = computed(() => {
    if (!user.value?.created_at) return 'Não disponível'
    return new Date(user.value.created_at).toLocaleDateString('pt-BR')
  })

  const toastIcon = computed(() => {
    return toastType.value === 'success'
      ? '✅'
      : toastType.value === 'error'
        ? '❌'
        : toastType.value === 'warning'
          ? '⚠️'
          : 'ℹ️'
  })

  // Products
  const categoryFilterOptions = computed(() => {
    const categoriesFromProducts = [
      ...new Set(
        products.value
          .map((product) => String(product.category || '').trim())
          .filter(Boolean),
      ),
    ]

    if (categoriesFromProducts.length) {
      return categoriesFromProducts.map((title) => ({
        title,
        icon: getCategoryIcon(title),
      }))
    }

    return categories.value.filter((category) => category.title !== 'Todos')
  })

  const filteredProducts = computed(() => {
    const term = searchTerm.value.trim().toLowerCase()

    return products.value.filter((product) => {
      const categoryTitle = String(product.category || '').trim()
      const matchesCategory =
        selectedCategory.value === 'all' ||
        normalizeCategoryValue(categoryTitle) ===
          normalizeCategoryValue(selectedCategory.value)

      if (!term) {
        return matchesCategory
      }

      const haystack = [
        product.name,
        product.description,
        product.category,
        product.supplier,
        product.color,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return matchesCategory && haystack.includes(term)
    })
  })

  // Métodos
  const normalizeCategoryValue = (value = '') => {
    return String(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
  }

  const getCategoryIcon = (title = '') => {
    const normalized = title.toLowerCase()
    if (normalized.includes('carro') || normalized.includes('moto')) return '🚗'
    if (normalized.includes('celular') || normalized.includes('telefone'))
      return '📱'
    if (normalized.includes('eletro')) return '🧺'
    if (normalized.includes('ferrament')) return '🛠️'
    return '🛍️'
  }

  const getCategoryLabel = (product) => {
    return String(product.category || 'Sem categoria').trim() || 'Sem categoria'
  }

  const getColorOptions = (product) => {
    const raw = String(product.color || '')
    const values = raw
      .split(/[,;]+/)
      .map((item) => item.trim())
      .filter(Boolean)
    return values.length ? values : []
  }

  const getReferencePrice = (price) => {
    const parsed = Number(price ?? 0)
    if (!parsed) return 0
    return parsed / 0.77
  }

  const formatCurrency = (value) => {
    return Number(value ?? 0).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const isColorSelected = (product, color) => {
    return selectedMeta.value[product.id]?.color === color
  }

  // Actions
  const loadProducts = async () => {
    if (productsLoading.value) return

    productsLoading.value = true
    productsError.value = null

    try {
      const snapshot = await getDocs(productsCollection)
      const firestoreProducts = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => {
          const aDate = new Date(a.createdAt || 0).getTime()
          const bDate = new Date(b.createdAt || 0).getTime()
          return bDate - aDate
        })

      products.value = firestoreProducts.map((product) => ({
        ...product,
        price: Number(product.price) || 0,
        stock_quantity: Number(product.stock_quantity) || 0,
        sold_quantity: Number(product.sold_quantity) || 0,
        supplier_contact:
          product.supplier_contact || product.supplierContact || null,
        ownerId:
          product.ownerId ||
          product.owner_id ||
          product.createdBy ||
          product.created_by ||
          product.userId ||
          null,
        ownerName: product.ownerName || product.owner_name || null,
      }))
    } catch (error) {
      console.error('Erro ao carregar produtos do Firestore:', error)
      try {
        const response = await api.get('/products')
        products.value = response.data.products || []
      } catch (fallbackError) {
        productsError.value =
          'Não foi possível carregar os produtos. Tente novamente.'
        console.error('Erro ao carregar produtos do backend:', fallbackError)
      }
    } finally {
      productsLoading.value = false
    }
  }

  const openProductForm = () => {
    if (!isLoggedIn.value) {
      openDrawer('login')
      showToast('Entre para publicar um card.', 'info')
      return
    }
    editingProduct.value = null
    showProductForm.value = true
  }

  const isOwnedByCurrentUser = (product) => {
    return (
      product?.ownerId &&
      currentUserId.value &&
      product.ownerId === currentUserId.value
    )
  }

  const getProductOwnerStatus = (product) => {
    if (product?.isSold) {
      return '🔴 Produto vendido'
    }
    if (isOwnedByCurrentUser(product)) {
      return '🔵 Seu anúncio • Online'
    }
    if (product?.ownerName) {
      return `🔸 ${product.ownerName}`
    }
    return '⚪ Fornecedor não disponível'
  }

  const openEditProduct = (product) => {
    if (!currentUserId.value) {
      showToast('Faça login para editar seus produtos.', 'warning')
      return
    }

    if (!isOwnedByCurrentUser(product)) {
      showToast('Somente o criador do produto pode editar este item.', 'error')
      return
    }

    if (product.isSold) {
      showToast(
        'Produto vendido não pode ser editado. Reabra a venda antes.',
        'warning',
      )
      return
    }

    editingProduct.value = { ...product }
    showProductForm.value = true
  }

  const contactSupplier = (product) => {
    const rawContact = String(product?.supplier_contact || '').trim()
    const subject = `Tenho interesse no produto ${product.name}`
    const body = `Olá ${product.supplier || 'fornecedor'},\n\nTenho interesse no produto ${product.name}. Por favor, entre em contato para que possamos finalizar a compra.\n\nObrigado!`

    if (rawContact && rawContact.includes('@')) {
      window.open(
        `mailto:${encodeURIComponent(rawContact)}?subject=${encodeURIComponent(
          subject,
        )}&body=${encodeURIComponent(body)}`,
        '_blank',
      )
      return
    }

    const phoneDigits = rawContact.replace(/\D/g, '')
    if (phoneDigits.length >= 8) {
      window.open(
        `https://wa.me/${phoneDigits}?text=${encodeURIComponent(body)}`,
        '_blank',
      )
      return
    }

    showToast(
      'Nenhum contato direto disponível para este fornecedor. Preencha o campo de contato do fornecedor no cadastro do produto.',
      'warning',
    )
  }

  const handleSaveProduct = async (payload) => {
    const ownerId = auth.currentUser?.uid || currentUserId.value

    if (!ownerId) {
      showToast('Entre na sua conta para adicionar um produto.', 'warning')
      return
    }

    const normalizedPayload = {
      name: String(payload.name).trim(),
      description: payload.description || 'Produto adicionado pela loja.',
      category: payload.category || 'Sem categoria',
      supplier: payload.supplier || 'Fornecedor',
      supplier_contact: payload.supplier_contact || null,
      color: payload.color || 'Sem cor',
      price: Number(payload.price) || 0,
      stock_quantity: Number(payload.stock_quantity) || 0,
      sold_quantity: Number(payload.sold_quantity) || 0,
      isSold: payload.isSold === true,
      expiry_date: payload.expiry_date || null,
      updatedAt: new Date().toISOString(),
    }

    if (payload.id) {
      try {
        const productRef = doc(db, 'products', payload.id)
        await updateDoc(productRef, normalizedPayload)
        products.value = products.value.map((product) =>
          product.id === payload.id
            ? { ...product, ...normalizedPayload }
            : product,
        )
        showProductForm.value = false
        editingProduct.value = null
        showToast('Produto atualizado com sucesso!', 'success')
      } catch (error) {
        console.error('Erro ao atualizar produto no Firestore:', error)
        showToast('Não foi possível atualizar o produto.', 'error')
      }
      return
    }

    const createdPayload = {
      ...normalizedPayload,
      ownerId,
      ownerName: user.value?.name || user.value?.username || null,
      ownerEmail: auth.currentUser?.email || user.value?.email || null,
      createdAt: new Date().toISOString(),
    }

    try {
      const docRef = await addDoc(productsCollection, createdPayload)
      const createdProduct = {
        id: docRef.id,
        ...createdPayload,
      }

      products.value = [createdProduct, ...products.value]
      showProductForm.value = false
      showToast('Produto adicionado com sucesso no Firebase!', 'success')
    } catch (error) {
      console.error('Erro ao criar produto no Firestore:', error)
      try {
        const response = await api.post('/products', payload)
        const createdProduct = response.data?.product

        if (createdProduct) {
          products.value = [createdProduct, ...products.value]
        }

        showProductForm.value = false
        showToast('Produto adicionado com sucesso!', 'success')
      } catch (fallbackError) {
        console.error('Erro ao criar produto no backend:', fallbackError)
        const fallbackProduct = {
          id: Date.now(),
          ...createdPayload,
        }
        products.value = [fallbackProduct, ...products.value]
        showProductForm.value = false
        showToast('Produto adicionado localmente na loja.', 'success')
      }
    }
  }

  const refreshProducts = async () => {
    await loadProducts()
    showToast('Produtos atualizados!', 'success')
  }

  const closeProductForm = () => {
    showProductForm.value = false
    editingProduct.value = null
  }

  const deleteProduct = async (product) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return

    try {
      const productRef = doc(db, 'products', product.id)
      await deleteDoc(productRef)
      products.value = products.value.filter((item) => item.id !== product.id)
      showToast('Produto excluído com sucesso.', 'success')
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
      showToast('Não foi possível excluir o produto.', 'error')
    }
  }

  const toggleSoldStatus = async (product) => {
    try {
      const productRef = doc(db, 'products', product.id)
      await updateDoc(productRef, {
        isSold: !product.isSold,
        updatedAt: new Date().toISOString(),
      })
      product.isSold = !product.isSold
      showToast(
        product.isSold
          ? 'Produto marcado como vendido.'
          : 'Produto reaberto para venda.',
        'success',
      )
    } catch (error) {
      console.error('Erro ao atualizar status de vendido:', error)
      showToast('Não foi possível atualizar o status do produto.', 'error')
    }
  }

  const openChat = async (product) => {
    const sellerId =
      product.ownerId ||
      product.owner_id ||
      product.createdBy ||
      product.created_by ||
      product.userId ||
      product.seller_id

    if (!auth.currentUser) {
      showToast('Entre na sua conta para iniciar uma conversa.', 'info')
      return
    }

    if (!sellerId) {
      try {
        const supportConfig = await getDoc(doc(db, 'support', 'config'))
        const supportUid = supportConfig.data()?.uid

        if (!supportConfig.exists() || !supportUid) {
          showToast('O suporte ainda não foi configurado.', 'warning')
          return
        }

        router.push({
          name: 'chat',
          query: {
            seller_id: supportUid,
            listing_id: product.id,
            seller_name: 'Suporte Mercado Certo',
            listing_title: product.name,
            listing_category: product.category,
            listing_price: product.price,
          },
        })
      } catch (error) {
        console.error('Erro ao abrir suporte:', error)
        showToast('Não foi possível abrir o suporte.', 'warning')
      }
      return
    }

    activeChatProduct.value = { ...product }
    showChat.value = true
  }

  const closeChat = () => {
    showChat.value = false
    activeChatProduct.value = null
  }

  const setSelectedCategory = (category) => {
    selectedCategory.value = category
  }

  const isCategorySelected = (categoryTitle) => {
    if (selectedCategory.value === 'all') {
      return categoryTitle === 'all'
    }
    return (
      normalizeCategoryValue(categoryTitle) ===
      normalizeCategoryValue(selectedCategory.value)
    )
  }

  const handleSearch = () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {}, 300)
  }

  const showAllCategories = () => {
    setSelectedCategory('all')
  }

  // Product preview
  const handleBuy = (product) => {
    if (!isLoggedIn.value) {
      openDrawer('login')
      showToast('Entre para comprar este card.', 'info')
      return
    }
    if (isOwnedByCurrentUser(product)) {
      showToast('Este card pertence à sua conta.', 'info')
      return
    }
    if (product.stock_quantity === 0) {
      showToast('Produto esgotado!', 'error')
      return
    }
    selectedProduct.value = product
  }

  const closePreview = () => {
    selectedProduct.value = null
  }

  const addToCart = (product) => {
    if (!isLoggedIn.value) {
      closePreview()
      openDrawer('login')
      showToast('Entre para comprar este card.', 'info')
      return
    }
    if (isOwnedByCurrentUser(product)) {
      showToast('Você não pode comprar o próprio card.', 'info')
      return
    }
    if (product.stock_quantity === 0) {
      showToast('Produto esgotado!', 'error')
      return
    }
    showToast(`${product.name} adicionado ao carrinho! 🛒`, 'success')
    closePreview()
  }

  const toggleColorSelection = (productId, color) => {
    const current = selectedMeta.value[productId] || {
      quantity: 0,
      color: null,
    }
    selectedMeta.value = {
      ...selectedMeta.value,
      [productId]: {
        ...current,
        color: current.color === color ? null : color,
      },
    }
  }

  // Auth
  const refreshProfile = async () => {
    if (!user.value) {
      loadingProfile.value = false
      return
    }

    loadingProfile.value = true
    profileError.value = ''

    try {
      await getProfile()
      lastUpdated.value = new Date().toLocaleTimeString('pt-BR')
    } catch (error) {
      profileError.value = 'Erro ao atualizar perfil. Verifique sua conexão.'
    } finally {
      loadingProfile.value = false
    }
  }

  const handleAuthSuccess = async () => {
    showDrawer.value = false
    await refreshProfile()
    showToast('Login realizado com sucesso! 👋', 'success')
  }

  const handleAuthError = (error) => {
    const message =
      typeof error === 'string'
        ? error
        : error?.message || 'Erro na autenticação'
    showToast(message, 'error')
  }

  const handleSwitchMode = (mode) => {
    authMode.value = mode
  }

  const openDrawer = (mode = 'login') => {
    drawerMode.value = 'auth'
    authMode.value = mode
    showDrawer.value = true
    document.body.style.overflow = 'hidden'
  }

  const openProfileDrawer = () => {
    drawerMode.value = 'profile'
    showDrawer.value = true
    document.body.style.overflow = 'hidden'
  }

  const closeDrawer = () => {
    showDrawer.value = false
    document.body.style.overflow = ''
  }

  const goToSettings = () => {
    closeDrawer()
    router.push('/settings')
  }

  const handleLogout = async () => {
    if (!confirm('Tem certeza que deseja sair da sua conta?')) return

    try {
      await logout()
      closeDrawer()
      showToast('Você saiu da conta.', 'info')
      router.push('/')
    } catch (error) {
      showToast('Erro ao sair da conta.', 'error')
    }
  }

  // Toast
  const showToast = (message, type = 'success') => {
    clearTimeout(toastTimeout.value)
    toastMessage.value = message
    toastType.value = type

    toastTimeout.value = setTimeout(() => {
      clearToast()
    }, 4000)
  }

  const clearToast = () => {
    toastMessage.value = ''
    clearTimeout(toastTimeout.value)
  }

  const loadNotifications = async () => {
    const userId = auth.currentUser?.uid || currentUserId.value
    if (!userId) return

    try {
      const snapshot = await getDocs(
        query(
          collection(db, 'notifications'),
          where('recipientId', '==', userId),
        ),
      )
      notifications.value = snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .filter((item) => item.read !== true)
        .sort((a, b) =>
          String(b.createdAt || '').localeCompare(String(a.createdAt || '')),
        )
    } catch (error) {
      console.warn('Não foi possível carregar notificações:', error.message)
    }
  }

  const subscribeToNotifications = () => {
    const userId = auth.currentUser?.uid || currentUserId.value
    if (!userId) return

    notificationsUnsubscribe?.()
    notificationsUnsubscribe = onSnapshot(
      query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId),
      ),
      (snapshot) => {
        notifications.value = snapshot.docs
          .map((item) => ({ id: item.id, ...item.data() }))
          .filter((item) => item.read !== true)
          .sort((a, b) =>
            String(b.createdAt || '').localeCompare(String(a.createdAt || '')),
          )
      },
      (error) =>
        console.warn('Não foi possível observar notificações:', error.message),
    )
  }

  const clearNotifications = async () => {
    await Promise.all(
      notifications.value.map((notification) =>
        updateDoc(doc(db, 'notifications', notification.id), { read: true }),
      ),
    )
    notifications.value = []
  }

  const openNotification = (notification) => {
    if (!notification.conversationId || !notification.senderId) return

    router.push({
      name: 'chat',
      query: {
        seller_id: notification.senderId,
        listing_id: notification.listingId,
        listing_title: notification.listingName,
        seller_name: notification.senderName || 'usuário',
      },
    })
  }

  // Lifecycle
  onMounted(async () => {
    // Probe candidate backends and set the working baseURL
    try {
      const chosen = await initApi()
      if (!chosen) {
        console.warn('Backend local indisponível')
      } else {
        console.log(
          'Backend configurado:',
          chosen.base,
          chosen.skipped ? '(verificação remota desativada)' : chosen.status,
        )
      }
    } catch (e) {
      console.warn('initApi error', e)
    }

    const authenticated = await checkAuth()
    await loadProducts()

    if (authenticated) {
      await refreshProfile()
      await loadNotifications()
      subscribeToNotifications()
    } else {
      loadingProfile.value = false
    }

    refreshTimer = window.setInterval(() => {
      refreshProfile()
    }, 30000)
  })

  onBeforeUnmount(() => {
    notificationsUnsubscribe?.()
    if (refreshTimer) {
      window.clearInterval(refreshTimer)
    }
    if (toastTimeout.value) {
      clearTimeout(toastTimeout.value)
    }
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    document.body.style.overflow = ''
  })

  // Watch
  watch(filteredProducts, (next) => {
    if (!selectedProduct.value) return
    const stillVisible = next.some(
      (product) => product.id === selectedProduct.value.id,
    )
    if (!stillVisible) {
      selectedProduct.value = null
    }
  })
</script>

<style scoped>
  /* === SCROLLBAR INVISÍVEL === */
  .dashboard::-webkit-scrollbar,
  .main-content::-webkit-scrollbar,
  .category-scroll::-webkit-scrollbar {
    width: 0;
    height: 0;
    background: transparent;
  }
  .dashboard,
  .main-content,
  .category-scroll {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .dashboard {
    min-height: 100vh;
    background: #eefaf1;
  }

  /* === NAVBAR PREMIUM === */
  .navbar-premium {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(22, 163, 74, 0.08);
    box-shadow: 0 4px 24px rgba(15, 23, 42, 0.06);
    padding: 6px 14px;
  }

  .navbar-inner {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .navbar-left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  .brand-mark {
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    background: linear-gradient(135deg, #16a34a, #22c55e);
    border-radius: 12px;
    color: white;
    font-size: 18px;
    box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
  }

  .brand-mark:hover {
    transform: scale(1.05) rotate(-5deg);
    box-shadow: 0 6px 20px rgba(22, 163, 74, 0.35);
  }

  .brand-copy {
    display: flex;
    flex-direction: column;
  }

  .header-tag {
    color: #16a34a;
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }

  .brand-copy strong {
    color: #14532d;
    font-size: 18px;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  /* Brand name letter animation */
  .brand-name {
    display: inline-block;
    white-space: nowrap;
  }

  .brand-letter {
    display: inline-block;
    opacity: 0;
    transform-origin: 50% 50%;
    color: #14532d;
    will-change: transform, opacity;
    /* two animations: initial pop-in, then continuous "worm" wave */
    animation-name: brandPop, worm;
    animation-duration: 480ms, 1200ms;
    animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1), ease-in-out;
    animation-delay: var(--delay), calc(var(--delay) + 480ms);
    animation-fill-mode: forwards, both;
    animation-iteration-count: 1, infinite;
    animation-direction: normal, alternate;
  }

  .brand-name:hover .brand-letter {
    filter: drop-shadow(0 4px 8px rgba(22, 163, 74, 0.12));
  }

  @keyframes brandPop {
    0% {
      opacity: 0;
      transform: translateY(8px) rotate(-6deg) scaleX(0.95);
    }
    60% {
      opacity: 1;
      transform: translateY(-2px) rotate(2deg) scaleX(1.05);
    }
    100% {
      opacity: 1;
      transform: translateY(0) rotate(0deg) scaleX(1);
    }
  }

  /* Worm-like continuous wave */
  @keyframes worm {
    0% {
      transform: translateY(0px) rotate(0deg) skewX(0deg) scaleX(1);
    }
    25% {
      transform: translateY(-6px) rotate(-6deg) skewX(-6deg) scaleX(1.05);
    }
    50% {
      transform: translateY(0px) rotate(0deg) skewX(0deg) scaleX(0.98);
    }
    75% {
      transform: translateY(6px) rotate(6deg) skewX(6deg) scaleX(1.02);
    }
    100% {
      transform: translateY(0px) rotate(0deg) skewX(0deg) scaleX(1);
    }
  }

  .vip-label {
    display: inline-block;
    margin-top: 6px;
    margin-left: 8px;
    background: linear-gradient(90deg, #fff7ed, #fff3e0);
    color: #92400e;
    border: 1px solid rgba(245, 158, 11, 0.12);
    padding: 4px 8px;
    border-radius: 999px;
    font-weight: 800;
    font-size: 11px;
    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.08);
  }

  .navbar-center {
    flex: 1;
    max-width: 480px;
    min-width: 160px;
  }

  .search-box {
    position: relative;
    width: 100%;
  }

  .search-box input {
    width: 100%;
    border: 1px solid rgba(22, 163, 74, 0.15);
    border-radius: 999px;
    padding: 8px 40px 8px 14px;
    font-size: 13px;
    background: rgba(255, 255, 255, 0.9);
    color: #14532d;
    box-shadow: 0 2px 8px rgba(22, 163, 74, 0.04);
    transition: all 0.3s ease;
  }

  .search-box input:focus {
    border-color: #16a34a;
    box-shadow: 0 4px 16px rgba(22, 163, 74, 0.12);
    outline: none;
    background: white;
  }

  .search-box input::placeholder {
    color: #94a3b8;
  }

  .btn-search {
    position: absolute;
    right: 6px;
    top: 50%;
    transform: translateY(-50%);
    border: none;
    background: linear-gradient(135deg, #16a34a, #22c55e);
    color: white;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s ease;
    box-shadow:
      0 2px 8px rgba(22, 163, 74, 0.16),
      0 0 0 6px rgba(245, 158, 11, 0.02);
  }

  .btn-search:hover {
    transform: translateY(-50%) scale(1.05);
    box-shadow: 0 4px 16px rgba(22, 163, 74, 0.3);
  }

  .btn-search:active {
    transform: translateY(-50%) scale(0.95);
  }

  .chat-drawer {
    width: min(460px, 100%);
    max-height: 90vh;
    background: #ffffff;
    border-radius: 24px;
    box-shadow: 0 24px 80px rgba(15, 23, 42, 0.22);
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .floating-chat {
    width: min(860px, calc(100vw - 32px));
    height: min(720px, calc(100dvh - 32px));
    max-height: calc(100dvh - 32px);
    padding: 12px;
  }

  .floating-chat :deep(.chat-container) {
    width: 100%;
    max-width: none;
    height: 100%;
    min-height: 0;
    border-radius: 14px;
    box-shadow: none;
  }

  .chat-header {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 12px;
  }

  .chat-subtitle {
    margin: 0;
    color: #64748b;
    font-size: 0.95rem;
  }

  .chat-body {
    display: flex;
    flex-direction: column;
    gap: 16px;
    flex: 1;
    overflow: hidden;
  }

  @media (max-width: 600px) {
    .floating-chat {
      width: 100vw;
      height: 100dvh;
      max-height: 100dvh;
      padding: 0;
      border-radius: 0;
    }

    .floating-chat .drawer-close {
      z-index: 2;
      top: 8px;
      right: 8px;
    }
  }

  .chat-product-card {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 16px;
    padding: 16px;
    display: grid;
    gap: 4px;
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-right: 6px;
  }

  .chat-message {
    padding: 12px 14px;
    border-radius: 16px;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    word-break: break-word;
  }

  .chat-sender {
    font-weight: 700;
    display: block;
    margin-bottom: 4px;
  }

  .chat-input-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 10px;
    align-items: center;
  }

  .chat-input-row input {
    width: 100%;
    border: 1px solid #cbd5e1;
    border-radius: 14px;
    padding: 12px 14px;
    font: inherit;
    background: #f8fafc;
  }

  .chat-loading,
  .chat-empty {
    color: #64748b;
    text-align: center;
    padding: 20px 0;
  }

  .navbar-right {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  .app-nav {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .app-nav-link {
    padding: 8px 10px;
    border-radius: 8px;
    color: #14532d;
    font-size: 13px;
    font-weight: 700;
    text-decoration: none;
  }

  .app-nav-link:hover,
  .app-nav-link.router-link-active {
    background: rgba(22, 163, 74, 0.08);
    color: #15803d;
  }

  .user-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px 6px 10px;
    border-radius: 999px;
    background: rgba(22, 163, 74, 0.06);
    border: 1px solid rgba(22, 163, 74, 0.08);
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .user-chip:hover {
    background: rgba(22, 163, 74, 0.12);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(22, 163, 74, 0.1);
  }

  .user-avatar {
    font-size: 18px;
  }

  .user-name {
    font-weight: 600;
    color: #14532d;
    font-size: 13px;
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-badge {
    color: #6b7280;
    font-size: 10px;
  }

  .btn-login,
  .btn-register {
    padding: 8px 18px;
    border: none;
    border-radius: 999px;
    font-weight: 700;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-login {
    background: transparent;
    color: #16a34a;
    border: 1px solid rgba(22, 163, 74, 0.2);
  }

  .btn-login:hover {
    background: rgba(22, 163, 74, 0.06);
    transform: translateY(-1px);
  }

  .btn-register {
    background: linear-gradient(135deg, #16a34a, #22c55e);
    color: white;
    box-shadow: 0 4px 12px rgba(22, 163, 74, 0.2);
  }

  .btn-register:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(22, 163, 74, 0.3);
  }

  .btn-register:active {
    transform: translateY(0);
  }

  /* Navbar Categories */
  .navbar-categories {
    max-width: 1200px;
    margin: 6px auto 0;
    padding: 0 4px;
  }

  /* Centered, larger search and chips layout for VIP header (option 3) */
  .navbar-center {
    flex: 1;
    max-width: 760px;
    min-width: 160px;
    display: flex;
    justify-content: center;
  }

  .search-box.search-center {
    width: 100%;
    max-width: 680px;
  }

  .centered-categories {
    display: flex;
    justify-content: center;
  }

  @media (max-width: 820px) {
    .navbar-inner {
      gap: 8px;
      align-items: flex-start;
    }

    .navbar-left {
      flex: 0 0 auto;
    }

    .navbar-center {
      order: 3;
      width: 100%;
      max-width: none;
      margin-top: 8px;
    }

    .navbar-right {
      order: 2;
    }

    .centered-categories {
      order: 4;
      padding-bottom: 8px;
    }

    .search-box.search-center {
      max-width: 100%;
      padding: 0 12px;
    }
  }

  .category-scroll {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding: 2px 0 6px;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .category-scroll::-webkit-scrollbar {
    display: none;
  }

  .nav-chip {
    border: none;
    background: rgba(22, 163, 74, 0.06);
    color: #14532d;
    border-radius: 999px;
    padding: 5px 12px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
  }

  .nav-chip:hover {
    background: rgba(22, 163, 74, 0.12);
    transform: translateY(-1px);
  }

  .nav-chip.active {
    background: linear-gradient(135deg, #16a34a, #22c55e);
    color: white;
    box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
  }

  /* Small refinement: VIP aura on header without visual pollution */
  .navbar-premium .brand-mark::after {
    content: '';
    position: absolute;
    width: 54px;
    height: 54px;
    left: 10px;
    top: 6px;
    border-radius: 14px;
    background: linear-gradient(
      90deg,
      rgba(245, 158, 11, 0.03),
      rgba(34, 197, 94, 0.02)
    );
    pointer-events: none;
  }

  /* === HERO BANNER === */
  .notifications-panel {
    width: min(1180px, calc(100% - 40px));
    margin: 18px auto 0;
    padding: 16px;
    border: 1px solid #f2d19d;
    border-radius: 12px;
    background: #fff9ed;
    color: #6f4b1e;
  }

  .notifications-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .notifications-heading button {
    border: 0;
    background: transparent;
    color: #8c5b1f;
    cursor: pointer;
    font: inherit;
    font-size: 0.85rem;
    font-weight: 700;
  }

  .notification-item {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #f2d19d;
    cursor: pointer;
  }

  .notification-item p {
    margin: 4px 0 0;
    line-height: 1.45;
  }

  .hero-banner {
    max-width: 1200px;
    margin: 16px auto 0;
    padding: 20px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    border-radius: 24px;
    background: linear-gradient(135deg, #ffffff 0%, #f2fdf4 100%);
    border: 1px solid rgba(22, 163, 74, 0.12);
    box-shadow: 0 8px 32px rgba(15, 23, 42, 0.04);
  }

  .hero-copy {
    max-width: 640px;
  }

  .hero-kicker {
    margin: 0 0 6px;
    color: #16a34a;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .hero-copy h2 {
    margin: 0 0 8px;
    color: #14532d;
    font-size: 22px;
    font-weight: 800;
  }

  .hero-copy p {
    margin: 0;
    color: #475569;
    font-size: 14px;
    line-height: 1.6;
  }

  .hero-card {
    min-width: 200px;
    padding: 16px 20px;
    border-radius: 16px;
    background: linear-gradient(135deg, #ecfdf5, #f8fff9);
    border: 1px solid rgba(22, 163, 74, 0.14);
    display: grid;
    gap: 6px;
    box-shadow: 0 4px 12px rgba(22, 163, 74, 0.04);
  }

  .hero-card-label {
    color: #16a34a;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .hero-card strong {
    color: #14532d;
    font-size: 15px;
    line-height: 1.4;
  }

  /* === MAIN CONTENT === */
  .main-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 16px 20px 32px;
  }

  /* === PRODUCT SECTION === */
  .product-section {
    margin-top: 8px;
  }

  .product-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .product-header strong {
    display: block;
    font-size: 17px;
    color: #14532d;
  }

  .product-header span {
    display: block;
    color: #4b5563;
    font-size: 12px;
  }

  .product-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .product-count {
    color: #4b5563;
    font-size: 13px;
    background: rgba(22, 163, 74, 0.06);
    padding: 4px 14px;
    border-radius: 999px;
    font-weight: 600;
  }

  .link-button {
    border: none;
    background: transparent;
    color: #16a34a;
    font-weight: 700;
    cursor: pointer;
    font-size: 13px;
    padding: 6px 12px;
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  .link-button:hover {
    background: rgba(22, 163, 74, 0.06);
    transform: translateY(-1px);
  }

  .link-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  /* === PRODUCT GRID === */
  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
    align-items: start;
  }

  .product-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
    border: 1px solid rgba(15, 23, 42, 0.05);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    cursor: pointer;
  }

  .product-card:hover {
    transform: translateY(-4px);
    box-shadow:
      0 12px 32px rgba(15, 23, 42, 0.08),
      0 4px 12px rgba(22, 163, 74, 0.04);
  }

  .product-image {
    min-height: 100px;
    border-radius: 12px;
    background: linear-gradient(180deg, #f5f5f1 0%, #ffffff 100%);
    display: grid;
    place-items: center;
    position: relative;
    color: #374151;
    font-size: 32px;
    box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.03);
    overflow: hidden;
  }

  .product-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 4px 12px;
    border-radius: 999px;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    font-size: 11px;
    font-weight: 700;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  }

  .product-card-body {
    display: grid;
    gap: 6px;
  }

  .product-title {
    margin: 0;
    font-size: 15px;
    color: #0f172a;
    font-weight: 700;
  }

  .product-meta-badge {
    display: inline-flex;
    align-self: flex-start;
    padding: 4px 12px;
    border-radius: 999px;
    background: rgba(22, 163, 74, 0.08);
    color: #15803d;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .sold-badge {
    display: inline-flex;
    align-self: flex-start;
    padding: 5px 12px;
    border-radius: 999px;
    background: rgba(239, 68, 68, 0.12);
    color: #b91c1c;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .product-description {
    margin: 0;
    color: #475569;
    font-size: 12px;
    line-height: 1.5;
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .product-supplier {
    color: #374151;
    font-size: 12px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .supplier-label {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .supplier-chat-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 6px 10px;
    border: 1px solid rgba(22, 163, 74, 0.25);
    border-radius: 999px;
    background: rgba(22, 163, 74, 0.08);
    color: #166534;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .supplier-chat-btn:hover {
    background: rgba(22, 163, 74, 0.16);
    transform: translateY(-1px);
  }

  .product-colors {
    margin-top: 4px;
  }

  .product-colors small {
    display: block;
    color: #6b7280;
    font-size: 11px;
    margin-bottom: 4px;
  }

  .color-list {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .product-meta-chip {
    border: 1px solid rgba(22, 163, 74, 0.12);
    background: #ffffff;
    color: #14532d;
    border-radius: 999px;
    padding: 4px 12px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .product-meta-chip:hover {
    background: rgba(22, 163, 74, 0.06);
    transform: translateY(-1px);
  }

  .product-meta-chip.selected {
    background: linear-gradient(135deg, #dcfce7, #bbf7d0);
    border-color: #16a34a;
    box-shadow: 0 2px 8px rgba(22, 163, 74, 0.15);
  }

  .price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .reference-price {
    color: #6b7280;
    font-size: 11px;
    text-decoration: line-through;
    margin-right: 6px;
  }

  .product-price {
    color: #16a34a;
    font-weight: 900;
    font-size: 18px;
  }

  .stock-note {
    color: #4b5563;
    font-size: 11px;
    padding: 2px 10px;
    border-radius: 999px;
    background: rgba(22, 163, 74, 0.06);
  }

  .stock-note.out-of-stock {
    color: #dc2626;
    background: #fef2f2;
  }

  .product-card-footer {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 4px;
  }

  .btn-buy {
    border: none;
    border-radius: 999px;
    padding: 8px 18px;
    background: linear-gradient(135deg, #16a34a, #22c55e);
    color: white;
    font-weight: 700;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.3s ease;
    flex: 1;
    box-shadow: 0 2px 8px rgba(22, 163, 74, 0.15);
  }

  .btn-buy:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(22, 163, 74, 0.25);
  }

  .btn-buy:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
  }

  .btn-buy:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .btn-secondary {
    border: 1px solid rgba(22, 163, 74, 0.12);
    background: white;
    color: #14532d;
    border-radius: 999px;
    padding: 8px 16px;
    font-weight: 700;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-secondary:hover {
    background: rgba(22, 163, 74, 0.04);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
  }

  .btn-chat {
    border: 1px solid rgba(34, 197, 94, 0.2);
    background: rgba(34, 197, 94, 0.12);
    color: #15803d;
    border-radius: 999px;
    padding: 10px 16px;
    font-weight: 700;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-chat:hover {
    background: rgba(34, 197, 94, 0.18);
    transform: translateY(-1px);
  }

  .preview-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 18px;
  }

  .preview-buy-row .btn-buy {
    width: 100%;
    padding: 14px 20px;
    font-size: 16px;
  }

  .preview-secondary-row {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .preview-chat-btn {
    flex: 1 1 auto;
  }

  .preview-secondary-row .btn-secondary {
    flex: 0 0 auto;
  }

  .rating-stars {
    color: #f59e0b;
    margin-right: 4px;
  }

  .rating-value {
    color: #4b5563;
    font-size: 12px;
  }

  /* === SKELETON === */
  .product-skeleton {
    padding: 12px;
    border-radius: 16px;
    background: white;
    border: 1px solid rgba(15, 23, 42, 0.05);
  }

  .skeleton-image {
    width: 100%;
    height: 100px;
    border-radius: 12px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  .skeleton-line {
    height: 12px;
    border-radius: 6px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    margin-top: 8px;
  }

  .skeleton-line.short {
    width: 60%;
  }

  .skeleton-line.medium {
    width: 80%;
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  /* === EMPTY STATE === */
  .empty-state {
    grid-column: 1 / -1;
    color: #475569;
    font-size: 14px;
    padding: 32px;
    border-radius: 16px;
    background: #f8fdf5;
    border: 1px dashed rgba(22, 163, 74, 0.18);
    text-align: center;
    display: grid;
    gap: 8px;
  }

  .empty-state strong {
    color: #14532d;
  }

  /* === ERROR BANNER === */
  .error-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 18px;
    border-radius: 12px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
    font-size: 14px;
    margin-bottom: 12px;
  }

  .error-icon {
    font-size: 18px;
  }

  .btn-retry {
    padding: 4px 18px;
    border: 1px solid #dc2626;
    border-radius: 999px;
    background: transparent;
    color: #dc2626;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-left: auto;
  }

  .btn-retry:hover {
    background: #dc2626;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
  }

  /* === PREVIEW MODAL === */
  .purchase-preview {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    background: rgba(15, 23, 42, 0.5);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    padding: 24px;
    z-index: 200;
    animation: fadeIn 0.3s ease;
  }

  .preview-card {
    width: min(560px, 100%);
    max-height: calc(100vh - 48px);
    overflow-y: auto;
    padding: 28px;
    border-radius: 28px;
    background: white;
    border: 1px solid rgba(22, 163, 74, 0.12);
    box-shadow: 0 32px 80px rgba(15, 23, 42, 0.2);
    animation: floatIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .preview-card::-webkit-scrollbar {
    width: 0;
    height: 0;
    background: transparent;
  }
  .preview-card {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .preview-top {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 18px;
  }

  .preview-store {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
  }

  .preview-store-chip {
    display: inline-flex;
    padding: 4px 12px;
    border-radius: 999px;
    background: rgba(22, 163, 74, 0.08);
    color: #15803d;
    font-size: 11px;
    font-weight: 700;
  }

  .preview-sold {
    color: #4b5563;
    font-size: 12px;
  }

  .btn-close-preview {
    border: none;
    background: rgba(22, 163, 74, 0.06);
    color: #14532d;
    font-size: 20px;
    cursor: pointer;
    font-weight: 700;
    padding: 4px 14px;
    border-radius: 999px;
    transition: all 0.3s ease;
  }

  .btn-close-preview:hover {
    background: rgba(22, 163, 74, 0.12);
    transform: rotate(90deg);
  }

  .preview-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 18px;
    align-items: start;
  }

  .preview-image {
    min-height: 160px;
    border-radius: 18px;
    background: linear-gradient(180deg, #f5f5f1 0%, #ffffff 100%);
    display: grid;
    place-items: center;
    color: #374151;
    font-size: 56px;
    box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.04);
  }

  .preview-info {
    display: grid;
    gap: 10px;
  }

  .preview-title {
    margin: 0;
    font-size: 20px;
    color: #111827;
    line-height: 1.25;
  }

  .preview-description {
    margin: 0;
    color: #475569;
    font-size: 14px;
    line-height: 1.65;
  }

  .preview-price-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .preview-tag {
    color: #16a34a;
    font-size: 12px;
    font-weight: 700;
    background: rgba(22, 163, 74, 0.08);
    padding: 4px 12px;
    border-radius: 999px;
  }

  .installment-text {
    margin: 0;
    color: #4b5563;
    font-size: 13px;
  }

  .preview-details {
    display: grid;
    gap: 4px;
  }

  .preview-shipping,
  .preview-stock {
    margin: 0;
    color: #4b5563;
    font-size: 13px;
  }

  .preview-stock.out-of-stock {
    color: #dc2626;
  }

  .preview-meta {
    display: grid;
    gap: 6px;
    font-size: 13px;
    color: #4b5563;
  }

  .preview-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .preview-actions .btn-buy {
    flex: 1;
    min-width: 120px;
  }

  .coupon-chip {
    display: inline-flex;
    padding: 8px 14px;
    border-radius: 12px;
    background: linear-gradient(135deg, #eff6ff, #dbeafe);
    color: #1d4ed8;
    font-size: 12px;
    font-weight: 700;
    border: 1px solid #bfdbfe;
    margin-top: 4px;
  }

  /* === DRAWER === */
  .drawer-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: grid;
    place-items: center;
    z-index: 300;
    padding: 20px;
    animation: fadeIn 0.3s ease;
  }

  .auth-drawer {
    width: min(560px, calc(100vw - 48px));
    max-width: 560px;
    max-height: calc(100vh - 80px);
    overflow-y: auto;
    background: rgba(248, 255, 250, 0.98);
    border: 1px solid rgba(255, 255, 255, 0.9);
    border-radius: 48px;
    padding: 34px 28px 28px;
    box-shadow: 0 36px 120px rgba(15, 23, 42, 0.2);
    backdrop-filter: blur(30px);
    -webkit-backdrop-filter: blur(30px);
    position: relative;
    animation: floatIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .auth-drawer::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none;
  }
  .auth-drawer {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .drawer-close {
    position: absolute;
    top: 18px;
    right: 18px;
    width: 44px;
    height: 44px;
    border: none;
    background: rgba(255, 255, 255, 0.9);
    color: #334155;
    border-radius: 50%;
    font-size: 22px;
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
    transition: all 0.3s ease;
  }

  .drawer-close:hover {
    transform: scale(1.05) rotate(90deg);
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
  }

  .drawer-header {
    margin-bottom: 20px;
  }

  .drawer-title {
    margin: 0;
    color: #14532d;
    font-size: 22px;
    font-weight: 800;
  }

  .drawer-subtitle {
    margin: 8px 0 0;
    color: #4b5563;
    font-size: 14px;
  }

  /* Drawer Profile */
  .drawer-profile {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .profile-summary {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .profile-label {
    color: #4b5563;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 4px;
  }

  .profile-value {
    color: #0f172a;
    font-weight: 700;
    font-size: 14px;
  }

  .profile-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    flex-wrap: wrap;
  }

  .btn-logout {
    padding: 10px 24px;
    border: none;
    border-radius: 999px;
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    color: white;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
  }

  .btn-logout:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(220, 38, 38, 0.3);
  }

  /* === TOAST === */
  .toast-container {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 9999;
    animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .toast {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 22px;
    border-radius: 18px;
    background: white;
    box-shadow: 0 20px 48px rgba(15, 23, 42, 0.15);
    border: 1px solid rgba(22, 163, 74, 0.12);
    min-width: 280px;
    max-width: 420px;
  }

  .toast.success {
    border-left: 4px solid #16a34a;
  }

  .toast.error {
    border-left: 4px solid #dc2626;
  }

  .toast.warning {
    border-left: 4px solid #f59e0b;
  }

  .toast.info {
    border-left: 4px solid #3b82f6;
  }

  .toast-icon {
    font-size: 20px;
    flex-shrink: 0;
  }

  .toast-message {
    flex: 1;
    color: #0f172a;
    font-size: 14px;
    font-weight: 500;
  }

  .toast-close {
    border: none;
    background: transparent;
    color: #94a3b8;
    font-size: 18px;
    cursor: pointer;
    padding: 0 4px;
    transition: all 0.3s ease;
  }

  .toast-close:hover {
    color: #475569;
    transform: rotate(90deg);
  }

  /* === ANIMATIONS === */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes floatIn {
    from {
      opacity: 0;
      transform: translateY(24px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(24px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* === TRANSITIONS === */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  /* === RESPONSIVE === */
  @media (max-width: 920px) {
    .navbar-center {
      max-width: 320px;
    }

    .brand-copy strong {
      font-size: 16px;
    }
  }

  @media (max-width: 720px) {
    .navbar-premium {
      padding: 8px 12px;
    }

    .navbar-inner {
      flex-wrap: wrap;
      gap: 10px;
    }

    .navbar-left {
      flex: 1;
    }

    .navbar-center {
      flex: 1 1 100%;
      order: 3;
      max-width: 100%;
    }

    .navbar-right {
      flex-shrink: 0;
    }

    .brand-copy span {
      display: none;
    }

    .brand-mark {
      width: 36px;
      height: 36px;
      font-size: 16px;
    }

    .brand-copy strong {
      font-size: 15px;
    }

    .user-name {
      max-width: 50px;
    }

    .btn-login,
    .btn-register {
      font-size: 12px;
      padding: 6px 14px;
    }

    .hero-banner {
      flex-direction: column;
      align-items: stretch;
      padding: 16px 18px;
      margin: 12px 12px 0;
    }

    .hero-card {
      min-width: unset;
    }

    .main-content {
      padding: 12px 12px 24px;
    }

    .product-actions {
      width: 100%;
      align-items: stretch;
      flex-wrap: wrap;
      gap: 6px;
    }

    .product-actions .link-button {
      flex: 1 1 auto;
      min-height: 40px;
      padding: 9px 10px;
      background: #f5fbf7;
      border: 1px solid #dce8df;
    }

    .product-actions .product-count {
      flex: 1 0 100%;
      text-align: center;
    }

    .profile-summary {
      grid-template-columns: 1fr;
    }

    .auth-drawer {
      padding: 24px 16px 20px;
      border-radius: 24px;
    }

    .drawer-close {
      top: 12px;
      right: 12px;
      width: 38px;
      height: 38px;
      font-size: 18px;
    }

    .toast-container {
      bottom: 16px;
      right: 16px;
      left: 16px;
    }

    .toast {
      min-width: unset;
      max-width: unset;
      width: 100%;
    }
  }

  @media (max-width: 480px) {
    .product-grid {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .product-card {
      padding: 10px;
    }

    .product-title {
      font-size: 13px;
    }

    .product-price {
      font-size: 15px;
    }

    .btn-buy,
    .btn-secondary {
      flex: 1 1 100%;
      min-height: 38px;
      font-size: 11px;
      padding: 6px 12px;
    }

    .preview-card {
      padding: 20px;
    }

    .preview-actions {
      flex-direction: column;
    }

    .preview-actions .btn-buy {
      min-width: unset;
    }
  }

  /* === ACCESSIBILITY === */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  :focus-visible {
    outline: 2px solid #16a34a;
    outline-offset: 2px;
  }
</style>
