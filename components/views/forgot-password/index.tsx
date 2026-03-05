"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon } from "lucide-react";
import { useForgotPasswordMutation, useVerifyOtpMutation, useResetPasswordMutation } from "@/hooks/useForgotPasswordQuery";

// Import screen components
import EmailScreen from "./email-screen";
import OtpScreen from "./otp-screen";
import ResetPasswordScreen from "./reset-password-screen";
import SuccessScreen from "./success-screen";
import ProgressStepper from "./progress-stepper";

type ForgotPasswordStep = 1 | 2 | 3 | 'success';

interface ForgotPasswordProps {
    userType: 'management' | 'tenant';
}

export default function ForgotPassword({ userType }: ForgotPasswordProps) {
    const { isDarkMode, setTheme } = useTheme();
    const [currentStep, setCurrentStep] = useState<ForgotPasswordStep>(1);
    const [email, setEmail] = useState("");

    // Mutations
    const { mutate: forgotPasswordMutate, isPending: isForgotPasswordPending } = useForgotPasswordMutation(userType);
    const { mutate: verifyOtpMutate, isPending: isVerifyOtpPending } = useVerifyOtpMutation(userType);
    const { mutate: resetPasswordMutate, isPending: isResetPasswordPending } = useResetPasswordMutation(userType);

    // State persistence
    const [isLoaded, setIsLoaded] = useState(false);

    // Initial state load
    useEffect(() => {
        const savedState = sessionStorage.getItem('forgot_password_state');
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                if (parsed.step && parsed.email) {
                    setCurrentStep(parsed.step);
                    setEmail(parsed.email);
                }
            } catch (e) {
                console.error("Failed to parse saved state", e);
                sessionStorage.removeItem('forgot_password_state');
            }
        }
        setIsLoaded(true);
    }, []);

    // Save state on change
    useEffect(() => {
        if (isLoaded) {
            sessionStorage.setItem('forgot_password_state', JSON.stringify({
                step: currentStep,
                email
            }));
        }
    }, [currentStep, email, isLoaded]);

    // Clear state on success (optional, but good for cleanup if they navigate away manually)
    // For now we keep it as requested to "persist refresh", only tab close clears it naturally via sessionStorage.

    const toggleTheme = () => {
        setTheme(isDarkMode ? "light" : "dark");
    };

    const handleEmailSubmit = (emailValue: string) => {
        forgotPasswordMutate(emailValue, {
            onSuccess: () => {
                setEmail(emailValue);
                setCurrentStep(2);
            }
        });
    };

    const handleOtpSubmit = (otp: string) => {
        verifyOtpMutate({ email, otp }, {
            onSuccess: () => {
                setCurrentStep(3);
            }
        });
    };

    const handleResendOtp = () => {
        forgotPasswordMutate(email);
    };

    const handlePasswordReset = (password: string) => {
        resetPasswordMutate({ email, new_password: password }, {
            onSuccess: () => {
                setCurrentStep('success');
                // We can optionally clear storage here if we want them to start over on refresh after success.
                // But the user asked "persist refresh after need to display...".
                // I'll leave it persisted.
            }
        });
    };

    const handleBackToEmail = () => {
        setCurrentStep(1);
        setEmail(""); // Clear email when going back
    };

    const renderScreenContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <EmailScreen
                        isDarkMode={isDarkMode}
                        onSubmit={handleEmailSubmit}
                        isLoading={isForgotPasswordPending}
                        userType={userType}
                    />
                );

            case 2:
                return (
                    <OtpScreen
                        isDarkMode={isDarkMode}
                        email={email}
                        onSubmit={handleOtpSubmit}
                        onResend={handleResendOtp}
                        onBack={handleBackToEmail}
                        isLoading={isVerifyOtpPending}
                    />
                );

            case 3:
                return (
                    <ResetPasswordScreen
                        isDarkMode={isDarkMode}
                        email={email}
                        onSubmit={handlePasswordReset}
                        isLoading={isResetPasswordPending}
                    />
                );

            case 'success':
                return (
                    <SuccessScreen
                        isDarkMode={isDarkMode}
                        userType={userType}
                    />
                );

            default:
                return null;
        }
    };

    const isUnifiedFlow = currentStep !== 'success';

    if (!isLoaded) {
        return null; // or a loading spinner
    }

    return (
        <div
            className={cn(
                "min-h-screen flex items-center justify-center p-4 transition-all duration-700 relative overflow-hidden",
                isDarkMode ? "bg-slate-950" : "bg-slate-50"
            )}
        >
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
                    <Sun
                        className={cn(
                            "w-5 h-5 transition-all duration-300",
                            "text-amber-400 group-hover:text-amber-300 group-hover:rotate-45"
                        )}
                    />
                ) : (
                    <Moon
                        className={cn(
                            "w-5 h-5 transition-all duration-300",
                            "text-slate-700 group-hover:text-emerald-600 group-hover:-rotate-12"
                        )}
                    />
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
                            ? "linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)"
                            : "linear-gradient(rgba(16, 185, 129, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.15) 1px, transparent 1px)",
                        backgroundSize: "50px 50px",
                    }}
                />

                {/* Accent Shapes - Glowing Orbs */}
                <div
                    className={cn(
                        "absolute top-20 right-20 w-64 h-64 rounded-3xl blur-3xl opacity-20 rotate-12",
                        isDarkMode ? "bg-emerald-600" : "bg-emerald-400"
                    )}
                />
                <div
                    className={cn(
                        "absolute bottom-20 left-20 w-80 h-80 rounded-3xl blur-3xl opacity-20 -rotate-12",
                        isDarkMode ? "bg-blue-600" : "bg-blue-400"
                    )}
                />
                <div
                    className={cn(
                        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-3xl blur-3xl opacity-10 rotate-45",
                        isDarkMode ? "bg-teal-600" : "bg-teal-400"
                    )}
                />
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-3xl">
                {/* Logo */}
                <div className="flex flex-col items-center space-y-1 mb-4 font-sans animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex items-center gap-2">
                        <span
                            className={cn(
                                "text-xl font-bold tracking-tight",
                                isDarkMode ? "text-white" : "text-slate-900"
                            )}
                        >
                            WhatsNexus
                        </span>
                        <div
                            className={cn(
                                "px-1.5 py-0.5 mb-2 rounded-full border text-[9px] font-bold tracking-wide uppercase",
                                isDarkMode
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                    : "bg-emerald-50 border-emerald-200 text-emerald-600"
                            )}
                        >
                            Beta
                        </div>
                    </div>
                    <span
                        className={cn(
                            "text-[8px] font-bold tracking-[0.2em] mt-0.5 uppercase opacity-60",
                            isDarkMode ? "text-slate-400" : "text-slate-500"
                        )}
                    >
                        Powered by Invictus Global Tech
                    </span>
                </div>

                {/* Dynamic Screen Content */}
                {isUnifiedFlow ? (
                    <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-6 duration-500 font-sans">
                        {/* Main Card - Persistent across steps */}
                        <div
                            className={cn(
                                "p-8 rounded-3xl backdrop-blur-xl mt-5 border transition-all w-100 mx-auto duration-300",
                                "shadow-2xl relative overflow-hidden",
                                isDarkMode
                                    ? "bg-slate-900/95 border-slate-700/50"
                                    : "bg-white/95 border-slate-200/50"
                            )}
                        >
                            {/* Decorative gradient */}
                            <div
                                className={cn(
                                    "absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2",
                                    isDarkMode ? "bg-emerald-500" : "bg-emerald-400"
                                )}
                            />

                            <div className="relative z-10">
                                <div className="mb-8">
                                    <ProgressStepper currentStep={typeof currentStep === 'number' ? currentStep : 3} />
                                </div>
                                {renderScreenContent()}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-6 duration-500 font-sans">
                        <div
                            className={cn(
                                "p-8 rounded-3xl backdrop-blur-xl mt-5 border transition-all w-100 mx-auto duration-300",
                                "shadow-2xl relative overflow-hidden",
                                isDarkMode
                                    ? "bg-slate-900/95 border-slate-700/50"
                                    : "bg-white/95 border-slate-200/50"
                            )}
                        >
                            <div
                                className={cn(
                                    "absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2",
                                    isDarkMode ? "bg-emerald-500" : "bg-emerald-400"
                                )}
                            />
                            <div className="relative z-10">
                                {renderScreenContent()}
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="flex mt-5 items-center justify-center gap-4 text-[10px] text-gray-500 font-sans">
                    <a
                        href="/privacy"
                        className={cn(
                            "hover:underline",
                            isDarkMode ? "text-slate-500 hover:text-emerald-400" : "text-slate-500 hover:text-emerald-600"
                        )}
                    >
                        Privacy Policy
                    </a>
                    <span>•</span>
                    <a
                        href="/terms"
                        className={cn(
                            "hover:underline",
                            isDarkMode ? "text-slate-500 hover:text-emerald-400" : "text-slate-500 hover:text-emerald-600"
                        )}
                    >
                        Terms of Service
                    </a>
                    <span>•</span>
                    <a
                        href="/help"
                        className={cn(
                            "hover:underline",
                            isDarkMode ? "text-slate-500 hover:text-emerald-400" : "text-slate-500 hover:text-emerald-600"
                        )}
                    >
                        Help Center
                    </a>
                </div>
                <p className="text-center text-[10px] text-gray-500 mt-3 font-sans">
                    By resetting your password you agree to our <a href="/terms" className={cn("font-semibold", isDarkMode ? "text-emerald-400" : "text-emerald-600")}>Terms of Service</a> and <a href="/privacy" className={cn("font-semibold", isDarkMode ? "text-emerald-400" : "text-emerald-600")}>Privacy Policy</a>
                </p>
            </div>
        </div>
    );
}
