"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, PhoneCall } from "lucide-react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfToday,
  startOfWeek,
  subMonths,
} from "date-fns";
import { Drawer } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import type { Appointment } from "./bookingList";

export interface NoShowSubmitPayload {
  appointment_id: string;
  mode: "follow_up" | "close";
  follow_up_date?: string | null;
  follow_up_type?: "Call" | "WhatsApp" | null;
}

interface NoShowDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: NoShowSubmitPayload) => void;
  appointment: Appointment | null;
  isDarkMode: boolean;
  isSaving?: boolean;
}

export const NoShowDrawer = ({
  isOpen,
  onClose,
  onSave,
  appointment,
  isDarkMode,
  isSaving = false,
}: NoShowDrawerProps) => {
  const [mode, setMode] = useState<"follow_up" | "close">("close");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpType, setFollowUpType] = useState<"" | "Call" | "WhatsApp">("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const datePickerRef = useRef<HTMLDivElement | null>(null);

  const today = startOfToday();

  useEffect(() => {
    if (!isOpen) return;
    setMode("close");
    setFollowUpDate("");
    setFollowUpType("");
    setIsDatePickerOpen(false);
    setCalendarMonth(new Date());
  }, [isOpen, appointment?.appointment_id]);

  useEffect(() => {
    if (!isDatePickerOpen) return;
    const onDocClick = (event: MouseEvent) => {
      if (!datePickerRef.current) return;
      if (!datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [isDatePickerOpen]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(calendarMonth);
    const monthEnd = endOfMonth(calendarMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [calendarMonth]);

  const handleSubmit = () => {
    if (!appointment?.appointment_id) {
      toast.error("Appointment not found.");
      return;
    }

    if (mode === "follow_up") {
      if (!followUpDate) {
        toast.error("Follow-up date is required.");
        return;
      }
      if (!followUpType) {
        toast.error("Follow-up type is required.");
        return;
      }
    }

    onSave({
      appointment_id: appointment.appointment_id,
      mode,
      follow_up_date: mode === "follow_up" ? followUpDate : null,
      follow_up_type: mode === "follow_up" ? (followUpType || null) : null,
    });
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="No Show Handling"
      description="Choose what to do next for this missed appointment."
      isDarkMode={isDarkMode}
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-semibold border transition-all",
              isDarkMode
                ? "border-white/15 text-white/70 hover:bg-white/5"
                : "border-slate-200 text-slate-700 hover:bg-slate-50",
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-semibold transition-all text-white shadow-lg shadow-emerald-500/20",
              isSaving ? "bg-emerald-700/70 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-500",
            )}
          >
            {isSaving ? "Saving..." : "Confirm No Show"}
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <div
          className={cn(
            "p-4 rounded-2xl border transition-all space-y-4",
            isDarkMode ? "bg-white/[0.02] border-white/10" : "bg-slate-50 border-slate-200",
          )}
        >
          <h3 className={cn("text-xs font-bold tracking-widest uppercase", isDarkMode ? "text-emerald-500/80" : "text-emerald-600")}>
            1. Next Action
          </h3>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setMode("follow_up")}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all",
                mode === "follow_up"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : isDarkMode
                    ? "border-white/10 text-white/75 hover:bg-white/5"
                    : "border-slate-200 text-slate-700 hover:bg-slate-100",
              )}
            >
              Follow-up later
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("close");
                setFollowUpDate("");
                setFollowUpType("");
                setIsDatePickerOpen(false);
              }}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all",
                mode === "close"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : isDarkMode
                    ? "border-white/10 text-white/75 hover:bg-white/5"
                    : "border-slate-200 text-slate-700 hover:bg-slate-100",
              )}
            >
              Close case
            </button>
          </div>
        </div>

        {mode === "follow_up" && (
          <div
            className={cn(
              "p-4 rounded-2xl border transition-all space-y-4",
              isDarkMode ? "bg-white/[0.02] border-white/10" : "bg-slate-50 border-slate-200",
            )}
          >
            <h3 className={cn("text-xs font-bold tracking-widest uppercase", isDarkMode ? "text-emerald-500/80" : "text-emerald-600")}>
              2. Follow-up Details
            </h3>

            <div>
              <label className={cn("text-[10px] font-bold uppercase mb-1.5 block ml-1 opacity-60", isDarkMode ? "text-white" : "text-slate-700")}>
                Follow-up Date
              </label>
              <div className="relative" ref={datePickerRef}>
                <button
                  type="button"
                  onClick={() => {
                    if (followUpDate) {
                      const selectedDate = parseISO(followUpDate);
                      if (!Number.isNaN(selectedDate.getTime())) {
                        setCalendarMonth(selectedDate);
                      }
                    }
                    setIsDatePickerOpen((prev) => !prev);
                  }}
                  className={cn(
                    "w-full pl-8 pr-3 py-2.5 rounded-xl text-sm border focus:outline-none text-left transition-all",
                    isDarkMode ? "bg-black border-white/10 text-white" : "bg-white border-slate-200 text-slate-900",
                  )}
                >
                  <Calendar size={14} className={cn("absolute left-3 top-3", isDarkMode ? "text-white/30" : "text-slate-400")} />
                  <span className={cn(!followUpDate && (isDarkMode ? "text-white/35" : "text-slate-400"))}>
                    {followUpDate ? format(parseISO(followUpDate), "dd MMM yyyy") : "Select follow-up date"}
                  </span>
                </button>

                {isDatePickerOpen && (
                  <div
                    className={cn(
                      "absolute z-20 mt-2 w-full rounded-2xl border p-3 shadow-2xl",
                      isDarkMode ? "bg-[#1c1c21] border-white/10" : "bg-white border-slate-200",
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className={cn("text-sm font-bold", isDarkMode ? "text-white" : "text-slate-900")}>
                        {format(calendarMonth, "MMMM yyyy")}
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setCalendarMonth((prev) => subMonths(prev, 1))}
                          className={cn(
                            "p-1.5 rounded-lg border transition-all",
                            isDarkMode ? "border-white/10 text-white/60 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50",
                          )}
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCalendarMonth((prev) => addMonths(prev, 1))}
                          className={cn(
                            "p-1.5 rounded-lg border transition-all",
                            isDarkMode ? "border-white/10 text-white/60 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50",
                          )}
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                        <div key={day} className={cn("text-[10px] text-center font-bold", isDarkMode ? "text-white/35" : "text-slate-400")}>
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map((day) => {
                        const isInactiveMonth = !isSameMonth(day, calendarMonth);
                        const isPast = day < today;
                        const isSelected = followUpDate ? isSameDay(day, parseISO(followUpDate)) : false;

                        return (
                          <button
                            key={day.toISOString()}
                            type="button"
                            disabled={isPast}
                            onClick={() => {
                              setFollowUpDate(format(day, "yyyy-MM-dd"));
                              setIsDatePickerOpen(false);
                            }}
                            className={cn(
                              "h-8 rounded-lg text-xs font-semibold transition-all",
                              isSelected
                                ? "bg-emerald-600 text-white"
                                : isPast
                                  ? (isDarkMode ? "text-white/15 cursor-not-allowed" : "text-slate-300 cursor-not-allowed")
                                  : isDarkMode
                                    ? "text-white/75 hover:bg-white/8"
                                    : "text-slate-700 hover:bg-slate-100",
                              isInactiveMonth && !isSelected && "opacity-35",
                            )}
                          >
                            {format(day, "d")}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className={cn("text-[10px] font-bold uppercase mb-1.5 block ml-1 opacity-60", isDarkMode ? "text-white" : "text-slate-700")}>
                Follow-up Type
              </label>
              <div className="relative">
                <PhoneCall size={14} className={cn("absolute left-3 top-3", isDarkMode ? "text-white/30" : "text-slate-400")} />
                <select
                  value={followUpType}
                  onChange={(e) => setFollowUpType(e.target.value as "Call" | "WhatsApp" | "")}
                  className={cn(
                    "w-full pl-8 pr-3 py-2.5 rounded-xl text-sm border focus:outline-none transition-all",
                    isDarkMode
                      ? "bg-black border-white/10 text-white [&>option]:bg-slate-800"
                      : "bg-white border-slate-200 text-slate-900",
                  )}
                >
                  <option value="">Select type</option>
                  <option value="Call">Call</option>
                  <option value="WhatsApp">WhatsApp</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
};
