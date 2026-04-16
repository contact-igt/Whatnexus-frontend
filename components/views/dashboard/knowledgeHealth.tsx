"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, AlertCircle, ChevronRight, FileText, Type, Link2 } from 'lucide-react';
import { tx } from './glassStyles';

interface KnowledgeHealthProps {
    isDarkMode?: boolean;
    knowledgeData?: {
        totalSources: number;
        activeSources: number;
        inactiveSources: number;
        totalChunks: number;
        sourceTypes: { type: string; count: number }[];
    };
}

const typeIcons: Record<string, any> = {
    file: FileText,
    text: Type,
    url: Link2,
};

export const KnowledgeHealth = ({ isDarkMode = true, knowledgeData }: KnowledgeHealthProps) => {
    const [show, setShow] = useState(false);
    const t = tx(isDarkMode);
    const router = useRouter();

    useEffect(() => {
        if (knowledgeData) {
            const tm = setTimeout(() => setShow(true), 150);
            return () => clearTimeout(tm);
        }
    }, [knowledgeData]);

    const noSources = knowledgeData && knowledgeData.activeSources === 0;

    return (
        <div className="rounded-xl border" style={{ background: isDarkMode ? '#09090b' : '#ffffff', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
            <div className="px-5 pt-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: t.primary }}>Knowledge Base</h3>
                    {noSources && (
                        <span className="px-1.5 py-0.5 rounded-md flex items-center gap-1"
                            style={{ fontSize: '10px', fontWeight: 600, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                            <AlertCircle size={10} /> No Sources
                        </span>
                    )}
                </div>
                <button onClick={() => {
                    localStorage.setItem('selectedTab', 'data-sources');
                    router.push('/knowledge');
                }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    style={{ fontSize: '12px', fontWeight: 500, color: t.secondary, borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                    Manage <ChevronRight size={13} />
                </button>
            </div>

            <div className="px-5 py-4">
                {!knowledgeData ? (
                    <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { label: 'Total',    sub: 'all sources',      value: knowledgeData.totalSources,    color: '#8b5cf6' },
                            { label: 'Active',   sub: 'sources enabled',  value: knowledgeData.activeSources,   color: '#10b981' },
                            { label: 'Inactive', sub: 'sources disabled', value: knowledgeData.inactiveSources, color: '#f59e0b' },
                        ].map((s, i) => (
                            <div key={i} className="p-3 rounded-xl border text-center" style={{
                                background: isDarkMode ? '#18181b' : '#fafafa', borderColor: isDarkMode ? '#27272a' : '#e4e4e7',
                                opacity: show ? 1 : 0, transition: `opacity 0.3s ease ${i * 40}ms`
                            }}>
                                <p style={{ fontSize: '20px', fontWeight: 700, color: s.color, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{s.value.toLocaleString()}</p>
                                <p style={{ fontSize: '11px', fontWeight: 500, color: t.secondary, marginTop: 3 }}>{s.label}</p>
                                <p style={{ fontSize: '9px', color: t.micro, marginTop: 1 }}>{s.sub}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Source type breakdown */}
            {knowledgeData && knowledgeData.sourceTypes.length > 0 && (
                <div className="px-5 pb-4 flex items-center gap-4" style={{ borderTop: `1px solid ${isDarkMode ? '#27272a' : '#e4e4e7'}` }}>
                    {knowledgeData.sourceTypes.map((st, i) => {
                        const Icon = typeIcons[st.type] || BookOpen;
                        return (
                            <div key={i} className="flex items-center gap-1.5 pt-3">
                                <Icon size={13} style={{ color: t.secondary }} />
                                <span style={{ fontSize: '12px', color: t.secondary }}>{st.type}: <strong style={{ color: t.primary }}>{st.count}</strong></span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
