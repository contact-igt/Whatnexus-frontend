"use client";

import { useAuth } from "@/redux/selectors/auth/authSelector";
import { useRouter } from "next/navigation";
import { useTheme } from "@/hooks/useTheme";
import { GlassCard } from "@/components/ui/glassCard";
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
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="#10b981"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
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
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
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
