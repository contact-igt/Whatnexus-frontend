"use client";

import { useState } from 'react';
import { Key, RefreshCw, Loader2, CheckCircle2, Copy, Check, ExternalLink, Mail } from 'lucide-react';
import { cn } from "@/lib/utils";
import { getWebhookBaseURL } from '@/helper/axios';

interface MetaVerificationCardProps {
    isDarkMode: boolean;
    user: any;
    onCheckStatus: () => void;
    isChecking: boolean;
}

export const MetaVerificationCard = ({
    isDarkMode,
    user,
    onCheckStatus,
    isChecking
}: MetaVerificationCardProps) => {
    const [copiedWebhook, setCopiedWebhook] = useState(false);

    const isVerified = user?.webhook_verified;

    return (
        <div className={cn(
            "p-8 rounded-xl border backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500",
            isDarkMode
                ? isVerified
                    ? "bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/20"
                    : "bg-gradient-to-br from-red-500/5 to-rose-500/5 border-red-500/20"
                : isVerified
                    ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200"
                    : "bg-gradient-to-br from-red-50 to-rose-50 border-red-200"
        )}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                        <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                            isDarkMode 
                                ? isVerified ? "bg-emerald-500/20" : "bg-red-500/20"
                                : isVerified ? "bg-emerald-100" : "bg-red-100"
                        )}>
                            <Key className={isVerified ? "text-emerald-500" : "text-red-500"} size={24} />
                        </div>
                        <div>
                            <h2 className={cn("text-xl font-bold mb-1", isDarkMode ? "text-white" : "text-slate-900")}>
                                Webhook Verification Required
                            </h2>
                            <p className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                {isVerified
                                    ? "Your webhook is verified and ready."
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
                                ? isVerified
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                                    : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                                : isVerified
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
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

                {isVerified ? (
                    <div className={cn(
                        "flex items-center p-4 rounded-lg",
                        isDarkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"
                    )}>
                        <CheckCircle2 size={20} className="mr-2" />
                        <span className="font-semibold">Webhook Verified Successfully</span>
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
