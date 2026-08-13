export class User {
  constructor(data) {
    this.id = data.id
    this.username = data.username
    this.email = data.email
    this.password = data.password
    this.name = data.name
    this.created_at = data.created_at
    this.updated_at = data.updated_at
    this.is_active = data.is_active
    this.is_admin = data.is_admin === 1 || data.is_admin === true
    this.is_seller = data.is_seller === 1 || data.is_seller === true
    this.is_buyer = data.is_buyer !== 0 && data.is_buyer !== false
  }

  // Remove a senha ao enviar dados para o cliente
  toJSON() {
    const { password, ...userWithoutPassword } = this
    return userWithoutPassword
  }

  // Verifica se o usuário está ativo
  isActive() {
    return this.is_active === 1
  }

  // Retorna dados completos (incluindo senha) para uso interno
  toInternal() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      password: this.password,
      name: this.name,
      created_at: this.created_at,
      updated_at: this.updated_at,
      is_active: this.is_active,
      is_admin: this.is_admin,
      is_seller: this.is_seller,
      is_buyer: this.is_buyer,
    }
  }
}
