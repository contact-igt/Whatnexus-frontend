/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  Inbox,
  Eye,
  RefreshCw,
  Send,
  Clock3,
  CalendarDays,
  MessageCircle,
  PhoneCall,
  Timer,
  CheckCircle2,
  AlertCircle,
  ListFilter,
  Plus,
  Download,
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
import { FollowUpDetailDrawer } from "./FollowUpDetailDrawer";
import { useRouter } from "next/navigation";

const ITEMS_PER_PAGE = 10;
type TypeFilter = "all" | "Call" | "WhatsApp";
type StatusFilter = "all" | "pending" | "sent" | "failed";
type SendTypeFilter = "all" | "follow_up" | "noshow";

const MetricCard = ({
  label,
  value,
  icon: Icon,
  tone,
  isDarkMode,
}: {
  label: string;
  value: number;
  icon: any;
  tone: "neutral" | "pending" | "sent" | "failed";
  isDarkMode: boolean;
}) => {
  const config = {
    neutral: {
      card: isDarkMode ? "bg-[#07110f] border-[#173128]" : "bg-white border-slate-200",
      accent: isDarkMode ? "bg-[#1D9E75]" : "bg-slate-400",
      iconBg: isDarkMode ? "bg-[#0f211a]" : "bg-slate-100",
      iconColor: isDarkMode ? "text-emerald-300" : "text-slate-500",
      label: isDarkMode ? "text-white/45" : "text-slate-500",
      value: isDarkMode ? "text-white" : "text-slate-900",
    },
    pending: {
      card: isDarkMode ? "bg-[#1a1708] border-[#3a3213]" : "bg-white border-amber-100",
      accent: "bg-amber-400",
      iconBg: isDarkMode ? "bg-[#2d260d]" : "bg-amber-50",
      iconColor: isDarkMode ? "text-amber-300" : "text-amber-600",
      label: isDarkMode ? "text-amber-200/50" : "text-amber-600/80",
      value: isDarkMode ? "text-amber-200" : "text-amber-700",
    },
    sent: {
      card: isDarkMode ? "bg-[#081711] border-[#1c3a2d]" : "bg-white border-emerald-100",
      accent: "bg-emerald-400",
      iconBg: isDarkMode ? "bg-[#0f2a1e]" : "bg-emerald-50",
      iconColor: isDarkMode ? "text-emerald-300" : "text-emerald-600",
      label: isDarkMode ? "text-emerald-200/50" : "text-emerald-600/80",
      value: isDarkMode ? "text-emerald-200" : "text-emerald-700",
    },
    failed: {
      card: isDarkMode ? "bg-[#1a0a0d] border-[#3d1a23]" : "bg-white border-red-100",
      accent: "bg-red-400",
      iconBg: isDarkMode ? "bg-[#2d1018]" : "bg-red-50",
      iconColor: isDarkMode ? "text-red-300" : "text-red-600",
      label: isDarkMode ? "text-red-200/50" : "text-red-600/80",
      value: isDarkMode ? "text-red-200" : "text-red-700",
    },
  };

  const c = config[tone];

  return (
    <article className={cn("relative overflow-hidden rounded-xl border p-5 transition-shadow hover:shadow-md", c.card)}>
      <div className={cn("absolute inset-x-0 top-0 h-[3px]", c.accent)} />
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className={cn("text-[11px] font-medium uppercase tracking-widest", c.label)}>
            {label}
          </p>
          <p className={cn("mt-3 text-3xl font-bold leading-none tabular-nums", c.value)}>
            {value}
          </p>
        </div>
        <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", c.iconBg)}>
          <Icon className={cn("h-5 w-5", c.iconColor)} />
        </div>
      </div>
    </article>
  );
};

const StatusBadge = ({
  status,
  isDarkMode,
}: {
  status: "pending" | "sent" | "failed";
  isDarkMode: boolean;
}) => {
  const map = {
    pending: isDarkMode
      ? "bg-[#1a1708] text-amber-300 border-[#3a3213]"
      : "bg-amber-50 text-amber-700 border-amber-200",
    sent: isDarkMode
      ? "bg-[#081711] text-emerald-300 border-[#1c3a2d]"
      : "bg-emerald-50 text-emerald-700 border-emerald-200",
    failed: isDarkMode
      ? "bg-[#1a0a0d] text-red-300 border-[#3d1a23]"
      : "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium capitalize",
        map[status],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-90" />
      {status}
    </span>
  );
};

