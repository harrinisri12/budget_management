import express from 'express';
import { supabaseAdmin } from '../supabaseClient.js';
import { authenticateUser } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';

const router = express.Router();




// Helper: resolve academic year ID from parameter or string
export const resolveAcademicYearId = async (ayInput) => {
  if (!ayInput) return null;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ayInput) || ayInput.startsWith('ay-');
  if (isUuid) return ayInput;

  // Search by academic_year string e.g. "2026-2027" or "2026 - 2027"
  const cleanAy = ayInput.trim().replace(/\s+/g, '').replace(/[–—/]/g, '-');
  const { data } = await supabaseAdmin
    .from('academic_years')
    .select('id, academic_year')
    .or(`academic_year.eq.${cleanAy},academic_year.ilike.%${cleanAy}%`)
    .limit(1)
    .maybeSingle();

  return data?.id || null;
};

// GET /api/categories - Get categories by academic year with joined subcategories
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { academicYearId, academicYear, academic_year_id } = req.query;

    let ayId = academicYearId || academic_year_id;
    if (!ayId && academicYear) {
      ayId = await resolveAcademicYearId(academicYear);
    }

    // Try Supabase first
    let query = supabaseAdmin
      .from('budget_categories')
      .select('id, budget_id, academic_year_id, name, allocated_amount, spent_amount, created_at, subcategories(id, name, category_id)')
      .order('name', { ascending: true });

    if (ayId) {
      query = query.eq('academic_year_id', ayId);
    }

    let { data: dbCategories, error } = await query;

    // Fallback if no categories matched by academic_year_id: check by budget_id
    if (!error && (!dbCategories || dbCategories.length === 0) && ayId) {
      let ayLabel = academicYear;
      if (!ayLabel) {
        const { data: ayRow } = await supabaseAdmin
          .from('academic_years')
          .select('academic_year')
          .eq('id', ayId)
          .maybeSingle();
        ayLabel = ayRow?.academic_year;
      }

      if (ayLabel) {
        const cleanYear = ayLabel.trim().replace(/\s+/g, '').replace(/[–—/]/g, '-');
        const { data: bRow } = await supabaseAdmin
          .from('budgets')
          .select('id')
          .eq('financial_year', cleanYear)
          .maybeSingle();

        if (bRow) {
          const { data: bCats, error: bErr } = await supabaseAdmin
            .from('budget_categories')
            .select('id, budget_id, academic_year_id, name, allocated_amount, spent_amount, created_at, subcategories(id, name, category_id)')
            .eq('budget_id', bRow.id)
            .order('name', { ascending: true });

          if (!bErr && bCats && bCats.length > 0) {
            dbCategories = bCats;
          }
        }
      }
    }

    if (error) {
      console.error('Error fetching categories from database:', error.message);
      return res.status(400).json({ success: false, error: error.message });
    }

    const categoriesList = (dbCategories || []).map(c => ({
      id: c.id,
      academicYearId: c.academic_year_id || ayId,
      budgetId: c.budget_id,
      name: c.name,
      budget: Number(c.allocated_amount || 0),
      allocatedAmount: Number(c.allocated_amount || 0),
      spentAmount: Number(c.spent_amount || 0),
      createdAt: c.created_at,
      subcategories: (c.subcategories || []).map(s => ({
        id: s.id,
        name: s.name,
        categoryId: s.category_id || c.id
      }))
    }));

    return res.json({
      success: true,
      categories: categoriesList
    });
  } catch (err) {
    console.error('Error fetching categories:', err);
    return res.status(500).json({ success: false, error: 'Server error retrieving categories.' });
  }
});

