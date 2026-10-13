import express from 'express';
import { supabaseAdmin } from '../supabaseClient.js';
import { authenticateUser } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';

const router = express.Router();

// Shared In-Memory Store for Category & Sub-category Configuration
// Seeded with default categories & sub-categories for 2026-2027 and 2027-2028
export const memoryCategories = [
  // 2026-2027
  { id: 'cat-2026-lab', academic_year_id: 'ay-2026-2027-default', name: 'Laboratory', is_active: true, created_at: new Date().toISOString() },
  { id: 'cat-2026-infra', academic_year_id: 'ay-2026-2027-default', name: 'Infrastructure', is_active: true, created_at: new Date().toISOString() },
  { id: 'cat-2026-fdp', academic_year_id: 'ay-2026-2027-default', name: 'Faculty Development', is_active: true, created_at: new Date().toISOString() },
  { id: 'cat-2026-csea', academic_year_id: 'ay-2026-2027-default', name: 'CSEA Association', is_active: true, created_at: new Date().toISOString() },
  { id: 'cat-2026-ccc', academic_year_id: 'ay-2026-2027-default', name: 'CCC Coding Club', is_active: true, created_at: new Date().toISOString() },

  // 2027-2028
  { id: 'cat-2027-lab', academic_year_id: 'ay-2027-2028-default', name: 'Laboratory', is_active: true, created_at: new Date().toISOString() },
  { id: 'cat-2027-infra', academic_year_id: 'ay-2027-2028-default', name: 'Infrastructure', is_active: true, created_at: new Date().toISOString() },
  { id: 'cat-2027-research', academic_year_id: 'ay-2027-2028-default', name: 'Research & Publications', is_active: true, created_at: new Date().toISOString() }
];

export const memorySubCategories = [
  // Laboratory 2026-2027
  { id: 'sub-2026-lab-1', academic_year_id: 'ay-2026-2027-default', category_id: 'cat-2026-lab', name: 'Hardware', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-2026-lab-2', academic_year_id: 'ay-2026-2027-default', category_id: 'cat-2026-lab', name: 'Networking Equipment', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-2026-lab-3', academic_year_id: 'ay-2026-2027-default', category_id: 'cat-2026-lab', name: 'Maintenance', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-2026-lab-4', academic_year_id: 'ay-2026-2027-default', category_id: 'cat-2026-lab', name: 'Consumables', is_active: true, created_at: new Date().toISOString() },

  // Infrastructure 2026-2027
  { id: 'sub-2026-infra-1', academic_year_id: 'ay-2026-2027-default', category_id: 'cat-2026-infra', name: 'Furniture', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-2026-infra-2', academic_year_id: 'ay-2026-2027-default', category_id: 'cat-2026-infra', name: 'Electrical', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-2026-infra-3', academic_year_id: 'ay-2026-2027-default', category_id: 'cat-2026-infra', name: 'Classroom Equipment', is_active: true, created_at: new Date().toISOString() },

  // Faculty Development 2026-2027
  { id: 'sub-2026-fdp-1', academic_year_id: 'ay-2026-2027-default', category_id: 'cat-2026-fdp', name: 'Training', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-2026-fdp-2', academic_year_id: 'ay-2026-2027-default', category_id: 'cat-2026-fdp', name: 'Conferences', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-2026-fdp-3', academic_year_id: 'ay-2026-2027-default', category_id: 'cat-2026-fdp', name: 'Certifications', is_active: true, created_at: new Date().toISOString() },

  // CSEA 2026-2027
  { id: 'sub-2026-csea-1', academic_year_id: 'ay-2026-2027-default', category_id: 'cat-2026-csea', name: 'Guest Lecture', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-2026-csea-2', academic_year_id: 'ay-2026-2027-default', category_id: 'cat-2026-csea', name: 'Symposium', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-2026-csea-3', academic_year_id: 'ay-2026-2027-default', category_id: 'cat-2026-csea', name: 'Workshop', is_active: true, created_at: new Date().toISOString() },

  // CCC 2026-2027
  { id: 'sub-2026-ccc-1', academic_year_id: 'ay-2026-2027-default', category_id: 'cat-2026-ccc', name: 'Coding Contest', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-2026-ccc-2', academic_year_id: 'ay-2026-2027-default', category_id: 'cat-2026-ccc', name: 'Hackathon', is_active: true, created_at: new Date().toISOString() },

  // Laboratory 2027-2028
  { id: 'sub-2027-lab-1', academic_year_id: 'ay-2027-2028-default', category_id: 'cat-2027-lab', name: 'Advanced Hardware', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-2027-lab-2', academic_year_id: 'ay-2027-2028-default', category_id: 'cat-2027-lab', name: 'AI Equipment', is_active: true, created_at: new Date().toISOString() },

  // Research 2027-2028
  { id: 'sub-2027-res-1', academic_year_id: 'ay-2027-2028-default', category_id: 'cat-2027-research', name: 'Publications', is_active: true, created_at: new Date().toISOString() },
  { id: 'sub-2027-res-2', academic_year_id: 'ay-2027-2028-default', category_id: 'cat-2027-research', name: 'Software Licenses', is_active: true, created_at: new Date().toISOString() }
];

// Helper: resolve academic year ID from parameter or string
export const resolveAcademicYearId = async (ayInput) => {
  if (!ayInput) return null;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ayInput) || ayInput.startsWith('ay-');
  if (isUuid) return ayInput;

  // Search by academic_year string e.g. "2026-2027"
  const { data } = await supabaseAdmin
    .from('academic_years')
    .select('id')
    .eq('academic_year', ayInput.trim())
    .maybeSingle();

  return data?.id || null;
};

// GET /api/categories - Get categories by academic year
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { academicYearId, academicYear } = req.query;
    const isAdmin = req.profile?.role === 'admin';

    let ayId = academicYearId;
    if (!ayId && academicYear) {
      ayId = await resolveAcademicYearId(academicYear);
    }

    // Try Supabase first
    let query = supabaseAdmin
      .from('budget_categories')
      .select('*')
      .order('name', { ascending: true });

    if (ayId) {
      query = query.eq('academic_year_id', ayId);
    }

    if (!isAdmin) {
      query = query.eq('is_active', true);
    }

    const { data: dbCategories, error } = await query;

    if (!error && dbCategories && dbCategories.length > 0) {
      return res.json({
        success: true,
        categories: dbCategories.map(c => ({
          id: c.id,
          academicYearId: c.academic_year_id,
          name: c.name,
          allocatedAmount: Number(c.allocated_amount || 0),
          spentAmount: Number(c.spent_amount || 0),
          isActive: Boolean(c.is_active),
          createdAt: c.created_at
        }))
      });
    }

    // Fallback to memory store
    let memList = [...memoryCategories];
    if (ayId) {
      memList = memList.filter(c => c.academic_year_id === ayId || ayId.includes(c.academic_year_id));
    }
    if (!isAdmin) {
      memList = memList.filter(c => c.is_active);
    }

    return res.json({
      success: true,
      categories: memList.map(c => ({
        id: c.id,
        academicYearId: c.academic_year_id,
        name: c.name,
        allocatedAmount: Number(c.allocated_amount || 0),
        spentAmount: Number(c.spent_amount || 0),
        isActive: Boolean(c.is_active),
        createdAt: c.created_at
      }))
    });
  } catch (err) {
    console.error('Error fetching categories:', err);
    return res.status(500).json({ success: false, error: 'Server error retrieving categories.' });
  }
});

