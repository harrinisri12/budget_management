import express from 'express';
import { supabaseAdmin } from '../supabaseClient.js';
import { authenticateUser } from '../middleware/auth.js';
import { requireAdminOrHod } from '../middleware/roles.js';

const router = express.Router();

// Helper to format proposal record from Supabase
const formatProposalRecord = (p) => {
  const ayLabel = p.academic_years?.academic_year || p.academic_years?.name || 'Academic Year';
  const catLabel = p.category || p.budget_categories?.name || 'Department Activity';

  return {
    id: p.id,
    dbId: p.id,
    proposalNumber: p.proposal_number || p.id,
    proposalId: p.proposal_number || p.id,
    academicYearId: p.academic_year_id,
    academicYear: ayLabel,
    proposalDate: p.proposal_date ? new Date(p.proposal_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
    facultyName: p.profiles?.name || 'Faculty Member',
    facultyEmail: p.profiles?.email || '',
    facultyId: p.faculty_id,
    category: catLabel,
    categoryId: p.category_id,
    subCategory: p.sub_category || '',
    subcategoryId: p.subcategory_id || null,
    title: p.title,
    programDate: p.program_date ? new Date(p.program_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
    guestDetails: p.guest_details || '',
    eventDetails: p.event_details || {},
    amount: Number(p.amount || 0),
    status: p.status,
    adminRemarks: p.admin_remarks || '',
    createdAt: p.created_at,
    updatedAt: p.updated_at
  };
};

// GET /api/proposals - Get real database proposals (Admin/HOD sees all, Faculty sees own)
router.get('/', authenticateUser, async (req, res) => {
  try {
    let query = supabaseAdmin
      .from('proposals')
      .select('*, profiles:faculty_id(id, name, email, employee_id), academic_years:academic_year_id(id, academic_year, budget), budget_categories:category_id(id, name)')
      .order('created_at', { ascending: false });

    // If regular faculty, restrict strictly to their own submitted proposals
    if (req.profile.role !== 'admin' && req.profile.role !== 'hod') {
      query = query.eq('faculty_id', req.profile.id);
    }

    const { data: proposals, error } = await query;

    if (error) {
      console.error('Error querying proposals from database:', error.message);
      return res.status(400).json({ success: false, error: error.message });
    }

    const formatted = (proposals || []).map(formatProposalRecord);
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
      academicYearId,
      academicYear,
      category,
      categoryId,
      subCategory,
      subcategoryId,
      title,
      programDate,
      proposalDate,
      guestDetails,
      eventDetails,
      event_details,
      amount
    } = req.body;

    // 1. Resolve Active Academic Year
    let resolvedAyId = academicYearId;
    let resolvedAyText = academicYear;

    if (!resolvedAyId) {
      const { data: activeAy, error: ayErr } = await supabaseAdmin
        .from('academic_years')
        .select('id, academic_year')
        .or('status.eq.ACTIVE,is_active.eq.true')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (ayErr) {
        console.warn('Academic year lookup notice:', ayErr.message);
      }

      if (activeAy) {
        resolvedAyId = activeAy.id;
        resolvedAyText = activeAy.academic_year;
      }
    }

    if (!resolvedAyId && !resolvedAyText) {
      return res.status(400).json({
        success: false,
        error: 'No active academic year found in database. Proposals can only be submitted against an active academic year.'
      });
    }

    // 2. Validate Category
    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, error: 'Category is required. Please select a Category.' });
    }

    const trimmedCat = category.trim();

    // 3. Validate Title & Program Date & Amount
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

    // 4. Resolve category ID & subcategory ID in database
    let resolvedCategoryId = categoryId;
    if (!resolvedCategoryId && resolvedAyId) {
      const { data: catRecord } = await supabaseAdmin
        .from('budget_categories')
        .select('id')
        .eq('academic_year_id', resolvedAyId)
        .ilike('name', trimmedCat)
        .maybeSingle();

      resolvedCategoryId = catRecord?.id;
    }

    let resolvedSubcategoryId = subcategoryId;
    if (!resolvedSubcategoryId && resolvedCategoryId && subCategory) {
      const { data: subRecord } = await supabaseAdmin
        .from('subcategories')
        .select('id')
        .eq('category_id', resolvedCategoryId)
        .ilike('name', subCategory.trim())
        .maybeSingle();

      resolvedSubcategoryId = subRecord?.id;
    }

    // 5. Generate proposal number from DB count
    let generatedProposalNumber = req.body.proposalId;
    if (!generatedProposalNumber) {
      const { count } = await supabaseAdmin
        .from('proposals')
        .select('id', { count: 'exact', head: true });

      const nextSeq = String((count || 0) + 1).padStart(3, '0');
      const ayClean = (resolvedAyText || '2026-2027').replace(/\s+/g, '');
      generatedProposalNumber = `PROP-${ayClean}-${nextSeq}`;
    }

    const activeEventDetails = eventDetails || event_details || {};

    const insertPayload = {
      proposal_number: generatedProposalNumber,
      faculty_id: req.profile.id,
      academic_year_id: resolvedAyId || null,
      category_id: resolvedCategoryId || null,
      subcategory_id: resolvedSubcategoryId || null,
      category: trimmedCat,
      sub_category: (subCategory || '').trim() || null,
      title: title.trim(),
      proposal_date: proposalDate || new Date().toISOString().split('T')[0],
      program_date: programDate,
      guest_details: (guestDetails || '').trim() || null,
      event_details: activeEventDetails,
      amount: parsedAmount,
      status: 'Pending'
    };

    const { data: newProposal, error } = await supabaseAdmin
      .from('proposals')
      .insert(insertPayload)
      .select('*, profiles:faculty_id(id, name, email, employee_id), academic_years:academic_year_id(id, academic_year, budget), budget_categories:category_id(id, name)')
      .single();

    if (error) {
      console.error('Error inserting proposal in database:', error.message);
      return res.status(400).json({ success: false, error: error.message });
    }

    const formatted = formatProposalRecord(newProposal);
    return res.status(201).json({
      success: true,
      message: `Proposal submitted successfully. Proposal ID: ${formatted.proposalNumber}`,
      proposal: formatted
    });
  } catch (err) {
    console.error('Error submitting proposal:', err);
    return res.status(500).json({ success: false, error: 'Server error submitting proposal.' });
  }
});

