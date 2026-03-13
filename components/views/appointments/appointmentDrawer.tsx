"use client";

import { useState, useEffect } from 'react';
import { User, Phone, Calendar, Clock, FileText, Loader2, Stethoscope, Users, XCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { format, parseISO } from 'date-fns';
import { Drawer } from "@/components/ui/drawer";
import { Appointment } from './bookingList';
import { toast } from "sonner";
import { useCreateAppointmentMutation, useUpdateAppointmentStatusMutation, useUpdateAppointmentMutation } from '@/hooks/useAppointmentQuery';
import { useGetAllDoctorsQuery } from '@/hooks/useDoctorQuery';
import { useGetAllContactsQuery } from '@/hooks/useContactQuery';

interface AppointmentDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    appointment: Appointment | null;
    mode: 'view' | 'edit' | 'create';
    isDarkMode: boolean;
}

const APPOINTMENT_STATUSES = ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'Noshow'];

export const AppointmentDrawer = ({
    isOpen,
    onClose,
    onSave,
    appointment,
    mode,
    isDarkMode
}: AppointmentDrawerProps) => {
    const [formData, setFormData] = useState({
        patient_name: '',
        country_code: '+91',
        contact_number: '',
        appointment_date: '',
        appointment_time: '',
        status: 'Pending' as string,
        notes: '',
        doctor_id: '',
        contact_id: '',
    });
    const [isContactSelected, setIsContactSelected] = useState(false);

    const createMutation = useCreateAppointmentMutation();
    const updateStatusMutation = useUpdateAppointmentStatusMutation();
    const updateMutation = useUpdateAppointmentMutation();
    const { data: doctorsData } = useGetAllDoctorsQuery();
    const doctors = doctorsData?.data || [];
    const { data: contactsData } = useGetAllContactsQuery();
    const contacts = contactsData?.data?.contacts || [];

    useEffect(() => {
        if (appointment && (mode === 'view' || mode === 'edit')) {
            const fullNumber = appointment.contact_number || '';
            let countryCode = '+91';
            let phoneNumber = fullNumber;
            // Try to extract country code from full number
            if (fullNumber.length > 10) {
                const codeLen = fullNumber.length - 10;
                countryCode = '+' + fullNumber.slice(0, codeLen);
                phoneNumber = fullNumber.slice(codeLen);
            }
            // Convert AM/PM time to 24h format for the time input
            let timeValue = appointment.appointment_time || '';
            if (timeValue.includes('AM') || timeValue.includes('PM')) {
                const [timePart, period] = timeValue.split(' ');
                let [hours, minutes] = timePart.split(':').map(Number);
                if (period === 'PM' && hours !== 12) hours += 12;
                if (period === 'AM' && hours === 12) hours = 0;
                timeValue = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            }

            // Format date to YYYY-MM-DD for the date input
            let dateValue = appointment.appointment_date || '';
            if (dateValue && dateValue.includes('T')) {
                dateValue = dateValue.split('T')[0];
            }

            setFormData({
                patient_name: appointment.patient_name || '',
                country_code: countryCode,
                contact_number: phoneNumber,
                appointment_date: dateValue,
                appointment_time: timeValue,
                status: appointment.status || 'Pending',
                notes: appointment.notes || '',
                doctor_id: appointment.doctor_id || '',
                contact_id: '',
            });
            setIsContactSelected(false);
        } else if (mode === 'create') {
            setFormData({
                patient_name: '',
                country_code: '+91',
                contact_number: '',
                appointment_date: '',
                appointment_time: '',
                status: 'Pending',
                notes: '',
                doctor_id: '',
                contact_id: '',
            });
            setIsContactSelected(false);
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
        if (!formData.contact_number.trim()) {
            toast.error('Contact number is required');
            return;
        }
        if (!/^\d{10}$/.test(formData.contact_number.trim())) {
            toast.error('Mobile number must be 10 digits');
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

        if (mode === 'create') {
            const fullContactNumber = formData.country_code.replace('+', '') + formData.contact_number.trim();
            createMutation.mutate({
                patient_name: formData.patient_name,
                contact_number: fullContactNumber,
                appointment_date: formData.appointment_date,
                appointment_time: formData.appointment_time,
                contact_id: formData.contact_id || undefined,
                doctor_id: formData.doctor_id || undefined,
                notes: formData.notes || undefined,
                status: formData.status,
            }, { onSuccess: () => onSave() });
        } else if (mode === 'edit' && appointment) {
            const fullContactNumber = formData.country_code.replace('+', '') + formData.contact_number.trim();
            updateMutation.mutate({
                appointmentId: appointment.appointment_id,
                data: {
                    patient_name: formData.patient_name,
                    contact_number: fullContactNumber,
                    appointment_date: formData.appointment_date,
                    appointment_time: formData.appointment_time,
                    doctor_id: formData.doctor_id || undefined,
                    notes: formData.notes || undefined,
                    status: formData.status,
                },
            }, { onSuccess: () => onSave() });
        }
    };

    const isSaving = createMutation.isPending || updateStatusMutation.isPending || updateMutation.isPending;
    const isView = mode === 'view';
    const isEdit = mode === 'edit';
    const isCreate = mode === 'create';

    const dialogTitle = isCreate ? 'New Appointment' : isEdit ? 'Edit Appointment' : 'Appointment Details';
    const dialogDescription = isCreate
        ? 'Create a new appointment for a patient.'
        : isEdit
            ? 'Update appointment details.'
            : 'View appointment information.';

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title={dialogTitle}
            description={dialogDescription}
            isDarkMode={isDarkMode}
            className={cn(
                "max-w-xl font-sans [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']",
                isDarkMode ? 'bg-black' : 'bg-white'
            )}
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
            <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2">
                {mode === 'view' ? (
                    /* View Mode Layout */
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className={cn("text-xs font-semibold mb-1 block", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                        Patient Name
                                    </label>
                                    <p className={cn("text-sm font-medium", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                        {formData.patient_name || '-'}
                                    </p>
                                </div>
                                <div>
                                    <label className={cn("text-xs font-semibold mb-1 block", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                        Contact Number
                                    </label>
                                    <p className={cn("text-sm font-medium", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                        {formData.contact_number ? `${formData.country_code} ${formData.contact_number}` : '-'}
                                    </p>
                                </div>
                                <div>
                                    <label className={cn("text-xs font-semibold mb-1 block", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                        Status
                                    </label>
                                    <span className={cn(
                                        "inline-block px-3 py-1 rounded-full text-xs font-medium capitalize",
                                        formData.status === 'Confirmed' && (isDarkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-700"),
                                        formData.status === 'Pending' && (isDarkMode ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-700"),
                                        formData.status === 'Cancelled' && (isDarkMode ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-700"),
                                        formData.status === 'Completed' && (isDarkMode ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-700"),
                                        formData.status === 'Noshow' && (isDarkMode ? "bg-orange-500/10 text-orange-400" : "bg-orange-50 text-orange-700"),
                                    )}>
                                        {formData.status}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className={cn("text-xs font-semibold mb-1 block", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                        Date
                                    </label>
                                    <p className={cn("text-sm font-medium", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                        {formData.appointment_date ? format(parseISO(formData.appointment_date), 'dd MMM yyyy') : '-'}
                                    </p>
                                </div>
                                <div>
                                    <label className={cn("text-xs font-semibold mb-1 block", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                        Time
                                    </label>
                                    <p className={cn("text-sm font-medium", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                        {appointment?.appointment_time || '-'}
                                    </p>
                                </div>
                                {appointment?.token_number && (
                                    <div>
                                        <label className={cn("text-xs font-semibold mb-1 block", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                            Token Number
                                        </label>
                                        <p className={cn("text-sm font-medium", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                            #{appointment.token_number}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {formData.doctor_id && (
                            <div>
                                <label className={cn("text-xs font-semibold mb-1 block", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                    Doctor
                                </label>
                                <p className={cn("text-sm font-medium", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                    {formData.doctor_id}
                                </p>
                            </div>
                        )}

                        {formData.notes && (
                            <div>
                                <label className={cn("text-xs font-semibold mb-1 block", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                    Notes
                                </label>
                                <p className={cn("text-sm font-medium", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                    {formData.notes}
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Create / Edit Mode Layout */
                    <div className="space-y-5">
                        <h3 className={cn("text-sm font-bold tracking-wide uppercase", isDarkMode ? 'text-white/40' : 'text-slate-400')}>
                            Patient Information
                        </h3>

                        {/* Select from Contact List */}
                        {isCreate && contacts.length > 0 && (
                            <div>
                                <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                                    Select from Contacts
                                </label>
                                <div className="relative">
                                    <div className={cn("absolute left-3 top-2.5 z-10", isDarkMode ? "text-white/30" : "text-slate-400")}>
                                        <Users size={16} />
                                    </div>
                                    <select
                                        value={formData.contact_id}
                                        onChange={(e) => {
                                            if (!e.target.value) {
                                                setIsContactSelected(false);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    patient_name: '',
                                                    country_code: '+91',
                                                    contact_number: '',
                                                    contact_id: '',
                                                }));
                                                return;
                                            }
                                            const selected = contacts.find((c: any) => c.contact_id === e.target.value);
                                            if (selected) {
                                                const fullPhone = selected.phone || '';
                                                let cc = '+91';
                                                let phone = fullPhone;
                                                if (fullPhone.length > 10) {
                                                    const codeLen = fullPhone.length - 10;
                                                    cc = '+' + fullPhone.slice(0, codeLen);
                                                    phone = fullPhone.slice(codeLen);
                                                }
                                                setIsContactSelected(true);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    patient_name: selected.name || '',
                                                    country_code: cc,
                                                    contact_number: phone,
                                                    contact_id: selected.contact_id || '',
                                                }));
                                            }
                                        }}
                                        className={cn(
                                            "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none",
                                            isDarkMode
                                                ? 'bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-emerald-500/30 [&>option]:bg-slate-800 [&>option]:text-white'
                                                : 'bg-white border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500/30'
                                        )}
                                    >
                                        <option value="">Choose a contact to auto-fill...</option>
                                        {contacts.map((contact: any) => (
                                            <option key={contact.contact_id} value={contact.contact_id}>
                                                {contact.name} — {contact.phone}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {isContactSelected ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsContactSelected(false);
                                            setFormData(prev => ({
                                                ...prev,
                                                patient_name: '',
                                                country_code: '+91',
                                                contact_number: '',
                                                contact_id: '',
                                            }));
                                        }}
                                        className={cn(
                                            "flex items-center space-x-1 text-xs mt-1.5 ml-1 transition-colors",
                                            isDarkMode ? "text-red-400 hover:text-red-300" : "text-red-500 hover:text-red-600"
                                        )}
                                    >
                                        <XCircle size={12} />
                                        <span>Clear selection &amp; enter manually</span>
                                    </button>
                                ) : (
                                    <p className={cn("text-xs mt-1.5 ml-1", isDarkMode ? "text-white/30" : "text-slate-400")}>
                                        Or enter details manually below
                                    </p>
                                )}
                            </div>
                        )}

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
                                    disabled={isContactSelected}
                                    value={formData.patient_name}
                                    onChange={(e) => handleChange('patient_name', e.target.value)}
                                    placeholder="Enter patient name"
                                    className={cn(
                                        "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none",
                                        isContactSelected && "opacity-60 cursor-not-allowed",
                                        isDarkMode
                                            ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-2 focus:ring-emerald-500/30'
                                            : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/30'
                                    )}
                                />
                            </div>
                        </div>

                        {/* Contact Number with Country Code */}
                        <div>
                            <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                                Contact Number *
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                <select
                                    disabled={isContactSelected}
                                    value={formData.country_code}
                                    onChange={(e) => handleChange('country_code', e.target.value)}
                                    className={cn(
                                        "w-full px-3 py-2.5 rounded-xl text-sm border transition-all focus:outline-none",
                                        isContactSelected && "opacity-60 cursor-not-allowed",
                                        isDarkMode
                                            ? 'bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-emerald-500/30 [&>option]:bg-slate-800 [&>option]:text-white'
                                            : 'bg-white border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500/30'
                                    )}
                                >
                                    <option value="+91">+91</option>
                                    <option value="+1">+1</option>
                                    <option value="+44">+44</option>
                                    <option value="+971">+971</option>
                                </select>
                                <div className="col-span-2 relative">
                                    <div className={cn("absolute left-3 top-2.5", isDarkMode ? "text-white/30" : "text-slate-400")}>
                                        <Phone size={16} />
                                    </div>
                                    <input
                                        type="tel"
                                        disabled={isContactSelected}
                                        value={formData.contact_number}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            handleChange('contact_number', val);
                                        }}
                                        placeholder="9876543210"
                                        maxLength={10}
                                        className={cn(
                                            "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none",
                                            isContactSelected && "opacity-60 cursor-not-allowed",
                                            isDarkMode
                                                ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-2 focus:ring-emerald-500/30'
                                                : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/30'
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={cn("border-t pt-5", isDarkMode ? "border-white/10" : "border-slate-200")}>
                            <h3 className={cn("text-sm font-bold tracking-wide uppercase mb-5", isDarkMode ? 'text-white/40' : 'text-slate-400')}>
                                Schedule
                            </h3>

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
                                            min={new Date().toISOString().split('T')[0]}
                                            value={formData.appointment_date}
                                            onChange={(e) => handleChange('appointment_date', e.target.value)}
                                            className={cn(
                                                "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none",
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
                                            value={formData.appointment_time}
                                            onChange={(e) => handleChange('appointment_time', e.target.value)}
                                            className={cn(
                                                "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none",
                                                isDarkMode
                                                    ? 'bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-emerald-500/30'
                                                    : 'bg-white border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500/30'
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={cn("border-t pt-5", isDarkMode ? "border-white/10" : "border-slate-200")}>
                            <h3 className={cn("text-sm font-bold tracking-wide uppercase mb-5", isDarkMode ? 'text-white/40' : 'text-slate-400')}>
                                Additional Details
                            </h3>

                            {/* Status */}
                            <div className="mb-5">
                                <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => handleChange('status', e.target.value)}
                                    className={cn(
                                        "w-full px-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none capitalize",
                                        isDarkMode
                                            ? 'bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-emerald-500/30 [&>option]:bg-slate-800 [&>option]:text-white'
                                            : 'bg-white border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500/30'
                                    )}
                                >
                                    {APPOINTMENT_STATUSES.map(status => (
                                        <option key={status} value={status} className="capitalize">{status}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Doctor */}
                            {(isCreate || isEdit) && (
                                <div className="mb-5">
                                    <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                                        Doctor
                                    </label>
                                    <div className="relative">
                                        <div className={cn("absolute left-3 top-2.5 z-10", isDarkMode ? "text-white/30" : "text-slate-400")}>
                                            <Stethoscope size={16} />
                                        </div>
                                        <select
                                            value={formData.doctor_id}
                                            onChange={(e) => handleChange('doctor_id', e.target.value)}
                                            className={cn(
                                                "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none",
                                                isDarkMode
                                                    ? 'bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-emerald-500/30 [&>option]:bg-slate-800 [&>option]:text-white'
                                                    : 'bg-white border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500/30'
                                            )}
                                        >
                                            <option value="">Select a doctor (optional)</option>
                                            {doctors.map((doc: any) => (
                                                <option key={doc.doctor_id} value={doc.doctor_id}>
                                                    {doc.title} {doc.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

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
                                        value={formData.notes}
                                        onChange={(e) => handleChange('notes', e.target.value)}
                                        placeholder="Brief reason for appointment..."
                                        maxLength={150}
                                        className={cn(
                                            "w-full pl-10 pr-4 py-3 rounded-xl text-sm border transition-all focus:outline-none resize-none custom-scrollbar",
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
                    </div>
                )}
            </div>
        </Drawer>
    );
};
