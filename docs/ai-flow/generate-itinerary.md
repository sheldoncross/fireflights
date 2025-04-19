# Generate Itinerary Flow (`src/ai/flows/generate-itinerary.ts`)

This module provides functionality to generate a personalized trip itinerary based on user-provided details and preferences.

## Overview

The core logic utilizes a Genkit AI flow (`generateItineraryFlow`) driven by a specific prompt (`generateItineraryPrompt`). This prompt instructs the AI model to create a detailed and logical itinerary based on the user's input, including locations, activities, and suggested durations.

## Exports

### `generateItinerary(input: GenerateItineraryInput): Promise<GenerateItineraryOutput>`

-   **Description:** The primary function exported by this module. It acts as the entry point to trigger the itinerary generation AI flow.
-   **Parameters:**
    -   `input` (`GenerateItineraryInput`): An object containing the detailed trip description and preferences.
-   **Returns:** A `Promise` that resolves to a `GenerateItineraryOutput` object containing the structured trip itinerary.

### `GenerateItineraryInput` (Type)

-   **Description:** Defines the expected structure for the input to the `generateItinerary` function.
-   **Properties:**
    -   `tripDetails` (string): A comprehensive description of the desired trip, including potential locations, dates, user preferences (e.g., interests, budget, pace), and desired activities.

### `GenerateItineraryOutput` (Type)

-   **Description:** Defines the structure of the generated itinerary returned by `generateItinerary`.
-   **Properties:**
    -   `itinerary`: An array of objects, where each object represents a segment or stop in the itinerary.
        -   `location` (string): The name of the location for this segment.
        -   `activities` (array of strings): A list of suggested activities to do at this location.
        -   `duration` (string): The suggested duration of stay or time allocated for this location/segment (e.g., "2 days", "afternoon", "3 hours").

## Internal Implementation

-   **`GenerateItineraryInputSchema` / `GenerateItineraryOutputSchema`:** Zod schemas that define the structure and enforce validation for the input and output types.
-   **`generateItineraryPrompt`:** A Genkit prompt specifically designed to guide the AI model in generating a well-structured, efficient, and personalized itinerary based on the provided `tripDetails`. It explicitly requests the output in JSON format.
-   **`generateItineraryFlow`:** A Genkit flow that manages the execution process. It takes the user input, invokes the `generateItineraryPrompt` with the input, executes the underlying AI model, and returns the validated, structured itinerary output.