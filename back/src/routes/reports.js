const express = require('express');
const prisma = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

function esc(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

router.get('/session/:id/csv', requireAuth, async (req, res) => {
  const session = await prisma.session.findUnique({
    where: { id: req.params.id },
    include: { logs: { include: { student: true } } },
  });
  if (!session) return res.status(404).json({ error: 'not found' });

  const dateTime = session.scheduledTime
    ? new Date(session.scheduledTime).toLocaleString()
    : 'TBA';

  const lines = [];
  lines.push(`Date and Time,${esc(dateTime)}`);
  lines.push(`Venue,${esc(session.venue || 'TBA')}`);
  lines.push(`Agenda,${esc(session.agenda || '')}`);
  lines.push(`Meeting Minutes,${esc(session.minutes || '')}`);
  lines.push('');
  lines.push('Name,Team');
  session.logs.forEach((log) => {
    lines.push(`${esc(log.student.name)},${esc(log.student.team)}`);
  });

  const csv = lines.join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${session.title}-attendance.csv"`);
  res.send(csv);
});

module.exports = router;