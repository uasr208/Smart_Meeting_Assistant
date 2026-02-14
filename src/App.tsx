import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Auth } from './components/Auth';
import { TranscriptInput } from './components/TranscriptInput';
import { ActionItemsList } from './components/ActionItemsList';
import { TranscriptHistory } from './components/TranscriptHistory';
import { LogOut, ClipboardList } from 'lucide-react';

function App() {
  const { user, loading, signOut } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTranscriptProcessed = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Meeting Action Items Tracker</h1>
                <p className="text-sm text-slate-600">{user.email}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <TranscriptInput onTranscriptProcessed={handleTranscriptProcessed} />
            <TranscriptHistory refreshTrigger={refreshTrigger} />
          </div>
          <div>
            <ActionItemsList refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
