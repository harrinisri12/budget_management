import express from 'express';
import { supabaseAdmin } from '../supabaseClient.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// GET & POST /api/auth/profile - Fetch current authenticated user profile
const handleProfile = async (req, res) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*, departments(id, name, code)')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.json({
      success: true,
      profile: profile || req.profile
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    return res.status(500).json({ success: false, error: 'Server error retrieving profile' });
  }
};

router.get('/profile', authenticateUser, handleProfile);
router.post('/profile', authenticateUser, handleProfile);

// POST /api/auth/logout - Logout confirmation endpoint
router.post('/logout', authenticateUser, (req, res) => {
  return res.json({
    success: true,
    message: 'Logged out successfully.'
  });
});

// POST /api/auth/reset-password - Request password reset email
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Trigger Supabase password reset email
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${req.headers.origin || 'http://localhost:5173'}/reset-password`
    });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.json({
      success: true,
      message: 'Password reset link has been dispatched to your email address.'
    });
  } catch (err) {
    console.error('Error requesting password reset:', err);
    return res.status(500).json({ success: false, error: 'Server error requesting password reset.' });
  }
});

export default router;
