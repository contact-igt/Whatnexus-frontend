"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Plus, Trash2, GripVertical, Save, Bell,
    Clock, Calendar, AlertCircle, RefreshCw,
    ChevronRight, CheckCircle2, Layers, MessageSquareText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    useGetReminderRulesQuery,
    useUpsertReminderRulesMutation,
} from "@/hooks/useAppointmentQuery";
import { ReminderRule, ReminderRulePayload } from "@/services/appointment";
import { useTemplates } from "@/hooks/useTemplates";
import {
    TemplateSelectionModal,
    type ProcessedTemplate,
} from "@/components/campaign/templateSelectionModal";
import { TemplateVariableModal } from "@/components/views/history/templateVariableModal";

interface ReminderRulesViewProps {
    isDarkMode: boolean;
    onDirtyChange?: (dirty: boolean) => void;
}

type RuleType = "fixed_day_time" | "relative_before";

interface DraftRule {
    _key: string;
    rule_name: string;
    rule_type: RuleType;
    days_before: number | null;
    send_time: string | null;
    hours_before: number | null;
    minutes_before: number | null;
    template_id: string;
    header_media_url?: string | null;
    header_file_name?: string | null;
    is_active: boolean;
    sort_order: number;
}

type FieldErrors = {
    rule_name?: string;
    template_id?: string;
    days_before?: string;
    send_time?: string;
    hours_before?: string;
    minutes_before?: string;
    offset?: string;
};

type DraftErrors = Record<string, FieldErrors>;

// ── Helpers ───────────────────────────────────────────────────────────────────

const makeKey = () => Math.random().toString(36).slice(2);

const safeNumber = (value: unknown, fallback = 0): number => {
    const n = Number(value);
    return isNaN(n) ? fallback : n;
};

const blankRule = (sortOrder = 0): DraftRule => ({
    _key: makeKey(),
    rule_name: "",
    rule_type: "fixed_day_time",
    days_before: 1,
    send_time: "10:00",
    hours_before: null,
    minutes_before: null,
    template_id: "",
    is_active: true,
    sort_order: sortOrder,
});

const normalizeRuleFromApi = (r: ReminderRule): DraftRule => {
    const _key = makeKey();

    if (!r.rule_type) {
        // Legacy offset_minutes → convert to relative_before
        if (r.offset_minutes !== null && r.offset_minutes !== undefined) {
            const absMin = Math.abs(Number(r.offset_minutes));
            return {
                _key,
                rule_name: r.rule_name || "Reminder",
                rule_type: "relative_before",
                days_before: null,
                send_time: null,
                hours_before: Math.floor(absMin / 60),
                minutes_before: absMin % 60,
                template_id: r.template_id || "",
                header_media_url: r.header_media_url ?? null,
                header_file_name: r.header_file_name ?? null,
                is_active: r.is_active !== false,
                sort_order: r.sort_order ?? 0,
            };
        }
        // null rule_type, no offset → default to fixed_day_time
        return {
            _key,
            rule_name: r.rule_name || "Reminder",
            rule_type: "fixed_day_time",
            days_before: 1,
            send_time: "10:00",
            hours_before: null,
            minutes_before: null,
            template_id: r.template_id || "",
            header_media_url: r.header_media_url ?? null,
            header_file_name: r.header_file_name ?? null,
            is_active: r.is_active !== false,
            sort_order: r.sort_order ?? 0,
        };
    }

    return {
        _key,
        rule_name: r.rule_name || "",
        rule_type: r.rule_type as RuleType,
        days_before: r.days_before ?? null,
        send_time: r.send_time ?? null,
        hours_before: r.hours_before ?? null,
        minutes_before: r.minutes_before ?? null,
        template_id: r.template_id || "",
        header_media_url: r.header_media_url ?? null,
        header_file_name: r.header_file_name ?? null,
        is_active: r.is_active !== false,
        sort_order: r.sort_order ?? 0,
    };
};

