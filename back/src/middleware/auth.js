const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'no token provided' });

  const token = header.split(' ')[1]; // "Bearer <token>"
  if (!token) return res.status(401).json({ error: 'malformed token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const normalized = { ...payload };
    if (payload.role === 'admin' && payload.studentId && !payload.adminId) {
      normalized.adminId = payload.studentId;
    }
    if (payload.studentId) {
      normalized.studentId = payload.studentId;
    }

    req.admin = normalized;
    req.user = normalized;
    req.isAdmin = Boolean(payload.isAdmin || payload.role === 'admin');
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid or expired token' });
  }
}

module.exports = requireAuth;