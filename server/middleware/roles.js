export const requireAdmin = (req, res, next) => {
  if (!req.profile || req.profile.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Admin access required.'
    });
  }
  next();
};

export const requireFaculty = (req, res, next) => {
  if (!req.profile || (req.profile.role !== 'faculty' && req.profile.role !== 'admin')) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Faculty access required.'
    });
  }
  next();
};
