# Enrich Location Card Flow (`src/ai/flows/enrich-location-card.ts`)

This module provides functionality to enrich a given location (place) with tailored suggestions for activities and dining based on user-provided trip details and preferences.

## Overview

The core logic uses a Genkit AI flow (`enrichLocationCardFlow`) powered by a defined prompt (`enrichLocationCardPrompt`). This prompt takes details about a place and the user's trip preferences and asks the AI model to generate relevant suggestions.

## Exports

### `enrichLocationCard(input: EnrichLocationCardInput): Promise<EnrichLocationCardOutput>`

-   **Description:** The main function exported by the module. It serves as an interface to the underlying AI flow (`enrichLocationCardFlow`).
-   **Parameters:**
    -   `input` (`EnrichLocationCardInput`): An object containing the place information and trip details.
-   **Returns:** A `Promise` that resolves to an `EnrichLocationCardOutput` object containing the suggestions.

### `EnrichLocationCardInput` (Type)

-   **Description:** Defines the structure for the input object required by `enrichLocationCard`.
-   **Properties:**
    -   `place`: An object describing the place to enrich.
        -   `name` (string): The name of the place.
        -   `description` (string): A brief description of the place.
        -   `lat` (number): The latitude of the location.
        -   `lng` (number): The longitude of the location.
    -   `tripDetails` (string): User-provided trip details and preferences.

### `EnrichLocationCardOutput` (Type)

-   **Description:** Defines the structure for the output object returned by `enrichLocationCard`.
-   **Properties:**
    -   `suggestions`: An array of suggestion objects.
        -   `type` (enum: 'activity' | 'dining'): The type of suggestion.
        -   `description` (string): A description of the suggested activity or dining option.

## Internal Implementation

-   **`EnrichLocationCardInputSchema` / `EnrichLocationCardOutputSchema`:** Zod schemas defining the structure and validation rules for the input and output types.
-   **`enrichLocationCardPrompt`:** A Genkit prompt configured to instruct the AI model on how to generate suggestions based on the input place and trip details.
-   **`enrichLocationCardFlow`:** A Genkit flow that orchestrates the process: it takes the input, passes it to the prompt, executes the AI model call, and returns the structured output.