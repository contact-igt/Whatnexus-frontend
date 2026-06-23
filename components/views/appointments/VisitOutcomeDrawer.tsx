"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ChevronRight, FileText, Layers, MessageSquareText } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { Select } from "@/components/ui/select";
import {
  TemplateSelectionModal,
  type ProcessedTemplate,
} from "@/components/campaign/templateSelectionModal";
import { TemplateVariableModal } from "@/components/views/history/templateVariableModal";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import type { Appointment } from "./bookingList";

export interface VisitOutcomePayload {
  appointment_id: string;
  notes: string;
  follow_up_required: boolean;
  follow_up_date?: string | null;
  follow_up_time?: string | null;
  follow_up_type?: "Call" | "WhatsApp" | null;
  follow_up_reason?: "Revisit" | "Enquiry" | null;
  template_id?: string | null;
  header_media_url?: string | null;
  header_file_name?: string | null;
}

interface VisitOutcomeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: VisitOutcomePayload) => void;
  appointment: Appointment | null;
  isDarkMode: boolean;
  isSaving?: boolean;
}

export const VisitOutcomeDrawer = ({
  isOpen,
  onClose,
  onSave,
  appointment,
  isDarkMode,
  isSaving = false,
}: VisitOutcomeDrawerProps) => {
  const getLocalDateTimeMin = () => {
    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offsetMs).toISOString().slice(0, 16);
  };

  const [notes, setNotes] = useState("");
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpDateTime, setFollowUpDateTime] = useState("");
  const [followUpType, setFollowUpType] = useState("");
  const [followUpReason, setFollowUpReason] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [headerMediaUrl, setHeaderMediaUrl] = useState("");
  const [headerFileName, setHeaderFileName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<ProcessedTemplate | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isTemplateVariableModalOpen, setIsTemplateVariableModalOpen] = useState(false);
  const [selectedTemplateForVariables, setSelectedTemplateForVariables] =
    useState<ProcessedTemplate | null>(null);
  const [templateTouched, setTemplateTouched] = useState(false);

  const minDateTime = getLocalDateTimeMin();

  useEffect(() => {
    if (!isOpen) return;
    setNotes("");
    setFollowUpRequired(false);
    setFollowUpDateTime("");
    setFollowUpType("");
    setFollowUpReason("");
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

  const handleSave = () => {
    if (!appointment?.appointment_id) { toast.error("Appointment not found."); return; }
    if (!notes.trim()) { toast.error("Visit notes are required."); return; }
    if (followUpRequired && !followUpDateTime) { toast.error("Follow-up date & time is required."); return; }
    if (followUpRequired && !followUpType) { toast.error("Follow-up type is required."); return; }
    if (followUpRequired && !followUpReason) { toast.error("Follow-up reason is required."); return; }
    if (followUpRequired && followUpType === "WhatsApp" && !templateId) {
      setTemplateTouched(true);
      toast.error("WhatsApp template is required.");
      return;
    }
    const [dateOnly, timeOnly] = followUpRequired && followUpDateTime
      ? followUpDateTime.split("T")
      : [null, null];
    onSave({
      appointment_id: appointment.appointment_id,
      notes: notes.trim(),
      follow_up_required: followUpRequired,
      follow_up_date: dateOnly ?? null,
      follow_up_time: timeOnly ?? null,
      follow_up_type: followUpRequired ? (followUpType as any || null) : null,
      follow_up_reason: followUpRequired ? (followUpReason as any || null) : null,
      template_id: followUpRequired && followUpType === "WhatsApp" ? (templateId || null) : null,
      header_media_url:
        followUpRequired && followUpType === "WhatsApp"
          ? headerMediaUrl || null
          : null,
      header_file_name:
        followUpRequired && followUpType === "WhatsApp"
          ? headerFileName || null
          : null,
    });
  };

  const labelCls = cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? "text-white/70" : "text-slate-700");

  return (
    <>
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Visit Outcome"
      description="Record consultation notes and schedule any follow-up."
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
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg shadow-emerald-500/20 flex items-center space-x-2",
              isDarkMode
                ? "bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
                : "bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50",
            )}
          >
            <span>{isSaving ? "Saving..." : "Save & Complete"}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2">

        {/* ── Visit Notes ── */}
        <div>
          <h3 className={cn("text-sm font-semibold mb-4", isDarkMode ? "text-white" : "text-slate-900")}>
            Visit Notes
          </h3>
          <div>
            <label className={labelCls}>
              Consultation Notes <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FileText size={16} className={cn("absolute left-3 top-3", isDarkMode ? "text-white/30" : "text-slate-400")} />
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter consultation outcome, diagnosis, prescribed treatment..."
                className={cn(
                  "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border resize-none transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50",
                  isDarkMode
                    ? "bg-white/5 border-white/10 text-white placeholder:text-white/30 hover:bg-white/10"
                    : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 hover:bg-slate-50",
                )}
              />
            </div>
          </div>
        </div>

        {/* ── Follow-up ── */}
        <div>
          <h3 className={cn("text-sm font-semibold mb-4", isDarkMode ? "text-white" : "text-slate-900")}>
            Follow-up
          </h3>
          <div className="space-y-4">
            {/* Yes / No toggle */}
            <div>
              <label className={labelCls}>Follow-up Required</label>
              <div className="inline-flex rounded-xl overflow-hidden border border-emerald-500/20">
                {(["Yes", "No"] as const).map((opt) => {
                  const active = opt === "Yes" ? followUpRequired : !followUpRequired;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        const val = opt === "Yes";
                        setFollowUpRequired(val);
                        if (!val) {
                          setFollowUpDateTime("");
                          setFollowUpType("");
                          setFollowUpReason("");
                          setTemplateId("");
                          setHeaderMediaUrl("");
                          setHeaderFileName("");
                          setSelectedTemplate(null);
                        }
                      }}
                      className={cn(
                        "px-6 py-2 text-sm font-semibold transition-all",
                        active
                          ? "bg-emerald-600 text-white"
                          : isDarkMode
                            ? "bg-transparent text-white/60 hover:bg-white/5"
                            : "bg-white text-slate-600 hover:bg-slate-50",
                      )}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {followUpRequired && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">

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

                {/* Reason */}
                <Select
                  isDarkMode={isDarkMode}
                  label="Follow-up Reason"
                  required
                  value={followUpReason}
                  onChange={setFollowUpReason}
                  options={[
                    { value: "Revisit", label: "Revisit" },
                    { value: "Enquiry", label: "Enquiry" },
                  ]}
                  placeholder="Select reason"
                />

                {/* Template — only for WhatsApp type */}
                {followUpType === "WhatsApp" && <div>
                  <label className={labelCls}>WhatsApp Template <span className="text-red-500">*</span></label>
                  <button
                    type="button"
                    onClick={() => {
                      setTemplateTouched(true);
                      setIsTemplateModalOpen(true);
                    }}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border text-sm text-left flex items-center justify-between transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50",
                      followUpRequired && templateTouched && !selectedTemplate && "border-red-500/60 ring-2 ring-red-500/15",
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
                  {followUpRequired && templateTouched && !selectedTemplate && (
                    <p className="text-xs mt-2 text-red-500">Please select one approved template to schedule follow-up.</p>
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
                        {selectedTemplate.description || "Selected template will be sent on follow-up date."}
                      </p>
                    </div>
                  )}
                </div>}

              </div>
            )}
          </div>
        </div>

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
