# AI Instance Configuration (`src/ai/ai-instance.ts`)

This module is responsible for initializing and configuring the core Genkit AI instance used throughout the application.

## Overview

It sets up the connection to the underlying AI model provider (Google AI in this case) and registers the defined AI flows so they can be discovered and used by the application.

## Initialization (`ai` constant)

-   **`genkit({...})`**: This function call initializes the Genkit framework.
-   **`promptDir: './prompts'`**: Specifies the directory where AI prompt templates are stored. *Note: Ensure this path is correct relative to your project structure.* If prompts are defined directly in code (like in the flows), this might be less critical, but it's good practice for organizing separate prompt files.
-   **`plugins: [...]`**: An array used to load necessary plugins.
    -   **`googleAI({...})`**: Loads the Google AI plugin, enabling interaction with Google's AI models (like Gemini).
        -   **`apiKey: process.env.GOOGLE_GENAI_API_KEY`**: Configures the plugin with the necessary API key, securely fetched from environment variables. **Ensure the `GOOGLE_GENAI_API_KEY` environment variable is set correctly in your deployment and development environments.**
-   **`model: 'googleai/gemini-2.0-flash'`**: Specifies the default AI model to be used by the Genkit instance for tasks unless overridden in a specific flow or prompt.

## Flow Registration

-   **`import '@/ai/flows/enrich-location-card.ts';`**
-   **`import '@/ai/flows/generate-itinerary.ts';`**

These import statements are crucial. Simply importing the files containing `ai.defineFlow` calls registers those flows with the initialized `ai` instance. This makes the `enrichLocationCardFlow` and `generateItineraryFlow` available for execution through Genkit's mechanisms.

## Usage

Other parts of the application can import the configured `ai` instance from this file to interact with the defined flows or potentially define new prompts and flows using this shared configuration.

```typescript
// Example usage in another file
import { ai } from '@/ai/ai-instance';
import { enrichLocationCard } from '@/ai/flows/enrich-location-card'; // Or directly call the exported function

async function someFunction() {
  // You could potentially use the ai instance directly for other Genkit features
  // or call the specific flow functions:
  const suggestions = await enrichLocationCard({ place: {...}, tripDetails: '...' });
  // ...
}
```