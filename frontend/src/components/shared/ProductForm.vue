<template>
  <div class="form-backdrop" @click.self="$emit('close')">
    <div class="product-form-card">
      <div class="form-header">
        <div>
          <p class="eyebrow">Loja</p>
          <h3>{{ isEditMode ? 'Editar produto' : 'Adicionar produto' }}</h3>
        </div>
        <button type="button" class="close-btn" @click="$emit('close')">
          ✕
        </button>
      </div>

      <form class="product-form" @submit.prevent="submitForm">
        <div class="field-grid">
          <label>
            <span>Nome</span>
            <input
              v-model="form.name"
              type="text"
              placeholder="Ex: Geladeira"
              required
            />
          </label>

          <label>
            <span>Categoria</span>
            <input
              v-model="form.category"
              type="text"
              placeholder="Ex: Eletrodomésticos"
              required
            />
          </label>

          <label>
            <span>Fornecedor</span>
            <input
              v-model="form.supplier"
              type="text"
              placeholder="Ex: Beta Market"
              required
            />
          </label>

          <label>
            <span>Contato do fornecedor</span>
            <input
              v-model="form.supplier_contact"
              type="text"
              placeholder="Ex: contato@fornecedor.com ou +5511999999999"
            />
          </label>

          <label>
            <span>Cor</span>
            <input
              v-model="form.color"
              type="text"
              placeholder="Ex: Preto"
              required
            />
          </label>

          <label>
            <span>Preço</span>
            <input
              v-model.number="form.price"
              type="number"
              min="0"
              step="0.01"
              required
            />
          </label>

          <label>
            <span>Estoque</span>
            <input
              v-model.number="form.stock_quantity"
              type="number"
              min="0"
              step="1"
              required
            />
          </label>
        </div>

        <label>
          <span>Descrição</span>
          <textarea
            v-model="form.description"
            rows="4"
            placeholder="Descreva o produto..."
          ></textarea>
        </label>

        <label>
          <span>Data de validade</span>
          <input v-model="form.expiry_date" type="date" />
        </label>

        <div class="actions">
          <button type="button" class="btn-secondary" @click="$emit('close')">
            Cancelar
          </button>
          <button type="submit" class="btn-primary">Salvar produto</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
  import { computed, reactive, watch } from 'vue'

  const props = defineProps({
    product: {
      type: Object,
      default: null,
    },
    mode: {
      type: String,
      default: 'create',
    },
  })

  const emit = defineEmits(['save', 'close'])

  const isEditMode = computed(() => props.mode === 'edit' && !!props.product)

  const form = reactive({
    name: '',
    description: '',
    category: '',
    supplier: '',
    supplier_contact: '',
    color: '',
    price: 0,
    stock_quantity: 0,
    expiry_date: '',
    isSold: false,
  })

  const resetForm = () => {
    form.name = ''
    form.description = ''
    form.category = ''
    form.supplier = ''
    form.supplier_contact = ''
    form.color = ''
    form.price = 0
    form.stock_quantity = 0
    form.expiry_date = ''
    form.isSold = false
  }

  const populateForm = (product) => {
    if (!product) {
      resetForm()
      return
    }

    form.name = product.name || ''
    form.description = product.description || ''
    form.category = product.category || ''
    form.supplier = product.supplier || ''
    form.supplier_contact = product.supplier_contact || ''
    form.color = product.color || ''
    form.price = Number(product.price) || 0
    form.stock_quantity = Number(product.stock_quantity) || 0
    form.expiry_date = product.expiry_date || ''
    form.isSold = product.isSold === true
  }

  watch(
    () => props.product,
    (product) => {
      if (product) {
        populateForm(product)
      } else {
        resetForm()
      }
    },
    { immediate: true },
  )

  const submitForm = () => {
    const payload = {
      ...form,
      description: form.description || 'Produto adicionado pela loja.',
      price: Number(form.price) || 0,
      stock_quantity: Number(form.stock_quantity) || 0,
      sold_quantity: Number(props.product?.sold_quantity || 0),
      isSold: form.isSold === true,
    }

    if (isEditMode.value && props.product?.id) {
      payload.id = props.product.id
    }

    emit('save', payload)
  }
</script>

<style scoped>
  .form-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .product-form-card {
    width: min(700px, 100%);
    max-height: calc(100vh - 40px);
    overflow-y: auto;
    overscroll-behavior: contain;
    background: #ffffff;
    border-radius: 22px;
    box-shadow: 0 26px 70px rgba(15, 23, 42, 0.24);
    padding: 24px;
    scrollbar-width: none;
  }

  .product-form-card::-webkit-scrollbar,
  .form-backdrop::-webkit-scrollbar {
    display: none;
    width: 0;
  }

  .form-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
  }

  .eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 11px;
    font-weight: 700;
    color: #16a34a;
    margin-bottom: 4px;
  }

  .form-header h3 {
    margin: 0;
    font-size: 1.7rem;
    color: #0f172a;
  }

  .close-btn {
    width: 38px;
    height: 38px;
    border: none;
    border-radius: 9px;
    background: #f1f5f9;
    cursor: pointer;
    font-size: 1.1rem;
  }

  .product-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .field-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-weight: 600;
    color: #334155;
  }

  input,
  textarea {
    width: 100%;
    border: 1px solid #dbe4ee;
    border-radius: 12px;
    padding: 12px 14px;
    font: inherit;
    background: #f8fafc;
  }

  input:focus,
  textarea:focus {
    outline: 2px solid rgba(22, 163, 74, 0.18);
    border-color: #16a34a;
  }

  textarea {
    resize: vertical;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 8px;
  }

  .btn-primary,
  .btn-secondary {
    padding: 12px 18px;
    border-radius: 12px;
    font-weight: 700;
    border: none;
    cursor: pointer;
  }

  .btn-primary {
    background: linear-gradient(135deg, #16a34a, #22c55e);
    color: white;
  }

  .btn-secondary {
    background: #e2e8f0;
    color: #0f172a;
  }

  @media (max-width: 640px) {
    .field-grid {
      grid-template-columns: 1fr;
    }

    .product-form-card {
      padding: 18px;
      max-height: calc(100vh - 24px);
    }
  }
</style>
