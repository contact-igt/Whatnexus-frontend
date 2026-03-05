
"use client";


import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal, Eye, Edit2, Trash2, MessageCircle, Send, Save, Play, Sparkles, RefreshCw, MessageSquare } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useAuth } from '@/redux/selectors/auth/authSelector';

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
    isRestore?: boolean;
    onRestore?: () => void;
    isExecute?: boolean;
    onExecute?: () => void;
    isAnswer?: boolean;
    onAnswer?: () => void;
    isSummary?: boolean;
    onSummary?: () => void;
    isMessage?: boolean;
    onMessage?: () => void;
    isRefresh?: boolean;
    onRefresh?: () => void;


}

export const ActionMenu = ({ isDarkMode, isView, isEdit, isDelete, isWhatsAppConfig, isPermanentDelete, isRestore, onRestore, onWhatsAppConfig, onView, onEdit, onDelete, onPermanentDelete, isSubmitTemplate, onSubmitTemplate, isSyncTemplate, onSyncTemplate, isExecute, onExecute, isAnswer, onAnswer, isSummary, onSummary, isMessage, onMessage, isRefresh, onRefresh }: ActionMenuProps) => {
    const { user } = useAuth();
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
                    "p-2 rounded-lg transition-all font-sans",
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
                        "w-48 font-sans cursor-pointer rounded-xl border z-[9999] animate-in fade-in zoom-in-95 duration-200 shadow-2xl overflow-hidden",
                        isDarkMode
                            ? 'bg-[#0A0A0B]/95 backdrop-blur-2xl border-white/10'
                            : 'bg-white/95 backdrop-blur-2xl border-slate-200 shadow-slate-900/5'
                    )}
                >
                    <div className="flex flex-col py-1.5">
                        {/* Group 1: Navigation Control */}
                        {[
                            { show: !!isView && !!onView, onClick: () => onView?.(), icon: Eye, label: "View" },
                            { show: !!isMessage && !!onMessage, onClick: () => onMessage?.(), icon: MessageSquare, label: "Message" },
                            { show: !!isEdit && !!onEdit, onClick: () => onEdit?.(), icon: Edit2, label: "Edit" },
                            { show: !!isAnswer && !!onAnswer, onClick: () => onAnswer?.(), icon: MessageCircle, label: "Answer", customClass: isDarkMode ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-emerald-500 hover:bg-emerald-50' },
                            { show: !!isWhatsAppConfig && !!onWhatsAppConfig, onClick: () => onWhatsAppConfig?.(), icon: MessageCircle, label: "WhatsApp Configuration", iconClass: "w-4 h-4" },
                        ].filter(item => item.show).length > 0 && (
                                <div className="px-1.5 space-y-0.5">
                                    {[
                                        { show: !!isView && !!onView, onClick: () => onView?.(), icon: Eye, label: "View" },
                                        { show: !!isMessage && !!onMessage, onClick: () => onMessage?.(), icon: MessageSquare, label: "Message" },
                                        { show: !!isEdit && !!onEdit, onClick: () => onEdit?.(), icon: Edit2, label: "Edit" },
                                        { show: !!isAnswer && !!onAnswer, onClick: () => onAnswer?.(), icon: MessageCircle, label: "Answer", customClass: isDarkMode ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-emerald-500 hover:bg-emerald-50' },
                                        { show: !!isWhatsAppConfig && !!onWhatsAppConfig, onClick: () => onWhatsAppConfig?.(), icon: MessageCircle, label: "WhatsApp", iconClass: "w-4 h-4" },
                                    ].map((item: any, index) => {
                                        if (!item.show) return null;
                                        const Icon = item.icon;
                                        return (
                                            <button
                                                key={index}
                                                onClick={(e) => { e.stopPropagation(); item.onClick(); setIsOpen(false); }}
                                                className={cn(
                                                    "w-full flex items-center space-x-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-all group",
                                                    item.customClass || (isDarkMode
                                                        ? 'text-white/70 hover:bg-white/5 hover:text-white'
                                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')
                                                )}
                                            >
                                                <Icon className={cn("shrink-0", item.iconClass || "w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity")} />
                                                <span className="truncate">{item.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                        {/* Divider if needed */}
                        {[
                            { show: !!isView && !!onView }, { show: !!isMessage && !!onMessage }, { show: !!isEdit && !!onEdit }, { show: !!isAnswer && !!onAnswer }, { show: !!isWhatsAppConfig && !!onWhatsAppConfig }
                        ].some(i => i.show) && [
                            { show: !!isSummary && !!onSummary }, { show: !!isRefresh && !!onRefresh }, { show: !!isSubmitTemplate && !!onSubmitTemplate }, { show: !!isSyncTemplate && !!onSyncTemplate }, { show: !!isExecute && !!onExecute }
                        ].some(i => i.show) && (
                                <div className={cn("mx-3 my-1.5 h-px", isDarkMode ? "bg-white/5" : "bg-slate-100")} />
                            )}

                        {/* Group 2: Functional Actions */}
                        {[
                            { show: !!isSummary && !!onSummary, onClick: () => onSummary?.(), icon: Sparkles, label: "Generate Summary" },
                            { show: !!isRefresh && !!onRefresh, onClick: () => onRefresh?.(), icon: RefreshCw, label: "Refresh" },
                            { show: !!isSubmitTemplate && !!onSubmitTemplate, onClick: () => onSubmitTemplate?.(), icon: Save, label: "Submit Template", iconClass: "w-4 h-4" },
                            { show: !!isSyncTemplate && !!onSyncTemplate, onClick: () => onSyncTemplate?.(), icon: Save, label: "Sync Template", iconClass: "w-4 h-4" },
                            { show: !!isExecute && !!onExecute, onClick: () => onExecute?.(), icon: Play, label: "Execute Order", customClass: isDarkMode ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-emerald-500 hover:bg-emerald-50' },
                        ].filter(item => item.show).length > 0 && (
                                <div className="px-1.5 space-y-0.5">
                                    {[
                                        { show: !!isSummary && !!onSummary, onClick: () => onSummary?.(), icon: Sparkles, label: "Summary" },
                                        { show: !!isRefresh && !!onRefresh, onClick: () => onRefresh?.(), icon: RefreshCw, label: "Refresh" },
                                        { show: !!isSubmitTemplate && !!onSubmitTemplate, onClick: () => onSubmitTemplate?.(), icon: Save, label: "Submit", iconClass: "w-4 h-4" },
                                        { show: !!isSyncTemplate && !!onSyncTemplate, onClick: () => onSyncTemplate?.(), icon: Save, label: "Sync", iconClass: "w-4 h-4" },
                                        { show: !!isExecute && !!onExecute, onClick: () => onExecute?.(), icon: Play, label: "Execute", customClass: isDarkMode ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-emerald-500 hover:bg-emerald-50' },
                                    ].map((item: any, index) => {
                                        if (!item.show) return null;
                                        const Icon = item.icon;
                                        return (
                                            <button
                                                key={index}
                                                onClick={(e) => { e.stopPropagation(); item.onClick(); setIsOpen(false); }}
                                                className={cn(
                                                    "w-full flex items-center space-x-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-all group",
                                                    item.customClass || (isDarkMode
                                                        ? 'text-white/70 hover:bg-white/5 hover:text-white'
                                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')
                                                )}
                                            >
                                                <Icon className={cn("shrink-0", item.iconClass || "w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity")} />
                                                <span className="truncate">{item.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                        {/* Divider if needed */}
                        {([
                            { show: !!isView && !!onView }, { show: !!isMessage && !!onMessage }, { show: !!isEdit && !!onEdit }, { show: !!isAnswer && !!onAnswer }, { show: !!isWhatsAppConfig && !!onWhatsAppConfig },
                            { show: !!isSummary && !!onSummary }, { show: !!isRefresh && !!onRefresh }, { show: !!isSubmitTemplate && !!onSubmitTemplate }, { show: !!isSyncTemplate && !!onSyncTemplate }, { show: !!isExecute && !!onExecute }
                        ].some(i => i.show)) && ([
                            { show: !!isDelete && !!onDelete }, { show: (user?.role === "tenant_admin" || user?.role === "super_admin") && !!isRestore && !!onRestore }, { show: (user?.role === "tenant_admin" || user?.role === "super_admin") && !!isPermanentDelete && !!onPermanentDelete }
                        ].some(i => i.show)) && (
                                <div className={cn("mx-3 my-1.5 h-px", isDarkMode ? "bg-white/5" : "bg-slate-100")} />
                            )}

                        {/* Group 3: Destructive Actions */}
                        {[
                            { show: !!isDelete && !!onDelete, onClick: () => onDelete?.(), icon: Trash2, label: "Remove", customClass: isDarkMode ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50' },
                            { show: (user?.role === "tenant_admin" || user?.role === "super_admin") && !!isRestore && !!onRestore, onClick: () => onRestore?.(), icon: Save, label: "Restore", customClass: isDarkMode ? 'text-green-400 hover:bg-green-500/10' : 'text-green-500 hover:bg-green-50' },
                            { show: (user?.role === "tenant_admin" || user?.role === "super_admin") && !!isPermanentDelete && !!onPermanentDelete, onClick: () => onPermanentDelete?.(), icon: Trash2, label: "Delete Forever", customClass: isDarkMode ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50' },
                        ].filter((item: any) => item.show).length > 0 && (
                                <div className="px-1.5 space-y-0.5">
                                    {[
                                        { show: !!isDelete && !!onDelete, onClick: () => onDelete?.(), icon: Trash2, label: "Remove", customClass: isDarkMode ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50' },
                                        { show: (user?.role === "tenant_admin" || user?.role === "super_admin") && !!isRestore && !!onRestore, onClick: () => onRestore?.(), icon: Save, label: "Restore", customClass: isDarkMode ? 'text-green-400 hover:bg-green-500/10' : 'text-green-500 hover:bg-green-50' },
                                        { show: (user?.role === "tenant_admin" || user?.role === "super_admin") && !!isPermanentDelete && !!onPermanentDelete, onClick: () => onPermanentDelete?.(), icon: Trash2, label: "Delete Forever", customClass: isDarkMode ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50' },
                                    ].map((item: any, index) => {
                                        if (!item.show) return null;
                                        const Icon = item.icon;
                                        return (
                                            <button
                                                key={index}
                                                onClick={(e) => { e.stopPropagation(); item.onClick(); setIsOpen(false); }}
                                                className={cn(
                                                    "w-full flex items-center space-x-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-all group",
                                                    item.customClass || (isDarkMode
                                                        ? 'text-white/70 hover:bg-white/5 hover:text-white'
                                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')
                                                )}
                                            >
                                                <Icon className={cn("shrink-0", item.iconClass || "w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity")} />
                                                <span className="truncate">{item.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};