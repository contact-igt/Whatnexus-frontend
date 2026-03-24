"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, UserX, BotOff, FolderOpen, ChevronRight } from 'lucide-react';
import { tx } from './glassStyles';

interface ContactOverviewProps {
    isDarkMode?: boolean;
    contactData?: {
        totalContacts: number;
        blocked: number;
        aiSilenced: number;
        totalGroups: number;
        avgGroupSize: number;
    };
}

export const ContactOverview = ({ isDarkMode = true, contactData }: ContactOverviewProps) => {
    const [show, setShow] = useState(false);
    const t = tx(isDarkMode);
    const router = useRouter();

    useEffect(() => {
        if (contactData) {
            const tm = setTimeout(() => setShow(true), 150);
            return () => clearTimeout(tm);
        }
    }, [contactData]);

    const stats = contactData ? [
        { icon: <Users size={15} />, label: 'Total Contacts', value: contactData.totalContacts, color: '#3b82f6' },
        { icon: <FolderOpen size={15} />, label: 'Groups', value: contactData.totalGroups, color: '#8b5cf6' },
        { icon: <UserX size={15} />, label: 'Blocked', value: contactData.blocked, color: '#ef4444' },
        { icon: <BotOff size={15} />, label: 'AI Silenced', value: contactData.aiSilenced, color: '#f59e0b' },
    ] : [];

    return (
        <div className="rounded-xl border" style={{ background: isDarkMode ? '#09090b' : '#ffffff', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
            <div className="px-5 pt-5 flex items-center justify-between">
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: t.primary }}>Contacts & Audience</h3>
                <button onClick={() => router.push('/contacts/contacts')}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    style={{ fontSize: '12px', fontWeight: 500, color: t.secondary, borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                    View <ChevronRight size={13} />
                </button>
            </div>

            <div className="px-5 py-4">
                {!contactData ? (
                    <div className="grid grid-cols-4 gap-2">
                        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-2">
                        {stats.map((s, i) => (
                            <div key={i} className="p-3 rounded-xl border flex flex-col items-center gap-1.5"
                                style={{
                                    background: isDarkMode ? '#18181b' : '#fafafa', borderColor: isDarkMode ? '#27272a' : '#e4e4e7',
                                    opacity: show ? 1 : 0, transition: `opacity 0.3s ease ${i * 40}ms`
                                }}>
                                <div style={{ color: s.color }}>{s.icon}</div>
                                <p style={{ fontSize: '18px', fontWeight: 700, color: t.value, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{s.value.toLocaleString()}</p>
                                <p style={{ fontSize: '10px', fontWeight: 500, color: t.secondary }}>{s.label}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {contactData && contactData.totalGroups > 0 && (
                <div className="px-5 pb-4" style={{ borderTop: `1px solid ${isDarkMode ? '#27272a' : '#e4e4e7'}` }}>
                    <div className="flex items-center gap-2 pt-3">
                        <span style={{ fontSize: '12px', color: t.secondary }}>Avg group size: <strong style={{ color: t.primary }}>{contactData.avgGroupSize} members</strong></span>
                    </div>
                </div>
            )}
        </div>
    );
};
