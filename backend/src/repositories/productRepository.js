import { getDb } from '../database/database.js'
import { Product } from '../models/productModel.js'

export async function createProduct(data) {
  const database = await getDb()
  const result = await database.run(
    `INSERT INTO products (
      name,
      description,
      category,
      supplier,
      supplier_contact,
      owner_id,
      owner_name,
      color,
      price,
      stock_quantity,
      sold_quantity,
      expiry_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.name,
      data.description || null,
      data.category || null,
      data.supplier || null,
      data.supplier_contact || null,
      data.owner_id || null,
      data.owner_name || null,
      data.color || null,
      data.price || 0,
      data.stock_quantity || 0,
      data.sold_quantity || 0,
      data.expiry_date || null,
    ],
  )

  return await findProductById(result.lastID)
}

export async function findProductById(id) {
  const database = await getDb()
  const product = await database.get('SELECT * FROM products WHERE id = ?', [
    id,
  ])
  return product ? new Product(product) : null
}

export async function getAllProducts() {
  const database = await getDb()
  const products = await database.all('SELECT * FROM products ORDER BY id DESC')
  return products.map((product) => new Product(product))
}

export async function updateProduct(id, data) {
  const database = await getDb()
  const updates = []
  const values = []

  if (data.name !== undefined) {
    updates.push('name = ?')
    values.push(data.name)
  }
  if (data.description !== undefined) {
    updates.push('description = ?')
    values.push(data.description)
  }
  if (data.category !== undefined) {
    updates.push('category = ?')
    values.push(data.category)
  }
  if (data.supplier !== undefined) {
    updates.push('supplier = ?')
    values.push(data.supplier)
  }
  if (data.color !== undefined) {
    updates.push('color = ?')
    values.push(data.color)
  }
  if (data.price !== undefined) {
    updates.push('price = ?')
    values.push(data.price)
  }
  if (data.stock_quantity !== undefined) {
    updates.push('stock_quantity = ?')
    values.push(data.stock_quantity)
  }
  if (data.sold_quantity !== undefined) {
    updates.push('sold_quantity = ?')
    values.push(data.sold_quantity)
  }
  if (data.expiry_date !== undefined) {
    updates.push('expiry_date = ?')
    values.push(data.expiry_date)
  }
  if (data.supplier_contact !== undefined) {
    updates.push('supplier_contact = ?')
    values.push(data.supplier_contact)
  }
  if (data.owner_id !== undefined) {
    updates.push('owner_id = ?')
    values.push(data.owner_id)
  }
  if (data.owner_name !== undefined) {
    updates.push('owner_name = ?')
    values.push(data.owner_name)
  }
  if (data.is_active !== undefined) {
    updates.push('is_active = ?')
    values.push(data.is_active)
  }

  updates.push('updated_at = CURRENT_TIMESTAMP')
  values.push(id)

  await database.run(
    `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
    values,
  )

  return await findProductById(id)
}

export async function deleteProduct(id) {
  const database = await getDb()
  await database.run('DELETE FROM products WHERE id = ?', [id])
}
