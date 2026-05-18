"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Plus, Calendar as CalendarIcon, AlertTriangle, Stethoscope, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import { addDays, format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';
import { AppointmentDrawer } from './appointmentDrawer';
import { VisitOutcomeDrawer } from './VisitOutcomeDrawer';
import { NoShowDrawer } from './NoShowDrawer';
import { useGetAllAppointmentsQuery, useDeleteAppointmentMutation, useUpdateAppointmentStatusMutation, useCompleteWithOutcomeMutation, useNoShowWithActionMutation } from '@/hooks/useAppointmentQuery';
import { Modal } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';
import { ActionMenu } from '@/components/ui/actionMenu';

interface BookingListProps {
    isDarkMode: boolean;
}

export interface Appointment {
    appointment_id: string;
    patient_name: string;
    country_code?: string;
    contact_number: string;
    contact_id?: string;
    lead_id?: string;
    age?: number;
    appointment_date: string;
    appointment_time: string;
    status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed' | 'Noshow';
    notes?: string;
    doctor_id?: string;
    doctor?: { doctor_id: string; name: string; title?: string };
    token_number?: number;
    type?: string;
    email?: string;
}

export const BookingList = ({ isDarkMode }: BookingListProps) => {
    const getIsoDate = (date: Date) => format(date, 'yyyy-MM-dd');
    const getDateLabel = (dateValue: string) => {
        const today = getIsoDate(new Date());
        const tomorrow = getIsoDate(addDays(new Date(), 1));
        if (dateValue === today) return 'Today';
        if (dateValue === tomorrow) return 'Tomorrow';
        const parsed = parseISO(dateValue);
        if (isNaN(parsed.getTime())) return 'Custom Date';
        return format(parsed, 'dd MMM yyyy');
    };
    const dateMenuRef = useRef<HTMLDivElement | null>(null);
    const todayDate = useMemo(() => getIsoDate(new Date()), []);
    const tomorrowDate = useMemo(() => getIsoDate(addDays(new Date(), 1)), []);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedDate, setSelectedDate] = useState<string>(getIsoDate(new Date()));
    const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [completionAppointment, setCompletionAppointment] = useState<Appointment | null>(null);
    const [noShowAppointment, setNoShowAppointment] = useState<Appointment | null>(null);
    const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
    const [deleteConfirm, setDeleteConfirm] = useState<Appointment | null>(null);
    const [isOutcomeDrawerOpen, setIsOutcomeDrawerOpen] = useState(false);
    const [isNoShowDrawerOpen, setIsNoShowDrawerOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const { data, isLoading } = useGetAllAppointmentsQuery({ search: debouncedSearch, date: selectedDate });
    const { mutate: deleteAppointment, isPending: isDeleting } = useDeleteAppointmentMutation();
    const { mutate: updateAppointmentStatus, isPending: isStatusUpdating } = useUpdateAppointmentStatusMutation();
    const { mutate: completeWithOutcome, isPending: isCompletingWithOutcome } = useCompleteWithOutcomeMutation();
    const { mutate: noShowWithAction, isPending: isHandlingNoShow } = useNoShowWithActionMutation();

    const allAppointments: Appointment[] = useMemo(() => data?.data || [], [data?.data]);

    // Status counts for filter pills
    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = { all: allAppointments.length };
        allAppointments.forEach((a) => {
            const s = a.status?.toLowerCase() || 'unknown';
            counts[s] = (counts[s] || 0) + 1;
        });
        return counts;
    }, [allAppointments]);

    // Filtered appointments
    const appointments = useMemo(() => {
        if (statusFilter === 'all') return allAppointments;
        return allAppointments.filter((a) => a.status?.toLowerCase() === statusFilter);
    }, [allAppointments, statusFilter]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.ceil(appointments.length / itemsPerPage);
    const currentAppointments = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return appointments.slice(start, start + itemsPerPage);
    }, [appointments, currentPage]);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (!dateMenuRef.current) return;
            if (dateMenuRef.current.contains(event.target as Node)) return;
            // Don't close if a date input inside the menu is focused (native picker may be open)
            const dateInput = dateMenuRef.current.querySelector('input[type="date"]');
            if (dateInput === document.activeElement) return;
            setIsDateMenuOpen(false);
        };

        if (isDateMenuOpen) {
            document.addEventListener('mousedown', handleOutsideClick);
        }

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [isDateMenuOpen]);

    const dateFilterLabel = getDateLabel(selectedDate);

    const handleSelectToday = () => {
        setSelectedDate(todayDate);
        setCalendarMonth(new Date());
        setCurrentPage(1);
        setIsDateMenuOpen(false);
    };

    const handleSelectTomorrow = () => {
        setSelectedDate(tomorrowDate);
        setCalendarMonth(addDays(new Date(), 1));
        setCurrentPage(1);
        setIsDateMenuOpen(false);
    };

    const handleCalendarDateSelect = (dateStr: string) => {
        setSelectedDate(dateStr);
        setCurrentPage(1);
        setIsDateMenuOpen(false);
    };

    const renderDateCalendar = () => {
        const monthStart = startOfMonth(calendarMonth);
        const monthEnd = endOfMonth(monthStart);
        const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
        const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
        const days = eachDayOfInterval({ start: calStart, end: calEnd });
        const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

        return (
            <div>
                <div className="flex items-center justify-between mb-3 px-1">
                    <button
                        type="button"
                        onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
                        className={cn("p-1.5 rounded-lg transition-colors", isDarkMode ? "hover:bg-white/10 text-white/60 hover:text-white" : "hover:bg-slate-100 text-slate-500")}
                    >
                        <ChevronLeft size={14} />
                    </button>
                    <span className={cn("text-xs font-bold", isDarkMode ? "text-white" : "text-slate-800")}>
                        {format(calendarMonth, 'MMMM yyyy')}
                    </span>
                    <button
                        type="button"
                        onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                        className={cn("p-1.5 rounded-lg transition-colors", isDarkMode ? "hover:bg-white/10 text-white/60 hover:text-white" : "hover:bg-slate-100 text-slate-500")}
                    >
                        <ChevronRight size={14} />
                    </button>
                </div>
                <div className="grid grid-cols-7 mb-1.5">
                    {weekDays.map(day => (
                        <div key={day} className={cn("text-center text-[9px] font-bold uppercase tracking-wide", isDarkMode ? "text-white/30" : "text-slate-400")}>
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-y-1">
                    {days.map(day => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const isSelected = selectedDate === dateStr;
                        const isToday = isSameDay(day, new Date());
                        const isCurrentMonth = isSameMonth(day, calendarMonth);

                        return (
                            <button
                                key={dateStr}
                                type="button"
                                onClick={() => handleCalendarDateSelect(dateStr)}
                                className={cn(
                                    "h-7 w-7 mx-auto flex items-center justify-center text-[11px] rounded-lg transition-all",
                                    !isCurrentMonth && "opacity-20 pointer-events-none",
                                    isSelected
                                        ? "bg-emerald-500 text-white font-bold shadow shadow-emerald-500/30"
                                        : isToday
                                            ? (isDarkMode ? "border border-emerald-500/50 text-emerald-400 font-semibold" : "border border-emerald-300 text-emerald-700 font-semibold")
                                            : (isDarkMode ? "text-white/70 hover:bg-white/10" : "text-slate-700 hover:bg-slate-100")
                                )}
                            >
                                {format(day, 'd')}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const handleCreateAppointment = () => {
        setSelectedAppointment(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleViewAppointment = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setModalMode('view');
        setIsModalOpen(true);
    };

    const handleEditAppointment = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleDeleteAppointment = () => {
        if (!deleteConfirm) return;
        deleteAppointment(deleteConfirm.appointment_id, {
            onSuccess: () => {
                setDeleteConfirm(null);
            },
        });
    };

    const handleLifecycleStatusUpdate = (
        appointmentId: string,
        status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'Noshow',
    ) => {
        updateAppointmentStatus(
            {
                appointmentId,
                data: { status },
            }
        );
    };

    const handleOpenCompletionDrawer = (appointment: Appointment) => {
        setCompletionAppointment(appointment);
        setIsOutcomeDrawerOpen(true);
    };

    const handleOutcomeSave = (payload: {
        appointment_id: string;
        notes: string;
        follow_up_required: boolean;
        follow_up_date?: string | null;
        follow_up_type?: "Call" | "Visit" | "WhatsApp" | null;
    }) => {
        completeWithOutcome(payload, {
            onSuccess: () => {
                setIsOutcomeDrawerOpen(false);
                setCompletionAppointment(null);
            },
        });
    };

    const handleOpenNoShowDrawer = (appointment: Appointment) => {
        setNoShowAppointment(appointment);
        setIsNoShowDrawerOpen(true);
    };

    const handleNoShowSave = (payload: {
        appointment_id: string;
        mode: "follow_up" | "close";
        follow_up_date?: string | null;
        follow_up_type?: "Call" | "WhatsApp" | null;
    }) => {
        noShowWithAction(
            {
                appointment_id: payload.appointment_id,
                action: payload.mode,
                follow_up_date: payload.follow_up_date || null,
                follow_up_type: payload.follow_up_type || null,
            },
            {
                onSuccess: () => {
                    setIsNoShowDrawerOpen(false);
                    setNoShowAppointment(null);
                },
            },
        );
    };

    const handleSaveAppointment = () => {
        setIsModalOpen(false);
    };

    const shouldShowPrimaryPending = (status: Appointment['status']) => status === 'Pending';
    const shouldShowPrimaryConfirmed = (status: Appointment['status']) => status === 'Confirmed';

    const statusConfig: Record<string, { color: string; bg: string; border: string; accent: string; dot: string }> = {
        confirmed: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', accent: 'bg-emerald-500', dot: 'bg-emerald-500' },
        pending:   { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', accent: 'bg-amber-500', dot: 'bg-amber-500' },
        cancelled: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', accent: 'bg-red-500', dot: 'bg-red-500' },
        completed: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', accent: 'bg-blue-500', dot: 'bg-blue-500' },
        noshow:    { color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', accent: 'bg-orange-500', dot: 'bg-orange-500' },
    };

    const getStatus = (status: string) => statusConfig[status?.toLowerCase()] || statusConfig['pending'];

    const statusFilters = [
        { key: 'all', label: 'All' },
        { key: 'pending', label: 'Pending' },
        { key: 'confirmed', label: 'Confirmed' },
        { key: 'completed', label: 'Completed' },
        { key: 'cancelled', label: 'Cancelled' },
        { key: 'noshow', label: 'No Show' },
    ];

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={cn(
                        "h-20 rounded-xl animate-pulse",
                        isDarkMode ? "bg-white/5" : "bg-slate-100"
                    )} />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Top Bar: Search + Filters + Create */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-[240px]">
                        <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2", isDarkMode ? "text-white/20" : "text-slate-400")} size={16} />
                        <input
                            type="text"
                            placeholder="Search by name, phone, doctor..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className={cn(
                                "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none",
                                isDarkMode
                                    ? 'bg-white/[0.03] border-white/5 text-white placeholder:text-white/20 focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/10'
                                    : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/10'
                            )}
                        />
                    </div>
                    <div className="relative" ref={dateMenuRef}>
                        <button
                            type="button"
                            onClick={() => setIsDateMenuOpen((prev) => !prev)}
                            className={cn(
                                "px-3.5 py-2.5 rounded-xl text-sm border transition-all flex items-center gap-2 min-w-[160px] justify-between",
                                isDarkMode
                                    ? "bg-[#111615] border-white/10 text-white hover:border-emerald-500/40"
                                    : "bg-white border-slate-200 text-slate-700 hover:border-emerald-500/40",
                                isDateMenuOpen && (isDarkMode ? "border-emerald-500/40" : "border-emerald-500/40")
                            )}
                        >
                            <span className="inline-flex items-center gap-2">
                                <CalendarIcon size={15} className={isDarkMode ? "text-emerald-400/90" : "text-emerald-600"} />
                                <span className="font-medium">{dateFilterLabel}</span>
                            </span>
                            <ChevronRight size={14} className={cn("transition-transform", isDarkMode ? "text-white/30" : "text-slate-400", isDateMenuOpen && "rotate-90")} />
                        </button>

                        {isDateMenuOpen && (
                            <div
                                className={cn(
                                    "absolute right-0 mt-2 z-30 w-72 rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150",
                                    isDarkMode ? "bg-[#0f1412] border-white/10" : "bg-white border-slate-200"
                                )}
                            >
                                {/* Preset quick-select buttons */}
                                <div className={cn("p-3 border-b", isDarkMode ? "border-white/5" : "border-slate-100")}>
                                    <p className={cn("text-[9px] font-bold uppercase tracking-widest mb-2", isDarkMode ? "text-white/30" : "text-slate-400")}>Quick Select</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={handleSelectToday}
                                            className={cn(
                                                "px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all border",
                                                selectedDate === todayDate
                                                    ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                                                    : isDarkMode
                                                        ? "text-white/60 hover:text-white border-white/8 hover:bg-white/5"
                                                        : "text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50"
                                            )}
                                        >
                                            Today
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSelectTomorrow}
                                            className={cn(
                                                "px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all border",
                                                selectedDate === tomorrowDate
                                                    ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                                                    : isDarkMode
                                                        ? "text-white/60 hover:text-white border-white/8 hover:bg-white/5"
                                                        : "text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50"
                                            )}
                                        >
                                            Tomorrow
                                        </button>
                                    </div>
                                </div>

                                {/* Calendar */}
                                <div className="p-3">
                                    <p className={cn("text-[9px] font-bold uppercase tracking-widest mb-3", isDarkMode ? "text-white/30" : "text-slate-400")}>Pick a Date</p>
                                    {renderDateCalendar()}
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleCreateAppointment}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 active:scale-95"
                    >
                        <Plus size={16} />
                        <span>New Appointment</span>
                    </button>
                </div>

                {/* Status Filter Pills */}
                <div className="flex items-center gap-2 flex-wrap">
                    {statusFilters.map((f) => {
                        const count = statusCounts[f.key] || 0;
                        const isActive = statusFilter === f.key;
                        const sc = f.key !== 'all' ? getStatus(f.key) : null;
                        return (
                            <button
                                key={f.key}
                                onClick={() => {
                                    setStatusFilter(f.key);
                                    setCurrentPage(1);
                                }}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border",
                                    isActive
                                        ? f.key === 'all'
                                            ? (isDarkMode ? "bg-white/10 text-white border-white/20" : "bg-slate-900 text-white border-slate-900")
                                            : cn(sc?.bg, sc?.color, sc?.border)
                                        : isDarkMode
                                            ? "bg-transparent border-white/5 text-white/40 hover:text-white/60 hover:border-white/10"
                                            : "bg-transparent border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300"
                                )}
                            >
                                {f.key !== 'all' && <span className={cn("w-1.5 h-1.5 rounded-full", sc?.dot)} />}
                                {f.label}
                                <span className={cn(
                                    "text-[10px] font-bold min-w-[18px] text-center rounded-full px-1",
                                    isActive
                                        ? (isDarkMode ? "bg-white/10" : f.key === 'all' ? "bg-white/20" : "bg-black/5")
                                        : (isDarkMode ? "bg-white/5" : "bg-slate-100")
                                )}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Appointments Table-style List */}
            {appointments.length === 0 ? (
                <div className={cn(
                    "text-center py-16 rounded-xl border-2 border-dashed",
                    isDarkMode ? "border-white/10 text-white/40" : "border-slate-200 text-slate-400"
                )}>
                    <CalendarIcon className="mx-auto mb-3 opacity-40" size={40} />
                    <p className="text-base font-semibold">
                        {debouncedSearch.trim() && statusFilter !== 'all'
                            ? 'No results match search and filter'
                            : debouncedSearch.trim()
                                ? 'No results found'
                                : statusFilter !== 'all'
                                    ? 'No appointments match this status'
                                    : 'No appointments for selected date'}
                    </p>
                    <p className="text-xs mt-1 opacity-60">
                        {debouncedSearch.trim() && statusFilter !== 'all'
                            ? 'Try clearing the search or changing the status filter'
                            : debouncedSearch.trim()
                                ? 'Try a different search term'
                                : statusFilter !== 'all'
                                    ? 'Try changing the status filter'
                                    : 'Try another date'}
                    </p>
                </div>
            ) : (
                <div className={cn(
                    "rounded-xl border overflow-visible",
                    isDarkMode ? "border-white/5" : "border-slate-200"
                )}>
                    {/* Table Header */}
                    <div className={cn(
                        "grid grid-cols-[1fr_1fr_140px_100px_110px_220px] gap-3 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider",
                        isDarkMode ? "bg-white/[0.02] text-white/30 border-b border-white/5" : "bg-slate-50 text-slate-400 border-b border-slate-200"
                    )}>
                        <span>Patient</span>
                        <span>Doctor</span>
                        <span>Date</span>
                        <span>Time</span>
                        <span>Status</span>
                        <span className="text-right">Actions</span>
                    </div>

                    {/* Rows */}
                    {currentAppointments.map((appointment, index) => {
                        const sc = getStatus(appointment.status);
                        return (
                            <div
                                key={appointment.appointment_id}
                                className={cn(
                                    "grid grid-cols-[1fr_1fr_140px_100px_110px_220px] gap-3 px-4 py-3 items-center transition-colors group",
                                    index < currentAppointments.length - 1 && (isDarkMode ? "border-b border-white/[0.03]" : "border-b border-slate-100"),
                                    isDarkMode ? "hover:bg-white/[0.02]" : "hover:bg-slate-50/80"
                                )}
                            >
                                {/* Patient */}
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={cn(
                                        "w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold uppercase",
                                        isDarkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"
                                    )}>
                                        {appointment.patient_name?.charAt(0) || 'P'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className={cn("text-sm font-semibold truncate capitalize", isDarkMode ? "text-white" : "text-slate-900")}>
                                            {appointment.patient_name}
                                        </p>
                                        <p className={cn("text-xs truncate", isDarkMode ? "text-white/30" : "text-slate-400")}>
                                            {appointment.contact_number
                                                ? (appointment.country_code ? `${appointment.country_code} ${appointment.contact_number}` : appointment.contact_number)
                                                : 'No phone'}
                                        </p>
                                    </div>
                                </div>

                                {/* Doctor */}
                                <div className="min-w-0">
                                    {appointment.doctor?.name ? (
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Stethoscope size={13} className={cn("shrink-0", isDarkMode ? "text-emerald-400/60" : "text-emerald-500/60")} />
                                            <span className={cn("text-sm truncate capitalize", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                                {appointment.doctor.title ? `${appointment.doctor.title} ` : ''}{appointment.doctor.name}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className={cn("text-xs", isDarkMode ? "text-white/20" : "text-slate-300")}>-</span>
                                    )}
                                </div>

                                {/* Date */}
                                <div className={cn("text-sm", isDarkMode ? "text-white/50" : "text-slate-500")}>
                                    {(() => {
                                        try {
                                            if (!appointment.appointment_date) return '-';
                                            const date = parseISO(appointment.appointment_date);
                                            return isNaN(date.getTime()) ? '-' : format(date, 'dd MMM yyyy');
                                        } catch {
                                            return '-';
                                        }
                                    })()}
                                </div>

                                {/* Time */}
                                <div className={cn("text-sm font-medium", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                    {appointment.appointment_time || '-'}
                                </div>

                                {/* Status */}
                                <span className={cn(
                                    "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold uppercase w-fit whitespace-nowrap",
                                    sc.bg, sc.color
                                )}>
                                    <span className={cn("w-1.5 h-1.5 rounded-full", sc.dot)} />
                                    {appointment.status || 'Pending'}
                                </span>

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-2 flex-nowrap whitespace-nowrap">
                                    {shouldShowPrimaryPending(appointment.status) && (
                                        <>
                                            <button
                                                onClick={() => handleLifecycleStatusUpdate(appointment.appointment_id, 'Confirmed')}
                                                disabled={isStatusUpdating}
                                                className={cn(
                                                    "px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all border",
                                                    isDarkMode
                                                        ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                                                        : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                                )}
                                                title="Confirm Appointment"
                                            >
                                                Confirm
                                            </button>
                                            <button
                                                onClick={() => handleLifecycleStatusUpdate(appointment.appointment_id, 'Cancelled')}
                                                disabled={isStatusUpdating}
                                                className={cn(
                                                    "px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all border",
                                                    isDarkMode
                                                        ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                                                        : "border-red-200 text-red-700 hover:bg-red-50"
                                                )}
                                                title="Cancel Appointment"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    )}

                                    {shouldShowPrimaryConfirmed(appointment.status) && (
                                        <>
                                            <button
                                                onClick={() => handleOpenCompletionDrawer(appointment)}
                                                disabled={isStatusUpdating || isCompletingWithOutcome}
                                                className={cn(
                                                    "px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all border",
                                                    isDarkMode
                                                        ? "border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                                                        : "border-blue-200 text-blue-700 hover:bg-blue-50"
                                                )}
                                                title="Mark Completed"
                                            >
                                                Complete
                                            </button>
                                            <button
                                                onClick={() => handleOpenNoShowDrawer(appointment)}
                                                disabled={isStatusUpdating || isHandlingNoShow}
                                                className={cn(
                                                    "px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all border",
                                                    isDarkMode
                                                        ? "border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                                                        : "border-orange-200 text-orange-700 hover:bg-orange-50"
                                                )}
                                                title="Mark No Show"
                                            >
                                                No Show
                                            </button>
                                        </>
                                    )}

                                    <div onClick={(e) => e.stopPropagation()}>
                                        <ActionMenu
                                            isDarkMode={isDarkMode}
                                            isView={true}
                                            isEdit={true}
                                            isDelete={shouldShowPrimaryPending(appointment.status) || shouldShowPrimaryConfirmed(appointment.status)}
                                            onView={() => handleViewAppointment(appointment)}
                                            onEdit={() => handleEditAppointment(appointment)}
                                            onDelete={() => setDeleteConfirm(appointment)}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {appointments.length > 0 && (
                <div className="mt-2">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={Math.max(1, totalPages)}
                        onPageChange={setCurrentPage}
                        totalItems={appointments.length}
                        itemsPerPage={itemsPerPage}
                        isDarkMode={isDarkMode}
                    />
                </div>
            )}

            <AppointmentDrawer
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveAppointment}
                appointment={selectedAppointment}
                mode={modalMode}
                isDarkMode={isDarkMode}
            />

            <VisitOutcomeDrawer
                isOpen={isOutcomeDrawerOpen}
                onClose={() => {
                    setIsOutcomeDrawerOpen(false);
                    setCompletionAppointment(null);
                }}
                onSave={handleOutcomeSave}
                appointment={completionAppointment}
                isDarkMode={isDarkMode}
                isSaving={isCompletingWithOutcome || isStatusUpdating}
            />

            <NoShowDrawer
                isOpen={isNoShowDrawerOpen}
                onClose={() => {
                    setIsNoShowDrawerOpen(false);
                    setNoShowAppointment(null);
                }}
                onSave={handleNoShowSave}
                appointment={noShowAppointment}
                isDarkMode={isDarkMode}
                isSaving={isHandlingNoShow || isStatusUpdating}
            />

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                title="Delete Appointment"
                isDarkMode={isDarkMode}
                className="max-w-sm"
            >
                <div className="p-6 text-center space-y-4">
                    <div className={cn(
                        "mx-auto w-14 h-14 rounded-full flex items-center justify-center",
                        isDarkMode ? "bg-red-500/10" : "bg-red-50"
                    )}>
                        <AlertTriangle className="text-red-500" size={28} />
                    </div>
                    <p className={cn("text-sm", isDarkMode ? "text-white/70" : "text-slate-600")}>
                        Are you sure you want to delete the appointment for{' '}
                        <span className="font-semibold">{deleteConfirm?.patient_name}</span>?
                        This action cannot be undone.
                    </p>
                    <div className="flex items-center justify-center space-x-3 pt-2">
                        <button
                            onClick={() => setDeleteConfirm(null)}
                            className={cn(
                                "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border",
                                isDarkMode
                                    ? 'border-white/10 text-white/70 hover:bg-white/5 hover:text-white'
                                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            )}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteAppointment}
                            disabled={isDeleting}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
