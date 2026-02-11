

"use client";

import { useState, useEffect, useMemo } from 'react';
import { Megaphone, Plus, Search, RefreshCw, Users, TrendingUp, Send, X, AlertCircle } from 'lucide-react';
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/redux/selectors/auth/authSelector';
import { WhatsAppConnectionPlaceholder } from './whatsappConfiguration/whatsapp-connection-placeholder';
import { useCampaigns } from '@/hooks/useCampaigns';
import type { CampaignStatus } from '@/services/campaign/campaign.types';
import {
    formatCampaignDate,
    calculatePercentage,
    getCampaignStatusColor
} from '@/utils/campaign.utils';
// import { CreateCampaignModal } from '@/components/campaign/create-campaign-modal';
import { ActionMenu } from "@/components/ui/action-menu";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { campaignService } from "@/services/campaign/campaign.service";
import { usePermanentDeleteCampaignMutation, useRestoreCampaignMutation, useSoftDeleteCampaignMutation } from '@/hooks/useCampaignQuery';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { Campaign } from '@/services/campaign/campaign.types';
import { CreateCampaignModal } from '@/components/campaign/create-campaign-modal';

type TabType = 'all' | 'broadcast' | 'api' | 'scheduled' | 'immediate' | 'trash';

export const CampaignView = () => {
    const { whatsappApiDetails } = useAuth();
    if (whatsappApiDetails?.status !== 'active') {
        return <WhatsAppConnectionPlaceholder />;
    }
    const { isDarkMode } = useTheme();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
    const [actionType, setActionType] = useState<'delete' | 'permanent_delete' | 'restore'>('delete');
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

    const { mutate: softDeleteCampaign, isPending: isSoftDeletePending } = useSoftDeleteCampaignMutation();
    const { mutate: permanentDeleteCampaign, isPending: isPermanentDeletePending } = usePermanentDeleteCampaignMutation();
    const { mutate: restoreCampaign, isPending: isRestorePending } = useRestoreCampaignMutation();

    // Use the custom hook for campaign data
    const { campaigns, loading, error, refetch, pagination, filters, deletedCampaigns, fetchDeletedCampaigns } = useCampaigns();

    // Fetch deleted campaigns when Trash tab is active
    useEffect(() => {
        if (activeTab === 'trash') {
            fetchDeletedCampaigns();
        }
    }, [activeTab, fetchDeletedCampaigns]);


    const handleCampaignSuccess = (campaignId: string) => {
        refetch(); // Refresh the campaign list
        router.push(`/campaign/${campaignId}`); // Navigate to the new campaign
    };

    const tabs: { id: TabType; label: string }[] = [
        { id: 'all', label: 'All' },
        { id: 'broadcast', label: 'Broadcast' },
        { id: 'api', label: 'API' },
        { id: 'scheduled', label: 'Scheduled' },
        { id: 'immediate', label: 'Immediate' },
        { id: 'trash', label: 'Trash' },
    ];

    // Filter campaigns by active tab and search query
    const campaignsToDisplay = activeTab === 'trash' ? deletedCampaigns : campaigns;

    const filteredCampaigns = campaignsToDisplay.filter(campaign => {
        const matchesTab = activeTab === 'all' || activeTab === 'trash' || campaign.campaign_type.toLowerCase() === activeTab;
        const matchesSearch = campaign.campaign_name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    // Handle row click to navigate to details
    const handleCampaignClick = (campaignId: string) => {
        router.push(`/campaign/${campaignId}`);
    };


    const handleAction = async () => {
        if (!selectedCampaignId) return;

        if (actionType === 'delete') {
            softDeleteCampaign(selectedCampaignId, {
                onSuccess: () => {
                    refetch();
                    setIsConfirmationModalOpen(false);
                    setSelectedCampaignId(null);
                }
            });
        } else if (actionType === 'permanent_delete') {
            permanentDeleteCampaign(selectedCampaignId, {
                onSuccess: () => {
                    fetchDeletedCampaigns();
                    setIsConfirmationModalOpen(false);
                    setSelectedCampaignId(null);
                }
            });
        } else if (actionType === 'restore') {
            restoreCampaign(selectedCampaignId, {
                onSuccess: () => {
                    fetchDeletedCampaigns();
                    refetch();
                    setIsConfirmationModalOpen(false);
                    setSelectedCampaignId(null);
                }
            });
        }
    };

    const openConfirmation = (id: string, type: 'delete' | 'permanent_delete' | 'restore') => {
        setSelectedCampaignId(id);
        setActionType(type);
        setIsConfirmationModalOpen(true);
    };

    const handleExecuteCampaign = async (id: string) => {
        try {
            // Optimistic update or loading state could be better, but refetch works
            await campaignService.executeCampaign(id);
            refetch();
            // Optional: Success message
        } catch (err) {
            console.error("Failed to execute campaign", err);
            alert("Failed to execute campaign.");
        }
    };

    const columns: ColumnDef<Campaign>[] = useMemo(() => [
        {
            field: 'campaign_name',
            headerName: 'Campaign',
            width: 180,
            renderCell: ({ row }) => (
                <p className={cn("text-sm font-semibold", isDarkMode ? 'text-white' : 'text-slate-800')}>{row.campaign_name}</p>
            )
        },
        {
            field: 'campaign_type',
            headerName: 'Type',
            width: 150,
            renderCell: ({ row }) => (
                <span className={cn("text-xs font-medium capitalize", isDarkMode ? 'text-white/60' : 'text-slate-600')}>{row.campaign_type}</span>
            )
        },
        {
            field: 'createdAt',
            headerName: 'Created At',
            width: 150,
            renderCell: ({ row }) => (
                <span className={cn("text-xs", isDarkMode ? 'text-white/40' : 'text-slate-500')}>{formatCampaignDate(row.createdAt)}</span>
            )
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            align: 'center',
            headerAlign: 'center',
            renderCell: ({ row }) => (
                <span className={cn(
                    "text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wide",
                    getCampaignStatusColor(row.status)
                )}>
                    {row.status}
                </span>
            )
        },
        {
            field: 'total_audience',
            headerName: 'Audience',
            width: 100,
            align: 'center',
            headerAlign: 'center',
            renderCell: ({ row }) => (
                <div className="flex items-center justify-center gap-1">
                    <Users size={12} className={cn(isDarkMode ? 'text-white/40' : 'text-slate-400')} />
                    <span className={cn("text-xs font-semibold", isDarkMode ? 'text-white' : 'text-slate-700')}>
                        {row.total_audience.toLocaleString()}
                    </span>
                </div>
            )
        },
        {
            field: 'delivered_count',
            headerName: 'Delivered',
            width: 100,
            align: 'center',
            headerAlign: 'center',
            renderCell: ({ row }) => (
                <span className={cn("text-xs font-semibold", isDarkMode ? 'text-emerald-400' : 'text-emerald-600')}>
                    {calculatePercentage(row.delivered_count, row.total_audience)}
                </span>
            )
        },
        {
            field: 'read_count',
            headerName: 'Read',
            width: 100,
            align: 'center',
            headerAlign: 'center',
            renderCell: ({ row }) => (
                <span className={cn("text-xs font-semibold", isDarkMode ? 'text-blue-400' : 'text-blue-600')}>
                    {calculatePercentage(row.read_count, row.total_audience)}
                </span>
            )
        },
        {
            field: 'replied_count',
            headerName: 'Replied',
            width: 100,
            align: 'center',
            headerAlign: 'center',
            renderCell: ({ row }) => (
                <span className={cn("text-xs font-semibold", isDarkMode ? 'text-purple-400' : 'text-purple-600')}>
                    {calculatePercentage(row.replied_count, row.total_audience)}
                </span>
            )
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 80,
            align: 'center',
            headerAlign: 'center',
            renderCell: ({ row }) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <ActionMenu
                        isDarkMode={isDarkMode}
                        isView={true}
                        onView={() => handleCampaignClick(row.campaign_id)}
                        isDelete={['draft', 'scheduled', 'failed', 'completed'].includes(row.status) && activeTab !== 'trash'}
                        onDelete={() => openConfirmation(row.campaign_id, 'delete')}
                        isExecute={['draft', 'scheduled'].includes(row.status) && activeTab !== 'trash'}
                        onExecute={() => handleExecuteCampaign(row.campaign_id)}
                        isRestore={activeTab === 'trash'}
                        onRestore={() => openConfirmation(row.campaign_id, 'restore')}
                        isPermanentDelete={activeTab === 'trash'}
                        onPermanentDelete={() => openConfirmation(row.campaign_id, 'permanent_delete')}
                    />
                </div>
            )
        }
    ], [isDarkMode, activeTab, router, handleExecuteCampaign, openConfirmation]);

    return (
        <div className="h-full overflow-y-auto p-10 space-y-8 animate-in slide-in-from-bottom-8 duration-700 max-w-[1600px] mx-auto no-scrollbar pb-32">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-emerald-500">
                        <Megaphone size={16} className="animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Campaign Management</span>
                    </div>
                    <h1 className={cn("text-4xl font-bold tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>
                        Campaigns
                    </h1>
                </div>
                {/* <RoleBasedWrapper allowedRoles={['admin', 'super_admin']}> */}
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="h-12 px-6 rounded-xl font-bold text-xs uppercase tracking-wide bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
                >
                    <Plus size={16} />
                    <span>Launch</span>
                </button>
                {/* </RoleBasedWrapper> */}
            </div>

            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search size={18} className={cn("absolute left-4 top-1/2 -translate-y-1/2", isDarkMode ? 'text-white/30' : 'text-slate-400')} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by campaign name"
                        className={cn(
                            "w-full pl-12 pr-12 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all",
                            isDarkMode
                                ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30'
                                : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                        )}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className={cn(
                                "absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-all hover:bg-white/10",
                                isDarkMode ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-700'
                            )}
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
                <button
                    onClick={() => refetch()}
                    disabled={loading}
                    className={cn(
                        "px-6 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 flex items-center gap-2",
                        isDarkMode
                            ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50',
                        loading && 'opacity-50 cursor-not-allowed'
                    )}
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            <div className="flex gap-2 border-b border-white/5 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "px-4 py-3 text-sm font-semibold transition-all duration-200 border-b-2 whitespace-nowrap",
                            activeTab === tab.id
                                ? 'border-emerald-500 text-emerald-500'
                                : isDarkMode
                                    ? 'border-transparent text-white/50 hover:text-white/80'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Error State */}
            {error && (
                <GlassCard isDarkMode={isDarkMode} className="p-6 bg-red-500/5 border-red-500/20">
                    <p className="text-red-500 text-sm">{error}</p>
                    <button
                        onClick={() => refetch()}
                        className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-all"
                    >
                        Try Again
                    </button>
                </GlassCard>
            )}

            {/* Campaign Table */}
            {!error && (
                <GlassCard isDarkMode={isDarkMode} className="p-0 overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={filteredCampaigns}
                        isLoading={loading}
                        isDarkMode={isDarkMode}
                        onRowClick={(row) => handleCampaignClick(row.campaign_id)}
                        emptyState={
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className={cn(
                                    "w-16 h-16 rounded-full flex items-center justify-center",
                                    isDarkMode ? 'bg-white/5' : 'bg-slate-100'
                                )}>
                                    <Megaphone size={28} className={cn(isDarkMode ? 'text-white/20' : 'text-slate-300')} />
                                </div>
                                <div className="space-y-2 mt-4 text-center">
                                    <p className={cn("text-sm font-semibold", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                        {searchQuery ? 'No campaigns match your search' : 'No campaigns yet'}
                                    </p>
                                    <p className={cn("text-xs", isDarkMode ? 'text-white/40' : 'text-slate-400')}>
                                        {searchQuery ? 'Try adjusting your search terms' : 'Launch your first campaign to get started'}
                                    </p>
                                </div>
                                {!searchQuery && (
                                    <button
                                        onClick={() => setIsCreateModalOpen(true)}
                                        className="mt-4 px-4 py-2 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-all flex items-center gap-2"
                                    >
                                        <Plus size={14} />
                                        Create Campaign
                                    </button>
                                )}
                            </div>
                        }
                    />

                    {(!loading && pagination.totalPages > 1) && (
                        <div className="p-4 border-t border-white/5">
                            <Pagination
                                currentPage={pagination.currentPage}
                                totalPages={pagination.totalPages}
                                onPageChange={pagination.setPage}
                                totalItems={pagination.totalCampaigns}
                                isDarkMode={isDarkMode}
                            />
                        </div>
                    )}
                </GlassCard>
            )}

            {/* Create Campaign Modal */}
            <CreateCampaignModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCampaignSuccess}
            />

            <ConfirmationModal
                isOpen={isConfirmationModalOpen}
                onClose={() => setIsConfirmationModalOpen(false)}
                onConfirm={handleAction}
                title={
                    actionType === 'permanent_delete' ? "Permanently Delete Campaign" :
                        actionType === 'restore' ? "Restore Campaign" :
                            "Remove Campaign"
                }
                message={
                    actionType === 'permanent_delete' ? "Are you sure you want to permanently delete this campaign? This action cannot be undone." :
                        actionType === 'restore' ? "Are you sure you want to restore this campaign?" :
                            "Are you sure you want to remove this campaign? It will be moved to the trash."
                }
                confirmText={
                    actionType === 'permanent_delete' ? "Delete Forever" :
                        actionType === 'restore' ? "Restore" :
                            "Remove"
                }
                variant={actionType === 'restore' ? 'info' : 'danger'}
                isDarkMode={isDarkMode}
                isLoading={isSoftDeletePending || isPermanentDeletePending || isRestorePending}
            />
        </div >
    );
};
