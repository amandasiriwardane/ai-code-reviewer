import ReactMarkdown from 'react-markdown';
import "../styles/responsePanel.css";

export default function ResponsePanel({ result }) { 
  // Professional empty state with the shimmer effect logic
  if (!result) {
    return (
      <div className="card response empty-state">
        <div className="shimmer-line"></div>
        <p>Awaiting code for analysis...</p>
      </div>
    );
  }

  const summary = result.summary || "";
  const issues = Array.isArray(result.issues) ? result.issues : [];

  const getIssueDetails = (issue) => {
    if (typeof issue === 'string') {
      const match = issue.match(/Line (\d+)/i);
      return { 
        line: match ? match[1] : "??", 
        message: issue 
      };
    }
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
        {/* Render markdown to support bold, lists, and backticks in the AI summary */}
        <ReactMarkdown>{summary}</ReactMarkdown>
      </div>

      <div className="issues-section">
        <h3>Issues Found ({issues.length})</h3>
        {issues.map((issue, index) => {
          const { line, message } = getIssueDetails(issue);
          return (
            <div key={index} className="issue-card error">
              <div className="issue-header">
                <span className="badge-error">ERROR</span>
                <span className="line-number">Line {line}</span>
              </div>
              {/* Markdown support for individual issue descriptions */}
              <div className="issue-message">
                <ReactMarkdown>{message}</ReactMarkdown>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}