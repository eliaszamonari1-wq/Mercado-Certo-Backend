import {
  createProduct,
  listProducts,
  updateProduct,
} from '../services/productService.js'

export async function listProductsController(req, res) {
  try {
    const products = await listProducts()
    return res.json({
      success: true,
      products: products.map((product) => product.toJSON()),
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao listar produtos',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    })
  }
}

export async function createProductController(req, res) {
  try {
    const product = await createProduct(req.body)
    return res.status(201).json({
      success: true,
      product: product.toJSON(),
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Erro ao criar produto',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    })
  }
}

export async function updateProductController(req, res) {
  try {
    const productId = Number(req.params.id)
    const product = await updateProduct(productId, req.body)
    return res.json({
      success: true,
      product: product.toJSON(),
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Erro ao atualizar produto',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    })
  }
}
