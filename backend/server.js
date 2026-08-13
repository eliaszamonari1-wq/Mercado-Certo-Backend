import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import http from 'http'
import { Server as SocketServer } from 'socket.io'
import adminRoutes from './src/routes/adminRoutes.js'
import authRoutes from './src/routes/authRoutes.js'
import billingRoutes from './src/routes/billingRoutes.js'
import chatRoutes from './src/routes/chatRoutes.js'
import externalLinkRoutes from './src/routes/externalLinkRoutes.js'
import listingRoutes from './src/routes/listingRoutes.js'
import productRoutes from './src/routes/productRoutes.js'

dotenv.config()

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error(
    '❌ JWT_SECRET não definido. Defina a variável de ambiente antes de iniciar o servidor em produção.',
  )
  process.exit(1)
}

const app = express()
const port = process.env.PORT || 3333
const httpServer = http.createServer(app)

const corsOptions = {
  origin: '*',
  methods: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Total-Count'],
  credentials: false,
  optionsSuccessStatus: 200,
}

// Middleware
app.use(cors(corsOptions))
app.options('*', cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Logging
app.use((req, res, next) => {
  console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Rotas
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/listings', listingRoutes)
app.use('/api/billing', billingRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/external-links', externalLinkRoutes)
app.use('/api/admin', adminRoutes)

const io = new SocketServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: false,
  },
})

io.on('connection', (socket) => {
  console.log('⚡ Socket conectado:', socket.id)

  socket.on('joinRoom', ({ roomId, userId, userName }) => {
    if (!roomId) return
    socket.join(roomId)
    socket.to(roomId).emit('userJoined', {
      roomId,
      userId,
      userName,
    })
  })

  socket.on('leaveRoom', ({ roomId, userId, userName }) => {
    if (!roomId) return
    socket.leave(roomId)
    socket.to(roomId).emit('userLeft', {
      roomId,
      userId,
      userName,
    })
  })

  socket.on('chatMessage', (message) => {
    if (!message?.roomId || !message?.text) return
    const outgoingMessage = {
      ...message,
      timestamp: new Date().toISOString(),
    }
    socket.to(message.roomId).emit('chatMessage', outgoingMessage)
    socket.emit('chatMessage', outgoingMessage)
  })

  socket.on('disconnect', () => {
    console.log('⚡ Socket desconectado:', socket.id)
  })
})

// Rota raiz para validação do deploy
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Backend Betas rodando',
    env: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
  })
})

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// Rota 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
  })
})

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err.stack)
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

httpServer.listen(port, () => {
  console.log('='.repeat(50))
  console.log(`🚀 Servidor rodando em http://localhost:${port}`)
  console.log(`📁 Ambiente: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔗 Endpoints disponíveis:`)
  console.log(`   POST /api/auth/register`)
  console.log(`   POST /api/auth/login`)
  console.log(`   GET  /api/auth/me (protegido)`)
  console.log(`   GET  /api/products`)
  console.log(`   GET  /api/listings/search`)
  console.log(`   GET  /api/billing/summary`)
  console.log(`   GET  /api/admin/dashboard (admin)`)
  console.log(`   GET  /health`)
  console.log('='.repeat(50))
})
