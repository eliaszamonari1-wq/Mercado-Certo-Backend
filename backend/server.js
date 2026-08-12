import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import http from 'http'
import { Server as SocketServer } from 'socket.io'
import authRoutes from './src/routes/authRoutes.js'
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

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://betastore-18b12.firebaseapp.com',
  'https://betastore-18b12.web.app',
]

// Simplified CORS options: reflect request origin and allow credentials.
// This ensures preflight (OPTIONS) requests receive the proper headers
// when the app is hosted behind proxies (e.g., Render).
const corsOptions = {
  origin: true, // reflect the request origin
  methods: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Total-Count'],
  credentials: true,
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

const io = new SocketServer(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://betastore-18b12.firebaseapp.com',
      'https://betastore-18b12.web.app',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
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
  console.log(`   GET  /health`)
  console.log('='.repeat(50))
})
