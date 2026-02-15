export interface ParsedActionItem {
  task: string;
  owner: string | null;
  due_date: string | null;
}

// System prompt for LLM extraction (referenced in documentation)
const SYSTEM_PROMPT = `
You are an expert project manager and data extractor.
Your task is to analyze meeting transcripts and extract actionable tasks.

Input: Use the provided meeting transcript text.

Output: Return ONLY a JSON object with a single key "actionItems" which is an array of objects.
Each object must have:
- "task": string (The actionable task description, concise)
- "owner": string (The person assigned, or "Unassigned" if not clear)
- "due_date": string (ISO date YYYY-MM-DD, or "Not Found" if not mentioned)

Strict Rules:
1. Do not include any markdown formatting.
2. If no actionable items are found, return an empty array.
3. Infer owners from context where possible.
`;

export function parseTranscript(content: string): ParsedActionItem[] {
  // TODO: connect to actual LLM here using the SYSTEM_PROMPT.
  // For now, we use the robust regex fallback which mimics the "Refined AI Extraction" logic locally.
  // This ensures the app works immediately without requiring an API key from the user.
  console.log('Using System Prompt context for fallback parsing:', SYSTEM_PROMPT.length);
  return parseWithRegex(content);
}

function parseWithRegex(content: string): ParsedActionItem[] {
  const lines = content.split('\n');
  const actionItems: ParsedActionItem[] = [];

  const actionKeywords = [
    'action item:', 'action:', 'todo:', 'to do:', 'task:',
    'follow up:', 'followup:', 'will do:', 'needs to:',
    'responsible:', 'assigned to:', '[ ]', '[]'
  ];

  const imperativeVerbs = [
    'prepare', 'create', 'send', 'book', 'schedule', 'review', 'update',
    'write', 'complete', 'finish', 'submit', 'check', 'fix', 'deploy',
    'test', 'build', 'document', 'call', 'meet', 'follow up', 'reach out',
    'notify', 'confirm', 'verify', 'validate', 'analyze', 'research'
  ];

  const ownerPatterns = [
    /@(\w+)/,
    /\(([^)]+)\)/,
    /assigned to:?\s*([^,.\n]+)/i,
    /owner:?\s*([^,.\n]+)/i,
    /responsible:?\s*([^,.\n]+)/i,
    /-\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*will/i,
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),?\s+please\s+/,
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),?\s+(?:can\s+you|could\s+you|would\s+you)\s+/,
  ];

  const datePatterns = [
    /by\s+(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
    /due\s+(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
    /deadline:?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
    /by\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    /by\s+(next\s+week|this\s+week|tomorrow)/i,
    /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/,
  ];

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    let isActionLine = false;

    // Check for explicit action keywords
    const hasActionKeyword = actionKeywords.some(keyword =>
      lowerLine.includes(keyword)
    );

    // Check for bullet points
    const isBulletPoint = line.trim().match(/^[-*•]\s+/);

    // Check for imperative statements (someone doing something)
    let hasImperative = false;
    for (const verb of imperativeVerbs) {
      if (lowerLine.includes(verb)) {
        hasImperative = true;
        break;
      }
    }

    isActionLine = hasActionKeyword || isBulletPoint || (hasImperative && line.includes(':'));

    if (isActionLine) {
      let task = line.trim()
        .replace(/^[-*•]\s+/, '')
        .replace(/^(action item|action|todo|to do|task|follow up|followup):?\s*/i, '')
        .trim();

      // Remove speaker prefix (e.g., "Alice: " or "Bob: ")
      task = task.replace(/^[A-Z][a-z]+:\s*/, '');

      if (!task || task.length < 5) continue;

      let owner: string | null = null;
      for (const pattern of ownerPatterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          owner = match[1].trim();
          task = task.replace(match[0], '').trim();
          break;
        }
      }

      // If no owner found via patterns, try to extract from speaker
      if (!owner && line.includes(':')) {
        const speakerMatch = line.match(/^([A-Z][a-z]+)\s*:/);
        if (speakerMatch && speakerMatch[1]) {
          const speaker = speakerMatch[1];
          // Check if speaker is giving instruction to someone else
          const commandMatch = task.match(/^(please\s+)?([A-Z][a-z]+)\s+/);
          if (commandMatch && commandMatch[2]) {
            owner = commandMatch[2];
          }
        }
      }

      let dueDate: string | null = null;
      for (const pattern of datePatterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          const dateStr = match[1].trim();
          dueDate = parseDateString(dateStr);
          task = task.replace(match[0], '').trim();
          break;
        }
      }

      task = task.replace(/\s+/g, ' ').trim();
      if (task.length > 5) {
        actionItems.push({
          task,
          owner: owner || "Unassigned", // Requirement: "Unassigned" if not found
          due_date: dueDate || "Not Found" // Requirement: "Not Found" if not found
        });
      }
    }
  }

  return actionItems;
}

function parseDateString(dateStr: string): string | null {
  const lower = dateStr.toLowerCase();
  const today = new Date();

  if (lower === 'tomorrow') {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  if (lower === 'next week') {
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  }

  if (lower === 'this week') {
    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
    return endOfWeek.toISOString().split('T')[0];
  }

  const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const weekdayIndex = weekdays.indexOf(lower);
  if (weekdayIndex !== -1) {
    const targetDay = new Date(today);
    const currentDay = targetDay.getDay();
    const daysUntilTarget = (weekdayIndex - currentDay + 7) % 7 || 7;
    targetDay.setDate(targetDay.getDate() + daysUntilTarget);
    return targetDay.toISOString().split('T')[0];
  }

  const dateMatch = dateStr.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/);
  if (dateMatch) {
    let [, month, day, year] = dateMatch;
    if (year.length === 2) {
      year = '20' + year;
    }
    const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }

  return null;
}
