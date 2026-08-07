import { useState } from "react";
import { studentApi } from "../api/client";

const t = {
  bg: "#060608",
  panel: "#101018",
  ink: "#FFFFFF",
  border: "#FFFFFF",
  accentSolid: "#3B5FFF",
  accentGradient: "linear-gradient(90deg, #1A2A8F, #4D6BFF)",
  cyan: "#00E5FF",
};

export default function StudentLogin({ onLogin }) {
  const [mode, setMode] = useState("login"); // login | register
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const { token, team } = await studentApi.login(username, password);
      localStorage.setItem("studentToken", token);
      localStorage.setItem("studentTeam", team || "");
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      await studentApi.register(name, username, password);
      setInfo("registered! waiting for admin approval before you can log in.");
      setMode("login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: t.bg,
        color: t.ink,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Inter:wght@400;600&family=JetBrains+Mono:wght@500&display=swap');
        .brutal-input {
          font-family: 'JetBrains Mono', monospace;
          border: 2px solid ${t.border};
          background: ${t.panel};
          color: ${t.ink};
          padding: 10px 12px;
          width: 100%;
          font-size: 14px;
        }
        .brutal-input:focus { outline: 2px solid ${t.cyan}; }
      `}</style>

      <form
        onSubmit={mode === "login" ? handleLogin : handleRegister}
        style={{
          border: `4px solid ${t.border}`,
          boxShadow: `8px 8px 0 ${t.border}`,
          background: t.panel,
          padding: "32px",
          width: "340px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "4px",
            background: t.accentGradient,
            marginBottom: "10px",
          }}
        />
        <h1
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: "22px",
            margin: "0 0 4px",
          }}
        >
          IEDC{" "}
          <span style={{ opacity: 0.6, fontWeight: 500, fontSize: "14px" }}>
            FISAT
          </span>
        </h1>
        <div
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "11px",
            opacity: 0.5,
            marginBottom: "20px",
          }}
        >
          {mode === "login" ? "MEMBER LOGIN" : "MEMBER REGISTER"}
        </div>

        {mode === "register" && (
          <>
            <label
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "11px",
                opacity: 0.6,
              }}
            >
              FULL NAME
            </label>
            <input
              className="brutal-input"
              style={{ marginTop: "4px", marginBottom: "16px" }}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </>
        )}

        <label
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "11px",
            opacity: 0.6,
          }}
        >
          email
        </label>
        <input
          className="brutal-input"
          style={{ marginTop: "4px", marginBottom: "16px" }}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
          style={{ marginTop: "4px", marginBottom: "20px" }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
        {info && (
          <div
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "12px",
              color: t.cyan,
              marginBottom: "14px",
            }}
          >
            {info}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: 700,
            border: `3px solid ${t.border}`,
            boxShadow: `4px 4px 0 ${t.border}`,
            background: t.accentSolid,
            color: "#fff",
            padding: "10px",
            width: "100%",
            cursor: "pointer",
            fontSize: "13px",
            marginBottom: "12px",
          }}
        >
          {loading ? "..." : mode === "login" ? "LOGIN" : "REGISTER"}
        </button>

        <div
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "11px",
            opacity: 0.6,
            textAlign: "center",
            cursor: "pointer",
          }}
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
            setInfo("");
          }}
        >
          {mode === "login"
            ? "new member? register here"
            : "already have an account? login"}
        </div>
      </form>
    </div>
  );
}
