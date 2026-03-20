"use client";

import { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit2, Clock, Phone, Calendar as CalendarIcon, FileText, UserCircle, Trash2, AlertTriangle, Stethoscope } from 'lucide-react';
import { cn } from "@/lib/utils";
import { format, parseISO } from 'date-fns';
import { AppointmentDrawer } from './appointmentDrawer';
import { useGetAllAppointmentsQuery, useDeleteAppointmentMutation } from '@/hooks/useAppointmentQuery';
import { Modal } from '@/components/ui/modal';
import { GlassCard } from '@/components/ui/glassCard';

interface BookingListProps {
    isDarkMode: boolean;
}

export interface Appointment {
    appointment_id: string;
    patient_name: string;
    country_code?: string;
    contact_number: string;
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

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const { data, isLoading, refetch } = useGetAllAppointmentsQuery({ search: debouncedSearch });
    const { mutate: deleteAppointment, isPending: isDeleting } = useDeleteAppointmentMutation();

    const appointments: Appointment[] = data?.data || [];

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

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return 'text-emerald-500 bg-emerald-500/10';
            case 'pending': return 'text-amber-500 bg-amber-500/10';
            case 'cancelled': return 'text-red-500 bg-red-500/10';
            case 'completed': return 'text-blue-500 bg-blue-500/10';
            case 'noshow': return 'text-orange-500 bg-orange-500/10';
            default: return 'text-slate-500 bg-slate-500/10';
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={cn("h-32 rounded-xl", isDarkMode ? "bg-white/5" : "bg-slate-100")} />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search and Create */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 transition-colors", isDarkMode ? "text-white/20" : "text-slate-400")} size={18} />
                    <input
                        type="text"
                        placeholder="Search appointments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(
                            "w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm border transition-all focus:outline-none",
                            isDarkMode
                                ? 'bg-white/[0.03] border-white/5 text-white placeholder:text-white/20 focus:bg-white/[0.05] focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/10'
                                : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/10'
                        )}
                    />
                </div>
                <button
                    onClick={handleCreateAppointment}
                    className={cn(
                        "px-8 py-3.5 rounded-2xl text-sm font-bold text-white transition-all shadow-xl flex items-center space-x-2 group active:scale-95",
                        isDarkMode
                            ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20 hover:shadow-emerald-500/40'
                            : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                    )}
                >
                    <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span>New Appointment</span>
                </button>
            </div>

            {/* Appointments List */}
            <div className="space-y-4">
                {appointments.length === 0 ? (
                    <div className={cn(
                        "text-center py-12 rounded-xl border-2 border-dashed",
                        isDarkMode ? "border-white/10 text-white/40" : "border-slate-200 text-slate-400"
                    )}>
                        <CalendarIcon className="mx-auto mb-3" size={48} />
                        <p className="text-lg font-medium">No appointments found</p>
                        <p className="text-sm mt-1">Create your first appointment to get started</p>
                    </div>
                ) : (
                    appointments.map((appointment) => (
                        <GlassCard
                            key={appointment.appointment_id}
                            isDarkMode={isDarkMode}
                            className={cn(
                                "p-6 border transition-all duration-500 hover:translate-x-1 group",
                                isDarkMode
                                    ? 'hover:border-emerald-500/30'
                                    : 'hover:border-emerald-500/20 hover:shadow-2xl hover:shadow-emerald-500/5'
                            )}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <h3 className={cn("text-xl font-bold tracking-tight capitalize", isDarkMode ? "text-white" : "text-slate-900")}>
                                                {appointment.patient_name}
                                            </h3>
                                            <span className={cn("px-4 py-1.5 rounded-xl text-[0.7rem] font-black uppercase letter-spacing-wider", getStatusColor(appointment.status))}>
                                                {appointment.status.toLowerCase()}
                                            </span>
                                            {appointment.token_number && (
                                                <span className={cn("px-3 py-1.5 rounded-xl text-[0.7rem] font-bold uppercase", isDarkMode ? "bg-white/5 text-white/40" : "bg-slate-100 text-slate-500")}>
                                                    T-{appointment.token_number}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {(appointment.doctor?.name || appointment.doctor_id) && (
                                            <div className="flex items-center space-x-2.5">
                                                <div className={cn("p-2 rounded-lg", isDarkMode ? "bg-emerald-500/10" : "bg-emerald-50")}>
                                                    <Stethoscope className={cn(isDarkMode ? "text-emerald-400" : "text-emerald-600")} size={14} />
                                                </div>
                                                <span className={cn("text-sm font-semibold capitalize", isDarkMode ? "text-emerald-400" : "text-emerald-600")}>
                                                    {appointment.doctor ? `${appointment.doctor.title || ''} ${appointment.doctor.name}`.trim() : appointment.doctor_id}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center space-x-2.5">
                                            <div className={cn("p-2 rounded-lg", isDarkMode ? "bg-white/5" : "bg-slate-100")}>
                                                <Phone className={cn(isDarkMode ? "text-white/40" : "text-slate-400")} size={14} />
                                            </div>
                                            <span className={cn("text-sm font-medium", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                                {appointment.contact_number ? (appointment.country_code ? `${appointment.country_code}${appointment.contact_number}` : `+${appointment.contact_number}`) : '-'}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2.5">
                                            <div className={cn("p-2 rounded-lg", isDarkMode ? "bg-white/5" : "bg-slate-100")}>
                                                <CalendarIcon className={cn(isDarkMode ? "text-white/40" : "text-slate-400")} size={14} />
                                            </div>
                                            <span className={cn("text-sm font-medium", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                                {(() => {
                                                    try {
                                                        if (!appointment.appointment_date) return '-';
                                                        const date = parseISO(appointment.appointment_date);
                                                        return isNaN(date.getTime()) ? 'Invalid Date' : format(date, 'dd MMM yyyy');
                                                    } catch (e) {
                                                        return 'Invalid Date';
                                                    }
                                                })()}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2.5">
                                            <div className={cn("p-2 rounded-lg", isDarkMode ? "bg-white/5" : "bg-slate-100")}>
                                                <Clock className={cn(isDarkMode ? "text-white/40" : "text-slate-400")} size={14} />
                                            </div>
                                            <span className={cn("text-sm font-medium", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                                {appointment.appointment_time}
                                            </span>
                                        </div>
                                    </div>

                                    {appointment.notes && (
                                        <div
                                            className={cn(
                                                "mt-4 pt-4 border-t border-dashed",
                                                isDarkMode ? "border-white/5" : "border-slate-100"
                                            )}>
                                            <p className={cn("text-sm italic leading-relaxed", isDarkMode ? "text-white/40" : "text-slate-500")}>
                                                {appointment.notes.length > 120 ? appointment.notes.substring(0, 120) + '...' : appointment.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col items-center space-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button
                                        onClick={() => handleViewAppointment(appointment)}
                                        className={cn(
                                            "p-3 rounded-xl transition-all cursor-pointer hover:scale-110 active:scale-90",
                                            isDarkMode
                                                ? 'hover:bg-white/10 text-white/40 hover:text-white'
                                                : 'hover:bg-slate-100 text-slate-400 hover:text-slate-900'
                                        )}
                                        title="View"
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleEditAppointment(appointment)}
                                        className={cn(
                                            "p-3 rounded-xl transition-all cursor-pointer hover:scale-110 active:scale-90",
                                            isDarkMode
                                                ? 'hover:bg-white/10 text-white/40 hover:text-white'
                                                : 'hover:bg-slate-100 text-slate-400 hover:text-slate-900'
                                        )}
                                        title="Edit"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(appointment)}
                                        className={cn(
                                            "p-3 rounded-xl transition-all cursor-pointer hover:scale-110 active:scale-90",
                                            isDarkMode
                                                ? 'hover:bg-red-500/10 text-red-500/40 hover:text-red-400'
                                                : 'hover:bg-red-50 text-red-400 hover:text-red-600'
                                        )}
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </GlassCard>
                    ))
                )}
            </div>

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
