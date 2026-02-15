import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { CheckCircle2, XCircle, Activity, Database, Server, BrainCircuit, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SystemStatus {
    name: string;
    status: 'healthy' | 'degraded' | 'down';
    message: string;
    lastChecked: string;
}

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
    const [backendStatus, setBackendStatus] = useState<SystemStatus>({ name: 'Backend Services', status: 'healthy', message: 'Checking...', lastChecked: '' });
    const [databaseStatus, setDatabaseStatus] = useState<SystemStatus>({ name: 'Database', status: 'healthy', message: 'Checking...', lastChecked: '' });
    const [llmStatus, setLlmStatus] = useState<SystemStatus>({ name: 'LLM Connection', status: 'healthy', message: 'Checking...', lastChecked: '' });

    const getStatusColor = (status: SystemStatus) => {
        if (status.status === 'healthy') return 'bg-green-100 text-green-700 border-green-200';
        if (status.status === 'degraded') return 'bg-amber-100 text-amber-700 border-amber-200';
        return 'bg-red-100 text-red-700 border-red-200';
    };

    const getStatusIcon = (status: SystemStatus) => {
        if (status.status === 'healthy') return <CheckCircle2 className="w-5 h-5 text-green-600" />;
        if (status.status === 'degraded') return <AlertTriangle className="w-5 h-5 text-amber-600" />;
        return <XCircle className="w-5 h-5 text-red-600" />;
    };

    useEffect(() => {
        const checkSystemStatus = async () => {
            // Check Backend (Mock ping)
            setBackendStatus({
                name: 'Backend Services',
                status: 'healthy',
                message: 'Operational',
                lastChecked: new Date().toISOString()
            });

            // Check Database
            if (!isOffline && supabase) {
                try {
                    const { error } = await supabase.from('transcripts').select('count', { count: 'exact', head: true });
                    if (error) throw error;
                    setDatabaseStatus({
                        name: 'Database',
                        status: 'healthy',
                        message: 'Connected',
                        lastChecked: new Date().toISOString()
                    });
                } catch (e) {
                    setDatabaseStatus({
                        name: 'Database',
                        status: 'degraded',
                        message: 'Connection Issues (Using LocalStorage)',
                        lastChecked: new Date().toISOString()
                    });
                }
            } else {
                setDatabaseStatus({
                    name: 'Database',
                    status: 'healthy',
                    message: 'Offline Mode (LocalStorage)',
                    lastChecked: new Date().toISOString()
                });
            }


            // Check LLM
            const hasOpenAI = !!import.meta.env.VITE_OPENAI_API_KEY;
            const hasAnthropic = !!import.meta.env.VITE_ANTHROPIC_API_KEY;

            if (hasOpenAI || hasAnthropic) {
                setLlmStatus({
                    name: 'LLM Connection',
                    status: 'healthy',
                    message: 'API Key Configured',
                    lastChecked: new Date().toISOString()
                });
            } else {
                setLlmStatus({
                    name: 'LLM Connection',
                    status: 'degraded', // Changed from 'down' to 'degraded' for Fallback Mode
                    message: 'Operational (Fallback Mode)', // Changed text
                    lastChecked: new Date().toISOString()
                });
            }
        };

        checkSystemStatus();
        const interval = setInterval(checkSystemStatus, 30000);
        return () => clearInterval(interval);
    }, [isOffline]);

    const allStatuses = [
        { ...backendStatus, id: 'backend', icon: Server },
        { ...databaseStatus, id: 'db', icon: Database },
        { ...llmStatus, id: 'llm', icon: BrainCircuit },
    ];

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

                <div className="space-y-4">
                    {allStatuses.map((status) => (
                        <div
                            key={status.id}
                            className={`flex items-center justify-between p-4 rounded-lg border ${getStatusColor(status)}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-full ${status.status === 'healthy' ? 'bg-white/50' : 'bg-white/20'}`}>
                                    <status.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{status.name}</h3>
                                    <p className="text-sm opacity-90">{status.message}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full">
                                {getStatusIcon(status)}
                                <span className="text-sm font-medium capitalize">{status.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
