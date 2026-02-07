import { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import "../styles/promptInput.css";
import { API_BASE_URL } from "../api/config";

export default function PromptInput({code, setCode, setResult }) {
  const [language, setLanguage] = useState("javascript");
  const [loading, setLoading] = useState(false);
  const [fixedCode, setFixedCode] = useState(null);
  
  const editorRef = useRef(null);

  // 1. Capture the editor instance to set red lines later
  function handleEditorDidMount(editor, monaco) {
    editorRef.current = { editor, monaco };
  }

  // Inside PromptInput.jsx analyze function
  const analyze = async () => {
    setLoading(true);
    setFixedCode(null); // Reset previous fix

    // Clear previous red lines
    if (editorRef.current) {
      const { editor, monaco } = editorRef.current;
      monaco.editor.setModelMarkers(editor.getModel(), "owner", []);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language })
      });
      const data = await res.json();
      setResult(data);
      setFixedCode(data.fixedCode); // This enables the "Apply AI Fix" button

      // Apply Red Highlighting
      if (data.issues && editorRef.current) {
        const { editor, monaco } = editorRef.current;
        const markers = data.issues.map(issue => {
          let lineNum = 1;
          // Logic to extract line number from either string or object
          if (typeof issue === 'string') {
            const match = issue.match(/Line (\d+)/i);
            lineNum = match ? parseInt(match[1]) : 1;
          } else {
            lineNum = issue.line || 1;
          }

          return {
            startLineNumber: lineNum,
            startColumn: 1,
            endLineNumber: lineNum,
            endColumn: 1000,
            message: typeof issue === 'string' ? issue : (issue.message || "Syntax Error"),
            severity: monaco.MarkerSeverity.Error
          };
        });
        monaco.editor.setModelMarkers(editor.getModel(), "owner", markers);
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  const handleApplyFix = () => {
    if (fixedCode && editorRef.current) {
      const { editor, monaco } = editorRef.current;
      setCode(fixedCode);
      setFixedCode(null);
      // Clear markers once code is fixed
      monaco.editor.setModelMarkers(editor.getModel(), "owner", []);
    }
  };

  return (
    <div className="card prompt-card">
      <div className="prompt-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <h3>Code Editor</h3>
        <div className="controls" style={{ display: 'flex', gap: '10px' }}>
          {fixedCode && (
            <button className="fix-btn" onClick={handleApplyFix} style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
              ✨ Apply AI Fix
            </button>
          )}
          <select value={language} onChange={e => setLanguage(e.target.value)}>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
          <button onClick={analyze} disabled={loading} className="analyze-btn">
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      </div>
      <div className="editor-container" style={{ border: '1px solid #444', borderRadius: '4px', overflow: 'hidden' }}>
        <Editor
          height="400px"
          theme="vs-dark"
          language={language}
          value={code}
          onMount={handleEditorDidMount}
          onChange={(val) => setCode(val || "")}
          options={{ minimap: { enabled: false }, fontSize: 14, automaticLayout: true }}
        />
      </div>
    </div>
  );
}