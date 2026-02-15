import { ClipboardList, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
            <div className="max-w-6xl mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <div className="bg-blue-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200">
                        <ClipboardList className="w-8 h-8" />
                    </div>
                    <h1 className="text-5xl font-bold text-slate-900 mb-6">
                        Smart Meeting <span className="text-blue-600">Assistant</span>
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Transform your messy meeting transcripts into organized action items automatically using AI.
                        Identify tasks, owners, and due dates in seconds.
                    </p>
                    <div className="mt-8 flex gap-4 justify-center">
                        <Link
                            to="/app"
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl hover:-translate-y-1 transform"
                        >
                            Get Started
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            to="/status"
                            className="inline-flex items-center gap-2 bg-white text-slate-700 px-8 py-4 rounded-xl font-semibold hover:bg-slate-50 transition border border-slate-200"
                        >
                            System Health
                        </Link>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mt-12">
                    {[
                        {
                            title: 'Paste Transcript',
                            desc: 'Simply copy and paste your raw meeting notes or transcript into the input area.'
                        },
                        {
                            title: 'AI Processing',
                            desc: 'Our intelligent system analyzes the text to extract concrete action items and owners.'
                        },
                        {
                            title: 'Track & Manage',
                            desc: 'View your tasks, filter by status, and export everything with a single click.'
                        }
                    ].map((step, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg mb-4">
                                {i + 1}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                            <p className="text-slate-600">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
