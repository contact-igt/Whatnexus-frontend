"use client";

import { useState, useEffect } from "react";
import { X, Send, Variable } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { ProcessedTemplate } from "@/components/campaign/template-selection-modal";

interface TemplateVariableModalProps {
    isOpen: boolean;
    onClose: () => void;
    template: ProcessedTemplate | null;
    onSend: (components: any[]) => void;
    isDarkMode: boolean;
    isPending: boolean;
}

export const TemplateVariableModal = ({
    isOpen,
    onClose,
    template,
    onSend,
    isDarkMode,
    isPending
}: TemplateVariableModalProps) => {
    const [headerValues, setHeaderValues] = useState<string[]>([]);
    const [bodyValues, setBodyValues] = useState<string[]>([]);

    // Detect variables on template change
    useEffect(() => {
        if (template) {
            // Count header variables
            const headerVars = (template.headerText?.match(/\{\{\d+\}\}/g) || []).length;
            setHeaderValues(new Array(headerVars).fill(""));

            // Count body variables - use variables property if available, otherwise regex
            const bodyVars = template.variables || (template.description?.match(/\{\{\d+\}\}/g) || []).length;
            setBodyValues(new Array(bodyVars).fill(""));
        }
    }, [template]);

    if (!isOpen || !template) return null;

    const handleSubmit = () => {
        const components = [];

        // Construct Header Component Payload
        if (headerValues.length > 0) {
            components.push({
                type: "header",
                parameters: headerValues.map(val => ({
                    type: "text",
                    text: val
                }))
            });
        }

        // Construct Body Component Payload
        if (bodyValues.length > 0) {
            components.push({
                type: "body",
                parameters: bodyValues.map(val => ({
                    type: "text",
                    text: val
                }))
            });
        }

        onSend(components);
        onClose();
    };

    const renderPreview = (text: string, values: string[]) => {
        if (!text) return null;
        let preview = text;
        values.forEach((val, i) => {
            preview = preview.replace(`{{${i + 1}}}`, `[${val || `{{${i + 1}}}`}]`);
        });
        return preview;
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <GlassCard
                isDarkMode={isDarkMode}
                className="w-full max-w-lg flex flex-col overflow-hidden p-0"
            >
                <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <div className="flex items-center space-x-2">
                        <Variable size={20} className="text-emerald-500" />
                        <h2 className={cn("text-lg font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                            Customize Template
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                        <X size={20} className={isDarkMode ? 'text-white/60' : 'text-slate-600'} />
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Header Variables */}
                    {headerValues.length > 0 && (
                        <div className="space-y-4">
                            <h3 className={cn("text-xs font-bold uppercase tracking-wider", isDarkMode ? "text-white/60" : "text-slate-500")}>
                                Header Variables
                            </h3>
                            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono mb-2">
                                {template.headerText}
                            </div>
                            <div className="grid gap-3">
                                {headerValues.map((val, i) => (
                                    <div key={`header-${i}`} className="flex flex-col space-y-1.5">
                                        <label className={cn("text-xs font-medium", isDarkMode ? "text-white/80" : "text-slate-700")}>
                                            Variable {'{{'}{i + 1}{'}}'}
                                        </label>
                                        <input
                                            type="text"
                                            value={val}
                                            onChange={(e) => {
                                                const newValues = [...headerValues];
                                                newValues[i] = e.target.value;
                                                setHeaderValues(newValues);
                                            }}
                                            placeholder={`Enter value for {{${i + 1}}}...`}
                                            className={cn(
                                                "w-full px-3 py-2 rounded-lg border text-sm transition-all focus:ring-2 focus:ring-emerald-500/20 outline-none",
                                                isDarkMode ? "bg-black/20 border-white/10 text-white placeholder:text-white/30" : "bg-white border-slate-200 text-slate-900"
                                            )}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Body Variables */}
                    {bodyValues.length > 0 && (
                        <div className="space-y-4">
                            <h3 className={cn("text-xs font-bold uppercase tracking-wider", isDarkMode ? "text-white/60" : "text-slate-500")}>
                                Body Variables
                            </h3>
                            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono mb-2 whitespace-pre-wrap">
                                {renderPreview(template.description, bodyValues)}
                            </div>
                            <div className="grid gap-3">
                                {bodyValues.map((val, i) => (
                                    <div key={`body-${i}`} className="flex flex-col space-y-1.5">
                                        <label className={cn("text-xs font-medium", isDarkMode ? "text-white/80" : "text-slate-700")}>
                                            Variable {'{{'}{i + 1}{'}}'}
                                        </label>
                                        <input
                                            type="text"
                                            value={val}
                                            onChange={(e) => {
                                                const newValues = [...bodyValues];
                                                newValues[i] = e.target.value;
                                                setBodyValues(newValues);
                                            }}
                                            placeholder={`Enter value for {{${i + 1}}}...`}
                                            className={cn(
                                                "w-full px-3 py-2 rounded-lg border text-sm transition-all focus:ring-2 focus:ring-emerald-500/20 outline-none",
                                                isDarkMode ? "bg-black/20 border-white/10 text-white placeholder:text-white/30" : "bg-white border-slate-200 text-slate-900"
                                            )}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-5 border-t border-white/10 flex justify-end gap-3 bg-white/5">
                    <button
                        onClick={onClose}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                            isDarkMode ? "text-white/60 hover:bg-white/10" : "text-slate-600 hover:bg-slate-100"
                        )}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isPending}
                        className={cn(
                            "flex items-center space-x-2 bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all",
                            isPending && "opacity-50 cursor-not-allowed transform-none"
                        )}
                    >
                        {isPending ? (
                            <span>Sending...</span>
                        ) : (
                            <>
                                <Send size={16} />
                                <span>Send Message</span>
                            </>
                        )}
                    </button>
                </div>
            </GlassCard>
        </div>
    );
};
