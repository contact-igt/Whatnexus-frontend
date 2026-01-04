
"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    isDarkMode: boolean;
    footer?: React.ReactNode;
    className?: string;
}

export const Modal = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    isDarkMode,
    footer,
    className
}: ModalProps) => {
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

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div
                className={cn(
                    "relative w-full max-w-lg rounded-xl shadow-2xl border animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col",
                    isDarkMode
                        ? 'bg-[#1c1c21] border-white/10'
                        : 'bg-white border-slate-200',
                    className
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-b-transparent">
                    <div>
                        {title && (
                            <h2 className={cn("text-lg font-semibold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                {title}
                            </h2>
                        )}
                        {description && (
                            <p className={cn("text-sm mt-1", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                {description}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className={cn(
                            "p-2 rounded-full transition-all duration-200",
                            isDarkMode
                                ? 'text-white/40 hover:bg-white/10 hover:text-white hover:rotate-90'
                                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900 hover:rotate-90'
                        )}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 pt-2 overflow-y-auto custom-scrollbar flex-1">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className={cn(
                        "p-6 pt-4 border-t",
                        isDarkMode ? 'border-white/5' : 'border-slate-100'
                    )}>
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};
