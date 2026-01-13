
"use client";

import { useState } from 'react';
import { FileText, Plus, Search, RefreshCw, TrendingUp, Star, Calendar, Heart, Pill, FlaskConical, DollarSign, Shield, Activity, Eye, Copy, Trash2, Sparkles, Wand2, ArrowRight } from 'lucide-react';
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { useTheme } from '@/hooks/useTheme';
import { TemplateCard } from '@/components/ui/template-card';
import { CreateTemplateModal } from '@/components/views/template/create-template-modal';
import { TemplateData, TemplateEditorModal } from '@/components/views/template/template-editor-modal';
import { AIPromptModal } from '@/components/views/template/ai-prompt-modal';
import { RoleBasedWrapper } from '@/components/ui/role-based-wrapper';
import { callOpenAI } from '@/lib/openai';

type TabType = 'explore' | 'all' | 'draft' | 'pending' | 'approved' | 'action-required' | 'admin-only';
type FilterType = 'trending' | 'marketing' | 'utility' | 'authentication' | 'appointments' | 'follow-ups' | 'prescriptions' | 'lab-results';

interface Template {
    id: string;
    name: string;
    description: string;
    category: string;
    status: string;
    type: string;
    health: string;
    createdAt: string;
    badge?: string;
    badgeColor?: string;
}

const SAMPLE_TEMPLATES: Template[] = [
    {
        id: '1',
        name: 'Appointment Reminder',
        description: 'Hello {patient_name}, this is a reminder for your appointment with Dr. {doctor_name} on {date} at {time}. Please arrive 15 minutes early with your medical records.',
        category: 'UTILITY',
        status: 'APPROVED',
        type: 'TEXT',
        health: 'High',
        createdAt: 'January 10, 2026',
        badge: 'UTILITY',
        badgeColor: 'blue'
    },
    {
        id: '2',
        name: 'Lab Results Ready',
        description: 'Dear {patient_name}, your lab results are now available. Please visit our clinic or check your patient portal to view them. For questions, contact us at {clinic_phone}.',
        category: 'UTILITY',
        status: 'APPROVED',
        type: 'TEXT',
        health: 'High',
        createdAt: 'January 9, 2026',
        badge: 'UTILITY',
        badgeColor: 'emerald'
    },
    {
        id: '3',
        name: 'Health Checkup Offer',
        description: 'Hi {patient_name}, get 20% off on your annual health checkup this month! Book now and prioritize your health. Limited time offer.',
        category: 'MARKETING',
        status: 'APPROVED',
        type: 'TEXT',
        health: 'High',
        createdAt: 'January 8, 2026',
        badge: 'MARKETING',
        badgeColor: 'purple'
    },
    {
        id: '4',
        name: 'Prescription Reminder',
        description: 'Dear {patient_name}, your prescription for {medication_name} is ready for pickup at {pharmacy_name}. Valid until {expiry_date}.',
        category: 'UTILITY',
        status: 'APPROVED',
        type: 'TEXT',
        health: 'High',
        createdAt: 'January 7, 2026',
        badge: 'UTILITY',
        badgeColor: 'orange'
    },
];

