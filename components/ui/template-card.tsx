
"use client";

import { cn } from "@/lib/utils";
import { FileText, Eye } from "lucide-react";

interface TemplateCardProps {
    name: string;
    description: string;
    category: string;
    type: string;
    badge?: string;
    badgeColor?: string;
    isDarkMode: boolean;
    onPreview: () => void;
    onSubmit: () => void;
}

export const TemplateCard = ({
    name,
    description,
    category,
    type,
    badge,
    badgeColor = "emerald",
    isDarkMode,
    onPreview,
    onSubmit
}: TemplateCardProps) => {
    const getBadgeColors = () => {
        switch (badgeColor) {
            case "emerald":
                return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case "blue":
                return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case "purple":
                return "bg-purple-500/10 text-purple-500 border-purple-500/20";
            case "orange":
                return "bg-orange-500/10 text-orange-500 border-orange-500/20";
            default:
                return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
        }
    };

    return (
        <div
            className={cn(
                "relative rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group overflow-hidden",
                isDarkMode
                    ? "bg-[#151518]/60 border-white/5 hover:border-white/10"
                    : "bg-white border-slate-200 hover:border-emerald-500/30"
            )}
        >
            {/* Badge */}
            {badge && (
                <div className="absolute top-3 left-3 z-10">
                    <span
                        className={cn(
                            "text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide border",
                            getBadgeColors()
                        )}
                    >
                        {badge}
                    </span>
                </div>
            )}

            {/* Icon/Preview Area */}
            <div
                className={cn(
                    "h-32 flex items-center justify-center border-b",
                    isDarkMode
                        ? "bg-gradient-to-br from-emerald-500/5 to-blue-500/5 border-white/5"
                        : "bg-gradient-to-br from-emerald-50 to-blue-50 border-slate-100"
                )}
            >
                <FileText
                    size={48}
                    className={cn(
                        "transition-all duration-300 group-hover:scale-110",
                        isDarkMode ? "text-emerald-400/40" : "text-emerald-500/40"
                    )}
                />
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                <div className="space-y-1">
                    <h3
                        className={cn(
                            "font-semibold text-sm tracking-tight line-clamp-1",
                            isDarkMode ? "text-white" : "text-slate-900"
                        )}
                    >
                        {name}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span
                            className={cn(
                                "text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wide",
                                isDarkMode
                                    ? "bg-blue-500/10 text-blue-400"
                                    : "bg-blue-100 text-blue-600"
                            )}
                        >
                            {type}
                        </span>
                    </div>
                </div>

                <p
                    className={cn(
                        "text-xs leading-relaxed line-clamp-2",
                        isDarkMode ? "text-white/60" : "text-slate-600"
                    )}
                >
                    {description}
                </p>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                    <button
                        onClick={onPreview}
                        className={cn(
                            "flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5",
                            isDarkMode
                                ? "bg-white/5 text-white/80 hover:bg-white/10 border border-white/10"
                                : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                        )}
                    >
                        <Eye size={14} />
                        Preview
                    </button>
                    <button
                        onClick={onSubmit}
                        className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-500/20"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
};
