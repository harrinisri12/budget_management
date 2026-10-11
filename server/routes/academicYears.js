import express from 'express';
import { supabaseAdmin } from '../supabaseClient.js';
import { authenticateUser } from '../middleware/auth.js';
import { requireAdminOrHod } from '../middleware/roles.js';

const router = express.Router();

/**
 * Normalizes an academic year identifier into standard canonical format: "YYYY-YYYY+1" (e.g. "2027-2028")
 */
function canonicalAcademicYear(raw) {
  if (!raw) return '';
  const str = String(raw).trim();
  const match = str.match(/(\d{4})/);
  if (match) {
    const s = parseInt(match[1], 10);
    return `${s}-${s + 1}`;
  }
  return str.replace(/\s+/g, '').replace(/[–—/]/g, '-');
}

/**
 * Normalizes an academic year for display: "YYYY - YYYY+1" (e.g. "2027 - 2028")
 */
function displayAcademicYear(raw) {
  if (!raw) return '';
  const match = String(raw).match(/(\d{4})/);
  if (match) {
    const s = parseInt(match[1], 10);
    return `${s} - ${s + 1}`;
  }
  return String(raw);
}

// Helper to assemble full nested academic year object from DB
async function loadFullAcademicYearFromDb(ayId) {
  try {
    const { data: ay, error: ayErr } = await supabaseAdmin
      .from('academic_years')
      .select('*')
      .eq('id', ayId)
      .maybeSingle();

    if (ayErr || !ay) return null;

    // Fetch categories belonging to this academic year
    let cats = [];
    try {
      const { data: categories, error: catErr } = await supabaseAdmin
        .from('budget_categories')
        .select('*, subcategories(*)')
        .eq('academic_year_id', ayId)
        .order('allocated_amount', { ascending: false });

      if (!catErr && categories) {
        cats = categories.map(c => ({
          id: c.id,
          academicYearId: c.academic_year_id,
          name: c.name,
          description: c.description || '',
          budget: Number(c.allocated_amount || 0),
          allocated_amount: Number(c.allocated_amount || 0),
          spent_amount: Number(c.spent_amount || 0),
          subcategories: (c.subcategories || []).map(s => ({
            id: s.id,
            name: s.name,
            categoryId: s.category_id,
            allocated_amount: Number(s.allocated_amount || 0),
            spent_amount: Number(s.spent_amount || 0)
          }))
        }));
      }
    } catch (e) {
      console.warn('Note categories query in loadFullAcademicYearFromDb:', e.message);
    }

    const canon = canonicalAcademicYear(ay.academic_year || ay.name);
    const match = canon.match(/(\d{4})/);
    const sYear = match ? parseInt(match[1], 10) : (ay.start_year || 2026);
    const eYear = sYear + 1;
    const normName = displayAcademicYear(canon);
    const normStatus = (ay.status || (ay.is_active ? 'ACTIVE' : 'DRAFT')).toUpperCase();
    const finalBudget = Number(ay.budget !== undefined ? ay.budget : (ay.annual_budget || 0));

    return {
      id: ay.id,
      startYear: sYear,
      endYear: eYear,
      startDate: ay.start_date || `${sYear}-06-01`,
      endDate: ay.end_date || `${eYear}-05-31`,
      name: normName,
      academicYear: canon || `${sYear}-${eYear}`,
      status: normStatus,
      isActive: normStatus === 'ACTIVE' || Boolean(ay.is_active),
      annualBudget: finalBudget,
      budget: finalBudget,
      categoriesCount: cats.length,
      categories: cats,
      createdAt: ay.created_at,
      updatedAt: ay.updated_at
    };
  } catch (err) {
    console.error('Error loading academic year from DB:', err);
    return null;
  }
}

