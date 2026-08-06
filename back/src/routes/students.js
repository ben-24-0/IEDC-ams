const express = require("express");
const prisma = require("../db");
const requireAuth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();

function safeStudentSelect() {
  return {
    id: true,
    name: true,
    rfidUid: true,
    username: true,
    isApproved: true,
    role: true,
    team: true,
    isActive: true,
  };
}

// create student (admin ties RFID card to a person)
router.post("/", requireAuth, async (req, res) => {
  const { name, rfidUid, role, team } = req.body;
  try {
    const student = await prisma.student.create({
      data: { name, rfidUid, role, team, isApproved: true },
    });
    res.json(student);
  } catch (err) {
    if (err.code === "P2002") {
      // prisma's unique constraint violation code
      return res.status(409).json({ error: "rfidUid already registered" });
    }
    res.status(500).json({ error: "server error" });
  }
});

// list all students
router.get("/", requireAuth, async (req, res) => {
  const students = await prisma.student.findMany({
    orderBy: { name: "asc" },
    select: safeStudentSelect(),
  });
  res.json(students);
});

// update student (change role/team, reassign card, deactivate)
router.patch("/:id", requireAuth, async (req, res) => {
  const { name, rfidUid, role, team, isActive } = req.body;
  try {
    const student = await prisma.student.update({
      where: { id: req.params.id },
      data: { name, rfidUid, role, team, isActive },
    });
    res.json(student);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "that rfid card is already assigned to another student" });
    }
    res.status(500).json({ error: "server error" });
  }
});
// delete student
// deactivate student (soft delete - preserves attendance history)
router.delete("/:id", requireAuth, async (req, res) => {
  const student = await prisma.student.update({
    where: { id: req.params.id },
    data: { isActive: false },
  });
  res.json({ deactivated: true, student });
});

// public - student self-registration
router.post("/register", async (req, res) => {
  const { name, username, password } = req.body;
  if (!name || !username || !password) {
    return res.status(400).json({ error: "name, username, password required" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const student = await prisma.student.create({
      data: { name, username, passwordHash, isApproved: false },
    });
    res.json({
      id: student.id,
      name: student.name,
      status: "pending approval",
    });
  } catch (err) {
    if (err.code === "P2002")
      return res.status(409).json({ error: "username taken" });
    res.status(500).json({ error: "server error" });
  }
});

// admin - list pending approvals
router.get("/pending", requireAuth, async (req, res) => {
  const pending = await prisma.student.findMany({
    where: { isApproved: false },
    orderBy: { name: "asc" },
    select: safeStudentSelect(),
  });
  res.json(pending);
});

// admin - approve + assign role/team/card
router.patch("/:id/approve", requireAuth, async (req, res) => {
  const { role, team, rfidUid, connectStudentId } = req.body;

if (connectStudentId) {
  const pendingStudent = await prisma.student.findUnique({ where: { id: req.params.id } });
  const targetStudent = await prisma.student.findUnique({ where: { id: connectStudentId } });

  if (!pendingStudent) return res.status(404).json({ error: "pending student not found" });
  if (!targetStudent) return res.status(404).json({ error: "selected student not found" });
  if (targetStudent.username || targetStudent.passwordHash) {
    return res.status(409).json({ error: "selected student already has a login account" });
  }

  try {
    const updatedStudent = await prisma.$transaction(async (tx) => {
      const merged = await tx.student.update({
        where: { id: targetStudent.id },
        data: { username: pendingStudent.username, passwordHash: pendingStudent.passwordHash, isApproved: true },
      });
      await tx.student.delete({ where: { id: pendingStudent.id } });
      return merged;
    });
    return res.json(updatedStudent);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "this pending request may have already been approved - refresh n check the roster" });
    }
    return res.status(500).json({ error: "server error" });
  }
}

  const student = await prisma.student.update({
    where: { id: req.params.id },
    data: { role, team, rfidUid, isApproved: true },
  });
  res.json(student);
});

// public - student login (separate from admin login)
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const student = await prisma.student.findUnique({ where: { username } });
  if (!student) return res.status(401).json({ error: "invalid credentials" });

  const valid = await bcrypt.compare(password, student.passwordHash);
  if (!valid) return res.status(401).json({ error: "invalid credentials" });

  if (!student.isApproved)
    return res.status(403).json({ error: "account pending admin approval" });

  const token = jwt.sign(
    { studentId: student.id, username: student.username, role: "student" },
    process.env.JWT_SECRET,
    { expiresIn: "8h" },
  );

  res.json({ token, name: student.name, team: student.team });
});
module.exports = router;
