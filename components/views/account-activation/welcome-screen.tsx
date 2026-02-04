
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface WelcomeScreenProps {
    userName?: string;
    organizationName?: string;
}

export default function WelcomeScreen({
    userName = "User",
    organizationName = "Invictus Global Tech",
}: WelcomeScreenProps) {
    const { isDarkMode } = useTheme();
    const router = useRouter();

    const handleGoToDashboard = () => {
        router.push("/dashboard");
    };

    return (
        <>
            {/* Success Icon with Glow */}
            <div className="flex justify-center mb-6 mt-18">
                <div className="relative">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-2xl animate-pulse" />

                    {/* Icon container */}
                    <div
                        className={cn(
                            "relative p-4 rounded-full",
                            isDarkMode
                                ? "bg-emerald-500/20 border-2 border-emerald-500/30"
                                : "bg-emerald-100 border-2 border-emerald-300"
                        )}
                    >
                        <CheckCircle2
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
                    "text-2xl font-bold text-center mb-3",
                    isDarkMode ? "text-white" : "text-slate-900"
                )}
            >
                Account Activated!
            </h1>

            {/* Subtitle */}
            <p
                className={cn(
                    "text-center text-sm mb-8",
                    isDarkMode ? "text-slate-400" : "text-slate-600"
                )}
            >
                Welcome to the future of conversations! Your account is fully set up and ready to revolutionize your workflow.
            </p>

            {/* Verification Token Notice */}
            <div className={cn(
                "mb-8 p-4 rounded-xl border text-center relative overflow-hidden",
                isDarkMode
                    ? "bg-blue-500/10 border-blue-500/30 text-blue-200"
                    : "bg-blue-50 border-blue-200 text-blue-700"
            )}>
                <div className={cn(
                    "absolute inset-0 opacity-10",
                    isDarkMode ? "bg-blue-500" : "bg-blue-400"
                )} />
                <p className="relative z-10 text-sm font-medium">
                    We have sent a verification token to your email for the WhatsApp Business API connection.
                </p>
            </div>

            {/* CTA Button */}
            <button
                onClick={handleGoToDashboard}
                className={cn(
                    "group relative w-full px-6 py-3.5 rounded-xl font-bold text-sm text-white",
                    "transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]",
                    "shadow-lg hover:shadow-2xl overflow-hidden cursor-pointer",
                    "bg-emerald-500 hover:bg-emerald-400"
                )}
            >
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                {/* Glow effect */}
                <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                    "bg-emerald-400/30 blur-xl"
                )} />

                <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-sm">
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 transition-transform duration-300" />
                </span>
            </button>
        </>
    );
}
