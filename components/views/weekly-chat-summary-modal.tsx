"use client";
import { X, Calendar, MessageSquare, TrendingUp, TrendingDown, Clock, ChevronRight, Download, Tag, CheckCircle2, AlertCircle, Smile, Meh, Frown, Zap, Target, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

interface WeeklySummary {
    weekNumber: number;
    startDate: string;
    endDate: string;
    summary: string;
    messageCount: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    avgResponseTime: string;
    keyTopics: string[];
    actionItems: string[];
    engagementScore: number;
    changeFromPrevious: number; // percentage change in messages
}

interface WeeklyChatSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    chatName: string;
    chatPhone: string;
    isDarkMode: boolean;
    weeklySummaries?: WeeklySummary[];
}

// Mock data - you'll replace this with actual API data later
const generateMockSummaries = (chatName: string): WeeklySummary[] => [
    {
        weekNumber: 1,
        startDate: "2026-01-15",
        endDate: "2026-01-21",
        summary: `${chatName} showed high engagement this week with multiple follow-up questions about product features. Expressed strong interest in premium plans and requested detailed pricing information. Conversation quality improved significantly.`,
        messageCount: 12,
        sentiment: 'positive',
        avgResponseTime: '2.5 min',
        keyTopics: ['Pricing', 'Premium Features', 'Integration'],
        actionItems: ['Send pricing proposal', 'Schedule demo call'],
        engagementScore: 92,
        changeFromPrevious: 50
    },
    {
        weekNumber: 2,
        startDate: "2026-01-08",
        endDate: "2026-01-14",
        summary: `Initial contact established. ${chatName} inquired about service availability and integration options. AI successfully handled technical questions and scheduled a demo call. Good rapport building phase.`,
        messageCount: 8,
        sentiment: 'neutral',
        avgResponseTime: '3.2 min',
        keyTopics: ['Service Availability', 'Technical Specs', 'Demo Request'],
        actionItems: ['Confirm demo schedule', 'Share documentation'],
        engagementScore: 78,
        changeFromPrevious: -46.7
    },
    {
        weekNumber: 3,
        startDate: "2026-01-01",
        endDate: "2026-01-07",
        summary: `Follow-up conversations regarding implementation timeline. ${chatName} requested case studies and customer testimonials. Positive sentiment throughout interactions. Multiple touchpoints indicate strong interest.`,
        messageCount: 15,
        sentiment: 'positive',
        avgResponseTime: '1.8 min',
        keyTopics: ['Case Studies', 'Implementation', 'Timeline'],
        actionItems: ['Send case studies', 'Provide implementation guide'],
        engagementScore: 88,
        changeFromPrevious: 200
    },
    {
        weekNumber: 4,
        startDate: "2025-12-25",
        endDate: "2025-12-31",
        summary: `Brief check-in conversation. ${chatName} asked about holiday support availability. Quick response maintained engagement during slower period. Foundation for future conversations established.`,
        messageCount: 5,
        sentiment: 'neutral',
        avgResponseTime: '4.1 min',
        keyTopics: ['Support Hours', 'Holiday Schedule'],
        actionItems: [],
        engagementScore: 65,
        changeFromPrevious: 0
    }
];

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
        case 'positive': return <Smile size={14} className="text-green-500" />;
        case 'negative': return <Frown size={14} className="text-red-500" />;
        default: return <Meh size={14} className="text-yellow-500" />;
    }
};

const getSentimentColor = (sentiment: string, isDarkMode: boolean) => {
    switch (sentiment) {
        case 'positive':
            return isDarkMode ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-green-50 border-green-200 text-green-600';
        case 'negative':
            return isDarkMode ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600';
        default:
            return isDarkMode ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' : 'bg-yellow-50 border-yellow-200 text-yellow-600';
    }
};

const getEngagementColor = (score: number) => {
    if (score >= 85) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-orange-500';
};

