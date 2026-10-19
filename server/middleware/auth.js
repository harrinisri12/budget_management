import { supabaseAdmin, getSupabaseClientForUser } from '../supabaseClient.js';

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
    req.token = token;

    // Validate token against authentic Supabase Auth session
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !authData?.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid or expired session token.'
      });
    }

    const user = authData.user;
    const userClient = getSupabaseClientForUser(token);
    req.supabase = userClient;

    // Load actual profile from public.profiles using authenticated client
    let { data: profile, error: profileError } = await userClient
      .from('profiles')
      .select('*, departments(id, name, code)')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile) {
      // Fallback: try querying without departments join in case department_id is null
      const { data: plainProfile } = await userClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (plainProfile) {
        profile = plainProfile;
      }
    }

    if (profileError && !profile) {
      console.error('Error fetching user profile in auth middleware:', profileError.message);
      return res.status(500).json({
        success: false,
        error: 'Database error verifying user profile.'
      });
    }

    if (!profile) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: No profile record associated with this account.'
      });
    }

    req.user = user;
    req.profile = profile;

    next();
  } catch (err) {
    console.error('Authentication middleware error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal authentication error.'
    });
  }
};
