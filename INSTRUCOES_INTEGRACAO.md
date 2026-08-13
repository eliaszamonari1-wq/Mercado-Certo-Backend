/\*\*

- INSTRUÇÕES DE INTEGRAÇÃO
- Como adicionar as rotas ao servidor.js
-
- No arquivo backend/server.js, adicione o seguinte após as outras rotas:
  \*/

// ============== ADICIONAR APÓS authRoutes ==============

import listingRoutes from './src/routes/listingRoutes.js'
import billingRoutes from './src/routes/billingRoutes.js'
import chatRoutes from './src/routes/chatRoutes.js'
import externalLinkRoutes from './src/routes/externalLinkRoutes.js'
import adminRoutes from './src/routes/adminRoutes.js'

// Registrar as rotas
app.use('/api/listings', listingRoutes)
app.use('/api/billing', billingRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/external-links', externalLinkRoutes)
app.use('/api/admin', adminRoutes)

// ============== FIM DO CÓDIGO PARA ADICIONAR ==============

/\*\*

- ESTRUTURA COMPLETA DO server.js
-
- import cors from 'cors'
- import dotenv from 'dotenv'
- import express from 'express'
- import http from 'http'
- import { Server as SocketServer } from 'socket.io'
-
- // ROTAS
- import authRoutes from './src/routes/authRoutes.js'
- import productRoutes from './src/routes/productRoutes.js'
- import listingRoutes from './src/routes/listingRoutes.js'
- import billingRoutes from './src/routes/billingRoutes.js'
- import chatRoutes from './src/routes/chatRoutes.js'
- import externalLinkRoutes from './src/routes/externalLinkRoutes.js'
- import adminRoutes from './src/routes/adminRoutes.js'
-
- dotenv.config()
-
- // ... resto do código ...
-
- // Registrar rotas
- app.use('/api/auth', authRoutes)
- app.use('/api/products', productRoutes)
- app.use('/api/listings', listingRoutes)
- app.use('/api/billing', billingRoutes)
- app.use('/api/chat', chatRoutes)
- app.use('/api/external-links', externalLinkRoutes)
- app.use('/api/admin', adminRoutes)
-
- // Socket.io para chat em tempo real
- io.on('connection', (socket) => {
- console.log('Usuário conectado:', socket.id)
-
- socket.on('send_message', (data) => {
-     io.to(data.receiver_id).emit('receive_message', data)
- })
-
- socket.on('disconnect', () => {
-     console.log('Usuário desconectado:', socket.id)
- })
- })
-
- // ... resto do código ...
  \*/

/\*\*

- DATABASE SCHEMA
-
- Para criar as tabelas, importe o schema no database.js:
-
- import { SCHEMA, INDEXES } from './schema.js'
-
- export async function getDb() {
- if (!dbPromise) {
-     dbPromise = (async () => {
-       // ... código existente ...
-
-       // Criar tabelas do Mercado Certo
-       for (const [tableName, createSQL] of Object.entries(SCHEMA)) {
-         await database.exec(createSQL)
-       }
-
-       // Criar índices
-       for (const [tableName, indexArray] of Object.entries(INDEXES)) {
-         for (const indexSQL of indexArray) {
-           await database.exec(indexSQL)
-         }
-       }
-
-       return database
-     })()
- }
- return await dbPromise
- }
  \*/

/\*\*

- MODELOS CRIADOS
-
- ✅ userModel.js - Gerencia usuários (vendedores/compradores)
- ✅ listingModel.js - Anúncios de produtos
- ✅ billingModel.js - Cobranças mensais
- ✅ paymentModel.js - Transações de pagamento
- ✅ messageModel.js - Chat entre usuários
- ✅ externalLinkModel.js - Links externos ("Onde mais comprar")
- ✅ notificationModel.js - Notificações do sistema
- ✅ contactModel.js - Contatos/inquiries
  \*/

/\*\*

- SERVICES CRIADOS (Lógica de Negócio)
-
- ✅ billingService.js - Geração de cobranças, processamento de pagamentos
- ✅ listingService.js - Criar, atualizar, buscar anúncios
- ✅ chatService.js - Iniciar conversas, enviar mensagens
- ✅ adminService.js - Dashboard administrativo
  \*/

/\*\*

- CONTROLLERS CRIADOS
-
- ✅ listingController.js - Handlers HTTP para anúncios
- ✅ billingController.js - Handlers HTTP para cobranças
- ✅ chatController.js - Handlers HTTP para chat
- ✅ externalLinkController.js - Handlers HTTP para links
- ✅ adminController.js - Handlers HTTP para admin
  \*/

/\*\*

- ROTAS CRIADAS
-
- ✅ listingRoutes.js - GET/POST/PUT /api/listings
- ✅ billingRoutes.js - GET/POST /api/billing
- ✅ chatRoutes.js - GET/POST /api/chat
- ✅ externalLinkRoutes.js - GET/POST/PUT/DELETE /api/external-links
- ✅ adminRoutes.js - GET /api/admin
  \*/

/\*\*

- COMPONENTES FRONTEND CRIADOS
-
- ✅ ListingCard.vue - Card do anúncio
- ✅ ListingDetail.vue - Detalhe completo
- ✅ SellerDashboard.vue - Painel do vendedor
- ✅ ChatView.vue - Interface de chat
- ✅ BillingPage.vue - Gestão de pagamentos
- ✅ CreateListing.vue - Formulário de criação
- ✅ ExternalLinksManager.vue - Gerenciador de links externos
  \*/

/\*\*

- PRÓXIMOS PASSOS
-
- 1.  ✅ Integrar database.js com schema.js
- 2.  ✅ Integrar routes em server.js
- 3.  ⏳ Integrar componentes em App.vue (router)
- 4.  ⏳ Implementar Socket.io para chat real-time
- 5.  ⏳ Integrar gateway de pagamento (Stripe/PagSeguro)
- 6.  ⏳ Implementar upload de imagens (S3/Firebase)
- 7.  ⏳ Setup cron jobs para pausar anúncios vencidos
- 8.  ⏳ Testes automatizados
      \*/
