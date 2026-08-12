import express from 'express'
import {
  getProfileController,
  loginController,
  registerController,
  updateProfileController,
} from '../controllers/authController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Rotas públicas
router.post('/register', registerController)
router.post('/login', loginController)
// Debug route to inspect CORS and login payloads during development
router.options('/debug', (req, res) => {
  console.log('[DEBUG] Preflight /api/auth/debug', {
    origin: req.headers.origin,
  })
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.header(
    'Access-Control-Allow-Methods',
    'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
  )
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.header('Access-Control-Allow-Credentials', 'true')
  return res.sendStatus(200)
})

router.post('/debug', (req, res) => {
  console.log('[DEBUG] /api/auth/debug request')
  console.log('Origin:', req.headers.origin)
  console.log('Method:', req.method)
  console.log('Headers:', JSON.stringify(req.headers))
  console.log('Body:', JSON.stringify(req.body))

  return res.json({
    success: true,
    message: 'Debug echo',
    origin: req.headers.origin || null,
    method: req.method,
    headers: req.headers,
    body: req.body,
  })
})

// Simple GET debug (no body) to inspect headers/origin without JSON parsing
router.get('/debug', (req, res) => {
  console.log('[DEBUG] GET /api/auth/debug')
  console.log('Origin:', req.headers.origin)
  console.log('Method:', req.method)
  console.log('Headers:', JSON.stringify(req.headers))

  return res.json({
    success: true,
    message: 'Debug GET echo',
    origin: req.headers.origin || null,
    method: req.method,
    headers: req.headers,
  })
})

// Rotas protegidas
router.get('/me', authMiddleware, getProfileController)
router.patch('/me', authMiddleware, updateProfileController)

export default router
