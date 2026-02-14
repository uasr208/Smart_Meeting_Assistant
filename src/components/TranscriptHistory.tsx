import { useState, useEffect } from 'react';
import { Clock, FileText, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Transcript, ActionItem } from '../types/database';

interface TranscriptHistoryProps {
  refreshTrigger: number;
}

export function TranscriptHistory({ refreshTrigger }: TranscriptHistoryProps) {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionItemsMap, setActionItemsMap] = useState<Record<string, ActionItem[]>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTranscripts = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('transcripts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching transcripts:', error);
    } else {
      setTranscripts(data || []);
    }
    setLoading(false);
  };

  const fetchActionItemsForTranscript = async (transcriptId: string) => {
    const { data, error } = await supabase
      .from('action_items')
      .select('*')
      .eq('transcript_id', transcriptId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setActionItemsMap(prev => ({ ...prev, [transcriptId]: data }));
    }
  };

  useEffect(() => {
    fetchTranscripts();
  }, [user, refreshTrigger]);

  const toggleExpand = (transcriptId: string) => {
    if (expandedId === transcriptId) {
      setExpandedId(null);
    } else {
      setExpandedId(transcriptId);
      if (!actionItemsMap[transcriptId]) {
        fetchActionItemsForTranscript(transcriptId);
      }
    }
  };

  const deleteTranscript = async (id: string) => {
    const { error } = await supabase
      .from('transcripts')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchTranscripts();
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-slate-100 p-2 rounded-lg">
          <Clock className="w-6 h-6 text-slate-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Recent Transcripts</h2>
      </div>

      {transcripts.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p className="text-lg">No transcripts yet</p>
          <p className="text-sm mt-2">Process your first meeting transcript to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transcripts.map((transcript) => (
            <div
              key={transcript.id}
              className="border border-slate-200 rounded-lg hover:border-blue-300 transition"
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-slate-400 flex-shrink-0" />
                      <h3 className="font-semibold text-slate-800 truncate">
                        {transcript.title}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-500">
                      {new Date(transcript.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={() => toggleExpand(transcript.id)}
                      className="text-slate-400 hover:text-blue-600 transition"
                    >
                      {expandedId === transcript.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteTranscript(transcript.id)}
                      className="text-slate-400 hover:text-red-600 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {expandedId === transcript.id && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-slate-700 mb-2">Transcript:</h4>
                      <div className="bg-slate-50 p-3 rounded-lg max-h-48 overflow-y-auto">
                        <p className="text-sm text-slate-600 whitespace-pre-wrap font-mono">
                          {transcript.content}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-2">
                        Action Items ({actionItemsMap[transcript.id]?.length || 0}):
                      </h4>
                      {actionItemsMap[transcript.id]?.length ? (
                        <div className="space-y-2">
                          {actionItemsMap[transcript.id].map((item) => (
                            <div
                              key={item.id}
                              className={`p-3 rounded-lg border ${
                                item.status === 'done'
                                  ? 'bg-green-50 border-green-200'
                                  : 'bg-blue-50 border-blue-200'
                              }`}
                            >
                              <p
                                className={`text-sm font-medium ${
                                  item.status === 'done'
                                    ? 'line-through text-slate-500'
                                    : 'text-slate-700'
                                }`}
                              >
                                {item.task}
                              </p>
                              <div className="flex gap-3 mt-1 text-xs text-slate-600">
                                {item.owner && <span>Owner: {item.owner}</span>}
                                {item.due_date && (
                                  <span>Due: {new Date(item.due_date).toLocaleDateString()}</span>
                                )}
                                <span className="capitalize">Status: {item.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 italic">No action items extracted</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
