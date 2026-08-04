const express = require("express");
const requireAuth = require("../middleware/auth");
const {
  client: mqttClient,
  getLastEnroll,
  clearLastEnroll,
} = require("../mqtt/listener");

const router = express.Router();
const COMMAND_TOPIC = "fisat/ams/command";

router.post("/command", requireAuth, (req, res) => {
  const { command } = req.body;

  if (!["REBOOT", "CLEAR_WIFI"].includes(command)) {
    return res
      .status(400)
      .json({ error: "command must be REBOOT or CLEAR_WIFI" });
  }

  mqttClient.publish(COMMAND_TOPIC, JSON.stringify({ command }));

  res.json({ sent: command });
});

router.post("/wifi", requireAuth, (req, res) => {
  res.status(501).json({
    error: "wifi provisioning is done from the ESP32 captive portal, not mqtt",
  });
});

// poll this after clicking "capture from device" - returns the last card tapped in enroll mode
router.get("/last-enroll", requireAuth, (req, res) => {
  res.json(getLastEnroll());
});

// call this right before starting a capture session, so stale taps don't get picked up
router.post("/last-enroll/clear", requireAuth, (req, res) => {
  clearLastEnroll();
  res.json({ cleared: true });
});

module.exports = router;
