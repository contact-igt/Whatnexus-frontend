
"use client";

import { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit2, Trash2, UserCircle, Clock, Briefcase, Phone, Mail, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { DoctorModal } from './doctor-modal';
import { toast } from "sonner";

interface DoctorManagementProps {
    isDarkMode: boolean;
}

export interface Doctor {
    id: string;
    name: string;
    specialization: string[];
    contact: string;
    email: string;
    currentStatus: 'available' | 'busy' | 'off-duty';
    availability: {
        [key: string]: {
            enabled: boolean;
            slots: { start: string; end: string }[];
        };
    };
    consultationDuration: number;
    appointmentCount?: number;
    photo?: string;
}

export const DoctorManagement = ({ isDarkMode }: DoctorManagementProps) => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
    const [filterSpecialization, setFilterSpecialization] = useState<string>('all');

    // Load doctors from localStorage
    useEffect(() => {
        const loadDoctors = () => {
            const stored = localStorage.getItem('doctors');
            if (stored) {
                const parsed = JSON.parse(stored);
                setDoctors(parsed);
                setFilteredDoctors(parsed);
            } else {
                // Mock data for initial display
                const mockDoctors: Doctor[] = [
                    {
                        id: '1',
                        name: 'Dr. Sarah Johnson',
                        specialization: ['Ophthalmology', 'Cataract Surgery'],
                        contact: '+91 98765 43210',
                        email: 'sarah.johnson@hospital.com',
                        currentStatus: 'available',
                        consultationDuration: 30,
                        appointmentCount: 12,
                        availability: {
                            monday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
                            tuesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
                            wednesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
                            thursday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
                            friday: { enabled: true, slots: [{ start: '09:00', end: '13:00' }] },
                            saturday: { enabled: false, slots: [] },
                            sunday: { enabled: false, slots: [] }
                        }
                    },
                    {
                        id: '2',
                        name: 'Dr. Michael Chen',
                        specialization: ['Optometry', 'Pediatric Eye Care'],
                        contact: '+91 98765 43211',
                        email: 'michael.chen@hospital.com',
                        currentStatus: 'busy',
                        consultationDuration: 30,
                        appointmentCount: 8,
                        availability: {
                            monday: { enabled: true, slots: [{ start: '10:00', end: '18:00' }] },
                            tuesday: { enabled: true, slots: [{ start: '10:00', end: '18:00' }] },
                            wednesday: { enabled: false, slots: [] },
                            thursday: { enabled: true, slots: [{ start: '10:00', end: '18:00' }] },
                            friday: { enabled: true, slots: [{ start: '10:00', end: '18:00' }] },
                            saturday: { enabled: true, slots: [{ start: '09:00', end: '13:00' }] },
                            sunday: { enabled: false, slots: [] }
                        }
                    },
                    {
                        id: '3',
                        name: 'Dr. Emily Rodriguez',
                        specialization: ['Retina Specialist', 'Glaucoma Treatment'],
                        contact: '+91 98765 43212',
                        email: 'emily.rodriguez@hospital.com',
                        currentStatus: 'off-duty',
                        consultationDuration: 45,
                        appointmentCount: 5,
                        availability: {
                            monday: { enabled: true, slots: [{ start: '14:00', end: '20:00' }] },
                            tuesday: { enabled: true, slots: [{ start: '14:00', end: '20:00' }] },
                            wednesday: { enabled: true, slots: [{ start: '14:00', end: '20:00' }] },
                            thursday: { enabled: false, slots: [] },
                            friday: { enabled: true, slots: [{ start: '14:00', end: '20:00' }] },
                            saturday: { enabled: false, slots: [] },
                            sunday: { enabled: false, slots: [] }
                        }
                    }
                ];
                setDoctors(mockDoctors);
                setFilteredDoctors(mockDoctors);
                localStorage.setItem('doctors', JSON.stringify(mockDoctors));
            }
            setIsLoading(false);
        };

        loadDoctors();
    }, []);

    // Filter doctors based on search query and specialization
    useEffect(() => {
        let filtered = doctors;

        if (searchQuery.trim() !== '') {
            filtered = filtered.filter(doc =>
                doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.specialization.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase())) ||
                doc.contact.includes(searchQuery) ||
                doc.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (filterSpecialization !== 'all') {
            filtered = filtered.filter(doc =>
                doc.specialization.includes(filterSpecialization)
            );
        }

        setFilteredDoctors(filtered);
    }, [searchQuery, filterSpecialization, doctors]);

    const handleCreateDoctor = () => {
        setSelectedDoctor(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleViewDoctor = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setModalMode('view');
        setIsModalOpen(true);
    };

    const handleEditDoctor = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleDeleteDoctor = (id: string) => {
        if (confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) {
            const updated = doctors.filter(doc => doc.id !== id);
            setDoctors(updated);
            localStorage.setItem('doctors', JSON.stringify(updated));
            toast.success('Doctor deleted successfully');
        }
    };

    const handleSaveDoctor = (doctor: Doctor) => {
        if (modalMode === 'create') {
            const newDoctor = { ...doctor, id: Date.now().toString(), appointmentCount: 0 };
            const updated = [...doctors, newDoctor];
            setDoctors(updated);
            localStorage.setItem('doctors', JSON.stringify(updated));
            toast.success('Doctor added successfully');
        } else if (modalMode === 'edit') {
            const updated = doctors.map(doc =>
                doc.id === doctor.id ? doctor : doc
            );
            setDoctors(updated);
            localStorage.setItem('doctors', JSON.stringify(updated));
            toast.success('Doctor updated successfully');
        }
        setIsModalOpen(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available': return 'text-emerald-500 bg-emerald-500/10';
            case 'busy': return 'text-amber-500 bg-amber-500/10';
            case 'off-duty': return 'text-slate-500 bg-slate-500/10';
            default: return 'text-slate-500 bg-slate-500/10';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'available': return <CheckCircle size={14} />;
            case 'busy': return <MinusCircle size={14} />;
            case 'off-duty': return <XCircle size={14} />;
            default: return <XCircle size={14} />;
        }
    };

    const getAvailableDays = (availability: Doctor['availability']) => {
        return Object.entries(availability)
            .filter(([_, data]) => data.enabled)
            .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1, 3))
            .join(', ');
    };

    const allSpecializations = Array.from(new Set(doctors.flatMap(doc => doc.specialization)));

    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map((i) => (
                    <div key={i} className={cn("h-48 rounded-xl", isDarkMode ? "bg-white/5" : "bg-slate-100")} />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search, Filter and Create */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4 flex-1 flex-wrap">
                    <div className="relative flex-1 min-w-[250px]">
                        <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2", isDarkMode ? "text-white/30" : "text-slate-400")} size={18} />
                        <input
                            type="text"
                            placeholder="Search doctors..."
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
                    <select
                        value={filterSpecialization}
                        onChange={(e) => setFilterSpecialization(e.target.value)}
                        className={cn(
                            "px-4 py-3 rounded-xl text-sm border transition-all focus:outline-none min-w-[200px]",
                            isDarkMode
                                ? 'bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-emerald-500/30 [&>option]:bg-slate-800 [&>option]:text-white'
                                : 'bg-white border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500/30'
                        )}
                    >
                        <option value="all">All Specializations</option>
                        {allSpecializations.map(spec => (
                            <option key={spec} value={spec}>{spec}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={handleCreateDoctor}
                    className={cn(
                        "px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all shadow-lg flex items-center space-x-2 whitespace-nowrap",
                        isDarkMode
                            ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
                            : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                    )}
                >
                    <Plus size={18} />
                    <span>Add Doctor</span>
                </button>
            </div>

            {/* Doctors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDoctors.length === 0 ? (
                    <div className={cn(
                        "col-span-full text-center py-12 rounded-xl border-2 border-dashed",
                        isDarkMode ? "border-white/10 text-white/40" : "border-slate-200 text-slate-400"
                    )}>
                        <UserCircle className="mx-auto mb-3" size={48} />
                        <p className="text-lg font-medium">No doctors found</p>
                        <p className="text-sm mt-1">Add your first doctor to get started</p>
                    </div>
                ) : (
                    filteredDoctors.map((doctor) => (
                        <div
                            key={doctor.id}
                            className={cn(
                                "p-6 rounded-xl border transition-all hover:scale-[1.02]",
                                isDarkMode
                                    ? 'bg-white/5 border-white/10 hover:bg-white/[0.07]'
                                    : 'bg-white border-slate-200 hover:shadow-lg'
                            )}
                        >
                            <div className="space-y-4">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold",
                                            isDarkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"
                                        )}>
                                            {doctor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </div>
                                        <div>
                                            <h3 className={cn("font-semibold text-lg", isDarkMode ? "text-white" : "text-slate-900")}>
                                                {doctor.name}
                                            </h3>
                                            <div className={cn("flex items-center rounded-full p-1 px-3 w-fit space-x-1.5 text-xs mt-1", getStatusColor(doctor.currentStatus))}>
                                                {getStatusIcon(doctor.currentStatus)}
                                                <span className="capitalize font-medium">{doctor.currentStatus.replace('-', ' ')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Specializations */}
                                <div className="flex flex-wrap gap-2">
                                    {doctor.specialization.map((spec, idx) => (
                                        <span
                                            key={idx}
                                            className={cn(
                                                "px-3 py-1 rounded-full text-xs font-medium",
                                                isDarkMode
                                                    ? "bg-blue-500/10 text-blue-400"
                                                    : "bg-blue-50 text-blue-700"
                                            )}
                                        >
                                            {spec}
                                        </span>
                                    ))}
                                </div>

                                {/* Contact Info */}
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Phone className={cn(isDarkMode ? "text-white/40" : "text-slate-400")} size={14} />
                                        <span className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                            {doctor.contact}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Mail className={cn(isDarkMode ? "text-white/40" : "text-slate-400")} size={14} />
                                        <span className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                            {doctor.email}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Clock className={cn(isDarkMode ? "text-white/40" : "text-slate-400")} size={14} />
                                        <span className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                            {getAvailableDays(doctor.availability)}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Briefcase className={cn(isDarkMode ? "text-white/40" : "text-slate-400")} size={14} />
                                        <span className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                            {doctor.appointmentCount || 0} appointments
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end space-x-2 pt-2 border-t" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                                    <button
                                        onClick={() => handleViewDoctor(doctor)}
                                        className={cn(
                                            "p-2 rounded-lg transition-all",
                                            isDarkMode
                                                ? 'hover:bg-white/10 text-white/60 hover:text-white'
                                                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                                        )}
                                        title="View"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleEditDoctor(doctor)}
                                        className={cn(
                                            "p-2 rounded-lg transition-all",
                                            isDarkMode
                                                ? 'hover:bg-white/10 text-white/60 hover:text-white'
                                                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                                        )}
                                        title="Edit"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteDoctor(doctor.id)}
                                        className={cn(
                                            "p-2 rounded-lg transition-all",
                                            isDarkMode
                                                ? 'hover:bg-red-500/10 text-red-400 hover:text-red-300'
                                                : 'hover:bg-red-50 text-red-600 hover:text-red-700'
                                        )}
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <DoctorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveDoctor}
                doctor={selectedDoctor}
                mode={modalMode}
                isDarkMode={isDarkMode}
            />
        </div>
    );
};
