import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { CheckCircle2, XCircle, Activity, Database, Server, BrainCircuit } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StatusItem {
    id: string;
    name: string;
    status: 'healthy' | 'error';
    latency?: string;
    message?: string;
    icon: React.ElementType;
}

export function Status() {
    const { isOffline } = useAuth();
    const [statuses, setStatuses] = useState<StatusItem[]>([
        { id: 'backend', name: 'Backend Services', status: 'healthy', icon: Server, message: 'App is running' },
        { id: 'db', name: 'Database', status: 'healthy', icon: Database, message: 'Checking...' },
        { id: 'llm', name: 'LLM Connection', status: 'healthy', icon: BrainCircuit, message: 'Checking...' },
    ]);

    useEffect(() => {
        const checkStatus = async () => {
            // 1. Database Check
            let dbStatus: 'healthy' | 'error' = 'healthy';
            let dbMsg = 'Connected (LocalStorage)';

            if (!isOffline && supabase) {
                try {
                    const start = performance.now();
                    const { error } = await supabase.from('transcripts').select('count', { count: 'exact', head: true });
                    const latency = Math.round(performance.now() - start);

                    if (error) throw error;
                    dbMsg = `Connected (${latency}ms)`;
                } catch (e) {
                    dbStatus = 'error';
                    dbMsg = 'Connection failed';
                }
            }

            setStatuses(prev => prev.map(s =>
                s.id === 'db' ? { ...s, status: dbStatus, message: dbMsg } : s
            ));

            // 2. LLM Check
            // Simulating check since we don't have a backend proxy yet
            // If we had an API key in env, we'd check that
            const hasApiKey = !!import.meta.env.VITE_OPENAI_API_KEY || !!import.meta.env.VITE_ANTHROPIC_API_KEY;

            setStatuses(prev => prev.map(s =>
                s.id === 'llm' ? {
                    ...s,
                    status: hasApiKey ? 'healthy' : 'error',
                    message: hasApiKey ? 'API Key Configured' : 'API Key Missing (Using Fallback)'
                } : s
            ));
        };

        checkStatus();
    }, [isOffline]);

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Activity className="w-8 h-8 text-blue-600" />
                        System Status
                    </h1>
                    <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
                        ← Back to App
                    </Link>
                </div>

                <div className="grid gap-6">
                    {statuses.map((item) => (
                        <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg ${item.status === 'healthy' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                    }`}>
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-slate-900">{item.name}</h3>
                                    <p className="text-slate-500">{item.message}</p>
                                </div>
                            </div>
                            <div>
                                {item.status === 'healthy' ? (
                                    <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span className="font-medium">Operational</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full border border-red-200">
                                        <XCircle className="w-5 h-5" />
                                        <span className="font-medium">Issue Detected</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
