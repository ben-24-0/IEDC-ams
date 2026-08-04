const express = require('express');
const prisma = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.get('/session/:id/csv', requireAuth, async (req, res) => {
  const session = await prisma.session.findUnique({
    where: { id: req.params.id },
    include: { logs: { include: { student: true } } },
  });
  if (!session) return res.status(404).json({ error: 'not found' });

  const header = 'Name,Team,Role,RFID,Scanned At,Manual\n';
  const rows = session.logs.map((log) =>
    `${log.student.name},${log.student.team},${log.student.role},${log.student.rfidUid},${log.scannedAt.toISOString()},${log.isManual}`
  ).join('\n');

  const csv = header + rows;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${session.title}-attendance.csv"`);
  res.send(csv);
});

module.exports = router;