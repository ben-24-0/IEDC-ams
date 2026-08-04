const express = require('express');
const prisma = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// record a tap - real version: called by mqtt listener when esp32 publishes a scan
// for now: manual endpoint so we can test without hardware
router.post('/tap', requireAuth, async (req, res) => {
  const { rfidUid, sessionId } = req.body;

  const student = await prisma.student.findUnique({ where: { rfidUid } });
  if (!student) return res.status(404).json({ error: 'unrecognized card' });
  if (!student.isActive) return res.status(403).json({ error: 'student inactive' });

  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) return res.status(404).json({ error: 'session not found' });
  if (session.status !== 'ACTIVE') return res.status(400).json({ error: 'session not active' });

  try {
    const log = await prisma.attendanceLog.create({
      data: { studentId: student.id, sessionId },
      include: { student: true },
    });
    res.json({ status: 'ACCEPTED', log });
  } catch (err) {
    if (err.code === 'P2002') {
      // already tapped this session - our @@unique([studentId, sessionId]) catching it
      return res.status(409).json({ status: 'DUPLICATE', error: 'already marked present' });
    }
    res.status(500).json({ error: 'server error' });
  }
});

// admin manual override - add/remove attendance, audit trail applies
router.post('/manual', requireAuth, async (req, res) => {
  const { studentId, sessionId, action } = req.body; // action: 'add' | 'remove'

  if (action === 'add') {
    const log = await prisma.attendanceLog.upsert({
      where: { studentId_sessionId: { studentId, sessionId } },
      update: { isManual: true, modifiedBy: req.admin.username, modifiedAt: new Date() },
      create: {
        studentId, sessionId,
        isManual: true, modifiedBy: req.admin.username, modifiedAt: new Date(),
      },
    });
    return res.json(log);
  }

  if (action === 'remove') {
    await prisma.attendanceLog.deleteMany({ where: { studentId, sessionId } });
    return res.json({ removed: true });
  }

  res.status(400).json({ error: 'action must be add or remove' });
});

module.exports = router;