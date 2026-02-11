"use client";

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { GlassCard } from "@/components/ui/glass-card";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useCreateAiLogMutation } from '@/hooks/useAiLogsQuery';

interface CreateLogModalProps {
    isDarkMode: boolean;
    isOpen: boolean;
    onClose: () => void;
}

export const CreateLogModal = ({ isDarkMode, isOpen, onClose }: CreateLogModalProps) => {
    const [formData, setFormData] = useState({
        type: 'missing_knowledge' as 'missing_knowledge' | 'out_of_scope' | 'urgent' | 'sentiment',
        user_message: '',
        ai_response: '',
        payload: '',
        status: 'pending' as 'pending' | 'act_on' | 'resolved' | 'ignored',
    });

    const { mutate: createLog, isPending } = useCreateAiLogMutation();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        createLog(formData, {
            onSuccess: () => {
                onClose();
                setFormData({
                    type: 'missing_knowledge',
                    user_message: '',
                    ai_response: '',
                    payload: '',
                    status: 'pending',
                });
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <GlassCard
                isDarkMode={isDarkMode}
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className={cn("text-xl font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                Create AI Log
                            </h2>
                            <p className={cn("text-sm mt-1", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                Manually add an unanswered question
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                isDarkMode ? 'hover:bg-white/10 text-white/70' : 'hover:bg-slate-100 text-slate-600'
                            )}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        {/* Type */}
                        <Select
                            isDarkMode={isDarkMode}
                            label="Type"
                            required
                            value={formData.type}
                            onChange={(value) => setFormData({ ...formData, type: value as any })}
                            options={[
                                { value: 'missing_knowledge', label: 'Missing Knowledge' },
                                { value: 'out_of_scope', label: 'Out of Scope' },
                                { value: 'urgent', label: 'Urgent' },
                                { value: 'sentiment', label: 'Sentiment' },
                            ]}
                        />

                        {/* Status */}
                        <Select
                            isDarkMode={isDarkMode}
                            label="Status"
                            required
                            value={formData.status}
                            onChange={(value) => setFormData({ ...formData, status: value as any })}
                            options={[
                                { value: 'pending', label: 'Pending' },
                                { value: 'act_on', label: 'Urgent' },
                                { value: 'resolved', label: 'Resolved' },
                                { value: 'ignored', label: 'Ignored' },
                            ]}
                        />

                        {/* User Message */}
                        <div>
                            <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                                User Message <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                required
                                value={formData.user_message}
                                onChange={(e) => setFormData({ ...formData, user_message: e.target.value })}
                                placeholder="Enter the user's question..."
                                rows={3}
                                className={cn(
                                    "w-full px-4 py-3 rounded-xl text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none",
                                    isDarkMode
                                        ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30'
                                        : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                                )}
                            />
                        </div>

                        {/* AI Response */}
                        <div>
                            <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                                AI Response <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                required
                                value={formData.ai_response}
                                onChange={(e) => setFormData({ ...formData, ai_response: e.target.value })}
                                placeholder="Enter the AI's response..."
                                rows={3}
                                className={cn(
                                    "w-full px-4 py-3 rounded-xl text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none",
                                    isDarkMode
                                        ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30'
                                        : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                                )}
                            />
                        </div>

                        {/* Payload */}
                        <div>
                            <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                                Payload <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                required
                                value={formData.payload}
                                onChange={(e) => setFormData({ ...formData, payload: e.target.value })}
                                placeholder="Enter system payload or context..."
                                rows={2}
                                className={cn(
                                    "w-full px-4 py-3 rounded-xl text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none",
                                    isDarkMode
                                        ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30'
                                        : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                                )}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isPending}
                            className={cn(
                                "flex-1 px-6 py-3 rounded-xl text-sm font-semibold transition-all border",
                                isDarkMode
                                    ? 'border-white/10 text-white/70 hover:bg-white/5'
                                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            )}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 px-6 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="animate-spin" size={16} />
                                    Creating...
                                </>
                            ) : (
                                'Create Log'
                            )}
                        </button>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
};
