"use client";

import { type ReactNode } from "react";
import { RefreshCw, Send, Clock3 } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { type AppointmentReminderItem } from "@/services/appointment";
import { useGetReminderDetailQuery } from "@/hooks/useRemindersQuery";

interface ReminderDetailDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    row: AppointmentReminderItem | null;
    isDarkMode: boolean;
    onRetry: () => void;
    onSendNow: () => void;
    onReschedule: () => void;
    isRetrying: boolean;
    isSending: boolean;
}

const DetailItem = ({
    label, value, isDarkMode, mono = false,
}: {
    label: string; value: string; isDarkMode: boolean; mono?: boolean;
}) => (
    <div>
        <label className={cn("mb-1 block text-[11px] font-semibold uppercase tracking-wide", isDarkMode ? "text-white/45" : "text-slate-500")}>
            {label}
        </label>
        <p className={cn("text-sm", mono && "font-mono text-xs break-all", isDarkMode ? "text-white" : "text-slate-900")}>
            {value}
        </p>
    </div>
);

const Section = ({ title, children, isDarkMode }: { title: string; children: ReactNode; isDarkMode: boolean }) => (
    <section>
        <h3 className={cn("mb-4 text-sm font-semibold", isDarkMode ? "text-white" : "text-slate-900")}>{title}</h3>
        {children}
    </section>
);

