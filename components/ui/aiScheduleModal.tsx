"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetTenantSettingsQuery, useUpdateTenantAiSettingsMutation } from "@/hooks/useTenantSettingsQuery";

const DAY_KEYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const DEFAULT_ACTIVE_DAYS = DAY_KEYS.slice(0, 5);

type DayKey = (typeof DAY_KEYS)[number];
type TimeFieldKey = "start" | "end";
type TimePeriod = "AM" | "PM";

interface TimeFieldState {
    hours: string;
    minutes: string;
    period: TimePeriod;
}

interface AiSchedule {
    pauseStart: number;
    pauseEnd: number;
    enabled: boolean;
    activeDays: DayKey[];
}

interface AiScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    isDarkMode: boolean;
}

const STORAGE_KEY = "ai_schedule";
const DEFAULT_SCHEDULE: AiSchedule = {
    pauseStart: 21,
    pauseEnd: 8,
    enabled: true,
    activeDays: [...DEFAULT_ACTIVE_DAYS],
};
const CLOCK_SIZE = 272;
const CENTER = CLOCK_SIZE / 2;
const RADIUS = 94;
const HANDLE_RADIUS = 20;
const MINUTES_PER_DAY = 24 * 60;
const SLOT_MINUTES = 30;

const PALETTE = {
    bgPrimary: "#0d1818",
    bgSurface: "#111f1f",
    bgCardFrom: "#162a2a",
    border: "#243838",
    textPrimary: "#cce8e0",
    textMuted: "#5a8888",
    accentGreen: "#00a884",
    accentBright: "#00d4a0",
    accentTeal: "#0f6e56",
    accentRed: "#6b2828",
    accentRedBright: "#e53535",
    accentRedSoft: "#ff7070",
    inputBg: "#1a2e2e",
    moon: "#e0a020",
    white05: "rgba(255,255,255,0.05)",
    white07: "rgba(255,255,255,0.07)",
    white08: "rgba(255,255,255,0.08)",
    white10: "rgba(255,255,255,0.1)",
    white20: "rgba(255,255,255,0.2)",
    white30: "rgba(255,255,255,0.3)",
    white40: "rgba(255,255,255,0.4)",
};

function normalizeScheduleValue(value: number, fallback: number): number {
    if (!Number.isFinite(value)) return fallback;
    const normalized = ((value % 24) + 24) % 24;
    return Math.round(normalized * 2) / 2;
}

function normalizeActiveDays(value: unknown): DayKey[] {
    if (!Array.isArray(value)) return [...DEFAULT_ACTIVE_DAYS];
    const stringSet = new Set(value.filter((item): item is string => typeof item === "string"));
    const orderedDays = DAY_KEYS.filter(day => stringSet.has(day));
    return orderedDays.length ? orderedDays : [...DEFAULT_ACTIVE_DAYS];
}

function getCurrentDayKey(date = new Date()): DayKey {
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()] as DayKey;
}

function getScheduleFromStorage(): AiSchedule {
    if (typeof window === "undefined") return DEFAULT_SCHEDULE;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_SCHEDULE;
        const parsed = JSON.parse(raw);
        return {
            pauseStart: normalizeScheduleValue(parsed.pauseStart, DEFAULT_SCHEDULE.pauseStart),
            pauseEnd: normalizeScheduleValue(parsed.pauseEnd, DEFAULT_SCHEDULE.pauseEnd),
            enabled: typeof parsed.enabled === "boolean" ? parsed.enabled : DEFAULT_SCHEDULE.enabled,
            activeDays: normalizeActiveDays(parsed.activeDays),
        };
    } catch {
        return DEFAULT_SCHEDULE;
    }
}

function saveScheduleToStorage(schedule: AiSchedule) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
}

function hourToAngle(hour: number): number {
    return ((hour / 24) * 2 * Math.PI) - (Math.PI / 2);
}

function angleToHour(angle: number): number {
    let normalized = angle + (Math.PI / 2);
    if (normalized < 0) normalized += 2 * Math.PI;
    if (normalized >= 2 * Math.PI) normalized -= 2 * Math.PI;

    let hour = Math.round((normalized / (2 * Math.PI)) * (MINUTES_PER_DAY / SLOT_MINUTES)) / 2;
    if (hour >= 24) hour = 0;
    if (hour < 0) hour = 0;
    return hour;
}

function hourToPosition(hour: number, radius: number = RADIUS): { x: number; y: number } {
    const angle = hourToAngle(hour);
    return {
        x: CENTER + radius * Math.cos(angle),
        y: CENTER + radius * Math.sin(angle),
    };
}

function timeValueToMinutes(value: number): number {
    return Math.round(normalizeScheduleValue(value, 0) * 60);
}

