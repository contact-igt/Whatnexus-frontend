"use client";

import React from 'react';
import { Layers, Shield, CalendarDays, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { glassCard, glassInner, tx } from '../dashboard/glassStyles';

interface SuperAdminCommandBarProps {
    isDarkMode?: boolean;
    periodLabel?: string;
    tenantTrend?: number | null;
    isFetching?: boolean;
}

export const SuperAdminCommandBar = ({
    isDarkMode = true,
    periodLabel,
    tenantTrend = null,
    isFetching = false,
}: SuperAdminCommandBarProps) => {
    const t = tx(isDarkMode);

    return (
        <div className="rounded-2xl overflow-hidden relative" style={{
            ...glassCard(isDarkMode),
            borderTop: '2px solid transparent',
            borderImage: 'linear-gradient(90deg, #8b5cf6, #6366f1, #8b5cf6) 1',
        }}>
            {/* Subtle gradient shimmer overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    background: isDarkMode
                        ? 'radial-gradient(ellipse at 20% 50%, #8b5cf6 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, #6366f1 0%, transparent 60%)'
                        : 'radial-gradient(ellipse at 20% 50%, #8b5cf6 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, #6366f1 0%, transparent 60%)',
                }} />

            <div className="relative px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between gap-4 flex-wrap">

                {/* Left: Logo + Title + Greeting */}
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center relative shrink-0"
                        style={{
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #7c3aed 100%)',
                            boxShadow: '0 4px 12px rgba(139,92,246,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
                        }}>
                        <Layers size={19} style={{ color: '#ffffff' }} />
                        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 animate-pulse"
                            style={{ background: '#4ade80', borderColor: isDarkMode ? '#09090b' : '#ffffff' }} />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2.5">
                            <h1 style={{ fontSize: '18px', fontWeight: 700, color: t.primary, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                                Command Center
                            </h1>
                            <span className="px-2 py-0.5 rounded-md flex items-center gap-1.5"
                                style={{
                                    background: isDarkMode ? 'rgba(16,185,129,0.1)' : '#ecfdf5',
                                    border: `1px solid ${isDarkMode ? 'rgba(16,185,129,0.2)' : '#a7f3d0'}`,
                                }}>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span style={{ fontSize: '10px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Live
                                </span>
                            </span>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 500, color: t.secondary, marginTop: 2 }}>
                            Platform-wide overview • {periodLabel || 'Last 30 Days'}
                        </span>
                    </div>
                </div>

                {/* Right: Status indicators */}
                <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Platform status */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={glassInner(isDarkMode)}>
                        <Zap size={13} style={{ color: '#4ade80' }} />
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#4ade80', boxShadow: '0 0 6px rgba(74,222,128,0.5)' }} />
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#4ade80' }}>All Systems Operational</span>
                        </div>
                    </div>

                    {/* Growth trend */}
                    {tenantTrend !== null && tenantTrend !== 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl" style={glassInner(isDarkMode)}>
                            {tenantTrend >= 0 ? (
                                <TrendingUp size={13} style={{ color: '#10b981' }} />
                            ) : (
                                <TrendingDown size={13} style={{ color: '#ef4444' }} />
                            )}
                            <span style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                color: tenantTrend >= 0 ? '#10b981' : '#ef4444',
                            }}>
                                {tenantTrend >= 0 ? '+' : ''}{tenantTrend.toFixed(1)}%
                            </span>
                            <span style={{ fontSize: '10px', color: t.micro }}>growth</span>
                        </div>
                    )}

                    {/* Date */}
                    <div className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl" style={glassInner(isDarkMode)}>
                        <CalendarDays size={13} style={{ color: t.micro }} />
                        <span style={{ fontSize: '11px', fontWeight: 600, color: t.secondary }}>
                            {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                    </div>

                    {/* Syncing indicator */}
                    {isFetching && (
                        <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl" style={glassInner(isDarkMode)}>
                            <div className="w-3 h-3 border-2 rounded-full animate-spin"
                                style={{ borderColor: `${isDarkMode ? '#27272a' : '#e4e4e7'}`, borderTopColor: '#8b5cf6' }} />
                            <span style={{ fontSize: '10px', fontWeight: 600, color: t.micro }}>Syncing</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
