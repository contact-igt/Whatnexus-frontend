import React from 'react';
import { X, Brain } from 'lucide-react';
import { GlassCard } from "@/components/ui/glassCard";
import { cn } from "@/lib/utils";

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
    if (!chatSummary) return null;

    return (
        <div className="absolute inset-x-8 top-20 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
            <GlassCard isDarkMode={isDarkMode} className="p-5 border-emerald-500/40 bg-emerald-500/10 shadow-2xl relative rounded-xl">
                <button onClick={() => setChatSummary(null)} className="absolute top-3 right-3 p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white">
                    <X size={14} />
                </button>
                <div className="flex items-center space-x-2 mb-2 text-emerald-500">
                    <Brain size={14} className="animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Neural Chat Brief</span>
                </div>
                <p className={cn("text-xs leading-relaxed font-medium", isDarkMode ? 'text-white/90' : 'text-slate-800')}>
                    {chatSummary}
                </p>
            </GlassCard>
        </div>
    );
};
