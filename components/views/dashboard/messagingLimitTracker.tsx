"use client";

import React from 'react';
import { AlertCircle, ShieldAlert, Check, Info } from 'lucide-react';
import { tx } from './glassStyles';

// Hoverable info icon — reveals a tooltip card on hover/focus.
const InfoHint = ({ isDarkMode, children }: { isDarkMode: boolean; children: React.ReactNode }) => (
    <span className="relative group inline-flex items-center align-middle" tabIndex={0}>
        <Info
            size={12}
            className="cursor-help transition-colors"
            style={{ color: isDarkMode ? 'rgba(255,255,255,0.4)' : '#94a3b8' }}
        />
        <span
            role="tooltip"
            className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-72 -translate-x-1/2 rounded-lg border p-2.5 text-left opacity-0 translate-y-1 shadow-xl transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-0 group-focus:opacity-100 group-focus:translate-y-0"
            style={{
                fontSize: '11px',
                fontWeight: 500,
                lineHeight: 1.45,
                background: isDarkMode ? '#18181b' : '#ffffff',
                borderColor: isDarkMode ? '#27272a' : '#e4e4e7',
                color: isDarkMode ? 'rgba(255,255,255,0.8)' : '#475569',
            }}
        >
            {children}
        </span>
    </span>
);

interface MessagingLimitTrackerProps {
    isDarkMode?: boolean;
    limitData?: {
        limit: number | null;            // null = unknown (never Infinity)
        isUnlimited: boolean;
        isKnown: boolean;
        used: number;
        sevenDayUnique: number;
        thirtyDayUnique: number;
        quality: 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN' | string | null;
        upgradeTarget: number | null;
        upgradeWindowDays: number | null;
        allowsVerificationPath: boolean;
        requiresHighQuality: boolean;
        isEstimate: boolean;
        source?: 'meta' | 'cache';
        syncedAt?: string | null;
    };
}