const TypeBadge = ({
  type,
  isDarkMode,
}: {
  type: "Call" | "WhatsApp";
  isDarkMode: boolean;
}) => {
  const isWA = type === "WhatsApp";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium",
        isWA
          ? isDarkMode
            ? "bg-[#081711] text-emerald-300 border-[#1c3a2d]"
            : "bg-emerald-50 text-emerald-700 border-emerald-200"
          : isDarkMode
            ? "bg-[#0b1424] text-blue-300 border-[#1b3152]"
            : "bg-blue-50 text-blue-700 border-blue-200",
      )}
    >
      {isWA ? <MessageCircle className="w-3 h-3" /> : <PhoneCall className="w-3 h-3" />}
      {type}
    </span>
  );
};

const TriggerBadge = ({
  trigger,
  isDarkMode,
}: {
  trigger: "follow_up" | "noshow";
  isDarkMode: boolean;
}) => {
  const isNoShow = trigger === "noshow";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-medium",
        isNoShow
          ? isDarkMode
            ? "bg-[#1c1207] text-orange-300 border-[#48301a]"
            : "bg-orange-50 text-orange-700 border-orange-200"
          : isDarkMode
            ? "bg-[#181022] text-purple-300 border-[#3a2953]"
            : "bg-purple-50 text-purple-700 border-purple-200",
      )}
    >
      {isNoShow ? "No-show" : "Follow-up"}
    </span>
  );
};

const ActionIconButton = ({
  title,
  icon: Icon,
  onClick,
  disabled,
  color,
  isDarkMode,
}: {
  title: string;
  icon: any;
  onClick: () => void;
  disabled?: boolean;
  color: "slate" | "green" | "amber" | "blue";
  isDarkMode: boolean;
}) => {
  const colorMap = {
    slate: isDarkMode
      ? "text-white/55 hover:text-emerald-300 hover:bg-[#0f1f1b] border-[#193129]"
      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 border-slate-200",
    green: isDarkMode
      ? "text-emerald-300 hover:bg-[#0f1f1b] border-[#1c3a2d]"
      : "text-emerald-700 hover:bg-emerald-50 border-emerald-200",
    amber: isDarkMode
      ? "text-amber-300 hover:bg-[#241b0d] border-[#3a3213]"
      : "text-amber-700 hover:bg-amber-50 border-amber-200",
    blue: isDarkMode
      ? "text-blue-300 hover:bg-[#101a2d] border-[#1b3152]"
      : "text-blue-700 hover:bg-blue-50 border-blue-200",
  };

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-all disabled:cursor-not-allowed disabled:opacity-40",
        colorMap[color],
      )}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
};

