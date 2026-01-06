import { Router, Request, Response } from 'express';
import { reportService } from '../services/reportService.js';

const router = Router();

/**
 * GET /api/reports
 * Get today's sales summary
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const report = await reportService.getTodaySales();
    
    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sales report',
    });
  }
});

/**
 * GET /api/reports/today
 * Get today's sales with all transaction details
 */
router.get('/today', async (_req: Request, res: Response) => {
  try {
    const transactions = await reportService.getTodayTransactions();
    const summary = await reportService.getTodaySales();
    
    res.json({
      success: true,
      data: {
        summary,
        transactions,
      },
    });
  } catch (error) {
    console.error('Error fetching today report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch today\'s report',
    });
  }
});

/**
 * GET /api/reports/range
 * Get sales report for a date range
 * Query params: startDate, endDate (YYYY-MM-DD format)
 */
router.get('/range', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        error: 'startDate and endDate query parameters are required',
      });
      return;
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    end.setHours(23, 59, 59, 999); // Include entire end date

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD',
      });
      return;
    }

    if (start > end) {
      res.status(400).json({
        success: false,
        error: 'startDate must be before or equal to endDate',
      });
      return;
    }

    const reports = await reportService.getSalesByDateRange(start, end);
    
    // Calculate totals
    const totalReport = reports.reduce(
      (acc, day) => ({
        totalTransactions: acc.totalTransactions + day.totalTransactions,
        totalSubtotal: acc.totalSubtotal + day.totalSubtotal,
        totalTax: acc.totalTax + day.totalTax,
        totalGrandTotal: acc.totalGrandTotal + day.totalGrandTotal,
      }),
      { totalTransactions: 0, totalSubtotal: 0, totalTax: 0, totalGrandTotal: 0 }
    );

    res.json({
      success: true,
      data: {
        startDate: startDate as string,
        endDate: endDate as string,
        dailyReports: reports,
        totals: totalReport,
      },
    });
  } catch (error) {
    console.error('Error fetching range report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sales report',
    });
  }
});

export default router;
