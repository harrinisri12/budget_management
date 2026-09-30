import express from 'express';
import { supabaseAdmin } from '../supabaseClient.js';
import { authenticateUser } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';

const router = express.Router();

// Fallback in-memory proposals list
let memoryProposals = [];

// Helper to generate next proposal number if not manually provided
async function generateNextProposalNumber() {
  const currentYear = new Date().getFullYear();
  const prefix = `PROP-${currentYear}-`;

  try {
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
  } catch {
    return `${prefix}${Date.now().toString().slice(-4)}`;
  }
}

// GET /api/proposals - Get proposals (Admin sees all, Faculty sees own)
router.get('/', authenticateUser, async (req, res) => {
  try {
    let query = supabaseAdmin
      .from('proposals')
      .select('*, profiles:faculty_id(id, name, email, employee_id), budget_categories:category_id(id, name), academic_years:academic_year_id(id, academic_year, budget)')
      .order('created_at', { ascending: false });

    // If faculty, restrict to their own ID
    if (req.profile.role !== 'admin') {
      query = query.eq('faculty_id', req.profile.id);
    }

    const { data: proposals, error } = await query;

    if (!error && proposals) {
      const formatted = proposals.map(p => ({
        id: p.proposal_number,
        dbId: p.id,
        proposalId: p.proposal_number,
        academicYearId: p.academic_year_id,
        academicYear: p.academic_years?.academic_year || '2026-2027',
        proposalDate: p.proposal_date ? new Date(p.proposal_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
        facultyName: p.profiles?.name || 'Faculty Member',
        facultyEmail: p.profiles?.email || '',
        facultyId: p.faculty_id,
        category: p.category || p.budget_categories?.name || 'CSEA',
        categoryId: p.category_id,
        subCategory: p.sub_category || '',
        title: p.title,
        programDate: p.program_date ? new Date(p.program_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
        guestDetails: p.guest_details || '',
        amount: Number(p.amount),
        status: p.status,
        adminRemarks: p.admin_remarks || ''
      }));

      return res.json({ success: true, proposals: formatted });
    }

    // Memory fallback if Supabase table query failed
    let memList = memoryProposals;
    if (req.profile.role !== 'admin') {
      memList = memList.filter(p => p.facultyId === req.profile.id);
    }
    return res.json({ success: true, proposals: memList });
  } catch (err) {
    console.error('Error fetching proposals:', err);
    return res.status(500).json({ success: false, error: 'Server error retrieving proposals.' });
  }
});

// POST /api/proposals - Faculty submits a new proposal
router.post('/', authenticateUser, async (req, res) => {
  try {
    const {
      proposalId,
      academicYearId,
      academicYear,
      category,
      categoryId,
      subCategory,
      title,
      programDate,
      proposalDate,
      guestDetails,
      amount
    } = req.body;

    // 1. Validate Academic Year
    if (!academicYearId && !academicYear) {
      return res.status(400).json({ success: false, error: 'Academic Year is required. Please select an Academic Year.' });
    }

    // 2. Validate Category
    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, error: 'Category is required. Please select a Category.' });
    }

    // 3. Validate Subcategory if CSEA
    const trimmedCat = category.trim();
    if (trimmedCat === 'CSEA' && (!subCategory || !subCategory.trim())) {
      return res.status(400).json({ success: false, error: 'Sub Category is required for CSEA.' });
    }

    // 4. Validate Proposal ID
    if (!proposalId || !proposalId.trim()) {
      return res.status(400).json({ success: false, error: 'Proposal ID is required.' });
    }
    const cleanProposalId = proposalId.trim();

    // 5. Validate Title & Dates & Amount
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

    // Check duplicate Proposal ID in Supabase
    const { data: existingProp } = await supabaseAdmin
      .from('proposals')
      .select('id, proposal_number')
      .eq('proposal_number', cleanProposalId)
      .maybeSingle();

    if (existingProp) {
      return res.status(400).json({
        success: false,
        error: `A proposal with Proposal ID "${cleanProposalId}" already exists. Please choose a unique Proposal ID.`
      });
    }

    // Resolve category ID if needed
    let resolvedCategoryId = categoryId;
    if (!resolvedCategoryId && category) {
      const { data: catRecord } = await supabaseAdmin
        .from('budget_categories')
        .select('id')
        .eq('name', trimmedCat)
        .maybeSingle();

      resolvedCategoryId = catRecord?.id;
    }

    // Resolve academic year id
    let resolvedAyId = academicYearId;
    let resolvedAyText = academicYear || '2026-2027';
    if (!resolvedAyId && academicYear) {
      const { data: ayRecord } = await supabaseAdmin
        .from('academic_years')
        .select('id, academic_year')
        .eq('academic_year', academicYear.trim())
        .maybeSingle();

      resolvedAyId = ayRecord?.id;
      if (ayRecord) resolvedAyText = ayRecord.academic_year;
    }

    const insertPayload = {
      proposal_number: cleanProposalId,
      faculty_id: req.profile.id,
      category_id: resolvedCategoryId || null,
      title: title.trim(),
      proposal_date: proposalDate || new Date().toISOString().split('T')[0],
      program_date: programDate,
      guest_details: (guestDetails || '').trim() || null,
      amount: parsedAmount,
      status: 'Pending'
    };

    if (resolvedAyId) {
      insertPayload.academic_year_id = resolvedAyId;
    }
    if (subCategory) {
      insertPayload.sub_category = subCategory.trim();
    }

    const { data: newProposal, error } = await supabaseAdmin
      .from('proposals')
      .insert(insertPayload)
      .select('*, profiles:faculty_id(id, name, email), budget_categories:category_id(id, name)')
      .single();

    if (!error && newProposal) {
      const formatted = {
        id: newProposal.proposal_number,
        dbId: newProposal.id,
        proposalId: newProposal.proposal_number,
        academicYearId: newProposal.academic_year_id || resolvedAyId,
        academicYear: resolvedAyText,
        proposalDate: new Date(newProposal.proposal_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        facultyName: req.profile.name,
        facultyEmail: req.profile.email,
        facultyId: newProposal.faculty_id,
        category: trimmedCat,
        categoryId: newProposal.category_id,
        subCategory: (subCategory || '').trim(),
        title: newProposal.title,
        programDate: new Date(newProposal.program_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        guestDetails: newProposal.guest_details || '',
        amount: Number(newProposal.amount),
        status: newProposal.status
      };

      memoryProposals.unshift(formatted);

      return res.status(201).json({
        success: true,
        message: `Proposal submitted successfully. Proposal ID: ${cleanProposalId}`,
        proposal: formatted
      });
    }

    // Memory fallback if insert failed or column not yet added
    const memFormatted = {
      id: cleanProposalId,
      dbId: `prop-${Date.now()}`,
      proposalId: cleanProposalId,
      academicYearId: resolvedAyId || 'ay-2026-2027-default',
      academicYear: resolvedAyText,
      proposalDate: proposalDate ? new Date(proposalDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      facultyName: req.profile.name,
      facultyEmail: req.profile.email,
      facultyId: req.profile.id,
      category: trimmedCat,
      categoryId: resolvedCategoryId,
      subCategory: (subCategory || '').trim(),
      title: title.trim(),
      programDate: new Date(programDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      guestDetails: (guestDetails || '').trim() || '',
      amount: parsedAmount,
      status: 'Pending'
    };

    memoryProposals.unshift(memFormatted);

    return res.status(201).json({
      success: true,
      message: `Proposal submitted successfully. Proposal ID: ${cleanProposalId}`,
      proposal: memFormatted
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

    // Also update in memory
    const memItem = memoryProposals.find(p => p.id === id || p.dbId === id);
    if (memItem) {
      memItem.status = status;
      if (remarks !== undefined) memItem.adminRemarks = remarks;
    }

    if (!error && updated) {
      return res.json({
        success: true,
        message: `Proposal ${updated.proposal_number} status updated to ${status}.`,
        proposal: updated
      });
    }

    if (memItem) {
      return res.json({
        success: true,
        message: `Proposal ${memItem.id} status updated to ${status}.`,
        proposal: memItem
      });
    }

    return res.status(400).json({ success: false, error: error?.message || 'Proposal not found.' });
  } catch (err) {
    console.error('Error updating proposal status:', err);
    return res.status(500).json({ success: false, error: 'Server error updating proposal status.' });
  }
});

export default router;
