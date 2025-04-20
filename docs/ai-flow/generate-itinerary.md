# Generate Itinerary Flow (`src/ai/flows/generate-itinerary.ts`)

This module provides functionality to generate a personalized trip itinerary based on user-provided details and preferences, using Langchain.

## Overview

The core logic utilizes a Langchain Runnable chain (`generateItineraryChain`). This chain combines a prompt template (`ChatPromptTemplate`) designed for itinerary generation with the configured Google AI model (`ChatGoogleGenerativeAI` instance from `ai-instance.ts`). Similar to the enrichment flow, the model is configured using `.withStructuredOutput()` to ensure the generated itinerary conforms to a specific Zod schema (`GenerateItineraryOutputSchema`), delivering a predictable JSON structure.

## Exports

### `generateItinerary(input: GenerateItineraryInput): Promise<GenerateItineraryOutput>`

-   **Description:** The primary function exported by this module. It validates the input against the Zod schema and then invokes the Langchain chain (`generateItineraryChain`) to generate the itinerary.
-   **Parameters:**
    -   `input` (`GenerateItineraryInput`): An object containing the detailed trip description and preferences. It will be validated against `GenerateItineraryInputSchema`.
-   **Returns:** A `Promise` that resolves to a `GenerateItineraryOutput` object containing the structured trip itinerary, guaranteed to match the `GenerateItineraryOutputSchema`.

### `GenerateItineraryInputSchema` (Zod Schema) & `GenerateItineraryInput` (Type)

-   **Description:** Defines the structure and validation rules for the input object required by `generateItinerary`.
-   **Properties:**
    -   `tripDetails` (string): A comprehensive description of the desired trip, including potential locations, dates, user preferences (e.g., interests, budget, pace), and desired activities.

### `GenerateItineraryOutputSchema` (Zod Schema) & `GenerateItineraryOutput` (Type)

-   **Description:** Defines the structure of the generated itinerary returned by `generateItinerary`. This schema is used with Langchain's `withStructuredOutput` to enforce the output format from the AI model.
-   **Properties:**
    -   `itinerary`: An array of objects, where each object represents a segment or stop in the itinerary.
        -   `location` (string): The name of the location for this segment.
        -   `activities` (array of strings): A list of suggested activities to do at this location.
        -   `duration` (string): The suggested duration of stay or time allocated for this location/segment (e.g., "2 days", "afternoon", "3 hours").

## Internal Implementation

-   **`model`:** The shared `ChatGoogleGenerativeAI` instance imported from `src/ai/ai-instance.ts`.
-   **`promptTemplate`:** A `ChatPromptTemplate` providing system instructions (role as a trip planner, requirement for JSON output) and a human message template containing the `{tripDetails}` placeholder.
-   **`structuredLlm`:** The AI model instance specifically configured with `.withStructuredOutput(GenerateItineraryOutputSchema)` to ensure the response adheres to the desired Zod schema for the itinerary.
-   **`generateItineraryChain`:** A `RunnableSequence` that defines the flow:
    1.  Takes the validated input object (which directly matches the `{tripDetails}` variable needed).
    2.  Passes the input to the `promptTemplate`.
    3.  Sends the resulting prompt messages to the `structuredLlm`.
    4.  The `structuredLlm` invokes the Google AI API and parses the response into the `GenerateItineraryOutput` structure.