"use client";

import { useState } from 'react';
import { Send, Loader2, Phone } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { useTestWhatsAppConfigQuery } from '@/hooks/useWhatsappConfigQuery';

interface TestMessageCardProps {
    isDarkMode: boolean;
    isActive: boolean;
    whatsappNumber: string;
}

interface TemplateVariable {
    type: 'header' | 'body' | 'button';
    index: number; // For body {{1}}, {{2}} etc.
    value: string;
}

import { TemplateSelectionModal, ProcessedTemplate } from '@/components/campaign/template-selection-modal';
import { X, FileText, MessageSquare } from 'lucide-react';

export const TestMessageCard = ({ isDarkMode, isActive, whatsappNumber }: TestMessageCardProps) => {
    const [testPhoneNumber, setTestPhoneNumber] = useState('');
    const [messageType, setMessageType] = useState<'normal' | 'template'>('normal');
    const [messageText, setMessageText] = useState('');
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<ProcessedTemplate | null>(null);
    const [headerValues, setHeaderValues] = useState<string[]>([]);
    const [bodyValues, setBodyValues] = useState<string[]>([]);

    const { mutate: testWhatsConfigMutate, isPending: isTestLoading } = useTestWhatsAppConfigQuery();

    const handleTemplateSelect = (template: ProcessedTemplate) => {
        setSelectedTemplate(template);
        // Reset values based on template params count
        // For body: regex to find max {{n}} or use template.variables count if reliable
        // Utilizing template.variableArray or basic count
        setHeaderValues([]); // Initialize if header params exist
        setBodyValues(new Array(template.variables).fill(''));
    };

    const handleSendTestMessage = () => {
        if (!testPhoneNumber) {
            toast.error("Please enter a phone number");
            return;
        }

        if (testPhoneNumber.length < 10) {
            toast.error("Please enter a valid phone number");
            return;
        }

        if (messageType === 'normal') {
            if (!messageText) {
                toast.error("Please enter a message");
                return;
            }
            // Send Normal Text
            testWhatsConfigMutate({
                to: testPhoneNumber,
                type: "text",
                text: { body: messageText }
            }, {
                onSuccess: () => toast.success(`Message sent to ${testPhoneNumber}`),
                onError: (error: any) => toast.error(error?.message || "Failed to send message")
            });
        } else {
            // Send Template
            if (!selectedTemplate) {
                toast.error("Please select a template");
                return;
            }

            // Construct components payload
            const components = [];

            // Header params (Not implemented in UI yet based on prompt, but good to have structure)
            // Body params
            if (bodyValues.length > 0) {
                components.push({
                    type: "body",
                    parameters: bodyValues.map(val => ({
                        type: "text",
                        text: val || "-" // Fallback to dash if empty to prevent api error
                    }))
                });
            }

            testWhatsConfigMutate({
                to: testPhoneNumber,
                type: "template",
                template: {
                    name: selectedTemplate.name,
                    language: { code: "en_US" }, // Defaulting, should properly get from template if available
                    components: components
                }
            }, {
                onSuccess: () => toast.success(`Template sent to ${testPhoneNumber}`),
                onError: (error: any) => toast.error(error?.message || "Failed to send template")
            });
        }
    };

    return (
        <div className={cn(
            "p-6 rounded-xl border backdrop-blur-xl h-full transition-all flex flex-col",
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

            {/* Mode Toggle */}
            <div className={cn(
                "flex p-1 rounded-lg mb-6",
                isDarkMode ? "bg-white/5" : "bg-slate-100"
            )}>
                <button
                    onClick={() => setMessageType('normal')}
                    className={cn(
                        "flex-1 py-2.5 text-xs font-semibold rounded-md transition-all",
                        messageType === 'normal'
                            ? isDarkMode ? "bg-blue-600 text-white shadow" : "bg-white text-blue-600 shadow"
                            : isDarkMode ? "text-white/60 hover:text-white" : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    Normal Message
                </button>
                <button
                    onClick={() => setMessageType('template')}
                    className={cn(
                        "flex-1 py-2.5 text-xs font-semibold rounded-md transition-all",
                        messageType === 'template'
                            ? isDarkMode ? "bg-blue-600 text-white shadow" : "bg-white text-blue-600 shadow"
                            : isDarkMode ? "text-white/60 hover:text-white" : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    Template Message
                </button>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
                {/* Phone Number Input - Common for both */}
                <Input
                    isDarkMode={isDarkMode}
                    label="Recipient Phone Number"
                    icon={Phone}
                    placeholder="e.g. 919876543210"
                    value={testPhoneNumber}
                    onChange={(e) => setTestPhoneNumber(e.target.value)}
                    disabled={!isActive}
                />

                {messageType === 'normal' ? (
                    <div className="space-y-2">
                        <label className={cn("text-xs font-medium ml-1", isDarkMode ? "text-white/60" : "text-slate-500")}>
                            Message Body
                        </label>
                        <textarea
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder="Type your message here..."
                            className={cn(
                                "w-full h-32 px-3 py-2 rounded-lg text-sm bg-transparent border outline-none resize-none transition-all placeholder:text-muted-foreground",
                                isDarkMode
                                    ? "border-white/10 focus:border-blue-500/50 text-white"
                                    : "border-slate-200 focus:border-blue-500/50 text-slate-900"
                            )}
                            disabled={!isActive}
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Selected Template Display */}
                        {selectedTemplate ? (
                            <div className={cn(
                                "p-3 rounded-xl border relative group",
                                isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                            )}>
                                <button
                                    onClick={() => setSelectedTemplate(null)}
                                    className={cn(
                                        "absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all",
                                        isDarkMode ? "hover:bg-white/10 text-white/60" : "hover:bg-slate-200 text-slate-500"
                                    )}
                                >
                                    <X size={14} />
                                </button>
                                <div className="flex items-start gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                                        isDarkMode ? "bg-emerald-500/20" : "bg-emerald-100"
                                    )}>
                                        <FileText size={18} className="text-emerald-500" />
                                    </div>
                                    <div>
                                        <h4 className={cn("text-sm font-bold", isDarkMode ? "text-white" : "text-slate-900")}>
                                            {selectedTemplate.name}
                                        </h4>
                                        <p className={cn("text-xs mt-0.5 line-clamp-2", isDarkMode ? "text-white/60" : "text-slate-500")}>
                                            {selectedTemplate.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsTemplateModalOpen(true)}
                                disabled={!isActive}
                                className={cn(
                                    "w-full py-8 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all",
                                    isDarkMode
                                        ? "border-white/10 hover:border-blue-500/50 hover:bg-white/5 text-white/40"
                                        : "border-slate-200 hover:border-blue-500/50 hover:bg-slate-50 text-slate-500"
                                )}
                            >
                                <MessageSquare size={24} />
                                <span className="text-sm font-medium">Select a Template</span>
                            </button>
                        )}

                        {/* Variables Input */}
                        {selectedTemplate && selectedTemplate.variables > 0 && (
                            <div className="space-y-3 pt-2">
                                <label className={cn("text-xs font-bold uppercase tracking-wider opacity-60 ml-1", isDarkMode ? "text-white" : "text-slate-900")}>
                                    Body Variables
                                </label>
                                <div className="grid grid-cols-1 gap-2">
                                    {Array.from({ length: selectedTemplate.variables }).map((_, idx) => (
                                        <Input
                                            key={idx}
                                            isDarkMode={isDarkMode}
                                            label={`{{${idx + 1}}} Value`}
                                            placeholder={`Value for {{${idx + 1}}}`}
                                            value={bodyValues[idx] || ''}
                                            onChange={(e) => {
                                                const newValues = [...bodyValues];
                                                newValues[idx] = e.target.value;
                                                setBodyValues(newValues);
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {!isActive && (
                    <div className={cn(
                        "text-xs p-3 rounded-lg flex items-center justify-center text-center",
                        isDarkMode ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-600"
                    )}>
                        Activate connection to send test messages
                    </div>
                )}
            </div>

            <div className="pt-4 mt-auto border-t border-white/5">
                <button
                    onClick={handleSendTestMessage}
                    disabled={isTestLoading || (messageType === 'normal' && !messageText) || (messageType === 'template' && !selectedTemplate) || !isActive}
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
                    <span>{messageType === 'normal' ? 'Send Message' : 'Send Template'}</span>
                </button>
            </div>

            <TemplateSelectionModal
                isOpen={isTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
                onSelect={handleTemplateSelect}
            />
        </div>
    );
};
