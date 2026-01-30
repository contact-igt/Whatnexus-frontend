"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { Zap, Building2, Mail, UserRoundCheck } from "lucide-react";

interface ResumeSetupScreenProps {
    onActivate: () => void;
    invitationData: {
        company_name: string;
        email: string;
    };
}

export default function ResumeSetupScreen({
    onActivate,
    invitationData,
}: ResumeSetupScreenProps) {
    const { isDarkMode } = useTheme();
    const [isActivating, setIsActivating] = useState(false);

    const handleActivate = () => {
        setIsActivating(true);
        onActivate();
    };

    return (
        <>
            <h1
                className={cn(
                    "text-xl font-bold text-center mb-2",
                    isDarkMode ? "text-white" : "text-slate-900"
                )}
            >
                Resume Your Setup
            </h1>
            <p
                className={cn(
                    "text-center text-xs mb-6",
                    isDarkMode ? "text-slate-400" : "text-slate-600"
                )}
            >
                Your account activation is initiated. Finish the final steps.
            </p>

            <div className="space-y-2 mb-5">
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
                            {invitationData?.company_name}
                        </p>
                        <div className={cn("flex-1 min-w-0 border-b-[0.1px] mt-4", isDarkMode ? "border-slate-800" : "border-slate-200")}></div>
                    </div>
                </div>

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
                        <div className={cn(`flex-1 min-w-0 border-b-[0.1px] mt-4 ${isDarkMode ? "border-slate-800" : "border-slate-200"}`)}></div>
                    </div>
                </div>

                {/* <div>
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
                            <div className={cn(`flex-1 min-w-0 border-b-[0.1px] mt-4 ${isDarkMode ? "border-slate-800" : "border-slate-200"}`)}></div>
                        </div>
                    </div>
                </div> */}
            </div>

            <button
                onClick={handleActivate}
                disabled={isActivating}
                className={cn(
                    "group relative w-full py-3 pt-3.5 px-6 rounded-xl font-bold text-sm transition-all duration-300",
                    "transform hover:scale-[1.02] active:scale-[0.98]",
                    "shadow-lg hover:shadow-2xl overflow-hidden cursor-pointer",
                    "bg-emerald-500 hover:bg-emerald-400",
                    "text-white",
                    (isActivating) && "opacity-70 cursor-not-allowed"
                )}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                    "bg-emerald-400/30 blur-xl"
                )} />

                <div className="relative z-10 flex items-center justify-center gap-2">
                    {isActivating ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span className="drop-shadow-sm">Setting up...</span>
                        </>
                    ) : (
                        <>
                            <Zap className="w-4 h-4 fill-current drop-shadow-sm" />
                            <span className="drop-shadow-sm">Continue to Setup</span>
                        </>
                    )}
                </div>
            </button>
        </>
    );
}
