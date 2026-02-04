
"use client";


import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal, Eye, Edit2, Trash2, MessageCircle, Send, Save, Play } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ActionMenuProps {
    isDarkMode: boolean;
    isView?: boolean;
    isEdit?: boolean;
    isDelete?: boolean;
    isWhatsAppConfig?: boolean;
    onWhatsAppConfig?: () => void;
    onView?: () => void;
    onEdit?: () => void;
    isSubmitTemplate?: boolean;
    onSubmitTemplate?: () => void;
    isSyncTemplate?: boolean;
    onSyncTemplate?: () => void;
    onDelete?: () => void;
    onSoftDelete?: () => void;
    isPermanentDelete?: boolean;
    onPermanentDelete?: () => void;
    isExecute?: boolean;
    onExecute?: () => void;
}

export const ActionMenu = ({ isDarkMode, isView, isEdit, isDelete, isWhatsAppConfig, isPermanentDelete, onWhatsAppConfig, onView, onEdit, onDelete, onPermanentDelete, isSubmitTemplate, onSubmitTemplate, isSyncTemplate, onSyncTemplate, isExecute, onExecute }: ActionMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const menuRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleOpen = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isOpen) {
            setIsOpen(false);
        } else {
            if (menuRef.current) {
                const rect = menuRef.current.getBoundingClientRect();
                setPosition({
                    top: rect.bottom + window.scrollY + 5,
                    left: rect.right + window.scrollX - 144 // 144px is approx width (w-36)
                });
            }
            setIsOpen(true);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        const handleScroll = () => {
            if (isOpen) setIsOpen(false); // Close on scroll to avoid position drift
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', handleScroll, true); // true for capture to catch all scrolls
            window.addEventListener('resize', handleScroll);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleScroll);
        };
    }, [isOpen]);

    // Recalculate position if we can (optional, but closing on scroll is safer)

    return (
        <>
            <button
                ref={menuRef}
                onClick={toggleOpen}
                className={cn(
                    "p-2 rounded-lg transition-all",
                    isOpen
                        ? (isDarkMode ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-900')
                        : (isDarkMode ? 'text-white/40 hover:bg-white/5 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900')
                )}
            >
                <MoreHorizontal size={16} />
            </button>

            {isOpen && createPortal(
                <div
                    ref={dropdownRef}
                    style={{
                        top: position.top,
                        left: position.left,
                        position: 'absolute' // "absolute" in body relative to document
                    }}
                    className={cn(
                        "w-36 rounded-xl border shadow-xl z-[9999] animate-in fade-in zoom-in-95 duration-200",
                        isDarkMode
                            ? 'bg-[#1c1c21] border-white/10'
                            : 'bg-white border-slate-200'
                    )}
                >
                    <div className="p-1">
                        {onView && isView && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onView();
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                                    isDarkMode
                                        ? 'text-white/70 hover:bg-white/5 hover:text-white'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                )}
                            >
                                <Eye size={14} />
                                <span>View</span>
                            </button>
                        )}

                        {onEdit && isEdit && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit();
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                                    isDarkMode
                                        ? 'text-white/70 hover:bg-white/5 hover:text-white'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                )}
                            >
                                <Edit2 size={14} />
                                <span>Edit</span>
                            </button>
                        )}

                        {onWhatsAppConfig && isWhatsAppConfig && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onWhatsAppConfig();
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full flex items-center text-start space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                                    isDarkMode
                                        ? 'text-white/70 hover:bg-white/5 hover:text-white'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                )}
                            >
                                <MessageCircle className="w-4 h-4 sm:min-w-[14px] sm:min-h-[14px]" />
                                <span>WhatsApp</span>
                            </button>
                        )}
                        {
                            onSubmitTemplate && isSubmitTemplate && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSubmitTemplate();
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "w-full flex items-center text-start space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                                        isDarkMode
                                            ? 'text-white/70 hover:bg-white/5 hover:text-white'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    )}
                                >
                                    <Save className="w-4 h-4 sm:min-w-[14px] sm:min-h-[14px]" />
                                    <span>Submit</span>
                                </button>
                            )
                        }
                        {
                            onSyncTemplate && isSyncTemplate && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSyncTemplate();
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "w-full flex items-center text-start space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                                        isDarkMode
                                            ? 'text-white/70 hover:bg-white/5 hover:text-white'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    )}
                                >
                                    <Save className="w-4 h-4 sm:min-w-[14px] sm:min-h-[14px]" />
                                    <span>Sync</span>
                                </button>
                            )
                        }


                        {isDelete && onDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete();
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all mt-1",
                                    isDarkMode
                                        ? 'text-red-400 hover:bg-red-500/10'
                                        : 'text-red-500 hover:bg-red-50'
                                )}
                            >
                                <Trash2 size={14} />
                                <span className="flex-1 text-left">Remove</span>
                            </button>
                        )}
                        {isExecute && onExecute && (
                            <button
                                onClick={() => {
                                    onExecute();
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                                    isDarkMode
                                        ? 'text-emerald-400 hover:bg-emerald-500/10'
                                        : 'text-emerald-500 hover:bg-emerald-50'
                                )}
                            >
                                <Play size={14} />
                                <span className="flex-1 text-left">Execute</span>
                            </button>
                        )}
                        {(!!isPermanentDelete && onPermanentDelete) && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPermanentDelete();
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all mt-1",
                                    isDarkMode
                                        ? 'text-red-400 hover:bg-red-500/10'
                                        : 'text-red-500 hover:bg-red-50'
                                )}
                            >
                                <Trash2 size={14} />
                                <span>Remove</span>
                            </button>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};