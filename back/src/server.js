require("dotenv").config();
require("./mqtt/listener");
const express = require("express");
const cors = require("cors");

const app = express();
// Define the URLs that are allowed to talk to your backend
const allowedOrigins = [
  "http://localhost:5173",
  "https://iedc-ams-bens-projects-47cd00d7.vercel.app",
  "https://iedc-ams.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});