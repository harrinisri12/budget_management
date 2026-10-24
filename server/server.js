import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import facultyRoutes from './routes/faculty.js';
import proposalsRoutes from './routes/proposals.js';
import settlementsRoutes from './routes/settlements.js';
import budgetsRoutes from './routes/budgets.js';
import categoriesRoutes from './routes/categories.js';
import transactionsRoutes from './routes/transactions.js';
import academicYearsRoutes from './routes/academicYears.js';
import { supabaseAdmin } from './supabaseClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load server environment (local server/.env or root .env)
dotenv.config({ path: path.resolve(__dirname, './.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    institution: 'Kongu Engineering College',
    portal: 'CSE Budget Management API',
    timestamp: new Date().toISOString()
  });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/proposals', proposalsRoutes);
app.use('/api/settlements', settlementsRoutes);
app.use('/api/budgets', budgetsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/budget-categories', (req, res, next) => {
  req.url = '/categories' + (req.url === '/' ? '' : req.url);
  budgetsRoutes(req, res, next);
});
app.use('/api/dashboard', (req, res, next) => {
  req.url = '/dashboard' + (req.url === '/' ? '' : req.url);
  budgetsRoutes(req, res, next);
});
app.use('/api/academic-years', academicYearsRoutes);
app.use('/api/transactions', transactionsRoutes);

// Global 404 handler for unmatched API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `API Route ${req.method} ${req.originalUrl} not found.`
  });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error.'
  });
});

// ------------------------------------------------------------------------------
// SCHEDULED BACKEND JOB: 24-HOUR RETENTION PURGE FOR REJECTED PROPOSALS
// Automatically deletes rejected proposals exactly 24 hours after rejection_at.
// Runs continuously in the backend independently of frontend client sessions.
// ------------------------------------------------------------------------------
const RETENTION_HOURS = 24;

export const cleanupExpiredRejectedProposals = async () => {
  try {
    // 1. Try PostgreSQL RPC cleanup function first
    try {
      const { data: rpcCount, error: rpcErr } = await supabaseAdmin.rpc('cleanup_expired_rejected_proposals');
      if (!rpcErr && rpcCount > 0) {
        console.log(`🧹 [Scheduled Retention Job] Purged ${rpcCount} expired rejected proposal(s) via database function.`);
        return;
      }
    } catch {
      // Fall through to query-level cleanup
    }

    // 2. Query proposals rejected > 24 hours ago
    const cutoffTime = new Date(Date.now() - RETENTION_HOURS * 60 * 60 * 1000).toISOString();

    const { data: expired, error: fetchErr } = await supabaseAdmin
      .from('proposals')
      .select('id, proposal_number, status, rejected_at')
      .or('status.eq.Rejected,status.eq.rejected')
      .not('rejected_at', 'is', null)
      .lte('rejected_at', cutoffTime);

    if (fetchErr) {
      return;
    }

    if (expired && expired.length > 0) {
      const expiredIds = expired.map(p => p.id);

      // Clean up linked transactions
      await supabaseAdmin
        .from('transactions')
        .delete()
        .in('proposal_id', expiredIds);

      // Clean up linked settlements if any exist
      await supabaseAdmin
        .from('settlements')
        .delete()
        .in('proposal_id', expiredIds);

      // Permanently remove expired rejected proposals
      const { error: delErr } = await supabaseAdmin
        .from('proposals')
        .delete()
        .in('id', expiredIds);

      if (!delErr) {
        console.log(`🧹 [Scheduled Retention Job] Automatically purged ${expired.length} rejected proposal(s) whose 24-hour retention period expired.`);
      }
    }
  } catch (err) {
    console.error('Error in scheduled 24h rejection cleanup job:', err.message);
  }
};

// Start Express server & scheduled background jobs
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🎓 Kongu Engineering College - CSE Budget Management`);
  console.log(`🚀 Node.js Express Server running on: http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`======================================================\n`);

  // Run cleanup 5 seconds after boot, then every 10 minutes continuously
  setTimeout(cleanupExpiredRejectedProposals, 5000);
  setInterval(cleanupExpiredRejectedProposals, 10 * 60 * 1000);
});

export default app;
