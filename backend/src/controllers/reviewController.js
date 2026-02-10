import { GoogleGenerativeAI } from "@google/generative-ai";
import { toolDefinitions, runTool } from "../utils/tools.js";
import Review from "../models/Review.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Private Helper for the Agent Loop
const runAgentSession = async (modelName, code, language) => {
  const model = genAI.getGenerativeModel({
    model: modelName,
    tools: [{ functionDeclarations: toolDefinitions.map(t => t.function) }],
  });

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: `System: You are an expert Code Reviewer. 
          1. ALWAYS run 'checkSecurity'.
          2. ALWAYS run 'validateSyntax' with the language set to '${language}'.
          3. If there are syntax errors, STOP and report them.
          4. Your final response MUST be in JSON format with keys: "summary", "issues" (array), and "fixedCode".` }],
      }
    ],
  });

  let result = await chat.sendMessage(code);
  let response = result.response;

  while (response.functionCalls()) {
    const toolResults = [];
    for (const call of response.functionCalls()) {
      const { name, args } = call;
      const toolOutput = runTool(name, args);
      toolResults.push({
        functionResponse: { name, response: { result: toolOutput } }
      });
    }
    result = await chat.sendMessage(toolResults);
    response = result.response;
  }

  return response.text().replace(/```json|```/gi, "").trim();
};

// Main Controller Functions
export const createReview = async (req, res) => {
  const { code, language } = req.body;
  const modelQueue = ["gemini-3-flash-preview", "gemini-2.5-flash", "gemini-2.5-flash-lite"];
  
  let finalContent = "";
  let modelUsed = "";

  for (const currentModel of modelQueue) {
    try {
      finalContent = await runAgentSession(currentModel, code, language);
      modelUsed = currentModel;
      break; 
    } catch (err) {
      const canRetry = err.status === 429 || err.status === 404;
      if (canRetry && currentModel !== modelQueue[modelQueue.length - 1]) continue;
      return res.status(500).json({ error: "Analysis failed. Please try again later." });
    }
  }

  try {
    let parsedData;
    try {
      parsedData = JSON.parse(finalContent);
    } catch (e) {
      parsedData = { summary: finalContent, issues: [], fixedCode: null };
    }

    // AUTH UPDATE: Link to the logged-in user!
    const savedReview = await Review.create({
      userId: req.user._id, // Provided by our new protect middleware
      code,
      language,
      summary: parsedData.summary,
      modelUsed,
      issues: parsedData.issues,
      fixedCode: parsedData.fixedCode
    });

    res.json({ ...parsedData, modelUsed, id: savedReview._id });
  } catch (err) {
    res.status(500).json({ error: "Failed to process and save review" });
  }
};

export const getHistory = async (req, res) => {
  try {
    // AUTH UPDATE: Fetch ONLY reviews for the current user
    const history = await Review.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
};