"use client";

import { cn } from "@/lib/utils";
import { X, Search, FileText, Image as ImageIcon, File, Video, BookOpen } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";

type TemplateCategory = 'marketing' | 'utility' | 'authentication';

interface Template {
    id: string;
    name: string;
    category: TemplateCategory;
    preview: string;
    content: string;
}

interface TemplateSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (template: Template) => void;
    isDarkMode: boolean;
}

const SAMPLE_TEMPLATES: Template[] = [
    {
        id: '1',
        name: 'vis_law_visiting',
        category: 'marketing',
        preview: "You've taken the first step toward transforming your legal career with practical, real-world learning...",
        content: `You've taken the first step toward transforming your legal career with practical, real-world learning that every young advocate needs.

Inside the DOP program, you will learn:
✓ The complete DOP Framework for faster growth
✓ Court procedures simplified step-by-step
✓ Drafting, filing & client-handling techniques
✓ Exposure to Civil, Criminal, Corporate, Family & more
✓ How to use AI tools to speed up legal work`
    },
    {
        id: '2',
        name: 'nov30',
        category: 'marketing',
        preview: 'Hello 👋, This is an update for students...',
        content: 'Hello 👋, This is an update for students regarding the upcoming session.'
    },
    {
        id: '3',
        name: 'nov8dop',
        category: 'marketing',
        preview: "As discussed in today's class, here's th...",
        content: "As discussed in today's class, here's the complete information about the DOP program."
    },
    {
        id: '4',
        name: 'appointment_reminder',
        category: 'utility',
        preview: 'Your appointment is scheduled for...',
        content: 'Your appointment is scheduled for tomorrow at 10:00 AM. Please arrive 10 minutes early.'
    },
    {
        id: '5',
        name: 'otp_verification',
        category: 'authentication',
        preview: 'Your OTP is: {{otp}}',
        content: 'Your OTP is: {{otp}}. This code will expire in 5 minutes.'
    },
];

