import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toolDefinitions, runTool } from "../utils/tools.js";

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
  const modelQueue = ["gemini-3-flash-preview", "gemini-1.5-flash"];
  let finalContent = "";
  let modelUsed = "";

  for (const currentModel of modelQueue) {
    try {
      console.log(`[Review System] Attempting with: ${currentModel}`);
      finalContent = await runAgentSession(currentModel, code, language);
      modelUsed = currentModel;
      break; // Success! Exit the loop.
    } catch (err) {
      // If we hit a rate limit (429) and there's another model in the queue, continue
      if (err.status === 429 && currentModel !== modelQueue[modelQueue.length - 1]) {
        console.warn(`[Quota Alert] ${currentModel} limit reached. Switching to fallback...`);
        continue; 
      }
      // Otherwise, it's a real error we can't recover from
      console.error(`[Fatal Error] ${currentModel} failed:`, err.message);
      return res.status(500).json({ error: "Agent analysis failed completely." });
    }
  }

  try {
    const parsedData = JSON.parse(finalContent);
    // We send back modelUsed so the frontend can display it
    res.json({ ...parsedData, modelUsed });
  } catch (e) {
    res.json({ summary: finalContent, issues: [], fixedCode: null, modelUsed });
  }
});

export default router;