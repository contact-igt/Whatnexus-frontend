"use client";

import { useState } from 'react';
import { Filter, MessageSquare, MoreHorizontal, ClipboardList, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Trash2, ArchiveRestore, Trash } from 'lucide-react';
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import dayjs from "@/utils/dayjs";
import { useTheme } from '@/hooks/useTheme';
import { useLeadIntelligenceQuery, useGetDeletedLeadsQuery, useSoftDeleteLeadMutation, usePermanentDeleteLeadMutation, useRestoreLeadMutation } from '@/hooks/useLeadIntelligenceQuery';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/redux/selectors/auth/authSelector';
import { WhatsAppConnectionPlaceholder } from './whatsappConfiguration/whatsapp-connection-placeholder';
import { LeadSummaryModal } from './lead-summary-modal';
import { ConfirmationModal } from '@/components/ui/confirmationModal';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';

export const LeadsView = () => {
    const { isDarkMode } = useTheme();
    const { whatsappApiDetails } = useAuth();
    console.log("whatsappApiDetails", whatsappApiDetails);
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'all' | 'trash'>('all');

    // Data Queries
    const { data: leadIntelligenceData, isLoading: isLoadingLeads, refetch: refetchLeads } = useLeadIntelligenceQuery();
    const { data: deletedLeadsData, isLoading: isLoadingDeletedLeads, refetch: refetchDeletedLeads } = useGetDeletedLeadsQuery();

    const isLoading = activeTab === 'all' ? isLoadingLeads : isLoadingDeletedLeads;
    const leads = activeTab === 'all' ? (leadIntelligenceData?.data?.leads || []) : (deletedLeadsData?.data?.leads || []);

    // Mutations
    const { mutate: softDeleteLead, isPending: isSoftDeletePending } = useSoftDeleteLeadMutation();
    const { mutate: permanentDeleteLead, isPending: isPermanentDeletePending } = usePermanentDeleteLeadMutation();
    const { mutate: restoreLead, isPending: isRestorePending } = useRestoreLeadMutation();

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Summary Modal State
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [selectedLeadForSummary, setSelectedLeadForSummary] = useState<any>(null);

    // Confirmation Modal State
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
    const [actionType, setActionType] = useState<'delete' | 'permanent_delete' | 'restore'>('delete');

    const summarizeLead = async (e: React.MouseEvent, lead: any) => {
        e.stopPropagation();
        setSelectedLeadForSummary(lead);
        setIsSummaryModalOpen(true);
    };

    const handleAction = (type: 'delete' | 'permanent_delete' | 'restore', id: string) => {
        setActionType(type);
        setSelectedLeadId(id);
        setIsConfirmationModalOpen(true);
    };

    const confirmAction = () => {
        if (!selectedLeadId) return;

        if (actionType === 'delete') {
            softDeleteLead(selectedLeadId, {
                onSuccess: () => {
                    setIsConfirmationModalOpen(false);
                    setSelectedLeadId(null);
                }
            });
        } else if (actionType === 'permanent_delete') {
            permanentDeleteLead(selectedLeadId, {
                onSuccess: () => {
                    setIsConfirmationModalOpen(false);
                    setSelectedLeadId(null);
                }
            });
        } else if (actionType === 'restore') {
            restoreLead(selectedLeadId, {
                onSuccess: () => {
                    setIsConfirmationModalOpen(false);
                    setSelectedLeadId(null);
                }
            });
        }
    };

    console.log("leadIntelligenceData", leadIntelligenceData)
    const getHeatStateStyles = (state: string) => {
        switch (state?.toLowerCase()) {
            case 'hot': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            case 'warm': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            case 'cold': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'super_cold': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    const formatMessageDate = (dateString: string) => {
        if (!dateString) return { date: '-', time: '' };

        const d = dayjs.utc(dateString).tz('Asia/Kolkata');

        return {
            date: d.format('MMM D'),
            time: d.format('hh:mm A')
        };
    };

    const handleLeadOpen = (leadPhone: string) => {
        router.push(`/chats?phone=${leadPhone}`)
    }

    if (whatsappApiDetails?.status !== 'active') {
        return <WhatsAppConnectionPlaceholder />;
    }

    const totalPages = Math.ceil(leads.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    console.log("leads", leads)
    const currentLeads = leads?.slice(startIndex, startIndex + itemsPerPage);

    const columns: ColumnDef<any>[] = [
        {
            field: 'identity',
            headerName: 'Lead Identity',
            renderCell: ({ row }) => (
                <div className="flex items-center space-x-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs border", isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-700')}>
                        {row?.name?.charAt(0)?.toUpperCase() ?? "?"}
                    </div>
                    <div>
                        <p className={cn("text-sm font-semibold", isDarkMode ? 'text-white' : 'text-slate-900')}>{row?.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-medium tracking-wider">+{row?.phone}</p>
                    </div>
                </div>
            )
        },
        {
            field: 'score',
            headerName: 'Neural Score',
            align: 'center',
            headerAlign: 'center',
            renderCell: ({ row }) => (
                <div className="flex flex-col justify-center items-center">
                    <span className={cn("text-xs font-bold mb-1.5", row?.score > 80 ? 'text-emerald-500' : 'text-orange-500')}>{row?.score}</span>
                    <div className={cn("h-1 w-12 rounded-full overflow-hidden", isDarkMode ? 'bg-white/5' : 'bg-slate-200')}>
                        <div className={cn("h-full rounded-full transition-all duration-[2000ms] ease-out", row?.score > 80 ? 'bg-emerald-500' : 'bg-orange-500')} style={{ width: `${row?.score}%` }} />
                    </div>
                </div>
            )
        },
        {
            field: 'heat_state',
            headerName: 'Heat State',
            align: 'center',
            headerAlign: 'center',
            renderCell: ({ row }) => (
                <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider border", getHeatStateStyles(row.heat_state))}>
                    {row?.heat_state}
                </span>
            )
        },
        {
            field: 'last_user_message_at',
            headerName: 'User Last Message',
            align: 'center',
            headerAlign: 'center',
            minWidth: 150,
            renderCell: ({ row }) => (
                <div className="flex flex-col">
                    <span className={cn("text-xs font-semibold", isDarkMode ? 'text-white/90' : 'text-slate-700')}>{formatMessageDate(row?.last_user_message_at)?.date}</span>
                    <span className={cn("text-[10px] uppercase font-medium tracking-wide", isDarkMode ? 'text-white/40' : 'text-slate-400')}>{formatMessageDate(row?.last_user_message_at)?.time}</span>
                </div>
            )
        },
        {
            field: 'last_admin_reply_at',
            headerName: 'Admin Last Message',
            align: 'center',
            headerAlign: 'center',
            minWidth: 150,
            renderCell: ({ row }) => (
                row?.last_admin_reply_at ? <div className="flex flex-col">
                    <span className={cn("text-xs font-semibold", isDarkMode ? 'text-white/90' : 'text-slate-700')}>{formatMessageDate(row?.last_admin_reply_at)?.date}</span>
                    <span className={cn("text-[10px] uppercase font-medium tracking-wide", isDarkMode ? 'text-white/40' : 'text-slate-400')}>{formatMessageDate(row?.last_admin_reply_at)?.time}</span>
                </div> : <span className={cn("text-[10px] uppercase font-medium tracking-wide", isDarkMode ? 'text-white/40' : 'text-slate-400')}>-</span>
            )
        },
        {
            field: 'actions',
            headerName: 'Actions',
            align: 'right',
            headerAlign: 'right',
            renderCell: ({ row }) => (
                <div className="flex items-center justify-end space-x-1 transition-all">
                    {activeTab === 'all' && (
                        <>
                            <button
                                onClick={(e) => summarizeLead(e, row)}
                                title="Generate AI Summary"
                                className={cn(
                                    "p-2 rounded-lg transition-colors hover:bg-white/10 hover:text-emerald-500 text-slate-400"
                                )}
                            >
                                <ClipboardList size={16} />
                            </button>
                            <button onClick={() => handleLeadOpen(row?.phone)} className="p-2 hover:bg-white/10 rounded-lg hover:text-emerald-500 transition-colors text-slate-400"><MessageSquare size={16} /></button>
                            <button
                                onClick={() => handleAction('delete', row?.lead_id)}
                                className="p-2 hover:bg-white/10 rounded-lg hover:text-red-500 transition-colors text-slate-400"
                                title="Remove Lead"
                            >
                                <Trash2 size={16} />
                            </button>
                        </>
                    )}

                    {activeTab === 'trash' && (
                        <>
                            <button
                                onClick={() => handleAction('restore', row?.lead_id)}
                                className="p-2 hover:bg-white/10 rounded-lg hover:text-blue-500 transition-colors text-slate-400"
                                title="Restore Lead"
                            >
                                <ArchiveRestore size={16} />
                            </button>
                            <button
                                onClick={() => handleAction('permanent_delete', row?.lead_id)}
                                className="p-2 hover:bg-white/10 rounded-lg hover:text-red-500 transition-colors text-slate-400"
                                title="Delete Forever"
                            >
                                <Trash size={16} />
                            </button>
                        </>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="h-full overflow-y-auto p-8 space-y-6 animate-in fade-in duration-700 no-scrollbar pb-32">
            <LeadSummaryModal
                isOpen={isSummaryModalOpen}
                onClose={() => setIsSummaryModalOpen(false)}
                lead={selectedLeadForSummary}
                isDarkMode={isDarkMode}
            />

            <ConfirmationModal
                isOpen={isConfirmationModalOpen}
                onClose={() => setIsConfirmationModalOpen(false)}
                onConfirm={confirmAction}
                title={
                    actionType === 'delete' ? "Remove Lead" :
                        actionType === 'permanent_delete' ? "Permanently Delete Lead" :
                            "Restore Lead"
                }
                message={
                    actionType === 'delete' ? "Are you sure you want to remove this lead? It will be moved to the trash." :
                        actionType === 'permanent_delete' ? "This action cannot be undone. Are you sure you want to permanently delete this lead?" :
                            "Are you sure you want to restore this lead?"
                }
                isDarkMode={isDarkMode}
                confirmText={
                    actionType === 'delete' ? "Remove" :
                        actionType === 'permanent_delete' ? "Delete Forever" :
                            "Restore"
                }
                isLoading={isSoftDeletePending || isPermanentDeletePending || isRestorePending}
                variant={actionType === 'restore' ? 'info' : 'danger'}
            />

            <div className="flex justify-between items-end border-b border-white/5 pb-6">
                <div>
                    <h1 className={cn("text-3xl font-bold tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>Lead Intelligence</h1>
                    <p className={cn("font-medium text-sm mt-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>Qualified audience shards synced from Meta & Website.</p>
                </div>
                <div className="flex space-x-3">
                    <div className={cn("px-4 py-2 flex items-center space-x-2 group cursor-pointer border rounded-xl transition-all", isDarkMode ? 'bg-white/5 border-white/10 hover:border-emerald-500/50' : 'bg-white border-slate-200 hover:border-emerald-500/50 shadow-sm')}>
                        <Filter size={14} className="text-emerald-500" />
                        <span className={cn("text-xs font-semibold uppercase tracking-wide", isDarkMode ? 'text-white' : 'text-slate-700')}>Filters</span>
                    </div>
                    <button className="h-10 px-5 rounded-xl bg-emerald-600 text-white font-semibold text-xs uppercase tracking-wide hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20">Sync CRM</button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center space-x-1 border-b border-white/5">
                <button
                    onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-all",
                        activeTab === 'all'
                            ? (isDarkMode ? 'border-emerald-500 text-emerald-500' : 'border-emerald-500 text-emerald-600')
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    )}
                >
                    All Leads
                </button>
                <button
                    onClick={() => { setActiveTab('trash'); setCurrentPage(1); }}
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-all flex items-center space-x-2",
                        activeTab === 'trash'
                            ? (isDarkMode ? 'border-emerald-500 text-emerald-500' : 'border-emerald-500 text-emerald-600')
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    )}
                >
                    <Trash2 size={14} />
                    <span>Trash</span>
                </button>
            </div>

            <GlassCard isDarkMode={isDarkMode} className="overflow-hidden p-0">
                <DataTable
                    columns={columns}
                    data={currentLeads}
                    isLoading={isLoading}
                    isDarkMode={isDarkMode}
                    emptyState={
                        <div className="flex flex-col items-center justify-center text-center">
                            <div className={cn(
                                "w-20 h-20 rounded-2xl flex items-center justify-center mb-6 border-2",
                                isDarkMode
                                    ? 'bg-emerald-500/10 border-emerald-500/20'
                                    : 'bg-emerald-50 border-emerald-200'
                            )}>
                                <Filter size={36} className="text-emerald-500" />
                            </div>
                            <h3 className={cn(
                                "text-xl font-bold mb-2",
                                isDarkMode ? 'text-white' : 'text-slate-900'
                            )}>
                                No Leads Found
                            </h3>
                            <p className={cn(
                                "text-sm font-medium max-w-md",
                                isDarkMode ? 'text-slate-400' : 'text-slate-600'
                            )}>
                                {activeTab === 'all'
                                    ? "No lead intelligence data available. Start syncing leads from Meta & Website."
                                    : "No deleted leads found in trash."}
                            </p>
                        </div>
                    }
                />

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="mt-4 px-2">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={leads.length}
                            itemsPerPage={itemsPerPage}
                            isDarkMode={isDarkMode}
                        />
                    </div>
                )}
            </GlassCard>
        </div>
    );
};