// POST /api/categories - Admin creates a new category for an academic year
router.post('/', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { academicYearId, name } = req.body;

    if (!academicYearId) {
      return res.status(400).json({ success: false, error: 'Academic Year ID is required.' });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Category Name is required.' });
    }

    const trimmedName = name.trim();

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

    // Check duplicate in memory fallback
    if (memoryCategories.some(c => c.academic_year_id === academicYearId && c.name.toLowerCase() === trimmedName.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Category "${trimmedName}" already exists for this Academic Year.`
      });
    }

    // Try Supabase insert
    const { data: newCat, error: insertError } = await supabaseAdmin
      .from('budget_categories')
      .insert({
        academic_year_id: academicYearId,
        name: trimmedName,
        is_active: true
      })
      .select()
      .single();

    if (!insertError && newCat) {
      const formatted = {
        id: newCat.id,
        academicYearId: newCat.academic_year_id,
        name: newCat.name,
        isActive: Boolean(newCat.is_active),
        createdAt: newCat.created_at
      };

      memoryCategories.push({
        id: newCat.id,
        academic_year_id: newCat.academic_year_id,
        name: newCat.name,
        is_active: true,
        created_at: newCat.created_at
      });

      return res.status(201).json({
        success: true,
        message: `Category "${trimmedName}" added successfully.`,
        category: formatted
      });
    }

    // Memory fallback
    const memItem = {
      id: `cat-${Date.now()}`,
      academic_year_id: academicYearId,
      name: trimmedName,
      is_active: true,
      created_at: new Date().toISOString()
    };
    memoryCategories.push(memItem);

    return res.status(201).json({
      success: true,
      message: `Category "${trimmedName}" added successfully.`,
      category: {
        id: memItem.id,
        academicYearId: memItem.academic_year_id,
        name: memItem.name,
        isActive: true,
        createdAt: memItem.created_at
      }
    });
  } catch (err) {
    console.error('Error creating category:', err);
    return res.status(500).json({ success: false, error: 'Server error creating category.' });
  }
});

// PUT/PATCH /api/categories/:id - Admin updates category (name / active status)
router.patch('/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;

    const updates = {};
    if (name !== undefined) {
      const trimmed = name.trim();
      if (!trimmed) {
        return res.status(400).json({ success: false, error: 'Category Name cannot be empty.' });
      }
      updates.name = trimmed;
    }
    if (isActive !== undefined) {
      updates.is_active = Boolean(isActive);
    }
    updates.updated_at = new Date().toISOString();

    const { data: updated, error } = await supabaseAdmin
      .from('budget_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    // Also update in memory
    const memIdx = memoryCategories.findIndex(c => c.id === id);
    if (memIdx !== -1) {
      if (updates.name) memoryCategories[memIdx].name = updates.name;
      if (updates.is_active !== undefined) memoryCategories[memIdx].is_active = updates.is_active;
    }

    if (!error && updated) {
      return res.json({
        success: true,
        message: 'Category updated successfully.',
        category: {
          id: updated.id,
          academicYearId: updated.academic_year_id,
          name: updated.name,
          isActive: Boolean(updated.is_active)
        }
      });
    }

    if (memIdx !== -1) {
      const cur = memoryCategories[memIdx];
      return res.json({
        success: true,
        message: 'Category updated successfully.',
        category: {
          id: cur.id,
          academicYearId: cur.academic_year_id,
          name: cur.name,
          isActive: Boolean(cur.is_active)
        }
      });
    }

    return res.status(404).json({ success: false, error: 'Category not found.' });
  } catch (err) {
    console.error('Error updating category:', err);
    return res.status(500).json({ success: false, error: 'Server error updating category.' });
  }
});

// DELETE /api/categories/:id - Soft delete / Deactivate or delete category
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
      // Soft delete (deactivate)
      await supabaseAdmin.from('budget_categories').update({ is_active: false }).eq('id', id);
      const memItem = memoryCategories.find(c => c.id === id);
      if (memItem) memItem.is_active = false;

      return res.json({
        success: true,
        message: 'Category is referenced by existing proposals. It has been deactivated to preserve historical records.'
      });
    }

    // Try hard delete if unreferenced
    const { error: delError } = await supabaseAdmin
      .from('budget_categories')
      .delete()
      .eq('id', id);

    const memIdx = memoryCategories.findIndex(c => c.id === id);
    if (memIdx !== -1) {
      memoryCategories.splice(memIdx, 1);
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
    const isAdmin = req.profile?.role === 'admin';

    let activeCatId = categoryId;
    if (!activeCatId && categoryName && academicYearId) {
      const match = memoryCategories.find(c => c.academic_year_id === academicYearId && c.name.toLowerCase() === categoryName.trim().toLowerCase());
      activeCatId = match?.id;
    }

    // Try Supabase first
    let query = supabaseAdmin
      .from('budget_sub_categories')
      .select('*')
      .order('name', { ascending: true });

    if (activeCatId) {
      query = query.eq('category_id', activeCatId);
    }
    if (academicYearId) {
      query = query.eq('academic_year_id', academicYearId);
    }
    if (!isAdmin) {
      query = query.eq('is_active', true);
    }

    const { data: dbSubs, error } = await query;

    if (!error && dbSubs && dbSubs.length > 0) {
      return res.json({
        success: true,
        subCategories: dbSubs.map(s => ({
          id: s.id,
          academicYearId: s.academic_year_id,
          categoryId: s.category_id,
          name: s.name,
          isActive: Boolean(s.is_active),
          createdAt: s.created_at
        }))
      });
    }

    // Memory fallback
    let memList = [...memorySubCategories];
    if (activeCatId) {
      memList = memList.filter(s => s.category_id === activeCatId);
    }
    if (academicYearId) {
      memList = memList.filter(s => s.academic_year_id === academicYearId);
    }
    if (!isAdmin) {
      memList = memList.filter(s => s.is_active);
    }

    return res.json({
      success: true,
      subCategories: memList.map(s => ({
        id: s.id,
        academicYearId: s.academic_year_id,
        categoryId: s.category_id,
        name: s.name,
        isActive: Boolean(s.is_active),
        createdAt: s.created_at
      }))
    });
  } catch (err) {
    console.error('Error fetching sub-categories:', err);
    return res.status(500).json({ success: false, error: 'Server error retrieving sub-categories.' });
  }
});

// POST /api/categories/sub-categories - Admin creates sub-category
router.post('/sub-categories', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { academicYearId, categoryId, name } = req.body;

    if (!academicYearId) {
      return res.status(400).json({ success: false, error: 'Academic Year ID is required.' });
    }
    if (!categoryId) {
      return res.status(400).json({ success: false, error: 'Category ID is required.' });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Sub-category Name is required.' });
    }

    const trimmedName = name.trim();

    // Check duplicate in category (Supabase)
    const { data: existingSupabase } = await supabaseAdmin
      .from('budget_sub_categories')
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

    // Check duplicate in memory
    if (memorySubCategories.some(s => s.category_id === categoryId && s.name.toLowerCase() === trimmedName.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Sub-category "${trimmedName}" already exists for this Category.`
      });
    }

    // Try Supabase insert
    const { data: newSub, error: insertError } = await supabaseAdmin
      .from('budget_sub_categories')
      .insert({
        academic_year_id: academicYearId,
        category_id: categoryId,
        name: trimmedName,
        is_active: true
      })
      .select()
      .single();

    if (!insertError && newSub) {
      const formatted = {
        id: newSub.id,
        academicYearId: newSub.academic_year_id,
        categoryId: newSub.category_id,
        name: newSub.name,
        isActive: Boolean(newSub.is_active),
        createdAt: newSub.created_at
      };

      memorySubCategories.push({
        id: newSub.id,
        academic_year_id: newSub.academic_year_id,
        category_id: newSub.category_id,
        name: newSub.name,
        is_active: true,
        created_at: newSub.created_at
      });

      return res.status(201).json({
        success: true,
        message: `Sub-category "${trimmedName}" added successfully.`,
        subCategory: formatted
      });
    }

    // Memory fallback
    const memItem = {
      id: `sub-${Date.now()}`,
      academic_year_id: academicYearId,
      category_id: categoryId,
      name: trimmedName,
      is_active: true,
      created_at: new Date().toISOString()
    };
    memorySubCategories.push(memItem);

    return res.status(201).json({
      success: true,
      message: `Sub-category "${trimmedName}" added successfully.`,
      subCategory: {
        id: memItem.id,
        academicYearId: memItem.academic_year_id,
        categoryId: memItem.category_id,
        name: memItem.name,
        isActive: true,
        createdAt: memItem.created_at
      }
    });
  } catch (err) {
    console.error('Error creating sub-category:', err);
    return res.status(500).json({ success: false, error: 'Server error creating sub-category.' });
  }
});

