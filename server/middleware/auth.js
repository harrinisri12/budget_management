import { supabaseAdmin } from '../supabaseClient.js';

export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Access token is missing or malformed.'
      });
    }

    const token = authHeader.split(' ')[1];

    // Validate JWT via Supabase Auth
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid or expired session token.'
      });
    }

    // Load profile from public.profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*, departments(id, name, code)')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile in auth middleware:', profileError);
    }

    // Attach user & profile to request
    req.user = user;
    req.profile = profile || {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role || 'faculty',
      name: user.user_metadata?.name || 'User'
    };

    next();
  } catch (err) {
    console.error('Authentication middleware error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal authentication error.'
    });
  }
};
