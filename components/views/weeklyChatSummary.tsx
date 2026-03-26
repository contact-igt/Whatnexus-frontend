"use client";
import { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, MessageSquare, TrendingUp, Users, Clock, Loader2, RefreshCw } from 'lucide-react';
import { GlassCard } from "@/components/ui/glassCard";
import { cn } from "@/lib/utils";
import { useTheme } from '@/hooks/useTheme';
import { useGetWeeklySummaryQuery } from '@/hooks/useWhatsappDashboardQuery';

interface WeeklySummary {
    weekNumber: number;
    startDate: string;
    endDate: string;
    summary: string;
    totalChats: number;
    newLeads: number;
    responseRate: number;
}

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const WeeklyChatSummary = () => {
    const { isDarkMode } = useTheme();
    const [expandedWeek, setExpandedWeek] = useState<number | null>(1);

    // Fetch weekly summary data from API
    const { data: summaryResponse, isLoading, isError, refetch } = useGetWeeklySummaryQuery();

    // Extract weeks from response: { success, data: { weeks: [...] } }
    const weeklySummaries: WeeklySummary[] = summaryResponse?.data?.weeks || [];

    const toggleWeek = (weekNumber: number) => {
        setExpandedWeek(expandedWeek === weekNumber ? null : weekNumber);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="p-6 space-y-6 animate-in slide-in-from-bottom-8 duration-500">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className={cn(
                            "text-2xl font-bold tracking-tight",
                            isDarkMode ? "text-white" : "text-slate-900"
                        )}>
                            Weekly Chat Summary
                        </h1>
                        <p className={cn(
                            "text-sm font-medium",
                            isDarkMode ? "text-white/60" : "text-slate-600"
                        )}>
                            Loading insights...
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
            </div>
        );
    }

    // Error state
    if (isError) {
        return (
            <div className="p-6 space-y-6 animate-in slide-in-from-bottom-8 duration-500">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className={cn(
                            "text-2xl font-bold tracking-tight",
                            isDarkMode ? "text-white" : "text-slate-900"
                        )}>
                            Weekly Chat Summary
                        </h1>
                    </div>
                </div>
                <GlassCard isDarkMode={isDarkMode} className="p-8 text-center">
                    <p className={cn("text-sm mb-4", isDarkMode ? "text-white/60" : "text-slate-600")}>
                        Failed to load weekly summary. Please try again.
                    </p>
                    <button
                        onClick={() => refetch()}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                            isDarkMode
                                ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        )}
                    >
                        <RefreshCw size={16} className="inline mr-2" />
                        Retry
                    </button>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 animate-in slide-in-from-bottom-8 duration-500">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className={cn(
                        "text-2xl font-bold tracking-tight",
                        isDarkMode ? "text-white" : "text-slate-900"
                    )}>
                        Weekly Chat Summary
                    </h1>
                    <p className={cn(
                        "text-sm font-medium",
                        isDarkMode ? "text-white/60" : "text-slate-600"
                    )}>
                        Last 4 weeks of conversation insights
                    </p>
                </div>
                <div className={cn(
                    "px-4 py-2 rounded-xl border flex items-center space-x-2",
                    isDarkMode
                        ? "bg-emerald-500/10 border-emerald-500/20"
                        : "bg-emerald-50 border-emerald-200"
                )}>
                    <Calendar size={16} className="text-emerald-500" />
                    <span className={cn(
                        "text-xs font-bold uppercase tracking-wide",
                        "text-emerald-500"
                    )}>
                        4 Weeks
                    </span>
                </div>
            </div>

            {/* Weekly Summary Cards */}
            <div className="space-y-4">
                {weeklySummaries.length === 0 ? (
                    <GlassCard isDarkMode={isDarkMode} className="p-8 text-center">
                        <p className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                            No weekly data available yet. Start conversations to see insights here.
                        </p>
                    </GlassCard>
                ) : (
                    weeklySummaries.map((week, index) => (
                        <GlassCard
                            key={week.weekNumber}
                            isDarkMode={isDarkMode}
                            className="overflow-hidden transition-all duration-300 hover:scale-[1.01]"
                            delay={index * 100}
                        >
                            {/* Week Header - Always Visible */}
                            <button
                                onClick={() => toggleWeek(week.weekNumber)}
                                className="w-full p-5 flex items-center justify-between transition-all hover:bg-white/5"
                            >
                                <div className="flex items-center space-x-4">
                                    {/* Week Number Badge */}
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm border shadow-lg transition-all",
                                        expandedWeek === week.weekNumber
                                            ? "bg-emerald-500 text-white border-emerald-400 scale-110"
                                            : isDarkMode
                                                ? "bg-white/5 text-white border-white/10"
                                                : "bg-slate-100 text-slate-700 border-slate-200"
                                    )}>
                                        W{week.weekNumber}
                                    </div>

                                    {/* Date Range */}
                                    <div className="text-left">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className={cn(
                                                "text-sm font-bold",
                                                isDarkMode ? "text-white" : "text-slate-900"
                                            )}>
                                                Week {week.weekNumber}
                                            </span>
                                            <span className={cn(
                                                "text-xs px-2 py-0.5 rounded-md font-bold uppercase tracking-wide",
                                                expandedWeek === week.weekNumber
                                                    ? "bg-emerald-500/20 text-emerald-400"
                                                    : isDarkMode
                                                        ? "bg-white/5 text-white/40"
                                                        : "bg-slate-100 text-slate-500"
                                            )}>
                                                {week.weekNumber === 1 ? "Current" : `${week.weekNumber - 1} weeks ago`}
                                            </span>
                                        </div>
                                        <p className={cn(
                                            "text-xs font-medium",
                                            isDarkMode ? "text-white/60" : "text-slate-600"
                                        )}>
                                            {formatDate(week.startDate)} - {formatDate(week.endDate)}
                                        </p>
                                    </div>
                                </div>

                                {/* Stats Preview & Toggle */}
                                <div className="flex items-center space-x-4">
                                    {/* Quick Stats */}
                                    <div className="hidden md:flex items-center space-x-4">
                                        <div className="flex items-center space-x-1.5">
                                            <MessageSquare size={14} className="text-blue-500" />
                                            <span className={cn(
                                                "text-xs font-bold",
                                                isDarkMode ? "text-white/80" : "text-slate-700"
                                            )}>
                                                {week.totalChats}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-1.5">
                                            <Users size={14} className="text-emerald-500" />
                                            <span className={cn(
                                                "text-xs font-bold",
                                                isDarkMode ? "text-white/80" : "text-slate-700"
                                            )}>
                                                {week.newLeads}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-1.5">
                                            <TrendingUp size={14} className="text-purple-500" />
                                            <span className={cn(
                                                "text-xs font-bold",
                                                isDarkMode ? "text-white/80" : "text-slate-700"
                                            )}>
                                                {week.responseRate}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Toggle Icon */}
                                    <div className={cn(
                                        "p-2 rounded-lg transition-all",
                                        expandedWeek === week.weekNumber
                                            ? "bg-emerald-500/10 text-emerald-500"
                                            : isDarkMode
                                                ? "bg-white/5 text-white/40"
                                                : "bg-slate-100 text-slate-500"
                                    )}>
                                        {expandedWeek === week.weekNumber ? (
                                            <ChevronUp size={18} />
                                        ) : (
                                            <ChevronDown size={18} />
                                        )}
                                    </div>
                                </div>
                            </button>

                            {/* Expanded Content */}
                            {expandedWeek === week.weekNumber && (
                                <div className="px-5 pb-5 space-y-4 animate-in slide-in-from-top-2 fade-in duration-300">
                                    {/* Divider */}
                                    <div className={cn(
                                        "h-px",
                                        isDarkMode ? "bg-white/5" : "bg-slate-200"
                                    )} />

                                    {/* Detailed Stats Grid */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className={cn(
                                            "p-4 rounded-xl border",
                                            isDarkMode
                                                ? "bg-blue-500/5 border-blue-500/20"
                                                : "bg-blue-50 border-blue-200"
                                        )}>
                                            <div className="flex items-center space-x-2 mb-2">
                                                <MessageSquare size={16} className="text-blue-500" />
                                                <span className={cn(
                                                    "text-[10px] font-bold uppercase tracking-wide",
                                                    "text-blue-500"
                                                )}>
                                                    Total Chats
                                                </span>
                                            </div>
                                            <p className={cn(
                                                "text-2xl font-bold",
                                                isDarkMode ? "text-white" : "text-slate-900"
                                            )}>
                                                {week.totalChats}
                                            </p>
                                        </div>

                                        <div className={cn(
                                            "p-4 rounded-xl border",
                                            isDarkMode
                                                ? "bg-emerald-500/5 border-emerald-500/20"
                                                : "bg-emerald-50 border-emerald-200"
                                        )}>
                                            <div className="flex items-center space-x-2 mb-2">
                                                <Users size={16} className="text-emerald-500" />
                                                <span className={cn(
                                                    "text-[10px] font-bold uppercase tracking-wide",
                                                    "text-emerald-500"
                                                )}>
                                                    New Leads
                                                </span>
                                            </div>
                                            <p className={cn(
                                                "text-2xl font-bold",
                                                isDarkMode ? "text-white" : "text-slate-900"
                                            )}>
                                                {week.newLeads}
                                            </p>
                                        </div>

                                        <div className={cn(
                                            "p-4 rounded-xl border",
                                            isDarkMode
                                                ? "bg-purple-500/5 border-purple-500/20"
                                                : "bg-purple-50 border-purple-200"
                                        )}>
                                            <div className="flex items-center space-x-2 mb-2">
                                                <TrendingUp size={16} className="text-purple-500" />
                                                <span className={cn(
                                                    "text-[10px] font-bold uppercase tracking-wide",
                                                    "text-purple-500"
                                                )}>
                                                    Response Rate
                                                </span>
                                            </div>
                                            <p className={cn(
                                                "text-2xl font-bold",
                                                isDarkMode ? "text-white" : "text-slate-900"
                                            )}>
                                                {week.responseRate}%
                                            </p>
                                        </div>
                                    </div>

                                    {/* Summary Text */}
                                    <div className={cn(
                                        "p-4 rounded-xl border",
                                        isDarkMode
                                            ? "bg-white/5 border-white/10"
                                            : "bg-slate-50 border-slate-200"
                                    )}>
                                        <div className="flex items-center space-x-2 mb-3">
                                            <Clock size={14} className="text-emerald-500" />
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase tracking-wide",
                                                "text-emerald-500"
                                            )}>
                                                Week Summary
                                            </span>
                                        </div>
                                        <p className={cn(
                                            "text-sm leading-relaxed",
                                            isDarkMode ? "text-white/80" : "text-slate-700"
                                        )}>
                                            {week.summary}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </GlassCard>
                    ))
                )}
            </div>

            {/* Footer Info */}
            <GlassCard isDarkMode={isDarkMode} className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className={cn(
                            "w-2 h-2 rounded-full animate-pulse",
                            "bg-emerald-500"
                        )} />
                        <span className={cn(
                            "text-xs font-medium",
                            isDarkMode ? "text-white/60" : "text-slate-600"
                        )}>
                            Data updates in real-time
                        </span>
                    </div>
                    <button className={cn(
                        "text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-lg border transition-all hover:scale-105",
                        isDarkMode
                            ? "bg-white/5 text-emerald-400 border-white/10 hover:bg-white/10"
                            : "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                    )}>
                        Export Report
                    </button>
                </div>
            </GlassCard>
        </div>
    );
};
