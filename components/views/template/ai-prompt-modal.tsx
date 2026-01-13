"use client";

import { cn } from "@/lib/utils";
import { Sparkles, X, Wand2, Lightbulb, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Textarea } from "@/components/ui/textarea";

interface AIPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (prompt: string) => void;
    isDarkMode: boolean;
}

export const AIPromptModal = ({
    isOpen,
    onClose,
    onGenerate,
    isDarkMode
}: AIPromptModalProps) => {
    const [mounted, setMounted] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setPrompt(""); // Reset prompt when opening
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleGenerate = () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        // Simulate loading for better UX
        setTimeout(() => {
            setIsGenerating(false);
            onGenerate(prompt);
            onClose();
        }, 1500);
    };

    if (!mounted || !isOpen) return null;

    const suggestions = [
        "Appointment reminder for dental checkup",
        "Holiday discount offer for 20% off",
        "Feedback request after consultation",
        "Payment confirmation message"
    ];

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div
                className={cn(
                    "relative w-full max-w-2xl rounded-2xl shadow-2xl border animate-in zoom-in-95 duration-200",
                    isDarkMode
                        ? 'bg-[#1c1c21] border-white/10'
                        : 'bg-white border-slate-200'
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                            <Wand2 size={20} />
                        </div>
                        <div>
                            <h2 className={cn("text-lg font-semibold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                Generate with AI
                            </h2>
                            <p className={cn("text-xs", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                Describe your template and let AI create it for you
                            </p>
                        </div>
                    </div>
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
                <div className="p-8 space-y-6">
                    <div className="space-y-3">
                        <label className={cn("text-sm font-medium flex items-center gap-2", isDarkMode ? 'text-white' : 'text-slate-800')}>
                            <MessageSquare size={16} className="text-purple-500" />
                            What kind of message do you need?
                        </label>
                        <Textarea
                            isDarkMode={isDarkMode}
                            placeholder="e.g. Create a friendly reminder for patients to bring their insurance card for tomorrow's appointment..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={4}
                            className={cn(
                                "text-base resize-none",
                                isDarkMode ? "bg-black/20" : "bg-slate-50"
                            )}
                        />
                    </div>

                    {/* Suggestions */}
                    <div className="space-y-3">
                        <label className={cn("text-xs font-medium uppercase tracking-wider flex items-center gap-2", isDarkMode ? 'text-white/40' : 'text-slate-400')}>
                            <Lightbulb size={12} />
                            Try these examples
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => setPrompt(suggestion)}
                                    className={cn(
                                        "text-xs px-3 py-2 rounded-lg border transition-all duration-200 text-left hover:scale-[1.02]",
                                        isDarkMode
                                            ? "bg-white/5 border-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                    )}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={cn(
                    "p-6 border-t flex justify-end gap-3",
                    isDarkMode ? 'border-white/5' : 'border-slate-100'
                )}>
                    <button
                        onClick={onClose}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                            isDarkMode
                                ? 'bg-white/5 text-white hover:bg-white/10'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        )}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || isGenerating}
                        className={cn(
                            "px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 transition-all duration-200",
                            !prompt.trim() || isGenerating
                                ? "bg-slate-500/50 text-white/50 cursor-not-allowed"
                                : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02]"
                        )}
                    >
                        {isGenerating ? (
                            <>
                                <Sparkles size={16} className="animate-spin" />
                                <span>Generating...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles size={16} />
                                <span>Generate Template</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
