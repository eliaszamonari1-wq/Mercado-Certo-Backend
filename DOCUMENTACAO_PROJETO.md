# 🎯 Mercado Certo - Documentação do Projeto

Um marketplace moderno que conecta vendedores e compradores com **liberdade de comunicação**, **sem comissão sobre vendas** e **cobrança fixa por anúncio**.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [Instalação e Setup](#instalação-e-setup)
4. [Modelo de Negócio](#modelo-de-negócio)
5. [Arquitetura do Banco de Dados](#arquitetura-do-banco-de-dados)
6. [API Reference](#api-reference)
7. [Frontend Components](#frontend-components)
8. [Funcionalidades](#funcionalidades)

---

## 🎯 Visão Geral

### Características Principais

- **✅ Sem Comissão**: Vendedores não pagam percentual sobre vendas
- **✅ Cobrança Fixa**: R$ 100,00/mês por anúncio ativo
- **✅ Liberdade de Comunicação**: Chat direto entre comprador e vendedor
- **✅ Links Externos**: Vendedor pode compartilhar links de outras plataformas
- **✅ Negociação Livre**: Preço, frete e pagamento definidos entre as partes
- **✅ Cobrança Automática**: Integração com gateway de pagamento
- **✅ Inadimplência Automática**: Anúncios pausados após 30 dias de atraso

---

## 📁 Estrutura do Projeto

```
projetoBetas/
├── backend/
│   ├── src/
│   │   ├── database/
│   │   │   ├── database.js         # Inicialização do SQLite
│   │   │   └── schema.js            # Schemas de tabelas
│   │   │
│   │   ├── models/                  # Modelos de dados
│   │   │   ├── userModel.js
│   │   │   ├── listingModel.js
│   │   │   ├── billingModel.js
│   │   │   ├── paymentModel.js
│   │   │   ├── messageModel.js
│   │   │   ├── externalLinkModel.js
│   │   │   ├── notificationModel.js
│   │   │   └── contactModel.js
│   │   │
│   │   ├── services/                # Lógica de negócio
│   │   │   ├── billingService.js    # Gestão de cobranças
│   │   │   ├── listingService.js    # Gestão de anúncios
│   │   │   ├── chatService.js       # Gestão de mensagens
│   │   │   └── adminService.js      # Analytics e admin
│   │   │
│   │   ├── controllers/             # Handlers HTTP
│   │   │   ├── listingController.js
│   │   │   ├── billingController.js
│   │   │   ├── chatController.js
│   │   │   ├── externalLinkController.js
│   │   │   └── adminController.js
│   │   │
│   │   ├── routes/                  # Endpoints
│   │   │   ├── listingRoutes.js
│   │   │   ├── billingRoutes.js
│   │   │   ├── chatRoutes.js
│   │   │   ├── externalLinkRoutes.js
│   │   │   └── adminRoutes.js
│   │   │
│   │   ├── middleware/
│   │   │   └── auth.js              # Autenticação JWT
│   │   │
│   │   └── utils/
│   │       └── validators.js        # Validações
│   │
│   ├── server.js                    # Arquivo principal
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/              # Componentes Vue.js
│   │   │   ├── ListingCard.vue       # Card de anúncio
│   │   │   ├── ListingDetail.vue     # Detalhe do anúncio
│   │   │   ├── SellerDashboard.vue   # Painel do vendedor
│   │   │   ├── ChatView.vue          # Chat entre usuários
│   │   │   ├── BillingPage.vue       # Gestão de pagamentos
│   │   │   ├── CreateListing.vue     # Criar anúncio
│   │   │   └── ExternalLinksManager.vue  # Gerenciar links
│   │   │
│   │   ├── composables/
│   │   │   └── useAuth.js           # Composable de autenticação
│   │   │
│   │   ├── utils/
│   │   │   └── api.js               # Cliente Axios
│   │   │
│   │   ├── App.vue
│   │   ├── main.js
│   │   └── style.css
│   │
│   ├── vite.config.js
│   └── package.json
```

---

## 🚀 Instalação e Setup

### Backend

```bash
cd backend
npm install
npm run dev
```

**Variáveis de Ambiente** (`.env`):

```
PORT=3333
NODE_ENV=development
JWT_SECRET=sua_chave_secreta_aqui
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 💰 Modelo de Negócio

### Cobrança Mensal

- **R$ 100,00** por anúncio ativo/mês
- Sem comissão sobre vendas
- Cobrança automática e recorrente

### Exemplo

Um vendedor com 4 anúncios ativos:

- Cobrança: 4 × R$100 = **R$ 400,00/mês\*\*
- Se vender R$ 50.000 em produtos: continua pagando apenas R$ 400,00
- **Não recebe percentual da plataforma**

### Inadimplência

1. **Vencimento**: Cobrança vence no dia 1
2. **Graça**: 30 dias para pagar (avisos enviados)
3. **Pausa Automática**: No dia 31, anúncios são pausados automaticamente
4. **Reativação**: Após pagamento, vendedor reativa manualmente

---

## 🗄️ Arquitetura do Banco de Dados

### Tabelas Principais

#### `users`

Usuários da plataforma (vendedores e compradores)

```sql
- id (PK)
- username, email, password
- name, cpf_cnpj, phone
- address, city, state, zip_code
- is_seller, is_buyer, is_admin
- created_at, updated_at, is_active
```

#### `listings`

Anúncios de produtos

```sql
- id (PK)
- seller_id (FK)
- title, description, category, subcategory
- price, images (JSON), videos (JSON)
- location, shipping_options (JSON)
- status ('active', 'paused', 'inactive')
- payment_status ('active', 'paused')
- views_count, contacts_count
- paused_at, paused_reason
```

#### `billing`

Cobranças mensais

```sql
- id (PK)
- seller_id (FK)
- billing_month (YYYY-MM)
- active_listings_count
- amount (value_count × 100)
- due_date, payment_date
- payment_status ('pending', 'active')
- grace_period_end_date (30 days after due)
```

#### `payments`

Transações de pagamento

```sql
- id (PK)
- billing_id (FK)
- seller_id (FK)
- amount, payment_method
- transaction_id, status
- paid_at, metadata (JSON)
```

#### `messages`

Mensagens de chat

```sql
- id (PK)
- sender_id, receiver_id (FK)
- listing_id (FK)
- subject, content
- is_read, read_at
- attachments (JSON)
```

#### `external_links`

Links de "Onde Mais Comprar"

```sql
- id (PK)
- listing_id (FK)
- platform_name, platform_icon
- url, display_text
- link_type ('marketplace', 'social', 'website', etc)
```

#### `notifications`

Notificações do sistema

```sql
- id (PK)
- user_id (FK)
- type ('payment_overdue', 'listing_paused', etc)
- title, message, related_id
- is_read, read_at
```

---

## 🔌 API Reference

### Autenticação

```bash
POST /auth/register
POST /auth/login
POST /auth/refresh
```

### Anúncios (Listings)

```bash
# Criar anúncio
POST /listings
Body: {
  title, description, category, subcategory,
  price, images[], videos, location, shipping_options[]
}

# Buscar anúncios
GET /listings/search?category=&keyword=&minPrice=&maxPrice=&location=

# Detalhes do anúncio
GET /listings/:id

# Meus anúncios
GET /listings/seller/my-listings?status=active&limit=20

# Atualizar anúncio
PUT /listings/:id

# Reativar anúncio
POST /listings/:id/reactivate

# Categorias
GET /listings/categories
```

### Cobrança (Billing)

```bash
# Gerar cobrança mensal
POST /billing/create-monthly

# Cobrança ativa
GET /billing/active

# Cobrança pendente
GET /billing/pending

# Histórico de cobranças
GET /billing/history

# Resumo financeiro
GET /billing/summary

# Processar pagamento
POST /billing/:billing_id/pay

# Marcar como falha
POST /billing/:billing_id/failed
```

### Chat

```bash
# Iniciar conversa
POST /chat/start
Body: { seller_id, listing_id, initial_message }

# Enviar mensagem
POST /chat/send
Body: { receiver_id, listing_id, subject, content }

# Obter mensagens
GET /chat/:seller_id/:listing_id

# Minhas conversas
GET /chat/conversations

# Não lidas
GET /chat/unread

# Templates de mensagens
GET /chat/templates?role=buyer|seller
```

### Links Externos

```bash
# Plataformas populares
GET /external-links/platforms

# Obter links do anúncio
GET /external-links/:listing_id

# Adicionar link
POST /external-links
Body: { listing_id, platform_name, url, link_type }

# Atualizar link
PUT /external-links/:id

# Remover link
DELETE /external-links/:id
```

### Admin

```bash
# Dashboard completo
GET /admin/dashboard

# Relatório mensal de receita
GET /admin/financial-report?year=2024&month=01

# Relatório de vendedor
GET /admin/seller/:seller_id

# Alertas
GET /admin/alerts
```

---

## 🎨 Frontend Components

### ListingCard.vue

Card exibindo resumo do anúncio na lista

**Props:**

- `listing`: Objeto do anúncio

### ListingDetail.vue

Página completa com detalhes, fotos, vendedor, links externos

### SellerDashboard.vue

Painel do vendedor com stats, anúncios, cobrança

### ChatView.vue

Interface de chat com templates de mensagens

### BillingPage.vue

Gestão de cobranças e histórico de pagamentos

### CreateListing.vue

Formulário para criar novo anúncio

### ExternalLinksManager.vue

Gerenciador de links externos ("Onde Mais Comprar")

---

## ✨ Funcionalidades Implementadas

### ✅ Completed

- [x] Autenticação de usuários
- [x] Sistema de anúncios modular
- [x] Cobrança mensal automática
- [x] Gestão de inadimplência
- [x] Chat entre comprador e vendedor
- [x] Links externos customizáveis
- [x] Dashboard do vendedor
- [x] Painel administrativo
- [x] Notificações do sistema
- [x] Busca e filtros avançados

### 🔄 In Development

- [ ] Integração com gateway de pagamento (Stripe/PagSeguro)
- [ ] Upload de imagens (AWS S3/Firebase)
- [ ] Avaliações e comentários
- [ ] Sistema de favoritos
- [ ] Recomendações personalizadas
- [ ] Relatórios PDF para vendedores
- [ ] Mobile app nativo
- [ ] WebSocket para chat em tempo real

---

## 🔒 Segurança

- Autenticação JWT
- Hashing de senhas com bcrypt
- Validação de inputs
- CORS configurado
- Foreign keys ativas no SQLite

---

## 📊 Performance

- Índices nas tabelas principais
- Paginação em endpoints
- Lazy loading no frontend
- Caching de dados
- Soft deletes onde aplicável

---

## 📝 License

Proprietary - Mercado Certo

---

## 👥 Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.