// ------------------------------------------------------------------------------
// 1. GET /api/academic-years - Get list of all academic years
// ------------------------------------------------------------------------------
router.get('/', authenticateUser, async (req, res) => {
  try {
    const isManagement = req.profile.role === 'admin' || req.profile.role === 'hod';

    let query = supabaseAdmin
      .from('academic_years')
      .select('*, budget_categories(id, allocated_amount, spent_amount)')
      .order('created_at', { ascending: false });

    if (!isManagement) {
      query = query.or('status.eq.ACTIVE,is_active.eq.true');
    }

    const { data: dbYears, error } = await query;

    if (error) {
      console.error('Database error querying academic years:', error.message);
      return res.status(400).json({ success: false, error: error.message });
    }

    const formattedList = (dbYears || []).map(ay => {
      const canon = canonicalAcademicYear(ay.academic_year || ay.name);
      const match = canon.match(/(\d{4})/);
      const sYear = match ? parseInt(match[1], 10) : (ay.start_year || 2026);
      const eYear = sYear + 1;
      const normName = displayAcademicYear(canon);
      const normStatus = (ay.status || (ay.is_active ? 'ACTIVE' : 'DRAFT')).toUpperCase();
      const finalBudget = Number(ay.budget !== undefined ? ay.budget : (ay.annual_budget || 0));
      const sDate = ay.start_date || `${sYear}-06-01`;
      const eDate = ay.end_date || `${eYear}-05-31`;

      return {
        id: ay.id,
        startYear: sYear,
        endYear: eYear,
        startDate: sDate,
        endDate: eDate,
        name: normName,
        academicYear: canon || `${sYear}-${eYear}`,
        status: normStatus,
        isActive: normStatus === 'ACTIVE' || Boolean(ay.is_active),
        annualBudget: finalBudget,
        budget: finalBudget,
        categoriesCount: (ay.budget_categories || []).length,
        categories: ay.budget_categories || [],
        createdAt: ay.created_at,
        updatedAt: ay.updated_at
      };
    });

    return res.json({ success: true, academicYears: formattedList });
  } catch (err) {
    console.error('Error fetching academic years:', err);
    return res.status(500).json({ success: false, error: 'Server error retrieving academic years.' });
  }
});

// ------------------------------------------------------------------------------
// 2. GET /api/academic-years/check-duplicate - Real-time Duplicate Check
// ------------------------------------------------------------------------------
router.get('/check-duplicate', authenticateUser, async (req, res) => {
  try {
    const rawQuery = req.query.year || req.query.startYear || req.query.academicYear || '';
    if (!rawQuery) {
      return res.status(400).json({ success: false, error: 'Academic year parameter is required.' });
    }

    const canonicalTarget = canonicalAcademicYear(rawQuery);
    if (!canonicalTarget) {
      return res.status(400).json({ success: false, error: 'Invalid academic year format.' });
    }

    const { data: existingYears, error } = await supabaseAdmin
      .from('academic_years')
      .select('id, academic_year');

    if (error) {
      console.error('Database error checking duplicate academic year:', error.message);
      return res.status(400).json({ success: false, error: error.message });
    }

    const isDuplicate = (existingYears || []).some(ay => {
      const existingCanon = canonicalAcademicYear(ay.academic_year);
      return existingCanon === canonicalTarget;
    });

    return res.json({
      success: true,
      isDuplicate,
      academicYear: canonicalTarget,
      message: isDuplicate ? 'Academic year already exists.' : 'Academic year is available.'
    });
  } catch (err) {
    console.error('Error in check-duplicate endpoint:', err);
    return res.status(500).json({ success: false, error: 'Server error validating academic year.' });
  }
});

// ------------------------------------------------------------------------------
// 3. GET /api/academic-years/active - Get the single currently ACTIVE academic year
// ------------------------------------------------------------------------------
router.get('/active', authenticateUser, async (req, res) => {
  try {
    const { data: dbActive, error } = await supabaseAdmin
      .from('academic_years')
      .select('id')
      .or('status.eq.ACTIVE,is_active.eq.true')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Database error fetching active academic year:', error.message);
      return res.status(400).json({ success: false, error: error.message });
    }

    if (!dbActive) {
      return res.status(404).json({ success: false, error: 'No active academic year configured in database.' });
    }

    const fullActive = await loadFullAcademicYearFromDb(dbActive.id);
    if (!fullActive) {
      return res.status(404).json({ success: false, error: 'Could not load active academic year details.' });
    }

    return res.json({ success: true, academicYear: fullActive });
  } catch (err) {
    console.error('Error fetching active academic year:', err);
    return res.status(500).json({ success: false, error: 'Server error retrieving active academic year.' });
  }
});

