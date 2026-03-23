"use client";

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, TrendingUp, ShieldAlert, Zap, MessageSquare, Plus, AlertTriangle } from 'lucide-react';
import { tx } from './glassStyles';

interface MessagingLimitTrackerProps {
    isDarkMode?: boolean;
    limitData?: {
        limit: number;
        used: number;
        sevenDayUnique: number;
        quality: 'GREEN' | 'YELLOW' | 'RED';
    };
}

export const MessagingLimitTracker = ({ isDarkMode = true, limitData }: MessagingLimitTrackerProps) => {
    const t = tx(isDarkMode);

    // Mock data if backend hasn't supplied it
    const data = limitData || {
        limit: 2000,
        used: 1420,
        sevenDayUnique: 14,
        quality: 'GREEN' as const
    };

    const remaining = data.limit - data.used;
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

    const upgradeThreshold = data.limit === Infinity ? 100000 : data.limit; 
    const upgradePct = Math.min((data.sevenDayUnique / upgradeThreshold) * 100, 100);

    const qualityHex = {
        GREEN: '#10b981',
        YELLOW: '#f59e0b',
        RED: '#ef4444'
    }[data.quality];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-xl border p-6 transition-all"
            style={{ 
                background: isDarkMode ? '#09090b' : '#ffffff', 
                borderColor: isDarkMode ? '#27272a' : '#e4e4e7' 
            }}>
            
            {/* Section 1: Usage Tracker */}
            <div className="flex flex-col gap-5 md:border-r pr-6" style={{ borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: t.primary, marginBottom: '2px' }}>
                        Messaging Limit
                    </h3>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: t.primary }}>
                        {data.limit === Infinity ? 'Unlimited' : data.limit.toLocaleString()} <span style={{ color: t.secondary }}>conversations / 24h</span>
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
                        {alertState !== 'normal' && (
                            <span className="flex items-center gap-1" style={{ fontSize: '10px', fontWeight: 600, color: alertColor }}>
                                {alertState === 'critical' ? <ShieldAlert size={12} /> : <AlertCircle size={12} />}
                                {alertState === 'critical' ? 'LIMIT REACHED' : 'NEAR LIMIT'}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Section 2: Upgrade Progress */}
            <div className="flex flex-col gap-5 md:border-r pr-6" style={{ borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: t.primary, marginBottom: '2px' }}>
                        Upgrade Progress
                    </h3>
                    <p style={{ fontSize: '12px', fontWeight: 500, color: t.secondary }}>
                        Reach {upgradeThreshold.toLocaleString()} unique users in 7 days to unlock next tier.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <div className="p-3 rounded-lg border flex flex-col gap-2" style={{ background: isDarkMode ? '#18181b' : '#fafafa', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                        <div className="flex items-center justify-between">
                            <span style={{ fontSize: '12px', fontWeight: 500, color: t.secondary }}>7-day unique users</span>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: t.primary }}>
                                {data.sevenDayUnique.toLocaleString()} <span style={{ color: t.secondary }}>/ {upgradeThreshold.toLocaleString()}</span>
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
                </div>
            </div>

            {/* Section 3: Smart Insights & Alerts */}
            <div className="flex flex-col gap-4">
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: t.primary }}>
                    System Insights
                </h3>
                
                <div className="flex flex-col gap-2.5">
                    {/* Primary Alert (if any) */}
                    <div className="flex gap-3 p-3 rounded-lg border" 
                        style={{ background: `${alertColor}15`, borderColor: `${alertColor}30` }}>
                        <div style={{ color: alertColor, marginTop: '2px' }}>
                            {alertState === 'critical' ? <ShieldAlert size={16} /> : alertState === 'warning' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                        </div>
                        <div className="flex flex-col">
                            <span style={{ fontSize: '12px', fontWeight: 600, color: alertColor }}>
                                {alertState === 'critical' ? 'Action Required' : alertState === 'warning' ? 'Warning' : 'All Clear'}
                            </span>
                            <span style={{ fontSize: '11px', fontWeight: 500, color: t.primary, marginTop: '2px', lineHeight: 1.4 }}>
                                {alertMessage}
                            </span>
                        </div>
                    </div>

                    {/* Quality Warning (if applicable) */}
                    {data.quality !== 'GREEN' && (
                        <div className="flex gap-3 p-3 rounded-lg border" 
                            style={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.2)' }}>
                            <div style={{ color: '#f59e0b', marginTop: '2px' }}><AlertTriangle size={16} /></div>
                            <div className="flex flex-col">
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#f59e0b' }}>Quality Dropped</span>
                                <span style={{ fontSize: '11px', fontWeight: 500, color: t.primary, marginTop: '2px', lineHeight: 1.4 }}>
                                    Avoid sending spam. Low quality prevents tier upgrades.
                                </span>
                            </div>
                        </div>
                    )}

                    {/* General Insight / Availability */}
                    {usagePct > 0 && usagePct < 100 ? (
                        <div className="flex gap-3 p-3 rounded-lg border" 
                            style={{ background: isDarkMode ? '#18181b' : '#fafafa', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                            <div style={{ color: '#3b82f6', marginTop: '2px' }}><TrendingUp size={16} /></div>
                            <div className="flex flex-col">
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#3b82f6' }}>Next Availability</span>
                                <span style={{ fontSize: '11px', fontWeight: 500, color: t.primary, marginTop: '2px', lineHeight: 1.4 }}>
                                    Your consumed limit will slowly return over the next 24 hours as older conversations exit the rolling window.
                                </span>
                            </div>
                        </div>
                    ) : usagePct >= 100 ? (
                        <div className="flex gap-3 p-3 rounded-lg border" 
                            style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.2)' }}>
                            <div style={{ color: '#ef4444', marginTop: '2px' }}><ShieldAlert size={16} /></div>
                            <div className="flex flex-col">
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#ef4444' }}>Sending Blocked</span>
                                <span style={{ fontSize: '11px', fontWeight: 500, color: t.primary, marginTop: '2px', lineHeight: 1.4 }}>
                                    You have 0 remaining limit. Campaigns will be queued or blocked until older conversations expire.
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-3 p-3 rounded-lg border" 
                            style={{ background: isDarkMode ? '#18181b' : '#fafafa', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                            <div style={{ color: '#10b981', marginTop: '2px' }}><Zap size={16} /></div>
                            <div className="flex flex-col">
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#10b981' }}>Full Capacity</span>
                                <span style={{ fontSize: '11px', fontWeight: 500, color: t.primary, marginTop: '2px', lineHeight: 1.4 }}>
                                    You have full sending limits available for campaigns.
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
