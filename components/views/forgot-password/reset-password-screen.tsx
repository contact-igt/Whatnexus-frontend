"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Lock, Eye, EyeOff, CheckCircle2, RefreshCw } from "lucide-react";

interface ResetPasswordScreenProps {
    isDarkMode: boolean;
    email: string;
    onSubmit: (password: string) => void;
    isLoading: boolean;
}

export default function ResetPasswordScreen({ isDarkMode, email, onSubmit, isLoading }: ResetPasswordScreenProps) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

    const passwordRequirements = [
        { label: "At least 8 characters", test: (pwd: string) => pwd.length >= 8 },
        { label: "One uppercase letter", test: (pwd: string) => /[A-Z]/.test(pwd) },
        { label: "One lowercase letter", test: (pwd: string) => /[a-z]/.test(pwd) },
        { label: "One number", test: (pwd: string) => /\d/.test(pwd) },
    ];

    const validatePassword = (pwd: string) => {
        return passwordRequirements.every(req => req.test(pwd));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: { password?: string; confirmPassword?: string } = {};

        if (!password) {
            newErrors.password = "Password is required";
        } else if (!validatePassword(password)) {
            newErrors.password = "Password does not meet requirements";
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        onSubmit(password);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h2 className={cn(
                    "text-2xl font-bold tracking-tight",
                    isDarkMode ? "text-white" : "text-slate-900"
                )}>
                    Reset Password
                </h2>
                <p className={cn(
                    "text-sm",
                    isDarkMode ? "text-slate-400" : "text-slate-600"
                )}>
                    Create a new password for your account
                </p>
                <div className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs",
                    isDarkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-600"
                )}>
                    <Lock size={12} />
                    <span>{email}</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password */}
                <div className="space-y-2">
                    <label className={cn(
                        "text-xs font-semibold uppercase tracking-wide",
                        isDarkMode ? "text-slate-400" : "text-slate-600"
                    )}>
                        New Password
                    </label>
                    <div className="relative mt-2">
                        <div className={cn(
                            "absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none",
                            isDarkMode ? "text-emerald-400" : "text-emerald-600"
                        )}>
                            <Lock size={18} />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setErrors({ ...errors, password: undefined });
                            }}
                            autoComplete="new-password"
                            placeholder="••••••••"
                            disabled={isLoading}
                            className={cn(
                                "w-full pl-12 pr-12 py-3 rounded-xl border transition-all",
                                "focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                                isDarkMode
                                    ? "bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                                    : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400",
                                errors.password && "border-red-500 focus:ring-red-500/50",
                                isLoading && "opacity-50 cursor-not-allowed"
                            )}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={cn(
                                "absolute right-4 top-1/2 -translate-y-1/2 transition-colors",
                                isDarkMode ? "text-slate-500 hover:text-slate-400" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-xs text-red-500 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                            {errors.password}
                        </p>
                    )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                    <label className={cn(
                        "text-xs font-semibold uppercase tracking-wide",
                        isDarkMode ? "text-slate-400" : "text-slate-600"
                    )}>
                        Confirm Password
                    </label>
                    <div className="relative mt-2">
                        <div className={cn(
                            "absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none",
                            isDarkMode ? "text-emerald-400" : "text-emerald-600"
                        )}>
                            <Lock size={18} />
                        </div>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                setErrors({ ...errors, confirmPassword: undefined });
                            }}
                            placeholder="••••••••"
                            disabled={isLoading}
                            className={cn(
                                "w-full pl-12 pr-12 py-3 rounded-xl border transition-all",
                                "focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                                isDarkMode
                                    ? "bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                                    : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400",
                                errors.confirmPassword && "border-red-500 focus:ring-red-500/50",
                                isLoading && "opacity-50 cursor-not-allowed"
                            )}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className={cn(
                                "absolute right-4 top-1/2 -translate-y-1/2 transition-colors",
                                isDarkMode ? "text-slate-500 hover:text-slate-400" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-xs text-red-500 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                            {errors.confirmPassword}
                        </p>
                    )}
                </div>

                {/* Password Requirements */}
                <div className={cn(
                    "p-4 rounded-xl border",
                    isDarkMode ? "bg-slate-800/30 border-slate-700" : "bg-slate-50 border-slate-200"
                )}>
                    <p className={cn(
                        "text-xs font-semibold mb-2",
                        isDarkMode ? "text-slate-400" : "text-slate-600"
                    )}>
                        Password must contain:
                    </p>
                    <div className="space-y-1.5">
                        {passwordRequirements.map((req, index) => {
                            const isValid = password && req.test(password);
                            return (
                                <div key={index} className="flex items-center gap-2">
                                    <CheckCircle2
                                        size={14}
                                        className={cn(
                                            "transition-colors",
                                            isValid
                                                ? "text-emerald-500"
                                                : isDarkMode ? "text-slate-600" : "text-slate-300"
                                        )}
                                    />
                                    <span className={cn(
                                        "text-xs transition-colors",
                                        isValid
                                            ? isDarkMode ? "text-emerald-400" : "text-emerald-600"
                                            : isDarkMode ? "text-slate-500" : "text-slate-600"
                                    )}>
                                        {req.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
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
                            <span>Updating Password...</span>
                        </>
                    ) : (
                        <>
                            <RefreshCw size={18} />
                            <span>Update Password</span>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
