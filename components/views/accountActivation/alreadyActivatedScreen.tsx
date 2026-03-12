"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { Info, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface AlreadyActivatedScreenProps {
    email?: string;
}

export default function AlreadyActivatedScreen({
    email = "user@example.com",
}: AlreadyActivatedScreenProps) {
    const { isDarkMode } = useTheme();
    const router = useRouter();

    const handleGoToLogin = () => {
        router.push("/login");
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
                        isDarkMode ? "bg-emerald-600" : "bg-emerald-400"
                    )}
                />

                <div className="relative z-10 text-center">
                    {/* Info Icon with Glow Effect */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            {/* Outer glow rings */}
                            {/* <div
                                className={cn(
                                    "absolute inset-0 rounded-full animate-pulse",
                                    isDarkMode
                                        ? "bg-emerald-800/20 blur-xl scale-150"
                                        : "bg-emerald-400/30 blur-xl scale-150"
                                )}
                            /> */}
                            <div
                                className={cn(
                                    "absolute inset-0 rounded-full",
                                    isDarkMode
                                        ? "bg-emerald-800/30 blur-lg scale-125"
                                        : "bg-emerald-400/40 blur-lg scale-125"
                                )}
                            />
                            {/* Icon container */}
                            <div
                                className={cn(
                                    "relative p-5 rounded-full border-2",
                                    isDarkMode
                                        ? "bg-emerald-500/10 border-emerald-500/30"
                                        : "bg-emerald-50 border-emerald-200/50"
                                )}
                            >
                                <Info
                                    className={cn(
                                        "w-12 h-12",
                                        isDarkMode ? "text-emerald-400" : "text-emerald-600"
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
                        Account Already Active
                    </h1>

                    {/* Message */}
                    <p
                        className={cn(
                            "text-sm leading-relaxed mb-8 max-w-sm mx-auto",
                            isDarkMode ? "text-slate-400" : "text-slate-600"
                        )}
                    >
                        Your account has already been activated. You can proceed to log in with your credentials. If you've forgotten your password, you can reset it on the login page.
                    </p>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={handleGoToLogin}
                            className={cn(
                                "group w-full relative px-6 py-3.5 rounded-xl font-semibold",
                                "transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]",
                                "shadow-lg hover:shadow-xl overflow-hidden",
                                "bg-emerald-500 hover:bg-emerald-600 text-white"
                            )}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                            <span className="relative z-10 font-bold cursor-pointer flex items-center justify-center gap-2">
                                <ArrowRight className="w-5 h-5" />
                                Login Now
                            </span>
                        </button>

                        <button
                            onClick={() => window.location.href = "mailto:support@whatsnexus.com"}
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
                                Need help? Contact Support
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
