'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

export function AiSummary() {
    const [summary, setSummary] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateSummary = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/reports/ai-summary`, {
                method: 'POST',
            });

            if (!res.ok) throw new Error('Failed to generate summary');

            const data = await res.json();
            setSummary(data.summary);
        } catch (err) {
            setError('Could not generate summary. Please check your API configuration.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            background: 'white',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            padding: '2rem',
            marginTop: '2rem',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '6px', 
                        background: '#eff6ff', 
                        color: '#2563eb', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                    }}>
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>
                            Portfolio Intelligence
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                            AI-driven analysis of your portfolio's performance and composition.
                        </p>
                    </div>
                </div>
                {!summary && !loading && (
                    <button
                        onClick={generateSummary}
                        style={{
                            background: '#0f172a',
                            color: 'white',
                            border: 'none',
                            padding: '0.625rem 1.25rem',
                            borderRadius: '6px',
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'background 0.2s',
                        }}
                    >
                        Generate Analysis
                    </button>
                )}
            </div>

            {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '6px', color: '#64748b', fontSize: '0.875rem' }}>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Analyzing portfolio metrics...</span>
                </div>
            )}

            {error && (
                <div style={{ color: '#dc2626', fontSize: '0.875rem', padding: '1rem', background: '#fef2f2', borderRadius: '6px' }}>{error}</div>
            )}

            {summary && (
                <div className="prose prose-slate" style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: '#334155', maxWidth: 'none' }}>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{summary}</div>
                </div>
            )}
        </div>
    );
}
