/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef, type MouseEvent } from "react";
import {
    Search, Send, Clock3, RefreshCw, CheckCircle2, AlertCircle,
    Timer, TrendingUp, Bell, CalendarDays, ChevronRight,
    ChevronLeft, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";
import { toast } from "@/lib/toast";
import {
    useRetryFollowUpMutation,
    useSendNowFollowUpMutation,
} from "@/hooks/useFollowUpHubQuery";
import { useGetRemindersQuery } from "@/hooks/useRemindersQuery";
import { type AppointmentReminderItem, type AppointmentReminderFilters } from "@/services/appointment";
import { RescheduleDrawer } from "@/components/views/followup-hub/RescheduleDrawer";
import { ReminderDetailDrawer } from "./reminderDetailDrawer";
import { glassCard, tx } from "@/components/views/dashboard/glassStyles";

// ── Constants ─────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10;
const GREEN = "#10b981";

type StatusFilter = "all" | "pending" | "sent" | "failed";

const STATUS_COLOR = {
    pending: "#f59e0b",
    sent:    "#10b981",
    failed:  "#ef4444",
} as const;

const kpiBadge: Record<string, { label: string; bg: string; color: string; border: string; dot: string }> = {
    great: { label: "✓ Great", bg: "rgba(16,185,129,0.12)", color: "#34d399", border: "rgba(16,185,129,0.25)", dot: "#10b981" },
    good:  { label: "↑ Good",  bg: "rgba(16,185,129,0.08)", color: "#6ee7b7", border: "rgba(16,185,129,0.18)", dot: "#10b981" },
    watch: { label: "! Watch", bg: "rgba(244,63,94,0.12)",  color: "#fb7185", border: "rgba(244,63,94,0.25)",  dot: "#f43f5e" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDate = (v?: string | null) => {
    if (!v) return "—";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtDateTime = (v?: string | null) => {
    if (!v) return "—";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const doctorLabel = (doc: AppointmentReminderItem["doctor"]) => {
    if (!doc) return "—";
    return [doc.title, doc.name].filter(Boolean).join(" ") || "—";
};

const patientLabel = (row: AppointmentReminderItem) =>
    row.appointment?.patient_name || row.contact?.name || "—";

const phoneLabel = (row: AppointmentReminderItem) =>
    row.contact?.phone || row.to_phone || "—";

// ── KPI Card ──────────────────────────────────────────────────────────────────

const KPICard = ({
    label, value, icon: Icon, barW, sub, trend, badgeKey, color,
    onClick, active, index, isDarkMode, statusKey,
}: {
    label: string; value: number; icon: any; barW: number; sub: string; trend: string;
    badgeKey: "great" | "good" | "watch"; color: string; statusKey?: StatusFilter;
    onClick: () => void; active: boolean; index: number; isDarkMode: boolean;
}) => {
    const [show, setShow] = useState(false);
    useEffect(() => {
        const id = setTimeout(() => setShow(true), 80 + index * 50);
        return () => clearTimeout(id);
    }, [index]);
    const badge = kpiBadge[badgeKey];
    const t = tx(isDarkMode);
    const borderColor = active ? `${color}55` : isDarkMode ? "#27272a" : "#e4e4e7";

    return (
        <button
            type="button" onClick={onClick}
            className="rounded-xl p-5 flex flex-col gap-3 relative text-left w-full"
            style={{
                ...glassCard(isDarkMode),
                border: `1px solid ${borderColor}`,
                opacity: show ? 1 : 0,
                transform: show ? "translateY(0)" : "translateY(8px)",
                transition: `opacity 0.4s ease ${index * 40}ms, transform 0.4s ease ${index * 40}ms`,
            }}
        >
            <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center border"
                    style={{ background: `${color}15`, color, borderColor: `${color}30` }}>
                    <Icon size={18} />
                </div>
                <span className="px-2 py-0.5 rounded-md flex items-center gap-1.5"
                    style={{ background: badge.bg, color: badge.color, fontSize: 11, fontWeight: 600, border: `1px solid ${badge.border}` }}>
                    <div className="w-1 h-1 rounded-full" style={{ background: badge.dot }} />
                    {badge.label}
                </span>
            </div>
            <div className="mt-1">
                <p style={{ fontSize: 13, fontWeight: 500, color: t.secondary, marginBottom: 6 }}>{label}</p>
                <h4 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1, fontVariantNumeric: "tabular-nums", color: t.value }}>
                    {value}
                </h4>
            </div>
            <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                    <TrendingUp size={12} style={{ color }} />
                    <span style={{ fontSize: 12, fontWeight: 500, color }}>{trend}</span>
                </div>
                <span style={{ fontSize: 12, color: t.micro }}>• {sub}</span>
            </div>
            <div className="h-1 w-full rounded-full overflow-hidden mt-3" style={{ background: isDarkMode ? "#27272a" : "#e4e4e7" }}>
                <div className="h-full rounded-full"
                    style={{ width: show ? `${Math.min(barW, 100)}%` : "0%", background: color, transition: `width 1000ms cubic-bezier(0.22,1,0.36,1) ${index * 50 + 200}ms` }} />
            </div>
        </button>
    );
};

// ── Fact Item ─────────────────────────────────────────────────────────────────

const FactItem = ({ label, value, sub, accent, isDarkMode }: {
    label: string; value: string; sub?: string; accent?: string; isDarkMode: boolean;
}) => {
    const t = tx(isDarkMode);
    return (
        <div className="flex flex-col gap-1 min-w-0">
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: t.micro }}>
                {label}
            </p>
            <p className="truncate" style={{ fontSize: 13, fontWeight: 600, color: accent ?? t.value, lineHeight: 1.3 }}>
                {value || "—"}
            </p>
            {sub && (
                <p className="truncate" style={{ fontSize: 11, color: t.micro }}>{sub}</p>
            )}
        </div>
    );
};

// ── Card Action Buttons ───────────────────────────────────────────────────────

const SolidBtn = ({ icon: Icon, label, onClick, color, disabled }: {
    icon: any; label: string; onClick: (e: MouseEvent<HTMLButtonElement>) => void;
    color: string; disabled?: boolean;
}) => (
    <button type="button" onClick={onClick} disabled={disabled}
        className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-bold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        style={{ background: color, boxShadow: `0 2px 10px ${color}45` }}>
        <Icon size={12} /> {label}
    </button>
);

const OutlineBtn = ({ icon: Icon, label, onClick, color, disabled }: {
    icon: any; label: string; onClick: (e: MouseEvent<HTMLButtonElement>) => void;
    color: string; disabled?: boolean;
}) => (
    <button type="button" onClick={onClick} disabled={disabled}
        className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 hover:brightness-110"
        style={{ background: `${color}14`, border: `1.5px solid ${color}40`, color }}>
        <Icon size={12} /> {label}
    </button>
);

const GhostBtn = ({ icon: Icon, label, onClick, isDarkMode }: {
    icon: any; label: string; onClick: (e: MouseEvent<HTMLButtonElement>) => void; isDarkMode: boolean;
}) => (
    <button type="button" onClick={onClick}
        className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-[12px] font-semibold transition-all"
        style={{
            background: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
            border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.09)"}`,
            color: isDarkMode ? "rgba(255,255,255,0.55)" : "#64748b",
        }}>
        {label} <Icon size={12} />
    </button>
);

