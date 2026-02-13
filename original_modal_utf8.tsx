"use client";

import { useState } from 'react';
import { X, Search, FileText, Image as ImageIcon, File, Video, Grid3x3, Loader2, AlertCircle } from 'lucide-react';
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { useTheme } from '@/hooks/useTheme';
import { useTemplates } from '@/hooks/useTemplates';

export interface ProcessedTemplate {
    id: string;
    name: string;
    category: string;
    description: string;
    type: 'text' | 'image' | 'file' | 'video' | 'carousel';
    variables: number;
    // Add raw components if needed for advanced preview, but description (body) is usually enough
    originalDetails?: any;
    variableArray?: any[]; // Add parsed variables to processed template
    headerText?: string;
    footerText?: string;
}

interface TemplateSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (template: ProcessedTemplate) => void;
}

type CategoryType = 'marketing' | 'utility' | 'authentication';
type TemplateType = 'all' | 'text' | 'image' | 'file' | 'video' | 'carousel';



export const TemplateSelectionModal = ({ isOpen, onClose, onSelect }: TemplateSelectionModalProps) => {
    const { isDarkMode } = useTheme();
    const { templates: apiTemplates, loading, error, refetch } = useTemplates();
    const [activeCategory, setActiveCategory] = useState<CategoryType>('marketing');
    const [activeType, setActiveType] = useState<TemplateType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<ProcessedTemplate | null>(null);

    const categories: { id: CategoryType; label: string }[] = [
        { id: 'marketing', label: 'Marketing' },
        { id: 'utility', label: 'Utility' },
        { id: 'authentication', label: 'Authentication' },
    ];

    const types: { id: TemplateType; label: string; icon: any }[] = [
        { id: 'all', label: 'All', icon: Grid3x3 },
        { id: 'text', label: 'Text', icon: FileText },
        { id: 'image', label: 'Image', icon: ImageIcon },
        { id: 'file', label: 'File', icon: File },
        { id: 'video', label: 'Video', icon: Video },
        { id: 'carousel', label: 'Carousel', icon: Grid3x3 },
    ];

    // Map API templates to component format
    const templates: ProcessedTemplate[] = apiTemplates
        .filter(t => t.status?.toUpperCase() === 'APPROVED')
        .map(t => {
            // Extract data from components if standard fields are missing
            let bodyText = t.body;
            let headerType = t.header_type;

            if (Array.isArray(t.components)) {
                // Support both 'component_type' (your API) and 'type' (Standard Meta API)
                const bodyComponent = t.components.find((c: any) =>
                    c.component_type?.toLowerCase() === 'body' || c.type?.toLowerCase() === 'body'
                );
                if (bodyComponent && !bodyText) bodyText = bodyComponent.text_content || bodyComponent.text;

                const headerComponent = t.components.find((c: any) =>
                    c.component_type?.toLowerCase() === 'header' || c.type?.toLowerCase() === 'header'
                );
                if (headerComponent && !headerType) headerType = headerComponent.header_format || headerComponent.format;
            }

            // Extract Header/Footer Text explicitly
            let headerText = '';
            let footerText = '';
            if (Array.isArray(t.components)) {
                const h = t.components.find((c: any) => c.component_type?.toLowerCase() === 'header' || c.type?.toLowerCase() === 'header');
                if (h) headerText = h.text_content || h.text || '';
                const f = t.components.find((c: any) => c.component_type?.toLowerCase() === 'footer' || c.type?.toLowerCase() === 'footer');
                if (f) footerText = f.text_content || f.text || '';
            }

            return {
                id: t.template_id || t.id || '',
                name: t.name || t.template_name || (t as any).element_name || t.id || 'Untitled',
                category: (t.category?.toLowerCase() as any) || 'marketing',
                description: bodyText?.substring(0, 100) || 'No description',
                type: (headerType ? headerType.toLowerCase() : 'text') as any,
                variables: t.variables_count || t.variables?.length || 0,
                variableArray: t.variables || [],
                headerText,
                footerText,
            };
        });

    const filteredTemplates = templates.filter(template => {
        // Filter by status (APPROVED only) - Check original API template status if available
        // Since we mapped it, we need to access original from apiTemplates or ensure mapping carries it.
        // Better approach: Filter apiTemplates BEFORE mapping or check matching apiTemplate here.
        // But since we already mapped, let's just make sure we map status or check it.
        // Wait, ProcessedTemplate doesn't have status. 
        // Let's modify the map function to include filtering source.
        return true;
    }).filter(template => {
        // ... existing name/category filters

        const matchesCategory = template.category === activeCategory;
        const matchesType = activeType === 'all' || template.type === activeType;
        const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesType && matchesSearch;
    });

    const handleSelect = () => {
        if (selectedTemplate) {
            onSelect(selectedTemplate);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <GlassCard
                isDarkMode={isDarkMode}
                className="w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                    <h2 className={cn("text-2xl font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                        Select Template
                    </h2>
                    <button
                        onClick={onClose}
                        className={cn(
                            "p-2 rounded-lg transition-all",
                            isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                        )}
                    >
                        <X size={20} className={isDarkMode ? 'text-white/60' : 'text-slate-600'} />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className={cn(
                        "w-48 border-r p-4 space-y-2",
                        isDarkMode ? 'border-white/10' : 'border-slate-200'
                    )}>
                        {/* Categories */}
                        <div className="space-y-1 mb-6">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setActiveCategory(category.id)}
                                    className={cn(
                                        "w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-all",
                                        activeCategory === category.id
                                            ? 'bg-emerald-500 text-white'
                                            : isDarkMode
                                                ? 'text-white/60 hover:bg-white/5'
                                                : 'text-slate-600 hover:bg-slate-100'
                                    )}
                                >
                                    {category.label}
                                </button>
                            ))}
                        </div>

                        {/* Type Filters */}
                        <div className="space-y-1">
                            {types.map((type) => {
                                const Icon = type.icon;
                                return (
                                    <button
                                        key={type.id}
                                        onClick={() => setActiveType(type.id)}
                                        className={cn(
                                            "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                                            activeType === type.id
                                                ? isDarkMode ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-900'
                                                : isDarkMode
                                                    ? 'text-white/40 hover:bg-white/5'
                                                    : 'text-slate-500 hover:bg-slate-50'
                                        )}
                                    >
                                        <Icon size={14} />
                                        {type.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Search */}
                        <div className="p-4 border-b border-white/10">
                            <div className="relative">
                                <Search size={18} className={cn("absolute left-3 top-1/2 -translate-y-1/2", isDarkMode ? 'text-white/30' : 'text-slate-400')} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search template"
                                    className={cn(
                                        "w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm outline-none transition-all",
                                        isDarkMode
                                            ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30'
                                            : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                                    )}
                                />
                            </div>
                        </div>

                        {/* Templates Grid */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 size={48} className={cn("animate-spin", isDarkMode ? 'text-white/40' : 'text-slate-400')} />
                                    <p className={cn("text-sm mt-4", isDarkMode ? 'text-white/40' : 'text-slate-400')}>
                                        Loading templates...
                                    </p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <AlertCircle size={48} className="text-red-500" />
                                    <p className={cn("text-sm mt-4 font-semibold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                        {error}
                                    </p>
                                    <button
                                        onClick={refetch}
                                        className="mt-4 px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-all"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {filteredTemplates.map((template) => (
                                            <button
                                                key={template.id}
                                                onClick={() => setSelectedTemplate(template)}
                                                className={cn(
                                                    "p-4 rounded-xl border-2 text-left transition-all hover:scale-105",
                                                    selectedTemplate?.id === template.id
                                                        ? 'border-emerald-500 bg-emerald-500/10'
                                                        : isDarkMode
                                                            ? 'border-white/10 bg-white/5 hover:border-white/20'
                                                            : 'border-slate-200 bg-white hover:border-slate-300'
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-12 h-12 rounded-lg flex items-center justify-center mb-3",
                                                    isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'
                                                )}>
                                                    <FileText size={24} className="text-emerald-500" />
                                                </div>
                                                <h3 className={cn("text-sm font-bold mb-1", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                                    {template.name}
                                                </h3>
                                                <p className={cn("text-xs line-clamp-2", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                                    {template.description}
                                                </p>
                                                <div className="flex items-center gap-2 mt-3">
                                                    <span className={cn(
                                                        "text-[10px] px-2 py-0.5 rounded uppercase font-bold",
                                                        isDarkMode ? 'bg-white/10 text-white/60' : 'bg-slate-100 text-slate-600'
                                                    )}>
                                                        {template.id}
                                                    </span>
                                                    {template.variables > 0 && (
                                                        <span className={cn(
                                                            "text-[10px] px-2 py-0.5 rounded font-semibold",
                                                            isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                                                        )}>
                                                            {template.variables} var{template.variables > 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    {!loading && !error && filteredTemplates.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <FileText size={48} className={cn(isDarkMode ? 'text-white/20' : 'text-slate-300')} />
                                            <p className={cn("text-sm mt-4", isDarkMode ? 'text-white/40' : 'text-slate-400')}>
                                                No templates found
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/10 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                                    isDarkMode
                                        ? 'text-white/60 hover:bg-white/10'
                                        : 'text-slate-600 hover:bg-slate-100'
                                )}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSelect}
                                disabled={!selectedTemplate}
                                className={cn(
                                    "px-6 py-2 rounded-lg text-sm font-semibold transition-all",
                                    selectedTemplate
                                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                        : 'bg-white/10 text-white/40 cursor-not-allowed'
                                )}
                            >
                                Select Template
                            </button>
                        </div>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};
