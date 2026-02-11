"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface EmailScreenProps {
    isDarkMode: boolean;
    onSubmit: (email: string) => void;
    isLoading: boolean;
    userType: 'management' | 'tenant';
}

export default function EmailScreen({ isDarkMode, onSubmit, isLoading, userType }: EmailScreenProps) {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setError("Email is required");
            return;
        }

        if (!validateEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }

        setError("");
        onSubmit(email);
    };

    const handleBackToLogin = () => {
        router.push(userType === 'management' ? '/management/login' : '/login');
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h2 className={cn(
                    "text-2xl font-bold tracking-tight",
                    isDarkMode ? "text-white" : "text-slate-900"
                )}>
                    Forgot Password
                </h2>
                <p className={cn(
                    "text-sm",
                    isDarkMode ? "text-slate-400" : "text-slate-600"
                )}>
                    Enter your email to receive an OTP
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label className={cn(
                        "text-xs font-semibold uppercase tracking-wide",
                        isDarkMode ? "text-slate-400" : "text-slate-600"
                    )}>
                        Email Address
                    </label>
                    <div className="relative">
                        <div className={cn(
                            "absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none",
                            isDarkMode ? "text-emerald-400" : "text-emerald-600"
                        )}>
                            <Mail size={18} />
                        </div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError("");
                            }}
                            placeholder="your@email.com"
                            disabled={isLoading}
                            className={cn(
                                "w-full pl-12 pr-4 py-3 rounded-xl border transition-all",
                                "focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                                isDarkMode
                                    ? "bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                                    : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400",
                                error && "border-red-500 focus:ring-red-500/50",
                                isLoading && "opacity-50 cursor-not-allowed"
                            )}
                        />
                    </div>
                    {error && (
                        <p className="text-xs text-red-500 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                            {error}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                        "w-full py-3 rounded-xl font-semibold text-sm transition-all",
                        "flex items-center justify-center gap-2",
                        "bg-emerald-600 text-white hover:bg-emerald-700",
                        "shadow-lg shadow-emerald-500/20",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "hover:scale-[1.02] active:scale-[0.98]"
                    )}
                >
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Sending OTP...</span>
                        </>
                    ) : (
                        <>
                            <ArrowRight size={18} />
                            <span>Send OTP</span>
                        </>
                    )}
                </button>
            </form>

            <button
                onClick={handleBackToLogin}
                disabled={isLoading}
                className={cn(
                    "w-full text-sm font-medium transition-all",
                    "flex items-center justify-center gap-2",
                    isDarkMode
                        ? "text-slate-400 hover:text-emerald-400"
                        : "text-slate-600 hover:text-emerald-600",
                    isLoading && "opacity-50 cursor-not-allowed"
                )}
            >
                <ArrowLeft size={16} />
                <span>Back to Login</span>
            </button>
        </div>
    );
}
