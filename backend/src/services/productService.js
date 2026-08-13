import {
  createProduct as createProductRepo,
  findProductById,
  getAllProducts,
  updateProduct as updateProductRepo,
} from '../repositories/productRepository.js'

export async function listProducts() {
  return await getAllProducts()
}

export async function createProduct(payload) {
  if (!payload?.name || !String(payload.name).trim()) {
    const error = new Error('Nome do produto é obrigatório.')
    error.statusCode = 400
    throw error
  }

  const sanitized = {
    name: String(payload.name).trim(),
    description: payload.description ?? '',
    category: payload.category ?? 'Sem categoria',
    supplier: payload.supplier ?? 'Fornecedor',
    supplier_contact: payload.supplier_contact ?? null,
    owner_id: payload.owner_id ?? null,
    owner_name: payload.owner_name ?? null,
    color: payload.color ?? 'Sem cor',
    price: Number(payload.price ?? 0),
    stock_quantity: Number(payload.stock_quantity ?? 0),
    sold_quantity: Number(payload.sold_quantity ?? 0),
    expiry_date: payload.expiry_date ?? null,
  }

  return await createProductRepo(sanitized)
}

export async function updateProduct(id, payload) {
  const product = await findProductById(id)

  if (!product) {
    const error = new Error('Produto não encontrado.')
    error.statusCode = 404
    throw error
  }

  const sanitized = {}

  if (payload.name !== undefined) sanitized.name = String(payload.name).trim()
  if (payload.description !== undefined)
    sanitized.description = payload.description
  if (payload.category !== undefined) sanitized.category = payload.category
  if (payload.supplier !== undefined) sanitized.supplier = payload.supplier
  if (payload.supplier_contact !== undefined)
    sanitized.supplier_contact = payload.supplier_contact
  if (payload.color !== undefined) sanitized.color = payload.color
  if (payload.price !== undefined) sanitized.price = Number(payload.price)
  if (payload.stock_quantity !== undefined)
    sanitized.stock_quantity = Number(payload.stock_quantity)
  if (payload.sold_quantity !== undefined)
    sanitized.sold_quantity = Number(payload.sold_quantity)
  if (payload.expiry_date !== undefined)
    sanitized.expiry_date = payload.expiry_date

  return await updateProductRepo(id, sanitized)
}
