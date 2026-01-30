"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { UserX, Home, Mail, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface RejectionScreenProps {
    organizationName?: string;
}

export default function RejectionScreen({
    organizationName = "Invictus Global Tech",
}: RejectionScreenProps) {
    const { isDarkMode } = useTheme();
    const router = useRouter();

    const handleGoHome = () => {
        router.push("/");
    };

    const handleContactSupport = () => {
        window.location.href = "mailto:support@whatsnexus.com";
    };

    return (
            <div className="w-full font-sans max-w-md mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div
                    className={cn(
                        "p-7 rounded-3xl backdrop-blur-xl mt-5 border transition-all w-100 mx-auto duration-300",
                        "shadow-2xl relative overflow-hidden",
                        isDarkMode
                            ? "bg-slate-900/95 border-slate-700/50"
                            : "bg-white/95 border-slate-200/50"
                    )}
                >
                    {/* Decorative gradient */}
                    <div
                        className={cn(
                            "absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2",
                            isDarkMode ? "bg-red-500" : "bg-red-400"
                        )}
                    />

                    <div className="relative z-10 text-center">
                        {/* Icon with Glow */}
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                {/* Glow effect */}
                                <div className="absolute inset-0 bg-red-500/30 rounded-full blur-2xl" />

                                {/* Icon container */}
                                <div
                                    className={cn(
                                        "relative p-4 rounded-full",
                                        isDarkMode
                                            ? "bg-red-500/20 border-2 border-red-500/30"
                                            : "bg-red-100 border-2 border-red-300"
                                    )}
                                >
                                    <UserX
                                        className={cn(
                                            "w-10 h-10",
                                            isDarkMode ? "text-red-400" : "text-red-600"
                                        )}
                                        strokeWidth={2}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Title */}
                        <h1
                            className={cn(
                                "text-2xl font-bold mb-3",
                                isDarkMode ? "text-white" : "text-slate-900"
                            )}
                        >
                            Invitation Declined
                        </h1>

                        {/* Subtitle */}
                        <p
                            className={cn(
                                "text-sm mb-6",
                                isDarkMode ? "text-slate-400" : "text-slate-600"
                            )}
                        >
                            You have declined the invitation. You are no longer associated with the organization or have access to its resources.
                        </p>

                        {/* Info Card */}
                        <div
                            className={cn(
                                "p-4 rounded-xl mb-6 text-left",
                                isDarkMode ? "bg-slate-800/50 border border-slate-700/50" : "bg-slate-50 border border-slate-200"
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <HelpCircle
                                    className={cn(
                                        "w-5 h-5 mt-0.5 flex-shrink-0",
                                        isDarkMode ? "text-slate-400" : "text-slate-500"
                                    )}
                                />
                                <div>
                                    <h3
                                        className={cn(
                                            "text-sm font-semibold mb-2",
                                            isDarkMode ? "text-slate-300" : "text-slate-700"
                                        )}
                                    >
                                        What happens next?
                                    </h3>
                                    <p
                                        className={cn(
                                            "text-xs leading-relaxed",
                                            isDarkMode ? "text-slate-400" : "text-slate-600"
                                        )}
                                    >
                                        The organization administrator has been notified of your decision. If this was an accident, we can send a new invitation from the admin.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleGoHome}
                                className={cn(
                                    "flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300",
                                    "flex items-center justify-center gap-2",
                                    "transform hover:scale-[1.02] active:scale-[0.98]",
                                    "border cursor-pointer",
                                    isDarkMode
                                        ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                                        : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                                )}
                            >
                                <Home className="w-4 h-4" />
                                <span className="text-xs font-bold">Go to Home</span>
                            </button>

                            <button
                                onClick={handleContactSupport}
                                className={cn(
                                    "flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300",
                                    "flex items-center justify-center gap-2",
                                    "transform hover:scale-[1.02] active:scale-[0.98]",
                                    " cursor-pointer",
                                    isDarkMode
                                        ? "bg-emerald-700 border-emerald-700 text-slate-100 hover:bg-emerald-700"
                                        : "bg-white border-emerald-300 text-slate-700 hover:bg-emerald-50"
                                )}
                            >
                                <Mail className="w-4 h-4" />
                                <span className="text-xs font-bold">Contact Support</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
    );
}
