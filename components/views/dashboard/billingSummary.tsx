"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, ChevronRight } from 'lucide-react';
import { tx } from './glassStyles';

interface BillingSummaryProps {
    isDarkMode?: boolean;
    billingData?: {
        totalSpent: number;
        marketing: number;
        utility: number;
        authentication: number;
        service: number;
        totalMessages: number;
        billable: number;
        free: number;
    } | null;
    periodLabel?: string;
}

export const BillingSummary = ({ isDarkMode = true, billingData, periodLabel = '30 Days' }: BillingSummaryProps) => {
    const [show, setShow] = useState(false);
    const t = tx(isDarkMode);
    const router = useRouter();

    useEffect(() => {
        if (billingData) {
            const tm = setTimeout(() => setShow(true), 150);
            return () => clearTimeout(tm);
        }
    }, [billingData]);

    const categories = billingData ? [
        { label: 'Marketing', value: billingData.marketing || 0, color: '#8b5cf6' },
        { label: 'Utility', value: billingData.utility || 0, color: '#3b82f6' },
        { label: 'Auth', value: billingData.authentication || 0, color: '#f59e0b' },
        { label: 'Service', value: billingData.service || 0, color: '#10b981' },
    ] : [];

    const totalCatValue = categories.reduce((sum, c) => sum + c.value, 0);
    const maxCat = Math.max(...categories.map(c => c.value), 1);

    return (
        <div className="rounded-xl border" style={{ background: isDarkMode ? '#09090b' : '#ffffff', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
            <div className="px-5 pt-5 flex items-center justify-between">
                <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: t.primary }}>Meta Billing & Spend</h3>
                    <p style={{ fontSize: '12px', color: t.secondary, marginTop: 2 }}>Last {periodLabel}</p>
                </div>
                <button onClick={() => router.push('/billing')}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    style={{ fontSize: '12px', fontWeight: 500, color: t.secondary, borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                    Details <ChevronRight size={13} />
                </button>
            </div>

            {/* Total spend */}
            <div className="px-5 py-4">
                {!billingData ? (
                    <div className="h-16 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                ) : (
                    <div className="p-4 rounded-xl border" style={{
                        background: isDarkMode ? '#18181b' : '#fafafa', borderColor: isDarkMode ? '#27272a' : '#e4e4e7',
                        opacity: show ? 1 : 0, transition: 'opacity 0.3s ease'
                    }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>
                                <CreditCard size={18} />
                            </div>
                            <div>
                                <p style={{ fontSize: '11px', fontWeight: 500, color: t.secondary }}>Total Spend</p>
                                <p style={{ fontSize: '24px', fontWeight: 700, color: t.value, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                                    ₹{(billingData?.totalSpent || 0).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Category breakdown */}
            {billingData && (
                <div className="px-5 pb-4 space-y-2.5">
                    {categories.map((cat, i) => (
                        <div key={i} className="space-y-1" style={{
                            opacity: show ? 1 : 0, transition: `opacity 0.3s ease ${i * 40 + 100}ms`
                        }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                                    <span style={{ fontSize: '12px', fontWeight: 500, color: t.primary }}>{cat.label}</span>
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: t.value, fontVariantNumeric: 'tabular-nums' }}>₹{cat.value.toFixed(2)}</span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                                <div className="h-full rounded-full" style={{
                                    width: show && cat.value > 0 ? `${Math.max((cat.value / maxCat) * 100, 5)}%` : '0%',
                                    background: cat.color, transition: `width 700ms ease ${i * 50 + 150}ms`
                                }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Messages summary */}
            {billingData && (
                <div className="px-5 pb-5 pt-2 grid grid-cols-3 gap-2" style={{ borderTop: `1px solid ${isDarkMode ? '#27272a' : '#e4e4e7'}` }}>
                    {[
                        { label: 'Messages', value: billingData?.totalMessages || 0 },
                        { label: 'Billable', value: billingData?.billable || 0 },
                        { label: 'Free Tier', value: billingData?.free || 0 },
                    ].map((s, i) => (
                        <div key={i} className="p-2.5 rounded-lg border text-center" style={{ background: isDarkMode ? '#18181b' : '#fafafa', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                            <p style={{ fontSize: '16px', fontWeight: 700, color: t.value, fontVariantNumeric: 'tabular-nums' }}>{s.value.toLocaleString()}</p>
                            <p style={{ fontSize: '10px', fontWeight: 500, color: t.secondary, marginTop: 2 }}>{s.label}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
