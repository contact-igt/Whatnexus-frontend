"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft, MessageCircle, User, Phone, Hash,
  Stethoscope, CalendarDays, ClipboardList, Clock,
  Send, FileText, Tag, Image, Link2, RefreshCw,
  AlertTriangle, CheckCircle2, Timer, Hourglass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { useFollowUpHubDetailQuery } from "@/hooks/useFollowUpHubQuery";
import { type FollowUpHubRow } from "@/services/appointment";
import { glassCard, glassInner, tx } from "@/components/views/dashboard/glassStyles";

// ── Formatters ────────────────────────────────────────────────────────────────

const fmtDate = (v?: string | null) => {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtTime = (v?: string | null) => {
  if (!v) return null;
  return v.includes(":") ? v.slice(0, 5) : v;
};

const fmtDateTime = (v?: string | null) => {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const safe = (v?: string | number | null) =>
  v === null || v === undefined || v === "" ? null : String(v);

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CFG = {
  sent:    { color: "#10b981", label: "Sent",    Icon: CheckCircle2 },
  pending: { color: "#f59e0b", label: "Pending", Icon: Hourglass },
  failed:  { color: "#ef4444", label: "Failed",  Icon: AlertTriangle },
} as const;

// ── Sub-components ────────────────────────────────────────────────────────────

const Field = ({
  icon: Icon, label, value, mono = false, accent, isDarkMode,
}: {
  icon: any; label: string; value: string | null; mono?: boolean; accent?: string; isDarkMode: boolean;
}) => {
  const t = tx(isDarkMode);
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
        style={{ background: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", color: accent ?? t.micro }}
      >
        <Icon size={13} />
      </div>
      <div className="min-w-0">
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: t.micro }}>
          {label}
        </p>
        <p
          className={cn("mt-0.5 break-all", mono && "font-mono text-[11px]")}
          style={{ fontSize: mono ? 11 : 13, fontWeight: 500, color: accent ?? t.value, lineHeight: 1.4 }}
        >
          {value}
        </p>
      </div>
    </div>
  );
};

const Card = ({ children, isDarkMode, className }: { children: React.ReactNode; isDarkMode: boolean; className?: string }) => (
  <div
    className={cn("rounded-2xl p-5", className)}
    style={glassCard(isDarkMode)}
  >
    {children}
  </div>
);

const CardTitle = ({ children, isDarkMode }: { children: React.ReactNode; isDarkMode: boolean }) => (
  <p
    className="mb-4 text-xs font-bold uppercase tracking-widest"
    style={{ color: tx(isDarkMode).micro }}
  >
    {children}
  </p>
);

// ── Timeline ──────────────────────────────────────────────────────────────────

const TimelineStep = ({
  label, value, active, done, color, isDarkMode,
}: {
  label: string; value: string | null; active?: boolean; done?: boolean; color: string; isDarkMode: boolean;
}) => {
  const t = tx(isDarkMode);
  const dotColor = done || active ? color : isDarkMode ? "#3f3f46" : "#d4d4d8";
  const lineColor = done ? color : isDarkMode ? "#27272a" : "#e4e4e7";
  return (
    <div className="flex flex-1 flex-col items-center gap-1.5 relative">
      <div className="flex w-full items-center">
        <div className="flex-1 h-px" style={{ background: lineColor }} />
        <div
          className="h-3 w-3 shrink-0 rounded-full ring-2 ring-offset-2"
          style={{
            background: dotColor,
            ringColor: dotColor,
            ringOffsetColor: isDarkMode ? "#09090b" : "#ffffff",
          }}
        />
        <div className="flex-1 h-px" style={{ background: isDarkMode ? "#27272a" : "#e4e4e7" }} />
      </div>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: active ? color : t.micro }}>
        {label}
      </p>
      <p style={{ fontSize: 11, color: t.micro, textAlign: "center" }}>
        {value ?? "—"}
      </p>
    </div>
  );
};

// ── Main View ─────────────────────────────────────────────────────────────────