const statusTone = (status: string, isDarkMode: boolean) => {
    if (status === "sent")   return isDarkMode ? "bg-[#081711] text-emerald-300 border-[#1c3a2d]" : "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (status === "failed") return isDarkMode ? "bg-[#1a0a0d] text-red-300 border-[#3d1a23]"     : "bg-red-50 text-red-700 border-red-200";
    return isDarkMode ? "bg-[#1a1708] text-amber-300 border-[#3a3213]" : "bg-amber-50 text-amber-700 border-amber-200";
};

const safe = (v?: string | number | null) => {
    if (v === null || v === undefined || v === "") return "—";
    return String(v);
};

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

const patientLabel = (detail: AppointmentReminderItem) =>
    detail.appointment?.patient_name || detail.contact?.name || "—";

const phoneLabel = (detail: AppointmentReminderItem) =>
    detail.contact?.phone || detail.to_phone || "—";

export const ReminderDetailDrawer = ({
    isOpen, onClose, row, isDarkMode,
    onRetry, onSendNow, onReschedule, isRetrying, isSending,
}: ReminderDetailDrawerProps) => {
    // Fetch enriched detail (includes rendered_message, retry_count, etc.)
    const { data: detailResponse, isLoading: detailLoading } = useGetReminderDetailQuery(
        isOpen && row?.id ? row.id : null,
    );

    // Use enriched detail when available, fall back to list row data while loading
    const detailData = (detailResponse as any)?.data ?? detailResponse;
    const detail: AppointmentReminderItem = (detailData && !detailLoading) ? detailData : (row ?? {} as AppointmentReminderItem);

    const status = detail.status ?? "pending";

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title="Reminder Details"
            description="Full appointment and scheduled reminder information."
            isDarkMode={isDarkMode}
            className={cn(
                "max-w-2xl font-sans [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']",
                isDarkMode ? "bg-black" : "bg-white",
            )}
            footer={
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        {status === "failed" && (
                            <button type="button" onClick={onRetry} disabled={isRetrying}
                                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-40 transition-all"
                                style={{ background: "#f59e0b" }}>
                                <RefreshCw size={13} /> Retry
                            </button>
                        )}
                        {status === "pending" && (
                            <button type="button" onClick={onSendNow} disabled={isSending}
                                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-40 transition-all"
                                style={{ background: "#10b981" }}>
                                <Send size={13} /> Send Now
                            </button>
                        )}
                        {(status === "pending" || status === "failed") && (
                            <button type="button" onClick={onReschedule}
                                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all"
                                style={{ background: "#3b82f614", border: "1px solid #3b82f640", color: "#3b82f6" }}>
                                <Clock3 size={13} /> Reschedule
                            </button>
                        )}
                    </div>
                    <button type="button" onClick={onClose}
                        className={cn(
                            "rounded-xl border px-6 py-2 text-sm font-semibold transition-all",
                            isDarkMode ? "border-white/10 text-white/70 hover:bg-white/5 hover:text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                        )}>
                        Close
                    </button>
                </div>
            }
        >
            {detailLoading && row ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                </div>
            ) : (
                <div className="space-y-7 overflow-y-auto pr-2">

                    {/* Patient */}
                    <Section title="Patient Details" isDarkMode={isDarkMode}>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <DetailItem label="Patient Name" value={patientLabel(detail)} isDarkMode={isDarkMode} />
                            <DetailItem label="Phone"        value={phoneLabel(detail)}   isDarkMode={isDarkMode} />
                            {detail.contact?.contact_id && (
                                <DetailItem label="Contact ID" value={safe(detail.contact.contact_id)} isDarkMode={isDarkMode} mono />
                            )}
                        </div>
                    </Section>

                    {/* Appointment */}
                    <Section title="Appointment Details" isDarkMode={isDarkMode}>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <DetailItem label="Appointment Date" value={fmtDate(detail.appointment?.appointment_date)}        isDarkMode={isDarkMode} />
                            <DetailItem label="Appointment Time" value={safe(detail.appointment?.appointment_time)}           isDarkMode={isDarkMode} />
                            <DetailItem label="Doctor"           value={doctorLabel(detail.doctor)}                          isDarkMode={isDarkMode} />
                            <DetailItem label="Branch"           value={safe(detail.appointment?.branch_name)}               isDarkMode={isDarkMode} />
                            <DetailItem label="Appointment ID"   value={safe(detail.appointment_id)}                         isDarkMode={isDarkMode} mono />
                            <div>
                                <label className={cn("mb-1 block text-[11px] font-semibold uppercase tracking-wide", isDarkMode ? "text-white/45" : "text-slate-500")}>
                                    Appointment Status
                                </label>
                                <span className={cn("inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium capitalize", isDarkMode ? "border-white/15 bg-white/5 text-white/75" : "border-slate-200 bg-slate-100 text-slate-700")}>
                                    {safe(detail.appointment?.status)}
                                </span>
                            </div>
                        </div>
                    </Section>

                    {/* Reminder */}
                    <Section title="Reminder Details" isDarkMode={isDarkMode}>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <DetailItem label="Template Name"    value={safe(detail.template?.template_name)} isDarkMode={isDarkMode} />
                            <DetailItem label="Template Type"    value={safe(detail.template?.template_type)} isDarkMode={isDarkMode} />
                            <DetailItem label="Scheduled Send At" value={fmtDateTime(detail.scheduled_at)}   isDarkMode={isDarkMode} />
                            <DetailItem label="Sent At"           value={fmtDateTime(detail.sent_at)}         isDarkMode={isDarkMode} />
                            <DetailItem label="Retry Count"       value={safe(detail.retry_count)}            isDarkMode={isDarkMode} />
                            <DetailItem label="Meta Message ID"   value={safe(detail.meta_message_id)}        isDarkMode={isDarkMode} mono />

                            {/* Status badge */}
                            <div>
                                <label className={cn("mb-1 block text-[11px] font-semibold uppercase tracking-wide", isDarkMode ? "text-white/45" : "text-slate-500")}>
                                    Status
                                </label>
                                <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium capitalize", statusTone(status, isDarkMode))}>
                                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-90" />
                                    {status}
                                </span>
                            </div>

                            {/* Created at */}
                            <DetailItem label="Created At" value={fmtDateTime(detail.created_at)} isDarkMode={isDarkMode} />

                            {/* Rendered preview */}
                            {(detail.rendered_message || detail.rendered_preview || detail.message_preview) && (
                                <div className="sm:col-span-2">
                                    <label className={cn("mb-1 block text-[11px] font-semibold uppercase tracking-wide", isDarkMode ? "text-white/45" : "text-slate-500")}>
                                        Rendered Message Preview
                                    </label>
                                    <div className={cn("rounded-xl border px-3 py-2 text-sm whitespace-pre-wrap", isDarkMode ? "border-white/10 bg-white/[0.03] text-white/85" : "border-slate-200 bg-slate-50 text-slate-700")}>
                                        {detail.rendered_message || detail.rendered_preview || detail.message_preview}
                                    </div>
                                </div>
                            )}

                            {/* Header media URL */}
                            {detail.header_media_url && (
                                <div className="sm:col-span-2">
                                    <DetailItem label="Media URL" value={safe(detail.header_media_url)} isDarkMode={isDarkMode} mono />
                                </div>
                            )}
                        </div>

                        {/* Error log */}
                        {detail.error_log && (
                            <div className={cn("mt-4 rounded-xl border px-4 py-3", isDarkMode ? "border-red-500/25 bg-red-500/10" : "border-red-200 bg-red-50")}>
                                <p className={cn("mb-1 text-xs font-semibold uppercase tracking-wide", isDarkMode ? "text-red-300" : "text-red-700")}>Error Log</p>
                                <p className={cn("font-mono text-xs break-all", isDarkMode ? "text-red-200" : "text-red-700")}>{detail.error_log}</p>
                            </div>
                        )}
                    </Section>
                </div>
            )}
        </Drawer>
    );
};
