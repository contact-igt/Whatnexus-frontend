/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef, type MouseEvent } from "react";
import {
  Search, Inbox, RefreshCw, Send, Clock3, MessageCircle,
  PhoneCall, FileText, Plus, Download,
  Timer, CheckCircle2, AlertCircle, ListFilter, Calendar, CalendarDays,
  X, ChevronLeft, ChevronRight, Zap, TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { Pagination } from "@/components/ui/pagination";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/lib/toast";
import { handleCSVDownloadData } from "@/hooks/useExportDataToExcel";
import {
  useGetFollowUpHubQuery,
  useRetryFollowUpMutation,
  useSendNowFollowUpMutation,
} from "@/hooks/useFollowUpHubQuery";
import {
  type FollowUpHubRow,
  type FollowUpHubFilters,
} from "@/services/appointment";
import { RescheduleDrawer } from "./RescheduleDrawer";
import { usePathname, useRouter } from "next/navigation";
import { glassCard, glassInner, tx } from "@/components/views/dashboard/glassStyles";

const ITEMS_PER_PAGE = 10;
type TypeFilter = "all" | "Call" | "Visit" | "WhatsApp";
type StatusFilter = "all" | "pending" | "sent" | "failed";
type SendTypeFilter = "all" | "follow_up" | "noshow";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDate = (v?: string | null) => {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtTime = (v?: string | null) => {
  if (!v) return "";
  return v.includes(":") ? v.slice(0, 5) : v;
};

const fmtDateTime = (v?: string | null) => {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

// ── Theme tokens ──────────────────────────────────────────────────────────────

const GREEN = "#10b981";

const STATUS_COLOR = {
  pending: "#f59e0b",
  sent:    "#10b981",
  failed:  "#ef4444",
} as const;

const TYPE_COLOR = {
  WhatsApp: "#10b981",
  Call:     "#3b82f6",
  Visit:    "#22c55e",
} as const;

const TRIGGER_COLOR = {
  follow_up: "#8b5cf6",
  noshow:    "#f97316",
} as const;

// ── KPI Status badge (mirrors dashboard pattern) ──────────────────────────────

const kpiBadge: Record<string, { label: string; bg: string; color: string; border: string; dot: string }> = {
  great: { label: "✓ Great", bg: "rgba(16,185,129,0.12)",  color: "#34d399", border: "rgba(16,185,129,0.25)", dot: "#10b981" },
  good:  { label: "↑ Good",  bg: "rgba(16,185,129,0.08)",  color: "#6ee7b7", border: "rgba(16,185,129,0.18)", dot: "#10b981" },
  watch: { label: "! Watch", bg: "rgba(244,63,94,0.12)",   color: "#fb7185", border: "rgba(244,63,94,0.25)",  dot: "#f43f5e" },
};

// ── KPI Card — matches dashboard executiveKpiSnapshot style ───────────────────

const KPICard = ({
  label, value, icon: Icon, barW, sub, trend, badgeKey, color, onClick, active, index, isDarkMode,
}: {
  label: string;
  value: number;
  icon: any;
  barW: number;
  sub: string;
  trend: string;
  badgeKey: "great" | "good" | "watch";
  color: string;
  onClick: () => void;
  active: boolean;
  index: number;
  isDarkMode: boolean;
}) => {
  const [show, setShow] = useState(false);
  useEffect(() => { const id = setTimeout(() => setShow(true), 100 + index * 50); return () => clearTimeout(id); }, [index]);

  const badge = kpiBadge[badgeKey];
  const t = tx(isDarkMode);
  const borderColor = active ? `${color}55` : isDarkMode ? "#27272a" : "#e4e4e7";

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl p-5 flex flex-col gap-3 relative text-left w-full"
      style={{
        ...glassCard(isDarkMode),
        border: `1px solid ${borderColor}`,
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(8px)",
        transition: `opacity 0.4s ease ${index * 40}ms, transform 0.4s ease ${index * 40}ms`,
      }}
    >
      {/* Icon + badge */}
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center border"
          style={{ background: `${color}15`, color, borderColor: `${color}30` }}
        >
          <Icon size={18} />
        </div>
        <span
          className="px-2 py-0.5 rounded-md flex items-center gap-1.5"
          style={{ background: badge.bg, color: badge.color, fontSize: 11, fontWeight: 600, border: `1px solid ${badge.border}` }}
        >
          <div className="w-1 h-1 rounded-full" style={{ background: badge.dot }} />
          {badge.label}
        </span>
      </div>

      {/* Label + value */}
      <div className="mt-1">
        <p style={{ fontSize: 13, fontWeight: 500, color: t.secondary, marginBottom: 6 }}>{label}</p>
        <h4 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1, fontVariantNumeric: "tabular-nums", color: t.value }}>
          {value}
        </h4>
      </div>

      {/* Trend row */}
      <div className="flex items-center gap-2 mt-2">
        <div className="flex items-center gap-1">
          <TrendingUp size={12} style={{ color }} />
          <span style={{ fontSize: 12, fontWeight: 500, color }}>{trend}</span>
        </div>
        <span style={{ fontSize: 12, color: t.micro }}>• {sub}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full rounded-full overflow-hidden mt-3" style={{ background: isDarkMode ? "#27272a" : "#e4e4e7" }}>
        <div
          className="h-full rounded-full"
          style={{
            width: show ? `${Math.min(barW, 100)}%` : "0%",
            background: color,
            transition: `width 1000ms cubic-bezier(0.22,1,0.36,1) ${index * 50 + 200}ms`,
          }}
        />
      </div>
    </button>
  );
};