// ------------------------------------------------------------------------------
// 3b. GET /api/academic-years/category-options - Get all distinct categories and subcategories from DB
// ------------------------------------------------------------------------------
router.get('/category-options', authenticateUser, async (req, res) => {
  try {
    const { data: dbCategories, error: catErr } = await supabaseAdmin
      .from('budget_categories')
      .select('name, description, subcategories(name)')
      .order('name', { ascending: true });

    if (catErr) {
      console.warn('Note: error querying category options from DB:', catErr.message);
      return res.status(400).json({ success: false, error: catErr.message });
    }

    const categoryMap = new Map();

    (dbCategories || []).forEach(cat => {
      const name = (cat.name || '').trim();
      if (!name) return;
      const key = name.toLowerCase();

      if (!categoryMap.has(key)) {
        categoryMap.set(key, {
          name,
          description: cat.description || '',
          subcategories: new Set()
        });
      }

      const entry = categoryMap.get(key);
      if (cat.description && !entry.description) {
        entry.description = cat.description;
      }

      (cat.subcategories || []).forEach(sub => {
        const subName = (typeof sub === 'string' ? sub : sub?.name || '').trim();
        if (subName) {
          entry.subcategories.add(subName);
        }
      });
    });

    const categoryOptions = Array.from(categoryMap.values()).map(entry => ({
      name: entry.name,
      description: entry.description,
      subcategories: Array.from(entry.subcategories)
    }));

    return res.json({ success: true, categoryOptions });
  } catch (err) {
    console.error('Error in category-options endpoint:', err);
    return res.status(500).json({ success: false, error: 'Server error retrieving category options.' });
  }
});

// ------------------------------------------------------------------------------
// 4. GET /api/academic-years/:id - Get complete details of an Academic Year
// ------------------------------------------------------------------------------
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    // Guard: ignore known static endpoints or invalid IDs
    if (!id || id === 'category-options' || id === 'check-duplicate' || id === 'active') {
      return res.status(404).json({ success: false, error: 'Endpoint not found.' });
    }

    const fullAy = await loadFullAcademicYearFromDb(id);
    if (!fullAy) {
      return res.status(404).json({ success: false, error: 'Academic Year not found in database.' });
    }

    return res.json({ success: true, academicYear: fullAy });
  } catch (err) {
    console.error('Error fetching academic year details:', err);
    return res.status(500).json({ success: false, error: 'Server error retrieving academic year details.' });
  }
});

