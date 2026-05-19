import React, { useMemo, useState } from 'react';
import { GlassCard } from "@/components/ui/glassCard";
import { cn } from "@/lib/utils";
import { getHeatStateStyles } from '@/utils/leadUtils';
import dayjs from "@/utils/dayjs";
import { AppointmentDrawer } from './appointments/appointmentDrawer';
import { Appointment } from './appointments/bookingList';
import { useGetAllAppointmentsQuery } from '@/hooks/useAppointmentQuery';
import { useGetAllDoctorsQuery } from '@/hooks/useDoctorQuery';
import {
    ArrowLeft,
    Edit,
    MoreVertical,
    Trash2,
    Phone,
    Mail,
    Calendar,
    MessageSquare,
    Shield,
    Globe,
    Clock,
    User,
    Sparkles,
    AlertCircle,
    Check,
    Copy,
    RefreshCw
} from 'lucide-react';
import { useSummarizeLeadMutation } from '@/hooks/useLeadIntelligenceQuery';
import { toast } from '@/lib/toast';

interface LeadDetailsViewProps {
    lead: any;
    isDarkMode: boolean;
    onBack?: () => void;
    onLeadRefresh?: () => void;
}

export const LeadDetailsView = ({ lead, isDarkMode, onBack, onLeadRefresh }: LeadDetailsViewProps) => {
    if (!lead) return null;

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return dayjs(dateString).format('MMM D, YYYY h:mm A');
    };

    const isSummaryNew = lead.summary_status === 'new';

    const finalScore = Number(lead?.lead_score_final ?? lead?.score ?? 0);
    const recencyComponent = lead?.lead_score_recency_component === null || lead?.lead_score_recency_component === undefined
        ? null
        : Number(lead.lead_score_recency_component);
    const intentComponent = lead?.lead_score_conversation_component === null || lead?.lead_score_conversation_component === undefined
        ? null
        : Number(lead.lead_score_conversation_component);
    const interestComponent = lead?.lead_score_intent_interest_component === null || lead?.lead_score_intent_interest_component === undefined
        ? null
        : Number(lead.lead_score_intent_interest_component);
    const finalStatus = lead?.lead_status_final || lead?.heat_state;
    const scoreTextClass = finalScore >= 80
        ? 'text-red-500'
        : finalScore >= 40
            ? 'text-orange-500'
            : 'text-blue-500';
    const scoreBarClass = finalScore >= 80
        ? 'bg-gradient-to-r from-red-600 to-red-400'
        : finalScore >= 40
            ? 'bg-gradient-to-r from-orange-600 to-orange-400'
            : 'bg-gradient-to-r from-blue-600 to-blue-400';
    const reasonCodes = Array.isArray(lead?.lead_score_reason_codes)
        ? lead.lead_score_reason_codes
        : typeof lead?.lead_score_reason_codes === 'string'
            ? (() => {
                try {
                    const parsed = JSON.parse(lead.lead_score_reason_codes);
                    return Array.isArray(parsed) ? parsed : [];
                } catch {
                    return [];
                }
            })()
            : [];

    const { mutate: summarizeLead, isPending } = useSummarizeLeadMutation();
    const [copied, setCopied] = useState(false);
    const [isAppointmentDrawerOpen, setIsAppointmentDrawerOpen] = useState(false);
    const [appointmentDrawerMode, setAppointmentDrawerMode] = useState<'view' | 'edit' | 'create'>('create');
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    const { data: leadAppointmentsData, refetch: refetchLeadAppointments } =
        useGetAllAppointmentsQuery({ lead_id: lead.lead_id });
    const { data: doctorsData } = useGetAllDoctorsQuery();
    const doctors = doctorsData?.data || [];
    const leadAppointments: Appointment[] = leadAppointmentsData?.data || [];

    const sortedAppointments = useMemo(() => {
        if (!leadAppointments.length) return [];
        return [...leadAppointments].sort((a, b) => {
            const aDateTime = dayjs(`${a.appointment_date || ''} ${a.appointment_time || ''}`);
            const bDateTime = dayjs(`${b.appointment_date || ''} ${b.appointment_time || ''}`);
            return bDateTime.valueOf() - aDateTime.valueOf();
        });
    }, [leadAppointments]);

    const latestAppointment = sortedAppointments.length ? sortedAppointments[0] : null;

    const latestAppointmentDoctorName = useMemo(() => {
        if (!latestAppointment?.doctor_id) return '-';
        const doctor = doctors.find((d: any) => d.doctor_id === latestAppointment.doctor_id);
        return doctor?.name ? `${doctor.title ? `${doctor.title} ` : ''}${doctor.name}` : latestAppointment.doctor_id;
    }, [doctors, latestAppointment]);

    const getDoctorName = (appointment: Appointment) => {
        if (!appointment?.doctor_id) return '-';
        const doctor = doctors.find((d: any) => d.doctor_id === appointment.doctor_id);
        return doctor?.name ? `${doctor.title ? `${doctor.title} ` : ''}${doctor.name}` : '-';
    };

    const getStatusStyles = (status?: string) => {
        switch ((status || '').trim().toLowerCase()) {
            case 'pending':
                return isDarkMode
                    ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                    : "bg-amber-50 text-amber-700 border-amber-200";
            case 'confirmed':
                return isDarkMode
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200";
            case 'completed':
                return isDarkMode
                    ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
                    : "bg-blue-50 text-blue-700 border-blue-200";
            case 'noshow':
                return isDarkMode
                    ? "bg-orange-500/15 text-orange-300 border-orange-500/30"
                    : "bg-orange-50 text-orange-700 border-orange-200";
            case 'cancelled':
                return isDarkMode
                    ? "bg-red-500/15 text-red-300 border-red-500/30"
                    : "bg-red-50 text-red-700 border-red-200";
            default:
                return isDarkMode
                    ? "bg-white/10 text-white/70 border-white/20"
                    : "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    const handleRefresh = (e: React.MouseEvent) => {
        e.stopPropagation();
        summarizeLead({ id: lead.lead_id }, {
            onSuccess: () => {
                toast.success("Summary updated successfully");
            }
        });
    };

    const handleCopy = () => {
        if (lead.ai_summary) {
            navigator.clipboard.writeText(lead.ai_summary);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleCreateAppointment = () => {
        setSelectedAppointment(null);
        setAppointmentDrawerMode('create');
        setIsAppointmentDrawerOpen(true);
    };

    const handleOpenAppointment = () => {
        if (!latestAppointment) return;
        setSelectedAppointment(latestAppointment);
        setAppointmentDrawerMode('edit');
        setIsAppointmentDrawerOpen(true);
    };

    const handleAppointmentSaved = async () => {
        setIsAppointmentDrawerOpen(false);
        await refetchLeadAppointments();
        onLeadRefresh?.();
    };

    return (
        <div className="h-full overflow-y-auto p-4 md:p-5 space-y-4 animate-in fade-in duration-500">
            {/* Header Section */}
            <GlassCard className="p-5 relative overflow-hidden" isDarkMode={isDarkMode}>
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-4">
                    {/* Top Row: Back Button & Actions */}
                    {/* <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg backdrop-blur-sm border border-white/5">
                        <button
                            onClick={onBack}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all group",
                                isDarkMode ? "hover:bg-white/10 text-white/60 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                            )}
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Leads
                        </button>

                        <div className="flex items-center gap-2">
                            <button className={cn("p-2 rounded-full transition-all", isDarkMode ? "hover:bg-white/10 text-white/40 hover:text-white" : "hover:bg-slate-100 text-slate-400 hover:text-slate-600")} title="Edit Lead">
                                <Edit size={16} />
                            </button>
                            <button className={cn("p-2 rounded-full transition-all", isDarkMode ? "hover:bg-white/10 text-white/40 hover:text-white" : "hover:bg-slate-100 text-slate-400 hover:text-slate-600")} title="More Options">
                                <MoreVertical size={16} />
                            </button>
                        </div>
                    </div> */}

                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center space-x-4">
                            <div className={cn(
                                "w-24 h-24 rounded-2xl flex items-center justify-center font-bold text-4xl shadow-2xl relative overflow-hidden group border",
                                isDarkMode ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/10 text-white' : 'bg-white border-slate-100 text-slate-800'
                            )}>
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                {lead.name?.charAt(0)?.toUpperCase() ?? "?"}
                            </div>

                            <div>
                                <h1 className={cn("text-5xl font-black tracking-tight mb-2",
                                    isDarkMode ? "bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/50" : "text-slate-900"
                                )}>
                                    {lead.name}
                                </h1>
                                <div className="flex items-center gap-3">
                                    <span className={cn(
                                        "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5",
                                        getHeatStateStyles(finalStatus)
                                    )}>
                                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                        {finalStatus}
                                    </span>

                                    <span className={cn(
                                        "text-[10px] font-semibold px-2.5 py-1 rounded-full border",
                                        getHeatStateStyles(lead.heat_state)
                                    )}>
                                        Recency: {lead.heat_state}
                                    </span>

                                    {isSummaryNew && (
                                        <span className={cn(
                                            "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border shadow-sm flex items-center gap-1.5",
                                            "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                        )}>
                                            <Sparkles size={10} className="text-emerald-500" />
                                            New
                                        </span>
                                    )}

                                    <span className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-full border", isDarkMode ? "bg-white/5 border-white/10 text-white/40" : "bg-slate-100 border-slate-200 text-slate-500")}>
                                        {lead.lead_stage || 'New'}
                                    </span>

                                    <span className={cn(
                                        "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border flex items-center gap-1.5",
                                        (lead.priority === 'High' || lead.priority === 'Urgent') ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                            (lead.priority === 'Low') ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                                "bg-orange-500/10 text-orange-500 border-orange-500/20" // Default/Medium
                                    )}>
                                        <AlertCircle size={10} />
                                        {lead.priority || 'MD'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Score Card */}
                        <div className={cn(
                            "p-4 rounded-2xl border min-w-[260px] md:min-w-[280px] relative overflow-hidden group transition-all hover:shadow-lg",
                            isDarkMode ? "bg-black/20 border-white/10" : "bg-white border-slate-100 shadow-sm"
                        )}>
                            {/* <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                                <Sparkles size={60} />
                            </div> */}

                            <div className="flex justify-between items-end relative z-10 mb-3">
                                <span className={cn("text-xs font-bold uppercase tracking-widest flex items-center gap-2", isDarkMode ? "text-white/40" : "text-slate-400")}>
                                    <Shield size={14} />
                                    Neural Score
                                </span>
                                <div className="flex items-baseline gap-1">
                                    <span className={cn("text-5xl font-black tracking-tighter", scoreTextClass)}>
                                        {finalScore}
                                    </span>
                                    <span className={cn("text-sm font-bold opacity-50", isDarkMode ? "text-white" : "text-slate-600")}>/100</span>
                                </div>
                            </div>

                            <div className="relative h-4 w-full rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden shadow-inner border border-black/5 dark:border-white/5">
                                <div
                                    className={cn(
                                        "h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.4)]",
                                        scoreBarClass
                                    )}
                                    style={{ width: `${finalScore}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)' }} />
                                </div>
                            </div>

                            <div className={cn("grid grid-cols-3 gap-3 mt-4", isDarkMode ? "text-white/70" : "text-slate-600")}>
                                <div className="text-[11px] font-semibold uppercase tracking-wide">Recency (50%): {recencyComponent ?? 'Pending'}</div>
                                <div className="text-[11px] font-semibold uppercase tracking-wide">AI Score (35%): {intentComponent ?? 'Pending'}</div>
                                <div className="text-[11px] font-semibold uppercase tracking-wide">Interest (15%): {interestComponent ?? 'Pending'}</div>
                            </div>
                            {(recencyComponent === null || intentComponent === null || interestComponent === null) && (
                                <div className={cn("text-[10px] mt-2 uppercase tracking-wide", isDarkMode ? "text-white/45" : "text-slate-500")}>
                                    Signals will populate after the latest scoring cycle.
                                </div>
                            )}
                            <div className={cn("text-[10px] mt-2 uppercase tracking-wide", isDarkMode ? "text-white/40" : "text-slate-500")}>
                                Final score: 50% recency + 35% AI conversation + 15% interest, capped at 100.
                            </div>

                            {reasonCodes.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-4">
                                    {reasonCodes.slice(0, 5).map((code: string) => (
                                        <span
                                            key={code}
                                            className={cn(
                                                "text-[9px] uppercase tracking-wide px-2 py-1 rounded-md border",
                                                isDarkMode
                                                    ? "bg-white/5 border-white/10 text-white/60"
                                                    : "bg-slate-50 border-slate-200 text-slate-500"
                                            )}
                                        >
                                            {code.replaceAll('_', ' ')}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </GlassCard>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left Column: Contact & Metadata */}
                <div className="space-y-5 lg:col-span-1">
                    <GlassCard className="p-5 space-y-4" isDarkMode={isDarkMode}>
                        <h3 className={cn("text-sm font-bold uppercase tracking-wide flex items-center gap-2", isDarkMode ? "text-white/90" : "text-slate-800")}>
                            <User size={18} className="text-emerald-500" />
                            Contact Details
                        </h3>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-4 p-3 rounded-xl transition-colors hover:bg-white/5 border border-transparent hover:border-white/5 group">
                                <div className={cn("p-2.5 rounded-lg transition-colors group-hover:bg-emerald-500/20 group-hover:text-emerald-500", isDarkMode ? "bg-white/5 text-white/60" : "bg-slate-100 text-slate-500")}>
                                    <Phone size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <span className={cn("text-[10px] font-bold uppercase tracking-wider", isDarkMode ? "text-white/40" : "text-slate-400")}>Phone</span>
                                    <span className={cn("text-sm font-medium", isDarkMode ? "text-white" : "text-slate-900")}>+{lead.phone}</span>
                                </div>
                            </div>

                            {lead.email && (
                                <div className="flex items-center space-x-4 p-3 rounded-xl transition-colors hover:bg-white/5 border border-transparent hover:border-white/5 group">
                                    <div className={cn("p-2.5 rounded-lg transition-colors group-hover:bg-blue-500/20 group-hover:text-blue-500", isDarkMode ? "bg-white/5 text-white/60" : "bg-slate-100 text-slate-500")}>
                                        <Mail size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={cn("text-[10px] font-bold uppercase tracking-wider", isDarkMode ? "text-white/40" : "text-slate-400")}>Email</span>
                                        <span className={cn("text-sm font-medium", isDarkMode ? "text-white" : "text-slate-900")}>{lead.email}</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center space-x-4 p-3 rounded-xl transition-colors hover:bg-white/5 border border-transparent hover:border-white/5 group">
                                <div className={cn("p-2.5 rounded-lg transition-colors group-hover:bg-purple-500/20 group-hover:text-purple-500", isDarkMode ? "bg-white/5 text-white/60" : "bg-slate-100 text-slate-500")}>
                                    <Globe size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <span className={cn("text-[10px] font-bold uppercase tracking-wider", isDarkMode ? "text-white/40" : "text-slate-400")}>Origin</span>
                                    <span className={cn("text-sm font-medium", isDarkMode ? "text-white" : "text-slate-900")}>{lead.origin || lead.source || 'Unknown'}</span>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-5 space-y-4" isDarkMode={isDarkMode}>
                        <h3 className={cn("text-sm font-bold uppercase tracking-wide flex items-center gap-2", isDarkMode ? "text-white/90" : "text-slate-800")}>
                            <Calendar size={18} className="text-emerald-500" />
                            Appointment Information
                        </h3>

                        {!latestAppointment ? (
                            <div className="space-y-4">
                                <p className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                    No appointment created
                                </p>
                                <button
                                    onClick={handleCreateAppointment}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                                        isDarkMode
                                            ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                    )}
                                >
                                    Create Appointment
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5">
                                        <span className={cn("text-xs font-medium", isDarkMode ? "text-white/40" : "text-slate-400")}>Doctor</span>
                                        <span className={cn("text-xs text-right", isDarkMode ? "text-white/80" : "text-slate-700")}>{latestAppointmentDoctorName}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5">
                                        <span className={cn("text-xs font-medium", isDarkMode ? "text-white/40" : "text-slate-400")}>Date</span>
                                        <span className={cn("text-xs", isDarkMode ? "text-white/80" : "text-slate-700")}>
                                            {latestAppointment.appointment_date ? dayjs(latestAppointment.appointment_date).format('MMM D, YYYY') : '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5">
                                        <span className={cn("text-xs font-medium", isDarkMode ? "text-white/40" : "text-slate-400")}>Time</span>
                                        <span className={cn("text-xs", isDarkMode ? "text-white/80" : "text-slate-700")}>{latestAppointment.appointment_time || '-'}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5">
                                        <span className={cn("text-xs font-medium", isDarkMode ? "text-white/40" : "text-slate-400")}>Status</span>
                                        <span className={cn("text-xs font-semibold", isDarkMode ? "text-white/90" : "text-slate-800")}>{latestAppointment.status || '-'}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleOpenAppointment}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                                        isDarkMode
                                            ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                    )}
                                >
                                    Open Appointment
                                </button>

                                <div className={cn("h-px", isDarkMode ? "bg-white/10" : "bg-slate-200")} />

                                <div className="space-y-2">
                                    <h4 className={cn(
                                        "text-xs font-bold uppercase tracking-wide",
                                        isDarkMode ? "text-white/80" : "text-slate-700"
                                    )}>
                                        Appointment History
                                    </h4>

                                    {sortedAppointments.length === 0 ? (
                                        <p className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                            No appointment history
                                        </p>
                                    ) : (
                                        <div className={cn(
                                            "rounded-lg border overflow-hidden",
                                            isDarkMode ? "border-white/10" : "border-slate-200"
                                        )}>
                                            <div className={cn(
                                                "grid grid-cols-[1.2fr_1fr_1fr_1.4fr] gap-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide",
                                                isDarkMode ? "bg-white/5 text-white/40" : "bg-slate-50 text-slate-500"
                                            )}>
                                                <span>Status</span>
                                                <span>Date</span>
                                                <span>Time</span>
                                                <span>Doctor</span>
                                            </div>
                                            {sortedAppointments.map((appointment, index) => (
                                                <button
                                                    key={appointment.appointment_id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedAppointment(appointment);
                                                        setAppointmentDrawerMode('edit');
                                                        setIsAppointmentDrawerOpen(true);
                                                    }}
                                                    className={cn(
                                                        "w-full grid grid-cols-[1.2fr_1fr_1fr_1.4fr] gap-2 px-3 py-2 text-left text-sm transition-colors",
                                                        index < sortedAppointments.length - 1 && (isDarkMode ? "border-b border-white/5" : "border-b border-slate-100"),
                                                        isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-50"
                                                    )}
                                                >
                                                    <span className="flex items-center">
                                                        <span className={cn(
                                                            "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold",
                                                            getStatusStyles(appointment.status)
                                                        )}>
                                                            {appointment.status || '-'}
                                                        </span>
                                                    </span>
                                                    <span className={cn("text-sm", isDarkMode ? "text-white/80" : "text-slate-700")}>
                                                        {appointment.appointment_date
                                                            ? dayjs(appointment.appointment_date).format('MMM D, YYYY')
                                                            : '-'}
                                                    </span>
                                                    <span className={cn("text-sm", isDarkMode ? "text-white/80" : "text-slate-700")}>
                                                        {appointment.appointment_time || '-'}
                                                    </span>
                                                    <span className={cn("text-sm truncate", isDarkMode ? "text-white/80" : "text-slate-700")}>
                                                        {getDoctorName(appointment)}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </GlassCard>

                    <GlassCard className="p-5 space-y-4" isDarkMode={isDarkMode}>
                        <h3 className={cn("text-sm font-bold uppercase tracking-wide flex items-center gap-2", isDarkMode ? "text-white/90" : "text-slate-800")}>
                            <Shield size={18} className="text-emerald-500" />
                            System Info
                        </h3>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5">
                                <span className={cn("text-xs font-medium", isDarkMode ? "text-white/40" : "text-slate-400")}>Lead ID</span>
                                <span className={cn("text-xs font-mono select-all", isDarkMode ? "text-white/60" : "text-slate-600")}>{lead.lead_id}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5">
                                <span className={cn("text-xs font-medium", isDarkMode ? "text-white/40" : "text-slate-400")}>Created At</span>
                                <span className={cn("text-xs", isDarkMode ? "text-white/80" : "text-slate-700")}>{formatDate(lead.lead_created_at)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5">
                                <span className={cn("text-xs font-medium", isDarkMode ? "text-white/40" : "text-slate-400")}>Last User Msg</span>
                                <span className={cn("text-xs", isDarkMode ? "text-white/80" : "text-slate-700")}>{formatDate(lead.last_user_message_at)}</span>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Right Column: AI Intelligence & Recent Activity */}
                <div className="lg:col-span-2 space-y-5">
                    <GlassCard className="p-6 relative overflow-hidden group" isDarkMode={isDarkMode}>

                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <h3 className={cn("text-xl font-bold flex items-center gap-3", isDarkMode ? "text-white" : "text-slate-900")}>
                                <Sparkles size={24} className="text-purple-500" />
                                AI Intelligence Summary
                            </h3>
                            {lead.summary_status && (
                                <span className={cn(
                                    "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border flex items-center gap-1.5",
                                    isSummaryNew
                                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                        : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                                )}>
                                    {isSummaryNew && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                                    {lead.summary_status}
                                </span>
                            )}
                        </div>

                        <div className={cn(
                            "p-5 rounded-xl border relative z-10 flex flex-col gap-4",
                            isDarkMode ? "bg-black/20 border-white/5" : "bg-slate-50 border-slate-100"
                        )}>
                            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500/50 rounded-l-xl" />
                            <p className={cn("text-sm leading-relaxed pl-2", isDarkMode ? "text-white/80" : "text-slate-700")}>
                                {lead.ai_summary || "No summary available yet."}
                            </p>

                            <div className="flex items-center gap-2 self-end">
                                {lead.summary_status?.toLowerCase() === 'new' && (
                                    <button
                                        onClick={handleRefresh}
                                        disabled={isPending}
                                        className={cn(
                                            "flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all",
                                            isDarkMode
                                                ? "bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20"
                                                : "bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 shadow-sm"
                                        )}
                                    >
                                        <RefreshCw size={12} className={cn(isPending && "animate-spin")} />
                                        <span>Update Summary</span>
                                    </button>
                                )}
                                {lead.ai_summary && (
                                    <button
                                        onClick={handleCopy}
                                        className={cn(
                                            "flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all",
                                            copied
                                                ? isDarkMode
                                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                    : "bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm"
                                                : isDarkMode
                                                    ? "bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
                                                    : "bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-700 shadow-sm border border-slate-200"
                                        )}
                                    >
                                        {copied ? <Check size={12} /> : <Copy size={12} />}
                                        {copied ? "Copied!" : "Copy Summary"}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Additional AI Insights if available in payload later */}
                        {lead.internal_notes && (
                            <div className="mt-6 relative z-10">
                                <h4 className={cn("text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2", isDarkMode ? "text-white/40" : "text-slate-400")}>
                                    <AlertCircle size={12} />
                                    Internal Notes
                                </h4>
                                <div className={cn("p-4 rounded-xl text-sm italic border", isDarkMode ? "bg-orange-500/5 text-orange-200/80 border-orange-500/10" : "bg-orange-50 text-orange-800 border-orange-100")}>
                                    {lead.internal_notes}
                                </div>
                            </div>
                        )}
                    </GlassCard>

                    {/* Recent Activity / Chat UI */}
                    <GlassCard className="flex flex-col h-[420px] lg:h-[calc(100vh-24rem)] lg:min-h-[420px] lg:max-h-[620px] overflow-hidden p-0 border-0" isDarkMode={isDarkMode}>
                        {/* Header */}
                        <div className={cn(
                            "px-6 py-4 flex items-center justify-between shrink-0 border-b",
                            isDarkMode ? "bg-white/5 border-white/5" : "bg-white border-slate-100"
                        )}>
                            <h3 className={cn("text-lg font-bold flex items-center gap-3", isDarkMode ? "text-white" : "text-slate-900")}>
                                <MessageSquare size={20} className="text-blue-500" />
                                Conversation History
                            </h3>
                            <span className={cn("text-xs px-2 py-1 rounded border", isDarkMode ? "bg-white/5 border-white/10 text-white/40" : "bg-slate-100 border-slate-200 text-slate-400")}>
                                Recent Messages
                            </span>
                        </div>

                        <div
                            className={cn(
                                "flex-1 overflow-y-auto p-6 flex flex-col gap-4 relative scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent",
                                isDarkMode ? 'bg-[#0b141a]' : 'bg-[#e5ddd5]'
                            )}
                            style={{
                                backgroundImage: isDarkMode
                                    ? 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h100v100H0z\' fill=\'%230b141a\'/%3E%3Cpath d=\'M20 20l5 5-5 5m15-10l5 5-5 5\' stroke=\'%23ffffff\' stroke-width=\'0.5\' opacity=\'0.03\' fill=\'none\'/%3E%3C/svg%3E")'
                                    : 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h100v100H0z\' fill=\'%23e5ddd5\'/%3E%3Cpath d=\'M20 20l5 5-5 5m15-10l5 5-5 5\' stroke=\'%23000000\' stroke-width=\'0.5\' opacity=\'0.05\' fill=\'none\'/%3E%3C/svg%3E")'
                            }}
                        >

                            {lead.last_messages && lead.last_messages.length > 0 ? (
                                lead.last_messages.map((msg: any, idx: number) => {
                                    const isBot = msg.sender === 'bot';
                                    return (
                                        <div key={idx} className={cn("flex w-full", isBot ? "justify-end" : "justify-start")}>
                                            <div className={cn(
                                                "max-w-[80%] rounded-lg shadow-sm relative px-3 py-1.5",
                                                isBot
                                                    ? (isDarkMode ? "bg-[#005c4b] rounded-tr-none" : "bg-[#dcf8c6] rounded-tr-none")
                                                    : (isDarkMode ? "bg-[#202c33] rounded-tl-none" : "bg-white rounded-tl-none")
                                            )}>
                                                {/* Tail */}
                                                <div className={cn(
                                                    "absolute top-0 w-0 h-0 border-[6px] border-transparent",
                                                    isBot
                                                        ? (isDarkMode ? "right-[-6px] border-t-[#005c4b]" : "right-[-6px] border-t-[#dcf8c6]")
                                                        : (isDarkMode ? "left-[-6px] border-t-[#202c33]" : "left-[-6px] border-t-white")
                                                )} />

                                                <p className={cn(
                                                    "text-[13px] leading-relaxed relative z-10",
                                                    isDarkMode ? "text-white/90" : "text-[#111b21]"
                                                )}>
                                                    {msg.message}
                                                </p>

                                                <div className="flex items-center justify-end gap-1 mt-0.5 relative z-10 select-none">
                                                    <span className={cn(
                                                        "text-[10px]",
                                                        isBot
                                                            ? (isDarkMode ? "text-white/60" : "text-slate-500")
                                                            : (isDarkMode ? "text-white/50" : "text-slate-400")
                                                    )}>
                                                        {dayjs(msg.created_at).format('h:mm A')}
                                                    </span>
                                                    {isBot && (
                                                        <div className="flex ml-0.5">
                                                            <Check size={14} className={cn(isDarkMode ? 'text-[#53bdeb]' : 'text-[#53bdeb]')} />
                                                            <Check size={14} className={cn("-ml-2", isDarkMode ? 'text-[#53bdeb]' : 'text-[#53bdeb]')} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center space-y-3 opacity-50">
                                    <MessageSquare size={40} className="text-slate-500" />
                                    <p className="text-sm">No recent conversation history found.</p>
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </div>
            </div>
            <AppointmentDrawer
                isOpen={isAppointmentDrawerOpen}
                onClose={() => setIsAppointmentDrawerOpen(false)}
                onSave={handleAppointmentSaved}
                appointment={selectedAppointment}
                mode={appointmentDrawerMode}
                isDarkMode={isDarkMode}
                prefillData={{
                    patient_name: lead.name || '',
                    contact_number: lead.phone || '',
                    contact_id: lead.contact_id || '',
                    lead_id: lead.lead_id || '',
                }}
            />
        </div>
    );
};
