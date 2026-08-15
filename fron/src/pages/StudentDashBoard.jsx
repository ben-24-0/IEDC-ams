import { useState, useMemo, useEffect } from "react";
import { studentApi } from "../api/client";
import MinutesEditor from "../components/MinutesEditor";
const TEAMS = [
  "ALL",
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
const ROLES = ["All", "Lead", "Member", "Nodal"];

const THEMES = {
  light: {
    bg: "#ffffff",
    panel: "#FFFFFF",
    ink: "#0B0F19",
    border: "#0B0F19",
    another_bg: "#ff0000",
    muted: "#F4F6FA",
    accentSolid: "#2F6FED",
    accentGradient: "linear-gradient(90deg, #0B1F6B, #3B5FFF)",
    cyan: "#00E5FF",
    mutedText: "rgba(11,15,25,0.55)",
  },
  dark: {
    bg: "#060608",
    panel: "#101018",
    ink: "#ffffff",
    another_bg: "#ff0000",
    border: "#FFFFFF",
    muted: "#17171F",
    accentSolid: "#3B5FFF",
    accentGradient: "linear-gradient(90deg, #1A2A8F, #4D6BFF)",
    cyan: "#00E5FF",
    mutedText: "rgba(255,255,255,0.55)",
  },
};

function turnoutColor(pct, t) {
  if (pct === undefined) return t.muted;
  if (pct < 0.4) return t.mode === "dark" ? "#1a2a5c" : "#c8d8ff";
  if (pct < 0.7) return t.accentSolid;
  return t.mode === "dark" ? "#5b7dff" : "#0B1F6B";
}

function getSessionDate(session) {
  return new Date(session.date || session.createdAt || Date.now());
}

function isCurrentMonth(session, referenceDate = new Date()) {
  const sessionDate = getSessionDate(session);
  return (
    sessionDate.getFullYear() === referenceDate.getFullYear() &&
    sessionDate.getMonth() === referenceDate.getMonth()
  );
}

function formatAgenda(agenda) {
  if (!agenda) return [];

  return agenda
    .split("\n")
    .flatMap((line) => {
      const trimmed = line.trim();

      if (!trimmed) return [];

      // If the line contains *, split each * item into a bulletin
      if (trimmed.includes("*")) {
        return trimmed
          .split("*")
          .map((item) => item.trim())
          .filter(Boolean)
          .map((item) => ({
            type: "bulletin",
            text: item,
          }));
      }

      // Normal multi-line agenda text
      return [
        {
          type: "text",
          text: trimmed,
        },
      ];
    });
}


function CalendarView({
  t,
  expanded,
  onToggleExpand,
  onClose,
  sessions,
  totalStudents,
}) {
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const keyFor = (day) => {
    const d = new Date(year, month, day);
    // adjust for local timezone offset to avoid ISO date shifting
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  };
  const active = hovered || selected;

  // Map real sessions to the calendar grouped by date
  const historyMap = useMemo(() => {
    const map = {};
    sessions.forEach((s) => {
      const d = new Date(s.date || s.createdAt || Date.now());
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      const dateKey = d.toISOString().slice(0, 10);

      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push({
        title: s.title,
        present: s.present ? s.present.length : 0,
        total: totalStudents,
        agenda: s.agenda || "No agenda set.",
        minutes: s.minutes || "No minutes recorded.",
      });
    });
    return map;
  }, [sessions, totalStudents]);

  const iconButtons = (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: "8px",
        marginBottom: "10px",
      }}
    >
      <button
        className="brutal-btn"
        title={expanded ? "Shrink" : "Expand"}
        aria-label={expanded ? "Shrink calendar" : "Expand calendar"}
        style={{
          background: t.cyan,
          color: "#0B0F19",
          width: "30px",
          height: "30px",
          padding: 0,
          fontSize: "14px",
          lineHeight: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={onToggleExpand}
      >
        {expanded ? "⤡" : "⤢"}
      </button>
      <button
        className="brutal-btn"
        title="Close"
        aria-label="Close calendar"
        style={{
          background: t.ink,
          color: t.bg,
          width: "30px",
          height: "30px",
          padding: 0,
          fontSize: "14px",
          lineHeight: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={onClose}
      >
        ✕
      </button>
    </div>
  );

  const grid = (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
        }}
      >
        <button
          className="brutal-btn"
          style={{
            background: t.panel,
            color: t.ink,
            padding: "5px 10px",
            fontSize: "12px",
          }}
          onClick={() => setCursor(new Date(year, month - 1, 1))}
        >
          ←
        </button>
        <h2
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: expanded ? "18px" : "15px",
            margin: 0,
          }}
        >
          {cursor.toLocaleString("default", { month: "long", year: "numeric" })}
        </h2>
        <button
          className="brutal-btn"
          style={{
            background: t.panel,
            color: t.ink,
            padding: "5px 10px",
            fontSize: "12px",
          }}
          onClick={() => setCursor(new Date(year, month + 1, 1))}
        >
          →
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: expanded ? "7px" : "3px",
          marginBottom: "6px",
        }}
      >
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "10px",
              color: t.mutedText,
            }}
          >
            {d}
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: expanded ? "7px" : "3px",
        }}
      >
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const key = keyFor(day);
          const entry = historyMap[key];
          const pct = entry ? entry[0].present / entry[0].total : undefined;
          const isToday = key === new Date().toISOString().slice(0, 10);
          const isActive = active?.key === key;
          return (
            <div
              key={i}
              onClick={() => entry && setSelected({ key, entry })}
              onMouseEnter={() =>
                expanded && entry && setHovered({ key, entry })
              }
              onMouseLeave={() => expanded && setHovered(null)}
              style={{
                aspectRatio: "1",
                border: `2px solid ${t.border}`,
                background: turnoutColor(pct, t),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: expanded ? "13px" : "10px",
                fontWeight: 600,
                color: pct !== undefined && pct >= 0.4 ? "#fff" : t.ink,
                cursor: entry ? "pointer" : "default",
                outline: isActive
                  ? `3px solid ${t.cyan}`
                  : isToday
                    ? `2px dashed ${t.cyan}`
                    : "none",
                outlineOffset: "2px",
              }}
            >
              {day}
            </div>
          );
        })}
      </div>

      {expanded && (
        <div
          style={{
            display: "flex",
            gap: "14px",
            marginTop: "16px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "11px",
              color: t.mutedText,
            }}
          >
            turnout:
          </span>
          {[
            ["<40%", 0.2],
            ["40-70%", 0.5],
            ["70%+", 0.9],
          ].map(([label, pct]) => (
            <div
              key={label}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <div
                style={{
                  width: "14px",
                  height: "14px",
                  border: `2px solid ${t.border}`,
                  background: turnoutColor(pct, t),
                }}
              />
              <span
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "11px",
                  color: t.mutedText,
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      )}

      {!expanded && selected && (
        <div
          style={{
            marginTop: "14px",
            border: `3px solid ${t.border}`,
            padding: "10px",
            background: t.muted,
          }}
        >
          <div
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "10px",
              color: t.mutedText,
              marginBottom: "4px",
            }}
          >
            {selected.key}
          </div>
          {selected.entry.map((s, i) => (
            <div
              key={i}
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: 700,
                fontSize: "13px",
              }}
            >
              {s.title} — {s.present}/{s.total} present
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const sidePanel = (
    <div
      style={{
        width: "270px",
        borderLeft: `3px solid ${t.border}`,
        paddingLeft: "18px",
      }}
    >
      {!active ? (
        <div
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "12px",
            color: t.mutedText,
            marginTop: "40px",
          }}
        >
          hover a filled date to preview agenda, minutes &amp; attendance
        </div>
      ) : (
        <div>
          <div
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "11px",
              color: t.mutedText,
              marginBottom: "6px",
            }}
          >
            {active.key}
          </div>
          {active.entry.map((s, i) => (
            <div
              key={i}
              style={{
                marginBottom: "14px",
                overflowY: "auto",
                maxHeight: "400px",
                paddingRight: "4px",
              }}
            >
              <div
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: 700,
                  fontSize: "16px",
                  marginBottom: "6px",
                }}
              >
                {s.title}
              </div>
              <div
                style={{
                  display: "inline-block",
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "11px",
                  background: t.accentSolid,
                  color: "#fff",
                  padding: "2px 8px",
                  marginBottom: "12px",
                }}
              >
                {s.present}/{s.total} present
              </div>
              <div
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "10px",
                  color: t.mutedText,
                  marginBottom: "3px",
                }}
              >
                AGENDA
              </div>
              <div
                style={{
                  fontSize: "13px",
                  marginBottom: "12px",
                  lineHeight: 1.4,
                  whiteSpace: "pre-wrap",
                }}
              >
                {s.agenda}
              </div>
              <div
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "10px",
                  color: t.mutedText,
                  marginBottom: "3px",
                }}
              >
                MINUTES
              </div>
              <div
                style={{
                  fontSize: "13px",
                  lineHeight: 1.4,
                  whiteSpace: "pre-wrap",
                }}
              >
                {s.minutes}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div
      className="student-dashboard"
      style={{
        border: `4px solid ${t.border}`,
        boxShadow: `8px 8px 0 ${t.border}`,
        background: t.panel,
        padding: expanded ? "24px" : "18px",
        width: expanded ? "660px" : "320px",
        display: "flex",
        gap: "18px",
      }}
    >
      <div
        className="student-calendar-main"
        style={{ flex: expanded ? "0 0 320px" : "1" }}
      >
        {iconButtons}
        {grid}
      </div>
      {expanded && sidePanel}
    </div>
  );
}

