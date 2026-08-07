const express = require("express");
const prisma = require("../db");
const requireAuth = require("../middleware/auth");

const router = express.Router();

function parseScheduledTime(body, existingScheduledTime) {
  if (body.scheduledTime) {
    const parsed = new Date(body.scheduledTime);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  if (body.date && body.time) {
    const parsed = new Date(`${body.date}T${body.time}`);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return existingScheduledTime || null;
}

function buildSessionSummary(session) {
  const dateText = session.scheduledTime
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(session.scheduledTime)
    : "TBA";

  const agendaText = session.agenda ? `\nAgenda: ${session.agenda}` : "";
  const venueText = session.venue ? session.venue : "TBA";

  return [
    `Session: ${session.title}`,
    `When: ${dateText}`,
    `Venue: ${venueText}`,
    `Status: ${session.status}`,
    session.confirmedAt ? `Confirmed: ${dateText}` : null,
    agendaText.trim(),
  ]
    .filter(Boolean)
    .join("\n");
}

function buildShareLinks(session) {
  const subject = encodeURIComponent(`Session confirmation: ${session.title}`);
  const body = encodeURIComponent(buildSessionSummary(session));
  const target = (session.notificationTarget || "").trim();
  const emailLink = target
    ? `mailto:${encodeURIComponent(target)}?subject=${subject}&body=${body}`
    : `mailto:?subject=${subject}&body=${body}`;
  const phone = target.replace(/[^\d]/g, "");
  const whatsappLink = phone
    ? `https://wa.me/${phone}?text=${body}`
    : `https://wa.me/?text=${body}`;

  return { emailLink, whatsappLink };
}

function serializeSession(session) {
  return {
    ...session,
    scheduledTime: session.scheduledTime
      ? session.scheduledTime.toISOString()
      : null,
    confirmedAt: session.confirmedAt ? session.confirmedAt.toISOString() : null,
    createdAt: session.createdAt ? session.createdAt.toISOString() : null,
    updatedAt: session.updatedAt ? session.updatedAt.toISOString() : null,
    ...buildShareLinks(session),
  };
}

// create a session (admin picks title, optional scheduled time)
router.post("/", requireAuth, async (req, res) => {
  const { title, agenda, venue, notificationChannel, notificationTarget } =
    req.body;
  const scheduledTime = parseScheduledTime(req.body);

  if (!title?.trim() || !venue?.trim() || !scheduledTime) {
    return res
      .status(400)
      .json({ error: "title, scheduled time, and venue are required" });
  }

  const session = await prisma.session.create({
    data: {
      title: title.trim(),
      scheduledTime,
      venue: venue.trim(),
      agenda: agenda?.trim() || null,
      notificationChannel: notificationChannel?.trim() || null,
      notificationTarget: notificationTarget?.trim() || null,
      createdById: req.admin.adminId,
    },
  });

  res.json(serializeSession(session));
});

// list all sessions (for calendar view later - supports ?from=&to= filtering)
router.get("/", requireAuth, async (req, res) => {
  const sessions = await prisma.session.findMany({
    orderBy: { createdAt: "desc" },
    include: { logs: { include: { student: true } } },
  });
  res.json(
    sessions.map((session) => ({
      ...serializeSession(session),
      present: session.logs.map((log) => ({
        id: log.student.id,
        name: log.student.name,
        time: log.scannedAt,
      })),
    })),
  );
});

// get 1 session with full attendance detail
router.get("/:id", requireAuth, async (req, res) => {
  const session = await prisma.session.findUnique({
    where: { id: req.params.id },
    include: { logs: { include: { student: true } } },
  });
  if (!session) return res.status(404).json({ error: "not found" });
  res.json({
    ...serializeSession(session),
    present: session.logs.map((log) => ({
      id: log.student.id,
      name: log.student.name,
      time: log.scannedAt,
    })),
  });
});

router.patch("/:id", requireAuth, async (req, res) => {
  const existing = await prisma.session.findUnique({
    where: { id: req.params.id },
  });

  if (!existing) return res.status(404).json({ error: "not found" });

  const scheduledTime = parseScheduledTime(req.body, existing.scheduledTime);
  const nextTitle = req.body.title?.trim() || existing.title;
  const nextVenue = req.body.venue?.trim() || existing.venue;
  const nextAgenda = req.body.agenda?.trim() ?? existing.agenda;
  const nextChannel =
    req.body.notificationChannel?.trim() ?? existing.notificationChannel;
  const nextTarget =
    req.body.notificationTarget?.trim() ?? existing.notificationTarget;

  const scheduleChanged =
    (scheduledTime &&
      existing.scheduledTime &&
      scheduledTime.getTime() !== existing.scheduledTime.getTime()) ||
    !!scheduledTime !== !!existing.scheduledTime;

  const session = await prisma.session.update({
    where: { id: req.params.id },
    data: {
      title: nextTitle,
      venue: nextVenue,
      agenda: nextAgenda,
      scheduledTime: scheduledTime || existing.scheduledTime,
      notificationChannel: nextChannel,
      notificationTarget: nextTarget,
      confirmedAt: scheduleChanged ? null : existing.confirmedAt,
    },
  });

  res.json(serializeSession(session));
});

router.patch("/:id/confirm", requireAuth, async (req, res) => {
  const existing = await prisma.session.findUnique({
    where: { id: req.params.id },
  });

  if (!existing) return res.status(404).json({ error: "not found" });

  const session = await prisma.session.update({
    where: { id: req.params.id },
    data: {
      confirmedAt: new Date(),
      notificationChannel:
        req.body.notificationChannel?.trim() || existing.notificationChannel,
      notificationTarget:
        req.body.notificationTarget?.trim() || existing.notificationTarget,
    },
  });

  res.json(serializeSession(session));
});

// student-facing - documentation team members can upload/edit minutes
router.patch("/:id/minutes", requireAuth, async (req, res) => {
  const studentId = req.admin.studentId; 
  if (!studentId) return res.status(403).json({ error: "student login required" });

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student || student.team !== "DOCUMENTATION") {
    return res.status(403).json({ error: "only documentation team members can edit minutes" });
  }

  const existing = await prisma.session.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "not found" });

  // FIXED: Matches your Prisma enum for SessionStatus
  if (existing.status === "SCHEDULED") {
    return res.status(400).json({ error: "Session must be ACTIVE or CLOSED to add minutes." });
  }

  const session = await prisma.session.update({
    where: { id: req.params.id },
    data: { minutes: req.body.minutes ?? "" },
  });
  res.json(serializeSession(session));
});

// start session (device button press hits this via a small esp32-triggered call, or admin manually)
router.patch("/:id/start", requireAuth, async (req, res) => {
  const session = await prisma.session.update({
    where: { id: req.params.id },
    data: { status: "ACTIVE" },
  });
  res.json(session);
});

// close session
router.patch("/:id/close", requireAuth, async (req, res) => {
  const session = await prisma.session.update({
    where: { id: req.params.id },
    data: { status: "CLOSED" },
  });
  res.json(session);
});

// delete an accidental session
router.delete("/:id", requireAuth, async (req, res) => {
  await prisma.attendanceLog.deleteMany({
    where: { sessionId: req.params.id },
  });
  await prisma.session.delete({ where: { id: req.params.id } });
  res.json({ deleted: true });
});

module.exports = router;
