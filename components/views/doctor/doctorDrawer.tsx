"use client";

import { useState, useEffect } from 'react';
import { User, Phone, Mail, Clock, Loader2, Plus, Trash2, Check, MinusCircle, XCircle, CheckCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Drawer } from "@/components/ui/drawer";
import { Select } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useCreateDoctorMutation, useUpdateDoctorMutation } from '@/hooks/useDoctorQuery';
import { useDeleteSpecializationMutation } from '@/hooks/useSpecializationsQuery';
import { SpecializationDrawer } from '../specialization/specializationDrawer';
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Doctor } from '@/services/doctor';

const doctorSchema = z.object({
    title: z.string().min(1, "Title is required"),
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    country_code: z.string().default("+91"),
    mobile: z.string().regex(/^\d{10}$/, "Mobile number must be 10 digits"),
    email: z.string().trim().email("Invalid email address"),
    currentStatus: z.string().default("available"),
    consultationDuration: z.coerce.number().min(5, "Duration must be at least 5 minutes"),
    bio: z.string().trim().min(10, "Bio is required (min 10 chars)").max(500, "Bio must be less than 500 characters").optional().or(z.literal('')),
    profile_pic: z.string().optional(),
    experience_years: z.preprocess((val) => Number(val), z.number({ message: "Experience is required" }).min(0, "Experience required (0+)")),
    qualification: z.string().trim().min(2, "Qualification is required (min 2 chars)"),
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

export const DoctorDrawer = ({
    isOpen,
    onClose,
    doctor,
    specializationsData,
    mode,
    isDarkMode
}: DoctorDrawerProps) => {
    const specializationsList = specializationsData || [];

    const { control, register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<DoctorFormValues>({
        resolver: zodResolver(doctorSchema) as any,
        defaultValues: {
            title: 'Dr.',
            name: '',
            country_code: '+91',
            mobile: '',
            email: '',
            currentStatus: 'available',
            consultationDuration: 30,
            bio: '',
            profile_pic: '',
            experience_years: 0,
            qualification: '',
            specializations: [],
        }
    });

    const formData = watch() as DoctorFormValues;

    const [availabilityMap, setAvailabilityMap] = useState<Record<string, { enabled: boolean; slots: Array<{ start: string; end: string }> }>>({});

    const createDoctorMutation = useCreateDoctorMutation();
    const updateDoctorMutation = useUpdateDoctorMutation();

    // Specialization Management States
    const [isSpecDrawerOpen, setIsSpecDrawerOpen] = useState(false);
    const [specDrawerMode, setSpecDrawerMode] = useState<'create' | 'edit'>('create');
    const [selectedSpec, setSelectedSpec] = useState<any>(null);
    const [specToDelete, setSpecToDelete] = useState<string | null>(null);
    const deleteSpecMutation = useDeleteSpecializationMutation();
    const [isSpecDeleteModalOpen, setIsSpecDeleteModalOpen] = useState(false);

    useEffect(() => {
        if (doctor && (mode === 'view' || mode === 'edit')) {
            // Specializations
            // Robust Specializations mapping
            const rawSpecs = doctor.specializations || (doctor as any).specialization || [];
            const specs = Array.isArray(rawSpecs)
                ? rawSpecs.map((s: any) => {
                    if (typeof s === 'string') {
                        // If it's an ID, try to find the name in the specializations list
                        const found = specializationsList.find((sp: any) => sp.specialization_id === s || sp.name === s);
                        return typeof found === 'object' ? found.name : s;
                    }
                    return s?.name || '';
                }).filter(Boolean)
                : [];

            // Robust Country Code mapping
            let countryCode = doctor.country_code || '+91';
            if (!countryCode.startsWith('+')) {
                countryCode = `+${countryCode}`;
            }

            reset({
                title: doctor.title || 'Dr.',
                name: doctor.name || '',
                country_code: countryCode,
                mobile: doctor.mobile || '',
                email: doctor.email || '',
                currentStatus: doctor.currentStatus || (doctor as any).status || 'available',
                consultationDuration: doctor.consultationDuration || 30,
                bio: doctor.bio || '',
                profile_pic: doctor.profile_pic || '',
                experience_years: doctor.experience_years || 0,
                qualification: doctor.qualification || '',
                specializations: specs,
            });

            // Convert availability to map
            const availMap: Record<string, any> = {};

            if (Array.isArray(doctor.availability)) {
                doctor.availability.forEach((slot: any) => {
                    const dayRaw = slot.day_of_week;
                    if (dayRaw) {
                        const day = dayRaw.charAt(0).toUpperCase() + dayRaw.slice(1).toLowerCase();
                        if (!availMap[day]) {
                            availMap[day] = { enabled: true, slots: [] };
                        }
                        availMap[day].slots.push({ start: slot.start_time, end: slot.end_time });
                    }
                });
            } else if (doctor.availability) {
                Object.keys(doctor.availability).forEach(day => {
                    const dayData = (doctor.availability as any)[day];
                    availMap[day] = {
                        enabled: dayData.enabled || false,
                        slots: dayData.slots || []
                    };
                });
            }
            setAvailabilityMap(availMap);
        } else if (mode === 'create') {
            reset({
                title: 'Dr.',
                name: '',
                country_code: '+91',
                mobile: '',
                email: '',
                currentStatus: 'available',
                consultationDuration: 30,
                bio: '',
                profile_pic: '',
                experience_years: 0,
                qualification: '',
                specializations: [],
            });
            setAvailabilityMap({});
        }
    }, [doctor, mode, isOpen, reset, specializationsList]);

    const handleDayToggle = (day: string) => {
        const dayData = availabilityMap[day] || { enabled: false, slots: [] };
        setAvailabilityMap({
            ...availabilityMap,
            [day]: {
                ...dayData,
                enabled: !dayData.enabled,
                slots: !dayData.enabled && dayData.slots.length === 0
                    ? [{ start: '09:00', end: '17:00' }]
                    : dayData.slots
            }
        });
    };

    const handleAddTimeSlot = (day: string) => {
        const dayData = availabilityMap[day] || { enabled: true, slots: [] };
        setAvailabilityMap({
            ...availabilityMap,
            [day]: {
                ...dayData,
                slots: [...dayData.slots, { start: '09:00', end: '17:00' }]
            }
        });
    };

    const handleRemoveTimeSlot = (day: string, index: number) => {
        const dayData = availabilityMap[day] || { enabled: true, slots: [] };
        setAvailabilityMap({
            ...availabilityMap,
            [day]: {
                ...dayData,
                slots: dayData.slots.filter((_, i) => i !== index)
            }
        });
    };

    const handleTimeSlotChange = (day: string, index: number, field: 'start' | 'end', value: string) => {
        const dayData = availabilityMap[day] || { enabled: true, slots: [] };
        const updatedSlots = dayData.slots.map((slot, i) =>
            i === index ? { ...slot, [field]: value } : slot
        );
        setAvailabilityMap({
            ...availabilityMap,
            [day]: {
                ...dayData,
                slots: updatedSlots
            }
        });
    };

    const handleAddSpec = () => {
        setSpecDrawerMode('create');
        setSelectedSpec(null);
        setIsSpecDrawerOpen(true);
    };

    const handleEditSpec = (specName: string) => {
        const spec = specializationsList.find((s: any) => s.name === specName || s.specialization_id === specName);
        if (spec && typeof spec === 'object') {
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
            await deleteSpecMutation.mutateAsync(specToDelete);
            setSpecToDelete(null);
            setIsSpecDeleteModalOpen(false);
        }
    };

    const onSubmit = async (data: DoctorFormValues) => {
        // Convert availability map to API format (Flat array)
        const availability = Object.keys(availabilityMap)
            .filter(day => availabilityMap[day].enabled)
            .flatMap(day => availabilityMap[day].slots.map(slot => ({
                day_of_week: day.toLowerCase(),
                start_time: slot.start,
                end_time: slot.end
            })));

        // Map selected specialization names to IDs
        const specializationIds = (data.specializations || []).map(name => {
            const spec = specializationsList.find((s: any) =>
                typeof s === 'object'
                    ? (s.name === name || s.specialization_id === name)
                    : s === name
            );
            return (typeof spec === 'object' ? spec.specialization_id : spec) || name;
        });

        const apiData: any = {
            ...data,
            specializations: specializationIds,
            availability: availability
        };

        try {
            if (mode === 'create') {
                await createDoctorMutation.mutateAsync(apiData);
            } else if (mode === 'edit' && doctor?.doctor_id) {
                await updateDoctorMutation.mutateAsync({ doctorId: doctor.doctor_id, data: apiData });
            }
            onClose();
        } catch (error) {
            // Error is handled by the mutation
        }
    };
    const isView = mode === 'view';
    const isEdit = mode === 'edit';
    const isCreate = mode === 'create';
    const isSaving = createDoctorMutation.isPending || updateDoctorMutation.isPending;

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
                                        {formData.title} {formData.name}
                                    </p>
                                </div>
                                <div>
                                    <label className={cn("text-xs font-semibold mb-2 block", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                        Status
                                    </label>
                                    <div className={cn(
                                        "inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                                        formData.currentStatus === 'available' && (isDarkMode ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border-emerald-200"),
                                        formData.currentStatus === 'busy' && (isDarkMode ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-amber-50 text-amber-700 border-amber-200"),
                                        (formData.currentStatus === 'off-duty' || !formData.currentStatus) && (isDarkMode ? "bg-slate-500/10 text-slate-400 border-slate-500/20" : "bg-slate-100 text-slate-600 border-slate-200")
                                    )}>
                                        {formData.currentStatus === 'available' && <CheckCircle size={12} />}
                                        {formData.currentStatus === 'busy' && <MinusCircle size={12} />}
                                        {(formData.currentStatus === 'off-duty' || !formData.currentStatus) && <XCircle size={12} />}
                                        <span className="capitalize">{formData.currentStatus?.replace('-', ' ') || 'Off Duty'}</span>
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
                                        {formData.consultationDuration} min
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
                                            </div>
                                            <div className="space-y-1">
                                                {dayData.slots.map((slot, index) => (
                                                    <div key={index} className={cn("text-xs px-2 py-1 rounded", isDarkMode ? "bg-white/10 text-white/80" : "bg-white text-slate-600 border border-slate-100")}>
                                                        {slot.start} - {slot.end}
                                                    </div>
                                                ))}
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
                                            required
                                            value={field.value}
                                            onChange={field.onChange}
                                            options={[
                                                { value: 'Dr.', label: 'Dr.' },
                                                { value: 'Prof.', label: 'Prof.' },
                                                { value: 'Mr.', label: 'Mr.' },
                                                { value: 'Ms.', label: 'Ms.' }
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
                                            required
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
                                        Mobile Number <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        isDarkMode={isDarkMode}
                                        icon={Phone}
                                        type="tel"
                                        disabled={isView}
                                        {...register("mobile")}
                                        placeholder="9876543210"
                                        error={errors.mobile?.message}
                                        variant="secondary"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    isDarkMode={isDarkMode}
                                    icon={Mail}
                                    type="email"
                                    disabled={isView}
                                    {...register("email")}
                                    placeholder="john.smith@example.com"
                                    error={errors.email?.message}
                                    variant="secondary"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Controller
                                        name="currentStatus"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                isDarkMode={isDarkMode}
                                                label="Current Status"
                                                required
                                                value={field.value}
                                                onChange={field.onChange}
                                                options={[
                                                    { value: 'available', label: 'Available' },
                                                    { value: 'busy', label: 'Busy' },
                                                    { value: 'off-duty', label: 'Off Duty' }
                                                ]}
                                                disabled={isView}
                                            />
                                        )}
                                    />
                                    {errors.currentStatus && (
                                        <p className="text-xs text-red-500 mt-1 ml-1">{errors.currentStatus.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                                        Consultation Duration (min) <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        isDarkMode={isDarkMode}
                                        icon={Clock}
                                        type="number"
                                        disabled={isView}
                                        {...register("consultationDuration")}
                                        min={5}
                                        step={5}
                                        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        error={errors.consultationDuration?.message}
                                        variant="secondary"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Qualification and Experience */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                                    Qualification <span className="text-red-500">*</span>
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
                                    Experience (Years) <span className="text-red-500">*</span>
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
                                    <div className="flex items-end gap-2">
                                        <div className="flex-1">
                                            <MultiSelect
                                                isDarkMode={isDarkMode}
                                                label="Specializations"
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
                                    const dayData = availabilityMap[day] || { enabled: false, slots: [] };
                                    return (
                                        <div
                                            key={day}
                                            className={cn(
                                                "p-4 rounded-xl border",
                                                isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                                            )}
                                        >
                                            <div className="flex items-center justify-between">
                                                <label className="flex items-center cursor-pointer group select-none">
                                                    <div className="relative">
                                                        <input
                                                            type="checkbox"
                                                            disabled={isView}
                                                            checked={dayData.enabled}
                                                            onChange={() => handleDayToggle(day)}
                                                            className="sr-only"
                                                        />
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
                                                </label>
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
                                            {dayData.enabled && (
                                                <div className="space-y-2 pl-9 mt-3">
                                                    {dayData.slots.map((slot: any, index: number) => (
                                                        <div key={index} className="flex items-center space-x-2">
                                                            <input
                                                                type="time"
                                                                disabled={isView}
                                                                value={slot.start}
                                                                onChange={(e) => handleTimeSlotChange(day, index, 'start', e.target.value)}
                                                                className={cn(
                                                                    "flex-1 px-3 py-2 rounded-lg text-sm border",
                                                                    isView && "opacity-60 cursor-not-allowed",
                                                                    isDarkMode
                                                                        ? 'bg-white/5 border-white/10 text-white'
                                                                        : 'bg-white border-slate-200 text-slate-900'
                                                                )}
                                                            />
                                                            <span className={cn(isDarkMode ? "text-white/40" : "text-slate-400")}>to</span>
                                                            <input
                                                                type="time"
                                                                disabled={isView}
                                                                value={slot.end}
                                                                onChange={(e) => handleTimeSlotChange(day, index, 'end', e.target.value)}
                                                                className={cn(
                                                                    "flex-1 px-3 py-2 rounded-lg text-sm border",
                                                                    isView && "opacity-60 cursor-not-allowed",
                                                                    isDarkMode
                                                                        ? 'bg-white/5 border-white/10 text-white'
                                                                        : 'bg-white border-slate-200 text-slate-900'
                                                                )}
                                                            />
                                                            {!isView && dayData.slots.length > 1 && (
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
                                                    ))}
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
