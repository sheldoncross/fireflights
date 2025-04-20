# Enrich Location Card Flow (`src/ai/flows/enrich-location-card.ts`)

This module provides functionality to enrich a given location (place) with tailored suggestions for activities and dining based on user-provided trip details and preferences, using Langchain.

## Overview

The core logic uses a Langchain Runnable chain (`enrichLocationCardChain`). This chain combines a prompt template (`ChatPromptTemplate`) with the configured Google AI model (`ChatGoogleGenerativeAI` instance from `ai-instance.ts`). The model is configured to return structured output conforming to a Zod schema (`EnrichLocationCardOutputSchema`), ensuring the suggestions are returned in a predictable JSON format.

## Exports

### `enrichLocationCard(input: EnrichLocationCardInput): Promise<EnrichLocationCardOutput>`

-   **Description:** The main function exported by the module. It validates the input against the Zod schema and then invokes the Langchain chain (`enrichLocationCardChain`) to get the suggestions.
-   **Parameters:**
    -   `input` (`EnrichLocationCardInput`): An object containing the place information and trip details. It will be validated against `EnrichLocationCardInputSchema`.
-   **Returns:** A `Promise` that resolves to an `EnrichLocationCardOutput` object containing the suggestions, guaranteed to match the `EnrichLocationCardOutputSchema`.

### `EnrichLocationCardInputSchema` (Zod Schema) & `EnrichLocationCardInput` (Type)

-   **Description:** Defines the structure and validation rules for the input object required by `enrichLocationCard`.
-   **Properties:**
    -   `place`: An object describing the place to enrich.
        -   `name` (string): The name of the place.
        -   `description` (string): A brief description of the place.
        -   `lat` (number): The latitude of the location.
        -   `lng` (number): The longitude of the location.
    -   `tripDetails` (string): User-provided trip details and preferences.

### `EnrichLocationCardOutputSchema` (Zod Schema) & `EnrichLocationCardOutput` (Type)

-   **Description:** Defines the structure for the output object returned by `enrichLocationCard`. This schema is also used with Langchain's `withStructuredOutput` to enforce the output format from the AI model.
-   **Properties:**
    -   `suggestions`: An array of suggestion objects.
        -   `type` (enum: 'activity' | 'dining'): The type of suggestion.
        -   `description` (string): A description of the suggested activity or dining option.

## Internal Implementation

-   **`model`:** The shared `ChatGoogleGenerativeAI` instance imported from `src/ai/ai-instance.ts`.
-   **`promptTemplate`:** A `ChatPromptTemplate` defining the system and human messages sent to the AI model, including placeholders for the input data.
-   **`structuredLlm`:** The AI model instance specifically configured with `.withStructuredOutput(EnrichLocationCardOutputSchema)` to ensure the response adheres to the desired Zod schema.
-   **`enrichLocationCardChain`:** A `RunnableSequence` that defines the flow:
    1.  Maps the input object fields to the variables required by the `promptTemplate`.
    2.  Passes the formatted input to the `promptTemplate`.
    3.  Sends the resulting prompt messages to the `structuredLlm`.
    4.  The `structuredLlm` invokes the Google AI API and parses the response into the `EnrichLocationCardOutput` structure.