// POST /api/categories - Admin creates a new category for an academic year
router.post('/', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { academicYearId, name, budget, allocatedAmount } = req.body;

    if (!academicYearId) {
      return res.status(400).json({ success: false, error: 'Academic Year ID is required.' });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Category Name is required.' });
    }

    const trimmedName = name.trim();
    const allocated = Number(budget !== undefined ? budget : (allocatedAmount || 0));

    // Check duplicate within the same academic year (Supabase)
    const { data: existingSupabase } = await supabaseAdmin
      .from('budget_categories')
      .select('id')
      .eq('academic_year_id', academicYearId)
      .ilike('name', trimmedName)
      .maybeSingle();

    if (existingSupabase) {
      return res.status(400).json({
        success: false,
        error: `Category "${trimmedName}" already exists for this Academic Year.`
      });
    }

    // Resolve budget_id (NOT NULL column on budget_categories)
    let budgetId = null;
    const { data: ayRow } = await supabaseAdmin
      .from('academic_years')
      .select('academic_year')
      .eq('id', academicYearId)
      .maybeSingle();

    if (ayRow?.academic_year) {
      const { data: bRow } = await supabaseAdmin
        .from('budgets')
        .select('id')
        .eq('financial_year', ayRow.academic_year)
        .maybeSingle();
      budgetId = bRow?.id;
    }

    if (!budgetId) {
      const { data: firstBudget } = await supabaseAdmin
        .from('budgets')
        .select('id')
        .limit(1)
        .maybeSingle();
      budgetId = firstBudget?.id;
    }

    // Try Supabase insert
    const insertData = {
      academic_year_id: academicYearId,
      name: trimmedName,
      allocated_amount: allocated,
      spent_amount: 0
    };
    if (budgetId) {
      insertData.budget_id = budgetId;
    }

    const { data: newCat, error: insertError } = await supabaseAdmin
      .from('budget_categories')
      .insert(insertData)
      .select()
      .single();

    if (!insertError && newCat) {
      const formatted = {
        id: newCat.id,
        academicYearId: newCat.academic_year_id,
        budgetId: newCat.budget_id,
        name: newCat.name,
        budget: Number(newCat.allocated_amount || 0),
        allocatedAmount: Number(newCat.allocated_amount || 0),
        spentAmount: Number(newCat.spent_amount || 0),
        subcategories: [],
        createdAt: newCat.created_at
      };

      return res.status(201).json({
        success: true,
        message: `Category "${trimmedName}" added successfully.`,
        category: formatted
      });
    }

    return res.status(400).json({
      success: false,
      error: insertError ? insertError.message : 'Failed to create category in database.'
    });
  } catch (err) {
    console.error('Error creating category:', err);
    return res.status(500).json({ success: false, error: 'Server error creating category.' });
  }
});

// PUT/PATCH /api/categories/:id - Admin updates category
router.patch('/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, budget, allocatedAmount } = req.body;

    const updates = {};
    if (name !== undefined) {
      const trimmed = name.trim();
      if (!trimmed) {
        return res.status(400).json({ success: false, error: 'Category Name cannot be empty.' });
      }
      updates.name = trimmed;
    }
    if (budget !== undefined || allocatedAmount !== undefined) {
      updates.allocated_amount = Number(budget !== undefined ? budget : allocatedAmount);
    }

    const { data: updated, error } = await supabaseAdmin
      .from('budget_categories')
      .update(updates)
      .eq('id', id)
      .select('id, academic_year_id, budget_id, name, allocated_amount, spent_amount, created_at, subcategories(id, name, category_id)')
      .single();

    if (!error && updated) {
      return res.json({
        success: true,
        message: 'Category updated successfully.',
        category: {
          id: updated.id,
          academicYearId: updated.academic_year_id,
          budgetId: updated.budget_id,
          name: updated.name,
          budget: Number(updated.allocated_amount || 0),
          allocatedAmount: Number(updated.allocated_amount || 0),
          spentAmount: Number(updated.spent_amount || 0),
          subcategories: (updated.subcategories || []).map(s => ({
            id: s.id,
            name: s.name,
            categoryId: s.category_id || updated.id
          }))
        }
      });
    }

    return res.status(404).json({ success: false, error: error?.message || 'Category not found.' });
  } catch (err) {
    console.error('Error updating category:', err);
    return res.status(500).json({ success: false, error: 'Server error updating category.' });
  }
});

// DELETE /api/categories/:id - Delete category
router.delete('/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category is used in proposals (Supabase)
    const { data: proposalRef } = await supabaseAdmin
      .from('proposals')
      .select('id')
      .eq('category_id', id)
      .limit(1);

    if (proposalRef && proposalRef.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete category: It is referenced by existing proposals.'
      });
    }

    // Check if referenced by transactions
    const { data: txnRef } = await supabaseAdmin
      .from('transactions')
      .select('id')
      .eq('category_id', id)
      .limit(1);

    if (txnRef && txnRef.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete category: It has recorded transaction ledger entries.'
      });
    }

    // Remove subcategories first
    await supabaseAdmin
      .from('subcategories')
      .delete()
      .eq('category_id', id);

    // Hard delete category
    const { error: delError } = await supabaseAdmin
      .from('budget_categories')
      .delete()
      .eq('id', id);

    if (delError) {
      return res.status(400).json({ success: false, error: delError.message });
    }

    return res.json({
      success: true,
      message: 'Category deleted successfully.'
    });
  } catch (err) {
    console.error('Error deleting category:', err);
    return res.status(500).json({ success: false, error: 'Server error deleting category.' });
  }
});

// ==============================================================================
// SUB-CATEGORIES ENDPOINTS
// ==============================================================================

