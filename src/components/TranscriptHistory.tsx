import { storageService, StoredTranscript } from '../lib/storage';
import { useEffect, useState } from 'react';
import { History, FileText, ChevronRight, Clock } from 'lucide-react';

interface TranscriptHistoryProps {
  refreshTrigger: number;
  onSelectTranscript: (transcript: StoredTranscript) => void;
}

export function TranscriptHistory({ refreshTrigger, onSelectTranscript }: TranscriptHistoryProps) {
  const [history, setHistory] = useState<StoredTranscript[]>([]);

  useEffect(() => {
    setHistory(storageService.getHistory());
  }, [refreshTrigger]);

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4 text-slate-800">
          <History className="w-5 h-5" />
          <h2 className="font-semibold">Recent Transcripts</h2>
        </div>
        <p className="text-slate-500 text-sm text-center py-4">
          No history yet. Process a transcript to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2 text-slate-800">
          <History className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold">Recent History</h2>
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTranscript(item)}
            className="w-full text-left p-4 hover:bg-slate-50 transition-colors group flex items-start gap-3"
          >
            <div className="mt-1 bg-blue-100 p-1.5 rounded text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate pr-4">
                {item.preview || 'Untitled Transcript'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-500">
                  {new Date(item.date).toLocaleDateString()}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500">
                  {item.actionItems.length} items
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors mt-2" />
          </button>
        ))}
      </div>
    </div>
  );
}
