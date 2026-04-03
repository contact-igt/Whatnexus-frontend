"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    CreditCard, Download, Calendar, Loader2, CheckCircle,
    XCircle, Clock, ArrowUpRight, FileDown, Search, ChevronLeft, ChevronRight
} from "lucide-react";
import { useGetPaymentHistoryQuery } from "@/hooks/useBillingQuery";
import { toast } from "sonner";

interface BillingPaymentHistoryProps {
    isDarkMode: boolean;
}

export const BillingPaymentHistory = ({ isDarkMode }: BillingPaymentHistoryProps) => {
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const limit = 20;

    const { data: response, isLoading } = useGetPaymentHistoryQuery({ page, limit });
    const payments = response?.data?.payments || [];
    const totalPages = response?.data?.totalPages || 1;

    const filteredPayments = searchTerm
        ? payments.filter((p: any) =>
            (p.razorpay_payment_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.razorpay_order_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.invoice_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.description || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
        : payments;

    const getStatusBadge = (status: string) => {
        const s = (status || 'success').toLowerCase();
        if (s === 'success' || s === 'captured' || s === 'paid') {
            return { label: 'Paid', icon: CheckCircle, bg: isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200' };
        }
        if (s === 'failed' || s === 'refunded') {
            return { label: s === 'refunded' ? 'Refunded' : 'Failed', icon: XCircle, bg: isDarkMode ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-200' };
        }
        return { label: 'Pending', icon: Clock, bg: isDarkMode ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-200' };
    };

    const handleExportAll = () => {
        if (payments.length === 0) {
            toast.info('No payments to export');
            return;
        }
        const headers = ['Date', 'Payment ID', 'Order ID', 'Description', 'Amount (INR)', 'Balance After', 'Status'];
        const csvRows = [headers.join(',')];
        payments.forEach((p: any) => {
            csvRows.push([
                new Date(p.createdAt).toLocaleString('en-IN'),
                p.razorpay_payment_id || 'N/A',
                p.razorpay_order_id || 'N/A',
                `"${p.description || 'Wallet Recharge'}"`,
                parseFloat(p.amount).toFixed(2),
                parseFloat(p.balance_after || 0).toFixed(2),
                p.status || 'success'
            ].join(','));
        });
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Payment-History-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(`Exported ${payments.length} payments`);
    };

    const handleDownloadReceipt = (payment: any) => {
        const content = `
=====================================
         WHATNEXUS PAYMENT RECEIPT
=====================================

Receipt #: ${payment.invoice_number || `REC-${payment.id}`}
Date: ${new Date(payment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
Time: ${new Date(payment.createdAt).toLocaleTimeString('en-IN')}

-------------------------------------
TRANSACTION DETAILS
-------------------------------------
Razorpay Payment ID: ${payment.razorpay_payment_id || 'N/A'}
Razorpay Order ID: ${payment.razorpay_order_id || 'N/A'}
Description: ${payment.description || 'Wallet Recharge'}
Method: ${payment.payment_method || 'Online'}

Amount: ₹${parseFloat(payment.amount).toFixed(2)}
Balance Before: ₹${parseFloat(payment.balance_before || 0).toFixed(2)}
Balance After: ₹${parseFloat(payment.balance_after || 0).toFixed(2)}

Status: ${(payment.status || 'success').toUpperCase()}

=====================================
    `.trim();

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Receipt-${payment.invoice_number || payment.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Receipt downloaded');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className={cn("text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2", isDarkMode ? 'text-white/25' : 'text-slate-400')}>
                    <div className="w-4 h-px bg-emerald-500/50" />
                    Payment History
                </h2>
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl border",
                        isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
                    )}>
                        <Search size={14} className="opacity-40" />
                        <input
                            type="text"
                            placeholder="Search payments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={cn(
                                "bg-transparent text-sm outline-none w-48",
                                isDarkMode ? "text-white placeholder:text-white/30" : "text-slate-900 placeholder:text-slate-400"
                            )}
                        />
                    </div>
                    <button
                        onClick={handleExportAll}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                            isDarkMode ? "border-white/10 text-white/60 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        )}
                    >
                        <FileDown size={14} />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Payment Table */}
            <div className={cn(
                "rounded-[24px] border overflow-hidden",
                isDarkMode ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-200"
            )}>
                {isLoading ? (
                    <div className="flex justify-center items-center py-16">
                        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                    </div>
                ) : filteredPayments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <CreditCard size={32} className="opacity-20" />
                        <p className={cn("text-sm opacity-40")}>No payments found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className={cn("border-b", isDarkMode ? "border-white/5" : "border-slate-100")}>
                                    {['Date', 'Payment ID', 'Description', 'Amount', 'Balance After', 'Status', ''].map((h, i) => (
                                        <th key={i} className={cn(
                                            "px-5 py-3.5 text-left text-[9px] font-black uppercase tracking-widest",
                                            isDarkMode ? "text-white/25" : "text-slate-400"
                                        )}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayments.map((payment: any, i: number) => {
                                    const badge = getStatusBadge(payment.status);
                                    return (
                                        <tr
                                            key={payment.id || i}
                                            className={cn(
                                                "border-b transition-colors",
                                                isDarkMode ? "border-white/[0.03] hover:bg-white/[0.02]" : "border-slate-50 hover:bg-slate-50/50"
                                            )}
                                        >
                                            <td className="px-5 py-4">
                                                <div>
                                                    <p className={cn("text-sm font-bold", isDarkMode ? 'text-white/80' : 'text-slate-900')}>
                                                        {new Date(payment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </p>
                                                    <p className={cn("text-[10px] opacity-40 mt-0.5")}>
                                                        {new Date(payment.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className={cn("text-xs font-mono opacity-60 truncate max-w-[180px]")}>
                                                    {payment.razorpay_payment_id || 'N/A'}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className={cn("text-sm font-semibold", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                                                    {payment.description || 'Wallet Recharge'}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className={cn("text-sm font-black text-emerald-500")}>
                                                    +₹{parseFloat(payment.amount).toFixed(2)}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className={cn("text-sm font-bold", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                                    ₹{parseFloat(payment.balance_after || 0).toFixed(2)}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border", badge.bg)}>
                                                    <badge.icon size={10} />
                                                    {badge.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <button
                                                    onClick={() => handleDownloadReceipt(payment)}
                                                    className={cn(
                                                        "p-2 rounded-xl transition-all",
                                                        isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-100"
                                                    )}
                                                    title="Download receipt"
                                                >
                                                    <Download size={14} className="opacity-40 hover:opacity-100" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className={cn(
                        "flex items-center justify-between px-5 py-3 border-t",
                        isDarkMode ? "border-white/5" : "border-slate-100"
                    )}>
                        <p className={cn("text-[10px] opacity-40")}>Page {page} of {totalPages}</p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                className={cn(
                                    "p-1.5 rounded-lg transition-all disabled:opacity-20",
                                    isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-100"
                                )}
                            >
                                <ChevronLeft size={14} />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages}
                                className={cn(
                                    "p-1.5 rounded-lg transition-all disabled:opacity-20",
                                    isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-100"
                                )}
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
