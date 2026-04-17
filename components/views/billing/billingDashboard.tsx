"use client";

import { cn } from "@/lib/utils";
import {
    Wallet, TrendingUp, Megaphone, Zap, ShieldCheck, Send,
    MessageCircle, CheckCircle, AlertTriangle, CreditCard,
    Calendar, ArrowUpRight, ArrowDownRight, Loader2, Clock,
    BarChart3, FileText, Gauge
} from "lucide-react";
import {
    useGetBillingKpiQuery,
    useGetBillingModeQuery,
    useGetWalletBalanceQuery,
    useGetWalletStatusQuery,
    useGetInvoicesQuery,
    useGetBillingSpendChartQuery,
    useGetGstBreakdownQuery
} from "@/hooks/useBillingQuery";
import { PulseMetric } from "@/components/ui/pulseMetric";

interface BillingDashboardProps {
    isDarkMode: boolean;
    startDate?: Date | null;
    endDate?: Date | null;
    onNavigate?: (tab: string) => void;
}

export const BillingDashboard = ({ isDarkMode, startDate, endDate, onNavigate }: BillingDashboardProps) => {
    const { data: kpiRes, isLoading: kpiLoading } = useGetBillingKpiQuery(
        startDate?.toISOString(),
        endDate?.toISOString()
    );
    const { data: modeRes } = useGetBillingModeQuery();
    const { data: walletRes, isLoading: walletLoading } = useGetWalletBalanceQuery();
    const { data: statusRes } = useGetWalletStatusQuery();
    const { data: invoicesRes } = useGetInvoicesQuery({ status: 'overdue', limit: 3 });
    const { data: gstRes } = useGetGstBreakdownQuery();
    const { data: spendChartRes } = useGetBillingSpendChartQuery(
        startDate?.toISOString(),
        endDate?.toISOString()
    );

    const kpi = kpiRes?.data || {
        totalSpentEstimated: 0, marketingSpent: 0, utilitySpent: 0, authSpent: 0,
        totalMessagesSent: 0, billableConversations: 0, freeConversations: 0, walletBalance: 0, currency: 'INR'
    };
    const billingMode = modeRes?.data?.billing_mode || 'prepaid';
    const modeData = modeRes?.data;
    const isPrepaid = billingMode === 'prepaid';
    const postpaid = modeData?.postpaid || null;
    const cycleStart = modeData?.billing_cycle_start;
    const cycleEnd = modeData?.billing_cycle_end;
    const creditLimit = postpaid?.credit_limit || 0;
    const currentUsage = postpaid?.current_usage || 0;
    const daysRemaining = cycleEnd
        ? Math.max(0, Math.ceil((new Date(cycleEnd).getTime() - Date.now()) / 86400000))
        : null;
    const balance = walletRes?.data?.balance || 0;
    const walletStatus = statusRes?.data?.status || walletRes?.data?.balanceStatus || 'healthy';
    const currency = kpi.currency || 'INR';
    const sym = currency === 'INR' ? '₹' : currency;
    const overdueInvoices = invoicesRes?.data?.invoices || [];
    const spendData = spendChartRes?.data || [];
    const gstData = gstRes;
    const gstSummary = gstData?.gst;
    const tenantState = gstData?.tenant_state || '';
    const companyState = gstData?.company_state || 'TN';
    const tenantGstin = gstData?.tenant_gstin || '';
    const currentGstRate = Number(gstSummary?.current_rate ?? gstSummary?.gst_rate ?? 18);
    const summaryRate = gstSummary?.gst_rate != null ? Number(gstSummary.gst_rate) : null;
    const gstRateLabel = gstSummary?.has_mixed_rates
        ? 'Mixed recent rates'
        : summaryRate != null
            ? `${summaryRate.toFixed(2)}% recent`
            : `${currentGstRate.toFixed(2)}% current`;
    const taxModeLabel = !tenantState
        ? 'State missing'
        : gstSummary?.is_intra_state
            ? 'CGST + SGST'
            : 'IGST';

    // Calculate recent spend trend
    const recentSpend = spendData.slice(-7);
    const prevSpend = spendData.slice(-14, -7);
    const recentTotal = recentSpend.reduce((s: number, d: any) => s + (d.total || 0), 0);
    const prevTotal = prevSpend.reduce((s: number, d: any) => s + (d.total || 0), 0);
    const trendPercent = prevTotal > 0 ? Math.round(((recentTotal - prevTotal) / prevTotal) * 100) : 0;

    const kpis = [
        ...(isPrepaid
            ? [{ label: 'Wallet Balance', value: `${sym}${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, trend: '—', color: walletStatus === 'zero' ? 'red' : walletStatus === 'low' ? 'amber' : 'emerald', icon: Wallet }]
            : [{ label: 'Credit Usage', value: `${sym}${(currentUsage || 0).toFixed(2)} / ${sym}${creditLimit.toLocaleString()}`, trend: creditLimit > 0 ? `${Math.round((currentUsage / creditLimit) * 100)}%` : '—', color: creditLimit > 0 && (currentUsage / creditLimit) > 0.9 ? 'red' : creditLimit > 0 && (currentUsage / creditLimit) > 0.7 ? 'amber' : 'emerald', icon: Gauge }]
        ),
        { label: 'Total Spend', value: `${sym}${kpi.totalSpentEstimated.toFixed(2)}`, trend: trendPercent !== 0 ? `${trendPercent > 0 ? '+' : ''}${trendPercent}%` : '—', color: 'blue', icon: TrendingUp },
        { label: 'Marketing', value: `${sym}${kpi.marketingSpent.toFixed(2)}`, trend: '—', color: 'purple', icon: Megaphone },
        { label: 'Utility', value: `${sym}${kpi.utilitySpent.toFixed(2)}`, trend: '—', color: 'orange', icon: Zap },
        { label: 'Authentication', value: `${sym}${kpi.authSpent.toFixed(2)}`, trend: '—', color: 'rose', icon: ShieldCheck },
        { label: 'Messages Sent', value: kpi.totalMessagesSent.toLocaleString(), trend: '—', color: 'blue', icon: Send },
        { label: 'Free Convos', value: (kpi.freeConversations || 0).toLocaleString(), trend: '—', color: 'emerald', icon: MessageCircle },
    ];

    if (kpiLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Billing Mode & Cycle Status */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Billing Mode Card */}
                <div className={cn(
                    "relative group p-6 rounded-[24px] border transition-all duration-500 overflow-hidden",
                    isDarkMode
                        ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
                        : "bg-slate-50 border-slate-200 hover:bg-white hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5"
                )}>
                    <div className="absolute -bottom-16 -right-16 w-60 h-60 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <p className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isDarkMode ? 'text-white/30' : 'text-slate-400')}>Billing Mode</p>
                            <span className={cn(
                                "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                isPrepaid
                                    ? isDarkMode ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-600 border-emerald-200"
                                    : isDarkMode ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-blue-50 text-blue-600 border-blue-200"
                            )}>
                                {billingMode}
                            </span>
                        </div>
                        <div className={cn("text-3xl font-black tracking-tight mb-1", isDarkMode ? 'text-white' : 'text-slate-900')}>
                            {isPrepaid ? 'Pre-paid' : 'Post-paid'}
                        </div>
                        <p className={cn("text-xs opacity-50 mb-4", isDarkMode ? 'text-white' : 'text-slate-600')}>
                            {isPrepaid
                                ? 'Deducted from wallet per message/AI call'
                                : 'Usage billed at end of billing cycle'}
                        </p>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping opacity-75" />
                            </div>
                            <span className={cn("text-[9px] font-black uppercase tracking-wider", isDarkMode ? "text-emerald-400" : "text-emerald-600")}>
                                All systems operational
                            </span>
                        </div>
                    </div>
                </div>

                {/* Wallet Quick View */}
                <div className={cn(
                    "relative group p-6 rounded-[24px] border transition-all duration-500 overflow-hidden cursor-pointer",
                    isDarkMode
                        ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
                        : "bg-slate-50 border-slate-200 hover:bg-white hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5"
                )} onClick={() => onNavigate?.('wallet')}>
                    <div className="absolute -top-16 -left-16 w-60 h-60 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <p className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isDarkMode ? 'text-white/30' : 'text-slate-400')}>Wallet Balance</p>
                            <div className={cn(
                                "p-2 rounded-xl border",
                                isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100'
                            )}>
                                <Wallet size={14} className="text-emerald-500" />
                            </div>
                        </div>
                        <div className={cn("text-3xl font-black tracking-tight mb-1", isDarkMode ? 'text-white' : 'text-slate-900')}>
                            {walletLoading ? <Loader2 className="w-6 h-6 animate-spin text-emerald-500" /> : `${sym}${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={cn(
                                "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border",
                                walletStatus === 'zero'
                                    ? isDarkMode ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-red-50 text-red-600 border-red-200"
                                    : walletStatus === 'low'
                                        ? isDarkMode ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-amber-50 text-amber-600 border-amber-200"
                                        : isDarkMode ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-600 border-emerald-200"
                            )}>
                                {walletStatus === 'zero' ? 'Zero' : walletStatus === 'low' ? 'Low' : 'Healthy'}
                            </span>
                            <ArrowUpRight size={12} className={cn("opacity-40", isDarkMode ? 'text-white' : 'text-slate-600')} />
                            <span className={cn("text-[9px] opacity-40")}>View wallet</span>
                        </div>
                    </div>
                </div>

                {/* Cycle / Credit Card */}
                <div className={cn(
                    "relative group p-6 rounded-[24px] border transition-all duration-500 overflow-hidden",
                    isDarkMode
                        ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
                        : "bg-slate-50 border-slate-200 hover:bg-white hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5"
                )}>
                    <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-purple-500/5 blur-[80px] rounded-full pointer-events-none" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <p className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isDarkMode ? 'text-white/30' : 'text-slate-400')}>
                                {isPrepaid ? 'Account Status' : 'Billing Cycle'}
                            </p>
                            <div className={cn(
                                "p-2 rounded-xl border",
                                isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100'
                            )}>
                                {isPrepaid ? <CheckCircle size={14} className="text-emerald-500" /> : <Calendar size={14} className="text-purple-500" />}
                            </div>
                        </div>
                        {isPrepaid ? (
                            <>
                                <div className={cn("text-3xl font-black tracking-tight mb-1", isDarkMode ? 'text-white' : 'text-slate-900')}>Active</div>
                                <p className={cn("text-xs opacity-50")}>Real-time deduction per usage</p>
                                <div className={cn("mt-4 pt-4 border-t flex justify-between", isDarkMode ? 'border-white/5' : 'border-slate-100')}>
                                    <div>
                                        <p className={cn("text-[8px] font-bold uppercase tracking-wider opacity-40")}>Billable Convos</p>
                                        <p className={cn("text-sm font-black", isDarkMode ? "text-white/80" : "text-slate-900")}>{kpi.billableConversations.toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={cn("text-[8px] font-bold uppercase tracking-wider opacity-40")}>Avg Cost</p>
                                        <p className={cn("text-sm font-black", isDarkMode ? "text-white/80" : "text-slate-900")}>
                                            {sym}{kpi.billableConversations > 0 ? (kpi.totalSpentEstimated / kpi.billableConversations).toFixed(4) : "0.00"}
                                        </p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className={cn("text-3xl font-black tracking-tight mb-1", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                    {daysRemaining != null ? `${daysRemaining}d left` : 'Active'}
                                </div>
                                <p className={cn("text-xs opacity-50")}>
                                    {cycleStart && cycleEnd
                                        ? `${new Date(cycleStart).toLocaleDateString()} — ${new Date(cycleEnd).toLocaleDateString()}`
                                        : 'Current billing cycle'}
                                </p>
                                {creditLimit > 0 && (
                                    <div className={cn("mt-4 pt-4 border-t", isDarkMode ? 'border-white/5' : 'border-slate-100')}>
                                        <div className="flex justify-between mb-2">
                                            <span className={cn("text-[8px] font-bold uppercase tracking-wider opacity-40")}>Credit Usage</span>
                                            <span className={cn("text-[9px] font-black", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                                {sym}{(currentUsage || 0).toFixed(0)} / {sym}{creditLimit.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className={cn("h-1.5 w-full rounded-full overflow-hidden", isDarkMode ? 'bg-white/5' : 'bg-slate-100')}>
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-1000",
                                                    (currentUsage / creditLimit) > 0.9
                                                        ? "bg-red-500" : (currentUsage / creditLimit) > 0.7
                                                            ? "bg-amber-500" : "bg-emerald-500"
                                                )}
                                                style={{ width: `${Math.min((currentUsage / creditLimit) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className={cn(
                    "relative group p-6 rounded-[24px] border transition-all duration-500 overflow-hidden",
                    isDarkMode
                        ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
                        : "bg-slate-50 border-slate-200 hover:bg-white hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5"
                )}>
                    <div className="absolute -top-16 -right-16 w-60 h-60 bg-amber-500/5 blur-[80px] rounded-full pointer-events-none" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <p className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isDarkMode ? 'text-white/30' : 'text-slate-400')}>
                                GST Profile
                            </p>
                            <div className={cn(
                                "p-2 rounded-xl border",
                                isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100'
                            )}>
                                <FileText size={14} className="text-amber-500" />
                            </div>
                        </div>
                        <div className={cn("text-3xl font-black tracking-tight mb-1", isDarkMode ? 'text-white' : 'text-slate-900')}>
                            {taxModeLabel}
                        </div>
                        <p className={cn("text-xs opacity-50 mb-4", isDarkMode ? 'text-white' : 'text-slate-600')}>
                            {tenantState
                                ? `${tenantState} vs ${companyState} determines recharge tax split`
                                : 'Set tenant state to classify GST correctly'}
                        </p>
                        <div className={cn("space-y-2 pt-4 border-t", isDarkMode ? 'border-white/5' : 'border-slate-100')}>
                            <div className="flex items-center justify-between gap-3">
                                <span className={cn("text-[8px] font-bold uppercase tracking-wider opacity-40")}>Recent GST</span>
                                <span className={cn("text-sm font-black", isDarkMode ? 'text-white/80' : 'text-slate-900')}>
                                    {sym}{Number(gstSummary?.gst_amount || 0).toFixed(2)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span className={cn("text-[8px] font-bold uppercase tracking-wider opacity-40")}>Rate</span>
                                <span className={cn("text-[11px] font-bold text-right", isDarkMode ? 'text-white/80' : 'text-slate-900')}>
                                    {gstRateLabel}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span className={cn("text-[8px] font-bold uppercase tracking-wider opacity-40")}>GSTIN</span>
                                <span className={cn("text-[11px] font-bold text-right", tenantGstin ? (isDarkMode ? 'text-white/80' : 'text-slate-900') : (isDarkMode ? 'text-amber-400' : 'text-amber-700'))}>
                                    {tenantGstin || 'Not configured'}
                                </span>
                            </div>
                            {gstData?.breakdown && (
                                <p className={cn("text-[10px] leading-relaxed", isDarkMode ? 'text-white/45' : 'text-slate-500')}>
                                    {gstData.breakdown}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Overdue Invoice Alert */}
            {overdueInvoices.length > 0 && (
                <div className={cn(
                    "flex items-center gap-4 px-6 py-4 rounded-2xl border",
                    isDarkMode
                        ? "bg-red-900/20 border-red-500/30 text-red-300"
                        : "bg-red-50 border-red-200 text-red-700"
                )}>
                    <AlertTriangle size={20} className="text-red-500 shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-bold">
                            {overdueInvoices.length} overdue invoice{overdueInvoices.length > 1 ? 's' : ''}
                        </p>
                        <p className="text-xs opacity-70">Pay now to avoid service interruptions</p>
                    </div>
                    <button
                        onClick={() => onNavigate?.('invoices')}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                        View Invoices
                    </button>
                </div>
            )}

            {/* KPI Cards Grid */}
            <div>
                <h2 className={cn("text-xs font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2", isDarkMode ? 'text-white/25' : 'text-slate-400')}>
                    <div className="w-4 h-px bg-emerald-500/50" />
                    Spend Summary
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {kpis.map((kpi, i) => (
                        <PulseMetric
                            key={i}
                            label={kpi.label}
                            value={kpi.value}
                            trend={kpi.trend}
                            color={kpi.color}
                            isDarkMode={isDarkMode}
                            icon={kpi.icon}
                        />
                    ))}
                </div>
            </div>

            {/* Quick Links / Navigation Cards */}
            <div>
                <h2 className={cn("text-xs font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2", isDarkMode ? 'text-white/25' : 'text-slate-400')}>
                    <div className="w-4 h-px bg-emerald-500/50" />
                    Quick Access
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Wallet & Recharge', desc: 'Manage balance and auto-recharge', icon: Wallet, tab: 'wallet', color: 'emerald' },
                        { label: 'Usage Analytics', desc: 'Ledger, charts & AI usage', icon: BarChart3, tab: 'usage', color: 'blue' },
                        { label: 'Invoices', desc: 'View and pay invoices', icon: FileText, tab: 'invoices', color: 'purple' },
                        { label: 'Payment History', desc: 'All transaction records', icon: CreditCard, tab: 'payments', color: 'orange' },
                    ].map((item, i) => (
                        <button
                            key={i}
                            onClick={() => onNavigate?.(item.tab)}
                            className={cn(
                                "group text-left p-5 rounded-2xl border transition-all duration-300",
                                isDarkMode
                                    ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/15"
                                    : "bg-white border-slate-200 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5"
                            )}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className={cn(
                                    "p-2 rounded-xl border transition-all",
                                    isDarkMode
                                        ? 'bg-white/5 border-white/10 group-hover:bg-white/10'
                                        : 'bg-slate-50 border-slate-100 group-hover:bg-emerald-50'
                                )}>
                                    <item.icon size={16} className={`text-${item.color}-500`} />
                                </div>
                                <ArrowUpRight size={12} className={cn("ml-auto opacity-0 group-hover:opacity-60 transition-opacity", isDarkMode ? 'text-white' : 'text-slate-600')} />
                            </div>
                            <p className={cn("text-sm font-bold mb-0.5", isDarkMode ? 'text-white' : 'text-slate-900')}>{item.label}</p>
                            <p className={cn("text-[10px] opacity-40")}>{item.desc}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
