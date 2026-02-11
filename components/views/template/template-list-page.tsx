"use client";

import { useState, useMemo } from 'react';
import { FileText, Plus, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { ActionMenu } from '@/components/ui/action-menu';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/ui/glass-card';
import { Template, TemplateStatus } from './template-types';
import { getStatusColor, getHealthColor, formatDate } from './template-utils';
import { useAuth } from '@/redux/selectors/auth/authSelector';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { Modal } from '@/components/ui/modal';

interface TemplateListPageProps {
    isDarkMode: boolean;
    templates: { templates: Template[] };
    deletedTemplates?: Template[];
    isLoading: boolean;
    onCreateNew: () => void;
    onEdit: (template: Template) => void;
    onView: (template: Template) => void;
    onSubmitTemplate: (template_id: string) => void;
    onResubmitTemplate: (template_id: string) => void;
    onSyncTemplate: (template_id: string) => void;
    onPermanentDelete: (template_id: string) => void;
    onSoftDelete: (templateId: string) => void;
    onRestore?: (templateId: string) => void;
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
    onRestore,
    onSync,
    deletedTemplates = []
}: TemplateListPageProps) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [actionConfirmation, setActionConfirmation] = useState<{
        isOpen: boolean;
        templateId: string | null;
        type: 'soft' | 'permanent' | 'restore';
    }>({
        isOpen: false,
        templateId: null,
        type: 'soft'
    });

    console.log(templates)
    const tabs: { id: TabType; label: string; count?: number }[] = [
        { id: 'all', label: 'All', count: templates?.templates?.length },
        { id: 'draft', label: 'Draft', count: templates?.templates?.filter((t: any) => t.status === 'draft').length },
        { id: 'pending', label: 'Pending', count: templates?.templates?.filter((t: any) => t.status === 'pending').length },
        { id: 'approved', label: 'Approved', count: templates?.templates?.filter((t: any) => t.status === 'approved').length },
        { id: 'action_required', label: 'Action Required', count: templates?.templates?.filter((t: any) => t.status === 'rejected').length },
        { id: 'paused', label: 'Paused', count: templates?.templates?.filter((t: any) => t.status === 'paused').length },
        { id: 'trash', label: 'Trash', count: deletedTemplates.length },
    ];

    const currentTemplates = activeTab === 'trash' ? deletedTemplates : templates?.templates;

    const filteredTemplates = useMemo(() => {
        return currentTemplates?.filter((template: any) => {
            // Tab filter
            if (activeTab === 'draft' && template?.status !== 'draft') return false;
            if (activeTab === 'pending' && template?.status !== 'pending') return false;
            if (activeTab === 'approved' && template?.status !== 'approved') return false;
            if (activeTab === 'action_required' && template?.status !== 'rejected') return false;
            if (activeTab === 'paused' && template?.status !== 'paused') return false;
            // if (activeTab === 'trash' && template.status !== 'deleted') return false;

            // Search filter
            if (searchQuery && !template.template_name?.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            return true;
        });
    }, [currentTemplates, activeTab, searchQuery]);

    const totalPages = Math.ceil(filteredTemplates?.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTemplates = filteredTemplates?.slice(startIndex, startIndex + itemsPerPage);

    const handleActionClick = (templateId: string, type: 'soft' | 'permanent' | 'restore') => {
        setActionConfirmation({
            isOpen: true,
            templateId,
            type
        });
    };

    const handleConfirmAction = () => {
        if (actionConfirmation.templateId) {
            if (actionConfirmation.type === 'soft') {
                onSoftDelete(actionConfirmation.templateId);
            } else if (actionConfirmation.type === 'permanent') {
                onPermanentDelete(actionConfirmation.templateId);
            } else if (actionConfirmation.type === 'restore') {
                onRestore?.(actionConfirmation.templateId);
            }
        }
        setActionConfirmation({ isOpen: false, templateId: null, type: 'soft' });
    };

    const columns: ColumnDef<Template>[] = useMemo(() => [
        {
            field: 'template_name',
            headerName: 'Template Name',
            width: 250,
            renderCell: ({ row }) => (
                <p className={cn("text-sm font-semibold", isDarkMode ? 'text-white' : 'text-slate-800')}>
                    {row.template_name}
                </p>
            )
        },
        {
            field: 'category',
            headerName: 'Category',
            align: 'center',
            headerAlign: 'center',
            width: 120,
            renderCell: ({ row }) => (
                <span className={cn(
                    "text-xs font-medium px-2 py-1 rounded",
                    isDarkMode ? 'bg-white/5 text-white/60' : 'bg-slate-100 text-slate-600'
                )}>
                    {row.category}
                </span>
            )
        },
        {
            field: 'status',
            headerName: 'Status',
            align: 'center',
            headerAlign: 'center',
            width: 120,
            renderCell: ({ row }) => (
                <span className={cn(
                    "text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wide",
                    getStatusColor(row.status, isDarkMode)
                )}>
                    {row.status}
                </span>
            )
        },
        {
            field: 'template_type', // Type
            headerName: 'Type',
            align: 'center',
            headerAlign: 'center',
            width: 100,
            renderCell: ({ row }) => (
                <span className={cn("text-xs font-medium", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                    {row.template_type}
                </span>
            )
        },
        {
            field: 'created_at',
            headerName: 'Created At',
            align: 'center',
            headerAlign: 'center',
            width: 150,
            renderCell: ({ row }) => (
                <span className={cn("text-xs", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                    {formatDate(row.created_at)}
                </span>
            )
        },
        {
            field: 'actions',
            headerName: 'Actions',
            align: 'center',
            headerAlign: 'center',
            width: 100,
            renderCell: ({ row }) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <ActionMenu
                        isDarkMode={isDarkMode}
                        isView={true}
                        isEdit={['draft', 'paused', 'rejected'].includes(row?.status)}
                        isSubmitTemplate={['draft', 'paused', 'rejected'].includes(row?.status)}
                        onSubmitTemplate={() => { (row?.status === 'paused' || row?.status === 'rejected') ? onResubmitTemplate(row?.template_id) : onSubmitTemplate(row?.template_id) }}
                        isSyncTemplate={row?.status === 'pending'}
                        onSyncTemplate={() => onSyncTemplate(row?.template_id)}
                        onView={() => onView(row)}
                        onEdit={() => onEdit(row)}
                        isDelete={['draft', 'paused', 'rejected'].includes(row?.status)}
                        onDelete={() => handleActionClick(row.template_id, 'soft')}
                        isPermanentDelete={activeTab === 'trash' && user?.role === 'tenant_admin'}
                        onPermanentDelete={() => handleActionClick(row.template_id, 'permanent')}
                        isRestore={activeTab === 'trash'}
                        onRestore={() => handleActionClick(row.template_id, 'restore')}
                    />
                </div>
            )
        }
    ], [isDarkMode, activeTab, user?.role, onEdit, onView, onResubmitTemplate, onSubmitTemplate, onSyncTemplate]);

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
                        onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
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
            <GlassCard isDarkMode={isDarkMode} className="p-0 overflow-hidden">
                <DataTable
                    columns={columns}
                    data={paginatedTemplates}
                    isLoading={isLoading}
                    isDarkMode={isDarkMode}
                    onRowClick={(row) => onView(row)}
                    emptyState={
                        <div className="flex flex-col items-center justify-center py-16">
                            <AlertCircle size={32} className={cn(isDarkMode ? 'text-white/20' : 'text-slate-300')} />
                            <div className={cn("text-sm mt-3", isDarkMode ? 'text-white/40' : 'text-slate-400')}>
                                {searchQuery ? 'No templates found matching your search' : 'No templates found'}
                            </div>
                        </div>
                    }
                />
                {totalPages > 1 && (
                    <div className="p-4 border-t border-white/5">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={filteredTemplates?.length}
                            itemsPerPage={itemsPerPage}
                            isDarkMode={isDarkMode}
                        />
                    </div>
                )}
            </GlassCard>

            {/* Footer */}
            {/* <div className="flex items-center justify-between">
                <p className={cn("text-xs", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                    Showing {paginatedTemplates.length} of {templates.length} templates
                </p>
            </div> */}

            <Modal
                isOpen={actionConfirmation.isOpen}
                onClose={() => setActionConfirmation({ isOpen: false, templateId: null, type: 'soft' })}
                title={
                    actionConfirmation.type === 'permanent'
                        ? "Permanently Delete Template?"
                        : actionConfirmation.type === 'restore'
                            ? "Restore Template?"
                            : "Remove Template?"
                }
                description={
                    actionConfirmation.type === 'permanent'
                        ? "Are you sure you want to permanently delete this template? This action cannot be undone."
                        : actionConfirmation.type === 'restore'
                            ? "Are you sure you want to restore this template?"
                            : "Are you sure you want to remove this template? It will be moved to the trash."
                }
                isDarkMode={isDarkMode}
                className="max-w-md"
                footer={
                    <div className="flex items-center justify-end space-x-3">
                        <button
                            onClick={() => setActionConfirmation({ isOpen: false, templateId: null, type: 'soft' })}
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
                            onClick={handleConfirmAction}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium text-white transition-all shadow-lg",
                                isDarkMode
                                    ? actionConfirmation.type === 'restore' ? 'bg-emerald-500 hover:bg-emerald-600 border border-emerald-500/50' : 'bg-red-500 hover:bg-red-600 border border-red-500/50'
                                    : actionConfirmation.type === 'restore' ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20' : 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20'
                            )}
                        >
                            {actionConfirmation.type === 'restore' ? 'Restore' : actionConfirmation.type === 'permanent' ? 'Delete' : 'Remove'}
                        </button>
                    </div>
                }
            >
                <div className="hidden"></div>
            </Modal>
        </div>
    );
};
