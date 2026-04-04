"use client";

import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Eye, Edit2, Clock, Phone, Calendar as CalendarIcon, Trash2, AlertTriangle, Stethoscope, User, Hash } from 'lucide-react';
import { cn } from "@/lib/utils";
import { format, parseISO } from 'date-fns';
import { AppointmentDrawer } from './appointmentDrawer';
import { useGetAllAppointmentsQuery, useDeleteAppointmentMutation } from '@/hooks/useAppointmentQuery';
import { Modal } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';

interface BookingListProps {
    isDarkMode: boolean;
}

export interface Appointment {
    appointment_id: string;
    patient_name: string;
    country_code?: string;
    contact_number: string;
    contact_id?: string;
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
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
    const [deleteConfirm, setDeleteConfirm] = useState<Appointment | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const { data, isLoading, refetch } = useGetAllAppointmentsQuery({ search: debouncedSearch });
    const { mutate: deleteAppointment, isPending: isDeleting } = useDeleteAppointmentMutation();

    const allAppointments: Appointment[] = data?.data || [];

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
        setCurrentPage(1);
    }, [statusFilter, debouncedSearch]);

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
                refetch();
            },
        });
    };

    const handleSaveAppointment = () => {
        setIsModalOpen(false);
        refetch();
    };

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
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={cn(
                                "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none",
                                isDarkMode
                                    ? 'bg-white/[0.03] border-white/5 text-white placeholder:text-white/20 focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/10'
                                    : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/10'
                            )}
                        />
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
                                onClick={() => setStatusFilter(f.key)}
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
                        {statusFilter !== 'all' ? `No ${statusFilter} appointments` : 'No appointments found'}
                    </p>
                    <p className="text-xs mt-1 opacity-60">
                        {statusFilter !== 'all' ? 'Try a different filter' : 'Create your first appointment to get started'}
                    </p>
                </div>
            ) : (
                <div className={cn(
                    "rounded-xl border overflow-hidden",
                    isDarkMode ? "border-white/5" : "border-slate-200"
                )}>
                    {/* Table Header */}
                    <div className={cn(
                        "grid grid-cols-[1fr_1fr_140px_100px_110px_100px] gap-3 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider",
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
                                    "grid grid-cols-[1fr_1fr_140px_100px_110px_100px] gap-3 px-4 py-3 items-center transition-colors group",
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
                                        <div className="flex items-center gap-2">
                                            <p className={cn("text-sm font-semibold truncate capitalize", isDarkMode ? "text-white" : "text-slate-900")}>
                                                {appointment.patient_name}
                                            </p>
                                            {appointment.token_number && (
                                                <span className={cn(
                                                    "text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0",
                                                    isDarkMode ? "bg-white/5 text-white/30" : "bg-slate-100 text-slate-400"
                                                )}>
                                                    #{appointment.token_number}
                                                </span>
                                            )}
                                        </div>
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
                                        <span className={cn("text-xs", isDarkMode ? "text-white/20" : "text-slate-300")}>—</span>
                                    )}
                                </div>

                                {/* Date */}
                                <div className={cn("text-sm", isDarkMode ? "text-white/50" : "text-slate-500")}>
                                    {(() => {
                                        try {
                                            if (!appointment.appointment_date) return '—';
                                            const date = parseISO(appointment.appointment_date);
                                            return isNaN(date.getTime()) ? '—' : format(date, 'dd MMM yyyy');
                                        } catch {
                                            return '—';
                                        }
                                    })()}
                                </div>

                                {/* Time */}
                                <div className={cn("text-sm font-medium", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                    {appointment.appointment_time || '—'}
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
                                <div className="flex items-center justify-end gap-1">
                                    <button
                                        onClick={() => handleViewAppointment(appointment)}
                                        className={cn(
                                            "p-2 rounded-lg transition-all",
                                            isDarkMode
                                                ? 'text-white/20 hover:text-white hover:bg-white/5'
                                                : 'text-slate-300 hover:text-slate-700 hover:bg-slate-100'
                                        )}
                                        title="View"
                                    >
                                        <Eye size={15} />
                                    </button>
                                    <button
                                        onClick={() => handleEditAppointment(appointment)}
                                        className={cn(
                                            "p-2 rounded-lg transition-all",
                                            isDarkMode
                                                ? 'text-white/20 hover:text-white hover:bg-white/5'
                                                : 'text-slate-300 hover:text-slate-700 hover:bg-slate-100'
                                        )}
                                        title="Edit"
                                    >
                                        <Edit2 size={15} />
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(appointment)}
                                        className={cn(
                                            "p-2 rounded-lg transition-all",
                                            isDarkMode
                                                ? 'text-white/20 hover:text-red-400 hover:bg-red-500/10'
                                                : 'text-slate-300 hover:text-red-500 hover:bg-red-50'
                                        )}
                                        title="Delete"
                                    >
                                        <Trash2 size={15} />
                                    </button>
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
