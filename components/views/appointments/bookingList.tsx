
"use client";

import { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit2, X, Clock, User, Phone, Calendar as CalendarIcon, FileText, UserCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { AppointmentModal } from './appointmentModal';

interface BookingListProps {
    isDarkMode: boolean;
}

export interface Appointment {
    id: string;
    patient_name: string;
    contact_number: string;
    country_code?: string;
    age?: number;
    appointment_date: string;
    appointment_time: string;
    status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
    notes?: string;
    type?: string;
    date?: Date;
    doctor_id?: string;
    doctor_name?: string;
    token_number?: number;
  
}

export const BookingList = ({ isDarkMode }: BookingListProps) => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');

    // Load appointments from localStorage
    useEffect(() => {
        const loadAppointments = () => {
            const stored = localStorage.getItem('appointments');
            if (stored) {
                const parsed = JSON.parse(stored);
                const appointmentsWithDates = parsed.map((apt: any) => ({
                    ...apt,
                    date: new Date(apt.date)
                }));
                setAppointments(appointmentsWithDates);
                setFilteredAppointments(appointmentsWithDates);
            } else {
                // Mock data for initial display
                const mockAppointments: Appointment[] = [
                    {
                        id: '1',
                        patient_name: 'Sarah Johnson',
                        contact_number: '+1 234-567-8900',
                        age: 34,
                        appointment_date: '2024-03-20',
                        appointment_time: '10:00 AM',
                        status: 'Confirmed',
                        notes: 'Regular eye checkup - Patient experiencing mild blurred vision',
                        doctor_id: 'dr_001',
                        doctor_name: 'Dr. Emily Chen'
                    },
                    {
                        id: '2',
                        patient_name: 'Michael Brown',
                        contact_number: '+1 234-567-8901',
                        age: 45,
                        appointment_date: '2024-03-20',
                        appointment_time: '11:30 AM',
                        status: 'Pending',
                        notes: 'Post-surgery follow-up appointment to check healing progress',
                        doctor_id: 'dr_002',
                        doctor_name: 'Dr. James Wilson'
                    },
                    {
                        id: '3',
                        patient_name: 'Emma Davis',
                        contact_number: '+1 234-567-8902',
                        age: 28,
                        appointment_date: '2024-03-20',
                        appointment_time: '02:00 PM',
                        status: 'Completed',
                        notes: 'Cataract surgery completed successfully',
                        doctor_id: 'dr_001',
                        doctor_name: 'Dr. Emily Chen'
                    }
                ];
                setAppointments(mockAppointments);
                setFilteredAppointments(mockAppointments);
                localStorage.setItem('appointments', JSON.stringify(mockAppointments));
            }
            setIsLoading(false);
        };

        loadAppointments();
    }, []);

    // Filter appointments based on search query
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredAppointments(appointments);
        } else {
            const filtered = appointments.filter(appointment => {
                const matchesSearch =
                    appointment.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    appointment.contact_number.includes(searchQuery) ||
                    (appointment.doctor_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                    (appointment.notes?.toLowerCase() || '').includes(searchQuery.toLowerCase());
                return matchesSearch;
            });
            setFilteredAppointments(filtered);
        }
    }, [searchQuery, appointments]);

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

    const handleCancelAppointment = (id: string) => {
        const updated = appointments.map(apt =>
            apt.id === id ? { ...apt, status: 'Cancelled' as const } : apt
        );
        setAppointments(updated);
        localStorage.setItem('appointments', JSON.stringify(updated));
    };

    const handleSaveAppointment = () => {
        setIsModalOpen(false);
        // Refetch appointments if using API, or reload from storage
        const stored = localStorage.getItem('appointments');
        if (stored) {
            setAppointments(JSON.parse(stored));
        }
    };

    const getStatusColor = (status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed') => {
        switch (status) {
            case 'Confirmed':
                return isDarkMode ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'Pending':
                return isDarkMode ? 'bg-amber-500/20 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200';
            case 'Cancelled':
                return isDarkMode ? 'bg-red-500/20 text-red-400 border-red-500/20' : 'bg-red-50 text-red-700 border-red-200';
            case 'Completed':
                return isDarkMode ? 'bg-blue-500/20 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-700 border-blue-200';
            default:
                return isDarkMode ? 'bg-slate-500/20 text-slate-400 border-slate-500/20' : 'bg-slate-50 text-slate-700 border-slate-200';
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
                    <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2", isDarkMode ? "text-white/30" : "text-slate-400")} size={18} />
                    <input
                        type="text"
                        placeholder="Search appointments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(
                            "w-full pl-10 pr-4 py-3 rounded-xl text-sm border transition-all focus:outline-none",
                            isDarkMode
                                ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-2 focus:ring-emerald-500/30'
                                : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/30'
                        )}
                    />
                </div>
                <button
                    onClick={handleCreateAppointment}
                    className={cn(
                        "px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all shadow-lg flex items-center space-x-2",
                        isDarkMode
                            ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
                            : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                    )}
                >
                    <Plus size={18} />
                    <span>New Appointment</span>
                </button>
            </div>

            {/* Appointments List */}
            <div className="space-y-4">
                {filteredAppointments.length === 0 ? (
                    <div className={cn(
                        "text-center py-12 rounded-xl border-2 border-dashed",
                        isDarkMode ? "border-white/10 text-white/40" : "border-slate-200 text-slate-400"
                    )}>
                        <CalendarIcon className="mx-auto mb-3" size={48} />
                        <p className="text-lg font-medium">No appointments found</p>
                        <p className="text-sm mt-1">Create your first appointment to get started</p>
                    </div>
                ) : (
                    filteredAppointments.map((appointment) => (
                        <div
                            key={appointment.id}
                            className={cn(
                                "p-5 rounded-xl border transition-all hover:scale-[1.01]",
                                isDarkMode
                                    ? 'bg-white/5 border-white/10 hover:bg-white/[0.07]'
                                    : 'bg-white border-slate-200 hover:shadow-md'
                            )}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <h3 className={cn("text-lg font-semibold", isDarkMode ? "text-white" : "text-slate-900")}>
                                                {appointment.patient_name}
                                            </h3>
                                            <span className={cn("px-3 py-1 rounded-full text-xs font-medium capitalize", getStatusColor(appointment.status))}>
                                                {appointment.status.toLowerCase()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {appointment.doctor_name && (
                                            <div className="flex items-center gap-2">
                                                <User size={14} className={cn(isDarkMode ? 'text-white/40' : 'text-slate-400')} />
                                                <span className={isDarkMode ? 'text-white/70' : 'text-slate-600'}>
                                                    {appointment.doctor_name}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center space-x-2">
                                            <Phone className={cn(isDarkMode ? "text-white/40" : "text-slate-400")} size={16} />
                                            <span className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                                {appointment.contact_number}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <CalendarIcon className={cn(isDarkMode ? "text-white/40" : "text-slate-400")} size={16} />
                                            <span className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                                {format(new Date(appointment.appointment_date), 'MMM dd, yyyy')}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Clock className={cn(isDarkMode ? "text-white/40" : "text-slate-400")} size={16} />
                                            <span className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                                {appointment.appointment_time}
                                            </span>
                                        </div>
                                        {/* The original code had 'type' here, but the new mock data and interface don't have it.
                                            Keeping it commented out or removing it for now to match the new data structure.
                                        <div className="flex items-center space-x-2">
                                            <FileText className={cn(isDarkMode ? "text-white/40" : "text-slate-400")} size={16} />
                                            <span className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                                {appointment.type}
                                            </span>
                                        </div>
                                        */}
                                    </div>

                                    {appointment.notes && (
                                        <div
                                            className={cn(
                                                "mt-3 pt-3 border-t",
                                                isDarkMode ? "border-white/10" : "border-slate-200"
                                            )}>
                                            <p className={cn("text-sm", isDarkMode ? "text-white/70" : "text-slate-600")}>
                                                <span className="font-semibold">Summary: </span>
                                                {appointment.notes.length > 80 ? appointment.notes.substring(0, 80) + '...' : appointment.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleViewAppointment(appointment)}
                                        className={cn(
                                            "p-2 rounded-lg transition-all",
                                            isDarkMode
                                                ? 'hover:bg-white/10 text-white/60 hover:text-white'
                                                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                                        )}
                                        title="View"
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleEditAppointment(appointment)}
                                        className={cn(
                                            "p-2 rounded-lg transition-all",
                                            isDarkMode
                                                ? 'hover:bg-white/10 text-white/60 hover:text-white'
                                                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                                        )}
                                        title="Edit"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    {appointment.status !== 'Cancelled' && appointment.status !== 'Completed' && (
                                        <button
                                            onClick={() => handleCancelAppointment(appointment.id)}
                                            className={cn(
                                                "p-2 rounded-lg transition-all",
                                                isDarkMode
                                                    ? 'hover:bg-red-500/10 text-red-400 hover:text-red-300'
                                                    : 'hover:bg-red-50 text-red-600 hover:text-red-700'
                                            )}
                                            title="Cancel"
                                        >
                                            <X size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <AppointmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveAppointment}
                appointment={selectedAppointment}
                mode={modalMode}
                isDarkMode={isDarkMode}
            />
        </div>
    );
};
