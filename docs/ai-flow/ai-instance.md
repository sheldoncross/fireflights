# AI Model Configuration (`src/ai/ai-instance.ts`)

This module is responsible for initializing and configuring the core Langchain AI model instance used throughout the application.

## Overview

It sets up the connection to the underlying AI model provider (Google AI via `@langchain/google-genai`) using the `ChatGoogleGenerativeAI` class. This instance can then be imported and used by different parts of the application, such as the AI flows.

## Initialization (`model` constant)

-   **`new ChatGoogleGenerativeAI({...})`**: This constructor initializes the Langchain model wrapper for Google's Generative AI models (like Gemini).
    -   **`modelName: "gemini-pro"`**: Specifies the specific Google AI model to use. You might adjust this based on availability and needs (e.g., `"gemini-1.5-flash"`).
    -   **`maxOutputTokens: 2048`**: Configures the maximum number of tokens the model is expected to generate in a single response. Adjust as needed for your use case.
    -   **`apiKey: process.env.GOOGLE_GENAI_API_KEY`**: Configures the client with the necessary API key, securely fetched from environment variables. **Ensure the `GOOGLE_GENAI_API_KEY` (or potentially `GOOGLE_API_KEY`) environment variable is set correctly in your deployment and development environments.** Langchain might default to `GOOGLE_API_KEY`.

## Usage

Other modules, particularly the AI flow files (`enrich-location-card.ts`, `generate-itinerary.ts`), import the configured `model` instance from this file. This shared instance is then used within Langchain chains (`RunnableSequence`) to interact with the Google AI model.

```typescript
// Example usage in another file (e.g., an AI flow)
import { model } from '@/ai/ai-instance';
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";

// Define a prompt and chain using the imported model
const prompt = ChatPromptTemplate.fromTemplate("Tell me a joke about {topic}");
const chain = RunnableSequence.from([prompt, model]);

async function getJoke(topic: string) {
  const result = await chain.invoke({ topic });
  console.log(result.content);
}
```

Unlike Genkit's flow registration via imports, Langchain relies on standard JavaScript/TypeScript module imports. The flows import the `model` and construct their chains using Langchain primitives. There's no separate registration step needed in this file.