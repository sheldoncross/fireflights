'use server';
/**
 * @fileOverview Enriches a location card with tailored suggestions for activities and dining based on user preferences using Langchain.
 *
 * - enrichLocationCard - A function that enriches a location card.
 * - EnrichLocationCardInputSchema - Zod schema for the input.
 * - EnrichLocationCardOutputSchema - Zod schema for the output.
 * - EnrichLocationCardInput - The input type for the enrichLocationCard function.
 * - EnrichLocationCardOutput - The return type for the enrichLocationCard function.
 */

import { z } from 'zod';
import { model } from '@/ai/ai-instance'; // Import the Langchain model instance
import { Place } from '@/services/places'; // Assuming this path is correct
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from "@langchain/core/runnables";

// --- Input Schema Definition ---
export const EnrichLocationCardInputSchema = z.object({
  place: z.object({
    name: z.string().describe('The name of the place.'),
    description: z.string().describe('A brief description of the place.'),
    lat: z.number().describe('The latitude of the location.'),
    lng: z.number().describe('The longitude of the location.'),
  }).describe('The place to enrich.'),
  tripDetails: z.string().describe('The user-provided trip details and preferences.'),
});
export type EnrichLocationCardInput = z.infer<typeof EnrichLocationCardInputSchema>;

// --- Output Schema Definition ---
export const EnrichLocationCardOutputSchema = z.object({
  suggestions: z.array(
    z.object({
      type: z.enum(['activity', 'dining']).describe('The type of suggestion.'),
      description: z.string().describe('A description of the suggestion.'),
    })
  ).describe('Tailored suggestions for activities and dining.'),
});
export type EnrichLocationCardOutput = z.infer<typeof EnrichLocationCardOutputSchema>;

// --- Langchain Prompt Template ---
const promptTemplate = ChatPromptTemplate.fromMessages([
  ["system", `You are a helpful trip advisor AI. Your goal is to provide tailored suggestions for activities and dining based on a given place and the user's trip details. Respond ONLY with the JSON object conforming to the output schema.`],
  ["human", `Please provide suggestions for the following place based on my trip details.\n\nPlace:\nName: {placeName}\nDescription: {placeDescription}\n\nTrip Details: {tripDetails}\n\nOutput JSON:`]
]);

// --- Langchain Chain Definition ---
// Create a chain that binds the model with the structured output schema
const structuredLlm = model.withStructuredOutput(EnrichLocationCardOutputSchema, {
    name: "enrichLocationCardOutput", // Optional name for the structured output function
});

// Combine prompt, model (with structured output) into a runnable sequence
const enrichLocationCardChain = RunnableSequence.from([
    // Map input fields to prompt template variables
    (input: EnrichLocationCardInput) => ({
        placeName: input.place.name,
        placeDescription: input.place.description,
        tripDetails: input.tripDetails,
    }),
    promptTemplate,
    structuredLlm,
]);


// --- Exported Function ---
/**
 * Enriches a location card by invoking the Langchain chain.
 * @param input The input containing place details and trip preferences.
 * @returns A promise that resolves to the structured output with suggestions.
 */
export async function enrichLocationCard(input: EnrichLocationCardInput): Promise<EnrichLocationCardOutput> {
  // Validate input against the Zod schema before invoking the chain
  const validatedInput = EnrichLocationCardInputSchema.parse(input);
  return enrichLocationCardChain.invoke(validatedInput);
}
