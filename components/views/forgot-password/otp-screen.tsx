"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Shield, ArrowLeft } from "lucide-react";

interface OtpScreenProps {
    isDarkMode: boolean;
    email: string;
    onSubmit: (otp: string) => void;
    onResend: () => void;
    onBack: () => void;
    isLoading: boolean;
}

export default function OtpScreen({ isDarkMode, email, onSubmit, onResend, onBack, isLoading }: OtpScreenProps) {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const [resendTimer, setResendTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        // Auto-focus first input on mount
        inputRefs.current[0]?.focus();
    }, []);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [resendTimer]);

    const handleChange = (index: number, value: string) => {
        // Only allow numbers
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError("");

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all digits are entered
        if (newOtp.every(digit => digit !== "") && index === 5) {
            handleSubmit(newOtp.join(""));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6);

        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = pastedData.split("");
        setOtp([...newOtp, ...Array(6 - newOtp.length).fill("")]);

        if (newOtp.length === 6) {
            inputRefs.current[5]?.focus();
            handleSubmit(pastedData);
        } else {
            inputRefs.current[newOtp.length]?.focus();
        }
    };

    const handleSubmit = (otpValue?: string) => {
        const otpString = otpValue || otp.join("");

        if (otpString.length !== 6) {
            setError("Please enter all 6 digits");
            return;
        }

        setError("");
        onSubmit(otpString);
    };

    const handleResend = () => {
        if (!canResend) return;

        setOtp(["", "", "", "", "", ""]);
        setResendTimer(60);
        setCanResend(false);
        setError("");
        onResend();
        inputRefs.current[0]?.focus();
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h2 className={cn(
                    "text-2xl font-bold tracking-tight",
                    isDarkMode ? "text-white" : "text-slate-900"
                )}>
                    Verify OTP
                </h2>
                <p className={cn(
                    "text-sm",
                    isDarkMode ? "text-slate-400" : "text-slate-600"
                )}>
                    Enter the 6-digit code sent to
                </p>
                <p className={cn(
                    "text-sm font-semibold",
                    isDarkMode ? "text-emerald-400" : "text-emerald-600"
                )}>
                    {email}
                </p>
            </div>

            <div className="space-y-5">
                <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => {
                                inputRefs.current[index] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={index === 0 ? handlePaste : undefined}
                            disabled={isLoading}
                            className={cn(
                                "w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all",
                                "focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                                isDarkMode
                                    ? "bg-slate-800/50 border-slate-700 text-white"
                                    : "bg-white border-slate-200 text-slate-900",
                                digit && "border-emerald-500",
                                error && "border-red-500 focus:ring-red-500/50",
                                isLoading && "opacity-50 cursor-not-allowed"
                            )}
                        />
                    ))}
                </div>

                {error && (
                    <p className="text-xs text-red-500 text-center animate-in fade-in slide-in-from-top-1 duration-200">
                        {error}
                    </p>
                )}

                <div className="text-center">
                    <p className={cn(
                        "text-xs",
                        isDarkMode ? "text-slate-500" : "text-slate-600"
                    )}>
                        Didn't receive the code?{" "}
                        {canResend ? (
                            <button
                                onClick={handleResend}
                                disabled={isLoading}
                                className={cn(
                                    "font-semibold transition-colors",
                                    isDarkMode
                                        ? "text-emerald-400 hover:text-emerald-300"
                                        : "text-emerald-600 hover:text-emerald-700",
                                    isLoading && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                Resend
                            </button>
                        ) : (
                            <span className={cn(
                                "font-semibold",
                                isDarkMode ? "text-slate-600" : "text-slate-400"
                            )}>
                                Resend in {resendTimer}s
                            </span>
                        )}
                    </p>
                </div>

                <button
                    onClick={() => handleSubmit()}
                    disabled={isLoading || otp.some(digit => !digit)}
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
                            <span>Verifying...</span>
                        </>
                    ) : (
                        <>
                            <Shield size={18} />
                            <span>Verify Code</span>
                        </>
                    )}
                </button>
            </div>

            <button
                onClick={onBack}
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
                <span>Back to login</span>
            </button>
        </div>
    );
}
