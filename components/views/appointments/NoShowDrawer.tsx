"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ChevronRight, Layers, MessageSquareText } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { Select } from "@/components/ui/select";
import {
  TemplateSelectionModal,
  type ProcessedTemplate,
} from "@/components/campaign/templateSelectionModal";
import { TemplateVariableModal } from "@/components/views/history/templateVariableModal";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { useGetTenantSettingsQuery } from "@/hooks/useTenantSettingsQuery";
import type { Appointment } from "./bookingList";

export interface NoShowSubmitPayload {
  appointment_id: string;
  mode: "manual" | "default";
  follow_up_date?: string | null;
  follow_up_time?: string | null;
  follow_up_type?: "Call" | "WhatsApp" | null;
  template_id: string | null;
  header_media_url?: string | null;
  header_file_name?: string | null;
}

interface NoShowDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: NoShowSubmitPayload) => void;
  appointment: Appointment | null;
  isDarkMode: boolean;
  isSaving?: boolean;
}

export const NoShowDrawer = ({
  isOpen,
  onClose,
  onSave,
  appointment,
  isDarkMode,
  isSaving = false,
}: NoShowDrawerProps) => {
  const getLocalDateTimeMin = () => {
    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offsetMs).toISOString().slice(0, 16);
  };

  const [mode, setMode] = useState<"manual" | "default">("default");
  const [followUpDateTime, setFollowUpDateTime] = useState("");
  const [followUpType, setFollowUpType] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [headerMediaUrl, setHeaderMediaUrl] = useState("");
  const [headerFileName, setHeaderFileName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<ProcessedTemplate | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isTemplateVariableModalOpen, setIsTemplateVariableModalOpen] =
    useState(false);
  const [selectedTemplateForVariables, setSelectedTemplateForVariables] =
    useState<ProcessedTemplate | null>(null);
  const [templateTouched, setTemplateTouched] = useState(false);

  const minDateTime = getLocalDateTimeMin();

  const { data: tenantSettingsData } = useGetTenantSettingsQuery();
  const noshowTime = tenantSettingsData?.data?.ai_settings?.noshow_followup_time || "09:00";

  useEffect(() => {
    if (!isOpen) return;
    setMode("default");
    setFollowUpDateTime("");
    setFollowUpType("");
    setTemplateId("");
    setHeaderMediaUrl("");
    setHeaderFileName("");
    setSelectedTemplate(null);
    setSelectedTemplateForVariables(null);
    setIsTemplateModalOpen(false);
    setIsTemplateVariableModalOpen(false);
    setTemplateTouched(false);
  }, [isOpen, appointment?.appointment_id]);

  const handleTemplateSelect = (template: ProcessedTemplate) => {
    const hasHeaderVars =
      !!template.headerText && /\{\{\d+\}\}/.test(template.headerText);
    const hasBodyVars =
      template.variables > 0 ||
      (!!template.description && /\{\{\d+\}\}/.test(template.description));
    const hasMediaHeader =
      template.type === "image" ||
      template.type === "video" ||
      template.type === "document";
    const hasLocationHeader = template.type === "location";
    const hasButtonVars = (template.buttonVariables?.length || 0) > 0;

    if (
      hasHeaderVars ||
      hasBodyVars ||
      hasMediaHeader ||
      hasLocationHeader ||
      hasButtonVars
    ) {
      setSelectedTemplateForVariables(template);
      setIsTemplateModalOpen(false);
      setIsTemplateVariableModalOpen(true);
      return;
    }

    setSelectedTemplate(template);
    setTemplateId(template.id);
    setHeaderMediaUrl("");
    setHeaderFileName("");
    setIsTemplateModalOpen(false);
  };

  const handleSubmit = () => {
    if (!appointment?.appointment_id) { toast.error("Appointment not found."); return; }
    if (mode === "manual") {
      if (!followUpDateTime) { toast.error("Follow-up date & time is required."); return; }
      if (!followUpType) { toast.error("Follow-up type is required."); return; }
    }
    const isWhatsApp = mode === "default" || followUpType === "WhatsApp";
    if (isWhatsApp && !templateId) {
      setTemplateTouched(true);
      toast.error("WhatsApp template is required.");
      return;
    }
    const [dateOnly, timeOnly] = mode === "manual" && followUpDateTime
      ? followUpDateTime.split("T")
      : [null, null];
    onSave({
      appointment_id: appointment.appointment_id,
      mode,
      follow_up_date: dateOnly ?? null,
      follow_up_time: timeOnly ?? null,
      follow_up_type: mode === "manual" ? (followUpType as any || null) : null,
      template_id: isWhatsApp ? templateId : null,
      header_media_url: isWhatsApp ? headerMediaUrl || null : null,
      header_file_name: isWhatsApp ? headerFileName || null : null,
    });
  };

  const labelCls = cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? "text-white/70" : "text-slate-700");

  return (
    <>
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="No Show Handling"
      description="Mark the appointment as no-show and schedule a follow-up message."
      isDarkMode={isDarkMode}
      className={cn(
        "max-w-xl font-sans [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']",
        isDarkMode ? "bg-black" : "bg-white",
      )}
      footer={
        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-semibold transition-all border",
              isDarkMode
                ? "border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
                : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900",
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg shadow-emerald-500/20",
              isDarkMode
                ? "bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
                : "bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50",
            )}
          >
            {isSaving ? "Saving..." : "Confirm No Show"}
          </button>
        </div>
      }
    >
      <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2">

        {/* ── Schedule Mode ── */}
        <div>
          <h3 className={cn("text-sm font-semibold mb-4", isDarkMode ? "text-white" : "text-slate-900")}>
            Schedule Mode
          </h3>
          <div className="space-y-2">
            {([
              {
                value: "default" as const,
                label: "Default",
                sub: null,
              },
              {
                value: "manual" as const,
                label: "Manual — pick date & time",
                sub: null,
              },
            ]).map(({ value, label, sub }) => (
              <div
                key={value}
                onClick={() => {
                  setMode(value);
                  if (value === "default") {
                    setFollowUpDateTime("");
                    setFollowUpType("");
                    setHeaderMediaUrl("");
                    setHeaderFileName("");
                  }
                }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all select-none",
                  mode === value
                    ? (isDarkMode
                        ? "border-emerald-500/40 bg-emerald-500/10"
                        : "border-emerald-500/40 bg-emerald-50")
                    : (isDarkMode
                        ? "border-white/10 bg-white/5 hover:bg-white/10"
                        : "border-slate-200 bg-white hover:bg-slate-50"),
                )}
              >
                <div className={cn(
                  "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                  mode === value
                    ? "border-emerald-500 bg-emerald-500"
                    : isDarkMode ? "border-white/30" : "border-slate-300",
                )}>
                  {mode === value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <p className={cn(
                    "text-sm font-semibold",
                    mode === value
                      ? (isDarkMode ? "text-emerald-400" : "text-emerald-700")
                      : (isDarkMode ? "text-white/80" : "text-slate-700"),
                  )}>
                    {label}
                  </p>
                  {sub && mode === value && (
                    <p className={cn("text-xs mt-0.5", isDarkMode ? "text-white/40" : "text-slate-400")}>
                      Scheduled for {sub} at {noshowTime}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Manual Details ── */}
        {mode === "manual" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <h3 className={cn("text-sm font-semibold", isDarkMode ? "text-white" : "text-slate-900")}>
              Follow-up Details
            </h3>

            {/* Date & Time */}
            <div>
              <label className={labelCls}>Follow-up Date & Time <span className="text-red-500">*</span></label>
              <input
                type="datetime-local"
                value={followUpDateTime}
                min={minDateTime}
                style={{ colorScheme: isDarkMode ? "dark" : "light" }}
                onChange={(e) => setFollowUpDateTime(e.target.value)}
                className={cn(
                  "w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50",
                  isDarkMode
                    ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                    : "bg-white border-slate-200 text-slate-900 hover:bg-slate-50",
                )}
              />
            </div>

            {/* Type */}
            <Select
              isDarkMode={isDarkMode}
              label="Follow-up Type"
              required
              value={followUpType}
              onChange={(val) => {
                setFollowUpType(val);
                if (val !== "WhatsApp") {
                  setTemplateId("");
                  setHeaderMediaUrl("");
                  setHeaderFileName("");
                  setSelectedTemplate(null);
                  setTemplateTouched(false);
                }
              }}
              options={[
                { value: "Call", label: "Call" },
                { value: "WhatsApp", label: "WhatsApp" },
              ]}
              placeholder="Select follow-up type"
            />
          </div>
        )}

        {/* ── WhatsApp Template — shown for default mode (always WhatsApp) or manual+WhatsApp type ── */}
        {(mode === "default" || followUpType === "WhatsApp") && <div>
          <h3 className={cn("text-sm font-semibold mb-4", isDarkMode ? "text-white" : "text-slate-900")}>
            WhatsApp Template
          </h3>
          <div>
            <label className={labelCls}>Template <span className="text-red-500">*</span></label>
            <button
              type="button"
              onClick={() => {
                setTemplateTouched(true);
                setIsTemplateModalOpen(true);
              }}
              className={cn(
                "w-full px-4 py-3 rounded-xl border text-sm text-left flex items-center justify-between transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50",
                templateTouched && !selectedTemplate && "border-red-500/60 ring-2 ring-red-500/15",
                isDarkMode
                  ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                  : "bg-white border-slate-200 text-slate-900 hover:bg-slate-50",
              )}
            >
              <span className={cn("inline-flex items-center gap-2", !selectedTemplate && (isDarkMode ? "text-white/35" : "text-slate-400"))}>
                <MessageSquareText size={16} className={selectedTemplate ? "text-emerald-500" : ""} />
                {selectedTemplate?.name || "Select approved WhatsApp template"}
              </span>
              <ChevronRight size={16} className={isDarkMode ? "text-white/40" : "text-slate-400"} />
            </button>
            {templateTouched && !selectedTemplate && (
              <p className="text-xs mt-2 text-red-500">Please select one approved template before confirming no-show.</p>
            )}
            {selectedTemplate && (
              <div className={cn(
                "mt-3 p-4 rounded-xl border text-xs space-y-3",
                isDarkMode ? "border-emerald-500/25 bg-emerald-500/5 text-white/70" : "border-emerald-200 bg-emerald-50/60 text-slate-600",
              )}>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className={cn("text-sm font-semibold", isDarkMode ? "text-white" : "text-slate-900")}>
                      {selectedTemplate.name}
                    </p>
                    <div className="inline-flex items-center gap-3 text-[11px] uppercase tracking-wide">
                      <span className="inline-flex items-center gap-1">
                        <Layers size={12} />
                        {selectedTemplate.category}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-emerald-500" />
                        Approved
                      </span>
                    </div>
                  </div>
                  <span className={cn(
                    "rounded-full px-2 py-1 text-[10px] font-semibold",
                    isDarkMode ? "bg-white/10 text-white/80" : "bg-white text-slate-600 border border-emerald-100",
                  )}>
                    Vars: {selectedTemplate.variables}
                  </span>
                </div>
                <p className="line-clamp-3">
                  {selectedTemplate.description || "Selected template will be sent on follow-up schedule."}
                </p>
              </div>
            )}
          </div>
        </div>}

      </div>
    </Drawer>

    <TemplateSelectionModal
      isOpen={isTemplateModalOpen}
      onClose={() => setIsTemplateModalOpen(false)}
      onSelect={handleTemplateSelect}
    />
    <TemplateVariableModal
      isOpen={isTemplateVariableModalOpen}
      onClose={() => setIsTemplateVariableModalOpen(false)}
      template={selectedTemplateForVariables}
      onSend={(components) => {
        const headerComp = Array.isArray(components)
          ? components.find((c) => c?.type === "header")
          : null;
        const headerParam = headerComp?.parameters?.[0] || null;
        const mediaLink =
          headerParam?.image?.link ||
          headerParam?.video?.link ||
          headerParam?.document?.link ||
          "";
        const documentFileName = headerParam?.document?.filename || "";

        setHeaderMediaUrl(mediaLink);
        setHeaderFileName(documentFileName);
        if (!selectedTemplateForVariables) return;
        setSelectedTemplate(selectedTemplateForVariables);
        setTemplateId(selectedTemplateForVariables.id);
        setIsTemplateVariableModalOpen(false);
      }}
      isDarkMode={isDarkMode}
      isPending={false}
    />
    </>
  );
};