// ── Reminder Card ─────────────────────────────────────────────────────────────

const ReminderCard = ({
    row, isDarkMode, onView, onRetry, onReschedule, onSendNow, isRetrying, isSending,
}: {
    row: AppointmentReminderItem; isDarkMode: boolean;
    onView: () => void; onRetry: () => void; onReschedule: () => void;
    onSendNow: () => void; isRetrying: boolean; isSending: boolean;
}) => {
    const status = row.status ?? "pending";
    const statusColor = (STATUS_COLOR as any)[status] ?? "#64748b";
    const t = tx(isDarkMode);
    const initial = patientLabel(row).charAt(0).toUpperCase();
    const divider = isDarkMode ? "rgba(255,255,255,0.06)" : "#f1f5f9";
    const stop = (e: React.MouseEvent) => e.stopPropagation();

    return (
        <article
            role="button" tabIndex={0}
            onClick={onView}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onView(); } }}
            className="cursor-pointer overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-px"
            style={{
                background: isDarkMode ? "#09090b" : "#ffffff",
                border: `1px solid ${isDarkMode ? "#27272a" : "#e4e4e7"}`,
            }}
        >
            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="flex items-center justify-between gap-4 px-5 py-3.5"
                style={{ borderBottom: `1px solid ${divider}` }}>
                {/* Status badge + avatar + patient */}
                <div className="flex items-center gap-3 min-w-0">
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold"
                        style={{ background: `${statusColor}18`, border: `1px solid ${statusColor}35`, color: statusColor }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusColor }} />
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-black"
                        style={{ background: `${statusColor}15`, color: statusColor }}>
                        {initial}
                    </div>

                    <div className="min-w-0">
                        <p className="text-sm font-bold leading-tight truncate" style={{ color: t.value }}>
                            {patientLabel(row)}
                        </p>
                        <p className="text-xs tabular-nums" style={{ color: t.micro }}>
                            {phoneLabel(row)}
                        </p>
                    </div>
                </div>

                {/* Type chip */}
                <div className="flex shrink-0 items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold"
                        style={{ background: `${GREEN}12`, border: `1px solid ${GREEN}25`, color: GREEN }}>
                        <Bell size={10} /> Appointment Reminder
                    </span>
                </div>
            </div>

            {/* ── Facts grid ─────────────────────────────────────────── */}
            <div className="grid gap-5 px-5 py-4"
                style={{ gridTemplateColumns: "1fr 1fr 1.4fr 1.4fr" }}>
                <FactItem label="Doctor" value={doctorLabel(row.doctor)} isDarkMode={isDarkMode} />
                <FactItem
                    label="Appointment"
                    value={fmtDate(row.appointment?.appointment_date)}
                    sub={row.appointment?.appointment_time ?? undefined}
                    isDarkMode={isDarkMode}
                />
                <FactItem
                    label="Scheduled Send"
                    value={fmtDateTime(row.scheduled_at)}
                    sub={row.sent_at ? `Sent ${fmtDateTime(row.sent_at)}` : undefined}
                    accent={row.sent_at ? GREEN : undefined}
                    isDarkMode={isDarkMode}
                />
                <FactItem
                    label="Template"
                    value={row.template?.template_name || "—"}
                    sub={row.template?.template_type ?? undefined}
                    isDarkMode={isDarkMode}
                />
            </div>

            {/* ── Footer: actions ────────────────────────────────────── */}
            <div
                className="flex items-center justify-between gap-4 px-5 py-3"
                style={{ borderTop: `1px solid ${divider}`, background: isDarkMode ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.015)" }}
                onClick={stop}
            >
                {/* Error snippet if failed */}
                {status === "failed" && row.error_log ? (
                    <p className="truncate text-[11px] italic" style={{ color: "#ef444490", maxWidth: 380 }}>
                        Error: {row.error_log.slice(0, 80)}{row.error_log.length > 80 ? "…" : ""}
                    </p>
                ) : <div />}

                <div className="flex shrink-0 items-center gap-2">
                    {status === "pending" && (
                        <>
                            <SolidBtn icon={Send} label="Send Now"
                                onClick={(e) => { stop(e); onSendNow(); }} color={GREEN} disabled={isSending} />
                            <OutlineBtn icon={Clock3} label="Reschedule"
                                onClick={(e) => { stop(e); onReschedule(); }} color="#3b82f6" />
                        </>
                    )}
                    {status === "failed" && (
                        <>
                            <SolidBtn icon={RefreshCw} label="Retry"
                                onClick={(e) => { stop(e); onRetry(); }} color="#f59e0b" disabled={isRetrying} />
                            <OutlineBtn icon={Clock3} label="Reschedule"
                                onClick={(e) => { stop(e); onReschedule(); }} color="#3b82f6" />
                        </>
                    )}
                    <GhostBtn icon={ChevronRight} label="Details" onClick={(e) => { stop(e); onView(); }} isDarkMode={isDarkMode} />
                </div>
            </div>
        </article>
    );
};

