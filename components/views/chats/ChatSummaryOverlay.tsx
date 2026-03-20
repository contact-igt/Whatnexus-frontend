import React from 'react';
import { X, Brain, Copy, Check } from 'lucide-react';
import { GlassCard } from "@/components/ui/glassCard";
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
        <div className="absolute inset-x-8 top-20 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
            <GlassCard isDarkMode={isDarkMode} className="p-5 border-emerald-500/40 bg-emerald-500/10 shadow-2xl relative rounded-xl overflow-hidden group">
                <div className="absolute top-3 right-3 flex items-center space-x-1">
                    <button 
                        onClick={handleCopy} 
                        className={cn(
                            "p-1.5 rounded-lg transition-all",
                            isDarkMode 
                                ? "hover:bg-white/10 text-slate-400 hover:text-emerald-400" 
                                : "hover:bg-emerald-500/10 text-slate-500 hover:text-emerald-600"
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
                                ? "hover:bg-white/10 text-slate-400 hover:text-white" 
                                : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                        )}
                        title="Close"
                    >
                        <X size={14} />
                    </button>
                </div>
                <div className="flex items-center space-x-2 mb-2 text-emerald-500">
                    <Brain size={14} className="animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Neural Chat Brief</span>
                </div>
                <p className={cn("text-xs leading-relaxed font-medium pr-10", isDarkMode ? 'text-white/90' : 'text-slate-800')}>
                    {chatSummary}
                </p>
                <div className="absolute bottom-0 left-0 h-1 bg-emerald-500/20 group-hover:bg-emerald-500/40 transition-all w-full" />
            </GlassCard>
        </div>
    );
};
