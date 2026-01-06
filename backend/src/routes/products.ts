import { Router, Request, Response } from 'express';
import { productService } from '../services/productService.js';

const router = Router();

/**
 * GET /api/products
 * Fetch all products from the database
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const products = await productService.getAllProducts();
    
    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
    });
  }
});

/**
 * GET /api/products/:id
 * Fetch a single product by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid product ID',
      });
      return;
    }

    const product = await productService.getProductById(id);
    
    if (!product) {
      res.status(404).json({
        success: false,
        error: 'Product not found',
      });
      return;
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product',
    });
  }
});

/**
 * POST /api/products
 * Create a new product (Admin only - add middleware as needed)
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, category, price, stock, description } = req.body;

    // Validate required fields
    if (!name || !category || price === undefined) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: name, category, price',
      });
      return;
    }

    const productId = await productService.createProduct({
      name,
      category,
      price: String(price),
      stock: stock || 0,
      description,
    });

    res.status(201).json({
      success: true,
      data: { id: productId },
      message: 'Product created successfully',
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product',
    });
  }
});

/**
 * PUT /api/products/:id
 * Update a product
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid product ID',
      });
      return;
    }

    const { name, category, price, stock, description } = req.body;

    await productService.updateProduct(id, {
      ...(name && { name }),
      ...(category && { category }),
      ...(price !== undefined && { price: String(price) }),
      ...(stock !== undefined && { stock }),
      ...(description !== undefined && { description }),
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product',
    });
  }
});

/**
 * DELETE /api/products/:id
 * Delete a product
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid product ID',
      });
      return;
    }

    await productService.deleteProduct(id);

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product',
    });
  }
});

export default router;
