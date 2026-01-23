
"use client";

import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Eye, Edit2, Trash2, MessageCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ActionMenuProps {
    isDarkMode: boolean;
    isView?: boolean;
    isEdit?: boolean;
    isWhatsAppConfig?: boolean;
    onWhatsAppConfig?: () => void;
    onView?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

export const ActionMenu = ({ isDarkMode, isView, isEdit, isWhatsAppConfig, onWhatsAppConfig, onView, onEdit, onDelete }: ActionMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        let scrollableParents: HTMLElement[] = [];

        const findScrollableParents = (node: HTMLElement | null) => {
            const parents: HTMLElement[] = [];
            let current = node;
            while (current) {
                const style = window.getComputedStyle(current);
                if (/(auto|scroll)/.test(style.overflowY)) {
                    parents.push(current);
                }
                current = current.parentElement;
            }
            return parents;
        };

        if (isOpen) {
            if (menuRef.current) {
                scrollableParents = findScrollableParents(menuRef.current.parentElement);
                scrollableParents.forEach(parent => {
                    parent.style.setProperty('overflow-y', 'hidden', 'important');
                });
            }
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            scrollableParents.forEach(parent => {
                parent.style.removeProperty('overflow-y');
            });
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "p-2 rounded-lg transition-all",
                    isOpen
                        ? (isDarkMode ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-900')
                        : (isDarkMode ? 'text-white/40 hover:bg-white/5 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900')
                )}
            >
                <MoreHorizontal size={16} />
            </button>

            {isOpen && (
                <div className={cn(
                    "absolute right-0 mt-2 w-34 rounded-xl border shadow-xl z-[100] animate-in fade-in zoom-in-95 duration-200",
                    isDarkMode
                        ? 'bg-[#1c1c21] border-white/10'
                        : 'bg-white border-slate-200'
                )}>
                    <div className="p-1">
                        {onView && isView && (
                            <button
                                onClick={() => {
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
                                onClick={() => {
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
                                onClick={() => {
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


                        {onDelete && (
                            <button
                                onClick={() => {
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
                                <span>Remove</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};