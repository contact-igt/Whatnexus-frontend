"use client";

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Phone, Calendar, Clock, FileText, Loader2, Stethoscope, Users, XCircle, ChevronLeft, ChevronRight, Mail, Bell, Plus, Trash2, MessageSquareText } from 'lucide-react';
import { cn } from "@/lib/utils";
import { sanitizePhoneInput } from "@/lib/phone";
import {
    format, parseISO, addDays, isSameDay, startOfToday,
    startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    eachDayOfInterval, isSameMonth, addMonths, subMonths
} from 'date-fns';
import { Drawer } from "@/components/ui/drawer";
import { Appointment } from './bookingList';
import { toast } from "@/lib/toast";
import { useCreateAppointmentMutation, useUpdateAppointmentStatusMutation, useUpdateAppointmentMutation, useCheckAvailabilityQuery, useGetAllAppointmentsQuery, useUpdateAppointmentRemindersMutation } from '@/hooks/useAppointmentQuery';
import { useGetAllDoctorsQuery } from '@/hooks/useDoctorQuery';
import { useGetAllContactsQuery } from '@/hooks/useContactQuery';
import { TemplateSelectionModal, type ProcessedTemplate } from '@/components/campaign/templateSelectionModal';
import { TemplateVariableModal } from '@/components/views/history/templateVariableModal';
import type { CustomReminderDto } from '@/services/appointment';
import { AppointmentApiData } from '@/services/appointment';

interface AppointmentDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    appointment: Appointment | null;
    mode: 'view' | 'edit' | 'create';
    isDarkMode: boolean;
    prefillData?: {
        patient_name?: string;
        contact_number?: string;
        contact_id?: string;
        lead_id?: string;
    };
}

const APPOINTMENT_STATUSES = ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'Noshow'];
const TERMINAL_STATUSES = new Set(['Completed', 'Noshow']);

