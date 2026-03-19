
"use client";

import { useState, useEffect } from 'react';
import { User, Phone, Calendar, Clock, FileText, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Appointment } from './bookingList';
import { toast } from "sonner";
import { useCreateAppointmentMutation, useUpdateAppointmentMutation } from '@/hooks/useAppointmentQuery';

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
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
    const [formData, setFormData] = useState({
        patient_name: '',
        country_code: '+91',
        contact_number: '',
        age: '',
        appointment_date: '',
        appointment_time: '',
        status: 'Pending' as string,
        notes: '',
        doctor_id: '',
        type: 'General',
    });

    const createMutation = useCreateAppointmentMutation();
    const updateMutation = useUpdateAppointmentMutation();

    useEffect(() => {
        if (appointment && (mode === 'view' || mode === 'edit')) {
            setFormData({
<<<<<<< HEAD
                patient_name: appointment?.patient_name || '',
                country_code: appointment?.country_code || (appointment as any).country_code || '+91',
                contact_number: appointment?.contact_number || (appointment as any).contact_number || '',
                age: appointment?.age ? String(appointment.age) : '',
                appointment_date: appointment?.appointment_date || '',
                appointment_time: appointment?.appointment_time || '',
                status: appointment?.status || 'Pending',
=======
                patient_name: appointment.patient_name || appointment.patientName || '',
                country_code: appointment.country_code || '+91',
                contact_number: appointment.contact_number || appointment.contact || '',
                age: appointment.age ? String(appointment.age) : '',
                appointment_date: appointment.appointment_date || '',
                appointment_time: appointment.appointment_time || appointment.time || '',
                status: appointment.status || 'Pending',
>>>>>>> a0b6ad2 (frontend ui)
                notes: appointment.notes || '',
                doctor_id: appointment.doctor_id || appointment.doctorId || '',
                type: appointment.type || 'General',
            });
        } else if (mode === 'create') {
            setFormData({
                patient_name: '',
                country_code: '+91',
                contact_number: '',
                age: '',
                appointment_date: '',
                appointment_time: '',
                status: 'Pending',
                notes: '',
                doctor_id: '',
                type: 'General',
            });
        }
    }, [appointment, mode, isOpen]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.patient_name.trim()) {
            toast.error('Patient name is required');
            return;
        }
        if (!formData.contact_number.trim() || formData.contact_number.length !== 10) {
            toast.error('Contact number must be exactly 10 digits');
            return;
        }
        if (!formData.appointment_date) {
            toast.error('Date is required');
            return;
        }
        if (!formData.appointment_time) {
            toast.error('Time is required');
            return;
        }
        if (!formData.age.trim() || isNaN(Number(formData.age)) || Number(formData.age) <= 0) {
            toast.error('Valid age is required');
            return;
        }

        if (mode === 'create') {
            createMutation.mutate({
                patient_name: formData.patient_name,
                country_code: formData.country_code,
                contact_number: formData.contact_number,
                age: Number(formData.age),
                appointment_date: formData.appointment_date,
                appointment_time: formData.appointment_time,
                doctor_id: formData.doctor_id || undefined,
                notes: formData.notes || undefined,
                status: formData.status,
                type: formData.type,
            }, { onSuccess: () => onSave() });
        } else if (mode === 'edit' && appointment) {
            updateMutation.mutate({
<<<<<<< HEAD
                appointmentId: appointment.appointment_id || appointment.id,
=======
                appointmentId: appointment.appointment_id || (appointment as any).id,
>>>>>>> a0b6ad2 (frontend ui)
                data: {
                    patient_name: formData.patient_name,
                    country_code: formData.country_code,
                    contact_number: formData.contact_number,
                    age: Number(formData.age),
                    appointment_date: formData.appointment_date,
                    appointment_time: formData.appointment_time,
                    doctor_id: formData.doctor_id || undefined,
                    notes: formData.notes || undefined,
                    status: formData.status,
                    type: formData.type,
                },
            }, { onSuccess: () => onSave() });
        }
    };

    const isSaving = createMutation.isPending || updateMutation.isPending;
    const isView = mode === 'view';
    const isEdit = mode === 'edit';
    const isCreate = mode === 'create';

    const dialogTitle = isCreate ? 'New Appointment' : isEdit ? 'Edit Appointment' : 'Appointment Details';
    const dialogDescription = isCreate
        ? 'Create a new appointment for a patient.'
        : isEdit
            ? 'Update appointment details.'
            : 'View appointment information.';

    const appointmentStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'Noshow'];

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
                            value={formData.patient_name}
                            onChange={(e) => handleChange('patient_name', e.target.value)}
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
                <div className="grid grid-cols-3 gap-4">
                    <Select
                        isDarkMode={isDarkMode}
                        label="Country Code"
                        value={formData.country_code}
                        onChange={(value) => handleChange('country_code', value)}
                        disabled={isView}
                        options={[
                            { value: '+91', label: 'India (+91)' },
                            { value: '+1', label: 'USA (+1)' },
                            { value: '+44', label: 'UK (+44)' },
                            { value: '+971', label: 'UAE (+971)' }
                        ]}
                        className="col-span-1"
                    />
                    <div className="col-span-2">
                        <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                            Contact Number *
                        </label>
                        <div className="relative">
                            <div className={cn("absolute left-3 top-2.5", isDarkMode ? "text-white/30" : "text-slate-400")}>
                                <Phone size={16} />
                            </div>
                            <input
                                type="tel"
                                maxLength={10}
                                disabled={isView}
                                value={formData.contact_number}
                                onChange={(e) => handleChange('contact_number', e.target.value.replace(/\D/g, ''))}
                                placeholder="98765 43210"
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
                </div>

                {/* Age */}
                <div>
                    <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                        Age *
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            min="0"
                            disabled={isView}
                            value={formData.age}
                            onChange={(e) => handleChange('age', e.target.value)}
                            placeholder="Enter age"
                            className={cn(
                                "w-full pl-4 pr-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none",
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
                                value={formData.appointment_date}
                                onChange={(e) => handleChange('appointment_date', e.target.value)}
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
                                value={formData.appointment_time}
                                onChange={(e) => handleChange('appointment_time', e.target.value)}
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

                {/* Status */}
                <div>
                    <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                        Status
                    </label>
                    <select
                        disabled={isView}
                        value={formData.status}
                        onChange={(e) => handleChange('status', e.target.value)}
                        className={cn(
                            "w-full px-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none capitalize",
                            isView && "opacity-60 cursor-not-allowed",
                            isDarkMode
                                ? 'bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-emerald-500/30 [&>option]:bg-slate-800 [&>option]:text-white'
                                : 'bg-white border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500/30'
                        )}
                    >
                        {appointmentStatuses.map(status => (
                            <option key={status} value={status} className="capitalize">{status}</option>
                        ))}
                    </select>
                </div>

                {/* Notes */}
                <div>
                    <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                        Notes
                    </label>
                    <div className="relative">
                        <div className={cn("absolute left-3 top-3", isDarkMode ? "text-white/30" : "text-slate-400")}>
                            <FileText size={16} />
                        </div>
                        <textarea
                            rows={3}
                            disabled={isView}
                            value={formData.notes}
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

                {/* Token number (view only) */}
                {isView && appointment?.token_number && (
                    <div className={cn("px-4 py-3 rounded-xl text-sm font-medium", isDarkMode ? "bg-white/5 text-white/70" : "bg-slate-50 text-slate-600")}>
                        Token Number: <strong>#{appointment.token_number}</strong>
                    </div>
                )}
            </div>
        </Modal >
    );
};
