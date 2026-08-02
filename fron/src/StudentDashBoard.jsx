import { useState, useRef, useMemo } from "react";

// mock roster - real version pulls from GET /api/students
const ROSTER = [
  { id: "RF001", name: "Aiswarya Menon", role: "Lead", team: "Tech" },
  { id: "RF002", name: "Rahul Krishnan", role: "Core", team: "Tech" },
  { id: "RF003", name: "Fathima Noor", role: "Core", team: "Design" },
  { id: "RF004", name: "Vishnu Prasad", role: "Lead", team: "Events" },
  { id: "RF005", name: "Anagha Suresh", role: "Volunteer", team: "Design" },
  { id: "RF006", name: "Nihal Ahmed", role: "Core", team: "Outreach" },
  { id: "RF007", name: "Devika S", role: "Volunteer", team: "Tech" },
  { id: "RF008", name: "Arjun Nair", role: "Lead", team: "Outreach" },
];

const TEAMS = ["All", "Tech", "Design", "Events", "Outreach"];
const ROLES = ["All", "Lead", "Core", "Volunteer"];

const THEMES = {
  light: {
    bg: "#EAF0FB", panel: "#FFFFFF", ink: "#0B0F19", border: "#0B0F19",
    muted: "#F4F6FA", accentSolid: "#2F6FED",
    accentGradient: "linear-gradient(90deg, #0B1F6B, #3B5FFF)",
    cyan: "#00E5FF", mutedText: "rgba(11,15,25,0.55)",
  },
  dark: {
    bg: "#060608", panel: "#101018", ink: "#FFFFFF", border: "#FFFFFF",
    muted: "#17171F", accentSolid: "#3B5FFF",
    accentGradient: "linear-gradient(90deg, #1A2A8F, #4D6BFF)",
    cyan: "#00E5FF", mutedText: "rgba(255,255,255,0.55)",
  },
};

function makeSession(title) {
  return {
    id: crypto.randomUUID(),
    title,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    status: "SCHEDULED",
    present: [],
  };
}

const AGENDA_POOL = [
  "Review ongoing project timelines, assign task owners for next sprint.",
  "Discuss upcoming hackathon logistics and team formation.",
  "Budget review for Q3 events, sponsorship follow-ups.",
  "Onboarding new volunteers, walkthrough of club tools.",
  "Retrospective on last event, gather feedback for improvements.",
];
const MINUTES_POOL = [
  "Decided to move deadline by 1 week. Tech team to share progress by Friday.",
  "Finalized venue booking. Design team to send poster draft by Wed.",
  "Approved budget split across 3 sub-events. Leads to confirm vendors.",
  "All new volunteers assigned to teams. Buddy system starts next week.",
  "Action items assigned, next sync scheduled in 2 weeks.",
];

// mock past-meeting history for calendar demo - real version: GET /api/sessions?month=
function generateMockHistory() {
  const history = {};
  const today = new Date();
  for (let i = 1; i < 50; i++) {
    if (Math.random() > 0.65) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const total = ROSTER.length;
      const present = Math.floor(Math.random() * (total - 2)) + 2;
      const idx = Math.floor(Math.random() * AGENDA_POOL.length);
      history[key] = [{
        title: "Club Meeting", present, total,
        agenda: AGENDA_POOL[idx], minutes: MINUTES_POOL[idx],
      }];
    }
  }
  return history;
}
const MOCK_HISTORY = generateMockHistory();

function turnoutColor(pct, t) {
  if (pct === undefined) return t.muted;
  if (pct < 0.4) return t.mode === "dark" ? "#1a2a5c" : "#c8d8ff";
  if (pct < 0.7) return t.accentSolid;
  return t.mode === "dark" ? "#5b7dff" : "#0B1F6B";
}

