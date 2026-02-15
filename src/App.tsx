import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Auth } from './components/Auth';
import { TranscriptInput } from './components/TranscriptInput';
import { ActionItemsList } from './components/ActionItemsList';
import { TranscriptHistory } from './components/TranscriptHistory';
import { Status } from './components/Status';
import { Home } from './components/Home';
import { LogOut, ClipboardList, Menu, X } from 'lucide-react';
import { storageService, StoredTranscript } from './lib/storage';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';

function Dashboard() {
  const { user, signOut, isOffline } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentTranscript, setCurrentTranscript] = useState<StoredTranscript | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTranscriptProcessed = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSelectTranscript = (transcript: StoredTranscript) => {
    setCurrentTranscript(transcript);
    // In a real app we might populate the input fields or show a detail view
    // For now we just trigger a refresh to show we "loaded" it
    console.log('Loaded transcript:', transcript.id);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
              <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-100">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Smart Meeting Assistant
                </h1>
                {isOffline && <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Offline Mode</span>}
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link to="/status" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">
                System Health
              </Link>
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500 font-medium">{user?.email}</span>
                <button
                  onClick={signOut}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>

            <button
              className="md:hidden p-2 text-slate-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-4">
          <Link to="/status" className="block text-slate-600 font-medium">System Health</Link>
          <div className="border-t border-slate-100 pt-4">
            <p className="text-sm text-slate-500 mb-2">{user?.email}</p>
            <button onClick={signOut} className="text-red-600 font-medium flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <TranscriptInput onTranscriptProcessed={handleTranscriptProcessed} />
            <TranscriptHistory
              refreshTrigger={refreshTrigger}
              onSelectTranscript={handleSelectTranscript}
            />
          </div>
          <div className="lg:col-span-8">
            <ActionItemsList refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </main>
    </div>
  );
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/status" element={<Status />} />
        <Route
          path="/app"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