// function MinutesEditor({ t, session, canEdit }) {
//   const [minutes, setMinutes] = useState(session.minutes || "");
//   const [saving, setSaving] = useState(false);
//   const [msg, setMsg] = useState("");

//   const handleFile = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     if (!file.name.endsWith(".txt")) {
//       alert("only .txt files supported right now");
//       return;
//     }
//     const reader = new FileReader();
//     reader.onload = (ev) => setMinutes(ev.target.result);
//     reader.readAsText(file);
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     setMsg("");
//     try {
//       await studentApi.uploadMinutes(session.id, minutes);
//       setMsg("saved!");
//     } catch (err) {
//       setMsg(err.message);
//     } finally {
//       setSaving(false);
//       setTimeout(() => setMsg(""), 2000);
//     }
//   };

//   if (!canEdit) {
//     return (
//       <div style={{ fontSize: "13px", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
//         {session.minutes || "not recorded yet"}
//       </div>
//     );
//   }

//   return (
//     <div>
//       <textarea
//         className="brutal-input"
//         style={{ width: "100%", minHeight: "120px", marginBottom: "8px", fontFamily: "JetBrains Mono, monospace", fontSize: "13px" }}
//         value={minutes}
//         onChange={(e) => setMinutes(e.target.value)}
//         placeholder="paste or type meeting minutes..."
//       />
//       <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
//         <input type="file" accept=".txt" onChange={handleFile} style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px" }} />
//         <button className="brutal-btn" style={{ background: t.accentSolid, color: "#fff", padding: "7px 14px", fontSize: "12px" }}
//           onClick={handleSave} disabled={saving}>
//           {saving ? "..." : "SAVE MINUTES"}
//         </button>
//         {msg && <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px", color: t.cyan }}>{msg}</span>}
//       </div>
//     </div>
//   );
// }
function ForcedPasswordChangeModal({ t, onChanged }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirm) {
      setError("passwords don't match");
      return;
    }
    setLoading(true);
    try {
      await studentApi.changePassword(currentPassword, newPassword);
      localStorage.setItem("mustChangePassword", "false");
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
<div
  style={{
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    color: t.ink,
  }}
>
  <form
    onSubmit={handleSubmit}
    style={{
      border: `4px solid ${t.border}`,
      boxShadow: `8px 8px 0 ${t.border}`,
      background: t.panel,
      color: t.ink,
      padding: "32px",
      width: "340px",
    }}
  >
    <h1
      style={{
        fontFamily: "Space Grotesk, sans-serif",
        fontSize: "20px",
        marginBottom: "8px",
        color: t.ink,
      }}
    >
      CHANGE PASSWORD REQUIRED
    </h1>

    <div
      style={{
        fontFamily: "JetBrains Mono, monospace",
        fontSize: "11px",
        color: t.mutedText,
        marginBottom: "18px",
        
      }}
    >
      you're using a temporary password - set a new one to continue
    </div>

    <input
      className="brutal-input"
      type="password"
      placeholder="current (temp) password"
      style={{
        marginBottom: "12px",
        color: t.ink,
        background: t.panel,
        border: "2px solid #666",
      }}
      value={currentPassword}
      onChange={(e) => setCurrentPassword(e.target.value)}
    />

    <input
      className="brutal-input"
      type="password"
      placeholder="new password"
      style={{
        marginBottom: "12px",
        color: t.ink,
        background: t.panel,
        border: "2px solid #666",
      }}
      value={newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
    />

    <input
      className="brutal-input"
      type="password"
      placeholder="confirm new password"
      style={{
        marginBottom: "16px",
        color: t.ink,
        background: t.panel,
        border: "2px solid #666"
      }}
      value={confirm}
      onChange={(e) => setConfirm(e.target.value)}
    />

    {error && (
      <div
        style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "12px",
          color: "#FF5C5C",
          marginBottom: "14px",
          
        }}
      >
        {error}
      </div>
    )}

    <button
      type="submit"
      disabled={loading}
      className="brutal-btn"
      style={{
        background: t.accentSolid,
        color: "#fff",
        padding: "10px",
        width: "100%",
        fontSize: "13px",
      }}
    >
      {loading ? "..." : "CHANGE PASSWORD"}
    </button>
  </form>