// GET /api/categories/sub-categories - Get sub-categories for category/academicYear
router.get('/sub-categories', authenticateUser, async (req, res) => {
  try {
    const { categoryId, categoryName, academicYearId } = req.query;

    let activeCatId = categoryId;
    if (!activeCatId && categoryName && academicYearId) {
      // Find category ID by name and academic_year_id in DB
      const { data: catFound } = await supabaseAdmin
        .from('budget_categories')
        .select('id')
        .eq('academic_year_id', academicYearId)
        .ilike('name', categoryName.trim())
        .maybeSingle();

      if (catFound) {
        activeCatId = catFound.id;
      }
    }

    if (!activeCatId && !academicYearId) {
      return res.json({ success: true, subCategories: [], subcategories: [] });
    }

    // Try Supabase first
    let query = supabaseAdmin
      .from('subcategories')
      .select('id, category_id, name, created_at, updated_at')
      .order('name', { ascending: true });

    if (activeCatId) {
      query = query.eq('category_id', activeCatId);
    } else if (academicYearId) {
      // Find all category IDs for this academic year
      const { data: catRows } = await supabaseAdmin
        .from('budget_categories')
        .select('id')
        .eq('academic_year_id', academicYearId);

      const catIds = (catRows || []).map(c => c.id);
      if (catIds.length > 0) {
        query = query.in('category_id', catIds);
      } else {
        return res.json({ success: true, subCategories: [], subcategories: [] });
      }
    }

    const { data: dbSubs, error } = await query;

    if (error) {
      console.error('Error querying subcategories from database:', error.message);
      return res.status(400).json({ success: false, error: error.message });
    }

    const formattedList = (dbSubs || []).map(s => ({
      id: s.id,
      categoryId: s.category_id,
      name: s.name,
      createdAt: s.created_at,
      updatedAt: s.updated_at
    }));

    return res.json({
      success: true,
      subCategories: formattedList,
      subcategories: formattedList
    });
  } catch (err) {
    console.error('Error fetching sub-categories:', err);
    return res.status(500).json({ success: false, error: 'Server error retrieving sub-categories.' });
  }
});

// POST /api/categories/sub-categories - Admin creates sub-category
router.post('/sub-categories', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { categoryId, name } = req.body;

    if (!categoryId) {
      return res.status(400).json({ success: false, error: 'Category ID is required.' });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Sub-category Name is required.' });
    }

    const trimmedName = name.trim();

    // Check duplicate in category (Supabase)
    const { data: existingSupabase } = await supabaseAdmin
      .from('subcategories')
      .select('id')
      .eq('category_id', categoryId)
      .ilike('name', trimmedName)
      .maybeSingle();

    if (existingSupabase) {
      return res.status(400).json({
        success: false,
        error: `Sub-category "${trimmedName}" already exists for this Category.`
      });
    }

    // Try Supabase insert
    const { data: newSub, error: insertError } = await supabaseAdmin
      .from('subcategories')
      .insert({
        category_id: categoryId,
        name: trimmedName
      })
      .select()
      .single();

    if (!insertError && newSub) {
      const formatted = {
        id: newSub.id,
        categoryId: newSub.category_id,
        name: newSub.name,
        createdAt: newSub.created_at
      };

      return res.status(201).json({
        success: true,
        message: `Sub-category "${trimmedName}" added successfully.`,
        subCategory: formatted
      });
    }

    return res.status(400).json({
      success: false,
      error: insertError ? insertError.message : 'Failed to create sub-category in database.'
    });
  } catch (err) {
    console.error('Error adding sub-category:', err);
    return res.status(500).json({ success: false, error: 'Server error creating sub-category.' });
  }
});

// PATCH /api/categories/sub-categories/:id - Admin updates sub-category
router.patch('/sub-categories/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updates = {};
    if (name !== undefined) {
      const trimmed = name.trim();
      if (!trimmed) {
        return res.status(400).json({ success: false, error: 'Sub-category Name cannot be empty.' });
      }
      updates.name = trimmed;
    }
    updates.updated_at = new Date().toISOString();

    const { data: updated, error } = await supabaseAdmin
      .from('subcategories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && updated) {
      return res.json({
        success: true,
        message: 'Sub-category updated successfully.',
        subCategory: {
          id: updated.id,
          categoryId: updated.category_id,
          name: updated.name
        }
      });
    }

    return res.status(404).json({ success: false, error: error?.message || 'Sub-category not found.' });
  } catch (err) {
    console.error('Error updating sub-category:', err);
    return res.status(500).json({ success: false, error: 'Server error updating sub-category.' });
  }
});

// DELETE /api/categories/sub-categories/:id - Admin deletes sub-category
router.delete('/sub-categories/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if referenced in proposals
    const { data: propRef } = await supabaseAdmin
      .from('proposals')
      .select('id')
      .eq('subcategory_id', id)
      .limit(1);

    if (propRef && propRef.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete sub-category: It is referenced by existing proposals.'
      });
    }

    await supabaseAdmin.from('subcategories').delete().eq('id', id);

    return res.json({
      success: true,
      message: 'Sub-category deleted successfully.'
    });
  } catch (err) {
    console.error('Error deleting sub-category:', err);
    return res.status(500).json({ success: false, error: 'Server error deleting sub-category.' });
  }
});

export default router;
