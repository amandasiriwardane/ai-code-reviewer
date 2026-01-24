import { useState } from "react";
import Header from "../components/Header";
import PromptInput from "../components/PromptInput";
import ResponsePanel from "../components/ResponsePanel";
import FileUpload from "../components/FileUpload";

import "../styles/dashboard.css";

export default function Dashboard() {
  const [result, setResult] = useState(""); // store AI review here

  return (
    <div className="dashboard">
      <Header />

      <main className="main-content">
        <div className="left-panel">
          <PromptInput setResult={setResult} /> {/* pass setter */}
          <FileUpload />
        </div>

        <div className="right-panel">
          <ResponsePanel result={result} /> {/* pass AI response */}
        </div>
      </main>
    </div>
  );
}