// ------------------------------------------------------------------------------
// 5. POST /api/academic-years - Admin / HOD creates a new Academic Year configuration
// ------------------------------------------------------------------------------
router.post('/', authenticateUser, requireAdminOrHod, async (req, res) => {
  try {
    const {
      startYear,
      name,
      academicYear,
      annualBudget,
      budget,
      status = 'DRAFT',
      isActive,
      categories = []
    } = req.body;

    // 1. Calculate consecutive academic year: START YEAR - START YEAR + 1
    let sYear = parseInt(startYear);
    if (isNaN(sYear)) {
      const canon = canonicalAcademicYear(academicYear || name);
      const match = canon.match(/(\d{4})/);
      if (match) sYear = parseInt(match[1], 10);
    }

    if (isNaN(sYear) || sYear < 2000 || sYear > 2100) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid starting year (e.g. 2026).'
      });
    }

    const eYear = sYear + 1;
    const cleanAcademicYear = `${sYear}-${eYear}`;
    const cleanDisplay = `${sYear} - ${eYear}`;
    const determinedStatus = status === 'ACTIVE' || isActive === true ? 'ACTIVE' : (status === 'CLOSED' ? 'CLOSED' : 'DRAFT');
    const isAct = determinedStatus === 'ACTIVE';

    // 2. Calculate Total Annual Budget (map to confirmed column 'budget')
    let totalBudget = Number(budget !== undefined ? budget : (annualBudget || 0));
    if (categories.length > 0) {
      const sumCategories = categories.reduce((sum, c) => sum + Number(c.budget || c.allocated_amount || 0), 0);
      if (sumCategories > 0) {
        totalBudget = sumCategories;
      }
    }

    // 3. Normalized Duplicate Check on Backend (handles concurrent requests)
    const { data: existingYears, error: fetchErr } = await supabaseAdmin
      .from('academic_years')
      .select('id, academic_year');

    if (fetchErr) {
      console.error('Database error checking existing academic years:', fetchErr.message);
      return res.status(500).json({ success: false, error: fetchErr.message });
    }

    const isDuplicate = (existingYears || []).some(ay => {
      return canonicalAcademicYear(ay.academic_year) === cleanAcademicYear;
    });

    if (isDuplicate) {
      return res.status(409).json({
        success: false,
        error: 'Academic year already exists.'
      });
    }

    // 4. If creating as ACTIVE, deactivate all other years in database
    if (isAct) {
      await supabaseAdmin
        .from('academic_years')
        .update({ status: 'CLOSED', is_active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000');
    }

    // 5. Insert Academic Year record strictly using confirmed schema columns:
    //    academic_year (TEXT), budget (NUMERIC), is_active (BOOLEAN), status (TEXT)
    const { data: insertedYear, error: insertError } = await supabaseAdmin
      .from('academic_years')
      .insert({
        academic_year: cleanAcademicYear,
        budget: totalBudget,
        status: determinedStatus,
        is_active: isAct
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database error inserting academic year:', insertError.message);
      return res.status(400).json({ success: false, error: insertError.message });
    }

    const ayId = insertedYear.id;

    // 6. Insert Categories & Subcategories
    if (categories && categories.length > 0) {
      for (const cat of categories) {
        const catAllocated = Number(cat.budget || cat.allocated_amount || 0);
        const { data: insCat, error: catErr } = await supabaseAdmin
          .from('budget_categories')
          .insert({
            academic_year_id: ayId,
            name: cat.name,
            description: cat.description || '',
            allocated_amount: catAllocated,
            spent_amount: 0
          })
          .select()
          .single();

        if (!catErr && insCat && cat.subcategories && cat.subcategories.length > 0) {
          const subInserts = cat.subcategories.map(s => ({
            category_id: insCat.id,
            name: typeof s === 'string' ? s : s.name,
            allocated_amount: 0,
            spent_amount: 0
          }));

          await supabaseAdmin
            .from('subcategories')
            .insert(subInserts);
        }
      }
    }

    const fullCreated = await loadFullAcademicYearFromDb(ayId);

    return res.status(201).json({
      success: true,
      message: `Academic Year "${cleanDisplay}" created successfully.`,
      academicYear: fullCreated || {
        id: insertedYear.id,
        startYear: sYear,
        endYear: eYear,
        startDate: `${sYear}-06-01`,
        endDate: `${eYear}-05-31`,
        name: cleanDisplay,
        academicYear: cleanAcademicYear,
        status: determinedStatus,
        isActive: isAct,
        annualBudget: totalBudget,
        budget: totalBudget,
        categoriesCount: categories.length,
        categories
      }
    });
  } catch (err) {
    console.error('Error creating academic year:', err);
    return res.status(500).json({ success: false, error: 'Server error creating academic year.' });
  }
});

