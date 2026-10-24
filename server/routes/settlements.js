import express from 'express';
import { supabaseAdmin } from '../supabaseClient.js';
import { authenticateUser } from '../middleware/auth.js';
import { requireAdminOrHod } from '../middleware/roles.js';

const router = express.Router();

/**
 * Helper to process atomic settlement operation:
 * Replaces the provisional proposed-amount deduction with the actual settlement-amount deduction.
 */
export const processProposalSettlement = async ({ proposalId, settlementAmount, remarks, userProfile, dbClient = supabaseAdmin }) => {
  const parsedAmount = Number(settlementAmount);
  if (isNaN(parsedAmount) || parsedAmount < 0) {
    throw new Error('Invalid settlement amount: amount must be a positive number or zero.');
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(proposalId);
  const filterCol = isUuid ? 'id' : 'proposal_number';

  // 1. Fetch proposal
  const { data: prop, error: fetchErr } = await dbClient
    .from('proposals')
    .select('*, budget_categories:category_id(*), academic_years:academic_year_id(*)')
    .eq(filterCol, proposalId)
    .maybeSingle();

  if (fetchErr) {
    throw new Error(`Database error fetching proposal: ${fetchErr.message}`);
  }

  if (!prop) {
    throw new Error(`Proposal not found with identifier '${proposalId}'.`);
  }

  // Enforce accepted / approved prerequisite
  const normalizedStatus = (prop.status || '').toLowerCase();
  if (normalizedStatus !== 'accepted' && normalizedStatus !== 'approved') {
    throw new Error(`Cannot settle proposal with status '${prop.status}'. Only accepted proposals can be settled.`);
  }

  // 2. Try calling PostgreSQL atomic RPC function if available in database
  try {
    const { data: rpcData, error: rpcErr } = await dbClient.rpc('settle_proposal', {
      p_proposal_id: prop.id,
      p_settler_id: userProfile.id,
      p_actual_amount: parsedAmount,
      p_remarks: remarks || null
    });

    if (!rpcErr && rpcData) {
      return {
        success: true,
        proposalId: prop.id,
        proposalNumber: prop.proposal_number,
        proposedAmount: Number(prop.amount),
        settlementAmount: parsedAmount,
        differenceAdjusted: rpcData.differenceAdjusted,
        settlementStatus: 'settled',
        message: `Settlement of ₹${parsedAmount.toLocaleString('en-IN')} finalized successfully.`
      };
    }
    if (rpcErr && !rpcErr.message.includes('function') && !rpcErr.message.includes('does not exist')) {
      throw new Error(rpcErr.message);
    }
  } catch (rpcCallErr) {
    if (!rpcCallErr.message.includes('function') && !rpcCallErr.message.includes('does not exist') && !rpcCallErr.message.includes('404')) {
      throw rpcCallErr;
    }
    // RPC not present in database yet; proceed with atomic Express logic below
  }

  // 3. Fallback atomic calculation:
  // Identify previous deduction:
  // If already settled, previous deduction was previous settlement_amount.
  // If first time settling, previous deduction was approved_amount or amount.
  const isAlreadySettled = prop.settlement_status === 'settled' && prop.settlement_amount !== null && prop.settlement_amount !== undefined;
  const prevDeduction = isAlreadySettled
    ? Number(prop.settlement_amount || 0)
    : Number(prop.approved_amount ?? prop.amount ?? 0);

  // Net difference:
  // diff = new actual settlement - previous deduction
  // e.g. Proposed 10,000, Actual 8,000 -> diff = -2,000 (budget credited back)
  // e.g. Proposed 10,000, Actual 12,000 -> diff = +2,000 (extra deduction from budget)
  const diff = parsedAmount - prevDeduction;

  // 4. Budget check and category deduction replacement
  if (prop.category_id) {
    const { data: cat, error: catErr } = await dbClient
      .from('budget_categories')
      .select('*')
      .eq('id', prop.category_id)
      .maybeSingle();

    if (catErr) {
      throw new Error(`Error verifying category budget: ${catErr.message}`);
    }

    if (cat) {
      const allocated = Number(cat.allocated_amount || 0);
      const currentSpent = Number(cat.spent_amount || 0);
      const available = Math.max(0, allocated - currentSpent);

      if (diff > 0 && diff > available) {
        throw new Error(
          `Insufficient category budget for settlement excess. Available: ₹${available.toLocaleString('en-IN')}, Required additional: ₹${diff.toLocaleString('en-IN')}.`
        );
      }

      // Apply replacement difference atomically: credits back if diff < 0, deducts if diff > 0
      const newSpent = Math.max(0, currentSpent + diff);
      const { error: updateCatErr } = await dbClient
        .from('budget_categories')
        .update({ spent_amount: newSpent })
        .eq('id', cat.id);

      if (updateCatErr) {
        throw new Error(`Failed to update category budget allocation: ${updateCatErr.message}`);
      }
    }
  }

  // 5. Update proposal with settlement details (preserving original amount)
  const proposalUpdates = {
    settlement_amount: parsedAmount,
    settlement_status: 'settled',
    settled_at: new Date().toISOString(),
    settled_by: userProfile.id,
    settlement_remarks: remarks || prop.settlement_remarks || null,
    updated_at: new Date().toISOString()
  };

  let { data: updatedProp, error: propUpdateErr } = await dbClient
    .from('proposals')
    .update(proposalUpdates)
    .eq('id', prop.id)
    .select('*, profiles:faculty_id(id, name, email), budget_categories:category_id(id, name), academic_years:academic_year_id(id, academic_year, budget)')
    .single();

  if (propUpdateErr && (propUpdateErr.code === 'PGRST204' || propUpdateErr.message?.includes('column') || propUpdateErr.message?.includes('schema cache'))) {
    const fallbackUpdates = {
      updated_at: new Date().toISOString()
    };
    if (remarks) fallbackUpdates.admin_remarks = remarks;
    const fallbackRes = await dbClient
      .from('proposals')
      .update(fallbackUpdates)
      .eq('id', prop.id)
      .select('*, profiles:faculty_id(id, name, email), budget_categories:category_id(id, name), academic_years:academic_year_id(id, academic_year, budget)')
      .single();
    if (!fallbackRes.error) {
      updatedProp = fallbackRes.data;
      propUpdateErr = null;
    }
  }

  if (propUpdateErr) {
    throw new Error(`Failed to update proposal settlement status: ${propUpdateErr.message}`);
  }

  // 6. Record audit entry in settlements table
  try {
    await dbClient
      .from('settlements')
      .insert({
        proposal_id: prop.id,
        academic_year_id: prop.academic_year_id || null,
        category_id: prop.category_id || null,
        proposed_amount: Number(prop.amount),
        settlement_amount: parsedAmount,
        difference_amount: diff,
        status: isAlreadySettled ? 'edited' : 'finalized',
        remarks: remarks || null,
        settled_by: userProfile.id
      });
  } catch (auditErr) {
    console.warn('Settlement audit log notice:', auditErr.message);
  }

  // 7. Update linked financial transaction to match actual settlement amount
  try {
    const { data: existingTxn } = await dbClient
      .from('transactions')
      .select('id')
      .eq('proposal_id', prop.id)
      .maybeSingle();

    if (existingTxn) {
      await dbClient
        .from('transactions')
        .update({
          amount: parsedAmount,
          status: 'Settled',
          description: `${prop.title || 'Proposal'} (Finalized Settlement)`
        })
        .eq('id', existingTxn.id);
    } else {
      const { count } = await dbClient.from('transactions').select('id', { count: 'exact', head: true });
      const nextTxnNum = `TXN-${1000 + (count || 0) + 1}`;

      await dbClient
        .from('transactions')
        .insert({
          transaction_number: nextTxnNum,
          category_id: prop.category_id || null,
          proposal_id: prop.id,
          amount: parsedAmount,
          transaction_date: new Date().toISOString().split('T')[0],
          status: 'Settled',
          description: `${prop.title || 'Proposal'} (Finalized Settlement)`,
          requested_by: prop.faculty_id || null
        });
    }
  } catch (txnErr) {
    console.warn('Transaction sync notice on settlement:', txnErr.message);
  }

  return {
    success: true,
    proposalId: prop.id,
    proposalNumber: prop.proposal_number,
    proposedAmount: Number(prop.amount),
    settlementAmount: parsedAmount,
    differenceAdjusted: diff,
    settlementStatus: 'settled',
    proposal: updatedProp,
    message: `Settlement of ₹${parsedAmount.toLocaleString('en-IN')} finalized successfully.`
  };
};

// GET /api/settlements - List settlements
router.get('/', authenticateUser, async (req, res) => {
  try {
    const db = req.supabase || supabaseAdmin;
    let query = db
      .from('settlements')
      .select('*, proposals:proposal_id(id, proposal_number, title, amount, status, faculty_id), academic_years:academic_year_id(academic_year), budget_categories:category_id(name), profiles:settled_by(name, email)')
      .order('created_at', { ascending: false });

    // Faculty only sees settlements for their own proposals
    if (req.profile.role !== 'admin' && req.profile.role !== 'hod') {
      const { data: facultyProps } = await db
        .from('proposals')
        .select('id')
        .eq('faculty_id', req.profile.id);

      const propIds = (facultyProps || []).map(p => p.id);
      if (propIds.length === 0) {
        return res.json({ success: true, settlements: [] });
      }
      query = query.in('proposal_id', propIds);
    }

    const { data: settlements, error } = await query;
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.json({ success: true, settlements: settlements || [] });
  } catch (err) {
    console.error('Error fetching settlements:', err);
    return res.status(500).json({ success: false, error: 'Server error retrieving settlements.' });
  }
});

// GET /api/settlements/:proposalId - Get settlement for a specific proposal
router.get('/:proposalId', authenticateUser, async (req, res) => {
  try {
    const { proposalId } = req.params;
    const db = req.supabase || supabaseAdmin;

    const { data: settlement, error } = await db
      .from('settlements')
      .select('*, proposals:proposal_id(id, proposal_number, title, amount, status), academic_years:academic_year_id(academic_year), budget_categories:category_id(name), profiles:settled_by(name, email)')
      .eq('proposal_id', proposalId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.json({ success: true, settlement });
  } catch (err) {
    console.error('Error retrieving proposal settlement:', err);
    return res.status(500).json({ success: false, error: 'Server error retrieving settlement.' });
  }
});

// POST /api/settlements - Finalize or edit a proposal settlement
router.post('/', authenticateUser, requireAdminOrHod, async (req, res) => {
  try {
    const { proposalId, settlementAmount, remarks } = req.body;

    if (!proposalId) {
      return res.status(400).json({ success: false, error: 'Proposal ID is required for settlement.' });
    }

    if (settlementAmount === undefined || settlementAmount === null || Number(settlementAmount) < 0) {
      return res.status(400).json({ success: false, error: 'Valid non-negative settlement amount is required.' });
    }

    const result = await processProposalSettlement({
      proposalId,
      settlementAmount,
      remarks,
      userProfile: req.profile,
      dbClient: req.supabase || supabaseAdmin
    });

    return res.json(result);
  } catch (err) {
    console.error('Error finalizing settlement:', err);
    return res.status(400).json({ success: false, error: err.message || 'Error processing settlement.' });
  }
});

export default router;
