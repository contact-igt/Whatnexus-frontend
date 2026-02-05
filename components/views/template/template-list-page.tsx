"use client";

import { useState } from 'react';
import { FileText, Plus, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { ActionMenu } from '@/components/ui/action-menu';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/ui/glass-card';
import { Template, TemplateStatus } from './template-types';
import { getStatusColor, getHealthColor, formatDate } from './template-utils';
import { useAuth } from '@/redux/selectors/auth/authSelector';

import { Modal } from '@/components/ui/modal';

interface TemplateListPageProps {
    isDarkMode: boolean;
    templates: Template[];
    isLoading: boolean;
    onCreateNew: () => void;
    onEdit: (template: Template) => void;
    onView: (template: Template) => void;
    onSubmitTemplate: (template_id: string) => void;
    onResubmitTemplate: (template_id: string) => void;
    onSyncTemplate: (template_id: string) => void;
    onPermanentDelete: (template_id: string) => void;
    onSoftDelete: (templateId: string) => void;
    onSync: () => void;
}

type TabType = 'all' | 'draft' | 'pending' | 'approved' | 'paused' | 'trash' | 'action_required';

export const TemplateListPage = ({
    isDarkMode,
    templates,
    isLoading,
    onResubmitTemplate,
    onSubmitTemplate,
    onSyncTemplate,
    onPermanentDelete,
    onCreateNew,
    onEdit,
    onView,
    onSoftDelete,
    onSync
}: TemplateListPageProps) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        templateId: string | null;
        type: 'soft' | 'permanent';
    }>({
        isOpen: false,
        templateId: null,
        type: 'soft'
    });


    const tabs: { id: TabType; label: string; count?: number }[] = [
        { id: 'all', label: 'All', count: templates.length },
        { id: 'draft', label: 'Draft', count: templates.filter((t: any) => t.status === 'draft').length },
        { id: 'pending', label: 'Pending', count: templates.filter((t: any) => t.status === 'pending').length },
        { id: 'approved', label: 'Approved', count: templates.filter((t: any) => t.status === 'approved').length },
        { id: 'action_required', label: 'Action Required', count: templates.filter((t: any) => t.status === 'rejected').length },
        { id: 'paused', label: 'Paused', count: templates.filter((t: any) => t.status === 'paused').length },
        { id: 'trash', label: 'Trash', count: templates.filter((t: any) => t.status === 'deleted').length },
    ];

    const filteredTemplates = templates.filter((template: any) => {
        // Tab filter
        if (activeTab === 'draft' && template.status !== 'draft') return false;
        if (activeTab === 'pending' && template.status !== 'pending') return false;
        if (activeTab === 'approved' && template.status !== 'approved') return false;
        if (activeTab === 'action_required' && template.status !== 'rejected') return false;
        if (activeTab === 'paused' && template.status !== 'paused') return false;
        if (activeTab === 'trash' && template.status !== 'deleted') return false;

        // Search filter
        if (searchQuery && !template.template_name.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        return true;
    });

    const handleDeleteClick = (templateId: string, type: 'soft' | 'permanent') => {
        setDeleteConfirmation({
            isOpen: true,
            templateId,
            type
        });
    };

    const handleConfirmDelete = () => {
        if (deleteConfirmation.templateId) {
            if (deleteConfirmation.type === 'soft') {
                onSoftDelete(deleteConfirmation.templateId);
            } else {
                onPermanentDelete(deleteConfirmation.templateId);
            }
        }
        setDeleteConfirmation({ isOpen: false, templateId: null, type: 'soft' });
    };

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
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                        </div>
                    ) : (
                        <table className="w-full text-left min-w-[1000px]">
                            <thead>
                                <tr className={cn("text-[10px] font-bold uppercase tracking-wider border-b", isDarkMode ? 'text-white/30 border-white/5' : 'text-slate-400 border-slate-200')}>
                                    <th className="px-6 py-4">Template Name</th>
                                    <th className="px-6 py-4 text-center">Category</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-center">Type</th>
                                    {/* <th className="px-6 py-4 text-center">Health</th> */}
                                    <th className="px-6 py-4 text-center">Created At</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className={cn("divide-y", isDarkMode ? 'divide-white/5' : 'divide-slate-100')}>
                                {filteredTemplates.length > 0 ? (
                                    filteredTemplates.map((template) => (
                                        <tr key={template.template_id} className="group transition-all hover:bg-emerald-500/5">
                                            <td className="px-6 py-5 w-50">
                                                <p className={cn("text-sm font-semibold", isDarkMode ? 'text-white' : 'text-slate-800')}>
                                                    {template?.template_name}
                                                </p>
                                            </td>
                                            <td className="px-2 py-5 text-center">
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
                                                    {template.template_type}
                                                </span>
                                            </td>
                                            {/* <td className="px-6 py-5 text-center">
                                            <span className={cn(
                                                "text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wide",
                                                getHealthColor(template.health, isDarkMode)
                                            )}>
                                                {template.health}
                                            </span>
                                        </td> */}
                                            <td className="px-6 py-5 text-center">
                                                <span className={cn("text-xs", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                                    {formatDate(template.created_at)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-center">
                                                    <ActionMenu
                                                        isDarkMode={isDarkMode}
                                                        isView={true}
                                                        isEdit={['draft', 'paused', 'rejected'].includes(template?.status)}
                                                        isSubmitTemplate={['draft', 'paused', 'rejected'].includes(template?.status)}
                                                        onSubmitTemplate={() => { (template?.status === 'paused' || template?.status === 'rejected') ? onResubmitTemplate(template?.template_id) : onSubmitTemplate(template?.template_id) }}
                                                        isSyncTemplate={template?.status === 'pending'}
                                                        onSyncTemplate={() => onSyncTemplate(template?.template_id)}
                                                        onView={() => onView(template)}
                                                        onEdit={() => onEdit(template)}
                                                        isDelete={['draft', 'paused', 'rejected', 'deleted'].includes(template?.status)}
                                                        onDelete={() => handleDeleteClick(template.template_id, 'soft')}
                                                        isPermanentDelete={template?.status === "deleted" && activeTab === 'trash' && user?.role === 'tenant_admin'}
                                                        onPermanentDelete={() => handleDeleteClick(template.template_id, 'permanent')}
                                                    // onRestore={() => onRestore(template.template_id)}
                                                    />
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
                    )}
                </div>
            </GlassCard>

            {/* Footer */}
            <div className="flex items-center justify-between">
                <p className={cn("text-xs", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                    Showing {filteredTemplates.length} of {templates.length} templates
                </p>
            </div>

            <Modal
                isOpen={deleteConfirmation.isOpen}
                onClose={() => setDeleteConfirmation({ isOpen: false, templateId: null, type: 'soft' })}
                title={deleteConfirmation.type === 'permanent' ? "Permanently Delete Template?" : "Delete Template?"}
                description={
                    deleteConfirmation.type === 'permanent'
                        ? "Are you sure you want to permanently delete this template? This action cannot be undone."
                        : "Are you sure you want to delete this template? It will be moved to the trash."
                }
                isDarkMode={isDarkMode}
                className="max-w-md"
                footer={
                    <div className="flex items-center justify-end space-x-3">
                        <button
                            onClick={() => setDeleteConfirmation({ isOpen: false, templateId: null, type: 'soft' })}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                                isDarkMode
                                    ? 'border-white/10 text-white/70 hover:bg-white/5 hover:text-white'
                                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            )}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmDelete}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium text-white transition-all shadow-lg",
                                isDarkMode
                                    ? 'bg-red-500 hover:bg-red-600 border border-red-500/50'
                                    : 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20'
                            )}
                        >
                            Delete
                        </button>
                    </div>
                }
            >
                <div className="hidden"></div>
            </Modal>
        </div>
    );
};
