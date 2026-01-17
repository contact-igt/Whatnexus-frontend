
"use client";

import { Globe, Bell, Sun, Moon } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useAuth } from '@/redux/selectors/auth/authSelector';
import { useState } from 'react';
import { UserProfileDropdown } from '@/components/ui/user-profile-dropdown';
import { useDispatch } from 'react-redux';
import { clearAuthData } from '@/redux/slices/auth/authSlice';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';


export const Header = () => {
    const { user } = useAuth();
    const { setTheme, isDarkMode } = useTheme();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dispatch = useDispatch();
    const router = useRouter();
    const toggleTheme = () => {
        setTheme(isDarkMode ? "light" : "dark");
    };
    const handleLogout = () => {
        dispatch(clearAuthData());
        router.replace('/login');
    };

    return (
        <header className={cn("h-20 shrink-0 flex items-center justify-between px-10 transition-all duration-700 border-b", isDarkMode ? 'border-white/5' : 'border-slate-100')}>
            <div className="flex items-center space-x-8">
                <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                        <span className={cn("text-[20px] font-black tracking-tighter", isDarkMode ? 'text-white' : 'text-slate-900')}>
                            WhatsNexus<span className="text-emerald-500">.</span>
                        </span>
                        <div className={cn("px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border",
                            isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200')}>
                            Beta
                        </div>
                    </div>
                    <span className={cn("text-[8px] font-bold tracking-[0.15em] uppercase opacity-50 whitespace-nowrap",
                        isDarkMode ? 'text-slate-400' : 'text-slate-500')}>
                        Powered by Invictus Global Tech
                    </span>
                </div>
                <div className={cn("h-8 w-px", isDarkMode ? 'bg-white/10' : 'bg-slate-200')} />
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isDarkMode ? 'text-white/40' : 'text-slate-500')}>Receptionist: <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>Active</span></span>
                    </div>
                    <div className="flex items-center space-x-2.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                        <span className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isDarkMode ? 'text-white/40' : 'text-slate-500')}>Region: <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>GLOBAL_X</span></span>
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-10">
                <div className={cn("flex items-center space-x-4 group cursor-pointer transition-all", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                    <Globe size={18} className="text-emerald-500 group-hover:rotate-180 transition-transform duration-1000" />
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Strategic Sync</span>
                        <span className={cn("text-[11px] font-black uppercase tracking-widest", isDarkMode ? 'text-white' : 'text-slate-900')}>Optimized Hub</span>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button className={cn("p-3.5 rounded-2xl transition-all relative border", isDarkMode ? 'border-white/5 hover:bg-white/5 text-slate-400' : 'border-slate-200 hover:bg-slate-50 text-slate-400')}>
                        <Bell size={20} />
                        <div className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
                    </button>
                    <button onClick={toggleTheme} className={cn("p-3 rounded-2xl mt-0 transition-all border group relative", isDarkMode ? 'border-white/5 hover:bg-white/5 text-emerald-400' : 'border-slate-200 hover:bg-slate-100 text-slate-500')}>
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <div className="relative">
                        <div
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className={cn(
                                "rounded-2xl flex items-center font-black text-xs border cursor-pointer transition-all duration-300 overflow-hidden",
                                "w-12 h-12 justify-center hover:rotate-6",
                                isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-900 text-white border-slate-700'
                            )}
                        >

                            <div className={cn("shrink-0 flex items-center justify-center")}>
                                {user?.username?.split("")[0].toUpperCase()}
                            </div>
                        </div>
                        {isProfileOpen && (
                            <UserProfileDropdown
                                isDarkMode={isDarkMode}
                                user={user}
                                onClose={() => setIsProfileOpen(false)}
                                onLogout={handleLogout}
                            />
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};