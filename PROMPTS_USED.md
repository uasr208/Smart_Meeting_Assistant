# Prompts Used for Extraction

## Evolution of Prompts

### Initial Prompt (Concept)
> "Extract action items from this text. Who is doing what and by when?"
*   **Result**: Too unstructured. Often missed dates or confused owners.

### Iteration 2 (Structured Text)
> "List every action item in the following format:
> - Task: [Task Description]
> - Owner: [Name]
> - Due Date: [YYYY-MM-DD]"
*   **Result**: Better, but parsing the output string back into the app was brittle.

### Final System Prompt (Production)
This prompt is designed to return strict JSON for direct consumption by the frontend.

```javascript
const SYSTEM_PROMPT = `
You are an expert project manager and data extractor.
Your task is to analyze meeting transcripts and extract actionable tasks.

Input: Use the provided meeting transcript text.

Output: Return ONLY a JSON object with a single key "actionItems" which is an array of objects.
Each object must have:
- "task": string (The actionable task description, concise)
- "owner": string (The person assigned, or "Unassigned" if not clear)
- "due_date": string (ISO date YYYY-MM-DD, or "Not Found" if not mentioned. If relative dates like "next friday" are used, calculate the date assuming the current date is ${new Date().toISOString().split('T')[0]})

Strict Rules:
1. Do not include any markdown formatting (like \`\`\`json).
2. Do not include preamble or postscript.
3. If no actionable items are found, return an empty array.
4. Infer owners from context where possible (e.g., "I will do X" -> Speaker).
`;
```
This prompt ensures type safety and reduces the need for complex post-processing on the client side.
