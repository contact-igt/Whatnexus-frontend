"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { Lock, Eye, EyeOff, Shield, Check, X } from "lucide-react";

const passwordSchema = z
    .object({
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/[0-9]/, "Password must contain at least one number")
            .regex(
                /[^A-Za-z0-9]/,
                "Password must contain at least one special character"
            ),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

type PasswordFormData = z.infer<typeof passwordSchema>;

interface SecurityScreenProps {
    onSetupComplete: () => void;
    email?: string;
}

export default function SecurityScreen({
    onSetupComplete,
    email = "user@example.com",
}: SecurityScreenProps) {
    const { isDarkMode } = useTheme();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
        mode: "onChange",
    });

    const password = watch("password", "");

    // Password strength validation
    const validations = {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[^A-Za-z0-9]/.test(password),
    };

    const onSubmit = async (data: PasswordFormData) => {
        setIsSubmitting(true);
        setTimeout(() => {
            onSetupComplete();
        }, 1200);
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
                        isDarkMode ? "bg-emerald-500" : "bg-emerald-400"
                    )}
                />

                <div className="relative z-10">
                    {/* Icon */}
                    {/* <div className="flex justify-center mb-4">
                        <div
                            className={cn(
                                "p-3 rounded-xl",
                                isDarkMode
                                    ? "bg-emerald-500/10 border border-emerald-500/20"
                                    : "bg-emerald-50 border border-emerald-200"
                            )}
                        >
                            <Shield
                                className={cn(
                                    "w-8 h-8",
                                    isDarkMode ? "text-emerald-400" : "text-emerald-600"
                                )}
                            />
                        </div>
                    </div> */}

                    <div className="flex flex-col items-center mb-4 animate-in fade-in slide-in-from-top-4 duration-700">
                        <div className="flex items-center gap-2">
                            <span
                                className={cn(
                                    "text-2xl font-black tracking-tighter",
                                    isDarkMode ? "text-white" : "text-slate-900"
                                )}
                            >
                                WhatsNexus<span className="text-emerald-500">.</span>
                            </span>
                            <div
                                className={cn(
                                    "px-1.5 py-0.5 rounded-full border text-[8px] font-bold tracking-wide uppercase",
                                    isDarkMode
                                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                                        : "bg-emerald-50 border-emerald-200 text-emerald-600"
                                )}
                            >
                                Beta
                            </div>
                        </div>
                        <span
                            className={cn(
                                "text-[8px] font-bold tracking-[0.2em] mt-1 uppercase opacity-60",
                                isDarkMode ? "text-slate-400" : "text-slate-500"
                            )}
                        >
                            Powered by Invictus Global Tech
                        </span>
                    </div>

                    {/* Title */}
                    <h1
                        className={cn(
                            "text-2xl font-bold text-center mb-2",
                            isDarkMode ? "text-emerald-400" : "text-emerald-600"
                        )}
                    >
                        Secure Your Account
                    </h1>
                    <p
                        className={cn(
                            "text-center text-sm mb-5",
                            isDarkMode ? "text-slate-400" : "text-slate-600"
                        )}
                    >
                        Create a strong password for <span className="font-semibold">{email}</span>
                    </p>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Password Field */}
                        <div>
                            <label
                                htmlFor="password"
                                className={cn(
                                    "block text-sm font-medium mb-2",
                                    isDarkMode ? "text-slate-300" : "text-slate-700"
                                )}
                            >
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock
                                        className={cn(
                                            "w-5 h-5",
                                            isDarkMode ? "text-slate-500" : "text-slate-400"
                                        )}
                                    />
                                </div>
                                <input
                                    {...register("password")}
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    className={cn(
                                        "w-full pl-12 pr-12 py-3 rounded-xl border transition-all duration-300 outline-none",
                                        "focus:ring-2 focus:ring-emerald-500/50",
                                        isDarkMode
                                            ? "bg-slate-800/50 border-slate-700 text-white placeholder-slate-500"
                                            : "bg-white/50 border-slate-300 text-slate-900 placeholder-slate-400",
                                        errors.password && "border-red-500 focus:ring-red-500/50"
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={cn(
                                        "absolute inset-y-0 right-0 pr-4 flex items-center transition-colors",
                                        isDarkMode
                                            ? "text-slate-500 hover:text-slate-300"
                                            : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-sm text-red-500">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className={cn(
                                    "block text-sm font-medium mb-2",
                                    isDarkMode ? "text-slate-300" : "text-slate-700"
                                )}
                            >
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock
                                        className={cn(
                                            "w-5 h-5",
                                            isDarkMode ? "text-slate-500" : "text-slate-400"
                                        )}
                                    />
                                </div>
                                <input
                                    {...register("confirmPassword")}
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm your password"
                                    className={cn(
                                        "w-full pl-12 pr-12 py-3 rounded-xl border transition-all duration-300 outline-none",
                                        "focus:ring-2 focus:ring-emerald-500/50",
                                        isDarkMode
                                            ? "bg-slate-800/50 border-slate-700 text-white placeholder-slate-500"
                                            : "bg-white/50 border-slate-300 text-slate-900 placeholder-slate-400",
                                        errors.confirmPassword &&
                                        "border-red-500 focus:ring-red-500/50"
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className={cn(
                                        "absolute inset-y-0 right-0 pr-4 flex items-center transition-colors",
                                        isDarkMode
                                            ? "text-slate-500 hover:text-slate-300"
                                            : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1.5 text-sm text-red-500">
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>

                        {/* Password Requirements */}
                        <div
                            className={cn(
                                "p-3 rounded-xl space-y-2",
                                isDarkMode ? "bg-slate-800/50" : "bg-slate-50"
                            )}
                        >
                            <p
                                className={cn(
                                    "text-sm font-medium mb-2",
                                    isDarkMode ? "text-slate-300" : "text-slate-700"
                                )}
                            >
                                Password must contain:
                            </p>
                            <div className="space-y-1.5">
                                {[
                                    { label: "At least 8 characters", valid: validations.minLength },
                                    { label: "One uppercase letter", valid: validations.hasUppercase },
                                    { label: "One lowercase letter", valid: validations.hasLowercase },
                                    { label: "One number", valid: validations.hasNumber },
                                    { label: "One special character", valid: validations.hasSpecial },
                                ].map((requirement, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <div
                                            className={cn(
                                                "w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200",
                                                requirement.valid
                                                    ? isDarkMode
                                                        ? "bg-emerald-500/20 text-emerald-400"
                                                        : "bg-emerald-100 text-emerald-600"
                                                    : isDarkMode
                                                        ? "bg-slate-700 text-slate-500"
                                                        : "bg-slate-200 text-slate-400"
                                            )}
                                        >
                                            {requirement.valid ? (
                                                <Check className="w-3 h-3" strokeWidth={3} />
                                            ) : (
                                                <X className="w-3 h-3" strokeWidth={3} />
                                            )}
                                        </div>
                                        <span
                                            className={cn(
                                                "text-[14px] transition-colors duration-200",
                                                requirement.valid
                                                    ? isDarkMode
                                                        ? "text-emerald-400"
                                                        : "text-emerald-600"
                                                    : isDarkMode
                                                        ? "text-slate-400"
                                                        : "text-slate-600"
                                            )}
                                        >
                                            {requirement.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={cn(
                                "w-full py-3.5 px-4 rounded-xl font-semibold text-white",
                                "transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]",
                                "flex items-center justify-center gap-2",
                                "shadow-lg hover:shadow-2xl relative overflow-hidden group",
                                "bg-gradient-to-r from-emerald-600 to-emerald-500",
                                "hover:from-emerald-500 hover:to-emerald-400",
                                "border border-emerald-400/20",
                                isSubmitting && "opacity-70 cursor-not-allowed"
                            )}
                        >
                            {/* Animated gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                            {/* Glow effect */}
                            <div className={cn(
                                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                                "bg-gradient-to-r from-emerald-400/20 to-emerald-300/20 blur-xl"
                            )} />

                            <span className="relative z-10 flex items-center gap-2">
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span className="font-semibold drop-shadow-sm">Setting up...</span>
                                    </>
                                ) : (
                                    <>
                                        <Shield className="w-5 h-5 drop-shadow-sm" />
                                        <span className="font-semibold drop-shadow-sm">Setup Account</span>
                                    </>
                                )}
                            </span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
