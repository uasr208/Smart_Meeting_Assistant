import { ParsedActionItem } from './transcriptParser';

export interface StoredTranscript {
  id: string;
  date: string;
  preview: string;
  fullText: string;
  actionItems: ParsedActionItem[];
}

const STORAGE_KEY = 'smart_meeting_history';
const HISTORY_LIMIT = 5;

export const storageService = {
  saveTranscript: (fullText: string, actionItems: ParsedActionItem[]): StoredTranscript => {
    const history = storageService.getHistory();
    
    // Create new entry
    const newEntry: StoredTranscript = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      preview: fullText.slice(0, 50) + (fullText.length > 50 ? '...' : ''),
      fullText,
      actionItems,
    };

    // Add to front and limit to 5
    const updatedHistory = [newEntry, ...history].slice(0, HISTORY_LIMIT);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    return newEntry;
  },

  getHistory: (): StoredTranscript[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to parse history', e);
      return [];
    }
  },

  getTranscript: (id: string): StoredTranscript | undefined => {
    const history = storageService.getHistory();
    return history.find(item => item.id === id);
  },

  clearHistory: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};
