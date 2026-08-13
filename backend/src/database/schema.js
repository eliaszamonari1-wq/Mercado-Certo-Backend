/**
 * Schema completo do Mercado Certo
 * Define todas as tabelas e índices necessários
 */

export const SCHEMA = {
  // Tabela de Usuários expandida
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      cpf_cnpj TEXT UNIQUE,
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zip_code TEXT,
      is_seller BOOLEAN DEFAULT 0,
      is_buyer BOOLEAN DEFAULT 1,
      is_admin BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT 1
    )
  `,

  // Tabela de Anúncios (Listings)
  listings: `
    CREATE TABLE IF NOT EXISTS listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      seller_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      subcategory TEXT,
      price REAL NOT NULL,
      images TEXT,
      videos TEXT,
      location TEXT,
      shipping_options TEXT,
      status TEXT DEFAULT 'active',
      payment_status TEXT DEFAULT 'active',
      views_count INTEGER DEFAULT 0,
      contacts_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      paused_at DATETIME,
      paused_reason TEXT,
      FOREIGN KEY(seller_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `,

  // Tabela de Links Externos (External Links - "Onde mais comprar")
  external_links: `
    CREATE TABLE IF NOT EXISTS external_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_id INTEGER NOT NULL,
      platform_name TEXT NOT NULL,
      platform_icon TEXT,
      url TEXT NOT NULL,
      display_text TEXT,
      link_type TEXT DEFAULT 'marketplace',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(listing_id) REFERENCES listings(id) ON DELETE CASCADE
    )
  `,

  // Tabela de Cobranças (Billing)
  billing: `
    CREATE TABLE IF NOT EXISTS billing (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      seller_id INTEGER NOT NULL,
      billing_month TEXT NOT NULL,
      active_listings_count INTEGER NOT NULL,
      amount REAL NOT NULL,
      due_date DATE NOT NULL,
      payment_status TEXT DEFAULT 'pending',
      payment_date DATETIME,
      payment_method TEXT,
      transaction_id TEXT,
      grace_period_end_date DATE,
      is_notified BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(seller_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(seller_id, billing_month)
    )
  `,

  // Tabela de Pagamentos (Payment Transactions)
  payments: `
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      billing_id INTEGER NOT NULL,
      seller_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      transaction_id TEXT UNIQUE,
      status TEXT DEFAULT 'pending',
      paid_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      metadata TEXT,
      FOREIGN KEY(billing_id) REFERENCES billing(id) ON DELETE CASCADE,
      FOREIGN KEY(seller_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `,

  // Tabela de Métodos de Pagamento (Payment Methods)
  payment_methods: `
    CREATE TABLE IF NOT EXISTS payment_methods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      seller_id INTEGER NOT NULL,
      card_token TEXT UNIQUE NOT NULL,
      card_last_four TEXT,
      card_brand TEXT,
      holder_name TEXT,
      is_default BOOLEAN DEFAULT 0,
      expires_at DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(seller_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `,

  // Tabela de Mensagens (Chat Messages)
  messages: `
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      listing_id INTEGER,
      subject TEXT,
      content TEXT NOT NULL,
      is_read BOOLEAN DEFAULT 0,
      read_at DATETIME,
      attachments TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(receiver_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(listing_id) REFERENCES listings(id) ON DELETE SET NULL
    )
  `,

  // Tabela de Conversas (Conversations)
  conversations: `
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      buyer_id INTEGER NOT NULL,
      seller_id INTEGER NOT NULL,
      listing_id INTEGER,
      last_message_id INTEGER,
      last_message_at DATETIME,
      buyer_last_seen DATETIME,
      seller_last_seen DATETIME,
      is_archived BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(buyer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(seller_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(listing_id) REFERENCES listings(id) ON DELETE SET NULL,
      UNIQUE(buyer_id, seller_id, listing_id)
    )
  `,

  // Tabela de Contatos (Contacts/Inquiries)
  contacts: `
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      buyer_id INTEGER NOT NULL,
      seller_id INTEGER NOT NULL,
      listing_id INTEGER NOT NULL,
      contact_type TEXT DEFAULT 'inquiry',
      message TEXT,
      status TEXT DEFAULT 'new',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(buyer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(seller_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(listing_id) REFERENCES listings(id) ON DELETE CASCADE
    )
  `,

  // Tabela de Histórico de Listagens (Listing History)
  listing_history: `
    CREATE TABLE IF NOT EXISTS listing_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      previous_status TEXT,
      new_status TEXT,
      reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(listing_id) REFERENCES listings(id) ON DELETE CASCADE
    )
  `,

  // Tabela de Notificações (Notifications)
  notifications: `
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT,
      message TEXT,
      related_id INTEGER,
      is_read BOOLEAN DEFAULT 0,
      read_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `,
}

export const INDEXES = {
  users: [
    'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)',
    'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
    'CREATE INDEX IF NOT EXISTS idx_users_is_seller ON users(is_seller)',
    'CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active)',
  ],
  listings: [
    'CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON listings(seller_id)',
    'CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category)',
    'CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status)',
    'CREATE INDEX IF NOT EXISTS idx_listings_payment_status ON listings(payment_status)',
    'CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at)',
  ],
  messages: [
    'CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id)',
    'CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id)',
    'CREATE INDEX IF NOT EXISTS idx_messages_listing_id ON messages(listing_id)',
    'CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read)',
    'CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)',
  ],
  conversations: [
    'CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON conversations(buyer_id)',
    'CREATE INDEX IF NOT EXISTS idx_conversations_seller_id ON conversations(seller_id)',
    'CREATE INDEX IF NOT EXISTS idx_conversations_listing_id ON conversations(listing_id)',
  ],
  billing: [
    'CREATE INDEX IF NOT EXISTS idx_billing_seller_id ON billing(seller_id)',
    'CREATE INDEX IF NOT EXISTS idx_billing_payment_status ON billing(payment_status)',
    'CREATE INDEX IF NOT EXISTS idx_billing_due_date ON billing(due_date)',
  ],
  payments: [
    'CREATE INDEX IF NOT EXISTS idx_payments_seller_id ON payments(seller_id)',
    'CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)',
    'CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at)',
  ],
}
