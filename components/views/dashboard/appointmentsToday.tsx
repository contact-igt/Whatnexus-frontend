"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    CalendarCheck, CheckCircle, AlertCircle, Clock,
    Phone, ChevronRight, CalendarX
} from 'lucide-react';
import { tx } from './glassStyles';
import { NoDataFound } from './noDataFound';

interface Appointment {
    name: string;
    time: string;    // "HH:MM:SS" or "hh:mm A"
    type: string;    // "Pending" | "Confirmed"
    contact: string;
}

interface AppointmentsTodayProps {
    isDarkMode?: boolean;
    followUpsData?: {
        dueToday: number;
        completedToday: number;
        overdue: number;
        upcomingToday: Appointment[];
    };
}

function parseTime(timeStr: string): string {
    if (!timeStr) return '—';
    // Already formatted like "10:30 AM"
    if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
    // "HH:MM:SS" format
    const [hStr, mStr] = timeStr.split(':');
    const h = parseInt(hStr, 10);
    const m = mStr ?? '00';
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${m} ${period}`;
}

export const AppointmentsToday = ({ isDarkMode = true, followUpsData }: AppointmentsTodayProps) => {
    const [show, setShow] = useState(false);
    const t = tx(isDarkMode);
    const router = useRouter();

    useEffect(() => {
        if (followUpsData) {
            const tm = setTimeout(() => setShow(true), 150);
            return () => clearTimeout(tm);
        }
    }, [followUpsData]);

    const hasData = followUpsData && (followUpsData.dueToday > 0 || followUpsData.completedToday > 0 || followUpsData.overdue > 0);
    const upcoming = followUpsData?.upcomingToday ?? [];

    if (followUpsData && !hasData && upcoming.length === 0) {
        return (
            <div className="rounded-xl p-5 border flex flex-col gap-5 h-full" style={{ background: isDarkMode ? '#09090b' : '#ffffff', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: t.primary }}>Today&apos;s Appointments</h3>
                <div className="flex-1 flex flex-col justify-center">
                    <NoDataFound
                        isDarkMode={isDarkMode}
                        title="No Appointments Today"
                        description="Scheduled appointments will appear here."
                        icon={<CalendarCheck size={32} />}
                        className="bg-transparent border-none shadow-none"
                    />
                </div>
            </div>
        );
    }

    const stats = [
        { icon: <Clock size={15} />, label: 'Pending', value: followUpsData?.dueToday ?? 0, color: '#f59e0b' },
        { icon: <CheckCircle size={15} />, label: 'Completed', value: followUpsData?.completedToday ?? 0, color: '#10b981' },
        { icon: <AlertCircle size={15} />, label: 'Overdue', value: followUpsData?.overdue ?? 0, color: '#ef4444' },
    ];

    const totalToday = (followUpsData?.dueToday ?? 0) + (followUpsData?.completedToday ?? 0);

    return (
        <div className="rounded-xl border flex flex-col gap-4 transition-all" style={{ background: isDarkMode ? '#09090b' : '#ffffff', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>

            {/* Header */}
            <div className="px-5 pt-5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: t.primary }}>Today&apos;s Appointments</h3>
                    {totalToday > 0 && (
                        <span className="px-1.5 py-0.5 rounded-md"
                            style={{ fontSize: '11px', fontWeight: 600, background: isDarkMode ? 'rgba(59,130,246,0.1)' : '#eff6ff', color: '#3b82f6', border: `1px solid ${isDarkMode ? 'rgba(59,130,246,0.2)' : '#bfdbfe'}` }}>
                            {totalToday}
                        </span>
                    )}
                </div>
                <button onClick={() => router.push('/appointments')}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    style={{ fontSize: '12px', fontWeight: 500, color: t.secondary, borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                    View All <ChevronRight size={13} />
                </button>
            </div>

            {/* Status counters */}
            <div className="px-5 grid grid-cols-3 gap-2.5">
                {!followUpsData ? (
                    Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />)
                ) : stats.map((s, i) => (
                    <div key={i} className="p-3 rounded-xl border flex items-center gap-3 transition-all"
                        style={{
                            background: isDarkMode ? '#18181b' : '#fafafa', borderColor: isDarkMode ? '#27272a' : '#e4e4e7',
                            opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(4px)',
                            transition: `all 0.3s ease ${i * 50}ms`
                        }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: `${s.color}12`, color: s.color }}>
                            {s.icon}
                        </div>
                        <div>
                            <p style={{ fontSize: '18px', fontWeight: 600, color: t.value, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{s.value}</p>
                            <p style={{ fontSize: '11px', fontWeight: 500, color: t.secondary, marginTop: 2 }}>{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Upcoming list */}
            <div className="px-5 pb-5">
                <div className="flex items-center gap-2 mb-3">
                    <CalendarCheck size={14} style={{ color: '#3b82f6' }} />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: t.secondary }}>Upcoming</span>
                    {upcoming.length > 0 && (
                        <span style={{ fontSize: '11px', fontWeight: 500, color: t.secondary }}>({upcoming.length})</span>
                    )}
                </div>

                {!followUpsData ? (
                    <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />)}
                    </div>
                ) : upcoming.length === 0 ? (
                    <div className="p-4 rounded-lg border border-dashed flex items-center justify-center"
                        style={{ borderColor: isDarkMode ? '#3f3f46' : '#d4d4d8', color: t.secondary, fontSize: '13px' }}>
                        No upcoming appointments
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        {upcoming.map((apt, i) => {
                            const isPending = apt.type === 'Pending';
                            const statusColor = isPending ? '#f59e0b' : '#10b981';
                            return (
                                <div key={i}
                                    onClick={() => router.push('/appointments')}
                                    className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
                                    style={{
                                        background: isDarkMode ? '#18181b' : '#fafafa',
                                        borderColor: isDarkMode ? '#27272a' : '#e4e4e7',
                                        opacity: show ? 1 : 0, transform: show ? 'translateX(0)' : 'translateX(-4px)',
                                        transition: `all 0.3s ease ${i * 40 + 100}ms`,
                                    }}>
                                    {/* Time */}
                                    <div className="flex flex-col items-center shrink-0 w-16">
                                        <span style={{ fontSize: '13px', fontWeight: 600, color: t.primary, fontVariantNumeric: 'tabular-nums' }}>
                                            {parseTime(apt.time)}
                                        </span>
                                    </div>

                                    {/* Divider */}
                                    <div className="w-px h-8 shrink-0" style={{ background: isDarkMode ? '#27272a' : '#e4e4e7' }} />

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <p className="truncate" style={{ fontSize: '13px', fontWeight: 500, color: t.primary }}>{apt.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Phone size={10} style={{ color: t.secondary }} />
                                            <span style={{ fontSize: '11px', color: t.secondary, fontVariantNumeric: 'tabular-nums' }}>{apt.contact}</span>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <span className="px-2 py-0.5 rounded-md shrink-0"
                                        style={{ fontSize: '10px', fontWeight: 600, background: `${statusColor}12`, color: statusColor, border: `1px solid ${statusColor}25` }}>
                                        {apt.type}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
