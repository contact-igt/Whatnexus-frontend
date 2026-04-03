import React from 'react';
import { X, Brain, Copy, Check } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ChatSummaryOverlayProps {
    isDarkMode: boolean;
    chatSummary: string | null;
    setChatSummary: (summary: string | null) => void;
}

export const ChatSummaryOverlay: React.FC<ChatSummaryOverlayProps> = ({
    isDarkMode,
    chatSummary,
    setChatSummary
}) => {
    const [copied, setCopied] = React.useState(false);

    if (!chatSummary) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(chatSummary);
        setCopied(true);
        toast.success("Summary copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="absolute inset-x-6 top-16 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
            <div
                className={cn(
                    "relative rounded-2xl p-5 shadow-2xl border overflow-hidden",
                    isDarkMode
                        ? "bg-[#18181b] border-emerald-500/25 shadow-black/60"
                        : "bg-white border-emerald-200 shadow-emerald-200/40"
                )}
            >
                {/* Top accent bar */}
                <div className={cn(
                    "absolute top-0 left-0 right-0 h-[2px]",
                    isDarkMode
                        ? "bg-gradient-to-r from-emerald-500/50 via-emerald-400 to-emerald-500/50"
                        : "bg-gradient-to-r from-emerald-300 via-emerald-500 to-emerald-300"
                )} />

                {/* Header row */}
                <div className="flex items-center justify-between mb-3">
                    <div className={cn(
                        "flex items-center gap-2",
                        isDarkMode ? "text-emerald-400" : "text-emerald-600"
                    )}>
                        <div className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center",
                            isDarkMode ? "bg-emerald-500/15" : "bg-emerald-50"
                        )}>
                            <Brain size={15} className="animate-pulse" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider">Neural Chat Brief</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleCopy}
                            className={cn(
                                "p-1.5 rounded-lg transition-all",
                                isDarkMode
                                    ? "hover:bg-white/10 text-zinc-500 hover:text-emerald-400"
                                    : "hover:bg-emerald-50 text-slate-400 hover:text-emerald-600"
                            )}
                            title="Copy summary"
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                        <button
                            onClick={() => setChatSummary(null)}
                            className={cn(
                                "p-1.5 rounded-lg transition-all",
                                isDarkMode
                                    ? "hover:bg-white/10 text-zinc-500 hover:text-zinc-200"
                                    : "hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                            )}
                            title="Close"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>

                {/* Summary content */}
                <div className={cn(
                    "text-[13px] leading-relaxed font-medium whitespace-pre-line",
                    isDarkMode ? "text-zinc-300" : "text-slate-700"
                )}>
                    {chatSummary}
                </div>
            </div>
        </div>
    );
};
