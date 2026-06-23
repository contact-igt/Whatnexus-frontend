"use client";

import { type ReactNode } from "react";
import { Drawer } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { type FollowUpHubRow } from "@/services/appointment";

interface FollowUpDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  row: FollowUpHubRow | null;
  isDarkMode: boolean;
}

const DetailItem = ({
  label,
  value,
  isDarkMode,
  mono = false,
}: {
  label: string;
  value: string;
  isDarkMode: boolean;
  mono?: boolean;
}) => (
  <div>
    <label
      className={cn(
        "mb-1 block text-[11px] font-semibold uppercase tracking-wide",
        isDarkMode ? "text-white/45" : "text-slate-500",
      )}
    >
      {label}
    </label>
    <p
      className={cn(
        "text-sm",
        mono && "font-mono text-xs break-all",
        isDarkMode ? "text-white" : "text-slate-900",
      )}
    >
      {value}
    </p>
  </div>
);

const Section = ({
  title,
  children,
  isDarkMode,
}: {
  title: string;
  children: ReactNode;
  isDarkMode: boolean;
}) => (
  <section>
    <h3 className={cn("mb-4 text-sm font-semibold", isDarkMode ? "text-white" : "text-slate-900")}>{title}</h3>
    {children}
  </section>
);

const statusTone = (
  status: "pending" | "sent" | "failed" | string,
  isDarkMode: boolean,
) => {
  if (status === "sent") {
    return isDarkMode
      ? "bg-[#081711] text-emerald-300 border-[#1c3a2d]"
      : "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (status === "failed") {
    return isDarkMode
      ? "bg-[#1a0a0d] text-red-300 border-[#3d1a23]"
      : "bg-red-50 text-red-700 border-red-200";
  }
  return isDarkMode
    ? "bg-[#1a1708] text-amber-300 border-[#3a3213]"
    : "bg-amber-50 text-amber-700 border-amber-200";
};

