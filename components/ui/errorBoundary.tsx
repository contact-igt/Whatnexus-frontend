"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallbackTitle?: string;
    fallbackMessage?: string;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

class ErrorBoundaryBase extends React.Component<
    ErrorBoundaryProps & { isDarkMode: boolean },
    ErrorBoundaryState
> {
    state: ErrorBoundaryState = { hasError: false };

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error("[ERROR-BOUNDARY] Campaign view crashed", {
            message: error.message,
            stack: error.stack,
            componentStack: info.componentStack,
        });
    }

    render() {
        const { children, fallbackTitle, fallbackMessage, isDarkMode } = this.props;

        if (!this.state.hasError) return children;

        return (
            <div className={cn(
                "min-h-[320px] flex items-center justify-center p-6",
                isDarkMode ? "text-white" : "text-slate-900"
            )}>
                <div className={cn(
                    "w-full max-w-md rounded-lg border p-5",
                    isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
                )}>
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
                        <div>
                            <h2 className="text-sm font-semibold">
                                {fallbackTitle || "Campaign view unavailable"}
                            </h2>
                            <p className={cn(
                                "mt-1 text-xs leading-5",
                                isDarkMode ? "text-white/60" : "text-slate-500"
                            )}>
                                {fallbackMessage || "Refresh the page to retry."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export const ErrorBoundary = (props: ErrorBoundaryProps) => {
    const { isDarkMode } = useTheme();
    return <ErrorBoundaryBase {...props} isDarkMode={isDarkMode} />;
};