// ── Mini Calendar ─────────────────────────────────────────────────────────────

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const MiniCalendar = ({ value, onChange, min, max, isDarkMode }: {
    value: string; onChange: (v: string) => void; min?: string; max?: string; isDarkMode: boolean;
}) => {
    const today = new Date();
    const sel = value ? new Date(value + "T00:00:00") : null;
    const [vy, setVy] = useState(sel?.getFullYear() ?? today.getFullYear());
    const [vm, setVm] = useState(sel?.getMonth() ?? today.getMonth());
    const t = tx(isDarkMode);
    const minD = min ? new Date(min + "T00:00:00") : null;
    const maxD = max ? new Date(max + "T00:00:00") : null;
    const startDow = (new Date(vy, vm, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(vy, vm + 1, 0).getDate();
    const cells: (number | null)[] = [...Array(startDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
    while (cells.length % 7 !== 0) cells.push(null);

    const prevM = () => vm === 0 ? (setVm(11), setVy(y => y - 1)) : setVm(m => m - 1);
    const nextM = () => vm === 11 ? (setVm(0), setVy(y => y + 1)) : setVm(m => m + 1);
    const pick = (day: number) => {
        const d = new Date(vy, vm, day);
        if (minD && d < minD) return;
        if (maxD && d > maxD) return;
        onChange(`${vy}-${String(vm + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
    };
    const isSel = (d: number) => sel?.getFullYear() === vy && sel?.getMonth() === vm && sel?.getDate() === d;
    const isTod = (d: number) => today.getFullYear() === vy && today.getMonth() === vm && today.getDate() === d;
    const isDis = (d: number) => {
        const dt = new Date(vy, vm, d);
        return !!(minD && dt < minD) || !!(maxD && dt > maxD);
    };

    return (
        <div className="rounded-2xl shadow-2xl overflow-hidden"
            style={{ background: isDarkMode ? "#0c0c0e" : "#ffffff", border: `1px solid ${isDarkMode ? "#27272a" : "#e4e4e7"}`, width: 272 }}>
            <div style={{ height: 3, background: GREEN }} />
            <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <button type="button" onClick={prevM} className="flex h-7 w-7 items-center justify-center rounded-lg transition-all hover:brightness-110"
                        style={{ background: isDarkMode ? "rgba(255,255,255,0.07)" : "#f4f4f5", color: t.secondary }}>
                        <ChevronLeft size={14} />
                    </button>
                    <span style={{ fontSize: 13, fontWeight: 700, color: t.value }}>{MONTH_NAMES[vm]} {vy}</span>
                    <button type="button" onClick={nextM} className="flex h-7 w-7 items-center justify-center rounded-lg transition-all hover:brightness-110"
                        style={{ background: isDarkMode ? "rgba(255,255,255,0.07)" : "#f4f4f5", color: t.secondary }}>
                        <ChevronLeft size={14} className="rotate-180" />
                    </button>
                </div>
                <div className="mb-1 grid grid-cols-7">
                    {WEEKDAYS.map(w => (
                        <div key={w} className="flex h-7 items-center justify-center">
                            <span style={{ fontSize: 10, fontWeight: 700, color: t.micro }}>{w}</span>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-y-0.5">
                    {cells.map((day, i) => {
                        if (!day) return <div key={`_${i}`} className="h-8" />;
                        const s = isSel(day), td = isTod(day), dis = isDis(day);
                        return (
                            <button key={day} type="button" onClick={() => pick(day)} disabled={dis}
                                className="mx-auto flex h-8 w-8 items-center justify-center rounded-full text-[13px] transition-all"
                                style={{
                                    background: s ? GREEN : "transparent",
                                    color: s ? "#fff" : dis ? (isDarkMode ? "rgba(255,255,255,0.18)" : "#d4d4d8") : t.value,
                                    fontWeight: s || td ? 700 : 400,
                                    cursor: dis ? "not-allowed" : "pointer",
                                    boxShadow: s ? `0 2px 8px ${GREEN}50` : "none",
                                    outline: td && !s ? `2px solid ${GREEN}55` : "none",
                                    outlineOffset: -1,
                                }}>
                                {day}
                            </button>
                        );
                    })}
                </div>
                {value && (
                    <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${isDarkMode ? "#27272a" : "#f1f5f9"}` }}>
                        <button type="button" onClick={() => onChange("")}
                            className="w-full rounded-lg py-1.5 text-[11px] font-semibold transition-all hover:brightness-110"
                            style={{ color: t.micro, background: isDarkMode ? "rgba(255,255,255,0.04)" : "#f4f4f5" }}>
                            Clear date
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const DatePickerBtn = ({ value, onChange, placeholder, min, max, isDarkMode, borderColor }: {
    value: string; onChange: (v: string) => void; placeholder: string;
    min?: string; max?: string; isDarkMode: boolean; borderColor: string;
}) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const t = tx(isDarkMode);
    useEffect(() => {
        const h = (e: globalThis.MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        if (open) document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, [open]);

    return (
        <div ref={ref} className="relative">
            <button type="button" onClick={() => setOpen(o => !o)}
                className="inline-flex h-9 items-center gap-2 rounded-xl px-3 text-sm transition-all"
                style={{ background: value ? `${GREEN}12` : isDarkMode ? "#18181b" : "#ffffff", border: `1px solid ${value || open ? `${GREEN}50` : borderColor}`, color: value ? GREEN : t.micro, minWidth: 130 }}>
                <CalendarDays size={13} />
                <span style={{ fontSize: 12, fontWeight: value ? 600 : 400 }}>{value ? fmtDate(value) : placeholder}</span>
                <ChevronLeft size={11} className={`ml-auto transition-transform ${open ? "-rotate-90" : "rotate-180"}`} style={{ color: value ? GREEN : t.micro, opacity: 0.6 }} />
            </button>
            {open && (
                <div className="absolute left-0 top-full z-50 mt-2 animate-in fade-in slide-in-from-top-2 duration-150">
                    <MiniCalendar value={value} onChange={v => { onChange(v); if (v) setOpen(false); }} min={min} max={max} isDarkMode={isDarkMode} />
                </div>
            )}
        </div>
    );
};

// ── Skeleton Card ─────────────────────────────────────────────────────────────

const SkeletonCard = ({ isDarkMode }: { isDarkMode: boolean }) => {
    const pulse = isDarkMode ? "#27272a" : "#e4e4e7";
    const card = isDarkMode ? "#09090b" : "#ffffff";
    const border = isDarkMode ? "#27272a" : "#e4e4e7";
    return (
        <div className="overflow-hidden rounded-2xl" style={{ background: card, border: `1px solid ${border}` }}>
            <div className="flex items-center gap-3 px-5 py-3.5" style={{ borderBottom: `1px solid ${border}` }}>
                <div className="h-7 w-20 rounded-lg animate-pulse" style={{ background: pulse }} />
                <div className="h-8 w-8 rounded-lg animate-pulse" style={{ background: pulse }} />
                <div className="flex flex-col gap-1.5 flex-1">
                    <div className="h-3.5 w-32 rounded animate-pulse" style={{ background: pulse }} />
                    <div className="h-3 w-24 rounded animate-pulse" style={{ background: pulse }} />
                </div>
            </div>
            <div className="grid gap-5 px-5 py-4" style={{ gridTemplateColumns: "1fr 1fr 1.4fr 1.4fr" }}>
                {[1,2,3,4].map(i => (
                    <div key={i} className="flex flex-col gap-1.5">
                        <div className="h-2.5 w-14 rounded animate-pulse" style={{ background: pulse }} />
                        <div className="h-3.5 w-24 rounded animate-pulse" style={{ background: pulse }} />
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3" style={{ borderTop: `1px solid ${border}` }}>
                <div className="h-8 w-24 rounded-xl animate-pulse" style={{ background: pulse }} />
                <div className="h-8 w-20 rounded-xl animate-pulse" style={{ background: pulse }} />
            </div>
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────

interface AllRemindersViewProps {
    isDarkMode: boolean;
}

export const AllRemindersView = ({ isDarkMode }: AllRemindersViewProps) => {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRow, setSelectedRow] = useState<AppointmentReminderItem | null>(null);
    const [rescheduleTarget, setRescheduleTarget] = useState<{ id: number; scheduled_at: string | null } | null>(null);

    const retryMutation   = useRetryFollowUpMutation();
    const sendNowMutation = useSendNowFollowUpMutation();

    useEffect(() => {
        const id = setTimeout(() => { setDebouncedSearch(search); setCurrentPage(1); }, 350);
        return () => clearTimeout(id);
    }, [search]);

    useEffect(() => { setCurrentPage(1); }, [statusFilter, dateFrom, dateTo]);

    const filters: AppointmentReminderFilters = {
        ...(debouncedSearch && { patient_search: debouncedSearch }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo && { date_to: dateTo }),
        page: currentPage,
        limit: ITEMS_PER_PAGE,
    };

    const { data, isLoading, refetch } = useGetRemindersQuery(filters);

    const responseData = (data as any)?.data ?? data;
    const allItems: AppointmentReminderItem[] = responseData?.items ?? [];
    const serverTotal: number = responseData?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(serverTotal / ITEMS_PER_PAGE));

    const pending = allItems.filter(r => r.status === "pending").length;
    const sent    = allItems.filter(r => r.status === "sent").length;
    const failed  = allItems.filter(r => r.status === "failed").length;
    const pct = (n: number) => allItems.length > 0 ? Math.round((n / allItems.length) * 100) : 0;

    const t = tx(isDarkMode);
    const borderColor = isDarkMode ? "#27272a" : "#e4e4e7";

    const kpis = [
        { statusKey: "all" as StatusFilter,     label: "Total Reminders", value: serverTotal, icon: Bell,         color: "#10b981", barW: 100,          trend: "All records",               sub: "Click to view all",  badgeKey: "great" as const },
        { statusKey: "pending" as StatusFilter, label: "Pending",         value: pending,      icon: Timer,        color: "#f59e0b", barW: pct(pending), trend: `${pct(pending)}% of page`, sub: "Awaiting send",      badgeKey: (pending > 0 ? "watch" : "great") as "watch" | "great" },
        { statusKey: "sent" as StatusFilter,    label: "Sent",            value: sent,         icon: CheckCircle2, color: "#10b981", barW: pct(sent),    trend: `${pct(sent)}% of page`,    sub: "Delivered",          badgeKey: (sent > 0 ? "great" : "good") as "great" | "good" },
        { statusKey: "failed" as StatusFilter,  label: "Failed",          value: failed,       icon: AlertCircle,  color: "#ef4444", barW: pct(failed),  trend: `${pct(failed)}% of page`,  sub: "Needs attention",    badgeKey: (failed > 0 ? "watch" : "great") as "watch" | "great" },
    ];

    const handleRetry = (id: number) => {
        retryMutation.mutate(id, {
            onSuccess: () => { toast.success("Reminder queued for retry."); refetch(); },
            onError: () => toast.error("Retry failed."),
        });
    };

    const handleSendNow = (id: number) => {
        sendNowMutation.mutate(id, {
            onSuccess: () => { toast.success("Reminder sent."); refetch(); },
            onError: () => toast.error("Send failed."),
        });
    };

    return (
        <div className="space-y-5">
            {/* KPI row */}
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                {kpis.map((k, i) => (
                    <KPICard
                        key={k.statusKey} {...k} index={i} isDarkMode={isDarkMode}
                        active={statusFilter === k.statusKey}
                        onClick={() => setStatusFilter(prev => prev === k.statusKey ? "all" : k.statusKey)}
                    />
                ))}
            </div>

            {/* Filter bar */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: t.micro }} />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search patient name…"
                        className="h-9 rounded-xl pl-8 pr-3 text-sm outline-none"
                        style={{ border: `1px solid ${borderColor}`, background: isDarkMode ? "#18181b" : "#ffffff", color: t.primary, width: 220 }}
                    />
                    {search && (
                        <button type="button" onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                            <X size={12} style={{ color: t.micro }} />
                        </button>
                    )}
                </div>

                {/* Status pills */}
                <div className="flex items-center gap-1.5">
                    {(["all", "pending", "sent", "failed"] as StatusFilter[]).map(s => {
                        const count = s === "all" ? serverTotal : s === "pending" ? pending : s === "sent" ? sent : failed;
                        const color = s === "all" ? GREEN : (STATUS_COLOR as any)[s];
                        const active = statusFilter === s;
                        return (
                            <button key={s} type="button" onClick={() => setStatusFilter(s)}
                                className="inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold transition-all capitalize"
                                style={{ background: active ? `${color}14` : "transparent", border: `1px solid ${active ? color + "40" : borderColor}`, color: active ? color : t.micro }}>
                                {s}
                                <span className="rounded-full px-1.5 py-px text-[10px] font-bold"
                                    style={{ background: active ? `${color}20` : isDarkMode ? "#27272a" : "#e4e4e7", color: active ? color : t.micro }}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Date range */}
                <div className="flex items-center gap-2 ml-auto">
                    <DatePickerBtn value={dateFrom} onChange={v => setDateFrom(v)} placeholder="From date" max={dateTo || undefined} isDarkMode={isDarkMode} borderColor={borderColor} />
                    <span style={{ color: t.micro, fontSize: 12 }}>–</span>
                    <DatePickerBtn value={dateTo} onChange={v => setDateTo(v)} placeholder="To date" min={dateFrom || undefined} isDarkMode={isDarkMode} borderColor={borderColor} />
                </div>
            </div>

            {/* Card list */}
            {isLoading ? (
                <div className="space-y-3">
                    {[1,2,3].map(i => <SkeletonCard key={i} isDarkMode={isDarkMode} />)}
                </div>
            ) : allItems.length === 0 ? (
                <div className={cn("flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed", isDarkMode ? "border-white/10 text-white/30" : "border-slate-200 text-slate-400")}>
                    <Bell size={36} className="mb-3 opacity-30" />
                    <p className="text-sm font-medium">No reminders found</p>
                    <p className="text-xs mt-1 opacity-60">Try adjusting filters or date range</p>
                </div>
            ) : (
                <>
                    <div className="space-y-3">
                        {allItems.map(row => (
                            <ReminderCard
                                key={row.id}
                                row={row}
                                isDarkMode={isDarkMode}
                                onView={() => setSelectedRow(row)}
                                onRetry={() => handleRetry(row.id)}
                                onSendNow={() => handleSendNow(row.id)}
                                onReschedule={() => setRescheduleTarget({ id: row.id, scheduled_at: row.scheduled_at ?? null })}
                                isRetrying={retryMutation.isPending}
                                isSending={sendNowMutation.isPending}
                            />
                        ))}
                    </div>

                    {/* Pagination footer */}
                    <div className="flex items-center justify-between py-2">
                        <p style={{ fontSize: 12, color: t.micro }}>
                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, serverTotal)} of {serverTotal} reminder{serverTotal !== 1 ? "s" : ""}
                        </p>
                        {totalPages > 1 && (
                            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} isDarkMode={isDarkMode} />
                        )}
                    </div>
                </>
            )}

            {/* Detail drawer */}
            <ReminderDetailDrawer
                isOpen={!!selectedRow}
                onClose={() => setSelectedRow(null)}
                row={selectedRow}
                isDarkMode={isDarkMode}
                onRetry={() => selectedRow && handleRetry(selectedRow.id)}
                onSendNow={() => selectedRow && handleSendNow(selectedRow.id)}
                onReschedule={() => {
                    if (selectedRow) {
                        setRescheduleTarget({ id: selectedRow.id, scheduled_at: selectedRow.scheduled_at ?? null });
                        setSelectedRow(null);
                    }
                }}
                isRetrying={retryMutation.isPending}
                isSending={sendNowMutation.isPending}
            />

            {/* Reschedule drawer */}
            <RescheduleDrawer
                isOpen={!!rescheduleTarget}
                onClose={() => setRescheduleTarget(null)}
                scheduledMsgId={rescheduleTarget?.id ?? null}
                currentScheduledAt={rescheduleTarget?.scheduled_at ?? null}
                isDarkMode={isDarkMode}
            />
        </div>
    );
};
