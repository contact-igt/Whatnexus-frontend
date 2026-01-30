"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { Loader2 } from "lucide-react";

export default function ActivationLoader() {
    const { isDarkMode } = useTheme();

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
                {/* Decorative gradient */}
                <div
                    className={cn(
                        "absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2",
                        isDarkMode ? "bg-emerald-600" : "bg-emerald-400"
                    )}
                />

                <div className="relative z-10 text-center py-12">
                    {/* Animated Loader Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            {/* Outer rotating ring */}
                            <div
                                className={cn(
                                    "absolute inset-0 rounded-full animate-spin",
                                    isDarkMode
                                        ? "bg-gradient-to-tr from-emerald-500/30 to-transparent blur-md scale-150"
                                        : "bg-gradient-to-tr from-emerald-400/40 to-transparent blur-md scale-150"
                                )}
                                style={{ animationDuration: "2s" }}
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
                                <Loader2
                                    className={cn(
                                        "w-10 h-10 animate-spin",
                                        isDarkMode ? "text-emerald-400" : "text-emerald-600"
                                    )}
                                    strokeWidth={2.5}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Loading Text */}
                    <h2
                        className={cn(
                            "text-xl font-bold mb-2",
                            isDarkMode ? "text-white" : "text-slate-900"
                        )}
                    >
                        Loading...
                    </h2>

                    {/* Subtext */}
                    <p
                        className={cn(
                            "text-sm",
                            isDarkMode ? "text-slate-400" : "text-slate-600"
                        )}
                    >
                        Please wait while we verify your invitation
                    </p>

                    {/* Animated dots */}
                    <div className="flex justify-center gap-1.5 mt-6">
                        <div
                            className={cn(
                                "w-2 h-2 rounded-full animate-pulse",
                                isDarkMode ? "bg-emerald-400" : "bg-emerald-600"
                            )}
                            style={{ animationDelay: "0ms", animationDuration: "1.4s" }}
                        />
                        <div
                            className={cn(
                                "w-2 h-2 rounded-full animate-pulse",
                                isDarkMode ? "bg-emerald-400" : "bg-emerald-600"
                            )}
                            style={{ animationDelay: "200ms", animationDuration: "1.4s" }}
                        />
                        <div
                            className={cn(
                                "w-2 h-2 rounded-full animate-pulse",
                                isDarkMode ? "bg-emerald-400" : "bg-emerald-600"
                            )}
                            style={{ animationDelay: "400ms", animationDuration: "1.4s" }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
