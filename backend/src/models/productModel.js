export class Product {
  constructor(data) {
    this.id = data.id
    this.name = data.name
    this.description = data.description
    this.category = data.category
    this.supplier = data.supplier
    this.supplier_contact = data.supplier_contact
    this.owner_id = data.owner_id
    this.owner_name = data.owner_name
    this.color = data.color
    this.price = data.price
    this.stock_quantity = data.stock_quantity
    this.sold_quantity = data.sold_quantity
    this.expiry_date = data.expiry_date
    this.created_at = data.created_at
    this.updated_at = data.updated_at
    this.is_active = data.is_active
  }

  toJSON() {
    const { is_active, ...payload } = this
    return payload
  }

  isActive() {
    return this.is_active === 1
  }
}
