
"use client";

import { useState, useEffect } from 'react';
import { X, User, Phone, Calendar, Clock, FileText, Loader2, UserCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { Appointment } from './booking-list';
import { format } from 'date-fns';
import { toast } from "sonner";

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (appointment: Appointment) => void;
    appointment: Appointment | null;
    mode: 'view' | 'edit' | 'create';
    isDarkMode: boolean;
}

export const AppointmentModal = ({
    isOpen,
    onClose,
    onSave,
    appointment,
    mode,
    isDarkMode
}: AppointmentModalProps) => {
    const [formData, setFormData] = useState<Partial<Appointment>>({
        patientName: '',
        contact: '',
        date: new Date(),
        time: '',
        type: 'Consultation',
        status: 'pending',
        notes: '',
        doctorId: '',
        doctorName: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [doctors, setDoctors] = useState<any[]>([]);

    // Load doctors from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('doctors');
        if (stored) {
            setDoctors(JSON.parse(stored));
        }
    }, [isOpen]);

    useEffect(() => {
        if (appointment && (mode === 'view' || mode === 'edit')) {
            setFormData(appointment);
        } else if (mode === 'create') {
            setFormData({
                patientName: '',
                contact: '',
                date: new Date(),
                time: '',
                type: 'Consultation',
                status: 'pending',
                notes: '',
                doctorId: '',
                doctorName: ''
            });
        }
    }, [appointment, mode, isOpen]);

    const handleChange = (field: keyof Appointment, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleDoctorChange = (doctorId: string) => {
        const selectedDoctor = doctors.find(d => d.id === doctorId);
        setFormData(prev => ({
            ...prev,
            doctorId,
            doctorName: selectedDoctor ? selectedDoctor.name : ''
        }));
    };

    const handleSubmit = () => {
        // Validation
        if (!formData.patientName?.trim()) {
            toast.error('Patient name is required');
            return;
        }
        if (!formData.contact?.trim()) {
            toast.error('Contact number is required');
            return;
        }
        if (!formData.time?.trim()) {
            toast.error('Time is required');
            return;
        }

        setIsSaving(true);

        // Simulate API call
        setTimeout(() => {
            onSave(formData as Appointment);
            setIsSaving(false);
            toast.success(mode === 'create' ? 'Appointment created successfully' : 'Appointment updated successfully');
        }, 500);
    };

    const isView = mode === 'view';
    const isEdit = mode === 'edit';
    const isCreate = mode === 'create';

    const dialogTitle = isCreate ? 'New Appointment' : isEdit ? 'Edit Appointment' : 'Appointment Details';
    const dialogDescription = isCreate
        ? 'Create a new appointment for a patient.'
        : isEdit
            ? 'Update appointment details.'
            : 'View appointment information.';

    const appointmentTypes = ['Consultation', 'Follow-up', 'Surgery', 'Emergency', 'Checkup'];
    const appointmentStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={dialogTitle}
            description={dialogDescription}
            isDarkMode={isDarkMode}
            footer={
                <div className="flex items-center justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-sm font-semibold transition-all border",
                            isDarkMode
                                ? `${isView ? 'bg-red-500 border-white/10 text-white hover:bg-red-600' : 'border-white/10 text-white/70 hover:bg-white/5 hover:text-white'}`
                                : `${isView ? 'border-none text-white bg-red-500 hover:bg-red-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`
                        )}
                    >
                        {isView ? 'Close' : 'Cancel'}
                    </button>
                    {!isView && (
                        <button
                            onClick={handleSubmit}
                            disabled={isSaving}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg flex items-center space-x-2",
                                isDarkMode
                                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20 disabled:opacity-50'
                                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 disabled:opacity-50'
                            )}
                        >
                            {isSaving && <Loader2 className="animate-spin" size={14} />}
                            <span>{isCreate ? 'Create Appointment' : 'Save Changes'}</span>
                        </button>
                    )}
                </div>
            }
        >
            <div className="space-y-5">
                {/* Patient Name */}
                <div>
                    <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                        Patient Name *
                    </label>
                    <div className="relative">
                        <div className={cn("absolute left-3 top-2.5", isDarkMode ? "text-white/30" : "text-slate-400")}>
                            <User size={16} />
                        </div>
                        <input
                            type="text"
                            disabled={isView}
                            value={formData.patientName || ''}
                            onChange={(e) => handleChange('patientName', e.target.value)}
                            placeholder="Enter patient name"
                            className={cn(
                                "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none",
                                isView && "opacity-60 cursor-not-allowed",
                                isDarkMode
                                    ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-2 focus:ring-emerald-500/30'
                                    : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/30'
                            )}
                        />
                    </div>
                </div>

                {/* Contact */}
                <div>
                    <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                        Contact Number *
                    </label>
                    <div className="relative">
                        <div className={cn("absolute left-3 top-2.5", isDarkMode ? "text-white/30" : "text-slate-400")}>
                            <Phone size={16} />
                        </div>
                        <input
                            type="tel"
                            disabled={isView}
                            value={formData.contact || ''}
                            onChange={(e) => handleChange('contact', e.target.value)}
                            placeholder="+91 98765 43210"
                            className={cn(
                                "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none",
                                isView && "opacity-60 cursor-not-allowed",
                                isDarkMode
                                    ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-2 focus:ring-emerald-500/30'
                                    : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/30'
                            )}
                        />
                    </div>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                            Date *
                        </label>
                        <div className="relative">
                            <div className={cn("absolute left-3 top-2.5", isDarkMode ? "text-white/30" : "text-slate-400")}>
                                <Calendar size={16} />
                            </div>
                            <input
                                type="date"
                                disabled={isView}
                                value={formData.date ? format(formData.date, 'yyyy-MM-dd') : ''}
                                onChange={(e) => handleChange('date', new Date(e.target.value))}
                                className={cn(
                                    "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none",
                                    isView && "opacity-60 cursor-not-allowed",
                                    isDarkMode
                                        ? 'bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-emerald-500/30'
                                        : 'bg-white border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500/30'
                                )}
                            />
                        </div>
                    </div>

                    <div>
                        <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                            Time *
                        </label>
                        <div className="relative">
                            <div className={cn("absolute left-3 top-2.5", isDarkMode ? "text-white/30" : "text-slate-400")}>
                                <Clock size={16} />
                            </div>
                            <input
                                type="time"
                                disabled={isView}
                                value={formData.time || ''}
                                onChange={(e) => handleChange('time', e.target.value)}
                                className={cn(
                                    "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none",
                                    isView && "opacity-60 cursor-not-allowed",
                                    isDarkMode
                                        ? 'bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-emerald-500/30'
                                        : 'bg-white border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500/30'
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* Type and Status */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                            Appointment Type
                        </label>
                        <select
                            disabled={isView}
                            value={formData.type || 'Consultation'}
                            onChange={(e) => handleChange('type', e.target.value)}
                            className={cn(
                                "w-full px-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none",
                                isView && "opacity-60 cursor-not-allowed",
                                isDarkMode
                                    ? 'bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-emerald-500/30'
                                    : 'bg-white border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500/30'
                            )}
                        >
                            {appointmentTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                            Status
                        </label>
                        <select
                            disabled={isView}
                            value={formData.status || 'pending'}
                            onChange={(e) => handleChange('status', e.target.value)}
                            className={cn(
                                "w-full px-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none capitalize",
                                isView && "opacity-60 cursor-not-allowed",
                                isDarkMode
                                    ? 'bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-emerald-500/30'
                                    : 'bg-white border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500/30'
                            )}
                        >
                            {appointmentStatuses.map(status => (
                                <option key={status} value={status} className="capitalize">{status}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Doctor Selection */}
                <div>
                    <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                        Doctor
                    </label>
                    <select
                        disabled={isView}
                        value={formData.doctorId || ''}
                        onChange={(e) => handleDoctorChange(e.target.value)}
                        className={cn(
                            "w-full px-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none",
                            isView && "opacity-60 cursor-not-allowed",
                            isDarkMode
                                ? 'bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-emerald-500/30'
                                : 'bg-white border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500/30'
                        )}
                    >
                        <option value="">Select a doctor (optional)</option>
                        {doctors.map(doctor => (
                            <option key={doctor.id} value={doctor.id}>
                                {doctor.name} - {doctor.specialization.join(', ')}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Summary/Reason */}
                <div>
                    <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                        Summary / Reason for Visit
                    </label>
                    <div className="relative">
                        <div className={cn("absolute left-3 top-3", isDarkMode ? "text-white/30" : "text-slate-400")}>
                            <FileText size={16} />
                        </div>
                        <textarea
                            rows={3}
                            disabled={isView}
                            value={formData.notes || ''}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            placeholder="Brief reason for appointment..."
                            maxLength={150}
                            className={cn(
                                "w-full pl-10 pr-4 py-3 rounded-xl text-sm border transition-all focus:outline-none resize-none custom-scrollbar",
                                isView && "opacity-60 cursor-not-allowed",
                                isDarkMode
                                    ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-2 focus:ring-emerald-500/30'
                                    : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/30'
                            )}
                        />
                        <div className={cn("text-xs mt-1 ml-1", isDarkMode ? "text-white/40" : "text-slate-400")}>
                            {(formData.notes?.length || 0)}/150 characters
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
