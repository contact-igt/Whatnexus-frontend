"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface SuccessScreenProps {
    isDarkMode: boolean;
    userType: 'management' | 'tenant';
}

export default function SuccessScreen({ isDarkMode, userType }: SuccessScreenProps) {
    const router = useRouter();
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    router.push(userType === 'management' ? '/management/login' : '/login');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [router, userType]);

    const handleGoToLogin = () => {
        router.push(userType === 'management' ? '/management/login' : '/login');
    };

    return (
        <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="flex justify-center">
                <div className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center",
                    "bg-gradient-to-br from-emerald-500 to-emerald-600",
                    "shadow-lg shadow-emerald-500/30",
                    "animate-in zoom-in-50 duration-700 delay-100"
                )}>
                    <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
            </div>

            <div className="space-y-2">
                <h2 className={cn(
                    "text-2xl font-bold tracking-tight",
                    isDarkMode ? "text-white" : "text-slate-900"
                )}>
                    Password Reset Successful!
                </h2>
                <p className={cn(
                    "text-sm",
                    isDarkMode ? "text-slate-400" : "text-slate-600"
                )}>
                    Your password has been updated successfully.
                </p>
            </div>

            <div className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm",
                isDarkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-600"
            )}>
                <span>Redirecting to login in</span>
                <span className={cn(
                    "font-bold",
                    isDarkMode ? "text-emerald-400" : "text-emerald-600"
                )}>
                    {countdown}s
                </span>
            </div>

            <button
                onClick={handleGoToLogin}
                className={cn(
                    "w-full py-3 rounded-xl font-semibold text-sm transition-all",
                    "flex items-center justify-center gap-2",
                    "bg-emerald-600 text-white hover:bg-emerald-700",
                    "shadow-lg shadow-emerald-500/20",
                    "hover:scale-[1.02] active:scale-[0.98]"
                )}
            >
                <span>Go to Login</span>
                <ArrowRight size={18} />
            </button>
        </div>
    );
}
