import express from 'express';
import { supabaseAdmin } from '../supabaseClient.js';
import { authenticateUser } from '../middleware/auth.js';
import { requireAdmin, requireAdminOrHod } from '../middleware/roles.js';
import { processProposalSettlement } from './settlements.js';

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
    eventDetails: (p.event_details && typeof p.event_details === 'object') ? p.event_details : {},
    amount: Number(p.amount || 0),
    status: p.status,
    adminRemarks: p.admin_remarks || '',
    acceptedAt: p.accepted_at || null,
    rejectedAt: p.rejected_at || null,
    approvedAmount: p.approved_amount !== null && p.approved_amount !== undefined ? Number(p.approved_amount) : (['Accepted', 'accepted', 'Approved', 'approved'].includes(p.status) ? Number(p.amount || 0) : null),
    settlementAmount: p.settlement_amount !== null && p.settlement_amount !== undefined ? Number(p.settlement_amount) : null,
    settlementStatus: p.settlement_status || (p.settlement_amount !== null && p.settlement_amount !== undefined ? 'settled' : 'unsettled'),
    settledAt: p.settled_at || null,
    settledBy: p.settled_by || null,
    settlementRemarks: p.settlement_remarks || '',
    reviewedBy: p.reviewed_by || null,
    createdAt: p.created_at,
    updatedAt: p.updated_at
  };
};

// GET /api/proposals - Get real database proposals (Admin/HOD sees all, Faculty sees own)
// Automatically enforces 24-hour retention: rejected proposals older than 24 hours are excluded
router.get('/', authenticateUser, async (req, res) => {
  try {
    const db = req.supabase || supabaseAdmin;
    let query = db
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

    // Filter out rejected proposals that have exceeded the 24-hour retention period
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000;
    const activeProposals = (proposals || []).filter(p => {
      const isRejected = (p.status || '').toLowerCase() === 'rejected';
      if (isRejected && p.rejected_at) {
        const rejectedTime = new Date(p.rejected_at).getTime();
        if (!isNaN(rejectedTime) && rejectedTime <= cutoffTime) {
          return false; // Expired 24-hour retention: do not display
        }
      }
      return true;
    });

    const formatted = activeProposals.map(formatProposalRecord);
    return res.json({ success: true, proposals: formatted });
  } catch (err) {
    console.error('Error fetching proposals:', err);
    return res.status(500).json({ success: false, error: 'Server error retrieving proposals.' });
  }
});

