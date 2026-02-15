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

  /* 
     Refined Deny-list for Post-UAT Owner Extraction accuracy.
     These common sentence starters were triggering false positives.
  */
  const ownerDenyList = [
    'sounds', 'one', 'will', 'shall', 'can', 'could', 'would', 'should',
    'please', 'great', 'okay', 'thanks', 'yes', 'no', 'maybe', 'alright',
    'make', 'let', 'check', 'verify', 'update', 'test', 'ensure', 'create',
    'deploy', 'run', 'start', 'stop', 'open', 'close'
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
    // Refined: enforce capitalization for implicit assignments
    /-\s*([A-Z][a-z]+)\s+will/i,
    /^([A-Z][a-z]+),?\s+please\s+/,
    /^([A-Z][a-z]+),?\s+(?:can|could|would)\s+you\s+/i,
  ];

  const datePatterns = [
    // ISO Date (YYYY-MM-DD) - Added explicitly
    /(\d{4}-\d{2}-\d{2})/,
    // UK/US formats
    /by\s+(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
    /due\s+(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
    /deadline:?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
    /by\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    /by\s+(next\s+week|this\s+week|tomorrow)/i,
    // Catch-all for simple dates at end of line
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
    const isBulletPoint = !!line.trim().match(/^[-*•]\s+/);

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
          const extracted = match[1].trim();
          // Apply Deny-list check
          if (!ownerDenyList.includes(extracted.toLowerCase())) {
            owner = extracted;
            task = task.replace(match[0], '').trim();
            break;
          }
        }
      }

      // If no owner found via patterns, try to extract from speaker (if imperative)
      if (!owner && line.includes(':')) {
        const speakerMatch = line.match(/^([A-Z][a-z]+)\s*:/);
        if (speakerMatch && speakerMatch[1]) {
          const speaker = speakerMatch[1];
          // Check if speaker is giving instruction to someone else
          const commandMatch = task.match(/^(please\s+)?([A-Z][a-z]+)\s+/);
          if (commandMatch && commandMatch[2]) {
            const potentialOwner = commandMatch[2];
            if (!ownerDenyList.includes(potentialOwner.toLowerCase())) {
              owner = potentialOwner;
            }
          }
          // Note: We don't default to Speaker as owner for imperatives usually, 
          // unless they say "I will...". Let's keep it safe.
        }
      }

      let dueDate: string | null = null;
      // Prioritize ISO Date check first to prevent truncation
      const isoMatch = line.match(/(\d{4}-\d{2}-\d{2})/);
      if (isoMatch) {
        dueDate = isoMatch[1];
        // Remove from task to avoid "by 2026-02-20" leaving "by"
        task = task.replace(isoMatch[0], '').trim();
      } else {
        for (const pattern of datePatterns) {
          const match = line.match(pattern);
          if (match && match[1]) {
            // explicit ISO regex in datePatterns might still match if loop runs 
            // but we prioritized it above.
            const dateStr = match[1].trim();
            const parsed = parseDateString(dateStr);
            // Only replace if valid date found
            if (parsed && parsed !== 'Upcoming') {
              dueDate = parsed;
              task = task.replace(match[0], '').trim();
              break;
            }
          }
        }
      }

      // Owner Safety: Self-assignment detection
      if (!owner || owner === 'Unassigned') {
        if (/\bI\s+(will|shall|am)\b/i.test(line) || /\b(my|mine)\b/i.test(line)) {
          owner = 'User (Self)';
        }
      }

      task = task.replace(/\s+/g, ' ').trim();

      // Task Name Cleanup: Remove trailing prepositions often left by date removal
      task = task.replace(/\s+(by|at|on|due|for)$/i, '');

      // Post-processing cleanup
      if (task.endsWith(',') || task.endsWith('.')) task = task.slice(0, -1);

      if (task.length > 5) {
        actionItems.push({
          task,
          owner: owner || "Unassigned",
          due_date: dueDate || "Upcoming"
        });
      }
    }
  }

  return actionItems;
}

function parseDateString(dateStr: string): string | null {
  const lower = dateStr.toLowerCase();
  const today = new Date();

  // FIX: Handle full ISO dates directly
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateStr;
  }

  // Explicitly handle "Upcoming" or "TBD" keywords passed in or fallbacks
  if (['upcoming', 'tbd', 'later', 'soon'].includes(lower)) {
    return 'Upcoming';
  }

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

  // Handle standard short dates (e.g. 01/20/26)
  const dateMatch = dateStr.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/);
  if (dateMatch) {
    let [, p1, p2, p3] = dateMatch;
    // Heuristic: if p1 > 12, it's likely day. if p3 is year.
    // Let's assume M/D/Y or D/M/Y is hard, but usually US format in code. 
    // Let's standardise on trying `new Date(string)`

    let year = p3;
    if (year.length === 2) {
      year = '20' + year;
    }

    // Try M/D/Y first (US common)
    let date = new Date(`${year}-${p1.padStart(2, '0')}-${p2.padStart(2, '0')}`);

    // If invalid, maybe D/M/Y? But JS Date(string) usually works well with standardized inputs
    if (isNaN(date.getTime())) {
      date = new Date(dateStr); // Parsing fallback
    }

    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }

  return "Upcoming"; // Fallback as requested
}