const DoctorCalendar = ({ selectedDate, onSelect, availableDays, isDarkMode }: any) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: calendarStart,
        end: calendarEnd,
    });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className={cn("rounded-2xl p-4", isDarkMode ? "bg-white/5 border border-white/10 shadow-xl" : "bg-white border border-slate-200 shadow-md")}>
            <div className="flex items-center justify-between mb-4 px-1">
                <h4 className={cn("text-sm font-bold", isDarkMode ? "text-white" : "text-slate-800")}>
                    {format(currentMonth, 'MMMM yyyy')}
                </h4>
                <div className="flex space-x-1">
                    <button type="button" onClick={prevMonth} className={cn("p-2 rounded-lg transition-colors border", isDarkMode ? "hover:bg-white/5 border-white/5 text-white/40" : "hover:bg-slate-50 border-slate-100 text-slate-400")}>
                        <ChevronLeft size={16} />
                    </button>
                    <button type="button" onClick={nextMonth} className={cn("p-2 rounded-lg transition-colors border", isDarkMode ? "hover:bg-white/5 border-white/5 text-white/40" : "hover:bg-slate-50 border-slate-100 text-slate-400")}>
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(day => (
                    <div key={day} className={cn("text-[10px] font-bold text-center uppercase tracking-wider opacity-40", isDarkMode ? "text-white" : "text-slate-500")}>
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const isSelected = selectedDate === dateStr;
                    const isToday = isSameDay(date, new Date());
                    const isCurrentMonth = isSameMonth(date, monthStart);
                    const dayName = format(date, 'eeee').toLowerCase();
                    const isAvailable = availableDays.includes(dayName) && date >= startOfToday();

                    return (
                        <button
                            key={date.toISOString()}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => onSelect(dateStr)}
                            className={cn(
                                "aspect-square rounded-xl text-xs font-medium transition-all flex flex-col items-center justify-center relative",
                                !isCurrentMonth && "opacity-20",
                                isSelected
                                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 z-10 scale-105"
                                    : isAvailable
                                        ? (isDarkMode ? "bg-white/5 hover:bg-white/10 text-white" : "bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-900")
                                        : (isDarkMode ? "opacity-10 text-white/40" : "opacity-20 text-slate-300"),
                                isToday && !isSelected && "border border-emerald-500/30 ring-1 ring-emerald-500/10"
                            )}
                        >
                            <span>{format(date, 'd')}</span>
                            {isAvailable && !isSelected && (
                                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-500/40" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const TimeSlotPicker = ({ slots, selectedTime, onSelect, isDarkMode }: any) => {
    if (slots.length === 0) return (
        <div className={cn("text-center py-8 rounded-xl border border-dashed", isDarkMode ? "border-white/10 text-white/40" : "border-slate-200 text-slate-400")}>
            <p className="text-sm">No available slots for this day.</p>
            <p className="text-xs opacity-60">Try another date or doctor.</p>
        </div>
    );

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[250px] overflow-y-auto pr-1">
            {slots.map((slot: any) => (
                <button
                    key={slot.time}
                    disabled={!slot.isAvailable}
                    onClick={() => onSelect(slot.time)}
                    className={cn(
                        "py-3 px-2 rounded-xl text-[11px] font-bold border transition-all flex flex-col items-center justify-center space-y-0.5",
                        selectedTime === slot.time
                            ? "bg-emerald-600 border-emerald-600 text-white shadow-lg scale-[1.02] z-10"
                            : !slot.isAvailable
                                ? (isDarkMode ? "bg-slate-900/50 border-slate-800 text-slate-700 opacity-40 cursor-not-allowed" : "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed")
                                : isDarkMode
                                    ? "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 shadow-sm"
                    )}
                >
                    <Clock size={12} className={cn("mb-0.5 opacity-60", selectedTime === slot.time ? "text-white" : "text-emerald-500")} />
                    <span>{slot.label}</span>
                </button>
            ))}
        </div>
    );
};

const AvailabilityBadge = ({ doctor_id, date, time, isDarkMode, doctors, onAvailabilityChange }: any) => {
    const { data: availability, isLoading } = useCheckAvailabilityQuery(doctor_id, date, time);
    const doctor = doctors.find((d: any) => d.doctor_id === doctor_id);

    useEffect(() => {
        if (availability !== undefined) {
            onAvailabilityChange?.(availability.data);
        }
    }, [availability, onAvailabilityChange]);

    if (isLoading) return (
        <div className={cn("mt-3 flex items-center space-x-2 text-xs", isDarkMode ? "text-white/40" : "text-slate-400")}>
            <Loader2 className="animate-spin" size={12} />
            <span>Checking availability...</span>
        </div>
    );

    // Business Logic Check (Doctor's Working Hours)
    const dayOfWeek = format(parseISO(date), 'eeee').toLowerCase();
    const hasAvailabilityDefined = doctor?.availability && doctor.availability.length > 0;
    const isWorkingThisDay = !hasAvailabilityDefined || doctor.availability.some((a: any) => a.day_of_week === dayOfWeek);

    if (hasAvailabilityDefined && !isWorkingThisDay) return (
        <div className={cn("mt-3 p-2 rounded-lg border text-xs flex items-center space-x-2", isDarkMode ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-700")}>
            <XCircle size={14} />
            <span>Doctor does not work on {dayOfWeek}s.</span>
        </div>
    );

    const isAvailable = availability?.data === true;

    return (
        <div className={cn(
            "mt-3 p-2 rounded-lg border text-xs flex items-center space-x-2 transition-colors",
            isAvailable
                ? (isDarkMode ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-700")
                : (isDarkMode ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-red-50 border-red-200 text-red-700")
        )}>
            {isAvailable ? <Calendar size={14} /> : <XCircle size={14} />}
            <span>{isAvailable ? "Slot available for booking." : "This slot is already occupied."}</span>
        </div>
    );
};

export const AppointmentDrawer = ({
    isOpen,
    onClose,
    onSave,
    appointment,
    mode,
    isDarkMode,
    prefillData
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
        lead_id: '',
        age: '',
        email: '',
    });
    const [isContactSelected, setIsContactSelected] = useState(false);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [reminderMode, setReminderMode] = useState<'default' | 'custom' | 'none'>('default');
    const [customReminders, setCustomReminders] = useState<CustomReminderDto[]>([]);
    const [customReminderErrors, setCustomReminderErrors] = useState<Array<Record<string, string>>>([]);
    const [customReminderTemplates, setCustomReminderTemplates] = useState<Array<ProcessedTemplate | null>>([]);
    const [activeReminderIdx, setActiveReminderIdx] = useState<number | null>(null);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [isTemplateVariableModalOpen, setIsTemplateVariableModalOpen] = useState(false);
    const [selectedTemplateForVariables, setSelectedTemplateForVariables] = useState<ProcessedTemplate | null>(null);

    const createMutation = useCreateAppointmentMutation();
    const updateStatusMutation = useUpdateAppointmentStatusMutation();
    const updateMutation = useUpdateAppointmentMutation();
    const { data: doctorsData } = useGetAllDoctorsQuery();
    const doctors = doctorsData?.data || [];
    const { data: contactsData } = useGetAllContactsQuery();
    const contacts = contactsData?.data?.contacts || [];

    const { data: doctorAppointments } = useGetAllAppointmentsQuery({
        doctor_id: formData.doctor_id,
        date: formData.appointment_date,
    });

    const AppointmentApis = new AppointmentApiData();

    const updateRemindersMutation = useUpdateAppointmentRemindersMutation();

    const { data: remindersResp, isLoading: remindersLoading } = useQuery({
        queryKey: ['appointment-reminders', appointment?.appointment_id],
        queryFn: () => AppointmentApis.getAppointmentReminders(appointment?.appointment_id || ''),
        enabled: (mode === 'view' || mode === 'edit') && !!appointment?.appointment_id,
        staleTime: 60 * 1000,
    });

    const activeDoctor = doctors.find((d: any) => d.doctor_id === formData.doctor_id);

    const parseAppointmentDateTimeIst = (dateValue?: string, timeValue?: string): Date | null => {
        if (!dateValue || !timeValue) return null;
        const raw = timeValue.trim();
        const ampmMatch = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        let time24h = raw;

        if (ampmMatch) {
            let hour = Number(ampmMatch[1]);
            const minute = ampmMatch[2];
            const period = ampmMatch[3].toUpperCase();
            if (period === 'PM' && hour < 12) hour += 12;
            if (period === 'AM' && hour === 12) hour = 0;
            time24h = `${String(hour).padStart(2, '0')}:${minute}`;
        }

        const dt = new Date(`${dateValue}T${time24h}:00+05:30`);
        return Number.isNaN(dt.getTime()) ? null : dt;
    };

    const generateSlots = () => {
        if (!activeDoctor || !formData.appointment_date) return [];

        const dayOfWeek = format(parseISO(formData.appointment_date), 'eeee').toLowerCase();
        const availabilities = activeDoctor.availability?.filter((a: any) => a.day_of_week === dayOfWeek) || [];

        if (availabilities.length === 0) return [];

        const allSlots = [];

        // Helper to convert 24h time to AM/PM format (e.g., "09:30" -> "09:30 AM")
        const to12HourFormat = (hour: number, min: number) => {
            const period = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            return `${String(displayHour).padStart(2, '0')}:${String(min).padStart(2, '0')} ${period}`;
        };

        for (const availability of availabilities) {
            const [currentHour, currentMin] = availability.start_time.split(':').map(Number);
            const [endHour, endMin] = availability.end_time.split(':').map(Number);
            const startTimeStr = to12HourFormat(currentHour, currentMin);
            const endTimeStr = to12HourFormat(endHour, endMin);
            const startMinutes = currentHour * 60 + currentMin;

            // Doctor availability rows are concrete slots; do not subdivide them.
            const isBooked = doctorAppointments?.data?.some((appt: any) => {
                const apptTime = appt.appointment_time || '';
                return apptTime === startTimeStr && appt.status !== 'Cancelled';
            });

            allSlots.push({
                time: startTimeStr,
                label: `${startTimeStr} - ${endTimeStr}`,
                isAvailable: !isBooked,
                startMinutes,
            });
        }
        // Sort by numeric start time to avoid localeCompare missorting PM hours (e.g. "02:00 PM" before "11:00 AM")
        return allSlots.sort((a, b) => a.startMinutes - b.startMinutes);
    };

    const slots = generateSlots();

    useEffect(() => {
        if (appointment && (mode === 'view' || mode === 'edit')) {
            const fullNumber = appointment.contact_number || '';
            let countryCode = appointment.country_code || '+91';
            let phoneNumber = appointment.contact_number || '';
            // Fallback for legacy data where country code might be prefixed to contact_number
            if (!appointment.country_code && phoneNumber.length > 10) {
                const codeLen = phoneNumber.length - 10;
                countryCode = '+' + phoneNumber.slice(0, codeLen).replace('+', '');
                phoneNumber = phoneNumber.slice(codeLen);
            }
            // Ensure country code has +
            if (countryCode && !countryCode.startsWith('+')) {
                countryCode = '+' + countryCode;
            }
            // Keep time in AM/PM format (matches slot generation and backend storage)
            let timeValue = appointment.appointment_time || '';

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
                contact_id: appointment.contact_id || '',
                lead_id: appointment.lead_id || '',
                age: appointment.age?.toString() || '',
                email: appointment.email || '',
            });
            setIsContactSelected(false);
            setIsAvailable(null);
            setReminderMode('default');
            setCustomReminders([]);
            setCustomReminderTemplates([]);
            setCustomReminderErrors([]);
        } else if (mode === 'create') {
            const prefillCountryCode = '+91';
            const prefillPhone =
                sanitizePhoneInput(prefillData?.contact_number || '', true) || '';

            setFormData({
                patient_name: prefillData?.patient_name || '',
                country_code: prefillCountryCode,
                contact_number: prefillPhone,
                appointment_date: '',
                appointment_time: '',
                status: 'Pending',
                notes: '',
                doctor_id: '',
                contact_id: prefillData?.contact_id || '',
                lead_id: prefillData?.lead_id || '',
                age: '',
                email: '',
            });
            setIsContactSelected(false);
            setIsAvailable(null);
            // reset reminder state for create
            setReminderMode('default');
            setCustomReminders([]);
            setCustomReminderErrors([]);
            setCustomReminderTemplates([]);
            setActiveReminderIdx(null);
            setIsTemplateModalOpen(false);
            setIsTemplateVariableModalOpen(false);
            setSelectedTemplateForVariables(null);
        }
    }, [appointment, mode, isOpen, prefillData]);

    // Populate reminder state when opening in edit mode using scheduled messages
    useEffect(() => {
        try {
            const rows = remindersResp?.data || [];
            if (mode === 'edit') {
                if (rows.length) {
                    const mapped: CustomReminderDto[] = rows.map((m: any, idx: number) => ({
                        label: m.template_name ? `${m.template_name}` : `Reminder ${idx + 1}`,
                        scheduled_date: m.scheduled_at ? format(parseISO(m.scheduled_at), 'yyyy-MM-dd') : '',
                        scheduled_time: m.scheduled_at ? format(parseISO(m.scheduled_at), 'HH:mm') : '',
                        template_id: m.template_id || '',
                        template_name: m.template_name || '',
                        header_media_url: m.header_media_url || null,
                        header_file_name: m.header_file_name || null,
                    }));

                    setCustomReminders(mapped);
                    setCustomReminderTemplates(mapped.map(() => null));
                    setCustomReminderErrors(mapped.map(() => ({})));
                } else {
                    // No scheduled reminders — default to 'none'
                    setCustomReminders([]);
                    setCustomReminderTemplates([]);
                    setCustomReminderErrors([]);
                }
            }
        } catch (err) {
            console.error('Failed to map reminders for edit mode', err);
        }
    }, [remindersResp, mode, appointment]);

    const handleChange = (field: string, value: string) => {
        if (field === 'doctor_id') {
            setFormData(prev => ({ ...prev, doctor_id: value, appointment_date: '', appointment_time: '' }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
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
        const apptAt = parseAppointmentDateTimeIst(formData.appointment_date, formData.appointment_time);
        const seenTimes = new Set<string>();

        customReminders.forEach((r, i) => {
            if (!r.label?.trim()) {
                errors[i].label = 'Label is required.';
                valid = false;
            }
            if (!r.template_id?.trim()) {
                errors[i].template_id = 'Template is required.';
                valid = false;
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
        if (isAvailable === false) {
            toast.error('This slot is already occupied. Please pick another time.');
            return;
        }
        if (!formData.doctor_id) {
            toast.error('Please select a doctor');
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

            const createPayload = {
                patient_name: formData.patient_name,
                country_code: formData.country_code,
                contact_number: formData.contact_number.trim(),
                appointment_date: formData.appointment_date,
                appointment_time: formData.appointment_time,
                contact_id: formData.contact_id || undefined,
                lead_id: formData.lead_id || prefillData?.lead_id || undefined,
                doctor_id: formData.doctor_id || undefined,
                notes: formData.notes || undefined,
                status: 'Pending',
                age: Number(formData.age),
                email: formData.email.trim(),
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
            };

            if (process.env.NODE_ENV !== 'production') {
                
            }

            createMutation.mutate(createPayload, { onSuccess: () => onSave() });
        } else if (mode === 'edit' && appointment) {
            const sanitizedStatus = TERMINAL_STATUSES.has(formData.status)
                ? undefined
                : formData.status;

            updateMutation.mutate({
                appointmentId: appointment.appointment_id,
                data: {
                    patient_name: formData.patient_name,
                    country_code: formData.country_code,
                    contact_number: formData.contact_number.trim(),
                    appointment_date: formData.appointment_date,
                    appointment_time: formData.appointment_time,
                    doctor_id: formData.doctor_id || undefined,
                    notes: formData.notes || undefined,
                    status: sanitizedStatus,
                    age: Number(formData.age),
                    email: formData.email.trim(),
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
        <>
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
                                disabled={isSaving || (isCreate && isAvailable === false)}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg flex items-center space-x-2",
                                    isDarkMode
                                        ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20 disabled:opacity-50 disabled:bg-slate-800'
                                        : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 disabled:opacity-50 disabled:bg-slate-200'
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
                                        <p className={cn("text-sm font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                            {formData.patient_name || '-'} {formData.age ? `(${formData.age} yrs)` : ''}
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
                                        {doctors.find((d: any) => d.doctor_id === formData.doctor_id)?.name || formData.doctor_id}
                                    </p>
                                </div>
                            )}

                            {formData.email && (
                                <div>
                                    <label className={cn("text-xs font-semibold mb-1 block", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                        Email
                                    </label>
                                    <p className={cn("text-sm font-medium", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                        {formData.email}
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

                            {/* Appointment Reminders (view-only) */}
                            <div>
                                <label className={cn("text-xs font-semibold mb-1 block", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                    Appointment Reminders
                                </label>
                                {remindersLoading ? (
                                    <p className={cn("text-sm font-medium", isDarkMode ? 'text-white/60' : 'text-slate-500')}>Loading reminders...</p>
                                ) : (
                                    (() => {
                                        const rows = remindersResp?.data || [];
                                        if (!rows || rows.length === 0) {
                                            return <p className={cn("text-sm font-medium", isDarkMode ? 'text-white/60' : 'text-slate-500')}>No reminders scheduled.</p>;
                                        }
                                        return (
                                            <div className="space-y-2">
                                                {rows.map((r: any) => (
                                                    <div key={r.id} className={cn("p-3 rounded-xl border", isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200')}>
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <div className={cn("text-sm font-semibold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                                                    {r.template_name || r.template_id || 'WhatsApp template'}
                                                                </div>
                                                                <div className={cn("text-xs", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                                                    {r.scheduled_at ? format(parseISO(r.scheduled_at), 'dd MMM yyyy, hh:mm a') : '-'}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <span className={cn("inline-block px-2 py-1 text-xs rounded-full font-medium", r.status === 'pending' ? (isDarkMode ? 'bg-amber-500/10 text-amber-300' : 'bg-amber-50 text-amber-700') : r.status === 'sent' ? (isDarkMode ? 'bg-emerald-500/10 text-emerald-300' : 'bg-emerald-50 text-emerald-700') : (isDarkMode ? 'bg-red-500/10 text-red-300' : 'bg-red-50 text-red-700'))}>
                                                                    {r.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {r.header_file_name && (
                                                            <div className={cn("text-xs mt-2", isDarkMode ? 'text-white/50' : 'text-slate-500')}>Attachment: {r.header_file_name}</div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })()
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Create / Edit Mode Layout */
                        <div className="space-y-6">
                            {/* ─── 1. DOCTOR FIRST ─── */}
                            <div className={cn("p-4 rounded-2xl border transition-all", isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200", formData.doctor_id && "border-emerald-500/30")}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className={cn("text-xs font-bold tracking-widest uppercase", isDarkMode ? 'text-emerald-500/80' : 'text-emerald-600')}>
                                        1. Select Doctor
                                    </h3>
                                    {formData.doctor_id && <div className="bg-emerald-500 rounded-full p-0.5"><Users size={12} className="text-white" /></div>}
                                </div>
                                <div>
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
                                                    ? 'bg-black border-white/10 text-white focus:ring-2 focus:ring-emerald-500/30'
                                                    : 'bg-white border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500/30'
                                            )}
                                        >
                                            <option value="">Choose a specialist...</option>
                                            {doctors.map((doc: any) => (
                                                <option key={doc.doctor_id} value={doc.doctor_id} disabled={doc.status === 'off_duty'}>
                                                    {doc.title} {doc.name} {doc.status !== 'available' ? `(${doc.status})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* ─── 2. SCHEDULE ─── */}
                            {formData.doctor_id && (
                                <div className={cn("p-4 rounded-2xl border transition-all animate-in fade-in slide-in-from-top-4 duration-500", isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200", formData.appointment_date && formData.appointment_time && "border-emerald-500/30")}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className={cn("text-xs font-bold tracking-widest uppercase", isDarkMode ? 'text-emerald-500/80' : 'text-emerald-600')}>
                                            2. PICK DATE & TIME
                                        </h3>
                                        {formData.appointment_date && formData.appointment_time && <div className="bg-emerald-500 rounded-full p-0.5"><Calendar size={12} className="text-white" /></div>}
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <label className={cn("text-[10px] font-bold uppercase mb-3 block ml-1 opacity-60", isDarkMode ? 'text-white' : 'text-slate-700')}>
                                                Select Appointment Date
                                            </label>
                                            <DoctorCalendar
                                                selectedDate={formData.appointment_date}
                                                availableDays={
                                                    (activeDoctor?.availabilityDays?.filter((d: any) => d.enabled).map((d: any) => d.day_of_week) as string[]) ||
                                                    activeDoctor?.availability?.map((a: any) => a.day_of_week) ||
                                                    []
                                                }
                                                onSelect={(date: string) => setFormData({ ...formData, appointment_date: date, appointment_time: '' })}
                                                isDarkMode={isDarkMode}
                                            />
                                        </div>

                                        {formData.appointment_date && (
                                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                                <label className={cn("text-[10px] font-bold uppercase mb-2 block ml-1 opacity-60", isDarkMode ? 'text-white' : 'text-slate-700')}>
                                                    Available Slots for {format(parseISO(formData.appointment_date), 'dd MMM')}
                                                </label>
                                                <TimeSlotPicker
                                                    slots={slots}
                                                    selectedTime={formData.appointment_time}
                                                    onSelect={(time: string) => setFormData({ ...formData, appointment_time: time })}
                                                    isDarkMode={isDarkMode}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Reminder Settings — create/edit mode */}
                                    {(isCreate || isEdit) && (
                                        <div className={cn("p-4 rounded-2xl border transition-all", isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}>
                                            <label className={cn("text-xs font-bold mb-2 flex items-center gap-1.5 ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
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
                                                    {/* Save reminders button (edit mode) */}
                                                    {isEdit && appointment && (
                                                        <div className="mt-2 flex justify-end">
                                                            <button
                                                                type="button"
                                                                disabled={updateRemindersMutation.isPending || (reminderMode === 'custom' && customReminders.length === 0)}
                                                                onClick={() => {
                                                                    if (!appointment) return;
                                                                    if (reminderMode === 'custom') {
                                                                        if (customReminders.length === 0) {
                                                                            toast.error('Add at least one custom reminder or choose another mode.');
                                                                            return;
                                                                        }
                                                                        if (!validateCustomRemindersLocal()) return;
                                                                    }

                                                                    const payload: any = { reminder_mode: reminderMode };
                                                                    if (reminderMode === 'custom') {
                                                                        payload.custom_reminders = customReminders.map((r) => ({
                                                                            label: r.label || '',
                                                                            scheduled_date: r.scheduled_date,
                                                                            scheduled_time: r.scheduled_time,
                                                                            template_id: r.template_id,
                                                                            header_media_url: r.header_media_url || null,
                                                                            header_file_name: r.header_file_name || null,
                                                                        }));
                                                                    }

                                                                    updateRemindersMutation.mutate({ appointmentId: appointment.appointment_id, data: payload });
                                                                }}
                                                                className={cn("px-4 py-2 rounded-lg text-sm font-semibold", isDarkMode ? 'bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40' : 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40')}
                                                            >
                                                                {updateRemindersMutation.isPending ? 'Saving…' : 'Save Reminders'}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {isEdit && appointment && reminderMode !== 'custom' && (
                                                <div className="mt-2 flex justify-end">
                                                    <button
                                                        type="button"
                                                        disabled={updateRemindersMutation.isPending}
                                                        onClick={() => {
                                                            if (!appointment) return;
                                                            updateRemindersMutation.mutate({
                                                                appointmentId: appointment.appointment_id,
                                                                data: { reminder_mode: reminderMode },
                                                            });
                                                        }}
                                                        className={cn("px-4 py-2 rounded-lg text-sm font-semibold", isDarkMode ? 'bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40' : 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40')}
                                                    >
                                                        {updateRemindersMutation.isPending ? 'Saving...' : 'Save Reminders'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 3. PATIENT & FINAL DETAILS */}
                            {formData.appointment_date && formData.appointment_time && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                    {/* Step 3: Patient Info */}
                                    <div className={cn("p-4 rounded-2xl border transition-all", isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200", formData.patient_name && "border-emerald-500/30")}>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className={cn("text-xs font-bold tracking-widest uppercase", isDarkMode ? 'text-emerald-500/80' : 'text-emerald-600')}>
                                                3. PATIENT Information
                                            </h3>
                                            {formData.patient_name && <div className="bg-emerald-500 rounded-full p-0.5"><User size={12} className="text-white" /></div>}
                                        </div>
                                        <div className="space-y-4">
                                            {/* Select from Contact List */}
                                            {isCreate && contacts.length > 0 && (
                                                <div className="mb-4">
                                                    <div className="relative">
                                                        <div className={cn("absolute left-3 top-2.5 z-10", isDarkMode ? "text-white/30" : "text-slate-400")}>
                                                            <Users size={16} />
                                                        </div>
                                                        <select
                                                            value={formData.contact_id}
                                                            onChange={(e) => {
                                                                if (!e.target.value) {
                                                                    setIsContactSelected(false);
                                                                    setFormData(prev => ({ ...prev, patient_name: '', country_code: '+91', contact_number: '', contact_id: '', email: '', age: '' }));
                                                                    return;
                                                                }
                                                                const selected = contacts.find((c: any) => c.contact_id === e.target.value);
                                                                if (selected) {
                                                                    const fullPhone = selected.phone || '';
                                                                    let cc = selected.country_code || '+91';
                                                                    let phone = fullPhone;
                                                                    if (!selected.country_code && fullPhone.length > 10) {
                                                                        const codeLen = fullPhone.length - 10;
                                                                        cc = '+' + fullPhone.slice(0, codeLen);
                                                                        phone = fullPhone.slice(codeLen);
                                                                    }
                                                                    if (cc && !cc.startsWith('+')) cc = '+' + cc;
                                                                    setIsContactSelected(true);
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        patient_name: selected.name || '',
                                                                        country_code: cc,
                                                                        contact_number: phone,
                                                                        contact_id: selected.contact_id || '',
                                                                        email: selected.email || '',
                                                                        age: selected.age ? String(selected.age) : '',
                                                                    }));
                                                                }
                                                            }}
                                                            className={cn(
                                                                "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none",
                                                                isDarkMode ? 'bg-black border-white/10 text-white [&>option]:bg-slate-800' : 'bg-white border-slate-200 text-slate-900'
                                                            )}
                                                        >
                                                            <option value="">Search existing contacts...</option>
                                                            {contacts.map((contact: any) => (
                                                                <option key={contact.contact_id} value={contact.contact_id}>
                                                                    {contact.name} - {contact.phone}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    {isContactSelected && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setIsContactSelected(false);
                                                                setFormData(prev => ({ ...prev, patient_name: '', country_code: '+91', contact_number: '', contact_id: '', email: '', age: '' }));
                                                            }}
                                                            className="flex items-center space-x-1 text-[10px] mt-2 ml-1 text-red-400 hover:text-red-300 transition-colors"
                                                        >
                                                            <XCircle size={10} />
                                                            <span>Clear selection & enter manually</span>
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="col-span-1">
                                                    <label className={cn("text-[10px] font-bold uppercase mb-1.5 block ml-1 opacity-60", isDarkMode ? 'text-white' : 'text-slate-700')}>
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
                                                            className={cn(
                                                                "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none",
                                                                isContactSelected && "opacity-60 cursor-not-allowed",
                                                                isDarkMode ? 'bg-black border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-span-1">
                                                    <label className={cn("text-[10px] font-bold uppercase mb-1.5 block ml-1 opacity-60", isDarkMode ? 'text-white' : 'text-slate-700')}>
                                                        Age *
                                                    </label>
                                                    <div className="relative">
                                                        <div className={cn("absolute left-3 top-2.5", isDarkMode ? "text-white/30" : "text-slate-400")}>
                                                            <Calendar size={16} />
                                                        </div>
                                                        <input
                                                            type="number"
                                                            value={formData.age}
                                                            onChange={(e) => handleChange('age', e.target.value.replace(/\D/g, ''))}
                                                            className={cn(
                                                                "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none",
                                                                isDarkMode ? 'bg-black border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className={cn("text-[10px] font-bold uppercase mb-1.5 block ml-1 opacity-60", isDarkMode ? 'text-white' : 'text-slate-700')}>
                                                    Email Address *
                                                </label>
                                                <div className="relative">
                                                    <div className={cn("absolute left-3 top-2.5", isDarkMode ? "text-white/30" : "text-slate-400")}>
                                                        <Mail size={16} />
                                                    </div>
                                                    <input
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={(e) => handleChange('email', e.target.value)}
                                                        className={cn(
                                                            "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none",
                                                            isDarkMode ? 'bg-black border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className={cn("text-[10px] font-bold uppercase mb-1.5 block ml-1 opacity-60", isDarkMode ? 'text-white' : 'text-slate-700')}>
                                                    Contact Number *
                                                </label>
                                                <div className="grid grid-cols-4 gap-2">
                                                    <select
                                                        disabled={isContactSelected}
                                                        value={formData.country_code}
                                                        onChange={(e) => handleChange('country_code', e.target.value)}
                                                        className={cn(
                                                            "w-full px-3 py-2.5 rounded-xl text-sm border transition-all focus:outline-none",
                                                            isContactSelected && "opacity-60 cursor-not-allowed",
                                                            isDarkMode ? 'bg-black border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                                                        )}
                                                    >
                                                        <option value="+91">+91</option>
                                                        <option value="+1">+1</option>
                                                        <option value="+44">+44</option>
                                                    </select>
                                                    <div className="col-span-3 relative">
                                                        <div className={cn("absolute left-3 top-2.5", isDarkMode ? "text-white/30" : "text-slate-400")}>
                                                            <Phone size={16} />
                                                        </div>
                                                        <input
                                                            type="tel"
                                                            disabled={isContactSelected}
                                                            value={formData.contact_number}
                                                            onChange={(e) => handleChange('contact_number', sanitizePhoneInput(e.target.value, true))}
                                                            maxLength={10}
                                                            className={cn(
                                                                "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none",
                                                                isContactSelected && "opacity-60 cursor-not-allowed",
                                                                isDarkMode ? 'bg-black border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Step 4: Final Details */}
                                    <div className={cn("p-4 rounded-2xl border transition-all", isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}>
                                        <h3 className={cn("text-xs font-bold tracking-widest uppercase mb-4", isDarkMode ? 'text-emerald-500/80' : 'text-emerald-600')}>
                                            4. Final DETAILS
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className={cn("text-[10px] font-bold uppercase mb-1.5 block ml-1 opacity-60", isDarkMode ? 'text-white' : 'text-slate-700')}>
                                                    Status
                                                </label>
                                                <select
                                                    value={formData.status}
                                                    onChange={(e) => handleChange('status', e.target.value)}
                                                    disabled={isEdit && TERMINAL_STATUSES.has(appointment?.status || '')}
                                                    className={cn(
                                                        "w-full px-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none capitalize",
                                                        isEdit && TERMINAL_STATUSES.has(appointment?.status || '') && "opacity-60 cursor-not-allowed",
                                                        isDarkMode ? 'bg-black border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                                                    )}
                                                >
                                                    {APPOINTMENT_STATUSES.map(status => (
                                                        <option
                                                            key={status}
                                                            value={status}
                                                            disabled={TERMINAL_STATUSES.has(status)}
                                                        >
                                                            {status}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className={cn("text-[10px] font-bold uppercase mb-1.5 block ml-1 opacity-60", isDarkMode ? 'text-white' : 'text-slate-700')}>
                                                    Notes
                                                </label>
                                                <div className="relative">
                                                    <div className={cn("absolute left-3 top-3", isDarkMode ? "text-white/30" : "text-slate-400")}>
                                                        <FileText size={16} />
                                                    </div>
                                                    <textarea
                                                        rows={2}
                                                        value={formData.notes}
                                                        onChange={(e) => handleChange('notes', e.target.value)}
                                                        className={cn(
                                                            "w-full pl-10 pr-4 py-3 rounded-xl text-sm border transition-all focus:outline-none resize-none custom-scrollbar",
                                                            isDarkMode ? 'bg-black border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Drawer>

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
