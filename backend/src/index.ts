import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import productRoutes from './routes/products.js';
import transactionRoutes from './routes/transactions.js';
import reportRoutes from './routes/reports.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - Dynamic for production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

// Add production frontend URL if set
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Better Auth handler - MUST be before express.json() middleware
// Using Express v4 wildcard syntax
app.all('/api/auth/*', toNodeHandler(auth));

// Body parsing middleware - increased limit for base64 images
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 Riyadh Coffee POS Backend
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Server running on: http://localhost:${PORT}
Environment: ${process.env.NODE_ENV || 'development'}
Tax Rate: ${Number(process.env.TAX_RATE) * 100}% PPN

Endpoints:
  GET  /health           - Health check
  GET  /api/products     - Get all products
  POST /api/products     - Create product
  POST /api/transactions - Process transaction
  GET  /api/reports      - Today's sales summary
  
Auth Endpoints (Better Auth):
  POST /api/auth/sign-up         - Register
  POST /api/auth/sign-in/email   - Login
  POST /api/auth/sign-out        - Logout
  GET  /api/auth/session         - Get session
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

export default app;
