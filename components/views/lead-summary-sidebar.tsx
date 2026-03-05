"use client";

import { useState, useEffect } from "react";
import { format, subDays, subMonths, subYears, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval, addMonths, compareAsc } from "date-fns";
import { ChevronLeft, ChevronRight, Brain, Calendar, Loader2, ClipboardList, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSummarizeLeadMutation } from '@/hooks/useLeadIntelligenceQuery';

interface DateRange {
    from: Date | undefined;
    to: Date | undefined;
}

interface LeadSummarySidebarProps {
    isOpen: boolean;
    onClose: () => void;
    lead: any;
    isDarkMode: boolean;
}

export const LeadSummarySidebar = ({ isOpen, onClose, lead, isDarkMode }: LeadSummarySidebarProps) => {
    const summarizeLeadMutation = useSummarizeLeadMutation();
    const [summary, setSummary] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Date Picker State
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedRange, setSelectedRange] = useState<DateRange>({ from: new Date(), to: new Date() }); // Default to today
    const [activePreset, setActivePreset] = useState<string>("Today");
    const [showDatePicker, setShowDatePicker] = useState(false); // Default closed in sidebar to save space

    useEffect(() => {
        if (isOpen && lead) {
            // Reset state on open or lead change
            setSummary(null);
            const today = new Date();
            const initialRange = { from: today, to: today };
            setSelectedRange(initialRange);
            setActivePreset("Today");
            setShowDatePicker(false);
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
        const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
        const days = eachDayOfInterval({ start: startDate, end: endDate });
        const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        return (
            <div className="p-2">
                <div className="flex items-center justify-between mb-2">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className={cn("p-1 rounded-full", isDarkMode ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-600")}>
                        <ChevronLeft size={14} />
                    </button>
                    <span className={cn("font-semibold text-xs", isDarkMode ? "text-white" : "text-slate-900")}>
                        {format(currentMonth, "MMM yyyy")}
                    </span>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className={cn("p-1 rounded-full", isDarkMode ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-600")}>
                        <ChevronRight size={14} />
                    </button>
                </div>
                <div className="grid grid-cols-7 mb-1">
                    {weekDays.map((day) => (
                        <div key={day} className={cn("text-center text-[10px] font-medium py-1", isDarkMode ? "text-slate-400" : "text-slate-500")}>{day}</div>
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
                                className={cn("h-6 w-6 mx-auto flex items-center justify-center text-[10px] transition-all relative", bgClass, textClass, !isCurrentMonth && "pointer-events-none")}
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
        <div className={cn(
            "w-[400px] border-l flex flex-col h-full bg-background transition-all duration-300 ease-in-out shrink-0",
            isDarkMode ? 'border-white/10 bg-[#09090b]' : 'border-slate-200 bg-white'
        )}>
            {/* Header */}
            <div className={cn("flex items-center justify-between p-4 border-b", isDarkMode ? 'border-white/5' : 'border-slate-100')}>
                <div>
                    <h2 className={cn("text-lg font-bold tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>
                        Neural Summary
                    </h2>
                    <p className={cn("text-xs mt-0.5 font-medium", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                        Insights for {lead?.name}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className={cn(
                        "p-1.5 rounded-lg transition-all",
                        isDarkMode
                            ? 'text-white/40 hover:bg-white/10 hover:text-white'
                            : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'
                    )}
                >
                    <X size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {/* Date Picker Toggle */}
                <div className={cn("rounded-xl border p-3 transition-all", isDarkMode ? "border-white/5 bg-white/5" : "border-slate-100 bg-slate-50")}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                            <Calendar size={14} className={isDarkMode ? "text-emerald-400" : "text-emerald-600"} />
                            <span className={cn("text-xs font-medium uppercase tracking-wide", isDarkMode ? "text-white/60" : "text-slate-500")}>
                                Analysis Period
                            </span>
                        </div>
                        <button
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            className={cn("text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md border transition-all",
                                showDatePicker
                                    ? (isDarkMode ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-emerald-50 text-emerald-600 border-emerald-200")
                                    : (isDarkMode ? "text-white/40 hover:text-white border-white/5 hover:bg-white/5" : "text-slate-500 hover:text-slate-800 border-slate-200 hover:bg-slate-100")
                            )}
                        >
                            {showDatePicker ? "Hide" : "Change"}
                        </button>
                    </div>
                    <div className={cn("text-sm font-semibold", isDarkMode ? "text-white" : "text-slate-900")}>
                        {selectedRange.from ? format(selectedRange.from, "MMM d, yyyy") : "Select"}
                        {selectedRange.from && selectedRange.to && !isSameDay(selectedRange.from, selectedRange.to) && ` - ${format(selectedRange.to, "MMM d, yyyy")}`}
                    </div>

                    {/* Collapsible Date Picker */}
                    {showDatePicker && (
                        <div className="mt-3 pt-3 border-t border-dashed border-gray-200 dark:border-gray-800 animate-in slide-in-from-top-2">
                            <div className="flex flex-col gap-2">
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    {presets.map((preset) => (
                                        <button
                                            key={preset.label}
                                            onClick={() => handlePresetClick(preset)}
                                            className={cn(
                                                "text-center px-2 py-1.5 rounded-md text-[10px] font-medium transition-all border",
                                                activePreset === preset.label
                                                    ? isDarkMode ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                    : isDarkMode ? "border-white/5 text-slate-400 hover:text-white hover:bg-white/5" : "border-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                            )}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                                {renderCalendar()}
                                <button
                                    onClick={handleApplyDate}
                                    disabled={!selectedRange.from}
                                    className={cn(
                                        "w-full py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all shadow-sm mt-2",
                                        !selectedRange.from
                                            ? "opacity-50 cursor-not-allowed bg-slate-500 text-white"
                                            : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20"
                                    )}
                                >
                                    Apply Range
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Summary Content */}
                <div className="relative min-h-[300px]">
                    {isLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 pt-10">
                            <Loader2 size={24} className="animate-spin text-emerald-500" />
                            <span className={cn("text-xs font-medium animate-pulse", isDarkMode ? "text-white/50" : "text-slate-500")}>
                                Generating insights...
                            </span>
                        </div>
                    ) : summary ? (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-4">
                            <div className={cn("p-4 rounded-xl border leading-relaxed text-sm", isDarkMode ? "bg-white/5 border-white/5 text-white/90" : "bg-slate-50 border-slate-100 text-slate-800")}>
                                {summary}
                            </div>

                            <button
                                onClick={() => { navigator.clipboard.writeText(summary); }}
                                className={cn(
                                    "w-full py-2 flex items-center justify-center space-x-2 rounded-lg border transition-all text-xs font-medium",
                                    isDarkMode
                                        ? "border-white/10 hover:bg-white/5 text-white/70 hover:text-white"
                                        : "border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                                )}
                            >
                                <ClipboardList size={14} />
                                <span>Copy Summary</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 space-y-3 opacity-50">
                            <Brain size={40} className={isDarkMode ? "text-white/20" : "text-slate-300"} />
                            <p className={cn("text-sm font-medium text-center max-w-[200px]", isDarkMode ? "text-white/40" : "text-slate-400")}>
                                Select a date range to generate intelligence summary.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
