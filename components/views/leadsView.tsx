"use client";
import { Filter, MessageSquare, MoreHorizontal, ClipboardList, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Trash2, ArchiveRestore, Trash, Eye, RefreshCw, Sparkles, BrainCircuit, Check, UserPlus, UserMinus, Users, CheckSquare, Square, ShieldCheck, Lock, Search, ChevronDown } from 'lucide-react';
import { GlassCard } from "@/components/ui/glassCard";
import { Select } from '@/components/ui/select';
import { ActionMenu } from '@/components/ui/actionMenu';
import { Badge } from '@/components/ui/badge';
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import dayjs from "@/utils/dayjs";
import { useTheme } from '@/hooks/useTheme';
import { useLeadIntelligenceQuery, useGetDeletedLeadsQuery, useSoftDeleteLeadMutation, usePermanentDeleteLeadMutation, useRestoreLeadMutation, useSummarizeLeadMutation } from '@/hooks/useLeadIntelligenceQuery';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/redux/selectors/auth/authSelector';
import { WhatsAppConnectionPlaceholder } from './whatsappConfiguration/whatsappConnectionPlaceholder';
import { LeadSummarySidebar } from './leadSummarySidebar';
import { ConfirmationModal } from '@/components/ui/confirmationModal';
import { DataTable, ColumnDef } from '@/components/ui/dataTable';
import { Pagination } from '@/components/ui/pagination';
import { getHeatStateStyles } from '@/utils/leadUtils';
import { SearchInput } from '@/components/ui/searchInput';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useGetAgentsQuery } from '@/hooks/useMessagesQuery';
import { useBulkUpdateLeadsMutation } from '@/hooks/useLeadIntelligenceQuery';
import { toast } from 'sonner';
import { socket } from '@/utils/socket';


