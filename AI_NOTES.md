# AI Integration Notes

## Choice of LLM
I selected **Claude 3.5 Sonnet** (via Anthropic API) for the extraction logic due to its superior performance in following complex formatting instructions and handling nuanced text parsing compared to smaller models. Its ability to output valid JSON consistently makes it ideal for this structured data extraction task.

## Scaffolding & Development
AI was used to:
1.  **Scaffold the initial React application**: Using bolt.new to generate the base structure, components, and styling.
2.  **Generate Regex patterns**: For the fallback extraction logic (`parseWithRegex`), AI helped craft robust regular expressions to identify tasks, owners, and dates from unstructured text.
3.  **Refactor component logic**: To ensure clean separation of concerns and type safety in TypeScript.

## Verification of Extraction Logic
I manually verified the extraction logic by:
1.  **Unit Testing with Edge Cases**: Creating test strings with ambiguous dates ("next Friday", "tomorrow"), implicit owners ("I will do X"), and mixed bullet points vs. paragraphs.
2.  **Contrast Testing**: Comparing the AI-generated JSON output against the Regex fallback to ensure the LLM provided strictly better (or at least equivalent) accuracy.
3.  **Error Handling**: Verifying that the application gracefully handles malformed JSON responses or API timeouts by falling back to the local regex parser.

## Status API Verification
I verified the System Health Dashboard by:
1.  **Simulating Failures**: Manually disconnecting the network to test the "Backend" status.
2.  **Env Variable Toggling**: Removing Supabase keys to test the "Database" connection status (which correctly identified the fallback to LocalStorage).
