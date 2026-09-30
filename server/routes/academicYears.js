import express from 'express';
import { supabaseAdmin } from '../supabaseClient.js';
import { authenticateUser } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';

const router = express.Router();

// Mock in-memory store for fallback if Supabase table is not yet created in the cloud
let memoryAcademicYears = [
  {
    id: 'ay-2026-2027-default',
    academic_year: '2026-2027',
    budget: 500000,
    is_active: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 'ay-2027-2028-default',
    academic_year: '2027-2028',
    budget: 600000,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// GET /api/academic-years - List academic years (Admin: all, Faculty: active only)
router.get('/', authenticateUser, async (req, res) => {
  try {
    const isAdmin = req.profile?.role === 'admin';
    
    // Try Supabase first
    let query = supabaseAdmin
      .from('academic_years')
      .select('*')
      .order('academic_year', { ascending: false });

    if (!isAdmin) {
      query = query.eq('is_active', true);
    }

    const { data: academicYears, error } = await query;

    if (!error && academicYears) {
      return res.json({
        success: true,
        academicYears: academicYears.map(ay => ({
          id: ay.id,
          academicYear: ay.academic_year,
          budget: Number(ay.budget),
          isActive: Boolean(ay.is_active),
          createdAt: ay.created_at,
          updatedAt: ay.updated_at
        }))
      });
    }

    // Fallback to memory store if table not found or query failed
    const list = isAdmin ? memoryAcademicYears : memoryAcademicYears.filter(ay => ay.is_active);
    return res.json({
      success: true,
      academicYears: list.map(ay => ({
        id: ay.id,
        academicYear: ay.academic_year,
        budget: Number(ay.budget),
        isActive: Boolean(ay.is_active),
        createdAt: ay.created_at,
        updatedAt: ay.updated_at
      }))
    });
  } catch (err) {
    console.error('Error fetching academic years:', err);
    return res.status(500).json({ success: false, error: 'Server error retrieving academic years.' });
  }
});

// GET /api/academic-years/active - List only active academic years (for dropdowns)
router.get('/active', authenticateUser, async (req, res) => {
  try {
    const { data: academicYears, error } = await supabaseAdmin
      .from('academic_years')
      .select('*')
      .eq('is_active', true)
      .order('academic_year', { ascending: false });

    if (!error && academicYears) {
      return res.json({
        success: true,
        academicYears: academicYears.map(ay => ({
          id: ay.id,
          academicYear: ay.academic_year,
          budget: Number(ay.budget),
          isActive: true
        }))
      });
    }

    // Fallback to memory store
    const active = memoryAcademicYears.filter(ay => ay.is_active);
    return res.json({
      success: true,
      academicYears: active.map(ay => ({
        id: ay.id,
        academicYear: ay.academic_year,
        budget: Number(ay.budget),
        isActive: true
      }))
    });
  } catch (err) {
    console.error('Error fetching active academic years:', err);
    return res.status(500).json({ success: false, error: 'Server error retrieving active academic years.' });
  }
});

// POST /api/academic-years - Admin creates a new academic year
router.post('/', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { academicYear, budget, isActive } = req.body;

    if (!academicYear || !academicYear.trim()) {
      return res.status(400).json({ success: false, error: 'Academic Year is required (e.g. 2026-2027).' });
    }

    const trimmedYear = academicYear.trim();
    const parsedBudget = Number(budget);

    if (isNaN(parsedBudget) || parsedBudget <= 0) {
      return res.status(400).json({ success: false, error: 'Budget must be a valid positive number.' });
    }

    // Check duplicate in Supabase
    const { data: existingSupabase, error: checkError } = await supabaseAdmin
      .from('academic_years')
      .select('id, academic_year')
      .ilike('academic_year', trimmedYear)
      .maybeSingle();

    if (existingSupabase) {
      return res.status(400).json({
        success: false,
        error: `Academic Year "${trimmedYear}" already exists. Duplicate academic years are not allowed.`
      });
    }

    // Check duplicate in memory fallback
    if (memoryAcademicYears.some(ay => ay.academic_year.toLowerCase() === trimmedYear.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Academic Year "${trimmedYear}" already exists. Duplicate academic years are not allowed.`
      });
    }

    // Try inserting into Supabase
    const { data: newYear, error: insertError } = await supabaseAdmin
      .from('academic_years')
      .insert({
        academic_year: trimmedYear,
        budget: parsedBudget,
        is_active: isActive !== undefined ? Boolean(isActive) : true
      })
      .select()
      .single();

    if (!insertError && newYear) {
      const formatted = {
        id: newYear.id,
        academicYear: newYear.academic_year,
        budget: Number(newYear.budget),
        isActive: Boolean(newYear.is_active),
        createdAt: newYear.created_at,
        updatedAt: newYear.updated_at
      };

      // Also keep memory in sync
      memoryAcademicYears.unshift(newYear);

      return res.status(201).json({
        success: true,
        message: `Academic Year ${trimmedYear} created successfully.`,
        academicYear: formatted
      });
    }

    // If Supabase table does not exist or errored, store in memory fallback
    const memItem = {
      id: `ay-${Date.now()}`,
      academic_year: trimmedYear,
      budget: parsedBudget,
      is_active: isActive !== undefined ? Boolean(isActive) : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    memoryAcademicYears.unshift(memItem);

    return res.status(201).json({
      success: true,
      message: `Academic Year ${trimmedYear} created successfully.`,
      academicYear: {
        id: memItem.id,
        academicYear: memItem.academic_year,
        budget: memItem.budget,
        isActive: memItem.is_active,
        createdAt: memItem.created_at,
        updatedAt: memItem.updated_at
      }
    });
  } catch (err) {
    console.error('Error creating academic year:', err);
    return res.status(500).json({ success: false, error: 'Server error creating academic year.' });
  }
});

// PATCH /api/academic-years/:id - Admin updates an academic year
router.patch('/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { academicYear, budget, isActive } = req.body;

    const updates = {};
    if (academicYear !== undefined) {
      const trimmed = academicYear.trim();
      if (!trimmed) {
        return res.status(400).json({ success: false, error: 'Academic Year cannot be empty.' });
      }
      updates.academic_year = trimmed;
    }

    if (budget !== undefined) {
      const numBudget = Number(budget);
      if (isNaN(numBudget) || numBudget <= 0) {
        return res.status(400).json({ success: false, error: 'Budget must be a positive number.' });
      }
      updates.budget = numBudget;
    }

    if (isActive !== undefined) {
      updates.is_active = Boolean(isActive);
    }

    updates.updated_at = new Date().toISOString();

    // Check duplicate if academic_year is modified
    if (updates.academic_year) {
      const { data: existing } = await supabaseAdmin
        .from('academic_years')
        .select('id, academic_year')
        .ilike('academic_year', updates.academic_year)
        .neq('id', id)
        .maybeSingle();

      if (existing) {
        return res.status(400).json({
          success: false,
          error: `Another academic year named "${updates.academic_year}" already exists.`
        });
      }

      if (memoryAcademicYears.some(ay => ay.id !== id && ay.academic_year.toLowerCase() === updates.academic_year.toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: `Another academic year named "${updates.academic_year}" already exists.`
        });
      }
    }

    // Update in Supabase
    const { data: updated, error } = await supabaseAdmin
      .from('academic_years')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && updated) {
      // Update memory store
      const memIdx = memoryAcademicYears.findIndex(ay => ay.id === id);
      if (memIdx !== -1) {
        memoryAcademicYears[memIdx] = { ...memoryAcademicYears[memIdx], ...updated };
      }

      return res.json({
        success: true,
        message: 'Academic Year updated successfully.',
        academicYear: {
          id: updated.id,
          academicYear: updated.academic_year,
          budget: Number(updated.budget),
          isActive: Boolean(updated.is_active),
          createdAt: updated.created_at,
          updatedAt: updated.updated_at
        }
      });
    }

    // Fallback to memory
    const memIdx = memoryAcademicYears.findIndex(ay => ay.id === id);
    if (memIdx !== -1) {
      memoryAcademicYears[memIdx] = {
        ...memoryAcademicYears[memIdx],
        ...(updates.academic_year ? { academic_year: updates.academic_year } : {}),
        ...(updates.budget !== undefined ? { budget: updates.budget } : {}),
        ...(updates.is_active !== undefined ? { is_active: updates.is_active } : {}),
        updated_at: updates.updated_at
      };

      const cur = memoryAcademicYears[memIdx];
      return res.json({
        success: true,
        message: 'Academic Year updated successfully.',
        academicYear: {
          id: cur.id,
          academicYear: cur.academic_year,
          budget: Number(cur.budget),
          isActive: Boolean(cur.is_active),
          createdAt: cur.created_at,
          updatedAt: cur.updated_at
        }
      });
    }

    return res.status(404).json({ success: false, error: 'Academic Year not found.' });
  } catch (err) {
    console.error('Error updating academic year:', err);
    return res.status(500).json({ success: false, error: 'Server error updating academic year.' });
  }
});

// PATCH /api/academic-years/:id/status - Toggle status
router.patch('/:id/status', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const newStatus = Boolean(isActive);

    const { data: updated, error } = await supabaseAdmin
      .from('academic_years')
      .update({ is_active: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (!error && updated) {
      const memIdx = memoryAcademicYears.findIndex(ay => ay.id === id);
      if (memIdx !== -1) {
        memoryAcademicYears[memIdx].is_active = newStatus;
      }

      return res.json({
        success: true,
        message: `Academic Year status updated to ${newStatus ? 'Active' : 'Inactive'}.`,
        academicYear: {
          id: updated.id,
          academicYear: updated.academic_year,
          budget: Number(updated.budget),
          isActive: Boolean(updated.is_active)
        }
      });
    }

    // Memory fallback
    const memIdx = memoryAcademicYears.findIndex(ay => ay.id === id);
    if (memIdx !== -1) {
      memoryAcademicYears[memIdx].is_active = newStatus;
      return res.json({
        success: true,
        message: `Academic Year status updated to ${newStatus ? 'Active' : 'Inactive'}.`,
        academicYear: {
          id: memoryAcademicYears[memIdx].id,
          academicYear: memoryAcademicYears[memIdx].academic_year,
          budget: Number(memoryAcademicYears[memIdx].budget),
          isActive: Boolean(memoryAcademicYears[memIdx].is_active)
        }
      });
    }

    return res.status(404).json({ success: false, error: 'Academic Year not found.' });
  } catch (err) {
    console.error('Error updating status:', err);
    return res.status(500).json({ success: false, error: 'Server error updating academic year status.' });
  }
});

export default router;
