import "../styles/header.css";
import logo from "../assests/logo.png"; 

export default function Header() {
  return (
    <header className="header">
      <div className="header-brand">
        <img src={logo} alt="Project Logo" className="header-logo" />
        <p className="header-subtitle">LLM-powered code analysis with contextual feedback</p>
      </div>
    </header>
  );
}