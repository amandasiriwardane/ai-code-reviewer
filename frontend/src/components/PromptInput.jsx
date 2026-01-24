import { useState } from "react";
import Editor from "@monaco-editor/react";
import "../styles/promptInput.css";

export default function PromptInput({ setResult }) {
  const [code, setCode] = useState("// Paste your code here...");
  const [language, setLanguage] = useState("javascript");
  const [loading, setLoading] = useState(false);

  // Map our dropdown values to Monaco Editor languages
  const languageMap = {
    javascript: "javascript",
    python: "python",
    java: "java",
    c: "c",
    cpp: "cpp",
    dart: "dart"
  };

  const analyze = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language })
      });
      const data = await res.json();
      setResult(data.review);
    } catch (error) {
      console.error("Error analyzing code:", error);
      setResult("Error: Could not connect to the backend.");
    }
    setLoading(false);
  };

  return (
    <div className="card prompt-card">
      <div className="prompt-header">
        <h3>Code Editor</h3>
        <div className="controls">
          <select
            className="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
            <option value="dart">Dart</option>
          </select>
          
          <button 
            className="analyze-btn" 
            onClick={analyze} 
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Run AI Review"}
          </button>
        </div>
      </div>

      <div className="editor-container">
        <Editor
          height="400px"
          language={languageMap[language]}
          value={code}
          theme="vs-dark"
          onChange={(value) => setCode(value || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}