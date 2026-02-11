"use client";

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Save, Edit2, Eye } from 'lucide-react';
import { GlassCard } from "@/components/ui/glass-card";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTheme } from '@/hooks/useTheme';
import { useGetAiLogByIdQuery, useUpdateAiLogStatusMutation } from '@/hooks/useAiLogsQuery';
import { toast } from 'sonner';

const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending':
            return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
        case 'act_on':
            return 'bg-red-500/10 text-red-500 border border-red-500/20';
        case 'resolved':
            return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
        case 'ignored':
            return 'bg-slate-500/10 text-slate-500 border border-slate-500/20';
        default:
            return 'bg-slate-500/10 text-slate-500 border border-slate-500/20';
    }
};

const getTypeColor = (type: string) => {
    switch (type) {
        case 'missing_knowledge':
            return 'bg-blue-500/10 text-blue-500';
        case 'out_of_scope':
            return 'bg-purple-500/10 text-purple-500';
        case 'urgent':
            return 'bg-red-500/10 text-red-500';
        case 'sentiment':
            return 'bg-orange-500/10 text-orange-500';
        default:
            return 'bg-slate-500/10 text-slate-500';
    }
};

const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export default function AiLogDetailPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const { isDarkMode } = useTheme();

    const id = params.id as string;
    const mode = searchParams.get('mode') || 'view';
    const isAnswerMode = mode === 'answer'; // Answer-only mode

    const [isEditMode, setIsEditMode] = useState(mode === 'edit' || isAnswerMode);
    const [formData, setFormData] = useState({
        status: '' as 'pending' | 'act_on' | 'resolved' | 'ignored' | '',
        type: '' as 'missing_knowledge' | 'out_of_scope' | 'urgent' | 'sentiment' | '',
        resolution: '',
    });

    const { data: logData, isLoading } = useGetAiLogByIdQuery(id);
    const { mutate: updateStatus, isPending: isUpdating } = useUpdateAiLogStatusMutation();

    const log = logData?.data;

    useEffect(() => {
        if (log) {
            setFormData({
                status: log.status,
                type: log.type,
                resolution: log.resolution || '',
            });
        }
    }, [log]);

    const handleSave = () => {
        if (!formData.resolution.trim() && (formData.status === 'resolved' || isAnswerMode)) {
            toast.error("Please provide a resolution");
            return;
        }

        let updatePayload: any = {};

        if (isAnswerMode) {
            // Answer mode: Always set status to resolved and include resolution
            updatePayload = {
                status: "resolved",
                resolution: formData.resolution,
                type: formData.type
            };
        } else {
            // Edit mode: Always include status and type
            updatePayload.status = formData.status;
            updatePayload.type = formData.type;

            if (formData.resolution !== (log?.resolution || '')) {
                updatePayload.resolution = formData.resolution;
            }
        }

        updateStatus({
            id: id,
            data: updatePayload,
        }, {
            onSuccess: () => {
                setIsEditMode(false);
                router.push('/knowledge');
            }
        });
    };

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-emerald-500" size={40} />
            </div>
        );
    }

    if (!log) {
        return (
            <div className="h-full flex items-center justify-center">
                <p className={cn("text-sm", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                    Log not found
                </p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 max-w-[1200px] mx-auto no-scrollbar pb-32">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className={cn(
                            "p-2 rounded-lg transition-all",
                            isDarkMode
                                ? 'hover:bg-white/10 text-white'
                                : 'hover:bg-slate-100 text-slate-700'
                        )}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className={cn("text-2xl font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                            {isAnswerMode ? 'Answer Question' : (isEditMode ? 'Edit AI Log' : 'View AI Log')}
                        </h1>
                        <p className={cn("text-sm mt-1", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                            {isAnswerMode ? 'Provide an answer to resolve this question' : (isEditMode ? 'Update the log details' : 'Review the AI log details')}
                        </p>
                    </div>
                </div>

                {!isEditMode && (
                    <button
                        onClick={() => setIsEditMode(true)}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                    >
                        <Edit2 size={16} />
                        Edit
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* User Question */}
                    <GlassCard isDarkMode={isDarkMode} className="p-6">
                        <h3 className={cn("text-sm font-semibold mb-3", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                            User Question
                        </h3>
                        <p className={cn("text-base", isDarkMode ? 'text-white' : 'text-slate-900')}>
                            {log.user_message}
                        </p>
                    </GlassCard>

                    {/* AI Response */}
                    <GlassCard isDarkMode={isDarkMode} className="p-6">
                        <h3 className={cn("text-sm font-semibold mb-3", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                            AI Response
                        </h3>
                        <p className={cn("text-sm", isDarkMode ? 'text-white/80' : 'text-slate-700')}>
                            {log.ai_response}
                        </p>
                    </GlassCard>

                    {/* Resolution */}
                    <GlassCard isDarkMode={isDarkMode} className="p-6">
                        <h3 className={cn("text-sm font-semibold mb-3", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                            Resolution {isEditMode && <span className="text-red-500">*</span>}
                        </h3>
                        {isEditMode ? (
                            <textarea
                                value={formData.resolution}
                                onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                                placeholder="Provide the answer or resolution for this question..."
                                rows={6}
                                className={cn(
                                    "w-full px-4 py-3 rounded-xl text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none",
                                    isDarkMode
                                        ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30'
                                        : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                                )}
                            />
                        ) : (
                            <p className={cn("text-sm", isDarkMode ? 'text-white/80' : 'text-slate-700')}>
                                {log.resolution || 'No resolution provided yet'}
                            </p>
                        )}
                    </GlassCard>

                    {/* Payload */}
                    <GlassCard isDarkMode={isDarkMode} className="p-6">
                        <h3 className={cn("text-sm font-semibold mb-3", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                            System Payload
                        </h3>
                        <p className={cn("text-xs font-mono", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                            {log.payload}
                        </p>
                    </GlassCard>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status & Type */}
                    <GlassCard isDarkMode={isDarkMode} className="p-6">
                        <h3 className={cn("text-sm font-semibold mb-4", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                            Classification
                        </h3>

                        <div className="space-y-4">
                            {/* Type */}
                            <div>
                                {(isEditMode) ? (
                                    <Select
                                        isDarkMode={isDarkMode}
                                        label="Type"
                                        value={formData.type}
                                        onChange={(value) => setFormData({ ...formData, type: value as any })}
                                        options={[
                                            { value: 'missing_knowledge', label: 'Missing Knowledge' },
                                            { value: 'out_of_scope', label: 'Out of Scope' },
                                            { value: 'urgent', label: 'Urgent' },
                                            { value: 'sentiment', label: 'Sentiment' },
                                        ]}
                                    />
                                ) : (
                                    <>
                                        <label className={cn("text-xs font-semibold mb-2 block", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                            Type
                                        </label>
                                        <span className={cn(
                                            "inline-block text-xs font-medium px-3 py-1.5 rounded capitalize",
                                            getTypeColor(log.type)
                                        )}>
                                            {log.type.replace('_', ' ')}
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Status */}
                            <div>
                                {(isEditMode && !isAnswerMode) ? (
                                    <Select
                                        isDarkMode={isDarkMode}
                                        label="Status"
                                        value={formData.status}
                                        onChange={(value) => setFormData({ ...formData, status: value as any })}
                                        options={[
                                            { value: 'pending', label: 'Pending' },
                                            { value: 'act_on', label: 'Urgent' },
                                            { value: 'resolved', label: 'Resolved' },
                                            { value: 'ignored', label: 'Ignored' },
                                        ]}
                                    />
                                ) : (
                                    <>
                                        <label className={cn("text-xs font-semibold mb-2 block", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                            Status
                                        </label>
                                        <span className={cn(
                                            "inline-block text-xs font-semibold px-3 py-1.5 rounded capitalize",
                                            getStatusColor(log.status)
                                        )}>
                                            {log.status === 'act_on' ? 'Urgent' : log.status}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </GlassCard>

                    {/* Metadata */}
                    <GlassCard isDarkMode={isDarkMode} className="p-6">
                        <h3 className={cn("text-sm font-semibold mb-4", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                            Metadata
                        </h3>

                        <div className="space-y-3">
                            <div>
                                <p className={cn("text-xs font-semibold mb-1", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                    Created At
                                </p>
                                <p className={cn("text-sm", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                    {formatDate(log.created_at)}
                                </p>
                            </div>

                            <div>
                                <p className={cn("text-xs font-semibold mb-1", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                    Last Updated
                                </p>
                                <p className={cn("text-sm", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                    {formatDate(log.updated_at)}
                                </p>
                            </div>

                            <div>
                                <p className={cn("text-xs font-semibold mb-1", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                    Log ID
                                </p>
                                <p className={cn("text-sm font-mono", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                    #{log.id}
                                </p>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Actions */}
                    {isEditMode && (
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleSave}
                                disabled={isUpdating}
                                className="w-full px-6 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="animate-spin" size={16} />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        {isAnswerMode ? 'Save Answer' : (formData.status === 'resolved' ? 'Save Resolution' : 'Update Status')}
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => setIsEditMode(false)}
                                disabled={isUpdating}
                                className={cn(
                                    "w-full px-6 py-3 rounded-xl text-sm font-semibold transition-all border",
                                    isDarkMode
                                        ? 'border-white/10 text-white/70 hover:bg-white/5'
                                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                )}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