// PATCH /api/proposals/:id/status - Admin or HOD updates proposal status
router.patch('/:id/status', authenticateUser, requireAdminOrHod, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    // 1. Validate requested status
    const validStatuses = ['Pending', 'Under Review', 'Approved', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status '${status}'. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const filterCol = isUuid ? 'id' : 'proposal_number';

    // 2. Validate proposal exists in database
    const { data: existingProp, error: fetchErr } = await supabaseAdmin
      .from('proposals')
      .select('*')
      .eq(filterCol, id)
      .maybeSingle();

    if (fetchErr) {
      return res.status(400).json({ success: false, error: fetchErr.message });
    }

    if (!existingProp) {
      return res.status(404).json({
        success: false,
        error: `Proposal not found with identifier '${id}'.`
      });
    }

    // 3. Prepare updates
    const updates = {
      status,
      updated_at: new Date().toISOString()
    };
    if (remarks !== undefined && remarks !== null) {
      updates.admin_remarks = remarks;
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('proposals')
      .update(updates)
      .eq('id', existingProp.id)
      .select('*, profiles:faculty_id(id, name, email, employee_id), academic_years:academic_year_id(id, academic_year, budget), budget_categories:category_id(id, name)')
      .single();

    if (updateError) {
      return res.status(400).json({ success: false, error: updateError.message });
    }

    // 4. Maintain linked transaction in database for financial audit trail
    if (status === 'Approved') {
      try {
        const { data: existingTxn } = await supabaseAdmin
          .from('transactions')
          .select('id')
          .eq('proposal_id', existingProp.id)
          .maybeSingle();

        if (!existingTxn) {
          const { count } = await supabaseAdmin
            .from('transactions')
            .select('id', { count: 'exact', head: true });

          const nextTxnNum = `TXN-${1000 + (count || 0) + 1}`;

          const { data: dept } = await supabaseAdmin
            .from('departments')
            .select('id')
            .eq('code', 'CSE')
            .maybeSingle();

          await supabaseAdmin
            .from('transactions')
            .insert({
              transaction_number: nextTxnNum,
              department_id: dept?.id || null,
              category_id: updated.category_id || null,
              proposal_id: existingProp.id,
              amount: Number(updated.amount || 0),
              transaction_date: new Date().toISOString().split('T')[0],
              status: 'Approved',
              description: updated.title || 'Approved Proposal Disbursement',
              requested_by: updated.faculty_id || null,
              vendor: updated.guest_details || 'Kongu Procurement'
            });
        }
      } catch (txnErr) {
        console.warn('Transaction sync notice:', txnErr.message);
      }
    } else {
      // If status changed away from Approved, remove linked transaction
      try {
        await supabaseAdmin
          .from('transactions')
          .delete()
          .eq('proposal_id', existingProp.id);
      } catch (txnErr) {
        console.warn('Transaction cleanup notice:', txnErr.message);
      }
    }

    const formatted = formatProposalRecord(updated);
    return res.json({
      success: true,
      message: `Proposal ${formatted.proposalNumber} status updated to ${status}.`,
      proposal: formatted
    });
  } catch (err) {
    console.error('Error updating proposal status:', err);
    return res.status(500).json({ success: false, error: 'Server error updating proposal status.' });
  }
});

export default router;
