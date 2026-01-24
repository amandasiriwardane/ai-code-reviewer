import express from "express";
import OpenAI from "openai";
import { toolDefinitions, runTool } from "../utils/tools.js";

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/", async (req, res) => {
  try {
    const { code , language} = req.body;

    // 1. Initialize the conversation
    const messages = [
      { 
        role: "system", 
        content: `You are an expert Code Reviewer. 
        1. ALWAYS run 'checkSecurity'.
        2. ALWAYS run 'validateSyntax' with the language set to '${language}'.
        3. If there are syntax errors, STOP and report them. Do not review the logic until syntax is fixed.`
      },
      { role: "user", content: code }
    ];

    // 2. First Call: Ask OpenAI what to do
    let response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Cost effective
      messages: messages,
      tools: toolDefinitions,
      tool_choice: "auto", // Let AI decide
    });

    let message = response.choices[0].message;

    // 3. The Loop: If AI wants to use tools, run them
    while (message.tool_calls) {
      // Add the AI's request to history
      messages.push(message);

      for (const toolCall of message.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);

        // Execute the actual Javascript function
        const toolResult = runTool(toolName, toolArgs);

        // Add the result to history
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult),
        });
      }

      // 4. Second Call: Send tool results back to OpenAI for final answer
      response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages,
      });

      message = response.choices[0].message;
    }

    // 5. Final Response
    res.json({ review: message.content });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Agent failed" });
  }
});

export default router;