// Small pass/pending indicator for an upgrade requirement
const RequirementDot = ({ met, isDarkMode }: { met: boolean; isDarkMode: boolean }) => (
    <span
        className="inline-flex items-center justify-center rounded-full shrink-0"
        style={{
            width: 14,
            height: 14,
            background: met ? '#10b981' : 'transparent',
            border: met ? 'none' : `1.5px solid ${isDarkMode ? '#3f3f46' : '#cbd5e1'}`,
        }}
    >
        {met && <Check size={9} color="#fff" strokeWidth={3.5} />}
    </span>
);

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

    // Everything shown here is a WhatsNexus-local estimate. Meta stays authoritative:
    // other phone numbers or platforms can consume the same portfolio limit, so we
    // never claim an exact "remaining" figure.
    const hasFiniteLimit = data.isKnown && !data.isUnlimited && typeof data.limit === 'number';
    const remaining = hasFiniteLimit ? Math.max(data.limit! - data.used, 0) : null;
    const usagePct = hasFiniteLimit ? Math.min((data.used / data.limit!) * 100, 100) : 0;
    const tierUnknown = !data.isKnown;

    // Determine alert level
    let alertState = 'normal';
    let alertMessage = '';
    let alertColor = '#10b981'; // green

    if (tierUnknown) {
        alertMessage = data.source === 'cache'
            ? 'Messaging tier not synchronized with Meta yet.'
            : 'Messaging tier not available from Meta.';
        alertColor = isDarkMode ? '#a1a1aa' : '#64748b';
    } else if (data.isUnlimited) {
        alertMessage = 'No portfolio messaging cap is currently reported by Meta.';
        alertColor = '#10b981';
    } else if (usagePct >= 100) {
        alertState = 'critical';
        alertMessage = 'Estimated local activity has reached the tier limit. Final capacity is decided by Meta.';
        alertColor = '#ef4444'; // red
    } else if (usagePct >= 80) {
        alertState = 'warning';
        alertMessage = 'Estimated local activity is approaching the tier limit.';
        alertColor = '#f59e0b'; // amber
    } else {
        alertState = 'normal';
        alertMessage = 'Local activity is well within the estimated tier limit.';
        alertColor = '#10b981';
    }

    // Upgrade target + window come from the backend tier resolver — no local map.
    const upgradeTarget = data.upgradeTarget ?? 0;
    const upgradeDays = data.upgradeWindowDays ?? 7;
    const qualityIsRequired = data.requiresHighQuality;
    const canVerifyInstead = data.allowsVerificationPath;
    const hasUpgradePath = data.isKnown && !data.isUnlimited && upgradeTarget > 0;
    const upgradeWindowUnique = upgradeDays === 30 ? data.thirtyDayUnique : data.sevenDayUnique;
    const upgradePct = upgradeTarget > 0
        ? Math.min((upgradeWindowUnique / upgradeTarget) * 100, 100)
        : 0;

    const normalizedQuality = String(data.quality || '').toUpperCase();
    const isKnownQuality = ['GREEN', 'YELLOW', 'RED'].includes(normalizedQuality);
    const qualityLabel = isKnownQuality ? normalizedQuality : 'Not rated yet';
    const qualityHex = ({
        GREEN: '#10b981',
        YELLOW: '#f59e0b',
        RED: '#ef4444',
    } as Record<string, string>)[normalizedQuality] ?? (isDarkMode ? '#71717a' : '#94a3b8');

    // The next tier needs BOTH: enough unique users in the window AND a GREEN quality rating.
    const usersRequirementMet = upgradeWindowUnique >= upgradeTarget;
    const qualityRequirementMet = normalizedQuality === 'GREEN';

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
                        {data.isUnlimited
                            ? 'Unlimited'
                            : hasFiniteLimit
                                ? `${data.limit!.toLocaleString()} unique recipients / 24h`
                                : (data.source === 'cache' ? 'Not synchronized' : 'Not available')}
                        {hasFiniteLimit && (
                            <span style={{ color: t.secondary }}> · estimate</span>
                        )}
                    </p>
                    <p style={{ fontSize: '11px', fontWeight: 500, color: t.secondary, marginTop: '2px' }}>
                        Rolling 24-hour window · local activity only · final capacity determined by Meta
                    </p>
                </div>

                {hasFiniteLimit ? (
                    <div className="flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span style={{ fontSize: '11px', fontWeight: 600, color: t.secondary }}>Estimated used</span>
                                <span style={{ fontSize: '18px', fontWeight: 700, color: t.primary, lineHeight: 1 }}>{data.used.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col text-right">
                                <span style={{ fontSize: '11px', fontWeight: 600, color: t.secondary }}>Estimated remaining</span>
                                <span style={{ fontSize: '18px', fontWeight: 700, color: alertColor, lineHeight: 1 }}>{remaining!.toLocaleString()}</span>
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
                                ~{Math.round(usagePct)}% of estimated capacity
                            </span>
                            <span style={{ fontSize: '11px', fontWeight: 500, color: t.secondary }}>
                                {alertMessage}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 p-3 rounded-lg"
                        style={{ background: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.03)', border: `1px solid ${isDarkMode ? '#27272a' : '#e4e4e7'}` }}>
                        <AlertCircle size={13} style={{ color: t.secondary, flexShrink: 0 }} />
                        <span style={{ fontSize: '11px', fontWeight: 500, color: t.secondary, lineHeight: 1.4 }}>
                            {data.isUnlimited
                                ? 'No usage estimate is shown while your account has no reported cap.'
                                : alertMessage}
                        </span>
                    </div>
                )}
            </div>

            {/* Section 2: Upgrade Progress + Quality */}
            <div className="flex flex-col gap-5">
                <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: t.primary, marginBottom: '2px' }} className="flex items-center gap-1.5">
                        <span>Upgrade Progress <span style={{ fontSize: '11px', fontWeight: 600, color: t.secondary }}>· estimate</span></span>
                        <InfoHint isDarkMode={isDarkMode}>
                            These figures reflect WhatsNexus activity only. Final eligibility is determined by Meta,
                            which also evaluates messages and templates across every number in the portfolio.
                            {qualityIsRequired ? ' One number being GREEN does not prove portfolio eligibility.' : ''}
                            {' '}After criteria are met, Meta says an increase may occur within about six hours.
                        </InfoHint>
                    </h3>
                    {data.isUnlimited ? (
                        <p style={{ fontSize: '12px', fontWeight: 500, color: t.secondary }}>
                            You&apos;re on the Unlimited tier. No upgrade needed.
                        </p>
                    ) : tierUnknown ? (
                        <p style={{ fontSize: '12px', fontWeight: 500, color: t.secondary }}>
                            Upgrade progress is unavailable until your messaging tier syncs with Meta.
                        </p>
                    ) : canVerifyInstead ? (
                        <p style={{ fontSize: '12px', fontWeight: 500, color: t.secondary }}>
                            Move up via the <span style={{ fontWeight: 600 }}>verification / partner path</span>, <span style={{ fontWeight: 600 }}>or</span> {upgradeTarget.toLocaleString()} qualifying delivered unique recipients in {upgradeDays} days
                            {qualityIsRequired ? ' with high-quality templates/messages' : ''}, then Meta approval.
                        </p>
                    ) : (
                        <p style={{ fontSize: '12px', fontWeight: 500, color: t.secondary }}>
                            {upgradeTarget.toLocaleString()} qualifying delivered unique recipients in {upgradeDays} days
                            {qualityIsRequired ? ' + high-quality templates/messages' : ''} + Meta approval.
                        </p>
                    )}
                </div>

                {hasUpgradePath && (
                <div className="flex flex-col gap-3">
                    <div className="p-3 rounded-lg border flex flex-col gap-2" style={{ background: isDarkMode ? '#18181b' : '#fafafa', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                        <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5" style={{ fontSize: '12px', fontWeight: 500, color: t.secondary }}>
                                    <RequirementDot met={usersRequirementMet} isDarkMode={isDarkMode} />
                                    {upgradeDays}-day qualifying recipients
                                </span>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: t.primary }}>
                                    ~{upgradeWindowUnique.toLocaleString()} <span style={{ color: t.secondary }}>/ {upgradeTarget.toLocaleString()}</span>
                                </span>
                            </div>
                        <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                            <div className="h-full rounded-full bg-blue-500 transition-all duration-1000"
                                style={{ width: `${upgradePct}%` }}
                            />
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 600, color: usersRequirementMet ? '#10b981' : t.secondary }}>
                            {usersRequirementMet ? 'Volume target reached in WhatsNexus' : `~${Math.round(upgradePct)}% of local target`}
                        </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border" style={{ background: isDarkMode ? '#18181b' : '#fafafa', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                        <span className="flex items-center gap-1.5" style={{ fontSize: '12px', fontWeight: 500, color: t.secondary }}>
                            {qualityIsRequired && <RequirementDot met={qualityRequirementMet} isDarkMode={isDarkMode} />}
                            {qualityIsRequired ? 'Quality rating is GREEN' : 'Account quality'}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: qualityHex }} />
                            <span style={{ fontSize: '12px', fontWeight: 600, color: qualityHex }}>{qualityLabel}</span>
                        </div>
                    </div>

                    {qualityIsRequired && isKnownQuality && !qualityRequirementMet && (
                        <div className="flex items-center gap-2 p-2.5 rounded-lg"
                            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                            <AlertCircle size={13} style={{ color: '#f59e0b', flexShrink: 0 }} />
                            <span style={{ fontSize: '11px', fontWeight: 500, color: '#f59e0b', lineHeight: 1.4 }}>
                                Avoid sending spam. A non-GREEN quality rating blocks tier upgrades.
                            </span>
                        </div>
                    )}

                    {!isKnownQuality && (
                        <div className="flex items-center gap-2 p-2.5 rounded-lg"
                            style={{ background: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.03)', border: `1px solid ${isDarkMode ? '#27272a' : '#e4e4e7'}` }}>
                            <AlertCircle size={13} style={{ color: t.secondary, flexShrink: 0 }} />
                            <span style={{ fontSize: '11px', fontWeight: 500, color: t.secondary, lineHeight: 1.4 }}>
                                Meta has not assigned a quality rating yet. It appears once your number has sent enough messages.
                            </span>
                        </div>
                    )}
                </div>
                )}
            </div>
        </div>
    );
};
