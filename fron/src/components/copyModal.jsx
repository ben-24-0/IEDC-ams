import { useState } from "react";

export default function CopyModal({ t, title, label, value, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setCopied(false);
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
        zIndex: 1000,
      }}
    >
      <div
        style={{
          border: `4px solid ${t.border}`,
          boxShadow: `8px 8px 0 ${t.border}`,
          background: t.panel,
          color: t.ink,
          padding: "28px",
          width: "380px",
        }}
      >
        <h2
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: "20px",
            margin: "0 0 8px",
          }}
        >
          {title}
        </h2>

        <div
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "11px",
            opacity: 0.6,
            marginBottom: "18px",
          }}
        >
          {label}
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "16px",
          }}
        >
          <input
            readOnly
            value={value}
            onClick={(e) => e.target.select()}
            style={{
              flex: 1,
              minWidth: 0,
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "16px",
              fontWeight: 700,
              background: t.bg,
              color: t.ink,
              border: "2px solid #666",
              padding: "10px",
            }}
          />

            <button
            type="button"
            className="brutal-btn"
            onClick={handleCopy}
            style={{
                background: copied ? "#22C55E" : t.accentSolid,
                color: "#fff",
                padding: "10px 14px",
                fontSize: "11px",
                fontWeight: 700,
                minWidth: "72px",
            }}
            >
            {copied ? "COPIED!" : "COPY"}
            </button>
        </div>

        <div
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "10px",
            opacity: 0.5,
            marginBottom: "18px",
          }}
        >
          This value will not be shown again. Make sure you copy it before
          closing.
        </div>

        <button
          type="button"
          className="brutal-btn"
          onClick={onClose}
          style={{
            width: "100%",
            background: t.panel,
            color: t.ink,
            padding: "9px",
            fontSize: "11px",
          }}
        >
          DONE
        </button>
      </div>
    </div>
  );
}