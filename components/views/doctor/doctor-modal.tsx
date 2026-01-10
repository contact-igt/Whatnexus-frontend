
"use client";

import { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Briefcase, Clock, Loader2, Plus, Trash2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { Doctor } from './doctor-management';
import { toast } from "sonner";

interface DoctorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (doctor: Doctor) => void;
    doctor: Doctor | null;
    mode: 'view' | 'edit' | 'create';
    isDarkMode: boolean;
}

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const SPECIALIZATIONS = [
    'Ophthalmology',
    'Optometry',
    'Cataract Surgery',
    'Retina Specialist',
    'Glaucoma Treatment',
    'Pediatric Eye Care',
    'Cornea Specialist',
    'Oculoplasty',
    'Neuro-Ophthalmology'
];

export const DoctorModal = ({
    isOpen,
    onClose,
    onSave,
    doctor,
    mode,
    isDarkMode
}: DoctorModalProps) => {
    const [formData, setFormData] = useState<Partial<Doctor>>({
        name: '',
        specialization: [],
        contact: '',
        email: '',
        currentStatus: 'available',
        consultationDuration: 30,
        availability: {
            monday: { enabled: false, slots: [] },
            tuesday: { enabled: false, slots: [] },
            wednesday: { enabled: false, slots: [] },
            thursday: { enabled: false, slots: [] },
            friday: { enabled: false, slots: [] },
            saturday: { enabled: false, slots: [] },
            sunday: { enabled: false, slots: [] }
        }
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (doctor && (mode === 'view' || mode === 'edit')) {
            setFormData(doctor);
        } else if (mode === 'create') {
            setFormData({
                name: '',
                specialization: [],
                contact: '',
                email: '',
                currentStatus: 'available',
                consultationDuration: 30,
                availability: {
                    monday: { enabled: false, slots: [] },
                    tuesday: { enabled: false, slots: [] },
                    wednesday: { enabled: false, slots: [] },
                    thursday: { enabled: false, slots: [] },
                    friday: { enabled: false, slots: [] },
                    saturday: { enabled: false, slots: [] },
                    sunday: { enabled: false, slots: [] }
                }
            });
        }
    }, [doctor, mode, isOpen]);

    const handleChange = (field: keyof Doctor, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSpecializationToggle = (spec: string) => {
        const current = formData.specialization || [];
        if (current.includes(spec)) {
            handleChange('specialization', current.filter(s => s !== spec));
        } else {
            handleChange('specialization', [...current, spec]);
        }
    };

    const handleDayToggle = (day: string) => {
        const availability = formData.availability || {};
        const dayData = availability[day] || { enabled: false, slots: [] };

        handleChange('availability', {
            ...availability,
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
        const availability = formData.availability || {};
        const dayData = availability[day] || { enabled: true, slots: [] };

        handleChange('availability', {
            ...availability,
            [day]: {
                ...dayData,
                slots: [...dayData.slots, { start: '09:00', end: '17:00' }]
            }
        });
    };

    const handleRemoveTimeSlot = (day: string, index: number) => {
        const availability = formData.availability || {};
        const dayData = availability[day] || { enabled: true, slots: [] };

        handleChange('availability', {
            ...availability,
            [day]: {
                ...dayData,
                slots: dayData.slots.filter((_, i) => i !== index)
            }
        });
    };

    const handleTimeSlotChange = (day: string, index: number, field: 'start' | 'end', value: string) => {
        const availability = formData.availability || {};
        const dayData = availability[day] || { enabled: true, slots: [] };

        const updatedSlots = dayData.slots.map((slot, i) =>
            i === index ? { ...slot, [field]: value } : slot
        );

        handleChange('availability', {
            ...availability,
            [day]: {
                ...dayData,
                slots: updatedSlots
            }
        });
    };

    const handleSubmit = () => {
        // Validation
        if (!formData.name?.trim()) {
            toast.error('Doctor name is required');
            return;
        }
        if (!formData.contact?.trim()) {
            toast.error('Contact number is required');
            return;
        }
        if (!formData.email?.trim()) {
            toast.error('Email is required');
            return;
        }
        if (!formData.specialization || formData.specialization.length === 0) {
            toast.error('At least one specialization is required');
            return;
        }

        setIsSaving(true);

        // Simulate API call
        setTimeout(() => {
            onSave(formData as Doctor);
            setIsSaving(false);
        }, 500);
    };

    const isView = mode === 'view';
    const isEdit = mode === 'edit';
    const isCreate = mode === 'create';

    const dialogTitle = isCreate ? 'Add New Doctor' : isEdit ? 'Edit Doctor' : 'Doctor Details';
    const dialogDescription = isCreate
        ? 'Add a new doctor to your hospital.'
        : isEdit
            ? 'Update doctor information and availability.'
            : 'View doctor information.';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={dialogTitle}
            description={dialogDescription}
            isDarkMode={isDarkMode}
            className="max-w-4xl"
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
                            <span>{isCreate ? 'Add Doctor' : 'Save Changes'}</span>
                        </button>
                    )}
                </div>
            }
        >
            <div className="space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
                {/* Basic Information */}
                <div className="space-y-4">
                    <h3 className={cn("text-sm font-semibold", isDarkMode ? "text-white" : "text-slate-900")}>
                        Basic Information
                    </h3>

                    {/* Name */}
                    <div>
                        <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                            Doctor Name *
                        </label>
                        <div className="relative">
                            <div className={cn("absolute left-3 top-2.5", isDarkMode ? "text-white/30" : "text-slate-400")}>
                                <User size={16} />
                            </div>
                            <input
                                type="text"
                                disabled={isView}
                                value={formData.name || ''}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="Dr. John Doe"
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

                    {/* Contact and Email */}
                    <div className="grid grid-cols-2 gap-4">
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
                                    value={formData.email || ''}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    placeholder="doctor@hospital.com"
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

                    {/* Status and Duration */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                                Current Status
                            </label>
                            <select
                                disabled={isView}
                                value={formData.currentStatus || 'available'}
                                onChange={(e) => handleChange('currentStatus', e.target.value)}
                                className={cn(
                                    "w-full px-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none capitalize",
                                    isView && "opacity-60 cursor-not-allowed",
                                    isDarkMode
                                        ? 'bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-emerald-500/30'
                                        : 'bg-white border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500/30'
                                )}
                            >
                                <option value="available">Available</option>
                                <option value="busy">Busy</option>
                                <option value="off-duty">Off Duty</option>
                            </select>
                        </div>

                        <div>
                            <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                                Consultation Duration (min)
                            </label>
                            <div className="relative">
                                <div className={cn("absolute left-3 top-2.5", isDarkMode ? "text-white/30" : "text-slate-400")}>
                                    <Clock size={16} />
                                </div>
                                <input
                                    type="number"
                                    disabled={isView}
                                    value={formData.consultationDuration || 30}
                                    onChange={(e) => handleChange('consultationDuration', parseInt(e.target.value))}
                                    min="15"
                                    step="15"
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
                </div>

                {/* Specializations */}
                <div className="space-y-3">
                    <h3 className={cn("text-sm font-semibold", isDarkMode ? "text-white" : "text-slate-900")}>
                        Specializations *
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {SPECIALIZATIONS.map((spec) => (
                            <button
                                key={spec}
                                type="button"
                                disabled={isView}
                                onClick={() => handleSpecializationToggle(spec)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                                    formData.specialization?.includes(spec)
                                        ? isDarkMode
                                            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                                            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                        : isDarkMode
                                            ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50',
                                    isView && "opacity-60 cursor-not-allowed"
                                )}
                            >
                                {spec}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Availability Schedule */}
                <div className="space-y-3">
                    <h3 className={cn("text-sm font-semibold", isDarkMode ? "text-white" : "text-slate-900")}>
                        Weekly Availability
                    </h3>
                    <div className="space-y-3">
                        {DAYS_OF_WEEK.map((day) => {
                            const dayData = formData.availability?.[day] || { enabled: false, slots: [] };
                            return (
                                <div
                                    key={day}
                                    className={cn(
                                        "p-4 rounded-xl border",
                                        isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                disabled={isView}
                                                checked={dayData.enabled}
                                                onChange={() => handleDayToggle(day)}
                                                className="w-4 h-4 rounded border-2 text-emerald-600 focus:ring-2 focus:ring-emerald-500/30"
                                            />
                                            <span className={cn("font-medium capitalize", isDarkMode ? "text-white" : "text-slate-900")}>
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
                                        <div className="space-y-2">
                                            {dayData.slots.map((slot, index) => (
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
        </Modal>
    );
};
