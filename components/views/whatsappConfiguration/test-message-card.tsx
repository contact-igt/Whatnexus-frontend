"use client";

import { useState } from 'react';
import { Send, Loader2, Phone } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { useTestWhatsAppConfigQuery } from '@/hooks/useWhatsappConfigQuery';
import { z } from 'zod'; // Assuming zod is used in the project, though not strictly needed here if we just use string.

interface TestMessageCardProps {
    isDarkMode: boolean;
    isActive: boolean;
    whatsappNumber: string;
}

export const TestMessageCard = ({ isDarkMode, isActive, whatsappNumber }: TestMessageCardProps) => {
    const [testPhoneNumber, setTestPhoneNumber] = useState('');
    const { mutate: testWhatsConfigMutate, isPending: isTestLoading } = useTestWhatsAppConfigQuery();

    const handleSendTestMessage = () => {
        if (!testPhoneNumber) {
            toast.error("Please enter a phone number");
            return;
        }

        // Basic validation
        if (testPhoneNumber.length < 10) {
            toast.error("Please enter a valid phone number");
            return;
        }

        testWhatsConfigMutate({
            to: testPhoneNumber,
            type: "hello_world"
        }, {
            onSuccess: () => {
                toast.success(`Test message sent to ${testPhoneNumber}`);
            },
            onError: (error: any) => {
                toast.error(error?.message || "Failed to send test message");
            }
        });
    };

    return (
        <div className={cn(
            "p-6 rounded-xl border backdrop-blur-xl h-full transition-all",
            isDarkMode
                ? "bg-white/[0.02] border-white/10"
                : "bg-white border-slate-200",
            !isActive && "opacity-75"
        )}>
            <div className="flex items-center space-x-3 mb-6">
                <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    isDarkMode ? "bg-blue-500/20" : "bg-blue-100",
                    !isActive && "grayscale"
                )}>
                    <Send className={cn("text-blue-500", !isActive && "text-slate-500")} size={20} />
                </div>
                <div>
                    <h3 className={cn("font-semibold", isDarkMode ? "text-white" : "text-slate-900")}>
                        Send Test Message
                    </h3>
                    <p className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                        Verify your integration by sending a message
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <Input
                    isDarkMode={isDarkMode}
                    label="Recipient Phone Number"
                    icon={Phone}
                    placeholder="e.g. 919876543210"
                    value={testPhoneNumber}
                    onChange={(e) => setTestPhoneNumber(e.target.value)}
                    disabled={!isActive}
                />

                {!isActive && (
                    <div className={cn(
                        "text-xs p-3 rounded-lg flex items-center justify-center text-center",
                        isDarkMode ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-600"
                    )}>
                        Activate connection to send test messages
                    </div>
                )}

                <div className="pt-2">
                    <button
                        onClick={handleSendTestMessage}
                        disabled={isTestLoading || !testPhoneNumber || !isActive}
                        className={cn(
                            "w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all",
                            isActive
                                ? (isDarkMode
                                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20"
                                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20")
                                : (isDarkMode
                                    ? "bg-white/5 text-white/40 cursor-not-allowed"
                                    : "bg-slate-100 text-slate-400 cursor-not-allowed")
                        )}
                    >
                        {isTestLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        <span>Send Test Message</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
