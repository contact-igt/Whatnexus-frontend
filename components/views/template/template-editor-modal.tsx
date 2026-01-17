"use client";

import { cn } from "@/lib/utils";
import { X, Info, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface TemplateEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (template: TemplateData) => void;
    isDarkMode: boolean;
    initialData?: TemplateData;
}

export interface TemplateData {
    name: string;
    category: string;
    language: string;
    templateType: string;
    specialty: string;
    body: string;
}

export const TemplateEditorModal = ({
    isOpen,
    onClose,
    onSave,
    isDarkMode,
    initialData
}: TemplateEditorModalProps) => {
    const [mounted, setMounted] = useState(false);
    const [formData, setFormData] = useState<TemplateData>({
        name: "",
        category: "",
        language: "English",
        templateType: "TEXT",
        specialty: "",
        body: ""
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    if (!mounted || !isOpen) return null;

    const categoryOptions = [
        { value: "MARKETING", label: "Marketing" },
        { value: "UTILITY", label: "Utility" },
        { value: "AUTHENTICATION", label: "Authentication" },
    ];

    const languageOptions = [
        { value: "English", label: "English" },
        { value: "Hindi", label: "Hindi" },
        { value: "Spanish", label: "Spanish" },
        { value: "French", label: "French" },
    ];

    const templateTypeOptions = [
        { value: "TEXT", label: "Text Only" },
        { value: "IMAGE", label: "Image + Text" },
        { value: "VIDEO", label: "Video + Text" },
        { value: "DOCUMENT", label: "Document + Text" },
    ];

    const specialtyOptions = [
        { value: "GENERAL", label: "General Medicine" },
        { value: "CARDIOLOGY", label: "Cardiology" },
        { value: "PEDIATRICS", label: "Pediatrics" },
        { value: "ORTHOPEDICS", label: "Orthopedics" },
        { value: "DERMATOLOGY", label: "Dermatology" },
        { value: "GYNECOLOGY", label: "Gynecology" },
        { value: "NEUROLOGY", label: "Neurology" },
        { value: "DENTISTRY", label: "Dentistry" },
    ];

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div
                className={cn(
                    "relative w-full max-w-6xl rounded-2xl shadow-2xl border animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col",
                    isDarkMode
                        ? 'bg-[#1c1c21] border-white/10'
                        : 'bg-white border-slate-200'
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <div>
                        <h2 className={cn("text-lg font-semibold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                            Create New Message Template
                        </h2>
                        <p className={cn("text-xs mt-1", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                            Design personalized WhatsApp templates for your patients
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className={cn(
                            "p-2 rounded-full transition-all duration-200",
                            isDarkMode
                                ? 'text-white/40 hover:bg-white/10 hover:text-white hover:rotate-90'
                                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900 hover:rotate-90'
                        )}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Panel - Form */}
                        <div className="space-y-5">
                            {/* Template Name */}
                            <Input
                                isDarkMode={isDarkMode}
                                label="Template Name"
                                placeholder="e.g., Appointment Confirmation"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />

                            <Select
                                isDarkMode={isDarkMode}
                                label="Message Category"
                                placeholder="Select category"
                                options={categoryOptions}
                                value={formData.category}
                                onChange={(value) => setFormData({ ...formData, category: value })}
                                required
                            />


                            <Select
                                isDarkMode={isDarkMode}
                                label="Language"
                                placeholder="Select language"
                                options={languageOptions}
                                value={formData.language}
                                onChange={(value) => setFormData({ ...formData, language: value })}
                            />

                            <Select
                                isDarkMode={isDarkMode}
                                label="Template Type"
                                placeholder="Select template type"
                                options={templateTypeOptions}
                                value={formData.templateType}
                                onChange={(value) => setFormData({ ...formData, templateType: value })}
                            />

                            <Select
                                isDarkMode={isDarkMode}
                                label="Medical Specialty"
                                placeholder="Select specialty (optional)"
                                options={specialtyOptions}
                                value={formData.specialty}
                                onChange={(value) => setFormData({ ...formData, specialty: value })}
                            />

                            {/* Body */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className={cn("text-xs font-semibold", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                                        Message Body
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <button
                                        className={cn(
                                            "text-xs font-semibold px-3 py-1 rounded-lg border transition-all duration-200 flex items-center gap-1",
                                            isDarkMode
                                                ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                        )}
                                    >
                                        <Plus size={12} />
                                        Add Variable
                                    </button>
                                </div>
                                <p className={cn("text-xs", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                    Personalize with variables like {'{patient_name}'}, {'{appointment_date}'}, {'{doctor_name}'}
                                </p>
                                <Textarea
                                    isDarkMode={isDarkMode}
                                    placeholder="e.g., Hello {patient_name}, this is a reminder for your appointment with Dr. {doctor_name} on {appointment_date} at {appointment_time}. Please arrive 15 minutes early."
                                    value={formData.body}
                                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                    rows={8}
                                    maxLength={1024}
                                    showCharCount
                                />
                            </div>
                        </div>

                        {/* Right Panel - Preview */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className={cn("text-sm font-semibold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                    Live Preview
                                </h3>
                                <span className={cn("text-xs", isDarkMode ? 'text-white/40' : 'text-slate-400')}>
                                    WhatsApp Business
                                </span>
                            </div>
                            <div className="flex justify-center">
                                {/* Phone Mockup */}
                                <div className={cn(
                                    "relative w-[280px] h-[560px] rounded-[3rem] border-8 shadow-2xl",
                                    isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-300 bg-slate-100'
                                )}>
                                    {/* Notch */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10" />

                                    {/* Screen */}
                                    <div className="absolute inset-2 rounded-[2.3rem] overflow-hidden bg-[#0a1014]">
                                        {/* WhatsApp Header */}
                                        <div className="bg-[#1f2c34] px-4 py-3 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                                                WN
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white text-xs font-semibold">WhatsNexus</p>
                                                <p className="text-white/60 text-[10px]">Healthcare Communication</p>
                                            </div>
                                        </div>

                                        <div className="p-4 h-[calc(100%-3rem)] overflow-y-auto custom-scrollbar">
                                            {formData.body ? (
                                                <div className="bg-[#005c4b] text-white px-3 py-2 rounded-lg text-xs max-w-[85%] shadow-lg">
                                                    <p className="whitespace-pre-wrap break-words">{formData.body}</p>
                                                    <p className="text-[10px] text-white/60 mt-1 text-right">
                                                        {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="text-white/30 text-xs text-center mt-8">
                                                    <p>Your message preview will appear here</p>
                                                    <p className="mt-2 text-[10px]">Start typing to see the preview</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={cn(
                    "p-6 border-t flex justify-end gap-3",
                    isDarkMode ? 'border-white/5' : 'border-slate-100'
                )}>
                    <button
                        onClick={onClose}
                        className={cn(
                            "px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200",
                            isDarkMode
                                ? 'bg-white/5 text-white hover:bg-white/10'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        )}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!formData.name || !formData.category || !formData.body}
                        className={cn(
                            "px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg shadow-emerald-500/20",
                            !formData.name || !formData.category || !formData.body
                                ? 'bg-slate-600 text-white/50 cursor-not-allowed'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        )}
                    >
                        Save Template
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
