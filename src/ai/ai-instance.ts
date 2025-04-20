import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// Initialize the Langchain model with Google AI
// Note: Ensure GOOGLE_API_KEY is set in your environment variables.
// The model name corresponds to genkit's 'googleai/gemini-2.0-flash'.
export const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-preview-04-17", // Or "gemini-1.5-flash" if available and preferred
  maxOutputTokens: 2048, // Adjust as needed
  apiKey: process.env.GOOGLE_GENAI_API_KEY, // Or process.env.GOOGLE_API_KEY depending on your setup
});

// We export the model instance directly.
// The flows will import and use this model.
