// src/ai/flows/generate-itinerary.ts
'use server';

/**
 * @fileOverview Generates a personalized trip itinerary based on user input.
 *
 * - generateItinerary - A function that generates a trip itinerary.
 * - GenerateItineraryInput - The input type for the generateItinerary function.
 * - GenerateItineraryOutput - The return type for the generateItinerary function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateItineraryInputSchema = z.object({
  tripDetails: z.string().describe('Detailed description of the desired trip, including locations, dates, preferences, and activities.'),
});
export type GenerateItineraryInput = z.infer<typeof GenerateItineraryInputSchema>;

const GenerateItineraryOutputSchema = z.object({
  itinerary: z.array(
    z.object({
      location: z.string().describe('The name of the location.'),
      activities: z.array(z.string()).describe('A list of suggested activities at this location.'),
      duration: z.string().describe('The suggested duration of stay at this location.'),
    })
  ).describe('A detailed trip itinerary with locations, activities, and durations.'),
});
export type GenerateItineraryOutput = z.infer<typeof GenerateItineraryOutputSchema>;

export async function generateItinerary(input: GenerateItineraryInput): Promise<GenerateItineraryOutput> {
  return generateItineraryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateItineraryPrompt',
  input: {
    schema: z.object({
      tripDetails: z.string().describe('Detailed description of the desired trip, including locations, dates, preferences, and activities.'),
    }),
  },
  output: {
    schema: z.object({
      itinerary: z.array(
        z.object({
          location: z.string().describe('The name of the location.'),
          activities: z.array(z.string()).describe('A list of suggested activities at this location.'),
          duration: z.string().describe('The suggested duration of stay at this location.'),
        })
      ).describe('A detailed trip itinerary with locations, activities, and durations.'),
    }),
  },
  prompt: `You are a trip planning expert. Generate a detailed and efficient trip itinerary based on the user's preferences and trip details.

Trip Details: {{{tripDetails}}}

Ensure the itinerary is logical and provides a good balance of activities and rest.

Output the itinerary in JSON format.`, // Ensuring JSON output
});

const generateItineraryFlow = ai.defineFlow<
  typeof GenerateItineraryInputSchema,
  typeof GenerateItineraryOutputSchema
>({
  name: 'generateItineraryFlow',
  inputSchema: GenerateItineraryInputSchema,
  outputSchema: GenerateItineraryOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});