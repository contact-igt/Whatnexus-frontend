"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreatePaymentOrderMutation, useVerifyPaymentMutation } from "@/hooks/useBillingQuery";
import { useRazorpay } from "@/hooks/useRazorpay";
import { Wallet, Loader2, CreditCard, ChevronRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/redux/selectors/auth/authSelector";
import { motion, AnimatePresence } from "framer-motion";

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

const PRESET_AMOUNTS = [500, 1000, 2000, 5000];

export const RechargeModal = ({ isOpen, onClose, isDarkMode }: RechargeModalProps) => {
  const [amount, setAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  const createOrderMutation = useCreatePaymentOrderMutation();
  const verifyPaymentMutation = useVerifyPaymentMutation();
  const { loadScript } = useRazorpay();

  const handleRecharge = async () => {
    // Prevent double-click - check if already processing
    if (isProcessing) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 100) {
      toast.error("Minimum recharge amount is ₹100");
      return;
    }

    // Add maximum amount validation
    if (numAmount > 500000) {
      toast.error("Maximum recharge amount is ₹5,00,000");
      return;
    }

    setIsProcessing(true);
    try {
      const scriptLoaded = await loadScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway.");
        return;
      }

      const response = await createOrderMutation.mutateAsync(numAmount);
      const order = response.data;
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      if (!razorpayKey) {
        toast.error("Payment configuration missing.");
        return;
      }

      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: "WHATNEXUS",
        description: "Secure Wallet Recharge",
        order_id: order.id,
        handler: async (response: any) => {
          try {
            await verifyPaymentMutation.mutateAsync({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: order.amount
            });
            toast.success("Transaction Complete: Credits added to wallet.");
            onClose();
          } catch (err) {
            toast.error("Payment verification failed");
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user?.username,
          email: user?.email,
          contact: user?.mobile || "",
        },
        theme: { color: "#10b981" },
        modal: {
          ondismiss: () => setIsProcessing(false)
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        setIsProcessing(false);
        toast.error(`Payment failed: ${resp.error.description}`);
      });
      rzp.open();
    } catch (err: any) {
      setIsProcessing(false);
      toast.error(`Initiation failed: ${err.message || "Error"}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "sm:max-w-[440px] border-none p-0 overflow-hidden rounded-[28px] shadow-2xl",
        isDarkMode ? "bg-[#0a0a0b] text-white" : "bg-white"
      )}>
        {/* Elite Header with Background Effect */}
        <div className="relative p-8 pb-4">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                "w-16 h-16 rounded-[22px] flex items-center justify-center mb-6 border shadow-xl relative group",
                isDarkMode ? "bg-white/5 border-white/10" : "bg-emerald-50 border-emerald-100"
              )}
            >
              <div className="absolute inset-0 bg-emerald-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <Wallet className="w-7 h-7 text-emerald-500 relative z-10" />
            </motion.div>

            <DialogTitle className={cn("text-2xl font-black tracking-tight text-center uppercase tracking-[0.05em]", isDarkMode ? "text-white" : "text-slate-900")}>
              Elite Top-Up
            </DialogTitle>
            <DialogDescription className={cn("text-center text-[11px] font-black uppercase tracking-[0.2em] mt-2", isDarkMode ? "opacity-30 text-white" : "text-slate-500")}>
              Secured Financial Channel
            </DialogDescription>
          </div>
        </div>

        <div className="px-8 pb-8 space-y-8 relative z-10">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt.toString())}
                  className={cn(
                    "relative py-4 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all duration-500 border group overflow-hidden",
                    amount === amt.toString()
                      ? "bg-slate-900 border-slate-800 text-white shadow-xl scale-[1.03]"
                      : isDarkMode ? "bg-white/[0.03] border-white/5 text-white/40 hover:text-white hover:border-white/10" : "bg-slate-50 border-slate-100 text-slate-500 hover:border-emerald-200"
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  ₹{amt.toLocaleString()}
                </button>
              ))}
            </div>

            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-emerald-500/50 group-focus-within:text-emerald-500 transition-colors">₹</div>
              <Input
                isDarkMode={isDarkMode}
                type="number"
                placeholder="CUSTOM AMOUNT"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={cn(
                  "pl-10 py-7 rounded-[22px] font-black text-sm uppercase tracking-widest transition-all duration-500 border-2",
                  isDarkMode ? "bg-white/[0.02] border-white/5 focus:border-emerald-500/30" : "bg-slate-50 border-slate-100 focus:border-emerald-500/50"
                )}
              />
            </div>
          </div>

          {/* Benefits/Security Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className={cn("p-4 rounded-[20px] border flex flex-col gap-2 transition-all duration-500", isDarkMode ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-100")}>
              <ShieldCheck size={14} className="text-emerald-500" />
              <span className={cn("text-[9px] font-black uppercase tracking-widest opacity-40", isDarkMode ? "text-white" : "text-slate-500")}>Verified Channel</span>
            </div>
            <div className={cn("p-4 rounded-[20px] border flex flex-col gap-2 transition-all duration-500", isDarkMode ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-100")}>
              <Sparkles size={14} className="text-blue-500" />
              <span className={cn("text-[9px] font-black uppercase tracking-widest opacity-40", isDarkMode ? "text-white" : "text-slate-500")}>Instant Credit</span>
            </div>
          </div>

          <button
            onClick={handleRecharge}
            disabled={isProcessing || !amount}
            className={cn(
              "w-full py-5 rounded-[22px] shadow-2xl transition-all duration-500 active:scale-95 flex items-center justify-center gap-3 relative overflow-hidden group",
              !amount ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-transparent to-emerald-500 opacity-0 group-hover:opacity-20 transition-opacity duration-1000" />
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span className="text-xs font-black uppercase tracking-[0.2em]">Authorize ₹{amount || "0"}</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>

          <p className={cn("text-center text-[8px] font-black uppercase tracking-[0.2em] opacity-20", isDarkMode ? "text-white" : "text-slate-500")}>
            Powered by Razorpay Secure Encryption
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
