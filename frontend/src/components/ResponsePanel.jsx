import ReactMarkdown from 'react-markdown';
import "../styles/responsePanel.css";

export default function ResponsePanel({ result }) { 
  return (
    <div className="card response">
      <h3>AI Agent Report</h3>
      <div className="markdown-output">
        {result ? (
          <ReactMarkdown>{result}</ReactMarkdown>
        ) : (
          <p style={{color: "#888"}}>
            Waiting for code...<br/>
            <small>(Agent will check syntax and security automatically)</small>
          </p>
        )}
      </div>
    </div>
  );
}