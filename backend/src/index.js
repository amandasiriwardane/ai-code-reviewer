import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  geminiKey: process.env.GEMINI_API_KEY,
  frontendUrl: process.env.FRONTEND_URL
};