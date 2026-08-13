import { getDb } from '../database/database.js'

const products = [
  {
    name: 'Smartphone Verde',
    description: 'Smartphone com tela OLED, 128GB e bateria de longa duração.',
    category: 'Eletrônicos',
    supplier: 'BetaTech',
    color: 'Verde',
    price: 1799.9,
    stock_quantity: 24,
    sold_quantity: 3,
    expiry_date: '2026-12-31',
  },
  {
    name: 'Bicicleta Urbana',
    description:
      'Bicicleta confortável para cidade com quadro leve e freios a disco.',
    category: 'Transporte',
    supplier: 'Rolim Bike',
    color: 'Preto',
    price: 1299.5,
    stock_quantity: 12,
    sold_quantity: 1,
    expiry_date: '2027-06-30',
  },
  {
    name: 'Caixa de Som Bluetooth',
    description:
      'Caixa de som portátil com som estéreo e até 12 horas de bateria.',
    category: 'Áudio',
    supplier: 'SoundWave',
    color: 'Azul',
    price: 299.9,
    stock_quantity: 35,
    sold_quantity: 0,
    expiry_date: '2026-09-15',
  },
  {
    name: 'Notebook Ultra',
    description:
      'Notebook leve para trabalho e estudo com desempenho ultrafino.',
    category: 'Eletrônicos',
    supplier: 'NovaCore',
    color: 'Cinza',
    price: 3499,
    stock_quantity: 8,
    sold_quantity: 2,
    expiry_date: '2027-03-10',
  },
  {
    name: 'Câmera Mirrorless',
    description:
      'Câmera profissional para fotos com qualidade premium e vídeo 4K.',
    category: 'Fotografia',
    supplier: 'LensPro',
    color: 'Preto',
    price: 4299,
    stock_quantity: 5,
    sold_quantity: 0,
    expiry_date: '2027-01-20',
  },
]

async function seedProducts() {
  const db = await getDb()

  for (const product of products) {
    await db.run(
      `INSERT OR IGNORE INTO products (
        name,
        description,
        category,
        supplier,
        color,
        price,
        stock_quantity,
        sold_quantity,
        expiry_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product.name,
        product.description,
        product.category,
        product.supplier,
        product.color,
        product.price,
        product.stock_quantity,
        product.sold_quantity,
        product.expiry_date,
      ],
    )
  }

  const rows = await db.all('SELECT * FROM products ORDER BY id DESC')
  console.log('✅ Produtos seedados:', rows.length)
  console.log(JSON.stringify(rows, null, 2))
  await db.close()
}

seedProducts().catch((error) => {
  console.error('Erro ao popular produtos:', error)
  process.exit(1)
})
