
"use client";

import { useState } from 'react';
import { Megaphone, Plus, Search, RefreshCw, Users, TrendingUp, Send, X } from 'lucide-react';
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'next/navigation';
import { useCampaigns } from '@/hooks/useCampaigns';
import type { CampaignStatus } from '@/services/campaign/campaign.types';
import {
    formatCampaignDate,
    calculatePercentage,
    getCampaignStatusColor
} from '@/utils/campaign.utils';
import { CreateCampaignModal } from '@/components/campaign/create-campaign-modal';
import { ActionMenu } from "@/components/ui/action-menu";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { campaignService } from "@/services/campaign/campaign.service";

type TabType = 'all' | 'broadcast' | 'api' | 'scheduled' | 'immediate';

export const CampaignView = () => {
    const { isDarkMode } = useTheme();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [deletingCampaignId, setDeletingCampaignId] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Use the custom hook for campaign data
    const { campaigns, loading, error, refetch, pagination, filters } = useCampaigns();

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
    ];

    // Filter campaigns by active tab and search query
    const filteredCampaigns = campaigns.filter(campaign => {
        const matchesTab = activeTab === 'all' || campaign.campaign_type.toLowerCase() === activeTab;
        const matchesSearch = campaign.campaign_name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    // Handle row click to navigate to details
    const handleCampaignClick = (campaignId: string) => {
        router.push(`/campaign/${campaignId}`);
    };

    const handleDeleteCampaign = async () => {
        if (!deletingCampaignId) return;
        try {
            setActionLoading(true);
            await campaignService.deleteCampaign(deletingCampaignId);
            refetch(); // Refresh list
            setIsDeleteModalOpen(false);
            setDeletingCampaignId(null);
        } catch (err) {
            console.error("Failed to delete campaign", err);
            alert("Failed to delete campaign. Please try again.");
        } finally {
            setActionLoading(false);
        }
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

            {/* Quick Guide */}
            {/* <GlassCard isDarkMode={isDarkMode} className="p-6 bg-blue-500/5 border-blue-500/20">
                <div className="space-y-3">
                    <h3 className="font-bold text-sm uppercase tracking-wide">Quick Guide</h3>
                    <p className={cn("text-xs", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                        Tap on any Campaign to see detailed analytics. Launch a campaign now to initiate new conversations with users on WhatsApp.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <a href="#" className="text-blue-500 hover:text-blue-400 flex items-center gap-2">
                            <Send size={12} />
                            Audience segregation for WhatsApp Broadcast
                        </a>
                        <a href="#" className="text-blue-500 hover:text-blue-400 flex items-center gap-2">
                            <TrendingUp size={12} />
                            Upgrade WhatsApp Tier Limit
                        </a>
                    </div>
                </div>
            </GlassCard> */}

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

            {/* Loading State */}
            {loading && !error && (
                <GlassCard isDarkMode={isDarkMode} className="p-12">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <RefreshCw size={32} className="animate-spin text-emerald-500" />
                        <p className={cn("text-sm", isDarkMode ? 'text-white/60' : 'text-slate-600')}>Loading campaigns...</p>
                    </div>
                </GlassCard>
            )}

            {/* Campaign Table */}
            {!loading && !error && (
                <GlassCard isDarkMode={isDarkMode} className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[900px]">
                            <thead>
                                <tr className={cn("text-[10px] font-bold uppercase tracking-wider border-b", isDarkMode ? 'text-white/30 border-white/5' : 'text-slate-400 border-slate-200')}>
                                    <th className="px-6 py-4">Campaign</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Created At</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-center">Audience</th>
                                    <th className="px-6 py-4 text-center">Delivered</th>
                                    <th className="px-6 py-4 text-center">Read</th>
                                    <th className="px-6 py-4 text-center">Replied</th>
                                    <th className="px-6 py-4 text-center w-[50px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className={cn("divide-y", isDarkMode ? 'divide-white/5' : 'divide-slate-100')}>
                                {filteredCampaigns.length > 0 ? (
                                    filteredCampaigns.map((campaign) => (
                                        <tr
                                            key={campaign.campaign_id}
                                            onClick={() => handleCampaignClick(campaign.campaign_id)}
                                            className="group transition-all hover:bg-emerald-500/5 cursor-pointer"
                                        >
                                            <td className="px-6 py-5">
                                                <p className={cn("text-sm font-semibold", isDarkMode ? 'text-white' : 'text-slate-800')}>{campaign.campaign_name}</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={cn("text-xs font-medium capitalize", isDarkMode ? 'text-white/60' : 'text-slate-600')}>{campaign.campaign_type}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={cn("text-xs", isDarkMode ? 'text-white/40' : 'text-slate-500')}>{formatCampaignDate(campaign.createdAt)}</span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className={cn(
                                                    "text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wide",
                                                    getCampaignStatusColor(campaign.status)
                                                )}>
                                                    {campaign.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Users size={12} className={cn(isDarkMode ? 'text-white/40' : 'text-slate-400')} />
                                                    <span className={cn("text-xs font-semibold", isDarkMode ? 'text-white' : 'text-slate-700')}>
                                                        {campaign.total_audience.toLocaleString()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className={cn("text-xs font-semibold", isDarkMode ? 'text-emerald-400' : 'text-emerald-600')}>
                                                    {calculatePercentage(campaign.delivered_count, campaign.total_audience)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className={cn("text-xs font-semibold", isDarkMode ? 'text-blue-400' : 'text-blue-600')}>
                                                    {calculatePercentage(campaign.read_count, campaign.total_audience)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className={cn("text-xs font-semibold", isDarkMode ? 'text-purple-400' : 'text-purple-600')}>
                                                    {calculatePercentage(campaign.replied_count, campaign.total_audience)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <ActionMenu
                                                        isDarkMode={isDarkMode}
                                                        isView={true}
                                                        onView={() => handleCampaignClick(campaign.campaign_id)}
                                                        isDelete={['draft', 'scheduled', 'failed', 'completed'].includes(campaign.status)}
                                                        onDelete={() => {
                                                            setDeletingCampaignId(campaign.campaign_id);
                                                            setIsDeleteModalOpen(true);
                                                        }}
                                                        isExecute={['draft', 'scheduled'].includes(campaign.status)}
                                                        onExecute={() => handleExecuteCampaign(campaign.campaign_id)}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                <div className={cn(
                                                    "w-16 h-16 rounded-full flex items-center justify-center",
                                                    isDarkMode ? 'bg-white/5' : 'bg-slate-100'
                                                )}>
                                                    <Megaphone size={28} className={cn(isDarkMode ? 'text-white/20' : 'text-slate-300')} />
                                                </div>
                                                <div className="space-y-2">
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
                                                        className="mt-2 px-4 py-2 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-all flex items-center gap-2"
                                                    >
                                                        <Plus size={14} />
                                                        Create Campaign
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            )}

            {!loading && !error && (
                <div className="flex items-center justify-between">
                    <p className={cn("text-xs", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                        Showing {filteredCampaigns.length} of {pagination.totalCampaigns} campaigns
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => pagination.setPage(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                                pagination.currentPage === 1
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-white/10',
                                isDarkMode ? 'bg-white/5 text-white/40' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            )}
                        >
                            Previous
                        </button>
                        <span className={cn("px-3 py-1.5 text-xs font-semibold", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                            Page {pagination.currentPage} of {pagination.totalPages}
                        </span>
                        <button
                            onClick={() => pagination.setPage(pagination.currentPage + 1)}
                            disabled={pagination.currentPage >= pagination.totalPages}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                                pagination.currentPage >= pagination.totalPages
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-white/10',
                                isDarkMode ? 'bg-white/5 text-white/40' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            )}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Create Campaign Modal */}
            <CreateCampaignModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCampaignSuccess}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteCampaign}
                title="Delete Campaign"
                message="Are you sure you want to delete this campaign? This action cannot be undone."
                isDarkMode={isDarkMode}
                isLoading={actionLoading}
            />
        </div >
    );
};
