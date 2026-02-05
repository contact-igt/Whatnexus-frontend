"use client";

import { useAuth } from "@/redux/selectors/auth/authSelector";
import { useRouter } from "next/navigation";
import { useTheme } from "@/hooks/useTheme";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { MessageCircle, CheckCircle2, AlertCircle, PlugZap, ArrowRight, ShieldCheck } from "lucide-react";
import { useDispatch } from "react-redux";
import { setActiveTabData } from "@/redux/slices/auth/authSlice";

export const WhatsAppConnectionPlaceholder = () => {
    const { whatsappApiDetails } = useAuth();
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const dispatch = useDispatch();

    const handleNavigation = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(setActiveTabData('/settings/whatsapp-settings'));
        router.push('/settings/whatsapp-settings');
    }

    const status = whatsappApiDetails?.status;
    const isConnected = whatsappApiDetails && Object.keys(whatsappApiDetails).length > 0;

    const renderContent = () => {
        // Case 1: Verified but not Active (Needs Activation)
        if (isConnected && status === 'verified') {
            return (
                <GlassCard isDarkMode={isDarkMode} className="p-10 flex flex-col items-center text-center max-w-sm border-dashed relative overflow-hidden group">
                    <div className={cn("absolute inset-0 opacity-0 pointer-events-none group-hover:opacity-10 transition-opacity duration-700", isDarkMode ? "bg-emerald-500" : "bg-emerald-400")} />

                    <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-xl transform transition-all animate-in zoom-in duration-500", isDarkMode ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-emerald-50 border border-emerald-200")}>
                        <ShieldCheck size={40} className="text-emerald-500" />
                    </div>

                    <h3 className={cn("text-xl font-bold mb-2", isDarkMode ? "text-white" : "text-slate-900")}>
                        Activation Required
                    </h3>

                    <p className={cn("text-sm leading-relaxed mb-8 max-w-[260px]", isDarkMode ? "text-white/60" : "text-slate-600")}>
                        Your WhatsApp account is verified! Activate it now to start sending messages and campaigns.
                    </p>

                    <button
                        onClick={handleNavigation}
                        type="button"
                        className="flex items-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all w-full justify-center"
                    >
                        <span>Activate Account</span>
                        <ArrowRight size={18} />
                    </button>

                    <div className="mt-4 flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider text-emerald-500/70">
                        <CheckCircle2 size={12} />
                        <span>Verification Complete</span>
                    </div>
                </GlassCard>
            );
        }

        // Case 2: Pending (Needs Test & Activation)
        if (isConnected && status === 'pending') {
            return (
                <GlassCard isDarkMode={isDarkMode} className="p-10 flex flex-col items-center text-center max-w-sm border-dashed">
                    <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-xl transform transition-all animate-in zoom-in duration-500", isDarkMode ? "bg-amber-500/10 border border-amber-500/20" : "bg-amber-50 border border-amber-200")}>
                        <PlugZap size={40} className="text-amber-500" />
                    </div>

                    <h3 className={cn("text-xl font-bold mb-2", isDarkMode ? "text-white" : "text-slate-900")}>
                        Test Connection
                    </h3>

                    <p className={cn("text-sm leading-relaxed mb-8 max-w-[260px]", isDarkMode ? "text-white/60" : "text-slate-600")}>
                        Your configuration is saved. Please test the connection to ensure everything is working correctly.
                    </p>

                    <button
                        onClick={handleNavigation}
                        type="button"
                        className="flex items-center space-x-2 bg-amber-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all w-full justify-center"
                    >
                        <span>Test & Activate</span>
                        <ArrowRight size={18} />
                    </button>
                </GlassCard>
            );
        }

        // Case 3: Not Connected (Default)
        return (
            <GlassCard isDarkMode={isDarkMode} className="p-10 flex flex-col items-center text-center max-w-sm border-dashed">
                <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-xl transform rotate-3 transition-all animate-in zoom-in duration-500", isDarkMode ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-emerald-50 border border-emerald-200")}>
                    <MessageCircle size={40} className="text-emerald-500" />
                </div>

                <h3 className={cn("text-xl font-bold mb-2", isDarkMode ? "text-white" : "text-slate-900")}>
                    WhatsApp Not Connected
                </h3>

                <p className={cn("text-sm leading-relaxed mb-8", isDarkMode ? "text-white/60" : "text-slate-600")}>
                    Connect your WhatsApp Business API account to start messaging and managing your conversations.
                </p>

                <button
                    onClick={handleNavigation}
                    type="button"
                    className="flex items-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                    <MessageCircle size={18} />
                    <span>Connect WhatsApp</span>
                </button>
            </GlassCard>
        );
    };

    return (
        <div className="flex h-full flex-col items-center justify-center p-6 space-y-6 animate-in fade-in duration-500">
            {renderContent()}
        </div>
    );
};