// ------------------------------------------------------------------------------
// 6. PATCH & PUT /api/academic-years/:id - Update Academic Year
// ------------------------------------------------------------------------------
const handleUpdateAcademicYear = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      academicYear,
      startYear,
      annualBudget,
      budget,
      status,
      isActive,
      is_active
    } = req.body;

    const updates = {
      updated_at: new Date().toISOString()
    };

    if (academicYear !== undefined) {
      updates.academic_year = canonicalAcademicYear(academicYear);
    } else if (name !== undefined) {
      updates.academic_year = canonicalAcademicYear(name);
    } else if (startYear !== undefined) {
      const sy = parseInt(startYear, 10);
      if (!isNaN(sy)) updates.academic_year = `${sy}-${sy + 1}`;
    }

    const bVal = budget !== undefined ? budget : annualBudget;
    if (bVal !== undefined) {
      updates.budget = Number(bVal);
    }

    if (status !== undefined) {
      const st = status.toUpperCase() === 'ACTIVE' ? 'ACTIVE' : (status.toUpperCase() === 'CLOSED' ? 'CLOSED' : 'DRAFT');
      updates.status = st;
      updates.is_active = st === 'ACTIVE';
    } else if (isActive !== undefined || is_active !== undefined) {
      const act = Boolean(isActive !== undefined ? isActive : is_active);
      updates.is_active = act;
      updates.status = act ? 'ACTIVE' : 'CLOSED';
    }

    // If changing to ACTIVE, deactivate others
    if (updates.status === 'ACTIVE' || updates.is_active === true) {
      await supabaseAdmin
        .from('academic_years')
        .update({ status: 'CLOSED', is_active: false })
        .neq('id', id);
    }

    const { data: updated, error } = await supabaseAdmin
      .from('academic_years')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error updating academic year:', error.message);
      return res.status(400).json({ success: false, error: error.message });
    }

    const fullUpdated = await loadFullAcademicYearFromDb(id);

    return res.json({
      success: true,
      message: 'Academic Year updated successfully.',
      academicYear: fullUpdated || updated
    });
  } catch (err) {
    console.error('Error updating academic year:', err);
    return res.status(500).json({ success: false, error: 'Server error updating academic year.' });
  }
};

router.patch('/:id', authenticateUser, requireAdminOrHod, handleUpdateAcademicYear);
router.put('/:id', authenticateUser, requireAdminOrHod, handleUpdateAcademicYear);

// ------------------------------------------------------------------------------
// 7. PATCH /api/academic-years/:id/status - Change Academic Year Status
// ------------------------------------------------------------------------------
router.patch('/:id/status', authenticateUser, requireAdminOrHod, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['DRAFT', 'ACTIVE', 'CLOSED', 'Active', 'Inactive', 'Closed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Status must be one of 'DRAFT', 'ACTIVE', or 'CLOSED'."
      });
    }

    const targetStatus = status.toUpperCase() === 'ACTIVE' ? 'ACTIVE' : (status.toUpperCase() === 'CLOSED' ? 'CLOSED' : 'DRAFT');
    const isAct = targetStatus === 'ACTIVE';

    if (isAct) {
      await supabaseAdmin
        .from('academic_years')
        .update({ status: 'CLOSED', is_active: false })
        .neq('id', id);
    }

    const { data: updated, error } = await supabaseAdmin
      .from('academic_years')
      .update({
        status: targetStatus,
        is_active: isAct,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error updating status:', error.message);
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.json({
      success: true,
      message: `Academic Year status changed to ${targetStatus}.`,
      academicYear: updated
    });
  } catch (err) {
    console.error('Error changing academic year status:', err);
    return res.status(500).json({ success: false, error: 'Server error updating status.' });
  }
});