const validateDrafts = (drafts: DraftRule[]): DraftErrors => {
    const errors: DraftErrors = {};
    drafts.forEach((d) => {
        const e: FieldErrors = {};

        if (!d.rule_name?.trim()) {
            e.rule_name = "Rule name is required.";
        }
        if (!d.template_id?.trim()) {
            e.template_id = "Template is required.";
        }

        if (d.rule_type === "fixed_day_time") {
            if (d.days_before === null || d.days_before === undefined) {
                e.days_before = "Days before is required.";
            } else if (safeNumber(d.days_before, -1) < 0) {
                e.days_before = "Days before must be 0 or more.";
            }
            if (!d.send_time?.trim()) {
                e.send_time = "Send time is required.";
            }
        }

        if (d.rule_type === "relative_before") {
            const h = safeNumber(d.hours_before, 0);
            const m = safeNumber(d.minutes_before, 0);
            if (h < 0) e.hours_before = "Cannot be negative.";
            if (m < 0) e.minutes_before = "Cannot be negative.";
            else if (m > 59) e.minutes_before = "Must be 0–59.";
            if (h >= 0 && m >= 0 && h === 0 && m === 0) {
                e.offset = "Total offset must be greater than 0.";
            }
        }

        if (Object.keys(e).length > 0) errors[d._key] = e;
    });
    return errors;
};

const getRulePreview = (rule: DraftRule): string | null => {
    if (rule.rule_type === "fixed_day_time") {
        const days = safeNumber(rule.days_before, -1);
        if (days < 0 || !rule.send_time) return null;
        if (days === 0) return `Sends same day at ${rule.send_time}`;
        return `Sends ${days} day${days !== 1 ? "s" : ""} before at ${rule.send_time}`;
    }
    if (rule.rule_type === "relative_before") {
        const h = safeNumber(rule.hours_before, 0);
        const m = safeNumber(rule.minutes_before, 0);
        if (h <= 0 && m <= 0) return null;
        const parts: string[] = [];
        if (h > 0) parts.push(`${h} hour${h !== 1 ? "s" : ""}`);
        if (m > 0) parts.push(`${m} minute${m !== 1 ? "s" : ""}`);
        return `Sends ${parts.join(" ")} before appointment`;
    }
    return null;
};

const RULE_TYPE_LABELS: Record<RuleType, string> = {
    fixed_day_time: "Fixed day & time",
    relative_before: "Relative (hours/min before)",
};

// ── Component ─────────────────────────────────────────────────────────────────

