import { Router, Request, Response } from 'express';
import { productService } from '../services/productService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Helper to save base64 image
const saveBase64Image = (base64Data: string): string | null => {
  try {
    // Check if it's already a URL (doesn't start with data:)
    if (!base64Data.startsWith('data:')) {
      return base64Data;
    }

    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return null;
    }
    
    const type = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const extension = type === 'image/jpeg' ? 'jpg' : type === 'image/png' ? 'png' : 'jpg';
    
    // Ensure uploads dir exists
    const uploadDir = path.join(__dirname, '../../uploads');
    
    if (!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `prod-${Date.now()}-${Math.round(Math.random() * 1E9)}.${extension}`;
    fs.writeFileSync(path.join(uploadDir, filename), buffer);
    
    return `/uploads/${filename}`;
  } catch (e) {
    console.error("Image save error", e);
    return null;
  }
}

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
    const { name, category, price, stock, imageUrl, description } = req.body;

    // Validate required fields
    if (!name || !category || price === undefined) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: name, category, price',
      });
      return;
    }

    // Process image if exists
    let processedImageUrl = imageUrl;
    if (imageUrl) {
      const savedPath = saveBase64Image(imageUrl);
      if (savedPath) {
        processedImageUrl = savedPath;
      }
    }

    const productId = await productService.createProduct({
      name,
      category,
      price: String(price),
      stock: stock || 0,
      imageUrl: processedImageUrl,
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

    const { name, category, price, stock, imageUrl, description } = req.body;

    // Process image if exists
    let processedImageUrl = imageUrl;
    if (imageUrl) {
        const savedPath = saveBase64Image(imageUrl);
        if (savedPath) {
            processedImageUrl = savedPath;
        }
    }

    await productService.updateProduct(id, {
      ...(name && { name }),
      ...(category && { category }),
      ...(price !== undefined && { price: String(price) }),
      ...(stock !== undefined && { stock }),
      ...(processedImageUrl !== undefined && { imageUrl: processedImageUrl }),
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
