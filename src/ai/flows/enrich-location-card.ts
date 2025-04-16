'use server';
/**
 * @fileOverview Enriches a location card with tailored suggestions for activities and dining based on user preferences.
 *
 * - enrichLocationCard - A function that enriches a location card.
 * - EnrichLocationCardInput - The input type for the enrichLocationCard function.
 * - EnrichLocationCardOutput - The return type for the enrichLocationCard function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {Place} from '@/services/places';

const EnrichLocationCardInputSchema = z.object({
  place: z.object({
    name: z.string().describe('The name of the place.'),
    description: z.string().describe('A brief description of the place.'),
    lat: z.number().describe('The latitude of the location.'),
    lng: z.number().describe('The longitude of the location.'),
  }).describe('The place to enrich.'),
  tripDetails: z.string().describe('The user-provided trip details and preferences.'),
});
export type EnrichLocationCardInput = z.infer<typeof EnrichLocationCardInputSchema>;

const EnrichLocationCardOutputSchema = z.object({
  suggestions: z.array(
    z.object({
      type: z.enum(['activity', 'dining']).describe('The type of suggestion.'),
      description: z.string().describe('A description of the suggestion.'),
    })
  ).describe('Tailored suggestions for activities and dining.'),
});
export type EnrichLocationCardOutput = z.infer<typeof EnrichLocationCardOutputSchema>;

export async function enrichLocationCard(input: EnrichLocationCardInput): Promise<EnrichLocationCardOutput> {
  return enrichLocationCardFlow(input);
}

const prompt = ai.definePrompt({
  name: 'enrichLocationCardPrompt',
  input: {
    schema: z.object({
      place: z.object({
        name: z.string().describe('The name of the place.'),
        description: z.string().describe('A brief description of the place.'),
        lat: z.number().describe('The latitude of the location.'),
        lng: z.number().describe('The longitude of the location.'),
      }).describe('The place to enrich.'),
      tripDetails: z.string().describe('The user-provided trip details and preferences.'),
    }),
  },
  output: {
    schema: z.object({
      suggestions: z.array(
        z.object({
          type: z.enum(['activity', 'dining']).describe('The type of suggestion.'),
          description: z.string().describe('A description of the suggestion.'),
        })
      ).describe('Tailored suggestions for activities and dining.'),
    }),
  },
  prompt: `You are a trip advisor AI. Given the following place and the user's trip details, provide tailored suggestions for activities and dining.

Place:
Name: {{{place.name}}}
Description: {{{place.description}}}

Trip Details: {{{tripDetails}}}

Suggestions:`, // add types here
});

const enrichLocationCardFlow = ai.defineFlow<
  typeof EnrichLocationCardInputSchema,
  typeof EnrichLocationCardOutputSchema
>(
  {
    name: 'enrichLocationCardFlow',
    inputSchema: EnrichLocationCardInputSchema,
    outputSchema: EnrichLocationCardOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
