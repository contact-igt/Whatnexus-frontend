"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { Zap, Building2, Mail, UserCheck, User, UserRound, ShieldUser, UserRoundCheck } from "lucide-react";

interface ActivationScreenProps {
    onActivate: () => void;
    onReject: () => void;
    invitationData?: {
        organizationName: string;
        invitedBy: string;
        email: string;
        role: string;
    };
}

export default function ActivationScreen({
    onActivate,
    onReject,
    invitationData = {
        organizationName: "Invictus Global Tech",
        invitedBy: "System Administrator",
        email: "user@example.com",
        role: "System Administrator",
    },
}: ActivationScreenProps) {
    const { isDarkMode } = useTheme();
    const [isActivating, setIsActivating] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);

    const handleActivate = () => {
        setIsActivating(true);
        setTimeout(() => {
            onActivate();
        }, 600);
    };

    const handleReject = () => {
        setIsRejecting(true);
        setTimeout(() => {
            onReject();
        }, 600);
    };

    return (
        <div className="w-full flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="flex flex-col items-center space-y-1 animate-in fade-in slide-in-from-top-4 duration-700">

                    <div className="flex items-center gap-2">
                        <span
                            className={cn(
                                "text-xl font-bold tracking-tight",
                                isDarkMode ? "text-white" : "text-slate-900"
                            )}
                        >
                            WhatsNexus
                        </span>
                        <div
                            className={cn(
                                "px-1.5 py-0.5 mb-2 rounded-full border text-[9px] font-bold tracking-wide uppercase",
                                isDarkMode
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                    : "bg-emerald-50 border-emerald-200 text-emerald-600"
                            )}
                        >
                            Beta
                        </div>
                    </div>
                    <span
                        className={cn(
                            "text-[8px] font-bold tracking-[0.2em] mt-0.5 uppercase opacity-60",
                            isDarkMode ? "text-slate-400" : "text-slate-500"
                        )}
                    >
                        Powered by Invictus Global Tech
                    </span>
                </div>

                {/* Main Card */}
                <div
                    className={cn(
                        "p-8 rounded-3xl backdrop-blur-xl mt-5 border transition-all w-100 mx-auto duration-300",
                        "shadow-2xl relative overflow-hidden",
                        isDarkMode
                            ? "bg-slate-900/95 border-slate-700/50"
                            : "bg-white/95 border-slate-200/50"
                    )}
                >
                    <div
                        className={cn(
                            "absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2",
                            isDarkMode ? "bg-emerald-500" : "bg-emerald-400"
                        )}
                    />

                    <div className="relative z-10">
                        <h1
                            className={cn(
                                "text-xl font-bold text-center mb-2",
                                isDarkMode ? "text-white" : "text-slate-900"
                            )}
                        >
                            Activate Your Account
                        </h1>
                        <p
                            className={cn(
                                "text-center text-[11px] mb-4",
                                isDarkMode ? "text-slate-400" : "text-slate-600"
                            )}
                        >
                            Review your invitation details below to get started
                        </p>

                        {/* Invitation Details */}
                        <div className="space-y-3 mb-6 mt-9">
                            {/* Organization */}
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                    <div
                                        className={cn(
                                            "w-9 h-9 rounded-full flex items-center justify-center border-2",
                                            isDarkMode
                                                ? "bg-emerald-500/10 border-emerald-500/30"
                                                : "bg-emerald-50 border-emerald-200"
                                        )}
                                    >
                                        <Building2
                                            className={cn(
                                                "w-4.5 h-4.5",
                                                isDarkMode ? "text-emerald-400" : "text-emerald-600"
                                            )}
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p
                                        className={cn(
                                            "text-[10px] font-medium uppercase tracking-wider mb-1",
                                            isDarkMode ? "text-slate-500" : "text-slate-500"
                                        )}
                                    >
                                        Organization
                                    </p>
                                    <p
                                        className={cn(
                                            "text-sm font-semibold truncate",
                                            isDarkMode ? "text-white" : "text-slate-900"
                                        )}
                                    >
                                        {invitationData.organizationName}
                                    </p>
                                    <div className="flex-1 min-w-0 border-b-[0.1px] mt-4 border-slate-800"></div>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                    <div
                                        className={cn(
                                            "w-9 h-9 rounded-full flex items-center justify-center border-2",
                                            isDarkMode
                                                ? "bg-emerald-500/10 border-emerald-500/30"
                                                : "bg-emerald-50 border-emerald-200"
                                        )}
                                    >
                                        <Mail
                                            className={cn(
                                                "w-4.5 h-4.5",
                                                isDarkMode ? "text-emerald-400" : "text-emerald-600"
                                            )}
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p
                                        className={cn(
                                            "text-[10px] font-medium uppercase tracking-wider mb-1",
                                            isDarkMode ? "text-slate-500" : "text-slate-500"
                                        )}
                                    >
                                        Email Address
                                    </p>
                                    <p
                                        className={cn(
                                            "text-sm font-semibold truncate",
                                            isDarkMode ? "text-white" : "text-slate-900"
                                        )}
                                    >
                                        {invitationData.email}
                                    </p>
                                    <div className="flex-1 min-w-0 border-b-[0.1px] mt-4 border-slate-800"></div>
                                </div>
                            </div>

                            {/* Invited By */}
                            <div>
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        <div
                                            className={cn(
                                                "w-9 h-9 rounded-full flex items-center justify-center border-2",
                                                isDarkMode
                                                    ? "bg-emerald-500/10 border-emerald-500/30"
                                                    : "bg-emerald-50 border-emerald-200"
                                            )}
                                        >
                                            <UserRoundCheck
                                                className={cn(
                                                    "w-4.5 h-4.5",
                                                    isDarkMode ? "text-emerald-400" : "text-emerald-600"
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className={cn(
                                                "text-[10px] font-medium uppercase tracking-wider mb-1",
                                                isDarkMode ? "text-slate-500" : "text-slate-500"
                                            )}
                                        >
                                            Invited By
                                        </p>
                                        <p
                                            className={cn(
                                                "text-sm font-semibold",
                                                isDarkMode ? "text-white" : "text-slate-900"
                                            )}
                                        >
                                            {invitationData.invitedBy}
                                        </p>
                                        <p
                                            className={cn(
                                                "text-[10px] mt-0.5",
                                                isDarkMode ? "text-slate-500" : "text-slate-500"
                                            )}
                                        >
                                            Invited on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </p>
                                        <div className="flex-1 min-w-0 border-b-[0.1px] my-3 border-slate-800"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Activate Button */}
                        <button
                            onClick={handleActivate}
                            disabled={isActivating || isRejecting}
                            className={cn(
                                "group relative w-full py-3 pt-3.5 px-6 rounded-xl font-bold text-sm transition-all duration-300",
                                "transform hover:scale-[1.02] active:scale-[0.98]",
                                "shadow-lg hover:shadow-2xl overflow-hidden cursor-pointer",
                                "bg-emerald-500 hover:bg-emerald-400",
                                "text-white",
                                (isActivating || isRejecting) && "opacity-70 cursor-not-allowed"
                            )}
                        >
                            {/* Animated gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                            {/* Glow effect */}
                            <div className={cn(
                                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                                "bg-emerald-400/30 blur-xl"
                            )} />

                            <div className="relative z-10 flex items-center justify-center gap-2">
                                {isActivating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span className="drop-shadow-sm">Activating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4 fill-current drop-shadow-sm" />
                                        <span className="drop-shadow-sm">Activate Account</span>
                                    </>
                                )}
                            </div>
                        </button>

                        {/* Decline Link */}
                        <div className="mt-3 text-center">
                            <button
                                onClick={handleReject}
                                disabled={isActivating || isRejecting}
                                className={cn(
                                    "text-[11px] font-medium transition-colors duration-200 hover:underline",
                                    isDarkMode ? "text-slate-500 cursor-pointer hover:text-red-400" : "text-slate-500 hover:text-red-700",
                                    (isActivating || isRejecting) && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                {isRejecting ? "Declining..." : "Decline invitation and return"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-[10px] text-slate-500">
                        By activating your account, you agree to our{" "}
                        <a href="#" className="underline">
                            Terms of Service
                        </a>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}
