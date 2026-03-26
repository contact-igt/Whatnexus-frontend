"use client";

import { useState } from 'react';
import { Key, RefreshCw, Loader2, CheckCircle2, Copy, Check, ExternalLink, Mail, AlertCircle, XCircle, Webhook } from 'lucide-react';
import { cn } from "@/lib/utils";
import { getWebhookBaseURL } from '@/helper/axios';

interface MetaVerificationCardProps {
    isDarkMode: boolean;
    user: any;
    onCheckStatus: () => void;
    isChecking: boolean;
    onSubscribeWebhooks?: () => void;
    isSubscribing?: boolean;
    statusData?: {
        overall_status?: string;
        verify_token_set?: boolean;
        webhook_verified?: boolean;
        whatsapp_configured?: boolean;
        access_token_valid?: boolean;
        meta_subscription_active?: boolean;
        issues?: string[];
    } | null;
}

export const MetaVerificationCard = ({
    isDarkMode,
    user,
    onCheckStatus,
    isChecking,
    onSubscribeWebhooks,
    isSubscribing = false,
    statusData
}: MetaVerificationCardProps) => {
    const [copiedWebhook, setCopiedWebhook] = useState(false);

    const isVerified = user?.webhook_verified;
    const overallStatus = statusData?.overall_status || (isVerified ? 'partial' : 'not_configured');

    const getStatusColor = () => {
        if (overallStatus === 'ready') return { bg: 'emerald', label: 'Ready' };
        if (overallStatus === 'partial') return { bg: 'amber', label: 'Partial' };
        return { bg: 'red', label: 'Not Configured' };
    };

    const statusColor = getStatusColor();

    return (
        <div className={cn(
            "p-8 rounded-xl border backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500",
            isDarkMode
                ? overallStatus === 'ready'
                    ? "bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/20"
                    : overallStatus === 'partial'
                        ? "bg-gradient-to-br from-amber-500/5 to-yellow-500/5 border-amber-500/20"
                        : "bg-gradient-to-br from-red-500/5 to-rose-500/5 border-red-500/20"
                : overallStatus === 'ready'
                    ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200"
                    : overallStatus === 'partial'
                        ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200"
                        : "bg-gradient-to-br from-red-50 to-rose-50 border-red-200"
        )}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                        <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                            isDarkMode
                                ? overallStatus === 'ready' ? "bg-emerald-500/20" : overallStatus === 'partial' ? "bg-amber-500/20" : "bg-red-500/20"
                                : overallStatus === 'ready' ? "bg-emerald-100" : overallStatus === 'partial' ? "bg-amber-100" : "bg-red-100"
                        )}>
                            <Key className={overallStatus === 'ready' ? "text-emerald-500" : overallStatus === 'partial' ? "text-amber-500" : "text-red-500"} size={24} />
                        </div>
                        <div>
                            <h2 className={cn("text-xl font-bold mb-1", isDarkMode ? "text-white" : "text-slate-900")}>
                                {overallStatus === 'ready' ? 'Webhook Ready' : overallStatus === 'partial' ? 'Partial Configuration' : 'Webhook Verification Required'}
                            </h2>
                            <p className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                {overallStatus === 'ready'
                                    ? "Your webhook is verified and all systems are ready."
                                    : overallStatus === 'partial'
                                        ? "Some configurations are complete but verification pending."
                                        : "Configure these details in your Meta App Dashboard to proceed."}
                            </p>
                        </div>
                    </div>

                    {/* Check Status Button */}
                    <button
                        onClick={onCheckStatus}
                        disabled={isChecking}
                        className={cn(
                            "flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border shadow-sm",
                            isDarkMode
                                ? overallStatus === 'ready'
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                                    : overallStatus === 'partial'
                                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
                                        : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                                : overallStatus === 'ready'
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
                                    : overallStatus === 'partial'
                                        ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100"
                                        : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100",
                            isChecking && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isChecking ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <RefreshCw size={16} />
                        )}
                        <span>{isChecking ? 'Checking...' : 'Check Status'}</span>
                    </button>
                </div>

                {/* Status Checklist */}
                {statusData && (
                    <div className={cn(
                        "p-4 rounded-xl border space-y-3",
                        isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
                    )}>
                        <h3 className={cn("text-sm font-semibold mb-3", isDarkMode ? "text-white" : "text-slate-900")}>
                            Configuration Status
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <StatusItem isDarkMode={isDarkMode} label="Verify Token Set" status={statusData.verify_token_set} />
                            <StatusItem isDarkMode={isDarkMode} label="Webhook Verified" status={statusData.webhook_verified} />
                            <StatusItem isDarkMode={isDarkMode} label="WhatsApp Configured" status={statusData.whatsapp_configured} />
                            <StatusItem isDarkMode={isDarkMode} label="Access Token Valid" status={statusData.access_token_valid} />
                            <StatusItem isDarkMode={isDarkMode} label="Meta Subscription Active" status={statusData.meta_subscription_active} />
                        </div>

                        {/* Subscribe to Webhooks Button - Show when webhook verified but not subscribed */}
                        {statusData.webhook_verified && !statusData.meta_subscription_active && onSubscribeWebhooks && (
                            <div className={cn(
                                "mt-4 p-4 rounded-lg border-2 border-dashed",
                                isDarkMode ? "bg-amber-500/10 border-amber-500/30" : "bg-amber-50 border-amber-300"
                            )}>
                                <div className="flex items-start gap-3">
                                    <Webhook className={isDarkMode ? "text-amber-400" : "text-amber-600"} size={20} />
                                    <div className="flex-1">
                                        <p className={cn("text-sm font-semibold mb-1", isDarkMode ? "text-amber-300" : "text-amber-700")}>
                                            Webhook Subscription Required
                                        </p>
                                        <p className={cn("text-xs mb-3", isDarkMode ? "text-amber-400/70" : "text-amber-600")}>
                                            Your webhook is verified, but the app is not subscribed to receive messages. Click below to subscribe.
                                        </p>
                                        <button
                                            onClick={onSubscribeWebhooks}
                                            disabled={isSubscribing}
                                            className={cn(
                                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                                                isDarkMode
                                                    ? "bg-amber-500 text-black hover:bg-amber-400"
                                                    : "bg-amber-500 text-white hover:bg-amber-600",
                                                isSubscribing && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            {isSubscribing ? (
                                                <>
                                                    <Loader2 size={16} className="animate-spin" />
                                                    Subscribing...
                                                </>
                                            ) : (
                                                <>
                                                    <Webhook size={16} />
                                                    Subscribe to Webhook Fields
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Issues */}
                        {statusData.issues && statusData.issues.length > 0 && (
                            <div className={cn(
                                "mt-4 p-3 rounded-lg",
                                isDarkMode ? "bg-red-500/10" : "bg-red-50"
                            )}>
                                <h4 className={cn("text-xs font-semibold mb-2 flex items-center gap-1", isDarkMode ? "text-red-400" : "text-red-600")}>
                                    <AlertCircle size={14} />
                                    Issues Found
                                </h4>
                                <ul className="space-y-1">
                                    {statusData.issues.map((issue, idx) => (
                                        <li key={idx} className={cn("text-xs", isDarkMode ? "text-red-300" : "text-red-600")}>
                                            • {issue}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {overallStatus === 'ready' ? (
                    <div className={cn(
                        "flex items-center p-4 rounded-lg",
                        isDarkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"
                    )}>
                        <CheckCircle2 size={20} className="mr-2" />
                        <span className="font-semibold">All Systems Ready - Webhook Verified Successfully</span>
                    </div>
                ) : (
                    /* Configuration Details */
                    <div className="space-y-4">
                        <div className={cn(
                            "p-6 rounded-xl border grid gap-6",
                            isDarkMode
                                ? "bg-white/5 border-white/10"
                                : "bg-white border-slate-200"
                        )}>
                            {/* Verification Details */}
                            <div>
                                <h3 className={cn("text-sm font-semibold mb-2 flex items-center", isDarkMode ? "text-white" : "text-slate-900")}>
                                    <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2", isDarkMode ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-600")}>1</span>
                                    Callback URL & Verify Token
                                </h3>
                                <div className={cn(
                                    "flex items-center justify-between p-3 rounded-lg border border-dashed",
                                    isDarkMode ? "bg-red-500/5 border-red-500/20" : "bg-red-50 border-red-200"
                                )}>
                                    <div className="flex items-center space-x-3">
                                        <div className={cn("p-2 rounded-full", isDarkMode ? "bg-red-500/10" : "bg-red-100")}>
                                            <Mail size={16} className="text-red-500" />
                                        </div>
                                        <div>
                                            <p className={cn("text-sm font-medium", isDarkMode ? "text-white" : "text-slate-900")}>
                                                Sent to your email
                                            </p>
                                            <p className={cn("text-xs", isDarkMode ? "text-white/50" : "text-slate-500")}>
                                                {user?.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={cn("text-xs px-2 py-1 rounded", isDarkMode ? "bg-white/10" : "bg-white/50")}>
                                        Check Inbox
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Link */}
                        <div className="flex justify-end items-center px-2">
                            <a
                                href="https://developers.facebook.com/apps"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    "inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:underline",
                                    isDarkMode ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-700"
                                )}
                            >
                                <span>Go to Meta Console</span>
                                <ExternalLink size={14} />
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper component for status items
const StatusItem = ({ isDarkMode, label, status }: { isDarkMode: boolean; label: string; status?: boolean | null }) => {
    const isUnknown = status === null || status === undefined;

    return (
        <div className={cn(
            "flex items-center gap-2 p-2 rounded-lg",
            isDarkMode ? "bg-white/5" : "bg-slate-50"
        )}>
            {isUnknown ? (
                <div className={cn("w-4 h-4 rounded-full", isDarkMode ? "bg-slate-500/30" : "bg-slate-300")} />
            ) : status ? (
                <CheckCircle2 size={16} className="text-emerald-500" />
            ) : (
                <XCircle size={16} className="text-red-500" />
            )}
            <span className={cn("text-xs font-medium", isDarkMode ? "text-white/70" : "text-slate-600")}>
                {label}
            </span>
        </div>
    );
};
