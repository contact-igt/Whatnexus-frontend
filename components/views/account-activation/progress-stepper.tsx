"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { Check } from "lucide-react";

interface Step {
    id: number;
    label: string;
    status: "completed" | "current" | "upcoming";
}

interface ProgressStepperProps {
    currentStep: number;
}

export default function ProgressStepper({ currentStep }: ProgressStepperProps) {
    const { isDarkMode } = useTheme();

    const steps: Step[] = [
        {
            id: 1,
            label: "Details",
            status: currentStep > 1 ? "completed" : currentStep === 1 ? "current" : "upcoming",
        },
        {
            id: 2,
            label: "Security",
            status: currentStep > 2 ? "completed" : currentStep === 2 ? "current" : "upcoming",
        },
        {
            id: 3,
            label: "Activated",
            status: currentStep >= 3 ? "completed" : "upcoming",
        },
    ];

    return (
        <div className="w-full max-w-md mx-auto mb-8">
            <div className="flex items-center justify-between relative">
                {steps.map((step, index) => (
                    <div key={step.id} className={cn("flex flex-col items-center relative z-10 flex-1", index == 0 ? "items-start" : index == 1 ? "items-center" : "items-end")}>
                        <div
                            className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                                step.status === "completed"
                                    ? isDarkMode
                                        ? "bg-emerald-500 border-emerald-500"
                                        : "bg-emerald-500 border-emerald-500"
                                    : step.status === "current"
                                        ? isDarkMode
                                            ? "bg-emerald-500/20 border-emerald-500"
                                            : "bg-emerald-50 border-emerald-500"
                                        : isDarkMode
                                            ? "bg-slate-800 border-slate-700"
                                            : "bg-slate-100 border-slate-300",
                                index == 0 ? "ml-[1px]" : index == 1 ? "" : "mr-[3px]"
                            )}
                        >
                            {step.status === "completed" ? (
                                <Check className="w-4 h-4 text-white" strokeWidth={3} />
                            ) : (
                                <span
                                    className={cn(
                                        "text-xs font-bold",
                                        step.status === "current"
                                            ? isDarkMode
                                                ? "text-emerald-400"
                                                : "text-emerald-600"
                                            : isDarkMode
                                                ? "text-slate-600"
                                                : "text-slate-400"
                                    )}
                                >
                                    {step.id}
                                </span>
                            )}
                        </div>
                        <span
                            className={cn(
                                "text-[8px] font-medium uppercase tracking-wider mt-2 transition-colors duration-300",
                                step.status === "completed" || step.status === "current"
                                    ? isDarkMode
                                        ? "text-emerald-400"
                                        : "text-emerald-600"
                                    : isDarkMode
                                        ? "text-slate-600"
                                        : "text-slate-400"
                            )}
                        >
                            {step.label}
                        </span>
                        {index < steps.length - 1 && (
                            <div
                                className={cn(
                                    "absolute top-4 h-[0.9px] transition-all duration-300",
                                    step.id === 1 ? "left-[37px]" : "left-[73.5px]",
                                    `${step.status === "completed" ? "w-[calc(100%-0.001rem)]" : "w-[calc(100%)]"}`
                                )}
                                style={{
                                    transform: "translateY(-50%)",
                                }}
                            >
                                <div
                                    className={cn(
                                        "h-full transition-all duration-500",
                                        step.status === "completed"
                                            ? isDarkMode
                                                ? "bg-emerald-500"
                                                : "bg-emerald-500"
                                            : isDarkMode
                                                ? "bg-slate-700"
                                                : "bg-slate-300"
                                    )}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
