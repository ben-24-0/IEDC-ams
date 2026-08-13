import { useState, useEffect } from "react";
import { adminApi } from "../api/client";

const THEMES = {
  light: {
    bg: "#EAF0FB",
    panel: "#FFFFFF",
    ink: "#0B0F19",
    border: "#0B0F19",
    muted: "#F4F6FA",
    accentSolid: "#2F6FED",
    accentGradient: "linear-gradient(90deg, #0B1F6B, #3B5FFF)",
    cyan: "#00E5FF",
    mutedText: "rgba(11,15,25,0.55)",
  },
  dark: {
    bg: "#060608",
    panel: "#101018",
    ink: "#FFFFFF",
    border: "#FFFFFF",
    muted: "#17171F",
    accentSolid: "#3B5FFF",
    accentGradient: "linear-gradient(90deg, #1A2A8F, #4D6BFF)",
    cyan: "#00E5FF",
    mutedText: "rgba(255,255,255,0.55)",
  },
};

const TABS = ["Sessions", "Students", "Device", "Reports"];
const TEAM_OPTIONS = [
  "IEDC",
  "CREATIVE",
  "FINANCE",
  "MARKETING",
  "PODCAST",
  "TECH",
  "PROTOTYPE",
  "COMMUNITY",
  "MEDIA",
  "COORDINATORS",
  "OPERATION",
  "DOCUMENTATION",
  "WOMEN INNOVATION",
];
const ROLE_OPTIONS = ["LEAD", "MEMBER"];

