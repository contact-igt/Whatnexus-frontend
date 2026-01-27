"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { XCircle, Home, Mail } from "lucide-react";
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

    return (
        <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-6 duration-500">
            <div
                className={cn(
                    "p-6 rounded-2xl backdrop-blur-xl border transition-all duration-300",
                    "shadow-xl relative overflow-hidden",
                    isDarkMode
                        ? "bg-slate-900/90 border-slate-700/50"
                        : "bg-white/90 border-slate-200/50"
                )}
            >
                {/* Decorative gradient */}
                <div
                    className={cn(
                        "absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-15 -translate-y-1/2 translate-x-1/2",
                        isDarkMode ? "bg-red-500" : "bg-red-400"
                    )}
                />

                <div className="relative z-10 text-center">
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                        <div
                            className={cn(
                                "p-4 rounded-full",
                                isDarkMode
                                    ? "bg-red-500/10 border-2 border-red-500/20"
                                    : "bg-red-50 border-2 border-red-200"
                            )}
                        >
                            <XCircle
                                className={cn(
                                    "w-10 h-10",
                                    isDarkMode ? "text-red-400" : "text-red-600"
                                )}
                                strokeWidth={2}
                            />
                        </div>
                    </div>

                    {/* Title */}
                    <h1
                        className={cn(
                            "text-2xl font-bold mb-2",
                            isDarkMode ? "text-white" : "text-slate-900"
                        )}
                    >
                        Invitation Declined
                    </h1>

                    {/* Message */}
                    <p
                        className={cn(
                            "text-sm mb-5",
                            isDarkMode ? "text-slate-400" : "text-slate-600"
                        )}
                    >
                        You have declined the invitation to join{" "}
                        <span className="font-semibold">{organizationName}</span>
                    </p>

                    {/* Info Card */}
                    <div
                        className={cn(
                            "p-4 rounded-xl mb-5 text-left",
                            isDarkMode ? "bg-slate-800/50" : "bg-slate-50"
                        )}
                    >
                        <h3
                            className={cn(
                                "text-sm font-semibold mb-3",
                                isDarkMode ? "text-slate-300" : "text-slate-700"
                            )}
                        >
                            What happens next?
                        </h3>
                        <ul className="space-y-2">
                            <li
                                className={cn(
                                    "text-sm flex items-start gap-2",
                                    isDarkMode ? "text-slate-400" : "text-slate-600"
                                )}
                            >
                                <span className="text-emerald-500 mt-0.5">•</span>
                                <span>The organization administrator has been notified</span>
                            </li>
                            <li
                                className={cn(
                                    "text-sm flex items-start gap-2",
                                    isDarkMode ? "text-slate-400" : "text-slate-600"
                                )}
                            >
                                <span className="text-emerald-500 mt-0.5">•</span>
                                <span>This invitation link is no longer valid</span>
                            </li>
                            <li
                                className={cn(
                                    "text-sm flex items-start gap-2",
                                    isDarkMode ? "text-slate-400" : "text-slate-600"
                                )}
                            >
                                <span className="text-emerald-500 mt-0.5">•</span>
                                <span>You can request a new invitation if you change your mind</span>
                            </li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={handleGoHome}
                            className={cn(
                                "group w-full relative px-6 py-3.5 rounded-xl font-semibold",
                                "transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]",
                                "shadow-lg hover:shadow-xl overflow-hidden",
                                isDarkMode
                                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                            )}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <Home className="w-5 h-5" />
                                Return to Home
                            </span>
                        </button>

                        <button
                            onClick={() => window.location.href = "mailto:support@whatsnexus.com"}
                            className={cn(
                                "group w-full relative px-6 py-3.5 rounded-xl font-semibold",
                                "transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]",
                                "border",
                                isDarkMode
                                    ? "bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-300"
                                    : "bg-white hover:bg-slate-50 border-slate-300 text-slate-700"
                            )}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <Mail className="w-5 h-5" />
                                Contact Support
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
