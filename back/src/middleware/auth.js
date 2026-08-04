const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'no token provided' });

  const token = header.split(' ')[1]; // "Bearer <token>"
  if (!token) return res.status(401).json({ error: 'malformed token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = payload; // attach to request, later routes can use req.admin.adminId
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid or expired token' });
  }
}

module.exports = requireAuth;