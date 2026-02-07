import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toolDefinitions, runTool } from "../utils/tools.js";
import Review from "../models/Review.js";

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to handle the Agent Loop for a specific model
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

  // Tool Handling Loop
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

router.post("/", async (req, res) => {
  const { code, language } = req.body;
  
  // List models in order of preference
  const modelQueue = [
    "gemini-3-flash-preview",  // 1. Try the smartest (Low Quota)
    "gemini-2.5-flash",        // 2. Fallback to the stable workhorse (High Quota)
    "gemini-2.5-flash-lite"    // 3. Final fallback for speed
  ];
  let finalContent = "";
  let modelUsed = "";

  for (const currentModel of modelQueue) {
    try {
      console.log(`[Review System] Attempting with: ${currentModel}`);
      finalContent = await runAgentSession(currentModel, code, language);
      modelUsed = currentModel;
      break; // Success!
    } catch (err) {
      // Check for Rate Limit (429) OR Missing Model (404)
      const canRetry = err.status === 429 || err.status === 404;
      const isLastModel = currentModel === modelQueue[modelQueue.length - 1];

      if (canRetry && !isLastModel) {
        console.warn(`[System] ${currentModel} unavailable (Status: ${err.status}). Trying next...`);
        continue; 
      }
      
      // If it's the last model or a different error (Safety, 500), stop.
      console.error(`[Fatal Error] Final attempt failed on ${currentModel}:`, err.message);
      return res.status(500).json({ error: "Analysis failed. Please try again later." });
    }
  }

  try {
    const parsedData = JSON.parse(finalContent);
    // We send back modelUsed so the frontend can display it
    res.json({ ...parsedData, modelUsed });
  } catch (e) {
    res.json({ summary: finalContent, issues: [], fixedCode: null, modelUsed });
  }
  const savedReview = await Review.create({
    code,
    language,
    summary: parsedData.summary,
    modelUsed,
    issues: parsedData.issues,
    fixedCode: parsedData.fixedCode
  });

  res.json({ ...parsedData, modelUsed, id: savedReview._id });
});

router.get("/history", async (req, res) => {
  try {
    const history = await Review.find().sort({ createdAt: -1 }).limit(10);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

export default router;