"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from "@/lib/utils";

interface WhatsAppFlowStepperProps {
    isDarkMode: boolean;
}

export const WhatsAppFlowStepper = ({ isDarkMode }: WhatsAppFlowStepperProps) => {
    const steps = [
        {
            id: 1,
            title: "API Credentials",
            description: "Enter your Meta Business API credentials to establish the initial connection."
        },
        {
            id: 2,
            title: "Test Connection",
            description: "Verify that the provided credentials are valid by testing the connection."
        },
        {
            id: 3,
            title: "Verify Webhook",
            description: "Check the webhook status to ensure Meta can send updates to your system."
        },
        {
            id: 4,
            title: "Activate Account",
            description: "Enable the WhatsApp connection to start sending and receiving messages."
        },
        {
            id: 5,
            title: "Send Test Message",
            description: "Send a sample message to verify the end-to-end flow."
        }
    ];

    const [expandedStep, setExpandedStep] = useState<number | null>(null);

    const toggleStep = (id: number) => {
        setExpandedStep(expandedStep === id ? null : id);
    };

    return (
        <div className={cn(
            "rounded-xl border backdrop-blur-xl overflow-hidden transition-all",
            isDarkMode ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200"
        )}>
            <div className={cn(
                "p-4 border-b",
                isDarkMode ? "border-white/10 bg-white/5" : "border-slate-100 bg-slate-50/50"
            )}>
                <h3 className={cn("font-semibold", isDarkMode ? "text-white" : "text-slate-900")}>
                    Connection Flow
                </h3>
            </div>

            <div className="p-4 space-y-3">
                {steps.map((step) => (
                    <div
                        key={step.id}
                        className={cn(
                            "rounded-lg border transition-all duration-300 overflow-hidden",
                            isDarkMode ? "border-white/5" : "border-slate-100",
                            isDarkMode ? "bg-white/[0.02]" : "bg-white"
                        )}
                    >
                        <button
                            onClick={() => toggleStep(step.id)}
                            className={cn(
                                "w-full px-4 py-3 flex items-center justify-between transition-colors",
                                isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-50"
                            )}
                        >
                            <div className="flex items-center space-x-3">
                                <div className={cn(
                                    "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                                    isDarkMode ? "bg-white/10 text-white/60" : "bg-slate-100 text-slate-500"
                                )}>
                                    <span className="text-xs font-bold">{step.id}</span>
                                </div>
                                <span className={cn(
                                    "font-medium text-sm",
                                    isDarkMode ? "text-white" : "text-slate-900"
                                )}>
                                    {step.title}
                                </span>
                            </div>
                            {expandedStep === step.id ? (
                                <ChevronUp size={16} className={isDarkMode ? "text-white/40" : "text-slate-400"} />
                            ) : (
                                <ChevronDown size={16} className={isDarkMode ? "text-white/40" : "text-slate-400"} />
                            )}
                        </button>

                        <div className={cn(
                            "transition-all duration-300 ease-in-out border-t border-dashed",
                            expandedStep === step.id ? "max-h-40 opacity-100" : "max-h-0 opacity-0 overflow-hidden",
                            isDarkMode ? "border-white/10" : "border-slate-100"
                        )}>
                            <div className="p-4 pt-3">
                                <p className={cn("text-xs leading-relaxed", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
