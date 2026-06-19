"use client";

import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
    ArrowLeft,
    Loader2,
    AlertTriangle,
    Globe,
    User,
    Shield,
    Server,
    Code,
    Smartphone,
    Info,
} from "lucide-react";

import { useApiRequestLogDetailsQuery } from "@/hooks/useApiRequestLogsQuery";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { ApiRequestLog } from "@/services/apiRequestLogs";
import { Badge } from "@/components/ui/badge";

const SENSITIVE_KEY_PATTERN =
    /(password|token|access_token|refresh_token|authorization|otp|secret|api_key|apikey|bearer)/i;

const isPresent = (value: unknown) =>
    value !== null && value !== undefined && String(value).trim() !== "";

const formatDateTime = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return format(date, "dd MMM yyyy, hh:mm:ss a");
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
        case "GET": return "info";
        case "POST": return "success";
        case "PUT": return "warning";
        case "PATCH": return "primary";
        case "DELETE": return "danger";
        default: return "default";
    }
};

const getStatusVariant = (status?: number | null) => {
    if (typeof status !== "number") return "default";
    if (status >= 200 && status < 400) return "success";
    if (status >= 400) return "danger";
    return "default";
};

const DetailItem = ({
    label,
    value,
    multiline = false,
    isDarkMode,
    isCode = false,
}: {
    label: string;
    value: string;
    multiline?: boolean;
    isDarkMode: boolean;
    isCode?: boolean;
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
            {isCode ? (
                <pre
                    className={cn(
                        "mt-1.5 whitespace-pre-wrap break-words text-xs leading-5 font-mono p-3 rounded-lg overflow-x-auto",
                        isDarkMode ? "bg-black/40 text-emerald-400" : "bg-slate-900 text-emerald-400",
                    )}
                >
                    {value}
                </pre>
            ) : multiline ? (
                <p
                    className={cn(
                        "mt-1.5 whitespace-pre-wrap break-words text-sm leading-6",
                        isDarkMode ? "text-white/80" : "text-slate-800",
                    )}
                >
                    {value}
                </p>
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

const DetailSection = ({
    title,
    icon: Icon,
    children,
    isDarkMode,
}: {
    title: string;
    icon: any;
    children: React.ReactNode;
    isDarkMode: boolean;
}) => {
    return (
        <section
            className={cn(
                "rounded-2xl border p-6 space-y-5",
                isDarkMode ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-white",
            )}
        >
            <div className="flex items-center gap-3 pb-2 border-b border-dashed border-current/10">
                <div className={cn("p-2 rounded-lg", isDarkMode ? "bg-white/5 text-white/70" : "bg-slate-100 text-slate-600")}>
                    <Icon size={18} />
                </div>
                <h3
                    className={cn(
                        "text-sm font-bold uppercase tracking-wider",
                        isDarkMode ? "text-white/60" : "text-slate-900",
                    )}
                >
                    {title}
                </h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {children}
            </div>
        </section>
    );
};

export const ApiRequestLogDetailsView = () => {
    const params = useParams();
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const id = params?.id as string;

    const { data: log, isLoading, isError, error, refetch } = useApiRequestLogDetailsQuery(id);

    if (isLoading) {
        return (
            <div className="flex min-h-[600px] flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
                <p className={cn("text-sm font-medium", isDarkMode ? "text-white/60" : "text-slate-600")}>
                    Loading request details...
                </p>
            </div>
        );
    }

    if (isError || !log) {
        return (
            <div className="flex min-h-[600px] flex-col items-center justify-center gap-6 text-center p-8">
                <div className="bg-red-500/10 p-4 rounded-full">
                    <AlertTriangle className="h-10 w-10 text-red-500" />
                </div>
                <div>
                    <p className={cn("text-xl font-bold", isDarkMode ? "text-white" : "text-slate-900")}>
                        Failed to load log details
                    </p>
                    <p className={cn("mt-2 text-sm max-w-sm", isDarkMode ? "text-white/55" : "text-slate-600")}>
                        {error instanceof Error ? error.message : "The requested log could not be found or an error occurred."}
                    </p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="px-6 py-2.5 rounded-xl bg-slate-600 text-white text-sm font-semibold hover:bg-slate-700 transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-8 space-y-8 max-w-[1200px] mx-auto no-scrollbar pb-32">
            <div className="flex flex-col gap-6">
                <button
                    onClick={() => router.back()}
                    className={cn(
                        "flex items-center gap-2 text-sm font-semibold transition-colors w-fit",
                        isDarkMode ? "text-white/50 hover:text-white" : "text-slate-500 hover:text-slate-900",
                    )}
                >
                    <ArrowLeft size={16} />
                    Back to Logs
                </button>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className={cn("text-3xl font-bold tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>
                                Log Details
                            </h1>
                            <Badge isDarkMode={isDarkMode} variant={getMethodVariant(log.method)} className="text-sm px-3 py-1">
                                {log.method || "N/A"}
                            </Badge>
                            <Badge isDarkMode={isDarkMode} variant={getStatusVariant(log.status_code)} className="text-sm px-3 py-1">
                                {formatStatus(log.status_code)}
                            </Badge>
                            {log.success === false && (
                                <Badge isDarkMode={isDarkMode} variant="danger" className="text-sm px-3 py-1">
                                    Failed
                                </Badge>
                            )}
                        </div>
                        <p className={cn("text-sm mt-2 font-mono", isDarkMode ? "text-white/50" : "text-slate-500")}>
                            {log.request_id}
                        </p>
                    </div>

                    <div className={cn(
                        "px-4 py-3 rounded-2xl border flex flex-col items-center justify-center",
                        isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
                    )}>
                        <p className={cn("text-[10px] font-bold uppercase tracking-widest opacity-50", isDarkMode ? "text-white" : "text-slate-900")}>
                            Execution Time
                        </p>
                        <p className={cn(
                            "text-xl font-bold mt-1",
                            Number(log.duration_ms || 0) > 1000 ? "text-amber-500" : "text-emerald-500"
                        )}>
                            {formatDuration(log.duration_ms)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <DetailSection title="Core Information" icon={Info} isDarkMode={isDarkMode}>
                    <DetailItem label="Internal ID" value={formatValue(log.id)} isDarkMode={isDarkMode} />
                    <DetailItem label="Timestamp" value={formatDateTime(log.created_at)} isDarkMode={isDarkMode} />
                    <DetailItem label="Module" value={formatValue(log.module)} isDarkMode={isDarkMode} />
                    <DetailItem label="Route Path" value={formatValue(log.route_path)} isDarkMode={isDarkMode} />
                    <div className="sm:col-span-2 lg:col-span-3">
                        <DetailItem label="Original URL" value={formatValue(log.original_url)} multiline isDarkMode={isDarkMode} />
                    </div>
                </DetailSection>

                <DetailSection title="Actor & Authentication" icon={User} isDarkMode={isDarkMode}>
                    <DetailItem label="Actor Type" value={formatValue(log.actor_type)} isDarkMode={isDarkMode} />
                    <DetailItem label="User Type" value={formatValue(log.user_type)} isDarkMode={isDarkMode} />
                    <DetailItem label="Actor Name" value={formatValue(log.actor_name)} isDarkMode={isDarkMode} />
                    <DetailItem label="Actor Email" value={formatValue(log.actor_email)} isDarkMode={isDarkMode} />
                    <DetailItem label="Actor Role" value={formatValue(log.actor_role)} isDarkMode={isDarkMode} />
                    <DetailItem label="Tenant ID" value={formatValue(log.tenant_id)} isDarkMode={isDarkMode} />
                    <DetailItem label="User ID" value={formatValue(log.user_id)} isDarkMode={isDarkMode} />
                </DetailSection>

                <DetailSection title="Network & Infrastructure" icon={Server} isDarkMode={isDarkMode}>
                    <DetailItem label="IP Address" value={formatValue(log.ip_address)} isDarkMode={isDarkMode} />
                    <DetailItem label="Country" value={formatValue(log.country)} isDarkMode={isDarkMode} />
                    <DetailItem label="ISP" value={formatValue(log.isp)} isDarkMode={isDarkMode} />
                    <div className="sm:col-span-2 lg:col-span-3">
                        <DetailItem label="Forwarded For" value={formatValue(log.forwarded_for)} multiline isDarkMode={isDarkMode} />
                    </div>
                </DetailSection>

                <DetailSection title="Device & Browser" icon={Smartphone} isDarkMode={isDarkMode}>
                    <DetailItem label="OS" value={`${formatValue(log.os)} ${formatValue(log.os_version)}`} isDarkMode={isDarkMode} />
                    <DetailItem label="Browser" value={`${formatValue(log.browser)} ${formatValue(log.browser_version)}`} isDarkMode={isDarkMode} />
                    <DetailItem label="Device" value={`${formatValue(log.device_vendor)} ${formatValue(log.device_model)} (${formatValue(log.device_type)})`} isDarkMode={isDarkMode} />
                    <div className="sm:col-span-2 lg:col-span-3">
                        <DetailItem label="User Agent" value={formatValue(log.user_agent)} multiline isDarkMode={isDarkMode} />
                    </div>
                </DetailSection>

                <DetailSection title="Headers & Context" icon={Globe} isDarkMode={isDarkMode}>
                    <DetailItem label="Referer" value={formatValue(log.referer)} multiline isDarkMode={isDarkMode} />
                    <DetailItem label="Origin" value={formatValue(log.origin)} multiline isDarkMode={isDarkMode} />
                    <DetailItem label="Accept Language" value={formatValue(log.accept_language)} isDarkMode={isDarkMode} />
                </DetailSection>

                {(log.query_json || log.body_keys_json || log.error_message || log.metadata_json) && (
                    <DetailSection title="Data & Payloads" icon={Code} isDarkMode={isDarkMode}>
                        {log.query_json && (
                            <div className="sm:col-span-2 lg:col-span-3">
                                <DetailItem label="Query Parameters" value={renderJson(log.query_json)} isCode isDarkMode={isDarkMode} />
                            </div>
                        )}
                        {log.body_keys_json && (
                            <div className="sm:col-span-2 lg:col-span-3">
                                <DetailItem label="Request Body Keys" value={renderJson(log.body_keys_json)} isCode isDarkMode={isDarkMode} />
                            </div>
                        )}
                        {log.metadata_json && (
                            <div className="sm:col-span-2 lg:col-span-3">
                                <DetailItem label="Metadata" value={renderJson(log.metadata_json)} isCode isDarkMode={isDarkMode} />
                            </div>
                        )}
                        {log.error_message && (
                            <div className="sm:col-span-2 lg:col-span-3">
                                <DetailItem label="Error Message" value={formatValue(log.error_message)} multiline isDarkMode={isDarkMode} />
                            </div>
                        )}
                    </DetailSection>
                )}
            </div>
        </div>
    );
};