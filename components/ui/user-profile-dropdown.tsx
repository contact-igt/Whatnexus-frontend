"use client";

import { User, Settings, LogOut, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getProfileRoute } from '@/lib/profile-utils';

interface UserProfileDropdownProps {
    isDarkMode: boolean;
    user: {
        username?: string;
        email?: string;
        role?: string;
    } | null;
    onClose: () => void;
    onLogout: () => void;
}

export const UserProfileDropdown = ({ isDarkMode, user, onClose, onLogout }: UserProfileDropdownProps) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    console.log("user2", user)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const userInitials = user?.username?.split("")[0]?.toUpperCase();

    const menuItems = [
        {
            icon: User,
            label: "View Profile",
            onClick: () => {
                const profileRoute = getProfileRoute(user?.role || '');
                router.push(profileRoute);
                onClose();
            }
        },
        {
            icon: LogOut,
            label: "Logout",
            onClick: () => {
                onLogout();
                onClose();
            },
            danger: true
        }
    ];

    return (
        <div
            ref={dropdownRef}
            className={cn(
                "absolute top-full right-0 mt-2 w-56 rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50",
                isDarkMode
                    ? 'bg-[#0D0D0F] border-white/10 shadow-black/50'
                    : 'bg-white border-slate-200 shadow-slate-900/10'
            )}
        >
            <div className={cn(
                "p-3 border-b",
                isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'
            )}>
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs border shrink-0",
                        isDarkMode
                            ? 'bg-white/10 border-white/20 text-white'
                            : 'bg-slate-900 text-white border-slate-700'
                    )}>
                        {userInitials ? userInitials : <User size={20} />}
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className={cn(
                            "font-bold text-xs truncate",
                            isDarkMode ? 'text-white' : 'text-slate-900'
                        )}>
                            {user?.username || "User"}
                        </p>
                        {user?.email && (
                            <div className="flex items-center gap-1 mt-0.5">
                                <Mail size={10} className={cn(
                                    isDarkMode ? 'text-white/40' : 'text-slate-400'
                                )} />
                                <p className={cn(
                                    "text-[10px] truncate",
                                    isDarkMode ? 'text-white/60' : 'text-slate-500'
                                )}>
                                    {user.email}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-2">
                {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={index}
                            onClick={item.onClick}
                            className={cn(
                                "w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 group",
                                item.danger
                                    ? (isDarkMode
                                        ? 'hover:bg-rose-500/10 text-rose-400'
                                        : 'hover:bg-rose-50 text-rose-600')
                                    : (isDarkMode
                                        ? 'hover:bg-white/5 text-white/70 hover:text-white'
                                        : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900')
                            )}
                        >
                            <Icon size={16} className="shrink-0" />
                            <span className="font-semibold text-xs">
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