export const FollowUpDetailDrawer = ({
  isOpen,
  onClose,
  row,
  isDarkMode,
}: FollowUpDetailDrawerProps) => {
  const msg = row?.scheduled_message;

  const fmtDate = (value?: string | null) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const fmtTime = (value?: string | null) => {
    if (!value) return "-";
    return value.includes(":") ? value.slice(0, 5) : value;
  };

  const fmtDateTime = (value?: string | null) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const safe = (value?: string | number | null) => {
    if (value === null || value === undefined || value === "") return "-";
    return String(value);
  };

  const triggerLabel = row?.send_type === "noshow" ? "No-show" : row?.send_type === "follow_up" ? "Follow-up" : "-";

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Follow-up Details"
      description="Complete follow-up, template, and message metadata."
      isDarkMode={isDarkMode}
      className={cn(
        "max-w-2xl font-sans [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']",
        isDarkMode ? "bg-black" : "bg-white",
      )}
      footer={
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "rounded-xl border px-6 py-2.5 text-sm font-semibold transition-all",
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
      <div className="space-y-7 overflow-y-auto pr-2">
        <Section title="Patient Details" isDarkMode={isDarkMode}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailItem label="Patient Name" value={safe(row?.patient_name)} isDarkMode={isDarkMode} />
            <DetailItem label="Phone" value={safe(row?.phone)} isDarkMode={isDarkMode} />
            <DetailItem label="Contact ID" value={safe(row?.contact_id)} isDarkMode={isDarkMode} />
          </div>
        </Section>

        <Section title="Appointment Details" isDarkMode={isDarkMode}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailItem label="Appointment ID" value={safe(row?.appointment_id)} isDarkMode={isDarkMode} mono />
            <DetailItem label="Doctor Name" value={safe(row?.doctor_name)} isDarkMode={isDarkMode} />
            <DetailItem label="Appointment Date" value={fmtDate(row?.appointment_date)} isDarkMode={isDarkMode} />
            <div>
              <label
                className={cn(
                  "mb-1 block text-[11px] font-semibold uppercase tracking-wide",
                  isDarkMode ? "text-white/45" : "text-slate-500",
                )}
              >
                Appointment Status
              </label>
              <span
                className={cn(
                  "inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium capitalize",
                  isDarkMode ? "border-white/15 bg-white/5 text-white/75" : "border-slate-200 bg-slate-100 text-slate-700",
                )}
              >
                {safe(row?.appointment_status)}
              </span>
            </div>
            <div className="sm:col-span-2">
              <label
                className={cn(
                  "mb-1 block text-[11px] font-semibold uppercase tracking-wide",
                  isDarkMode ? "text-white/45" : "text-slate-500",
                )}
              >
                Notes
              </label>
              <div
                className={cn(
                  "rounded-xl border px-3 py-2 text-sm whitespace-pre-wrap",
                  isDarkMode ? "border-white/10 bg-white/[0.03] text-white/85" : "border-slate-200 bg-slate-50 text-slate-700",
                )}
              >
                {row?.notes?.trim() || "-"}
              </div>
            </div>
          </div>
        </Section>

        <Section title="Follow-up Details" isDarkMode={isDarkMode}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailItem label="Follow-up Type" value={safe(row?.follow_up_type)} isDarkMode={isDarkMode} />
            <DetailItem label="Trigger" value={triggerLabel} isDarkMode={isDarkMode} />
            <DetailItem label="Reason" value={safe(row?.follow_up_reason)} isDarkMode={isDarkMode} />
            <DetailItem label="Follow-up Date" value={fmtDate(row?.follow_up_date)} isDarkMode={isDarkMode} />
            <DetailItem label="Follow-up Time" value={fmtTime(row?.follow_up_time)} isDarkMode={isDarkMode} />
            <DetailItem label="Scheduled At" value={fmtDateTime(msg?.scheduled_at)} isDarkMode={isDarkMode} />
            <DetailItem label="Sent At" value={fmtDateTime(msg?.sent_at)} isDarkMode={isDarkMode} />
            <DetailItem label="Created At" value={fmtDateTime(msg?.created_at || row?.created_at)} isDarkMode={isDarkMode} />
            <DetailItem label="Updated At" value={fmtDateTime(msg?.updated_at || row?.updated_at)} isDarkMode={isDarkMode} />
          </div>
        </Section>

        <Section title="Template Details" isDarkMode={isDarkMode}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailItem label="Template ID" value={safe(msg?.template_id || row?.template_id)} isDarkMode={isDarkMode} mono />
            <DetailItem label="Template Name" value={safe(msg?.template_name)} isDarkMode={isDarkMode} />
            <DetailItem label="Template Type" value={safe(msg?.template_type)} isDarkMode={isDarkMode} />
            <DetailItem label="Header Type" value={safe(msg?.header_type || msg?.template_header_type)} isDarkMode={isDarkMode} />
            <div className="sm:col-span-2">
              <DetailItem label="Media URL" value={safe(msg?.header_media_url || msg?.media_url)} isDarkMode={isDarkMode} mono />
            </div>
            <DetailItem label="Header File Name" value={safe(msg?.header_file_name)} isDarkMode={isDarkMode} />
            <div className="sm:col-span-2">
              <label
                className={cn(
                  "mb-1 block text-[11px] font-semibold uppercase tracking-wide",
                  isDarkMode ? "text-white/45" : "text-slate-500",
                )}
              >
                Rendered Message Preview
              </label>
              <div
                className={cn(
                  "rounded-xl border px-3 py-2 text-sm whitespace-pre-wrap",
                  isDarkMode ? "border-white/10 bg-white/[0.03] text-white/85" : "border-slate-200 bg-slate-50 text-slate-700",
                )}
              >
                {safe(msg?.rendered_message || msg?.rendered_preview || msg?.message_preview)}
              </div>
            </div>
          </div>
        </Section>

        <Section title="Message Details" isDarkMode={isDarkMode}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                className={cn(
                  "mb-1 block text-[11px] font-semibold uppercase tracking-wide",
                  isDarkMode ? "text-white/45" : "text-slate-500",
                )}
              >
                Status
              </label>
              {msg?.status ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium capitalize",
                    statusTone(msg.status, isDarkMode),
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-90" />
                  {msg.status}
                </span>
              ) : (
                <p className={cn("text-sm", isDarkMode ? "text-white" : "text-slate-900")}>-</p>
              )}
            </div>
            <DetailItem label="Meta Message ID / WAMID" value={safe(msg?.meta_message_id)} isDarkMode={isDarkMode} mono />
            <DetailItem label="Retry Count" value={safe(msg?.retry_count)} isDarkMode={isDarkMode} />
            <DetailItem label="Scheduled Message ID" value={safe(msg?.id)} isDarkMode={isDarkMode} mono />
          </div>

          {msg?.error_log ? (
            <div
              className={cn(
                "mt-4 rounded-xl border px-4 py-3",
                isDarkMode ? "border-red-500/25 bg-red-500/10" : "border-red-200 bg-red-50",
              )}
            >
              <p className={cn("mb-1 text-xs font-semibold uppercase tracking-wide", isDarkMode ? "text-red-300" : "text-red-700")}>
                Error Log
              </p>
              <p className={cn("font-mono text-xs break-all", isDarkMode ? "text-red-200" : "text-red-700")}>{msg.error_log}</p>
            </div>
          ) : null}
        </Section>
      </div>
    </Drawer>
  );
};
