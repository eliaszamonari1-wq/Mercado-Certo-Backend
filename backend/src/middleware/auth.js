import { verifyToken } from '../services/authService.js'

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido',
      })
    }

    const [scheme, token] = authHeader.split(' ')

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
      })
    }

    const user = await verifyToken(token)
    req.user = user

    next()
  } catch (error) {
    const statusCode = error.statusCode || 401
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Não autorizado',
    })
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user?.is_admin) {
    return res.status(403).json({
      success: false,
      message: 'Acesso restrito à administração',
    })
  }

  next()
}
