"use client";

import { cn } from "@/lib/utils";
import { X, Send, Calendar as CalendarIcon, Users, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { GlassCard } from "@/components/ui/glass-card";


export interface LaunchCampaignData {
    name: string;
    audience: string;
    template: string;
    type: 'Broadcast' | 'Scheduled';
    scheduledDate?: string;
    audienceCount: number;
}

interface LaunchCampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLaunch: (data: LaunchCampaignData) => void;
    isDarkMode: boolean;
}

export const LaunchCampaignModal = ({
    isOpen,
    onClose,
    onLaunch,
    isDarkMode
}: LaunchCampaignModalProps) => {
    const [mounted, setMounted] = useState(false);
    const [campaignName, setCampaignName] = useState("");
    const [audience, setAudience] = useState("");
    const [template, setTemplate] = useState("");
    const [scheduleType, setScheduleType] = useState<'now' | 'later'>('now');
    const [scheduledDate, setScheduledDate] = useState("");

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            // Reset form when closed
            setTimeout(() => {
                setCampaignName("");
                setAudience("");
                setTemplate("");
                setScheduleType('now');
                setScheduledDate("");
            }, 300);
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    const audienceOptions = [
        { value: "ALL_PATIENTS", label: "All Patients (19,742)", count: 19742 },
        { value: "APPOINTMENT_DUE", label: "Appointment Due (450)", count: 450 },
        { value: "FOLLOW_UP_REQUIRED", label: "Follow-up Required (850)", count: 850 },
        { value: "NEW_LEADS", label: "New Leads (1,250)", count: 1250 },
        { value: "DERMATOLOGY_PATIENTS", label: "Dermatology Patients (3,200)", count: 3200 },
        { value: "CARDIOLOGY_PATIENTS", label: "Cardiology Patients (1,500)", count: 1500 },
    ];

    const templateOptions = [
        { value: "APPOINTMENT_REMINDER", label: "Appointment Reminder" },
        { value: "HEALTH_CHECKUP_OFFER", label: "Health Checkup Offer (Marketing)" },
        { value: "LAB_RESULTS_READY", label: "Lab Results Ready" },
        { value: "PRESCRIPTION_REFILL", label: "Prescription Refill" },
        { value: "GENERAL_ANNOUNCEMENT", label: "General Announcement" },
    ];

    const handleLaunch = () => {
        const selectedAudience = audienceOptions.find(opt => opt.value === audience);
        const audienceCount = selectedAudience ? selectedAudience.count : 0;

        onLaunch({
            name: campaignName,
            audience,
            template,
            type: scheduleType === 'now' ? 'Broadcast' : 'Scheduled',
            scheduledDate: scheduleType === 'later' ? scheduledDate : undefined,
            audienceCount
        });
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div
                className={cn(
                    "relative w-full max-w-2xl rounded-2xl shadow-2xl border animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]",
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
                            Launch New Campaign
                        </h2>
                        <p className={cn("text-xs mt-1", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                            Reach your patients with personalized WhatsApp messages
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
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
                    {/* Campaign Details */}
                    <div className="space-y-4">
                        <Input
                            isDarkMode={isDarkMode}
                            label="Campaign Name"
                            placeholder="e.g., January Health Checkup Drive"
                            value={campaignName}
                            onChange={(e) => setCampaignName(e.target.value)}
                            required
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select
                                isDarkMode={isDarkMode}
                                label="Target Audience"
                                placeholder="Select audience"
                                options={audienceOptions}
                                value={audience}
                                onChange={setAudience}
                                required
                            />
                            <Select
                                isDarkMode={isDarkMode}
                                label="Message Template"
                                placeholder="Select template"
                                options={templateOptions}
                                value={template}
                                onChange={setTemplate}
                                required
                            />
                        </div>
                    </div>

                    {/* Schedule Section */}
                    <div className="space-y-3">
                        <label className={cn("text-xs font-semibold block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                            Schedule Campaign
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setScheduleType('now')}
                                className={cn(
                                    "p-4 rounded-xl border transition-all flex flex-col items-center gap-2 text-center",
                                    scheduleType === 'now'
                                        ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500"
                                        : isDarkMode
                                            ? "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                )}
                            >
                                <Send size={20} />
                                <span className="text-sm font-semibold">Send Now</span>
                            </button>
                            <button
                                onClick={() => setScheduleType('later')}
                                className={cn(
                                    "p-4 rounded-xl border transition-all flex flex-col items-center gap-2 text-center",
                                    scheduleType === 'later'
                                        ? "bg-blue-500/10 border-blue-500/50 text-blue-500"
                                        : isDarkMode
                                            ? "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                )}
                            >
                                <CalendarIcon size={20} />
                                <span className="text-sm font-semibold">Schedule for Later</span>
                            </button>
                        </div>

                        {scheduleType === 'later' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <Input
                                    isDarkMode={isDarkMode}
                                    label="Select Date & Time"
                                    type="datetime-local"
                                    value={scheduledDate}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                    required
                                />
                            </div>
                        )}
                    </div>

                    {/* Summary Card */}
                    {audience && template && (
                        <div className={cn(
                            "rounded-xl p-4 border animate-in fade-in duration-300",
                            isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                        )}>
                            <div className="flex items-center gap-2 mb-2">
                                <Users size={14} className={isDarkMode ? 'text-white/60' : 'text-slate-500'} />
                                <span className={cn("text-xs", isDarkMode ? 'text-white/60' : 'text-slate-500')}>
                                    Estimated Reach
                                </span>
                            </div>
                            <div className="flex items-end gap-2">
                                <span className={cn("text-2xl font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                    {audience === 'ALL_PATIENTS' ? '19,742' : '450'}
                                </span>
                                <span className="text-xs text-emerald-500 font-medium mb-1">
                                    ~98% delivery rate
                                </span>
                            </div>
                        </div>
                    )}
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
                        onClick={handleLaunch}
                        disabled={!campaignName || !audience || !template || (scheduleType === 'later' && !scheduledDate)}
                        className={cn(
                            "px-8 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg shadow-emerald-500/20 flex items-center gap-2",
                            !campaignName || !audience || !template || (scheduleType === 'later' && !scheduledDate)
                                ? 'bg-slate-600 text-white/50 cursor-not-allowed'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105 active:scale-95'
                        )}
                    >
                        {scheduleType === 'now' ? (
                            <>
                                <Send size={16} />
                                Launch Campaign
                            </>
                        ) : (
                            <>
                                <CalendarIcon size={16} />
                                Schedule Campaign
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