export default function AdminDashboard({ onLogout }) {
  const [tab, setTab] = useState("Sessions");
  const [mode, setMode] = useState(() => localStorage.getItem("themeMode") || "dark");
  const t = { ...THEMES[mode], mode };
  
    useEffect(() => {
      localStorage.setItem("themeMode", mode);
    }, [mode]);

  return (
    <div
      className="admin-dashboard"
      style={{
        minHeight: "100vh",
        background: t.bg,
        color: t.ink,
        fontFamily: "Inter, sans-serif",
        padding: "24px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;500&family=Inter:wght@400;600&family=JetBrains+Mono:wght@500&display=swap');
        * { box-sizing: border-box; }
        .brutal-btn { font-family: 'Space Grotesk', sans-serif; border: 3px solid ${t.border}; box-shadow: 5px 5px 0 ${t.border}; transition: transform 0.1s, box-shadow 0.1s; cursor: pointer; font-weight: 700; }
        .brutal-btn:active { transform: translate(5px, 5px); box-shadow: 0 0 0 ${t.border}; }
        .brutal-input { font-family: 'JetBrains Mono', monospace; border: 2px solid ${t.border}; background: ${t.panel}; color: ${t.ink}; padding: 8px 10px; font-size: 13px; }
        .admin-dashboard .admin-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .admin-dashboard .admin-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .admin-dashboard .admin-session-strip {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
          align-items: center;
        }
        .admin-dashboard .admin-create-row,
        .admin-dashboard .admin-session-actions {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .admin-dashboard .admin-detail-card {
          border: 4px solid ${t.border};
          box-shadow: 8px 8px 0 ${t.border};
          background: ${t.panel};
          padding: 24px;
        }
        .admin-dashboard .admin-pending-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(780px, 1fr));
          gap: 12px;
        }

        .admin-dashboard .admin-roster-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
        }
        .admin-dashboard .admin-pending-card,
        .admin-dashboard .admin-roster-card {
          border: 3px solid ${t.border};
          background: ${t.panel};
          padding: 14px;
        }
        .admin-dashboard .admin-pending-card {
          display: grid;
          grid-template-columns: minmax(120px, 150px) minmax(190px, 1fr) minmax(92px, 108px) minmax(92px, 108px) minmax(108px, 124px) 40px 40px 40px;
          gap: 6px;
          align-items: center;
          padding: 8px 10px;
          background: #ffffff;
          color: #111827;
          border-color: #d1d5db;
          box-shadow: 4px 4px 0 #d1d5db;
        }
        .admin-dashboard .admin-pending-card .brutal-input {
          width: 100% !important;
          min-width: 0 !important;
          background: #ffffff;
          color: #111827;
          border-color: #d1d5db;
          font-size: 11px;
          padding: 6px 8px;
        }
        .admin-dashboard .admin-pending-card select.brutal-input {
          height: 36px;
        }
        .admin-dashboard .admin-pending-card .pending-name {
          min-width: 0;
        }
        .admin-dashboard .admin-pending-card .pending-actions {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: flex-end;
          align-items: center;
        }
        .admin-dashboard .icon-btn {
          width: 38px;
          height: 38px;
          padding: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }
        .admin-dashboard .admin-device-card {
          border: 4px solid ${t.border};
          box-shadow: 8px 8px 0 ${t.border};
          background: ${t.panel};
          padding: 24px;
          max-width: 400px;
        }
        @media (max-width: 900px) {
          .admin-dashboard {
            padding: 14px !important;
          }
          .admin-dashboard .admin-topbar {
            flex-direction: column;
            align-items: stretch;
          }
          .admin-dashboard .admin-tabs {
            flex-wrap: nowrap;
            overflow-x: auto;
            overflow-y: hidden;
            padding-bottom: 6px;
            scrollbar-width: none;
          }
          .admin-dashboard .admin-tabs::-webkit-scrollbar,
          .admin-dashboard .admin-session-strip::-webkit-scrollbar {
            display: none;
          }
          .admin-dashboard .admin-tabs > button,
          .admin-dashboard .admin-session-strip > div {
            flex: 0 0 auto;
            white-space: nowrap;
          }
          .admin-dashboard .admin-session-strip {
            flex-wrap: nowrap;
            overflow-x: auto;
            overflow-y: hidden;
            padding-bottom: 6px;
          }
          .admin-dashboard .admin-create-row,
          .admin-dashboard .admin-session-actions {
            flex-direction: column;
            align-items: stretch;
          }
          .admin-dashboard .admin-create-row > *,
          .admin-dashboard .admin-session-actions > * {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
          }
          .admin-dashboard .admin-detail-card,
          .admin-dashboard .admin-device-card {
            width: 100% !important;
            max-width: 100% !important;
            padding: 16px;
            box-shadow: none;
          }
          .admin-dashboard .admin-pending-card {
            grid-template-columns: 1fr;
            padding: 12px;
            box-shadow: none;
          }
          .admin-dashboard .icon-btn {
            width: 100%;
            min-width: 0;
          }
          .admin-dashboard .admin-pending-card .pending-actions {
            justify-content: flex-start;
          }
          .admin-dashboard .admin-pending-list,
          .admin-dashboard .admin-roster-grid {
            grid-template-columns: 1fr;
          }
          .admin-dashboard .admin-pending-card,
          .admin-dashboard .admin-roster-card {
            padding: 12px;
          }
          .admin-dashboard .brutal-input {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
          }
        }
      `}</style>

      {/* top bar */}
      <div className="admin-topbar">
        <div>
          <div
            style={{
              width: "44px",
              height: "4px",
              background: t.accentGradient,
              marginBottom: "8px",
            }}
          />
          <div
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 700,
              fontSize: "20px",
              letterSpacing: "2px",
            }}
          >
            IEDC{" "}
            <span style={{ fontWeight: 500, opacity: 0.6, fontSize: "14px" }}>
              FISAT · ADMIN
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="brutal-btn"
            title={
              mode === "dark" ? "Switch to light theme" : "Switch to dark theme"
            }
            aria-label={
              mode === "dark" ? "Switch to light theme" : "Switch to dark theme"
            }
            style={{
              background: t.panel,
              color: t.ink,
              padding: "8px",
              fontSize: "12px",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => setMode(mode === "dark" ? "light" : "dark")}
          >
            {mode === "dark" ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M21 12.8A8.5 8.5 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
          <button
            className="brutal-btn"
            style={{
              background: t.panel,
              color: t.ink,
              padding: "8px 16px",
              fontSize: "12px",
            }}
            onClick={onLogout}
          >
            LOGOUT
          </button>
        </div>
      </div>

      {/* tab nav */}
      <div className="admin-tabs">
        {TABS.map((tb) => (
          <button
            key={tb}
            className="brutal-btn"
            style={{
              background: tab === tb ? t.accentSolid : t.panel,
              color: tab === tb ? "#fff" : t.ink,
              padding: "8px 18px",
              fontSize: "13px",
            }}
            onClick={() => setTab(tb)}
          >
            {tb.toUpperCase()}
          </button>
        ))}
      </div>

      {tab === "Sessions" && <SessionsTab t={t} />}
      {tab === "Students" && <StudentsTab t={t} />}
      {tab === "Device" && <DeviceTab t={t} />}
      {tab === "Reports" && <ReportsTab t={t} />}
    </div>
  );
}

function toLocalDateParts(value) {
  if (!value) return { date: "", time: "" };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: "", time: "" };

  const pad = (n) => String(n).padStart(2, "0");
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
}

function formatSessionDateTime(value) {
  if (!value) return "TBA";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "TBA";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
function formatAgenda(agenda) {
  if (!agenda) return "";

  return agenda
    .split("\n")
    .flatMap((line) => {
      const trimmed = line.trim();

      if (!trimmed) return [];

      // Split * items into bulletins
      if (trimmed.includes("*")) {
        return trimmed
          .split("*")
          .map((item) => item.trim())
          .filter(Boolean)
          .map((item) => `• ${item}`);
      }

      return [trimmed];
    })
    .join("\n");
}

function buildSessionMessage(session) {
  return [
    `Session: ${session.title}`,
    `When: ${formatSessionDateTime(session.scheduledTime)}`,
    `Venue: ${session.venue || "TBA"}`,
    session.agenda ? `Agenda:\n${formatAgenda(session.agenda)}` : null,
    `Status: ${session.status}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildEmailLink(session, recipient) {
  const target = recipient || session.notificationTarget || "";
  const subject = encodeURIComponent(`Session confirmation: ${session.title}`);
  const body = encodeURIComponent(buildSessionMessage(session));
  return `mailto:${encodeURIComponent(target)}?subject=${subject}&body=${body}`;
}

function buildWhatsappText(session) {
  return buildSessionMessage(session);
}

function buildWhatsappLink(session, recipient) {
  const body = encodeURIComponent(buildWhatsappText(session));
  return `https://wa.me/?text=${body}`;
}

function SessionsTab({ t }) {
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    venue: "",
    agenda: "",
    notificationChannel: "EMAIL",
    notificationTarget: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSessions = async () => {
    try {
      const [sessionData, studentData] = await Promise.all([
        adminApi.getSessions(),
        adminApi.getStudents(),
      ]);

      setSessions(sessionData);
      setStudents(studentData);
      if (!activeId && sessionData.length) setActiveId(sessionData[0].id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (id) => {
    if (!id) return;
    const data = await adminApi.getSession(id);
    setDetail(data);
  };

  const resetForm = () => {
    setEditingSessionId(null);
    setForm({
      title: "",
      date: "",
      time: "",
      venue: "",
      agenda: "",
      notificationChannel: "EMAIL",
      notificationTarget: "",
    });
  };

  const loadSessionIntoForm = (selected) => {
    const { date, time } = toLocalDateParts(selected.scheduledTime);
    setEditingSessionId(selected.id);
    setForm({
      title: selected.title || "",
      date,
      time,
      venue: selected.venue || "",
      agenda: selected.agenda || "",
      notificationChannel: selected.notificationChannel || "EMAIL",
      notificationTarget: selected.notificationTarget || "",
    });
  };

  useEffect(() => {
    loadSessions();
  }, []);
  useEffect(() => {
    if (!activeId) return;

    loadDetail(activeId);

    const interval = setInterval(() => {
      loadDetail(activeId);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeId]);


  const session = detail;
  const attendanceRows = session
    ? students.map((student, index) => {
        const hit = session.logs?.find((log) => log.student.id === student.id);

        return {
          ...student,
          present: !!hit,
          time: hit?.scannedAt,
          isManual: hit?.isManual,
          rosterIndex: index,
        };
      })
    : [];

  const presentCount = session?.logs?.length || 0;
  const totalCount = students.length || 0;

  const getMissingSessionFields = () => {
    const missing = [];
    if (!form.title.trim()) missing.push("title");
    if (!form.date) missing.push("date");
    if (!form.time) missing.push("time");
    if (!form.venue.trim()) missing.push("venue");
    if (
      form.notificationChannel === "EMAIL" &&
      !form.notificationTarget.trim()
    ) {
      missing.push("email recipient");
    }
    return missing;
  };

  const showMissingSessionFields = (action) => {
    const missing = getMissingSessionFields();
    if (missing.length) {
      alert(`Can't ${action} session. Missing: ${missing.join(", ")}.`);
      return true;
    }
    return false;
  };

  const buildPayload = () => ({
    title: form.title,
    venue: form.venue,
    agenda: form.agenda,
    scheduledTime:
      form.date && form.time
        ? new Date(`${form.date}T${form.time}`).toISOString()
        : null,
    notificationChannel: form.notificationChannel,
    notificationTarget: form.notificationTarget,
  });

  const handleSave = async () => {
    const payload = buildPayload();

    if (showMissingSessionFields("save")) {
      return;
    }

    const created = await adminApi.createSession(payload);
    setActiveId(created.id);
    await loadSessions();
    await loadDetail(created.id);
    resetForm();
  };

  const handleUpdate = async () => {
    if (!editingSessionId) {
      alert(
        "Select a session to update, or click new session to create another one.",
      );
      return;
    }

    const payload = buildPayload();
    if (showMissingSessionFields("save")) {
      return;
    }

    await adminApi.updateSession(editingSessionId, payload);
    await loadSessions();
    await loadDetail(editingSessionId);
  };

  const handleCopyWhatsappText = async () => {
    const text = buildWhatsappText(session || buildPayload());
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      alert("WhatsApp text copied to clipboard.");
      return;
    }
    alert(text);
  };

  const handleSend = (sessionToSend, channel) => {
    if (channel === "EMAIL") {
      const recipient =
        form.notificationTarget ||
        sessionToSend.notificationTarget ||
        prompt("Enter email address");
      if (!recipient) return;

      const link = buildEmailLink(sessionToSend, recipient);
      window.open(link, "_blank", "noopener,noreferrer");
      return;
    }

    const text = buildWhatsappText(sessionToSend);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    window.open(
      buildWhatsappLink(sessionToSend),
      "_blank",
      "noopener,noreferrer",
    );
    alert(
      "WhatsApp text is ready. Use the opened share page or paste the copied message.",
    );
  };

  const handleStart = async () => {
    await adminApi.startSession(activeId);
    loadSessions();
    loadDetail(activeId);
  };

  const handleClose = async () => {
    await adminApi.closeSession(activeId);
    loadSessions();
    loadDetail(activeId);
  };

  const handleDelete = async () => {
    if (!session) return;
    if (
      !confirm(
        `delete session "${session.title}"? this will remove its attendance records too.`,
      )
    )
      return;

    await adminApi.deleteSession(session.id);
    setDetail(null);
    setActiveId(null);
    await loadSessions();
  };

  if (loading)
    return (
      <div style={{ fontFamily: "JetBrains Mono, monospace", opacity: 0.6 }}>
        loading sessions...
      </div>
    );
  if (error)
    return (
      <div
        style={{ fontFamily: "JetBrains Mono, monospace", color: "#FF5C5C" }}
      >
        {error}
      </div>
    );

  return (
    <div>
      <div className="admin-session-strip">
        {sessions.map((s) => (
          <div
            key={s.id}
            onClick={() => {
              setActiveId(s.id);
              loadSessionIntoForm(s);
            }}
            title={buildSessionMessage(s)}
            style={{
              border: `3px solid ${t.border}`,
              background: s.id === activeId ? t.accentSolid : t.panel,
              color: s.id === activeId ? "#fff" : t.ink,
              padding: "8px 14px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            <div>{s.title}</div>
            <div style={{ fontSize: "11px", opacity: 0.75, marginTop: "2px" }}>
              {formatSessionDateTime(s.scheduledTime)}
            </div>
            <div style={{ fontSize: "10px", opacity: 0.55, marginTop: "2px" }}>
              {s.status}
            </div>
          </div>
        ))}
      </div>

      <div className="admin-detail-card" style={{ marginBottom: "16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            marginBottom: "12px",
            flexWrap: "wrap",
          }}
        >
          <h2
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: "18px",
              margin: 0,
            }}
          >
            SCHEDULE SESSION
          </h2>
          <button
            className="brutal-btn"
            style={{
              background: t.accentSolid,
              color: "#fff",
              padding: "8px 16px",
              fontSize: "13px",
            }}
            onClick={handleSave}
          >
            CREATE SESSION
          </button>
        </div>
        <div className="admin-create-row" style={{ marginBottom: "12px" }}>
          <input
            className="brutal-input"
            placeholder="session title"
            value={form.title}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, title: e.target.value }))
            }
            style={{ flex: 1, minWidth: "180px" }}
          />
          <input
            className="brutal-input"
            type="date"
            value={form.date}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, date: e.target.value }))
            }
          />
          <input
            className="brutal-input"
            type="time"
            value={form.time}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, time: e.target.value }))
            }
          />
        </div>
        <div className="admin-create-row" style={{ marginBottom: "12px" }}>
          <input
            className="brutal-input"
            placeholder="venue"
            value={form.venue}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, venue: e.target.value }))
            }
            style={{ flex: 1, minWidth: "180px" }}
          />
          <input
            className="brutal-input"
            placeholder="agenda / note"
            value={form.agenda}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, agenda: e.target.value }))
            }
            style={{ flex: 1, minWidth: "180px" }}
          />
        </div>
        <div className="admin-create-row" style={{ marginBottom: "16px" }}>
          <select
            className="brutal-input"
            value={form.notificationChannel}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                notificationChannel: e.target.value,
              }))
            }
          >
            <option value="EMAIL">EMAIL</option>
            <option value="WHATSAPP">WHATSAPP</option>
          </select>
          {form.notificationChannel === "EMAIL" ? (
            <input
              className="brutal-input"
              placeholder="recipient email"
              value={form.notificationTarget}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  notificationTarget: e.target.value,
                }))
              }
              style={{ flex: 1, minWidth: "220px" }}
            />
          ) : (
            <button
              type="button"
              className="brutal-btn"
              style={{
                flex: 1,
                minWidth: "220px",
                background: t.panel,
                color: t.ink,
                padding: "8px 10px",
                fontSize: "12px",
              }}
              onClick={handleCopyWhatsappText}
            >
              COPY WHATSAPP TEXT
            </button>
          )}
        </div>
        <div className="admin-session-actions" style={{ marginBottom: 0 }}>
          {editingSessionId && (
            <button
              className="brutal-btn"
              style={{
                background: t.ink,
                color: t.bg,
                padding: "8px 16px",
                fontSize: "13px",
              }}
              onClick={handleUpdate}
            >
              UPDATE SESSION
            </button>
          )}
        </div>
      </div>

      {!session ? (
        <div style={{ fontFamily: "JetBrains Mono, monospace", opacity: 0.6 }}>
          no sessions yet - create one above
        </div>
      ) : (
        <div className="admin-detail-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <h2
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "20px",
                margin: 0,
              }}
            >
              {session.title}
            </h2>
            <div
              style={{
                background: session.status === "CLOSED" ? t.ink : t.accentSolid,
                color: session.status === "CLOSED" ? t.bg : "#fff",
                border: `3px solid ${t.border}`,
                padding: "5px 14px",
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: 700,
                fontSize: "12px",
              }}
            >
              {session.status}
            </div>
          </div>

          <div className="admin-session-actions">
            {session.status === "SCHEDULED" && (
              <button
                className="brutal-btn"
                style={{
                  background: t.accentSolid,
                  color: "#fff",
                  padding: "9px 16px",
                  fontSize: "13px",
                }}
                onClick={handleStart}
              >
                ▶ START SESSION
              </button>
            )}
            {session.status === "ACTIVE" && (
              <button
                className="brutal-btn"
                style={{
                  background: t.ink,
                  color: t.bg,
                  padding: "9px 16px",
                  fontSize: "13px",
                }}
                onClick={handleClose}
              >
                ■ END SESSION
              </button>
            )}
            <button
              className="brutal-btn"
              style={{
                background: "#FF5C5C",
                color: "#fff",
                padding: "9px 16px",
                fontSize: "13px",
              }}
              onClick={handleDelete}
            >
              DELETE SESSION
            </button>
          </div>

          <div
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "12px",
              color: t.mutedText,
              marginBottom: "10px",
            }}
          >
            {session.logs?.length || 0} present
          </div>

          <div
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "12px",
              whiteSpace: "pre-wrap",
              lineHeight: 1.5,
              marginBottom: "12px",
            }}
          >
            {buildSessionMessage(session)}
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              alignItems: "center",
              marginBottom: "14px",
            }}
          >
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "11px",
                border: `2px solid ${t.border}`,
                background: t.muted,
                padding: "5px 8px",
              }}
            >
              attendance: {presentCount}/{totalCount}
            </div>
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "11px",
                border: `2px solid ${t.border}`,
                background: t.muted,
                padding: "5px 8px",
              }}
            >
              present: {presentCount}
            </div>
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "11px",
                border: `2px solid ${t.border}`,
                background: t.muted,
                padding: "5px 8px",
              }}
            >
              absent: {Math.max(totalCount - presentCount, 0)}
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <div
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "15px",
                fontWeight: 700,
                marginBottom: "10px",
              }}
            >
              ATTENDANCE
            </div>
            <div className="admin-roster-grid">
              {attendanceRows.map((student) => (
                <div
                  key={student.id}
                  className="admin-roster-card"
                  style={{
                    background: student.present ? t.muted : t.panel,
                    opacity: student.present ? 1 : 0.6,
                    borderColor: student.present ? "#86EFAC" : t.border,
                    boxShadow: student.present
                      ? `4px 4px 0 #05b445`
                      : `4px 4px 0 ${t.border}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "8px",
                      alignItems: "center",
                      marginBottom: "6px",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "Space Grotesk, sans-serif",
                        fontWeight: 700,
                        fontSize: "14px",
                      }}
                    >
                      {student.name}
                    </div>
                    <div
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: "10px",
                        fontWeight: 700,
                        color: student.present ? t.accentSolid : t.mutedText,
                      }}
                    >
                      {student.present ? "PRESENT" : "ABSENT"}
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "10px",
                      color: t.mutedText,
                    }}
                  >
                    {student.rfidUid}
                    {student.present && student.time
                      ? ` · ${new Date(student.time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}${student.isManual ? " · manual" : ""}`
                      : " · not marked"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {session.status === "CONFIRMED" && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <button
                className="brutal-btn"
                style={{
                  background: t.ink,
                  color: t.bg,
                  padding: "8px 14px",
                  fontSize: "12px",
                }}
                onClick={() => handleSend(session, "EMAIL")}
              >
                SEND EMAIL
              </button>
              <button
                className="brutal-btn"
                style={{
                  background: t.cyan,
                  color: "#0B0F19",
                  padding: "8px 14px",
                  fontSize: "12px",
                }}
                onClick={() => handleSend(session, "WHATSAPP")}
              >
                SEND WHATSAPP
              </button>
              <button
                className="brutal-btn"
                style={{
                  background: t.panel,
                  color: t.ink,
                  padding: "8px 14px",
                  fontSize: "12px",
                }}
                onClick={handleCopyWhatsappText}
              >
                COPY WHATSAPP TEXT
              </button>
            </div>
          )}

          {/* <div className="admin-roster-grid">
            {session.logs?.map((log) => (
              <div
                key={log.id}
                className="admin-roster-card"
                style={{ background: t.muted, padding: "10px" }}
              >
                <div
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    fontWeight: 700,
                    fontSize: "14px",
                  }}
                >
                  {log.student.name}
                </div>
                <div
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "10px",
                    color: t.mutedText,
                  }}
                >
                  {log.student.rfidUid} ·{" "}
                  {new Date(log.scannedAt).toLocaleTimeString()}
                  {log.isManual && " · manual"}
                </div>
              </div>
            ))}
          </div> */}
        </div>
      )}
    </div>
  );
}

function StudentsTab({ t }) {
  const [activeTab, setActiveTab] = useState("roster");
  const [pending, setPending] = useState([]);
  const [roster, setRoster] = useState([]);
  const [archived, setArchived] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [rosterSearch, setRosterSearch] = useState("");
  const [rosterTeamFilter, setRosterTeamFilter] = useState("");
  const [rosterRoleFilter, setRosterRoleFilter] = useState("");
  const [archivedSearch, setArchivedSearch] = useState("");
  const [pendingSearchTerms, setPendingSearchTerms] = useState({});

  // Forms & State
  const [approveForm, setApproveForm] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [approvingId, setApprovingId] = useState(null);
  const [statusNotice, setStatusNotice] = useState(null);
  const [addForm, setAddForm] = useState({
    name: "",
    role: "",
    team: "",
    rfidUid: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const [p, r, a] = await Promise.all([
        adminApi.getPendingStudents(),
        adminApi.getStudents(),
        adminApi.getArchivedStudents
          ? adminApi.getArchivedStudents()
          : adminApi.getArchived
          ? adminApi.getArchived()
          : [],
      ]);
      setPending(p || []);
      setRoster(r || []);
      setArchived(a || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const showToast = (msg) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 4000);
  };

  // Safe fallback arrays for option datalists
  const teamsList = typeof TEAM_OPTIONS !== "undefined" ? TEAM_OPTIONS : Array.from(new Set(roster.map(s => s.team).filter(Boolean)));
  const rolesList = typeof ROLE_OPTIONS !== "undefined" ? ROLE_OPTIONS : Array.from(new Set(roster.map(s => s.role).filter(Boolean)));

  // --- Handlers ---
  const handleApprove = async (id) => {
    if (approvingId) return;
    const selectedStudentId = approveForm[id]?.studentId;

    if (!selectedStudentId) {
      alert("Select a roster member to link this registration to");
      return;
    }

    setApprovingId(id);
    try {
      await adminApi.approveStudent(id, selectedStudentId);
      load();
    } catch (err) {
      alert(err.message || "Approval failed");
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (id, name) => {
    if (!confirm(`Reject ${name}? This will remove the pending request completely.`))
      return;
    try {
      await adminApi.rejectStudent(id);
      load();
    } catch (err) {
      alert(err.message || "Rejection failed");
    }
  };

  const handleAddStudent = async () => {
    if (!addForm.name || !addForm.role || !addForm.team || !addForm.rfidUid) {
      alert("Please fill all fields");
      return;
    }
    try {
      await adminApi.createStudent(addForm);
      setAddForm({ name: "", role: "", team: "", rfidUid: "" });
      setShowAddForm(false);
      load();
    } catch (err) {
      alert(err.message || "Failed to add student");
    }
  };

  const startEdit = (s) => {
    setEditingId(s.id);
    setEditForm({
      name: s.name,
      role: s.role || "",
      team: s.team || "",
      rfidUid: s.rfidUid || "",
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      await adminApi.updateStudent(id, editForm);
      setEditingId(null);
      load();
    } catch (err) {
      alert(err.message || "Update failed");
    }
  };

  const handleDeleteStudent = async (id, name) => {
    if (!confirm(`Deactivate/Delete ${name}?`)) return;
    try {
      const res = await adminApi.deleteStudent(id);
      if (res && res.action === "deleted") {
        showToast("Student permanently deleted");
      } else if (res && res.action === "archived") {
        showToast("Student archived because attendance history exists.");
      } else {
        showToast(`Updated ${name}`);
      }
      load();
    } catch (err) {
      alert(err.message || "Delete failed");
    }
  };

  const handleToggleAdmin = async (student) => {
    try {
      if (student.isAdmin) {
        await adminApi.revokeStudentAdmin(student.id);
        showToast(`${student.name} lost admin access.`);
      } else {
        await adminApi.grantStudentAdmin(student.id);
        showToast(`${student.name} now has admin access.`);
      }
      load();
    } catch (err) {
      alert(err.message || "Failed to update admin access");
    }
  };

  const handleRestoreArchived = async (id) => {
    try {
      await adminApi.restoreStudent(id);
      showToast("Student restored to active roster.");
      load();
    } catch (err) {
      alert(err.message || "Restore failed");
    }
  };

  const handleDeleteArchived = async (id, name) => {
    if (!confirm(`Permanently delete ${name}? This action cannot be undone.`))
      return;
    try {
      if (adminApi.deleteArchivedStudent) {
        await adminApi.deleteArchivedStudent(id);
      } else if (adminApi.deleteArchived) {
        await adminApi.deleteArchived(id);
      }
      showToast("Student permanently deleted.");
      load();
    } catch (err) {
      alert(err.message || "Permanent delete failed");
    }
  };

  // --- Filtering Logic ---
  const filteredRoster = roster.filter((student) => {
    const q = rosterSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      student.name?.toLowerCase().includes(q) ||
      student.role?.toLowerCase().includes(q) ||
      student.team?.toLowerCase().includes(q);
    const matchesTeam = !rosterTeamFilter || student.team === rosterTeamFilter;
    const matchesRole = !rosterRoleFilter || student.role === rosterRoleFilter;
    return matchesSearch && matchesTeam && matchesRole;
  });

  const filteredArchived = archived.filter((student) => {
    const q = archivedSearch.toLowerCase().trim();
    return (
      !q ||
      student.name?.toLowerCase().includes(q) ||
      student.role?.toLowerCase().includes(q) ||
      student.team?.toLowerCase().includes(q)
    );
  });

  const getPendingRosterSuggestions = (pendingId) => {
    const q = (pendingSearchTerms[pendingId] || "").toLowerCase().trim();
    return roster.filter((student) => {
      if (student.isActive === false) return false;
      if (student.username) return false; // Already linked to an account
      if (!q) return true;
      return (
        student.name?.toLowerCase().includes(q) ||
        student.role?.toLowerCase().includes(q) ||
        student.team?.toLowerCase().includes(q)
      );
    });
  };

  if (loading) {
    return (
      <div
        style={{
          fontFamily: "JetBrains Mono, monospace",
          padding: "20px",
          opacity: 0.6,
        }}
      >
        loading...
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Space Grotesk, sans-serif" }}>
      <datalist id="team-options">
        {teamsList.map((team) => (
          <option key={team} value={team} />
        ))}
      </datalist>
      <datalist id="role-options">
        {rolesList.map((role) => (
          <option key={role} value={role} />
        ))}
      </datalist>

      {/* Notification Toast */}
      {statusNotice && (
        <div
          style={{
            marginBottom: "16px",
            padding: "10px 14px",
            background: t.cyan || "#00E5FF",
            color: "#000",
            border: `2px solid ${t.border || "#000"}`,
            boxShadow: "3px 3px 0 #000",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          {statusNotice}
        </div>
      )}

      {/* Tab Header Navigation */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          borderBottom: `3px solid ${t.border || "#000"}`,
          paddingBottom: "10px",
          marginBottom: "24px",
          overflowX: "auto",
        }}
      >
        {[
          { id: "roster", label: "Current Roster", count: roster.length },
          { id: "pending", label: "Pending Approvals", count: pending.length },
          { id: "archived", label: "Archived", count: archived.length },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="brutal-btn"
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: 700,
                fontSize: "13px",
                padding: "8px 16px",
                cursor: "pointer",
                background: isActive ? t.cyan || "#00E5FF" : t.panel || "#fff",
                color: isActive ? "#000" : t.ink || "#000",
                border: `2px solid ${t.border || "#000"}`,
                boxShadow: isActive ? "3px 3px 0 #000" : "2px 2px 0 #000",
                transition: "all 0.15s ease",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                whiteSpace: "nowrap",
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "11px",
                  background: isActive ? "#000" : t.muted || "#eee",
                  color: isActive ? "#fff" : t.ink || "#000",
                  padding: "2px 6px",
                  borderRadius: "3px",
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: CURRENT ROSTER ================= */}
      {activeTab === "roster" && (
        <div>
          {/* Toolbar */}
          <div
style={{
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  justifyContent: "space-between", // 👈 Fixed CSS camelCase property
  alignItems: "center",
  marginBottom: "16px",
}}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                flex: 1,
              }}
            >
              <input
                className="brutal-input"
                placeholder="search by name, role, team..."
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                style={{ minWidth: "200px", flex: 1 }}
              />
              <select
                className="brutal-input"
                value={rosterTeamFilter}
                onChange={(e) => setRosterTeamFilter(e.target.value)}
                style={{
                  padding: "8px",
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "12px",
                }}
              >
                <option value="">All Teams</option>
                {teamsList.map((tm) => (
                  <option key={tm} value={tm}>
                    {tm}
                  </option>
                ))}
              </select>
              <select
                className="brutal-input"
                value={rosterRoleFilter}
                onChange={(e) => setRosterRoleFilter(e.target.value)}
                style={{
                  padding: "8px",
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "12px",
                }}
              >
                <option value="">All Roles</option>
                {rolesList.map((rl) => (
                  <option key={rl} value={rl}>
                    {rl}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="brutal-btn"
              style={{
                background: t.cyan || "#00E5FF",
                color: "#0B0F19",
                padding: "8px 16px",
                fontWeight: 700,
                fontSize: "12px",
                boxShadow: "3px 3px 0 #000",
              }}
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? "CANCEL" : "+ ADD STUDENT"}
            </button>
          </div>

          {/* Add Student Form Card */}
          {showAddForm && (
            <div
              style={{
                border: `3px solid ${t.border || "#000"}`,
                background: t.panel || "#fff",
                padding: "16px",
                marginBottom: "20px",
                boxShadow: "4px 4px 0 #000",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  marginBottom: "12px",
                  fontSize: "14px",
                }}
              >
                ADD NEW STUDENT
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  alignItems: "center",
                }}
              >
                <input
                  className="brutal-input"
                  placeholder="name"
                  style={{ width: "160px" }}
                  value={addForm.name}
                  onChange={(e) =>
                    setAddForm({ ...addForm, name: e.target.value })
                  }
                />
                <input
                  className="brutal-input"
                  placeholder="role"
                  list="role-options"
                  autoComplete="off"
                  style={{ width: "140px" }}
                  value={addForm.role}
                  onChange={(e) =>
                    setAddForm({ ...addForm, role: e.target.value })
                  }
                />
                <input
                  className="brutal-input"
                  placeholder="team"
                  list="team-options"
                  autoComplete="off"
                  style={{ width: "130px" }}
                  value={addForm.team}
                  onChange={(e) =>
                    setAddForm({ ...addForm, team: e.target.value })
                  }
                />
                <input
                  className="brutal-input"
                  placeholder="RFID Card ID"
                  style={{ width: "150px" }}
                  value={addForm.rfidUid}
                  onChange={(e) =>
                    setAddForm({ ...addForm, rfidUid: e.target.value })
                  }
                />
                {typeof CaptureButton !== "undefined" && (
                  <CaptureButton
                    t={t}
                    onCaptured={(uid) =>
                      setAddForm((f) => ({ ...f, rfidUid: uid }))
                    }
                  />
                )}
                <button
                  className="brutal-btn"
                  style={{
                    background: "#22C55E",
                    color: "#fff",
                    padding: "8px 16px",
                    fontWeight: 700,
                    fontSize: "12px",
                    boxShadow: "2px 2px 0 #000",
                  }}
                  onClick={handleAddStudent}
                >
                  SAVE
                </button>
              </div>
            </div>
          )}

          {/* Roster Cards Grid */}
          {filteredRoster.length === 0 ? (
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "13px",
                opacity: 0.6,
                padding: "24px",
                textAlign: "center",
                border: `2px dashed ${t.border || "#000"}`,
              }}
            >
              No matching students.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "16px",
              }}
            >
              {filteredRoster.map((s) => {
                const isEditing = editingId === s.id;

                return (
                  <div
                    key={s.id}
                    style={{
                      background: t.muted || "#f8f9fa",
                      border: `2px solid ${t.border || "#000"}`,
                      padding: "14px",
                      boxShadow: "3px 3px 0 #000",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      position: "relative",
                      transition: "transform 0.15s ease",
                    }}
                  >
                    {isEditing ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        <input
                          className="brutal-input"
                          placeholder="Name"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                        />
                        <input
                          className="brutal-input"
                          placeholder="Role"
                          list="role-options"
                          value={editForm.role}
                          onChange={(e) =>
                            setEditForm({ ...editForm, role: e.target.value })
                          }
                        />
                        <input
                          className="brutal-input"
                          placeholder="Team"
                          list="team-options"
                          value={editForm.team}
                          onChange={(e) =>
                            setEditForm({ ...editForm, team: e.target.value })
                          }
                        />
                        <input
                          className="brutal-input"
                          placeholder="RFID UID"
                          value={editForm.rfidUid}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              rfidUid: e.target.value,
                            })
                          }
                        />
                        {typeof CaptureButton !== "undefined" && (
                          <CaptureButton
                            t={t}
                            onCaptured={(uid) =>
                              setEditForm((f) => ({ ...f, rfidUid: uid }))
                            }
                          />
                        )}
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            marginTop: "6px",
                          }}
                        >
                          <button
                            className="brutal-btn"
                            style={{
                              background: "#3B82F6",
                              color: "#fff",
                              padding: "6px 12px",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                            onClick={() => handleSaveEdit(s.id)}
                          >
                            SAVE
                          </button>
                          <button
                            className="brutal-btn"
                            style={{
                              background: "#6B7280",
                              color: "#fff",
                              padding: "6px 12px",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                            onClick={() => setEditingId(null)}
                          >
                            CANCEL
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              marginBottom: "6px",
                            }}
                          >
                            <div
                              style={{
                                fontWeight: 700,
                                fontSize: "15px",
                                wordBreak: "break-word",
                              }}
                            >
                              {s.name}
                            </div>
                            <span
                              style={{
                                fontFamily: "JetBrains Mono, monospace",
                                fontSize: "9px",
                                fontWeight: 700,
                                padding: "2px 6px",
                                background: "#22C55E",
                                color: "#fff",
                                border: "1px solid #000",
                                textTransform: "uppercase",
                              }}
                            >
                              Active
                            </span>
                          </div>

                          <div
                            style={{
                              fontFamily: "JetBrains Mono, monospace",
                              fontSize: "11px",
                              color: t.mutedText || "#666",
                              marginBottom: "8px",
                            }}
                          >
                            {s.role || "—"} • {s.team || "—"}
                          </div>

                          <div
                            style={{
                              fontFamily: "JetBrains Mono, monospace",
                              fontSize: "10px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "3px",
                              marginBottom: "12px",
                            }}
                          >
                            <div>
                              <span style={{ opacity: 0.6 }}>RFID: </span>
                              <strong>{s.rfidUid || "Not assigned"}</strong>
                            </div>
                            <div>
                              {s.username ? (
                                <span
                                  style={{
                                    color: "#15803D",
                                    fontWeight: 700,
                                  }}
                                >
                                  Login Linked ✓ ({s.username})
                                </span>
                              ) : (
                                <span style={{ opacity: 0.6 }}>
                                  No Login Linked
                                </span>
                              )}
                            </div>
                            <div>
                              <span
                                style={{
                                  color: s.isAdmin ? "#15803D" : "#6B7280",
                                  fontWeight: 700,
                                }}
                              >
                                {s.isAdmin ? "Admin Access Enabled" : "Standard Member"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            borderTop: `1px solid ${t.border || "#000"}`,
                            paddingTop: "10px",
                            marginTop: "6px",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            className="brutal-btn"
                            style={{
                              background: "#3B82F6",
                              color: "#fff",
                              padding: "5px 10px",
                              fontSize: "11px",
                              fontWeight: 700,
                              flex: 1,
                              minWidth: "80px",
                            }}
                            onClick={() => startEdit(s)}
                          >
                            Edit
                          </button>
                          <button
                            className="brutal-btn"
                            style={{
                              background: s.isAdmin ? "#6B7280" : "#10B981",
                              color: "#fff",
                              padding: "5px 10px",
                              fontSize: "11px",
                              fontWeight: 700,
                              flex: 1,
                              minWidth: "104px",
                            }}
                            onClick={() => handleToggleAdmin(s)}
                          >
                            {s.isAdmin ? "Revoke Admin" : "Grant Admin"}
                          </button>
                          <button
                            className="brutal-btn"
                            style={{
                              background: "#EF4444",
                              color: "#fff",
                              padding: "5px 10px",
                              fontSize: "11px",
                              fontWeight: 700,
                              flex: 1,
                              minWidth: "80px",
                            }}
                            onClick={() => handleDeleteStudent(s.id, s.name)}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: PENDING APPROVALS ================= */}
      {activeTab === "pending" && (
        <div>
          {pending.length === 0 ? (
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "13px",
                opacity: 0.7,
                padding: "32px",
                textAlign: "center",
                border: `2px dashed ${t.border || "#000"}`,
                background: t.panel || "#fff",
              }}
            >
              ✔ Everything is approved.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "18px",
              }}
            >
              {pending.map((s) => {
                const searchVal = pendingSearchTerms[s.id] || "";
                const suggestions = getPendingRosterSuggestions(s.id);
                const selectedStudentId = approveForm[s.id]?.studentId;
                const selectedStudentName = approveForm[s.id]?.selectedName;

                return (
                  <div
                    key={s.id}
                    style={{
                      border: `2px solid ${t.border || "#000"}`,
                      background: t.panel || "#fff",
                      padding: "16px",
                      boxShadow: "4px 4px 0 #000",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: "16px",
                          marginBottom: "4px",
                        }}
                      >
                        {s.name}
                      </div>
                      <div
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: "11px",
                          opacity: 0.7,
                          marginBottom: "4px",
                        }}
                      >
                        {s.username || "No Email"}
                      </div>
                      <div
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: "10px",
                          opacity: 0.5,
                          marginBottom: "14px",
                        }}
                      >
                        Requested:{" "}
                        {s.createdAt
                          ? new Date(s.createdAt).toLocaleDateString()
                          : "Recently"}
                      </div>

                      {/* Command Palette / Roster Search Linker */}
                      <div
                        style={{
                          border: `2px solid ${t.border || "#000"}`,
                          padding: "10px",
                          background: t.muted || "#f8f9fa",
                          marginBottom: "14px",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "JetBrains Mono, monospace",
                            fontSize: "10px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            marginBottom: "6px",
                          }}
                        >
                          Link to Active Roster Member:
                        </div>

                        {selectedStudentId ? (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              background: t.cyan || "#00E5FF",
                              color: "#000",
                              padding: "6px 10px",
                              border: "1px solid #000",
                              fontWeight: 700,
                              fontSize: "12px",
                            }}
                          >
                            <span>Selected: {selectedStudentName}</span>
                            <button
                              onClick={() =>
                                setApproveForm((prev) => ({
                                  ...prev,
                                  [s.id]: null,
                                }))
                              }
                              style={{
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                fontWeight: 700,
                                fontSize: "14px",
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div>
                            <input
                              className="brutal-input"
                              placeholder="Search roster (e.g. Ben)..."
                              value={searchVal}
                              onChange={(e) =>
                                setPendingSearchTerms((prev) => ({
                                  ...prev,
                                  [s.id]: e.target.value,
                                }))
                              }
                              style={{ width: "100%", marginBottom: "6px" }}
                            />

                            {/* Suggestions Palette */}
                            <div
                              style={{
                                maxHeight: "140px",
                                overflowY: "auto",
                                border: `1px solid ${t.border || "#000"}`,
                                background: "#fff",
                              }}
                            >
                              {suggestions.length === 0 ? (
                                <div
                                  style={{
                                    padding: "8px",
                                    fontSize: "11px",
                                    opacity: 0.5,
                                    fontFamily: "JetBrains Mono, monospace",
                                  }}
                                >
                                  No unlinked roster members match
                                </div>
                              ) : (
                                suggestions.map((st) => (
                                  <div
                                    key={st.id}
                                    onClick={() =>
                                      setApproveForm((prev) => ({
                                        ...prev,
                                        [s.id]: {
                                          studentId: st.id,
                                          selectedName: st.name,
                                        },
                                      }))
                                    }
                                    style={{
                                      padding: "6px 8px",
                                      fontSize: "12px",
                                      cursor: "pointer",
                                      borderBottom: "1px solid #eee",
                                      display: "flex",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <span style={{ fontWeight: 700 }}>
                                      {st.name}
                                    </span>
                                    <span
                                      style={{
                                        fontFamily:
                                          "JetBrains Mono, monospace",
                                        fontSize: "10px",
                                        opacity: 0.6,
                                      }}
                                    >
                                      {st.role || "Member"} • {st.team || "-"}
                                    </span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        className="brutal-btn"
                        style={{
                          background: "#22C55E",
                          color: "#fff",
                          padding: "8px 14px",
                          fontWeight: 700,
                          fontSize: "12px",
                          flex: 1,
                        }}
                        onClick={() => handleApprove(s.id)}
                      >
                        Approve
                      </button>
                      <button
                        className="brutal-btn"
                        style={{
                          background: "#EF4444",
                          color: "#fff",
                          padding: "8px 14px",
                          fontWeight: 700,
                          fontSize: "12px",
                          flex: 1,
                        }}
                        onClick={() => handleReject(s.id, s.name)}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: ARCHIVED ================= */}
      {activeTab === "archived" && (
        <div>
          <div style={{ marginBottom: "16px" }}>
            <input
              className="brutal-input"
              placeholder="search archived members..."
              value={archivedSearch}
              onChange={(e) => setArchivedSearch(e.target.value)}
              style={{ width: "100%", maxWidth: "400px" }}
            />
          </div>

          {filteredArchived.length === 0 ? (
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "13px",
                opacity: 0.6,
                padding: "32px",
                textAlign: "center",
                border: `2px dashed ${t.border || "#000"}`,
              }}
            >
              No archived members.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "16px",
              }}
            >
              {filteredArchived.map((s) => (
                <div
                  key={s.id}
                  style={{
                    background: t.muted || "#f8f9fa",
                    border: `2px solid ${t.border || "#000"}`,
                    padding: "14px",
                    boxShadow: "3px 3px 0 #000",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "6px",
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: "15px" }}>
                        {s.name}
                      </div>
                      <span
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: "9px",
                          fontWeight: 700,
                          padding: "2px 6px",
                          background: "#6B7280",
                          color: "#fff",
                          border: "1px solid #000",
                          textTransform: "uppercase",
                        }}
                      >
                        Archived
                      </span>
                    </div>

                    <div
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: "11px",
                        color: t.mutedText || "#666",
                        marginBottom: "12px",
                      }}
                    >
                      {s.role || "—"} • {s.team || "—"}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      borderTop: `1px solid ${t.border || "#000"}`,
                      paddingTop: "10px",
                    }}
                  >
                    <button
                      className="brutal-btn"
                      style={{
                        background: "#22C55E",
                        color: "#fff",
                        padding: "5px 10px",
                        fontSize: "11px",
                        fontWeight: 700,
                        flex: 1,
                      }}
                      onClick={() => handleRestoreArchived(s.id)}
                    >
                      Restore
                    </button>
                    <button
                      className="brutal-btn"
                      style={{
                        background: "#EF4444",
                        color: "#fff",
                        padding: "5px 10px",
                        fontSize: "11px",
                        fontWeight: 700,
                        flex: 1,
                      }}
                      onClick={() => handleDeleteArchived(s.id, s.name)}
                    >
                      Delete Permanently
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
function DeviceTab({ t }) {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  const handleSend = async () => {
    if (!ssid || !password) return;
    try {
      const res = await adminApi.sendWifi(ssid, password);
      setStatus(`sent: ${res.sent}`);
    } catch (err) {
      setStatus(`error: ${err.message}`);
    }
  };

  return (
    <div className="admin-device-card">
      <h2
        style={{
          fontFamily: "Space Grotesk, sans-serif",
          fontSize: "18px",
          marginBottom: "4px",
        }}
      >
        DEVICE WIFI SETUP
      </h2>
      <div
        style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "11px",
          color: t.mutedText,
          marginBottom: "18px",
        }}
      >
        pushes credentials to esp32 via mqtt command topic
      </div>

      <label
        style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "11px",
          opacity: 0.6,
        }}
      >
        SSID
      </label>
      <input
        className="brutal-input"
        style={{ width: "100%", marginTop: "4px", marginBottom: "14px" }}
        value={ssid}
        onChange={(e) => setSsid(e.target.value)}
      />

      <label
        style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "11px",
          opacity: 0.6,
        }}
      >
        PASSWORD
      </label>
      <input
        className="brutal-input"
        type="password"
        style={{ width: "100%", marginTop: "4px", marginBottom: "18px" }}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        className="brutal-btn"
        style={{
          background: t.accentSolid,
          color: "#fff",
          padding: "10px 18px",
          fontSize: "13px",
          width: "100%",
        }}
        onClick={handleSend}
      >
        PUSH TO DEVICE
      </button>

      {status && (
        <div
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "11px",
            color: t.cyan,
            marginTop: "14px",
            wordBreak: "break-all",
          }}
        >
          {status}
        </div>
      )}
    </div>
  );
}
function CaptureButton({ t, onCaptured }) {
  const [capturing, setCapturing] = useState(false);
  const [msg, setMsg] = useState("");

  const handleClick = async () => {
    setCapturing(true);
    setMsg("waiting for tap...");
    try {
      const uid = await adminApi.captureCard();
      onCaptured(uid);
      setMsg("captured!");
    } catch (err) {
      setMsg(err.message);
    } finally {
      setCapturing(false);
      setTimeout(() => setMsg(""), 2000);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <button
        type="button"
        className="brutal-btn icon-btn"
        style={{
          background: t.cyan,
          color: "#0B0F19",
          fontSize: "11px",
        }}
        onClick={handleClick}
        disabled={capturing}
      >
        {capturing ? "..." : "📇"}
      </button>

      {msg && (
        <span
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "10px",
            color: t.mutedText,
          }}
        >
          {msg}
        </span>
      )}
    </div>
  );
}
function ReportsTab({ t }) {
  const [sessions, setSessions] = useState([]);
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [s, students] = await Promise.all([
        adminApi.getSessions(),
        adminApi.getStudents(),
      ]);
      setSessions(s);
      setStudentCount(students.filter((x) => x.isApproved).length);
      setLoading(false);
    })();
  }, []);

  if (loading)
    return (
      <div style={{ fontFamily: "JetBrains Mono, monospace", opacity: 0.6 }}>
        loading...
      </div>
    );

  return (
    <div>
      <h2
        style={{
          fontFamily: "Space Grotesk, sans-serif",
          fontSize: "18px",
          marginBottom: "14px",
        }}
      >
        SESSION REPORTS
      </h2>
      {sessions.length === 0 ? (
        <div
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "13px",
            opacity: 0.5,
          }}
        >
          no sessions yet
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {sessions.map((s) => {
            const present = s.logs?.length || 0;
            const pct = studentCount
              ? Math.round((present / studentCount) * 100)
              : 0;
            return (
              <div
                key={s.id}
                style={{
                  border: `2px solid ${t.border}`,
                  background: t.muted,
                  padding: "14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "Space Grotesk, sans-serif",
                      fontWeight: 700,
                      fontSize: "15px",
                    }}
                  >
                    {s.title}
                  </div>
                  <div
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "11px",
                      color: t.mutedText,
                    }}
                  >
                    {s.status} · {present}/{studentCount} present ({pct}%)
                  </div>
                </div>
                <button
                  className="brutal-btn"
                  style={{
                    background: t.cyan,
                    color: "#0B0F19",
                    padding: "7px 14px",
                    fontSize: "12px",
                  }}
                  onClick={() =>
                    adminApi.downloadSessionCsv(
                      s.id,
                      `${s.title}-attendance.csv`,
                    )
                  }
                >
                  ⬇ EXPORT CSV
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
