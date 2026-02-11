"use client";

import { useState, useEffect } from "react";
import { format, subDays, subMonths, subYears, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval, addMonths, compareAsc } from "date-fns";
import { ChevronLeft, ChevronRight, X, Brain, Calendar, Loader2, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/glass-card";
import { useSummarizeLeadMutation } from '@/hooks/useLeadIntelligenceQuery';

interface DateRange {
    from: Date | undefined;
    to: Date | undefined;
}

interface LeadSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead: any;
    isDarkMode: boolean;
}

export const LeadSummaryModal = ({ isOpen, onClose, lead, isDarkMode }: LeadSummaryModalProps) => {
    const summarizeLeadMutation = useSummarizeLeadMutation();
    const [summary, setSummary] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Date Picker State
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedRange, setSelectedRange] = useState<DateRange>({ from: new Date(), to: new Date() }); // Default to today
    const [activePreset, setActivePreset] = useState<string>("Today");
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        if (isOpen && lead) {
            // Reset state on open
            setSummary(null);
            const today = new Date();
            const initialRange = { from: today, to: today };
            setSelectedRange(initialRange);
            setActivePreset("Today");
            fetchSummary(initialRange);
        }
    }, [isOpen, lead]);

    const fetchSummary = async (range: DateRange) => {
        if (!lead || !range.from) return;

        setIsLoading(true);
        setSummary(null);

        const isSingleDay = range.from && range.to && isSameDay(range.from, range.to) || (range.from && !range.to);

        let payload: any = {
            id: lead.lead_id
        };

        if (isSingleDay) {
            payload.date = format(range.from, 'yyyy-MM-dd');
        } else {
            payload.startDate = range.from ? format(range.from, 'yyyy-MM-dd') : undefined;
            payload.endDate = range.to ? format(range.to, 'yyyy-MM-dd') : undefined;
        }

        try {
            const result = await summarizeLeadMutation.mutateAsync(payload);
            setSummary(result?.data?.summary ?? "No summary available for this period.");
        } catch (error) {
            console.error("Failed to summarize lead:", error);
            setSummary("Failed to generate summary. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleApplyDate = () => {
        setShowDatePicker(false);
        fetchSummary(selectedRange);
    };

    // --- Date Picker Logic ---
    const presets = [
        { label: "Today", getValue: () => ({ from: new Date(), to: new Date() }) },
        { label: "Last Week", getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
        { label: "Last Month", getValue: () => ({ from: subMonths(new Date(), 1), to: new Date() }) },
        { label: "Last Year", getValue: () => ({ from: subYears(new Date(), 1), to: new Date() }) },
        { label: "Custom", getValue: () => ({ from: undefined, to: undefined }) },
    ];

    const handlePresetClick = (preset: typeof presets[0]) => {
        setActivePreset(preset.label);
        if (preset.label !== "Custom") {
            setSelectedRange(preset.getValue());
        } else {
            setSelectedRange({ from: undefined, to: undefined });
        }
    };

    const handleDateClick = (date: Date) => {
        setActivePreset("Custom");
        if (!selectedRange.from || (selectedRange.from && selectedRange.to)) {
            setSelectedRange({ from: date, to: undefined });
        } else {
            const fromDate = selectedRange.from;
            if (compareAsc(date, fromDate) < 0) {
                setSelectedRange({ from: date, to: fromDate });
            } else {
                setSelectedRange({ ...selectedRange, to: date });
            }
        }
    };

    const renderCalendar = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);
        const days = eachDayOfInterval({ start: startDate, end: endDate });
        const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

        return (
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className={cn("p-1 rounded-full", isDarkMode ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-600")}>
                        <ChevronLeft size={16} />
                    </button>
                    <span className={cn("font-semibold text-sm", isDarkMode ? "text-white" : "text-slate-900")}>
                        {format(currentMonth, "MMMM yyyy")}
                    </span>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className={cn("p-1 rounded-full", isDarkMode ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-600")}>
                        <ChevronRight size={16} />
                    </button>
                </div>
                <div className="grid grid-cols-7 mb-2">
                    {weekDays.map((day) => (
                        <div key={day} className={cn("text-center text-xs font-medium py-1", isDarkMode ? "text-slate-400" : "text-slate-500")}>{day}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-y-1">
                    {days.map((day) => {
                        const isSelected = selectedRange.from && isSameDay(day, selectedRange.from) || selectedRange.to && isSameDay(day, selectedRange.to);
                        const isInRange = selectedRange.from && selectedRange.to && isWithinInterval(day, { start: selectedRange.from, end: selectedRange.to });
                        const isCurrentMonth = isSameMonth(day, currentMonth);

                        let bgClass = "";
                        let textClass = "";

                        if (isSelected) {
                            bgClass = "bg-emerald-500 text-white rounded-md shadow-md shadow-emerald-500/20";
                            textClass = "text-white font-bold";
                        } else if (isInRange) {
                            bgClass = isDarkMode ? "bg-emerald-500/20" : "bg-emerald-100";
                            textClass = isDarkMode ? "text-emerald-100" : "text-emerald-900";
                        } else {
                            textClass = isCurrentMonth
                                ? (isDarkMode ? "text-white hover:bg-white/10 rounded-md" : "text-slate-900 hover:bg-slate-100 rounded-md")
                                : (isDarkMode ? "text-slate-600" : "text-slate-300");
                        }

                        return (
                            <button
                                key={day.toString()}
                                onClick={() => handleDateClick(day)}
                                className={cn("h-8 w-8 mx-auto flex items-center justify-center text-xs transition-all relative", bgClass, textClass, !isCurrentMonth && "pointer-events-none")}
                            >
                                {format(day, "d")}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg">
                <GlassCard isDarkMode={isDarkMode} className="relative overflow-hidden p-0 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 border-emerald-500/20">

                    {/* Header */}
                    <div className={cn("px-6 py-4 flex items-center justify-between border-b", isDarkMode ? "border-white/5 bg-white/5" : "border-slate-100 bg-slate-50")}>
                        <div className="flex items-center space-x-3">
                            <div className={cn("p-2 rounded-xl", isDarkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-600")}>
                                <Brain size={20} />
                            </div>
                            <div>
                                <h2 className={cn("text-lg font-bold", isDarkMode ? "text-white" : "text-slate-900")}>Neural Lead Summary</h2>
                                <p className={cn("text-xs font-medium", isDarkMode ? "text-white/40" : "text-slate-500")}>
                                    Generating insights for <span className={isDarkMode ? "text-white" : "text-slate-900"}>{lead?.name}</span>
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className={cn("p-2 rounded-lg transition-colors", isDarkMode ? "hover:bg-white/10 text-white/50 hover:text-white" : "hover:bg-slate-200 text-slate-400 hover:text-slate-700")}>
                            <X size={18} />
                        </button>
                    </div>

                    {/* Date Picker Toggle / Display */}
                    <div className={cn("px-6 py-3 flex items-center justify-between border-b transition-colors", isDarkMode ? "border-white/5" : "border-slate-100")}>
                        <div className="flex items-center space-x-2">
                            <Calendar size={14} className={isDarkMode ? "text-emerald-400" : "text-emerald-600"} />
                            <span className={cn("text-xs font-medium uppercase tracking-wide", isDarkMode ? "text-white/60" : "text-slate-500")}>
                                Date Range:
                            </span>
                            <span className={cn("text-sm font-semibold", isDarkMode ? "text-white" : "text-slate-900")}>
                                {selectedRange.from ? format(selectedRange.from, "MMM d, yyyy") : "Select"}
                                {selectedRange.to && selectedRange.to !== selectedRange.from && ` - ${format(selectedRange.to, "MMM d, yyyy")}`}
                            </span>
                        </div>
                        <button
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            className={cn("text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-lg border transition-all",
                                showDatePicker
                                    ? (isDarkMode ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-emerald-50 text-emerald-600 border-emerald-200")
                                    : (isDarkMode ? "text-white/60 hover:text-white border-white/10 hover:bg-white/5" : "text-slate-500 hover:text-slate-800 border-slate-200 hover:bg-slate-50")
                            )}
                        >
                            {showDatePicker ? "Close Picker" : "Change Date"}
                        </button>
                    </div>

                    {/* Collapsible Date Picker Area */}
                    {showDatePicker && (
                        <div className={cn("border-b animate-in slide-in-from-top-2", isDarkMode ? "border-white/5 bg-black/20" : "border-slate-100 bg-slate-50/50")}>
                            <div className="flex flex-col md:flex-row h-[320px]">
                                {/* Sidebar Presets */}
                                <div className={cn("w-full md:w-40 border-b md:border-b-0 md:border-r p-3 flex flex-col gap-1 overflow-y-auto", isDarkMode ? "border-white/5" : "border-slate-100")}>
                                    {presets.map((preset) => (
                                        <button
                                            key={preset.label}
                                            onClick={() => handlePresetClick(preset)}
                                            className={cn(
                                                "w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all",
                                                activePreset === preset.label
                                                    ? isDarkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-50 text-emerald-700"
                                                    : isDarkMode ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                            )}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                    <div className="mt-auto pt-3">
                                        <button
                                            onClick={handleApplyDate}
                                            disabled={!selectedRange.from}
                                            className={cn(
                                                "w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all shadow-lg",
                                                !selectedRange.from
                                                    ? "opacity-50 cursor-not-allowed bg-slate-500 text-white"
                                                    : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20"
                                            )}
                                        >
                                            Apply Range
                                        </button>
                                    </div>
                                </div>
                                {/* Calendar Grid */}
                                <div className="flex-1 overflow-hidden">
                                    {renderCalendar()}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Summary Content Area */}
                    <div className="p-6 min-h-[200px] max-h-[400px] overflow-y-auto relative">
                        {isLoading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
                                <Loader2 size={32} className="animate-spin text-emerald-500" />
                                <span className={cn("text-xs font-medium animate-pulse", isDarkMode ? "text-white/50" : "text-slate-500")}>
                                    Analyzing conversation data...
                                </span>
                            </div>
                        ) : summary ? (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <p className={cn("text-sm leading-relaxed font-medium", isDarkMode ? "text-white/90" : "text-slate-800")}>
                                    {summary}
                                </p>
                                <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(summary); }}
                                        className={cn("text-xs font-medium flex items-center space-x-1.5 transition-colors", isDarkMode ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-600 hover:text-emerald-700")}
                                    >
                                        <ClipboardList size={14} />
                                        <span>Copy to Clipboard</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full space-y-2 opacity-50">
                                <Brain size={48} className={isDarkMode ? "text-white/20" : "text-slate-300"} />
                                <p className={cn("text-sm font-medium", isDarkMode ? "text-white/40" : "text-slate-400")}>No summary generated yet.</p>
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
