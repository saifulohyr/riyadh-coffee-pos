import { apiGet, apiPost } from './api';

// Types matching backend response
interface BackendProduct {
  id: number;
  name: string;
  category: string;
  price: string;
  stock: number;
  imageUrl: string | null;
}

interface TransactionItem {
  productId: number;
  quantity: number;
}

interface TransactionInput {
  items: TransactionItem[];
  amountReceived: number;
}

interface TransactionResult {
  id: string;
  createdAt: string;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  amountReceived: number;
  changeAmount: number;
  items: Array<{
    productId: number;
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
}

interface DailySalesReport {
  date: string;
  totalTransactions: number;
  totalSubtotal: number;
  totalTax: number;
  totalGrandTotal: number;
}

export const transactionApi = {
  /**
   * Process a new transaction
   * Sends cart items to backend, which:
   * - Validates stock
   * - Calculates 11% PPN tax
   * - Decrements stock
   * - Returns transaction details
   */
  processTransaction: async (
    items: Array<{ productId: string | number; quantity: number }>,
    amountReceived: number
  ): Promise<TransactionResult> => {
    const payload: TransactionInput = {
      items: items.map(item => ({
        productId: typeof item.productId === 'string' ? parseInt(item.productId, 10) : item.productId,
        quantity: item.quantity,
      })),
      amountReceived,
    };

    return apiPost<TransactionResult>('/api/transactions', payload);
  },

  /**
   * Get all transactions
   */
  getTransactions: async (): Promise<TransactionResult[]> => {
    return apiGet<TransactionResult[]>('/api/transactions');
  },

  /**
   * Get transaction by ID
   */
  getTransaction: async (id: string): Promise<TransactionResult> => {
    return apiGet<TransactionResult>(`/api/transactions/${id}`);
  },

  /**
   * Get today's sales report
   */
  getTodayReport: async (): Promise<DailySalesReport> => {
    return apiGet<DailySalesReport>('/api/reports');
  },

  /**
   * Get sales report with transactions for today
   */
  getTodayTransactions: async (): Promise<{
    summary: DailySalesReport;
    transactions: TransactionResult[];
  }> => {
    return apiGet('/api/reports/today');
  },
};
