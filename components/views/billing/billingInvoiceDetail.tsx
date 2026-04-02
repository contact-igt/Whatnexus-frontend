"use client";

import { cn } from "@/lib/utils";
import {
    FileText, ArrowLeft, Download, CreditCard, Calendar, Clock,
    CheckCircle, AlertTriangle, XCircle, Loader2, Receipt,
    MessageCircle, Cpu
} from "lucide-react";
import { useGetInvoiceDetailQuery, useCreatePaymentOrderMutation, usePayInvoiceMutation } from "@/hooks/useBillingQuery";
import { useRazorpay } from "@/hooks/useRazorpay";
import { useAuth } from "@/redux/selectors/auth/authSelector";
import { toast } from "sonner";
import { useState } from "react";

interface BillingInvoiceDetailProps {
    isDarkMode: boolean;
    invoiceId: number;
    onBack: () => void;
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; darkColor: string; label: string }> = {
    paid: { icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600 border-emerald-200', darkColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'Paid' },
    unpaid: { icon: Clock, color: 'bg-amber-50 text-amber-600 border-amber-200', darkColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Unpaid' },
    overdue: { icon: AlertTriangle, color: 'bg-red-50 text-red-600 border-red-200', darkColor: 'bg-red-500/10 text-red-400 border-red-500/20', label: 'Overdue' },
    cancelled: { icon: XCircle, color: 'bg-slate-50 text-slate-500 border-slate-200', darkColor: 'bg-white/5 text-white/30 border-white/10', label: 'Cancelled' },
};

export const BillingInvoiceDetail = ({ isDarkMode, invoiceId, onBack }: BillingInvoiceDetailProps) => {
    const { user } = useAuth();
    const { data: response, isLoading } = useGetInvoiceDetailQuery(invoiceId);
    const responseData = response?.data || null;
    const invoice = responseData?.invoice || null;
    const cycle = responseData?.cycle || null;
    const { loadScript: loadRazorpay } = useRazorpay();
    const createOrder = useCreatePaymentOrderMutation();
    const payInvoice = usePayInvoiceMutation();
    const [isPaying, setIsPaying] = useState(false);

    const handlePay = async () => {
        if (!invoice || isPaying) return;
        setIsPaying(true);
        try {
            const razorpayLoaded = await loadRazorpay();
            if (!razorpayLoaded) { toast.error("Failed to load Razorpay SDK"); setIsPaying(false); return; }

            const orderRes = await createOrder.mutateAsync(parseFloat(invoice.amount));
            const order = orderRes?.data;
            if (!order?.id) { toast.error("Failed to create payment order"); setIsPaying(false); return; }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency || 'INR',
                name: 'Whatnexus',
                description: `Invoice ${invoice.invoice_number}`,
                order_id: order.id,
                prefill: { email: user?.email || '', contact: user?.phone || '' },
                handler: async (response: any) => {
                    try {
                        await payInvoice.mutateAsync({
                            id: invoice.id,
                            paymentData: {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            },
                        });
                        toast.success(`Invoice ${invoice.invoice_number} paid successfully!`);
                    } catch { toast.error("Payment verification failed"); }
                    finally { setIsPaying(false); }
                },
                modal: { ondismiss: () => setIsPaying(false) },
                theme: { color: '#10b981' },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch { toast.error("Failed to initiate payment"); setIsPaying(false); }
    };

    const handleDownload = () => {
        if (!invoice) return;
        const breakdown = invoice.breakdown || {};
        const content = `
=====================================
       WHATNEXUS BILLING INVOICE
=====================================

Invoice Number : ${invoice.invoice_number}
Status         : ${invoice.status?.toUpperCase()}
Generated      : ${new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
Due Date       : ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A'}

-------------------------------------
BILLING PERIOD
-------------------------------------
Cycle Start    : ${cycle?.start_date ? new Date(cycle.start_date).toLocaleDateString('en-IN') : 'N/A'}
Cycle End      : ${cycle?.end_date ? new Date(cycle.end_date).toLocaleDateString('en-IN') : 'N/A'}

-------------------------------------
COST BREAKDOWN
-------------------------------------
Message Cost   : ₹${parseFloat(breakdown.messages || 0).toFixed(2)}
AI Usage Cost  : ₹${parseFloat(breakdown.ai || 0).toFixed(2)}
──────────────────────
Total Amount   : ₹${parseFloat(invoice.amount || 0).toFixed(2)}

-------------------------------------
PAYMENT
-------------------------------------
${invoice.status === 'paid'
                ? `Paid On   : ${invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString('en-IN') : 'N/A'}\nPayment ID: ${invoice.payment_reference || 'N/A'}`
                : 'Status: AWAITING PAYMENT'}

=====================================
    Thank you for using Whatnexus!
    support@whatnexus.com
=====================================
    `.trim();

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${invoice.invoice_number}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Invoice downloaded!');
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <FileText size={40} className="opacity-20" />
                <p className="text-sm opacity-40">Invoice not found</p>
                <button onClick={onBack} className="flex items-center gap-2 text-sm text-emerald-500 hover:underline">
                    <ArrowLeft size={14} /> Back to Invoices
                </button>
            </div>
        );
    }

    const config = statusConfig[invoice.status] || statusConfig.unpaid;
    const StatusIcon = config.icon;
    const isPayable = invoice.status === 'unpaid' || invoice.status === 'overdue';
    const breakdown = invoice.breakdown || {};
    const msgCost = parseFloat(breakdown.messages || 0);
    const aiCost = parseFloat(breakdown.ai || 0);
    const totalAmount = parseFloat(invoice.amount || 0);

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <button
                onClick={onBack}
                className={cn(
                    "flex items-center gap-2 text-sm font-semibold transition-colors",
                    isDarkMode ? "text-white/50 hover:text-white" : "text-slate-500 hover:text-slate-900"
                )}
            >
                <ArrowLeft size={16} />
                Back to Invoices
            </button>

            {/* Invoice Header */}
            <div className={cn(
                "p-8 rounded-[24px] border",
                isDarkMode ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-200"
            )}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className={cn("p-3 rounded-xl border", isDarkMode ? config.darkColor : config.color)}>
                            <StatusIcon size={24} />
                        </div>
                        <div>
                            <h2 className={cn("text-2xl font-black tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                {invoice.invoice_number}
                            </h2>
                            <div className="flex items-center gap-3 mt-1">
                                <span className={cn("px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border", isDarkMode ? config.darkColor : config.color)}>
                                    {config.label}
                                </span>
                                <span className={cn("text-xs opacity-50")}>
                                    Generated {new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleDownload}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                isDarkMode ? "border-white/10 text-white/60 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            <Download size={14} />
                            Download
                        </button>
                        {isPayable && (
                            <button
                                onClick={handlePay}
                                disabled={isPaying}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    isPaying ? "opacity-50 cursor-not-allowed" : "",
                                    invoice.status === 'overdue'
                                        ? "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20"
                                        : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-500/20"
                                )}
                            >
                                {isPaying ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
                                {isPaying ? 'Processing...' : 'Pay Invoice'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Detail Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Billing Period */}
                <div className={cn(
                    "p-6 rounded-[24px] border",
                    isDarkMode ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-200"
                )}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className={cn("p-2 rounded-xl", isDarkMode ? 'bg-white/5' : 'bg-slate-50')}>
                            <Calendar size={16} className="text-purple-500" />
                        </div>
                        <h3 className={cn("text-sm font-bold uppercase tracking-[0.15em]", isDarkMode ? 'text-white/50' : 'text-slate-500')}>Billing Period</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className={cn("text-xs opacity-40")}>Cycle Start</span>
                            <span className={cn("text-sm font-bold", isDarkMode ? 'text-white/80' : 'text-slate-800')}>
                                {cycle?.start_date ? new Date(cycle.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className={cn("text-xs opacity-40")}>Cycle End</span>
                            <span className={cn("text-sm font-bold", isDarkMode ? 'text-white/80' : 'text-slate-800')}>
                                {cycle?.end_date ? new Date(cycle.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className={cn("text-xs opacity-40")}>Due Date</span>
                            <span className={cn("text-sm font-bold", invoice.status === 'overdue' ? 'text-red-500' : isDarkMode ? 'text-white/80' : 'text-slate-800')}>
                                {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Payment Info */}
                <div className={cn(
                    "p-6 rounded-[24px] border",
                    isDarkMode ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-200"
                )}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className={cn("p-2 rounded-xl", isDarkMode ? 'bg-white/5' : 'bg-slate-50')}>
                            <CreditCard size={16} className="text-blue-500" />
                        </div>
                        <h3 className={cn("text-sm font-bold uppercase tracking-[0.15em]", isDarkMode ? 'text-white/50' : 'text-slate-500')}>Payment Info</h3>
                    </div>
                    <div className="space-y-3">
                        {invoice.status === 'paid' && (
                            <>
                                <div className="flex justify-between">
                                    <span className={cn("text-xs opacity-40")}>Paid On</span>
                                    <span className={cn("text-sm font-bold", isDarkMode ? 'text-white/80' : 'text-slate-800')}>
                                        {invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className={cn("text-xs opacity-40")}>Payment ID</span>
                                    <span className={cn("text-xs font-mono opacity-60 truncate max-w-[200px]")}>
                                        {invoice.payment_reference || '—'}
                                    </span>
                                </div>
                            </>
                        )}
                        <div className="flex justify-between">
                            <span className={cn("text-xs opacity-40")}>Tenant</span>
                            <span className={cn("text-sm font-bold", isDarkMode ? 'text-white/80' : 'text-slate-800')}>
                                {invoice.tenant_id || '—'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cost Breakdown */}
            <div className={cn(
                "p-6 rounded-[24px] border",
                isDarkMode ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-200"
            )}>
                <div className="flex items-center gap-3 mb-6">
                    <div className={cn("p-2 rounded-xl", isDarkMode ? 'bg-white/5' : 'bg-slate-50')}>
                        <Receipt size={16} className="text-emerald-500" />
                    </div>
                    <h3 className={cn("text-sm font-bold uppercase tracking-[0.15em]", isDarkMode ? 'text-white/50' : 'text-slate-500')}>Cost Breakdown</h3>
                </div>

                <div className="space-y-4">
                    <div className={cn("flex items-center justify-between p-4 rounded-xl", isDarkMode ? 'bg-white/[0.02]' : 'bg-slate-50')}>
                        <div className="flex items-center gap-3">
                            <MessageCircle size={16} className="text-blue-500" />
                            <span className={cn("text-sm font-semibold", isDarkMode ? 'text-white/70' : 'text-slate-700')}>WhatsApp Message Cost</span>
                        </div>
                        <span className={cn("text-lg font-black tabular-nums", isDarkMode ? 'text-white' : 'text-slate-900')}>
                            ₹{msgCost.toFixed(2)}
                        </span>
                    </div>

                    <div className={cn("flex items-center justify-between p-4 rounded-xl", isDarkMode ? 'bg-white/[0.02]' : 'bg-slate-50')}>
                        <div className="flex items-center gap-3">
                            <Cpu size={16} className="text-purple-500" />
                            <span className={cn("text-sm font-semibold", isDarkMode ? 'text-white/70' : 'text-slate-700')}>AI Usage Cost</span>
                        </div>
                        <span className={cn("text-lg font-black tabular-nums", isDarkMode ? 'text-white' : 'text-slate-900')}>
                            ₹{aiCost.toFixed(2)}
                        </span>
                    </div>

                    <div className={cn("border-t pt-4 mt-4 flex items-center justify-between", isDarkMode ? 'border-white/10' : 'border-slate-200')}>
                        <span className={cn("text-base font-black uppercase tracking-wider", isDarkMode ? 'text-white/60' : 'text-slate-600')}>Total</span>
                        <span className={cn("text-2xl font-black tabular-nums tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>
                            ₹{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
