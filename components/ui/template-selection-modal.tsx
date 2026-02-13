"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, FileText, Image as ImageIcon, File, Video, Grid3x3, Loader2, AlertCircle, Sparkles, Check } from 'lucide-react';
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { useTheme } from '@/hooks/useTheme';
import { useTemplates } from '@/hooks/useTemplates';
import { useSyncAllTemplateMutation } from '@/hooks/useTemplateQuery';
import { toast } from 'sonner';

export interface ProcessedTemplate {
    id: string;
    name: string;
    category: string;
    description: string;
    type: 'text' | 'image' | 'file' | 'video' | 'carousel';
    variables: number;
    originalDetails?: any;
    variableArray?: any[];
    headerText?: string;
    footerText?: string;
}

interface TemplateSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (template: ProcessedTemplate, components?: any[]) => void;
}

type CategoryType = 'marketing' | 'utility' | 'authentication';
type TemplateType = 'all' | 'text' | 'image' | 'file' | 'video' | 'carousel';

export const TemplateSelectionModal = ({ isOpen, onClose, onSelect }: TemplateSelectionModalProps) => {
    const { isDarkMode } = useTheme();
    const { templates: apiTemplates, loading, error, refetch } = useTemplates();
    const { mutate: syncMeta, isPending: isSyncing } = useSyncAllTemplateMutation();
    const [activeCategory, setActiveCategory] = useState<CategoryType>('marketing');
    const [activeType, setActiveType] = useState<TemplateType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<ProcessedTemplate | null>(null);
    const [headerValues, setHeaderValues] = useState<string[]>([]);
    const [bodyValues, setBodyValues] = useState<string[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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

    const templates: ProcessedTemplate[] = apiTemplates
        .filter(t => t.status?.toUpperCase() === 'APPROVED')
        .map(t => {
            let bodyText = t.body;
            let headerType = t.header_type;

            if (Array.isArray(t.components)) {
                const bodyComponent = t.components.find((c: any) =>
                    c.component_type?.toLowerCase() === 'body' || c.type?.toLowerCase() === 'body'
                );
                if (bodyComponent && !bodyText) bodyText = bodyComponent.text_content || bodyComponent.text;

                const headerComponent = t.components.find((c: any) =>
                    c.component_type?.toLowerCase() === 'header' || c.type?.toLowerCase() === 'header'
                );
                if (headerComponent && !headerType) headerType = headerComponent.header_format || headerComponent.format;
            }

            let headerText = '';
            let footerText = '';
            if (Array.isArray(t.components)) {
                const h = t.components.find((c: any) => c.component_type?.toLowerCase() === 'header' || c.type?.toLowerCase() === 'header');
                if (h) headerText = h.text_content || h.text || '';
                const f = t.components.find((c: any) => c.component_type?.toLowerCase() === 'footer' || c.type?.toLowerCase() === 'footer');
                if (f) footerText = f.text_content || f.text || '';
            }

            return {
                id: (t.template_id || t.id || '').toString(),
                name: t.name || t.template_name || (t as any).element_name || t.id || 'Untitled',
                category: (t.category?.toLowerCase() as any) || 'marketing',
                description: bodyText || 'No description',
                type: (headerType ? headerType.toLowerCase() : 'text') as any,
                variables: t.variables_count || t.variables?.length || 0,
                variableArray: t.variables || [],
                headerText,
                footerText,
            };
        });

    const filteredTemplates = templates.filter(template => {
        const matchesCategory = template.category === activeCategory;
        const matchesType = activeType === 'all' || template.type === activeType;
        const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesType && matchesSearch;
    });

    useEffect(() => {
        if (selectedTemplate) {
            const hVars = (selectedTemplate.headerText?.match(/\{\{\d+\}\}/g) || []).length;
            setHeaderValues(new Array(hVars).fill(""));
            const bVars = (selectedTemplate.description?.match(/\{\{\d+\}\}/g) || []).length;
            setBodyValues(new Array(bVars).fill(""));
        } else {
            setHeaderValues([]);
            setBodyValues([]);
        }
    }, [selectedTemplate]);

    const handleSelect = () => {
        if (selectedTemplate) {
            const components = [];
            if (headerValues.some(v => v)) {
                components.push({
                    type: "header",
                    parameters: headerValues.map(val => ({ type: "text", text: val }))
                });
            }
            if (bodyValues.some(v => v)) {
                components.push({
                    type: "body",
                    parameters: bodyValues.map(val => ({ type: "text", text: val }))
                });
            }
            onSelect(selectedTemplate, components.length > 0 ? components : undefined);
            onClose();
        }
    };

    const renderPreviewWithHighlight = (text: string, values: string[]) => {
        if (!text) return null;
        let preview = text;
        values.forEach((val, i) => {
            const placeholder = `{{${i + 1}}}`;
            const replacement = `<span class="text-emerald-500 font-bold bg-emerald-500/10 px-1 rounded mx-0.5">${val || placeholder}</span>`;
            preview = preview.split(placeholder).join(replacement);
        });
        return <div dangerouslySetInnerHTML={{ __html: preview }} />;
    };

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md">
            <GlassCard
                isDarkMode={isDarkMode}
                className="w-full max-w-7xl h-full max-h-[90vh] overflow-hidden flex flex-col border-white/10"
            >
                {/* Modal Header */}
                <div className="flex justify-between items-center px-8 py-5 border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <Grid3x3 className="text-emerald-500" size={20} />
                        </div>
                        <div>
                            <h2 className={cn("text-xl font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                Template Selection
                            </h2>
                            <p className={cn("text-[10px] uppercase font-bold tracking-widest opacity-40")}>Select and configure your meta templates</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={cn(
                            "p-2 rounded-lg transition-all",
                            isDarkMode ? 'hover:bg-white/10 text-white/50' : 'hover:bg-slate-100 text-slate-400'
                        )}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* 3-Column Content Layout */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Sidebar: Navigation & Filters */}
                    <div className={cn(
                        "w-64 border-r p-6 flex flex-col gap-8 shrink-0",
                        isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50/50'
                    )}>
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-2">Categories</h3>
                            <div className="space-y-1">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => setActiveCategory(category.id)}
                                        className={cn(
                                            "w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between group",
                                            activeCategory === category.id
                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                : isDarkMode
                                                    ? 'text-white/60 hover:bg-white/5 hover:text-white'
                                                    : 'text-slate-600 hover:bg-slate-200/50'
                                        )}
                                    >
                                        {category.label}
                                        {activeCategory === category.id && <Check size={14} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-2">Message Format</h3>
                            <div className="space-y-1">
                                {types.map((type) => {
                                    const Icon = type.icon;
                                    return (
                                        <button
                                            key={type.id}
                                            onClick={() => setActiveType(type.id)}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                                                activeType === type.id
                                                    ? isDarkMode ? 'bg-white/10 text-white shadow-inner' : 'bg-white text-emerald-600 shadow-sm'
                                                    : isDarkMode
                                                        ? 'text-white/40 hover:bg-white/5 hover:text-white'
                                                        : 'text-slate-500 hover:bg-slate-200/50'
                                            )}
                                        >
                                            <Icon size={16} className={activeType === type.id ? "text-emerald-500" : "opacity-40"} />
                                            {type.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-auto space-y-4">
                            <button
                                onClick={() => {
                                    syncMeta(undefined, {
                                        onSuccess: () => {
                                            toast.success('Templates synced from Meta');
                                            refetch();
                                        },
                                        onError: () => toast.error('Failed to sync templates')
                                    });
                                }}
                                disabled={isSyncing}
                                className={cn(
                                    "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all border group",
                                    isDarkMode
                                        ? "bg-emerald-500 shadow-lg shadow-emerald-900/40 text-white hover:brightness-110"
                                        : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
                                )}
                            >
                                {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="group-hover:animate-pulse" />}
                                <span>{isSyncing ? 'SYNCING...' : 'SYNC META DATA'}</span>
                            </button>
                            <p className="text-[9px] text-center text-slate-500 font-bold uppercase tracking-wider">Update your templates from Meta</p>
                        </div>
                    </div>

                    {/* Middle Column: Templates Grid & Search */}
                    <div className="flex-1 flex flex-col min-w-0 bg-white/[0.01]">
                        {/* Search & Stats */}
                        <div className="p-6 border-b border-white/5 flex items-center gap-6 shrink-0">
                            <div className="relative flex-1 group">
                                <Search size={18} className={cn("absolute left-4 top-1/2 -translate-y-1/2 transition-colors", isDarkMode ? 'text-white/20 group-focus-within:text-emerald-500' : 'text-slate-400 group-focus-within:text-emerald-600')} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search Meta templates by name or content..."
                                    className={cn(
                                        "w-full pl-12 pr-4 py-3.5 rounded-2xl border text-sm outline-none transition-all shadow-sm",
                                        isDarkMode
                                            ? 'bg-black/40 border-white/10 text-white placeholder:text-white/20 focus:border-emerald-500/50 active:bg-black/60'
                                            : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500/50'
                                    )}
                                />
                            </div>
                            <div className="shrink-0 flex items-center gap-3">
                                <div className={cn("px-4 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest", isDarkMode ? "bg-white/5 border-white/10 text-white/40" : "bg-slate-100 border-slate-200 text-slate-500")}>
                                    {filteredTemplates.length} Found
                                </div>
                            </div>
                        </div>

                        {/* Templates List */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <div className="relative">
                                        <Loader2 size={64} className="animate-spin text-emerald-500 opacity-20" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Sparkles size={24} className="text-emerald-500 animate-pulse" />
                                        </div>
                                    </div>
                                    <p className={cn("mt-6 text-xs font-bold uppercase tracking-[0.3em] opacity-40")}>Synchronizing...</p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto">
                                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                                        <AlertCircle size={32} className="text-red-500" />
                                    </div>
                                    <h4 className="font-bold mb-2">Sync Error</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed mb-6">{error}</p>
                                    <button onClick={refetch} className="px-8 py-3 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all active:scale-95">RETRY CONNECTION</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                                    {filteredTemplates.map((template) => (
                                        <button
                                            key={template.id}
                                            onClick={() => setSelectedTemplate(template)}
                                            className={cn(
                                                "p-6 rounded-2xl border-2 text-left transition-all relative group flex flex-col h-[220px]",
                                                selectedTemplate?.id === template.id
                                                    ? 'border-emerald-500 bg-emerald-500/5 shadow-2xl shadow-emerald-500/20 z-10'
                                                    : isDarkMode
                                                        ? 'border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                                                        : 'border-slate-100 bg-white hover:border-slate-300 shadow-sm'
                                            )}
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                                                    isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-50'
                                                )}>
                                                    <FileText size={20} className="text-emerald-500" />
                                                </div>
                                                {selectedTemplate?.id === template.id && (
                                                    <div className="bg-emerald-500 text-white rounded-full p-1 shadow-lg animate-in zoom-in">
                                                        <Check size={12} />
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className={cn("text-sm font-bold mb-1.5 truncate pr-8", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                                {template.name}
                                            </h3>
                                            <p className={cn("text-xs line-clamp-3 mb-6 flex-1 italic opacity-60 leading-relaxed", isDarkMode ? 'text-white/60' : 'text-slate-500')}>
                                                "{template.description}"
                                            </p>
                                            <div className="flex items-center gap-2 pt-4 border-t border-white/5 mt-auto">
                                                <span className={cn("text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-widest", isDarkMode ? 'bg-white/10 text-white/40' : 'bg-slate-100 text-slate-500')}>META</span>
                                                {template.variables > 0 && (
                                                    <span className={cn("text-[10px] px-2 py-0.5 rounded font-bold ml-auto", isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600')}>
                                                        VARS: {template.variables}
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {!loading && !error && filteredTemplates.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full opacity-30 grayscale pointer-events-none">
                                    <Search size={86} strokeWidth={1} className="mb-6" />
                                    <p className="text-sm font-bold uppercase tracking-[0.4em]">No results match search</p>
                                </div>
                            )}
                        </div>

                        {/* Middle Column Footer: Actions */}
                        <div className="p-6 border-t border-white/5 flex items-center justify-end gap-3 bg-white/[0.01]">
                            <button
                                onClick={onClose}
                                className={cn(
                                    "px-8 py-3 rounded-xl text-xs font-bold transition-all",
                                    isDarkMode ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:bg-slate-100'
                                )}
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={handleSelect}
                                disabled={!selectedTemplate}
                                className={cn(
                                    "px-10 py-3 rounded-xl text-xs font-bold transition-all shadow-2xl flex items-center gap-2",
                                    selectedTemplate
                                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-[1.02] active:scale-95 shadow-emerald-500/20'
                                        : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                                )}
                            >
                                CONFIRM SELECTION
                                <Check size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Preview & Variable Config */}
                    <div className={cn(
                        "w-[400px] border-l flex flex-col shrink-0 overflow-hidden shadow-2xl z-20",
                        isDarkMode ? 'border-white/10 bg-black/40' : 'border-slate-200 bg-white shadow-slate-200'
                    )}>
                        {selectedTemplate ? (
                            <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar">
                                {/* Preview Banner */}
                                <div className="h-2 w-full bg-emerald-500" />
                                <div className="p-8 space-y-8">
                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest px-1">Active Template Info</h3>
                                        <div className={cn("p-5 rounded-2xl border space-y-5 shadow-sm", isDarkMode ? "bg-white/[0.03] border-white/10" : "bg-slate-50 border-slate-200")}>
                                            <div>
                                                <p className="text-[9px] uppercase font-bold text-slate-500 mb-1">Internal Reference</p>
                                                <p className={cn("text-xs font-bold truncate", isDarkMode ? "text-white" : "text-slate-900")}>{selectedTemplate.name}</p>
                                            </div>
                                            <div className="flex gap-10">
                                                <div>
                                                    <p className="text-[9px] uppercase font-bold text-slate-500 mb-1">Category</p>
                                                    <p className="text-[11px] font-black text-emerald-500 uppercase">{selectedTemplate.category}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] uppercase font-bold text-slate-500 mb-1">Type</p>
                                                    <p className="text-[11px] font-black text-blue-500 uppercase">{selectedTemplate.type}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Real-time Content Preview */}
                                    <div className="space-y-4">
                                        <h3 className={cn("text-[10px] font-bold uppercase tracking-widest", isDarkMode ? "text-white/40" : "text-slate-500")}>Message Visualizer</h3>
                                        <div className={cn(
                                            "p-6 rounded-3xl border text-[13px] leading-relaxed relative overflow-hidden shadow-2xl",
                                            isDarkMode ? "bg-emerald-500/5 border-emerald-500/20 text-white/90" : "bg-emerald-50/50 border-emerald-100/50 text-slate-800"
                                        )}>
                                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-2 mb-4 opacity-30 pb-3 border-b border-emerald-500/10">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                    <p className="text-[9px] font-bold uppercase italic">Verified Preview</p>
                                                </div>
                                                {renderPreviewWithHighlight(selectedTemplate.description, bodyValues)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Variable Inputs: Header */}
                                    {headerValues.length > 0 && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                                                <h3 className={cn("text-[10px] font-bold uppercase tracking-widest", isDarkMode ? "text-white/40" : "text-slate-500")}>Header Configuration</h3>
                                            </div>
                                            <div className="space-y-4">
                                                {headerValues.map((val, i) => (
                                                    <div key={`h-var-${i}`} className="space-y-1.5 px-1">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <label className="text-[10px] font-bold text-slate-400">Parameter {"{{"}{i + 1}{"}}"}</label>
                                                            <span className="text-[8px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded uppercase font-black">Header Var</span>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={val}
                                                            onChange={(e) => {
                                                                const n = [...headerValues];
                                                                n[i] = e.target.value;
                                                                setHeaderValues(n);
                                                            }}
                                                            placeholder={`Define value for {{${i + 1}}}...`}
                                                            className={cn(
                                                                "w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none",
                                                                isDarkMode
                                                                    ? "bg-black/50 border-white/10 text-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10"
                                                                    : "bg-white border-slate-200 text-slate-900 focus:border-emerald-500 shadow-sm"
                                                            )}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Variable Inputs: Body */}
                                    {bodyValues.length > 0 && (
                                        <div className="space-y-4 pb-10">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1 h-4 bg-blue-500 rounded-full" />
                                                <h3 className={cn("text-[10px] font-bold uppercase tracking-widest", isDarkMode ? "text-white/40" : "text-slate-500")}>Body Configuration</h3>
                                            </div>
                                            <div className="space-y-4">
                                                {bodyValues.map((val, i) => (
                                                    <div key={`b-var-${i}`} className="space-y-1.5 px-1">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <label className="text-[10px] font-bold text-slate-400">Parameter {"{{"}{i + 1}{"}}"}</label>
                                                            <span className="text-[8px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded uppercase font-black">Body Var</span>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={val}
                                                            onChange={(e) => {
                                                                const n = [...bodyValues];
                                                                n[i] = e.target.value;
                                                                setBodyValues(n);
                                                            }}
                                                            placeholder={`Define value for {{${i + 1}}}...`}
                                                            className={cn(
                                                                "w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none",
                                                                isDarkMode
                                                                    ? "bg-black/50 border-white/10 text-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10"
                                                                    : "bg-white border-slate-200 text-slate-900 focus:border-emerald-500 shadow-sm"
                                                            )}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                                <div className="w-24 h-24 rounded-full bg-slate-500/5 flex items-center justify-center mb-6 border border-slate-500/10 shadow-inner group">
                                    <FileText size={42} className="opacity-10 group-hover:scale-110 transition-transform" />
                                </div>
                                <h4 className="text-sm font-bold uppercase tracking-[0.2em] mb-3 opacity-30">Configuration Panel</h4>
                                <p className="text-[10px] font-medium leading-loose opacity-20 max-w-[200px] mx-auto">
                                    SELECT A META TEMPLATE FROM THE GRID TO CONFIGURE DYNAMIC VARIABLES AND VISUALIZE CONTENT.
                                </p>
                                <div className="mt-12 flex flex-col items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/10" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/5" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </GlassCard>
        </div>,
        document.body
    );
};
