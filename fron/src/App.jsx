import { useState } from "react";
import StudentDashboard from "./StudentDashBoard";
function App() {
  const [count, setCount] = useState(0);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16 text-slate-900">
      <StudentDashboard/>
    </main>
  );
}

export default App;
