"use client";

import { useState } from 'react';
import { ArrowLeft, RefreshCw, Users, Send, Eye, MessageCircle, Calendar, Play, AlertTriangle, Wallet, Check, CheckCheck, Download, PauseCircle, PlayCircle, Trash2, RotateCcw, AlertCircle } from 'lucide-react';
import { GlassCard } from "@/components/ui/glassCard";
import { cn } from "@/lib/utils";
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'next/navigation';
import { useCampaignDetails } from '@/hooks/useCampaignDetails';
import { useSoftDeleteCampaignMutation, usePermanentDeleteCampaignMutation, useRestoreCampaignMutation } from '@/hooks/useCampaignQuery';
import { campaignService } from '@/services/campaign/campaign.service';
import type { RecipientStatus } from '@/services/campaign/campaign.types';
import { toast } from '@/lib/toast';
import { ConfirmationModal } from '@/components/ui/confirmationModal';
import { formatApiErrorForUser } from '@/utils/httpErrorMapper'; // F-15: HTTP error mapper
import {
    formatCampaignDateTime,
    calculateCampaignStatistics,
    getCampaignStatusColor,
    getRecipientStatusColor,
    canExecuteCampaign,
} from '@/utils/campaign.utils';
import { Select } from '@/components/ui/select';

interface CampaignDetailsViewProps {
    campaignId: string;
}

const getRefreshStatusMeta = (
    sentCount: number,
    deliveredCount: number,
    readCount: number,
    failedCount: number,
    failedErrorMessage: string | null,
    isDarkMode: boolean
) => {
    if (failedCount > 0) {
        return {
            icon: <AlertTriangle size={13} strokeWidth={2.4} />,
            label: `${failedCount.toLocaleString()} ${failedCount === 1 ? 'message failed' : 'messages failed'}`,
            note: failedErrorMessage || 'Latest refresh detected delivery errors',
            tone: isDarkMode
                ? 'border-red-400/25 bg-red-500/12 text-red-300'
                : 'border-red-200 bg-red-50 text-red-700',
            noteTone: isDarkMode ? 'text-red-200/80' : 'text-red-600',
            iconWrapTone: isDarkMode ? 'bg-red-500/15' : 'bg-red-100',
        };
    }

    if (readCount > 0) {
        return {
            icon: <CheckCheck size={13} strokeWidth={2.4} />,
            label: `${readCount.toLocaleString()} ${readCount === 1 ? 'message seen' : 'messages seen'}`,
            note: 'Latest read update',
            tone: isDarkMode
                ? 'border-cyan-400/20 bg-cyan-500/10 text-cyan-300'
                : 'border-cyan-200 bg-cyan-50 text-cyan-700',
            noteTone: isDarkMode ? 'text-white/55' : 'text-slate-500',
            iconWrapTone: isDarkMode ? 'bg-white/10' : 'bg-black/10',
        };
    }

    if (deliveredCount > 0) {
        return {
            icon: <CheckCheck size={13} strokeWidth={2.4} />,
            label: `${deliveredCount.toLocaleString()} ${deliveredCount === 1 ? 'message delivered' : 'messages delivered'}`,
            note: 'Latest delivery update',
            tone: isDarkMode
                ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700',
            noteTone: isDarkMode ? 'text-white/55' : 'text-slate-500',
            iconWrapTone: isDarkMode ? 'bg-white/10' : 'bg-black/10',
        };
    }

    if (sentCount > 0) {
        return {
            icon: <Check size={13} strokeWidth={3} />,
            label: `${sentCount.toLocaleString()} ${sentCount === 1 ? 'message sent' : 'messages sent'}`,
            note: 'Latest send update',
            tone: isDarkMode
                ? 'border-amber-400/20 bg-amber-500/10 text-amber-300'
                : 'border-amber-200 bg-amber-50 text-amber-700',
            noteTone: isDarkMode ? 'text-white/55' : 'text-slate-500',
            iconWrapTone: isDarkMode ? 'bg-white/10' : 'bg-black/10',
        };
    }

    return null;
};

