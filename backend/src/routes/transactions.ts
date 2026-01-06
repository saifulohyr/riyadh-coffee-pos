import { Router, Request, Response } from 'express';
import { transactionService, type CartItem } from '../services/transactionService.js';

const router = Router();

/**
 * POST /api/transactions
 * Process a new transaction
 * 
 * Request body:
 * {
 *   items: [{ productId: number, quantity: number }],
 *   amountReceived: number
 * }
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { items, amountReceived } = req.body;

    // Validate request body
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Items array is required and must not be empty',
      });
      return;
    }

    if (amountReceived === undefined || typeof amountReceived !== 'number') {
      res.status(400).json({
        success: false,
        error: 'Amount received is required and must be a number',
      });
      return;
    }

    // Validate each item
    const cartItems: CartItem[] = [];
    for (const item of items) {
      if (!item.productId || typeof item.productId !== 'number') {
        res.status(400).json({
          success: false,
          error: 'Each item must have a valid productId',
        });
        return;
      }
      if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
        res.status(400).json({
          success: false,
          error: 'Each item must have a valid positive quantity',
        });
        return;
      }
      cartItems.push({
        productId: item.productId,
        quantity: item.quantity,
      });
    }

    // Process the transaction
    const result = await transactionService.processTransaction({
      items: cartItems,
      amountReceived,
    });

    res.status(201).json({
      success: true,
      data: result,
      message: 'Transaction processed successfully',
    });
  } catch (error) {
    console.error('Error processing transaction:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to process transaction';
    
    // Determine appropriate status code
    const statusCode = errorMessage.includes('Insufficient') || 
                       errorMessage.includes('not found') ? 400 : 500;

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
    });
  }
});

/**
 * GET /api/transactions
 * Get all transactions
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const transactions = await transactionService.getAllTransactions();
    
    res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions',
    });
  }
});

/**
 * GET /api/transactions/:id
 * Get a single transaction by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const transaction = await transactionService.getTransactionById(id);
    
    if (!transaction) {
      res.status(404).json({
        success: false,
        error: 'Transaction not found',
      });
      return;
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transaction',
    });
  }
});

export default router;
