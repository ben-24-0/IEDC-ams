const express = require("express");
const prisma = require("../db");
const requireAuth = require("../middleware/auth");

const router = express.Router();

function parseScheduledAt(body, existingScheduledAt) {
  if (body.scheduledAt) {
    const parsed = new Date(body.scheduledAt);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  if (body.date && body.time) {
    const parsed = new Date(`${body.date}T${body.time}`);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return existingScheduledAt || null;
}

function buildMeetingSummary(meeting) {
  const dateText = meeting.scheduledAt
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(meeting.scheduledAt)
    : "TBA";

  const agendaText = meeting.agenda ? `\nAgenda: ${meeting.agenda}` : "";
  return [
    `Meeting: ${meeting.title}`,
    `When: ${dateText}`,
    `Venue: ${meeting.venue}`,
    `Status: ${meeting.status}`,
    agendaText.trim(),
  ]
    .filter(Boolean)
    .join("\n");
}

function buildShareLinks(meeting) {
  const subject = encodeURIComponent(`Meeting confirmation: ${meeting.title}`);
  const body = encodeURIComponent(buildMeetingSummary(meeting));
  const target = (meeting.notificationTarget || "").trim();
  const emailLink = target
    ? `mailto:${encodeURIComponent(target)}?subject=${subject}&body=${body}`
    : `mailto:?subject=${subject}&body=${body}`;
  const phone = target.replace(/[^\d]/g, "");
  const whatsappLink = `https://wa.me/${phone}?text=${body}`;

  return { emailLink, whatsappLink };
}

function serializeMeeting(meeting) {
  return {
    ...meeting,
    scheduledAt: meeting.scheduledAt ? meeting.scheduledAt.toISOString() : null,
    confirmedAt: meeting.confirmedAt ? meeting.confirmedAt.toISOString() : null,
    createdAt: meeting.createdAt ? meeting.createdAt.toISOString() : null,
    updatedAt: meeting.updatedAt ? meeting.updatedAt.toISOString() : null,
    ...buildShareLinks(meeting),
  };
}

router.get("/", requireAuth, async (req, res) => {
  const meetings = await prisma.meeting.findMany({
    orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
    include: { createdBy: { select: { username: true } } },
  });

  res.json(meetings.map(serializeMeeting));
});

router.post("/", requireAuth, async (req, res) => {
  const { title, venue, agenda, notificationChannel, notificationTarget } =
    req.body;
  const scheduledAt = parseScheduledAt(req.body);

  if (!title?.trim() || !venue?.trim() || !scheduledAt) {
    return res
      .status(400)
      .json({ error: "title, scheduled time, and venue are required" });
  }

  const meeting = await prisma.meeting.create({
    data: {
      title: title.trim(),
      venue: venue.trim(),
      agenda: agenda?.trim() || null,
      scheduledAt,
      notificationChannel: notificationChannel?.trim() || null,
      notificationTarget: notificationTarget?.trim() || null,
      createdById: req.admin.adminId,
    },
  });

  res.json(serializeMeeting(meeting));
});

router.patch("/:id", requireAuth, async (req, res) => {
  const existing = await prisma.meeting.findUnique({
    where: { id: req.params.id },
  });

  if (!existing) {
    return res.status(404).json({ error: "not found" });
  }

  const scheduledAt = parseScheduledAt(req.body, existing.scheduledAt);
  const nextTitle = req.body.title?.trim() || existing.title;
  const nextVenue = req.body.venue?.trim() || existing.venue;
  const nextAgenda = req.body.agenda?.trim() ?? existing.agenda;
  const nextChannel =
    req.body.notificationChannel?.trim() ?? existing.notificationChannel;
  const nextTarget =
    req.body.notificationTarget?.trim() ?? existing.notificationTarget;

  const coreFieldsChanged =
    nextTitle !== existing.title ||
    nextVenue !== existing.venue ||
    nextAgenda !== existing.agenda ||
    (scheduledAt &&
      existing.scheduledAt &&
      scheduledAt.getTime() !== existing.scheduledAt.getTime());

  const meeting = await prisma.meeting.update({
    where: { id: req.params.id },
    data: {
      title: nextTitle,
      venue: nextVenue,
      agenda: nextAgenda,
      scheduledAt: scheduledAt || existing.scheduledAt,
      notificationChannel: nextChannel,
      notificationTarget: nextTarget,
      status: coreFieldsChanged ? "DRAFT" : existing.status,
      confirmedAt: coreFieldsChanged ? null : existing.confirmedAt,
    },
  });

  res.json(serializeMeeting(meeting));
});

router.patch("/:id/confirm", requireAuth, async (req, res) => {
  const existing = await prisma.meeting.findUnique({
    where: { id: req.params.id },
  });

  if (!existing) {
    return res.status(404).json({ error: "not found" });
  }

  const meeting = await prisma.meeting.update({
    where: { id: req.params.id },
    data: {
      status: "CONFIRMED",
      confirmedAt: new Date(),
      notificationChannel:
        req.body.notificationChannel?.trim() || existing.notificationChannel,
      notificationTarget:
        req.body.notificationTarget?.trim() || existing.notificationTarget,
    },
  });

  res.json(serializeMeeting(meeting));
});

router.delete("/:id", requireAuth, async (req, res) => {
  await prisma.meeting.delete({
    where: { id: req.params.id },
  });

  res.json({ deleted: true });
});

module.exports = router;
