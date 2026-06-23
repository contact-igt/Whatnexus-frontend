"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Activity,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Database,
  Loader2,
  RefreshCcw,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  Webhook,
  Wifi,
} from "lucide-react";

import { useApiRequestLogsQuery } from "@/hooks/useApiRequestLogsQuery";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { ApiRequestLog } from "@/services/apiRequestLogs";
import { Badge } from "@/components/ui/badge";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TablePagination,
  TableRow,
} from "@/components/ui/table";

type SortField =
  | "created_at"
  | "duration_ms"
  | "status_code"
  | "method"
  | "module"
  | "actor_type"
  | "actor_role";

type SortOrder = "desc" | "asc";

type StatusFilter =
  | "all"
  | "success"
  | "failed"
  | "status_2xx_3xx"
  | "status_4xx_5xx";

const SENSITIVE_KEY_PATTERN =
  /(password|token|access_token|refresh_token|authorization|otp|secret|api_key|apikey|bearer)/i;

const DEFAULT_FILTERS = {
  search: "",
  module: "all",
  actorType: "all",
  actorRole: "all",
  userType: "all",
  method: "all",
  status: "all" as StatusFilter,
  fromDate: "",
  toDate: "",
  minDuration: "",
  maxDuration: "",
};

const DEFAULT_SORT = {
  sortBy: "created_at" as SortField,
  sortOrder: "desc" as SortOrder,
};

const isPresent = (value: unknown) =>
  value !== null && value !== undefined && String(value).trim() !== "";

const safeLower = (value: unknown) => String(value || "").toLowerCase();

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return format(date, "dd MMM yyyy, hh:mm:ss a");
};

const formatLastUpdated = (value: number) => {
  return format(new Date(value), "dd MMM yyyy, hh:mm a");
};

const formatDuration = (value?: number | null) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return `${value} ms`;
};

const formatStatus = (status?: number | null) => {
  if (typeof status !== "number" || Number.isNaN(status)) return "Unknown";
  return String(status);
};

const maskSensitiveString = (value: string) => {
  if (SENSITIVE_KEY_PATTERN.test(value) || /bearer\s+[a-z0-9._-]+/i.test(value)) {
    return "[MASKED]";
  }
  return value;
};

const formatValue = (value: unknown) => {
  if (!isPresent(value)) return "-";
  return maskSensitiveString(String(value).trim());
};

const sanitizeStructuredValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeStructuredValue(item));
  }

  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).reduce(
      (acc, [key, innerValue]) => {
        acc[key] = SENSITIVE_KEY_PATTERN.test(key)
          ? "[MASKED]"
          : sanitizeStructuredValue(innerValue);
        return acc;
      },
      {} as Record<string, unknown>,
    );
  }

  if (typeof value === "string") {
    return maskSensitiveString(value);
  }

  return value;
};

const renderJson = (value: unknown) => {
  if (!isPresent(value)) return "-";

  try {
    const sanitized = sanitizeStructuredValue(value);
    return JSON.stringify(sanitized, null, 2);
  } catch {
    return maskSensitiveString(String(value));
  }
};

const getMethodVariant = (method?: string | null) => {
  switch (String(method || "").toUpperCase()) {
    case "GET":
      return "info";
    case "POST":
      return "success";
    case "PUT":
      return "warning";
    case "PATCH":
      return "primary";
    case "DELETE":
      return "danger";
    default:
      return "default";
  }
};

const getStatusVariant = (status?: number | null) => {
  if (typeof status !== "number") return "default";
  if (status >= 200 && status < 400) return "success";
  if (status >= 400) return "danger";
  return "default";
};

const getSuccessVariant = (success?: boolean | null) =>
  success ? "success" : "danger";

const getActorLabel = (log: ApiRequestLog) => {
  if (isPresent(log.actor_name)) return String(log.actor_name).trim();
  if (isPresent(log.actor_email)) return String(log.actor_email).trim();
  if (isPresent(log.user_id)) return String(log.user_id).trim();
  return "-";
};

