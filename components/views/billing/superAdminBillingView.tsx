"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
    Shield, Users, Wallet, FileText, ScrollText, Activity,
    Loader2, CheckCircle, AlertTriangle, Search, ChevronLeft,
    ChevronRight, Unlock, CreditCard, ArrowRightLeft,
    XCircle, DollarSign, ExternalLink, Download, ChevronDown, Building2, X
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    useAdminForceUnlockMutation,
    useAdminManualCreditMutation,
    useAdminInvoiceCloseMutation,
    useAdminChangeBillingModeMutation,
    useAdminUpdateUsageLimitsMutation,
    useAdminGetAuditLogQuery,
    useAdminGetHealthSummaryQuery,
    useAdminGetTenantsQuery,
    useAdminGetTenantOverviewQuery,
    useAdminResolveHealthEventMutation,
    useAdminGetUnresolvedEventsQuery,
    useGetInvoicesQuery,
} from "@/hooks/useBillingQuery";
import { useAuth } from "@/redux/selectors/auth/authSelector";
import { useTheme } from "@/hooks/useTheme";
import { useDebounce } from "@/hooks/useDebounce";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { clearAuthData } from "@/redux/slices/auth/authSlice";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// ────────────── Confirm Dialog ──────────────
const ConfirmDialog = ({ open, onConfirm, onCancel, title, message, isDarkMode, isPending, variant = "default" }: {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    message: string;
    isDarkMode: boolean;
    isPending?: boolean;
    variant?: "default" | "danger";
}) => {
    if (!open) return null;
    const colors = variant === "danger"
        ? "from-red-600 to-rose-600 shadow-red-500/20"
        : "from-emerald-600 to-teal-600 shadow-emerald-500/20";
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
            <div className={cn("relative w-full max-w-md p-6 rounded-[24px] border shadow-2xl", isDarkMode ? "bg-slate-900 border-white/10" : "bg-white border-slate-200")}>
                <h3 className={cn("text-sm font-black mb-2", isDarkMode ? "text-white" : "text-slate-900")}>{title}</h3>
                <p className={cn("text-xs mb-6 leading-relaxed", isDarkMode ? "text-white/50" : "text-slate-500")}>{message}</p>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onCancel}
                        disabled={isPending}
                        className={cn("px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all", isDarkMode ? "border-white/10 text-white/50 hover:text-white hover:border-white/20" : "border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300")}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isPending}
                        className={cn("px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all hover:shadow-lg disabled:opacity-50 bg-gradient-to-r", colors)}
                    >
                        {isPending ? <Loader2 size={14} className="animate-spin" /> : "Confirm"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ────────────── Tenant Selector Dropdown ──────────────
const TenantSelector = ({ value, onChange, isDarkMode, accentColor = "emerald" }: {
    value: string;
    onChange: (tenantId: string, companyName?: string) => void;
    isDarkMode: boolean;
    accentColor?: string;
}) => {
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [selectedName, setSelectedName] = useState("");
    const ref = useRef<HTMLDivElement>(null);
    const debouncedSearch = useDebounce(search, 300);
    const { data: res, isLoading, error } = useAdminGetTenantsQuery(debouncedSearch || undefined, open);
    const tenants = res?.tenants || [];

    // Clear selected name when value is reset externally
    useEffect(() => {
        if (!value) setSelectedName("");
    }, [value]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <label className={cn("text-[9px] font-black uppercase tracking-widest block mb-1.5", isDarkMode ? "text-white/30" : "text-slate-400")}>Tenant</label>
            <div
                className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all", isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}
                onClick={() => setOpen(!open)}
            >
                {value ? (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className={cn("text-sm font-bold truncate", isDarkMode ? "text-white" : "text-slate-900")}>{selectedName || value}</span>
                        <button onClick={(e) => { e.stopPropagation(); onChange(""); setSearch(""); setSelectedName(""); }} className="opacity-40 hover:opacity-80">
                            <X size={12} />
                        </button>
                    </div>
                ) : (
                    <span className={cn("text-sm flex-1", isDarkMode ? "text-white/20" : "text-slate-400")}>Select tenant...</span>
                )}
                <ChevronDown size={14} className={cn("opacity-40 transition-transform", open && "rotate-180")} />
            </div>
            {open && (
                <div className={cn("absolute z-50 mt-1 w-full rounded-xl border shadow-xl overflow-hidden", isDarkMode ? "bg-slate-900 border-white/10" : "bg-white border-slate-200")}>
                    <div className={cn("flex items-center gap-2 px-3 py-2 border-b", isDarkMode ? "border-white/5" : "border-slate-100")}>
                        <Search size={12} className="opacity-40" />
                        <input
                            autoFocus
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by ID or name..."
                            className={cn("bg-transparent text-xs outline-none flex-1", isDarkMode ? "text-white placeholder:text-white/30" : "text-slate-900 placeholder:text-slate-400")}
                        />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex justify-center py-4"><Loader2 size={16} className="animate-spin opacity-40" /></div>
                        ) : error ? (
                            <div className="px-3 py-4 text-center">
                                <p className="text-xs text-red-400 font-bold mb-1">Access denied (403)</p>
                                <p className="text-[10px] opacity-40">Please re-login as Super Admin</p>
                            </div>
                        ) : tenants.length === 0 ? (
                            <p className="text-center py-4 text-xs opacity-40">No tenants found</p>
                        ) : (
                            tenants.map((t: any) => (
                                <button
                                    key={t.tenant_id}
                                    onClick={() => { onChange(t.tenant_id, t.company_name); setSelectedName(t.company_name); setOpen(false); setSearch(""); }}
                                    className={cn("w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors", isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-50", value === t.tenant_id && (isDarkMode ? "bg-white/5" : "bg-slate-50"))}
                                >
                                    <Building2 size={14} className="opacity-30 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className={cn("text-xs font-bold truncate", isDarkMode ? "text-white/80" : "text-slate-800")}>{t.company_name}</p>
                                        <p className="text-[10px] opacity-40">{t.tenant_id} · {t.billing_mode} · ₹{t.wallet_balance.toFixed(0)}</p>
                                    </div>
                                    <span className={cn("text-[9px] font-black uppercase px-1.5 py-0.5 rounded border shrink-0",
                                        t.status === 'active' ? (isDarkMode ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-emerald-600 bg-emerald-50 border-emerald-200") :
                                            (isDarkMode ? "text-amber-400 bg-amber-500/10 border-amber-500/20" : "text-amber-600 bg-amber-50 border-amber-200")
                                    )}>{t.status}</span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// ────────────── Tenant Overview Card ──────────────
const TenantOverviewCard = ({ tenantId, isDarkMode }: { tenantId: string; isDarkMode: boolean }) => {
    const { data: res, isLoading } = useAdminGetTenantOverviewQuery(tenantId || undefined);
    const ov = res?.overview;

    if (!tenantId) return null;
    if (isLoading) return (
        <div className={cn("mt-4 p-4 rounded-xl border flex justify-center", isDarkMode ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-200")}>
            <Loader2 size={16} className="animate-spin opacity-40" />
        </div>
    );
    if (!ov) return null;

    const statusColor = ov.status === 'active'
        ? (isDarkMode ? "text-emerald-400" : "text-emerald-600")
        : (isDarkMode ? "text-amber-400" : "text-amber-600");

    return (
        <div className={cn("mt-4 p-4 rounded-xl border grid grid-cols-2 sm:grid-cols-4 gap-3", isDarkMode ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-200")}>
            <div>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-0.5">Company</p>
                <p className={cn("text-xs font-bold truncate", isDarkMode ? "text-white/80" : "text-slate-800")}>{ov.company_name}</p>
            </div>
            <div>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-0.5">Mode / Status</p>
                <p className={cn("text-xs font-bold", statusColor)}>{ov.billing_mode} · {ov.status}</p>
            </div>
            <div>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-0.5">Wallet</p>
                <p className={cn("text-xs font-black tabular-nums", isDarkMode ? "text-white" : "text-slate-900")}>₹{ov.wallet_balance.toFixed(2)}</p>
            </div>
            <div>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-0.5">Credit Limit</p>
                <p className={cn("text-xs font-bold tabular-nums", isDarkMode ? "text-white/60" : "text-slate-600")}>₹{ov.credit_limit.toFixed(0)}</p>
            </div>
            {ov.active_cycle && (
                <div className="col-span-2">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-0.5">Active Cycle</p>
                    <p className={cn("text-xs", isDarkMode ? "text-white/60" : "text-slate-600")}>
                        #{ov.active_cycle.cycle_number} · Usage: ₹{ov.active_cycle.current_usage.toFixed(2)}
                        {ov.active_cycle.is_locked && <span className="text-red-500 ml-1">(LOCKED)</span>}
                    </p>
                </div>
            )}
            {ov.overdue_invoices > 0 && (
                <div className="col-span-2">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-0.5">Overdue Invoices</p>
                    <p className="text-xs font-bold text-red-500">{ov.overdue_invoices}</p>
                </div>
            )}
        </div>
    );
};

// ────────────── Tenant Billing Management ──────────────
const TenantBillingManagement = ({ isDarkMode }: { isDarkMode: boolean }) => {
    const [tenantId, setTenantId] = useState("");
    const [newMode, setNewMode] = useState<'prepaid' | 'postpaid'>('prepaid');
    const [reason, setReason] = useState("");
    const changeModeM = useAdminChangeBillingModeMutation();
    const forceUnlockM = useAdminForceUnlockMutation();
    const [unlockTenantId, setUnlockTenantId] = useState("");
    const [unlockReason, setUnlockReason] = useState("");
    const [confirmMode, setConfirmMode] = useState(false);
    const [confirmUnlock, setConfirmUnlock] = useState(false);

    const handleChangeMode = () => {
        if (!tenantId.trim()) { toast.error("Please select a tenant first"); return; }
        if (!reason.trim()) { toast.error("Please provide a reason for the mode change"); return; }
        setConfirmMode(true);
    };

    const executeChangeMode = () => {
        changeModeM.mutate({ tenant_id: tenantId.trim(), new_mode: newMode, reason: reason.trim() }, {
            onSuccess: (res: any) => {
                const d = res?.data;
                toast.success(`Mode changed: ${d?.old_mode || '?'} → ${d?.new_mode || newMode} for ${tenantId}`);
                setTenantId(""); setReason(""); setConfirmMode(false);
            },
            onError: (err: any) => { toast.error(err?.response?.data?.message || "Failed to change billing mode"); setConfirmMode(false); },
        });
    };

    const handleForceUnlock = () => {
        if (!unlockTenantId.trim()) { toast.error("Please select a tenant first"); return; }
        if (!unlockReason.trim()) { toast.error("Please provide a reason to unlock access"); return; }
        setConfirmUnlock(true);
    };

    const executeForceUnlock = () => {
        forceUnlockM.mutate({ tenant_id: unlockTenantId.trim(), reason: unlockReason.trim() }, {
            onSuccess: (res: any) => {
                const d = res?.data;
                toast.success(`Unlocked ${unlockTenantId}: ${d?.overdue_invoices_reset || 0} invoices reset, ${d?.locked_cycles_unlocked || 0} cycles unlocked`);
                setUnlockTenantId(""); setUnlockReason(""); setConfirmUnlock(false);
            },
            onError: (err: any) => { toast.error(err?.response?.data?.message || "Failed to unlock access"); setConfirmUnlock(false); },
        });
    };

    return (
        <div className="space-y-8">
            <ConfirmDialog
                open={confirmMode}
                onConfirm={executeChangeMode}
                onCancel={() => setConfirmMode(false)}
                title="Change Billing Mode"
                message={`Switch tenant ${tenantId} to ${newMode} mode? This may initialize or close billing cycles.`}
                isDarkMode={isDarkMode}
                isPending={changeModeM.isPending}
            />
            <ConfirmDialog
                open={confirmUnlock}
                onConfirm={executeForceUnlock}
                onCancel={() => setConfirmUnlock(false)}
                title="Force Unlock Access"
                message={`This will reset all overdue invoices to unpaid and unlock all locked cycles for tenant ${unlockTenantId}.`}
                isDarkMode={isDarkMode}
                isPending={forceUnlockM.isPending}
                variant="danger"
            />

            {/* Change Billing Mode */}
            <div className={cn("p-6 rounded-[24px] border", isDarkMode ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-200")}>
                <div className="flex items-center gap-3 mb-6">
                    <div className={cn("p-2 rounded-xl", isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50')}>
                        <ArrowRightLeft size={16} className="text-blue-500" />
                    </div>
                    <div>
                        <h3 className={cn("text-sm font-bold", isDarkMode ? 'text-white' : 'text-slate-800')}>Change Billing Mode</h3>
                        <p className={cn("text-[10px] opacity-40 mt-0.5")}>Switch a tenant between prepaid and postpaid</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TenantSelector value={tenantId} onChange={setTenantId} isDarkMode={isDarkMode} accentColor="blue" />
                    <div>
                        <label className={cn("text-[9px] font-black uppercase tracking-widest block mb-1.5", isDarkMode ? "text-white/30" : "text-slate-400")}>New Mode</label>
                        <div className="flex gap-2">
                            {(['prepaid', 'postpaid'] as const).map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setNewMode(mode)}
                                    className={cn(
                                        "flex-1 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                        newMode === mode
                                            ? mode === 'prepaid'
                                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                                                : "bg-blue-500/10 border-blue-500/30 text-blue-500"
                                            : isDarkMode ? "border-white/10 text-white/30 hover:text-white/50" : "border-slate-200 text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className={cn("text-[9px] font-black uppercase tracking-widest block mb-1.5", isDarkMode ? "text-white/30" : "text-slate-400")}>Reason</label>
                        <input
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Reason for change..."
                            className={cn("w-full px-4 py-2.5 rounded-xl text-sm font-bold border outline-none transition-all", isDarkMode ? "bg-white/5 border-white/10 text-white focus:border-blue-500/50 placeholder:text-white/20" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 placeholder:text-slate-400")}
                        />
                    </div>
                </div>
                <TenantOverviewCard tenantId={tenantId} isDarkMode={isDarkMode} />
                <button
                    onClick={handleChangeMode}
                    disabled={changeModeM.isPending}
                    className="mt-4 flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-blue-600 to-indigo-600 text-white transition-all hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-50"
                >
                    {changeModeM.isPending ? <Loader2 size={14} className="animate-spin" /> : <ArrowRightLeft size={14} />}
                    Change Mode
                </button>
            </div>

            {/* Force Unlock Access */}
            <div className={cn("p-6 rounded-[24px] border", isDarkMode ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-200")}>
                <div className="flex items-center gap-3 mb-6">
                    <div className={cn("p-2 rounded-xl", isDarkMode ? 'bg-amber-500/10' : 'bg-amber-50')}>
                        <Unlock size={16} className="text-amber-500" />
                    </div>
                    <div>
                        <h3 className={cn("text-sm font-bold", isDarkMode ? 'text-white' : 'text-slate-800')}>Force Unlock Access</h3>
                        <p className={cn("text-[10px] opacity-40 mt-0.5")}>Restore blocked access for a tenant (overdue/credit limit)</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TenantSelector value={unlockTenantId} onChange={setUnlockTenantId} isDarkMode={isDarkMode} accentColor="amber" />
                    <div>
                        <label className={cn("text-[9px] font-black uppercase tracking-widest block mb-1.5", isDarkMode ? "text-white/30" : "text-slate-400")}>Reason</label>
                        <input
                            value={unlockReason}
                            onChange={(e) => setUnlockReason(e.target.value)}
                            placeholder="Reason for unlock..."
                            className={cn("w-full px-4 py-2.5 rounded-xl text-sm font-bold border outline-none transition-all", isDarkMode ? "bg-white/5 border-white/10 text-white focus:border-amber-500/50 placeholder:text-white/20" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500 placeholder:text-slate-400")}
                        />
                    </div>
                </div>
                <TenantOverviewCard tenantId={unlockTenantId} isDarkMode={isDarkMode} />
                <button
                    onClick={handleForceUnlock}
                    disabled={forceUnlockM.isPending}
                    className="mt-4 flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-amber-600 to-orange-600 text-white transition-all hover:shadow-lg hover:shadow-amber-500/20 disabled:opacity-50"
                >
                    {forceUnlockM.isPending ? <Loader2 size={14} className="animate-spin" /> : <Unlock size={14} />}
                    Force Unlock
                </button>
            </div>
        </div>
    );
};

// ────────────── Manual Wallet Credit ──────────────
const ManualWalletCredit = ({ isDarkMode }: { isDarkMode: boolean }) => {
    const [tenantId, setTenantId] = useState("");
    const [tenantName, setTenantName] = useState("");
    const [amount, setAmount] = useState("");
    const [reason, setReason] = useState("");
    const [confirmOpen, setConfirmOpen] = useState(false);
    const manualCreditM = useAdminManualCreditMutation();

    const { data: overviewRes } = useAdminGetTenantOverviewQuery(tenantId || undefined);
    const ov = overviewRes?.overview;

    const handleCredit = () => {
        if (!tenantId.trim()) { toast.error("Please select a tenant first"); return; }
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) { toast.error("Amount must be greater than 0"); return; }
        if (parsedAmount > 100000) { toast.error("Amount cannot exceed ₹1,00,000"); return; }
        if (!reason.trim()) { toast.error("Please provide a reason for the credit"); return; }

        if (ov && ov.billing_mode === 'postpaid') {
            const currentBalance = parseFloat(ov.wallet_balance) || 0;
            const limit = parseFloat(ov.credit_limit) || 0;
            if (currentBalance + parsedAmount > limit) {
                const maxAllowed = Math.max(0, limit - currentBalance);
                toast.error(`Exceeds limit! Maximum you can add is ₹${maxAllowed.toFixed(2)}`);
                return;
            }
        }

        setConfirmOpen(true);
    };

    const executeCredit = () => {
        const parsedAmount = parseFloat(amount);
        manualCreditM.mutate({ tenant_id: tenantId.trim(), amount: parsedAmount, reason: reason.trim() }, {
            onSuccess: (res: any) => {
                const d = res?.data;
                toast.success(`₹${parsedAmount.toFixed(2)} credited to ${tenantName || tenantId}. Balance: ₹${d?.oldBalance?.toFixed(2) || '?'} → ₹${d?.newBalance?.toFixed(2) || '?'}`);
                setTenantId(""); setTenantName(""); setAmount(""); setReason(""); setConfirmOpen(false);
            },
            onError: (err: any) => { toast.error(err?.response?.data?.message || "Failed to credit wallet"); setConfirmOpen(false); },
        });
    };

    return (
        <div className={cn("p-6 rounded-[24px] border", isDarkMode ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-200")}>
            <ConfirmDialog
                open={confirmOpen}
                onConfirm={executeCredit}
                onCancel={() => setConfirmOpen(false)}
                title="Confirm Manual Credit"
                message={`Credit ₹${parseFloat(amount || "0").toFixed(2)} to ${tenantName || tenantId}? This cannot be undone.`}
                isDarkMode={isDarkMode}
                isPending={manualCreditM.isPending}
            />
            <div className="flex items-center gap-3 mb-6">
                <div className={cn("p-2 rounded-xl", isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50')}>
                    <Wallet size={16} className="text-emerald-500" />
                </div>
                <div>
                    <h3 className={cn("text-sm font-bold", isDarkMode ? 'text-white' : 'text-slate-800')}>Manual Wallet Credit</h3>
                    <p className={cn("text-[10px] opacity-40 mt-0.5")}>Add credits to a tenant&apos;s wallet manually</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TenantSelector
                    value={tenantId}
                    onChange={(id, name) => { setTenantId(id); setTenantName(name || ""); }}
                    isDarkMode={isDarkMode}
                    accentColor="emerald"
                />
                <div>
                    <label className={cn("text-[9px] font-black uppercase tracking-widest block mb-1.5", isDarkMode ? "text-white/30" : "text-slate-400")}>Amount (₹)</label>
                    <input
                        type="number"
                        min="1"
                        max="100000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="500"
                        className={cn("w-full px-4 py-2.5 rounded-xl text-sm font-bold border outline-none transition-all", isDarkMode ? "bg-white/5 border-white/10 text-white focus:border-emerald-500/50 placeholder:text-white/20" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500 placeholder:text-slate-400")}
                    />
                </div>
                <div>
                    <label className={cn("text-[9px] font-black uppercase tracking-widest block mb-1.5", isDarkMode ? "text-white/30" : "text-slate-400")}>Reason</label>
                    <input
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Promotional credit, goodwill..."
                        className={cn("w-full px-4 py-2.5 rounded-xl text-sm font-bold border outline-none transition-all", isDarkMode ? "bg-white/5 border-white/10 text-white focus:border-emerald-500/50 placeholder:text-white/20" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500 placeholder:text-slate-400")}
                    />
                </div>
            </div>

            <TenantOverviewCard tenantId={tenantId} isDarkMode={isDarkMode} />

            {amount && parseFloat(amount) > 0 && (
                <div className={cn("mt-4 p-3 rounded-xl border flex items-center gap-3", isDarkMode ? "bg-emerald-500/5 border-emerald-500/10" : "bg-emerald-50 border-emerald-200")}>
                    <CheckCircle size={14} className="text-emerald-500" />
                    <span className={cn("text-xs", isDarkMode ? "text-emerald-400" : "text-emerald-700")}>
                        Will credit <strong>₹{parseFloat(amount).toFixed(2)}</strong> to wallet of <strong>{tenantName || tenantId || '...'}</strong>
                    </span>
                </div>
            )}

            <button
                onClick={handleCredit}
                disabled={manualCreditM.isPending}
                className="mt-4 flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-emerald-600 to-teal-600 text-white transition-all hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50"
            >
                {manualCreditM.isPending ? <Loader2 size={14} className="animate-spin" /> : <Wallet size={14} />}
                Credit Wallet
            </button>
        </div>
    );
};

// ────────────── Usage Limits Management ──────────────
const UsageLimitsManagement = ({ isDarkMode }: { isDarkMode: boolean }) => {
    const [tenantId, setTenantId] = useState("");
    const [tenantName, setTenantName] = useState("");
    const [maxDailyMessages, setMaxDailyMessages] = useState("");
    const [maxMonthlyMessages, setMaxMonthlyMessages] = useState("");
    const [maxDailyAiCalls, setMaxDailyAiCalls] = useState("");
    const [maxMonthlyAiCalls, setMaxMonthlyAiCalls] = useState("");
    const [reason, setReason] = useState("");
    const [confirmOpen, setConfirmOpen] = useState(false);
    const updateLimitsM = useAdminUpdateUsageLimitsMutation();

    const { data: overviewRes } = useAdminGetTenantOverviewQuery(tenantId || undefined);
    const ov = overviewRes?.overview;

    // Pre-fill current limits when tenant is selected
    useEffect(() => {
        if (ov) {
            setMaxDailyMessages(ov.max_daily_messages?.toString() || "");
            setMaxMonthlyMessages(ov.max_monthly_messages?.toString() || "");
            setMaxDailyAiCalls(ov.max_daily_ai_calls?.toString() || "");
            setMaxMonthlyAiCalls(ov.max_monthly_ai_calls?.toString() || "");
        }
    }, [ov]);

    const handleUpdate = () => {
        if (!tenantId.trim()) { toast.error("Please select a tenant first"); return; }
        const fields = [
            { key: "max_daily_messages", val: maxDailyMessages },
            { key: "max_monthly_messages", val: maxMonthlyMessages },
            { key: "max_daily_ai_calls", val: maxDailyAiCalls },
            { key: "max_monthly_ai_calls", val: maxMonthlyAiCalls },
        ];
        const hasValue = fields.some(f => f.val.trim() !== "");
        if (!hasValue) { toast.error("Please set at least one limit"); return; }
        for (const f of fields) {
            if (f.val.trim() !== "") {
                const n = parseInt(f.val);
                if (isNaN(n) || n < 0) { toast.error(`${f.key.replace(/_/g, ' ')} must be a non-negative number`); return; }
            }
        }
        setConfirmOpen(true);
    };

    const executeUpdate = () => {
        const payload: any = { tenant_id: tenantId.trim() };
        if (maxDailyMessages.trim()) payload.max_daily_messages = parseInt(maxDailyMessages);
        if (maxMonthlyMessages.trim()) payload.max_monthly_messages = parseInt(maxMonthlyMessages);
        if (maxDailyAiCalls.trim()) payload.max_daily_ai_calls = parseInt(maxDailyAiCalls);
        if (maxMonthlyAiCalls.trim()) payload.max_monthly_ai_calls = parseInt(maxMonthlyAiCalls);
        if (reason.trim()) payload.reason = reason.trim();

        updateLimitsM.mutate(payload, {
            onSuccess: () => {
                toast.success(`Usage limits updated for ${tenantName || tenantId}`);
                setConfirmOpen(false);
                setReason("");
            },
            onError: (err: any) => { toast.error(err?.response?.data?.message || "Failed to update usage limits"); setConfirmOpen(false); },
        });
    };

    const inputCls = cn("w-full px-4 py-2.5 rounded-xl text-sm font-bold border outline-none transition-all", isDarkMode ? "bg-white/5 border-white/10 text-white focus:border-violet-500/50 placeholder:text-white/20" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-violet-500 placeholder:text-slate-400");

    return (
        <div className={cn("p-6 rounded-[24px] border", isDarkMode ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-200")}>
            <ConfirmDialog
                open={confirmOpen}
                onConfirm={executeUpdate}
                onCancel={() => setConfirmOpen(false)}
                title="Confirm Usage Limits Update"
                message={`Update usage limits for ${tenantName || tenantId}? Tenants will see the new limits immediately.`}
                isDarkMode={isDarkMode}
                isPending={updateLimitsM.isPending}
            />
            <div className="flex items-center gap-3 mb-6">
                <div className={cn("p-2 rounded-xl", isDarkMode ? 'bg-violet-500/10' : 'bg-violet-50')}>
                    <Activity size={16} className="text-violet-500" />
                </div>
                <div>
                    <h3 className={cn("text-sm font-bold", isDarkMode ? 'text-white' : 'text-slate-800')}>Usage Limits</h3>
                    <p className={cn("text-[10px] opacity-40 mt-0.5")}>Set daily &amp; monthly message and AI call limits per tenant</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TenantSelector
                    value={tenantId}
                    onChange={(id, name) => { setTenantId(id); setTenantName(name || ""); }}
                    isDarkMode={isDarkMode}
                    accentColor="violet"
                />
                <div>
                    <label className={cn("text-[9px] font-black uppercase tracking-widest block mb-1.5", isDarkMode ? "text-white/30" : "text-slate-400")}>Max Daily Messages</label>
                    <input type="number" min="0" value={maxDailyMessages} onChange={(e) => setMaxDailyMessages(e.target.value)} placeholder="1000" className={inputCls} />
                </div>
                <div>
                    <label className={cn("text-[9px] font-black uppercase tracking-widest block mb-1.5", isDarkMode ? "text-white/30" : "text-slate-400")}>Max Monthly Messages</label>
                    <input type="number" min="0" value={maxMonthlyMessages} onChange={(e) => setMaxMonthlyMessages(e.target.value)} placeholder="30000" className={inputCls} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                    <label className={cn("text-[9px] font-black uppercase tracking-widest block mb-1.5", isDarkMode ? "text-white/30" : "text-slate-400")}>Max Daily AI Calls</label>
                    <input type="number" min="0" value={maxDailyAiCalls} onChange={(e) => setMaxDailyAiCalls(e.target.value)} placeholder="500" className={inputCls} />
                </div>
                <div>
                    <label className={cn("text-[9px] font-black uppercase tracking-widest block mb-1.5", isDarkMode ? "text-white/30" : "text-slate-400")}>Max Monthly AI Calls</label>
                    <input type="number" min="0" value={maxMonthlyAiCalls} onChange={(e) => setMaxMonthlyAiCalls(e.target.value)} placeholder="15000" className={inputCls} />
                </div>
                <div>
                    <label className={cn("text-[9px] font-black uppercase tracking-widest block mb-1.5", isDarkMode ? "text-white/30" : "text-slate-400")}>Reason (optional)</label>
                    <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Upgrade plan, promotional..." className={inputCls} />
                </div>
            </div>

            <TenantOverviewCard tenantId={tenantId} isDarkMode={isDarkMode} />

            {tenantId && ov && (
                <div className={cn("mt-4 p-3 rounded-xl border", isDarkMode ? "bg-violet-500/5 border-violet-500/10" : "bg-violet-50 border-violet-200")}>
                    <p className={cn("text-[10px] font-bold uppercase tracking-widest mb-2", isDarkMode ? "text-violet-400" : "text-violet-600")}>Current Limits</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { label: "Daily Msgs", val: ov.max_daily_messages },
                            { label: "Monthly Msgs", val: ov.max_monthly_messages },
                            { label: "Daily AI", val: ov.max_daily_ai_calls },
                            { label: "Monthly AI", val: ov.max_monthly_ai_calls },
                        ].map((item) => (
                            <div key={item.label} className={cn("text-center p-2 rounded-lg", isDarkMode ? "bg-white/5" : "bg-white")}>
                                <p className={cn("text-[9px] font-bold uppercase opacity-40")}>{item.label}</p>
                                <p className={cn("text-sm font-black", isDarkMode ? "text-white" : "text-slate-900")}>{item.val ?? "∞"}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <button
                onClick={handleUpdate}
                disabled={updateLimitsM.isPending}
                className="mt-4 flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-violet-600 to-purple-600 text-white transition-all hover:shadow-lg hover:shadow-violet-500/20 disabled:opacity-50"
            >
                {updateLimitsM.isPending ? <Loader2 size={14} className="animate-spin" /> : <Activity size={14} />}
                Update Limits
            </button>
        </div>
    );
};

// ────────────── Invoice Management ──────────────
const InvoiceManagement = ({ isDarkMode }: { isDarkMode: boolean }) => {
    const [invoiceId, setInvoiceId] = useState("");
    const [closeReason, setCloseReason] = useState("");
    const [confirmClose, setConfirmClose] = useState(false);
    const invoiceCloseM = useAdminInvoiceCloseMutation();
    const { data: invoicesRes, isLoading } = useGetInvoicesQuery({ limit: 20 });
    const invoices = invoicesRes?.data?.invoices || invoicesRes?.invoices || [];

    const handleClose = () => {
        const id = parseInt(invoiceId);
        if (isNaN(id)) { toast.error("Please provide a valid Invoice ID"); return; }
        if (!closeReason.trim()) { toast.error("Please provide a reason to cancel the invoice"); return; }
        setConfirmClose(true);
    };

    const executeClose = () => {
        const id = parseInt(invoiceId);
        invoiceCloseM.mutate({ invoice_id: id, reason: closeReason.trim() }, {
            onSuccess: (res: any) => {
                const d = res?.data;
                toast.success(`Invoice ${d?.invoice_number || `#${id}`} cancelled successfully`);
                setInvoiceId(""); setCloseReason(""); setConfirmClose(false);
            },
            onError: (err: any) => { toast.error(err?.response?.data?.message || "Failed to close invoice"); setConfirmClose(false); },
        });
    };

    const statusColor = (s: string) => {
        switch (s) {
            case 'paid': return isDarkMode ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'unpaid': return isDarkMode ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-amber-600 bg-amber-50 border-amber-200';
            case 'overdue': return isDarkMode ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-red-600 bg-red-50 border-red-200';
            default: return isDarkMode ? 'text-white/30 bg-white/5 border-white/10' : 'text-slate-500 bg-slate-50 border-slate-200';
        }
    };

    return (
        <div className="space-y-6">
            <ConfirmDialog
                open={confirmClose}
                onConfirm={executeClose}
                onCancel={() => setConfirmClose(false)}
                title="Cancel Invoice"
                message={`Permanently cancel invoice #${invoiceId}? This sets the status to cancelled and cannot be reversed.`}
                isDarkMode={isDarkMode}
                isPending={invoiceCloseM.isPending}
                variant="danger"
            />

            {/* Close/Cancel Invoice */}
            <div className={cn("p-6 rounded-[24px] border", isDarkMode ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-200")}>
                <div className="flex items-center gap-3 mb-6">
                    <div className={cn("p-2 rounded-xl", isDarkMode ? 'bg-red-500/10' : 'bg-red-50')}>
                        <XCircle size={16} className="text-red-500" />
                    </div>
                    <div>
                        <h3 className={cn("text-sm font-bold", isDarkMode ? 'text-white' : 'text-slate-800')}>Cancel/Close Invoice</h3>
                        <p className={cn("text-[10px] opacity-40 mt-0.5")}>Administratively cancel an unpaid or overdue invoice</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={cn("text-[9px] font-black uppercase tracking-widest block mb-1.5", isDarkMode ? "text-white/30" : "text-slate-400")}>Invoice ID</label>
                        <input
                            type="number"
                            min="1"
                            value={invoiceId}
                            onChange={(e) => setInvoiceId(e.target.value)}
                            placeholder="Invoice ID (number)"
                            className={cn("w-full px-4 py-2.5 rounded-xl text-sm font-bold border outline-none transition-all", isDarkMode ? "bg-white/5 border-white/10 text-white focus:border-red-500/50 placeholder:text-white/20" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-red-500 placeholder:text-slate-400")}
                        />
                    </div>
                    <div>
                        <label className={cn("text-[9px] font-black uppercase tracking-widest block mb-1.5", isDarkMode ? "text-white/30" : "text-slate-400")}>Reason</label>
                        <input
                            value={closeReason}
                            onChange={(e) => setCloseReason(e.target.value)}
                            placeholder="Reason for cancellation..."
                            className={cn("w-full px-4 py-2.5 rounded-xl text-sm font-bold border outline-none transition-all", isDarkMode ? "bg-white/5 border-white/10 text-white focus:border-red-500/50 placeholder:text-white/20" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-red-500 placeholder:text-slate-400")}
                        />
                    </div>
                </div>
                <button
                    onClick={handleClose}
                    disabled={invoiceCloseM.isPending}
                    className="mt-4 flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-red-600 to-rose-600 text-white transition-all hover:shadow-lg hover:shadow-red-500/20 disabled:opacity-50"
                >
                    {invoiceCloseM.isPending ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                    Cancel Invoice
                </button>
            </div>

            {/* Recent Invoices Overview */}
            <div className={cn("p-6 rounded-[24px] border", isDarkMode ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-200")}>
                <div className="flex items-center gap-3 mb-4">
                    <div className={cn("p-2 rounded-xl", isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50')}>
                        <FileText size={16} className="text-blue-500" />
                    </div>
                    <h3 className={cn("text-sm font-bold", isDarkMode ? 'text-white' : 'text-slate-800')}>Recent Invoices</h3>
                </div>
                {isLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-blue-500 opacity-50" /></div>
                ) : invoices.length === 0 ? (
                    <p className={cn("text-sm opacity-40 text-center py-8")}>No invoices</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className={cn("border-b", isDarkMode ? "border-white/5" : "border-slate-100")}>
                                    {['ID', 'Invoice #', 'Tenant', 'Amount', 'Status', 'Due Date'].map(h => (
                                        <th key={h} className={cn("px-4 py-2.5 text-left text-[9px] font-black uppercase tracking-widest", isDarkMode ? "text-white/20" : "text-slate-400")}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv: any) => (
                                    <tr key={inv.id} className={cn("border-b", isDarkMode ? "border-white/[0.03]" : "border-slate-50")}>
                                        <td className="px-4 py-3"><span className={cn("text-xs font-mono", isDarkMode ? 'text-white/40' : 'text-slate-400')}>{inv.id}</span></td>
                                        <td className="px-4 py-3"><span className={cn("text-sm font-bold", isDarkMode ? 'text-white/80' : 'text-slate-800')}>{inv.invoice_number}</span></td>
                                        <td className="px-4 py-3"><span className={cn("text-xs font-mono", isDarkMode ? 'text-white/40' : 'text-slate-500')}>{inv.tenant_id}</span></td>
                                        <td className="px-4 py-3"><span className={cn("text-sm font-black tabular-nums", isDarkMode ? 'text-white' : 'text-slate-900')}>₹{parseFloat(inv.amount || 0).toFixed(2)}</span></td>
                                        <td className="px-4 py-3">
                                            <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border", statusColor(inv.status))}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3"><span className={cn("text-xs", isDarkMode ? 'text-white/40' : 'text-slate-500')}>{inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-IN') : '—'}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

// ────────────── Audit Log ──────────────
const AuditLog = ({ isDarkMode }: { isDarkMode: boolean }) => {
    const [tenantFilter, setTenantFilter] = useState("");
    const [page, setPage] = useState(1);

    const { data: response, isLoading } = useAdminGetAuditLogQuery({
        tenant_id: tenantFilter || undefined,
        page,
        limit: 20,
    });
    const logs = response?.logs || [];
    const totalPages = response?.pagination?.totalPages || 1;

    const exportCsv = useCallback(() => {
        if (!logs.length) return;
        const headers = ["Timestamp", "Admin Name", "Admin ID", "Action", "Tenant Name", "Tenant ID", "Reason", "Before", "After"];
        const rows = logs.map((log: any) => [
            new Date(log.createdAt || log.timestamp).toISOString(),
            log.admin_name || "",
            log.admin_id || log.performed_by || "",
            log.action_type || log.action || "",
            log.tenant_name || "",
            log.tenant_id || "",
            (log.reason || "").replace(/,/g, ";"),
            log.before_state ? JSON.stringify(log.before_state).replace(/,/g, ";") : "",
            log.after_state ? JSON.stringify(log.after_state).replace(/,/g, ";") : "",
        ]);
        const csv = [headers.join(","), ...rows.map((r: string[]) => r.join(","))].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `audit-log-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }, [logs]);

    const actionColor = (action: string) => {
        if (action?.includes('unlock') || action?.includes('restore')) return isDarkMode ? 'text-amber-400' : 'text-amber-600';
        if (action?.includes('credit') || action?.includes('payment')) return isDarkMode ? 'text-emerald-400' : 'text-emerald-600';
        if (action?.includes('cancel') || action?.includes('close')) return isDarkMode ? 'text-red-400' : 'text-red-600';
        if (action?.includes('mode') || action?.includes('change')) return isDarkMode ? 'text-blue-400' : 'text-blue-600';
        return isDarkMode ? 'text-white/60' : 'text-slate-600';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <h3 className={cn("text-sm font-bold", isDarkMode ? 'text-white' : 'text-slate-800')}>Admin Audit Log</h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={exportCsv}
                        disabled={!logs.length}
                        className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all disabled:opacity-30", isDarkMode ? "border-white/10 text-white/50 hover:text-white hover:border-white/20" : "border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300")}
                    >
                        <Download size={12} /> Export CSV
                    </button>
                    <div className={cn("flex items-center gap-2 px-3 py-2 rounded-xl border", isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200")}>
                        <Search size={14} className="opacity-40" />
                        <input
                            type="text"
                            placeholder="Filter by tenant ID..."
                            value={tenantFilter}
                            onChange={(e) => { setTenantFilter(e.target.value); setPage(1); }}
                            className={cn("bg-transparent text-sm outline-none w-40", isDarkMode ? "text-white placeholder:text-white/30" : "text-slate-900 placeholder:text-slate-400")}
                        />
                    </div>
                </div>
            </div>

            <div className={cn("rounded-[24px] border overflow-hidden", isDarkMode ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-200")}>
                {isLoading ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>
                ) : logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2 opacity-30">
                        <ScrollText size={32} />
                        <p className="text-xs">No audit logs found</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className={cn("border-b", isDarkMode ? "border-white/5" : "border-slate-100")}>
                                        {['Timestamp', 'Admin', 'Action', 'Tenant', 'Details', 'Before/After'].map(h => (
                                            <th key={h} className={cn("px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest", isDarkMode ? "text-white/20" : "text-slate-400")}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log: any, i: number) => (
                                        <tr key={log.id || i} className={cn("border-b", isDarkMode ? "border-white/[0.03] hover:bg-white/[0.02]" : "border-slate-50 hover:bg-slate-50/50")}>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className={cn("text-xs font-bold", isDarkMode ? 'text-white/70' : 'text-slate-800')}>
                                                        {new Date(log.createdAt || log.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                                    </p>
                                                    <p className="text-[10px] opacity-40">
                                                        {new Date(log.createdAt || log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={cn("text-xs font-bold block", isDarkMode ? 'text-white/80' : 'text-slate-700')}>{log.admin_name || log.admin_id || log.performed_by || '—'}</span>
                                            </td>
                                            <td className="px-4 py-3"><span className={cn("text-xs font-bold", actionColor(log.action_type || log.action))}>{log.action_type || log.action || '—'}</span></td>
                                            <td className="px-4 py-3">
                                                <span className={cn("text-xs font-bold block", isDarkMode ? 'text-white/80' : 'text-slate-700')}>{log.tenant_name || log.tenant_id || '—'}</span>
                                            </td>
                                            <td className="px-4 py-3"><span className={cn("text-xs opacity-60 max-w-[200px] truncate block")}>{log.reason || log.details || '—'}</span></td>
                                            <td className="px-4 py-3">
                                                {(log.before_state || log.after_state) ? (
                                                    <div className="text-[10px] space-y-0.5">
                                                        {log.before_state && <p className="opacity-40">Before: {typeof log.before_state === 'string' ? log.before_state : JSON.stringify(log.before_state)}</p>}
                                                        {log.after_state && <p className="opacity-60">After: {typeof log.after_state === 'string' ? log.after_state : JSON.stringify(log.after_state)}</p>}
                                                    </div>
                                                ) : <span className="text-[10px] opacity-20">—</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {totalPages > 1 && (
                            <div className={cn("flex items-center justify-between px-4 py-3 border-t", isDarkMode ? "border-white/5" : "border-slate-100")}>
                                <span className="text-[10px] opacity-40">Page {page} of {totalPages}</span>
                                <div className="flex gap-1">
                                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className={cn("p-1.5 rounded-lg disabled:opacity-20", isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-100")}><ChevronLeft size={14} /></button>
                                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className={cn("p-1.5 rounded-lg disabled:opacity-20", isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-100")}><ChevronRight size={14} /></button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// ────────────── System Health Dashboard ──────────────
const SystemHealthDashboard = ({ isDarkMode }: { isDarkMode: boolean }) => {
    const { data: response, isLoading } = useAdminGetHealthSummaryQuery();
    const { data: unresolvedRes } = useAdminGetUnresolvedEventsQuery();
    const resolveM = useAdminResolveHealthEventMutation();
    const health = response || {};
    const events = health.events || {};
    const totalUnresolved = health.total_unresolved || 0;
    const unresolvedEvents = unresolvedRes?.events || [];

    const eventTypes = Object.entries(events).map(([type, count]) => ({ type, count: count as number }));
    const totalEvents = eventTypes.reduce((s, e) => s + e.count, 0);

    const typeColor = (type: string) => {
        if (type.includes('error') || type.includes('fail')) return { bg: isDarkMode ? 'bg-red-500/10' : 'bg-red-50', text: isDarkMode ? 'text-red-400' : 'text-red-600', border: isDarkMode ? 'border-red-500/20' : 'border-red-200' };
        if (type.includes('warn')) return { bg: isDarkMode ? 'bg-amber-500/10' : 'bg-amber-50', text: isDarkMode ? 'text-amber-400' : 'text-amber-600', border: isDarkMode ? 'border-amber-500/20' : 'border-amber-200' };
        return { bg: isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50', text: isDarkMode ? 'text-blue-400' : 'text-blue-600', border: isDarkMode ? 'border-blue-500/20' : 'border-blue-200' };
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={cn("p-5 rounded-[20px] border", isDarkMode ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-200")}>
                    <div className="flex items-center gap-2 mb-3">
                        <Activity size={14} className="text-emerald-500" />
                        <span className={cn("text-[9px] font-black uppercase tracking-widest", isDarkMode ? "text-white/30" : "text-slate-400")}>Status</span>
                    </div>
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                    ) : (
                        <div className={cn("text-2xl font-black", totalUnresolved > 0 ? (isDarkMode ? 'text-amber-400' : 'text-amber-600') : (isDarkMode ? 'text-emerald-400' : 'text-emerald-600'))}>
                            {totalUnresolved > 0 ? 'Needs Attention' : 'Healthy'}
                        </div>
                    )}
                </div>

                <div className={cn("p-5 rounded-[20px] border", isDarkMode ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-200")}>
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle size={14} className="text-amber-500" />
                        <span className={cn("text-[9px] font-black uppercase tracking-widest", isDarkMode ? "text-white/30" : "text-slate-400")}>Events (24h)</span>
                    </div>
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                    ) : (
                        <div className={cn("text-2xl font-black tabular-nums", isDarkMode ? 'text-white' : 'text-slate-900')}>{totalEvents}</div>
                    )}
                </div>

                <div className={cn("p-5 rounded-[20px] border", isDarkMode ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-200")}>
                    <div className="flex items-center gap-2 mb-3">
                        <XCircle size={14} className="text-red-500" />
                        <span className={cn("text-[9px] font-black uppercase tracking-widest", isDarkMode ? "text-white/30" : "text-slate-400")}>Unresolved</span>
                    </div>
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                    ) : (
                        <div className={cn("text-2xl font-black tabular-nums", totalUnresolved > 0 ? 'text-red-500' : (isDarkMode ? 'text-white' : 'text-slate-900'))}>{totalUnresolved}</div>
                    )}
                </div>
            </div>

            {/* Event Breakdown */}
            <div className={cn("p-6 rounded-[24px] border", isDarkMode ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-200")}>
                <h3 className={cn("text-sm font-bold mb-4", isDarkMode ? 'text-white' : 'text-slate-800')}>Event Breakdown (Last 24h)</h3>
                {isLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>
                ) : eventTypes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2 opacity-30">
                        <CheckCircle size={32} />
                        <p className="text-xs">No events in the last 24 hours</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {eventTypes.sort((a, b) => b.count - a.count).map(({ type, count }) => {
                            const colors = typeColor(type);
                            const pct = totalEvents > 0 ? (count / totalEvents) * 100 : 0;
                            return (
                                <div key={type} className={cn("flex items-center gap-4 p-3 rounded-xl border", colors.bg, colors.border)}>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={cn("text-xs font-bold", colors.text)}>{type}</span>
                                            <span className={cn("text-sm font-black tabular-nums", colors.text)}>{count}</span>
                                        </div>
                                        <div className={cn("h-1 w-full rounded-full overflow-hidden", isDarkMode ? 'bg-white/5' : 'bg-white')}>
                                            <div className={cn("h-full rounded-full transition-all duration-1000", colors.text.includes('red') ? 'bg-red-500' : colors.text.includes('amber') ? 'bg-amber-500' : 'bg-blue-500')} style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Unresolved Events */}
            {unresolvedEvents.length > 0 && (
                <div className={cn("p-6 rounded-[24px] border", isDarkMode ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-200")}>
                    <h3 className={cn("text-sm font-bold mb-4", isDarkMode ? 'text-white' : 'text-slate-800')}>Unresolved Events</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className={cn("border-b", isDarkMode ? "border-white/5" : "border-slate-100")}>
                                    {['ID', 'Type', 'Tenant', 'Message', 'Time', ''].map(h => (
                                        <th key={h} className={cn("px-4 py-2.5 text-left text-[9px] font-black uppercase tracking-widest", isDarkMode ? "text-white/20" : "text-slate-400")}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {unresolvedEvents.slice(0, 20).map((ev: any) => {
                                    const colors = typeColor(ev.event_type);
                                    return (
                                        <tr key={ev.id} className={cn("border-b", isDarkMode ? "border-white/[0.03]" : "border-slate-50")}>
                                            <td className="px-4 py-3"><span className="text-xs font-mono opacity-40">{ev.id}</span></td>
                                            <td className="px-4 py-3"><span className={cn("text-xs font-bold", colors.text)}>{ev.event_type}</span></td>
                                            <td className="px-4 py-3"><span className="text-xs font-mono opacity-40">{ev.tenant_id || 'system'}</span></td>
                                            <td className="px-4 py-3"><span className="text-xs opacity-50 max-w-[250px] truncate block">{ev.error_message || '—'}</span></td>
                                            <td className="px-4 py-3"><span className="text-[10px] opacity-40">{new Date(ev.createdAt || ev.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => resolveM.mutate(ev.id, { onSuccess: () => toast.success(`Event #${ev.id} resolved`) })}
                                                    disabled={resolveM.isPending}
                                                    className={cn("px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all", isDarkMode ? "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10" : "border-emerald-200 text-emerald-600 hover:bg-emerald-50")}
                                                >
                                                    Resolve
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

// ────────────── Main Super Admin View ──────────────
export const SuperAdminBillingView = () => {
    const { isDarkMode } = useTheme();
    const { token, user } = useAuth();
    const router = useRouter();
    const dispatch = useDispatch();

    // Synchronously validate the JWT token is a management token.
    // This runs before any child components mount, preventing 403 queries from firing.
    const tokenIsManagement = useMemo(() => {
        if (!token) return false;
        try {
            const decoded: any = jwtDecode(token);
            return decoded.user_type === "management";
        } catch {
            return false;
        }
    }, [token]);

    const handleRelogin = () => {
        dispatch(clearAuthData());
        router.replace("/management/login");
    };

    // If token is not a management token, show re-login screen immediately
    // (before any sub-components mount and fire 403 API calls)
    if (!token || !tokenIsManagement || !user || user?.user_type !== "management") {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                    <Shield size={32} className="mx-auto opacity-20" />
                    <p className={cn("text-sm font-bold", isDarkMode ? "text-white/40" : "text-slate-400")}>
                        {!token ? "Not logged in" : "Session mismatch — management token required"}
                    </p>
                    <p className="text-xs opacity-30">Your current session does not have Super Admin privileges.</p>
                    <button
                        onClick={handleRelogin}
                        className="mt-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                    >
                        Re-login as Super Admin
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto no-scrollbar p-8 pb-32 space-y-8">
            <div className="flex items-center gap-3">
                <div className={cn("p-2.5 rounded-xl", isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50')}>
                    <Shield size={20} className="text-emerald-500" />
                </div>
                <div>
                    <h1 className={cn("text-xl font-black tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>
                        Billing Administration
                    </h1>
                    <p className={cn("text-xs opacity-40 mt-0.5")}>Manage tenant billing, invoices, and system health</p>
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                    href="/pricing"
                    className={cn(
                        "group flex items-center gap-4 p-5 rounded-[20px] border transition-all duration-300",
                        isDarkMode
                            ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/15"
                            : "bg-white border-slate-200 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5"
                    )}
                >
                    <div className={cn("p-2.5 rounded-xl", isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50')}>
                        <DollarSign size={18} className="text-emerald-500" />
                    </div>
                    <div className="flex-1">
                        <p className={cn("text-sm font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>Pricing & Rates</p>
                        <p className={cn("text-[10px] opacity-40 mt-0.5")}>Manage Meta WhatsApp message pricing & AI model rates</p>
                    </div>
                    <ExternalLink size={14} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                </a>
                {/* <a
                    href="/billing"
                    className={cn(
                        "group flex items-center gap-4 p-5 rounded-[20px] border transition-all duration-300",
                        isDarkMode
                            ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/15"
                            : "bg-white border-slate-200 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5"
                    )}
                >
                    <div className={cn("p-2.5 rounded-xl", isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50')}>
                        <CreditCard size={18} className="text-blue-500" />
                    </div>
                    <div className="flex-1">
                        <p className={cn("text-sm font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>Tenant Billing View</p>
                        <p className={cn("text-[10px] opacity-40 mt-0.5")}>View billing dashboard as it appears to tenants</p>
                    </div>
                    <ExternalLink size={14} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                </a> */}
            </div>

            <Tabs defaultValue="tenants" className="space-y-6">
                <TabsList isDarkMode={isDarkMode}>
                    <TabsTrigger value="tenants"><div className="flex items-center gap-2"><Users size={12} />Tenant Management</div></TabsTrigger>
                    <TabsTrigger value="credit"><div className="flex items-center gap-2"><Wallet size={12} />Manual Credit</div></TabsTrigger>
                    <TabsTrigger value="invoices"><div className="flex items-center gap-2"><FileText size={12} />Invoice Mgmt</div></TabsTrigger>
                    <TabsTrigger value="audit"><div className="flex items-center gap-2"><ScrollText size={12} />Audit Log</div></TabsTrigger>
                    <TabsTrigger value="limits"><div className="flex items-center gap-2"><Activity size={12} />Usage Limits</div></TabsTrigger>
                    <TabsTrigger value="health"><div className="flex items-center gap-2"><Activity size={12} />System Health</div></TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                    <TabsContent key="tenants" value="tenants" className="outline-none">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                            <TenantBillingManagement isDarkMode={isDarkMode} />
                        </motion.div>
                    </TabsContent>

                    <TabsContent key="credit" value="credit" className="outline-none">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                            <ManualWalletCredit isDarkMode={isDarkMode} />
                        </motion.div>
                    </TabsContent>

                    <TabsContent key="invoices" value="invoices" className="outline-none">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                            <InvoiceManagement isDarkMode={isDarkMode} />
                        </motion.div>
                    </TabsContent>

                    <TabsContent key="audit" value="audit" className="outline-none">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                            <AuditLog isDarkMode={isDarkMode} />
                        </motion.div>
                    </TabsContent>

                    <TabsContent key="limits" value="limits" className="outline-none">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                            <UsageLimitsManagement isDarkMode={isDarkMode} />
                        </motion.div>
                    </TabsContent>

                    <TabsContent key="health" value="health" className="outline-none">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                            <SystemHealthDashboard isDarkMode={isDarkMode} />
                        </motion.div>
                    </TabsContent>
                </AnimatePresence>
            </Tabs>
        </div>
    );
};
