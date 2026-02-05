"use client";

import { cn } from "@/lib/utils";
import { X, Send, Calendar as CalendarIcon, Upload, FileUp } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type TabType = 'single' | 'group' | 'csv';

export interface LaunchCampaignData {
    name: string;
    tabType: TabType;
    // Single MSG fields
    countryCode?: string;
    mobileNumber?: string;
    // Group fields
    contactGroup?: string;
    // CSV fields
    csvFile?: File;
    csvCountryCode?: string;
    csvMobileField?: string;
    // Common fields
    messageContent: string;
    type: 'now' | 'scheduled';
    scheduledDate?: string;
    scheduledTime?: string;
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
    const [activeTab, setActiveTab] = useState<TabType>('single');

    // Common fields
    const [campaignName, setCampaignName] = useState("");
    const [messageContent, setMessageContent] = useState("");
    const [scheduleType, setScheduleType] = useState<'now' | 'scheduled'>('now');
    const [scheduledDate, setScheduledDate] = useState("");
    const [scheduledTime, setScheduledTime] = useState("");

    // Single MSG fields
    const [countryCode, setCountryCode] = useState("+91");
    const [mobileNumber, setMobileNumber] = useState("");

    // Group fields
    const [contactGroup, setContactGroup] = useState("");

    // CSV fields
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [csvCountryCode, setCsvCountryCode] = useState("+91");
    const [csvMobileField, setCsvMobileField] = useState("");

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
                setActiveTab('single');
                setCampaignName("");
                setMessageContent("");
                setScheduleType('now');
                setScheduledDate("");
                setScheduledTime("");
                setCountryCode("+91");
                setMobileNumber("");
                setContactGroup("");
                setCsvFile(null);
                setCsvCountryCode("+91");
                setCsvMobileField("");
            }, 300);
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    const countryCodeOptions = [
        { value: "+91", label: "+91 (India)" },
        { value: "+1", label: "+1 (USA)" },
        { value: "+44", label: "+44 (UK)" },
        { value: "+971", label: "+971 (UAE)" },
        { value: "+65", label: "+65 (Singapore)" },
    ];

    const contactGroupOptions = [
        { value: "all_contacts", label: "All Contacts" },
        { value: "vip_customers", label: "VIP Customers" },
        { value: "new_leads", label: "New Leads" },
        { value: "active_users", label: "Active Users" },
    ];

    const handleClear = () => {
        setCampaignName("");
        setMessageContent("");
        setScheduleType('now');
        setScheduledDate("");
        setScheduledTime("");
        setMobileNumber("");
        setContactGroup("");
        setCsvFile(null);
        setCsvMobileField("");
    };

    const handleLaunch = () => {
        const data: LaunchCampaignData = {
            name: campaignName,
            tabType: activeTab,
            messageContent,
            type: scheduleType,
            scheduledDate: scheduleType === 'scheduled' ? scheduledDate : undefined,
            scheduledTime: scheduleType === 'scheduled' ? scheduledTime : undefined,
        };

        if (activeTab === 'single') {
            data.countryCode = countryCode;
            data.mobileNumber = mobileNumber;
        } else if (activeTab === 'group') {
            data.contactGroup = contactGroup;
        } else if (activeTab === 'csv') {
            data.csvFile = csvFile || undefined;
            data.csvCountryCode = csvCountryCode;
            data.csvMobileField = csvMobileField;
        }

        onLaunch(data);
        onClose();
    };

    const isFormValid = () => {
        const baseValid = campaignName && messageContent;
        if (!baseValid) return false;

        if (scheduleType === 'scheduled' && (!scheduledDate || !scheduledTime)) return false;

        if (activeTab === 'single') {
            return mobileNumber.length > 0;
        } else if (activeTab === 'group') {
            return contactGroup.length > 0;
        } else if (activeTab === 'csv') {
            return csvFile !== null;
        }
        return false;
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCsvFile(file);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div
                className={cn(
                    "relative w-full max-w-3xl rounded-2xl shadow-2xl border animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]",
                    isDarkMode
                        ? 'bg-[#1c1c21] border-white/10'
                        : 'bg-white border-slate-200'
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <div>
                        <h2 className={cn("text-xl font-semibold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                            Compose Message
                        </h2>
                        <p className={cn("text-xs mt-1", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                            Home › Compose Message
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

                {/* Tab Navigation */}
                <div className={cn(
                    "flex border-b",
                    isDarkMode ? 'border-white/5' : 'border-slate-200'
                )}>
                    <button
                        onClick={() => setActiveTab('single')}
                        className={cn(
                            "px-6 py-3 text-sm font-medium transition-all relative",
                            activeTab === 'single'
                                ? isDarkMode
                                    ? 'text-emerald-500'
                                    : 'text-emerald-600'
                                : isDarkMode
                                    ? 'text-white/60 hover:text-white/80'
                                    : 'text-slate-600 hover:text-slate-900'
                        )}
                    >
                        Single MSG
                        {activeTab === 'single' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('group')}
                        className={cn(
                            "px-6 py-3 text-sm font-medium transition-all relative",
                            activeTab === 'group'
                                ? isDarkMode
                                    ? 'text-emerald-500'
                                    : 'text-emerald-600'
                                : isDarkMode
                                    ? 'text-white/60 hover:text-white/80'
                                    : 'text-slate-600 hover:text-slate-900'
                        )}
                    >
                        Group
                        {activeTab === 'group' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('csv')}
                        className={cn(
                            "px-6 py-3 text-sm font-medium transition-all relative",
                            activeTab === 'csv'
                                ? isDarkMode
                                    ? 'text-emerald-500'
                                    : 'text-emerald-600'
                                : isDarkMode
                                    ? 'text-white/60 hover:text-white/80'
                                    : 'text-slate-600 hover:text-slate-900'
                        )}
                    >
                        CSV
                        {activeTab === 'csv' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                        )}
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* Single MSG Tab */}
                    {activeTab === 'single' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-1">
                                    <Select
                                        isDarkMode={isDarkMode}
                                        label="Country Code"
                                        options={countryCodeOptions}
                                        value={countryCode}
                                        onChange={setCountryCode}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Input
                                        isDarkMode={isDarkMode}
                                        label="Mobile Number"
                                        placeholder="Enter the Mobile Number"
                                        value={mobileNumber}
                                        onChange={(e) => setMobileNumber(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Group Tab */}
                    {activeTab === 'group' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <Select
                                isDarkMode={isDarkMode}
                                label="Select from Contact Groups"
                                placeholder="Please select"
                                options={contactGroupOptions}
                                value={contactGroup}
                                onChange={setContactGroup}
                                required
                            />
                        </div>
                    )}

                    {/* CSV Tab */}
                    {activeTab === 'csv' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div>
                                <label className={cn("text-xs font-medium block mb-2", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                                    Message Content
                                </label>
                                <div className={cn(
                                    "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                                    isDarkMode
                                        ? 'border-white/10 bg-white/5 hover:border-emerald-500/30'
                                        : 'border-slate-200 bg-slate-50 hover:border-emerald-500/30'
                                )}>
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="csv-upload"
                                    />
                                    <label htmlFor="csv-upload" className="cursor-pointer">
                                        <FileUp className={cn(
                                            "mx-auto mb-3",
                                            isDarkMode ? 'text-white/40' : 'text-slate-400'
                                        )} size={32} />
                                        {csvFile ? (
                                            <p className={cn("text-sm font-medium", isDarkMode ? 'text-emerald-400' : 'text-emerald-600')}>
                                                {csvFile.name}
                                            </p>
                                        ) : (
                                            <>
                                                <p className={cn("text-sm mb-1", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                                    Click here to select template
                                                </p>
                                                <p className={cn("text-xs", isDarkMode ? 'text-white/40' : 'text-slate-400')}>
                                                    Upload CSV only. Max file size: 32 MB
                                                </p>
                                            </>
                                        )}
                                    </label>
                                    {csvFile && (
                                        <button
                                            onClick={() => setCsvFile(null)}
                                            className="mt-3 text-xs text-red-500 hover:text-red-600"
                                        >
                                            Remove file
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Select
                                    isDarkMode={isDarkMode}
                                    label="Country Code"
                                    options={countryCodeOptions}
                                    value={csvCountryCode}
                                    onChange={setCsvCountryCode}
                                />
                                <Select
                                    isDarkMode={isDarkMode}
                                    label="Mobile Number"
                                    placeholder="Select"
                                    options={[
                                        { value: "phone", label: "Phone" },
                                        { value: "mobile", label: "Mobile" },
                                        { value: "contact", label: "Contact" },
                                    ]}
                                    value={csvMobileField}
                                    onChange={setCsvMobileField}
                                />
                            </div>
                        </div>
                    )}

                    {/* Message Content - Common for Single and Group */}
                    {(activeTab === 'single' || activeTab === 'group') && (
                        <div>
                            <label className={cn("text-xs font-medium block mb-2", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                                Message Content
                            </label>
                            <div className={cn(
                                "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
                                isDarkMode
                                    ? 'border-white/10 bg-white/5 hover:border-emerald-500/30'
                                    : 'border-slate-200 bg-slate-50 hover:border-emerald-500/30'
                            )}>
                                <FileUp className={cn(
                                    "mx-auto mb-2",
                                    isDarkMode ? 'text-white/40' : 'text-slate-400'
                                )} size={28} />
                                <p className={cn("text-sm", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                    Click here to select template
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Campaign Name - Common for all tabs */}
                    <Input
                        isDarkMode={isDarkMode}
                        label="Campaign Name"
                        placeholder="CAMP-40185"
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        required
                    />

                    {/* Schedule Section */}
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setScheduleType('now')}
                                className={cn(
                                    "px-4 py-2.5 rounded-lg border text-sm font-medium transition-all",
                                    scheduleType === 'now'
                                        ? "bg-emerald-500 text-white border-emerald-500"
                                        : isDarkMode
                                            ? "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                )}
                            >
                                Send Now
                            </button>
                            <button
                                onClick={() => setScheduleType('scheduled')}
                                className={cn(
                                    "px-4 py-2.5 rounded-lg border text-sm font-medium transition-all",
                                    scheduleType === 'scheduled'
                                        ? "bg-emerald-500 text-white border-emerald-500"
                                        : isDarkMode
                                            ? "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                )}
                            >
                                Schedule Later
                            </button>
                        </div>

                        {scheduleType === 'scheduled' && (
                            <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <Input
                                    isDarkMode={isDarkMode}
                                    label="Select Date"
                                    type="date"
                                    value={scheduledDate}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                    required
                                />
                                <Input
                                    isDarkMode={isDarkMode}
                                    label="Select Time"
                                    type="time"
                                    value={scheduledTime}
                                    onChange={(e) => setScheduledTime(e.target.value)}
                                    required
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className={cn(
                    "p-6 border-t flex justify-end gap-3",
                    isDarkMode ? 'border-white/5' : 'border-slate-100'
                )}>
                    <button
                        onClick={handleClear}
                        className={cn(
                            "px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200",
                            isDarkMode
                                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                                : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                        )}
                    >
                        Clear
                    </button>
                    <button
                        onClick={handleLaunch}
                        disabled={!isFormValid()}
                        className={cn(
                            "px-8 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg flex items-center gap-2",
                            !isFormValid()
                                ? 'bg-slate-600 text-white/50 cursor-not-allowed'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105 active:scale-95 shadow-emerald-500/20'
                        )}
                    >
                        <Send size={16} />
                        Send Now
                        <span className={cn(
                            "ml-1 text-xs",
                            !isFormValid() ? 'text-white/30' : 'text-white/70'
                        )}>▼</span>
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