function CalendarView({ t, expanded, onToggleExpand, onClose }) {
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(startOffset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const keyFor = (day) => new Date(year, month, day).toISOString().slice(0, 10);
  const active = hovered || selected;

  const iconButtons = (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginBottom: "10px" }}>
      <button
        className="brutal-btn"
        title={expanded ? "Shrink" : "Expand"}
        aria-label={expanded ? "Shrink calendar" : "Expand calendar"}
        style={{ background: t.cyan, color: "#0B0F19", width: "30px", height: "30px", padding: 0, fontSize: "14px", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
        onClick={onToggleExpand}
      >
        {expanded ? "⤡" : "⤢"}
      </button>
      <button
        className="brutal-btn"
        title="Close"
        aria-label="Close calendar"
        style={{ background: t.ink, color: t.bg, width: "30px", height: "30px", padding: 0, fontSize: "14px", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
        onClick={onClose}
      >
        ✕
      </button>
    </div>
  );

  const grid = (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <button className="brutal-btn" style={{ background: t.panel, color: t.ink, padding: "5px 10px", fontSize: "12px" }}
          onClick={() => setCursor(new Date(year, month - 1, 1))}>←</button>
        <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: expanded ? "18px" : "15px", margin: 0 }}>
          {cursor.toLocaleString("default", { month: "long", year: "numeric" })}
        </h2>
        <button className="brutal-btn" style={{ background: t.panel, color: t.ink, padding: "5px 10px", fontSize: "12px" }}
          onClick={() => setCursor(new Date(year, month + 1, 1))}>→</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: expanded ? "7px" : "3px", marginBottom: "6px" }}>
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontFamily: "JetBrains Mono, monospace", fontSize: "10px", color: t.mutedText }}>{d}</div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: expanded ? "7px" : "3px" }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const key = keyFor(day);
          const entry = MOCK_HISTORY[key];
          const pct = entry ? entry[0].present / entry[0].total : undefined;
          const isToday = key === new Date().toISOString().slice(0, 10);
          const isActive = active?.key === key;
          return (
            <div
              key={i}
              onClick={() => entry && setSelected({ key, entry })}
              onMouseEnter={() => expanded && entry && setHovered({ key, entry })}
              onMouseLeave={() => expanded && setHovered(null)}
              style={{
                aspectRatio: "1",
                border: `2px solid ${t.border}`,
                background: turnoutColor(pct, t),
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "JetBrains Mono, monospace", fontSize: expanded ? "13px" : "10px", fontWeight: 600,
                color: pct !== undefined && pct >= 0.4 ? "#fff" : t.ink,
                cursor: entry ? "pointer" : "default",
                outline: isActive ? `3px solid ${t.cyan}` : isToday ? `2px dashed ${t.cyan}` : "none",
                outlineOffset: "2px",
              }}
            >
              {day}
            </div>
          );
        })}
      </div>

      {expanded && (
        <div style={{ display: "flex", gap: "14px", marginTop: "16px", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px", color: t.mutedText }}>turnout:</span>
          {[["<40%", 0.2], ["40-70%", 0.5], ["70%+", 0.9]].map(([label, pct]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "14px", height: "14px", border: `2px solid ${t.border}`, background: turnoutColor(pct, t) }} />
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px", color: t.mutedText }}>{label}</span>
            </div>
          ))}
        </div>
      )}

      {!expanded && selected && (
        <div style={{ marginTop: "14px", border: `3px solid ${t.border}`, padding: "10px", background: t.muted }}>
          <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", color: t.mutedText, marginBottom: "4px" }}>
            {selected.key}
          </div>
          {selected.entry.map((s, i) => (
            <div key={i} style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "13px" }}>
              {s.title} — {s.present}/{s.total} present
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const sidePanel = (
    <div style={{ width: "270px", borderLeft: `3px solid ${t.border}`, paddingLeft: "18px" }}>
      {!active ? (
        <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "12px", color: t.mutedText, marginTop: "40px" }}>
          hover a filled date to preview agenda, minutes &amp; attendance
        </div>
      ) : (
        <div>
          <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px", color: t.mutedText, marginBottom: "6px" }}>
            {active.key}
          </div>
          {active.entry.map((s, i) => (
            <div key={i} style={{ marginBottom: "14px" }}>
              <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "16px", marginBottom: "6px" }}>
                {s.title}
              </div>
              <div style={{
                display: "inline-block", fontFamily: "JetBrains Mono, monospace", fontSize: "11px",
                background: t.accentSolid, color: "#fff", padding: "2px 8px", marginBottom: "12px",
              }}>
                {s.present}/{s.total} present
              </div>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", color: t.mutedText, marginBottom: "3px" }}>
                AGENDA
              </div>
              <div style={{ fontSize: "13px", marginBottom: "12px", lineHeight: 1.4 }}>{s.agenda}</div>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", color: t.mutedText, marginBottom: "3px" }}>
                MINUTES
              </div>
              <div style={{ fontSize: "13px", lineHeight: 1.4 }}>{s.minutes}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      border: `4px solid ${t.border}`, boxShadow: `8px 8px 0 ${t.border}`, background: t.panel,
      padding: expanded ? "24px" : "18px",
      width: expanded ? "660px" : "320px",
      display: "flex", gap: "18px",
    }}>
      <div style={{ flex: expanded ? "0 0 320px" : "1" }}>
        {iconButtons}
        {grid}
      </div>
      {expanded && sidePanel}
    </div>
  );
}

export default function StudentDashboard() {
  const [mode, setMode] = useState("dark");
  const t = { ...THEMES[mode], mode };
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarExpanded, setCalendarExpanded] = useState(false);

  const [sessions, setSessions] = useState([makeSession("IEDC Core Sync")]);
  const [activeId, setActiveId] = useState(sessions[0].id);
  const [justTapped, setJustTapped] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [teamFilter, setTeamFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const tapIndex = useRef(0);

  const session = sessions.find((s) => s.id === activeId);

  const updateSession = (patch) => {
    setSessions((prev) => prev.map((s) => (s.id === activeId ? { ...s, ...patch } : s)));
  };

  const addSession = () => {
    const s = makeSession(`Session ${sessions.length + 1}`);
    setSessions((prev) => [...prev, s]);
    setActiveId(s.id);
  };

  const simulateTap = () => {
    if (session.status !== "ACTIVE") return;
    const available = ROSTER.filter((m) => !session.present.find((p) => p.id === m.id));
    if (available.length === 0) return;
    const member = available[tapIndex.current % available.length];
    tapIndex.current += 1;
    const entry = { ...member, time: new Date().toLocaleTimeString() };
    updateSession({ present: [entry, ...session.present] });
    setJustTapped(member.id);
    setTimeout(() => setJustTapped(null), 900);
  };

  const rows = useMemo(() => {
    return ROSTER
      .map((m) => {
        const hit = session.present.find((p) => p.id === m.id);
        return { ...m, present: !!hit, time: hit?.time };
      })
      .filter((m) => {
        if (statusFilter === "Present" && !m.present) return false;
        if (statusFilter === "Absent" && m.present) return false;
        if (teamFilter !== "All" && m.team !== teamFilter) return false;
        if (roleFilter !== "All" && m.role !== roleFilter) return false;
        if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      });
  }, [session.present, statusFilter, teamFilter, roleFilter, search]);

  const statusColor = session.status === "CLOSED" ? t.ink : t.accentSolid;

  const chipStyle = (active) => ({
    fontFamily: "JetBrains Mono, monospace", fontSize: "12px", fontWeight: 600,
    padding: "6px 12px", border: `2px solid ${t.border}`,
    background: active ? t.ink : t.panel, color: active ? t.bg : t.ink, cursor: "pointer",
  });

  return (
    <div style={{ minHeight: "100vh", background: t.bg, fontFamily: "Inter, sans-serif", padding: "24px", color: t.ink, transition: "background 0.2s, color 0.2s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;500&family=Inter:wght@400;600&family=JetBrains+Mono:wght@500&display=swap');
        * { box-sizing: border-box; }
        .brutal-btn { font-family: 'Space Grotesk', sans-serif; border: 3px solid ${t.border}; box-shadow: 5px 5px 0 ${t.border}; transition: transform 0.1s, box-shadow 0.1s; cursor: pointer; font-weight: 700; }
        .brutal-btn:active { transform: translate(5px, 5px); box-shadow: 0 0 0 ${t.border}; }
        @keyframes stamp { 0% { transform: scale(0.7) rotate(-8deg); opacity: 0; } 55% { transform: scale(1.05) rotate(2deg); opacity: 1; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
        .tap-flash { animation: stamp 0.45s cubic-bezier(.2,1.4,.4,1); }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ width: "48px", height: "4px", background: t.accentGradient, marginBottom: "8px" }} />
          <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "20px", letterSpacing: "2px" }}>
            IEDC <span style={{ fontWeight: 500, opacity: 0.6, fontSize: "14px" }}>FISAT</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="brutal-btn" style={{ background: calendarOpen ? t.accentSolid : t.panel, color: calendarOpen ? "#fff" : t.ink, padding: "8px 16px", fontSize: "12px" }}
            onClick={() => setCalendarOpen(!calendarOpen)}>📅 CALENDAR</button>
          <button className="brutal-btn" style={{ background: t.panel, color: t.ink, padding: "8px 14px", fontSize: "12px" }}
            onClick={() => setMode(mode === "dark" ? "light" : "dark")}>
            {mode === "dark" ? "LIGHT" : "DARK"}
          </button>
        </div>
      </div>

      {calendarOpen && (
        <div
          onClick={() => setCalendarOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "flex-start", justifyContent: "center",
            paddingTop: "80px", zIndex: 50,
          }}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <CalendarView
              t={t}
              expanded={calendarExpanded}
              onToggleExpand={() => setCalendarExpanded(!calendarExpanded)}
              onClose={() => setCalendarOpen(false)}
            />
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        {sessions.map((s) => (
          <div key={s.id} onClick={() => setActiveId(s.id)}
            style={{
              border: `3px solid ${t.border}`, background: s.id === activeId ? t.accentSolid : t.panel,
              color: s.id === activeId ? "#fff" : t.ink, padding: "8px 14px",
              fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "13px", cursor: "pointer",
              boxShadow: s.id === activeId ? `4px 4px 0 ${t.border}` : "none",
            }}>
            {s.title} <span style={{ opacity: 0.7, fontWeight: 500 }}>· {s.time}</span>
          </div>
        ))}
        <button className="brutal-btn" style={{ background: t.cyan, color: "#0B0F19", padding: "8px 14px", fontSize: "13px" }} onClick={addSession}>
          + NEW SESSION
        </button>
      </div>

      <div style={{ border: `4px solid ${t.border}`, boxShadow: `8px 8px 0 ${t.border}`, background: t.panel, padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
          <div>
            <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "26px", margin: 0 }}>{session.title}</h1>
            <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "13px", color: t.mutedText, marginTop: "4px" }}>
              {session.time} · {session.present.length}/{ROSTER.length} present
            </div>
          </div>
          <div style={{ background: statusColor, color: "#fff", border: `3px solid ${t.border}`, padding: "6px 16px", fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "13px", transform: "rotate(-2deg)" }}>
            {session.status}
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
          {session.status === "SCHEDULED" && (
            <button className="brutal-btn" style={{ background: t.accentSolid, color: "#fff", padding: "10px 18px" }}
              onClick={() => updateSession({ status: "ACTIVE" })}>START (device button, demo)</button>
          )}
          {session.status === "ACTIVE" && (
            <>
              <button className="brutal-btn" style={{ background: t.cyan, color: "#0B0F19", padding: "10px 18px" }} onClick={simulateTap}>SIMULATE TAP</button>
              <button className="brutal-btn" style={{ background: t.ink, color: t.bg, padding: "10px 18px" }} onClick={() => updateSession({ status: "CLOSED" })}>END SESSION</button>
            </>
          )}
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "18px", alignItems: "center" }}>
          <input placeholder="search name..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "12px", border: `2px solid ${t.border}`, padding: "7px 10px", minWidth: "160px", background: t.panel, color: t.ink }} />
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

        {session.status === "SCHEDULED" ? (
          <div style={{ border: `3px dashed ${t.border}`, padding: "40px", textAlign: "center", fontFamily: "JetBrains Mono, monospace", color: t.mutedText }}>
            waiting for session to start — device armed on button press
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "14px" }}>
            {rows.map((m) => (
              <div key={m.id} className={justTapped === m.id ? "tap-flash" : ""}
                style={{ position: "relative", border: `3px solid ${t.border}`, background: m.present ? t.panel : t.muted, padding: "14px", boxShadow: m.present ? `5px 5px 0 ${t.border}` : "none", opacity: m.present ? 1 : 0.55, overflow: "hidden" }}>
                {justTapped === m.id && (
                  <div style={{ position: "absolute", top: "10px", right: "-28px", background: t.cyan, color: "#0B0F19", fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "11px", padding: "3px 34px", transform: "rotate(35deg)", letterSpacing: "1px", border: "2px solid #0B0F19" }}>PRESENT</div>
                )}
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px", color: t.mutedText, marginBottom: "6px" }}>
                  {m.id} {m.present ? `· ${m.time}` : "· absent"}
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
        )}
      </div>
    </div>
  );
}