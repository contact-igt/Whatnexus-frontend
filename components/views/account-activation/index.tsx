"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon } from "lucide-react";

// Import all screen components
import ActivationScreen from "./activation-screen";
import SecurityScreen from "./security-screen";
import WelcomeScreen from "./welcome-screen";
import RejectionScreen from "./rejection-screen";
import AlreadyActivatedScreen from "./already-activated-screen";
import ExpiredScreen from "./expired-screen";
import ActivationLoader from "./activation-loader";
import ProgressStepper from "./progress-stepper";
import { useTenantActivationCheckQuery } from "@/hooks/useTenantActivationQuery";
import { useDispatch } from "react-redux";
import { setActivationToken, setActiveStatus, setCurrentStatusData } from "@/redux/slices/auth/authSlice";
import ResumeSetupScreen from "./resume-setup";
import { useAuth } from "@/redux/selectors/auth/authSelector";

type ActivationStatus =
    | "expired"
    | "pending"
    | "activating"
    | "security-setup"
    | "resume-setup"
    | "success"
    | "rejected"
    | "activated"
    | "already-activated"
    | "already-rejected";

export default function AccountActivation() {
    const dispatch = useDispatch();
    const { currentStatusDataState, activeStatus } = useAuth();
    const { isDarkMode, setTheme } = useTheme();
    const searchParams = useSearchParams();
    console.log("searchParams", searchParams)
    // Get URL parameters
    const token = searchParams.get("token");
    const urlStatus = searchParams.get("status") as ActivationStatus | null;
    const sessionKey = token ? `activation_checked_${token}` : "";
    const hasChecked = typeof window !== "undefined" && sessionKey && sessionStorage.getItem(sessionKey) === "true";
    console.log("hasChecked", hasChecked)
    const { data: currentStatusData, isLoading } = useTenantActivationCheckQuery(token ?? "", Boolean(hasChecked));
    const [currentStatus, setCurrentStatus] = useState<ActivationStatus>(activeStatus ?? "pending");
    const inviteCurrentStatus = currentStatusData ? currentStatusData : currentStatusDataState;
    // Mock invitation data (in production, fetch from API using token)
    // const [invitationData] = useState({
    //     organizationName: "Invictus Global Tech",
    //     invitedBy: "Admin User",
    //     email: "user@example.com",
    //     invitedDate: new Date().toLocaleDateString(),
    //     userName: "John Doe",
    // });
    console.log("activeStatus", activeStatus)
    const toggleTheme = () => {
        setTheme(isDarkMode ? "light" : "dark");
    };
    const handleActivate = () => {
        setCurrentStatus("security-setup");
        dispatch(setActiveStatus("security-setup"));
    };

    const handleReject = () => {
        setCurrentStatus("rejected");
        dispatch(setActiveStatus("rejected"));
    };

    const handleSetupComplete = () => {
        setCurrentStatus("success");
        dispatch(setActiveStatus("success"));
    };

    const handleGoBack = () => {
        setCurrentStatus("pending");
        dispatch(setActiveStatus("pending"));
    };

    useEffect(() => {
        if (token) {
            dispatch(setActivationToken(token));
        }
    }, [token])

    useEffect(() => {
        if (currentStatusData && sessionKey) {
            sessionStorage.setItem(sessionKey, "true");
            dispatch(setCurrentStatusData(currentStatusData))
        }
    }, [currentStatusData, sessionKey]);

    const getCurrentStep = () => {
        switch (currentStatus) {
            case "pending":
                return 1;
            case "resume-setup":
                return 1;
            case "security-setup":
                return 2;
            case "success":
                return 3;
            default:
                return 1;
        }
    };
    console.log("currentStatusData", currentStatusData)
    useEffect(() => {
        console.log("inviteCurrentStatus", inviteCurrentStatus)
        if (inviteCurrentStatus && !hasChecked) {
            if (inviteCurrentStatus?.valid && inviteCurrentStatus?.status == "pending" && !inviteCurrentStatus?.is_password) {
                setCurrentStatus("pending");
                dispatch(setActiveStatus("pending"));
            }
            else if (inviteCurrentStatus?.valid && inviteCurrentStatus?.status == "accepted" && !inviteCurrentStatus?.is_password) {
                setCurrentStatus("resume-setup");
                dispatch(setActiveStatus("resume-setup"));
            }
            else if (!inviteCurrentStatus?.valid && inviteCurrentStatus?.status == "revoked") {
                setCurrentStatus("rejected");
                dispatch(setActiveStatus("rejected"));
            }
            else if (!inviteCurrentStatus?.valid && inviteCurrentStatus?.status == "accepted" && inviteCurrentStatus?.is_password) {
                setCurrentStatus("already-activated");
                dispatch(setActiveStatus("already-activated"));
            }
            else if (!inviteCurrentStatus?.valid && inviteCurrentStatus?.status == "pending") {
                setCurrentStatus("expired");
                dispatch(setActiveStatus("expired"));
            }
        }
    }, [inviteCurrentStatus, hasChecked])
    const isUnifiedFlow = ["pending", "security-setup", "success", "resume-setup"].includes(currentStatus);

    const renderScreenContent = () => {
        switch (currentStatus) {
            case "pending":
                return (
                    <ActivationScreen
                        onActivate={handleActivate}
                        onReject={handleReject}
                        invitationData={inviteCurrentStatus}
                    />
                );

            case "security-setup":
                return (
                    <SecurityScreen
                        onSetupComplete={handleSetupComplete}
                        onGoBack={handleGoBack}
                        email={inviteCurrentStatus?.email}
                    />
                );

            case "success":
                return (
                    <WelcomeScreen
                        userName={inviteCurrentStatus?.userName}
                        organizationName={inviteCurrentStatus?.company_name}
                    />
                );

            case "rejected":
                return (
                    <RejectionScreen
                        organizationName={inviteCurrentStatus?.company_name}
                    />
                );

            case "already-activated":
                return (
                    <AlreadyActivatedScreen
                        email={inviteCurrentStatus?.email}
                    />
                );

            case "resume-setup":
                return (
                    <ResumeSetupScreen
                        onActivate={handleActivate}
                        invitationData={inviteCurrentStatus}
                    />
                );

            case "expired":
                return (
                    <ExpiredScreen
                        email={inviteCurrentStatus?.email}
                    />
                );

            default:
                return (
                    <ActivationScreen
                        onActivate={handleActivate}
                        onReject={handleReject}
                        invitationData={inviteCurrentStatus}
                    />
                );
        }
    };
    console.log("currentStatus", currentStatus)
    return (
        <div
            className={cn(
                "min-h-screen flex items-center justify-center p-4 transition-all duration-700 relative overflow-hidden",
                isDarkMode ? "bg-slate-950" : "bg-slate-50"
            )}
        >
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

            {/* Main Content - Render current screen */}
            <div className="relative z-10 w-full max-w-3xl">
                {/* Logo */}
                {/* <div className="flex flex-col items-center mb-4 animate-in fade-in slide-in-from-top-4 duration-700">
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
                </div> */}
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
                {isLoading ? (
                    <ActivationLoader />
                ) : isUnifiedFlow ? (
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
                                    <ProgressStepper currentStep={getCurrentStep()} />
                                </div>
                                {renderScreenContent()}
                            </div>
                        </div>
                    </div>
                ) : (
                    renderScreenContent()
                )}
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
                    By completing setup you agree to our <a href="/terms" className={cn("font-semibold", isDarkMode ? "text-emerald-400" : "text-emerald-600")}>Terms of Service</a> and <a href="/privacy" className={cn("font-semibold", isDarkMode ? "text-emerald-400" : "text-emerald-600")}>Privacy Policy</a>
                </p>
            </div>
        </div>
    );
}