// ── Fact item (used inside card grid) ────────────────────────────────────────

const FactItem = ({
  label, value, sub, accent, isDarkMode,
}: {
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
        <p className="truncate" style={{ fontSize: 11, color: t.micro }}>
          {sub}
        </p>
      )}
    </div>
  );
};

// ── Card Action Buttons ────────────────────────────────────────────────────────

const SolidBtn = ({ icon: Icon, label, onClick, color, disabled }: {
  icon: any; label: string; onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  color: string; disabled?: boolean;
}) => (
  <button type="button" onClick={onClick} disabled={disabled}
    className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-bold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
    style={{ background: color, boxShadow: `0 2px 10px ${color}45` }}
  >
    <Icon size={12} /> {label}
  </button>
);

const OutlineBtn = ({ icon: Icon, label, onClick, color, disabled }: {
  icon: any; label: string; onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  color: string; disabled?: boolean;
}) => (
  <button type="button" onClick={onClick} disabled={disabled}
    className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 hover:brightness-110"
    style={{ background: `${color}14`, border: `1.5px solid ${color}40`, color }}
  >
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
    }}
  >
    {label} <Icon size={12} />
  </button>
);

// ── Follow-up Card — ticket style ────────────────────────────────────────────

const FollowUpCard = ({
  row, isDarkMode, onView, onRetry, onReschedule, onSendNow, onChat, isRetrying, isSending,
}: {
  row: FollowUpHubRow; isDarkMode: boolean;
  onView: () => void; onRetry: () => void; onReschedule: () => void;
  onSendNow: () => void; onChat: () => void;
  isRetrying: boolean; isSending: boolean;
}) => {
  const msg = row.scheduled_message;
  const statusKey = (msg?.status ?? "pending") as keyof typeof STATUS_COLOR;
  const statusColor = STATUS_COLOR[statusKey] ?? "#64748b";
  const t = tx(isDarkMode);

  const initial = (row.patient_name || "?").charAt(0).toUpperCase();
  const apptDate = fmtDate(row.appointment_date);
  const followDate = fmtDate(row.follow_up_date);
  const followTime = fmtTime(row.follow_up_time);
  const scheduledAt = fmtDateTime(msg?.scheduled_at);
  const typeColor = (TYPE_COLOR as any)[row.follow_up_type] ?? "#64748b";
  const triggerColor = row.send_type ? (TRIGGER_COLOR as any)[row.send_type] : null;
  const TypeIcon = row.follow_up_type === "WhatsApp" ? MessageCircle : row.follow_up_type === "Call" ? PhoneCall : Calendar;
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
      {/* ── Header row ─────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between gap-4 px-5 py-3.5"
        style={{ borderBottom: `1px solid ${divider}` }}
      >
        {/* Left: status + avatar + patient */}
        <div className="flex items-center gap-3 min-w-0">
          {msg ? (
            <span
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold"
              style={{ background: `${statusColor}18`, border: `1px solid ${statusColor}35`, color: statusColor }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusColor }} />
              {msg.status.charAt(0).toUpperCase() + msg.status.slice(1)}
            </span>
          ) : (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold"
              style={{ background: isDarkMode ? "rgba(255,255,255,0.05)" : "#f4f4f5", color: t.micro }}>
              <Clock3 size={10} />
              Pending action
            </span>
          )}

          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-black"
            style={{ background: `${statusColor}15`, color: statusColor }}
          >
            {initial}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight truncate" style={{ color: t.value }}>
              {row.patient_name || "—"}
            </p>
            <p className="text-xs tabular-nums" style={{ color: t.micro }}>
              {row.phone || "—"}
            </p>
          </div>
        </div>

        {/* Right: type + trigger chips */}
        <div className="flex shrink-0 items-center gap-1.5">
          <span
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold"
            style={{ background: `${typeColor}12`, border: `1px solid ${typeColor}25`, color: typeColor }}
          >
            <TypeIcon size={10} /> {row.follow_up_type}
          </span>
          {row.send_type && triggerColor && (
            <span
              className="inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-semibold"
              style={{ background: `${triggerColor}12`, border: `1px solid ${triggerColor}25`, color: triggerColor }}
            >
              {row.send_type === "noshow" ? "No-show" : "Follow-up"}
            </span>
          )}
        </div>
      </div>

      {/* ── Facts grid ─────────────────────────────────────────────── */}
      <div
        className="grid gap-5 px-5 py-4"
        style={{ gridTemplateColumns: "1fr 1fr 1.4fr 1.4fr" }}
      >
        <FactItem label="Doctor" value={row.doctor_name || "—"} isDarkMode={isDarkMode} />
        <FactItem label="Appointment" value={apptDate || "—"} isDarkMode={isDarkMode} />
        <FactItem
          label="Follow-up"
          value={followDate ? `${followDate}${followTime ? ` · ${followTime}` : ""}` : "—"}
          sub={row.follow_up_reason || undefined}
          accent="#10b981"
          isDarkMode={isDarkMode}
        />
        <FactItem
          label="Template"
          value={msg?.template_name || "—"}
          sub={scheduledAt || undefined}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* ── Footer: notes + actions ─────────────────────────────────── */}
      <div
        className="flex items-center justify-between gap-4 px-5 py-3"
        style={{ borderTop: `1px solid ${divider}`, background: isDarkMode ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.015)" }}
        onClick={stop}
      >
        {row.notes?.trim() ? (
          <p className="truncate text-[11px] italic" style={{ color: t.micro, maxWidth: 380 }}>
            "{row.notes.trim()}"
          </p>
        ) : <div />}

        <div className="flex shrink-0 items-center gap-2">
          {/* ── WhatsApp message actions ── */}
          {msg?.status === "sent" && (
            <SolidBtn icon={MessageCircle} label="Open chat"
              onClick={(e) => { stop(e); onChat(); }} color="#10b981" disabled={!row.phone} />
          )}
          {msg?.status === "pending" && (
            <>
              <SolidBtn icon={Send} label="Send now"
                onClick={(e) => { stop(e); onSendNow(); }} color="#10b981" disabled={isSending} />
              <OutlineBtn icon={Clock3} label="Reschedule"
                onClick={(e) => { stop(e); onReschedule(); }} color="#3b82f6" />
            </>
          )}
          {msg?.status === "failed" && (
            <>
              <SolidBtn icon={RefreshCw} label="Retry"
                onClick={(e) => { stop(e); onRetry(); }} color="#f59e0b" disabled={isRetrying} />
              <OutlineBtn icon={Clock3} label="Reschedule"
                onClick={(e) => { stop(e); onReschedule(); }} color="#3b82f6" />
            </>
          )}
          {/* ── No scheduled message = manual follow-up (Call / Visit) ── */}
          {!msg && (
            <span
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold"
              style={{
                background: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.10)" : "#e4e4e7"}`,
                color: t.micro,
              }}
            >
              {row.follow_up_type === "Call" ? <PhoneCall size={11} /> : <Calendar size={11} />}
              Manual {row.follow_up_type} required
            </span>
          )}
          <GhostBtn icon={ChevronRight} label="Details"
            onClick={(e) => { stop(e); onView(); }} isDarkMode={isDarkMode} />
        </div>
      </div>
    </article>
  );
};