export const TemplateSelectionModal = ({
    isOpen,
    onClose,
    onSelect,
    isDarkMode
}: TemplateSelectionModalProps) => {
    const [activeCategory, setActiveCategory] = useState<TemplateCategory>('marketing');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'text' | 'image' | 'file' | 'video' | 'carousel'>('all');

    if (!isOpen) return null;

    const filteredTemplates = SAMPLE_TEMPLATES.filter(template => {
        const matchesCategory = template.category === activeCategory;
        const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.preview.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const categories = [
        { id: 'marketing' as TemplateCategory, label: 'Marketing' },
        { id: 'utility' as TemplateCategory, label: 'Utility' },
        { id: 'authentication' as TemplateCategory, label: 'Authentication' },
    ];

    const filters = [
        { id: 'all' as const, label: 'All', icon: BookOpen },
        { id: 'text' as const, label: 'Text', icon: FileText },
        { id: 'image' as const, label: 'Image', icon: ImageIcon },
        { id: 'file' as const, label: 'File', icon: File },
        { id: 'video' as const, label: 'Video', icon: Video },
        { id: 'carousel' as const, label: 'Carousel', icon: BookOpen },
    ];

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={cn(
                "relative w-full max-w-5xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200",
                isDarkMode
                    ? 'bg-[#1c1c21] border border-white/10'
                    : 'bg-white border border-slate-200'
            )}>
                {/* Header */}
                <div className={cn(
                    "flex items-center justify-between p-6 border-b",
                    isDarkMode ? 'border-white/5' : 'border-slate-200'
                )}>
                    <div>
                        <h2 className={cn("text-xl font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                            Select Template
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className={cn(
                            "p-2 rounded-lg transition-colors",
                            isDarkMode
                                ? 'hover:bg-white/10 text-white/60 hover:text-white'
                                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                        )}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Category Tabs */}
                <div className={cn(
                    "flex border-b px-6",
                    isDarkMode ? 'border-white/5' : 'border-slate-200'
                )}>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={cn(
                                "px-4 py-3 text-sm font-medium transition-all relative",
                                activeCategory === category.id
                                    ? isDarkMode
                                        ? 'text-emerald-500'
                                        : 'text-emerald-600'
                                    : isDarkMode
                                        ? 'text-white/60 hover:text-white/80'
                                        : 'text-slate-600 hover:text-slate-900'
                            )}
                        >
                            {category.label}
                            {activeCategory === category.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex h-[calc(85vh-140px)]">
                    {/* Sidebar Filters */}
                    <div className={cn(
                        "w-48 border-r p-4 space-y-2 overflow-y-auto",
                        isDarkMode ? 'border-white/5 bg-white/5' : 'border-slate-200 bg-slate-50'
                    )}>
                        {filters.map((filter) => {
                            const Icon = filter.icon;
                            return (
                                <button
                                    key={filter.id}
                                    onClick={() => setSelectedFilter(filter.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                                        selectedFilter === filter.id
                                            ? isDarkMode
                                                ? 'bg-emerald-500/10 text-emerald-500'
                                                : 'bg-emerald-50 text-emerald-600'
                                            : isDarkMode
                                                ? 'text-white/60 hover:bg-white/5 hover:text-white'
                                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    )}
                                >
                                    <Icon size={16} />
                                    {filter.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Templates Grid */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        {/* Search */}
                        <div className="mb-6 relative">
                            <Search size={18} className={cn(
                                "absolute left-3 top-1/2 -translate-y-1/2",
                                isDarkMode ? 'text-white/30' : 'text-slate-400'
                            )} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search Template"
                                className={cn(
                                    "w-full pl-10 pr-4 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all",
                                    isDarkMode
                                        ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30'
                                        : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                                )}
                            />
                        </div>

                        {/* Template Cards */}
                        <div className="grid grid-cols-3 gap-4">
                            {filteredTemplates.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => {
                                        onSelect(template);
                                        onClose();
                                    }}
                                    className={cn(
                                        "p-5 rounded-xl border text-left transition-all hover:scale-[1.02] group relative overflow-hidden",
                                        isDarkMode
                                            ? 'bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10'
                                            : 'bg-gradient-to-br from-white to-slate-50/50 border-slate-200 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10'
                                    )}
                                >
                                    {/* Hover gradient overlay */}
                                    <div className={cn(
                                        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity",
                                        isDarkMode
                                            ? 'bg-gradient-to-br from-emerald-500/5 to-transparent'
                                            : 'bg-gradient-to-br from-emerald-50 to-transparent'
                                    )} />

                                    {/* Template Icon/Preview */}
                                    <div className={cn(
                                        "relative w-full h-36 rounded-lg mb-4 flex items-center justify-center overflow-hidden",
                                        isDarkMode ? 'bg-white/5' : 'bg-slate-100'
                                    )}>
                                        <div className={cn(
                                            "absolute inset-0 opacity-20",
                                            isDarkMode
                                                ? 'bg-gradient-to-br from-emerald-500/20 to-transparent'
                                                : 'bg-gradient-to-br from-emerald-100 to-transparent'
                                        )} />
                                        <FileText size={56} className={cn(
                                            "relative z-10 transition-all group-hover:scale-110",
                                            isDarkMode ? 'text-emerald-400/60' : 'text-emerald-600/60'
                                        )} />
                                    </div>

                                    {/* Template Name */}
                                    <h3 className={cn(
                                        "relative text-sm font-bold mb-2 truncate",
                                        isDarkMode ? 'text-white' : 'text-slate-900'
                                    )}>
                                        {template.name}
                                    </h3>

                                    {/* Template Preview */}
                                    <p className={cn(
                                        "relative text-xs line-clamp-3 leading-relaxed",
                                        isDarkMode ? 'text-white/60' : 'text-slate-600'
                                    )}>
                                        {template.preview}
                                    </p>

                                    {/* Select indicator */}
                                    <div className={cn(
                                        "relative mt-3 pt-3 border-t flex items-center gap-2 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity",
                                        isDarkMode ? 'border-white/10 text-emerald-400' : 'border-slate-200 text-emerald-600'
                                    )}>
                                        <span>Select Template</span>
                                        <span className="text-lg">→</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {filteredTemplates.length === 0 && (
                            <div className="text-center py-16">
                                <FileText size={48} className={cn(
                                    "mx-auto mb-4",
                                    isDarkMode ? 'text-white/20' : 'text-slate-300'
                                )} />
                                <p className={cn("text-sm font-medium mb-1", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                    No templates found
                                </p>
                                <p className={cn("text-xs", isDarkMode ? 'text-white/40' : 'text-slate-400')}>
                                    Try adjusting your search or filters
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
