import * as acorn from "acorn";

// --- VALIDATION STRATEGIES ---

const validators = {
  // 1. JavaScript: Full AST parsing (Most accurate)
  javascript: (code) => {
    try {
      acorn.parse(code, { ecmaVersion: 2022 });
      return { valid: true, error: null };
    } catch (e) {
      return { valid: false, error: `Syntax Error (Line ${e.loc?.line}): ${e.message}` };
    }
  },

  // 2. Python: Checks indentation and colons (Heuristic)
  python: (code) => {
    const lines = code.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      // Check if def/class/if/for/while ends with colon
      if (/^(def|class|if|for|while|elif|else|try|except|finally|with)/.test(line) && !line.endsWith(":")) {
        return { valid: false, error: `Syntax Error (Line ${i + 1}): Missing colon ':' after statement.` };
      }
    }
    return { valid: true, error: null };
  },

  // 3. Java / C / C++ / Dart: Checks generic "C-style" syntax
  c_style: (code) => {
    // Check for balanced braces {}
    let balance = 0;
    for (const char of code) {
      if (char === "{") balance++;
      if (char === "}") balance--;
    }
    if (balance !== 0) {
      return { valid: false, error: "Syntax Error: Mismatched curly braces '{ }'. Check your code blocks." };
    }
    
    // Check for missing semicolons (rough check)
    // We skip lines starting with //, #, imports, or ending with { or }
    const lines = code.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.length > 0 && 
          !line.startsWith("//") && 
          !line.startsWith("#") && 
          !line.startsWith("/*") &&
          !line.endsWith("{") && 
          !line.endsWith("}") && 
          !line.endsWith(";") &&
          !line.includes("function") // JS specific but safe to ignore
         ) {
         // This is a "strict" check, might trigger false positives but good for demo
         // return { valid: false, error: `Potential missing semicolon at line ${i + 1}` };
      }
    }
    return { valid: true, error: null };
  }
};

// --- TOOL DEFINITIONS ---

export const toolDefinitions = [
  {
    type: "function",
    function: {
      name: "validateSyntax",
      description: "Checks if the code has valid syntax for the given language.",
      parameters: {
        type: "object",
        properties: {
          code: { type: "string", description: "The code to check" },
          language: { 
            type: "string", 
            enum: ["javascript", "java", "python", "c", "cpp", "dart"],
            description: "The programming language of the code"
          }
        },
        required: ["code", "language"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "checkSecurity",
      description: "Scans code for hardcoded secrets like API keys or passwords.",
      parameters: {
        type: "object",
        properties: {
          code: { type: "string", description: "The code to scan" }
        },
        required: ["code"]
      }
    }
  }
];

// --- RUNNER ---

export const runTool = (name, args) => {
  if (name === "checkSecurity") {
    // Universal security check (same as before)
    const patterns = [
      { name: "API Key", regex: /sk-[a-zA-Z0-9]{20,}/ },
      { name: "AWS Key", regex: /AKIA[0-9A-Z]{16}/ },
      { name: "Hardcoded Password", regex: /password\s*=\s*['"][^'"]+['"]/i }
    ];
    const findings = [];
    patterns.forEach(p => { if (p.regex.test(args.code)) findings.push(p.name); });
    return { safe: findings.length === 0, issues: findings };
  }

  if (name === "validateSyntax") {
    const lang = args.language.toLowerCase();
    
    if (lang === "javascript") return validators.javascript(args.code);
    if (lang === "python") return validators.python(args.code);
    if (["java", "c", "cpp", "dart"].includes(lang)) return validators.c_style(args.code);
    
    return { valid: true, note: "Language checking skipped (unsupported parser)" };
  }

  throw new Error(`Tool ${name} not found`);
};