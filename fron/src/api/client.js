const BASE_URL = "http://localhost:4000/api";

async function request(path, options = {}, tokenKey = "adminToken") {
  const token = localStorage.getItem(tokenKey);

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const contentType = res.headers.get("content-type") || "";
  const rawBody = await res.text();

  let data = null;
  if (rawBody) {
    if (contentType.includes("application/json")) {
      data = JSON.parse(rawBody);
    } else {
      try {
        data = JSON.parse(rawBody);
      } catch {
        data = null;
      }
    }
  }

  if (!res.ok) {
    if (data?.error) throw new Error(data.error);
    if (rawBody && rawBody.trim().startsWith("<!DOCTYPE")) {
      throw new Error(
        "backend returned an HTML page instead of JSON; check the API server",
      );
    }
    throw new Error("request failed");
  }

  return data;
}

export const adminApi = {
  login: (username, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  getSessions: () => request("/sessions"),
  getSession: (id) => request(`/sessions/${id}`),
  createSession: (session) =>
    request("/sessions", { method: "POST", body: JSON.stringify(session) }),
  updateSession: (id, session) =>
    request(`/sessions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(session),
    }),
  updateStudent: (id, data) =>
    request(`/students/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  startSession: (id) => request(`/sessions/${id}/start`, { method: "PATCH" }),
  closeSession: (id) => request(`/sessions/${id}/close`, { method: "PATCH" }),
  deleteSession: (id) => request(`/sessions/${id}`, { method: "DELETE" }),
  getArchivedStudents: () => request("/students/archived"),

restoreStudent: (id) =>
  request(`/students/${id}/restore`, {
    method: "PATCH",
  }),

deleteArchivedStudent: (id) =>
  request(`/students/archived/${id}`, {
    method: "DELETE",
  }),

// optional alias if old code still references it
getArchived: () => request("/students/archived"),
  getStudents: () => request("/students"),
  getPendingStudents: () => request("/students/pending"),
  approveStudent: (id, studentId) =>
    request(`/students/pending/${id}/approve`, {
      method: "PATCH",
      body: JSON.stringify({ studentId }),
    }),
  createStudent: (student) =>
    request("/students", { method: "POST", body: JSON.stringify(student) }),
  deleteStudent: (id) => request(`/students/${id}`, { method: "DELETE" }),
  rejectStudent: (id) =>
    request(`/students/pending/${id}`, {
      method: "DELETE",
    }),
  captureCard: async ({ timeoutMs = 15000, intervalMs = 1500 } = {}) => {
    await request("/device/last-enroll/clear", { method: "POST" });
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      await new Promise((r) => setTimeout(r, intervalMs));
      const { rfidUid } = await request("/device/last-enroll");
      if (rfidUid) return rfidUid;
    }
    throw new Error("no tap detected - try again");
  },
  manualAttendance: (studentId, sessionId, action) =>
    request("/attendance/manual", {
      method: "POST",
      body: JSON.stringify({ studentId, sessionId, action }),
    }),
  sendWifi: (ssid, password) =>
    request("/device/wifi", {
      method: "POST",
      body: JSON.stringify({ ssid, password }),
    }),
  downloadSessionCsv: async (id, filename) => {
    const token = localStorage.getItem("adminToken");
    const res = await fetch(`${BASE_URL}/reports/session/${id}/csv`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("export failed");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  },
};

export const studentApi = {
  register: (name, username, password) =>
    request("/students/register", {
      method: "POST",
      body: JSON.stringify({ name, username, password }),
    }),
  login: (username, password) =>
    request("/students/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
    
  getStudents: () => request("/students", {}, "studentToken"),
  getSessions: () => request("/sessions", {}, "studentToken"),
  getSession: (id) => request(`/sessions/${id}`, {}, "studentToken"),
  uploadMinutes: (sessionId, minutes) =>
  request(`/sessions/${sessionId}/minutes`, { method: "PATCH", body: JSON.stringify({ minutes }) }, "studentToken"),
};
