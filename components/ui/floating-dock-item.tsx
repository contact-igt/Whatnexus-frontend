
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingDockItemProps {
    icon: LucideIcon;
    active: boolean;
    onClick: () => void;
    label: string;
    isDarkMode?: boolean;
    urgent?: boolean;
    isExpanded?: boolean;
}

export const FloatingDockItem = ({ icon: Icon, active, onClick, label, isDarkMode = true, urgent = false, isExpanded = false }: FloatingDockItemProps) => (
    <button
        onClick={onClick}
        className={cn(
            "relative rounded-2xl cursor-pointer transition-all duration-300 group flex items-center gap-3 overflow-hidden",
            isExpanded ? "px-4 py-6 w-full justify-start" : "p-6 justify-center",
            active
                ? (isDarkMode ? 'text-white bg-white/10 scale-105 shadow-lg' : 'text-emerald-600 bg-emerald-50 shadow-md scale-105')
                : (isDarkMode ? 'text-white/40 hover:text-white/70 hover:bg-white/5' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100')
        )}
    >
        <Icon size={20} strokeWidth={active ? 2.5 : 1.5} className="shrink-0" />

        {/* Inline label when expanded */}
        <span className={cn(
            "font-semibold text-sm whitespace-nowrap transition-all duration-300",
            isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 absolute"
        )}>
            {label}
        </span>

        {/* Tooltip label when collapsed */}
        {!isExpanded && (
            <span className={cn(
                "absolute left-20 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-[100] border shadow-2xl translate-x-4 group-hover:translate-x-0",
                isDarkMode ? 'bg-white text-black border-white/10' : 'bg-slate-900 text-white border-slate-700'
            )}>
                {label}
            </span>
        )}

        {urgent && <div className={`absolute ${isExpanded ? "top-3.5" : "top-2"} right-3.5 w-2 min-w-2 h-2 bg-rose-500 rounded-full animate-pulse border-2 border-transparent`} />}

        {active && (
            <div className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full shadow-lg",
                isDarkMode ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-emerald-600 shadow-emerald-600/50'
            )} />
        )}
    </button>
);