export const FollowUpDetailPageView = ({ followUpId }: { followUpId: string }) => {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { data, isLoading, isError, error } = useFollowUpHubDetailQuery(followUpId);

  const baseRoute = pathname?.startsWith("/followup-hub") ? "/followup-hub" : "/followups";

  const row = useMemo(
    () => ((data as { data?: FollowUpHubRow } | undefined)?.data || null) as FollowUpHubRow | null,
    [data],
  );

  const t = tx(isDarkMode);
  const pageBg = isDarkMode ? "#09090b" : "#f8fafc";

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-4 p-6" style={{ background: pageBg, minHeight: "100vh" }}>
        {[160, 80, 260].map((h, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl"
            style={{ height: h, background: isDarkMode ? "#18181b" : "#f4f4f5" }}
          />
        ))}
      </div>
    );
  }

  // ── Error / not found ──────────────────────────────────────────────────────
  if (!row) {
    return (
      <div className="space-y-4 p-6" style={{ background: pageBg, minHeight: "100vh" }}>
        <button
          type="button"
          onClick={() => router.push(baseRoute)}
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all"
          style={glassCard(isDarkMode)}
        >
          <ArrowLeft size={15} /> Back
        </button>
        {isError && (
          <div
            className="rounded-2xl border p-4 text-sm"
            style={{ borderColor: "#ef444440", background: "#ef444410", color: "#ef4444" }}
          >
            {(error as { message?: string } | null)?.message ?? "Failed to load follow-up detail."}
          </div>
        )}
        <Card isDarkMode={isDarkMode}>
          <p style={{ color: t.secondary }}>Follow-up detail not found.</p>
        </Card>
      </div>
    );
  }

  const msg = row.scheduled_message;
  const statusKey = (msg?.status ?? "pending") as keyof typeof STATUS_CFG;
  const status = STATUS_CFG[statusKey] ?? STATUS_CFG.pending;
  const StatusIcon = status.Icon;

  const initial = (row.patient_name || "?").charAt(0).toUpperCase();
  const apptDate = fmtDate(row.appointment_date);
  const followDate = fmtDate(row.follow_up_date);
  const followTime = fmtTime(row.follow_up_time);
  const scheduledAt = fmtDateTime(msg?.scheduled_at);
  const sentAt = fmtDateTime(msg?.sent_at);
  const createdAt = fmtDateTime(msg?.created_at ?? row.created_at);

  const typeLabel = row.follow_up_type ?? "—";
  const triggerLabel = row.send_type === "noshow" ? "No-show" : row.send_type === "follow_up" ? "Follow-up" : null;

  return (
    <div className="min-h-screen space-y-4 p-6 animate-in slide-in-from-bottom-4 duration-400" style={{ background: pageBg }}>

      {/* ── Hero card ─────────────────────────────────────────────── */}
      <div
        className="overflow-hidden rounded-2xl"
        style={glassCard(isDarkMode)}
      >
        {/* Status color bar */}
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${status.color}, ${status.color}66)` }} />

        <div className="p-5">
          {/* ── Row 1: back + actions ──────────────────────────────── */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => router.push(baseRoute)}
              className="inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: t.micro }}
            >
              <ArrowLeft size={14} /> Back to Follow-up Hub
            </button>

            {row.phone && (
              <button
                type="button"
                onClick={() => router.push(`/chats?phone=${encodeURIComponent(row.phone)}`)}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-110"
                style={{ background: "#10b981" }}
              >
                <MessageCircle size={14} /> Open Chat
              </button>
            )}
          </div>

          {/* ── Row 2: identity + meta ─────────────────────────────── */}
          <div className="flex flex-wrap items-center justify-between gap-6">

            {/* Left: avatar + name + badges */}
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div
                className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-black"
                style={{ background: `${status.color}18`, color: status.color }}
              >
                {initial}
                {/* Status dot */}
                <span
                  className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full ring-2"
                  style={{ background: status.color, ringColor: isDarkMode ? "#09090b" : "#fff" }}
                >
                  <StatusIcon size={10} color="#fff" />
                </span>
              </div>

              {/* Name + phone + badges */}
              <div>
                <h1 className="text-2xl font-bold leading-tight" style={{ color: t.value, letterSpacing: "-0.02em" }}>
                  {row.patient_name || "—"}
                </h1>
                <p className="mt-0.5 text-sm tabular-nums" style={{ color: t.micro }}>
                  {row.phone || "No phone"}
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold"
                    style={{ background: `${status.color}20`, border: `1px solid ${status.color}40`, color: status.color }}
                  >
                    <StatusIcon size={10} /> {status.label}
                  </span>
                  <span
                    className="inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-semibold"
                    style={{ background: isDarkMode ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)", color: t.secondary }}
                  >
                    {typeLabel}
                  </span>
                  {triggerLabel && (
                    <span
                      className="inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-semibold"
                      style={{ background: isDarkMode ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)", color: t.secondary }}
                    >
                      {triggerLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: meta stats strip */}
            <div className="flex items-stretch divide-x rounded-xl overflow-hidden"
              style={{
                background: isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.08)" : "#e4e4e7"}`,
                divideColor: isDarkMode ? "rgba(255,255,255,0.07)" : "#e4e4e7",
              }}
            >
              {[
                { label: "Doctor",      value: row.doctor_name ?? null },
                { label: "Appointment", value: apptDate },
                { label: "Appt Status", value: row.appointment_status ?? null },
                { label: "Created",     value: createdAt },
              ].filter(m => m.value).map((m, i, arr) => (
                <div
                  key={m.label}
                  className="flex flex-col justify-center px-5 py-3"
                  style={{ borderRight: i < arr.length - 1 ? `1px solid ${isDarkMode ? "rgba(255,255,255,0.07)" : "#e4e4e7"}` : "none" }}
                >
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: t.micro }}>
                    {m.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold capitalize" style={{ color: t.value, whiteSpace: "nowrap" }}>
                    {m.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Timeline ──────────────────────────────────────────────── */}
      <Card isDarkMode={isDarkMode}>
        <CardTitle isDarkMode={isDarkMode}>Message Journey</CardTitle>
        <div className="flex items-start px-2">
          <TimelineStep
            label="Appointment"
            value={apptDate}
            done={!!apptDate}
            color="#10b981"
            isDarkMode={isDarkMode}
          />
          <TimelineStep
            label="Follow-up due"
            value={followDate ? `${followDate}${followTime ? ` · ${followTime}` : ""}` : null}
            done={!!followDate}
            color="#10b981"
            isDarkMode={isDarkMode}
          />
          <TimelineStep
            label="Scheduled"
            value={scheduledAt}
            done={!!scheduledAt}
            active={msg?.status === "pending"}
            color="#f59e0b"
            isDarkMode={isDarkMode}
          />
          <TimelineStep
            label={msg?.status === "failed" ? "Failed" : "Sent"}
            value={sentAt ?? (msg?.status === "failed" ? "Delivery failed" : null)}
            done={msg?.status === "sent"}
            active={msg?.status === "failed"}
            color={msg?.status === "failed" ? "#ef4444" : "#10b981"}
            isDarkMode={isDarkMode}
          />
        </div>
      </Card>

      {/* ── Two-column detail ─────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* Left: Patient + Appointment */}
        <Card isDarkMode={isDarkMode}>
          <CardTitle isDarkMode={isDarkMode}>Patient &amp; Appointment</CardTitle>
          <div className="space-y-4">
            <Field icon={User}         label="Patient Name"   value={safe(row.patient_name)}    isDarkMode={isDarkMode} />
            <Field icon={Phone}         label="Phone"          value={safe(row.phone)}            isDarkMode={isDarkMode} />
            <Field icon={Hash}          label="Contact ID"     value={safe(row.contact_id)}       isDarkMode={isDarkMode} mono />
            <Field icon={Stethoscope}   label="Doctor"         value={safe(row.doctor_name)}      isDarkMode={isDarkMode} />
            <Field icon={CalendarDays}  label="Appointment Date" value={apptDate}                 isDarkMode={isDarkMode} />
            <Field icon={Tag}           label="Appt Status"    value={safe(row.appointment_status)} isDarkMode={isDarkMode} />
            <Field icon={CalendarDays}  label="Follow-up Date" value={followDate ? `${followDate}${followTime ? ` · ${followTime}` : ""}` : null} accent="#10b981" isDarkMode={isDarkMode} />
            <Field icon={ClipboardList} label="Follow-up Type" value={safe(row.follow_up_type)}  isDarkMode={isDarkMode} />
            <Field icon={Tag}           label="Reason"         value={safe(row.follow_up_reason)} isDarkMode={isDarkMode} />
            {row.notes?.trim() && (
              <div
                className="rounded-xl px-4 py-3 text-sm italic"
                style={{ background: isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.07)" : "#e4e4e7"}`, color: t.secondary }}
              >
                "{row.notes.trim()}"
              </div>
            )}
          </div>
        </Card>

        {/* Right: Template + Message */}
        <div className="space-y-4">
          <Card isDarkMode={isDarkMode}>
            <CardTitle isDarkMode={isDarkMode}>Template</CardTitle>
            <div className="space-y-4">
              <Field icon={Hash}     label="Template ID"   value={safe(msg?.template_id ?? row.template_id)} mono isDarkMode={isDarkMode} />
              <Field icon={FileText} label="Template Name" value={safe(msg?.template_name)}  isDarkMode={isDarkMode} />
              <Field icon={Tag}      label="Template Type" value={safe(msg?.template_type)}  isDarkMode={isDarkMode} />
              <Field icon={Image}    label="Header Type"   value={safe(msg?.header_type ?? msg?.template_header_type)} isDarkMode={isDarkMode} />
              <Field icon={Link2}    label="Media URL"     value={safe(msg?.header_media_url ?? msg?.media_url)} mono isDarkMode={isDarkMode} />
              <Field icon={FileText} label="File Name"     value={safe(msg?.header_file_name)} isDarkMode={isDarkMode} />
            </div>
          </Card>

          <Card isDarkMode={isDarkMode}>
            <CardTitle isDarkMode={isDarkMode}>Message Delivery</CardTitle>
            <div className="space-y-4">
              <Field icon={Send}       label="Scheduled At"     value={scheduledAt}             isDarkMode={isDarkMode} />
              <Field icon={CheckCircle2} label="Sent At"        value={sentAt}                  isDarkMode={isDarkMode} accent="#10b981" />
              <Field icon={Hash}       label="WAMID"            value={safe(msg?.meta_message_id)} mono isDarkMode={isDarkMode} />
              <Field icon={Hash}       label="Scheduled Msg ID" value={safe(msg?.id)}           mono isDarkMode={isDarkMode} />
              <Field icon={RefreshCw}  label="Retry Count"      value={safe(msg?.retry_count)}  isDarkMode={isDarkMode} />
            </div>
          </Card>
        </div>
      </div>

      {/* ── Message preview ───────────────────────────────────────── */}
      {(msg?.rendered_message ?? msg?.rendered_preview ?? msg?.message_preview) && (
        <Card isDarkMode={isDarkMode}>
          <CardTitle isDarkMode={isDarkMode}>Rendered Message Preview</CardTitle>
          <div className="flex justify-start">
            <div
              className="max-w-lg rounded-2xl rounded-tl-sm px-4 py-3 text-sm whitespace-pre-wrap"
              style={{
                background: isDarkMode ? "#1a2e1f" : "#dcfce7",
                color: isDarkMode ? "#a7f3d0" : "#14532d",
                border: `1px solid ${isDarkMode ? "#10b98130" : "#86efac"}`,
                lineHeight: 1.6,
              }}
            >
              {safe(msg?.rendered_message ?? msg?.rendered_preview ?? msg?.message_preview)}
            </div>
          </div>
        </Card>
      )}

      {/* ── Error log ─────────────────────────────────────────────── */}
      {msg?.error_log && (
        <div
          className="rounded-2xl border px-5 py-4"
          style={{ borderColor: "#ef444435", background: "#ef444410" }}
        >
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle size={14} style={{ color: "#ef4444" }} />
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#ef4444" }}>
              Error Log
            </p>
          </div>
          <p className="break-all font-mono text-xs" style={{ color: isDarkMode ? "#fca5a5" : "#b91c1c" }}>
            {msg.error_log}
          </p>
        </div>
      )}
    </div>
  );
};
