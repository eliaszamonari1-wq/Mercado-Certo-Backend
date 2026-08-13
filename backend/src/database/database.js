import path from 'path'
import { open } from 'sqlite'
import sqlite3 from 'sqlite3'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dbPath = path.join(__dirname, '../../data/users.sqlite')

sqlite3.verbose()

let dbPromise = null

export async function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const database = await open({
        filename: dbPath,
        driver: sqlite3.Database,
      })

      // Habilitar chaves estrangeiras
      await database.exec('PRAGMA foreign_keys = ON')

      // Criar tabela users
      await database.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          is_active BOOLEAN DEFAULT 1
        )
      `)

      const userColumns = await database.all('PRAGMA table_info(users)')
      const existingUserColumns = userColumns.map((column) => column.name)

      if (!existingUserColumns.includes('is_admin')) {
        await database.exec(
          'ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0',
        )
      }
      if (!existingUserColumns.includes('is_seller')) {
        await database.exec(
          'ALTER TABLE users ADD COLUMN is_seller BOOLEAN DEFAULT 0',
        )
      }
      if (!existingUserColumns.includes('is_buyer')) {
        await database.exec(
          'ALTER TABLE users ADD COLUMN is_buyer BOOLEAN DEFAULT 1',
        )
      }

      await database.exec(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          category TEXT,
          supplier TEXT,
          supplier_contact TEXT,
          owner_id INTEGER,
          owner_name TEXT,
          color TEXT,
          price REAL DEFAULT 0,
          stock_quantity INTEGER DEFAULT 0,
          sold_quantity INTEGER DEFAULT 0,
          expiry_date TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          is_active BOOLEAN DEFAULT 1
        )
      `)

      const tableInfo = await database.all(`PRAGMA table_info(products)`)
      const existingColumns = tableInfo.map((column) => column.name)

      if (!existingColumns.includes('supplier_contact')) {
        await database.exec(
          `ALTER TABLE products ADD COLUMN supplier_contact TEXT`,
        )
      }
      if (!existingColumns.includes('owner_id')) {
        await database.exec(`ALTER TABLE products ADD COLUMN owner_id INTEGER`)
      }
      if (!existingColumns.includes('owner_name')) {
        await database.exec(`ALTER TABLE products ADD COLUMN owner_name TEXT`)
      }

      await database.exec(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_products_unique_name ON products(name);
        CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
        CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier);
      `)

      // Criar índices para performance
      await database.exec(`
        CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      `)

      // Inserir usuário admin padrão apenas em desenvolvimento
      if (process.env.NODE_ENV !== 'production') {
        const defaultAdmin = {
          username: process.env.DEFAULT_ADMIN_USERNAME || 'admin',
          email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@exemplo.com',
          password: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123!',
          name: process.env.DEFAULT_ADMIN_NAME || 'Administrador',
        }

        const bcrypt = await import('bcrypt')
        const hashedPassword = await bcrypt.hash(defaultAdmin.password, 10)
        await database.run(
          `INSERT OR IGNORE INTO users
           (username, email, password, name, is_admin, is_buyer)
           VALUES (?, ?, ?, ?, 1, 0)`,
          [
            defaultAdmin.username,
            defaultAdmin.email,
            hashedPassword,
            defaultAdmin.name,
          ],
        )

        await database.run(
          'UPDATE users SET is_admin = 1, is_buyer = 0 WHERE username = ?',
          [defaultAdmin.username],
        )

        console.log('✅ Banco de dados inicializado com sucesso!')
        console.log(`   Usuário padrão: ${defaultAdmin.username}`)
        console.log(`   Senha padrão: ${defaultAdmin.password}`)
        console.log('   Use essas credenciais para testar o login no painel.')

        await database.exec(`
          INSERT OR IGNORE INTO products (
            name,
            description,
            category,
            supplier,
            color,
            price,
            stock_quantity,
            sold_quantity,
            expiry_date
          ) VALUES
            ('Smartphone Verde', 'Smartphone com tela OLED, 128GB e bateria de longa duração.', 'Eletrônicos', 'BetaTech', 'Verde', 1799.9, 24, 3, '2026-12-31'),
            ('Bicicleta Urbana', 'Bicicleta confortável para cidade com quadro leve e freios a disco.', 'Transporte', 'Rolim Bike', 'Preto', 1299.5, 12, 1, '2027-06-30'),
            ('Caixa de Som Bluetooth', 'Caixa de som portátil com som estéreo e até 12 horas de bateria.', 'Áudio', 'SoundWave', 'Azul', 299.9, 35, 0, '2026-09-15')
        `)
      }

      return database
    })()
  }

  return dbPromise
}

export async function closeDb() {
  if (dbPromise) {
    const db = await dbPromise
    await db.close()
    dbPromise = null
    console.log('🔒 Conexão com banco de dados fechada')
  }
}
