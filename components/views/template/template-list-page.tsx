"use client";

import { useState } from 'react';
import { FileText, Plus, Search, RefreshCw, Eye, Edit, Trash2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/ui/glass-card';
import { Template, TemplateStatus } from './template-types';
import { getStatusColor, getHealthColor, formatDate } from './template-utils';

interface TemplateListPageProps {
    isDarkMode: boolean;
    templates: Template[];
    onCreateNew: () => void;
    onEdit: (template: Template) => void;
    onView: (template: Template) => void;
    onDelete: (templateId: string) => void;
    onSync: () => void;
}

type TabType = 'all' | 'draft' | 'pending' | 'approved' | 'action_required';

export const TemplateListPage = ({
    isDarkMode,
    templates,
    onCreateNew,
    onEdit,
    onView,
    onDelete,
    onSync
}: TemplateListPageProps) => {
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const tabs: { id: TabType; label: string; count?: number }[] = [
        { id: 'all', label: 'All', count: templates.length },
        { id: 'draft', label: 'Draft', count: templates.filter(t => t.status === 'Draft').length },
        { id: 'pending', label: 'Pending', count: templates.filter(t => t.status === 'Pending').length },
        { id: 'approved', label: 'Approved', count: templates.filter(t => t.status === 'Approved').length },
        { id: 'action_required', label: 'Action Required', count: templates.filter(t => t.status === 'Rejected').length },
    ];

    const filteredTemplates = templates.filter(template => {
        // Tab filter
        if (activeTab === 'draft' && template.status !== 'Draft') return false;
        if (activeTab === 'pending' && template.status !== 'Pending') return false;
        if (activeTab === 'approved' && template.status !== 'Approved') return false;
        if (activeTab === 'action_required' && template.status !== 'Rejected') return false;

        // Search filter
        if (searchQuery && !template.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        return true;
    });

    return (
        <div className="h-full overflow-y-auto p-10 space-y-8 animate-in slide-in-from-bottom-8 duration-700 max-w-[1600px] mx-auto no-scrollbar pb-32">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-emerald-500">
                        <FileText size={16} className="animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Template Management</span>
                    </div>
                    <h1 className={cn("text-4xl font-bold tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>
                        WhatsApp Templates
                    </h1>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onSync}
                        className={cn(
                            "h-12 px-6 rounded-xl font-bold text-xs uppercase tracking-wide border transition-all flex items-center space-x-2",
                            isDarkMode
                                ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        )}
                    >
                        <RefreshCw size={16} />
                        <span>Sync Status</span>
                    </button>
                    <button
                        onClick={onCreateNew}
                        className="h-12 px-6 rounded-xl font-bold text-xs uppercase tracking-wide bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
                    >
                        <Plus size={16} />
                        <span>Create Template</span>
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search size={18} className={cn("absolute left-4 top-1/2 -translate-y-1/2", isDarkMode ? 'text-white/30' : 'text-slate-400')} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by template name"
                        className={cn(
                            "w-full pl-12 pr-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all",
                            isDarkMode
                                ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30'
                                : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                        )}
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/5 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "px-4 py-3 text-sm font-semibold transition-all duration-200 border-b-2 whitespace-nowrap flex items-center gap-2",
                            activeTab === tab.id
                                ? 'border-emerald-500 text-emerald-500'
                                : isDarkMode
                                    ? 'border-transparent text-white/50 hover:text-white/80'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                        )}
                    >
                        <span>{tab.label}</span>
                        {tab.count !== undefined && (
                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold",
                                activeTab === tab.id
                                    ? 'bg-emerald-500/10 text-emerald-500'
                                    : isDarkMode
                                        ? 'bg-white/10 text-white/50'
                                        : 'bg-slate-100 text-slate-500'
                            )}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Templates Table */}
            <GlassCard isDarkMode={isDarkMode} className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[1000px]">
                        <thead>
                            <tr className={cn("text-[10px] font-bold uppercase tracking-wider border-b", isDarkMode ? 'text-white/30 border-white/5' : 'text-slate-400 border-slate-200')}>
                                <th className="px-6 py-4">Template Name</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Type</th>
                                <th className="px-6 py-4 text-center">Health</th>
                                <th className="px-6 py-4">Created At</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className={cn("divide-y", isDarkMode ? 'divide-white/5' : 'divide-slate-100')}>
                            {filteredTemplates.length > 0 ? (
                                filteredTemplates.map((template) => (
                                    <tr key={template.id} className="group transition-all hover:bg-emerald-500/5">
                                        <td className="px-6 py-5">
                                            <p className={cn("text-sm font-semibold", isDarkMode ? 'text-white' : 'text-slate-800')}>
                                                {template.name}
                                            </p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={cn(
                                                "text-xs font-medium px-2 py-1 rounded",
                                                isDarkMode ? 'bg-white/5 text-white/60' : 'bg-slate-100 text-slate-600'
                                            )}>
                                                {template.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={cn(
                                                "text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wide",
                                                getStatusColor(template.status, isDarkMode)
                                            )}>
                                                {template.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={cn("text-xs font-medium", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                                {template.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={cn(
                                                "text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wide",
                                                getHealthColor(template.health, isDarkMode)
                                            )}>
                                                {template.health}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={cn("text-xs", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                                {formatDate(template.createdAt)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => onView(template)}
                                                    className={cn(
                                                        "p-2 rounded-lg transition-colors",
                                                        isDarkMode ? 'hover:bg-blue-500/10 text-blue-400' : 'hover:bg-blue-50 text-blue-600'
                                                    )}
                                                    title="View"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => onEdit(template)}
                                                    className={cn(
                                                        "p-2 rounded-lg transition-colors",
                                                        isDarkMode ? 'hover:bg-emerald-500/10 text-emerald-400' : 'hover:bg-emerald-50 text-emerald-600'
                                                    )}
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(template.id)}
                                                    className={cn(
                                                        "p-2 rounded-lg transition-colors",
                                                        isDarkMode ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-600'
                                                    )}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <AlertCircle size={32} className={cn(isDarkMode ? 'text-white/20' : 'text-slate-300')} />
                                            <p className={cn("text-sm", isDarkMode ? 'text-white/40' : 'text-slate-400')}>
                                                {searchQuery ? 'No templates found matching your search' : 'No templates found'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* Footer */}
            <div className="flex items-center justify-between">
                <p className={cn("text-xs", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                    Showing {filteredTemplates.length} of {templates.length} templates
                </p>
            </div>
        </div>
    );
};
