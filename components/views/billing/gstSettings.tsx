"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    useAdminGetActiveGSTRateQuery,
    useAdminListGSTRatesQuery,
    useAdminAddGSTRateMutation,
    useAdminActivateGSTRateMutation,
    useAdminDeactivateGSTRateMutation,
    useAdminDeleteGSTRateMutation,
    useAdminUpdateGSTRateMutation,
} from "@/hooks/useBillingQuery";
import {
    Percent, Plus, CheckCircle2, Clock, AlertTriangle,
    Loader2, ChevronLeft, ChevronRight, Info,
    Trash2, Eye, Pencil, X,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface GSTSettingsProps {
    isDarkMode: boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

// ── Toggle Switch ─────────────────────────────────────────────────────────────

const Toggle = ({
    checked,
    onChange,
    disabled,
    title,
}: {
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
    title?: string;
}) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        title={title}
        disabled={disabled}
        onClick={onChange}
        className={cn(
            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none",
            checked ? "bg-emerald-500" : "bg-slate-300 dark:bg-white/10",
            disabled && "opacity-40 cursor-not-allowed",
        )}
    >
        <span
            className={cn(
                "pointer-events-none inline-block h-4 w-4 translate-x-0 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200",
                checked ? "translate-x-4" : "translate-x-0",
            )}
        />
    </button>
);

// ── Force-confirm dialog ──────────────────────────────────────────────────────

const ForceConfirmDialog = ({
    open, newRate, onConfirm, onCancel, isDarkMode, isPending,
}: {
    open: boolean;
    newRate: number | null;
    onConfirm: () => void;
    onCancel: () => void;
    isDarkMode: boolean;
    isPending: boolean;
}) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
            <div className={cn(
                "relative w-full max-w-md p-6 rounded-[24px] border shadow-2xl",
                isDarkMode ? "bg-slate-900 border-white/10" : "bg-white border-slate-200",
            )}>
                <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle size={18} className="text-amber-500 shrink-0" />
                    <h3 className={cn("text-sm font-black", isDarkMode ? "text-white" : "text-slate-900")}>
                        Open Billing Cycles Detected
                    </h3>
                </div>
                <p className={cn("text-xs leading-relaxed mb-6", isDarkMode ? "text-white/50" : "text-slate-500")}>
                    There are active billing cycles that have not been closed yet.
                    Activating <strong>{newRate != null ? `${newRate}%` : "this"} GST rate</strong> now will apply it to{" "}
                    <strong>new transactions only</strong> — existing cycle costs remain unchanged.
                    Force-activate anyway?
                </p>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onCancel}
                        disabled={isPending}
                        className={cn(
                            "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                            isDarkMode
                                ? "border-white/10 text-white/50 hover:text-white hover:border-white/20"
                                : "border-slate-200 text-slate-500 hover:text-slate-800",
                        )}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isPending}
                        className="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white bg-amber-500 hover:bg-amber-400 transition-all disabled:opacity-50"
                    >
                        {isPending ? <Loader2 size={14} className="animate-spin" /> : "Force Activate"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Confirm dialog (deactivate / delete) ─────────────────────────────────────

const ConfirmDialog = ({
    open, title, description, confirmLabel, confirmTone,
    onConfirm, onCancel, isDarkMode, isPending,
}: {
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    confirmTone: "danger" | "warning";
    onConfirm: () => void;
    onCancel: () => void;
    isDarkMode: boolean;
    isPending: boolean;
}) => {
    if (!open) return null;
    const confirmCls = confirmTone === "danger"
        ? "bg-red-500 hover:bg-red-400"
        : "bg-amber-500 hover:bg-amber-400";
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
            <div className={cn(
                "relative w-full max-w-md p-6 rounded-[24px] border shadow-2xl",
                isDarkMode ? "bg-slate-900 border-white/10" : "bg-white border-slate-200",
            )}>
                <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle size={18} className={confirmTone === "danger" ? "text-red-500 shrink-0" : "text-amber-500 shrink-0"} />
                    <h3 className={cn("text-sm font-black", isDarkMode ? "text-white" : "text-slate-900")}>{title}</h3>
                </div>
                <p className={cn("text-xs leading-relaxed mb-6", isDarkMode ? "text-white/50" : "text-slate-500")}>
                    {description}
                </p>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onCancel}
                        disabled={isPending}
                        className={cn(
                            "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                            isDarkMode
                                ? "border-white/10 text-white/50 hover:text-white hover:border-white/20"
                                : "border-slate-200 text-slate-500 hover:text-slate-800",
                        )}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isPending}
                        className={cn(
                            "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all disabled:opacity-50",
                            confirmCls,
                        )}
                    >
                        {isPending ? <Loader2 size={14} className="animate-spin" /> : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── View Detail Modal ─────────────────────────────────────────────────────────

const ViewModal = ({
    rate, isDarkMode, onClose,
}: {
    rate: any;
    isDarkMode: boolean;
    onClose: () => void;
}) => {
    if (!rate) return null;
    const rows = [
        { label: "Rate", value: `${parseFloat(rate.gst_rate).toFixed(2)}%` },
        { label: "Status", value: rate.is_active ? "Active" : "Inactive" },
        { label: "Effective From", value: formatDate(rate.effective_from) },
        { label: "Added By", value: rate.created_by_name || rate.created_by || "—" },
        { label: "Added On", value: formatDate(rate.created_at || rate.createdAt) },
        { label: "Notes", value: rate.notes || "—" },
    ];
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className={cn(
                    "relative w-full max-w-sm p-6 rounded-[24px] border shadow-2xl",
                    isDarkMode ? "bg-slate-900 border-white/10" : "bg-white border-slate-200",
                )}
            >
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <Eye size={14} className="text-emerald-500" />
                        <h3 className={cn("text-xs font-black uppercase tracking-widest", isDarkMode ? "text-white" : "text-slate-900")}>
                            GST Rate Details
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className={cn("p-1.5 rounded-lg transition-colors", isDarkMode ? "hover:bg-white/10" : "hover:bg-slate-100")}
                    >
                        <X size={14} className={isDarkMode ? "text-white/50" : "text-slate-400"} />
                    </button>
                </div>
                <div className="space-y-3">
                    {rows.map(({ label, value }) => (
                        <div key={label} className={cn(
                            "flex items-start justify-between gap-4 py-2.5 border-b last:border-0",
                            isDarkMode ? "border-white/5" : "border-slate-100",
                        )}>
                            <span className={cn("text-[9px] font-black uppercase tracking-widest shrink-0 mt-0.5", isDarkMode ? "text-white/30" : "text-slate-400")}>
                                {label}
                            </span>
                            <span className={cn(
                                "text-xs font-medium text-right",
                                label === "Status" && value === "Active" ? "text-emerald-500 font-black" :
                                    isDarkMode ? "text-white" : "text-slate-800",
                            )}>
                                {value}
                            </span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

// ── Edit Modal ────────────────────────────────────────────────────────────────

const EditModal = ({
    rate, isDarkMode, isPending, onSave, onClose,
}: {
    rate: any;
    isDarkMode: boolean;
    isPending: boolean;
    onSave: (data: { gst_rate?: number; effective_from?: string; notes?: string }) => void;
    onClose: () => void;
}) => {
    const [gstRateInput, setGstRateInput] = useState(String(parseFloat(rate?.gst_rate ?? "18")));
    const [effectiveFrom, setEffectiveFrom] = useState(
        rate?.effective_from ? new Date(rate.effective_from).toISOString().slice(0, 16) : ""
    );
    const [notes, setNotes] = useState(rate?.notes || "");

    if (!rate) return null;

    const inputCls = cn(
        "w-full px-4 py-2.5 rounded-[14px] border text-xs font-medium transition-all outline-none",
        isDarkMode
            ? "bg-white/[0.04] border-white/10 text-white placeholder:text-white/20 focus:border-emerald-500/40"
            : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-400",
    );
    const labelCls = cn("text-[9px] font-black uppercase tracking-[0.2em]", isDarkMode ? "text-white/40" : "text-slate-400");

    const handleSave = () => {
        const rate_ = parseFloat(gstRateInput);
        if (isNaN(rate_) || rate_ <= 0 || rate_ > 100) {
            toast.error("GST rate must be between 0 and 100");
            return;
        }
        if (!effectiveFrom) {
            toast.error("Effective from date is required");
            return;
        }
        onSave({
            gst_rate: rate_,
            effective_from: new Date(effectiveFrom).toISOString(),
            notes: notes.trim() || undefined,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className={cn(
                    "relative w-full max-w-sm p-6 rounded-[24px] border shadow-2xl",
                    isDarkMode ? "bg-slate-900 border-white/10" : "bg-white border-slate-200",
                )}
            >
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <Pencil size={14} className="text-emerald-500" />
                        <h3 className={cn("text-xs font-black uppercase tracking-widest", isDarkMode ? "text-white" : "text-slate-900")}>
                            Edit GST Rate
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className={cn("p-1.5 rounded-lg transition-colors", isDarkMode ? "hover:bg-white/10" : "hover:bg-slate-100")}
                    >
                        <X size={14} className={isDarkMode ? "text-white/50" : "text-slate-400"} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className={labelCls}>GST Rate (%)</label>
                        <input
                            type="number"
                            min={0}
                            max={100}
                            step={0.01}
                            value={gstRateInput}
                            onChange={(e) => setGstRateInput(e.target.value)}
                            className={inputCls}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className={labelCls}>Effective From</label>
                        <input
                            type="datetime-local"
                            value={effectiveFrom}
                            onChange={(e) => setEffectiveFrom(e.target.value)}
                            className={inputCls}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className={labelCls}>Notes (optional)</label>
                        <input
                            type="text"
                            placeholder="e.g. Finance notification ref"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            maxLength={500}
                            className={inputCls}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <button
                        onClick={onClose}
                        disabled={isPending}
                        className={cn(
                            "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                            isDarkMode
                                ? "border-white/10 text-white/50 hover:text-white hover:border-white/20"
                                : "border-slate-200 text-slate-500 hover:text-slate-800",
                        )}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isPending}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white bg-emerald-600 hover:bg-emerald-500 transition-all disabled:opacity-50"
                    >
                        {isPending ? <Loader2 size={12} className="animate-spin" /> : <Pencil size={12} />}
                        Save Changes
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// ── Main component ────────────────────────────────────────────────────────────

export const GSTSettings = ({ isDarkMode }: GSTSettingsProps) => {
    const [page, setPage] = useState(1);
    const [showAddForm, setShowAddForm] = useState(false);
    const [gstRateInput, setGstRateInput] = useState("");
    const [effectiveFrom, setEffectiveFrom] = useState("");
    const [notes, setNotes] = useState("");

    // Modal state
    const [viewRate, setViewRate] = useState<any>(null);
    const [editRate, setEditRate] = useState<any>(null);

    // Toggle/action pending
    const [pendingToggleId, setPendingToggleId] = useState<number | null>(null);

    // Force-confirm for open billing cycles
    const [forceDialogOpen, setForceDialogOpen] = useState(false);
    const [pendingActivateId, setPendingActivateId] = useState<number | null>(null);
    const [pendingActivateRate, setPendingActivateRate] = useState<number | null>(null);

    // Confirm deactivate / delete
    const [confirmAction, setConfirmAction] = useState<{ id: number; rate: number; type: "deactivate" | "delete" } | null>(null);
    const [isConfirmPending, setIsConfirmPending] = useState(false);

    const { data: activeData, isLoading: activeLoading } = useAdminGetActiveGSTRateQuery();
    const { data: listData, isLoading: listLoading } = useAdminListGSTRatesQuery({ page, limit: 10 });

    const addMutation = useAdminAddGSTRateMutation();
    const activateMutation = useAdminActivateGSTRateMutation();
    const deactivateMutation = useAdminDeactivateGSTRateMutation();
    const deleteMutation = useAdminDeleteGSTRateMutation();
    const updateMutation = useAdminUpdateGSTRateMutation();

    const activeRate: number | null = activeData?.data?.configured_gst_rate ?? activeData?.configured_gst_rate ?? null;
    const fallbackRate: number = activeData?.data?.fallback_gst_rate ?? activeData?.fallback_gst_rate ?? 18;
    const hasConfiguredActiveRate: boolean = activeData?.data?.has_configured_active_rate ?? activeData?.has_configured_active_rate ?? activeRate !== null;
    const rates: any[] = listData?.data?.rates ?? listData?.rates ?? [];
    const pagination = listData?.data?.pagination ?? listData?.pagination;

    // ── Add ──────────────────────────────────────────────────────────────────

    const handleAdd = async () => {
        const rate = parseFloat(gstRateInput);
        if (isNaN(rate) || rate <= 0 || rate > 100) {
            toast.error("GST rate must be a number between 0 and 100");
            return;
        }
        if (!effectiveFrom) {
            toast.error("Effective from date is required");
            return;
        }
        try {
            await addMutation.mutateAsync({
                gst_rate: rate,
                effective_from: new Date(effectiveFrom).toISOString(),
                notes: notes.trim() || undefined,
            });
            toast.success(`GST rate ${rate}% added — click Activate to make it live`);
            setGstRateInput("");
            setEffectiveFrom("");
            setNotes("");
            setShowAddForm(false);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || "Failed to add GST rate");
        }
    };

    // ── Toggle (activate / deactivate) ───────────────────────────────────────

    const handleToggle = async (rate: any, force = false) => {
        setPendingToggleId(rate.id);
        try {
            if (rate.is_active) {
                // Deactivate — show confirm dialog
                setPendingToggleId(null);
                setConfirmAction({ id: rate.id, rate: parseFloat(rate.gst_rate), type: "deactivate" });
                return;
            }
            // Activate
            const result = await activateMutation.mutateAsync({ id: rate.id, force });
            const msg = result?.data?.message ?? result?.message ?? "GST rate activated";
            toast.success(msg);
            setForceDialogOpen(false);
            setPendingActivateId(null);
            setPendingActivateRate(null);
        } catch (err: any) {
            const code = err?.response?.data?.code;
            if (code === "OPEN_CYCLES") {
                setPendingActivateId(rate.id);
                setPendingActivateRate(parseFloat(rate.gst_rate));
                setForceDialogOpen(true);
            } else {
                toast.error(err?.response?.data?.message || err?.message || "Failed to activate GST rate");
            }
        } finally {
            setPendingToggleId(null);
        }
    };

    const handleForceConfirm = async () => {
        if (pendingActivateId === null) return;
        const rateObj = rates.find((r) => r.id === pendingActivateId);
        if (rateObj) await handleToggle(rateObj, true);
    };

    // ── Confirm action (deactivate / delete) ─────────────────────────────────

    const confirmActionMutation = async () => {
        if (!confirmAction) return;
        setIsConfirmPending(true);
        try {
            if (confirmAction.type === "deactivate") {
                const result = await deactivateMutation.mutateAsync({ id: confirmAction.id });
                toast.success(result?.data?.message ?? result?.message ?? "GST rate deactivated. Default 18% now applies.");
            } else {
                const result = await deleteMutation.mutateAsync(confirmAction.id);
                toast.success(result?.data?.message ?? result?.message ?? "GST rate deleted");
            }
            setConfirmAction(null);
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message || err?.message ||
                (confirmAction.type === "deactivate" ? "Failed to deactivate" : "Failed to delete"),
            );
        } finally {
            setIsConfirmPending(false);
        }
    };

    // ── Edit save ─────────────────────────────────────────────────────────────

    const handleEditSave = async (data: { gst_rate?: number; effective_from?: string; notes?: string }) => {
        if (!editRate) return;
        try {
            await updateMutation.mutateAsync({ id: editRate.id, data });
            toast.success("GST rate updated");
            setEditRate(null);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || "Failed to update GST rate");
        }
    };

    // ── Styles ────────────────────────────────────────────────────────────────

    const cardBase = cn(
        "rounded-[24px] border p-6",
        isDarkMode ? "bg-white/[0.03] border-white/10" : "bg-white border-slate-100 shadow-sm",
    );

    const labelCls = cn(
        "text-[9px] font-black uppercase tracking-[0.2em]",
        isDarkMode ? "text-white/40" : "text-slate-400",
    );

    const inputCls = cn(
        "w-full px-4 py-3 rounded-[14px] border text-xs font-medium transition-all outline-none",
        isDarkMode
            ? "bg-white/[0.04] border-white/10 text-white placeholder:text-white/20 focus:border-emerald-500/40"
            : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-400",
    );

    const iconBtnCls = (color: "blue" | "emerald" | "red") => cn(
        "inline-flex items-center justify-center w-7 h-7 rounded-[8px] transition-all",
        color === "blue" && (isDarkMode
            ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
            : "bg-blue-50 text-blue-600 hover:bg-blue-100"),
        color === "emerald" && (isDarkMode
            ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"),
        color === "red" && (isDarkMode
            ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
            : "bg-red-50 text-red-600 hover:bg-red-100"),
    );

    const isAnyMutating =
        activateMutation.isPending || deactivateMutation.isPending ||
        deleteMutation.isPending || updateMutation.isPending;

    return (
        <>
            {/* Force-confirm dialog */}
            <ForceConfirmDialog
                open={forceDialogOpen}
                newRate={pendingActivateRate}
                onConfirm={handleForceConfirm}
                onCancel={() => { setForceDialogOpen(false); setPendingActivateId(null); setPendingActivateRate(null); }}
                isDarkMode={isDarkMode}
                isPending={activateMutation.isPending}
            />

            {/* Deactivate / Delete confirm */}
            <ConfirmDialog
                open={!!confirmAction}
                title={confirmAction?.type === "delete" ? "Delete GST Rate" : "Deactivate GST Rate"}
                description={
                    confirmAction?.type === "delete"
                        ? `Permanently delete the ${confirmAction?.rate.toFixed(2)}% GST rate? This cannot be undone.`
                        : `Deactivate the ${confirmAction?.rate.toFixed(2)}% rate? The system will fall back to the default ${fallbackRate}% until another rate is activated.`
                }
                confirmLabel={confirmAction?.type === "delete" ? "Delete" : "Deactivate"}
                confirmTone={confirmAction?.type === "delete" ? "danger" : "warning"}
                onConfirm={confirmActionMutation}
                onCancel={() => { if (!isConfirmPending) setConfirmAction(null); }}
                isDarkMode={isDarkMode}
                isPending={isConfirmPending}
            />

            {/* View modal */}
            <AnimatePresence>
                {viewRate && (
                    <ViewModal
                        rate={viewRate}
                        isDarkMode={isDarkMode}
                        onClose={() => setViewRate(null)}
                    />
                )}
            </AnimatePresence>

            {/* Edit modal */}
            <AnimatePresence>
                {editRate && (
                    <EditModal
                        rate={editRate}
                        isDarkMode={isDarkMode}
                        isPending={updateMutation.isPending}
                        onSave={handleEditSave}
                        onClose={() => setEditRate(null)}
                    />
                )}
            </AnimatePresence>

            <div className="space-y-6">

                {/* ── Active Rate Banner ── */}
                <div className={cn(cardBase, "flex items-center justify-between gap-4")}>
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0",
                            isDarkMode ? "bg-emerald-500/10" : "bg-emerald-50",
                        )}>
                            <Percent size={20} className="text-emerald-500" />
                        </div>
                        <div>
                            <p className={labelCls}>Currently Active GST Rate</p>
                            {activeLoading ? (
                                <Loader2 size={18} className="animate-spin text-emerald-500 mt-1" />
                            ) : (
                                <>
                                    <p className={cn("text-3xl font-black mt-0.5", isDarkMode ? "text-white" : "text-slate-900")}>
                                        {hasConfiguredActiveRate && activeRate !== null ? `${activeRate}%` : "—"}
                                    </p>
                                    {!hasConfiguredActiveRate && (
                                        <p className={cn("text-[10px] font-bold mt-1", isDarkMode ? "text-amber-300/80" : "text-amber-700")}>
                                            No configured active rate — falling back to {fallbackRate}%
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => setShowAddForm((v) => !v)}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all",
                            showAddForm
                                ? isDarkMode
                                    ? "bg-white/10 text-white"
                                    : "bg-slate-100 text-slate-700"
                                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20",
                        )}
                    >
                        <Plus size={12} />
                        {showAddForm ? "Cancel" : "Add New Rate"}
                    </button>
                </div>

                {/* ── Add Form ── */}
                <AnimatePresence>
                    {showAddForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className={cardBase}>
                                <div className="flex items-center gap-2 mb-5">
                                    <Plus size={14} className="text-emerald-500" />
                                    <h3 className={cn("text-xs font-black uppercase tracking-widest", isDarkMode ? "text-white" : "text-slate-900")}>
                                        Add New GST Rate
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className={labelCls}>GST Rate (%)</label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            step={0.01}
                                            placeholder="e.g. 18"
                                            value={gstRateInput}
                                            onChange={(e) => setGstRateInput(e.target.value)}
                                            className={inputCls}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelCls}>Effective From</label>
                                        <input
                                            type="datetime-local"
                                            value={effectiveFrom}
                                            onChange={(e) => setEffectiveFrom(e.target.value)}
                                            className={inputCls}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelCls}>Notes (optional)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Finance notification ref"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            maxLength={500}
                                            className={inputCls}
                                        />
                                    </div>
                                </div>

                                <div className={cn(
                                    "flex items-start gap-2 mt-4 p-3 rounded-[12px]",
                                    isDarkMode ? "bg-white/[0.03]" : "bg-slate-50",
                                )}>
                                    <Info size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                                    <p className={cn("text-[9px] leading-relaxed", isDarkMode ? "text-white/40" : "text-slate-500")}>
                                        Adding a rate does <strong>not</strong> activate it. Use the toggle in the table below to activate.
                                        Only <strong>one rate</strong> can be active at a time — activating a new one automatically deactivates the current active rate.
                                    </p>
                                </div>

                                <div className="flex justify-end mt-5">
                                    <button
                                        onClick={handleAdd}
                                        disabled={addMutation.isPending || !gstRateInput || !effectiveFrom}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-[14px] text-[10px] font-black uppercase tracking-widest text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {addMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                                        Save Rate
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── History Table ── */}
                <div className={cardBase}>
                    <div className="flex items-center justify-between mb-5">
                        <h3 className={cn("text-xs font-black uppercase tracking-widest", isDarkMode ? "text-white" : "text-slate-900")}>
                            GST Rate History
                        </h3>
                        <div className="flex items-center gap-3">
                            {hasConfiguredActiveRate && (
                                <span className={cn(
                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider",
                                    isDarkMode ? "bg-amber-500/10 text-amber-300" : "bg-amber-50 text-amber-700",
                                )}>
                                    <Info size={9} />
                                    Only 1 rate can be active
                                </span>
                            )}
                            <span className={cn("text-[9px] font-black uppercase tracking-widest", isDarkMode ? "text-white/30" : "text-slate-400")}>
                                {pagination?.total ?? 0} records
                            </span>
                        </div>
                    </div>

                    {listLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 size={20} className="animate-spin text-emerald-500" />
                        </div>
                    ) : rates.length === 0 ? (
                        <p className={cn("text-center py-8 text-xs", isDarkMode ? "text-white/30" : "text-slate-400")}>
                            No GST rates found
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr>
                                        {["Rate", "Effective From", "Active", "Added By", "Notes", "Actions"].map((h) => (
                                            <th key={h} className={cn("pb-3 pr-4 text-[9px] font-black uppercase tracking-widest whitespace-nowrap", isDarkMode ? "text-white/30" : "text-slate-400")}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rates.map((rate: any) => {
                                        const isActive = rate.is_active;
                                        const isThisToggling = pendingToggleId === rate.id;
                                        // Toggle is disabled if:
                                        // 1. Another rate is already active AND this one is not active (can still activate — it deactivates the current one)
                                        // 2. Any mutation is running
                                        // We allow toggling ON any inactive rate (backend handles the swap atomically)
                                        // We allow toggling OFF only the active rate
                                        const toggleDisabled = isAnyMutating || isThisToggling;

                                        const toggleTitle = isActive
                                            ? "Deactivate this rate"
                                            : hasConfiguredActiveRate
                                                ? `Activate — will replace current ${activeRate}% rate`
                                                : "Activate this rate";

                                        return (
                                            <tr
                                                key={rate.id}
                                                className={cn(
                                                    "border-t transition-colors",
                                                    isDarkMode ? "border-white/5 hover:bg-white/[0.02]" : "border-slate-100 hover:bg-slate-50",
                                                )}
                                            >
                                                {/* Rate */}
                                                <td className="py-3.5 pr-4">
                                                    <span className={cn(
                                                        "text-sm font-black",
                                                        isActive ? "text-emerald-500" : isDarkMode ? "text-white" : "text-slate-800",
                                                    )}>
                                                        {parseFloat(rate.gst_rate).toFixed(2)}%
                                                    </span>
                                                </td>

                                                {/* Effective From */}
                                                <td className={cn("py-3.5 pr-4 text-[11px] font-medium whitespace-nowrap", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                                    {formatDate(rate.effective_from)}
                                                </td>

                                                {/* Active Toggle */}
                                                <td className="py-3.5 pr-4">
                                                    <div className="flex items-center gap-2">
                                                        {isThisToggling ? (
                                                            <Loader2 size={14} className="animate-spin text-emerald-500" />
                                                        ) : (
                                                            <Toggle
                                                                checked={isActive}
                                                                onChange={() => handleToggle(rate)}
                                                                disabled={toggleDisabled}
                                                                title={toggleTitle}
                                                            />
                                                        )}
                                                        <span className={cn(
                                                            "text-[9px] font-black uppercase tracking-wider",
                                                            isActive ? "text-emerald-500" : isDarkMode ? "text-white/30" : "text-slate-400",
                                                        )}>
                                                            {isActive ? (
                                                                <span className="flex items-center gap-1"><CheckCircle2 size={9} /> Live</span>
                                                            ) : (
                                                                <span className="flex items-center gap-1"><Clock size={9} /> Off</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                    {/* Hint when another rate is active */}
                                                    {!isActive && hasConfiguredActiveRate && (
                                                        <p className={cn("text-[8px] mt-0.5", isDarkMode ? "text-amber-300/60" : "text-amber-600")}>
                                                            Replaces {activeRate}%
                                                        </p>
                                                    )}
                                                </td>

                                                {/* Added By */}
                                                <td className={cn("py-3.5 pr-4 text-[11px] font-medium", isDarkMode ? "text-white/50" : "text-slate-500")}>
                                                    {rate.created_by_name || rate.created_by}
                                                </td>

                                                {/* Notes */}
                                                <td className={cn("py-3.5 pr-4 text-[11px] max-w-[140px] truncate", isDarkMode ? "text-white/40" : "text-slate-400")}>
                                                    {rate.notes || "—"}
                                                </td>

                                                {/* Actions: View / Edit / Delete */}
                                                <td className="py-3.5">
                                                    <div className="flex items-center gap-1.5">
                                                        {/* View */}
                                                        <button
                                                            onClick={() => setViewRate(rate)}
                                                            title="View details"
                                                            className={iconBtnCls("blue")}
                                                        >
                                                            <Eye size={12} />
                                                        </button>

                                                        {/* Edit (only inactive) */}
                                                        <button
                                                            onClick={() => {
                                                                if (isActive) {
                                                                    toast.error("Deactivate this rate before editing it");
                                                                    return;
                                                                }
                                                                setEditRate(rate);
                                                            }}
                                                            title={isActive ? "Deactivate before editing" : "Edit rate"}
                                                            className={cn(
                                                                iconBtnCls("emerald"),
                                                                isActive && "opacity-30 cursor-not-allowed",
                                                            )}
                                                        >
                                                            <Pencil size={12} />
                                                        </button>

                                                        {/* Delete (only inactive) */}
                                                        <button
                                                            onClick={() => {
                                                                if (isActive) {
                                                                    toast.error("Deactivate this rate before deleting it");
                                                                    return;
                                                                }
                                                                setConfirmAction({ id: rate.id, rate: parseFloat(rate.gst_rate), type: "delete" });
                                                            }}
                                                            title={isActive ? "Deactivate before deleting" : "Delete rate"}
                                                            disabled={deleteMutation.isPending && confirmAction?.id === rate.id}
                                                            className={cn(
                                                                iconBtnCls("red"),
                                                                isActive && "opacity-30 cursor-not-allowed",
                                                            )}
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className={cn(
                                    "p-2 rounded-[10px] transition-all disabled:opacity-30",
                                    isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-100",
                                )}
                            >
                                <ChevronLeft size={14} className={isDarkMode ? "text-white" : "text-slate-600"} />
                            </button>
                            <span className={cn("text-[10px] font-black uppercase tracking-widest", isDarkMode ? "text-white/30" : "text-slate-400")}>
                                Page {page} of {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                                disabled={page === pagination.totalPages}
                                className={cn(
                                    "p-2 rounded-[10px] transition-all disabled:opacity-30",
                                    isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-100",
                                )}
                            >
                                <ChevronRight size={14} className={isDarkMode ? "text-white" : "text-slate-600"} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