// PATCH /api/categories/sub-categories/:id - Admin updates sub-category
router.patch('/sub-categories/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;

    const updates = {};
    if (name !== undefined) {
      const trimmed = name.trim();
      if (!trimmed) {
        return res.status(400).json({ success: false, error: 'Sub-category Name cannot be empty.' });
      }
      updates.name = trimmed;
    }
    if (isActive !== undefined) {
      updates.is_active = Boolean(isActive);
    }
    updates.updated_at = new Date().toISOString();

    const { data: updated, error } = await supabaseAdmin
      .from('budget_sub_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    // Memory update
    const memIdx = memorySubCategories.findIndex(s => s.id === id);
    if (memIdx !== -1) {
      if (updates.name) memorySubCategories[memIdx].name = updates.name;
      if (updates.is_active !== undefined) memorySubCategories[memIdx].is_active = updates.is_active;
    }

    if (!error && updated) {
      return res.json({
        success: true,
        message: 'Sub-category updated successfully.',
        subCategory: {
          id: updated.id,
          academicYearId: updated.academic_year_id,
          categoryId: updated.category_id,
          name: updated.name,
          isActive: Boolean(updated.is_active)
        }
      });
    }

    if (memIdx !== -1) {
      const cur = memorySubCategories[memIdx];
      return res.json({
        success: true,
        message: 'Sub-category updated successfully.',
        subCategory: {
          id: cur.id,
          academicYearId: cur.academic_year_id,
          categoryId: cur.category_id,
          name: cur.name,
          isActive: Boolean(cur.is_active)
        }
      });
    }

    return res.status(404).json({ success: false, error: 'Sub-category not found.' });
  } catch (err) {
    console.error('Error updating sub-category:', err);
    return res.status(500).json({ success: false, error: 'Server error updating sub-category.' });
  }
});

// DELETE /api/categories/sub-categories/:id - Admin deletes or deactivates sub-category
router.delete('/sub-categories/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if referenced in proposals
    const { data: propRef } = await supabaseAdmin
      .from('proposals')
      .select('id')
      .eq('sub_category_id', id)
      .limit(1);

    if (propRef && propRef.length > 0) {
      await supabaseAdmin.from('budget_sub_categories').update({ is_active: false }).eq('id', id);
      const memItem = memorySubCategories.find(s => s.id === id);
      if (memItem) memItem.is_active = false;

      return res.json({
        success: true,
        message: 'Sub-category is referenced by existing proposals. It has been deactivated to preserve historical records.'
      });
    }

    await supabaseAdmin.from('budget_sub_categories').delete().eq('id', id);

    const memIdx = memorySubCategories.findIndex(s => s.id === id);
    if (memIdx !== -1) {
      memorySubCategories.splice(memIdx, 1);
    }

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
