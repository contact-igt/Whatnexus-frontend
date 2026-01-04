
"use client";

import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Eye, Edit2, Trash2 } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ActionMenuProps {
    isDarkMode: boolean;
    isView?: boolean;
    isEdit?: boolean;
    onView?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

export const ActionMenu = ({ isDarkMode, isView, isEdit, onView, onEdit, onDelete }: ActionMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
                    "absolute right-0 mt-2 w-32 rounded-xl border shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200",
                    isDarkMode
                        ? 'bg-[#1c1c21] border-white/10'
                        : 'bg-white border-slate-200'
                )}>
                    <div className="p-1">
                        {onView && isView &&(
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
