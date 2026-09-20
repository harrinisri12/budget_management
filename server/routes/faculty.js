import express from 'express';
import { supabaseAdmin } from '../supabaseClient.js';
import { authenticateUser } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';

const router = express.Router();

// GET /api/faculty - Get all faculty members
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { data: facultyList, error } = await supabaseAdmin
      .from('profiles')
      .select('*, departments(id, name, code)')
      .eq('role', 'faculty')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    // Format for frontend convenience
    const formatted = facultyList.map(f => ({
      id: f.id,
      name: f.name,
      email: f.email,
      role: f.role,
      department: f.departments?.name || 'Computer Science and Engineering (CSE)',
      designation: f.designation || 'Faculty Member',
      employeeId: f.employee_id || 'FAC000',
      phone: f.phone || '+91 98765 43210',
      status: f.status || 'Active',
      joinedDate: new Date(f.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    }));

    return res.json({ success: true, faculty: formatted });
  } catch (err) {
    console.error('Error fetching faculty roster:', err);
    return res.status(500).json({ success: false, error: 'Server error retrieving faculty list.' });
  }
});

// POST /api/faculty - Admin creates a new faculty member (Auth user + Profile)
router.post('/', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      email,
      department = 'Computer Science and Engineering (CSE)',
      designation = 'Assistant Professor',
      employeeId,
      phone,
      password = 'kongu@123',
      confirmPassword = 'kongu@123',
      status = 'Active'
    } = req.body;

    // 1. Validations
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Faculty Name is required.' });
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      return res.status(400).json({ success: false, error: 'Faculty Email is required.' });
    }

    if (!cleanEmail.endsWith('@kongu.edu')) {
      return res.status(400).json({ success: false, error: 'Please use a valid Kongu email address ending in @kongu.edu.' });
    }

    if (!employeeId || !employeeId.trim()) {
      return res.status(400).json({ success: false, error: 'Employee ID is required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Passwords do not match.' });
    }

    // Check if email already exists in profiles
    const { data: existingEmail } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingEmail) {
      return res.status(400).json({ success: false, error: `Faculty with email ${cleanEmail} already exists.` });
    }

    // Check if employeeId already exists
    const { data: existingEmpId } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('employee_id', employeeId.trim())
      .maybeSingle();

    if (existingEmpId) {
      return res.status(400).json({ success: false, error: `Employee ID ${employeeId} is already in use.` });
    }

    // Find CSE department ID
    const { data: dept } = await supabaseAdmin
      .from('departments')
      .select('id')
      .eq('code', 'CSE')
      .maybeSingle();

    // 2. Create User in Supabase Auth via Admin API
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        name: name.trim(),
        role: 'faculty',
        employee_id: employeeId.trim()
      }
    });

    if (authErr) {
      return res.status(400).json({ success: false, error: authErr.message });
    }

    const userId = authData.user.id;

    // 3. Create Profile in public.profiles (Password is NEVER stored in profiles)
    const { data: newProfile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        name: name.trim(),
        email: cleanEmail,
        role: 'faculty',
        employee_id: employeeId.trim(),
        designation: designation.trim(),
        department_id: dept?.id || null,
        phone: phone || '+91 98765 43210',
        status: status || 'Active'
      })
      .select('*, departments(name, code)')
      .single();

    if (profileErr) {
      // Cleanup auth user on profile creation failure
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return res.status(400).json({ success: false, error: profileErr.message });
    }

    const formattedFaculty = {
      id: newProfile.id,
      name: newProfile.name,
      email: newProfile.email,
      role: newProfile.role,
      department: newProfile.departments?.name || department,
      designation: newProfile.designation,
      employeeId: newProfile.employee_id,
      phone: newProfile.phone,
      status: newProfile.status,
      joinedDate: new Date(newProfile.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    return res.status(201).json({
      success: true,
      message: `Faculty ${newProfile.name} added successfully!`,
      faculty: formattedFaculty
    });
  } catch (err) {
    console.error('Error creating faculty:', err);
    return res.status(500).json({ success: false, error: 'Server error creating faculty record.' });
  }
});

// PATCH /api/faculty/:id - Admin updates faculty status/details
router.patch('/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, designation, phone, name } = req.body;

    const updates = {};
    if (status !== undefined) updates.status = status;
    if (designation !== undefined) updates.designation = designation;
    if (phone !== undefined) updates.phone = phone;
    if (name !== undefined) updates.name = name;

    const { data: updated, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select('*, departments(name, code)')
      .single();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.json({
      success: true,
      message: 'Faculty profile updated successfully.',
      faculty: updated
    });
  } catch (err) {
    console.error('Error updating faculty:', err);
    return res.status(500).json({ success: false, error: 'Server error updating faculty.' });
  }
});

// PATCH /api/faculty/:id/password - Admin updates faculty member password
router.patch('/:id/password', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    const { error: authErr } = await supabaseAdmin.auth.admin.updateUserById(id, {
      password: password
    });

    if (authErr) {
      return res.status(400).json({ success: false, error: authErr.message });
    }

    return res.json({
      success: true,
      message: 'Faculty password updated successfully.'
    });
  } catch (err) {
    console.error('Error updating faculty password:', err);
    return res.status(500).json({ success: false, error: 'Server error updating faculty password.' });
  }
});

// DELETE /api/faculty/:id - Admin removes faculty member
router.delete('/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Remove referencing proposals submitted by this faculty member
    await supabaseAdmin
      .from('proposals')
      .delete()
      .eq('faculty_id', id);

    // 2. Set requested_by to null on transactions to preserve financial audit history
    await supabaseAdmin
      .from('transactions')
      .update({ requested_by: null })
      .eq('requested_by', id);

    // 3. Delete profile from public.profiles
    const { error: profileDeleteErr } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', id);

    if (profileDeleteErr) {
      return res.status(400).json({ success: false, error: profileDeleteErr.message });
    }

    // 4. Delete user from Supabase Auth
    const { error: authDeleteErr } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authDeleteErr) {
      console.warn('Auth user delete notice:', authDeleteErr.message);
    }

    return res.json({
      success: true,
      message: 'Faculty member removed successfully.'
    });
  } catch (err) {
    console.error('Error deleting faculty:', err);
    return res.status(500).json({ success: false, error: 'Server error deleting faculty.' });
  }
});

export default router;
