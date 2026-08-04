const mqtt = require("mqtt");
const prisma = require("../db");

const MQTT_URL = process.env.MQTT_URL || "mqtt://broker.hivemq.com:1883";
const SCAN_TOPIC = "fisat/ams/scan";
const RESPONSE_TOPIC = "fisat/ams/response";
const COMMAND_TOPIC = "fisat/ams/command";

const client = mqtt.connect(MQTT_URL);

// in-memory store for the last card tapped - polled by the admin dashboard
let lastScan = null;

function getLastEnroll() {
  return lastScan ? { ...lastScan } : { rfidUid: null, at: null };
}
function clearLastEnroll() {
  lastScan = null;
}

function publishResponse(status, extra = {}) {
  client.publish(RESPONSE_TOPIC, JSON.stringify({ status, ...extra }));
}

client.on("connect", () => {
  console.log(`mqtt connected to ${MQTT_URL}`);
  client.subscribe(SCAN_TOPIC);
  client.subscribe(COMMAND_TOPIC);
});

client.on("message", async (topic, message) => {
  if (topic === SCAN_TOPIC) {
    await handleScan(message.toString());
  }
});

function parseScanPayload(rawPayload) {
  try {
    const parsed = JSON.parse(rawPayload);
    if (parsed && typeof parsed === "object") {
      const uid = String(parsed.uid || "").trim();
      return uid
        ? {
            uid,
            deviceId: parsed.deviceId || null,
            timestamp: parsed.timestamp || null,
          }
        : null;
    }
  } catch (err) {
    // fall through to raw string support for manual testing
  }

  const uid = String(rawPayload || "").trim();
  return uid ? { uid, deviceId: null, timestamp: null } : null;
}

async function handleScan(rawPayload) {
  const scan = parseScanPayload(rawPayload);
  if (!scan) {
    console.warn("[MQTT] Ignoring malformed scan payload");
    return;
  }

  lastScan = {
    rfidUid: scan.uid,
    deviceId: scan.deviceId,
    at: new Date().toISOString(),
  };

  const rfidUid = scan.uid;
  const session = await prisma.session.findFirst({
    where: { status: "ACTIVE" },
  });
  if (!session) {
    publishResponse("NO_ACTIVE_SESSION", { uid: rfidUid });
    return;
  }

  const student = await prisma.student.findUnique({ where: { rfidUid } });
  if (!student) {
    publishResponse("REJECTED", { uid: rfidUid, sessionId: session.id });
    return;
  }

  try {
    await prisma.attendanceLog.create({
      data: { studentId: student.id, sessionId: session.id },
    });
    publishResponse("ACCEPTED", {
      uid: rfidUid,
      sessionId: session.id,
      studentId: student.id,
    });
  } catch (err) {
    if (err.code === "P2002") {
      publishResponse("DUPLICATE", {
        uid: rfidUid,
        sessionId: session.id,
        studentId: student.id,
      });
      return;
    }

    console.error("[MQTT] Failed to create attendance log:", err);
    publishResponse("REJECTED", { uid: rfidUid, sessionId: session.id });
  }
}

module.exports = { client, getLastEnroll, clearLastEnroll };
