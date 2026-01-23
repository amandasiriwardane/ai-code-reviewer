import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/health")
      .then(res => res.json())
      .then(data => setStatus(data.status));
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>AI Code Review Assistant</h1>
      <p>{status}</p>
    </div>
  );
}

export default App;
