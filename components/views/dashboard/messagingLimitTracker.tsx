"use client";

import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { tx } from './glassStyles';

interface MessagingLimitTrackerProps {
    isDarkMode?: boolean;
    limitData?: {
        limit: number;
        used: number;
        sevenDayUnique: number;
        thirtyDayUnique: number;
        quality: 'GREEN' | 'YELLOW' | 'RED';
    };
}

export const MessagingLimitTracker = ({ isDarkMode = true, limitData }: MessagingLimitTrackerProps) => {
    const t = tx(isDarkMode);

    if (!limitData) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-xl border p-6"
                style={{ background: isDarkMode ? '#09090b' : '#ffffff', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-16 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                ))}
            </div>
        );
    }

    const data = limitData;

    const remaining = data.limit === Infinity ? Infinity : Math.max(data.limit - data.used, 0);
    const usagePct = Math.min((data.used / data.limit) * 100, 100);
    
    // Determine alert level
    let alertState = 'normal';
    let alertMessage = '';
    let alertColor = '#10b981'; // green

    if (usagePct >= 100) {
        alertState = 'critical';
        alertMessage = 'Limit reached. Campaign sending blocked until limit resets.';
        alertColor = '#ef4444'; // red
    } else if (usagePct >= 80) {
        alertState = 'warning';
        alertMessage = 'Approaching limit. Monitor your automated messages closely.';
        alertColor = '#f59e0b'; // amber
    } else {
        alertState = 'normal';
        alertMessage = 'Usage is healthy. You have sufficient limits for campaigns.';
        alertColor = '#10b981';
    }

    // Upgrade guidance: target unique-users needed for the NEXT tier
    // and how many days the window is (30 days for Trial, 7 days for all others)
    const upgradeConfig: Record<number, { target: number; days: number; hint: string } | null> = {
        250:       { target: 2000,  days: 30, hint: 'Send 2,000 unique users in 30 days OR verify your business' },
        2000:      { target: 1000,  days: 7,  hint: 'Reach 1,000 unique users in last 7 days & maintain GREEN quality' },
        10000:     { target: 5000,  days: 7,  hint: 'Reach 5,000 unique users in last 7 days & maintain GREEN quality' },
        100000:    { target: 50000, days: 7,  hint: 'Reach 50,000 unique users in last 7 days & maintain GREEN quality' },
    };
    const upgradeCfg = data.limit === Infinity ? null : (upgradeConfig[data.limit] ?? upgradeConfig[250]);
    const upgradeTarget  = upgradeCfg?.target  ?? data.limit;
    const upgradeDays    = upgradeCfg?.days    ?? 7;
    const upgradeHint    = upgradeCfg?.hint    ?? null;
    const upgradeWindowUnique = upgradeDays === 30 ? data.thirtyDayUnique : data.sevenDayUnique;
    const upgradePct = Math.min((upgradeWindowUnique / upgradeTarget) * 100, 100);

    const qualityHex = {
        GREEN: '#10b981',
        YELLOW: '#f59e0b',
        RED: '#ef4444'
    }[data.quality];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-xl border p-6 transition-all"
            style={{ 
                background: isDarkMode ? '#09090b' : '#ffffff', 
                borderColor: isDarkMode ? '#27272a' : '#e4e4e7' 
            }}>
            
            {/* Section 1: Usage Tracker */}
            <div className="flex flex-col gap-5 md:border-r pr-6" style={{ borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                <div>
                    <div className="flex items-center justify-between">
                        <h3 style={{ fontSize: '15px', fontWeight: 600, color: t.primary, marginBottom: '2px' }}>
                            Messaging Limit
                        </h3>
                        {alertState !== 'normal' && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md"
                                style={{ fontSize: '10px', fontWeight: 700, background: `${alertColor}15`, color: alertColor, border: `1px solid ${alertColor}30` }}>
                                {alertState === 'critical' ? <ShieldAlert size={11} /> : <AlertCircle size={11} />}
                                {alertState === 'critical' ? 'LIMIT REACHED' : 'NEAR LIMIT'}
                            </span>
                        )}
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: t.primary }}>
                        {data.limit === Infinity ? 'Unlimited' : data.limit.toLocaleString()} <span style={{ color: t.secondary }}>unique users / 24h</span>
                    </p>
                    <p style={{ fontSize: '11px', fontWeight: 500, color: t.secondary, marginTop: '2px' }}>
                        Rolling 24-hour window (does not reset at midnight)
                    </p>
                </div>

                <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span style={{ fontSize: '11px', fontWeight: 600, color: t.secondary }}>Used</span>
                            <span style={{ fontSize: '18px', fontWeight: 700, color: t.primary, lineHeight: 1 }}>{data.used.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col text-right">
                            <span style={{ fontSize: '11px', fontWeight: 600, color: t.secondary }}>Remaining</span>
                            <span style={{ fontSize: '18px', fontWeight: 700, color: alertColor, lineHeight: 1 }}>{data.limit === Infinity ? '∞' : remaining.toLocaleString()}</span>
                        </div>
                    </div>
                    
                    <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                        <div className="h-full rounded-full transition-all duration-1000"
                            style={{ 
                                width: `${usagePct}%`, 
                                background: alertColor
                            }} 
                        />
                    </div>
                    <div className="flex justify-between items-center mt-0.5">
                        <span style={{ fontSize: '11px', fontWeight: 600, color: alertColor }}>
                            {Math.round(usagePct)}% utilized
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 500, color: t.secondary }}>
                            {alertMessage}
                        </span>
                    </div>
                </div>
            </div>

            {/* Section 2: Upgrade Progress + Quality */}
            <div className="flex flex-col gap-5">
                <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: t.primary, marginBottom: '2px' }}>
                        Upgrade Progress
                    </h3>
                    {data.limit === Infinity ? (
                        <p style={{ fontSize: '12px', fontWeight: 500, color: t.secondary }}>
                            You&apos;re on the Unlimited tier. No upgrade needed.
                        </p>
                    ) : upgradeHint ? (
                        <p style={{ fontSize: '12px', fontWeight: 500, color: t.secondary }}>
                            {upgradeHint}
                        </p>
                    ) : null}
                </div>

                <div className="flex flex-col gap-3">
                    <div className="p-3 rounded-lg border flex flex-col gap-2" style={{ background: isDarkMode ? '#18181b' : '#fafafa', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                        <div className="flex items-center justify-between">
                                <span style={{ fontSize: '12px', fontWeight: 500, color: t.secondary }}>{upgradeDays}-day unique users</span>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: t.primary }}>
                                    {upgradeWindowUnique.toLocaleString()} <span style={{ color: t.secondary }}>/ {upgradeTarget.toLocaleString()}</span>
                                </span>
                            </div>
                        <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                            <div className="h-full rounded-full bg-blue-500 transition-all duration-1000"
                                style={{ width: `${upgradePct}%` }} 
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border" style={{ background: isDarkMode ? '#18181b' : '#fafafa', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                        <span style={{ fontSize: '12px', fontWeight: 500, color: t.secondary }}>Account Quality</span>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: qualityHex }} />
                            <span style={{ fontSize: '12px', fontWeight: 600, color: qualityHex }}>{data.quality}</span>
                        </div>
                    </div>

                    {data.quality !== 'GREEN' && (
                        <div className="flex items-center gap-2 p-2.5 rounded-lg"
                            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                            <AlertCircle size={13} style={{ color: '#f59e0b', flexShrink: 0 }} />
                            <span style={{ fontSize: '11px', fontWeight: 500, color: '#f59e0b', lineHeight: 1.4 }}>
                                Avoid sending spam. Low quality prevents tier upgrades.
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
