"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { RotateCcw, Info } from "lucide-react";
import { useRouter } from "next/navigation";

interface ExpiredScreenProps {
    email?: string;
}

export default function ExpiredScreen({
    email = "user@example.com",
}: ExpiredScreenProps) {
    const { isDarkMode } = useTheme();
    const router = useRouter();

    const handleRequestNewLink = () => {
        // Navigate to request new link page or trigger API call
        router.push("/request-invitation");
    };

    const handleContactSupport = () => {
        window.location.href = "mailto:support@whatsnexus.com";
    };

    return (
        <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-6 font-sans duration-500">
            <div
                className={cn(
                    "p-8 rounded-2xl backdrop-blur-xl border transition-all duration-300",
                    "shadow-2xl relative overflow-hidden",
                    isDarkMode
                        ? "bg-slate-900/95 border-slate-700/50"
                        : "bg-white/95 border-slate-200/50"
                )}
            >
                <div
                    className={cn(
                        "absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2",
                        isDarkMode ? "bg-red-600" : "bg-red-400"
                    )}
                />

                <div className="relative z-10 text-center">
                    {/* Expired Icon with Glow Effect */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            {/* Outer glow ring */}
                            {/* <div
                                className={cn(
                                    "absolute inset-0 rounded-full",
                                    isDarkMode
                                        ? "bg-red-800/30 blur-lg scale-125"
                                        : "bg-red-400/40 blur-lg scale-125"
                                )}
                            /> */}
                            {/* Icon container */}
                            <div
                                className={cn(
                                    "relative p-5 rounded-full border-2",
                                    isDarkMode
                                        ? "bg-red-500/10 border-red-500/30"
                                        : "bg-red-50 border-red-200/50"
                                )}
                            >
                                <RotateCcw
                                    className={cn(
                                        "w-10 h-10",
                                        isDarkMode ? "text-red-400" : "text-red-600"
                                    )}
                                    strokeWidth={2.5}
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
                        Link Expired
                    </h1>

                    {/* Message */}
                    <p
                        className={cn(
                            "text-sm leading-relaxed mb-6 max-w-sm mx-auto",
                            isDarkMode ? "text-slate-400" : "text-slate-600"
                        )}
                    >
                        The invitation link has expired for security reasons. Invitation links are temporary and must be used within the designated timeframe.
                    </p>

                    {/* Info Box */}
                    <div
                        className={cn(
                            "p-4 rounded-xl mb-6 text-left border",
                            isDarkMode
                                ? "bg-slate-800/50 border-slate-700/50"
                                : "bg-slate-50 border-slate-200/50"
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <Info
                                className={cn(
                                    "w-5 h-5 flex-shrink-0 mt-0.5",
                                    isDarkMode ? "text-slate-400" : "text-slate-600"
                                )}
                            />
                            <div>
                                <h3
                                    className={cn(
                                        "text-sm font-semibold mb-1",
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
                                    You need to request a new invitation link from your administrator or the system to proceed with your account activation.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={handleRequestNewLink}
                            className={cn(
                                "group w-full relative px-6 py-3.5 rounded-xl font-semibold",
                                "transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]",
                                "shadow-lg hover:shadow-xl overflow-hidden",
                                "bg-emerald-500 hover:bg-emerald-600 text-white"
                            )}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                            <span className="relative z-10 font-bold cursor-pointer flex items-center justify-center gap-2">
                                Request New Link
                            </span>
                        </button>

                        <button
                            onClick={handleContactSupport}
                            className={cn(
                                "group w-full cursor-pointer relative px-6 py-3.5 rounded-xl font-semibold",
                                "transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]",
                                "border",
                                isDarkMode
                                    ? "bg-transparent hover:bg-slate-800/50 border-slate-700 text-slate-300"
                                    : "bg-transparent hover:bg-slate-50 border-slate-300 text-slate-700"
                            )}
                        >
                            <span className="relative z-10 font-bold cursor-pointer flex items-center justify-center gap-2">
                                Contact Support
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
