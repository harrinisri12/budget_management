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

// GET /api/budgets - Get budget info
router.get('/', authenticateUser, async (req, res) => {
  try {
    const db = req.supabase || supabaseAdmin;
    const { data: budgets, error } = await db
      .from('budgets')
      .select('*, departments(name, code)')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.json({ success: true, budgets: budgets || [] });
  } catch (err) {
    console.error('Error fetching budgets:', err);
    return res.status(500).json({ success: false, error: 'Server error retrieving budgets.' });
  }
});

// GET /api/budget-categories - Get categories with allocations
router.get('/categories', authenticateUser, async (req, res) => {
  try {
    const db = req.supabase || supabaseAdmin;
    const { data: categories, error } = await db
      .from('budget_categories')
      .select('*')
      .order('allocated_amount', { ascending: false });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.json({ success: true, categories: categories || [] });
  } catch (err) {
    console.error('Error fetching categories:', err);
    return res.status(500).json({ success: false, error: 'Server error retrieving budget categories.' });
  }
});

// GET /api/dashboard - Aggregated 100% database-driven dashboard KPIs & analytics
router.get('/dashboard', authenticateUser, async (req, res) => {
  try {
    const db = req.supabase || supabaseAdmin;
    // 1. Fetch active academic year from Supabase
    const { data: activeAy } = await db
      .from('academic_years')
      .select('id, academic_year, budget, is_active, status')
      .or('status.eq.ACTIVE,is_active.eq.true')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const activeAyId = activeAy?.id;
    const totalBudget = Number(activeAy?.budget || 0);

    // 2. Fetch category allocations belonging to the active academic year
    let catQuery = db
      .from('budget_categories')
      .select('*')
      .order('allocated_amount', { ascending: false });

    if (activeAyId) {
      catQuery = catQuery.eq('academic_year_id', activeAyId);
    }

    const { data: categories } = await catQuery;
    const cats = categories || [];

    const totalAllocated = cats.reduce((sum, c) => sum + Number(c.allocated_amount || 0), 0);
    const totalSpent = cats.reduce((sum, c) => sum + Number(c.spent_amount || 0), 0);
    const remaining = Math.max(0, totalBudget - totalSpent);

    // 3. Fetch proposals for active academic year to calculate pending metrics
    let propQuery = db
      .from('proposals')
      .select('id, amount, status, academic_year_id');

    if (activeAyId) {
      propQuery = propQuery.eq('academic_year_id', activeAyId);
    }

    const { data: proposals } = await propQuery;
    const activeProps = proposals || [];
    const pendingProps = activeProps.filter(p => p.status === 'Pending');
    const pendingCount = pendingProps.length;
    const pendingTotal = pendingProps.reduce((sum, p) => sum + Number(p.amount || 0), 0);

    // 4. Calculate category breakdown
    const categoryAllocations = cats.map(c => {
      const allocated = Number(c.allocated_amount || 0);
      const spent = Number(c.spent_amount || 0);
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

    // 5. Calculate monthly spending from real database transactions or approved proposals
    const { data: txns } = await db
      .from('transactions')
      .select('amount, transaction_date, status')
      .order('transaction_date', { ascending: true });

    const monthlyMap = {};
    if (txns && txns.length > 0) {
      txns.forEach(t => {
        if (!t.transaction_date) return;
        const d = new Date(t.transaction_date);
        const monthName = d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
        if (!monthlyMap[monthName]) {
          monthlyMap[monthName] = { month: monthName, budget: 0, spending: 0 };
        }
        monthlyMap[monthName].spending += Number(t.amount || 0);
      });
    } else {
      // Calculate from real approved proposals if transactions table has no entries yet
      const { data: approvedProps } = await db
        .from('proposals')
        .select('amount, proposal_date, program_date, status')
        .eq('status', 'Approved');

      if (approvedProps && approvedProps.length > 0) {
        approvedProps.forEach(p => {
          const dt = p.proposal_date || p.program_date;
          if (!dt) return;
          const d = new Date(dt);
          const monthName = d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
          if (!monthlyMap[monthName]) {
            monthlyMap[monthName] = { month: monthName, budget: 0, spending: 0 };
          }
          monthlyMap[monthName].spending += Number(p.amount || 0);
        });
      }
    }

    const monthlySpending = Object.values(monthlyMap);

    return res.json({
      success: true,
      activeAcademicYear: activeAy ? {
        id: activeAy.id,
        academicYear: activeAy.academic_year,
        budget: totalBudget,
        status: activeAy.status,
        isActive: Boolean(activeAy.is_active || activeAy.status === 'ACTIVE')
      } : null,
      kpis: {
        totalBudget,
        allocated: totalAllocated,
        spent: totalSpent,
        remaining,
        pendingCount,
        pendingTotal
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