const getUniqueOptions = (
  logs: ApiRequestLog[],
  key: keyof ApiRequestLog,
) => {
  return Array.from(
    new Set(
      logs
        .map((log) => String(log[key] || "").trim())
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b));
};

const matchesSearch = (log: ApiRequestLog, search: string) => {
  if (!search.trim()) return true;

  const haystack = [
    log.request_id,
    log.original_url,
    log.route_path,
    log.actor_name,
    log.actor_email,
    log.actor_role,
    log.tenant_id,
    log.user_id,
    log.ip_address,
    log.error_message,
  ]
    .map((value) => safeLower(value))
    .join(" ");

  return haystack.includes(search.trim().toLowerCase());
};

const matchesStatus = (log: ApiRequestLog, status: StatusFilter) => {
  if (status === "all") return true;
  if (status === "success") return log.success === true;
  if (status === "failed") return log.success === false;
  if (status === "status_2xx_3xx") {
    return typeof log.status_code === "number" && log.status_code >= 200 && log.status_code < 400;
  }
  if (status === "status_4xx_5xx") {
    return typeof log.status_code === "number" && log.status_code >= 400;
  }
  return true;
};

const toComparableDate = (value?: string | null) => {
  if (!value) return 0;
  const date = new Date(value).getTime();
  return Number.isNaN(date) ? 0 : date;
};

const compareValues = (
  left: ApiRequestLog,
  right: ApiRequestLog,
  sortBy: SortField,
) => {
  if (sortBy === "created_at") {
    return toComparableDate(left.created_at) - toComparableDate(right.created_at);
  }

  if (sortBy === "duration_ms" || sortBy === "status_code") {
    return Number(left[sortBy] || 0) - Number(right[sortBy] || 0);
  }

  return String(left[sortBy] || "").localeCompare(String(right[sortBy] || ""));
};

const SummaryCard = ({
  icon,
  label,
  value,
  tone,
  isDarkMode,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "emerald" | "red" | "blue" | "amber" | "slate";
  isDarkMode: boolean;
}) => {
  const toneStyles = {
    emerald: isDarkMode
      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
      : "bg-emerald-50 border-emerald-200 text-emerald-700",
    red: isDarkMode
      ? "bg-red-500/10 border-red-500/20 text-red-400"
      : "bg-red-50 border-red-200 text-red-700",
    blue: isDarkMode
      ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
      : "bg-blue-50 border-blue-200 text-blue-700",
    amber: isDarkMode
      ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
      : "bg-amber-50 border-amber-200 text-amber-700",
    slate: isDarkMode
      ? "bg-white/5 border-white/10 text-white/80"
      : "bg-white border-slate-200 text-slate-800",
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-5 transition-all",
        toneStyles[tone],
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
        </div>
        <div className="rounded-xl border border-current/15 bg-black/5 p-2.5">
          {icon}
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({
  label,
  value,
  multiline = false,
  isDarkMode,
}: {
  label: string;
  value: string;
  multiline?: boolean;
  isDarkMode: boolean;
}) => {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3",
        isDarkMode ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-slate-50",
      )}
    >
      <p
        className={cn(
          "text-[10px] font-bold uppercase tracking-wider",
          isDarkMode ? "text-white/40" : "text-slate-500",
        )}
      >
        {label}
      </p>
      {multiline ? (
        <pre
          className={cn(
            "mt-1.5 whitespace-pre-wrap break-words text-xs leading-5 font-mono",
            isDarkMode ? "text-white/80" : "text-slate-800",
          )}
        >
          {value}
        </pre>
      ) : (
        <p
          className={cn(
            "mt-1.5 break-words text-sm font-medium leading-5",
            isDarkMode ? "text-white/85" : "text-slate-800",
          )}
        >
          {value}
        </p>
      )}
    </div>
  );
};

