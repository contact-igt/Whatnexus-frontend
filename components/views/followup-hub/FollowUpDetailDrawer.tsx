"use client";

import { Drawer } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { type FollowUpHubRow } from "@/services/appointment";

interface FollowUpDetailDrawerProps {
    isOpen:     boolean;
    onClose:    () => void;
    row:        FollowUpHubRow | null;
    isDarkMode: boolean;
}

export const FollowUpDetailDrawer = ({
    isOpen,
    onClose,
    row,
    isDarkMode,
}: FollowUpDetailDrawerProps) => {
    const labelCls = cn("text-xs font-semibold mb-1 block", isDarkMode ? "text-white/50" : "text-slate-500");
    const valueCls = cn("text-sm", isDarkMode ? "text-white" : "text-slate-900");

    const msg = row?.scheduled_message;

    const fmtDate = (d?: string | null) =>
        d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

    const fmtDateTime = (d?: string | null) =>
        d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

    const statusCls = {
        pending: "bg-yellow-100 text-yellow-800",
        sent:    "bg-green-100  text-green-800",
        failed:  "bg-red-100   text-red-800",
    } as const;

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title="Follow-up Details"
            description="Full details for this scheduled follow-up."
            isDarkMode={isDarkMode}
            className={cn(
                "max-w-xl font-sans [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']",
                isDarkMode ? "bg-black" : "bg-white",
            )}
            footer={
                <div className="flex items-center justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-sm font-semibold transition-all border",
                            isDarkMode
                                ? "border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
                                : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                        )}
                    >
                        Close
                    </button>
                </div>
            }
        >
            <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2">

                {/* ── Patient ── */}
                <div>
                    <h3 className={cn("text-sm font-semibold mb-4", isDarkMode ? "text-white" : "text-slate-900")}>Patient</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Name</label>
                            <p className={valueCls}>{row?.patient_name ?? "—"}</p>
                        </div>
                        <div>
                            <label className={labelCls}>Phone</label>
                            <p className={valueCls}>{row?.phone ?? "—"}</p>
                        </div>
                        <div>
                            <label className={labelCls}>Appointment Date</label>
                            <p className={valueCls}>{fmtDate(row?.appointment_date)}</p>
                        </div>
                        <div>
                            <label className={labelCls}>Doctor</label>
                            <p className={valueCls}>{row?.doctor_name ?? "—"}</p>
                        </div>
                        <div>
                            <label className={labelCls}>Appointment Status</label>
                            <span className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                                isDarkMode ? "bg-white/10 text-white/70" : "bg-slate-100 text-slate-700",
                            )}>
                                {row?.appointment_status?.toLowerCase() ?? "—"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Follow-up ── */}
                <div>
                    <h3 className={cn("text-sm font-semibold mb-4", isDarkMode ? "text-white" : "text-slate-900")}>Follow-up</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Date</label>
                            <p className={valueCls}>{fmtDate(row?.follow_up_date)}</p>
                        </div>
                        <div>
                            <label className={labelCls}>Time</label>
                            <p className={valueCls}>{row?.follow_up_time?.slice(0, 5) ?? "—"}</p>
                        </div>
                        <div>
                            <label className={labelCls}>Type</label>
                            {row?.follow_up_type ? (
                                <span className={cn(
                                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                                    row.follow_up_type === "WhatsApp"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-blue-100 text-blue-800",
                                )}>
                                    {row.follow_up_type}
                                </span>
                            ) : <p className={valueCls}>—</p>}
                        </div>
                        <div>
                            <label className={labelCls}>Reason</label>
                            <p className={valueCls}>{row?.follow_up_reason ?? "—"}</p>
                        </div>
                        <div>
                            <label className={labelCls}>Trigger</label>
                            {row?.send_type ? (
                                <span className={cn(
                                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                                    row.send_type === "noshow"
                                        ? "bg-orange-100 text-orange-800"
                                        : "bg-purple-100 text-purple-800",
                                )}>
                                    {row.send_type === "follow_up" ? "Follow-up" : "No-Show"}
                                </span>
                            ) : <p className={valueCls}>—</p>}
                        </div>
                    </div>
                </div>

                {/* ── Visit Notes ── */}
                <div>
                    <h3 className={cn("text-sm font-semibold mb-4", isDarkMode ? "text-white" : "text-slate-900")}>Visit Notes</h3>
                    <div className={cn(
                        "px-4 py-3 rounded-xl border text-sm leading-relaxed whitespace-pre-wrap",
                        isDarkMode ? "border-white/8 bg-white/3 text-white/80" : "border-slate-200 bg-slate-50 text-slate-700",
                    )}>
                        {row?.notes?.trim() ? row.notes : (
                            <span className={isDarkMode ? "text-white/30" : "text-slate-400"}>No notes recorded</span>
                        )}
                    </div>
                </div>

                {/* ── WhatsApp Message — only when type is WhatsApp ── */}
                {row?.follow_up_type === "WhatsApp" && (
                    <div>
                        <h3 className={cn("text-sm font-semibold mb-4", isDarkMode ? "text-white" : "text-slate-900")}>WhatsApp Message</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Template</label>
                                    <p className={valueCls}>{msg?.template_name ?? "—"}</p>
                                </div>
                                <div>
                                    <label className={labelCls}>Status</label>
                                    {msg?.status ? (
                                        <span className={cn(
                                            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                                            statusCls[msg.status],
                                        )}>
                                            {msg.status}
                                        </span>
                                    ) : <p className={valueCls}>—</p>}
                                </div>
                                <div>
                                    <label className={labelCls}>Scheduled At</label>
                                    <p className={valueCls}>{fmtDateTime(msg?.scheduled_at)}</p>
                                </div>
                                <div>
                                    <label className={labelCls}>Sent At</label>
                                    <p className={valueCls}>{fmtDateTime(msg?.sent_at)}</p>
                                </div>
                            </div>

                            {/* Error log — only when failed and error_log present */}
                            {msg?.status === "failed" && msg.error_log && (
                                <div className={cn(
                                    "px-4 py-3 rounded-xl border text-xs",
                                    isDarkMode
                                        ? "border-red-500/25 bg-red-500/8 text-red-300"
                                        : "border-red-200 bg-red-50 text-red-700",
                                )}>
                                    <p className="font-semibold mb-1">Error Log</p>
                                    <p className="font-mono break-all">{msg.error_log}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </Drawer>
    );
};
