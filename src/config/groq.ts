import Groq from "groq-sdk";

if (!process.env.GROQ_API_KEY) {
  console.warn("⚠️  GROQ_API_KEY is not set. AI features will not work.");
}

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Model used across the app for text generation / reasoning tasks
export const GROQ_MODEL = "llama-3.3-70b-versatile";
