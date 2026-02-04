"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTheme } from "@/hooks/useTheme";
import { Eye, EyeOff, Mail, Lock, LogIn, Sun, Moon, Check, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useManagementLoginMutation } from "@/hooks/useLoginQuery";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/redux/selectors/auth/authSelector";
import Link from "next/link";
import { useTenantUserLoginMutation } from "@/hooks/useTenantQuery";

const loginSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .refine(
            (value) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(value);
            },
            {
                message: "Please enter a valid email",
            }
        ),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password is too long"),
    rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const { token } = useAuth();
    const pathname = usePathname();
    console.log("pathname", pathname)
    const { mutate: loginMutate, isPending: isManagementLoading } = useManagementLoginMutation();
    const { mutate: tenantLoginMutate, isPending: isTenantLoading } = useTenantUserLoginMutation();
    const [showPassword, setShowPassword] = useState(false);
    const { theme, setTheme, isDarkMode } = useTheme();

    const toggleTheme = () => {
        setTheme(isDarkMode ? "light" : "dark");
    };

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    });

    const rememberMe = watch("rememberMe")
    const onSubmit = async (data: LoginFormData) => {
        if (pathname == "/management/login") {
            loginMutate(data, {
                onSuccess: () => {
                    router.push("/dashboard")
                }
            })
        } else {
            tenantLoginMutate(data, {
                onSuccess: () => {
                    router.push("/dashboard")
                }
            })
        }
    };
    useEffect(() => {
        if (token) {
            router.replace("/dashboard");
        }
    }, [token]);

    return (
        <div className={cn(
            "min-h-screen font-sans flex items-center justify-center p-4 transition-all duration-700 relative overflow-hidden",
            isDarkMode
                ? "bg-slate-950"
                : "bg-slate-50"
        )}>
            {/* Home Button */}
            <Link href="/">
                <button
                    className={cn(
                        "fixed top-6 left-6 z-50 p-3 rounded-xl transition-all duration-300",
                        "backdrop-blur-xl border shadow-lg hover:scale-110 active:scale-95",
                        "group",
                        isDarkMode
                            ? "bg-slate-800/80 border-white/10 hover:border-emerald-500/50 shadow-black/40"
                            : "bg-white/80 border-slate-200 hover:border-emerald-500/50 shadow-slate-300/50"
                    )}
                    aria-label="Go to home"
                >
                    <Home className={cn(
                        "w-5 h-5 transition-all duration-300",
                        isDarkMode
                            ? "text-emerald-400 group-hover:text-emerald-300"
                            : "text-emerald-600 group-hover:text-emerald-500"
                    )} />
                </button>
            </Link>

            {/* Theme Toggle Button */}
            <button
                onClick={toggleTheme}
                className={cn(
                    "fixed top-6 right-6 z-50 p-3 rounded-xl transition-all duration-300",
                    "backdrop-blur-xl border shadow-lg hover:scale-110 active:scale-95",
                    "group",
                    isDarkMode
                        ? "bg-slate-800/80 border-white/10 hover:border-emerald-500/50 shadow-black/40"
                        : "bg-white/80 border-slate-200 hover:border-emerald-500/50 shadow-slate-300/50"
                )}
                aria-label="Toggle theme"
            >
                {isDarkMode ? (
                    <Sun className={cn(
                        "w-5 h-5 transition-all duration-300",
                        "text-amber-400 group-hover:text-amber-300 group-hover:rotate-45"
                    )} />
                ) : (
                    <Moon className={cn(
                        "w-5 h-5 transition-all duration-300",
                        "text-slate-700 group-hover:text-emerald-600 group-hover:-rotate-12"
                    )} />
                )}
            </button>

            {/* Background Pattern */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Grid Pattern */}
                <div
                    className={cn(
                        "absolute inset-0",
                        isDarkMode ? "opacity-20" : "opacity-30"
                    )}
                    style={{
                        backgroundImage: isDarkMode
                            ? 'linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)'
                            : 'linear-gradient(rgba(16, 185, 129, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.15) 1px, transparent 1px)',
                        backgroundSize: '50px 50px'
                    }}
                />

                {/* Accent Shapes - Square Glowing */}
                <div className={cn(
                    "absolute top-20 right-20 w-64 h-64 rounded-3xl blur-3xl opacity-20 rotate-12",
                    isDarkMode ? "bg-emerald-600" : "bg-emerald-400"
                )} />
                <div className={cn(
                    "absolute bottom-20 left-20 w-80 h-80 rounded-3xl blur-3xl opacity-20 -rotate-12",
                    isDarkMode ? "bg-blue-600" : "bg-blue-400"
                )} />
                <div className={cn(
                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-3xl blur-3xl opacity-10 rotate-45",
                    isDarkMode ? "bg-teal-600" : "bg-teal-400"
                )} />
            </div>

            {/* Login Card with Enhanced Background */}
            <div className={cn(
                "w-full max-w-md p-8 sm:p-10 relative z-10 rounded-3xl",
                "backdrop-blur-2xl border transition-all duration-700",
                "shadow-2xl",
                isDarkMode
                    ? "bg-slate-900/90 border-slate-700/50 shadow-black/60"
                    : "bg-white/90 border-slate-200/50 shadow-slate-400/30"
            )}>
                {/* Logo */}
                <div className="relative flex flex-col items-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex items-center gap-3">
                        <span className={cn("text-4xl font-black tracking-tighter", isDarkMode ? 'text-white' : 'text-slate-900')}>
                            WhatsNexus<span className="text-emerald-500">.</span>
                        </span>
                        <div className={cn("absolute top-0 right-2 px-2 py-0.5 rounded-full border text-[10px] font-bold tracking-wide uppercase",
                            isDarkMode ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-emerald-50 border-emerald-200 text-emerald-600")}>
                            Beta
                        </div>
                    </div>
                    <span className={cn("text-[10px] font-bold tracking-[0.2em] mt-2 uppercase opacity-60", isDarkMode ? 'text-slate-400' : 'text-slate-500')}>
                        Powered by Invictus Global Tech
                    </span>
                </div>

                {/* Header */}
                <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700" style={{ animationDelay: "100ms" }}>
                    <h1 className={cn(
                        "text-3xl font-bold mb-2",
                        isDarkMode
                            ? "text-emerald-400"
                            : "text-emerald-600"
                    )}>
                        {pathname === '/management/login' ? 'Management Portal' : 'Welcome Back'}
                    </h1>
                    <p className={cn(
                        "text-sm",
                        isDarkMode ? "text-slate-400" : "text-slate-600"
                    )}>
                        {pathname === '/management/login' ? 'Secure access for administrators' : 'Sign in to your AI Receptionist Hub'}
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Email/Username Field */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "200ms" }}>
                        <label
                            htmlFor="email"
                            className={cn(
                                "block text-sm font-medium mb-2",
                                isDarkMode ? "text-slate-300" : "text-slate-700"
                            )}
                        >
                            Email
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className={cn(
                                    "w-5 h-5",
                                    isDarkMode ? "text-slate-500" : "text-slate-400"
                                )} />
                            </div>
                            <input
                                {...register("email")}
                                id="email"
                                type="text"
                                autoComplete="new-password"
                                placeholder="Enter your email or username"
                                className={cn(
                                    "w-full pl-12 pr-4 py-3 rounded-xl border transition-all duration-300 outline-none",
                                    "focus:ring-2 focus:ring-emerald-500/50",
                                    isDarkMode
                                        ? "bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 hover:border-slate-600"
                                        : "bg-white/50 border-slate-300 text-slate-900 placeholder-slate-400 hover:border-slate-400",
                                    errors.email && "border-red-500 focus:ring-red-500/50"
                                )}
                            />
                        </div>
                        {errors.email && (
                            <p className="mt-1.5 text-sm text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "300ms" }}>
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
                                <Lock className={cn(
                                    "w-5 h-5",
                                    isDarkMode ? "text-slate-500" : "text-slate-400"
                                )} />
                            </div>
                            <input
                                {...register("password")}
                                id="password"
                                autoComplete="new-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                className={cn(
                                    "w-full pl-12 pr-12 py-3 rounded-xl border transition-all duration-300 outline-none",
                                    "focus:ring-2 focus:ring-emerald-500/50",
                                    isDarkMode
                                        ? "bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 hover:border-slate-600"
                                        : "bg-white/50 border-slate-300 text-slate-900 placeholder-slate-400 hover:border-slate-400",
                                    errors.password && "border-red-500 focus:ring-red-500/50"
                                )}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={cn(
                                    "absolute inset-y-0 right-0 pr-4 flex items-center transition-colors duration-200",
                                    isDarkMode ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"
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
                            <p className="mt-1.5 text-sm text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "400ms" }}>
                        <label className="flex items-center cursor-pointer group select-none">
                            <div className="relative">
                                <input
                                    {...register("rememberMe")}
                                    type="checkbox"
                                    className="sr-only"
                                />
                                <div className={cn(
                                    "w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200",
                                    isDarkMode
                                        ? "bg-slate-800/50 border-slate-600"
                                        : "bg-white/50 border-slate-300",
                                    rememberMe && (isDarkMode ? "bg-emerald-500 border-emerald-500" : "bg-emerald-600 border-emerald-600")
                                )}>
                                    <Check
                                        strokeWidth={3}
                                        className={cn(
                                            "w-3.5 h-3.5 text-white transition-all duration-200",
                                            rememberMe ? "opacity-100 scale-100" : "opacity-0 scale-50"
                                        )}
                                    />
                                </div>
                            </div>
                            <span className={cn(
                                "ml-2 text-sm transition-colors duration-200",
                                isDarkMode
                                    ? "text-slate-400 group-hover:text-slate-300"
                                    : "text-slate-600 group-hover:text-slate-700"
                            )}>
                                Remember me
                            </span>
                        </label>
                        <button
                            type="button"
                            className={cn(
                                "text-sm font-medium transition-colors duration-200",
                                isDarkMode
                                    ? "text-emerald-400 hover:text-emerald-300"
                                    : "text-emerald-600 hover:text-emerald-700"
                            )}
                        >
                            Forgot password?
                        </button>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isTenantLoading || isManagementLoading}
                        className={cn(
                            "w-full py-3.5 px-4 rounded-xl font-semibold text-white",
                            "transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]",
                            "flex items-center justify-center gap-2",
                            "shadow-lg hover:shadow-2xl",
                            "animate-in fade-in slide-in-from-bottom-4 duration-700",
                            "relative overflow-hidden group",
                            isDarkMode
                                ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/50"
                                : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30",
                            (isTenantLoading || isManagementLoading) && "opacity-70 cursor-not-allowed"
                        )}
                        style={{ animationDelay: "500ms" }}
                    >
                        {/* Button shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <span className="relative z-10 flex items-center gap-2">
                            {(isTenantLoading || isManagementLoading) ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    <span>Sign In</span>
                                </>
                            )}
                        </span>
                    </button>
                </form>

                {/* Footer */}
                {/* <div className={cn(
                    "mt-8 text-center text-sm animate-in fade-in duration-700",
                    isDarkMode ? "text-slate-400" : "text-slate-600"
                )} style={{ animationDelay: "600ms" }}>
                    Don't have an account?{" "}
                    <button
                        type="button"
                        className={cn(
                            "font-medium transition-colors duration-200",
                            isDarkMode
                                ? "text-emerald-400 hover:text-emerald-300"
                                : "text-emerald-600 hover:text-emerald-700"
                        )}
                    >
                        Sign up
                    </button>
                </div> */}
            </div>
        </div>
    );
}
