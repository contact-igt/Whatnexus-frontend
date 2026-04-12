"use client";

import { useDispatch } from 'react-redux';
import { useAuth } from '@/redux/selectors/auth/authSelector';
import { clearAuthData } from '@/redux/slices/auth/authSlice';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { ShieldOff, LogOut } from 'lucide-react';

export const AccountStatusOverlay = () => {
    const { accountErrorMessage } = useAuth();
    const { isDarkMode } = useTheme();
    const dispatch = useDispatch();

    if (!accountErrorMessage) return null;

    return (
        <div className={cn(
            "fixed inset-0 z-[9999] flex items-center justify-center",
            isDarkMode ? "bg-[#09090b]" : "bg-[#f8fafc]"
        )}>
            <div className={cn(
                "flex flex-col items-center text-center max-w-sm w-full mx-4 p-8 rounded-2xl border",
                isDarkMode
                    ? "bg-white/[0.03] border-white/10"
                    : "bg-white border-slate-200 shadow-xl"
            )}>
                {/* Icon */}
                <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mb-5",
                    isDarkMode ? "bg-orange-500/10" : "bg-orange-50"
                )}>
                    <ShieldOff className="text-orange-500" size={32} />
                </div>

                {/* Title */}
                <h2 className={cn(
                    "text-xl font-bold mb-2",
                    isDarkMode ? "text-white" : "text-slate-900"
                )}>
                    Account Deactivated
                </h2>

                {/* Message */}
                <p className={cn(
                    "text-sm leading-relaxed mb-6",
                    isDarkMode ? "text-white/50" : "text-slate-500"
                )}>
                    {accountErrorMessage}
                </p>

                {/* Logout */}
                <button
                    onClick={() => dispatch(clearAuthData())}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-orange-600 hover:bg-orange-500 transition-all shadow-lg shadow-orange-500/20"
                >
                    <LogOut size={15} />
                    Sign Out
                </button>
            </div>
        </div>
    );
};
