"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { Lock, Eye, EyeOff, Shield, Check, ArrowLeft } from "lucide-react";
import { useSetPasswordQuery } from "@/hooks/useTenantActivationQuery";
import { useAuth } from "@/redux/selectors/auth/authSelector";

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
    onGoBack?: () => void;
    email?: string;
}

export default function SecurityScreen({
    onSetupComplete,
    onGoBack,
    email = "user@example.com",
}: SecurityScreenProps) {
    const { isDarkMode } = useTheme();
    const {activationToken} = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {mutate: setPasswordMutate, isPending: setPasswordPending} = useSetPasswordQuery();
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
        setPasswordMutate({token: activationToken ?? "", password: data.password}, {
            onSuccess: () => {
                onSetupComplete();  
            }
        })
    };

    return (
        <>
            {/* <div className="flex justify-center mb-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl" />
                    <div
                        className={cn(
                            "relative p-3 rounded-full",
                            isDarkMode
                                ? "bg-slate-800/80 border border-emerald-500/30"
                                : "bg-slate-900/80 border border-emerald-500/30"
                        )}
                    >
                        <Shield
                            className="w-5 h-5 text-emerald-400"
                        />
                    </div>
                </div>
            </div> */}

            {/* Title */}
            <h1
                className={cn(
                    "text-lg font-bold text-center mb-1",
                    isDarkMode ? "text-white" : "text-slate-900"
                )}
            >
                Security Setup
            </h1>
            <p
                className={cn(
                    "text-center text-[11px] mb-5",
                    isDarkMode ? "text-slate-400" : "text-slate-600"
                )}
            >
                Please set a strong password for your new account
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mt-7">
                <div>
                    <label
                        htmlFor="password"
                        className={cn(
                            "block text-[10px] font-semibold mb-1.5 uppercase tracking-wide",
                            isDarkMode ? "text-slate-400" : "text-slate-600"
                        )}
                    >
                        Create Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock
                                className={cn(
                                    "w-4 h-4",
                                    isDarkMode ? "text-slate-500" : "text-slate-400"
                                )}
                            />
                        </div>
                        <input
                            {...register("password")}
                            id="password"
                            autoComplete="new-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Min. 8 characters"
                            className={cn(
                                "w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border transition-all duration-300 outline-none",
                                "focus:ring-1 focus:ring-emerald-500/50",
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
                                "absolute inset-y-0 right-0 pr-3 flex items-center transition-colors",
                                isDarkMode
                                    ? "text-slate-500 hover:text-slate-300"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-red-500 text-[10px] mt-1">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <p
                            className={cn(
                                "text-[11px] font-medium",
                                isDarkMode ? "text-slate-400" : "text-slate-600"
                            )}
                        >
                            Password Strength
                        </p>
                        <span
                            className={cn(
                                "text-xs font-bold",
                                Object.values(validations).filter(Boolean).length >= 4
                                    ? "text-emerald-400"
                                    : Object.values(validations).filter(Boolean).length >= 2
                                        ? "text-yellow-500"
                                        : "text-slate-500"
                            )}
                        >
                            {Object.values(validations).filter(Boolean).length >= 4
                                ? "Strong"
                                : Object.values(validations).filter(Boolean).length >= 2
                                    ? "Medium"
                                    : "Weak"}
                        </span>
                    </div>
                    {/* Segmented Progress Bars */}
                    <div className="flex gap-1.5">
                        {[0, 1, 2, 3].map((index) => (
                            <div
                                key={index}
                                className={cn(
                                    "h-1 flex-1 rounded-full transition-all duration-300",
                                    Object.values(validations).filter(Boolean).length > index
                                        ? "bg-emerald-500"
                                        : isDarkMode
                                            ? "bg-slate-700"
                                            : "bg-slate-300"
                                )}
                            />
                        ))}
                    </div>
                    {/* Validation Items - Two Columns */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-1">
                        {[
                            { label: "Uppercase & Lowercase", valid: validations.hasUppercase && validations.hasLowercase },
                            { label: "Number (0-9)", valid: validations.hasNumber },
                            { label: "Special character", valid: validations.hasSpecial },
                            { label: "At least 8 characters", valid: validations.minLength },
                        ].map((requirement, index) => (
                            <div key={index} className="flex items-center gap-1.5">
                                <div
                                    className={cn(
                                        "w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0",
                                        requirement.valid
                                            ? "bg-emerald-500/20"
                                            : isDarkMode
                                                ? "bg-slate-700"
                                                : "bg-slate-200"
                                    )}
                                >
                                    {requirement.valid && (
                                        <Check className="w-2.5 h-2.5 text-emerald-500" />
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        "text-[10px]",
                                        requirement.valid
                                            ? isDarkMode
                                                ? "text-emerald-400"
                                                : "text-emerald-600"
                                            : isDarkMode
                                                ? "text-slate-500"
                                                : "text-slate-500"
                                    )}
                                >
                                    {requirement.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-7">
                    <label
                        htmlFor="confirmPassword"
                        className={cn(
                            "block text-[10px] font-semibold mb-1.5 uppercase tracking-wide",
                            isDarkMode ? "text-slate-400" : "text-slate-600"
                        )}
                    >
                        Confirm Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Shield
                                className={cn(
                                    "w-4 h-4",
                                    isDarkMode ? "text-slate-500" : "text-slate-400"
                                )}
                            />
                        </div>
                        <input
                            {...register("confirmPassword")}
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Repeat password"
                            className={cn(
                                "w-full pl-10 pr-10 py-3 text-sm rounded-lg border transition-all duration-300 outline-none",
                                "focus:ring-1 focus:ring-emerald-500/50",
                                isDarkMode
                                    ? "bg-slate-800/50 border-slate-700 text-white placeholder-slate-500"
                                    : "bg-white/50 border-slate-300 text-slate-900 placeholder-slate-400",
                                errors.confirmPassword && "border-red-500 focus:ring-red-500/50"
                            )}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className={cn(
                                "absolute inset-y-0 right-0 pr-3 flex items-center transition-colors",
                                isDarkMode
                                    ? "text-slate-500 hover:text-slate-300"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-red-500 text-[10px] mt-1">
                            {errors.confirmPassword.message}
                        </p>
                    )}
                </div>
                <div className="flex gap-3 pt-2 mt-6">
                    {/* <button
                        type="button"
                        onClick={onGoBack}
                        className={cn(
                            "px-4 py-3 w-[40%] rounded-lg cursor-pointer font-medium text-sm transition-all duration-300",
                            "flex items-center justify-center gap-2",
                            isDarkMode
                                ? "bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700"
                                : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                        )}
                    >   <ArrowLeft className="w-4 h-4" />
                        <span className="text-xs font-bold">Go Back</span>
                    </button> */}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={cn(
                            "flex-1 py-3 px-4 rounded-lg font-bold cursor-pointer text-sm text-white",
                            "transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]",
                            "flex items-center justify-center gap-2",
                            "shadow-lg hover:shadow-xl relative overflow-hidden group",
                            "bg-emerald-500 hover:bg-emerald-400",
                            isSubmitting && "opacity-70 cursor-not-allowed"
                        )}
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {!isSubmitting && <Shield className="w-4 h-4" />}
                            {isSubmitting ? "Setting up..." : "Complete Setup"}
                        </span>
                    </button>
                </div>
            </form>
        </>
    );
}
