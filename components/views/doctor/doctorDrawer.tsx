"use client";
import { useState, useEffect, useRef } from 'react';
import { User, Phone, Mail, Loader2, Plus, Trash2, Check, MinusCircle, XCircle, CheckCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Drawer } from "@/components/ui/drawer";
import { Select } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Input } from "@/components/ui/input";
import { Doctor } from '@/services/doctor';
import { toast } from "@/lib/toast";
import { useCreateDoctorMutation, useUpdateDoctorMutation } from '@/hooks/useDoctorQuery';
import { useDeleteSpecializationMutation } from '@/hooks/useSpecializationsQuery';
import { SpecializationDrawer } from '../specialization/specializationDrawer';
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
// import { Doctor } from '@/services/doctor';

const doctorSchema = z.object({
    title: z.string().optional().default('Dr'),
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    country_code: z.string().default("+91"),
    mobile: z.string().regex(/^\d{10}$/, "Mobile number must be 10 digits").optional().or(z.literal('')),
    email: z.string().trim().email("Invalid email address").optional().or(z.literal('')),
    status: z.string().default("available"),
    consultation_duration: z.coerce.number().min(5, "Duration must be at least 5 minutes").max(240, "Duration must be at most 240 minutes").optional(),
    bio: z.string().trim().min(10, "Bio is required (min 10 chars)").max(500, "Bio must be less than 500 characters").optional().or(z.literal('')),
    profile_pic: z.string().optional(),
    experience_years: z.preprocess((val) => String(val ?? ''), z.string())
        .refine((val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 0), { message: "Experience must be 0 or more" })
        .transform((val) => val === '' ? 0 : Number(val)),
    qualification: z.string().trim().optional().or(z.literal('')),
    specializations: z.array(z.string()).min(1, "At least one specialization is required"),
});

type DoctorFormValues = z.infer<typeof doctorSchema>;

interface DoctorDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    specializationsData: any;
    doctor: Doctor | null;
    mode: 'view' | 'edit' | 'create';
    isDarkMode: boolean;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SLOT_DURATION_PRESETS = [15, 30, 45, 60];
const DEFAULT_SLOT_DURATION = 15;

type AvailabilitySlot = { start: string; end: string };
type AvailabilityDay = {
    enabled: boolean;
    slotDuration: number;
    slots: AvailabilitySlot[];
};

type AvailabilityValidation = {
    rowErrors: Record<string, string>;
    dayErrors: Record<string, string>;
    hasErrors: boolean;
};

const defaultAvailabilityDay = (enabled = false): AvailabilityDay => ({
    enabled,
    slotDuration: DEFAULT_SLOT_DURATION,
    slots: [],
});

const timeToMinutes = (time?: string) => {
    const match = String(time || '').match(/^(\d{2}):(\d{2})$/);
    if (!match) return null;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours < 0 || minutes < 0 || minutes > 59) return null;
    return hours * 60 + minutes;
};

const minutesToTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

const addMinutesToTime = (time: string, minutes: number) => {
    const start = timeToMinutes(time);
    if (start === null) return '';
    return minutesToTime(start + minutes);
};

const validateAvailabilityMap = (map: Record<string, AvailabilityDay>): AvailabilityValidation => {
    const rowErrors: Record<string, string> = {};
    const dayErrors: Record<string, string> = {};

    for (const day of DAYS_OF_WEEK) {
        const dayData = map[day] || defaultAvailabilityDay(false);
        const duration = Number(dayData.slotDuration);

        if (!Number.isInteger(duration) || duration < 5 || duration > 480) {
            dayErrors[day] = 'Slot duration must be an integer between 5 and 480 minutes.';
        }

        if (!dayData.enabled) continue;

        if (!dayData.slots.length) {
            dayErrors[day] = dayErrors[day] || 'Add at least one slot or disable this day.';
            continue;
        }

        const indexedSlots = dayData.slots.map((slot, index) => ({
            ...slot,
            index,
            startMinutes: timeToMinutes(slot.start),
            endMinutes: timeToMinutes(slot.end),
        }));

        for (const slot of indexedSlots) {
            const key = `${day}:${slot.index}`;
            if (slot.startMinutes === null || slot.endMinutes === null) {
                rowErrors[key] = 'Enter a valid time.';
            } else if (slot.endMinutes > 1439) {
                rowErrors[key] = 'End time cannot exceed 23:59.';
            } else if (slot.endMinutes <= slot.startMinutes) {
                rowErrors[key] = 'End time must be after start time.';
            }
        }

        const sorted = indexedSlots
            .filter(slot => slot.startMinutes !== null && slot.endMinutes !== null)
            .sort((a, b) => (a.startMinutes || 0) - (b.startMinutes || 0));

        for (let index = 1; index < sorted.length; index += 1) {
            const previous = sorted[index - 1];
            const current = sorted[index];
            if ((current.startMinutes || 0) < (previous.endMinutes || 0)) {
                rowErrors[`${day}:${previous.index}`] = 'This slot overlaps another slot.';
                rowErrors[`${day}:${current.index}`] = 'This slot overlaps another slot.';
            }
        }
    }

    return {
        rowErrors,
        dayErrors,
        hasErrors: Object.keys(rowErrors).length > 0 || Object.keys(dayErrors).length > 0,
    };
};

