"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Stethoscope, ChevronRight, AlertTriangle } from 'lucide-react';
import { tx } from './glassStyles';

interface DoctorOverviewProps {
    isDarkMode?: boolean;
    doctorData?: {
        statusBreakdown: { status: string; count: number }[];
        totalDoctors: number;
        specializations: number;
    };
}

const statusConfig: Record<string, { color: string; label: string }> = {
    available: { color: '#10b981', label: 'Available' },
    busy: { color: '#f59e0b', label: 'Busy' },
    off_duty: { color: '#94a3b8', label: 'Off Duty' },
};

export const DoctorOverview = ({ isDarkMode = true, doctorData }: DoctorOverviewProps) => {
    const [show, setShow] = useState(false);
    const t = tx(isDarkMode);
    const router = useRouter();

    useEffect(() => {
        if (doctorData) {
            const tm = setTimeout(() => setShow(true), 150);
            return () => clearTimeout(tm);
        }
    }, [doctorData]);

    if (doctorData && doctorData.totalDoctors === 0) return null;

    const getCount = (status: string) => doctorData?.statusBreakdown.find(s => s.status === status)?.count || 0;

    return (
        <div className="rounded-xl border" style={{ background: isDarkMode ? '#09090b' : '#ffffff', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
            <div className="px-5 pt-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: t.primary }}>Doctors</h3>
                    {doctorData && (
                        <span className="px-1.5 py-0.5 rounded-md"
                            style={{ fontSize: '11px', fontWeight: 600, background: isDarkMode ? 'rgba(16,185,129,0.1)' : '#ecfdf5', color: '#10b981', border: `1px solid ${isDarkMode ? 'rgba(16,185,129,0.2)' : '#a7f3d0'}` }}>
                            {doctorData.totalDoctors}
                        </span>
                    )}
                </div>
                <button onClick={() => router.push('/doctors')}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    style={{ fontSize: '12px', fontWeight: 500, color: t.secondary, borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                    Manage <ChevronRight size={13} />
                </button>
            </div>

            <div className="px-5 py-4">
                {!doctorData ? (
                    <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-2">
                        {(['available', 'busy', 'off_duty'] as const).map((status, i) => {
                            const cfg = statusConfig[status];
                            const count = getCount(status);
                            return (
                                <div key={status} className="p-3 rounded-xl border flex flex-col items-center gap-1"
                                    style={{
                                        background: isDarkMode ? '#18181b' : '#fafafa', borderColor: isDarkMode ? '#27272a' : '#e4e4e7',
                                        opacity: show ? 1 : 0, transition: `opacity 0.3s ease ${i * 50}ms`
                                    }}>
                                    <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                                    <p style={{ fontSize: '20px', fontWeight: 700, color: t.value, fontVariantNumeric: 'tabular-nums' }}>{count}</p>
                                    <p style={{ fontSize: '11px', fontWeight: 500, color: t.secondary }}>{cfg.label}</p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {doctorData && (
                <div className="px-5 pb-4 flex items-center justify-between" style={{ borderTop: `1px solid ${isDarkMode ? '#27272a' : '#e4e4e7'}` }}>
                    <div className="flex items-center gap-2 pt-3">
                        <Stethoscope size={14} style={{ color: '#8b5cf6' }} />
                        <span style={{ fontSize: '12px', fontWeight: 500, color: t.secondary }}>Specializations: <strong style={{ color: t.primary }}>{doctorData.specializations}</strong></span>
                    </div>
                    {getCount('off_duty') > 0 && getCount('available') === 0 && (
                        <div className="flex items-center gap-1.5 pt-3" style={{ color: '#f59e0b' }}>
                            <AlertTriangle size={13} />
                            <span style={{ fontSize: '11px', fontWeight: 600 }}>No doctors available</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
