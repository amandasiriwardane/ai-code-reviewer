import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toolDefinitions, runTool } from "../utils/tools.js";

const router = express.Router();

// 1. Initialize Gemini with your API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/", async (req, res) => {
  try {
    const { code, language } = req.body;

    // 2. Setup the Model with Tools
    // Gemini 1.5 Flash is recommended for its high free-tier limits
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      // Gemini expects function definitions in a specific format
      tools: [{ functionDeclarations: toolDefinitions.map(t => t.function) }],
    });

    // 3. Start a Chat Session
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: `System: You are an expert Code Reviewer. 
            1. ALWAYS run 'checkSecurity'.
            2. ALWAYS run 'validateSyntax' with the language set to '${language}'.
            3. If there are syntax errors, STOP and report them. Do not review the logic until syntax is fixed.
            4. Your final response MUST be in JSON format with keys: "summary", "issues" (array), and "fixedCode".` }],
        }
      ],
    });

    // 4. Send the code to the Agent
    let result = await chat.sendMessage(code);
    let response = result.response;

    // 5. The Loop: Handle Function Calls (Tools)
    // Gemini automatically identifies if a function needs to be called
    while (response.functionCalls()) {
      const toolResults = [];

      for (const call of response.functionCalls()) {
        const { name, args } = call;
        
        console.log(`[Gemini Agent] Executing Tool: ${name}`);
        const result = runTool(name, args);

        toolResults.push({
          functionResponse: {
            name,
            response: { result }
          }
        });
      }

      // Send tool results back to the model to get the next response
      result = await chat.sendMessage(toolResults);
      response = result.response;
    }

    // 6. Final Clean up and Response
    // Gemini might wrap JSON in markdown backticks; we strip them for safety
    let finalContent = response.text().replace(/```json|```/gi, "").trim();
    
    try {
      res.json(JSON.parse(finalContent));
    } catch (e) {
      // Fallback if the model returns plain text instead of JSON
      res.json({ summary: finalContent, issues: [], fixedCode: null });
    }

  } catch (err) {
    console.error("Gemini Error:", err);
    res.status(500).json({ error: "Agent failed with Gemini API" });
  }
});

export default router;