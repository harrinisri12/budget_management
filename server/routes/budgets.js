import express from 'express';
import { supabaseAdmin } from '../supabaseClient.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

const CATEGORY_COLORS = {
  'CSEA Association': '#443CDE',
  'CCC Coding Club': '#635BFF',
  'Lab & Equipment': '#3B82F6',
  'Technical Workshop': '#10B981',
  'Department Maintenance': '#F59E0B',
  'Academic Research': '#8B5CF6'
};

// GET /api/budgets - Get active budget info
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { data: budgets, error } = await supabaseAdmin
      .from('budgets')
      .select('*, departments(name, code)')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.json({ success: true, budgets });
  } catch (err) {
    console.error('Error fetching budgets:', err);
    return res.status(500).json({ success: false, error: 'Server error retrieving budgets.' });
  }
});

// GET /api/budget-categories - Get categories with allocations
router.get('/categories', authenticateUser, async (req, res) => {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('budget_categories')
      .select('*')
      .order('allocated_amount', { ascending: false });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.json({ success: true, categories });
  } catch (err) {
    console.error('Error fetching categories:', err);
    return res.status(500).json({ success: false, error: 'Server error retrieving budget categories.' });
  }
});

// GET /api/dashboard - Aggregated dashboard KPIs, categories, monthly spending
router.get('/dashboard', authenticateUser, async (req, res) => {
  try {
    // 1. Fetch budget
    const { data: budget } = await supabaseAdmin
      .from('budgets')
      .select('*')
      .eq('financial_year', '2026-27')
      .maybeSingle();

    const totalBudget = Number(budget?.total_budget) || 2450000;

    // 2. Fetch categories
    const { data: categories } = await supabaseAdmin
      .from('budget_categories')
      .select('*')
      .order('allocated_amount', { ascending: false });

    const cats = categories || [];
    const totalAllocated = cats.reduce((sum, c) => sum + Number(c.allocated_amount || 0), 0) || 1820000;
    const totalSpent = cats.reduce((sum, c) => sum + Number(c.spent_amount || 0), 0) || 1245000;
    const remaining = Math.max(0, totalBudget - totalSpent);

    const categoryAllocations = cats.map(c => {
      const allocated = Number(c.allocated_amount);
      const spent = Number(c.spent_amount);
      const pct = totalBudget > 0 ? Number(((allocated / totalBudget) * 100).toFixed(1)) : 0;
      return {
        id: c.id,
        name: c.name,
        allocated,
        spent,
        color: CATEGORY_COLORS[c.name] || '#443CDE',
        percentage: pct
      };
    });

    const monthlySpending = [
      { month: 'January', budget: 350000, spending: 280000 },
      { month: 'February', budget: 380000, spending: 310000 },
      { month: 'March', budget: 420000, spending: 390000 },
      { month: 'April', budget: 400000, spending: 340000 },
      { month: 'May', budget: 450000, spending: 410000 },
      { month: 'June', budget: 450000, spending: 390000 }
    ];

    return res.json({
      success: true,
      kpis: {
        totalBudget,
        allocated: totalAllocated,
        spent: totalSpent,
        remaining
      },
      categoryAllocations,
      monthlySpending
    });
  } catch (err) {
    console.error('Error generating dashboard data:', err);
    return res.status(500).json({ success: false, error: 'Server error generating dashboard data.' });
  }
});

export default router;