// ------------------------------------------------------------------------------
// 8. DELETE /api/academic-years/:id - Delete an Academic Year
// ------------------------------------------------------------------------------
router.delete('/:id', authenticateUser, requireAdminOrHod, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Academic Year ID is required.' });
    }

    // 1. Locate target academic year in database (UUID or canonical format)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    let targetAy = null;

    if (isUuid) {
      const { data, error } = await supabaseAdmin
        .from('academic_years')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) {
        console.error('Error finding academic year by id:', error.message);
        return res.status(400).json({ success: false, error: error.message });
      }
      targetAy = data;
    } else {
      const canon = canonicalAcademicYear(id);
      const { data, error } = await supabaseAdmin
        .from('academic_years')
        .select('*')
        .ilike('academic_year', canon)
        .maybeSingle();
      if (error) {
        console.error('Error finding academic year by label:', error.message);
        return res.status(400).json({ success: false, error: error.message });
      }
      targetAy = data;
    }

    if (!targetAy) {
      return res.status(404).json({ success: false, error: 'Academic Year not found in database.' });
    }

    const targetAyId = targetAy.id;
    const ayDisplayName = displayAcademicYear(targetAy.academic_year);

    // 2. Safety Check: Verify if there are associated proposals
    const { count: proposalCount, error: propErr } = await supabaseAdmin
      .from('proposals')
      .select('id', { count: 'exact', head: true })
      .eq('academic_year_id', targetAyId);

    if (propErr) {
      console.error('Error checking proposals for academic year:', propErr.message);
    }

    if (proposalCount && proposalCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete Academic Year "${ayDisplayName}": It has ${proposalCount} associated proposal(s). Historical proposals and financial records must be preserved.`
      });
    }

    // 3. Safety Check: Check category allocations and transactions
    const { data: catList, error: catFetchErr } = await supabaseAdmin
      .from('budget_categories')
      .select('id, name')
      .eq('academic_year_id', targetAyId);

    if (catFetchErr) {
      console.error('Error checking categories for academic year:', catFetchErr.message);
    }

    const catIds = (catList || []).map(c => c.id);

    if (catIds.length > 0) {
      const { count: txnCount, error: txnErr } = await supabaseAdmin
        .from('transactions')
        .select('id', { count: 'exact', head: true })
        .in('category_id', catIds);

      if (txnErr) {
        console.error('Error checking transactions for categories:', txnErr.message);
      }

      if (txnCount && txnCount > 0) {
        return res.status(400).json({
          success: false,
          error: `Cannot delete Academic Year "${ayDisplayName}": It has ${txnCount} recorded transaction ledger entr${txnCount > 1 ? 'ies' : 'y'}.`
        });
      }

      // 4. Safely remove subcategories belonging to these categories
      const { error: subcatDelErr } = await supabaseAdmin
        .from('subcategories')
        .delete()
        .in('category_id', catIds);

      if (subcatDelErr) {
        console.error('Database error deleting subcategories:', subcatDelErr.message);
        return res.status(400).json({ success: false, error: `Failed to remove subcategories: ${subcatDelErr.message}` });
      }

      // 5. Safely remove budget categories belonging to this academic year
      const { error: catDelErr } = await supabaseAdmin
        .from('budget_categories')
        .delete()
        .eq('academic_year_id', targetAyId);

      if (catDelErr) {
        console.error('Database error deleting categories:', catDelErr.message);
        return res.status(400).json({ success: false, error: `Failed to remove budget categories: ${catDelErr.message}` });
      }
    }

    // 6. Delete the academic year record from database
    const { data: deletedRow, error: delError } = await supabaseAdmin
      .from('academic_years')
      .delete()
      .eq('id', targetAyId)
      .select();

    if (delError) {
      console.error('Database error deleting academic year:', delError.message);
      return res.status(400).json({ success: false, error: delError.message });
    }

    if (!deletedRow || deletedRow.length === 0) {
      return res.status(404).json({ success: false, error: 'Academic Year could not be deleted or was already removed.' });
    }

    // 7. If the deleted academic year was active, activate the next available session
    if (targetAy.is_active || targetAy.status === 'ACTIVE') {
      const { data: nextActive } = await supabaseAdmin
        .from('academic_years')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (nextActive) {
        await supabaseAdmin
          .from('academic_years')
          .update({ status: 'ACTIVE', is_active: true })
          .eq('id', nextActive.id);
      }
    }

    return res.json({
      success: true,
      message: `Academic Year "${ayDisplayName}" has been permanently deleted from the database.`,
      deletedId: targetAyId
    });
  } catch (err) {
    console.error('Error deleting academic year:', err);
    return res.status(500).json({ success: false, error: 'Server error deleting academic year.' });
  }
});

export default router;
