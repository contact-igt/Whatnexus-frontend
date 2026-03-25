"use client";

import { useState, useEffect } from 'react';
import { User, Phone, Calendar, Clock, FileText, Loader2, Stethoscope, Users, XCircle, ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import { cn } from "@/lib/utils";
import {
    format, parseISO, addDays, isSameDay, startOfToday,
    startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    eachDayOfInterval, isSameMonth, addMonths, subMonths
} from 'date-fns';
import { Drawer } from "@/components/ui/drawer";
import { Appointment } from './bookingList';
import { toast } from "sonner";
import { useCreateAppointmentMutation, useUpdateAppointmentStatusMutation, useUpdateAppointmentMutation, useCheckAvailabilityQuery, useGetAllAppointmentsQuery } from '@/hooks/useAppointmentQuery';
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
        age: '',
        email: '',
    });
    const [isContactSelected, setIsContactSelected] = useState(false);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

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

    const activeDoctor = doctors.find((d: any) => d.doctor_id === formData.doctor_id);

    const generateSlots = () => {
        if (!activeDoctor || !formData.appointment_date) return [];

        const dayOfWeek = format(parseISO(formData.appointment_date), 'eeee').toLowerCase();
        const availabilities = activeDoctor.availability?.filter((a: any) => a.day_of_week === dayOfWeek) || [];

        if (availabilities.length === 0) return [];

        const allSlots = [];
        const duration = activeDoctor.consultation_duration || 15;

        // Helper to convert 24h time to AM/PM format (e.g., "09:30" -> "09:30 AM")
        const to12HourFormat = (hour: number, min: number) => {
            const period = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            return `${String(displayHour).padStart(2, '0')}:${String(min).padStart(2, '0')} ${period}`;
        };

        for (const availability of availabilities) {
            let [currentHour, currentMin] = availability.start_time.split(':').map(Number);
            const [endHour, endMin] = availability.end_time.split(':').map(Number);

            while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
                // Generate time in AM/PM format to match backend storage
                const startTimeStr = to12HourFormat(currentHour, currentMin);

                let nextMin = currentMin + duration;
                let nextHour = currentHour;
                if (nextMin >= 60) {
                    nextHour += Math.floor(nextMin / 60);
                    nextMin %= 60;
                }
                const endTimeStr = to12HourFormat(nextHour, nextMin);

                // Check if slot overlaps with any existing non-cancelled appointment
                // Backend stores time in AM/PM format, so compare directly
                const isBooked = doctorAppointments?.data?.some((appt: any) => {
                    const apptTime = appt.appointment_time || '';
                    return apptTime === startTimeStr && appt.status !== 'Cancelled';
                });

                allSlots.push({
                    time: startTimeStr,
                    label: `${startTimeStr} - ${endTimeStr}`,
                    isAvailable: !isBooked
                });

                currentHour = nextHour;
                currentMin = nextMin;
            }
        }
        return allSlots.sort((a, b) => a.time.localeCompare(b.time));
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
                age: appointment.age?.toString() || '',
                email: appointment.email || '',
            });
            setIsContactSelected(false);
            setIsAvailable(null);
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
                age: '',
                email: '',
            });
            setIsContactSelected(false);
            setIsAvailable(null);
        }
    }, [appointment, mode, isOpen]);

    const handleChange = (field: string, value: string) => {
        if (field === 'doctor_id') {
            setFormData(prev => ({ ...prev, doctor_id: value, appointment_date: '', appointment_time: '' }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
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

        if (mode === 'create') {
            createMutation.mutate({
                patient_name: formData.patient_name,
                country_code: formData.country_code,
                contact_number: formData.contact_number.trim(),
                appointment_date: formData.appointment_date,
                appointment_time: formData.appointment_time,
                contact_id: formData.contact_id || undefined,
                doctor_id: formData.doctor_id || undefined,
                notes: formData.notes || undefined,
                status: formData.status,
                age: formData.age ? Number(formData.age) : undefined,
                email: formData.email || undefined,
            }, { onSuccess: () => onSave() });
        } else if (mode === 'edit' && appointment) {
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
                    status: formData.status,
                    age: formData.age ? Number(formData.age) : undefined,
                    email: formData.email || undefined,
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
                                            availableDays={activeDoctor?.availability?.map((a: any) => a.day_of_week) || []}
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
                            </div>
                        )}

                        {/* ─── 3. PATIENT & FINAL DETAILS ─── */}
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
                                                                setFormData(prev => ({ ...prev, patient_name: '', country_code: '+91', contact_number: '', contact_id: '' }));
                                                                return;
                                                            }
                                                            const selected = contacts.find((c: any) => c.contact_id === e.target.value);
                                                            if (selected) {
                                                                const fullPhone = selected.phone || '';
                                                                let cc = '+91', phone = fullPhone;
                                                                if (fullPhone.length > 10) {
                                                                    const codeLen = fullPhone.length - 10;
                                                                    cc = '+' + fullPhone.slice(0, codeLen);
                                                                    phone = fullPhone.slice(codeLen);
                                                                }
                                                                setIsContactSelected(true);
                                                                setFormData(prev => ({ ...prev, patient_name: selected.name || '', country_code: cc, contact_number: phone, contact_id: selected.contact_id || '' }));
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
                                                                {contact.name} — {contact.phone}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {isContactSelected && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsContactSelected(false);
                                                            setFormData(prev => ({ ...prev, patient_name: '', country_code: '+91', contact_number: '', contact_id: '' }));
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
                                                    Age
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
                                                Email Address
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
                                                        onChange={(e) => handleChange('contact_number', e.target.value.replace(/\D/g, ''))}
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
                                                className={cn(
                                                    "w-full px-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none capitalize",
                                                    isDarkMode ? 'bg-black border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                                                )}
                                            >
                                                {APPOINTMENT_STATUSES.map(status => (
                                                    <option key={status} value={status}>{status}</option>
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
    );
};
