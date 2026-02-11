"use client";

import { useState, useMemo } from 'react';
import { MessageSquare, Search, RefreshCw, X, AlertCircle, Plus } from 'lucide-react';
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { useGetAiLogsQuery, AiLog } from '@/hooks/useAiLogsQuery';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { ActionMenu } from "@/components/ui/action-menu";
import { Select } from "@/components/ui/select";
import { useRouter } from 'next/navigation';

type TabType = 'all' | 'pending' | 'urgent' | 'resolved' | 'ignored';
type TypeFilter = 'all' | 'missing_knowledge' | 'out_of_scope' | 'urgent' | 'sentiment';

interface AiLogsProps {
    isDarkMode: boolean;
}

const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

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

const getStatusEmoji = (status: string) => {
    switch (status) {
        case 'pending': return '🟡';
        case 'act_on': return '🔴';
        case 'resolved': return '🟢';
        case 'ignored': return '⚪';
        default: return '';
    }
};

export const AiLogs = ({ isDarkMode }: AiLogsProps) => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: aiLogsData, isLoading, error, refetch } = useGetAiLogsQuery();

    const tabs: { id: TabType; label: string }[] = [
        { id: 'all', label: 'All' },
        { id: 'pending', label: 'Pending' },
        { id: 'urgent', label: 'Urgent' },
        { id: 'resolved', label: 'Resolved' },
        { id: 'ignored', label: 'Ignored' },
    ];

    const typeFilters: { value: TypeFilter; label: string }[] = [
        { value: 'all', label: 'All Types' },
        { value: 'missing_knowledge', label: 'Missing Knowledge' },
        { value: 'out_of_scope', label: 'Out of Scope' },
        { value: 'urgent', label: 'Urgent' },
        { value: 'sentiment', label: 'Sentiment' },
    ];

    const aiLogs = aiLogsData?.data || [];

    // Filter logs by active tab, type filter, and search query
    const filteredLogs = aiLogs.filter(log => {
        // Tab filter (map 'urgent' tab to 'act_on' status)
        const matchesTab = activeTab === 'all' ||
            (activeTab === 'urgent' ? log.status === 'act_on' : log.status === activeTab);

        // Type filter
        const matchesType = typeFilter === 'all' || log.type === typeFilter;

        // Search filter
        const matchesSearch =
            log.user_message.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.ai_response.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (log.resolution && log.resolution.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesTab && matchesType && matchesSearch;
    });

    const handleViewLog = (id: number) => {
        router.push(`/knowledge/ai-logs/${id}`);
    };

    const handleEditLog = (id: number) => {
        router.push(`/knowledge/ai-logs/${id}?mode=edit`);
    };

    const handleAnswerLog = (id: number) => {
        router.push(`/knowledge/ai-logs/${id}?mode=answer`);
    };

    const columns: ColumnDef<AiLog>[] = useMemo(() => [
        {
            field: 'user_message',
            headerName: 'User Question',
            flex: 1,
            renderCell: ({ row }) => (
                <p className={cn("text-sm font-medium line-clamp-2", isDarkMode ? 'text-white' : 'text-slate-800')}>
                    {row.user_message}
                </p>
            )
        },
        {
            field: 'ai_response',
            headerName: 'AI Response',
            flex: 1,
            renderCell: ({ row }) => (
                <p className={cn("text-xs line-clamp-2", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                    {row.ai_response}
                </p>
            )
        },
        {
            field: 'type',
            headerName: 'Type',
            width: 180,
            renderCell: ({ row }) => (
                <span className={cn(
                    "text-xs font-medium px-2 py-1 rounded capitalize",
                    getTypeColor(row.type)
                )}>
                    {row.type.replace('_', ' ')}
                </span>
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
                    "text-xs font-semibold px-2 py-1 rounded capitalize inline-flex items-center gap-1",
                    getStatusColor(row.status)
                )}>
                    <span>{getStatusEmoji(row.status)}</span>
                    {row.status === 'act_on' ? 'Urgent' : row.status}
                </span>
            )
        },
        {
            field: 'created_at',
            headerName: 'Created At',
            width: 120,
            renderCell: ({ row }) => (
                <span className={cn("text-xs", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                    {formatDate(row.created_at)}
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
                        onView={() => handleViewLog(row.id)}
                        isEdit={true}
                        onEdit={() => handleEditLog(row.id)}
                        isAnswer={row.status === 'pending' || row.status === 'act_on'}
                        onAnswer={() => handleAnswerLog(row.id)}
                    />
                </div>
            )
        }
    ], [isDarkMode]);

    return (
        <div className="flex flex-col gap-6">
            {/* Search and Filters */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search size={18} className={cn("absolute left-4 top-1/2 -translate-y-1/2", isDarkMode ? 'text-white/30' : 'text-slate-400')} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search questions, responses, or resolutions..."
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

                {/* Type Filter */}
                <Select
                    isDarkMode={isDarkMode}
                    value={typeFilter}
                    onChange={(value) => setTypeFilter(value as TypeFilter)}
                    options={typeFilters.map(f => ({ value: f.value, label: f.label }))}
                    placeholder="Filter by type"
                    className="w-56"
                />

                {/* <button
                    onClick={() => refetch()}
                    disabled={isLoading}
                    className={cn(
                        "px-6 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 flex items-center gap-2",
                        isDarkMode
                            ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50',
                        isLoading && 'opacity-50 cursor-not-allowed'
                    )}
                >
                    <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                    Refresh
                </button> */}

                <button
                    onClick={() => router.push('/knowledge/ai-logs/create')}
                    className="px-6 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                    <Plus size={16} />
                    Create Log
                </button>
            </div>

            {/* Status Tabs */}
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
                    <div className="flex items-center gap-2 text-red-500">
                        <AlertCircle size={20} />
                        <p className="text-sm">Failed to load AI logs</p>
                    </div>
                    <button
                        onClick={() => refetch()}
                        className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-all"
                    >
                        Try Again
                    </button>
                </GlassCard>
            )}

            {/* Data Table */}
            {!error && (
                <GlassCard isDarkMode={isDarkMode} className="p-0 overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={filteredLogs}
                        isLoading={isLoading}
                        isDarkMode={isDarkMode}
                        onRowClick={(row) => handleViewLog(row.id)}
                        emptyState={
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className={cn(
                                    "w-16 h-16 rounded-full flex items-center justify-center",
                                    isDarkMode ? 'bg-white/5' : 'bg-slate-100'
                                )}>
                                    <MessageSquare size={28} className={cn(isDarkMode ? 'text-white/20' : 'text-slate-300')} />
                                </div>
                                <div className="space-y-2 mt-4 text-center">
                                    <p className={cn("text-sm font-semibold", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                        {searchQuery ? 'No logs match your search' : 'No unanswered questions yet'}
                                    </p>
                                    <p className={cn("text-xs", isDarkMode ? 'text-white/40' : 'text-slate-400')}>
                                        {searchQuery ? 'Try adjusting your search terms or filters' : 'Questions the AI cannot answer will appear here'}
                                    </p>
                                </div>
                            </div>
                        }
                    />
                </GlassCard>
            )}
        </div>
    );
};
