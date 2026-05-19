"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { useRescheduleFollowUpMutation } from "@/hooks/useFollowUpHubQuery";

interface RescheduleDrawerProps {
    isOpen:             boolean;
    onClose:            () => void;
    scheduledMsgId:     number | null;
    currentScheduledAt: string | null;
    isDarkMode:         boolean;
}

export const RescheduleDrawer = ({
    isOpen,
    onClose,
    scheduledMsgId,
    currentScheduledAt,
    isDarkMode,
}: RescheduleDrawerProps) => {
    const [newDate, setNewDate] = useState("");
    const [newTime, setNewTime] = useState("");
    const [error, setError]     = useState("");

    const today = new Date().toISOString().slice(0, 10);

    const { mutate, isPending } = useRescheduleFollowUpMutation();

    const formattedCurrent = currentScheduledAt
        ? new Date(currentScheduledAt).toLocaleString("en-IN", {
            day:    "2-digit",
            month:  "short",
            year:   "numeric",
            hour:   "2-digit",
            minute: "2-digit",
          })
        : "—";

    const handleSubmit = () => {
        setError("");
        if (!newDate) { setError("Please select a date"); return; }
        if (!newTime) { setError("Please select a time"); return; }
        if (new Date(`${newDate}T${newTime}`) <= new Date()) {
            setError("Scheduled time must be in the future");
            return;
        }
        if (!scheduledMsgId) return;
        const scheduled_at = `${newDate}T${newTime}:00+05:30`;
        mutate({ id: scheduledMsgId, scheduled_at }, { onSuccess: onClose });
    };

    const labelCls = cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? "text-white/70" : "text-slate-700");

    const inputCls = cn(
        "w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50",
        isDarkMode
            ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
            : "bg-white border-slate-200 text-slate-900 hover:bg-slate-50",
    );

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title="Reschedule Follow-up"
            description="Pick a new date and time to send this follow-up message."
            isDarkMode={isDarkMode}
            className={cn(
                "max-w-xl font-sans [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']",
                isDarkMode ? "bg-black" : "bg-white",
            )}
            footer={
                <div className="flex items-center justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isPending}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-sm font-semibold transition-all border",
                            isDarkMode
                                ? "border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
                                : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                        )}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isPending}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2",
                            isDarkMode
                                ? "bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
                                : "bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50",
                        )}
                    >
                        {isPending && (
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                        )}
                        <span>{isPending ? "Rescheduling..." : "Reschedule"}</span>
                    </button>
                </div>
            }
        >
            <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2">

                {/* Current scheduled time */}
                <div className={cn(
                    "flex items-start gap-3 px-4 py-3 rounded-xl border",
                    isDarkMode ? "border-white/8 bg-white/3" : "border-slate-200 bg-slate-50",
                )}>
                    <CalendarClock className={cn("w-4 h-4 mt-0.5 flex-shrink-0", isDarkMode ? "text-slate-400" : "text-slate-500")} />
                    <div>
                        <p className={cn("text-xs font-semibold", isDarkMode ? "text-white/50" : "text-slate-500")}>
                            Currently scheduled for
                        </p>
                        <p className={cn("text-sm font-medium mt-0.5", isDarkMode ? "text-white" : "text-slate-900")}>
                            {formattedCurrent}
                        </p>
                    </div>
                </div>

                {/* New date + time */}
                <div>
                    <h3 className={cn("text-sm font-semibold mb-4", isDarkMode ? "text-white" : "text-slate-900")}>
                        New Schedule
                    </h3>
                    <div className="space-y-4">
                        {/* Date */}
                        <div>
                            <label className={labelCls}>
                                New Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={newDate}
                                min={today}
                                style={{ colorScheme: isDarkMode ? "dark" : "light" }}
                                onChange={(e) => { setNewDate(e.target.value); setError(""); }}
                                className={inputCls}
                            />
                        </div>

                        {/* Time */}
                        <div>
                            <label className={labelCls}>
                                New Time <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                value={newTime}
                                style={{ colorScheme: isDarkMode ? "dark" : "light" }}
                                onChange={(e) => { setNewTime(e.target.value); setError(""); }}
                                className={inputCls}
                            />
                            <p className={cn("text-xs mt-1.5 ml-1", isDarkMode ? "text-white/35" : "text-slate-400")}>
                                Time is in IST (Asia/Kolkata)
                            </p>
                        </div>

                        {/* Inline validation error */}
                        {error && (
                            <p className="text-xs text-red-500 ml-1">{error}</p>
                        )}
                    </div>
                </div>

            </div>
        </Drawer>
    );
};
