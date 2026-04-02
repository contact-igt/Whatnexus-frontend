"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    FileText,
    Download,
    Loader2,
    CheckCircle,
    Clock,
    AlertTriangle,
    XCircle,
    ExternalLink,
    Calendar,
    CreditCard,
} from "lucide-react";
import {
    useGetInvoicesQuery,
    useGetInvoiceDetailQuery,
    useCreatePaymentOrderMutation,
    usePayInvoiceMutation,
} from "@/hooks/useBillingQuery";
import { useRazorpay } from "@/hooks/useRazorpay";
import { useAuth } from "@/redux/selectors/auth/authSelector";
import { Pagination } from "@/components/ui/pagination";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface BillingInvoicesProps {
    isDarkMode: boolean;
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

const statusConfig: Record<
    string,
    { icon: typeof CheckCircle; color: string; label: string; darkColor: string }
> = {
    paid: {
        icon: CheckCircle,
        color: "bg-emerald-50 text-emerald-600 border-emerald-200",
        darkColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        label: "Paid",
    },
    unpaid: {
        icon: Clock,
        color: "bg-amber-50 text-amber-600 border-amber-200",
        darkColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        label: "Unpaid",
    },
    overdue: {
        icon: AlertTriangle,
        color: "bg-red-50 text-red-600 border-red-200",
        darkColor: "bg-red-500/10 text-red-400 border-red-500/20",
        label: "Overdue",
    },
    cancelled: {
        icon: XCircle,
        color: "bg-slate-50 text-slate-500 border-slate-200",
        darkColor: "bg-white/5 text-white/30 border-white/10",
        label: "Cancelled",
    },
};

export const BillingInvoices = ({ isDarkMode }: BillingInvoicesProps) => {
    const { user } = useAuth();
    const [filterStatus, setFilterStatus] = useState<string>("All");
    const [page, setPage] = useState(1);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
    const [payingInvoiceId, setPayingInvoiceId] = useState<number | null>(null);
    const { loadScript: loadRazorpay } = useRazorpay();

    const createOrder = useCreatePaymentOrderMutation();
    const payInvoice = usePayInvoiceMutation();

    const { data: invoiceResponse, isLoading } = useGetInvoicesQuery({
        status: filterStatus === "All" ? undefined : filterStatus.toLowerCase(),
        page,
        limit: 10,
    });

    const invoices = invoiceResponse?.data?.invoices || [];
    const pagination = invoiceResponse?.data?.pagination || {
        total: 0,
        page: 1,
        limit: 10,
    };
    const totalPages = Math.ceil(pagination.total / pagination.limit);

    const { data: invoiceDetailRes, isLoading: isDetailLoading } =
        useGetInvoiceDetailQuery(selectedInvoiceId || 0);
    const invoiceDetail = invoiceDetailRes?.data || null;

    const handlePayInvoice = async (invoice: any) => {
        if (payingInvoiceId) return;
        setPayingInvoiceId(invoice.id);

        try {
            const razorpayLoaded = await loadRazorpay();
            if (!razorpayLoaded) {
                toast.error("Failed to load Razorpay SDK");
                setPayingInvoiceId(null);
                return;
            }

            const orderRes = await createOrder.mutateAsync(invoice.total_amount);
            const order = orderRes?.data;

            if (!order?.id) {
                toast.error("Failed to create payment order");
                setPayingInvoiceId(null);
                return;
            }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency || "INR",
                name: "Whatnexus",
                description: `Invoice ${invoice.invoice_number}`,
                order_id: order.id,
                prefill: {
                    email: user?.email || "",
                    contact: user?.phone || "",
                },
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
                        setSelectedInvoiceId(null);
                    } catch {
                        toast.error("Payment verification failed. Please contact support.");
                    } finally {
                        setPayingInvoiceId(null);
                    }
                },
                modal: {
                    ondismiss: () => setPayingInvoiceId(null),
                },
                theme: {
                    color: "#10b981",
                },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch {
            toast.error("Failed to initiate payment");
            setPayingInvoiceId(null);
        }
    };

    const handleDownloadInvoice = (invoice: any) => {
        const content = `
=====================================
       WHATNEXUS BILLING INVOICE
=====================================

Invoice Number : ${invoice.invoice_number}
Status         : ${invoice.status?.toUpperCase()}
Generated      : ${new Date(invoice.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
Due Date       : ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "N/A"}

-------------------------------------
BILLING PERIOD
-------------------------------------
Cycle Start    : ${invoice.cycle_start ? new Date(invoice.cycle_start).toLocaleDateString("en-IN") : "N/A"}
Cycle End      : ${invoice.cycle_end ? new Date(invoice.cycle_end).toLocaleDateString("en-IN") : "N/A"}

-------------------------------------
COST BREAKDOWN
-------------------------------------
Message Cost   : ₹${parseFloat(invoice.total_message_cost_inr || 0).toFixed(2)}
AI Usage Cost  : ₹${parseFloat(invoice.total_ai_cost_inr || 0).toFixed(2)}
──────────────────────
Total Amount   : ₹${parseFloat(invoice.total_amount || 0).toFixed(2)}

-------------------------------------
PAYMENT
-------------------------------------
${invoice.status === "paid" ? `Paid On   : ${invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString("en-IN") : "N/A"}\nPayment ID: ${invoice.razorpay_payment_id || "N/A"}` : "Status: AWAITING PAYMENT"}

=====================================
    Thank you for using Whatnexus!
    support@whatnexus.com
=====================================
    `;

        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${invoice.invoice_number}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Invoice downloaded!");
    };

    return (
        <div>
            <h2
                className={cn(
                    "text-xs font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2",
                    isDarkMode ? "text-white/25" : "text-slate-400"
                )}
            >
                <div className="w-4 h-px bg-blue-500/50" />
                Invoices
            </h2>

            <div
                className={cn(
                    "relative group rounded-[24px] border transition-all duration-500 overflow-hidden",
                    isDarkMode
                        ? "bg-white/[0.02] border-white/5"
                        : "bg-slate-50 border-slate-200"
                )}
            >
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

                {/* Header / Filter Bar */}
                <div
                    className={cn(
                        "relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b",
                        isDarkMode ? "border-white/5" : "border-slate-100"
                    )}
                >
                    <div className="flex items-center gap-4">
                        <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                            <FileText size={16} className="text-blue-500" />
                        </div>
                        <div>
                            <h3
                                className={cn(
                                    "font-bold text-sm uppercase tracking-[0.2em]",
                                    isDarkMode ? "text-white" : "text-slate-800"
                                )}
                            >
                                Monthly Invoices
                            </h3>
                            <p className="text-[10px] font-medium opacity-30 mt-0.5">
                                Billing cycle invoices for postpaid usage
                            </p>
                        </div>
                    </div>

                    <div
                        className={cn(
                            "flex p-1 rounded-2xl border transition-all duration-300",
                            isDarkMode
                                ? "bg-white/[0.03] border-white/5"
                                : "bg-white border-slate-100 shadow-sm"
                        )}
                    >
                        {["All", "Unpaid", "Overdue", "Paid", "Cancelled"].map((status) => {
                            const isActive = filterStatus === status;
                            return (
                                <button
                                    key={status}
                                    onClick={() => {
                                        setFilterStatus(status);
                                        setPage(1);
                                    }}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 relative overflow-hidden",
                                        isActive
                                            ? "text-white bg-slate-900 shadow-xl scale-[1.05] z-10"
                                            : isDarkMode
                                                ? "text-white/20 hover:text-white/60"
                                                : "text-slate-400 hover:text-slate-700"
                                    )}
                                >
                                    {status}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Invoice List */}
                <div className="relative z-10 p-6">
                    {isLoading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500 opacity-50" />
                        </div>
                    ) : invoices.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 opacity-20">
                            <FileText size={40} strokeWidth={1} />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">
                                No Invoices Found
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {invoices.map((invoice: any) => {
                                const config =
                                    statusConfig[invoice.status] || statusConfig.unpaid;
                                const StatusIcon = config.icon;
                                const isPayable =
                                    invoice.status === "unpaid" || invoice.status === "overdue";
                                const isPaying = payingInvoiceId === invoice.id;

                                return (
                                    <div
                                        key={invoice.id}
                                        className={cn(
                                            "relative p-5 rounded-[20px] border transition-all duration-500 cursor-pointer group/inv",
                                            isDarkMode
                                                ? "border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10"
                                                : "border-slate-100 bg-white hover:bg-slate-50 hover:border-blue-200"
                                        )}
                                        onClick={() =>
                                            setSelectedInvoiceId(
                                                selectedInvoiceId === invoice.id ? null : invoice.id
                                            )
                                        }
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={cn(
                                                        "p-2.5 rounded-xl border",
                                                        isDarkMode ? config.darkColor : config.color
                                                    )}
                                                >
                                                    <StatusIcon size={16} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <h4
                                                            className={cn(
                                                                "text-sm font-black tracking-tight",
                                                                isDarkMode ? "text-white/90" : "text-slate-800"
                                                            )}
                                                        >
                                                            {invoice.invoice_number}
                                                        </h4>
                                                        <span
                                                            className={cn(
                                                                "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border",
                                                                isDarkMode ? config.darkColor : config.color
                                                            )}
                                                        >
                                                            {config.label}
                                                        </span>
                                                    </div>
                                                    <div
                                                        className={cn(
                                                            "flex items-center gap-3 mt-1.5 text-[10px] font-medium",
                                                            isDarkMode ? "text-white/30" : "text-slate-400"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            <Calendar size={10} />
                                                            <span>
                                                                {invoice.cycle_start
                                                                    ? new Date(
                                                                        invoice.cycle_start
                                                                    ).toLocaleDateString("en-IN", {
                                                                        day: "2-digit",
                                                                        month: "short",
                                                                    })
                                                                    : "—"}{" "}
                                                                –{" "}
                                                                {invoice.cycle_end
                                                                    ? new Date(
                                                                        invoice.cycle_end
                                                                    ).toLocaleDateString("en-IN", {
                                                                        day: "2-digit",
                                                                        month: "short",
                                                                        year: "numeric",
                                                                    })
                                                                    : "—"}
                                                            </span>
                                                        </div>
                                                        {invoice.due_date && (
                                                            <span
                                                                className={cn(
                                                                    invoice.status === "overdue"
                                                                        ? "text-red-500 font-bold"
                                                                        : ""
                                                                )}
                                                            >
                                                                Due:{" "}
                                                                {new Date(
                                                                    invoice.due_date
                                                                ).toLocaleDateString("en-IN", {
                                                                    day: "2-digit",
                                                                    month: "short",
                                                                    year: "numeric",
                                                                })}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p
                                                        className={cn(
                                                            "text-lg font-black tabular-nums tracking-tight",
                                                            isDarkMode ? "text-white" : "text-slate-900"
                                                        )}
                                                    >
                                                        ₹
                                                        {parseFloat(
                                                            invoice.total_amount || 0
                                                        ).toLocaleString(undefined, {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {isPayable && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handlePayInvoice(invoice);
                                                            }}
                                                            disabled={isPaying}
                                                            className={cn(
                                                                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border",
                                                                isPaying
                                                                    ? "opacity-50 cursor-not-allowed"
                                                                    : "",
                                                                invoice.status === "overdue"
                                                                    ? "bg-red-500 text-white border-red-400 hover:bg-red-600 shadow-lg shadow-red-500/20"
                                                                    : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/20"
                                                            )}
                                                        >
                                                            {isPaying ? (
                                                                <Loader2 size={12} className="animate-spin" />
                                                            ) : (
                                                                <CreditCard size={12} />
                                                            )}
                                                            {isPaying ? "Processing..." : "Pay Now"}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDownloadInvoice(invoice);
                                                        }}
                                                        className={cn(
                                                            "p-2 rounded-xl border transition-all duration-300",
                                                            isDarkMode
                                                                ? "bg-white/5 border-white/10 hover:bg-white/10 text-white/40 hover:text-white/70"
                                                                : "bg-white border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                                                        )}
                                                    >
                                                        <Download size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expandable Detail */}
                                        <AnimatePresence>
                                            {selectedInvoiceId === invoice.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div
                                                        className={cn(
                                                            "mt-4 pt-4 border-t",
                                                            isDarkMode ? "border-white/5" : "border-slate-100"
                                                        )}
                                                    >
                                                        {isDetailLoading ? (
                                                            <div className="flex justify-center py-4">
                                                                <Loader2 className="w-5 h-5 animate-spin text-blue-500 opacity-50" />
                                                            </div>
                                                        ) : invoiceDetail ? (
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                                <div className="space-y-1">
                                                                    <p
                                                                        className={cn(
                                                                            "text-[9px] font-bold uppercase tracking-widest",
                                                                            isDarkMode
                                                                                ? "text-white/30"
                                                                                : "text-slate-400"
                                                                        )}
                                                                    >
                                                                        Message Cost
                                                                    </p>
                                                                    <p
                                                                        className={cn(
                                                                            "text-sm font-black tabular-nums",
                                                                            isDarkMode
                                                                                ? "text-white/80"
                                                                                : "text-slate-800"
                                                                        )}
                                                                    >
                                                                        ₹
                                                                        {parseFloat(
                                                                            invoiceDetail.total_message_cost_inr || 0
                                                                        ).toFixed(2)}
                                                                    </p>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p
                                                                        className={cn(
                                                                            "text-[9px] font-bold uppercase tracking-widest",
                                                                            isDarkMode
                                                                                ? "text-white/30"
                                                                                : "text-slate-400"
                                                                        )}
                                                                    >
                                                                        AI Usage Cost
                                                                    </p>
                                                                    <p
                                                                        className={cn(
                                                                            "text-sm font-black tabular-nums",
                                                                            isDarkMode
                                                                                ? "text-white/80"
                                                                                : "text-slate-800"
                                                                        )}
                                                                    >
                                                                        ₹
                                                                        {parseFloat(
                                                                            invoiceDetail.total_ai_cost_inr || 0
                                                                        ).toFixed(2)}
                                                                    </p>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p
                                                                        className={cn(
                                                                            "text-[9px] font-bold uppercase tracking-widest",
                                                                            isDarkMode
                                                                                ? "text-white/30"
                                                                                : "text-slate-400"
                                                                        )}
                                                                    >
                                                                        Total Messages
                                                                    </p>
                                                                    <p
                                                                        className={cn(
                                                                            "text-sm font-black tabular-nums",
                                                                            isDarkMode
                                                                                ? "text-white/80"
                                                                                : "text-slate-800"
                                                                        )}
                                                                    >
                                                                        {(
                                                                            invoiceDetail.total_messages || 0
                                                                        ).toLocaleString()}
                                                                    </p>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p
                                                                        className={cn(
                                                                            "text-[9px] font-bold uppercase tracking-widest",
                                                                            isDarkMode
                                                                                ? "text-white/30"
                                                                                : "text-slate-400"
                                                                        )}
                                                                    >
                                                                        Total AI Calls
                                                                    </p>
                                                                    <p
                                                                        className={cn(
                                                                            "text-sm font-black tabular-nums",
                                                                            isDarkMode
                                                                                ? "text-white/80"
                                                                                : "text-slate-800"
                                                                        )}
                                                                    >
                                                                        {(
                                                                            invoiceDetail.total_ai_calls || 0
                                                                        ).toLocaleString()}
                                                                    </p>
                                                                </div>
                                                                {invoiceDetail.paid_at && (
                                                                    <div className="space-y-1 col-span-2">
                                                                        <p
                                                                            className={cn(
                                                                                "text-[9px] font-bold uppercase tracking-widest",
                                                                                isDarkMode
                                                                                    ? "text-white/30"
                                                                                    : "text-slate-400"
                                                                            )}
                                                                        >
                                                                            Paid On
                                                                        </p>
                                                                        <p
                                                                            className={cn(
                                                                                "text-sm font-black",
                                                                                isDarkMode
                                                                                    ? "text-emerald-400"
                                                                                    : "text-emerald-600"
                                                                            )}
                                                                        >
                                                                            {new Date(
                                                                                invoiceDetail.paid_at
                                                                            ).toLocaleDateString("en-IN", {
                                                                                day: "2-digit",
                                                                                month: "long",
                                                                                year: "numeric",
                                                                                hour: "2-digit",
                                                                                minute: "2-digit",
                                                                            })}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <p
                                                                className={cn(
                                                                    "text-xs",
                                                                    isDarkMode
                                                                        ? "text-white/30"
                                                                        : "text-slate-400"
                                                                )}
                                                            >
                                                                Unable to load invoice details
                                                            </p>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-6">
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={setPage}
                                isDarkMode={isDarkMode}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