// POST /api/proposals - Faculty submits a new proposal
router.post('/', authenticateUser, async (req, res) => {
  try {
    const db = req.supabase || supabaseAdmin;
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

    // Helper for institutional proposal slugification
    const slugifyText = (text) => {
      if (!text || typeof text !== 'string') return '';
      return text
        .trim()
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    // 1. Resolve Active Academic Year
    let resolvedAyId = academicYearId;
    let resolvedAyText = academicYear;

    if (!resolvedAyId) {
      const { data: activeAy, error: ayErr } = await db
        .from('academic_years')
        .select('id, academic_year, status, is_active')
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

    // 1b. Verify Academic Year permits submissions (Active)
    if (resolvedAyId) {
      const { data: targetAy } = await db
        .from('academic_years')
        .select('id, academic_year, status, is_active')
        .eq('id', resolvedAyId)
        .maybeSingle();

      if (targetAy) {
        const isActiveAy = (targetAy.status && targetAy.status.toUpperCase() === 'ACTIVE') || Boolean(targetAy.is_active);
        if (!isActiveAy) {
          return res.status(400).json({
            success: false,
            error: `Academic year "${targetAy.academic_year}" is closed/inactive. Proposals can only be submitted against active academic years.`
          });
        }
      }
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

    // Schedule sequence validation
    const activeEventDetails = eventDetails || event_details || {};
    const progDetails = (activeEventDetails && typeof activeEventDetails === 'object') ? activeEventDetails.programmeDetails : null;
    if (progDetails) {
      if (progDetails.endDate && progDetails.endDate < programDate) {
        return res.status(400).json({ success: false, error: 'End date cannot precede the start date.' });
      }
      if (progDetails.startTime && progDetails.endTime) {
        const effectiveEnd = progDetails.endDate || programDate;
        if (effectiveEnd === programDate && progDetails.endTime <= progDetails.startTime) {
          return res.status(400).json({ success: false, error: 'Session end time must follow start time on the same day.' });
        }
      }
    }

    // 4. Validate and resolve Category
    let catRecord = null;
    if (categoryId) {
      const { data: catById } = await db
        .from('budget_categories')
        .select('id, academic_year_id, budget_id, name')
        .eq('id', categoryId)
        .maybeSingle();
      catRecord = catById;
    } else {
      const { data: catByName } = await db
        .from('budget_categories')
        .select('id, academic_year_id, budget_id, name')
        .ilike('name', trimmedCat)
        .eq('academic_year_id', resolvedAyId)
        .maybeSingle();
      catRecord = catByName;
    }

    if (!catRecord) {
      return res.status(400).json({
        success: false,
        error: `Category "${trimmedCat}" was not found in the database for the selected academic year.`
      });
    }

    // Verify category belongs to the selected academic year
    let categoryMatchesYear = catRecord.academic_year_id === resolvedAyId;
    if (!categoryMatchesYear && catRecord.budget_id) {
      const { data: bRow } = await db
        .from('budgets')
        .select('financial_year')
        .eq('id', catRecord.budget_id)
        .maybeSingle();

      const { data: ayRow } = await db
        .from('academic_years')
        .select('academic_year')
        .eq('id', resolvedAyId)
        .maybeSingle();

      if (bRow?.financial_year && ayRow?.academic_year) {
        const cleanB = bRow.financial_year.replace(/\s+/g, '').replace(/[–—/]/g, '-');
        const cleanAy = ayRow.academic_year.replace(/\s+/g, '').replace(/[–—/]/g, '-');
        categoryMatchesYear = cleanB === cleanAy;
      }
    }

    if (!categoryMatchesYear) {
      return res.status(400).json({
        success: false,
        error: 'The selected category does not belong to the selected academic year.'
      });
    }

    const resolvedCategoryId = catRecord.id;

    // 5. Validate and resolve Subcategory
    const { data: validSubs, error: subsErr } = await db
      .from('subcategories')
      .select('id, name')
      .eq('category_id', resolvedCategoryId);

    if (subsErr) {
      console.error('Error fetching valid subcategories:', subsErr.message);
      return res.status(500).json({ success: false, error: 'Database error validating subcategories.' });
    }

    let resolvedSubcategoryId = null;
    let resolvedSubCategoryText = '';

    if (validSubs && validSubs.length > 0) {
      // This category HAS subcategories configured: subcategory selection is mandatory
      if (!subcategoryId && (!subCategory || !subCategory.trim())) {
        return res.status(400).json({
          success: false,
          error: `Please select a valid subcategory for category "${catRecord.name}".`
        });
      }

      let subMatch = null;
      if (subcategoryId) {
        subMatch = validSubs.find(s => s.id === subcategoryId);
        if (!subMatch) {
          return res.status(400).json({
            success: false,
            error: 'The selected subcategory does not belong to the selected category or academic year.'
          });
        }
      } else if (subCategory && subCategory.trim()) {
        const cleanSubName = subCategory.trim().toLowerCase();
        subMatch = validSubs.find(s => s.name.trim().toLowerCase() === cleanSubName);
        if (!subMatch) {
          return res.status(400).json({
            success: false,
            error: 'The selected subcategory does not belong to the selected category or academic year.'
          });
        }
      }

      resolvedSubcategoryId = subMatch.id;
      resolvedSubCategoryText = subMatch.name;
    } else {
      // Direct category (no subcategories configured in DB)
      if (subcategoryId) {
        return res.status(400).json({
          success: false,
          error: 'The selected subcategory does not belong to this category (this category has no subcategories).'
        });
      }
      resolvedSubcategoryId = null;
      resolvedSubCategoryText = subCategory ? subCategory.trim() : '';
    }

    // 5. Generate secure, unique proposal number matching institutional convention
    let generatedProposalNumber = req.body.proposalId;
    const isPlaceholderId = !generatedProposalNumber ||
      generatedProposalNumber.includes('(assigned on submit)') ||
      generatedProposalNumber.includes('pending') ||
      generatedProposalNumber.includes('placeholder') ||
      generatedProposalNumber.includes('PROP-');

    if (isPlaceholderId) {
      const ayClean = (resolvedAyText || '2026-2027').replace(/\s+/g, '');
      const catSlug = slugifyText(trimmedCat || 'GENERAL');
      const subCatSlug = subCategory ? slugifyText(subCategory) : '';
      const basePrefix = subCatSlug
        ? `KEC/${ayClean}/${catSlug}/${subCatSlug}`
        : `KEC/${ayClean}/${catSlug}`;

      const { count } = await db
        .from('proposals')
        .select('id', { count: 'exact', head: true });

      let nextSeq = (count || 0) + 1;
      let candidateId = `${basePrefix}/${String(nextSeq).padStart(3, '0')}`;

      // Guarantee collision-proof uniqueness
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 15) {
        attempts++;
        const { data: existing } = await db
          .from('proposals')
          .select('id')
          .eq('proposal_number', candidateId)
          .maybeSingle();

        if (!existing) {
          isUnique = true;
        } else {
          nextSeq++;
          candidateId = `${basePrefix}/${String(nextSeq).padStart(3, '0')}`;
        }
      }
      generatedProposalNumber = candidateId;
    }

    const insertPayload = {
      proposal_number: generatedProposalNumber,
      faculty_id: req.profile.id,
      academic_year_id: resolvedAyId || null,
      category_id: resolvedCategoryId || null,
      subcategory_id: resolvedSubcategoryId || null,
      category: catRecord.name,
      sub_category: resolvedSubCategoryText || (subCategory || '').trim() || null,
      title: title.trim(),
      proposal_date: proposalDate || new Date().toISOString().split('T')[0],
      program_date: programDate,
      guest_details: (guestDetails || '').trim() || null,
      event_details: activeEventDetails,
      amount: parsedAmount,
      status: 'Pending'
    };

    let { data: newProposal, error } = await db
      .from('proposals')
      .insert(insertPayload)
      .select('*, profiles:faculty_id(id, name, email, employee_id), academic_years:academic_year_id(id, academic_year, budget), budget_categories:category_id(id, name)')
      .single();

    if (error && db !== supabaseAdmin) {
      const fallbackResult = await supabaseAdmin
        .from('proposals')
        .insert(insertPayload)
        .select('*, profiles:faculty_id(id, name, email, employee_id), academic_years:academic_year_id(id, academic_year, budget), budget_categories:category_id(id, name)')
        .single();
      if (!fallbackResult.error) {
        newProposal = fallbackResult.data;
        error = null;
      }
    }

    if (error) {
      console.error('Error inserting proposal in database:', error.message);
      if (error.message && (error.message.includes('event_details') || error.code === '42703')) {
        return res.status(400).json({
          success: false,
          error: 'Database schema migration required: The "event_details" column is missing from the "proposals" table. Please apply the migration in Supabase SQL Editor: ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS event_details JSONB NOT NULL DEFAULT \'{}\'::jsonb;'
        });
      }
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

/**
 * Atomic helper: Accept proposal, deduct proposed amount from budget, create transaction, record admin & timestamp
 */
export const executeProposalAcceptance = async ({ proposalId, adminProfile, remarks, dbClient = supabaseAdmin }) => {
  if (!adminProfile || adminProfile.role !== 'admin') {
    throw new Error('Forbidden: Only authenticated administrators can accept proposals.');
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(proposalId);
  let prop = null;

  // 1. Fetch proposal by UUID if formatted as UUID
  if (isUuid) {
    const { data: propById } = await dbClient
      .from('proposals')
      .select('*, budget_categories:category_id(*), academic_years:academic_year_id(*)')
      .eq('id', proposalId)
      .maybeSingle();
    if (propById) prop = propById;
  }

  // 1b. Fetch proposal by proposal_number
  if (!prop) {
    const { data: propByNum } = await dbClient
      .from('proposals')
      .select('*, budget_categories:category_id(*), academic_years:academic_year_id(*)')
      .eq('proposal_number', proposalId)
      .maybeSingle();
    if (propByNum) prop = propByNum;
  }

  // 1c. Fallback fetch by id if not standard UUID format
  if (!prop && !isUuid) {
    const { data: propByIdFallback } = await dbClient
      .from('proposals')
      .select('*, budget_categories:category_id(*), academic_years:academic_year_id(*)')
      .eq('id', proposalId)
      .maybeSingle();
    if (propByIdFallback) prop = propByIdFallback;
  }

  if (!prop) {
    throw new Error(`Proposal not found with identifier '${proposalId}'.`);
  }

  // Prevent acceptance if already processed / approved / accepted
  const normStatus = (prop.status || '').toLowerCase();
  if (normStatus === 'accepted' || normStatus === 'approved') {
    throw new Error(`Proposal ${prop.proposal_number || prop.id} has already been accepted/approved. Repeated deductions are prevented.`);
  }

  if (normStatus === 'rejected') {
    throw new Error(`Cannot accept proposal ${prop.proposal_number || prop.id} because it was marked as rejected.`);
  }

  // 2. Try PostgreSQL atomic RPC function first
  try {
    const { data: rpcData, error: rpcErr } = await dbClient.rpc('accept_proposal', {
      p_proposal_id: prop.id,
      p_admin_id: adminProfile.id,
      p_remarks: remarks || null
    });

    if (!rpcErr && rpcData?.success) {
      const { data: updatedProp } = await dbClient
        .from('proposals')
        .select('*, profiles:faculty_id(id, name, email, employee_id), academic_years:academic_year_id(id, academic_year, budget), budget_categories:category_id(id, name)')
        .eq('id', prop.id)
        .single();

      return formatProposalRecord(updatedProp || prop);
    }

    if (rpcErr && !rpcErr.message.includes('function') && !rpcErr.message.includes('does not exist')) {
      throw new Error(rpcErr.message);
    }
  } catch (rpcCallErr) {
    if (!rpcCallErr.message.includes('function') && !rpcCallErr.message.includes('does not exist') && !rpcCallErr.message.includes('404')) {
      throw rpcCallErr;
    }
    // Fall back to atomic sequence below
  }

  // 3. Fallback: Validate budget sufficiency and deduct immediately
  const proposedAmount = Number(prop.amount || 0);

  if (prop.category_id) {
    const { data: cat, error: catErr } = await dbClient
      .from('budget_categories')
      .select('*')
      .eq('id', prop.category_id)
      .maybeSingle();

    if (catErr) {
      throw new Error(`Database error checking category budget: ${catErr.message}`);
    }

    if (cat) {
      const allocated = Number(cat.allocated_amount || 0);
      const spent = Number(cat.spent_amount || 0);
      const available = Math.max(0, allocated - spent);

      if (proposedAmount > available) {
        throw new Error(
          `Insufficient budget in category "${cat.name}". Available budget: ₹${available.toLocaleString('en-IN')}, Proposed amount: ₹${proposedAmount.toLocaleString('en-IN')}. Acceptance prevented to avoid budget deficit.`
        );
      }

      // Deduct immediately by incrementing spent_amount
      const newSpent = spent + proposedAmount;
      const { error: catUpdateErr } = await dbClient
        .from('budget_categories')
        .update({ spent_amount: newSpent })
        .eq('id', cat.id);

      if (catUpdateErr) {
        throw new Error(`Failed to deduct proposed amount from category budget: ${catUpdateErr.message}`);
      }
    }
  }

  // 4. Update proposal status to canonical 'Approved'
  const fullUpdates = {
    status: 'Approved',
    approved_amount: proposedAmount,
    accepted_at: new Date().toISOString(),
    reviewed_by: adminProfile.id,
    settlement_status: 'unsettled',
    updated_at: new Date().toISOString()
  };

  if (remarks !== undefined && remarks !== null) {
    fullUpdates.admin_remarks = remarks;
  }

  let { data: updated, error: updateError } = await dbClient
    .from('proposals')
    .update(fullUpdates)
    .eq('id', prop.id)
    .select('*, profiles:faculty_id(id, name, email, employee_id), academic_years:academic_year_id(id, academic_year, budget), budget_categories:category_id(id, name)')
    .single();

  // If approved_amount or extension columns are missing from PostgREST schema cache (PGRST204),
  // gracefully fall back to updating the core columns so the operation succeeds
  if (updateError && (updateError.message?.includes('column') || updateError.code === 'PGRST204')) {
    const coreUpdates = {
      status: 'Approved',
      updated_at: new Date().toISOString()
    };
    if (remarks !== undefined && remarks !== null) {
      coreUpdates.admin_remarks = remarks;
    }

    const fallbackResult = await dbClient
      .from('proposals')
      .update(coreUpdates)
      .eq('id', prop.id)
      .select('*, profiles:faculty_id(id, name, email, employee_id), academic_years:academic_year_id(id, academic_year, budget), budget_categories:category_id(id, name)')
      .single();

    if (fallbackResult.error) {
      throw new Error(`Failed to update proposal status: ${fallbackResult.error.message}`);
    }
    updated = fallbackResult.data;
    updateError = null;
  } else if (updateError) {
    throw new Error(`Failed to update proposal status: ${updateError.message}`);
  }

  // 5. Create or sync linked transaction
  try {
    const { count } = await dbClient.from('transactions').select('id', { count: 'exact', head: true });
    const nextTxnNum = `TXN-${1000 + (count || 0) + 1}`;

    const { data: dept } = await dbClient
      .from('departments')
      .select('id')
      .eq('code', 'CSE')
      .maybeSingle();

    await dbClient
      .from('transactions')
      .delete()
      .eq('proposal_id', prop.id);

    await dbClient
      .from('transactions')
      .insert({
        transaction_number: nextTxnNum,
        department_id: dept?.id || null,
        category_id: updated.category_id || null,
        proposal_id: prop.id,
        amount: proposedAmount,
        transaction_date: new Date().toISOString().split('T')[0],
        status: 'Approved',
        description: updated.title ? `${updated.title} (Accepted Proposal Allocation)` : 'Accepted Proposal Allocation',
        requested_by: updated.faculty_id || null,
        vendor: updated.guest_details || 'Kongu Procurement'
      });
  } catch (txnErr) {
    console.warn('Transaction sync notice on acceptance:', txnErr.message);
  }

  return formatProposalRecord(updated);
};

/**
 * Atomic helper: Reject proposal, record rejection timestamp & admin, rollback previous deductions if any
 */
export const executeProposalRejection = async ({ proposalId, adminProfile, remarks, dbClient = supabaseAdmin }) => {
  if (!adminProfile || adminProfile.role !== 'admin') {
    throw new Error('Forbidden: Only authenticated administrators can reject proposals.');
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(proposalId);
  let prop = null;

  // 1. Fetch proposal by UUID if formatted as UUID
  if (isUuid) {
    const { data: propById } = await dbClient
      .from('proposals')
      .select('*')
      .eq('id', proposalId)
      .maybeSingle();
    if (propById) prop = propById;
  }

  // 1b. Fetch proposal by proposal_number
  if (!prop) {
    const { data: propByNum } = await dbClient
      .from('proposals')
      .select('*')
      .eq('proposal_number', proposalId)
      .maybeSingle();
    if (propByNum) prop = propByNum;
  }

  // 1c. Fallback fetch by id if not standard UUID format
  if (!prop && !isUuid) {
    const { data: propByIdFallback } = await dbClient
      .from('proposals')
      .select('*')
      .eq('id', proposalId)
      .maybeSingle();
    if (propByIdFallback) prop = propByIdFallback;
  }

  if (!prop) {
    throw new Error(`Proposal not found with identifier '${proposalId}'.`);
  }

  // 2. Try PostgreSQL atomic RPC function first
  try {
    const { data: rpcData, error: rpcErr } = await dbClient.rpc('reject_proposal', {
      p_proposal_id: prop.id,
      p_admin_id: adminProfile.id,
      p_remarks: remarks || null
    });

    if (!rpcErr && rpcData?.success) {
      const { data: updatedProp } = await dbClient
        .from('proposals')
        .select('*, profiles:faculty_id(id, name, email, employee_id), academic_years:academic_year_id(id, academic_year, budget), budget_categories:category_id(id, name)')
        .eq('id', prop.id)
        .single();

      return formatProposalRecord(updatedProp || prop);
    }

    if (rpcErr && !rpcErr.message.includes('function') && !rpcErr.message.includes('does not exist')) {
      throw new Error(rpcErr.message);
    }
  } catch (rpcCallErr) {
    if (!rpcCallErr.message.includes('function') && !rpcCallErr.message.includes('does not exist') && !rpcCallErr.message.includes('404')) {
      throw rpcCallErr;
    }
    // Fall back to direct query below
  }

  // 3. If proposal was previously accepted/approved, credit back any deducted amount from category
  const prevStatus = (prop.status || '').toLowerCase();
  if (['accepted', 'approved'].includes(prevStatus) && prop.category_id) {
    const prevDeduction = prop.settlement_status === 'settled' && prop.settlement_amount !== null
      ? Number(prop.settlement_amount)
      : Number(prop.approved_amount || prop.amount || 0);

    const { data: cat } = await dbClient
      .from('budget_categories')
      .select('id, spent_amount')
      .eq('id', prop.category_id)
      .maybeSingle();

    if (cat) {
      const newSpent = Math.max(0, Number(cat.spent_amount || 0) - prevDeduction);
      await dbClient
        .from('budget_categories')
        .update({ spent_amount: newSpent })
        .eq('id', cat.id);
    }

    // Remove linked transactions
    await dbClient
      .from('transactions')
      .delete()
      .eq('proposal_id', prop.id);
  }

  // 4. Update proposal status to 'Rejected' and record rejection timestamp
  const rejectionTimestamp = new Date().toISOString();
  const fullUpdates = {
    status: 'Rejected',
    rejected_at: rejectionTimestamp,
    reviewed_by: adminProfile.id,
    updated_at: rejectionTimestamp
  };

  if (remarks !== undefined && remarks !== null) {
    fullUpdates.admin_remarks = remarks;
  }

  let { data: updated, error: updateError } = await dbClient
    .from('proposals')
    .update(fullUpdates)
    .eq('id', prop.id)
    .select('*, profiles:faculty_id(id, name, email, employee_id), academic_years:academic_year_id(id, academic_year, budget), budget_categories:category_id(id, name)')
    .single();

  if (updateError && (updateError.message?.includes('column') || updateError.code === 'PGRST204')) {
    const coreUpdates = {
      status: 'Rejected',
      updated_at: rejectionTimestamp
    };
    if (remarks !== undefined && remarks !== null) {
      coreUpdates.admin_remarks = remarks;
    }

    const fallbackResult = await dbClient
      .from('proposals')
      .update(coreUpdates)
      .eq('id', prop.id)
      .select('*, profiles:faculty_id(id, name, email, employee_id), academic_years:academic_year_id(id, academic_year, budget), budget_categories:category_id(id, name)')
      .single();

    if (fallbackResult.error) {
      throw new Error(`Failed to update proposal rejection status: ${fallbackResult.error.message}`);
    }
    updated = fallbackResult.data;
    updateError = null;
  } else if (updateError) {
    throw new Error(`Failed to update proposal rejection status: ${updateError.message}`);
  }

  return formatProposalRecord(updated);
};

// Handler for accepting proposal
const handleAcceptProposal = async (req, res) => {
  try {
    const rawId = req.params.id || req.params[0] || req.body.proposalId || req.body.id;
    if (!rawId) {
      return res.status(400).json({ success: false, error: 'Proposal ID is required.' });
    }

    const id = decodeURIComponent(String(rawId)).replace(/^\/+|\/+$/g, '');
    const { remarks } = req.body;

    const formatted = await executeProposalAcceptance({
      proposalId: id,
      adminProfile: req.profile,
      remarks,
      dbClient: req.supabase || supabaseAdmin
    });

    return res.json({
      success: true,
      message: `Proposal ${formatted.proposalNumber} has been successfully accepted. ₹${formatted.amount.toLocaleString('en-IN')} deducted from category budget.`,
      proposal: formatted
    });
  } catch (err) {
    console.error('Error accepting proposal:', err);
    return res.status(400).json({ success: false, error: err.message || 'Error accepting proposal.' });
  }
};

// Handler for rejecting proposal
const handleRejectProposal = async (req, res) => {
  try {
    const rawId = req.params.id || req.params[0] || req.body.proposalId || req.body.id;
    if (!rawId) {
      return res.status(400).json({ success: false, error: 'Proposal ID is required.' });
    }

    const id = decodeURIComponent(String(rawId)).replace(/^\/+|\/+$/g, '');
    const { remarks } = req.body;

    const formatted = await executeProposalRejection({
      proposalId: id,
      adminProfile: req.profile,
      remarks,
      dbClient: req.supabase || supabaseAdmin
    });

    return res.json({
      success: true,
      message: `Proposal ${formatted.proposalNumber} has been rejected. It will be automatically deleted after 24 hours per retention policy.`,
      proposal: formatted
    });
  } catch (err) {
    console.error('Error rejecting proposal:', err);
    return res.status(400).json({ success: false, error: err.message || 'Error rejecting proposal.' });
  }
};

// Handler for settling proposal
const handleSettleProposal = async (req, res) => {
  try {
    const rawId = req.params.id || req.params[0] || req.body.proposalId || req.body.id;
    if (!rawId) {
      return res.status(400).json({ success: false, error: 'Proposal ID is required.' });
    }

    const id = decodeURIComponent(String(rawId)).replace(/^\/+|\/+$/g, '');
    const { settlementAmount, remarks } = req.body;

    if (settlementAmount === undefined || settlementAmount === null || Number(settlementAmount) < 0) {
      return res.status(400).json({ success: false, error: 'Valid non-negative settlement amount is required.' });
    }

    const result = await processProposalSettlement({
      proposalId: id,
      settlementAmount,
      remarks,
      userProfile: req.profile,
      dbClient: req.supabase || supabaseAdmin
    });

    return res.json(result);
  } catch (err) {
    console.error('Error settling proposal:', err);
    return res.status(400).json({ success: false, error: err.message || 'Error processing settlement.' });
  }
};

// Register routes for Accept, Reject, and Settle
// Supports:
// 1. POST /api/proposals/:id/accept
// 2. POST /api/proposals/accept (with proposalId in body)
// 3. POST /api/proposals/<complex/slash/id>/accept
router.post('/accept', authenticateUser, requireAdmin, handleAcceptProposal);
router.post('/:id/accept', authenticateUser, requireAdmin, handleAcceptProposal);
router.post(/^\/(.+)\/accept$/, authenticateUser, requireAdmin, handleAcceptProposal);

router.post('/approve', authenticateUser, requireAdmin, handleAcceptProposal);
router.post('/:id/approve', authenticateUser, requireAdmin, handleAcceptProposal);
router.post(/^\/(.+)\/approve$/, authenticateUser, requireAdmin, handleAcceptProposal);

router.post('/reject', authenticateUser, requireAdmin, handleRejectProposal);
router.post('/:id/reject', authenticateUser, requireAdmin, handleRejectProposal);
router.post(/^\/(.+)\/reject$/, authenticateUser, requireAdmin, handleRejectProposal);

router.post('/settle', authenticateUser, requireAdminOrHod, handleSettleProposal);
router.post('/:id/settle', authenticateUser, requireAdminOrHod, handleSettleProposal);
router.post(/^\/(.+)\/settle$/, authenticateUser, requireAdminOrHod, handleSettleProposal);

// PATCH /api/proposals/:id/status - Status update with strict role-based authorization
const handlePatchStatus = async (req, res) => {
  try {
    const rawId = req.params.id || req.params[0] || req.body?.proposalId || req.body?.id;
    if (!rawId) {
      return res.status(400).json({ success: false, error: 'Proposal ID is required.' });
    }

    const id = decodeURIComponent(String(rawId)).replace(/^\/+|\/+$/g, '');
    const { status, remarks } = req.body;

    const canonicalStatusMap = {
      'pending': 'Pending',
      'under review': 'Under Review',
      'approved': 'Approved',
      'accepted': 'Approved',
      'rejected': 'Rejected'
    };

    const norm = (status || '').trim().toLowerCase();
    const canonicalStatus = canonicalStatusMap[norm];

    if (!canonicalStatus) {
      return res.status(400).json({
        success: false,
        error: `Invalid status '${status}'. Must be one of: Pending, Under Review, Approved, Rejected.`
      });
    }

    // Enforce role-based authorization: Only authenticated Admin users can accept or reject
    if (['accepted', 'approved', 'rejected'].includes(norm)) {
      if (!req.profile || req.profile.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: Only authenticated administrators can approve or reject proposals.'
        });
      }

      if (norm === 'accepted' || norm === 'approved') {
        const formatted = await executeProposalAcceptance({
          proposalId: id,
          adminProfile: req.profile,
          remarks,
          dbClient: req.supabase || supabaseAdmin
        });
        return res.json({
          success: true,
          message: `Proposal ${formatted.proposalNumber} has been approved.`,
          proposal: formatted
        });
      }

      if (norm === 'rejected') {
        const formatted = await executeProposalRejection({
          proposalId: id,
          adminProfile: req.profile,
          remarks,
          dbClient: req.supabase || supabaseAdmin
        });
        return res.json({
          success: true,
          message: `Proposal ${formatted.proposalNumber} has been rejected. Scheduled for deletion after 24 hours.`,
          proposal: formatted
        });
      }
    }

    // For non-approval status transitions (e.g., 'Under Review', 'Pending'), allow Admin or HOD
    if (req.profile.role !== 'admin' && req.profile.role !== 'hod') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Administrator or HOD access required.'
      });
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const filterCol = isUuid ? 'id' : 'proposal_number';

    const updates = {
      status: canonicalStatus,
      updated_at: new Date().toISOString()
    };
    if (remarks !== undefined && remarks !== null) {
      updates.admin_remarks = remarks;
    }

    const { data: updated, error: updateError } = await (req.supabase || supabaseAdmin)
      .from('proposals')
      .update(updates)
      .eq(filterCol, id)
      .select('*, profiles:faculty_id(id, name, email, employee_id), academic_years:academic_year_id(id, academic_year, budget), budget_categories:category_id(id, name)')
      .single();

    if (updateError) {
      return res.status(400).json({ success: false, error: updateError.message });
    }

    const formatted = formatProposalRecord(updated);
    return res.json({
      success: true,
      message: `Proposal ${formatted.proposalNumber} status updated to ${canonicalStatus}.`,
      proposal: formatted
    });
  } catch (err) {
    console.error('Error updating proposal status:', err);
    return res.status(400).json({ success: false, error: err.message || 'Server error updating proposal status.' });
  }
};

router.patch('/:id/status', authenticateUser, handlePatchStatus);
router.patch(/^\/(.+)\/status$/, authenticateUser, handlePatchStatus);

export default router;