export const TemplateView = () => {
    const { isDarkMode } = useTheme();
    const [activeTab, setActiveTab] = useState<TabType>('explore');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('trending');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
    const [isAIPromptModalOpen, setIsAIPromptModalOpen] = useState(false);
    const [templates, setTemplates] = useState<Template[]>(SAMPLE_TEMPLATES);

    const tabs: { id: TabType; label: string; icon?: React.ReactNode; allowedRoles?: string[] }[] = [
        { id: 'explore', label: 'Explore', icon: <TrendingUp size={14} /> },
        { id: 'all', label: 'All' },
        { id: 'draft', label: 'Draft' },
        { id: 'pending', label: 'Pending' },
        { id: 'approved', label: 'Approved' },
        { id: 'action-required', label: 'Action Required' },
        { id: 'admin-only', label: 'Admin Only', icon: <Shield size={14} />, allowedRoles: ['admim', 'super_admin'] },
    ];

    const filters: { id: FilterType; label: string; icon: React.ReactNode }[] = [
        { id: 'trending', label: 'Most Used', icon: <TrendingUp size={16} className="text-orange-500" /> },
        { id: 'marketing', label: 'Marketing', icon: <Star size={16} className="text-purple-500" /> },
        { id: 'utility', label: 'Utility', icon: <FileText size={16} className="text-blue-500" /> },
        { id: 'authentication', label: 'Authentication', icon: <Shield size={16} className="text-emerald-500" /> },
        { id: 'appointments', label: 'Appointments', icon: <Calendar size={16} className="text-indigo-500" /> },
        { id: 'follow-ups', label: 'Follow-ups', icon: <Activity size={16} className="text-cyan-500" /> },
        { id: 'prescriptions', label: 'Prescriptions', icon: <Pill size={16} className="text-pink-500" /> },
        { id: 'lab-results', label: 'Lab Results', icon: <FlaskConical size={16} className="text-teal-500" /> },
    ];

    const [editorInitialData, setEditorInitialData] = useState<TemplateData | undefined>(undefined);

    const TEMPLATE_SYSTEM_PROMPT = `
You are a WhatsApp Business template generator.

Rules:
- Generate Meta-approved WhatsApp templates only.
- Use professional and polite language.
- Use variables like {{patient_name}}, {{doctor_name}}, {{date}}, {{time}}, {{clinic_name}} when needed.
- Do NOT include emojis.
- Output ONLY the template body text.
- Keep the content concise and compliant.

Template categories:
- UTILITY: reminders, confirmations, alerts
- MARKETING: offers, promotions
- AUTHENTICATION: OTP, verification

If the user intent is unclear, generate a GENERAL UTILITY template.
`;


    const handleStartFromScratch = () => {
        setIsCreateModalOpen(false);
        setEditorInitialData(undefined);
        setIsEditorModalOpen(true);
    };

    const handleUseTemplate = () => {
        setIsCreateModalOpen(false);
        setEditorInitialData(undefined);
        setIsEditorModalOpen(true);
    };

    const handleGenerateAI = () => {
        setIsCreateModalOpen(false);
        setIsAIPromptModalOpen(true);
    };

    const handleAIGenerate = async (prompt: string) => {
        try {
            const aiResponse = await callOpenAI(
                prompt,
                TEMPLATE_SYSTEM_PROMPT
            );

            setEditorInitialData(aiResponse);
            setIsEditorModalOpen(true);
        } catch (error) {
            console.error("AI template generation failed", error);
        }
    };

    const handleSaveTemplate = (templateData: TemplateData) => {
        const newTemplate: Template = {
            id: Date.now().toString(),
            name: templateData.name,
            description: templateData.body.substring(0, 100) + '...',
            category: templateData.category,
            status: 'DRAFT',
            type: templateData.templateType,
            health: 'High',
            createdAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        };
        setTemplates([newTemplate, ...templates]);
    };

    return (
        <div className="h-full overflow-y-auto p-10 space-y-8 animate-in slide-in-from-bottom-8 duration-700 max-w-[1600px] mx-auto no-scrollbar pb-32">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-emerald-500">
                        <FileText size={16} className="animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Message Templates</span>
                    </div>
                    <h1 className={cn("text-4xl font-bold tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>
                        Manage Template
                    </h1>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="h-12 px-6 rounded-xl font-bold text-xs uppercase tracking-wide bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
                >
                    <Plus size={16} />
                    <span>New</span>
                </button>
            </div>

            {/* AI Generator Bar */}
            <GlassCard isDarkMode={isDarkMode} className="relative overflow-hidden border-0 p-1">
                <div className={cn(
                    "absolute inset-0 opacity-20",
                    isDarkMode
                        ? "bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-emerald-500/30"
                        : "bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-emerald-500/20"
                )} />
                <div className={cn(
                    "relative rounded-xl p-8 flex flex-col md:flex-row items-center gap-8",
                    isDarkMode ? "bg-black/40" : "bg-white/60"
                )}>
                    <div className="flex-shrink-0 p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 text-white shadow-lg shadow-purple-500/30">
                        <Wand2 size={32} />
                    </div>
                    <div className="flex-1 space-y-2 text-center md:text-left">
                        <h3 className={cn("text-xl font-bold", isDarkMode ? "text-white" : "text-slate-900")}>
                            Generate Templates with AI
                        </h3>
                        <p className={cn("text-sm", isDarkMode ? "text-white/70" : "text-slate-600")}>
                            Simply describe what you need, and our AI will create a professional, compliant message template for you instantly.
                        </p>
                    </div>
                    <div className="w-full md:w-auto relative group">
                        <div className={cn(
                            "absolute -inset-1 rounded-xl blur opacity-50 group-hover:opacity-60 transition duration-1000",
                            isDarkMode ? "bg-gradient-to-br from-purple-500 to-blue-500" : "bg-gradient-to-r from-purple-400 to-blue-400"
                        )} />
                        <button
                            onClick={() => setIsAIPromptModalOpen(true)}
                            className={cn(
                                "relative w-full md:w-auto px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]",
                                isDarkMode
                                    ? "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                                    : "bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 shadow-sm"
                            )}
                        >
                            <Sparkles size={16} className="text-purple-500" />
                            <span>Try AI Generator</span>
                            <ArrowRight size={16} className="opacity-50" />
                        </button>
                    </div>
                </div>
            </GlassCard>

            {/* Quick Guide Banner */}
            {/* <GlassCard isDarkMode={isDarkMode} className="p-6 bg-emerald-500/5 border-emerald-500/20">
                <div className="space-y-3">
                    <h3 className="font-bold text-sm uppercase tracking-wide">Quick Guide</h3>
                    <p className={cn("text-xs", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                        Streamline patient communication with WhatsApp message templates for appointments, reminders, and health updates.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <a href="#" className="text-emerald-500 hover:text-emerald-400 flex items-center gap-2">
                            <FileText size={12} />
                            How to Create Patient Message Templates
                        </a>
                        <a href="#" className="text-emerald-500 hover:text-emerald-400 flex items-center gap-2">
                            <FileText size={12} />
                            Using Variables for Personalization
                        </a>
                        <a href="#" className="text-emerald-500 hover:text-emerald-400 flex items-center gap-2">
                            <FileText size={12} />
                            Appointment Reminder Best Practices
                        </a>
                        <a href="#" className="text-emerald-500 hover:text-emerald-400 flex items-center gap-2">
                            <FileText size={12} />
                            HIPAA-Compliant Messaging Guidelines
                        </a>
                    </div>
                </div>
            </GlassCard> */}

            {/* Search and Sync */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search size={18} className={cn("absolute left-4 top-1/2 -translate-y-1/2", isDarkMode ? 'text-white/30' : 'text-slate-400')} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search templates (status, name etc.)"
                        className={cn(
                            "w-full pl-12 pr-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all",
                            isDarkMode
                                ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30'
                                : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                        )}
                    />
                </div>
                <button
                    className={cn(
                        "px-6 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 flex items-center gap-2",
                        isDarkMode
                            ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    )}
                >
                    <RefreshCw size={16} />
                    Sync Status
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/5 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => {
                    const TabElement = (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "px-4 py-3 text-sm font-semibold transition-all duration-200 border-b-2 flex items-center gap-2 whitespace-nowrap",
                                activeTab === tab.id
                                    ? 'border-emerald-500 text-emerald-500'
                                    : isDarkMode
                                        ? 'border-transparent text-white/50 hover:text-white/80'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                            )}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    );

                    if (tab.allowedRoles) {
                        return (
                            <RoleBasedWrapper key={tab.id} allowedRoles={tab.allowedRoles}>
                                {TabElement}
                            </RoleBasedWrapper>
                        );
                    }

                    return TabElement;
                })}
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Admin Only Content */}
                {activeTab === 'admin-only' && (
                    <div className="lg:col-span-4">
                        <GlassCard isDarkMode={isDarkMode} className="p-10 flex flex-col items-center justify-center space-y-4 border-dashed border-2">
                            <Shield size={48} className="text-emerald-500 opacity-50" />
                            <div className="text-center">
                                <h3 className={cn("text-lg font-bold", isDarkMode ? "text-white" : "text-slate-900")}>Admin Restricted Area</h3>
                                <p className={cn("text-sm max-w-md mt-2", isDarkMode ? "text-white/60" : "text-slate-500")}>
                                    This section allows you to manage system-wide template settings and approval workflows. Only users with ADMIN privileges can see this.
                                </p>
                            </div>
                        </GlassCard>
                    </div>
                )}


                {/* Filters Sidebar */}
                {activeTab === 'explore' && (
                    <div className="space-y-3">
                        {filters.map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => setSelectedFilter(filter.id)}
                                className={cn(
                                    "w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-3",
                                    selectedFilter === filter.id
                                        ? isDarkMode
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                            : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                        : isDarkMode
                                            ? 'bg-white/5 text-white/60 hover:bg-white/10 border border-transparent'
                                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent'
                                )}
                            >
                                {filter.icon}
                                {filter.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Templates Grid/Table */}
                <div className={cn(activeTab === 'explore' ? 'lg:col-span-3' : 'lg:col-span-4')}>
                    {activeTab === 'explore' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {templates.map((template) => (
                                <TemplateCard
                                    key={template.id}
                                    name={template.name}
                                    description={template.description}
                                    category={template.category}
                                    type={template.type}
                                    badge={template.badge}
                                    badgeColor={template.badgeColor}
                                    isDarkMode={isDarkMode}
                                    onPreview={() => console.log('Preview', template.id)}
                                    onSubmit={() => console.log('Submit', template.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <GlassCard isDarkMode={isDarkMode} className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left min-w-[900px]">
                                    <thead>
                                        <tr className={cn("text-[10px] font-bold uppercase tracking-wider border-b", isDarkMode ? 'text-white/30 border-white/5' : 'text-slate-400 border-slate-200')}>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Category</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Type</th>
                                            <th className="px-6 py-4">Health</th>
                                            <th className="px-6 py-4">Created At</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className={cn("divide-y", isDarkMode ? 'divide-white/5' : 'divide-slate-100')}>
                                        {templates.map((template) => (
                                            <tr key={template.id} className="group transition-all hover:bg-emerald-500/5">
                                                <td className="px-6 py-4">
                                                    <p className={cn("text-sm font-semibold", isDarkMode ? 'text-white' : 'text-slate-800')}>{template.name}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={cn("text-xs font-medium", isDarkMode ? 'text-white/60' : 'text-slate-600')}>{template.category}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={cn(
                                                        "text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wide",
                                                        template.status === 'APPROVED'
                                                            ? 'bg-emerald-500/10 text-emerald-500'
                                                            : 'bg-yellow-500/10 text-yellow-500'
                                                    )}>
                                                        {template.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={cn("text-xs font-medium", isDarkMode ? 'text-white/60' : 'text-slate-600')}>{template.type}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-semibold px-2 py-1 rounded bg-emerald-500/10 text-emerald-500">{template.health}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={cn("text-xs", isDarkMode ? 'text-white/40' : 'text-slate-500')}>{template.createdAt}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button className={cn("p-2 rounded-lg transition-all", isDarkMode ? 'hover:bg-white/10 text-white/60' : 'hover:bg-slate-100 text-slate-600')}>
                                                            <Eye size={16} />
                                                        </button>
                                                        <button className={cn("p-2 rounded-lg transition-all", isDarkMode ? 'hover:bg-white/10 text-white/60' : 'hover:bg-slate-100 text-slate-600')}>
                                                            <Copy size={16} />
                                                        </button>
                                                        <button className={cn("p-2 rounded-lg transition-all", isDarkMode ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-600')}>
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </GlassCard>
                    )}
                </div>
            </div>

            <CreateTemplateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onStartFromScratch={handleStartFromScratch}
                onUseTemplate={handleUseTemplate}
                onGenerateAI={handleGenerateAI}
                isDarkMode={isDarkMode}
            />

            <TemplateEditorModal
                isOpen={isEditorModalOpen}
                onClose={() => setIsEditorModalOpen(false)}
                onSave={handleSaveTemplate}
                isDarkMode={isDarkMode}
                initialData={editorInitialData}
            />

            <AIPromptModal
                isOpen={isAIPromptModalOpen}
                onClose={() => setIsAIPromptModalOpen(false)}
                onGenerate={handleAIGenerate}
                isDarkMode={isDarkMode}
            />
        </div>
    );
};