// ── Custom Calendar ───────────────────────────────────────────────────────────

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const CustomCalendar = ({
  value, onChange, min, max, isDarkMode,
}: {
  value: string; onChange: (v: string) => void;
  min?: string; max?: string; isDarkMode: boolean;
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
  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => vm === 0 ? (setVm(11), setVy(y => y - 1)) : setVm(m => m - 1);
  const nextMonth = () => vm === 11 ? (setVm(0), setVy(y => y + 1)) : setVm(m => m + 1);

  const pick = (day: number) => {
    const d = new Date(vy, vm, day);
    if (minD && d < minD) return;
    if (maxD && d > maxD) return;
    onChange(`${vy}-${String(vm + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
  };

  const isSel  = (d: number) => sel?.getFullYear() === vy && sel?.getMonth() === vm && sel?.getDate() === d;
  const isTod  = (d: number) => today.getFullYear() === vy && today.getMonth() === vm && today.getDate() === d;
  const isDis  = (d: number) => {
    const dt = new Date(vy, vm, d);
    return (minD !== null && dt < minD) || (maxD !== null && dt > maxD);
  };

  return (
    <div
      className="rounded-2xl shadow-2xl"
      style={{
        width: 272,
        background: isDarkMode ? "#0c0c0e" : "#ffffff",
        border: `1px solid ${isDarkMode ? "#27272a" : "#e4e4e7"}`,
        overflow: "hidden",
      }}
    >
      {/* Green top stripe */}
      <div style={{ height: 3, background: GREEN }} />

      <div className="p-4">
        {/* Month / year nav */}
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button" onClick={prevMonth}
            className="flex h-7 w-7 items-center justify-center rounded-lg transition-all hover:brightness-110"
            style={{ background: isDarkMode ? "rgba(255,255,255,0.07)" : "#f4f4f5", color: t.secondary }}
          >
            <ChevronLeft size={14} />
          </button>
          <p className="text-[13px] font-bold" style={{ color: t.value }}>
            {MONTH_NAMES[vm]} {vy}
          </p>
          <button
            type="button" onClick={nextMonth}
            className="flex h-7 w-7 items-center justify-center rounded-lg transition-all hover:brightness-110"
            style={{ background: isDarkMode ? "rgba(255,255,255,0.07)" : "#f4f4f5", color: t.secondary }}
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Weekday row */}
        <div className="mb-1 grid grid-cols-7">
          {WEEKDAYS.map(d => (
            <div key={d} className="flex h-7 items-center justify-center">
              <span style={{ fontSize: 10, fontWeight: 700, color: t.micro }}>{d}</span>
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-y-0.5">
          {cells.map((day, i) => {
            if (!day) return <div key={`_${i}`} className="h-8" />;
            const s = isSel(day), td = isTod(day), dis = isDis(day);
            return (
              <button
                key={day} type="button"
                onClick={() => pick(day)}
                disabled={dis}
                className="mx-auto flex h-8 w-8 items-center justify-center rounded-full text-[13px] transition-all"
                style={{
                  background: s ? GREEN : "transparent",
                  color: s ? "#fff" : dis ? (isDarkMode ? "rgba(255,255,255,0.18)" : "#d4d4d8") : t.value,
                  fontWeight: s || td ? 700 : 400,
                  cursor: dis ? "not-allowed" : "pointer",
                  boxShadow: s ? `0 2px 8px ${GREEN}50` : "none",
                  outline: td && !s ? `2px solid ${GREEN}55` : "none",
                  outlineOffset: -1,
                }}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Clear row */}
        {value && (
          <div
            className="mt-3 pt-3"
            style={{ borderTop: `1px solid ${isDarkMode ? "#27272a" : "#f1f5f9"}` }}
          >
            <button
              type="button" onClick={() => onChange("")}
              className="w-full rounded-lg py-1.5 text-[11px] font-semibold transition-all hover:brightness-110"
              style={{ color: t.micro, background: isDarkMode ? "rgba(255,255,255,0.04)" : "#f4f4f5" }}
            >
              Clear date
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Date Picker Button ────────────────────────────────────────────────────────

const DatePickerBtn = ({
  value, onChange, placeholder, min, max, isDarkMode, borderColor,
}: {
  value: string; onChange: (v: string) => void; placeholder: string;
  min?: string; max?: string; isDarkMode: boolean; borderColor: string;
}) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const t = tx(isDarkMode);

  useEffect(() => {
    const handler = (e: globalThis.MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handlePick = (v: string) => { onChange(v); if (v) setOpen(false); };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inline-flex h-9 items-center gap-2 rounded-xl px-3 text-sm transition-all"
        style={{
          background: value ? `${GREEN}12` : isDarkMode ? "#18181b" : "#ffffff",
          border: `1px solid ${value || open ? `${GREEN}50` : borderColor}`,
          color: value ? GREEN : t.micro,
          minWidth: 132,
        }}
      >
        <CalendarDays size={13} />
        <span style={{ fontSize: 12, fontWeight: value ? 600 : 400 }}>
          {value ? fmtDate(value) : placeholder}
        </span>
        <ChevronLeft size={11} className={`ml-auto transition-transform ${open ? "-rotate-90" : "rotate-180"}`} style={{ color: value ? GREEN : t.micro, opacity: 0.6 }} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <CustomCalendar
            value={value} onChange={handlePick}
            min={min} max={max} isDarkMode={isDarkMode}
          />
        </div>
      )}
    </div>
  );
};

// ── Main View ─────────────────────────────────────────────────────────────────

export const FollowUpHubView = () => {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sendTypeFilter, setSendTypeFilter] = useState<SendTypeFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rescheduleTarget, setRescheduleTarget] = useState<{ id: number; scheduled_at: string | null } | null>(null);
  const [sendNowTarget, setSendNowTarget] = useState<number | null>(null);

  const retryMutation = useRetryFollowUpMutation();
  const sendNowMutation = useSendNowFollowUpMutation();

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(searchQuery); setCurrentPage(1); }, 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const baseFilters: FollowUpHubFilters = {
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(typeFilter !== "all" && { type: typeFilter }),
    ...(sendTypeFilter !== "all" && { send_type: sendTypeFilter }),
    ...(dateFrom && { date_from: dateFrom }),
    ...(dateTo && { date_to: dateTo }),
  };

  const { data, isLoading } = useGetFollowUpHubQuery(baseFilters);
  const allRows: FollowUpHubRow[] = (data as any)?.data ?? [];

  const rows =
    statusFilter === "all"
      ? allRows
      : allRows.filter((r) => r.scheduled_message?.status === statusFilter);

  const totalCount   = allRows.length;
  const pendingCount = allRows.filter((r) => r.scheduled_message?.status === "pending").length;
  const sentCount    = allRows.filter((r) => r.scheduled_message?.status === "sent").length;
  const failedCount  = allRows.filter((r) => r.scheduled_message?.status === "failed").length;

  const totalPages = Math.max(1, Math.ceil(rows.length / ITEMS_PER_PAGE));
  const pagedRows = rows.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const openDetail = (row: FollowUpHubRow) => {
    const base = pathname?.startsWith("/followup-hub") ? "/followup-hub" : "/followups";
    router.push(`${base}/${row.outcome_id}`);
  };

  const handleExport = () => {
    if (!rows.length) { toast.error("No records to export."); return; }
    handleCSVDownloadData(
      rows.map((r) => ({
        patient_name: r.patient_name || "",
        phone: r.phone || "",
        appointment_date: fmtDate(r.appointment_date),
        appointment_status: r.appointment_status || "",
        follow_up_date: fmtDate(r.follow_up_date),
        follow_up_time: fmtTime(r.follow_up_time),
        type: r.follow_up_type || "",
        reason: r.follow_up_reason || "",
        trigger: r.send_type === "noshow" ? "No-show" : r.send_type === "follow_up" ? "Follow-up" : "",
        template: r.scheduled_message?.template_name || "",
        message_status: r.scheduled_message?.status || "",
        scheduled_at: fmtDateTime(r.scheduled_message?.scheduled_at || ""),
        sent_at: fmtDateTime(r.scheduled_message?.sent_at || ""),
        notes: r.notes || "",
      })),
      `followup_hub_${new Date().toISOString().slice(0, 10)}`,
    );
    toast.success("Export downloaded.");
  };

  // Style tokens
  const t = tx(isDarkMode);
  const pageBg = isDarkMode ? "#09090b" : "#f8fafc";
  const borderColor = isDarkMode ? "#27272a" : "#e4e4e7";
  const inputStyle: React.CSSProperties = {
    height: 36,
    borderRadius: 10,
    border: `1px solid ${borderColor}`,
    padding: "0 12px",
    fontSize: 13,
    outline: "none",
    background: isDarkMode ? "#18181b" : "#ffffff",
    color: t.primary,
  };

  const pct = (n: number) => totalCount > 0 ? Math.round((n / totalCount) * 100) : 0;
  const kpis = [
    { key: "all" as StatusFilter,     label: "Total Follow-ups", value: totalCount,   icon: TrendingUp,   color: "#10b981", barW: 100,               trend: "All records",           sub: "Click to view all",      badgeKey: "great" as const },
    { key: "pending" as StatusFilter, label: "Pending",          value: pendingCount, icon: Timer,        color: "#f59e0b", barW: pct(pendingCount), trend: `${pct(pendingCount)}% of total`, sub: "Awaiting send",     badgeKey: (pendingCount > 0 ? "watch" : "great") as "watch" | "great" },
    { key: "sent" as StatusFilter,    label: "Sent",             value: sentCount,    icon: CheckCircle2, color: "#10b981", barW: pct(sentCount),    trend: `${pct(sentCount)}% of total`,    sub: "Delivered",          badgeKey: (sentCount > 0 ? "great" : "good") as "great" | "good" },
    { key: "failed" as StatusFilter,  label: "Failed",           value: failedCount,  icon: AlertCircle,  color: "#ef4444", barW: pct(failedCount),  trend: `${pct(failedCount)}% of total`,  sub: "Needs attention",    badgeKey: (failedCount > 0 ? "watch" : "great") as "watch" | "great" },
  ];

  const filterChip = (
    active: boolean, color: string, label: string, count: number,
    onClick: () => void,
  ) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      className="inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold transition-all"
      style={{
        background: active ? `${color}14` : "transparent",
        border: `1px solid ${active ? color + "40" : borderColor}`,
        color: active ? color : t.micro,
      }}
    >
      {label}
      <span
        className="rounded-full px-1.5 py-px text-[10px] font-bold"
        style={{
          background: active ? `${color}20` : isDarkMode ? "#27272a" : "#e4e4e7",
          color: active ? color : t.micro,
        }}
      >
        {count}
      </span>
    </button>
  );

  const segBtn = (active: boolean, label: string, onClick: () => void) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
      style={{
        background: active ? isDarkMode ? "#27272a" : "#ffffff" : "transparent",
        color: active ? t.primary : t.micro,
        boxShadow: active ? (isDarkMode ? "0 1px 3px rgba(0,0,0,0.4)" : "0 1px 3px rgba(0,0,0,0.1)") : "none",
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen space-y-5 p-6 animate-in slide-in-from-bottom-4 duration-500" style={{ background: pageBg }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: "#10b98118", border: "1px solid #10b98130", color: "#10b981" }}
          >
            <Zap size={18} />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: t.value, letterSpacing: "-0.01em" }}>
              Follow-up Hub
            </h1>
            <p className="text-xs" style={{ color: t.micro }}>
              Track WhatsApp &amp; call follow-ups with live status
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-all"
            style={{ ...glassCard(isDarkMode), color: t.secondary, border: `1px solid ${borderColor}` }}
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            type="button"
            onClick={() => router.push("/appointments?create=1")}
            className="inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white transition-all hover:brightness-110"
            style={{ background: "#10b981" }}
          >
            <Plus className="h-4 w-4" />
            New appointment
          </button>
        </div>
      </header>

      {/* ── KPI Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kpis.map((k, i) => (
          <KPICard
            key={k.key}
            label={k.label}
            value={k.value}
            icon={k.icon}
            color={k.color}
            barW={k.barW}
            trend={k.trend}
            sub={k.sub}
            badgeKey={k.badgeKey}
            index={i}
            active={statusFilter === k.key}
            isDarkMode={isDarkMode}
            onClick={() => { setStatusFilter(k.key); setCurrentPage(1); }}
          />
        ))}
      </div>

      {/* ── Filter panel ────────────────────────────────────────── */}
      <div className="rounded-xl p-4 space-y-3" style={{ ...glassCard(isDarkMode) }}>

        {/* Row 1: search + trigger control + dates */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: t.micro }} />
            <input
              type="text"
              placeholder="Search patient name or phone…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full outline-none"
              style={{ ...inputStyle, paddingLeft: 36 }}
            />
          </div>

          {/* Trigger segmented control */}
          <div
            className="inline-flex items-center gap-0.5 rounded-xl p-0.5"
            style={{ background: isDarkMode ? "#18181b" : "#f4f4f5", border: `1px solid ${borderColor}` }}
          >
            {segBtn(sendTypeFilter === "all", "All triggers", () => { setSendTypeFilter("all"); setCurrentPage(1); })}
            {segBtn(sendTypeFilter === "follow_up", "Follow-up", () => { setSendTypeFilter("follow_up"); setCurrentPage(1); })}
            {segBtn(sendTypeFilter === "noshow", "No-show", () => { setSendTypeFilter("noshow"); setCurrentPage(1); })}
          </div>

          {/* Date range */}
          <div className="flex items-center gap-1.5">
            <DatePickerBtn
              value={dateFrom}
              onChange={(v) => { setDateFrom(v); setCurrentPage(1); }}
              placeholder="From date"
              max={dateTo || undefined}
              isDarkMode={isDarkMode}
              borderColor={borderColor}
            />
            <span style={{ fontSize: 12, color: t.micro }}>→</span>
            <DatePickerBtn
              value={dateTo}
              onChange={(v) => { setDateTo(v); setCurrentPage(1); }}
              placeholder="To date"
              min={dateFrom || undefined}
              isDarkMode={isDarkMode}
              borderColor={borderColor}
            />
            {(dateFrom || dateTo) && (
              <button
                type="button"
                onClick={() => { setDateFrom(""); setDateTo(""); setCurrentPage(1); }}
                className="flex h-9 w-9 items-center justify-center rounded-xl transition-all hover:brightness-110"
                style={{ border: `1px solid ${borderColor}`, color: t.micro, background: isDarkMode ? "#18181b" : "#ffffff" }}
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Row 2: filter chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <ListFilter className="h-3.5 w-3.5 shrink-0" style={{ color: t.micro }} />

          {filterChip(statusFilter === "all", "#10b981", "All", totalCount, () => { setStatusFilter("all"); setCurrentPage(1); })}
          {filterChip(statusFilter === "pending", "#f59e0b", "Pending", pendingCount, () => { setStatusFilter("pending"); setCurrentPage(1); })}
          {filterChip(statusFilter === "failed", "#ef4444", "Failed", failedCount, () => { setStatusFilter("failed"); setCurrentPage(1); })}
          {filterChip(statusFilter === "sent", "#10b981", "Sent", sentCount, () => { setStatusFilter("sent"); setCurrentPage(1); })}

          <span className="h-4 w-px mx-1" style={{ background: borderColor }} />

          {(["WhatsApp", "Call"] as TypeFilter[]).map((t_) => (
            filterChip(
              typeFilter === t_,
              TYPE_COLOR[t_ as keyof typeof TYPE_COLOR],
              t_,
              allRows.filter((r) => r.follow_up_type === t_).length,
              () => { setTypeFilter(typeFilter === t_ ? "all" : t_); setCurrentPage(1); },
            )
          ))}
        </div>
      </div>

      {/* ── Results count + clear ────────────────────────────────── */}
      {!isLoading && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-medium" style={{ color: t.micro }}>
            {rows.length} follow-up{rows.length !== 1 ? "s" : ""} found
          </p>
          {(searchQuery || typeFilter !== "all" || statusFilter !== "all" || sendTypeFilter !== "all" || dateFrom || dateTo) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery(""); setTypeFilter("all"); setStatusFilter("all");
                setSendTypeFilter("all"); setDateFrom(""); setDateTo(""); setCurrentPage(1);
              }}
              className="text-xs font-semibold transition-colors"
              style={{ color: "#10b981" }}
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* ── Card list ─────────────────────────────────────────────── */}
      <div className="space-y-2.5">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-[172px] animate-pulse rounded-xl"
              style={{ background: isDarkMode ? "#18181b" : "#f4f4f5", border: `1px solid ${borderColor}` }}
            />
          ))
        ) : pagedRows.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center rounded-xl py-24"
            style={{ ...glassCard(isDarkMode) }}
          >
            <div
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: isDarkMode ? "#18181b" : "#f4f4f5", border: `1px solid ${borderColor}` }}
            >
              <Inbox className="h-7 w-7" style={{ color: t.micro }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: t.secondary }}>
              No follow-ups found
            </p>
            <p className="mt-1 text-xs" style={{ color: t.micro }}>
              Try adjusting your filters or search
            </p>
          </div>
        ) : (
          pagedRows.map((row) => (
            <FollowUpCard
              key={row.outcome_id}
              row={row}
              isDarkMode={isDarkMode}
              onView={() => openDetail(row)}
              onRetry={() => row.scheduled_message && retryMutation.mutate(row.scheduled_message.id)}
              onReschedule={() =>
                row.scheduled_message &&
                setRescheduleTarget({ id: row.scheduled_message.id, scheduled_at: row.scheduled_message.scheduled_at })
              }
              onSendNow={() => row.scheduled_message && setSendNowTarget(row.scheduled_message.id)}
              onChat={() => router.push(`/chats?phone=${encodeURIComponent(row.phone || "")}`)}
              isRetrying={retryMutation.isPending}
              isSending={sendNowMutation.isPending}
            />
          ))
        )}
      </div>

      {/* ── Pagination ───────────────────────────────────────────── */}
      {!isLoading && rows.length > ITEMS_PER_PAGE && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={rows.length}
          itemsPerPage={ITEMS_PER_PAGE}
          isDarkMode={isDarkMode}
        />
      )}

      {/* ── Reschedule drawer ─────────────────────────────────────── */}
      <RescheduleDrawer
        key={rescheduleTarget?.id ?? "none"}
        isOpen={!!rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
        scheduledMsgId={rescheduleTarget?.id ?? null}
        currentScheduledAt={rescheduleTarget?.scheduled_at ?? null}
        isDarkMode={isDarkMode}
      />

      {/* ── Send-now modal ────────────────────────────────────────── */}
      <Modal
        isOpen={sendNowTarget !== null}
        onClose={() => setSendNowTarget(null)}
        title="Send this message now?"
        isDarkMode={isDarkMode}
        className="max-w-sm"
      >
        <div className="space-y-4 p-6 text-center">
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: "#10b98114", border: "1px solid #10b98128" }}
          >
            <Send className="h-6 w-6" style={{ color: "#10b981" }} />
          </div>
          <div>
            <p className="text-sm font-semibold mb-1" style={{ color: t.value }}>
              Send immediately?
            </p>
            <p className="text-xs" style={{ color: t.secondary }}>
              This will send the WhatsApp follow-up now and skip the scheduled time.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSendNowTarget(null)}
              className="h-10 flex-1 rounded-xl text-sm font-medium transition-all"
              style={{ border: `1px solid ${borderColor}`, background: isDarkMode ? "#18181b" : "#ffffff", color: t.secondary }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (sendNowTarget !== null) sendNowMutation.mutate(sendNowTarget);
                setSendNowTarget(null);
              }}
              disabled={sendNowMutation.isPending}
              className="h-10 flex-1 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-50"
              style={{ background: "#10b981" }}
            >
              {sendNowMutation.isPending ? "Sending…" : "Send now"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
