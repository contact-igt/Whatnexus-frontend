"use client";

import { cn } from "@/lib/utils";
import { Send, FileUp, ArrowLeft, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'next/navigation';
import { TemplateSelectionModal } from "@/components/ui/template-selection-modal";
import { CSVPreviewModal, CSVRow } from "@/components/ui/csv-preview-modal";

type TabType = 'single' | 'group' | 'csv';

interface Template {
    id: string;
    name: string;
    content: string;
}

// Generate campaign name helper
const generateCampaignName = () => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `CAMP-${randomNum}`;
};

export const ComposeMessageView = () => {
    const { isDarkMode } = useTheme();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('single');
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [isCsvPreviewOpen, setIsCsvPreviewOpen] = useState(false);
    const [csvData, setCsvData] = useState<CSVRow[]>([]);

    useEffect(() => {
        setCampaignName(generateCampaignName());
    }, []);

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

    const handleSendNow = () => {
        const data = {
            name: campaignName,
            tabType: activeTab,
            messageContent,
            type: scheduleType,
            scheduledDate: scheduleType === 'scheduled' ? scheduledDate : undefined,
            scheduledTime: scheduleType === 'scheduled' ? scheduledTime : undefined,
            countryCode: activeTab === 'single' ? countryCode : undefined,
            mobileNumber: activeTab === 'single' ? mobileNumber : undefined,
            contactGroup: activeTab === 'group' ? contactGroup : undefined,
            csvFile: activeTab === 'csv' ? csvFile : undefined,
            csvCountryCode: activeTab === 'csv' ? csvCountryCode : undefined,
            csvMobileField: activeTab === 'csv' ? csvMobileField : undefined,
        };

        console.log('Campaign Data:', data);
        // Handle the campaign launch logic here
        // You can add API calls or navigation as needed
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
            return csvFile !== null && csvMobileField.length > 0;
        }
        return false;
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCsvFile(file);
            parseCSV(file);
        }
    };

    const parseCSV = (file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const lines = text.split('\n').filter(line => line.trim());

            if (lines.length < 2) {
                alert('CSV file is empty or invalid');
                return;
            }

            // Parse header
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

            // Parse rows
            const data: CSVRow[] = [];
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim());
                const row: CSVRow = {};

                headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                });

                data.push(row);
            }

            setCsvData(data);
            setIsCsvPreviewOpen(true);
        };
        reader.readAsText(file);
    };

    const handleCsvSubmit = (data: CSVRow[]) => {
        console.log('CSV Data submitted:', data);
        // Handle CSV data submission here
    };

    const handleTemplateSelect = (template: Template) => {
        setMessageContent(template.content);
    };

    return (
        <div className="h-full overflow-y-auto p-10 space-y-6 animate-in slide-in-from-bottom-8 duration-700 max-w-[1400px] mx-auto no-scrollbar pb-32">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                isDarkMode
                                    ? 'hover:bg-white/10 text-white/60 hover:text-white'
                                    : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                            )}
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className={cn("text-3xl font-bold tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                Compose Message
                            </h1>
                            <p className={cn("text-sm mt-1", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                Home › Compose Message
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Card */}
            <div className={cn(
                "rounded-2xl shadow-xl border",
                isDarkMode
                    ? 'bg-[#1c1c21] border-white/10'
                    : 'bg-white border-slate-200'
            )}>
                {/* Tab Navigation */}
                <div className={cn(
                    "flex border-b",
                    isDarkMode ? 'border-white/5' : 'border-slate-200'
                )}>
                    <button
                        onClick={() => setActiveTab('single')}
                        className={cn(
                            "px-6 py-4 text-sm font-medium transition-all relative",
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
                            "px-6 py-4 text-sm font-medium transition-all relative",
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
                            "px-6 py-4 text-sm font-medium transition-all relative",
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
                <div className="p-8 space-y-6">
                    {/* Single MSG Tab */}
                    {activeTab === 'single' && (
                        <div className="space-y-5 animate-in fade-in duration-300">
                            <div className="grid grid-cols-3 gap-4">
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
                        <div className="space-y-5 animate-in fade-in duration-300">
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
                        <div className="space-y-5 animate-in fade-in duration-300">
                            {/* CSV File Upload Section */}
                            <div className="flex items-end gap-4">
                                <div className="flex-1">
                                    <label className={cn("text-sm font-medium block mb-2", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                                        Choose file
                                    </label>
                                    <div className={cn(
                                        "px-4 py-3 rounded-lg border text-sm",
                                        isDarkMode
                                            ? 'bg-white/5 border-white/10 text-white/60'
                                            : 'bg-slate-50 border-slate-200 text-slate-600'
                                    )}>
                                        {csvFile ? csvFile.name : 'No file chosen'}
                                    </div>
                                </div>
                                <div>
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="csv-file-upload"
                                    />
                                    <label
                                        htmlFor="csv-file-upload"
                                        className={cn(
                                            "px-6 py-3 rounded-lg text-sm font-semibold cursor-pointer transition-all inline-flex items-center gap-2",
                                            isDarkMode
                                                ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                                        )}
                                    >
                                        <Upload size={16} />
                                        Upload
                                    </label>
                                </div>
                            </div>

                            {/* File size info */}
                            <p className={cn("text-xs text-right", isDarkMode ? 'text-emerald-400' : 'text-emerald-600')}>
                                Upload CSV only. Max file size: 32 MB
                            </p>

                            {/* Country Code and Mobile Number Fields */}
                            <div className="grid grid-cols-2 gap-4">
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

                    {/* Message Content - Common for all tabs */}
                    <div>
                        <label className={cn("text-sm font-medium block mb-2", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                            Message Content
                        </label>
                        {messageContent ? (
                            <div className="relative">
                                <div className={cn(
                                    "w-full px-4 py-3 rounded-lg border text-sm min-h-[200px] whitespace-pre-wrap",
                                    isDarkMode
                                        ? 'bg-white/5 border-white/10 text-white/90'
                                        : 'bg-slate-50 border-slate-200 text-slate-900'
                                )}>
                                    {messageContent}
                                </div>
                                <button
                                    onClick={() => setIsTemplateModalOpen(true)}
                                    className={cn(
                                        "absolute top-2 right-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm",
                                        isDarkMode
                                            ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
                                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                                    )}
                                >
                                    Change Template
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsTemplateModalOpen(true)}
                                className={cn(
                                    "w-full border-2 border-dashed rounded-lg p-10 text-center transition-all cursor-pointer group",
                                    isDarkMode
                                        ? 'border-white/10 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5'
                                        : 'border-slate-200 bg-slate-50 hover:border-emerald-500/50 hover:bg-emerald-50'
                                )}
                            >
                                <FileUp className={cn(
                                    "mx-auto mb-3 transition-colors",
                                    isDarkMode ? 'text-white/40 group-hover:text-emerald-400' : 'text-slate-400 group-hover:text-emerald-600'
                                )} size={40} />
                                <p className={cn("text-sm font-medium mb-1", isDarkMode ? 'text-white/70 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900')}>
                                    Click here to select template
                                </p>
                                <p className={cn("text-xs", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                                    Choose from pre-designed message templates
                                </p>
                            </button>
                        )}
                    </div>

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
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setScheduleType('now')}
                                className={cn(
                                    "px-4 py-3 rounded-lg border text-sm font-medium transition-all",
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
                                    "px-4 py-3 rounded-lg border text-sm font-medium transition-all",
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
                            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
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
                            "px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200",
                            isDarkMode
                                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                                : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                        )}
                    >
                        Clear
                    </button>
                    <button
                        onClick={handleSendNow}
                        disabled={!isFormValid()}
                        className={cn(
                            "px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg flex items-center gap-2",
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

            {/* Template Selection Modal */}
            <TemplateSelectionModal
                isOpen={isTemplateModalOpen}
                onClose={() => setIsTemplateModalOpen(false)}
                onSelect={handleTemplateSelect}
                isDarkMode={isDarkMode}
            />

            {/* CSV Preview Modal */}
            <CSVPreviewModal
                isOpen={isCsvPreviewOpen}
                onClose={() => setIsCsvPreviewOpen(false)}
                onSubmit={handleCsvSubmit}
                csvData={csvData}
                countryCode={csvCountryCode}
                isDarkMode={isDarkMode}
            />
        </div>
    );
};
