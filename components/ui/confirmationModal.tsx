
"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    isDarkMode: boolean;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    variant?: 'danger' | 'warning' | 'info' | 'success';
}

export const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    isDarkMode,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isLoading = false,
    variant = 'danger'
}: ConfirmationModalProps) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    const variantStyles = {
        danger: 'text-red-500',
        warning: 'text-yellow-500',
        info: 'text-blue-500',
        success: 'text-green-500'
    };

    const confirmButtonStyles = {
        danger: isDarkMode
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-red-500 hover:bg-red-600 text-white',
        warning: isDarkMode
            ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
            : 'bg-yellow-500 hover:bg-yellow-600 text-white',
        info: isDarkMode
            ? 'bg-blue-500 hover:bg-blue-600 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white',
        success: isDarkMode
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-green-500 hover:bg-green-600 text-white'
    };

    return createPortal(
        <div className="fixed inset-0 font-sans z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div
                className={cn(
                    "relative w-full max-w-md rounded-xl shadow-2xl border animate-in zoom-in-95 duration-200",
                    isDarkMode
                        ? 'bg-[#1c1c21] border-white/10'
                        : 'bg-white border-slate-200'
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Icon and Title */}
                <div className="p-6 pb-4">
                    <div className="flex items-start space-x-4">
                        <div className={cn(
                            "p-3 rounded-full",
                            isDarkMode ? 'bg-white/5' : 'bg-slate-100'
                        )}>
                            <AlertTriangle className={variantStyles[variant]} size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className={cn(
                                "text-lg font-semibold",
                                isDarkMode ? 'text-white' : 'text-slate-900'
                            )}>
                                {title}
                            </h3>
                            <p className={cn(
                                "text-sm mt-2",
                                isDarkMode ? 'text-white/60' : 'text-slate-600'
                            )}>
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3 p-6 pt-2">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                            isDarkMode
                                ? 'text-white/70 hover:bg-white/5 hover:text-white'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                            isLoading && 'opacity-50 cursor-not-allowed'
                        )}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                            confirmButtonStyles[variant],
                            isLoading && 'opacity-50 cursor-not-allowed'
                        )}
                    >
                        {isLoading ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
