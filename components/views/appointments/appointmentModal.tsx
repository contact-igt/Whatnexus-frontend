
"use client";

import { useState, useEffect } from 'react';
import { User, Phone, Calendar, Clock, FileText, Loader2, Mail, Bell, Plus, Trash2, ChevronRight, MessageSquareText } from 'lucide-react';
import { cn } from "@/lib/utils";
import { sanitizePhoneInput } from "@/lib/phone";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Appointment } from './bookingList';
import { toast } from "@/lib/toast";
import { useCreateAppointmentMutation, useUpdateAppointmentMutation } from '@/hooks/useAppointmentQuery';
import { TemplateSelectionModal, type ProcessedTemplate } from '@/components/campaign/templateSelectionModal';
import { TemplateVariableModal } from '@/components/views/history/templateVariableModal';
import type { CustomReminderDto } from '@/services/appointment';

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
        email: '',
        age: '',
        appointment_date: '',
        appointment_time: '',
        status: 'Pending' as string,
        notes: '',
        doctor_id: '',
        type: 'General',
    });

    const [reminderMode, setReminderMode] = useState<'default' | 'custom' | 'none'>('default');
    const [customReminders, setCustomReminders] = useState<CustomReminderDto[]>([]);
    const [customReminderErrors, setCustomReminderErrors] = useState<Array<Record<string, string>>>([]);
    // Per-row selected template objects — frontend only, not sent to backend
    const [customReminderTemplates, setCustomReminderTemplates] = useState<Array<ProcessedTemplate | null>>([]);
    // Template modal state — single pair of modals, targeted by activeReminderIdx
    const [activeReminderIdx, setActiveReminderIdx] = useState<number | null>(null);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [isTemplateVariableModalOpen, setIsTemplateVariableModalOpen] = useState(false);
    const [selectedTemplateForVariables, setSelectedTemplateForVariables] = useState<ProcessedTemplate | null>(null);

    const createMutation = useCreateAppointmentMutation();
    const updateMutation = useUpdateAppointmentMutation();

    useEffect(() => {
        if (appointment && (mode === 'view' || mode === 'edit')) {
            setFormData({
                patient_name: appointment?.patient_name || (appointment as any).patientName || '',
                country_code: appointment?.country_code || (appointment as any).country_code || '+91',
                contact_number: appointment?.contact_number || (appointment as any).contact || '',
                email: appointment?.email || '',
                age: appointment?.age ? String(appointment.age) : '',
                appointment_date: appointment?.appointment_date || '',
                appointment_time: appointment?.appointment_time || (appointment as any).time || '',
                status: appointment?.status || 'Pending',
                notes: appointment.notes || '',
                doctor_id: appointment.doctor_id || '',
                type: appointment.type || 'General',
            });
        } else if (mode === 'create') {
            setFormData({
                patient_name: '',
                country_code: '+91',
                contact_number: '',
                email: '',
                age: '',
                appointment_date: '',
                appointment_time: '',
                status: 'Pending',
                notes: '',
                doctor_id: '',
                type: 'General',
            });
            setReminderMode('default');
            setCustomReminders([]);
            setCustomReminderErrors([]);
            setCustomReminderTemplates([]);
            setActiveReminderIdx(null);
            setIsTemplateModalOpen(false);
            setIsTemplateVariableModalOpen(false);
            setSelectedTemplateForVariables(null);
        }
    }, [appointment, mode, isOpen]);

    useEffect(() => {
        
    }, [mode, reminderMode, isOpen]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const getReminderTemplateName = (
        reminder: CustomReminderDto,
        selectedTemplate: ProcessedTemplate | null,
    ) => {
        return (
            selectedTemplate?.name ||
            reminder.template_name ||
            reminder.template_id ||
            'Select WhatsApp template'
        );
    };

    // Called when user selects a template from TemplateSelectionModal for a reminder row
    const handleReminderTemplateSelect = (template: ProcessedTemplate) => {
        const hasHeaderVars = !!template.headerText && /\{\{\d+\}\}/.test(template.headerText);
        const hasBodyVars = template.variables > 0 || (!!template.description && /\{\{\d+\}\}/.test(template.description));
        const hasMediaHeader = template.type === 'image' || template.type === 'video' || template.type === 'document';
        const hasLocationHeader = template.type === 'location';
        const hasButtonVars = (template.buttonVariables?.length || 0) > 0;

        if (hasHeaderVars || hasBodyVars || hasMediaHeader || hasLocationHeader || hasButtonVars) {
            setSelectedTemplateForVariables(template);
            setIsTemplateModalOpen(false);
            setIsTemplateVariableModalOpen(true);
            return;
        }

        // Plain text template — apply directly
        if (activeReminderIdx !== null) {
            setCustomReminders(prev => prev.map((item, idx) => idx === activeReminderIdx
                ? {
                    ...item,
                    template_id: template.id,
                    template_name: template.name,
                    header_media_url: null,
                    header_file_name: null,
                }
                : item));
            setCustomReminderTemplates(prev => prev.map((item, idx) => idx === activeReminderIdx ? template : item));
            setCustomReminderErrors(prev => prev.map((err, idx) => idx === activeReminderIdx ? { ...err, template_id: '' } : err));
        }
        setIsTemplateModalOpen(false);
    };

    const validateCustomRemindersLocal = (): boolean => {
        const errors: Array<Record<string, string>> = customReminders.map(() => ({}));
        let valid = true;

        const now = new Date();
        const apptAt = formData.appointment_date && formData.appointment_time
            ? new Date(`${formData.appointment_date}T${formData.appointment_time}:00+05:30`)
            : null;
        const seenTimes = new Set<string>();

        customReminders.forEach((r, i) => {
            if (!r.label?.trim()) {
                errors[i].label = 'Label is required.';
                valid = false;
            }
            if (!r.template_id.trim()) {
                errors[i].template_id = 'Template is required.';
                valid = false;
            } else {
                const tpl = customReminderTemplates[i];
                if (tpl) {
                    const needsMedia = tpl.type === 'image' || tpl.type === 'video' || tpl.type === 'document';
                    if (needsMedia && !r.header_media_url) {
                        errors[i].template_id = `${tpl.type === 'document' ? 'Document file' : 'Media'} is required for this template. Re-select the template to attach.`;
                        valid = false;
                    }
                }
            }
            if (!r.scheduled_date) {
                errors[i].scheduled_date = 'Date is required.';
                valid = false;
            }
            if (!r.scheduled_time) {
                errors[i].scheduled_time = 'Time is required.';
                valid = false;
            }
            if (r.scheduled_date && r.scheduled_time) {
                const scheduledAt = new Date(`${r.scheduled_date}T${r.scheduled_time}:00+05:30`);
                if (isNaN(scheduledAt.getTime())) {
                    errors[i].scheduled_date = 'Invalid date/time.';
                    valid = false;
                } else {
                    if (scheduledAt <= now) {
                        errors[i].scheduled_time = 'Must be a future time.';
                        valid = false;
                    } else if (apptAt && scheduledAt >= apptAt) {
                        errors[i].scheduled_time = 'Must be before the appointment time.';
                        valid = false;
                    } else {
                        const key = scheduledAt.toISOString();
                        if (seenTimes.has(key)) {
                            errors[i].scheduled_time = 'Duplicate reminder time.';
                            valid = false;
                        }
                        seenTimes.add(key);
                    }
                }
            }
        });

        setCustomReminderErrors(errors);
        return valid;
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
        if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            toast.error('Valid email is required');
            return;
        }

        if (mode === 'create') {
            if (reminderMode === 'custom' && customReminders.length === 0) {
                toast.error('Add at least one custom reminder or choose a different reminder mode.');
                return;
            }
            if (reminderMode === 'custom' && !validateCustomRemindersLocal()) {
                return;
            }
            createMutation.mutate({
                patient_name: formData.patient_name,
                country_code: formData.country_code,
                contact_number: formData.contact_number,
                email: formData.email.trim(),
                age: Number(formData.age),
                appointment_date: formData.appointment_date,
                appointment_time: formData.appointment_time,
                doctor_id: formData.doctor_id || undefined,
                notes: formData.notes || undefined,
                status: formData.status,
                type: formData.type,
                reminder_mode: reminderMode,
                custom_reminders: reminderMode === 'custom'
                    ? customReminders.map((r) => ({
                        label: r.label || '',
                        scheduled_date: r.scheduled_date,
                        scheduled_time: r.scheduled_time,
                        template_id: r.template_id,
                        header_media_url: r.header_media_url || null,
                        header_file_name: r.header_file_name || null,
                    }))
                    : undefined,
            }, { onSuccess: () => onSave() });
        } else if (mode === 'edit' && appointment) {
            updateMutation.mutate({
                appointmentId: appointment.appointment_id,
                data: {
                    patient_name: formData.patient_name,
                    country_code: formData.country_code,
                    contact_number: formData.contact_number,
                    email: formData.email.trim(),
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
        <>
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
                    <div data-testid="appointment-reminder-debug" className="text-xs text-amber-400">Reminder section debug marker</div>
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
                                    onChange={(e) => handleChange('contact_number', sanitizePhoneInput(e.target.value, true))}
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

                    {/* Email */}
                    <div>
                        <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                            Email *
                        </label>
                        <div className="relative">
                            <div className={cn("absolute left-3 top-2.5", isDarkMode ? "text-white/30" : "text-slate-400")}>
                                <Mail size={16} />
                            </div>
                            <input
                                type="email"
                                disabled={isView}
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                placeholder="patient@example.com (optional)"
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

                    {/* Reminder Settings — create mode only */}
                    {isCreate && (
                        <div>
                            <label className={cn("text-xs font-semibold mb-2 flex items-center gap-1.5 ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                                <Bell size={13} />
                                WhatsApp Reminder
                            </label>

                            {/* Mode selector */}
                            <div className="flex gap-2 mb-3">
                                {(['default', 'custom', 'none'] as const).map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setReminderMode(m)}
                                        className={cn(
                                            "flex-1 py-2 rounded-xl text-xs font-semibold border transition-all capitalize",
                                            reminderMode === m
                                                ? isDarkMode
                                                    ? 'bg-emerald-600 border-emerald-500 text-white'
                                                    : 'bg-emerald-600 border-emerald-600 text-white'
                                                : isDarkMode
                                                    ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                                                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50',
                                        )}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>

                            {/* Mode descriptions */}
                            {reminderMode === 'default' && (
                                <p className={cn("text-xs px-3 py-2 rounded-xl", isDarkMode ? 'bg-white/5 text-white/50' : 'bg-slate-50 text-slate-500')}>
                                    Uses your admin-configured reminder rules automatically.
                                </p>
                            )}
                            {reminderMode === 'none' && (
                                <p className={cn("text-xs px-3 py-2 rounded-xl", isDarkMode ? 'bg-white/5 text-white/50' : 'bg-slate-50 text-slate-500')}>
                                    No WhatsApp reminder will be sent for this appointment.
                                </p>
                            )}

                            {/* Custom reminder rows */}
                            {reminderMode === 'custom' && (
                                <div className="space-y-2">
                                    {!formData.appointment_date || !formData.appointment_time ? (
                                        <p className={cn("text-xs px-3 py-2 rounded-xl", isDarkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600')}>
                                            Select appointment date and time first.
                                        </p>
                                    ) : null}
                                    {customReminders.map((r, i) => {
                                        const rowErrors = customReminderErrors[i] || {};
                                        return (
                                            <div key={i} className={cn("p-3 rounded-xl border space-y-2", isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200')}>
                                                <div className="flex items-center justify-between">
                                                    <span className={cn("text-xs font-semibold", isDarkMode ? 'text-white/60' : 'text-slate-500')}>Reminder {i + 1}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setCustomReminders(prev => prev.filter((_, idx) => idx !== i));
                                                            setCustomReminderErrors(prev => prev.filter((_, idx) => idx !== i));
                                                            setCustomReminderTemplates(prev => prev.filter((_, idx) => idx !== i));
                                                        }}
                                                        className="text-red-400 hover:text-red-500"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                                <div>
                                                    <label className={cn("text-xs mb-1 block", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                                        Label <span className="text-red-400">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={r.label || ''}
                                                        onChange={(e) => {
                                                            setCustomReminders(prev => prev.map((item, idx) => idx === i ? { ...item, label: e.target.value } : item));
                                                            setCustomReminderErrors(prev => prev.map((err, idx) => idx === i ? { ...err, label: '' } : err));
                                                        }}
                                                        placeholder={`Reminder ${i + 1}`}
                                                        className={cn("w-full px-3 py-2 rounded-lg text-xs border focus:outline-none", rowErrors.label ? 'border-red-500' : '', isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-white/35' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400')}
                                                    />
                                                    {rowErrors.label && <p className="text-red-500 text-xs mt-0.5">{rowErrors.label}</p>}
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className={cn("text-xs mb-1 block", isDarkMode ? 'text-white/50' : 'text-slate-500')}>Date</label>
                                                        <input
                                                            type="date"
                                                            value={r.scheduled_date}
                                                            onChange={(e) => {
                                                                setCustomReminders(prev => prev.map((item, idx) => idx === i ? { ...item, scheduled_date: e.target.value } : item));
                                                                setCustomReminderErrors(prev => prev.map((err, idx) => idx === i ? { ...err, scheduled_date: '' } : err));
                                                            }}
                                                            className={cn("w-full px-3 py-2 rounded-lg text-xs border focus:outline-none", rowErrors.scheduled_date ? 'border-red-500' : '', isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900')}
                                                        />
                                                        {rowErrors.scheduled_date && <p className="text-red-500 text-xs mt-0.5">{rowErrors.scheduled_date}</p>}
                                                    </div>
                                                    <div>
                                                        <label className={cn("text-xs mb-1 block", isDarkMode ? 'text-white/50' : 'text-slate-500')}>Time</label>
                                                        <input
                                                            type="time"
                                                            value={r.scheduled_time}
                                                            onChange={(e) => {
                                                                setCustomReminders(prev => prev.map((item, idx) => idx === i ? { ...item, scheduled_time: e.target.value } : item));
                                                                setCustomReminderErrors(prev => prev.map((err, idx) => idx === i ? { ...err, scheduled_time: '' } : err));
                                                            }}
                                                            className={cn("w-full px-3 py-2 rounded-lg text-xs border focus:outline-none", rowErrors.scheduled_time ? 'border-red-500' : '', isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900')}
                                                        />
                                                        {rowErrors.scheduled_time && <p className="text-red-500 text-xs mt-0.5">{rowErrors.scheduled_time}</p>}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className={cn("text-xs mb-1 block", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                                        WhatsApp Template <span className="text-red-400">*</span>
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setActiveReminderIdx(i);
                                                            setIsTemplateModalOpen(true);
                                                        }}
                                                        className={cn(
                                                            "w-full px-3 py-2.5 rounded-lg border text-xs text-left flex items-center justify-between transition-all focus:outline-none",
                                                            rowErrors.template_id ? 'border-red-500 ring-1 ring-red-500/30' : '',
                                                            isDarkMode ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'
                                                        )}
                                                    >
                                                        <span className={cn("inline-flex items-center gap-1.5 truncate", !customReminderTemplates[i] && !r.template_name && !r.template_id && (isDarkMode ? 'text-white/35' : 'text-slate-400'))}>
                                                            <MessageSquareText size={13} className={customReminderTemplates[i] ? 'text-emerald-500 shrink-0' : 'shrink-0'} />
                                                            <span className="truncate">{getReminderTemplateName(r, customReminderTemplates[i])}</span>
                                                        </span>
                                                        <ChevronRight size={13} className={cn("shrink-0 ml-1", isDarkMode ? 'text-white/40' : 'text-slate-400')} />
                                                    </button>
                                                    {rowErrors.template_id && <p className="text-red-500 text-xs mt-0.5">{rowErrors.template_id}</p>}

                                                    {/* Selected template card */}
                                                    {customReminderTemplates[i] && (
                                                        <div className={cn(
                                                            "mt-2 p-2.5 rounded-lg border text-xs space-y-1",
                                                            isDarkMode ? 'border-emerald-500/20 bg-emerald-500/5 text-white/60' : 'border-emerald-200 bg-emerald-50/60 text-slate-500'
                                                        )}>
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className={cn("font-semibold truncate", isDarkMode ? 'text-white' : 'text-slate-800')}>
                                                                    {customReminderTemplates[i]!.name}
                                                                </span>
                                                                <span className={cn(
                                                                    "shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium capitalize",
                                                                    isDarkMode ? 'bg-white/10 text-white/70' : 'bg-white text-slate-600 border border-slate-200'
                                                                )}>
                                                                    {customReminderTemplates[i]!.type}
                                                                </span>
                                                            </div>
                                                            {r.header_media_url && (
                                                                <p className={cn("text-[11px]", isDarkMode ? 'text-emerald-400' : 'text-emerald-600')}>
                                                                    ✓ Media attached{r.header_file_name ? `: ${r.header_file_name}` : ''}
                                                                </p>
                                                            )}
                                                            {customReminderTemplates[i]!.description && (
                                                                <p className="line-clamp-2 text-[11px]">{customReminderTemplates[i]!.description}</p>
                                                            )}
                                                            {(customReminderTemplates[i]!.type === 'image' || customReminderTemplates[i]!.type === 'video' || customReminderTemplates[i]!.type === 'document') && !r.header_media_url && (
                                                                <p className={cn("text-[11px]", isDarkMode ? 'text-amber-300' : 'text-amber-700')}>
                                                                    Media template selected. Please configure media header before sending.
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {customReminders.length >= 5 ? (
                                        <p className={cn("text-xs px-3 py-2 rounded-xl text-center", isDarkMode ? 'bg-white/5 text-white/40' : 'bg-slate-50 text-slate-400')}>
                                            Maximum 5 reminders allowed.
                                        </p>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled={!formData.appointment_date || !formData.appointment_time}
                                            onClick={() => {
                                                setCustomReminders(prev => [...prev, { label: `Reminder ${prev.length + 1}`, scheduled_date: '', scheduled_time: '', template_id: '' }]);
                                                setCustomReminderTemplates(prev => [...prev, null]);
                                            }}
                                            className={cn("w-full py-2 rounded-xl text-xs font-semibold border border-dashed flex items-center justify-center gap-1.5 transition-all", isDarkMode ? 'border-white/20 text-white/50 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed' : 'border-slate-300 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed')}
                                        >
                                            <Plus size={12} />
                                            Add Reminder
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Token number (view only) */}
                    {isView && appointment?.token_number && (
                        <div className={cn("px-4 py-3 rounded-xl text-sm font-medium", isDarkMode ? "bg-white/5 text-white/70" : "bg-slate-50 text-slate-600")}>
                            Token Number: <strong>#{appointment.token_number}</strong>
                        </div>
                    )}
                </div>
            </Modal>

            <TemplateSelectionModal
                isOpen={isTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
                onSelect={handleReminderTemplateSelect}
            />
            <TemplateVariableModal
                isOpen={isTemplateVariableModalOpen}
                onClose={() => setIsTemplateVariableModalOpen(false)}
                template={selectedTemplateForVariables}
                onSend={(components) => {
                    const headerComp = Array.isArray(components)
                        ? components.find((c: any) => c?.type === 'header')
                        : null;
                    const headerParam = headerComp?.parameters?.[0] || null;
                    const mediaLink =
                        headerParam?.image?.link ||
                        headerParam?.video?.link ||
                        headerParam?.document?.link ||
                        '';
                    const documentFileName = headerParam?.document?.filename || '';

                    if (activeReminderIdx !== null && selectedTemplateForVariables) {
                        setCustomReminders(prev => prev.map((item, idx) => idx === activeReminderIdx
                            ? {
                                ...item,
                                template_id: selectedTemplateForVariables.id,
                                template_name: selectedTemplateForVariables.name,
                                header_media_url: mediaLink || null,
                                header_file_name: documentFileName || null,
                            }
                            : item));
                        setCustomReminderTemplates(prev => prev.map((item, idx) => idx === activeReminderIdx ? selectedTemplateForVariables : item));
                        setCustomReminderErrors(prev => prev.map((err, idx) => idx === activeReminderIdx ? { ...err, template_id: '' } : err));
                    }
                    setIsTemplateVariableModalOpen(false);
                }}
                isDarkMode={isDarkMode}
                isPending={false}
            />
        </>
    );
};