export const WeeklyChatSummaryModal = ({
    isOpen,
    onClose,
    chatName,
    chatPhone,
    isDarkMode,
    weeklySummaries
}: WeeklyChatSummaryModalProps) => {
    if (!isOpen) return null;

    const summaries = weeklySummaries || generateMockSummaries(chatName);
    const totalMessages = summaries.reduce((sum, week) => sum + week.messageCount, 0);
    const avgEngagement = Math.round(summaries.reduce((sum, week) => sum + week.engagementScore, 0) / summaries.length);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <GlassCard
                isDarkMode={isDarkMode}
                className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
            >
                {/* Header */}
                <div className={cn(
                    "p-6 border-b sticky top-0 z-10 backdrop-blur-xl",
                    isDarkMode ? "bg-[#151518]/95 border-white/5" : "bg-white/95 border-slate-200"
                )}>
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border shadow-lg",
                                    isDarkMode
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                        : "bg-emerald-50 text-emerald-600 border-emerald-200"
                                )}>
                                    {chatName ? chatName[0].toUpperCase() : "U"}
                                </div>
                                <div>
                                    <h2 className={cn(
                                        "text-xl font-bold tracking-tight",
                                        isDarkMode ? "text-white" : "text-slate-900"
                                    )}>
                                        {chatName || chatPhone}
                                    </h2>
                                    <p className={cn(
                                        "text-xs font-medium mt-0.5",
                                        isDarkMode ? "text-white/60" : "text-slate-600"
                                    )}>
                                        4-Week Conversation Analytics
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className={cn(
                                "p-2 rounded-lg transition-all hover:scale-110",
                                isDarkMode
                                    ? "hover:bg-white/10 text-white/60 hover:text-white"
                                    : "hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Overall Stats Bar */}
                    <div className="grid grid-cols-4 gap-3">
                        <div className={cn(
                            "p-3 rounded-lg border",
                            isDarkMode
                                ? "bg-blue-500/10 border-blue-500/20"
                                : "bg-blue-50 border-blue-200"
                        )}>
                            <div className="flex items-center space-x-2 mb-1">
                                <MessageSquare size={14} className="text-blue-500" />
                                <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-wide text-blue-500"
                                )}>
                                    Total
                                </span>
                            </div>
                            <p className={cn(
                                "text-xl font-bold",
                                isDarkMode ? "text-white" : "text-slate-900"
                            )}>
                                {totalMessages}
                            </p>
                        </div>

                        <div className={cn(
                            "p-3 rounded-lg border",
                            isDarkMode
                                ? "bg-emerald-500/10 border-emerald-500/20"
                                : "bg-emerald-50 border-emerald-200"
                        )}>
                            <div className="flex items-center space-x-2 mb-1">
                                <Zap size={14} className="text-emerald-500" />
                                <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-wide text-emerald-500"
                                )}>
                                    Engagement
                                </span>
                            </div>
                            <p className={cn(
                                "text-xl font-bold",
                                isDarkMode ? "text-white" : "text-slate-900"
                            )}>
                                {avgEngagement}%
                            </p>
                        </div>

                        <div className={cn(
                            "p-3 rounded-lg border",
                            isDarkMode
                                ? "bg-purple-500/10 border-purple-500/20"
                                : "bg-purple-50 border-purple-200"
                        )}>
                            <div className="flex items-center space-x-2 mb-1">
                                <Calendar size={14} className="text-purple-500" />
                                <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-wide text-purple-500"
                                )}>
                                    Weeks
                                </span>
                            </div>
                            <p className={cn(
                                "text-xl font-bold",
                                isDarkMode ? "text-white" : "text-slate-900"
                            )}>
                                4
                            </p>
                        </div>

                        <div className={cn(
                            "p-3 rounded-lg border",
                            isDarkMode
                                ? "bg-orange-500/10 border-orange-500/20"
                                : "bg-orange-50 border-orange-200"
                        )}>
                            <div className="flex items-center space-x-2 mb-1">
                                <Target size={14} className="text-orange-500" />
                                <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-wide text-orange-500"
                                )}>
                                    Actions
                                </span>
                            </div>
                            <p className={cn(
                                "text-xl font-bold",
                                isDarkMode ? "text-white" : "text-slate-900"
                            )}>
                                {summaries.reduce((sum, week) => sum + week.actionItems.length, 0)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Weekly Summaries */}
                <div className="overflow-y-auto max-h-[calc(90vh-240px)] p-6 space-y-4 no-scrollbar">
                    {summaries.map((week, index) => (
                        <div
                            key={week.weekNumber}
                            className={cn(
                                "p-5 rounded-xl border transition-all hover:scale-[1.01] animate-in slide-in-from-bottom-2 fade-in",
                                isDarkMode
                                    ? "bg-white/5 border-white/10 hover:bg-white/10"
                                    : "bg-white border-slate-200 hover:shadow-lg"
                            )}
                            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                        >
                            {/* Week Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm border shadow-lg",
                                        week.weekNumber === 1
                                            ? "bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/30"
                                            : isDarkMode
                                                ? "bg-white/5 text-white/60 border-white/10"
                                                : "bg-slate-100 text-slate-600 border-slate-200"
                                    )}>
                                        W{week.weekNumber}
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className={cn(
                                                "text-sm font-bold",
                                                isDarkMode ? "text-white" : "text-slate-900"
                                            )}>
                                                Week {week.weekNumber}
                                            </span>
                                            {week.weekNumber === 1 && (
                                                <span className="text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wide bg-emerald-500/20 text-emerald-400">
                                                    Current
                                                </span>
                                            )}
                                        </div>
                                        <p className={cn(
                                            "text-xs font-medium",
                                            isDarkMode ? "text-white/40" : "text-slate-500"
                                        )}>
                                            {formatDate(week.startDate)} - {formatDate(week.endDate)}
                                        </p>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="flex items-center space-x-2">
                                    <div className={cn(
                                        "flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border",
                                        getSentimentColor(week.sentiment, isDarkMode)
                                    )}>
                                        {getSentimentIcon(week.sentiment)}
                                        <span className="text-xs font-bold capitalize">
                                            {week.sentiment}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div className={cn(
                                    "p-3 rounded-lg border",
                                    isDarkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
                                )}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={cn(
                                            "text-[10px] font-bold uppercase tracking-wide",
                                            isDarkMode ? "text-white/60" : "text-slate-600"
                                        )}>
                                            Messages
                                        </span>
                                        {week.changeFromPrevious !== 0 && (
                                            <div className={cn(
                                                "flex items-center space-x-0.5",
                                                week.changeFromPrevious > 0 ? "text-green-500" : "text-red-500"
                                            )}>
                                                {week.changeFromPrevious > 0 ? <ArrowUpRight size={10} /> : week.changeFromPrevious < 0 ? <ArrowDownRight size={10} /> : <Minus size={10} />}
                                                <span className="text-[9px] font-bold">
                                                    {Math.abs(week.changeFromPrevious)}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <p className={cn(
                                        "text-lg font-bold",
                                        isDarkMode ? "text-white" : "text-slate-900"
                                    )}>
                                        {week.messageCount}
                                    </p>
                                </div>

                                <div className={cn(
                                    "p-3 rounded-lg border",
                                    isDarkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
                                )}>
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-wide block mb-1",
                                        isDarkMode ? "text-white/60" : "text-slate-600"
                                    )}>
                                        Avg Response
                                    </span>
                                    <p className={cn(
                                        "text-lg font-bold",
                                        isDarkMode ? "text-white" : "text-slate-900"
                                    )}>
                                        {week.avgResponseTime}
                                    </p>
                                </div>

                                <div className={cn(
                                    "p-3 rounded-lg border",
                                    isDarkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
                                )}>
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-wide block mb-1",
                                        isDarkMode ? "text-white/60" : "text-slate-600"
                                    )}>
                                        Engagement
                                    </span>
                                    <p className={cn(
                                        "text-lg font-bold",
                                        getEngagementColor(week.engagementScore)
                                    )}>
                                        {week.engagementScore}%
                                    </p>
                                </div>
                            </div>

                            {/* Summary Content */}
                            <div className={cn(
                                "p-3 rounded-lg border mb-3",
                                isDarkMode
                                    ? "bg-white/5 border-white/5"
                                    : "bg-slate-50 border-slate-100"
                            )}>
                                <div className="flex items-center space-x-2 mb-2">
                                    <Clock size={12} className="text-emerald-500" />
                                    <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-500">
                                        AI Summary
                                    </span>
                                </div>
                                <p className={cn(
                                    "text-sm leading-relaxed",
                                    isDarkMode ? "text-white/80" : "text-slate-700"
                                )}>
                                    {week.summary}
                                </p>
                            </div>

                            {/* Key Topics */}
                            {week.keyTopics.length > 0 && (
                                <div className="mb-3">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Tag size={12} className="text-blue-500" />
                                        <span className={cn(
                                            "text-[10px] font-bold uppercase tracking-wide text-blue-500"
                                        )}>
                                            Key Topics
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {week.keyTopics.map((topic, idx) => (
                                            <span
                                                key={idx}
                                                className={cn(
                                                    "px-2.5 py-1 rounded-lg text-xs font-medium border",
                                                    isDarkMode
                                                        ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                                        : "bg-blue-50 border-blue-200 text-blue-600"
                                                )}
                                            >
                                                {topic}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Items */}
                            {week.actionItems.length > 0 && (
                                <div>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <AlertCircle size={12} className="text-orange-500" />
                                        <span className="text-[10px] font-bold uppercase tracking-wide text-orange-500">
                                            Action Items
                                        </span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {week.actionItems.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className={cn(
                                                    "flex items-start space-x-2 p-2 rounded-lg border",
                                                    isDarkMode
                                                        ? "bg-orange-500/5 border-orange-500/20"
                                                        : "bg-orange-50 border-orange-200"
                                                )}
                                            >
                                                <CheckCircle2 size={14} className="text-orange-500 mt-0.5 shrink-0" />
                                                <span className={cn(
                                                    "text-xs font-medium",
                                                    isDarkMode ? "text-white/80" : "text-slate-700"
                                                )}>
                                                    {item}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Export Week Button */}
                            <button className={cn(
                                "mt-3 w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border text-xs font-bold uppercase tracking-wide transition-all hover:scale-[1.02]",
                                isDarkMode
                                    ? "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            )}>
                                <Download size={12} />
                                <span>Export Week {week.weekNumber}</span>
                            </button>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className={cn(
                    "p-4 border-t",
                    isDarkMode ? "bg-[#151518]/95 border-white/5" : "bg-white/95 border-slate-200"
                )}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className={cn(
                                "text-xs font-medium",
                                isDarkMode ? "text-white/60" : "text-slate-600"
                            )}>
                                AI-powered insights • Updated in real-time
                            </span>
                        </div>
                        <button className={cn(
                            "flex items-center space-x-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wide transition-all hover:scale-105 shadow-lg",
                            "bg-emerald-600 text-white hover:bg-emerald-500"
                        )}>
                            <Download size={14} />
                            <span>Export All</span>
                        </button>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};
