const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../db');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const admin = await prisma.adminUser.findUnique({ where: { username } });
  if (admin) {
    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) return res.status(401).json({ error: 'invalid credentials' });

    const token = jwt.sign(
      { adminId: admin.id, username: admin.username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({ token });
  }

  const student = await prisma.student.findUnique({ where: { username } });
  if (!student || !student.passwordHash) {
    return res.status(401).json({ error: 'invalid credentials' });
  }

  const validStudent = await bcrypt.compare(password, student.passwordHash);
  if (!validStudent) return res.status(401).json({ error: 'invalid credentials' });

  if (!student.isApproved || !student.isActive) {
    return res.status(403).json({ error: 'account inactive or pending approval' });
  }

  if (!student.isAdmin) {
    return res.status(403).json({ error: 'admin access not granted' });
  }

  const token = jwt.sign(
    {
      studentId: student.id,
      username: student.username,
      role: 'admin',
      isStudentAdmin: true,
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  return res.json({ token });
});

module.exports = router;