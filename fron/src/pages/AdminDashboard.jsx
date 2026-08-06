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
  const [mode, setMode] = useState("dark");
  const t = THEMES[mode];

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

function buildSessionMessage(session) {
  return [
    `Session: ${session.title}`,
    `When: ${formatSessionDateTime(session.scheduledTime)}`,
    `Venue: ${session.venue || "TBA"}`,
    session.agenda ? `Agenda: ${session.agenda}` : null,
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
      const data = await adminApi.getSessions();
      setSessions(data);
      if (!activeId && data.length) setActiveId(data[0].id);
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
    loadDetail(activeId);
  }, [activeId]);

  const session = detail;

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

          <div className="admin-roster-grid">
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
          </div>
        </div>
      )}
    </div>
  );
}

function StudentsTab({ t }) {
  const [pending, setPending] = useState([]);
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approveForm, setApproveForm] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
const [editForm, setEditForm] = useState({});
const [approvingId, setApprovingId] = useState(null);
  const [addForm, setAddForm] = useState({
    name: "",
    role: "",
    team: "",
    rfidUid: "",
  });

  const load = async () => {
    setLoading(true);
    const [p, r] = await Promise.all([
      adminApi.getPendingStudents(),
      adminApi.getStudents(),
    ]);
    setPending(p);
    setRoster(r);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const rosterCandidates = roster.filter((student) => student.isApproved);

  const updateForm = (id, field, value) => {
    setApproveForm((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };


const handleApprove = async (id) => {
  if (approvingId) return; // block if any approve is already in flight
  const data = approveForm[id] || {};

  if (!data.connectStudentId && (!data.role || !data.team || !data.rfidUid)) {
    alert("fill role, team, and rfid card ID before approving");
    return;
  }

  setApprovingId(id);
  try {
    await adminApi.approveStudent(id, data);
    load();
  } catch (err) {
    alert(err.message);
  } finally {
    setApprovingId(null);
  }
};

  const handleReject = async (id, name) => {
    if (!confirm(`reject ${name}? this will remove the pending request.`))
      return;
    await adminApi.rejectStudent(id);
    load();
  };

  const findMatchingRosterStudent = (pendingStudent) => {
    const normalizedName = pendingStudent.name.trim().toLowerCase();
    return (
      rosterCandidates.find(
        (student) => student.name.trim().toLowerCase() === normalizedName,
      )?.id || ""
    );
  };

const labelForStudent = (student) => {
  const label = student.username ? ` · ${student.username}` : " · no login yet";
  return `${student.name}${label}`;
};

  const handleAddStudent = async () => {
    if (!addForm.name || !addForm.role || !addForm.team || !addForm.rfidUid) {
      alert("fill all fields");
      return;
    }
    try {
      await adminApi.createStudent(addForm);
      setAddForm({ name: "", role: "", team: "", rfidUid: "" });
      setShowAddForm(false);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const startEdit = (s) => {
  setEditingId(s.id);
  setEditForm({ name: s.name, role: s.role || "", team: s.team || "", rfidUid: s.rfidUid || "" });
};

const handleReactivate = async (id) => {
  try {
    await adminApi.updateStudent(id, { isActive: true });
    load();
  } catch (err) {
    alert(err.message);
  }
};

const handleSaveEdit = async (id) => {
  try {
    await adminApi.updateStudent(id, editForm);
    setEditingId(null);
    load();
  } catch (err) {
    alert(err.message);
  }
};
const handleDelete = async (id, name) => {
  if (!confirm(`deactivate ${name}? they'll be hidden from active roster but attendance history stays intact.`)) return;
  await adminApi.deleteStudent(id);
  load();
};

  if (loading)
    return (
      <div style={{ fontFamily: "JetBrains Mono, monospace", opacity: 0.6 }}>
        loading...
      </div>
    );

  return (
    <div>
      <datalist id="team-options">
        {TEAM_OPTIONS.map((team) => (
          <option key={team} value={team} />
        ))}
      </datalist>
      <datalist id="role-options">
        {ROLE_OPTIONS.map((role) => (
          <option key={role} value={role} />
        ))}
      </datalist>

      {/* pending approvals */}
      <div style={{ marginBottom: "28px" }}>
        <h2
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: "18px",
            marginBottom: "12px",
          }}
        >
          PENDING APPROVAL{" "}
          <span style={{ color: t.cyan }}>({pending.length})</span>
        </h2>
        {pending.length === 0 ? (
          <div
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "13px",
              opacity: 0.5,
            }}
          >
            no pending registrations
          </div>
        ) : (
          <div className="admin-pending-list">
            {pending.map((s) => (
              <div key={s.id} className="admin-pending-card">
                <div
                  className="pending-name"
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    fontWeight: 700,
                    fontSize: "15px",
                  }}
                >
                  {s.name}
                  <div
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "10px",
                      opacity: 0.7,
                      fontWeight: 400,
                    }}
                  >
                    email: {s.username}
                  </div>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "10px",
                      opacity: 0.55,
                      marginBottom: "4px",
                    }}
                  >
                    connect to existing student
                  </div>
                  <select
                    className="brutal-input"
                    value={
                      approveForm[s.id]?.connectStudentId ||
                      findMatchingRosterStudent(s)
                    }
                    onChange={(e) =>
                      updateForm(s.id, "connectStudentId", e.target.value)
                    }
                    style={{ width: "100%" }}
                  >
                    <option value="">keep as new login account</option>
                    {rosterCandidates.map((student) => (
                      <option key={student.id} value={student.id}>
                        {labelForStudent(student)}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  className="brutal-input"
                  placeholder="role"
                  list="role-options"
                  autoComplete="off"
                  value={approveForm[s.id]?.role || ""}
                  onChange={(e) => updateForm(s.id, "role", e.target.value)}
                />
                <input
                  className="brutal-input"
                  placeholder="team"
                  list="team-options"
                  autoComplete="off"
                  value={approveForm[s.id]?.team || ""}
                  onChange={(e) => updateForm(s.id, "team", e.target.value)}
                />
                <input
                  className="brutal-input"
                  placeholder="rfid card ID"
                  value={approveForm[s.id]?.rfidUid || ""}
                  onChange={(e) => updateForm(s.id, "rfidUid", e.target.value)}
                />
                <CaptureButton
                  t={t}
                  onCaptured={(uid) => updateForm(s.id, "rfidUid", uid)}
                />
                <div className="pending-actions">
                  <button
                    className="brutal-btn icon-btn"
                    title="Approve"
                    aria-label="Approve"
                    style={{
                      background: t.accentSolid,
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    onClick={() => handleApprove(s.id)}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    className="brutal-btn icon-btn"
                    title="Reject"
                    aria-label="Reject"
                    style={{
                      background: "#FF5C5C",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    onClick={() => handleReject(s.id, s.name)}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M6 6l12 12M18 6L6 18"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* roster + add student */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <h2
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: "18px",
            }}
          >
            ROSTER{" "}
            <span style={{ color: t.mutedText, fontSize: "14px" }}>
              ({roster.length})
            </span>
          </h2>
          <button
            className="brutal-btn"
            style={{
              background: t.cyan,
              color: "#0B0F19",
              padding: "7px 14px",
              fontSize: "12px",
            }}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? "CANCEL" : "+ ADD STUDENT"}
          </button>
        </div>

        {showAddForm && (
          <div
            className="admin-create-row"
            style={{
              border: `3px solid ${t.border}`,
              background: t.panel,
              padding: "14px",
              marginBottom: "16px",
              alignItems: "center",
            }}
          >
            <input
              className="brutal-input"
              placeholder="name"
              style={{ width: "160px" }}
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
            />
            <input
              className="brutal-input"
              placeholder="role"
              list="role-options"
              autoComplete="off"
              style={{ width: "140px" }}
              value={addForm.role}
              onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
            />
            <input
              className="brutal-input"
              placeholder="team"
              list="team-options"
              autoComplete="off"
              style={{ width: "130px" }}
              value={addForm.team}
              onChange={(e) => setAddForm({ ...addForm, team: e.target.value })}
            />
            <input
              className="brutal-input"
              placeholder="rfid card ID"
              style={{ width: "150px" }}
              value={addForm.rfidUid}
              onChange={(e) =>
                setAddForm({ ...addForm, rfidUid: e.target.value })
              }
            />
            <CaptureButton
              t={t}
              onCaptured={(uid) => setAddForm((f) => ({ ...f, rfidUid: uid }))}
            />
            <button
              className="brutal-btn"
              style={{
                background: t.accentSolid,
                color: "#fff",
                padding: "8px 14px",
                fontSize: "12px",
              }}
              onClick={handleAddStudent}
            >
              SAVE
            </button>
          </div>
        )}

<div className="admin-roster-grid">
  {roster.map((s) => (
    <div
      key={s.id}
      className="admin-roster-card"
      style={{
        background: t.muted,
        padding: "12px",
        opacity: s.isApproved ? 1 : 0.5,
        position: "relative",
      }}
    >
      <button
        title="Remove student"
        aria-label="Remove student"
        onClick={() => handleDelete(s.id, s.name)}
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          width: "22px",
          height: "22px",
          border: `2px solid ${t.border}`,
          background: t.panel,
          color: t.ink,
          fontSize: "11px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
        }}
      >
        ✕
      </button>

      {editingId === s.id ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <input
            className="brutal-input"
            value={editForm.name}
            onChange={(e) =>
              setEditForm({ ...editForm, name: e.target.value })
            }
          />

          <input
            className="brutal-input"
            placeholder="role"
            list="role-options"
            value={editForm.role}
            onChange={(e) =>
              setEditForm({ ...editForm, role: e.target.value })
            }
          />

          <input
            className="brutal-input"
            placeholder="team"
            list="team-options"
            value={editForm.team}
            onChange={(e) =>
              setEditForm({ ...editForm, team: e.target.value })
            }
          />

          <input
            className="brutal-input"
            placeholder="rfid card ID"
            value={editForm.rfidUid}
            onChange={(e) =>
              setEditForm({ ...editForm, rfidUid: e.target.value })
            }
          />

          <CaptureButton
            t={t}
            onCaptured={(uid) =>
              setEditForm((f) => ({ ...f, rfidUid: uid }))
            }
          />

          <div style={{ display: "flex", gap: "6px" }}>
            <button
              className="brutal-btn"
              style={{
                background: t.accentSolid,
                color: "#fff",
                padding: "6px 10px",
                fontSize: "11px",
              }}
              onClick={() => handleSaveEdit(s.id)}
            >
              SAVE
            </button>

            <button
              className="brutal-btn"
              style={{
                background: t.panel,
                color: t.ink,
                padding: "6px 10px",
                fontSize: "11px",
              }}
              onClick={() => setEditingId(null)}
            >
              CANCEL
            </button>
          </div>
        </div>
      ) : (
        <>
          
          <div
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 700,
              fontSize: "14px",
              paddingRight: "24px",
            }}
          >
            {s.name}
          </div>

          <div
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "10px",
              color: t.mutedText,
            }}
          >
            {s.role || "—"} · {s.team || "—"}
          </div>

          {!s.isApproved && (
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "10px",
                color: t.cyan,
                marginTop: "4px",
              }}
            >
              pending
            </div>
          )}

          <button
            className="brutal-btn"
            style={{
              marginTop: "8px",
              background: t.panel,
              color: t.ink,
              padding: "4px 10px",
              fontSize: "10px",
            }}
            onClick={() => startEdit(s)}
          >
            EDIT
          </button>
        </>
      )}
    </div>
  ))}
</div>
      </div>
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
