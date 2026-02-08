import { useState } from "react";
import Header from "../components/Header";
import PromptInput from "../components/PromptInput";
import ResponsePanel from "../components/ResponsePanel";
import FileUpload from "../components/FileUpload";
import Sidebar from "../components/Sidebar";
import "../styles/dashboard.css";

export default function Dashboard() {
  const [result, setResult] = useState(null); 
  const [code, setCode] = useState("// Paste your code here...");
  const [refreshHistory, setRefreshHistory] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Toggle state

  return (
    <div className="app-container">
      {/* 1. Sidebar on the far left */}
      <div className={`sidebar-wrapper ${isSidebarOpen ? "expanded" : "collapsed"}`}>
        <button className="sidebar-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? "✕" : "☰"}
        </button>
        <Sidebar 
          isSidebarOpen={isSidebarOpen}
          onSelect={(item) => {
            setCode(item.code);
            setResult(item);
          }} 
          currentId={result?._id}
          triggerRefresh={refreshHistory} 
        />
      </div>

      {/* 2. Main Content Area */}
      <div className="main-viewport">
        <Header />
        <main className="workspace">
          {/* Left Panel: Editor & File Upload */}
          <div className="panel scrollable-panel left-panel">
            <PromptInput 
              code={code} 
              setCode={setCode} 
              setResult={(data) => {
                setResult(data);
                setRefreshHistory(prev => prev + 1);
              }} 
            /> 
            <FileUpload setCode={setCode} />
          </div>

          {/* Right Panel: Results */}
          <div className="panel scrollable-panel right-panel">
            <ResponsePanel result={result} /> 
          </div>
        </main>
      </div>
    </div>
  );
}