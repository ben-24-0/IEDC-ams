import { useState, useEffect } from "react";
import { studentApi } from "../api/client"; // Ensure this path matches your project structure

export default function MinutesEditor({ t, session, canEdit }) {
  const [minutesText, setMinutesText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    if (session) {
      setMinutesText(session.minutes || "");
      setFeedback({ type: "", message: "" });
    }
  }, [session?.id, session?.minutes]);

  const isPending = session?.status === "PENDING";
  const isDisabled = !canEdit || isPending || isSaving;

  // --- UPDATED SAVE FUNCTION ---
  const handleSave = async () => {
    setIsSaving(true);
    setFeedback({ type: "", message: "" });
    
    try {
      // Using your exact studentApi method
      await studentApi.uploadMinutes(session.id, minutesText);
      
      setFeedback({ type: "success", message: "MINUTES SAVED" });
      setTimeout(() => setFeedback({ type: "", message: "" }), 3000);
    } catch (err) {
      setFeedback({ type: "error", message: err.message || "Failed to save" });
    } finally {
      setIsSaving(false);
    }
  };
  // -----------------------------

  if (!canEdit) {
    return (
      <div 
        style={{ 
          fontSize: "13px", 
          lineHeight: 1.5, 
          whiteSpace: "pre-wrap",
          padding: "12px",
          border: `2px dashed ${t.border}`,
          background: t.bg,
          opacity: 0.8
        }}
      >
        {session?.minutes || "No minutes recorded yet."}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <textarea
        value={minutesText}
        onChange={(e) => setMinutesText(e.target.value)}
        disabled={isDisabled}
        placeholder={
          isPending 
            ? "WAITING FOR SESSION TO START..." 
            : "Type meeting minutes here..."
        }
        style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "13px",
          border: `2px solid ${t.border}`,
          background: isDisabled ? t.bg : t.panel,
          color: t.ink,
          padding: "12px",
          minHeight: "150px",
          resize: "vertical",
          outline: "none",
          opacity: isDisabled ? 0.6 : 1,
        }}
        onFocus={(e) => {
          if (!isDisabled) e.target.style.outline = `2px solid ${t.cyan}`;
        }}
        onBlur={(e) => {
          e.target.style.outline = "none";
        }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px" }}>
          {feedback.message && (
            <span style={{ color: feedback.type === "error" ? "#FF5C5C" : t.cyan }}>
              {feedback.type === "error" ? `! ${feedback.message}` : `> ${feedback.message}`}
            </span>
          )}
          {isPending && !feedback.message && (
             <span style={{ color: "#FF5C5C", opacity: 0.8 }}>
               ! Cannot edit minutes until session status is ACTIVE
             </span>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={isDisabled}
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: 700,
            fontSize: "13px",
            border: `2px solid ${t.border}`,
            boxShadow: isDisabled ? "none" : `3px 3px 0 ${t.border}`,
            background: isDisabled ? "transparent" : t.accentSolid,
            color: t.ink,
            padding: "6px 16px",
            cursor: isDisabled ? "not-allowed" : "pointer",
            transform: isDisabled ? "translate(3px, 3px)" : "none",
            transition: "all 0.1s",
          }}
        >
          {isSaving ? "SAVING..." : "SAVE MINUTES"}
        </button>
      </div>
    </div>
  );
}