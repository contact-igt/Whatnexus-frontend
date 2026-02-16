"use client";

import { useState } from 'react';
import { Send, Loader2, Phone, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { useSendTestWhatsAppConfigQuery, useTestWhatsAppConfigQuery } from '@/hooks/useWhatsappConfigQuery';

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
    const [errors, setErrors] = useState<{
        phone?: string;
        message?: string;
        variables?: string[];
        template?: string;
    }>({});

    const { mutate: testWhatsConfigMutate, isPending: isTestLoading } = useTestWhatsAppConfigQuery();
    const { mutate: sendTestWhatsConfigMutate, isPending: isSendTestLoading } = useSendTestWhatsAppConfigQuery();

    const handleTemplateSelect = (template: ProcessedTemplate) => {
        setSelectedTemplate(template);
        // Reset values based on template params count
        // For body: regex to find max {{n}} or use template.variables count if reliable
        // Utilizing template.variableArray or basic count
        setHeaderValues([]); // Initialize if header params exist
        setBodyValues(new Array(template.variables).fill(''));
    };

    const resetForm = () => {
        setTestPhoneNumber('');
        setMessageText('');
        setSelectedTemplate(null);
        setHeaderValues([]);
        setBodyValues([]);
        setErrors({});
    };

    const handleSendTestMessage = () => {
        const newErrors: typeof errors = {};
        const phoneRegex = /^\d{10,15}$/;

        // Phone Validation
        if (!testPhoneNumber) {
            newErrors.phone = "Phone number is required";
        } else if (!phoneRegex.test(testPhoneNumber)) {
            newErrors.phone = "Enter a valid numeric phone number (10-15 digits)";
        }

        if (messageType === 'normal') {
            if (!messageText.trim()) {
                newErrors.message = "Message cannot be empty";
            }
        } else {
            if (!selectedTemplate) {
                newErrors.template = "Please select a template";
            } else {
                // Variable Validation
                const variableErrors = bodyValues.map(val => (!val || val.trim() === '') ? "Value required" : "");
                if (variableErrors.some(err => err)) {
                    newErrors.variables = variableErrors;
                }
            }
        }

        if (Object.keys(newErrors).length > 0 || (newErrors.variables && newErrors.variables.some(e => e))) {
            setErrors(newErrors);
            // if (newErrors.template) toast.error(newErrors.template);
            return;
        }

        setErrors({}); // Clear errors if valid

        if (messageType === 'normal') {
            sendTestWhatsConfigMutate({
                phone: testPhoneNumber,
                message_type: "text",
                message: messageText
            }, {
                onSuccess: () => {
                    toast.success(`Message sent to ${testPhoneNumber}`);
                    resetForm();
                },
                onError: (error: any) => {
                    toast.error(error?.message || "Failed to send message");
                }
            });
        } else {
            // Construct components payload
            const components = [];

            // Header params
            if (headerValues.length > 0) {
                components.push({
                    type: "header",
                    parameters: headerValues.map(val => ({
                        type: "text",
                        text: val || "-"
                    }))
                });
            }

            // Body params
            if (bodyValues.length > 0) {
                components.push({
                    type: "body",
                    parameters: bodyValues.map(val => ({
                        type: "text",
                        text: val || "-"
                    }))
                });
            }

            sendTestWhatsConfigMutate({
                phone: testPhoneNumber,
                message_type: "template",
                template_id: selectedTemplate?.id,
                components: components
            }, {
                onSuccess: () => {
                    toast.success(`Template message sent to ${testPhoneNumber}`);
                    resetForm();
                },
                onError: (error: any) => toast.error(error?.message || "Failed to send template message")
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
                    <h3 className={cn("font-semibold text-lg", isDarkMode ? "text-white" : "text-slate-900")}>
                        Send Test Message
                    </h3>
                    <p className={cn("text-sm", isDarkMode ? "text-white/50" : "text-slate-500")}>
                        Verify your integration
                    </p>
                </div>
            </div>

            <div className="flex-1 space-y-6">
                {/* Message Type Toggle */}
                <div className={cn("p-1 rounded-lg flex", isDarkMode ? "bg-white/5" : "bg-slate-100")}>
                    {(['normal', 'template'] as const).map(type => (
                        <button
                            key={type}
                            onClick={() => {
                                setMessageType(type);
                                setErrors({});
                            }}
                            className={cn(
                                "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
                                messageType === type
                                    ? isDarkMode ? "bg-white/10 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                                    : isDarkMode ? "text-white/50 hover:text-white" : "text-slate-500 hover:text-slate-900"
                            )}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Phone Input */}
                <div className="space-y-2">
                    <label className={cn("text-xs font-medium uppercase tracking-wider ml-1", isDarkMode ? "text-white/50" : "text-slate-500")}>
                        Recipient Number
                    </label>
                    <div className="relative mt-2">
                        <Phone className={cn("absolute left-3 top-1/2 -translate-y-1/2 transition-colors",
                            isDarkMode ? "text-white/30" : "text-slate-400")} size={16} />
                        <Input
                            isDarkMode={isDarkMode}
                            placeholder="e.g. 919876543210"
                            className={cn(
                                "pl-10",
                                isDarkMode ? "bg-white/5 border-white/10 placeholder:text-white/30" : "bg-white border-slate-200",
                                errors.phone && "border-red-500 focus-visible:ring-red-500"
                            )}
                            value={testPhoneNumber}
                            onChange={(e) => {
                                setTestPhoneNumber(e.target.value);
                                if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
                            }}
                        />
                    </div>
                    {errors.phone && (
                        <p className="text-red-500 text-xs ml-1 animate-in slide-in-from-top-1">{errors.phone}</p>
                    )}
                </div>

                {messageType === 'normal' ? (
                    <div className="space-y-2">
                        <label className={cn("text-xs font-medium uppercase tracking-wider ml-1", isDarkMode ? "text-white/50" : "text-slate-500")}>
                            Message Body
                        </label>
                        <textarea
                            className={cn(
                                "w-full rounded-xl mt-2 border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 min-h-[120px] resize-none transition-all",
                                isDarkMode
                                    ? "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-blue-500/50"
                                    : "bg-white border-slate-200 text-slate-900 focus:ring-blue-500/50",
                                errors.message && "border-red-500 focus:ring-red-500"
                            )}
                            placeholder="Type your test message here..."
                            value={messageText}
                            onChange={(e) => {
                                setMessageText(e.target.value);
                                if (errors.message) setErrors(prev => ({ ...prev, message: undefined }));
                            }}
                        />
                        {errors.message && (
                            <p className="text-red-500 text-xs ml-1 animate-in slide-in-from-top-1">{errors.message}</p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className={cn("text-xs font-medium uppercase tracking-wider ml-1", isDarkMode ? "text-white/50" : "text-slate-500")}>
                                Template
                            </label>
                            {selectedTemplate ? (
                                <div className={cn("p-3 rounded-xl border relative group mt-2", isDarkMode ? "bg-white/5 border-emerald-500/30" : "bg-emerald-50/50 border-emerald-200")}>
                                    <button
                                        onClick={() => {
                                            setSelectedTemplate(null);
                                            setHeaderValues([]);
                                            setBodyValues([]);
                                            setErrors({});
                                        }}
                                        className={cn(
                                            "absolute right-2 top-2 p-1.5 rounded-full transition-colors",
                                            isDarkMode
                                                ? "bg-black/20 text-white/70 hover:bg-black/40 hover:text-white"
                                                : "bg-slate-200/50 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                                        )}
                                    >
                                        <X size={14} />
                                    </button>
                                    <div className="flex items-center gap-3 pr-8">
                                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", isDarkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-600")}>
                                            <FileText size={18} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className={cn("font-medium truncate", isDarkMode ? "text-white" : "text-slate-900")}>
                                                {selectedTemplate.name}
                                            </p>
                                            <p className={cn("text-xs truncate", isDarkMode ? "text-white/50" : "text-slate-500")}>
                                                {selectedTemplate.category} • {selectedTemplate.variables} variables
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsTemplateModalOpen(true)}
                                    className={cn(
                                        "w-full  mt-2 p-4 rounded-xl border border-dashed flex flex-col items-center justify-center gap-2 transition-all group",
                                        isDarkMode
                                            ? "border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5"
                                            : "border-slate-300 hover:border-emerald-500/50 hover:bg-emerald-50"
                                    )}
                                >
                                    <MessageSquare className={cn("group-hover:scale-110 transition-transform", isDarkMode ? "text-white/30 group-hover:text-emerald-400" : "text-slate-400 group-hover:text-emerald-600")} />
                                    <span className={cn("text-sm font-medium", isDarkMode ? "text-white/50 group-hover:text-emerald-400" : "text-slate-500 group-hover:text-emerald-700")}>Select a template</span>
                                </button>
                            )}
                        </div>
                         {errors.template && (
                        <p className="text-red-500 text-xs ml-1 animate-in slide-in-from-top-1 mb-2">{errors.template}</p>
                    )}
                        {/* Message Preview */}
                        {selectedTemplate && (
                            <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-bottom-3">
                                <label className={cn("text-xs font-medium uppercase tracking-wider ml-1", isDarkMode ? "text-white/50" : "text-slate-500")}>
                                    Message Preview
                                </label>
                                <div className={cn(
                                    "p-4 rounded-xl border mt-2 text-sm leading-relaxed whitespace-pre-wrap",
                                    isDarkMode ? "bg-white/5 border-white/10 text-white/90" : "bg-slate-50 border-slate-200 text-slate-800"
                                )}>
                                    {(() => {
                                        let preview = selectedTemplate.bodyText || selectedTemplate.description || '';
                                        // Replace variables {{1}}, {{2}} with bold values
                                        // We split by {{n}} to highlight the values
                                        const parts = preview.split(/({{\d+}})/g);
                                        return parts.map((part, index) => {
                                            const match = part.match(/{{(\d+)}}/);
                                            if (match) {
                                                const varIndex = parseInt(match[1]) - 1;
                                                const value = bodyValues[varIndex];
                                                return (
                                                    <span key={index} className={cn(
                                                        "font-bold px-1 rounded mx-0.5 transition-colors",
                                                        value
                                                            ? isDarkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"
                                                            : isDarkMode ? "bg-white/10 text-white/50" : "bg-slate-200 text-slate-500"
                                                    )}>
                                                        {value || part}
                                                    </span>
                                                );
                                            }
                                            return <span key={index}>{part}</span>;
                                        });
                                    })()}
                                </div>
                            </div>
                        )}
                        {selectedTemplate && bodyValues.length > 0 && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                                <label className={cn("text-xs font-medium uppercase tracking-wider ml-1", isDarkMode ? "text-white/50" : "text-slate-500")}>
                                    Variables
                                </label>
                                <div className="grid gap-2 mt-2">
                                    {bodyValues.map((val, idx) => (
                                        <div key={idx} className="space-y-1">
                                            <div className="relative mt-1">
                                                <span className={cn("absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono opacity-50 select-none", isDarkMode ? "text-white" : "text-slate-900")}>
                                                    {'{{'}{idx + 1}{'}}'}
                                                </span>
                                                <Input
                                                    isDarkMode={isDarkMode}
                                                    placeholder={`Value for variable ${idx + 1}`}
                                                    className={cn("pl-12", isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200",
                                                        errors.variables?.[idx] && "border-red-500 focus-visible:ring-red-500"
                                                    )}
                                                    value={val}
                                                    onChange={(e) => {
                                                        const newValues = [...bodyValues];
                                                        newValues[idx] = e.target.value;
                                                        setBodyValues(newValues);
                                                        if (errors.variables) {
                                                            const newVarErrors = [...(errors.variables || [])];
                                                            newVarErrors[idx] = "";
                                                            setErrors(prev => ({ ...prev, variables: newVarErrors }));
                                                        }
                                                    }}
                                                />
                                            </div>
                                            {errors.variables?.[idx] && (
                                                <p className="text-red-500 text-[10px] ml-1">{errors.variables[idx]}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>

                            </div>
                        )}
                    </div>
                )}

                {!isActive && (
                    <div className={cn(
                        "text-xs p-3 rounded-lg flex items-center justify-center text-center mt-4",
                        isDarkMode ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-600"
                    )}>
                        Activate connection to send test messages
                    </div>
                )}

                {messageType === 'normal' && (
                    <div className={cn(
                        "p-3 rounded-lg flex gap-3 text-xs leading-relaxed transition-all animate-in fade-in slide-in-from-top-2",
                        isDarkMode ? "bg-blue-500/10 text-blue-400/90 border border-blue-500/20" : "bg-blue-50 text-blue-700 border border-blue-100"
                    )}>
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        <p>
                            <span className="font-bold">Note:</span> Free-form messages can only be sent if the recipient has messaged you within the last 24 hours. Use templates for initiated conversations.
                        </p>
                    </div>
                )}
            </div>

            <div className="pt-4 mt-auto border-t border-white/5">
                <button
                    onClick={handleSendTestMessage}
                    disabled={isTestLoading || !isActive}
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
                onSelect={(template) => {
                    handleTemplateSelect(template);
                    setIsTemplateModalOpen(false);
                }}
            />
        </div >
    );
};
