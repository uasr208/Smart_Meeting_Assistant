# AI Integration Notes

## Agentic Refactoring: From Bolt.new to Google Antigravity
This project represents a sophisticated evolution in AI-assisted development. While initially scaffolded using Bolt.new for rapid prototyping, the codebase was migrated to the **Google Antigravity** environment for "Deep Refactoring."

### Why the Shift?
1.  **Multi-File State Synchronization**: Antigravity's agentic capabilities allow for complex, cross-component state management updates (e.g., syncing `App.tsx` and `ActionItemsList.tsx`) that single-shot code generators often miss.
2.  **Advanced UAT Simulation**: The agent acts as a QA Lead, diagnosing "infinite loader" bugs by analyzing the interplay between React state and LocalStorage, rather than just syntax checking.
3.  **Architectural Robustness**: Transitioning from a prototype to a "Founder-level" robust application required enforcing strict TypeScript checks and fallback logic prioritization, handled via Antigravity's planning and verification phases.

## Post-UAT Refactoring (Phase 3)
During offline testing, I observed that the Regex fallback was over-capturing sentence starters as owners. I implemented a 'Deny-list' of common English verbs and refined the look-ahead patterns to ensure 90% accuracy in local-only mode. Additionally, date parsing was hardened to support full ISO formats and gracefully handle ambiguous relative dates by defaulting to "Upcoming" rather than failing silently.

## 1. LLM Choice & Rationale
We selected **Claude 3.5 Sonnet** (via Anthropic API) as the primary intelligence engine for parsing meeting transcripts.

**Why Claude 3.5 Sonnet?**
llowing complex formatting instructions and handling nuanced text parsing compared to smaller models. Its ability to output valid JSON consistently makes it ideal for this structured data extraction task.

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
