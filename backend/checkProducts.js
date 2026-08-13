import path from 'path'
import { open } from 'sqlite'
import sqlite3 from 'sqlite3'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dbPath = path.join(__dirname, 'data', 'users.sqlite')

const db = await open({ filename: dbPath, driver: sqlite3.Database })
const row = await db.get(
  "SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='products'",
)
console.log('products table exists:', row.count)
if (row.count) {
  const products = await db.all(
    'SELECT id, name, category, supplier, color, price, stock_quantity, sold_quantity, expiry_date FROM products',
  )
  console.log('products count:', products.length)
  console.log('products sample:', products.slice(0, 5))
}
await db.close()
