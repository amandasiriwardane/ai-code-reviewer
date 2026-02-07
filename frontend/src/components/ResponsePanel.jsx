import ReactMarkdown from 'react-markdown';
import "../styles/responsePanel.css";

export default function ResponsePanel({ result }) { 
  if (!result) return <div className="card response"><p>Waiting for code...</p></div>;

  const summary = result.summary || "";
  const issues = Array.isArray(result.issues) ? result.issues : [];

  const getIssueDetails = (issue) => {
    // Check if the issue is a string (standard AI string format)
    if (typeof issue === 'string') {
      const match = issue.match(/Line (\d+)/i);
      return { 
        line: match ? match[1] : "??", 
        message: issue 
      };
    }
    // Check if the issue is already an object {line, message}
    if (typeof issue === 'object' && issue !== null) {
      return { 
        line: issue.line || "??", 
        message: issue.message || issue.description || "Issue details unavailable" 
      };
    }
    return { line: "??", message: "Unknown format" };
  };

  return (
    <div className="card response">
      <div className="review-summary">
        <h3>Summary</h3>
        <p>{summary}</p>
      </div>

      <div className="issues-section">
        <h3>Issues Found ({issues.length})</h3>
        {issues.map((issue, index) => {
          const { line, message } = getIssueDetails(issue);
          return (
            <div key={index} className="issue-card error">
              <span className="badge-error">ERROR</span>
              <span className="line-number">Line {line}</span>
              <p className="issue-message">{message}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}