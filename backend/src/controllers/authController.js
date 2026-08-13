import {
  loginUser,
  registerUser,
  updateProfile,
} from '../services/authService.js'

export async function registerController(req, res) {
  try {
    const result = await registerUser(req.body)
    return res.status(201).json({
      success: true,
      ...result,
    })
  } catch (error) {
    const statusCode = error.statusCode || 500
    return res.status(statusCode).json({
      success: false,
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    })
  }
}

export async function loginController(req, res) {
  try {
    const result = await loginUser(req.body)
    return res.json({
      success: true,
      ...result,
    })
  } catch (error) {
    const statusCode = error.statusCode || 500
    return res.status(statusCode).json({
      success: false,
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    })
  }
}

export async function getProfileController(req, res) {
  try {
    return res.json({
      success: true,
      user: req.user.toJSON(),
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar perfil',
    })
  }
}

export async function updateProfileController(req, res) {
  try {
    const result = await updateProfile(req.user.id, req.body)
    return res.json({
      success: true,
      ...result,
    })
  } catch (error) {
    const statusCode = error.statusCode || 500
    return res.status(statusCode).json({
      success: false,
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    })
  }
}
