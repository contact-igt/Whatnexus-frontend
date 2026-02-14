"use client";
import { useState, useRef, useEffect } from 'react';
import { Filter, MessageSquare, MoreHorizontal, ClipboardList, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Trash2, ArchiveRestore, Trash, Eye, RefreshCw, Sparkles } from 'lucide-react';
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import dayjs from "@/utils/dayjs";
import { useTheme } from '@/hooks/useTheme';
import { useLeadIntelligenceQuery, useGetDeletedLeadsQuery, useSoftDeleteLeadMutation, usePermanentDeleteLeadMutation, useRestoreLeadMutation, useSummarizeLeadMutation } from '@/hooks/useLeadIntelligenceQuery';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/redux/selectors/auth/authSelector';
import { WhatsAppConnectionPlaceholder } from './whatsappConfiguration/whatsapp-connection-placeholder';
import { LeadSummarySidebar } from './lead-summary-sidebar';
import { ConfirmationModal } from '@/components/ui/confirmationModal';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { getHeatStateStyles } from '@/utils/lead-utils';
import { SearchInput } from '@/components/ui/search-input';
import { Select } from '@/components/ui/select';
import { ActionMenu } from '@/components/ui/action-menu';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export const LeadsView = () => {
    const { isDarkMode } = useTheme();
    const { whatsappApiDetails } = useAuth();
    console.log("whatsappApiDetails", whatsappApiDetails);
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'all' | 'trash'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);
    const filterTriggerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                filterOpen &&
                filterRef.current &&
                !filterRef.current.contains(event.target as Node) &&
                filterTriggerRef.current &&
                !filterTriggerRef.current.contains(event.target as Node)
            ) {
                setFilterOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [filterOpen]);
    const [filters, setFilters] = useState({
        origin: 'all',
        score: 0,
        heatState: 'all'
    });

    // Data Queries
    const { data: leadIntelligenceData, isLoading: isLoadingLeads, refetch: refetchLeads } = useLeadIntelligenceQuery();
    const { data: deletedLeadsData, isLoading: isLoadingDeletedLeads, refetch: refetchDeletedLeads } = useGetDeletedLeadsQuery();

    const isLoading = activeTab === 'all' ? isLoadingLeads : isLoadingDeletedLeads;
    const leads = activeTab === 'all' ? (leadIntelligenceData?.data?.leads || []) : (deletedLeadsData?.data?.leads || []);

    const filteredLeads = leads.filter((lead: any) => {
        const matchesSearch = (
            lead?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead?.phone?.includes(searchQuery)
        );

        const matchesOrigin = filters.origin === 'all' || (lead?.origin || lead?.source) === filters.origin;

        let matchesScore = true;
        if (filters.score > 0) matchesScore = lead?.score >= filters.score;

        const matchesHeatState = filters.heatState === 'all' || lead?.heat_state?.toLowerCase() === filters.heatState.toLowerCase();

        return matchesSearch && matchesOrigin && matchesScore && matchesHeatState;
    });

    const uniqueOrigins = [
        "none", "whatsapp", "meta", "website", "google", "referral",
        "instagram", "facebook", "twitter", "campaign", "post", "other"
    ];


    // Mutations
    const { mutate: softDeleteLead, isPending: isSoftDeletePending } = useSoftDeleteLeadMutation();
    const { mutate: permanentDeleteLead, isPending: isPermanentDeletePending } = usePermanentDeleteLeadMutation();
    const { mutate: restoreLead, isPending: isRestorePending } = useRestoreLeadMutation();
    const { mutate: summarizeLeadMutation, isPending: isSummarizePending } = useSummarizeLeadMutation();
    const [activeSummaryId, setActiveSummaryId] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Summary Modal State
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [selectedLeadForSummary, setSelectedLeadForSummary] = useState<any>(null);

    // Confirmation Modal State
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
    const [actionType, setActionType] = useState<'delete' | 'permanent_delete' | 'restore'>('delete');
    // Action Menu State
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const summarizeLead = async (e: React.MouseEvent | undefined, lead: any) => {
        if (e) e.stopPropagation();
        setSelectedLeadForSummary(lead);
        setIsSummaryModalOpen(true);
    };

    const handleRefreshSummary = (e: React.MouseEvent, leadId: string) => {
        e.stopPropagation();
        setActiveSummaryId(leadId);
        summarizeLeadMutation({ id: leadId }, {
            onSuccess: () => {
                setActiveSummaryId(null);
            },
            onError: () => {
                setActiveSummaryId(null);
            }
        });
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
    console.log("leadIntelligenceData", leadIntelligenceData)

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

    const handleViewDetails = (leadId: string) => {
        router.push(`/leads/${leadId}`);
    }

    const handleRefresh = () => {
        if (activeTab === 'all') {
            refetchLeads();
        } else {
            refetchDeletedLeads();
        }
    }

    if (whatsappApiDetails?.status !== 'active') {
        return <WhatsAppConnectionPlaceholder />;
    }

    const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    console.log("leads", leads)
    const currentLeads = filteredLeads?.slice(startIndex, startIndex + itemsPerPage);

    const columns: ColumnDef<any>[] = [
        {
            field: 'identity',
            headerName: 'Lead Identity',
            minWidth: 200,
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
            field: 'origin',
            headerName: 'Origin',
            minWidth: 100,
            renderCell: ({ row }) => (
                <span className={cn("text-xs font-medium uppercase tracking-wide", isDarkMode ? 'text-white/60' : 'text-slate-500')}>
                    {row?.origin || row?.source || '-'}
                </span>
            )
        },
        {
            field: 'score',
            headerName: 'Neural Score',
            minWidth: 150,
            renderCell: ({ row }) => (
                <div className="flex flex-col justify-center items-start">
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
            minWidth: 120,
            renderCell: ({ row }) => (
                <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider border", getHeatStateStyles(row.heat_state))}>
                    {row?.heat_state}
                </span>
            )
        },
        {
            field: 'summary',
            headerName: 'Summary',
            minWidth: 250,
            flex: 1,
            renderCell: ({ row }) => (
                <div className="flex flex-col items-start justify-center group/summary py-1 w-full">
                    {row?.ai_summary ? (
                        <div className="flex flex-col gap-1 w-full">
                            {row?.summary_status && (
                                <div className="self-start">
                                    <Badge
                                        isDarkMode={isDarkMode}
                                        className={cn(
                                            "rounded-md border", // Reduced border radius
                                            row.summary_status === 'old'
                                                ? isDarkMode
                                                    ? "bg-orange-500/10 text-orange-400 border-orange-500/20" // Mild Orange Dark
                                                    : "bg-orange-50 text-orange-600 border-orange-200" // Mild Orange Light
                                                : "rounded-md" // Ensure green one also gets rounded-md override if needed, though variant styles might need generic override
                                        )}
                                        variant={row.summary_status === 'OLD' ? 'default' : 'success'} // Use default for OLD so we can override easily, success for NEW
                                        size="sm"
                                    >
                                        {row.summary_status}
                                    </Badge>
                                </div>
                            )}
                            <div className="flex items-start space-x-2 w-full">
                                <p className={cn("text-xs leading-relaxed line-clamp-3 w-[90%] whitespace-normal", isDarkMode ? 'text-white/60' : 'text-slate-500')} title={row?.ai_summary}>
                                    {row?.ai_summary}
                                </p>
                                <button
                                    onClick={(e) => handleRefreshSummary(e, row.lead_id)}
                                    className={cn(
                                        "p-1 rounded transition-all shrink-0 mt-0.5",
                                        isDarkMode ? "hover:bg-white/10 text-white/40 hover:text-white" : "hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                                    )}
                                    title="Refresh Summary"
                                    disabled={isSummarizePending && activeSummaryId === row.lead_id}
                                >
                                    <RefreshCw size={12} className={cn(isSummarizePending && activeSummaryId === row.lead_id ? "animate-spin" : "")} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={(e) => summarizeLead(e, row)}
                            className={cn(
                                "flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-semibold border",
                                isDarkMode
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                                    : "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                            )}
                        >
                            <Sparkles size={14} />
                            <span>Generate Summary</span>
                        </button>
                    )}
                </div>
            )
        },
        {
            field: 'last_user_message_at',
            headerName: 'User Last Message',
            minWidth: 140,
            renderCell: ({ row }) => (
                <div className="flex flex-col">
                    <span className={cn("text-xs font-semibold", isDarkMode ? 'text-white/90' : 'text-slate-700')}>{formatMessageDate(row?.last_user_message_at)?.date}</span>
                    <span className={cn("text-[10px] uppercase font-medium tracking-wide", isDarkMode ? 'text-white/40' : 'text-slate-400')}>{formatMessageDate(row?.last_user_message_at)?.time}</span>
                </div>
            )
        },
        {
            field: 'actions',
            headerName: 'Actions',
            align: 'right',
            headerAlign: 'right',
            minWidth: 100,
            renderCell: ({ row }) => (
                <div className="flex items-center justify-center relative">
                    <ActionMenu
                        isDarkMode={isDarkMode}
                        isView={activeTab === 'all'}
                        onView={() => handleViewDetails(row?.lead_id)}
                        isDelete={activeTab === 'all'}
                        onDelete={() => handleAction('delete', row?.lead_id)}
                        isRestore={activeTab === 'trash'}
                        onRestore={() => handleAction('restore', row?.lead_id)}
                        isPermanentDelete={activeTab === 'trash'}
                        onPermanentDelete={() => handleAction('permanent_delete', row?.lead_id)}
                        isSummary={activeTab === 'all'}
                        onSummary={() => summarizeLead(undefined, row)}
                        isMessage={activeTab === 'all'}
                        onMessage={() => handleLeadOpen(row?.phone)}
                        isRefresh={activeTab === 'all'}
                        onRefresh={() => handleRefreshSummary({ stopPropagation: () => { } } as any, row?.lead_id)}
                        // Adding missing logic for other potential actions if needed
                        onEdit={undefined}
                        isEdit={false}
                    />
                </div>
            )
        }

    ];

    return (
        <div className="flex h-full w-full overflow-hidden relative">
            <div className="flex-1 flex flex-col min-h-0 min-w-0 p-8 space-y-6 animate-in fade-in duration-700 overflow-auto">
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
                    <div className="flex space-x-3 items-center relative">
                        <SearchInput
                            isDarkMode={isDarkMode}
                            placeholder="Search leads..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-64"
                        />
                        <div
                            ref={filterTriggerRef}
                            className={cn(
                                "px-4 py-2.5 flex items-center space-x-2 group cursor-pointer border rounded-xl transition-all select-none",
                                isDarkMode
                                    ? filteredLeads.length !== leads.length
                                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                                        : 'bg-white/5 border-white/10 hover:border-emerald-500/50 text-white'
                                    : filteredLeads.length !== leads.length
                                        ? 'bg-emerald-50 border-emerald-500/50 text-emerald-600'
                                        : 'bg-white border-slate-200 hover:border-emerald-500/50 shadow-sm text-slate-700'
                            )}
                            onClick={() => setFilterOpen(!filterOpen)}
                        >
                            <Filter size={16} className={filteredLeads.length !== leads.length ? "text-emerald-500" : "text-slate-400"} />
                            <span className="text-xs font-semibold uppercase tracking-wide">Filters</span>
                        </div>

                        {filterOpen && (
                            <div
                                ref={filterRef}
                                className={cn(
                                    "absolute top-full right-0 mt-3 p-0 rounded-3xl border shadow-2xl w-[480px] max-h-[85vh] flex flex-col animate-in fade-in slide-in-from-top-2 duration-300 origin-top-right overflow-hidden z-50",
                                    isDarkMode ? 'bg-[#09090b] border-white/10 shadow-black/80 ring-1 ring-white/5' : 'bg-white border-slate-200 shadow-xl'
                                )}>
                                {/* Panel Header */}
                                <div className={cn(
                                    "px-6 py-5 border-b flex justify-between items-center sticky top-0 z-10",
                                    isDarkMode ? "bg-[#09090b] border-white/5" : "bg-white border-slate-100"
                                )}>
                                    <div className="flex items-center gap-3">
                                        <div className={cn("p-2 rounded-xl", isDarkMode ? "bg-white/5" : "bg-slate-100")}>
                                            <Filter size={16} className={isDarkMode ? "text-white" : "text-slate-600"} />
                                        </div>
                                        <div>
                                            <h3 className={cn("text-sm font-bold tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>Filter Leads</h3>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setFilters({ origin: 'all', score: 0, heatState: 'all' })}
                                        className={cn(
                                            "text-[10px] font-bold px-3.5 py-2 rounded-xl transition-all hover:scale-105 active:scale-95 border",
                                            isDarkMode
                                                ? "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/40"
                                                : "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100"
                                        )}
                                    >
                                        RESET
                                    </button>
                                </div>

                                {/* Panel Content */}
                                <div className="p-6 space-y-8 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

                                    {/* Origin Search & Grid */}
                                    <div className="space-y-4">
                                        <label className={cn("text-[11px] font-bold uppercase tracking-widest block opacity-60 ml-1", isDarkMode ? "text-white" : "text-slate-500")}>
                                            Source / Origin
                                        </label>
                                        <div className="grid grid-cols-4 gap-2.5">
                                            {['all', ...uniqueOrigins].map((origin) => (
                                                <button
                                                    key={origin}
                                                    onClick={() => setFilters(prev => ({ ...prev, origin }))}
                                                    className={cn(
                                                        "px-2 py-2.5 rounded-xl text-[11px] font-semibold transition-all border truncate capitalize",
                                                        filters.origin === origin
                                                            ? isDarkMode
                                                                ? "bg-emerald-500 text-white border-emerald-500 shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)]"
                                                                : "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/20"
                                                            : isDarkMode
                                                                ? "bg-white/5 text-white/60 border-transparent hover:border-white/10 hover:bg-white/10 hover:text-white"
                                                                : "bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100 hover:text-slate-700"
                                                    )}
                                                    title={origin}
                                                >
                                                    {origin}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Neural Score - Slider */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end px-1">
                                            <label className={cn("text-[11px] font-bold uppercase tracking-widest block opacity-60", isDarkMode ? "text-white" : "text-slate-500")}>
                                                Min Neural Score
                                            </label>
                                            <span className={cn("text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-gradient-to-r border", isDarkMode ? "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/20" : "from-emerald-50 to-teal-50 text-emerald-600 border-emerald-100")}>
                                                {filters.score > 0 ? `${filters.score}+` : 'All'}
                                            </span>
                                        </div>
                                        <div className={cn("p-6 rounded-2xl border transition-colors", isDarkMode ? "bg-white/5 border-white/5 hover:border-white/10" : "bg-slate-50 border-slate-100")}>
                                            <Slider
                                                value={[typeof filters.score === 'number' ? filters.score : 0]}
                                                onValueChange={(val) => setFilters(prev => ({ ...prev, score: val[0] }))}
                                                isDarkMode={isDarkMode}
                                                min={0}
                                                max={100}
                                                step={5}
                                            />
                                            <div className="flex justify-between mt-4 px-1 opacity-40">
                                                <span className={cn("text-[10px] font-bold", isDarkMode ? "text-white" : "text-slate-900")}>0</span>
                                                <span className={cn("text-[10px] font-bold", isDarkMode ? "text-white" : "text-slate-900")}>50</span>
                                                <span className={cn("text-[10px] font-bold", isDarkMode ? "text-white" : "text-slate-900")}>100</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Heat State */}
                                    <div className="space-y-4">
                                        <label className={cn("text-[11px] font-bold uppercase tracking-widest block opacity-60 ml-1", isDarkMode ? "text-white" : "text-slate-500")}>
                                            Heat State
                                        </label>
                                        <div className="grid grid-cols-2 gap-2.5">
                                            {[
                                                { value: 'all', label: 'Any State' },
                                                { value: 'hot', label: '🔥 Hot' },
                                                { value: 'warm', label: '☀️ Warm' },
                                                { value: 'cold', label: '❄️ Cold' },
                                                { value: 'super_cold', label: '🧊 Super Cold' }
                                            ].map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => setFilters(prev => ({ ...prev, heatState: option.value }))}
                                                    className={cn(
                                                        "px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all border text-left flex items-center gap-2",
                                                        option.value === 'super_cold' ? 'col-span-2' : '',
                                                        filters.heatState === option.value
                                                            ? isDarkMode
                                                                ? "bg-white/10 text-white border-white/20 shadow-lg"
                                                                : "bg-slate-100 text-slate-900 border-slate-300 shadow-sm"
                                                            : isDarkMode
                                                                ? "bg-transparent text-white/40 border-white/5 hover:border-white/15 hover:bg-white/5 hover:text-white"
                                                                : "bg-transparent text-slate-400 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                                                    )}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}

                        <button className="h-10 px-5 rounded-xl bg-emerald-600 text-white font-semibold text-xs uppercase tracking-wide hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20">Sync CRM</button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center space-x-1 border-b border-white/5">
                    <button
                        onClick={() => { setActiveTab('all'); setCurrentPage(1); setSearchQuery(''); }}
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
                        onClick={() => { setActiveTab('trash'); setCurrentPage(1); setSearchQuery(''); }}
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

                <GlassCard isDarkMode={isDarkMode} className="flex flex-col min-h-0 overflow-hidden p-0">
                    <DataTable
                        className="overflow-y-auto"
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
                        <div className={cn(
                            "p-4 border-t border-white/5 mt-auto sticky bottom-0 z-10 backdrop-blur-md",
                            isDarkMode ? "bg-[#151518]/90" : "bg-white/90"
                        )}>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                totalItems={filteredLeads.length}
                                itemsPerPage={itemsPerPage}
                                isDarkMode={isDarkMode}
                            />
                        </div>
                    )}
                </GlassCard>
            </div>

            <LeadSummarySidebar
                isOpen={isSummaryModalOpen}
                onClose={() => setIsSummaryModalOpen(false)}
                lead={selectedLeadForSummary}
                isDarkMode={isDarkMode}
            />
        </div >
    );
};
