import express from 'express';
import { supabaseAdmin } from '../supabaseClient.js';
import { authenticateUser } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';

const router = express.Router();

const VALID_ROLES = ['faculty', 'hod', 'admin'];

// GET /api/faculty - Get all directory members (Faculty, HOD, and Admin)
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { data: facultyList, error } = await supabaseAdmin
      .from('profiles')
      .select('*, departments(id, name, code)')
      .in('role', VALID_ROLES)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    // Format for frontend convenience
    const formatted = facultyList.map(f => {
      let displayRole = 'Faculty';
      if (f.role === 'hod') displayRole = 'HOD';
      if (f.role === 'admin') displayRole = 'Admin (Budget Coordinator)';

      return {
        id: f.id,
        name: f.name,
        email: f.email,
        role: f.role || 'faculty',
        displayRole,
        department: f.departments?.name || 'Computer Science and Engineering (CSE)',
        designation: f.designation || (f.role === 'hod' ? 'Department Head / HOD' : f.role === 'admin' ? 'Budget Coordinator' : 'Assistant Professor'),
        employeeId: f.employee_id || '',
        phone: f.phone || '',
        status: f.status || 'Active',
        joinedDate: f.created_at ? new Date(f.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
      };
    });

    return res.json({ success: true, faculty: formatted });
  } catch (err) {
    console.error('Error fetching faculty roster:', err);
    return res.status(500).json({ success: false, error: 'Server error retrieving faculty list.' });
  }
});

// POST /api/faculty - Admin creates a new user account (Faculty, HOD, or Admin)
router.post('/', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      email,
      department = 'Computer Science and Engineering (CSE)',
      designation,
      role = 'faculty',
      employeeId,
      phone,
      password = 'kongu@123',
      confirmPassword = 'kongu@123',
      status = 'Active'
    } = req.body;

    // 1. Validations
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Full Name is required.' });
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      return res.status(400).json({ success: false, error: 'Institutional Email is required.' });
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

    const targetRole = String(role || 'faculty').trim().toLowerCase();
    if (!VALID_ROLES.includes(targetRole)) {
      return res.status(400).json({
        success: false,
        error: `Invalid role '${role}'. Role must be one of: 'faculty', 'hod', or 'admin'.`
      });
    }

    const resolvedDesignation = designation?.trim() || (
      targetRole === 'hod' ? 'Department Head / HOD' :
      targetRole === 'admin' ? 'Budget Coordinator' : 'Assistant Professor'
    );

    // Check if email already exists in profiles
    const { data: existingEmail } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingEmail) {
      return res.status(400).json({ success: false, error: `A user with email ${cleanEmail} already exists.` });
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
        role: targetRole,
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
        role: targetRole,
        employee_id: employeeId.trim(),
        designation: resolvedDesignation,
        department_id: dept?.id || null,
        phone: phone || '',
        status: status || 'Active'
      })
      .select('*, departments(name, code)')
      .single();

    if (profileErr) {
      // Cleanup auth user on profile creation failure
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return res.status(400).json({ success: false, error: profileErr.message });
    }

    let displayRole = 'Faculty';
    if (newProfile.role === 'hod') displayRole = 'HOD';
    if (newProfile.role === 'admin') displayRole = 'Admin (Budget Coordinator)';

    const formattedFaculty = {
      id: newProfile.id,
      name: newProfile.name,
      email: newProfile.email,
      role: newProfile.role,
      displayRole,
      department: newProfile.departments?.name || department,
      designation: newProfile.designation,
      employeeId: newProfile.employee_id,
      phone: newProfile.phone,
      status: newProfile.status,
      joinedDate: new Date(newProfile.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    return res.status(201).json({
      success: true,
      message: `${displayRole} ${newProfile.name} added successfully!`,
      faculty: formattedFaculty
    });
  } catch (err) {
    console.error('Error creating user account:', err);
    return res.status(500).json({ success: false, error: 'Server error creating user account record.' });
  }
});

// PATCH /api/faculty/:id - Admin updates user status/details/role
router.patch('/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, designation, phone, name, role } = req.body;

    const updates = {};
    if (status !== undefined) updates.status = status;
    if (designation !== undefined) updates.designation = designation;
    if (phone !== undefined) updates.phone = phone;
    if (name !== undefined) updates.name = name;
    if (role !== undefined) {
      const cleanRole = String(role).trim().toLowerCase();
      if (VALID_ROLES.includes(cleanRole)) {
        updates.role = cleanRole;
      }
    }

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
      message: 'Profile updated successfully.',
      faculty: updated
    });
  } catch (err) {
    console.error('Error updating user profile:', err);
    return res.status(500).json({ success: false, error: 'Server error updating profile.' });
  }
});

// PATCH /api/faculty/:id/password - Admin updates member password
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
      message: 'Password updated successfully.'
    });
  } catch (err) {
    console.error('Error updating password:', err);
    return res.status(500).json({ success: false, error: 'Server error updating password.' });
  }
});

// DELETE /api/faculty/:id - Admin removes member
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
      message: 'User account removed successfully.'
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    return res.status(500).json({ success: false, error: 'Server error deleting user.' });
  }
});

export default router;
