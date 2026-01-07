"use client";

import { useRouter } from 'next/navigation';
import { Home, ArrowLeft, Search, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BRAND_NAME } from '@/lib/data';

interface NotFoundViewProps {
    isDarkMode: boolean;
}

export const NotFoundView = ({ isDarkMode }: NotFoundViewProps) => {
    const router = useRouter();

    return (
        <div className={cn(
            "min-h-screen flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500",
            isDarkMode ? 'bg-[#0A0A0B]' : 'bg-slate-50'
        )}>
            {/* Animated Background Gradient */}
            <div className={cn(
                "absolute w-[800px] h-[800px] blur-[200px] rounded-full animate-pulse transition-all duration-1000",
                isDarkMode ? 'bg-emerald-900/10' : 'bg-emerald-200/20'
            )} />

            {/* Floating Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "absolute w-2 h-2 rounded-full animate-float",
                            isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-400/30'
                        )}
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${i * 0.5}s`,
                            animationDuration: `${3 + Math.random() * 2}s`
                        }}
                    />
                ))}
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-2xl w-full text-center space-y-8 animate-in zoom-in-95 duration-700">
                {/* 404 Icon */}
                <div className="flex justify-center">
                    <div className={cn(
                        "relative w-32 h-32 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-500 group",
                        isDarkMode
                            ? 'bg-white/5 border border-white/10 hover:bg-white/10'
                            : 'bg-white border border-slate-200 hover:shadow-xl'
                    )}>
                        <AlertTriangle
                            size={64}
                            className={cn(
                                "transition-all duration-500 group-hover:scale-110 group-hover:rotate-12",
                                isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                            )}
                        />
                        <div className={cn(
                            "absolute -top-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs animate-bounce",
                            isDarkMode ? 'bg-emerald-500 text-white' : 'bg-emerald-600 text-white'
                        )}>
                            404
                        </div>
                    </div>
                </div>

                {/* Title */}
                <div className="space-y-3">
                    <h1 className={cn(
                        "text-6xl md:text-7xl font-black tracking-tighter",
                        isDarkMode ? 'text-white' : 'text-slate-900'
                    )}>
                        Lost in Space
                    </h1>
                    <p className={cn(
                        "text-lg md:text-xl font-semibold",
                        isDarkMode ? 'text-white/60' : 'text-slate-600'
                    )}>
                        The page you're looking for doesn't exist in the {BRAND_NAME} neural network.
                    </p>
                </div>

                {/* Description */}
                <p className={cn(
                    "text-sm font-medium max-w-md mx-auto",
                    isDarkMode ? 'text-white/40' : 'text-slate-500'
                )}>
                    This could be a broken link, a typo in the URL, or the page may have been moved or deleted.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
                    <button
                        onClick={() => router.replace("/")}
                        className={cn(
                            "group px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wide transition-all duration-300 flex items-center gap-3 shadow-lg hover:scale-105 active:scale-95",
                            isDarkMode
                                ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20'
                                : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                        )}
                    >
                        <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                        Go Back
                    </button>

                    <button
                        onClick={() => router.push('/')}
                        className={cn(
                            "group px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wide transition-all duration-300 flex items-center gap-3 shadow-xl hover:scale-105 active:scale-95",
                            "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20"
                        )}
                    >
                        <Home size={18} className="transition-transform group-hover:scale-110" />
                        Home Dashboard
                    </button>
                </div>

                {/* Quick Links */}
                {/* <div className={cn(
                    "pt-8 border-t",
                    isDarkMode ? 'border-white/5' : 'border-slate-200'
                )}>
                    <p className={cn(
                        "text-xs font-bold uppercase tracking-wider mb-4",
                        isDarkMode ? 'text-white/40' : 'text-slate-500'
                    )}>
                        Quick Links
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        {[
                            { label: 'Dashboard', path: '/' },
                            { label: 'Chats', path: '/chats' },
                            { label: 'Knowledge', path: '/knowledge' },
                            { label: 'Settings', path: '/settings' }
                        ].map((link) => (
                            <button
                                key={link.path}
                                onClick={() => router.push(link.path)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-105",
                                    isDarkMode
                                        ? 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
                                )}
                            >
                                {link.label}
                            </button>
                        ))}
                    </div>
                </div> */}

                {/* Error Code */}
                <div className={cn(
                    "pt-6 text-[10px] font-black uppercase tracking-[0.3em] opacity-30",
                    isDarkMode ? 'text-white' : 'text-slate-900'
                )}>
                    Error Code: 404 • Page Not Found
                </div>
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px) translateX(0px);
                    }
                    50% {
                        transform: translateY(-20px) translateX(10px);
                    }
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};
