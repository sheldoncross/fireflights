// src/ai/flows/generate-itinerary.ts
'use server';

/**
 * @fileOverview Generates a personalized trip itinerary based on user input using Langchain.
 *
 * - generateItinerary - A function that generates a trip itinerary.
 * - GenerateItineraryInputSchema - Zod schema for the input.
 * - GenerateItineraryOutputSchema - Zod schema for the output.
 * - GenerateItineraryInput - The input type for the generateItinerary function.
 * - GenerateItineraryOutput - The return type for the generateItinerary function.
 */

import { z } from 'zod';
import { model } from '@/ai/ai-instance'; // Import the Langchain model instance
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from "@langchain/core/runnables";

// --- Input Schema Definition ---
export const GenerateItineraryInputSchema = z.object({
  tripDetails: z.string().describe('Detailed description of the desired trip, including locations, dates, preferences, and activities.'),
});
export type GenerateItineraryInput = z.infer<typeof GenerateItineraryInputSchema>;

// --- Output Schema Definition ---
export const GenerateItineraryOutputSchema = z.object({
  itinerary: z.array(
    z.object({
      location: z.string().describe('The name of the location.'),
      activities: z.array(z.string()).describe('A list of suggested activities at this location.'),
      duration: z.string().describe('The suggested duration of stay at this location.'),
    })
  ).describe('A detailed trip itinerary with locations, activities, and durations.'),
});
export type GenerateItineraryOutput = z.infer<typeof GenerateItineraryOutputSchema>;


// --- Langchain Prompt Template ---
const promptTemplate = ChatPromptTemplate.fromMessages([
  ["system", `You are a helpful trip planning expert. Your goal is to generate a detailed and efficient trip itinerary based on the user's preferences and trip details. Ensure the itinerary is logical and provides a good balance of activities and rest. Respond ONLY with the JSON object conforming to the output schema.`],
  ["human", `Please generate a trip itinerary based on the following details:\n\nTrip Details: {tripDetails}\n\nOutput JSON:`]
]);

// --- Langchain Chain Definition ---
// Create a chain that binds the model with the structured output schema
const structuredLlm = model.withStructuredOutput(GenerateItineraryOutputSchema, {
    name: "generateItineraryOutput", // Optional name for the structured output function
});

// Combine prompt, model (with structured output) into a runnable sequence
const generateItineraryChain = RunnableSequence.from([
    promptTemplate,
    structuredLlm,
]);

// --- Exported Function ---
/**
 * Generates a trip itinerary by invoking the Langchain chain.
 * @param input The input containing trip details.
 * @returns A promise that resolves to the structured output with the itinerary.
 */
export async function generateItinerary(input: GenerateItineraryInput): Promise<GenerateItineraryOutput> {
  // Validate input against the Zod schema before invoking the chain
  const validatedInput = GenerateItineraryInputSchema.parse(input);
  // The input schema directly matches the prompt template variable {tripDetails}
  return generateItineraryChain.invoke(validatedInput);
}