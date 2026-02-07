import { useState } from "react";
import Header from "../components/Header";
import PromptInput from "../components/PromptInput";
import ResponsePanel from "../components/ResponsePanel";
import FileUpload from "../components/FileUpload";

import "../styles/dashboard.css";

export default function Dashboard() {
  const [result, setResult] = useState(null); 
  
  // 1. Lift the code state here so both child components can access it
  const [code, setCode] = useState("// Paste your code here...");

  return (
    <div className="dashboard">
      <Header />

      <main className="main-content">
        <div className="left-panel">
          {/* 2. Pass both the code and setCode to the Editor */}
          <PromptInput 
            code={code} 
            setCode={setCode} 
            setResult={setResult} 
          /> 
          
          {/* 3. Pass setCode to the FileUpload so it can update the editor */}
          <FileUpload setCode={setCode} />
        </div>

        <div className="right-panel">
          <ResponsePanel result={result} /> 
        </div>
      
      </main>
    </div>
  );
}