const sortedSlots = (slots: AvailabilitySlot[]) =>
    [...slots].sort((a, b) => (timeToMinutes(a.start) || 0) - (timeToMinutes(b.start) || 0));

const getSlotDurationMinutes = (
    slot: AvailabilitySlot,
    fallbackDuration = DEFAULT_SLOT_DURATION,
) => {
    const start = timeToMinutes(slot.start);
    const end = timeToMinutes(slot.end);
    if (start === null || end === null || end <= start) return fallbackDuration;
    return end - start;
};

export const DoctorDrawer = ({
    isOpen,
    onClose,
    doctor,
    specializationsData,
    mode,
    isDarkMode
}: DoctorDrawerProps) => {
    const specializationsList = specializationsData || [];

    const { control, register, handleSubmit, reset, setValue, setError, watch, formState: { errors } } = useForm<DoctorFormValues>({
        resolver: zodResolver(doctorSchema) as any,
        defaultValues: {
            title: 'Dr',
            name: '',
            country_code: '+91',
            mobile: '',
            email: '',
            status: 'available',
            consultation_duration: 30,
            bio: '',
            profile_pic: '',
            experience_years: 0,
            qualification: '',
            specializations: [],
        }
    });

    const formData = watch() as DoctorFormValues;

    const [availabilityMap, setAvailabilityMap] = useState<Record<string, AvailabilityDay>>({});
    const [customDurationDrafts, setCustomDurationDrafts] = useState<Record<string, string>>({});

    const createDoctorMutation = useCreateDoctorMutation();
    const updateDoctorMutation = useUpdateDoctorMutation();

    // Specialization Management States
    const [isSpecDrawerOpen, setIsSpecDrawerOpen] = useState(false);
    const [specDrawerMode, setSpecDrawerMode] = useState<'create' | 'edit'>('create');
    const [selectedSpec, setSelectedSpec] = useState<any>(null);
    const [specToDelete, setSpecToDelete] = useState<string | null>(null);
    const deleteSpecMutation = useDeleteSpecializationMutation();
    const [isSpecDeleteModalOpen, setIsSpecDeleteModalOpen] = useState(false);

    // Use a ref to track if the form has been initialized for the current open state
    const isInitialized = useRef(false);
    const lastDoctorId = useRef<string | null>(null);

    // Track spec being edited so we can sync form values after rename
    const editingSpecRef = useRef<{ name: string; id: string } | null>(null);

    // Sync form specialization names when the list updates after a rename
    useEffect(() => {
        if (!editingSpecRef.current) return;
        const { name: oldName, id } = editingSpecRef.current;
        const updatedSpec = specializationsList.find((s: any) => s.specialization_id === id);
        if (!updatedSpec) return;
        if (updatedSpec.name !== oldName) {
            const currentSpecs: string[] = watch('specializations') || [];
            if (currentSpecs.includes(oldName)) {
                setValue('specializations', currentSpecs.map(s => s === oldName ? updatedSpec.name : s));
            }
            editingSpecRef.current = null;
        }
    }, [specializationsList]);

    useEffect(() => {
        if (!isOpen) {
            isInitialized.current = false;
            lastDoctorId.current = null;
            return;
        }

        const currentDoctorId = doctor?.doctor_id || 'new';

        // If we are already initialized and the doctor hasn't changed, don't reset
        if (isInitialized.current && lastDoctorId.current === currentDoctorId) {
            return;
        }

        if (doctor && (mode === 'view' || mode === 'edit')) {
            // Robust Specializations mapping
            const rawSpecs = Array.isArray(doctor.specializations) ? doctor.specializations : [];
            const specs = rawSpecs.map((s: any) => {
                if (typeof s === 'string') {
                    // If it's an ID, try to find the name in the specializations list
                    const found = specializationsList.find((sp: any) => sp.specialization_id === s || sp.name === s);
                    return typeof found === 'object' ? found.name : s;
                }
                return s?.name || '';
            }).filter(Boolean);

            // Robust Country Code mapping
            let countryCode = doctor.country_code || '+91';
            if (!countryCode.startsWith('+')) {
                countryCode = `+${countryCode}`;
            }

            reset({
                title: (doctor.title || 'Dr').replace(".", ""),
                name: doctor.name || '',
                country_code: countryCode,
                mobile: doctor.mobile || '',
                email: doctor.email || '',
                status: doctor.status || 'available',
                consultation_duration: doctor.consultation_duration || 30,
                bio: doctor.bio || '',
                profile_pic: doctor.profile_pic || '',
                experience_years: doctor.experience_years || 0,
                qualification: doctor.qualification || '',
                specializations: specs,
            });

            // Convert availability to map
            const availMap: Record<string, AvailabilityDay> = {};

            const availabilityDays = Array.isArray((doctor as any).availabilityDays)
                ? (doctor as any).availabilityDays
                : [];

            availabilityDays.forEach((daySetting: any) => {
                const dayRaw = daySetting.day_of_week || daySetting.day;
                if (!dayRaw) return;
                const day = dayRaw.charAt(0).toUpperCase() + dayRaw.slice(1).toLowerCase();
                availMap[day] = {
                    enabled: Boolean(daySetting.enabled),
                    slotDuration: Number(daySetting.slotDuration ?? daySetting.slot_duration ?? DEFAULT_SLOT_DURATION),
                    slots: [],
                };
            });

            if (Array.isArray(doctor.availability)) {
                doctor.availability.forEach((slot: any) => {
                    const dayRaw = slot.day_of_week;
                    if (dayRaw) {
                        const day = dayRaw.charAt(0).toUpperCase() + dayRaw.slice(1).toLowerCase();
                        if (!availMap[day]) {
                            availMap[day] = {
                                enabled: Boolean(slot.enabled ?? true),
                                slotDuration: Number(slot.slotDuration ?? slot.slot_duration ?? DEFAULT_SLOT_DURATION),
                                slots: [],
                            };
                        }
                        availMap[day].enabled = Boolean(slot.enabled ?? true);
                        availMap[day].slotDuration = Number(slot.slotDuration ?? slot.slot_duration ?? availMap[day].slotDuration ?? DEFAULT_SLOT_DURATION);
                        availMap[day].slots.push({ start: slot.start_time, end: slot.end_time });
                    }
                });
            } else if (doctor.availability) {
                Object.keys(doctor.availability).forEach(day => {
                    const dayData = (doctor.availability as any)[day];
                    availMap[day] = {
                        enabled: dayData.enabled || false,
                        slotDuration: Number(dayData.slotDuration ?? dayData.slot_duration ?? DEFAULT_SLOT_DURATION),
                        slots: dayData.slots || []
                    };
                });
            }
            setAvailabilityMap(availMap);

            isInitialized.current = true;
            lastDoctorId.current = currentDoctorId;
        } else if (mode === 'create') {
            reset({
                title: 'Dr',
                name: '',
                country_code: '+91',
                mobile: '',
                email: '',
                status: 'available',
                consultation_duration: 30,
                bio: '',
                profile_pic: '',
                experience_years: 0,
                qualification: '',
                specializations: [],
            });
            setAvailabilityMap({});

            isInitialized.current = true;
            lastDoctorId.current = 'new';
        }
    }, [doctor?.doctor_id, mode, isOpen, reset]);
    // ^ Removed specializationsList from dependencies to avoid unwanted resets

    const handleDayToggle = (day: string) => {
        const dayData = availabilityMap[day] || defaultAvailabilityDay(false);
        const nextEnabled = !dayData.enabled;
        const firstSlot = {
            start: '09:00',
            end: addMinutesToTime('09:00', dayData.slotDuration || DEFAULT_SLOT_DURATION),
        };
        setAvailabilityMap({
            ...availabilityMap,
            [day]: {
                ...dayData,
                enabled: nextEnabled,
                slots: nextEnabled && dayData.slots.length === 0
                    ? [firstSlot]
                    : dayData.slots
            }
        });
    };

    const handleAddTimeSlot = (day: string) => {
        const dayData = availabilityMap[day] || defaultAvailabilityDay(true);
        const start = dayData.slots.length
            ? dayData.slots[dayData.slots.length - 1].end
            : '09:00';
        setAvailabilityMap({
            ...availabilityMap,
            [day]: {
                ...dayData,
                enabled: true,
                slots: [
                    ...dayData.slots,
                    {
                        start,
                        end: addMinutesToTime(start, dayData.slotDuration || DEFAULT_SLOT_DURATION),
                    },
                ],
            }
        });
    };

    const handleRemoveTimeSlot = (day: string, index: number) => {
        const dayData = availabilityMap[day] || defaultAvailabilityDay(true);
        setAvailabilityMap({
            ...availabilityMap,
            [day]: {
                ...dayData,
                slots: dayData.slots.filter((_, i) => i !== index)
            }
        });
    };

    const handleTimeSlotChange = (day: string, index: number, value: string) => {
        const dayData = availabilityMap[day] || defaultAvailabilityDay(true);
        const updatedSlots = dayData.slots.map((slot, i) =>
            i === index
                ? {
                    ...slot,
                    start: value,
                    end: addMinutesToTime(value, dayData.slotDuration || DEFAULT_SLOT_DURATION),
                }
                : slot
        );
        setAvailabilityMap({
            ...availabilityMap,
            [day]: {
                ...dayData,
                slots: updatedSlots
            }
        });
    };

    const handleEndTimeSlotChange = (day: string, index: number, value: string) => {
        const dayData = availabilityMap[day] || defaultAvailabilityDay(true);
        const updatedSlots = dayData.slots.map((slot, i) =>
            i === index
                ? {
                    ...slot,
                    end: value,
                }
                : slot
        );
        setAvailabilityMap({
            ...availabilityMap,
            [day]: {
                ...dayData,
                slots: updatedSlots
            }
        });
    };

    const applyDurationChange = (day: string, duration: number) => {
        const dayData = availabilityMap[day] || defaultAvailabilityDay(false);
        setAvailabilityMap({
            ...availabilityMap,
            [day]: {
                ...dayData,
                slotDuration: duration,
                slots: dayData.slots.map(slot => ({
                    ...slot,
                    end: addMinutesToTime(slot.start, duration),
                })),
            },
        });
        setCustomDurationDrafts((drafts) => ({
            ...drafts,
            [day]: SLOT_DURATION_PRESETS.includes(duration) ? '' : String(duration),
        }));
    };

    const requestDurationChange = (day: string, duration: number) => {
        if (!Number.isInteger(duration) || duration < 5 || duration > 480) {
            const dayData = availabilityMap[day] || defaultAvailabilityDay(false);
            setAvailabilityMap({
                ...availabilityMap,
                [day]: { ...dayData, slotDuration: duration },
            });
            return;
        }

        applyDurationChange(day, duration);
    };

    const handlePresetDurationClick = (day: string, duration: number) => {
        setCustomDurationDrafts((drafts) => ({ ...drafts, [day]: '' }));
        requestDurationChange(day, duration);
    };

    const handleCustomDurationChange = (day: string, value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 3);
        setCustomDurationDrafts((drafts) => ({ ...drafts, [day]: digits }));
    };

    const applyCustomDurationDraft = (day: string) => {
        const draftValue = customDurationDrafts[day];
        if (!draftValue) return;
        requestDurationChange(day, Number(draftValue));
    };

    const handleAddSpec = () => {
        setSpecDrawerMode('create');
        setSelectedSpec(null);
        setIsSpecDrawerOpen(true);
    };

    const handleEditSpec = (specName: string) => {
        const spec = specializationsList.find((s: any) => s.name === specName || s.specialization_id === specName);
        if (spec && typeof spec === 'object') {
            editingSpecRef.current = { name: spec.name, id: spec.specialization_id };
            setSelectedSpec(spec);
            setSpecDrawerMode('edit');
            setIsSpecDrawerOpen(true);
        }
    };

    const handleDeleteSpec = (specName: string) => {
        const spec = specializationsList.find((s: any) => s.name === specName || s.specialization_id === specName);
        if (spec && typeof spec === 'object' && spec.specialization_id) {
            setSpecToDelete(spec.specialization_id);
            setIsSpecDeleteModalOpen(true);
        }
    };

    const confirmDeleteSpec = async () => {
        if (specToDelete) {
            const specToRemove = specializationsList.find((s: any) => s.specialization_id === specToDelete);
            await deleteSpecMutation.mutateAsync(specToDelete);
            // Remove deleted spec from form values
            if (specToRemove) {
                const currentSpecs: string[] = watch('specializations') || [];
                if (currentSpecs.includes(specToRemove.name)) {
                    setValue('specializations', currentSpecs.filter(s => s !== specToRemove.name));
                }
            }
            setSpecToDelete(null);
            setIsSpecDeleteModalOpen(false);
        }
    };

    const onSubmit = async (data: DoctorFormValues) => {
        const validation = validateAvailabilityMap(availabilityMap);
        if (validation.hasErrors) {
            toast.error(
                Object.values(validation.dayErrors)[0] ||
                Object.values(validation.rowErrors)[0] ||
                'Please fix availability errors before saving.',
            );
            return;
        }

        // Convert availability map to API format (lowercase day names for backend ENUM)
        const availability = DAYS_OF_WEEK.map(day => {
            const dayData = availabilityMap[day] || defaultAvailabilityDay(false);
            return {
                day: day.toLowerCase(),
                enabled: dayData.enabled,
                slotDuration: Number(dayData.slotDuration || DEFAULT_SLOT_DURATION),
                slots: dayData.enabled
                    ? sortedSlots(dayData.slots).map(slot => ({
                        start_time: slot.start,
                        end_time: slot.end
                    }))
                    : [],
            };
        });

        const apiData: any = {
            ...data,
            country_code: data.mobile ? data.country_code : null,
            mobile: data.mobile || null,
            email: data.email || null,
            specializations: data.specializations,
            availability: availability
        };

        try {
            if (mode === 'create') {
                await createDoctorMutation.mutateAsync(apiData);
            } else if (mode === 'edit' && doctor?.doctor_id) {
                await updateDoctorMutation.mutateAsync({ doctorId: doctor.doctor_id, data: apiData });
            }
            onClose();
        } catch (error: any) {
            const msg = error?.response?.data?.message || '';
            if (msg.toLowerCase().includes('mobile')) {
                setError('mobile', { type: 'manual', message: msg });
            } else if (msg.toLowerCase().includes('email')) {
                setError('email', { type: 'manual', message: msg });
            }
        }
    };
    const isView = mode === 'view';
    const isEdit = mode === 'edit';
    const isCreate = mode === 'create';
    const isSaving = createDoctorMutation.isPending || updateDoctorMutation.isPending;
    const availabilityValidation = validateAvailabilityMap(availabilityMap);

    const dialogTitle = isCreate ? 'Add New Doctor' : isEdit ? 'Edit Doctor' : 'Doctor Details';
    const dialogDescription = isCreate
        ? 'Add a new doctor to your hospital.'
        : isEdit
            ? 'Update doctor information and availability.'
            : 'View doctor information.';

    return (
        <>
            <Drawer
                isOpen={isOpen}
                onClose={onClose}
                title={dialogTitle}
                description={dialogDescription}
                isDarkMode={isDarkMode}
                className={cn(
                    "max-w-3xl font-sans [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']",
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
                                onClick={handleSubmit(onSubmit as any)}
                                disabled={isSaving}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg flex items-center space-x-2",
                                    isDarkMode
                                        ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20 disabled:opacity-50'
                                        : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 disabled:opacity-50'
                                )}
                            >
                                {isSaving && <Loader2 className="animate-spin" size={14} />}
                                <span>{isCreate ? 'Add Doctor' : 'Save Changes'}</span>
                            </button>
                        )}
                    </div>
                }
            >
                <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2">
                    {mode === 'view' ? (
                        // View Mode Layout
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className={cn("text-xs font-semibold mb-1 block", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                            Name
                                        </label>
                                        <p className={cn("text-sm font-medium", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                            {formData.title ? `${formData.title.replace(".", "")}.` : ''} {formData.name}
                                        </p>
                                    </div>
                                    <div>
                                        <label className={cn("text-xs font-semibold mb-2 block", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                            Status
                                        </label>
                                        <div className={cn(
                                            "inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                                            formData.status === 'available' && (isDarkMode ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border-emerald-200"),
                                            formData.status === 'busy' && (isDarkMode ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-amber-50 text-amber-700 border-amber-200"),
                                            (formData.status === 'off_duty' || !formData.status) && (isDarkMode ? "bg-slate-500/10 text-slate-400 border-slate-500/20" : "bg-slate-100 text-slate-600 border-slate-200")
                                        )}>
                                            {formData.status === 'available' && <CheckCircle size={12} />}
                                            {formData.status === 'busy' && <MinusCircle size={12} />}
                                            {(formData.status === 'off_duty' || !formData.status) && <XCircle size={12} />}
                                            <span className="capitalize">{formData.status?.replace('_', ' ') || 'Off Duty'}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className={cn("text-xs font-semibold mb-1 block", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                            Mobile
                                        </label>
                                        <p className={cn("text-sm font-medium", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                            {formData.country_code} {formData.mobile}
                                        </p>
                                    </div>
                                    <div>
                                        <label className={cn("text-xs font-semibold mb-1 block", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                            Email
                                        </label>
                                        <p className={cn("text-sm font-medium", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                            {formData.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className={cn("text-xs font-semibold mb-1 block", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                            Qualification
                                        </label>
                                        <p className={cn("text-sm font-medium", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                            {formData.qualification || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className={cn("text-xs font-semibold mb-1 block", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                            Experience
                                        </label>
                                        <p className={cn("text-sm font-medium", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                            {formData.experience_years ? `${formData.experience_years} Years` : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className={cn("text-xs font-semibold mb-1 block", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                            Consultation Duration
                                        </label>
                                        <p className={cn("text-sm font-medium", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                            {formData.consultation_duration} min
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Specializations */}
                            <div>
                                <label className={cn("text-xs font-semibold mb-2 block", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                    Specializations
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {(() => {
                                        const displaySpecs = (formData.specializations && formData.specializations.length > 0)
                                            ? formData.specializations
                                            : (doctor?.specializations && Array.isArray(doctor.specializations)
                                                ? doctor.specializations.map((s: any) => typeof s === 'string' ? s : s?.name).filter(Boolean)
                                                : []);
                                        return displaySpecs.length > 0 ? (
                                            displaySpecs.map((spec: string, index: number) => (
                                                <span
                                                    key={index}
                                                    className={cn(
                                                        "px-2.5 py-1 rounded-lg text-xs font-medium",
                                                        isDarkMode
                                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    )}
                                                >
                                                    {spec}
                                                </span>
                                            ))
                                        ) : (
                                            <span className={cn("text-sm", isDarkMode ? 'text-white/50' : 'text-slate-500')}>-</span>
                                        )
                                    })()}
                                </div>
                            </div>

                            {/* Bio */}
                            <div>
                                <label className={cn("text-xs font-semibold mb-1 block", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                    Bio
                                </label>
                                <p className={cn("text-sm leading-relaxed", isDarkMode ? 'text-white/80' : 'text-slate-700')}>
                                    {formData.bio || '-'}
                                </p>
                            </div>

                            {/* Availability */}
                            <div>
                                <label className={cn("text-xs font-semibold mb-3 block", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                    Weekly Availability
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {DAYS_OF_WEEK.map((day) => {
                                        const dayData = availabilityMap[day];
                                        if (!dayData?.enabled) return null;
                                        return (
                                            <div
                                                key={day}
                                                className={cn(
                                                    "p-3 rounded-lg border",
                                                    isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                                                )}
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className={cn("font-medium text-sm", isDarkMode ? "text-white" : "text-slate-900")}>
                                                        {day}
                                                    </span>
                                                    <span className={cn("text-[11px]", isDarkMode ? "text-white/40" : "text-slate-500")}>
                                                        {dayData.slotDuration || DEFAULT_SLOT_DURATION}m slots
                                                    </span>
                                                </div>
                                                <div className="space-y-1">
                                                    {dayData.slots.map((slot, index) => {
                                                        const formatTime = (time: string | undefined) => {
                                                            if (!time) return '';
                                                            try {
                                                                const [hour, minute] = time.split(':');
                                                                const h = parseInt(hour, 10);
                                                                const ampm = h >= 12 ? 'PM' : 'AM';
                                                                const h12 = h % 12 || 12;
                                                                return `${h12}:${minute || '00'} ${ampm}`;
                                                            } catch (e) {
                                                                return time;
                                                            }
                                                        };
                                                        return (
                                                            <div key={index} className={cn("text-[11px] px-2 py-1.5 rounded-lg font-medium", isDarkMode ? "bg-white/10 text-white/90" : "bg-white text-slate-700 border border-slate-200")}>
                                                                {formatTime(slot.start)} — {formatTime(slot.end)}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {Object.values(availabilityMap).every(d => !d.enabled) && (
                                        <p className={cn("text-sm italic col-span-2", isDarkMode ? "text-white/40" : "text-slate-400")}>
                                            No availability configured
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Edit/Create Mode Layout
                        <div className="space-y-6">
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <h3 className={cn("text-sm font-semibold", isDarkMode ? "text-white" : "text-slate-900")}>
                                    Basic Information
                                </h3>

                                {/* Title and Name */}
                                <div className="grid grid-cols-3 gap-4">
                                    <Controller
                                        name="title"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                isDarkMode={isDarkMode}
                                                label="Title"
                                                value={field.value}
                                                onChange={field.onChange}
                                                options={[
                                                    { value: 'Dr', label: 'Dr' },
                                                    { value: 'Mr', label: 'Mr' },
                                                    { value: 'Mrs', label: 'Mrs' },
                                                    { value: 'Ms', label: 'Ms' }
                                                ]}
                                                disabled={isView}
                                            />
                                        )}
                                    />

                                    <div className="col-span-2">
                                        <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                                            Doctor Name <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            isDarkMode={isDarkMode}
                                            icon={User}
                                            disabled={isView}
                                            {...register("name")}
                                            placeholder="John Smith"
                                            error={errors.name?.message}
                                            variant="secondary"
                                        />
                                    </div>
                                </div>

                                {/* Contact and Email */}
                                <div className="grid grid-cols-3 gap-4">
                                    <Controller
                                        name="country_code"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                isDarkMode={isDarkMode}
                                                label="Code"
                                                value={field.value}
                                                onChange={field.onChange}
                                                options={[
                                                    { value: '+91', label: '+91' },
                                                    { value: '+1', label: '+1' },
                                                    { value: '+44', label: '+44' },
                                                    { value: '+971', label: '+971' }
                                                ]}
                                                disabled={isView}
                                            />
                                        )}
                                    />

                                    <div className="col-span-2">
                                        <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                                            Mobile Number
                                        </label>
                                        <Input
                                            isDarkMode={isDarkMode}
                                            icon={Phone}
                                            type="tel"
                                            disabled={isView}
                                            {...register("mobile")}
                                            maxLength={10}
                                            hasSeparateCountryCode
                                            placeholder="9876543210"
                                            error={errors.mobile?.message}
                                            variant="secondary"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                                        Email
                                    </label>
                                    <Input
                                        isDarkMode={isDarkMode}
                                        icon={Mail}
                                        type="email"
                                        disabled={isView || mode === 'edit'}
                                        {...register("email")}
                                        placeholder="john.smith@example.com"
                                        error={errors.email?.message}
                                        variant="secondary"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Controller
                                            name="status"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    isDarkMode={isDarkMode}
                                                    label="Current Status"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    options={[
                                                        { value: 'available', label: 'Available' },
                                                        { value: 'busy', label: 'Busy' },
                                                        { value: 'off_duty', label: 'Off Duty' }
                                                    ]}
                                                    disabled={isView}
                                                />
                                            )}
                                        />
                                        {errors.status && (
                                            <p className="text-xs text-red-500 mt-1 ml-1">{errors.status.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Controller
                                            name="consultation_duration"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    isDarkMode={isDarkMode}
                                                    label="Consultation Duration (min)"
                                                    value={String(field.value)}
                                                    onChange={(val) => field.onChange(Number(val))}
                                                    options={[
                                                        { value: '5', label: '5 minutes' },
                                                        { value: '10', label: '10 minutes' },
                                                        { value: '15', label: '15 minutes' },
                                                        { value: '20', label: '20 minutes' },
                                                        { value: '30', label: '30 minutes' },
                                                        { value: '45', label: '45 minutes' },
                                                        { value: '60', label: '60 minutes' },
                                                        { value: '90', label: '90 minutes' },
                                                        { value: '120', label: '120 minutes' },
                                                    ]}
                                                    disabled={isView}
                                                    error={errors.consultation_duration?.message}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Qualification and Experience */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                                        Qualification
                                    </label>
                                    <Input
                                        isDarkMode={isDarkMode}
                                        type="text"
                                        disabled={isView}
                                        {...register("qualification")}
                                        placeholder="MBBS, MD Cardiology"
                                        error={errors.qualification?.message}
                                        variant="secondary"
                                    />
                                </div>

                                <div>
                                    <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                                        Experience (Years)
                                    </label>
                                    <Input
                                        isDarkMode={isDarkMode}
                                        type="number"
                                        disabled={isView}
                                        {...register("experience_years")}
                                        min={0}
                                        placeholder="10"
                                        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        error={errors.experience_years?.message}
                                        variant="secondary"
                                    />
                                </div>
                            </div>

                            {/* Bio */}
                            <div>
                                <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                                    Bio
                                </label>
                                <textarea
                                    disabled={isView}
                                    {...register("bio")}
                                    placeholder="Experienced cardiologist with 10+ years of expertise..."
                                    rows={4}
                                    className={cn(
                                        "w-full px-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none resize-none",
                                        isView && "opacity-60 cursor-not-allowed",
                                        errors.bio && "border-red-500 focus:ring-red-500/30",
                                        !errors.bio && (isDarkMode
                                            ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30 hover:bg-white/10 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50'
                                            : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 hover:bg-slate-50 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50')
                                    )}
                                />
                                {errors.bio && (
                                    <p className="text-xs text-red-500 mt-1 ml-1">{errors.bio.message}</p>
                                )}
                            </div>

                            {/* Specializations */}
                            <div className="space-y-3">
                                <Controller
                                    name="specializations"
                                    control={control}
                                    render={({ field }) => (
                                        <div>
                                            <label className={cn(
                                                "text-xs font-semibold font-sans mb-2 block ml-1",
                                                isDarkMode ? 'text-white/70' : 'text-slate-700'
                                            )}>
                                                Specializations
                                                <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <div className="flex items-start gap-2">
                                                <div className="flex-1">
                                                    <MultiSelect
                                                        isDarkMode={isDarkMode}
                                                        required
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        options={specializationsList.map((spec: any) => {
                                                            const name = typeof spec === 'string' ? spec : spec?.name || '';
                                                            return { value: name, label: name };
                                                        }).filter((opt: any) => opt.value)}
                                                        placeholder={specializationsList.length === 0 ? "No specializations found in system" : "Select specializations"}
                                                        disabled={isView}
                                                        error={errors.specializations?.message}
                                                        variant="secondary"
                                                        onEditOption={handleEditSpec}
                                                        onDeleteOption={handleDeleteSpec}
                                                    />
                                                </div>
                                                {!isView && (
                                                    <button
                                                        type="button"
                                                        onClick={handleAddSpec}
                                                        className={cn(
                                                            "h-[42px] px-3 rounded-xl flex items-center justify-center transition-all shadow-emerald-500/20",
                                                            isDarkMode ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                                        )}
                                                        title="Add Specialization"
                                                    >
                                                        <Plus size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                />
                            </div>

                            {/* Availability Schedule */}
                            <div className="space-y-3">
                                <h3 className={cn("text-sm font-semibold", isDarkMode ? "text-white" : "text-slate-900")}>
                                    Weekly Availability
                                </h3>
                                <div className="space-y-3">
                                    {DAYS_OF_WEEK.map((day) => {
                                        const dayData = availabilityMap[day] || defaultAvailabilityDay(false);
                                        const dayError = availabilityValidation.dayErrors[day];
                                        return (
                                            <div
                                                key={day}
                                                className={cn(
                                                    "p-4 rounded-xl border",
                                                    isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                                                )}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div
                                                        onClick={() => !isView && handleDayToggle(day)}
                                                        className={cn(
                                                            "flex items-center flex-1 cursor-pointer group select-none",
                                                            isView && "cursor-default pointer-events-none"
                                                        )}
                                                    >
                                                        <div className="relative">
                                                            <div className={cn(
                                                                "w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200",
                                                                isDarkMode
                                                                    ? "bg-transparent border-slate-600"
                                                                    : "bg-transparent border-slate-300",
                                                                dayData.enabled && (isDarkMode ? "bg-emerald-500 border-emerald-500" : "bg-emerald-600 border-emerald-600")
                                                            )}>
                                                                <Check
                                                                    strokeWidth={3}
                                                                    className={cn(
                                                                        "w-3.5 h-3.5 text-white transition-all duration-200",
                                                                        dayData.enabled ? "opacity-100 scale-100" : "opacity-0 scale-50"
                                                                    )}
                                                                />
                                                            </div>
                                                        </div>
                                                        <span className={cn("ml-3 font-medium transition-colors duration-200", isDarkMode ? "text-white" : "text-slate-900")}>
                                                            {day}
                                                        </span>
                                                    </div>
                                                    {!isView && dayData.enabled && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddTimeSlot(day)}
                                                            className={cn(
                                                                "text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1",
                                                                isDarkMode
                                                                    ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                            )}
                                                        >
                                                            <Plus size={12} />
                                                            <span>Add Slot</span>
                                                        </button>
                                                    )}
                                                </div>
                                                <div className={cn(
                                                    "mt-3 rounded-lg border p-3",
                                                    !dayData.enabled && "opacity-50 pointer-events-none",
                                                    isDarkMode ? "border-white/10 bg-black/20" : "border-slate-200 bg-white"
                                                )}>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className={cn("text-xs font-semibold mr-1", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                                            Slot duration
                                                        </span>
                                                        {SLOT_DURATION_PRESETS.map(duration => (
                                                            <button
                                                                key={duration}
                                                                type="button"
                                                                disabled={isView || !dayData.enabled}
                                                                onClick={() => handlePresetDurationClick(day, duration)}
                                                                className={cn(
                                                                    "px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors",
                                                                    dayData.slotDuration === duration
                                                                        ? (isDarkMode ? "bg-emerald-500/20 border-emerald-500 text-emerald-300" : "bg-emerald-50 border-emerald-300 text-emerald-700")
                                                                        : (isDarkMode ? "border-white/10 text-white/60 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50")
                                                                )}
                                                            >
                                                                {duration}m
                                                            </button>
                                                        ))}
                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            pattern="[0-9]*"
                                                            disabled={isView || !dayData.enabled}
                                                            maxLength={3}
                                                            value={
                                                                customDurationDrafts[day] ??
                                                                (SLOT_DURATION_PRESETS.includes(dayData.slotDuration) ? '' : String(dayData.slotDuration || ''))
                                                            }
                                                            onChange={(e) => handleCustomDurationChange(day, e.target.value)}
                                                            onBlur={() => applyCustomDurationDraft(day)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    applyCustomDurationDraft(day);
                                                                    e.currentTarget.blur();
                                                                }
                                                            }}
                                                            placeholder="Custom"
                                                            className={cn(
                                                                "w-24 px-3 py-1 rounded-md text-xs border outline-none",
                                                                isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
                                                            )}
                                                        />
                                                        <span className={cn("text-xs", isDarkMode ? "text-white/40" : "text-slate-400")}>
                                                            minutes
                                                        </span>
                                                    </div>
                                                    {dayError && (
                                                        <p className="text-xs text-red-500 mt-2">{dayError}</p>
                                                    )}
                                                </div>
                                                {dayData.enabled && (
                                                    <div className="space-y-2 pl-9 mt-3">
                                                        <div className={cn("grid grid-cols-[1fr_1fr_80px_36px] gap-2 text-[11px] font-semibold", isDarkMode ? "text-white/40" : "text-slate-500")}>
                                                            <span>Start time</span>
                                                            <span>End time</span>
                                                            <span>Duration</span>
                                                            <span />
                                                        </div>
                                                        {dayData.slots.map((slot: any, index: number) => {
                                                            const rowError = availabilityValidation.rowErrors[`${day}:${index}`];
                                                            return (
                                                                <div key={index} className="space-y-1">
                                                                    <div className="grid grid-cols-[1fr_1fr_80px_36px] gap-2 items-center">
                                                                        <input
                                                                            type="time"
                                                                            disabled={isView}
                                                                            value={slot.start}
                                                                            onChange={(e) => handleTimeSlotChange(day, index, e.target.value)}
                                                                            className={cn(
                                                                                "px-3 py-2 rounded-lg text-sm border",
                                                                                rowError && "border-red-500",
                                                                                isView && "opacity-60 cursor-not-allowed",
                                                                                isDarkMode
                                                                                    ? 'bg-white/5 border-white/10 text-white'
                                                                                    : 'bg-white border-slate-200 text-slate-900'
                                                                            )}
                                                                        />
                                                                        <input
                                                                            type="time"
                                                                            disabled={isView}
                                                                            value={slot.end}
                                                                            onChange={(e) => handleEndTimeSlotChange(day, index, e.target.value)}
                                                                            className={cn(
                                                                                "px-3 py-2 rounded-lg text-sm border",
                                                                                rowError && "border-red-500",
                                                                                isView && "opacity-60 cursor-not-allowed",
                                                                                isDarkMode
                                                                                    ? 'bg-white/5 border-white/10 text-white'
                                                                                    : 'bg-white border-slate-200 text-slate-900'
                                                                            )}
                                                                        />
                                                                        <span className={cn(
                                                                            "px-2 py-2 rounded-lg text-xs font-semibold text-center border",
                                                                            isDarkMode ? "bg-white/5 border-white/10 text-white/70" : "bg-slate-100 border-slate-200 text-slate-600"
                                                                        )}>
                                                                            {getSlotDurationMinutes(slot, dayData.slotDuration)}m
                                                                        </span>
                                                                        {!isView && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleRemoveTimeSlot(day, index)}
                                                                                className={cn(
                                                                                    "p-2 rounded-lg",
                                                                                    isDarkMode
                                                                                        ? 'hover:bg-red-500/10 text-red-400'
                                                                                        : 'hover:bg-red-50 text-red-600'
                                                                                )}
                                                                            >
                                                                                <Trash2 size={14} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    {rowError && (
                                                                        <p className="text-xs text-red-500">{rowError}</p>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Drawer>
            <SpecializationDrawer
                isOpen={isSpecDrawerOpen}
                onClose={() => setIsSpecDrawerOpen(false)}
                specialization={selectedSpec}
                mode={specDrawerMode}
                isDarkMode={isDarkMode}
            />
            <ConfirmationModal
                isOpen={isSpecDeleteModalOpen}
                onClose={() => setIsSpecDeleteModalOpen(false)}
                onConfirm={confirmDeleteSpec}
                title="Delete Specialization"
                message={`Are you sure you want to delete this specialization? `}
                confirmText="Delete Specialization"
                variant="danger"
                isDarkMode={isDarkMode}
                isLoading={deleteSpecMutation.isPending}
            />
        </>
    );
};