</div>
  );
}


//StudentDashBoard
export default function StudentDashboard({ onLogout }) {
  const [mode, setMode] = useState(() => localStorage.getItem("themeMode") || "dark");
  const t = { ...THEMES[mode], mode };

  useEffect(() => {
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarExpanded, setCalendarExpanded] = useState(false);

  // Data fetching state
  const [roster, setRoster] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dutyLeaveBusy, setDutyLeaveBusy] = useState(false);
  const [dutyLeaveNotice, setDutyLeaveNotice] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [teamFilter, setTeamFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
//doc team
const isDocTeam = localStorage.getItem("studentTeam") === "DOCUMENTATION";
const [mustChangePassword, setMustChangePassword] = useState(localStorage.getItem("mustChangePassword") === "true");


  useEffect(() => {
    const fetchData = () => {
      Promise.all([studentApi.getStudents(), studentApi.getSessions()])
        .then(([studentsData, sessionsData]) => {
          setRoster(studentsData);
          setSessions(sessionsData);

          const visibleSessionIds = sessionsData
            .filter((session) => isCurrentMonth(session))
            .slice(0, 7)
            .map((session) => session.id);

          setActiveId((currentActiveId) => {
            if (
              currentActiveId &&
              visibleSessionIds.includes(currentActiveId)
            ) {
              return currentActiveId;
            }
            return visibleSessionIds[0] || sessionsData[0]?.id || null;
          });

          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load dashboard data", err);
          setLoading(false);
        });
    };

    fetchData(); // Initial fetch

    // Check for new sessions/taps every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const visibleSessions = useMemo(() => {
    const currentMonth = new Date();
    return sessions
      .filter((session) => isCurrentMonth(session, currentMonth))
      .sort((a, b) => getSessionDate(b) - getSessionDate(a))
      .slice(0, 7);
  }, [sessions]);

  const hiddenSessionCount = Math.max(
    0,
    sessions.length - visibleSessions.length,
  );

  const session = sessions.find((s) => s.id === activeId);
  const dutyLeaveRequested = !!session?.dutyLeaveRequestedByMe;
  const canDownloadDutyLeave = dutyLeaveRequested && !!session?.dutyLeaveDocUrl;

  const handleRequestDutyLeave = async () => {
    if (!session || dutyLeaveBusy || dutyLeaveRequested) return;

    setDutyLeaveBusy(true);
    setDutyLeaveNotice("");
    try {
      await studentApi.requestDutyLeave(session.id);
      setSessions((prev) =>
        prev.map((item) =>
          item.id === session.id
            ? {
                ...item,
                dutyLeaveRequestedByMe: true,
                dutyLeaveRequestCount: (item.dutyLeaveRequestCount || 0) + 1,
              }
            : item,
        ),
      );
      setDutyLeaveNotice("Duty leave request submitted.");
    } catch (err) {
      setDutyLeaveNotice(err.message || "Could not submit request.");
    } finally {
      setDutyLeaveBusy(false);
    }
  };

const rows = useMemo(() => {
  if (!session || !roster.length) return [];
  
  return roster
    .map((m, index) => {
      const hit = session.present?.find((p) => p.id === m.id);
      return {
        ...m,
        present: !!hit,
        time: hit?.time,
        rosterIndex: index, // Fixed: O(1) assignment instead of O(N) indexOf
      };
    })
    .filter((m) => {
      if (statusFilter === "Present" && !m.present) return false;
      if (statusFilter === "Absent" && m.present) return false;

      // Fixed: Case-insensitive comparison for Teams
      if (
        teamFilter?.toUpperCase() !== "ALL" && 
        m.team?.toUpperCase() !== teamFilter?.toUpperCase()
      ) {
        return false;
      }

      // Fixed: Case-insensitive comparison for Roles
      if (
        roleFilter?.toUpperCase() !== "ALL" && 
        m.role?.toUpperCase() !== roleFilter?.toUpperCase()
      ) {
        return false;
      }

      if (search && !m.name?.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // 1. Sort by presence (Present at the top)
      if (a.present !== b.present) return a.present ? -1 : 1;
      
      // 2. If both are present, sort by time (Earliest first)
      if (a.present && b.present) {
        const timeA = a.time ? new Date(a.time).getTime() : 0;
        const timeB = b.time ? new Date(b.time).getTime() : 0;
        return timeA - timeB; 
      }
      
      // 3. Fallback: Sort by original roster order
      return a.rosterIndex - b.rosterIndex;
    });
}, [roster, session, statusFilter, teamFilter, roleFilter, search]);


  const formatAttendanceTime = (time) => {
    if (!time) return "waiting for scan";
    return new Date(time).toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusColor = session?.status === "CLOSED" ? t.another_bg : t.accentSolid;

  const chipStyle = (active) => ({
    fontFamily: "JetBrains Mono, monospace",
    fontSize: "12px",
    fontWeight: 600,
    padding: "6px 12px",
    border: `2px solid ${t.border}`,
    background: active ? t.ink : t.panel,
    color: active ? t.bg : t.ink,
    cursor: "pointer",
  });

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: t.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Space Grotesk, sans-serif",
          fontWeight: 700,
          fontSize: "24px",
          color: t.ink,
        }}
      >
        Loading Dashboard...
      </div>
    );
  }

  return (
    <>
      

        {mustChangePassword && (
  <ForcedPasswordChangeModal t={t} onChanged={() => setMustChangePassword(false)} />
)}
    <div
      className="student-dashboard"
      style={{
        minHeight: "100vh",
        background: t.bg,
        fontFamily: "Inter, sans-serif",
        padding: "24px",
        color: t.ink,
        transition: "background 0.2s, color 0.2s",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;500&family=Inter:wght@400;600&family=JetBrains+Mono:wght@500&display=swap');
        * { box-sizing: border-box; }
        .brutal-btn { font-family: 'Space Grotesk', sans-serif; border: 3px solid ${t.border}; box-shadow: 5px 5px 0 ${t.border}; transition: transform 0.1s, box-shadow 0.1s; cursor: pointer; font-weight: 700; }
        .brutal-btn:active { transform: translate(5px, 5px); box-shadow: 0 0 0 ${t.border}; }
        .student-dashboard .student-shell { width: 100%; }
        .student-dashboard .student-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
        .student-dashboard .student-session-strip {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
          align-items: center;
        }
        .student-dashboard .student-filter-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 18px;
          align-items: center;
        }
        .student-dashboard .student-card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
          gap: 14px;
        }
        .student-dashboard .student-calendar-shell {
          width: 660px;
          display: flex;
          gap: 18px;
        }
        .student-dashboard .student-calendar-main {
          flex: 0 0 320px;
        }
        .student-dashboard .student-calendar-side {
          width: 270px;
          border-left: 3px solid ${t.border};
          padding-left: 18px;
        }
        .student-dashboard .student-card {
          position: relative;
          border: 3px solid ${t.border};
          background: ${t.panel};
          padding: 14px;
          overflow: hidden;
        }
        @media (max-width: 900px) {
          .student-dashboard {
            padding: 14px !important;
          }
          .student-dashboard .student-header {
            flex-direction: column;
            align-items: stretch;
          }
          .student-dashboard .student-session-strip {
            flex-wrap: nowrap;
            overflow-x: auto;
            overflow-y: hidden;
            padding-bottom: 6px;
            scrollbar-width: none;
          }
          .student-dashboard .student-session-strip::-webkit-scrollbar {
            display: none;
          }
          .student-dashboard .student-session-strip > div {
            flex: 0 0 auto;
            white-space: nowrap;
          }
          .student-dashboard .student-filter-row {
            flex-direction: column;
            align-items: stretch;
          }
          .student-dashboard .student-filter-row > * {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
          }
          .student-dashboard .student-card-grid {
            grid-template-columns: 1fr;
          }
          .student-dashboard .student-card {
            padding: 12px;
          }
          .student-dashboard .student-calendar-shell {
            width: 100% !important;
            flex-direction: column;
            gap: 12px;
            padding: 14px !important;
            box-shadow: none;
          }
          .student-dashboard .student-calendar-main {
            flex: 1 1 auto;
          }
          .student-dashboard .student-calendar-side {
            width: 100%;
            border-left: none;
            border-top: 3px solid ${t.border};
            padding-left: 0;
            padding-top: 14px;
          }
          .student-dashboard .student-calendar-shell [style*="grid-template-columns: repeat(7, 1fr)"] {
            gap: 4px !important;
          }
          .student-dashboard .student-calendar-shell [style*="grid-template-columns: repeat(7, 1fr)"] > div {
            font-size: 10px !important;
          }
        }
      `}</style>

      <div className="student-header">
        <div>
          <div
            style={{
              width: "48px",
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
              FISAT
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="brutal-btn"
            title="Calendar"
            aria-label="Open calendar"
            style={{
              background: calendarOpen ? t.accentSolid : t.panel,
              color: calendarOpen ? "#fff" : t.ink,
              padding: "8px",
              fontSize: "12px",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => setCalendarOpen(!calendarOpen)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <rect
                x="3"
                y="5"
                width="18"
                height="16"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M8 3v4M16 3v4M3 9h18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
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
            title="Logout"
            aria-label="Logout"
            style={{
              background: "#FF5C5C",
              color: "#fff",
              padding: "8px",
              fontSize: "12px",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={onLogout}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M10 17l5-5-5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15 12H4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M20 4v16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {calendarOpen && (
        <div
          className="student-calendar-modal"
          onClick={() => setCalendarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: "80px",
            zIndex: 50,
          }}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <CalendarView
              t={t}
              expanded={calendarExpanded}
              onToggleExpand={() => setCalendarExpanded(!calendarExpanded)}
              onClose={() => setCalendarOpen(false)}
              sessions={sessions}
              totalStudents={roster.length}
            />
          </div>
        </div>
      )}

      <div className="student-session-strip">
        {visibleSessions.map((s) => (
          <div
            key={s.id}
            onClick={() => setActiveId(s.id)}
            style={{
              border: `3px solid ${t.border}`,
              background: s.id === activeId ? t.accentSolid : t.panel,
              color: s.id === activeId ? "#fff" : t.ink,
              padding: "8px 14px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              boxShadow: s.id === activeId ? `4px 4px 0 ${t.border}` : "none",
            }}
          >
            {s.title}{" "}
            <span style={{ opacity: 0.7, fontWeight: 500 }}>
              ·{" "}
              {s.time ||
                getSessionDate(s).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </span>
          </div>
        ))}
        {hiddenSessionCount > 0 && (
          <div
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "11px",
              color: t.mutedText,
            }}
          >
            {hiddenSessionCount} older session
            {hiddenSessionCount === 1 ? "" : "s"} in calendar
          </div>
        )}
      </div>

{session ? (
  <>
    {/* PART 1 - session info + collapsible agenda/minutes */}
    <div className="student-shell" style={{ border: `4px solid ${t.border}`, boxShadow: `8px 8px 0 ${t.border}`, background: t.panel, padding: "24px", marginBottom: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
        <div>
          <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "26px", margin: 0 }}>{session.title}</h1>
          <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "13px", color: t.mutedText, marginTop: "4px" }}>
            {session.scheduledTime ? new Date(session.scheduledTime).toLocaleString() : "TBA"} · {session.venue || "venue TBA"}
          </div>
        </div>
        <div style={{ background: statusColor, color: "#fff", border: `3px solid ${t.border}`, padding: "6px 16px", fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "13px", transform: "rotate(-2deg)" }}>
          {session.status || "ACTIVE"}
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", marginBottom: "14px" }}>
        <button
          className="brutal-btn"
          style={{
            background: dutyLeaveRequested ? t.muted : t.accentSolid,
            color: dutyLeaveRequested ? t.mutedText : "#fff",
            padding: "8px 14px",
            fontSize: "12px",
            cursor: dutyLeaveRequested ? "default" : "pointer",
          }}
          disabled={dutyLeaveRequested || dutyLeaveBusy}
          onClick={handleRequestDutyLeave}
        >
          {dutyLeaveRequested ? "DUTY LEAVE REQUESTED" : dutyLeaveBusy ? "REQUESTING..." : "REQUEST DUTY LEAVE"}
        </button>
        {canDownloadDutyLeave && (
          <button
            className="brutal-btn"
            style={{
              background: t.cyan,
              color: "#0B0F19",
              padding: "8px 14px",
              fontSize: "12px",
            }}
            onClick={() => window.open(session.dutyLeaveDocUrl, "_blank", "noopener,noreferrer")}
          >
            DOWNLOAD DUTY LEAVE
          </button>
        )}
        {dutyLeaveRequested && !canDownloadDutyLeave && (
          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px", color: t.mutedText }}>
            waiting for admin to upload the duty leave document link
          </span>
        )}
      </div>
      {dutyLeaveNotice && (
        <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px", color: t.mutedText, marginBottom: "12px" }}>
          {dutyLeaveNotice}
        </div>
      )}

<details open>
        <summary style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "14px", cursor: "pointer", color: t.mutedText, marginBottom: "10px" }}>
          AGENDA & MINUTES
        </summary>
        <div style={{ marginTop: "10px" }}>
          <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", color: t.mutedText, marginBottom: "4px" }}>AGENDA</div>
          <div
  style={{
    fontSize: "13px",
    lineHeight: 1.5,
    marginBottom: "16px",
  }}
>
  {session.agenda ? (
    formatAgenda(session.agenda).map((item, index) => {
      if (item.type === "bulletin") {
        return (
          <div
            key={index}
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "6px",
            }}
          >
            <span
              style={{
                fontWeight: 700,
                color: t.accentSolid,
              }}
            >
              •
            </span>
            <span>{item.text}</span>
          </div>
        );
      }

      return (
        <div key={index} style={{ marginBottom: "6px" }}>
          {item.text}
        </div>
      );
    })
  ) : (
    "not set"
  )}
</div>

          
          <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", color: t.mutedText, marginBottom: "4px" }}>MINUTES</div>
          
          {/* 2. Drop the component here and pass the props */}
          <MinutesEditor 
            t={t} 
            session={session} 
            canEdit={isDocTeam} 
          />
          
        </div>
      </details>
    </div>

    {/* PART 2 - attendance, separate card so agenda collapsing doesn't affect it */}
    <div className="student-shell" style={{ border: `4px solid ${t.border}`, boxShadow: `8px 8px 0 ${t.border}`, background: t.panel, padding: "24px" }}>
      <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "18px", marginBottom: "12px" }}>
        ATTENDANCE <span style={{ color: t.mutedText, fontSize: "14px" }}>({(session.present || []).length}/{roster.length})</span>
      </h2>

      <div className="student-filter-row">
        <input
          placeholder="search name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "12px", border: `2px solid ${t.border}`, padding: "7px 10px", minWidth: "160px", background: t.panel, color: t.ink }}
        />
        {["All", "Present", "Absent"].map((v) => (
          <button key={v} style={chipStyle(statusFilter === v)} onClick={() => setStatusFilter(v)}>{v}</button>
        ))}
        <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} style={chipStyle(teamFilter !== "All")}>
          {TEAMS.map((tm) => <option key={tm} value={tm}>{tm === "All" ? "Team: All" : tm}</option>)}
        </select>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={chipStyle(roleFilter !== "All")}>
          {ROLES.map((r) => <option key={r} value={r}>{r === "All" ? "Role: All" : r}</option>)}
        </select>
      </div>

      <div className="student-card-grid">
        {rows.map((m) => (
          <div key={m.id} className="student-card" style={{
            boxShadow: m.present ? `5px 5px 0 ${mode === "dark" ? "#16a34a" : "#22c55e"}` : "none",
            opacity: m.present ? 1 : 0.55,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px", color: m.present ? (mode === "dark" ? "#86efac" : "#166534") : t.mutedText }}>
                {formatAttendanceTime(m.time)}
              </div>
              {m.present && (
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", fontWeight: 700, color: mode === "dark" ? "#86efac" : "#166534" }}>PRESENT</div>
              )}
            </div>
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "17px", marginBottom: "6px" }}>{m.name}</div>
            <div style={{ display: "flex", gap: "6px" }}>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", background: t.muted, border: `2px solid ${t.border}`, padding: "2px 7px" }}>{m.role}</span>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", background: t.muted, border: `2px solid ${t.border}`, padding: "2px 7px" }}>{m.team}</span>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "13px", color: t.mutedText, gridColumn: "1/-1" }}>no matches for current filters</div>
        )}
      </div>
    </div>
  </>
) : (
  <div style={{ border: `3px dashed ${t.border}`, padding: "40px", textAlign: "center", fontFamily: "JetBrains Mono, monospace", color: t.mutedText }}>
    no active sessions found
  </div>
)}
    </div>
    </>

  );
}