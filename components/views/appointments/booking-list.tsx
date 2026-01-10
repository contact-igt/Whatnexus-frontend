
"use client";

import { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit2, X, Clock, User, Phone, Calendar as CalendarIcon, FileText, UserCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { AppointmentModal } from './appointment-modal';
import { format } from 'date-fns';

interface BookingListProps {
    isDarkMode: boolean;
}

export interface Appointment {
    id: string;
    patientName: string;
    contact: string;
    date: Date;
    time: string;
    type: string;
    status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
    notes?: string;
    doctorId?: string;
    doctorName?: string;
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
                        patientName: 'John Doe',
                        contact: '+91 98765 43210',
                        date: new Date(2026, 0, 15, 10, 0),
                        time: '10:00 AM',
                        type: 'Consultation',
                        status: 'confirmed',
                        notes: 'Regular checkup'
                    },
                    {
                        id: '2',
                        patientName: 'Jane Smith',
                        contact: '+91 98765 43211',
                        date: new Date(2026, 0, 15, 14, 30),
                        time: '02:30 PM',
                        type: 'Follow-up',
                        status: 'pending',
                        notes: 'Post-surgery follow-up'
                    },
                    {
                        id: '3',
                        patientName: 'Robert Johnson',
                        contact: '+91 98765 43212',
                        date: new Date(2026, 0, 12, 11, 0),
                        time: '11:00 AM',
                        type: 'Surgery',
                        status: 'completed',
                        notes: 'Cataract surgery'
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
            const filtered = appointments.filter(apt =>
                apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                apt.contact.includes(searchQuery) ||
                apt.type.toLowerCase().includes(searchQuery.toLowerCase())
            );
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
            apt.id === id ? { ...apt, status: 'cancelled' as const } : apt
        );
        setAppointments(updated);
        localStorage.setItem('appointments', JSON.stringify(updated));
    };

    const handleSaveAppointment = (appointment: Appointment) => {
        if (modalMode === 'create') {
            const newAppointment = { ...appointment, id: Date.now().toString() };
            const updated = [...appointments, newAppointment];
            setAppointments(updated);
            localStorage.setItem('appointments', JSON.stringify(updated));
        } else if (modalMode === 'edit') {
            const updated = appointments.map(apt =>
                apt.id === appointment.id ? appointment : apt
            );
            setAppointments(updated);
            localStorage.setItem('appointments', JSON.stringify(updated));
        }
        setIsModalOpen(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'text-emerald-500 bg-emerald-500/10';
            case 'pending': return 'text-amber-500 bg-amber-500/10';
            case 'cancelled': return 'text-red-500 bg-red-500/10';
            case 'completed': return 'text-blue-500 bg-blue-500/10';
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
                                                {appointment.patientName}
                                            </h3>
                                            <span className={cn("px-3 py-1 rounded-full text-xs font-medium capitalize", getStatusColor(appointment.status))}>
                                                {appointment.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {appointment.doctorName && (
                                            <div className="flex items-center space-x-2">
                                                <UserCircle className={cn(isDarkMode ? "text-emerald-400" : "text-emerald-600")} size={16} />
                                                <span className={cn("text-sm font-medium", isDarkMode ? "text-emerald-400" : "text-emerald-600")}>
                                                    {appointment.doctorName}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center space-x-2">
                                            <Phone className={cn(isDarkMode ? "text-white/40" : "text-slate-400")} size={16} />
                                            <span className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                                {appointment.contact}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <CalendarIcon className={cn(isDarkMode ? "text-white/40" : "text-slate-400")} size={16} />
                                            <span className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                                {format(appointment.date, 'MMM dd, yyyy')}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Clock className={cn(isDarkMode ? "text-white/40" : "text-slate-400")} size={16} />
                                            <span className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                                {appointment.time}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <FileText className={cn(isDarkMode ? "text-white/40" : "text-slate-400")} size={16} />
                                            <span className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                                {appointment.type}
                                            </span>
                                        </div>
                                    </div>

                                    {appointment.notes && (
                                        <p className={cn("text-sm italic", isDarkMode ? "text-white/50" : "text-slate-500")}>
                                            "{appointment.notes.length > 80 ? appointment.notes.substring(0, 80) + '...' : appointment.notes}"
                                        </p>
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
                                    {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
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
