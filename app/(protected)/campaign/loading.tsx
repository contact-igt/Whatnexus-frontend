import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

export default function CampaignLoading() {
    const isDarkMode = true; // Default to dark mode for skeleton

    return (
        <div className="h-full overflow-y-auto p-10 space-y-8 max-w-[1600px] mx-auto no-scrollbar pb-32">
            {/* Header Skeleton */}
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-emerald-500/20 rounded animate-pulse" />
                        <div className="w-32 h-3 bg-white/10 rounded animate-pulse" />
                    </div>
                    <div className="w-48 h-10 bg-white/10 rounded animate-pulse" />
                </div>
                <div className="w-32 h-12 bg-emerald-600/20 rounded-xl animate-pulse" />
            </div>

            {/* Search Bar Skeleton */}
            <div className="flex gap-4">
                <div className="flex-1 h-12 bg-white/5 border border-white/10 rounded-xl animate-pulse" />
                <div className="w-32 h-12 bg-white/5 border border-white/10 rounded-xl animate-pulse" />
            </div>

            {/* Tabs Skeleton */}
            <div className="flex gap-2 border-b border-white/5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="w-24 h-10 bg-white/5 rounded-t animate-pulse" />
                ))}
            </div>

            {/* Table Skeleton */}
            <GlassCard isDarkMode={isDarkMode} className="p-0 overflow-hidden">
                <div className="p-6 space-y-4">
                    {/* Table Header */}
                    <div className="grid grid-cols-9 gap-4 pb-4 border-b border-white/5">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                            <div key={i} className="h-4 bg-white/10 rounded animate-pulse" />
                        ))}
                    </div>

                    {/* Table Rows */}
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
                        <div key={row} className="grid grid-cols-9 gap-4 py-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((col) => (
                                <div
                                    key={col}
                                    className={cn(
                                        "h-4 bg-white/5 rounded animate-pulse",
                                        col === 1 && "bg-white/10" // Highlight first column
                                    )}
                                    style={{
                                        animationDelay: `${(row * 50) + (col * 20)}ms`
                                    }}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>
    );
}