export const ReminderRulesView = ({ isDarkMode, onDirtyChange }: ReminderRulesViewProps) => {
    const { data: rulesData, isLoading, isError } = useGetReminderRulesQuery();
    const upsertMutation = useUpsertReminderRulesMutation();
    const { templates, loading: templatesLoading } = useTemplates();

    const [drafts, setDrafts] = useState<DraftRule[]>([]);
    const [dirty, setDirty] = useState(false);
    const [draftErrors, setDraftErrors] = useState<DraftErrors>({});
    const [selectedTemplatesByRule, setSelectedTemplatesByRule] = useState<Record<string, ProcessedTemplate>>({});
    const [activeRuleKey, setActiveRuleKey] = useState<string | null>(null);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [isTemplateVariableModalOpen, setIsTemplateVariableModalOpen] = useState(false);
    const [selectedTemplateForVariables, setSelectedTemplateForVariables] =
        useState<ProcessedTemplate | null>(null);

    // Notify parent when dirty state changes
    useEffect(() => {
        onDirtyChange?.(dirty);
    }, [dirty, onDirtyChange]);

    useEffect(() => {
        if (rulesData?.data) {
            setDrafts(rulesData.data.map(normalizeRuleFromApi));
            setDirty(false);
            setDraftErrors({});
        }
    }, [rulesData]);

    const markDirty = useCallback(() => setDirty(true), []);

    const update = (key: string, patch: Partial<DraftRule>) => {
        setDrafts((prev) => prev.map((d) => (d._key === key ? { ...d, ...patch } : d)));
        // Clear errors for edited fields so feedback disappears as user fixes them
        setDraftErrors((prev) => {
            if (!prev[key]) return prev;
            const cleared = { ...prev[key] };
            (Object.keys(patch) as string[]).forEach((f) => {
                delete (cleared as Record<string, string>)[f];
            });
            delete cleared.offset;
            const next = { ...prev };
            if (Object.keys(cleared).length === 0) delete next[key];
            else next[key] = cleared;
            return next;
        });
        markDirty();
    };

    const getRuleTemplateName = (rule: DraftRule) => {
        const fromSelected = selectedTemplatesByRule[rule._key]?.name;
        if (fromSelected) return fromSelected;
        const fromList = templates.find((t) => t.template_id === rule.template_id);
        return (
            fromList?.template_name ||
            fromList?.name ||
            fromList?.element_name ||
            rule.template_id ||
            ""
        );
    };

    const handleRuleTemplateSelect = (template: ProcessedTemplate) => {
        if (!activeRuleKey) return;

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

        update(activeRuleKey, {
            template_id: template.id,
            header_media_url: null,
            header_file_name: null,
        });
        setSelectedTemplatesByRule((prev) => ({ ...prev, [activeRuleKey]: template }));
        setIsTemplateModalOpen(false);
    };

    const addRule = () => {
        setDrafts((prev) => [...prev, blankRule(prev.length)]);
        markDirty();
    };

    // Converts current draft rules into the backend payload shape.
    // Used by both handleSave and removeRule (auto-save on delete).
    const buildPayload = (rules: DraftRule[]): ReminderRulePayload[] =>
        rules.map((d, i) => ({
            rule_name: d.rule_name.trim() || "Reminder",
            rule_type: d.rule_type,
            days_before: d.rule_type === "fixed_day_time" ? safeNumber(d.days_before, 0) : null,
            send_time: d.rule_type === "fixed_day_time" ? (d.send_time || "09:00") : null,
            hours_before: d.rule_type === "relative_before" ? safeNumber(d.hours_before, 0) : null,
            minutes_before: d.rule_type === "relative_before" ? safeNumber(d.minutes_before, 0) : null,
            offset_minutes: null,
            template_id: d.template_id,
            header_media_url: d.header_media_url || null,
            header_file_name: d.header_file_name || null,
            sort_order: i,
            is_active: d.is_active !== false,
        }));

    const removeRule = (key: string) => {
        const newDrafts = drafts.filter((d) => d._key !== key);
        setDrafts(newDrafts);
        setDraftErrors((prev) => {
            const n = { ...prev };
            delete n[key];
            return n;
        });

        // Auto-save the remaining rules immediately so deletion persists without a manual Save click.
        // If any remaining rule still has validation errors, fall back to marking dirty so the
        // user is prompted to fix and save manually (prevents saving an invalid partial state).
        const remainingErrors = validateDrafts(newDrafts);
        if (Object.keys(remainingErrors).length > 0) {
            setDraftErrors(remainingErrors);
            markDirty();
            return;
        }
        upsertMutation.mutate(buildPayload(newDrafts), {
            onSuccess: () => setDirty(false),
        });
    };

    const handleSave = () => {
        const errors = validateDrafts(drafts);
        if (Object.keys(errors).length > 0) {
            setDraftErrors(errors);
            return;
        }
        setDraftErrors({});
        upsertMutation.mutate(buildPayload(drafts), {
            onSuccess: () => setDirty(false),
        });
    };

    const hasErrors = Object.keys(draftErrors).length > 0;

    // ── Styles ────────────────────────────────────────────────────────────────
    const base = isDarkMode ? "text-white" : "text-slate-900";
    const muted = isDarkMode ? "text-white/50" : "text-slate-400";
    const card = isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200";
    const cardErr = isDarkMode ? "bg-red-500/5 border-red-500/30" : "bg-red-50 border-red-200";

    const inputBase = cn(
        "w-full rounded-lg px-3 py-2 text-sm outline-none border transition-colors",
        isDarkMode
            ? "bg-white/10 border-white/10 text-white placeholder:text-white/30 focus:border-blue-400"
            : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500",
    );
    const inputErr = cn(inputBase, "border-red-500 focus:border-red-500");
    const labelCls = cn("block text-xs font-medium mb-1", muted);
    const errText = "text-xs text-red-500 mt-1";

    const inp = (hasErr: boolean) => (hasErr ? inputErr : inputBase);

    // ── Loading ───────────────────────────────────────────────────────────────
    if (isLoading) {
        return <div className={cn("text-sm py-4", muted)}>Loading reminder rules…</div>;
    }

    // ── Error fetching ────────────────────────────────────────────────────────
    if (isError) {
        return (
            <div className={cn("rounded-xl border p-8 text-center max-w-md", card)}>
                <AlertCircle size={32} className="mx-auto mb-3 text-red-400" />
                <p className={cn("text-sm font-semibold", base)}>Unable to load reminder rules</p>
                <p className={cn("text-xs mt-1", muted)}>
                    Please refresh the page or try again.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                    <RefreshCw size={13} />
                    Refresh
                </button>
            </div>
        );
    }

    // ── Main render ───────────────────────────────────────────────────────────
    return (
        <>
        <div className="space-y-4 w-full">

            {/* Header row */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className={cn("text-lg font-semibold", base)}>Appointment Reminder Rules</h2>
                    <p className={cn("text-sm mt-0.5", muted)}>
                        Configure when WhatsApp reminders are sent before each appointment.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={addRule}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            isDarkMode
                                ? "bg-white/10 hover:bg-white/20 text-white"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-700",
                        )}
                    >
                        <Plus size={14} />
                        Add Rule
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!dirty || upsertMutation.isPending}
                        className={cn(
                            "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                            dirty && !upsertMutation.isPending
                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                : isDarkMode
                                    ? "bg-white/5 text-white/30 cursor-not-allowed"
                                    : "bg-slate-100 text-slate-400 cursor-not-allowed",
                        )}
                    >
                        <Save size={14} />
                        {upsertMutation.isPending ? "Saving…" : "Save Rules"}
                    </button>
                </div>
            </div>

            {/* Validation summary banner — only visible after a failed save attempt */}
            {hasErrors && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                    <AlertCircle size={14} className="shrink-0" />
                    Fix the highlighted errors below, then save again.
                </div>
            )}

            {/* Empty state */}
            {drafts.length === 0 && (
                <div className={cn("rounded-xl border p-8 text-center", card)}>
                    <Bell size={32} className={cn("mx-auto mb-3", muted)} />
                    <p className={cn("text-sm font-medium", base)}>No reminder rules configured</p>
                    <p className={cn("text-xs mt-1 mb-4", muted)}>
                        Add rules to automatically send WhatsApp reminders before appointments.
                    </p>
                    <button
                        onClick={addRule}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                    >
                        <Plus size={14} />
                        Add First Rule
                    </button>
                </div>
            )}

            {/* Rule cards */}
            <div className="space-y-3">
                {drafts.map((rule, idx) => {
                    const errs = draftErrors[rule._key] || {};
                    const hasRuleErr = Object.keys(errs).length > 0;
                    const preview = getRulePreview(rule);

                    return (
                        <div
                            key={rule._key}
                            className={cn("rounded-xl border p-4 space-y-4", hasRuleErr ? cardErr : card)}
                        >
                            {/* Card header row */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <GripVertical size={14} className={muted} />
                                    <span className={cn("text-xs font-semibold uppercase tracking-wide", muted)}>
                                        Rule {idx + 1}
                                    </span>
                                    {preview && (
                                        <span className={cn(
                                            "text-xs px-2 py-0.5 rounded-full font-medium",
                                            isDarkMode
                                                ? "bg-emerald-500/15 text-emerald-400"
                                                : "bg-emerald-50 text-emerald-600",
                                        )}>
                                            {preview}
                                        </span>
                                    )}
                                    {hasRuleErr && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 font-medium">
                                            Has errors
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className={cn("flex items-center gap-1.5 text-xs cursor-pointer", muted)}>
                                        <input
                                            type="checkbox"
                                            checked={rule.is_active !== false}
                                            onChange={(e) => update(rule._key, { is_active: e.target.checked })}
                                            className="accent-blue-500"
                                        />
                                        Active
                                    </label>
                                    <button
                                        onClick={() => removeRule(rule._key)}
                                        className="p-1 rounded-md text-red-400 hover:bg-red-400/10 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Rule name + type */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelCls}>
                                        Rule name <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={inp(!!errs.rule_name)}
                                        placeholder="e.g. 1 day before at 10 AM"
                                        value={rule.rule_name}
                                        onChange={(e) => update(rule._key, { rule_name: e.target.value })}
                                    />
                                    {errs.rule_name && <p className={errText}>{errs.rule_name}</p>}
                                </div>
                                <div>
                                    <label className={labelCls}>Rule type</label>
                                    <select
                                        className={inputBase}
                                        value={rule.rule_type}
                                        onChange={(e) =>
                                            update(rule._key, {
                                                rule_type: e.target.value as RuleType,
                                                days_before: e.target.value === "fixed_day_time" ? 1 : null,
                                                send_time: e.target.value === "fixed_day_time" ? "10:00" : null,
                                                hours_before: e.target.value === "relative_before" ? 1 : null,
                                                minutes_before: e.target.value === "relative_before" ? 0 : null,
                                            })
                                        }
                                    >
                                        {(Object.keys(RULE_TYPE_LABELS) as RuleType[]).map((k) => (
                                            <option key={k} value={k}>{RULE_TYPE_LABELS[k]}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Timing — fixed_day_time */}
                            {rule.rule_type === "fixed_day_time" && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelCls}>
                                            <Calendar size={11} className="inline mr-1" />
                                            Days before <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            className={inp(!!errs.days_before)}
                                            placeholder="1"
                                            value={rule.days_before ?? ""}
                                            onChange={(e) =>
                                                update(rule._key, {
                                                    days_before: e.target.value === ""
                                                        ? null
                                                        : safeNumber(e.target.value, 0),
                                                })
                                            }
                                        />
                                        {errs.days_before
                                            ? <p className={errText}>{errs.days_before}</p>
                                            : <p className={cn("text-xs mt-1", muted)}>0 = same day</p>
                                        }
                                    </div>
                                    <div>
                                        <label className={labelCls}>
                                            <Clock size={11} className="inline mr-1" />
                                            Send time (IST) <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="time"
                                            className={inp(!!errs.send_time)}
                                            value={rule.send_time || ""}
                                            onChange={(e) => update(rule._key, { send_time: e.target.value })}
                                        />
                                        {errs.send_time && <p className={errText}>{errs.send_time}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Timing — relative_before */}
                            {rule.rule_type === "relative_before" && (
                                <div className="space-y-1">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className={labelCls}>
                                                <Clock size={11} className="inline mr-1" />
                                                Hours before
                                            </label>
                                            <input
                                                type="number"
                                                min={0}
                                                className={inp(!!errs.hours_before)}
                                                placeholder="0"
                                                value={rule.hours_before ?? ""}
                                                onChange={(e) =>
                                                    update(rule._key, {
                                                        hours_before: e.target.value === ""
                                                            ? 0
                                                            : safeNumber(e.target.value, 0),
                                                    })
                                                }
                                            />
                                            {errs.hours_before && <p className={errText}>{errs.hours_before}</p>}
                                        </div>
                                        <div>
                                            <label className={labelCls}>Minutes before</label>
                                            <input
                                                type="number"
                                                min={0}
                                                max={59}
                                                className={inp(!!errs.minutes_before)}
                                                placeholder="0"
                                                value={rule.minutes_before ?? ""}
                                                onChange={(e) =>
                                                    update(rule._key, {
                                                        minutes_before: e.target.value === ""
                                                            ? 0
                                                            : safeNumber(e.target.value, 0),
                                                    })
                                                }
                                            />
                                            {errs.minutes_before && <p className={errText}>{errs.minutes_before}</p>}
                                        </div>
                                    </div>
                                    {errs.offset && <p className={errText}>{errs.offset}</p>}
                                </div>
                            )}

                            {/* Template */}
                            <div className="space-y-2">
                                <div>
                                    <label className={labelCls}>
                                        WhatsApp template <span className="text-red-400">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveRuleKey(rule._key);
                                            setIsTemplateModalOpen(true);
                                        }}
                                        className={cn(
                                            "w-full px-3 py-2.5 rounded-lg border text-xs text-left flex items-center justify-between transition-all focus:outline-none",
                                            errs.template_id ? "border-red-500 ring-1 ring-red-500/30" : "",
                                            isDarkMode
                                                ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                                                : "bg-white border-slate-200 text-slate-900 hover:bg-slate-50",
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "inline-flex items-center gap-1.5 truncate",
                                                !rule.template_id &&
                                                    (isDarkMode
                                                        ? "text-white/35"
                                                        : "text-slate-400"),
                                            )}
                                        >
                                            <MessageSquareText
                                                size={13}
                                                className={rule.template_id ? "text-emerald-500 shrink-0" : "shrink-0"}
                                            />
                                            <span className="truncate">
                                                {rule.template_id
                                                    ? getRuleTemplateName(rule)
                                                    : templatesLoading
                                                        ? "Loading templates..."
                                                        : "Select approved WhatsApp template"}
                                            </span>
                                        </span>
                                        <ChevronRight
                                            size={13}
                                            className={cn(
                                                "shrink-0 ml-1",
                                                isDarkMode ? "text-white/40" : "text-slate-400",
                                            )}
                                        />
                                    </button>
                                    {errs.template_id && <p className={errText}>{errs.template_id}</p>}
                                    {rule.template_id && (
                                        <div
                                            className={cn(
                                                "mt-2 p-2.5 rounded-lg border text-xs space-y-2",
                                                isDarkMode
                                                    ? "border-emerald-500/20 bg-emerald-500/5 text-white/60"
                                                    : "border-emerald-200 bg-emerald-50/60 text-slate-500",
                                            )}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span
                                                    className={cn(
                                                        "font-semibold truncate",
                                                        isDarkMode ? "text-white" : "text-slate-800",
                                                    )}
                                                >
                                                    {getRuleTemplateName(rule)}
                                                </span>
                                                <span
                                                    className={cn(
                                                        "shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium capitalize inline-flex items-center gap-1",
                                                        isDarkMode
                                                            ? "bg-white/10 text-white/70"
                                                            : "bg-white text-slate-600 border border-slate-200",
                                                    )}
                                                >
                                                    <Layers size={10} />
                                                    {selectedTemplatesByRule[rule._key]?.category || "template"}
                                                </span>
                                            </div>
                                            <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide">
                                                <CheckCircle2 size={11} className="text-emerald-500" />
                                                Approved
                                            </div>
                                            {rule.header_media_url && (
                                                <p className={cn("text-[11px]", isDarkMode ? "text-emerald-400" : "text-emerald-600")}>
                                                    Media attached{rule.header_file_name ? `: ${rule.header_file_name}` : ""}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Media fields — only shown when selected template has a media header */}
                                {(() => {
                                    const selectedTpl = rule.template_id
                                        ? templates.find((t) => t.template_id === rule.template_id)
                                        : null;
                                    const mediaHeaderTypes = new Set(["image", "video", "document"]);
                                    const isMedia = selectedTpl?.header_type && mediaHeaderTypes.has(selectedTpl.header_type.toLowerCase());
                                    if (!isMedia) return null;
                                    return (
                                        <div className={cn("p-3 rounded-lg border space-y-2", isDarkMode ? "border-amber-500/20 bg-amber-500/5" : "border-amber-200 bg-amber-50/60")}>
                                            <p className={cn("text-xs font-medium", isDarkMode ? "text-amber-400" : "text-amber-700")}>
                                                Media template — provide a default media URL for this reminder rule.
                                            </p>
                                            <div>
                                                <label className={cn("block text-xs font-medium mb-1", isDarkMode ? "text-white/50" : "text-slate-500")}>
                                                    Media URL {selectedTpl?.header_type === "document" ? "(document)" : selectedTpl?.header_type === "video" ? "(video)" : "(image)"}
                                                </label>
                                                <input
                                                    type="url"
                                                    className={inputBase}
                                                    placeholder="https://..."
                                                    value={rule.header_media_url || ""}
                                                    onChange={(e) => update(rule._key, { header_media_url: e.target.value || null })}
                                                />
                                            </div>
                                            {selectedTpl?.header_type === "document" && (
                                                <div>
                                                    <label className={cn("block text-xs font-medium mb-1", isDarkMode ? "text-white/50" : "text-slate-500")}>
                                                        File name (optional)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={inputBase}
                                                        placeholder="report.pdf"
                                                        value={rule.header_file_name || ""}
                                                        onChange={(e) => update(rule._key, { header_file_name: e.target.value || null })}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
        <TemplateSelectionModal
            isOpen={isTemplateModalOpen}
            onClose={() => setIsTemplateModalOpen(false)}
            onSelect={handleRuleTemplateSelect}
        />
        <TemplateVariableModal
            isOpen={isTemplateVariableModalOpen}
            onClose={() => setIsTemplateVariableModalOpen(false)}
            template={selectedTemplateForVariables}
            onSend={(components: unknown[]) => {
                const headerComp = Array.isArray(components)
                    ? components.find((c) => {
                        if (!c || typeof c !== "object") return false;
                        return (c as { type?: string }).type === "header";
                    })
                    : null;
                const headerParam =
                    headerComp && typeof headerComp === "object"
                        ? (headerComp as { parameters?: Array<Record<string, unknown>> }).parameters?.[0] || null
                        : null;
                const mediaLink =
                    (headerParam as { image?: { link?: string } } | null)?.image?.link ||
                    (headerParam as { video?: { link?: string } } | null)?.video?.link ||
                    (headerParam as { document?: { link?: string } } | null)?.document?.link ||
                    "";
                const documentFileName =
                    (headerParam as { document?: { filename?: string } } | null)?.document?.filename || "";

                if (activeRuleKey && selectedTemplateForVariables) {
                    update(activeRuleKey, {
                        template_id: selectedTemplateForVariables.id,
                        header_media_url: mediaLink || null,
                        header_file_name: documentFileName || null,
                    });
                    setSelectedTemplatesByRule((prev) => ({
                        ...prev,
                        [activeRuleKey]: selectedTemplateForVariables,
                    }));
                }
                setIsTemplateVariableModalOpen(false);
            }}
            isDarkMode={isDarkMode}
            isPending={false}
        />
        </>
    );
};
