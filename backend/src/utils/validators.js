export function validateRegisterInput({ username, password, name, email }) {
  if (!username || !password || !name) {
    const error = new Error('Preencha todos os campos obrigatórios.')
    error.statusCode = 400
    throw error
  }

  if (email && !validateEmail(email)) {
    const error = new Error('Email inválido.')
    error.statusCode = 400
    throw error
  }

  if (username.length < 3) {
    const error = new Error('Usuário deve ter no mínimo 3 caracteres.')
    error.statusCode = 400
    throw error
  }

  if (password.length < 6) {
    const error = new Error('Senha deve ter no mínimo 6 caracteres.')
    error.statusCode = 400
    throw error
  }

  if (name.length < 3) {
    const error = new Error('Nome deve ter no mínimo 3 caracteres.')
    error.statusCode = 400
    throw error
  }
}

export function validateProfileUpdateInput({ name, password }) {
  if (!name && !password) {
    const error = new Error(
      'Forneça um novo nome ou senha para atualizar o perfil.',
    )
    error.statusCode = 400
    throw error
  }

  if (name && name.length < 3) {
    const error = new Error('Nome deve ter no mínimo 3 caracteres.')
    error.statusCode = 400
    throw error
  }

  if (password && password.length < 6) {
    const error = new Error('Senha deve ter no mínimo 6 caracteres.')
    error.statusCode = 400
    throw error
  }
}

export function validateLoginInput({ username, email, password }) {
  const identifier = username || email

  if (!identifier || !password) {
    const error = new Error('Informe usuário/e-mail e senha.')
    error.statusCode = 400
    throw error
  }
}

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}
