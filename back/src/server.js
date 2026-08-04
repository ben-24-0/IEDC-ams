require("dotenv").config();
require("./mqtt/listener");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());

app.use(express.json());

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});
const studentRoutes = require("./routes/students");
app.use("/api/students", studentRoutes);
const attendanceRoutes = require("./routes/attendance");

app.use("/api/attendance", attendanceRoutes);
const sessionRoutes = require("./routes/sessions");
const meetingRoutes = require("./routes/meetings");
app.use("/api/meetings", meetingRoutes);

const deviceRoutes = require("./routes/device");
app.use("/api/device", deviceRoutes);

app.use("/api/sessions", sessionRoutes);
const PORT = process.env.PORT || 4000;

const reportRoutes = require("./routes/reports");
app.use("/api/reports", reportRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
