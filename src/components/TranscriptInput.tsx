import { useState } from 'react';
import { FileText, Sparkles } from 'lucide-react';
import { parseTranscript } from '../lib/transcriptParser';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../lib/storage';

interface TranscriptInputProps {
  onTranscriptProcessed: () => void;
}

export function TranscriptInput({ onTranscriptProcessed }: TranscriptInputProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Allow guest user or real user
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const parsedItems = parseTranscript(content);

      if (parsedItems.length === 0) {
        setError('No action items found. Try adding "Action:", "Task:", or "Todo:" before your items.');
        setLoading(false);
        return;
      }

      // Save to LocalStorage service (which mimics "cloud" persistence for now)
      storageService.saveTranscript(content, parsedItems);

      // If we were using Supabase in online mode, we would also insert there
      // But for this "Offline First" refactor, StorageService is the source of truth for history
      if (supabase && user.id !== 'guest-123') {
        // Silently attempt sync or just leave it for now as strict requirement is "Integrate LocalStorage"
      }

      setTitle('');
      setContent('');
      onTranscriptProcessed();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to process transcript';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-lg">
          <FileText className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">New Transcript</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
            Meeting Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Weekly Team Sync - Jan 14"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            required
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-1">
            Transcript
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your meeting transcript here...&#10;&#10;Tip: Include action items like:&#10;- Action: Update the docs by Friday (@John)&#10;- Todo: Review the PR (Sarah) due 1/20/2026&#10;- Follow up: Schedule client call"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition min-h-[200px] font-mono text-sm"
            required
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          {loading ? 'Processing...' : 'Process Transcript'}
        </button>
      </form>
    </div>
  );
}