export const ApiRequestLogsView = () => {
  const { isDarkMode } = useTheme();
  const {
    data: logs = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    dataUpdatedAt,
  } = useApiRequestLogsQuery();

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<SortField>(DEFAULT_SORT.sortBy);
  const [sortOrder, setSortOrder] = useState<SortOrder>(DEFAULT_SORT.sortOrder);
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<ApiRequestLog | null>(null);

  const moduleOptions = useMemo(() => getUniqueOptions(logs, "module"), [logs]);
  const actorTypeOptions = useMemo(() => getUniqueOptions(logs, "actor_type"), [logs]);
  const actorRoleOptions = useMemo(() => getUniqueOptions(logs, "actor_role"), [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (!matchesSearch(log, filters.search)) return false;
      if (filters.module !== "all" && log.module !== filters.module) return false;
      if (filters.actorType !== "all" && log.actor_type !== filters.actorType) return false;
      if (filters.actorRole !== "all" && log.actor_role !== filters.actorRole) return false;
      if (filters.userType !== "all" && log.user_type !== filters.userType) return false;
      if (filters.method !== "all" && log.method !== filters.method) return false;
      if (!matchesStatus(log, filters.status)) return false;

      const createdAt = toComparableDate(log.created_at);
      if (filters.fromDate) {
        const from = new Date(filters.fromDate);
        from.setHours(0, 0, 0, 0);
        if (createdAt < from.getTime()) return false;
      }
      if (filters.toDate) {
        const to = new Date(filters.toDate);
        to.setHours(23, 59, 59, 999);
        if (createdAt > to.getTime()) return false;
      }

      if (filters.minDuration !== "") {
        const min = Number(filters.minDuration);
        if (!Number.isNaN(min) && Number(log.duration_ms || 0) < min) return false;
      }
      if (filters.maxDuration !== "") {
        const max = Number(filters.maxDuration);
        if (!Number.isNaN(max) && Number(log.duration_ms || 0) > max) return false;
      }

      return true;
    });
  }, [filters, logs]);

  const sortedLogs = useMemo(() => {
    const next = [...filteredLogs].sort((left, right) => {
      const comparison = compareValues(left, right, sortBy);
      return sortOrder === "asc" ? comparison : -comparison;
    });
    return next;
  }, [filteredLogs, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedLogs.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const paginatedLogs = useMemo(
    () => sortedLogs.slice(startIndex, endIndex),
    [sortedLogs, startIndex, endIndex],
  );

  const summary = useMemo(() => {
    return {
      total: filteredLogs.length,
      success: filteredLogs.filter((log) => log.success === true).length,
      failed: filteredLogs.filter((log) => log.success === false).length,
      management: filteredLogs.filter((log) => log.actor_type === "management").length,
      tenant: filteredLogs.filter((log) => log.actor_type === "tenant").length,
      whatsapp: filteredLogs.filter((log) => log.module === "whatsapp").length,
      billing: filteredLogs.filter((log) => log.module === "billing").length,
      webhook: filteredLogs.filter((log) => log.actor_type === "webhook").length,
      anonymousOrUnknown: filteredLogs.filter((log) =>
        log.actor_type === "anonymous" || log.actor_type === "unknown"
      ).length,
    };
  }, [filteredLogs]);

  const updateFilter = (key: keyof typeof DEFAULT_FILTERS, value: string) => {
    setCurrentPage(1);
    setFilters((previous) => ({
      ...previous,
      ...(key === "fromDate"
        ? {
          fromDate: value,
          toDate:
            previous.toDate && value && previous.toDate < value
              ? ""
              : previous.toDate,
        }
        : {
          [key]: value,
        }),
    }));
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSortBy(DEFAULT_SORT.sortBy);
    setSortOrder(DEFAULT_SORT.sortOrder);
    setPageSize(25);
    setCurrentPage(1);
  };

  const emptyMessage =
    logs.length === 0
      ? "No API request logs found."
      : "No logs match the selected filters.";
  const lastUpdatedLabel = dataUpdatedAt
    ? formatLastUpdated(dataUpdatedAt)
    : "Not refreshed yet";

  return (
    <div className="h-full overflow-y-auto p-8 space-y-6 max-w-[1400px] mx-auto no-scrollbar pb-32">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className={cn("text-3xl font-bold tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>
            API Request Logs
          </h1>
          <p className={cn("text-sm mt-1", isDarkMode ? "text-white/60" : "text-slate-600")}>
            Monitor backend API activity across management, tenants, WhatsApp, campaigns, billing, and webhooks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            className={cn(
              "px-4 py-2 text-xs font-semibold rounded-xl border",
              isDarkMode
                ? "border-white/10 bg-white/5 text-white/60"
                : "border-slate-200 bg-slate-50 text-slate-600",
            )}
          >
            Last update: {lastUpdatedLabel}
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            <RefreshCcw size={16} className={cn(isFetching && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <SummaryCard icon={<Activity size={18} />} label="Total Requests" value={summary.total} tone="slate" isDarkMode={isDarkMode} />
        <SummaryCard icon={<ShieldCheck size={18} />} label="Successful" value={summary.success} tone="emerald" isDarkMode={isDarkMode} />
        <SummaryCard icon={<AlertTriangle size={18} />} label="Failed" value={summary.failed} tone="red" isDarkMode={isDarkMode} />
        <SummaryCard icon={<UserRound size={18} />} label="Management" value={summary.management} tone="blue" isDarkMode={isDarkMode} />
        <SummaryCard icon={<UserRound size={18} />} label="Tenant" value={summary.tenant} tone="amber" isDarkMode={isDarkMode} />
        <SummaryCard icon={<Wifi size={18} />} label="WhatsApp" value={summary.whatsapp} tone="emerald" isDarkMode={isDarkMode} />
        <SummaryCard icon={<Database size={18} />} label="Billing" value={summary.billing} tone="blue" isDarkMode={isDarkMode} />
        <SummaryCard icon={<Webhook size={18} />} label="Webhook" value={summary.webhook} tone="amber" isDarkMode={isDarkMode} />
        <SummaryCard icon={<Trash2 size={18} />} label="Anonymous / Unknown" value={summary.anonymousOrUnknown} tone="slate" isDarkMode={isDarkMode} />
      </section>

      <section
        className={cn(
          "rounded-xl border p-6 space-y-6",
          isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200",
        )}
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="w-full xl:max-w-md">
            <Input
              isDarkMode={isDarkMode}
              label="Search"
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              placeholder="Search request ID, URL, actor, tenant..."
              icon={Search}
            />
          </div>

          <button
            onClick={clearFilters}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors mb-0.5",
              isDarkMode
                ? "bg-white/10 text-white hover:bg-white/20"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200",
            )}
          >
            Clear Filters
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
          <Select
            isDarkMode={isDarkMode}
            label="Module"
            value={filters.module}
            onChange={(val) => updateFilter("module", val)}
            options={[{ value: "all", label: "All Modules" }, ...moduleOptions.map(m => ({ value: m, label: m }))]}
          />
          <Select
            isDarkMode={isDarkMode}
            label="Actor Type"
            value={filters.actorType}
            onChange={(val) => updateFilter("actorType", val)}
            options={[{ value: "all", label: "All Actor Types" }, ...actorTypeOptions.map(m => ({ value: m, label: m }))]}
          />
          <Select
            isDarkMode={isDarkMode}
            label="Role"
            value={filters.actorRole}
            onChange={(val) => updateFilter("actorRole", val)}
            options={[{ value: "all", label: "All Roles" }, ...actorRoleOptions.map(m => ({ value: m, label: m }))]}
          />
          <Select
            isDarkMode={isDarkMode}
            label="Status"
            value={filters.status}
            onChange={(val) => updateFilter("status", val)}
            options={[
              { value: "all", label: "All Status" },
              { value: "success", label: "Success" },
              { value: "failed", label: "Failed" },
              { value: "status_2xx_3xx", label: "2xx / 3xx" },
              { value: "status_4xx_5xx", label: "4xx / 5xx" },
            ]}
          />
          <Input
            isDarkMode={isDarkMode}
            type="date"
            value={filters.fromDate}
            onChange={(e) => updateFilter("fromDate", e.target.value)}
            label="From"
          />
          <Input
            isDarkMode={isDarkMode}
            type="date"
            value={filters.toDate}
            onChange={(e) => updateFilter("toDate", e.target.value)}
            label="To"
            min={filters.fromDate || undefined}
            disabled={!filters.fromDate}
          />
          <Select
            isDarkMode={isDarkMode}
            label="Sort By"
            value={sortBy}
            onChange={(val) => { setCurrentPage(1); setSortBy(val as SortField); }}
            options={[
              { value: "created_at", label: "Time" },
              { value: "duration_ms", label: "Duration" },
              { value: "status_code", label: "Status" },
              { value: "method", label: "Method" },
              { value: "module", label: "Module" },
              { value: "actor_type", label: "Actor Type" },
              { value: "actor_role", label: "Actor Role" },
            ]}
          />
          <div className="flex flex-col justify-end">
            <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? "text-white/70" : "text-slate-700")}>
              &nbsp;
            </label>
            <button
              onClick={() => { setCurrentPage(1); setSortOrder((prev) => prev === "asc" ? "desc" : "asc"); }}
              className={cn(
                "w-full py-2.5 rounded-xl text-sm font-semibold border flex items-center justify-center gap-2 transition-colors",
                isDarkMode
                  ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100",
              )}
            >
              {sortOrder === "desc" ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              {sortOrder === "desc" ? "Descending" : "Ascending"}
            </button>
          </div>
        </div>
      </section>

      <div
        className={cn(
          "rounded-xl border overflow-hidden",
          isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200",
        )}
      >
        {isLoading ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
            <p className={cn("text-sm font-medium", isDarkMode ? "text-white/60" : "text-slate-600")}>
              Loading API request logs...
            </p>
          </div>
        ) : isError ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 text-center p-8">
            <div className="bg-red-500/10 p-4 rounded-full">
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            <div>
              <p className={cn("text-xl font-bold", isDarkMode ? "text-white" : "text-slate-900")}>
                Failed to load logs
              </p>
              <p className={cn("mt-2 text-sm max-w-sm", isDarkMode ? "text-white/55" : "text-slate-600")}>
                {error instanceof Error ? error.message : "An unexpected error occurred while fetching the logs."}
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : sortedLogs.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center p-8">
            <div className={cn("p-4 rounded-full", isDarkMode ? "bg-white/5" : "bg-slate-50")}>
              <Database className={cn("h-10 w-10", isDarkMode ? "text-white/20" : "text-slate-300")} />
            </div>
            <p className={cn("text-xl font-bold", isDarkMode ? "text-white" : "text-slate-900")}>
              {emptyMessage}
            </p>
          </div>
        ) : (
          <>
            <Table isDarkMode={isDarkMode}>
              <TableHeader isDarkMode={isDarkMode}>
                <TableRow isDarkMode={isDarkMode}>
                  <TableHead isDarkMode={isDarkMode}>Time</TableHead>
                  <TableHead isDarkMode={isDarkMode}>Method</TableHead>
                  <TableHead isDarkMode={isDarkMode}>Module</TableHead>
                  <TableHead isDarkMode={isDarkMode}>URL</TableHead>
                  <TableHead isDarkMode={isDarkMode}>Actor</TableHead>
                  <TableHead isDarkMode={isDarkMode}>Role</TableHead>
                  <TableHead isDarkMode={isDarkMode}>Status</TableHead>
                  <TableHead isDarkMode={isDarkMode}>Success</TableHead>
                  <TableHead isDarkMode={isDarkMode}>Duration</TableHead>
                  <TableHead isDarkMode={isDarkMode} align="right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLogs.map((log, index) => (
                  <TableRow
                    key={log.id}
                    isDarkMode={isDarkMode}
                    isLast={index === paginatedLogs.length - 1}
                    className="cursor-pointer hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors"
                    onClick={() => setSelectedLog(log)}
                  >
                    <TableCell>
                      <div className={cn("text-sm font-medium", isDarkMode ? "text-white/85" : "text-slate-900")}>
                        {formatDateTime(log.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge isDarkMode={isDarkMode} variant={getMethodVariant(log.method)} size="sm">
                        {log.method || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge isDarkMode={isDarkMode} variant="default" size="sm">
                        {log.module || "unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px]" title={log.original_url || ""}>
                        <p className={cn("text-sm font-medium truncate", isDarkMode ? "text-white/85" : "text-slate-900")}>
                          {log.original_url || "-"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[150px]">
                        <p className={cn("text-sm font-medium truncate", isDarkMode ? "text-white/85" : "text-slate-900")}>
                          {getActorLabel(log)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge isDarkMode={isDarkMode} variant="default" size="sm">
                        {log.actor_role || "-"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge isDarkMode={isDarkMode} variant={getStatusVariant(log.status_code)} size="sm">
                        {formatStatus(log.status_code)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge isDarkMode={isDarkMode} variant={getSuccessVariant(log.success)} size="sm">
                        {log.success ? "Success" : "Failed"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "text-sm font-bold",
                          Number(log.duration_ms || 0) > 1000
                            ? "text-amber-500"
                            : isDarkMode
                              ? "text-white/80"
                              : "text-slate-800",
                        )}
                      >
                        {formatDuration(log.duration_ms)}
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                          isDarkMode
                            ? "bg-white/10 text-white hover:bg-white/20"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                        )}
                      >
                        View
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className={cn("p-4 border-t", isDarkMode ? "border-white/10" : "border-slate-200")}>
              <TablePagination
                isDarkMode={isDarkMode}
                currentPage={safeCurrentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                startIndex={startIndex}
                endIndex={endIndex}
                totalItems={sortedLogs.length}
              />
            </div>
          </>
        )}
      </div>

      <Drawer
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title="API Request Log Details"
        description={
          selectedLog
            ? `${selectedLog.request_id || "Request"} - ${formatDateTime(selectedLog.created_at)}`
            : undefined
        }
        isDarkMode={isDarkMode}
        className="max-w-3xl"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailItem label="ID" value={formatValue(selectedLog.id)} isDarkMode={isDarkMode} />
              <DetailItem label="Request ID" value={formatValue(selectedLog.request_id)} isDarkMode={isDarkMode} />
              <DetailItem label="Tenant ID" value={formatValue(selectedLog.tenant_id)} isDarkMode={isDarkMode} />
              <DetailItem label="User ID" value={formatValue(selectedLog.user_id)} isDarkMode={isDarkMode} />
              <DetailItem label="Actor Type" value={formatValue(selectedLog.actor_type)} isDarkMode={isDarkMode} />
              <DetailItem label="Actor Name" value={formatValue(selectedLog.actor_name)} isDarkMode={isDarkMode} />
              <DetailItem label="Actor Email" value={formatValue(selectedLog.actor_email)} isDarkMode={isDarkMode} />
              <DetailItem label="Actor Role" value={formatValue(selectedLog.actor_role)} isDarkMode={isDarkMode} />
              <DetailItem label="User Type" value={formatValue(selectedLog.user_type)} isDarkMode={isDarkMode} />
              <DetailItem label="Method" value={formatValue(selectedLog.method)} isDarkMode={isDarkMode} />
              <DetailItem label="Original URL" value={formatValue(selectedLog.original_url)} multiline isDarkMode={isDarkMode} />
              <DetailItem label="Route Path" value={formatValue(selectedLog.route_path)} isDarkMode={isDarkMode} />
              <DetailItem label="Module" value={formatValue(selectedLog.module)} isDarkMode={isDarkMode} />
              <DetailItem label="Status Code" value={formatStatus(selectedLog.status_code)} isDarkMode={isDarkMode} />
              <DetailItem label="Success" value={selectedLog.success ? "Success" : "Failed"} isDarkMode={isDarkMode} />
              <DetailItem label="Duration" value={formatDuration(selectedLog.duration_ms)} isDarkMode={isDarkMode} />
              <DetailItem label="IP Address" value={formatValue(selectedLog.ip_address)} isDarkMode={isDarkMode} />
              <DetailItem label="Forwarded For" value={formatValue(selectedLog.forwarded_for)} multiline isDarkMode={isDarkMode} />
              <DetailItem label="Country" value={formatValue(selectedLog.country)} isDarkMode={isDarkMode} />
              <DetailItem label="Region" value={formatValue(selectedLog.region)} isDarkMode={isDarkMode} />
              <DetailItem label="City" value={formatValue(selectedLog.city)} isDarkMode={isDarkMode} />
              <DetailItem label="Latitude" value={formatValue(selectedLog.latitude)} isDarkMode={isDarkMode} />
              <DetailItem label="Longitude" value={formatValue(selectedLog.longitude)} isDarkMode={isDarkMode} />
              <DetailItem label="Timezone" value={formatValue(selectedLog.timezone)} isDarkMode={isDarkMode} />
              <DetailItem label="ISP" value={formatValue(selectedLog.isp)} isDarkMode={isDarkMode} />
              <DetailItem label="User Agent" value={formatValue(selectedLog.user_agent)} multiline isDarkMode={isDarkMode} />
              <DetailItem label="Browser" value={formatValue(selectedLog.browser)} isDarkMode={isDarkMode} />
              <DetailItem label="Browser Version" value={formatValue(selectedLog.browser_version)} isDarkMode={isDarkMode} />
              <DetailItem label="OS" value={formatValue(selectedLog.os)} isDarkMode={isDarkMode} />
              <DetailItem label="OS Version" value={formatValue(selectedLog.os_version)} isDarkMode={isDarkMode} />
              <DetailItem label="Device Type" value={formatValue(selectedLog.device_type)} isDarkMode={isDarkMode} />
              <DetailItem label="Device Vendor" value={formatValue(selectedLog.device_vendor)} isDarkMode={isDarkMode} />
              <DetailItem label="Device Model" value={formatValue(selectedLog.device_model)} isDarkMode={isDarkMode} />
              <DetailItem label="Referer" value={formatValue(selectedLog.referer)} multiline isDarkMode={isDarkMode} />
              <DetailItem label="Origin" value={formatValue(selectedLog.origin)} multiline isDarkMode={isDarkMode} />
              <DetailItem label="Accept Language" value={formatValue(selectedLog.accept_language)} isDarkMode={isDarkMode} />
              <DetailItem label="Created At" value={formatDateTime(selectedLog.created_at)} isDarkMode={isDarkMode} />
              <DetailItem label="Updated At" value={formatDateTime(selectedLog.updated_at)} isDarkMode={isDarkMode} />
            </div>
            <DetailItem label="Query JSON" value={renderJson(selectedLog.query_json)} multiline isDarkMode={isDarkMode} />
            <DetailItem label="Body Keys JSON" value={renderJson(selectedLog.body_keys_json)} multiline isDarkMode={isDarkMode} />
            <DetailItem label="Metadata JSON" value={renderJson(selectedLog.metadata_json)} multiline isDarkMode={isDarkMode} />
            <DetailItem label="Error Message" value={formatValue(selectedLog.error_message)} multiline isDarkMode={isDarkMode} />
          </div>
        )}
      </Drawer>
    </div>
  );
};