export const CampaignDetailsView = ({ campaignId }: CampaignDetailsViewProps) => {
    const { isDarkMode } = useTheme();
    const router = useRouter();
    const { campaign, recipients, loading, isRefreshing, error, refetch, filters, stats, statsError, lastUpdatedAt, setCampaign } = useCampaignDetails(campaignId);
    const [executing, setExecuting] = useState(false);
    const [pausing, setPausing] = useState(false);
    const [resuming, setResuming] = useState(false);
    const [isStopConfirmationOpen, setIsStopConfirmationOpen] = useState(false);
    const [downloadingStatus, setDownloadingStatus] = useState<'all' | RecipientStatus | null>(null);

    // F-2: Delete/Restore state and mutations
    const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
    const [isPermanentDeleteConfirmationOpen, setIsPermanentDeleteConfirmationOpen] = useState(false);
    const [isRestoreConfirmationOpen, setIsRestoreConfirmationOpen] = useState(false);
    const softDeleteMutation = useSoftDeleteCampaignMutation(() => {
        toast.info('Campaign deleted. Reloading...');
        refetch({ manual: true });
    });
    const permanentDeleteMutation = usePermanentDeleteCampaignMutation(() => {
        toast.info('Campaign permanently deleted. Redirecting...');
        router.push('/campaign');
    });
    const restoreMutation = useRestoreCampaignMutation(() => {
        toast.info('Campaign restored. Reloading...');
        refetch({ manual: true });
    });

    const statistics = campaign ? calculateCampaignStatistics(campaign) : null;
    // Use stats from backend which now returns actual recipient counts
    const sentCount = stats?.total_sent ?? 0;
    const deliveredCount = stats?.total_delivered ?? 0;
    const readCount = stats?.total_opened ?? 0;
    const failedCount = stats?.status_counts?.failed ?? 0;
    const latestFailedError = stats?.latest_failed_error ?? null;
    const statusCounts = stats?.status_counts;
    const refreshStatus = getRefreshStatusMeta(
        sentCount,
        deliveredCount,
        readCount,
        failedCount,
        latestFailedError,
        isDarkMode
    );

    const handleExecuteCampaign = async () => {
        if (!campaign || !canExecuteCampaign(campaign.status)) return;

        // F-7: Optimistic update
        const previousCampaign = campaign;
        try {
            setExecuting(true);
            // Immediately update UI to show active status
            setCampaign({
                ...campaign,
                status: 'active',
                scheduled_at: null,
            });
            toast.success('Campaign started!');

            await campaignService.executeCampaign(campaignId);
            // No need to refetch since state is already updated
        } catch (error: unknown) {
            // Revert optimistic update on error
            setCampaign(previousCampaign);
            toast.error(formatApiErrorForUser(error, 'Failed to execute campaign.'));
        } finally {
            setExecuting(false);
        }
    };

    const handleRefresh = async () => {
        try {
            await refetch({ manual: true });
            toast.success('Campaign details refreshed.');
        } catch {
            // hook already sets the page-level error state
        }
    };

    const triggerDownload = (blob: Blob, filename: string) => {
        const objectUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(objectUrl);
    };

    const handleDownloadRecipients = async (status?: RecipientStatus) => {
        try {
            setDownloadingStatus(status || 'all');
            const { blob, filename } = await campaignService.downloadRecipientsCsv(campaignId, status);
            triggerDownload(blob, filename);
            toast.success(`${status ? `${status} recipients` : 'All recipients'} download started.`);
        } catch (error: unknown) {
            toast.error(formatApiErrorForUser(error, 'Failed to download recipients.'));
        } finally {
            setDownloadingStatus(null);
        }
    };

    const handlePauseCampaign = async () => {
        if (!campaign || campaign.status !== 'active') return;

        // F-7: Optimistic update
        const previousCampaign = campaign;
        try {
            setPausing(true);
            // Immediately update UI to show paused status
            setCampaign({
                ...campaign,
                status: 'paused',
            });
            toast.success('Campaign paused. Remaining recipients will not be sent.');
            setIsStopConfirmationOpen(false);

            await campaignService.updateCampaignStatus(campaignId, 'paused');
            // No need to refetch since state is already updated
        } catch (error: unknown) {
            // Revert optimistic update on error
            setCampaign(previousCampaign);
            toast.error(formatApiErrorForUser(error, 'Failed to pause campaign.'));
        } finally {
            setPausing(false);
        }
    };

    const handleResumeCampaign = async () => {
        if (!campaign || campaign.status !== 'paused') return;

        // F-7: Optimistic update
        const previousCampaign = campaign;
        try {
            setResuming(true);
            // Immediately update UI to show active status
            setCampaign({
                ...campaign,
                status: 'active',
            });
            toast.success('Campaign resumed. Remaining recipients will be sent shortly.');

            await campaignService.updateCampaignStatus(campaignId, 'active');
            // No need to refetch since state is already updated
        } catch (error: unknown) {
            // Revert optimistic update on error
            setCampaign(previousCampaign);
            toast.error(formatApiErrorForUser(error, 'Failed to resume campaign.'));
        } finally {
            setResuming(false);
        }
    };

    // F-2: Delete/Restore handlers
    const handleSoftDelete = async () => {
        if (!campaign) return;
        try {
            await softDeleteMutation.mutateAsync(campaignId);
            setIsDeleteConfirmationOpen(false);
        } catch (error: unknown) {
            console.error('Soft delete failed:', error);
        }
    };

    const handlePermanentDelete = async () => {
        if (!campaign) return;
        try {
            await permanentDeleteMutation.mutateAsync(campaignId);
            setIsPermanentDeleteConfirmationOpen(false);
        } catch (error: unknown) {
            console.error('Permanent delete failed:', error);
        }
    };

    const handleRestore = async () => {
        if (!campaign) return;
        try {
            await restoreMutation.mutateAsync(campaignId);
            setIsRestoreConfirmationOpen(false);
        } catch (error: unknown) {
            console.error('Restore failed:', error);
        }
    };

    const totalAudienceCount = campaign?.total_audience ?? recipients.length;
    const downloadButtons: Array<{ label: string; status?: RecipientStatus; count: number }> = [
        { label: 'Download All', count: statusCounts?.all ?? totalAudienceCount },
        { label: 'Pending', status: 'pending', count: statusCounts?.pending ?? 0 },
        { label: 'Failed', status: 'failed', count: statusCounts?.failed ?? 0 },
        { label: 'Delivered', status: 'delivered', count: statusCounts?.delivered ?? 0 },
        { label: 'Read', status: 'read', count: statusCounts?.read ?? 0 },
    ];

    const recipientStatusOptions = [
        { value: 'all', label: 'All Recipients' },
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
        <>
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

                        {/* F-2: Delete/Restore action buttons */}
                        {/* F-12: Check is_deleted flag (not status='deleted') since backend uses is_deleted boolean */}
                        <div className="flex gap-2 mt-2">
                            {campaign?.is_deleted ? (
                                <>
                                    <button
                                        onClick={() => setIsRestoreConfirmationOpen(true)}
                                        disabled={restoreMutation.isPending}
                                        className={cn(
                                            'px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2',
                                            isDarkMode
                                                ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                                                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
                                            restoreMutation.isPending && 'opacity-50 cursor-not-allowed'
                                        )}
                                    >
                                        <RotateCcw size={14} />
                                        {restoreMutation.isPending ? 'Restoring...' : 'Restore'}
                                    </button>
                                    <button
                                        onClick={() => setIsPermanentDeleteConfirmationOpen(true)}
                                        disabled={permanentDeleteMutation.isPending}
                                        className={cn(
                                            'px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2',
                                            isDarkMode
                                                ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                                                : 'bg-red-100 text-red-700 hover:bg-red-200',
                                            permanentDeleteMutation.isPending && 'opacity-50 cursor-not-allowed'
                                        )}
                                    >
                                        <Trash2 size={14} />
                                        {permanentDeleteMutation.isPending ? 'Deleting...' : 'Delete Permanently'}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsDeleteConfirmationOpen(true)}
                                    disabled={softDeleteMutation.isPending}
                                    className={cn(
                                        'px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2',
                                        isDarkMode
                                            ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                                            : 'bg-red-100 text-red-700 hover:bg-red-200',
                                        softDeleteMutation.isPending && 'opacity-50 cursor-not-allowed'
                                    )}
                                >
                                    <Trash2 size={14} />
                                    {softDeleteMutation.isPending ? 'Deleting...' : 'Delete'}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                        <div className="flex flex-wrap justify-end gap-3">
                            <button
                                onClick={handleRefresh}
                                disabled={loading || isRefreshing}
                                className={cn(
                                    "px-4 py-2 rounded-xl border text-xs font-semibold transition-all flex items-center gap-2",
                                    isDarkMode
                                        ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50',
                                    (loading || isRefreshing) && 'opacity-50 cursor-not-allowed'
                                )}
                            >
                                <RefreshCw size={14} className={(loading || isRefreshing) ? 'animate-spin' : ''} />
                                Refresh
                            </button>

                            {campaign.status === 'active' && (
                                <button
                                    onClick={() => setIsStopConfirmationOpen(true)}
                                    disabled={pausing}
                                    className={cn(
                                        'px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2',
                                        'bg-red-500 text-white shadow-lg shadow-red-500/20 hover:scale-105 active:scale-95',
                                        pausing && 'opacity-50 cursor-not-allowed'
                                    )}
                                >
                                    <PauseCircle size={14} />
                                    {pausing ? 'Stopping...' : 'Stop Campaign'}
                                </button>
                            )}

                            {campaign.status === 'paused' && (
                                <button
                                    onClick={handleResumeCampaign}
                                    disabled={resuming}
                                    className={cn(
                                        'px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2',
                                        'bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95',
                                        resuming && 'opacity-50 cursor-not-allowed'
                                    )}
                                >
                                    <PlayCircle size={14} />
                                    {resuming ? 'Resuming...' : 'Resume Campaign'}
                                </button>
                            )}

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

                        {/* refreshStatus badge removed per UI request */}

                        {/* {lastUpdatedAt && (
                            <p className={cn('text-[11px]', isDarkMode ? 'text-white/35' : 'text-slate-500')}>
                                Last updated {formatCampaignDateTime(lastUpdatedAt)}
                            </p>
                        )} */}
                    </div>
                </div>

                {/* Statistics Dashboard */}
                {campaign.status === 'paused' && (
                    <div className={cn(
                        "flex items-center gap-4 px-5 py-4 rounded-2xl border",
                        isDarkMode
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                            : "bg-amber-50 border-amber-200 text-amber-700"
                    )}>
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                            isDarkMode ? "bg-amber-500/15" : "bg-amber-100"
                        )}>
                            <AlertTriangle size={18} className="text-amber-500" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold">Campaign paused</p>
                            {campaign.paused_reason && (
                                <p className={cn("text-xs mt-1 font-medium", isDarkMode ? "text-amber-300" : "text-amber-800")}>
                                    Reason: {campaign.paused_reason}
                                </p>
                            )}
                            <p className={cn("text-xs mt-0.5", isDarkMode ? "text-amber-400/70" : "text-amber-600")}>
                                Remaining sends and scheduled retries are suspended until you resume the campaign. If this pause happened because of low wallet balance, recharge first and then continue.
                            </p>
                        </div>
                        <button
                            onClick={() => window.location.href = '/billing'}
                            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                        >
                            <Wallet size={13} />
                            Recharge Wallet
                        </button>
                    </div>
                )}

                {/* F-8: Show stats error inline if fetch failed, instead of silently disappearing */}
                {statsError ? (
                    <GlassCard isDarkMode={isDarkMode} className="p-6 bg-amber-500/5 border-amber-500/20">
                        <div className="flex items-center gap-3">
                            <AlertCircle size={16} className="text-amber-500 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">{statsError}</p>
                            </div>
                            <button
                                onClick={() => refetch({ manual: true })}
                                className={cn(
                                    "text-xs font-semibold px-3 py-1 rounded transition-colors",
                                    isDarkMode
                                        ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                )}
                            >
                                Retry
                            </button>
                        </div>
                    </GlassCard>
                ) : null}

                {/* Statistics Dashboard */}
                {statistics && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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

                        {/* Sent */}
                        <GlassCard isDarkMode={isDarkMode} className="p-6 bg-emerald-500/5 border-emerald-500/20">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-semibold uppercase tracking-wide text-emerald-500">
                                    SENT
                                </span>
                                <Send size={16} className="text-emerald-500" />
                            </div>
                            <p className="text-3xl font-bold text-emerald-500">
                                {Number(sentCount || 0).toLocaleString()}
                            </p>
                            <p className={cn("text-xs mt-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                {Number(sentCount || 0).toLocaleString()} of {Number(totalAudienceCount || 0).toLocaleString()} total
                            </p>
                            <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 transition-all duration-500"
                                    style={{ width: `${Math.min(100, Math.round(((sentCount || 0) / Math.max(1, totalAudienceCount)) * 100))}%` }}
                                />
                            </div>
                        </GlassCard>

                        {/* Failed */}
                        <GlassCard isDarkMode={isDarkMode} className="p-6 bg-red-500/5 border-red-500/20">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-semibold uppercase tracking-wide text-red-500">
                                    FAILED
                                </span>
                                <AlertTriangle size={16} className="text-red-500" />
                            </div>
                            <p className={cn("text-3xl font-bold", failedCount > 0 ? 'text-red-500' : (isDarkMode ? 'text-white/40' : 'text-slate-500'))}>
                                {Number(failedCount || 0).toLocaleString()}
                            </p>
                            <p className={cn("text-xs mt-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                {Number(failedCount || 0).toLocaleString()} permanently failed
                            </p>
                            <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className={cn('h-full transition-all duration-500', failedCount > 0 ? 'bg-red-500' : (isDarkMode ? 'bg-white/10' : 'bg-slate-300'))}
                                    style={{ width: `${Math.min(100, Math.round(((failedCount || 0) / Math.max(1, totalAudienceCount)) * 100))}%` }}
                                />
                            </div>
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
                            <p className={cn("text-xs mt-1 font-medium", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                Open Rate: {stats?.open_rate ?? 0}%
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
                            <p className={cn("text-xs mt-1 font-medium", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                Click Rate: {stats?.click_rate ?? 0}%
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
                                {campaign.template?.template_id ?? '—'}
                            </p>
                        </div>
                        <div>
                            <p className={cn("text-xs font-semibold uppercase tracking-wide mb-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                Template Name
                            </p>
                            <p className={cn("text-sm font-semibold capitalize", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                {campaign.template?.template_name ?? '—'}
                            </p>
                        </div>
                        <div>
                            <p className={cn("text-xs font-semibold uppercase tracking-wide mb-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                Category
                            </p>
                            <p className={cn("text-sm font-semibold capitalize", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                {campaign.template?.category ?? '—'}
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
                        <div className="flex flex-wrap items-center justify-end gap-3">
                            {downloadButtons.map((button) => (
                                <button
                                    key={button.label}
                                    onClick={() => handleDownloadRecipients(button.status)}
                                    disabled={downloadingStatus !== null}
                                    className={cn(
                                        'px-3 py-2 rounded-xl border text-xs font-semibold transition-all flex items-center gap-2',
                                        isDarkMode
                                            ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50',
                                        downloadingStatus !== null && 'opacity-50 cursor-not-allowed'
                                    )}
                                >
                                    <Download size={13} />
                                    {downloadingStatus === (button.status || 'all') ? 'Downloading...' : `${button.label} (${button.count})`}
                                </button>
                            ))}

                            <div className="w-72 min-w-[18rem]">
                                <Select
                                    isDarkMode={isDarkMode}
                                    options={recipientStatusOptions}
                                    value={filters.recipientStatus || 'all'}
                                    onChange={(value) => filters.setRecipientStatus(value === 'all' ? undefined : value as RecipientStatus)}
                                    placeholder="All Recipients"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
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
                                                <div className="flex flex-col gap-1">
                                                    <span className={cn(
                                                        "text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wide w-fit",
                                                        getRecipientStatusColor(recipient.status)
                                                    )}>
                                                        {recipient.status}
                                                    </span>
                                                    {['failed', 'permanently_failed'].includes(recipient.status) && recipient.error_message && (
                                                        <span className="text-[10px] text-red-500 font-medium leading-tight max-w-[200px]">
                                                            {recipient.error_message}
                                                        </span>
                                                    )}
                                                </div>
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

                <style jsx>{`
                .delivery-update-indicator {
                    position: relative;
                    overflow: hidden;
                }

                .delivery-update-indicator::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: 9999px;
                    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 48%, transparent 100%);
                    transform: translateX(-135%);
                    animation: deliveryUpdateSweep 3s ease-in-out infinite;
                    pointer-events: none;
                }

                .delivery-update-indicator svg {
                    animation: deliveryUpdateTick 700ms ease-out;
                    transform-origin: center;
                }

                @keyframes deliveryUpdateTick {
                    0% {
                        opacity: 0;
                        transform: scale(0.78) translateY(2px);
                    }
                    60% {
                        opacity: 1;
                        transform: scale(1.06) translateY(0);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                @keyframes deliveryUpdateSweep {
                    0%,
                    100% {
                        transform: translateX(-135%);
                        opacity: 0;
                    }
                    20% {
                        opacity: 1;
                    }
                    55% {
                        transform: translateX(135%);
                        opacity: 0.8;
                    }
                    56% {
                        opacity: 0;
                    }
                }
            `}</style>
            </div>
            <ConfirmationModal
                isOpen={isStopConfirmationOpen}
                onClose={() => !pausing && setIsStopConfirmationOpen(false)}
                onConfirm={handlePauseCampaign}
                title="Stop Campaign"
                message="This will pause the campaign immediately. Remaining pending recipients and scheduled retries will stay unsent until you resume it."
                isDarkMode={isDarkMode}
                confirmText="Stop Campaign"
                cancelText="Keep Running"
                isLoading={pausing}
                variant="warning"
            />

            {/* F-2: Delete/Restore confirmation modals */}
            <ConfirmationModal
                isOpen={isDeleteConfirmationOpen}
                onClose={() => !softDeleteMutation.isPending && setIsDeleteConfirmationOpen(false)}
                onConfirm={handleSoftDelete}
                title="Delete Campaign"
                message="This will move the campaign to the trash. You can restore it later, but it will no longer be active."
                isDarkMode={isDarkMode}
                confirmText="Delete Campaign"
                cancelText="Cancel"
                isLoading={softDeleteMutation.isPending}
                variant="danger"
            />

            <ConfirmationModal
                isOpen={isPermanentDeleteConfirmationOpen}
                onClose={() => !permanentDeleteMutation.isPending && setIsPermanentDeleteConfirmationOpen(false)}
                onConfirm={handlePermanentDelete}
                title="Permanently Delete Campaign"
                message="This will permanently delete this campaign and cannot be undone. All history and data associated with this campaign will be lost."
                isDarkMode={isDarkMode}
                confirmText="Permanently Delete"
                cancelText="Cancel"
                isLoading={permanentDeleteMutation.isPending}
                variant="danger"
            />

            <ConfirmationModal
                isOpen={isRestoreConfirmationOpen}
                onClose={() => !restoreMutation.isPending && setIsRestoreConfirmationOpen(false)}
                onConfirm={handleRestore}
                title="Restore Campaign"
                message="This will restore the campaign from the trash and make it visible again."
                isDarkMode={isDarkMode}
                confirmText="Restore Campaign"
                cancelText="Cancel"
                isLoading={restoreMutation.isPending}
                variant="warning"
            />
        </>
    );
};
