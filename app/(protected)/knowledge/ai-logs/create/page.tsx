"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { GlassCard } from "@/components/ui/glass-card";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTheme } from '@/hooks/useTheme';
import { useCreateAiLogMutation } from '@/hooks/useAiLogsQuery';
import { toast } from 'sonner';

export default function CreateAiLogPage() {
    const router = useRouter();
    const { isDarkMode } = useTheme();
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

        if (!formData.user_message.trim() || !formData.ai_response.trim() || !formData.payload.trim()) {
            toast.error("Please fill in all required fields");
            return;
        }

        createLog(formData, {
            onSuccess: () => {
                router.push('/knowledge');
            }
        });
    };

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
                            Create AI Log
                        </h1>
                        <p className={cn("text-sm mt-1", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                            Manually add an unanswered question to the system
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* User Message */}
                    <GlassCard isDarkMode={isDarkMode} className="p-6">
                        <h3 className={cn("text-sm font-semibold mb-3", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                            User Question <span className="text-red-500">*</span>
                        </h3>
                        <textarea
                            required
                            value={formData.user_message}
                            onChange={(e) => setFormData({ ...formData, user_message: e.target.value })}
                            placeholder="Enter the user's question..."
                            rows={4}
                            className={cn(
                                "w-full px-4 py-3 rounded-xl text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none",
                                isDarkMode
                                    ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30'
                                    : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                            )}
                        />
                    </GlassCard>

                    {/* AI Response */}
                    <GlassCard isDarkMode={isDarkMode} className="p-6">
                        <h3 className={cn("text-sm font-semibold mb-3", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                            AI Response <span className="text-red-500">*</span>
                        </h3>
                        <textarea
                            required
                            value={formData.ai_response}
                            onChange={(e) => setFormData({ ...formData, ai_response: e.target.value })}
                            placeholder="Enter the AI's response..."
                            rows={4}
                            className={cn(
                                "w-full px-4 py-3 rounded-xl text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none",
                                isDarkMode
                                    ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30'
                                    : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                            )}
                        />
                    </GlassCard>

                    {/* Payload */}
                    <GlassCard isDarkMode={isDarkMode} className="p-6">
                        <h3 className={cn("text-sm font-semibold mb-3", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                            System Payload <span className="text-red-500">*</span>
                        </h3>
                        <textarea
                            required
                            value={formData.payload}
                            onChange={(e) => setFormData({ ...formData, payload: e.target.value })}
                            placeholder="Enter system payload or context..."
                            rows={3}
                            className={cn(
                                "w-full px-4 py-3 rounded-xl text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none",
                                isDarkMode
                                    ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30'
                                    : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                            )}
                        />
                    </GlassCard>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Classification */}
                    <GlassCard isDarkMode={isDarkMode} className="p-6">
                        <h3 className={cn("text-sm font-semibold mb-4", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                            Classification
                        </h3>

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
                        </div>
                    </GlassCard>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full px-6 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="animate-spin" size={16} />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    Create Log
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            disabled={isPending}
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
                </div>
            </form>
        </div>
    );
}
