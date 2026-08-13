const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../db");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// Helper for projection (excludes sensitive fields like passwordHash)
const safeStudentSelect = () => ({
  id: true,
  name: true,
  rfidUid: true,
  username: true,
  isApproved: true,
  role: true,
  team: true,
  isActive: true,
  isAdmin: true,
});

// Async wrapper to remove try/catch boilerplate across routes
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/* ==========================================================================
   ROSTER MANAGEMENT (ADMIN)
   ========================================================================== */

// Create student record in official roster
router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { name, rfidUid, role, team } = req.body;
    try {
      const student = await prisma.student.create({
        data: { name, rfidUid, role, team, isApproved: true },
        select: safeStudentSelect(),
      });
      res.status(201).json(student);
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: "RFID card UID already assigned" });
      }
      throw err;
    }
  })
);

// List active students
router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const students = await prisma.student.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: safeStudentSelect(),
    });
    res.json(students);
  })
);

// List archived (inactive) students
router.get(
  "/archived",
  requireAuth,
  asyncHandler(async (req, res) => {
    const students = await prisma.student.findMany({
      where: { isActive: false },
      orderBy: { name: "asc" },
      select: safeStudentSelect(),
    });
    res.json(students);
  })
);

// Restore archived student
router.patch(
  "/:id/restore",
  requireAuth,
  asyncHandler(async (req, res) => {
    const student = await prisma.student.update({
      where: { id: req.params.id },
      data: { isActive: true },
      select: safeStudentSelect(),
    });
    res.json(student);
  })
);

// Permanently delete archived student
router.delete(
  "/archived/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    if (student.isActive) {
      return res.status(400).json({ error: "Archive the student before permanently deleting" });
    }

    await prisma.student.delete({
      where: { id: req.params.id },
    });

    res.json({ deleted: true });
  })
);

// Update student (role, team, RFID, name, active state)
router.patch(
  "/:id/grant-admin",
  requireAuth,
  asyncHandler(async (req, res) => {
    const student = await prisma.student.update({
      where: { id: req.params.id },
      data: { isAdmin: true },
      select: safeStudentSelect(),
    });

    res.json(student);
  })
);

router.patch(
  "/:id/revoke-admin",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Prevent a student-admin from removing their own admin access accidentally.
    if (req.admin.studentId && req.admin.studentId === id) {
      return res
        .status(400)
        .json({ error: "You cannot revoke your own admin access." });
    }

    const student = await prisma.student.update({
      where: { id },
      data: { isAdmin: false },
      select: safeStudentSelect(),
    });

    res.json(student);
  })
);

router.patch(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { name, rfidUid, role, team, isActive } = req.body;
    try {
      const student = await prisma.student.update({
        where: { id: req.params.id },
        data: { name, rfidUid, role, team, isActive },
        select: safeStudentSelect(),
      });
      res.json(student);
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({
          error: "RFID card UID already assigned to another student",
        });
      }
      throw err;
    }
  })
);

// Deactivate student (Soft Delete to preserve relational integrity with attendance & logs)
router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const student = await prisma.student.update({
      where: { id: req.params.id },
      data: { isActive: false },
      select: safeStudentSelect(),
    });
    res.json({ action: "archived", deactivated: true, student });
  })
);

/* ==========================================================================
   REGISTRATION & PENDING APPROVALS
   ========================================================================== */

// Public student self-registration
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { name, username, password } = req.body;
    if (!name || !username || !password) {
      return res.status(400).json({ error: "Name, username, and password required" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    try {
      const pending = await prisma.pendingRegistration.create({
        data: { name, username, passwordHash },
      });

      res.status(201).json({
        id: pending.id,
        name: pending.name,
        status: "pending approval",
      });
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Username already taken" });
      }
      throw err;
    }
  })
);

// Admin list pending approvals
router.get(
  "/pending",
  requireAuth,
  asyncHandler(async (req, res) => {
    const pending = await prisma.pendingRegistration.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, username: true, createdAt: true },
    });
    res.json(pending);
  })
);

// Admin approve pending registration & link login to existing roster student
router.patch(
  "/pending/:id/approve",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ error: "studentId is required" });
    }

    const pending = await prisma.pendingRegistration.findUnique({
      where: { id: req.params.id },
    });
    if (!pending) {
      return res.status(404).json({ error: "Pending registration not found" });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      return res.status(404).json({ error: "Selected student not found in roster" });
    }

    if (student.username || student.passwordHash) {
      return res.status(409).json({
        error: "Selected student already has an active login account",
      });
    }

    const updatedStudent = await prisma.$transaction(async (tx) => {
      const updated = await tx.student.update({
        where: { id: studentId },
        data: {
          username: pending.username,
          passwordHash: pending.passwordHash,
          isApproved: true,
        },
        select: safeStudentSelect(),
      });

      await tx.pendingRegistration.delete({
        where: { id: pending.id },
      });

      return updated;
    });

    res.json(updatedStudent);
  })
);

// Admin reject pending registration
router.delete(
  "/pending/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    try {
      await prisma.pendingRegistration.delete({
        where: { id: req.params.id },
      });
      res.json({ rejected: true, message: "Pending registration removed" });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Pending registration not found" });
      }
      throw err;
    }
  })
);

/* ==========================================================================
   AUTHENTICATION
   ========================================================================== */

// Student login
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const student = await prisma.student.findUnique({ where: { username } });
    if (!student) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, student.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!student.isApproved || !student.isActive) {
      return res.status(403).json({ error: "Account inactive or pending approval" });
    }

    const token = jwt.sign(
      { studentId: student.id, username: student.username, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ token, name: student.name, team: student.team });
  })
);

module.exports = router;