export const FollowUpHubView = () => {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const fromInputRef = useRef<HTMLInputElement | null>(null);
  const toInputRef = useRef<HTMLInputElement | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sendTypeFilter, setSendTypeFilter] = useState<SendTypeFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [rescheduleTarget, setRescheduleTarget] = useState<{
    id: number;
    scheduled_at: string | null;
  } | null>(null);
  const [detailRow, setDetailRow] = useState<FollowUpHubRow | null>(null);
  const [sendNowTarget, setSendNowTarget] = useState<number | null>(null);

  const retryMutation = useRetryFollowUpMutation();
  const sendNowMutation = useSendNowFollowUpMutation();

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 350);
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

  const pendingCount = allRows.filter(
    (r) => r.scheduled_message?.status === "pending",
  ).length;
  const failedCount = allRows.filter(
    (r) => r.scheduled_message?.status === "failed",
  ).length;
  const sentCount = allRows.filter(
    (r) => r.scheduled_message?.status === "sent",
  ).length;
  const callCount = allRows.filter((r) => r.follow_up_type === "Call").length;

  const totalPages = Math.max(1, Math.ceil(rows.length / ITEMS_PER_PAGE));
  const pagedRows = rows.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const formatDate = (value?: string | null) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (value?: string | null) => {
    if (!value) return "";
    if (value.includes(":")) return value.slice(0, 5);
    return value;
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleExport = () => {
    if (!rows.length) {
      toast.error("No follow-up records to export.");
      return;
    }

    const dataToExport = rows.map((row) => ({
      patient_name: row.patient_name || "",
      phone: row.phone || "",
      appointment_date: formatDate(row.appointment_date),
      appointment_status: row.appointment_status || "",
      follow_up_date: formatDate(row.follow_up_date),
      follow_up_time: formatTime(row.follow_up_time),
      type: row.follow_up_type || "",
      reason: row.follow_up_reason || "",
      trigger: row.send_type === "noshow" ? "No-show" : row.send_type === "follow_up" ? "Follow-up" : "",
      template: row.scheduled_message?.template_name || "",
      message_status: row.scheduled_message?.status || "",
      scheduled_at: formatDateTime(row.scheduled_message?.scheduled_at || ""),
      sent_at: formatDateTime(row.scheduled_message?.sent_at || ""),
      notes: row.notes || "",
    }));

    handleCSVDownloadData(dataToExport, `followup_hub_${new Date().toISOString().slice(0, 10)}`);
    toast.success("Follow-up export downloaded.");
  };

  const handleNewAppointment = () => {
    router.push("/appointments?create=1");
  };

  const inputCls = cn(
    "h-10 rounded-lg border px-3 text-sm outline-none transition-all",
    isDarkMode
      ? "bg-[#0b1317] border-[#1a2e35] text-white placeholder:text-white/30 focus:border-[#1D9E75]/70"
      : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-300",
  );

  const panelCls = cn(
    "rounded-xl border",
    isDarkMode ? "border-[#183028] bg-[#060b10]" : "border-slate-200 bg-white",
  );

  return (
    <div className="space-y-4 p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className={cn("text-xl font-medium", isDarkMode ? "text-white" : "text-slate-900")}>
            Follow-up hub
          </h1>
          <p className={cn("mt-1 text-sm", isDarkMode ? "text-white/55" : "text-slate-500")}>
            Manage scheduled WhatsApp and call follow-ups with clear status tracking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm",
              isDarkMode
                ? "border-[#1a2e35] bg-[#0b1317] text-white/80 hover:bg-[#111c22]"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
            )}
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            type="button"
            onClick={handleNewAppointment}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#1D9E75] px-3 text-sm text-white hover:brightness-105"
          >
            <Plus className="h-4 w-4" />
            New appointment
          </button>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard
          label="Total"
          value={allRows.length}
          icon={ListFilter}
          tone="neutral"
          isDarkMode={isDarkMode}
        />
        <MetricCard
          label="Pending"
          value={pendingCount}
          icon={Timer}
          tone="pending"
          isDarkMode={isDarkMode}
        />
        <MetricCard
          label="Sent"
          value={sentCount}
          icon={CheckCircle2}
          tone="sent"
          isDarkMode={isDarkMode}
        />
        <MetricCard
          label="Failed"
          value={failedCount}
          icon={AlertCircle}
          tone="failed"
          isDarkMode={isDarkMode}
        />
      </section>

      <section className={cn(panelCls, "space-y-3 p-3")}>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "all", label: "All", count: allRows.length },
            { key: "pending", label: "Pending", count: pendingCount },
            { key: "failed", label: "Failed", count: failedCount },
            { key: "sent", label: "Sent", count: sentCount },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setStatusFilter(tab.key as StatusFilter);
                setCurrentPage(1);
              }}
              className={cn(
                "inline-flex h-8 items-center gap-2 rounded-lg border px-3 text-xs transition-all",
                statusFilter === tab.key
                  ? isDarkMode
                    ? "border-[#1D9E75]/70 bg-[#0f201a] text-emerald-300"
                    : "border-slate-300 bg-white text-slate-900"
                  : isDarkMode
                    ? "border-transparent bg-transparent text-white/50 hover:bg-[#10191f]"
                    : "border-transparent bg-transparent text-slate-500 hover:bg-slate-100",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px]",
                  isDarkMode ? "bg-[#122128] text-white/65" : "bg-slate-200 text-slate-600",
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setTypeFilter(typeFilter === "Call" ? "all" : "Call");
              setCurrentPage(1);
            }}
            className={cn(
              "inline-flex h-8 items-center gap-2 rounded-lg border px-3 text-xs transition-all",
              typeFilter === "Call"
                ? isDarkMode
                  ? "border-[#1b3152] bg-[#0f1b2d] text-blue-300"
                  : "border-blue-200 bg-blue-50 text-blue-700"
                : isDarkMode
                  ? "border-transparent text-white/50 hover:bg-[#10191f]"
                  : "border-transparent text-slate-500 hover:bg-slate-100",
            )}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            Call ({callCount})
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2 lg:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by patient name or phone"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(inputCls, "w-full pl-9")}
            />
          </div>

          <div
            className={cn(
              "inline-flex items-center gap-1 rounded-lg border p-1",
              isDarkMode ? "border-[#1a2e35] bg-[#0b1317]" : "border-slate-200 bg-slate-50",
            )}
          >
            {(["all", "follow_up", "noshow"] as SendTypeFilter[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setSendTypeFilter(value);
                  setCurrentPage(1);
                }}
                className={cn(
                  "h-8 rounded-md px-3 text-xs transition-all",
                  sendTypeFilter === value
                    ? isDarkMode
                      ? "bg-[#14241d] text-emerald-300 border border-[#1D9E75]/40"
                      : "bg-white text-slate-900 border border-slate-200"
                    : isDarkMode
                      ? "text-white/50 hover:bg-[#10191f]"
                      : "text-slate-500 hover:bg-slate-100",
                )}
              >
                {value === "all"
                  ? "All triggers"
                  : value === "follow_up"
                    ? "Follow-up"
                    : "No-show"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            <div className="relative">
              <input
                ref={fromInputRef}
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
                max={dateTo || undefined}
                style={{ colorScheme: isDarkMode ? "dark" : "light" }}
                className={cn(
                  inputCls,
                  "w-[155px] pr-9 text-xs",
                  isDarkMode
                    ? "[&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-80"
                    : "[&::-webkit-calendar-picker-indicator]:opacity-60",
                )}
              />
              <button
                type="button"
                onClick={() => (fromInputRef.current as (HTMLInputElement & { showPicker?: () => void }) | null)?.showPicker?.()}
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 transition-colors",
                  isDarkMode ? "text-emerald-300 hover:bg-[#111c22]" : "text-slate-500 hover:bg-slate-100",
                )}
                aria-label="Open from date picker"
              >
                <CalendarDays className="h-3.5 w-3.5" />
              </button>
            </div>
            <span className={cn("text-xs", isDarkMode ? "text-white/30" : "text-slate-400")}>
              to
            </span>
            <div className="relative">
              <input
                ref={toInputRef}
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
                min={dateFrom || undefined}
                style={{ colorScheme: isDarkMode ? "dark" : "light" }}
                className={cn(
                  inputCls,
                  "w-[155px] pr-9 text-xs",
                  isDarkMode
                    ? "[&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-80"
                    : "[&::-webkit-calendar-picker-indicator]:opacity-60",
                )}
              />
              <button
                type="button"
                onClick={() => (toInputRef.current as (HTMLInputElement & { showPicker?: () => void }) | null)?.showPicker?.()}
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 transition-colors",
                  isDarkMode ? "text-emerald-300 hover:bg-[#111c22]" : "text-slate-500 hover:bg-slate-100",
                )}
                aria-label="Open to date picker"
              >
                <CalendarDays className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {(dateFrom || dateTo) && (
            <button
              type="button"
              onClick={() => {
                setDateFrom("");
                setDateTo("");
                setCurrentPage(1);
              }}
              className={cn(
                "h-10 rounded-lg border px-3 text-xs",
                isDarkMode
                  ? "border-[#1a2e35] bg-[#0b1317] text-white/70 hover:bg-[#111c22]"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
              )}
            >
              Clear dates
            </button>
          )}
        </div>
      </section>

      <section className={cn(panelCls, "overflow-x-auto")}>
        {!isLoading && pagedRows.length === 0 ? (
          <div className="py-20 text-center">
            <div
              className={cn(
                "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl border",
                isDarkMode ? "border-[#1a2e35] bg-[#0b1317]" : "border-slate-200 bg-slate-50",
              )}
            >
              <Inbox className={cn("h-7 w-7", isDarkMode ? "text-white/35" : "text-slate-400")} />
            </div>
            <p className={cn("text-sm", isDarkMode ? "text-white/75" : "text-slate-700")}>
              No follow-ups found
            </p>
            <p className={cn("mt-1 text-xs", isDarkMode ? "text-white/40" : "text-slate-500")}>
              Try changing filters or search terms.
            </p>
          </div>
        ) : (
          <table className="w-full min-w-[1400px] border-collapse text-sm">
            <thead>
              <tr
                className={cn(
                  "border-b",
                  isDarkMode ? "bg-[#0d1519] border-[#1a2e35]" : "bg-slate-50 border-slate-200",
                )}
              >
                {[
                  "Patient",
                  "Phone",
                  "Doctor",
                  "Appt. Date",
                  "Appt. Status",
                  "Type",
                  "Trigger",
                  "Follow-up Date",
                  "Follow-up Time",
                  "Reason",
                  "Msg. Status",
                  "Scheduled / Sent At",
                  "Template",
                  "Notes",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className={cn(
                      "px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide whitespace-nowrap",
                      isDarkMode ? "text-white/40" : "text-slate-500",
                    )}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? [1, 2, 3, 4, 5].map((i) => (
                    <tr key={i}>
                      <td
                        colSpan={15}
                        className={cn(
                          "h-[58px] animate-pulse border-b",
                          isDarkMode ? "bg-[#0a1115] border-[#14262d]" : "bg-slate-50/40 border-slate-100",
                        )}
                      />
                    </tr>
                  ))
                : pagedRows.map((row) => {
                    const msg = row.scheduled_message;
                    const initials = (row.patient_name || "?").charAt(0).toUpperCase();

                    const appointmentDate = row.appointment_date
                      ? new Date(row.appointment_date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—";

                    const followDate = row.follow_up_date
                      ? new Date(row.follow_up_date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—";

                    const followTime = row.follow_up_time?.slice(0, 5) || "—";

                    const scheduledOrSentAt = msg?.sent_at
                      ? new Date(msg.sent_at).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : msg?.scheduled_at
                        ? new Date(msg.scheduled_at).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—";

                    const tdCls = cn(
                      "px-4 py-3 border-b align-middle",
                      isDarkMode ? "border-[#13262d]" : "border-slate-100",
                    );

                    const textPrimary = cn(isDarkMode ? "text-white/90" : "text-slate-800");
                    const textMuted = cn("text-xs", isDarkMode ? "text-white/45" : "text-slate-500");

                    return (
                      <tr
                        key={row.outcome_id}
                        className={cn(
                          isDarkMode ? "hover:bg-[#0b1419]" : "hover:bg-slate-50/70",
                        )}
                      >
                        {/* Patient */}
                        <td className={tdCls}>
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                                isDarkMode ? "bg-[#0f211a] text-emerald-300" : "bg-emerald-50 text-emerald-700",
                              )}
                            >
                              {initials}
                            </div>
                            <span className={cn("truncate max-w-[120px] text-sm font-medium", isDarkMode ? "text-white" : "text-slate-900")}>
                              {row.patient_name || "—"}
                            </span>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className={tdCls}>
                          <span className={textMuted}>{row.phone || "—"}</span>
                        </td>

                        {/* Doctor */}
                        <td className={tdCls}>
                          <span className={cn("text-xs whitespace-nowrap", isDarkMode ? "text-white/60" : "text-slate-600")}>
                            {row.doctor_name ? `Dr. ${row.doctor_name}` : "—"}
                          </span>
                        </td>

                        {/* Appt. Date */}
                        <td className={tdCls}>
                          <span className={cn("text-xs whitespace-nowrap", textPrimary)}>{appointmentDate}</span>
                        </td>

                        {/* Appt. Status */}
                        <td className={tdCls}>
                          <span className={textMuted}>{row.appointment_status || "Pending"}</span>
                        </td>

                        {/* Type */}
                        <td className={tdCls}>
                          <TypeBadge
                            type={(row.follow_up_type as "Call" | "WhatsApp") || "Call"}
                            isDarkMode={isDarkMode}
                          />
                        </td>

                        {/* Trigger */}
                        <td className={tdCls}>
                          {row.send_type ? (
                            <TriggerBadge trigger={row.send_type} isDarkMode={isDarkMode} />
                          ) : (
                            <span className={textMuted}>—</span>
                          )}
                        </td>

                        {/* Follow-up Date */}
                        <td className={tdCls}>
                          <span className={cn("text-xs whitespace-nowrap", textPrimary)}>{followDate}</span>
                        </td>

                        {/* Follow-up Time */}
                        <td className={tdCls}>
                          <span className={cn("text-xs", textPrimary)}>{followTime}</span>
                        </td>

                        {/* Reason */}
                        <td className={tdCls}>
                          <span className={textMuted}>{row.follow_up_reason || "—"}</span>
                        </td>

                        {/* Msg. Status */}
                        <td className={tdCls}>
                          {msg ? (
                            <StatusBadge
                              status={msg.status as "pending" | "sent" | "failed"}
                              isDarkMode={isDarkMode}
                            />
                          ) : (
                            <span
                              className={cn(
                                "rounded-md border px-2 py-1 text-[11px]",
                                isDarkMode
                                  ? "border-[#1a2e35] bg-[#0b1317] text-white/40"
                                  : "border-slate-200 bg-slate-50 text-slate-500",
                              )}
                            >
                              No message
                            </span>
                          )}
                        </td>

                        {/* Scheduled / Sent At */}
                        <td className={tdCls}>
                          <span className={cn("text-xs whitespace-nowrap", textMuted)}>{scheduledOrSentAt}</span>
                        </td>

                        {/* Template */}
                        <td className={tdCls}>
                          <span
                            className={cn("truncate block max-w-[140px] text-xs", isDarkMode ? "text-white/85" : "text-slate-800")}
                            title={msg?.template_name || ""}
                          >
                            {msg?.template_name || "—"}
                          </span>
                        </td>

                        {/* Notes */}
                        <td className={tdCls}>
                          <span
                            className={cn("truncate block max-w-[160px] text-xs", isDarkMode ? "text-white/40" : "text-slate-500")}
                            title={row.notes || ""}
                          >
                            {row.notes || "—"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className={tdCls}>
                          <div className="flex items-center gap-1.5">
                            <ActionIconButton
                              title="View details"
                              icon={Eye}
                              onClick={() => setDetailRow(row)}
                              color="slate"
                              isDarkMode={isDarkMode}
                            />
                            {msg && row.follow_up_type === "WhatsApp" && msg.status !== "sent" && (
                              <>
                                <ActionIconButton
                                  title="Reschedule"
                                  icon={Clock3}
                                  onClick={() =>
                                    setRescheduleTarget({
                                      id: msg.id,
                                      scheduled_at: msg.scheduled_at,
                                    })
                                  }
                                  color="blue"
                                  isDarkMode={isDarkMode}
                                />
                                <ActionIconButton
                                  title="Send now"
                                  icon={Send}
                                  onClick={() => setSendNowTarget(msg.id)}
                                  color="green"
                                  isDarkMode={isDarkMode}
                                  disabled={sendNowMutation.isPending}
                                />
                              </>
                            )}
                            {msg?.status === "failed" && (
                              <ActionIconButton
                                title="Retry"
                                icon={RefreshCw}
                                onClick={() => retryMutation.mutate(msg.id)}
                                color="amber"
                                isDarkMode={isDarkMode}
                                disabled={retryMutation.isPending}
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        )}
      </section>

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

      <RescheduleDrawer
        key={rescheduleTarget?.id ?? "none"}
        isOpen={!!rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
        scheduledMsgId={rescheduleTarget?.id ?? null}
        currentScheduledAt={rescheduleTarget?.scheduled_at ?? null}
        isDarkMode={isDarkMode}
      />

      <FollowUpDetailDrawer
        isOpen={!!detailRow}
        onClose={() => setDetailRow(null)}
        row={detailRow}
        isDarkMode={isDarkMode}
      />

      <Modal
        isOpen={sendNowTarget !== null}
        onClose={() => setSendNowTarget(null)}
        title="Send this message now?"
        isDarkMode={isDarkMode}
        className="max-w-sm"
      >
        <div className="space-y-4 p-6 text-center">
          <div
            className={cn(
              "mx-auto flex h-14 w-14 items-center justify-center rounded-xl",
              isDarkMode ? "bg-emerald-500/10" : "bg-emerald-50",
            )}
          >
            <Send className="h-6 w-6 text-emerald-500" />
          </div>
          <p className={cn("text-sm", isDarkMode ? "text-white/70" : "text-slate-600")}>
            This will send the WhatsApp follow-up immediately and skip the scheduled time.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSendNowTarget(null)}
              className={cn(
                "h-10 flex-1 rounded-lg border text-sm",
                isDarkMode
                  ? "border-[#1a2e35] bg-[#0b1317] text-white/80 hover:bg-[#111c22]"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
              )}
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
              className="h-10 flex-1 rounded-lg bg-[#1D9E75] text-sm text-white hover:brightness-105 disabled:opacity-50"
            >
              {sendNowMutation.isPending ? "Sending..." : "Send now"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
