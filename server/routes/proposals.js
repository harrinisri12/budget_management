import express from 'express';
import { supabaseAdmin } from '../supabaseClient.js';
import { authenticateUser } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';

const router = express.Router();

// Helper to generate next proposal number PROP-YYYY-NNN
async function generateNextProposalNumber() {
  const currentYear = new Date().getFullYear();
  const prefix = `PROP-${currentYear}-`;

  const { data: latestProposals } = await supabaseAdmin
    .from('proposals')
    .select('proposal_number')
    .like('proposal_number', `${prefix}%`)
    .order('created_at', { ascending: false });

  let maxNum = 0;
  if (latestProposals && latestProposals.length > 0) {
    latestProposals.forEach(p => {
      const numPart = parseInt(p.proposal_number.replace(prefix, ''), 10);
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart;
      }
    });
  }

  const nextSeq = String(maxNum + 1).padStart(3, '0');
  return `${prefix}${nextSeq}`;
}

// GET /api/proposals - Get proposals (Admin sees all, Faculty sees own)
router.get('/', authenticateUser, async (req, res) => {
  try {
    let query = supabaseAdmin
      .from('proposals')
      .select('*, profiles:faculty_id(id, name, email, employee_id), budget_categories:category_id(id, name)')
      .order('created_at', { ascending: false });

    // If faculty, restrict to their own ID
    if (req.profile.role !== 'admin') {
      query = query.eq('faculty_id', req.profile.id);
    }

    const { data: proposals, error } = await query;

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    const formatted = proposals.map(p => ({
      id: p.proposal_number,
      dbId: p.id,
      proposalDate: p.proposal_date ? new Date(p.proposal_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
      facultyName: p.profiles?.name || 'Faculty Member',
      facultyEmail: p.profiles?.email || '',
      facultyId: p.faculty_id,
      category: p.budget_categories?.name || 'General CSE Activity',
      categoryId: p.category_id,
      title: p.title,
      programDate: p.program_date ? new Date(p.program_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
      guestDetails: p.guest_details || '',
      amount: Number(p.amount),
      status: p.status,
      adminRemarks: p.admin_remarks || ''
    }));

    return res.json({ success: true, proposals: formatted });
  } catch (err) {
    console.error('Error fetching proposals:', err);
    return res.status(500).json({ success: false, error: 'Server error retrieving proposals.' });
  }
});

// POST /api/proposals - Faculty submits a new proposal
router.post('/', authenticateUser, async (req, res) => {
  try {
    const {
      title,
      category,
      categoryId,
      programDate,
      guestDetails,
      amount
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Program / Proposal title is required.' });
    }

    if (!programDate) {
      return res.status(400).json({ success: false, error: 'Date of program is required.' });
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Valid proposed amount greater than 0 is required.' });
    }

    // Resolve category ID if category name was passed
    let resolvedCategoryId = categoryId;
    if (!resolvedCategoryId && category) {
      const { data: catRecord } = await supabaseAdmin
        .from('budget_categories')
        .select('id')
        .eq('name', category.trim())
        .maybeSingle();

      resolvedCategoryId = catRecord?.id;
    }

    // If still not resolved, get the first available category
    if (!resolvedCategoryId) {
      const { data: anyCat } = await supabaseAdmin
        .from('budget_categories')
        .select('id')
        .limit(1)
        .maybeSingle();
      resolvedCategoryId = anyCat?.id;
    }

    // Generate proposal number
    const proposalNumber = await generateNextProposalNumber();

    const { data: newProposal, error } = await supabaseAdmin
      .from('proposals')
      .insert({
        proposal_number: proposalNumber,
        faculty_id: req.profile.id,
        category_id: resolvedCategoryId,
        title: title.trim(),
        proposal_date: new Date().toISOString().split('T')[0],
        program_date: programDate,
        guest_details: (guestDetails || '').trim() || null,
        amount: parsedAmount,
        status: 'Pending'
      })
      .select('*, profiles:faculty_id(id, name, email), budget_categories:category_id(id, name)')
      .single();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    const formatted = {
      id: newProposal.proposal_number,
      dbId: newProposal.id,
      proposalDate: new Date(newProposal.proposal_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      facultyName: req.profile.name,
      facultyEmail: req.profile.email,
      facultyId: newProposal.faculty_id,
      category: newProposal.budget_categories?.name || category || 'CSE Activity',
      categoryId: newProposal.category_id,
      title: newProposal.title,
      programDate: new Date(newProposal.program_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      guestDetails: newProposal.guest_details || '',
      amount: Number(newProposal.amount),
      status: newProposal.status
    };

    return res.status(201).json({
      success: true,
      message: `Proposal submitted successfully. Proposal ID: ${proposalNumber}`,
      proposal: formatted
    });
  } catch (err) {
    console.error('Error submitting proposal:', err);
    return res.status(500).json({ success: false, error: 'Server error submitting proposal.' });
  }
});

// PATCH /api/proposals/:id/status - Admin updates proposal status
router.patch('/:id/status', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const validStatuses = ['Pending', 'Under Review', 'Approved', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    // Identify by proposal_number or UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const filterCol = isUuid ? 'id' : 'proposal_number';

    const updates = { status };
    if (remarks !== undefined) updates.admin_remarks = remarks;

    const { data: updated, error } = await supabaseAdmin
      .from('proposals')
      .update(updates)
      .eq(filterCol, id)
      .select('*, profiles:faculty_id(name, email), budget_categories:category_id(name)')
      .single();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.json({
      success: true,
      message: `Proposal ${updated.proposal_number} status updated to ${status}.`,
      proposal: updated
    });
  } catch (err) {
    console.error('Error updating proposal status:', err);
    return res.status(500).json({ success: false, error: 'Server error updating proposal status.' });
  }
});

export default router;
