import express from 'express';
import { supabaseAdmin } from '../supabaseClient.js';
import { authenticateUser } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';

const router = express.Router();

// GET /api/transactions - Get list of transactions
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { data: transactions, error } = await supabaseAdmin
      .from('transactions')
      .select('*, budget_categories(name), profiles:requested_by(name, email), departments(code, name)')
      .order('transaction_date', { ascending: false });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    const formatted = transactions.map(t => ({
      id: t.transaction_number || t.id,
      dbId: t.id,
      date: t.transaction_date ? new Date(t.transaction_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
      department: t.departments?.code || 'CSE',
      category: t.budget_categories?.name || 'General Activity',
      categoryId: t.category_id,
      amount: Number(t.amount),
      status: t.status,
      description: t.description,
      requestedBy: t.profiles?.name || 'CSE Faculty',
      requestedEmail: t.profiles?.email || '',
      vendor: t.vendor || 'Kongu Procurement'
    }));

    return res.json({ success: true, transactions: formatted });
  } catch (err) {
    console.error('Error fetching transactions:', err);
    return res.status(500).json({ success: false, error: 'Server error retrieving transactions.' });
  }
});

// POST /api/transactions - Create a transaction (Admin only)
router.post('/', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const {
      categoryId,
      amount,
      description,
      vendor,
      requestedBy
    } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, error: 'Valid amount is required.' });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, error: 'Description is required.' });
    }

    // Generate transaction number
    const countRes = await supabaseAdmin.from('transactions').select('id', { count: 'exact', head: true });
    const nextTxnNum = `TXN-${900 + (countRes.count || 0) + 1}`;

    const { data: dept } = await supabaseAdmin
      .from('departments')
      .select('id')
      .eq('code', 'CSE')
      .maybeSingle();

    const { data: newTxn, error } = await supabaseAdmin
      .from('transactions')
      .insert({
        transaction_number: nextTxnNum,
        department_id: dept?.id,
        category_id: categoryId || null,
        amount: Number(amount),
        transaction_date: new Date().toISOString().split('T')[0],
        status: 'Approved',
        description: description.trim(),
        requested_by: requestedBy || req.profile.id,
        vendor: vendor || 'Kongu Procurement'
      })
      .select('*, budget_categories(name)')
      .single();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.status(201).json({
      success: true,
      message: 'Transaction recorded successfully.',
      transaction: newTxn
    });
  } catch (err) {
    console.error('Error creating transaction:', err);
    return res.status(500).json({ success: false, error: 'Server error creating transaction.' });
  }
});

// PATCH /api/transactions/:id/status - Update transaction status
router.patch('/:id/status', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const filterCol = isUuid ? 'id' : 'transaction_number';

    const { data: updated, error } = await supabaseAdmin
      .from('transactions')
      .update({ status })
      .eq(filterCol, id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.json({
      success: true,
      message: `Transaction ${id} status updated to ${status}.`,
      transaction: updated
    });
  } catch (err) {
    console.error('Error updating transaction:', err);
    return res.status(500).json({ success: false, error: 'Server error updating transaction.' });
  }
});

export default router;
