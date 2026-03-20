"use client";

import { Drawer } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface ConfirmationDrawerProps {
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

export const ConfirmationDrawer = ({
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
}: ConfirmationDrawerProps) => {
    const variantColors = {
        danger: 'text-red-500',
        warning: 'text-yellow-500',
        info: 'text-blue-500',
        success: 'text-green-500'
    };

    const confirmButtonStyles = {
        danger: isDarkMode
            ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/20'
            : 'bg-red-500 text-white hover:bg-red-600',
        warning: isDarkMode
            ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 border border-yellow-500/20'
            : 'bg-yellow-500 text-white hover:bg-yellow-600',
        info: isDarkMode
            ? 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 border border-blue-500/20'
            : 'bg-blue-500 text-white hover:bg-blue-600',
        success: isDarkMode
            ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30 border border-green-500/20'
            : 'bg-green-500 text-white hover:bg-green-600'
    };

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            description="Please confirm your action"
            isDarkMode={isDarkMode}
            className="font-sans"
            footer={
                <div className="flex items-center justify-end space-x-3">
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
            }
        >
            <div className="flex flex-col items-center justify-center py-6 space-y-4 text-center">
                <div className={cn(
                    "p-4 rounded-full",
                    isDarkMode ? 'bg-white/5' : 'bg-slate-100'
                )}>
                    <AlertTriangle className={variantColors[variant]} size={48} />
                </div>
                <div className="space-y-2">
                    <h3 className={cn(
                        "text-lg font-semibold",
                        isDarkMode ? 'text-white' : 'text-slate-900'
                    )}>
                        {title}
                    </h3>
                    <p className={cn(
                        "text-sm max-w-xs",
                        isDarkMode ? 'text-white/60' : 'text-slate-600'
                    )}>
                        {message}
                    </p>
                </div>
            </div>
        </Drawer>
    );
};