export const LeadsView = () => {
    const { isDarkMode } = useTheme();
    const { whatsappApiDetails, user } = useAuth();
    console.log("whatsappApiDetails", whatsappApiDetails);
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'all' | 'trash'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const [filters, setFilters] = useState({
        origin: 'all',
        score: 0,
        heatState: 'all',
        assignedTo: 'all'
    });

    const [leadAssignmentFilter, setLeadAssignmentFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');

    // Data Queries
    const { data: leadIntelligenceData, isLoading: isLoadingLeads, refetch: refetchLeads } = useLeadIntelligenceQuery();

    // Socket: real-time lead updates
    useEffect(() => {
        if (!user?.tenant_id) return;
        if (!socket.connected) socket.connect();
        socket.on('connect', () => {
            socket.emit('join-tenant', user.tenant_id);
        });
        socket.on('lead-updated', () => {
            refetchLeads();
        });
        return () => {
            socket.off('lead-updated');
            socket.off('connect');
        };
    }, [user?.tenant_id]);
    const { data: deletedLeadsData, isLoading: isLoadingDeletedLeads, refetch: refetchDeletedLeads } = useGetDeletedLeadsQuery();

    const formatMessageDate = (dateString: string) => {
        if (!dateString) return { date: '-', time: '' };

        const d = dayjs.utc(dateString).tz('Asia/Kolkata');

        return {
            date: d.format('MMM D'),
            time: d.format('hh:mm A')
        };
    };

    const isLoading = activeTab === 'all' ? isLoadingLeads : isLoadingDeletedLeads;
    const leads = activeTab === 'all' ? (leadIntelligenceData?.data?.leads || []) : (deletedLeadsData?.data?.leads || []);

    const filteredLeads = leads.filter((lead: any) => {
        const searchLower = searchQuery.toLowerCase();
        const { date, time } = formatMessageDate(lead?.last_user_message_at);
        const matchesSearch = searchQuery === '' || [
            lead?.name,
            lead?.phone,
            lead?.origin,
            lead?.source,
            lead?.heat_state,
            lead?.ai_summary,
            lead?.summary_status,
            date,
            time
        ].some(val => val?.toString().toLowerCase().includes(searchLower));

        const matchesOrigin = filters.origin === 'all' || (lead?.origin || lead?.source) === filters.origin;

        let matchesScore = true;
        if (filters.score > 0) matchesScore = lead?.score >= filters.score;

        const matchesHeatState = filters.heatState === 'all' || lead?.heat_state?.toLowerCase() === filters.heatState.toLowerCase();

        const matchesAssignment = 
            filters.assignedTo === 'all' ||
            (filters.assignedTo === 'unassigned' && !lead.assigned_to) ||
            (filters.assignedTo === 'assigned' && !!lead.assigned_to) ||
            (lead.assigned_to === filters.assignedTo);

        return matchesSearch && matchesOrigin && matchesScore && matchesHeatState && matchesAssignment;
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentLeads = filteredLeads?.slice(startIndex, startIndex + itemsPerPage);

    const uniqueOrigins = [
        "none", "whatsapp", "meta", "website", "google", "referral",
        "instagram", "facebook", "twitter", "campaign", "post", "nearby", "other"
    ];


    // Mutations
    const { mutate: softDeleteLead, isPending: isSoftDeletePending } = useSoftDeleteLeadMutation();
    const { mutate: permanentDeleteLead, isPending: isPermanentDeletePending } = usePermanentDeleteLeadMutation();
    const { mutate: restoreLead, isPending: isRestorePending } = useRestoreLeadMutation();
    const { mutate: summarizeLeadMutation, isPending: isSummarizePending } = useSummarizeLeadMutation();
    const { mutate: bulkUpdateLeads, isPending: isBulkUpdating } = useBulkUpdateLeadsMutation();
    const { data: agentsList } = useGetAgentsQuery();

    const [activeSummaryId, setActiveSummaryId] = useState<string | null>(null);


    const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
    const [isAssigningBulk, setIsAssigningBulk] = useState(false);

    const isAdmin = user?.role === 'tenant_admin' || user?.role === 'admin';

    const filteredAgents = useMemo(() => {
        return agentsList?.data || [];
    }, [agentsList?.data]);

    const toggleLeadSelection = (leadId: string) => {
        setSelectedLeadIds(prev =>
            prev.includes(leadId)
                ? prev.filter(id => id !== leadId)
                : [...prev, leadId]
        );
    };

    const toggleAllSelection = () => {
        if (selectedLeadIds.length === currentLeads.length) {
            setSelectedLeadIds([]);
        } else {
            setSelectedLeadIds(currentLeads.map((l: any) => l.lead_id));
        }
    };

    const handleBulkClaim = () => {
        if (!selectedLeadIds.length) return;
        handleAction('bulk_claim');
    };

    const handleBulkAssign = (agentId: string) => {
        if (!selectedLeadIds.length) return;
        setTargetAgentId(agentId);
        handleAction('bulk_assign');
    };

    const handleBulkUnassign = () => {
        if (!selectedLeadIds.length) return;
        handleAction('bulk_unassign');
    };

    const showCheckboxes = activeTab !== 'trash' && (filters.assignedTo === 'unassigned' || (isAdmin && filters.assignedTo !== 'all'));

    // Summary Modal State
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [selectedLeadForSummary, setSelectedLeadForSummary] = useState<any>(null);

    // Confirmation Modal State
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
    const [targetAgentId, setTargetAgentId] = useState<string | null>(null);
    const [actionType, setActionType] = useState<'delete' | 'permanent_delete' | 'restore' | 'claim' | 'assign' | 'unassign' | 'bulk_claim' | 'bulk_assign' | 'bulk_unassign'>('delete');
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

    const handleAction = (type: typeof actionType, id?: string) => {
        setActionType(type);
        setSelectedLeadId(id || null);
        setIsConfirmationModalOpen(true);
    };

    const confirmAction = () => {
        if (actionType.startsWith('bulk_')) {
            const updates: any = {};
            let successMessage = "";

            if (actionType === 'bulk_claim') {
                updates.assigned_to = user?.tenant_user_id;
                successMessage = `Successfully claimed ${selectedLeadIds.length} leads`;
            } else if (actionType === 'bulk_assign') {
                updates.assigned_to = targetAgentId;
                const agent = filteredAgents.find((a: any) => a.tenant_user_id === targetAgentId);
                successMessage = `Successfully assigned ${selectedLeadIds.length} leads to ${agent?.username || 'agent'}`;
            } else if (actionType === 'bulk_unassign') {
                updates.assigned_to = null;
                successMessage = `Successfully unassigned ${selectedLeadIds.length} leads`;
            }

            bulkUpdateLeads({ leadIds: selectedLeadIds, updates }, {
                onSuccess: () => {
                    setIsConfirmationModalOpen(false);
                    setSelectedLeadIds([]);
                    setTargetAgentId(null);
                    setIsAssigningBulk(false);
                    toast.success(successMessage);
                },
                onError: () => {
                    setIsConfirmationModalOpen(false);
                }
            });
            return;
        }

        if (!selectedLeadId && !actionType.startsWith('bulk_')) return;

        if (actionType === 'delete') {
            softDeleteLead(selectedLeadId!, {
                onSuccess: () => {
                    setIsConfirmationModalOpen(false);
                    setSelectedLeadId(null);
                }
            });
        } else if (actionType === 'permanent_delete') {
            permanentDeleteLead(selectedLeadId!, {
                onSuccess: () => {
                    setIsConfirmationModalOpen(false);
                    setSelectedLeadId(null);
                }
            });
        } else if (actionType === 'restore') {
            restoreLead(selectedLeadId!, {
                onSuccess: () => {
                    setIsConfirmationModalOpen(false);
                    setSelectedLeadId(null);
                }
            });
        } else if (actionType === 'claim' || actionType === 'assign' || actionType === 'unassign') {
            const updates: any = {};
            let successMessage = "";

            if (actionType === 'claim') {
                updates.assigned_to = user?.tenant_user_id;
                successMessage = "Lead claimed successfully";
            } else if (actionType === 'assign') {
                updates.assigned_to = targetAgentId;
                const agent = filteredAgents.find((a: any) => a.tenant_user_id === targetAgentId);
                successMessage = `Lead assigned to ${agent?.username || 'agent'} successfully`;
            } else if (actionType === 'unassign') {
                updates.assigned_to = null;
                successMessage = "Lead unassigned successfully";
            }

            bulkUpdateLeads({ leadIds: [selectedLeadId!], updates }, {
                onSuccess: () => {
                    setIsConfirmationModalOpen(false);
                    setSelectedLeadId(null);
                    setTargetAgentId(null);
                    toast.success(successMessage);
                },
                onError: () => {
                    setIsConfirmationModalOpen(false);
                }
            });
        }
    };

    console.log("leadIntelligenceData", leadIntelligenceData)
    console.log("leadIntelligenceData", leadIntelligenceData)

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

    const columns = useMemo<ColumnDef<any>[]>(() => [
        {
            field: 'selection',
            headerName: showCheckboxes ? (
                <button
                    onClick={toggleAllSelection}
                    className={cn(
                        "p-1 rounded-md transition-all",
                        isDarkMode ? "hover:bg-white/10" : "hover:bg-slate-100"
                    )}
                >
                    {selectedLeadIds.length === currentLeads.length && currentLeads.length > 0 ? (
                        <CheckSquare size={18} className="text-emerald-500" />
                    ) : (
                        <Square size={18} className={isDarkMode ? "text-slate-500" : "text-slate-400"} />
                    )}
                </button>
            ) : null,
            renderCell: ({ row }) => showCheckboxes ? (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleLeadSelection(row.lead_id);
                    }}
                    className={cn(
                        "p-1 rounded-md transition-all",
                        isDarkMode ? "hover:bg-white/10" : "hover:bg-slate-100"
                    )}
                >
                    {selectedLeadIds.includes(row.lead_id) ? (
                        <CheckSquare size={18} className="text-emerald-500" />
                    ) : (
                        <Square size={18} className={isDarkMode ? "text-slate-500" : "text-slate-400"} />
                    )}
                </button>
            ) : null,
            width: showCheckboxes ? 50 : 0,
        },
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
                        <p className={cn("text-sm font-semibold", isDarkMode ? 'text-white' : 'text-slate-900')}>{row?.name || "Unknown"}</p>
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
            field: 'assigned_to',
            headerName: 'Assigned To',
            minWidth: 150,
            renderCell: ({ row }) => (
                <div className="flex flex-col justify-center">
                    {isAdmin ? (
                        <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    onClick={(e) => e.stopPropagation()}
                                            className={cn(
                                                "flex items-center gap-2 px-2.5 py-1.5 rounded-lg border w-fit transition-all group",
                                                row.assigned_to 
                                                    ? (isDarkMode ? "bg-white/5 border-white/10 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700")
                                                    : (isDarkMode ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-100 text-emerald-600")
                                            )}
                                >
                                    {row.assigned_to ? (
                                        <>
                                            <div className={cn("w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold", isDarkMode ? "bg-white/10" : "bg-slate-200")}>
                                                {row.assigned_agent_name?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-[11px] font-semibold">{row.assigned_agent_name}</span>
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus size={12} />
                                            <span>Assign</span>
                                        </>
                                    )}
                                    <ChevronDown size={12} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent 
                                isDarkMode={isDarkMode} 
                                align="start" 
                                className="w-56 p-2 overflow-hidden rounded-xl border shadow-xl"
                            >
                                <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!row.assigned_to) return;
                                            setTargetAgentId(null);
                                            handleAction('unassign', row.lead_id);
                                        }}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                                            !row.assigned_to
                                                ? (isDarkMode ? "bg-rose-500/10 text-rose-400" : "bg-rose-50 text-rose-600")
                                                : (isDarkMode ? "hover:bg-white/5 text-slate-400" : "hover:bg-slate-50 text-slate-600")
                                        )}
                                    >
                                        <span>Unassigned</span>
                                        {!row.assigned_to && <Check size={14} />}
                                    </button>
                                    <div className={cn("h-px my-1", isDarkMode ? "bg-white/5" : "bg-slate-100")} />
                                    {filteredAgents.map((agent: any) => (
                                        <button
                                            key={agent.tenant_user_id}
                                            onClick={(e) => {
                                            e.stopPropagation();
                                            if (row.assigned_to === agent.tenant_user_id) return;
                                            setTargetAgentId(agent.tenant_user_id);
                                            handleAction('assign', row.lead_id);
                                        }}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all group/item",
                                                row.assigned_to === agent.tenant_user_id
                                                    ? (isDarkMode ? "text-rose-400" : "text-rose-600")
                                                    : (isDarkMode ? "text-slate-300" : "text-slate-700")
                                            )}
                                        >
                                            <div className={cn(
                                                "w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 border",
                                                isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-100 border-slate-200"
                                            )}>
                                                {agent.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col items-start min-w-0 flex-1">
                                                <span className="truncate w-full text-left">{agent.username}</span>
                                                <span className="text-[8px] uppercase tracking-tighter opacity-50">{agent.role}</span>
                                            </div>
                                            {row.assigned_to === agent.tenant_user_id && <Check size={14} className="shrink-0" />}
                                        </button>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                    ) : row.assigned_to ? (
                        <div className={cn("flex items-center gap-2 px-2.5 py-1.5 rounded-lg border w-fit", isDarkMode ? "bg-white/5 border-white/10 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700")}>
                            <div className={cn("w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold", isDarkMode ? "bg-white/10" : "bg-slate-200")}>
                                {row.assigned_agent_name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-[11px] font-semibold">{row.assigned_agent_name}</span>
                        </div>
                    ) : (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAction('claim', row.lead_id);
                            }}
                            className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-[11px] font-bold uppercase tracking-wider w-fit",
                                isDarkMode ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20" : "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100"
                            )}
                        >
                            <UserPlus size={12} />
                            <span>Claim</span>
                        </button>
                    )}
                </div>
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
                                {row?.summary_status?.toLowerCase() === 'new' && (
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
                                )}
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
                        isRefresh={activeTab === 'all' && row?.summary_status?.toLowerCase() === 'new'}
                        onRefresh={() => handleRefreshSummary({ stopPropagation: () => { } } as any, row?.lead_id)}
                        // Adding missing logic for other potential actions if needed
                        onEdit={undefined}
                        isEdit={false}
                    />
                </div>
            )
        }
    ], [isDarkMode, showCheckboxes, selectedLeadIds, currentLeads, activeTab, isAdmin, filteredAgents, isSummarizePending, activeSummaryId]);

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
                        actionType === 'restore' ? "Restore Lead" :
                        actionType === 'claim' ? "Claim Lead" :
                        actionType === 'assign' ? "Assign Lead" :
                        actionType === 'unassign' ? "Unassign Lead" :
                        actionType === 'bulk_claim' ? `Claim ${selectedLeadIds.length} Leads` :
                        actionType === 'bulk_assign' ? `Assign ${selectedLeadIds.length} Leads` :
                        `Unassign ${selectedLeadIds.length} Leads`
                    }
                    message={
                        actionType === 'delete' ? "Are you sure you want to remove this lead? It will be moved to the trash." :
                        actionType === 'permanent_delete' ? "This action cannot be undone. Are you sure you want to permanently delete this lead?" :
                        actionType === 'restore' ? "Are you sure you want to restore this lead?" :
                        actionType === 'claim' ? "Are you sure you want to claim this lead?" :
                        actionType === 'assign' ? "Are you sure you want to assign this lead to the selected agent?" :
                        actionType === 'unassign' ? "Are you sure you want to unassign this lead?" :
                        actionType === 'bulk_claim' ? `Are you sure you want to claim ${selectedLeadIds.length} leads?` :
                        actionType === 'bulk_assign' ? `Are you sure you want to assign ${selectedLeadIds.length} leads to the selected agent?` :
                        `Are you sure you want to unassign ${selectedLeadIds.length} leads?`
                    }
                    isDarkMode={isDarkMode}
                    confirmText={
                        actionType === 'delete' ? "Remove" :
                        actionType === 'permanent_delete' ? "Delete Forever" :
                        actionType === 'restore' ? "Restore" :
                        actionType === 'claim' || actionType === 'bulk_claim' ? "Claim" :
                        actionType === 'assign' || actionType === 'bulk_assign' ? "Assign" :
                        "Unassign"
                    }
                    isLoading={isSoftDeletePending || isPermanentDeletePending || isRestorePending || isBulkUpdating}
                    variant={['restore', 'claim', 'assign', 'bulk_claim', 'bulk_assign'].includes(actionType) ? 'info' : 'danger'}
                />

                <div className="flex flex-col border-b border-white/5 pb-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className={cn("text-3xl font-bold tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>Lead Intelligence</h1>
                            <p className={cn("font-medium text-sm mt-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>Qualified audience shards synced from Meta & Website.</p>
                        </div>
                        <button className="h-10 px-5 rounded-xl bg-emerald-600 text-white font-semibold text-xs uppercase tracking-wide hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2">
                            <RefreshCw size={14} />
                            Sync CRM
                        </button>
                    </div>

                    <div className="flex items-center gap-3 relative">
                        <SearchInput
                            isDarkMode={isDarkMode}
                            placeholder="Search leads..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setSelectedLeadIds([]); }}
                            className="w-72"
                        />

                        {/* Source Filter */}
                        <div className="w-40">
                            <Select
                                isDarkMode={isDarkMode}
                                options={[{ value: 'all', label: 'All Sources' }, ...uniqueOrigins.map(o => ({ value: o, label: o }))]}
                                value={filters.origin}
                                onChange={(val) => { setFilters(prev => ({ ...prev, origin: val })); setSelectedLeadIds([]); }}
                                placeholder="Source"
                                className="w-full"
                            />
                        </div>

                        {/* Heat State Filter */}
                        <div className="w-40">
                            <Select
                                isDarkMode={isDarkMode}
                                options={[
                                    { value: 'all', label: 'All States' },
                                    { value: 'cold', label: 'Cold' },
                                    { value: 'warm', label: 'Warm' },
                                    { value: 'hot', label: 'Hot' },
                                    { value: 'super_cold', label: 'Super Cold' }
                                ]}
                                value={filters.heatState}
                                onChange={(val) => { setFilters(prev => ({ ...prev, heatState: val })); setSelectedLeadIds([]); }}
                                placeholder="Heat State"
                                className="w-full"
                            />
                        </div>

                        {/* Owner Filter */}
                        <div className="w-48">
                            <Select
                                isDarkMode={isDarkMode}
                                options={[
                                    { value: 'all', label: 'All Assignments' },
                                    { value: 'unassigned', label: 'Unassigned Leads' },
                                    ...(isAdmin ? [{ value: 'assigned', label: 'All Assigned Leads' }] : []),
                                    ...filteredAgents.map((agent: any) => ({ 
                                        value: agent.tenant_user_id, 
                                        label: `${agent.username} (${agent.role.charAt(0).toUpperCase() + agent.role.slice(1)})`
                                    }))
                                ]}
                                value={filters.assignedTo}
                                onChange={(val) => { setFilters(prev => ({ ...prev, assignedTo: val })); setSelectedLeadIds([]); }}
                                placeholder="Owner"
                                className="w-full"
                            />
                        </div>

                        {/* Neural Score Filter (Hero Gauge Style) */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <button className={cn(
                                    "w-40 px-3 py-2.5 rounded-xl text-sm font-bold border flex items-center justify-center gap-2 transition-all shadow-sm group relative overflow-hidden",
                                    filters.score > 0
                                        ? isDarkMode
                                            ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]"
                                            : "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm"
                                        : isDarkMode
                                            ? "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20"
                                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                                )}>
                                    <BrainCircuit size={16} className={cn("transition-colors", filters.score > 0 ? "text-emerald-500 animate-pulse" : "opacity-70")} />
                                    <span className="truncate">
                                        <span className={cn("font-medium", filters.score > 0 ? "opacity-100" : "opacity-70")}>Neural: </span>
                                        {filters.score > 0 ? `${filters.score}+` : 'Any'}
                                    </span>
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className={cn("w-80 p-0 overflow-hidden font-sans", isDarkMode ? "bg-black border-white/10" : "bg-white border-slate-200")} align="end">
                                {/* Header */}
                                <div className={cn("px-5 py-4 border-b flex justify-between items-center", isDarkMode ? "border-white/10 bg-white/5" : "border-slate-100 bg-slate-50/50")}>
                                    <div className="flex items-center gap-2">
                                        <BrainCircuit size={16} className={isDarkMode ? "text-emerald-400" : "text-emerald-600"} />
                                        <span className={cn("text-sm font-bold tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>
                                            Neural Score Threshold
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Large Circular Gauge */}
                                    <div className="flex justify-center">
                                        <div className="relative w-32 h-32 flex items-center justify-center">
                                            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                                                {/* Track */}
                                                <circle
                                                    cx="50" cy="50" r="40"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="8"
                                                    className={isDarkMode ? "text-white/10" : "text-slate-100"}
                                                />
                                                {/* Progress */}
                                                <circle
                                                    cx="50" cy="50" r="40"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="8"
                                                    strokeLinecap="round"
                                                    strokeDasharray={`${2 * Math.PI * 40}`}
                                                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - filters.score / 100)}`}
                                                    className={cn("transition-all duration-700 ease-out",
                                                        filters.score > 75 ? "text-emerald-500" :
                                                            filters.score > 50 ? "text-blue-500" :
                                                                filters.score > 25 ? "text-yellow-500" : "text-slate-500"
                                                    )}
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className={cn("text-3xl font-black tracking-tighter",
                                                    isDarkMode ? "text-white" : "text-slate-900"
                                                )}>
                                                    {filters.score}
                                                </span>
                                                <span className="text-[10px] uppercase font-bold opacity-40">Min Score</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Slider Control */}
                                    <div className="space-y-4">
                                        <Slider
                                            isDarkMode={isDarkMode}
                                            value={[filters.score]}
                                            max={100}
                                            step={1}
                                            onValueChange={(val) => { setFilters(prev => ({ ...prev, score: val[0] })); setSelectedLeadIds([]); }}
                                            className="w-full"
                                        />

                                        {/* Presets Grid */}
                                        <div className="grid grid-cols-4 gap-2 pt-2">
                                            {[0, 50, 75, 90].map((preset) => (
                                                <button
                                                    key={preset}
                                                    onClick={() => { setFilters(prev => ({ ...prev, score: preset })); setSelectedLeadIds([]); }}
                                                    className={cn(
                                                        "py-2 rounded-lg text-[10px] font-bold transition-all border",
                                                        filters.score === preset
                                                            ? isDarkMode
                                                                ? "bg-white text-black border-white"
                                                                : "bg-slate-900 text-white border-slate-900"
                                                            : isDarkMode
                                                                ? "bg-white/5 text-white/50 border-transparent hover:bg-white/10 hover:text-white"
                                                                : "bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100 hover:text-slate-700"
                                                    )}
                                                >
                                                    {preset === 0 ? 'Any' : `${preset}+`}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>

                        {/* Reset Button (only if filters active) */}
                        {(filters.origin !== 'all' || filters.heatState !== 'all' || filters.assignedTo !== 'all' || filters.score > 0) && (
                            <button
                                onClick={() => { setFilters({ origin: 'all', score: 0, heatState: 'all', assignedTo: 'all' }); setSelectedLeadIds([]); }}
                                className={cn(
                                    "p-2.5 rounded-xl border transition-all hover:scale-105 active:scale-95",
                                    isDarkMode
                                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                                        : "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100"
                                )}
                                title="Reset Filters"
                            >
                                <RefreshCw size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Bulk Actions Bar */}
                {selectedLeadIds.length > 0 && (
                    <div className={cn(
                        "mt-6 p-4 rounded-2xl border flex items-center justify-between animate-in slide-in-from-top-4 duration-300",
                        isDarkMode
                            ? "bg-emerald-500/10 border-emerald-500/30 text-white"
                            : "bg-emerald-50 border-emerald-200 text-emerald-900"
                    )}>
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm",
                                isDarkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-500 text-white"
                            )}>
                                {selectedLeadIds.length}
                            </div>
                            <div>
                                <p className="text-sm font-bold">Leads Selected</p>
                                <p className={cn("text-[11px] font-medium opacity-70")}>Choose an action to apply to all selected leads</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {isAdmin && filters.assignedTo === 'unassigned' && (
                                <Popover open={isAssigningBulk} onOpenChange={setIsAssigningBulk}>
                                    <PopoverTrigger asChild>
                                        <button className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border",
                                            isDarkMode
                                                ? "bg-white/10 border-white/20 hover:bg-white/20 text-white"
                                                : "bg-white border-slate-200 hover:bg-slate-50 shadow-sm text-slate-700"
                                        )}>
                                            <Users size={16} />
                                            Assign To
                                            <ChevronDown size={14} className={cn("transition-transform duration-200", isAssigningBulk ? "rotate-180" : "")} />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent isDarkMode={isDarkMode} className={cn("w-64 p-2 rounded-xl border shadow-xl")} align="end">
                                        <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar">
                                            {filteredAgents.map((agent: any) => (
                                                <button
                                                    key={agent.tenant_user_id}
                                                    onClick={() => handleBulkAssign(agent.tenant_user_id)}
                                                    className={cn(
                                                        "w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left",
                                                        isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-50"
                                                    )}
                                                >
                                                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold", isDarkMode ? "bg-white/10" : "bg-slate-100")}>
                                                        {agent.username?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className={cn("text-sm font-semibold", isDarkMode ? "text-white" : "text-slate-900")}>{agent.username}</p>
                                                        <p className="text-[10px] opacity-60 uppercase font-bold">{agent.role}</p>
                                                    </div>
                                                </button>
                                            ))}
                                            {filteredAgents.length === 0 && (
                                                <p className="p-4 text-center text-xs opacity-50 font-medium">No agents available</p>
                                            )}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            )}

                            {filters.assignedTo === 'unassigned' && (
                                <button
                                    onClick={handleBulkClaim}
                                    className={cn(
                                        "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md",
                                        isDarkMode
                                            ? "bg-emerald-500 text-white hover:bg-emerald-400"
                                            : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200"
                                    )}
                                >
                                    <ShieldCheck size={18} />
                                    Claim Selected
                                </button>
                            )}

                            {isAdmin && filters.assignedTo !== 'unassigned' && filters.assignedTo !== 'all' && (
                                <button
                                    onClick={handleBulkUnassign}
                                    className={cn(
                                        "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md",
                                        isDarkMode
                                            ? "bg-rose-500 text-white hover:bg-rose-400"
                                            : "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200"
                                    )}
                                >
                                    <UserMinus size={18} />
                                    Unassign Selected
                                </button>
                            )}

                            <div className={cn("w-px h-8 mx-1", isDarkMode ? "bg-white/10" : "bg-emerald-200")} />

                            <button
                                onClick={() => setSelectedLeadIds([])}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                                    isDarkMode ? "text-white/60 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                                )}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex items-center space-x-1 border-b border-white/5">
                    <button
                        onClick={() => { setActiveTab('all'); setFilters(prev => ({ ...prev, assignedTo: 'all' })); setCurrentPage(1); setSearchQuery(''); setSelectedLeadIds([]); }}
                        className={cn(
                            "px-4 py-2 text-sm font-medium border-b-2 transition-all",
                            activeTab === 'all' && filters.assignedTo === 'all'
                                ? (isDarkMode ? 'border-emerald-500 text-emerald-500' : 'border-emerald-500 text-emerald-600')
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        )}
                    >
                        All Leads
                    </button>
                    <button
                        onClick={() => { setActiveTab('all'); setFilters(prev => ({ ...prev, assignedTo: isAdmin ? 'assigned' : (user?.tenant_user_id || 'all') })); setCurrentPage(1); setSearchQuery(''); setSelectedLeadIds([]); }}
                        className={cn(
                            "px-4 py-2 text-sm font-medium border-b-2 transition-all",
                            activeTab === 'all' && (filters.assignedTo === (isAdmin ? 'assigned' : user?.tenant_user_id))
                                ? (isDarkMode ? 'border-emerald-500 text-emerald-500' : 'border-emerald-500 text-emerald-600')
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        )}
                    >
                        Assigned
                    </button>
                    <button
                        onClick={() => { setActiveTab('all'); setFilters(prev => ({ ...prev, assignedTo: 'unassigned' })); setCurrentPage(1); setSearchQuery(''); setSelectedLeadIds([]); }}
                        className={cn(
                            "px-4 py-2 text-sm font-medium border-b-2 transition-all",
                            activeTab === 'all' && filters.assignedTo === 'unassigned'
                                ? (isDarkMode ? 'border-emerald-500 text-emerald-500' : 'border-emerald-500 text-emerald-600')
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        )}
                    >
                        Unassigned
                    </button>
                    <button
                        onClick={() => { setActiveTab('trash'); setFilters(prev => ({ ...prev, assignedTo: 'all' })); setCurrentPage(1); setSearchQuery(''); setSelectedLeadIds([]); }}
                        className={cn(
                            "px-4 py-2 text-sm font-medium border-b-2 transition-all flex items-center space-x-2",
                            activeTab === 'trash'
                                ? (isDarkMode ? 'border-emerald-500 text-emerald-500' : 'border-emerald-500 text-emerald-600')
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        )}
                    >
                        <Trash2 size={16} />
                        <span>Trash</span>
                    </button>
                </div >

                <GlassCard isDarkMode={isDarkMode} className="flex flex-col min-h-0 overflow-hidden p-0">
                    <DataTable
                        className="overflow-y-auto"
                        columns={columns}
                        data={currentLeads}
                        isLoading={isLoading}
                        isDarkMode={isDarkMode}
                        getRowClassName={() => ''}
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
        </div>
    );
};