function getPausedHours(start: number, end: number): number {
    const startMinutes = timeValueToMinutes(start);
    const endMinutes = timeValueToMinutes(end);
    const diff = (endMinutes - startMinutes + MINUTES_PER_DAY) % MINUTES_PER_DAY;
    return Number((diff / 60).toFixed(1));
}

function isWithinPauseWindow(currentMinutes: number, start: number, end: number): boolean {
    const startMinutes = timeValueToMinutes(start);
    const endMinutes = timeValueToMinutes(end);

    if (startMinutes === endMinutes) return false;
    if (startMinutes > endMinutes) {
        return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

function shouldAiBeActive(schedule: AiSchedule, date = new Date()): boolean {
    if (!schedule.enabled) return true;
    const currentDay = getCurrentDayKey(date);
    if (!schedule.activeDays.includes(currentDay)) return true;

    const currentMinutes = date.getHours() * 60 + date.getMinutes();
    return !isWithinPauseWindow(currentMinutes, schedule.pauseStart, schedule.pauseEnd);
}

function describeArc(startHour: number, endHour: number, radius: number = RADIUS): string {
    const startAngle = hourToAngle(startHour);
    const endAngle = hourToAngle(endHour);
    const startX = CENTER + radius * Math.cos(startAngle);
    const startY = CENTER + radius * Math.sin(startAngle);
    const endX = CENTER + radius * Math.cos(endAngle);
    const endY = CENTER + radius * Math.sin(endAngle);
    let angleDiff = endAngle - startAngle;
    if (angleDiff < 0) angleDiff += 2 * Math.PI;
    const largeArc = angleDiff > Math.PI ? 1 : 0;
    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`;
}

function formatHour12(value: number): string {
    const totalMinutes = timeValueToMinutes(value);
    const hours24 = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    const period = hours24 < 12 ? "AM" : "PM";
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    return `${hours12}:${String(minutes).padStart(2, "0")} ${period}`;
}

function toTimeFieldState(value: number): TimeFieldState {
    const totalMinutes = timeValueToMinutes(value);
    const hours24 = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    const period: TimePeriod = hours24 >= 12 ? "PM" : "AM";
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

    return {
        hours: String(hours12).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        period,
    };
}

function parseTimeFieldState(field: TimeFieldState, requireComplete = false): number | null {
    const hoursValue = field.hours.trim();
    const minutesValue = field.minutes.trim();

    if (!hoursValue || !minutesValue) return null;
    if (requireComplete && (hoursValue.length !== 2 || minutesValue.length !== 2)) return null;
    if (!/^\d{1,2}$/.test(hoursValue) || !/^\d{1,2}$/.test(minutesValue)) return null;

    const hours = Number(hoursValue);
    const minutes = Number(minutesValue);

    if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null;

    let hours24 = hours % 12;
    if (field.period === "PM") {
        hours24 += 12;
    }

    const roundedMinutes = Math.round(((hours24 * 60) + minutes) / SLOT_MINUTES) * SLOT_MINUTES;
    const normalizedMinutes = ((roundedMinutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;

    return normalizedMinutes / 60;
}

function sanitizeTimeInput(value: string): string {
    return value.replace(/\D/g, "").slice(0, 2);
}

function areSameDays(left: DayKey[], right: DayKey[]): boolean {
    return left.length === right.length && left.every((day, index) => day === right[index]);
}

function formatDurationCompact(hours: number): string {
    return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
}

function formatDurationText(hours: number): string {
    return Number.isInteger(hours) ? `${hours} hours` : `${hours.toFixed(1)} hours`;
}

function formatDaysList(days: DayKey[]): string {
    return DAY_KEYS.filter(day => days.includes(day)).join(", ");
}

export const AiScheduleModal: React.FC<AiScheduleModalProps> = ({ isOpen, onClose, isDarkMode }) => {
    const [schedule, setSchedule] = useState<AiSchedule>(DEFAULT_SCHEDULE);
    const [timeFields, setTimeFields] = useState<Record<TimeFieldKey, TimeFieldState>>({
        start: toTimeFieldState(DEFAULT_SCHEDULE.pauseStart),
        end: toTimeFieldState(DEFAULT_SCHEDULE.pauseEnd),
    });
    const [dragging, setDragging] = useState<"start" | "end" | null>(null);
    const [saved, setSaved] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const saveResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { data: settingsData } = useGetTenantSettingsQuery();
    const { mutate: updateAiSettings } = useUpdateTenantAiSettingsMutation();

    useEffect(() => {
        if (isOpen) {
            const persistedSchedule = getScheduleFromStorage();
            setSchedule(persistedSchedule);
            setTimeFields({
                start: toTimeFieldState(persistedSchedule.pauseStart),
                end: toTimeFieldState(persistedSchedule.pauseEnd),
            });
        }
    }, [isOpen]);

    useEffect(() => {
        return () => {
            if (saveResetTimeoutRef.current) {
                clearTimeout(saveResetTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEsc);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEsc);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        const enforce = () => {
            const persistedSchedule = getScheduleFromStorage();
            const currentAutoResponder = settingsData?.data?.ai_settings?.auto_responder;
            const shouldBeActive = shouldAiBeActive(persistedSchedule, new Date());

            if (shouldBeActive && currentAutoResponder === false) {
                updateAiSettings({ ai_settings: { auto_responder: true } });
            } else if (!shouldBeActive && currentAutoResponder !== false) {
                updateAiSettings({ ai_settings: { auto_responder: false } });
            }
        };

        enforce();
        const interval = setInterval(enforce, 60_000);
        return () => clearInterval(interval);
    }, [settingsData, updateAiSettings]);

    const getAngleFromEvent = useCallback((event: MouseEvent | TouchEvent) => {
        if (!svgRef.current) return 0;
        const rect = svgRef.current.getBoundingClientRect();
        const clientX = "touches" in event ? event.touches[0].clientX : event.clientX;
        const clientY = "touches" in event ? event.touches[0].clientY : event.clientY;
        const x = clientX - rect.left - CENTER;
        const y = clientY - rect.top - CENTER;
        return Math.atan2(y, x);
    }, []);

    const handleDragMove = useCallback((event: MouseEvent | TouchEvent) => {
        if (!dragging) return;
        event.preventDefault();
        const angle = getAngleFromEvent(event);
        const value = angleToHour(angle);
        setSchedule(prev => ({
            ...prev,
            [dragging === "start" ? "pauseStart" : "pauseEnd"]: value,
        }));
        setTimeFields(prev => ({
            ...prev,
            [dragging]: toTimeFieldState(value),
        }));
    }, [dragging, getAngleFromEvent]);

    const handleDragEnd = useCallback(() => {
        setDragging(null);
    }, []);

    useEffect(() => {
        if (!dragging) return;

        document.addEventListener("mousemove", handleDragMove);
        document.addEventListener("mouseup", handleDragEnd);
        document.addEventListener("touchmove", handleDragMove, { passive: false });
        document.addEventListener("touchend", handleDragEnd);

        return () => {
            document.removeEventListener("mousemove", handleDragMove);
            document.removeEventListener("mouseup", handleDragEnd);
            document.removeEventListener("touchmove", handleDragMove);
            document.removeEventListener("touchend", handleDragEnd);
        };
    }, [dragging, handleDragMove, handleDragEnd]);

    const pausedHours = useMemo(() => getPausedHours(schedule.pauseStart, schedule.pauseEnd), [schedule.pauseStart, schedule.pauseEnd]);
    const activeHours = useMemo(() => Number((24 - pausedHours).toFixed(1)), [pausedHours]);
    const startPos = useMemo(() => hourToPosition(schedule.pauseStart), [schedule.pauseStart]);
    const endPos = useMemo(() => hourToPosition(schedule.pauseEnd), [schedule.pauseEnd]);
    const pausedArcPath = useMemo(() => describeArc(schedule.pauseStart, schedule.pauseEnd), [schedule.pauseStart, schedule.pauseEnd]);
    const activeArcPath = useMemo(() => describeArc(schedule.pauseEnd, schedule.pauseStart), [schedule.pauseStart, schedule.pauseEnd]);
    const activeDaysText = useMemo(() => formatDaysList(schedule.activeDays), [schedule.activeDays]);
    const currentDay = getCurrentDayKey();
    const isWeekdaysPreset = useMemo(() => areSameDays(schedule.activeDays, DEFAULT_ACTIVE_DAYS), [schedule.activeDays]);
    const isWeekendsPreset = useMemo(() => areSameDays(schedule.activeDays, ["Sat", "Sun"]), [schedule.activeDays]);
    const isEveryDayPreset = useMemo(() => areSameDays(schedule.activeDays, [...DAY_KEYS]), [schedule.activeDays]);
    const isClearPreset = useMemo(() => areSameDays(schedule.activeDays, [currentDay]), [currentDay, schedule.activeDays]);

    const setScheduleTime = useCallback((field: TimeFieldKey, value: number) => {
        const scheduleKey = field === "start" ? "pauseStart" : "pauseEnd";
        setSchedule(prev => ({
            ...prev,
            [scheduleKey]: value,
        }));
    }, []);

    const handleTimePartChange = useCallback((field: TimeFieldKey, part: "hours" | "minutes", value: string) => {
        const nextField = {
            ...timeFields[field],
            [part]: sanitizeTimeInput(value),
        };

        setTimeFields(prev => ({
            ...prev,
            [field]: nextField,
        }));

        const parsedValue = parseTimeFieldState(nextField, true);
        if (parsedValue !== null) {
            setScheduleTime(field, parsedValue);
        }
    }, [setScheduleTime, timeFields]);

    const handleTimePeriodChange = useCallback((field: TimeFieldKey, period: TimePeriod) => {
        const nextField = {
            ...timeFields[field],
            period,
        };

        setTimeFields(prev => ({
            ...prev,
            [field]: nextField,
        }));

        const parsedValue = parseTimeFieldState(nextField, true);
        if (parsedValue !== null) {
            setScheduleTime(field, parsedValue);
        }
    }, [setScheduleTime, timeFields]);

    const handleTimeInputClick = useCallback((field: TimeFieldKey, part: "hours" | "minutes") => () => {
        setTimeFields(prev => ({
            ...prev,
            [field]: { ...prev[field], [part]: "" },
        }));
    }, []);

    const commitTimeField = useCallback((field: TimeFieldKey) => {
        const parsedValue = parseTimeFieldState(timeFields[field]);

        if (parsedValue === null) {
            const fallbackValue = field === "start" ? schedule.pauseStart : schedule.pauseEnd;
            setTimeFields(prev => ({
                ...prev,
                [field]: toTimeFieldState(fallbackValue),
            }));
            return;
        }

        setScheduleTime(field, parsedValue);
        setTimeFields(prev => ({
            ...prev,
            [field]: toTimeFieldState(parsedValue),
        }));
    }, [schedule.pauseEnd, schedule.pauseStart, setScheduleTime, timeFields]);

    const handleTimeGroupBlur = useCallback(
        (field: TimeFieldKey) => (event: React.FocusEvent<HTMLDivElement>) => {
            const nextTarget = event.relatedTarget as Node | null;

            if (nextTarget && event.currentTarget.contains(nextTarget)) {
                return;
            }

            commitTimeField(field);
        },
        [commitTimeField],
    );

    const handleTimeInputKeyDown = useCallback(
        (field: TimeFieldKey) => (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            commitTimeField(field);
            event.currentTarget.blur();
        },
        [commitTimeField],
    );

    const toggleDay = (day: DayKey) => {
        setSchedule(prev => {
            const isSelected = prev.activeDays.includes(day);
            if (isSelected && prev.activeDays.length === 1) return prev;

            const nextDays = isSelected
                ? prev.activeDays.filter(activeDay => activeDay !== day)
                : DAY_KEYS.filter(activeDay => [...prev.activeDays, day].includes(activeDay));

            return {
                ...prev,
                activeDays: normalizeActiveDays(nextDays),
            };
        });
    };

    const applyDays = (days: DayKey[]) => {
        setSchedule(prev => ({
            ...prev,
            activeDays: DAY_KEYS.filter(day => days.includes(day)),
        }));
    };

    const handleClearDays = () => {
        applyDays([getCurrentDayKey()]);
    };

    const handleSave = () => {
        const nextPauseStart = parseTimeFieldState(timeFields.start) ?? schedule.pauseStart;
        const nextPauseEnd = parseTimeFieldState(timeFields.end) ?? schedule.pauseEnd;
        const nextSchedule = {
            ...schedule,
            pauseStart: nextPauseStart,
            pauseEnd: nextPauseEnd,
            activeDays: normalizeActiveDays(schedule.activeDays),
        };

        setSchedule(nextSchedule);
        setTimeFields({
            start: toTimeFieldState(nextPauseStart),
            end: toTimeFieldState(nextPauseEnd),
        });
        saveScheduleToStorage(nextSchedule);
        updateAiSettings({ ai_settings: { auto_responder: shouldAiBeActive(nextSchedule, new Date()) } });
        setSaved(true);

        if (saveResetTimeoutRef.current) {
            clearTimeout(saveResetTimeoutRef.current);
        }

        saveResetTimeoutRef.current = setTimeout(() => {
            setSaved(false);
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div
            ref={modalRef}
            className="absolute top-[56px] right-4 z-[9999] animate-in fade-in slide-in-from-top-2 duration-200"
            style={{ width: "min(680px, calc(100vw - 32px))" }}
        >
            <div
                className="relative overflow-hidden rounded-[20px]"
                style={{
                    background: isDarkMode
                        ? `linear-gradient(160deg, ${PALETTE.bgCardFrom} 0%, ${PALETTE.bgSurface} 100%)`
                        : "linear-gradient(160deg, rgba(255,255,255,0.97) 0%, rgba(248,250,252,0.99) 100%)",
                    border: `1px solid ${isDarkMode ? PALETTE.border : "rgba(226,232,240,0.85)"}`,
                    boxShadow: isDarkMode
                        ? `0 25px 60px -12px rgba(0,0,0,0.7), 0 0 40px -8px rgba(0,168,132,0.08), inset 0 1px 0 ${PALETTE.white05}`
                        : "0 25px 50px -12px rgba(0,0,0,0.16)",
                    backdropFilter: "blur(24px)",
                }}
            >
                {isDarkMode && (
                    <>
                        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 18% 20%, rgba(0,212,160,0.12), transparent 36%), radial-gradient(circle at 86% 88%, rgba(0,212,160,0.08), transparent 28%)" }} />
                        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.12)] to-transparent" />
                    </>
                )}

                <div className="relative p-5 sm:p-6">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-full p-1.5 transition-all duration-150"
                        style={{ color: isDarkMode ? PALETTE.white40 : "rgba(15,23,42,0.45)" }}
                    >
                        <X size={16} />
                    </button>

                    <div className="mb-4 pr-8">
                        <h2 className={cn("text-[20px] font-extrabold tracking-tight sm:text-[22px]", isDarkMode ? "text-white" : "text-slate-900")}>
                            AI Response Schedule{" "}
                            <span style={{ color: isDarkMode ? PALETTE.textMuted : "rgba(100,116,139,0.95)" }}>(Off-Hours)</span>
                        </h2>
                        <p className="mt-1.5 text-[12px] leading-relaxed sm:text-[13px]" style={{ color: isDarkMode ? PALETTE.textMuted : "rgba(100,116,139,0.92)" }}>
                            Define the time window when the AI assistant is paused. Within this time, all incoming messages are held for manual review. Outside this window, the AI will be active and automatically respond.
                        </p>
                    </div>

                    <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {([
                            { key: "start" as const, label: "AI Paused Start Time:" },
                            { key: "end" as const, label: "AI Paused End Time:" },
                        ]).map(({ key, label }) => {
                            const fieldValue = timeFields[key];

                            return (
                                <div key={key}>
                                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: isDarkMode ? PALETTE.textMuted : "rgba(100,116,139,0.9)" }}>
                                        {label}
                                    </label>
                                    <div
                                        className="flex items-center gap-2 rounded-xl border px-3 py-2.5 transition-all duration-150"
                                        style={{
                                            borderColor: isDarkMode ? PALETTE.border : "rgba(203,213,225,0.95)",
                                            background: isDarkMode ? PALETTE.inputBg : "rgba(255,255,255,0.96)",
                                            boxShadow: isDarkMode ? "inset 0 1px 2px rgba(0,0,0,0.32)" : "inset 0 1px 2px rgba(15,23,42,0.05)",
                                        }}
                                        onBlur={handleTimeGroupBlur(key)}
                                    >
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            autoComplete="off"
                                            maxLength={2}
                                            placeholder="--"
                                            value={fieldValue.hours}
                                            onClick={handleTimeInputClick(key, "hours")}
                                            onChange={event => handleTimePartChange(key, "hours", event.target.value)}
                                            onKeyDown={handleTimeInputKeyDown(key)}
                                            aria-label={`${label} hours`}
                                            className="w-11 bg-transparent text-center text-sm font-semibold outline-none placeholder:tracking-[0.08em]"
                                            style={{ color: isDarkMode ? PALETTE.textPrimary : "rgba(15,23,42,0.92)" }}
                                        />
                                        <span className="text-sm font-semibold" style={{ color: isDarkMode ? PALETTE.white40 : "rgba(100,116,139,0.92)" }}>
                                            :
                                        </span>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            autoComplete="off"
                                            maxLength={2}
                                            placeholder="--"
                                            value={fieldValue.minutes}
                                            onClick={handleTimeInputClick(key, "minutes")}
                                            onChange={event => handleTimePartChange(key, "minutes", event.target.value)}
                                            onKeyDown={handleTimeInputKeyDown(key)}
                                            aria-label={`${label} minutes`}
                                            className="w-11 bg-transparent text-center text-sm font-semibold outline-none placeholder:tracking-[0.08em]"
                                            style={{ color: isDarkMode ? PALETTE.textPrimary : "rgba(15,23,42,0.92)" }}
                                        />
                                        <div
                                            className="ml-auto flex items-center rounded-lg border p-0.5"
                                            style={{
                                                borderColor: isDarkMode ? PALETTE.white10 : "rgba(148,163,184,0.24)",
                                                background: isDarkMode ? "rgba(13,24,24,0.72)" : "rgba(241,245,249,0.92)",
                                            }}
                                        >
                                            {(["AM", "PM"] as const).map(period => {
                                                const active = fieldValue.period === period;

                                                return (
                                                    <button
                                                        key={period}
                                                        type="button"
                                                        aria-pressed={active}
                                                        onClick={() => handleTimePeriodChange(key, period)}
                                                        className="rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
                                                        style={active
                                                            ? {
                                                                background: `linear-gradient(135deg, ${PALETTE.accentGreen}, ${PALETTE.accentBright})`,
                                                                color: "#ffffff",
                                                                boxShadow: "0 2px 8px rgba(0,168,132,0.22)",
                                                            }
                                                            : {
                                                                color: isDarkMode ? PALETTE.white40 : "rgba(100,116,139,0.92)",
                                                            }
                                                        }
                                                    >
                                                        {period}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mb-4 flex justify-center">
                        <svg
                            ref={svgRef}
                            width={CLOCK_SIZE}
                            height={CLOCK_SIZE}
                            viewBox={`0 0 ${CLOCK_SIZE} ${CLOCK_SIZE}`}
                            className="select-none"
                        >
                            <defs>
                                <filter id="scheduleClockGlow">
                                    <feGaussianBlur stdDeviation="3" result="glow" />
                                    <feMerge>
                                        <feMergeNode in="glow" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                                <radialGradient id="scheduleClockCenter" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor={isDarkMode ? PALETTE.bgPrimary : "#ffffff"} />
                                    <stop offset="100%" stopColor={isDarkMode ? PALETTE.bgSurface : "#f8fafc"} />
                                </radialGradient>
                            </defs>

                            <circle cx={CENTER} cy={CENTER} r={RADIUS - 14} fill="url(#scheduleClockCenter)" />
                            <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke={isDarkMode ? PALETTE.border : "rgba(203,213,225,0.85)"} strokeWidth={20} opacity={0.9} />

                            <path
                                d={activeArcPath}
                                fill="none"
                                stroke={PALETTE.accentTeal}
                                strokeWidth={20}
                                strokeLinecap="round"
                                filter={isDarkMode ? "url(#scheduleClockGlow)" : undefined}
                            />

                            <path
                                d={pausedArcPath}
                                fill="none"
                                stroke={PALETTE.accentRed}
                                strokeWidth={20}
                                strokeLinecap="round"
                                opacity={0.95}
                            />

                            {Array.from({ length: MINUTES_PER_DAY / SLOT_MINUTES }, (_, index) => {
                                const tickValue = index / 2;
                                const angle = hourToAngle(tickValue);
                                const outerRadius = RADIUS + 16;
                                const innerRadius = RADIUS + (index % 2 === 0 ? 10 : 13);
                                const x1 = CENTER + outerRadius * Math.cos(angle);
                                const y1 = CENTER + outerRadius * Math.sin(angle);
                                const x2 = CENTER + innerRadius * Math.cos(angle);
                                const y2 = CENTER + innerRadius * Math.sin(angle);
                                return (
                                    <line
                                        key={tickValue}
                                        x1={x1}
                                        y1={y1}
                                        x2={x2}
                                        y2={y2}
                                        stroke={isDarkMode ? PALETTE.textMuted : "rgba(100,116,139,0.8)"}
                                        strokeWidth={index % 2 === 0 ? 1.4 : 0.8}
                                        opacity={index % 2 === 0 ? 0.9 : 0.45}
                                    />
                                );
                            })}

                            {Array.from({ length: 12 }, (_, index) => {
                                const hour24 = index * 2;
                                const angle = hourToAngle(hour24);
                                const labelRadius = RADIUS + 30;
                                const x = CENTER + labelRadius * Math.cos(angle);
                                const y = CENTER + labelRadius * Math.sin(angle);

                                return (
                                    <text
                                        key={hour24}
                                        x={x}
                                        y={y}
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        fill={isDarkMode ? PALETTE.textMuted : "rgba(100,116,139,0.9)"}
                                        fontSize={9}
                                        fontWeight={700}
                                        pointerEvents="none"
                                    >
                                        {String(hour24).padStart(2, "0")}
                                    </text>
                                );
                            })}

                            <text
                                x={CENTER}
                                y={CENTER - 10}
                                textAnchor="middle"
                                dominantBaseline="central"
                                fill={isDarkMode ? PALETTE.textMuted : "rgba(100,116,139,0.9)"}
                                fontSize={11}
                                fontWeight={600}
                                pointerEvents="none"
                            >
                                AI Paused
                            </text>
                            <text
                                x={CENTER}
                                y={CENTER + 14}
                                textAnchor="middle"
                                dominantBaseline="central"
                                fill={PALETTE.accentBright}
                                fontSize={28}
                                fontWeight={800}
                                pointerEvents="none"
                            >
                                {formatDurationCompact(pausedHours)}
                            </text>

                            <g
                                style={{ cursor: "grab" }}
                                onMouseDown={event => { event.preventDefault(); setDragging("start"); }}
                                onTouchStart={event => { event.preventDefault(); setDragging("start"); }}
                            >
                                <circle
                                    cx={startPos.x}
                                    cy={startPos.y}
                                    r={HANDLE_RADIUS}
                                    fill={isDarkMode ? PALETTE.bgSurface : "#ffffff"}
                                    stroke={PALETTE.accentRedBright}
                                    strokeWidth={2.5}
                                    style={{ filter: isDarkMode ? "drop-shadow(0 0 6px rgba(229,53,53,0.24))" : "drop-shadow(0 2px 4px rgba(15,23,42,0.12))" }}
                                />
                                <text
                                    x={startPos.x}
                                    y={startPos.y + 0.5}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fill={isDarkMode ? "#ffd4d4" : PALETTE.accentRedBright}
                                    fontSize={6.5}
                                    fontWeight={800}
                                    letterSpacing="0.05em"
                                    pointerEvents="none"
                                >
                                    START
                                </text>
                            </g>

                            <g
                                style={{ cursor: "grab" }}
                                onMouseDown={event => { event.preventDefault(); setDragging("end"); }}
                                onTouchStart={event => { event.preventDefault(); setDragging("end"); }}
                            >
                                <circle
                                    cx={endPos.x}
                                    cy={endPos.y}
                                    r={HANDLE_RADIUS}
                                    fill={isDarkMode ? PALETTE.bgSurface : "#ffffff"}
                                    stroke={PALETTE.accentBright}
                                    strokeWidth={2.5}
                                    style={{ filter: isDarkMode ? "drop-shadow(0 0 6px rgba(0,212,160,0.24))" : "drop-shadow(0 2px 4px rgba(15,23,42,0.12))" }}
                                />
                                <text
                                    x={endPos.x}
                                    y={endPos.y + 0.5}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fill={isDarkMode ? "#d2fff0" : PALETTE.accentTeal}
                                    fontSize={8.5}
                                    fontWeight={800}
                                    letterSpacing="0.05em"
                                    pointerEvents="none"
                                >
                                    END
                                </text>
                            </g>
                        </svg>
                    </div>

                    <div className="mb-4 flex items-center justify-center gap-5">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full" style={{ background: PALETTE.accentTeal }} />
                            <span className="text-xs font-semibold" style={{ color: isDarkMode ? PALETTE.textMuted : "rgba(71,85,105,0.95)" }}>
                                {`AI Active: ${formatDurationCompact(activeHours)}`}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full" style={{ background: PALETTE.accentRed }} />
                            <span className="text-xs font-semibold" style={{ color: isDarkMode ? PALETTE.textMuted : "rgba(71,85,105,0.95)" }}>
                                {`AI Paused: ${formatDurationCompact(pausedHours)}`}
                            </span>
                        </div>
                    </div>

                    <div
                        className="py-4"
                        style={{
                            borderTop: `1px solid ${isDarkMode ? PALETTE.white07 : "rgba(15,23,42,0.08)"}`,
                            borderBottom: `1px solid ${isDarkMode ? PALETTE.white07 : "rgba(15,23,42,0.08)"}`,
                        }}
                    >
                        <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: isDarkMode ? PALETTE.textMuted : "rgba(100,116,139,0.9)" }}>
                            APPLY SCHEDULE ON:
                        </p>

                        <div className="flex flex-nowrap items-center justify-between gap-2">
                            {DAY_KEYS.map(day => {
                                const selected = schedule.activeDays.includes(day);
                                return (
                                    <button
                                        key={day}
                                        type="button"
                                        aria-pressed={selected}
                                        onClick={() => toggleDay(day)}
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition-all duration-150 ease-in-out hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)]"
                                        style={selected
                                            ? {
                                                background: "rgba(0,212,160,0.15)",
                                                border: "1.5px solid #00d4a0",
                                                color: PALETTE.accentBright,
                                            }
                                            : {
                                                background: isDarkMode ? PALETTE.white05 : "rgba(15,23,42,0.03)",
                                                borderColor: isDarkMode ? PALETTE.white10 : "rgba(15,23,42,0.08)",
                                                color: isDarkMode ? PALETTE.white40 : "rgba(100,116,139,0.85)",
                                            }
                                        }
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[11px]">
                            {[
                                {
                                    key: "weekdays",
                                    label: "Weekdays",
                                    active: isWeekdaysPreset,
                                    onClick: () => applyDays(DEFAULT_ACTIVE_DAYS),
                                },
                                {
                                    key: "weekends",
                                    label: "Weekends",
                                    active: isWeekendsPreset,
                                    onClick: () => applyDays(["Sat", "Sun"]),
                                },
                                {
                                    key: "every-day",
                                    label: "Every Day",
                                    active: isEveryDayPreset,
                                    onClick: () => applyDays([...DAY_KEYS]),
                                },
                                {
                                    key: "clear",
                                    label: "Clear",
                                    active: isClearPreset,
                                    onClick: handleClearDays,
                                },
                            ].map(action => (
                                <button
                                    key={action.key}
                                    type="button"
                                    aria-pressed={action.active}
                                    onClick={action.onClick}
                                    className="rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all duration-150 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
                                    style={action.active
                                        ? {
                                            background: "rgba(0,212,160,0.15)",
                                            borderColor: PALETTE.accentBright,
                                            color: PALETTE.accentBright,
                                            boxShadow: "0 4px 14px rgba(0,212,160,0.12)",
                                        }
                                        : {
                                            background: isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(248,250,252,0.95)",
                                            borderColor: isDarkMode ? PALETTE.white10 : "rgba(148,163,184,0.28)",
                                            color: isDarkMode ? PALETTE.white30 : "rgba(100,116,139,0.92)",
                                        }
                                    }
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold" style={{ color: isDarkMode ? PALETTE.textPrimary : "rgba(15,23,42,0.9)" }}>
                                    Schedule Activation:
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setSchedule(prev => ({ ...prev, enabled: !prev.enabled }))}
                                    className="relative h-[26px] w-12 rounded-full transition-all duration-300 ease-out"
                                    style={{
                                        background: schedule.enabled
                                            ? `linear-gradient(135deg, ${PALETTE.accentGreen}, ${PALETTE.accentBright})`
                                            : isDarkMode ? PALETTE.inputBg : "rgba(203,213,225,0.95)",
                                        boxShadow: schedule.enabled
                                            ? "0 0 12px rgba(0,212,160,0.26), inset 0 1px 2px rgba(0,0,0,0.14)"
                                            : "inset 0 1px 3px rgba(0,0,0,0.16)",
                                    }}
                                >
                                    <span
                                        className="absolute left-[3px] top-[3px] h-5 w-5 rounded-full bg-white transition-transform duration-300 ease-out"
                                        style={{
                                            transform: schedule.enabled ? "translateX(22px)" : "translateX(0)",
                                            boxShadow: "0 2px 4px rgba(0,0,0,0.18)",
                                        }}
                                    />
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={handleSave}
                                className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all duration-200"
                                style={{
                                    background: `linear-gradient(135deg, ${PALETTE.accentGreen}, ${PALETTE.accentBright})`,
                                    boxShadow: saved
                                        ? "0 4px 16px rgba(0,212,160,0.2)"
                                        : "0 4px 16px rgba(0,168,132,0.35)",
                                    transform: saved ? "scale(0.98)" : "scale(1)",
                                }}
                            >
                                {saved && <Check size={16} />}
                                <span>{saved ? "Saved!" : "Save Schedule"}</span>
                            </button>
                        </div>

                        <p className="mt-3 text-[12px]" style={{ color: isDarkMode ? PALETTE.textMuted : "rgba(100,116,139,0.92)" }}>
                            AI will be inactive for{" "}
                            <span className="font-bold" style={{ color: PALETTE.accentBright }}>{formatDurationText(pausedHours)}</span>{" "}
                            on {activeDaysText} ({formatHour12(schedule.pauseStart)} – {formatHour12(schedule.pauseEnd)}).
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const AiStatusPill: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
    const { data: settingsData } = useGetTenantSettingsQuery();
    const autoResponder = settingsData?.data?.ai_settings?.auto_responder;
    const isAiActive = autoResponder !== false;

    return (
        <div
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all"
            style={{
                background: isAiActive
                    ? (isDarkMode ? "rgba(0,212,160,0.15)" : "rgba(0,212,160,0.08)")
                    : (isDarkMode ? "rgba(229,53,53,0.12)" : "rgba(229,53,53,0.08)"),
                border: `1px solid ${isAiActive ? "#00d4a0" : "rgba(229,53,53,0.6)"}`,
                color: isAiActive ? PALETTE.accentBright : PALETTE.accentRedSoft,
            }}
        >
            <span className="relative flex h-2 w-2">
                <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                    style={{ background: isAiActive ? PALETTE.accentBright : PALETTE.accentRedSoft }}
                />
                <span
                    className="relative inline-flex h-2 w-2 rounded-full"
                    style={{ background: isAiActive ? PALETTE.accentBright : PALETTE.accentRedSoft }}
                />
            </span>
            {isAiActive ? "AI Active" : "Human Active"}
        </div>
    );
};