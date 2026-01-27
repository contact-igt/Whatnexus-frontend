"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
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
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        setShowConfetti(true);
        const timer = setTimeout(() => setShowConfetti(false), 2500);
        return () => clearTimeout(timer);
    }, []);

    const handleGoToDashboard = () => {
        router.push("/login");
    };

    return (
        <div className="w-full max-w-md mx-auto animate-in fade-in zoom-in-95 duration-500">
            {/* Confetti Effect */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50">
                    {[...Array(40)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute animate-confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `-5%`,
                                animationDelay: `${Math.random() * 0.3}s`,
                                animationDuration: `${1.5 + Math.random() * 1.5}s`,
                            }}
                        >
                            <div
                                className={cn(
                                    "w-2 h-2 rounded-full",
                                    i % 5 === 0
                                        ? "bg-emerald-500"
                                        : i % 5 === 1
                                            ? "bg-blue-500"
                                            : i % 5 === 2
                                                ? "bg-purple-500"
                                                : i % 5 === 3
                                                    ? "bg-yellow-500"
                                                    : "bg-pink-500"
                                )}
                            />
                        </div>
                    ))}
                </div>
            )}

            <div
                className={cn(
                    "p-6 rounded-2xl backdrop-blur-xl border transition-all duration-300",
                    "shadow-xl relative overflow-hidden",
                    isDarkMode
                        ? "bg-slate-900/90 border-slate-700/50"
                        : "bg-white/90 border-slate-200/50"
                )}
            >
                {/* Decorative gradients */}
                <div
                    className={cn(
                        "absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-15 -translate-y-1/2 translate-x-1/2",
                        isDarkMode ? "bg-emerald-500" : "bg-emerald-400"
                    )}
                />
                <div
                    className={cn(
                        "absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl opacity-15 translate-y-1/2 -translate-x-1/2",
                        isDarkMode ? "bg-blue-500" : "bg-blue-400"
                    )}
                />

                <div className="relative z-10 text-center">
                    {/* Success Icon with Animation */}
                    <div className="flex justify-center mb-4">
                        <div className="relative">
                            {/* Pulsing rings */}
                            <div
                                className={cn(
                                    "absolute inset-0 rounded-full animate-ping opacity-20",
                                    isDarkMode ? "bg-emerald-500" : "bg-emerald-400"
                                )}
                                style={{ animationDuration: "1.5s" }}
                            />

                            {/* Main icon */}
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
                                        "w-10 h-10",
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
                            "text-2xl font-bold mb-2",
                            isDarkMode ? "text-emerald-400" : "text-emerald-600"
                        )}
                    >
                        Welcome to WhatsNexus!
                    </h1>

                    {/* Subtitle */}
                    <p
                        className={cn(
                            "text-sm mb-5",
                            isDarkMode ? "text-slate-400" : "text-slate-600"
                        )}
                    >
                        Your account has been successfully activated
                    </p>

                    {/* Success Details Card */}
                    <div
                        className={cn(
                            "p-4 rounded-xl mb-5",
                            isDarkMode ? "bg-slate-800/50" : "bg-slate-50"
                        )}
                    >
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Sparkles
                                className={cn(
                                    "w-5 h-5",
                                    isDarkMode ? "text-emerald-400" : "text-emerald-600"
                                )}
                            />
                            <p
                                className={cn(
                                    "text-sm font-semibold",
                                    isDarkMode ? "text-slate-300" : "text-slate-700"
                                )}
                            >
                                You're all set!
                            </p>
                        </div>
                        <p
                            className={cn(
                                "text-sm",
                                isDarkMode ? "text-slate-400" : "text-slate-600"
                            )}
                        >
                            You can now access all features of WhatsNexus for{" "}
                            <span className="font-semibold">{organizationName}</span>
                        </p>
                    </div>

                    {/* Features List */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                        {[
                            { icon: "💬", label: "AI Chat" },
                            { icon: "📊", label: "Analytics" },
                            { icon: "🤖", label: "Automation" },
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "p-3 rounded-xl transition-all duration-200 hover:scale-105",
                                    isDarkMode
                                        ? "bg-slate-800/50 hover:bg-slate-800/70"
                                        : "bg-white hover:bg-slate-50"
                                )}
                            >
                                <div className="text-2xl mb-1">{feature.icon}</div>
                                <p
                                    className={cn(
                                        "text-sm font-medium",
                                        isDarkMode ? "text-slate-300" : "text-slate-700"
                                    )}
                                >
                                    {feature.label}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* CTA Button */}
                    <button
                        onClick={handleGoToDashboard}
                        className={cn(
                            "group relative w-full px-6 py-3.5 rounded-xl font-semibold text-white",
                            "transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]",
                            "shadow-lg hover:shadow-2xl overflow-hidden",
                            "bg-gradient-to-r from-emerald-600 to-emerald-500",
                            "hover:from-emerald-500 hover:to-emerald-400",
                            "border border-emerald-400/20"
                        )}
                    >
                        {/* Animated gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                        {/* Glow effect */}
                        <div className={cn(
                            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                            "bg-gradient-to-r from-emerald-400/20 to-emerald-300/20 blur-xl"
                        )} />

                        <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-sm">
                            Get Started
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </span>
                    </button>
                </div>
            </div>

            {/* Add confetti animation */}
            <style jsx global>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
        </div>
    );
}
