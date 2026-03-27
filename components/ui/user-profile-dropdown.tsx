"use client";

import { useEffect, useRef } from "react";
import { LogOut, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { getProfileRoute } from "@/lib/profileUtils";

interface UserProfileDropdownProps {
    isDarkMode: boolean;
    user: any;
    onClose: () => void;
    onLogout: () => void;
}

export const UserProfileDropdown = ({
    isDarkMode,
    user,
    onClose,
    onLogout,
}: UserProfileDropdownProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [onClose]);

    const displayName = user?.name || user?.username || "User";
    const email = user?.email || "";
    const initial = displayName.charAt(0).toUpperCase();

    return (
        <div
            ref={ref}
            className={cn(
                "absolute right-0 top-14 z-50 w-64 rounded-xl border shadow-xl animate-in fade-in zoom-in-95 duration-200",
                isDarkMode
                    ? "bg-[#1c1c21] border-white/10"
                    : "bg-white border-slate-200"
            )}
        >
            <div className={cn("p-4 border-b", isDarkMode ? "border-white/10" : "border-slate-100")}>
                <div className="flex items-center space-x-3">
                    <div
                        className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                            isDarkMode ? "bg-white/10 text-white" : "bg-slate-900 text-white"
                        )}
                    >
                        {initial}
                    </div>
                    <div className="min-w-0">
                        <p className={cn("text-sm font-semibold truncate", isDarkMode ? "text-white" : "text-slate-900")}>
                            {displayName}
                        </p>
                        {email && (
                            <p className={cn("text-xs truncate", isDarkMode ? "text-white/50" : "text-slate-500")}>
                                {email}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="py-1.5">
                <button
                    onClick={() => { onClose(); router.push(getProfileRoute(user?.role || '')); }}
                    className={cn(
                        "w-full flex items-center space-x-3 px-4 py-2.5 text-sm transition-all",
                        isDarkMode
                            ? "text-white/70 hover:bg-white/5 hover:text-white"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                >
                    <User size={16} />
                    <span>Profile</span>
                </button>
                <button
                    onClick={() => { onClose(); router.push("/settings/general"); }}
                    className={cn(
                        "w-full flex items-center space-x-3 px-4 py-2.5 text-sm transition-all",
                        isDarkMode
                            ? "text-white/70 hover:bg-white/5 hover:text-white"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                >
                    <Settings size={16} />
                    <span>Settings</span>
                </button>
            </div>

            <div className={cn("border-t py-1.5", isDarkMode ? "border-white/10" : "border-slate-100")}>
                <button
                    onClick={onLogout}
                    className={cn(
                        "w-full flex items-center space-x-3 px-4 py-2.5 text-sm transition-all",
                        "text-red-500 hover:bg-red-500/10"
                    )}
                >
                    <LogOut size={16} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};
