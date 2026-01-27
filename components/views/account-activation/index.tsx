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
import AlreadyRejectedScreen from "./already-rejected-screen";

type ActivationState =
    | "pending"
    | "activating"
    | "security-setup"
    | "success"
    | "rejected"
    | "already-activated"
    | "already-rejected";

export default function AccountActivation() {
    const { isDarkMode, setTheme } = useTheme();
    const searchParams = useSearchParams();

    // Get URL parameters
    const token = searchParams.get("token");
    const urlStatus = searchParams.get("status") as ActivationState | null;

    // Initialize state based on URL parameters
    const [currentState, setCurrentState] = useState<ActivationState>(() => {
        // If status is provided in URL, use it
        if (urlStatus === "activated") return "already-activated";
        if (urlStatus === "rejected") return "already-rejected";
        // Default to pending for new invitations
        return "pending";
    });

    // Mock invitation data (in production, fetch from API using token)
    const [invitationData] = useState({
        organizationName: "Invictus Global Tech",
        invitedBy: "Admin User",
        email: "user@example.com",
        invitedDate: new Date().toLocaleDateString(),
        userName: "John Doe",
    });

    const toggleTheme = () => {
        setTheme(isDarkMode ? "light" : "dark");
    };

    // State transition handlers
    const handleActivate = () => {
        setCurrentState("security-setup");
    };

    const handleReject = () => {
        setCurrentState("rejected");
    };

    const handleSetupComplete = () => {
        setCurrentState("success");
    };

    // Render the appropriate screen based on current state
    const renderScreen = () => {
        switch (currentState) {
            case "pending":
                return (
                    <ActivationScreen
                        onActivate={handleActivate}
                        onReject={handleReject}
                        invitationData={invitationData}
                    />
                );

            case "security-setup":
                return (
                    <SecurityScreen
                        onSetupComplete={handleSetupComplete}
                        email={invitationData.email}
                    />
                );

            case "success":
                return (
                    <WelcomeScreen
                        userName={invitationData.userName}
                        organizationName={invitationData.organizationName}
                    />
                );

            case "rejected":
                return (
                    <RejectionScreen
                        organizationName={invitationData.organizationName}
                    />
                );

            case "already-activated":
                return (
                    <AlreadyActivatedScreen
                        email={invitationData.email}
                    />
                );

            case "already-rejected":
                return (
                    <AlreadyRejectedScreen
                        organizationName={invitationData.organizationName}
                    />
                );

            default:
                return (
                    <ActivationScreen
                        onActivate={handleActivate}
                        onReject={handleReject}
                        invitationData={invitationData}
                    />
                );
        }
    };

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

                {/* Dynamic Screen Content */}
                {renderScreen()}
            </div>
        </div>
    );
}
