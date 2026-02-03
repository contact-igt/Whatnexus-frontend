"use client";

import { useState } from 'react';
import { ArrowLeft, RefreshCw, Users, Send, Eye, MessageCircle, Calendar, Play, Trash2, ListFilter, Filter } from 'lucide-react';
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'next/navigation';
import { useCampaignDetails } from '@/hooks/useCampaignDetails';
import { campaignService } from '@/services/campaign/campaign.service';
import type { RecipientStatus } from '@/services/campaign/campaign.types';
import {
    formatCampaignDateTime,
    calculateCampaignStatistics,
    getCampaignStatusColor,
    getRecipientStatusColor,
    canExecuteCampaign,
} from '@/utils/campaign.utils';

interface CampaignDetailsViewProps {
    campaignId: string;
}

export const CampaignDetailsView = ({ campaignId }: CampaignDetailsViewProps) => {
    const { isDarkMode } = useTheme();
    const router = useRouter();
    const { campaign, recipients, loading, error, refetch, filters } = useCampaignDetails(campaignId);
    const [executing, setExecuting] = useState(false);

    const statistics = campaign ? calculateCampaignStatistics(campaign) : null;

    const handleExecuteCampaign = async () => {
        if (!campaign || !canExecuteCampaign(campaign.status)) return;

        try {
            setExecuting(true);
            await campaignService.executeCampaign(campaignId);
            await refetch(); // Refresh data after execution
        } catch (err) {
            console.error('Error executing campaign:', err);
        } finally {
            setExecuting(false);
        }
    };

    const recipientStatusOptions: { value: RecipientStatus | undefined; label: string }[] = [
        { value: undefined, label: 'All Recipients' },
        { value: 'pending', label: 'Pending' },
        { value: 'sent', label: 'Sent' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'read', label: 'Read' },
        { value: 'failed', label: 'Failed' },
    ];

    if (loading && !campaign) {
        return (
            <div className="h-full overflow-y-auto p-10 space-y-8 animate-in slide-in-from-bottom-8 duration-700 max-w-[1600px] mx-auto no-scrollbar pb-32">
                <GlassCard isDarkMode={isDarkMode} className="p-12">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <RefreshCw size={32} className="animate-spin text-emerald-500" />
                        <p className={cn("text-sm", isDarkMode ? 'text-white/60' : 'text-slate-600')}>Loading campaign details...</p>
                    </div>
                </GlassCard>
            </div>
        );
    }

    if (error || !campaign) {
        return (
            <div className="h-full overflow-y-auto p-10 space-y-8 animate-in slide-in-from-bottom-8 duration-700 max-w-[1600px] mx-auto no-scrollbar pb-32">
                <GlassCard isDarkMode={isDarkMode} className="p-6 bg-red-500/5 border-red-500/20">
                    <p className="text-red-500 text-sm">{error || 'Campaign not found'}</p>
                    <button
                        onClick={() => router.push('/campaign')}
                        className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-all"
                    >
                        Back to Campaigns
                    </button>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-10 space-y-8 animate-in slide-in-from-bottom-8 duration-700 max-w-[1600px] mx-auto no-scrollbar pb-32">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="space-y-3">
                    <button
                        onClick={() => router.push('/campaign')}
                        className={cn(
                            "flex items-center gap-2 text-xs font-semibold transition-all hover:gap-3",
                            isDarkMode ? 'text-white/60 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                        )}
                    >
                        <ArrowLeft size={14} />
                        Back to Campaigns
                    </button>
                    <h1 className={cn("text-4xl font-bold tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>
                        {campaign.campaign_name}
                    </h1>
                    <div className="flex items-center gap-3">
                        <span className={cn(
                            "text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wide",
                            getCampaignStatusColor(campaign.status)
                        )}>
                            {campaign.status}
                        </span>
                        <span className={cn("text-xs capitalize", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                            {campaign.campaign_type} Campaign
                        </span>
                        {campaign.scheduled_at && (
                            <span className={cn("text-xs flex items-center gap-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                <Calendar size={12} />
                                Scheduled: {formatCampaignDateTime(campaign.scheduled_at)}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => refetch()}
                        disabled={loading}
                        className={cn(
                            "px-4 py-2 rounded-xl border text-xs font-semibold transition-all flex items-center gap-2",
                            isDarkMode
                                ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50',
                            loading && 'opacity-50 cursor-not-allowed'
                        )}
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>

                    {canExecuteCampaign(campaign.status) && (
                        <button
                            onClick={handleExecuteCampaign}
                            disabled={executing}
                            className={cn(
                                "px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2",
                                "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95",
                                executing && 'opacity-50 cursor-not-allowed'
                            )}
                        >
                            <Play size={14} />
                            {executing ? 'Executing...' : 'Execute Now'}
                        </button>
                    )}
                </div>
            </div>

            {/* Statistics Dashboard */}
            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Audience */}
                    <GlassCard isDarkMode={isDarkMode} className="p-6">
                        <div className="flex items-center justify-between mb-3">
                            <span className={cn("text-xs font-semibold uppercase tracking-wide", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                Total Audience
                            </span>
                            <Users size={16} className={cn(isDarkMode ? 'text-white/40' : 'text-slate-400')} />
                        </div>
                        <p className={cn("text-3xl font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                            {statistics.total_audience.toLocaleString()}
                        </p>
                    </GlassCard>

                    {/* Delivered */}
                    <GlassCard isDarkMode={isDarkMode} className="p-6 bg-emerald-500/5 border-emerald-500/20">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-500">
                                Delivered
                            </span>
                            <Send size={16} className="text-emerald-500" />
                        </div>
                        <p className="text-3xl font-bold text-emerald-500">
                            {statistics.delivered_percentage}%
                        </p>
                        <p className={cn("text-xs mt-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                            {statistics.delivered_count.toLocaleString()} messages
                        </p>
                        <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 transition-all duration-500"
                                style={{ width: `${statistics.delivered_percentage}%` }}
                            />
                        </div>
                    </GlassCard>

                    {/* Read */}
                    <GlassCard isDarkMode={isDarkMode} className="p-6 bg-blue-500/5 border-blue-500/20">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                                Read
                            </span>
                            <Eye size={16} className="text-blue-500" />
                        </div>
                        <p className="text-3xl font-bold text-blue-500">
                            {statistics.read_percentage}%
                        </p>
                        <p className={cn("text-xs mt-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                            {statistics.read_count.toLocaleString()} messages
                        </p>
                        <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 transition-all duration-500"
                                style={{ width: `${statistics.read_percentage}%` }}
                            />
                        </div>
                    </GlassCard>

                    {/* Replied */}
                    <GlassCard isDarkMode={isDarkMode} className="p-6 bg-purple-500/5 border-purple-500/20">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold uppercase tracking-wide text-purple-500">
                                Replied
                            </span>
                            <MessageCircle size={16} className="text-purple-500" />
                        </div>
                        <p className="text-3xl font-bold text-purple-500">
                            {statistics.replied_percentage}%
                        </p>
                        <p className={cn("text-xs mt-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                            {statistics.replied_count.toLocaleString()} messages
                        </p>
                        <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-purple-500 transition-all duration-500"
                                style={{ width: `${statistics.replied_percentage}%` }}
                            />
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* Template Information */}
            <GlassCard isDarkMode={isDarkMode} className="p-6">
                <h2 className={cn("text-lg font-bold mb-4", isDarkMode ? 'text-white' : 'text-slate-900')}>
                    Template Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p className={cn("text-xs font-semibold uppercase tracking-wide mb-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                            Template ID
                        </p>
                        <p className={cn("text-sm font-semibold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                            {campaign.template.template_id}
                        </p>
                    </div>
                    <div>
                        <p className={cn("text-xs font-semibold uppercase tracking-wide mb-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                            Template Name
                        </p>
                        <p className={cn("text-sm font-semibold capitalize", isDarkMode ? 'text-white' : 'text-slate-900')}>
                            {campaign.template.template_name}
                        </p>
                    </div>
                    <div>
                        <p className={cn("text-xs font-semibold uppercase tracking-wide mb-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                            Category
                        </p>
                        <p className={cn("text-sm font-semibold capitalize", isDarkMode ? 'text-white' : 'text-slate-900')}>
                            {campaign.template.category}
                        </p>
                    </div>
                </div>
            </GlassCard>

            {/* Recipients List */}
            <GlassCard isDarkMode={isDarkMode} className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className={cn("text-lg font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                        Recipients ({recipients.length})
                    </h2>
                    <div className="flex items-center gap-3">
                        <ListFilter size={16} className={cn(isDarkMode ? 'text-white/60' : 'text-slate-500')} />
                        <select
                            value={filters.recipientStatus || ''}
                            onChange={(e) => filters.setRecipientStatus(e.target.value as RecipientStatus || undefined)}
                            style={{
                                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                                color: isDarkMode ? '#ffffff' : '#334155',
                            }}
                            className={cn(
                                "px-4 py-2 rounded-xl border text-xs font-semibold transition-all outline-none cursor-pointer",
                                isDarkMode
                                    ? 'border-white/10 hover:bg-white/10 focus:border-emerald-500/50'
                                    : 'border-slate-200 hover:bg-slate-50 focus:border-emerald-500'
                            )}
                        >
                            {recipientStatusOptions.map(option => (
                                <option
                                    key={option.label}
                                    value={option.value || ''}
                                    style={{
                                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                                        color: isDarkMode ? '#ffffff' : '#334155',
                                    }}
                                >
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead>
                            <tr className={cn("text-[10px] font-bold uppercase tracking-wider border-b", isDarkMode ? 'text-white/30 border-white/5' : 'text-slate-400 border-slate-200')}>
                                <th className="px-4 py-3">Mobile Number</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Dynamic Variables</th>
                                <th className="px-4 py-3">Sent At</th>
                                <th className="px-4 py-3">Message ID</th>
                            </tr>
                        </thead>
                        <tbody className={cn("divide-y", isDarkMode ? 'divide-white/5' : 'divide-slate-100')}>
                            {recipients.length > 0 ? (
                                recipients.map((recipient) => (
                                    <tr key={recipient.id} className="group transition-all hover:bg-emerald-500/5">
                                        <td className="px-4 py-4">
                                            <p className={cn("text-sm font-mono", isDarkMode ? 'text-white' : 'text-slate-800')}>
                                                +{recipient.mobile_number}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={cn(
                                                "text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wide",
                                                getRecipientStatusColor(recipient.status)
                                            )}>
                                                {recipient.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {(() => {
                                                    // Handle dynamic_variables as either array or string
                                                    const variables = Array.isArray(recipient.dynamic_variables)
                                                        ? recipient.dynamic_variables
                                                        : typeof recipient.dynamic_variables === 'string'
                                                            ? recipient.dynamic_variables.split(',').map(v => v.trim())
                                                            : [];

                                                    return variables.map((variable, index) => (
                                                        <span
                                                            key={index}
                                                            className={cn(
                                                                "text-[10px] px-2 py-0.5 rounded",
                                                                isDarkMode ? 'bg-white/10 text-white/60' : 'bg-slate-100 text-slate-600'
                                                            )}
                                                        >
                                                            {variable}
                                                        </span>
                                                    ));
                                                })()}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={cn("text-xs", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                                {recipient.sent_at ? formatCampaignDateTime(recipient.sent_at) : '-'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={cn("text-xs font-mono", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                                {recipient.meta_message_id || '-'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center">
                                        <p className={cn("text-sm", isDarkMode ? 'text-white/40' : 'text-slate-400')}>
                                            No recipients found
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
};
