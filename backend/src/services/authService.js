import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {
  createUser,
  findUserByCredentials,
  findUserById,
  findUserByUsername,
  updateUser,
} from '../repositories/userRepository.js'
import {
  validateLoginInput,
  validateProfileUpdateInput,
  validateRegisterInput,
} from '../utils/validators.js'

export async function registerUser(payload) {
  validateRegisterInput(payload)

  // Verificar se usuário já existe
  const existingUser = await findUserByUsername(payload.username)
  if (existingUser) {
    const error = new Error('Usuário já cadastrado.')
    error.statusCode = 409
    throw error
  }

  // Hash da senha
  const hashedPassword = await bcrypt.hash(payload.password, 10)

  // Criar usuário
  const user = await createUser({
    ...payload,
    password: hashedPassword,
  })

  // Gerar token JWT
  const token = generateToken(user)

  return {
    message: 'Cadastro realizado com sucesso!',
    user: user.toJSON(),
    token,
  }
}

export async function loginUser(payload) {
  validateLoginInput(payload)

  // Buscar usuário
  const user = await findUserByCredentials(payload)

  if (!user) {
    const error = new Error('Usuário ou senha inválidos.')
    error.statusCode = 401
    throw error
  }

  // Verificar se usuário está ativo
  if (!user.isActive()) {
    const error = new Error('Usuário desativado. Contate o administrador.')
    error.statusCode = 403
    throw error
  }

  // Verificar senha com bcrypt
  const isValidPassword = await bcrypt.compare(payload.password, user.password)
  if (!isValidPassword) {
    const error = new Error('Usuário ou senha inválidos.')
    error.statusCode = 401
    throw error
  }

  // Gerar token JWT
  const token = generateToken(user)

  return {
    message: `Bem-vindo, ${user.name}!`,
    user: user.toJSON(),
    token,
  }
}

export async function updateProfile(userId, payload) {
  validateProfileUpdateInput(payload)

  const updates = {}
  if (payload.name) updates.name = payload.name
  if (payload.password)
    updates.password = await bcrypt.hash(payload.password, 10)

  const user = await updateUser(userId, updates)

  return {
    message: 'Perfil atualizado com sucesso.',
    user: user.toJSON(),
  }
}

function generateToken(user) {
  const secret = process.env.JWT_SECRET || 'default_secret'
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d'

  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      is_admin: user.is_admin,
      is_seller: user.is_seller,
      is_buyer: user.is_buyer,
    },
    secret,
    { expiresIn },
  )
}

export async function verifyToken(token) {
  try {
    const secret = process.env.JWT_SECRET || 'default_secret'
    const decoded = jwt.verify(token, secret)
    const user = await findUserById(decoded.id)

    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    if (!user.isActive()) {
      throw new Error('Usuário desativado')
    }

    return user
  } catch (error) {
    const authError = new Error('Token inválido ou expirado')
    authError.statusCode = 401
    throw authError
  }
}
