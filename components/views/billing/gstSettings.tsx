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
} from "@/hooks/useBillingQuery";
import {
    Percent, Plus, CheckCircle2, Clock, AlertTriangle,
    Loader2, ChevronLeft, ChevronRight, Info,
    Trash2, Power,
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

// ── Force-confirm dialog (shown when open billing cycles block activation) ───

const ForceConfirmDialog = ({
    open, onConfirm, onCancel, isDarkMode, isPending,
}: {
    open: boolean;
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
                    Activating a new GST rate now will apply it to <strong>new transactions only</strong> —
                    existing cycle costs remain unchanged. Force-activate anyway?
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

const ActionConfirmDialog = ({
    open,
    title,
    description,
    confirmLabel,
    confirmTone,
    onConfirm,
    onCancel,
    isDarkMode,
    isPending,
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

    const confirmClassName = confirmTone === "danger"
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
                    <h3 className={cn("text-sm font-black", isDarkMode ? "text-white" : "text-slate-900")}>
                        {title}
                    </h3>
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
                            confirmClassName,
                        )}
                    >
                        {isPending ? <Loader2 size={14} className="animate-spin" /> : confirmLabel}
                    </button>
                </div>
            </div>
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
    const [pendingActivateId, setPendingActivateId] = useState<number | null>(null);
    const [forceDialogOpen, setForceDialogOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ id: number; type: "activate" | "deactivate" | "delete" } | null>(null);
    const [confirmAction, setConfirmAction] = useState<null | { id: number; rate: number; type: "deactivate" | "delete" }>(null);

    const { data: activeData, isLoading: activeLoading } = useAdminGetActiveGSTRateQuery();
    const { data: listData, isLoading: listLoading } = useAdminListGSTRatesQuery({ page, limit: 10 });

    const addMutation = useAdminAddGSTRateMutation();
    const activateMutation = useAdminActivateGSTRateMutation();
    const deactivateMutation = useAdminDeactivateGSTRateMutation();
    const deleteMutation = useAdminDeleteGSTRateMutation();

    const activeRate: number | null = activeData?.data?.configured_gst_rate ?? activeData?.configured_gst_rate ?? null;
    const fallbackRate: number = activeData?.data?.fallback_gst_rate ?? activeData?.fallback_gst_rate ?? 18;
    const hasConfiguredActiveRate: boolean = activeData?.data?.has_configured_active_rate ?? activeData?.has_configured_active_rate ?? activeRate !== null;
    const rates: any[] = listData?.data?.rates ?? listData?.rates ?? [];
    const pagination = listData?.data?.pagination ?? listData?.pagination;
    const isDeactivating = pendingAction?.type === "deactivate";
    const isActivating = pendingAction?.type === "activate";
    const isDeleting = pendingAction?.type === "delete";
    const confirmRateText = confirmAction ? confirmAction.rate.toFixed(2) : "0.00";

    // ── Add handler ──────────────────────────────────────────────────────────

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
            toast.success(`GST rate ${rate}% added successfully`);
            setGstRateInput("");
            setEffectiveFrom("");
            setNotes("");
            setShowAddForm(false);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || "Failed to add GST rate");
        }
    };

    // ── Activate handler (with open-cycle safety) ────────────────────────────

    const handleActivate = async (id: number, force = false) => {
        setPendingAction({ id, type: "activate" });
        try {
            const result = await activateMutation.mutateAsync({ id, force });
            const msg = result?.data?.message ?? result?.message ?? "GST rate activated";
            toast.success(msg);
            setForceDialogOpen(false);
            setPendingActivateId(null);
        } catch (err: any) {
            const code = err?.response?.data?.code;
            if (code === "OPEN_CYCLES") {
                // Show force-confirm dialog instead of a plain error
                setPendingActivateId(id);
                setForceDialogOpen(true);
            } else {
                toast.error(err?.response?.data?.message || err?.message || "Failed to activate GST rate");
            }
        } finally {
            setPendingAction(null);
        }
    };

    const handleForceConfirm = () => {
        if (pendingActivateId !== null) {
            handleActivate(pendingActivateId, true);
        }
    };

    const handleDeactivate = async (id: number, rate: number) => {
        setConfirmAction({ id, rate, type: "deactivate" });
    };

    const handleDelete = async (id: number, rate: number) => {
        setConfirmAction({ id, rate, type: "delete" });
    };

    const closeConfirmAction = () => {
        if (pendingAction?.type === "deactivate" || pendingAction?.type === "delete") {
            return;
        }

        setConfirmAction(null);
    };

    const confirmActionMutation = async () => {
        if (!confirmAction) return;

        const { id, type } = confirmAction;
        setPendingAction({ id, type });
        try {
            if (type === "deactivate") {
                const result = await deactivateMutation.mutateAsync({ id });
                toast.success(result?.data?.message ?? result?.message ?? "GST rate deactivated");
            } else {
                const result = await deleteMutation.mutateAsync(id);
                toast.success(result?.data?.message ?? result?.message ?? "GST rate deleted");
            }
            setConfirmAction(null);
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message ||
                err?.message ||
                (type === "deactivate" ? "Failed to deactivate GST rate" : "Failed to delete GST rate"),
            );
        } finally {
            setPendingAction(null);
        }
    };

    // ── UI ───────────────────────────────────────────────────────────────────

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

    return (
        <>
            <ForceConfirmDialog
                open={forceDialogOpen}
                onConfirm={handleForceConfirm}
                onCancel={() => { setForceDialogOpen(false); setPendingActivateId(null); }}
                isDarkMode={isDarkMode}
                isPending={activateMutation.isPending}
            />
            <ActionConfirmDialog
                open={!!confirmAction}
                title={confirmAction?.type === "delete" ? "Delete GST Rate" : "Deactivate GST Rate"}
                description={confirmAction?.type === "delete"
                    ? `Delete GST rate ${confirmRateText}%? This action cannot be undone.`
                    : `Deactivate GST rate ${confirmRateText}%? The system will fall back to the default GST rate until another configured rate is activated.`}
                confirmLabel={confirmAction?.type === "delete" ? "Delete Rate" : "Deactivate Rate"}
                confirmTone={confirmAction?.type === "delete" ? "danger" : "warning"}
                onConfirm={confirmActionMutation}
                onCancel={closeConfirmAction}
                isDarkMode={isDarkMode}
                isPending={isDeactivating || isDeleting}
            />

            <div className="space-y-6">

                {/* ── Active Rate Banner ── */}
                <div className={cn(
                    cardBase,
                    "flex items-center justify-between gap-4",
                )}>
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
                                            No configured active rate. Fallback: {fallbackRate}%
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
                                    {/* Rate */}
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
                                        {gstRateInput && (parseFloat(gstRateInput) <= 0 || parseFloat(gstRateInput) > 100) && (
                                            <p className="text-[9px] text-red-400 font-medium">Must be between 0 and 100</p>
                                        )}
                                    </div>

                                    {/* Effective From */}
                                    <div className="space-y-2">
                                        <label className={labelCls}>Effective From</label>
                                        <input
                                            type="datetime-local"
                                            value={effectiveFrom}
                                            onChange={(e) => setEffectiveFrom(e.target.value)}
                                            className={inputCls}
                                        />
                                    </div>

                                    {/* Notes */}
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

                                {/* Info notice */}
                                <div className={cn(
                                    "flex items-start gap-2 mt-4 p-3 rounded-[12px]",
                                    isDarkMode ? "bg-white/[0.03]" : "bg-slate-50",
                                )}>
                                    <Info size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                                    <p className={cn("text-[9px] leading-relaxed", isDarkMode ? "text-white/40" : "text-slate-500")}>
                                        Adding a rate does <strong>not</strong> activate it.
                                        After saving, click <strong>Activate</strong> on the rate row below.
                                        Old transactions are never modified, and tenant/frontend usage switches only after activation.
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
                        <span className={cn("text-[9px] font-black uppercase tracking-widest", isDarkMode ? "text-white/30" : "text-slate-400")}>
                            {pagination?.total ?? 0} records
                        </span>
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
                                        {["Rate", "Effective From", "Status", "Added By", "Notes", "Action"].map((h) => (
                                            <th key={h} className={cn("pb-3 pr-6 text-[9px] font-black uppercase tracking-widest", isDarkMode ? "text-white/30" : "text-slate-400")}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rates.map((rate: any) => (
                                        <tr
                                            key={rate.id}
                                            className={cn(
                                                "border-t transition-colors",
                                                isDarkMode ? "border-white/5 hover:bg-white/[0.02]" : "border-slate-100 hover:bg-slate-50",
                                            )}
                                        >
                                            {/* Rate */}
                                            <td className="py-3.5 pr-6">
                                                <span className={cn(
                                                    "text-sm font-black",
                                                    rate.is_active
                                                        ? "text-emerald-500"
                                                        : isDarkMode ? "text-white" : "text-slate-800",
                                                )}>
                                                    {parseFloat(rate.gst_rate).toFixed(2)}%
                                                </span>
                                            </td>

                                            {/* Effective From */}
                                            <td className={cn("py-3.5 pr-6 text-[11px] font-medium", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                                {formatDate(rate.effective_from)}
                                            </td>

                                            {/* Status badge */}
                                            <td className="py-3.5 pr-6">
                                                {rate.is_active ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500">
                                                        <CheckCircle2 size={10} />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className={cn(
                                                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider",
                                                        isDarkMode ? "bg-white/5 text-white/30" : "bg-slate-100 text-slate-400",
                                                    )}>
                                                        <Clock size={10} />
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>

                                            {/* Admin name */}
                                            <td className={cn("py-3.5 pr-6 text-[11px] font-medium", isDarkMode ? "text-white/50" : "text-slate-500")}>
                                                {rate.created_by_name || rate.created_by}
                                            </td>

                                            {/* Notes */}
                                            <td className={cn("py-3.5 pr-6 text-[11px] max-w-[160px] truncate", isDarkMode ? "text-white/40" : "text-slate-400")}>
                                                {rate.notes || "—"}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5">
                                                {rate.is_active ? (
                                                    <button
                                                        onClick={() => handleDeactivate(rate.id, parseFloat(rate.gst_rate))}
                                                        disabled={deactivateMutation.isPending || deleteMutation.isPending || activateMutation.isPending}
                                                        className={cn(
                                                            "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50",
                                                            isDarkMode
                                                                ? "bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                                                                : "bg-amber-50 text-amber-700 hover:bg-amber-100",
                                                        )}
                                                    >
                                                        {pendingAction?.id === rate.id && isDeactivating
                                                            ? <Loader2 size={10} className="animate-spin" />
                                                            : <Power size={10} />
                                                        }
                                                        Deactivate
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleActivate(rate.id)}
                                                            disabled={activateMutation.isPending || deactivateMutation.isPending || deleteMutation.isPending}
                                                            className={cn(
                                                                "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50",
                                                                isDarkMode
                                                                    ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                                                    : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
                                                            )}
                                                        >
                                                            {pendingAction?.id === rate.id && isActivating
                                                                ? <Loader2 size={10} className="animate-spin" />
                                                                : "Activate"
                                                            }
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(rate.id, parseFloat(rate.gst_rate))}
                                                            disabled={deleteMutation.isPending || activateMutation.isPending || deactivateMutation.isPending}
                                                            className={cn(
                                                                "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50",
                                                                isDarkMode
                                                                    ? "bg-red-500/10 text-red-300 hover:bg-red-500/20"
                                                                    : "bg-red-50 text-red-600 hover:bg-red-100",
                                                            )}
                                                        >
                                                            {pendingAction?.id === rate.id && isDeleting
                                                                ? <Loader2 size={10} className="animate-spin" />
                                                                : <Trash2 size={10} />
                                                            }
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
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
