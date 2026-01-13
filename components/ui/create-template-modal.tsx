
"use client";

import { cn } from "@/lib/utils";
import { FileText, Sparkles, X, Bot, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface CreateTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStartFromScratch: () => void;
    onUseTemplate: () => void;
    onGenerateAI: () => void;
    isDarkMode: boolean;
}

export const CreateTemplateModal = ({
    isOpen,
    onClose,
    onStartFromScratch,
    onUseTemplate,
    onGenerateAI,
    isDarkMode
}: CreateTemplateModalProps) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div
                className={cn(
                    "relative w-full max-w-4xl rounded-2xl shadow-2xl border animate-in zoom-in-95 duration-200",
                    isDarkMode
                        ? 'bg-[#1c1c21] border-white/10'
                        : 'bg-white border-slate-200'
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h2 className={cn("text-lg font-semibold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                        Create new template
                    </h2>
                    <button
                        onClick={onClose}
                        className={cn(
                            "p-2 rounded-full transition-all duration-200",
                            isDarkMode
                                ? 'text-white/40 hover:bg-white/10 hover:text-white hover:rotate-90'
                                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900 hover:rotate-90'
                        )}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Generate with AI */}
                        <button
                            onClick={onGenerateAI}
                            className={cn(
                                "group relative p-8 rounded-xl border-2 border-dashed transition-all duration-300 hover:scale-105 hover:shadow-lg",
                                isDarkMode
                                    ? "border-white/20 hover:border-purple-500/50 hover:bg-purple-500/5"
                                    : "border-slate-300 hover:border-purple-500 hover:bg-purple-50/50"
                            )}
                        >
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div
                                    className={cn(
                                        "p-4 rounded-full transition-all duration-300",
                                        isDarkMode
                                            ? "bg-white/5 group-hover:bg-purple-500/10"
                                            : "bg-slate-100 group-hover:bg-purple-100"
                                    )}
                                >
                                    <Wand2
                                        size={32}
                                        className={cn(
                                            "transition-colors duration-300",
                                            isDarkMode
                                                ? "text-white/60 group-hover:text-purple-400"
                                                : "text-slate-600 group-hover:text-purple-600"
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <h3
                                        className={cn(
                                            "font-semibold text-base",
                                            isDarkMode ? "text-white" : "text-slate-900"
                                        )}
                                    >
                                        Generate with AI
                                    </h3>
                                    <p
                                        className={cn(
                                            "text-xs leading-relaxed",
                                            isDarkMode ? "text-white/50" : "text-slate-500"
                                        )}
                                    >
                                        Describe what you need and let AI create it
                                    </p>
                                </div>
                            </div>
                        </button>

                        {/* Start from scratch */}
                        <button
                            onClick={onStartFromScratch}
                            className={cn(
                                "group relative p-8 rounded-xl border-2 border-dashed transition-all duration-300 hover:scale-105 hover:shadow-lg",
                                isDarkMode
                                    ? "border-white/20 hover:border-emerald-500/50 hover:bg-emerald-500/5"
                                    : "border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50"
                            )}
                        >
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div
                                    className={cn(
                                        "p-4 rounded-full transition-all duration-300",
                                        isDarkMode
                                            ? "bg-white/5 group-hover:bg-emerald-500/10"
                                            : "bg-slate-100 group-hover:bg-emerald-100"
                                    )}
                                >
                                    <FileText
                                        size={32}
                                        className={cn(
                                            "transition-colors duration-300",
                                            isDarkMode
                                                ? "text-white/60 group-hover:text-emerald-400"
                                                : "text-slate-600 group-hover:text-emerald-600"
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <h3
                                        className={cn(
                                            "font-semibold text-base",
                                            isDarkMode ? "text-white" : "text-slate-900"
                                        )}
                                    >
                                        Start from scratch
                                    </h3>
                                    <p
                                        className={cn(
                                            "text-xs leading-relaxed",
                                            isDarkMode ? "text-white/50" : "text-slate-500"
                                        )}
                                    >
                                        Start from a blank template
                                    </p>
                                </div>
                            </div>
                        </button>

                        {/* Use a template */}
                        <button
                            onClick={onUseTemplate}
                            className={cn(
                                "group relative p-8 rounded-xl border-2 border-dashed transition-all duration-300 hover:scale-105 hover:shadow-lg",
                                isDarkMode
                                    ? "border-white/20 hover:border-blue-500/50 hover:bg-blue-500/5"
                                    : "border-slate-300 hover:border-blue-500 hover:bg-blue-50/50"
                            )}
                        >
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div
                                    className={cn(
                                        "p-4 rounded-full transition-all duration-300",
                                        isDarkMode
                                            ? "bg-white/5 group-hover:bg-blue-500/10"
                                            : "bg-slate-100 group-hover:bg-blue-100"
                                    )}
                                >
                                    <Sparkles
                                        size={32}
                                        className={cn(
                                            "transition-colors duration-300",
                                            isDarkMode
                                                ? "text-white/60 group-hover:text-blue-400"
                                                : "text-slate-600 group-hover:text-blue-600"
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <h3
                                        className={cn(
                                            "font-semibold text-base",
                                            isDarkMode ? "text-white" : "text-slate-900"
                                        )}
                                    >
                                        Use a template
                                    </h3>
                                    <p
                                        className={cn(
                                            "text-xs leading-relaxed",
                                            isDarkMode ? "text-white/50" : "text-slate-500"
                                        )}
                                    >
                                        Use one of our pre-defined templates and edit them
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
