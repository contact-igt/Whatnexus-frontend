
import { cn } from "@/lib/utils";

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    isDarkMode?: boolean;
    delay?: number;
    onDragEnter?: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragLeave?: (e: React.DragEvent<HTMLDivElement>) => void;
    onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
}

export const GlassCard = ({
    children,
    className = "",
    isDarkMode = true,
    delay = 0,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop
}: GlassCardProps) => (
    <div
        className={cn(
            "backdrop-blur-xl border transition-all duration-700 rounded-3xl overflow-hidden shadow-lg animate-in fade-in slide-in-from-bottom-4",
            isDarkMode
                ? 'bg-[#151518]/60 border-white/5 shadow-black/40 hover:border-white/10'
                : 'bg-white/70 border-slate-200 shadow-slate-200/50 hover:border-emerald-500/20',
            className
        )}
        style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
    >
        {children}
    </div>
);
