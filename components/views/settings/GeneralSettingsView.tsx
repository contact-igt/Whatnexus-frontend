"use client";

import { useState, useEffect, useRef } from 'react';
import { Bot, Brain, Wand2, Sparkles, Bell, BellOff, Settings2, CheckCircle2, Lock, Loader2, MessageSquare, Zap, ChevronRight, Users, Save, Cpu } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useTheme } from '@/hooks/useTheme';
import { useGetTenantSettingsQuery, useUpdateTenantAiSettingsMutation, useUpdateTenantGeneralSettingsMutation } from '@/hooks/useTenantSettingsQuery';
import { useGetAvailableAiModelsQuery } from '@/hooks/useBillingQuery';
import { useAuth } from '@/redux/selectors/auth/authSelector';
import { toast } from 'sonner';

type SettingsTab = 'capabilities' | 'models' | 'notifications' | 'contacts';

interface AiSettings {
    auto_responder: boolean;
    smart_reply: boolean;
    neural_summary: boolean;
    content_generation: boolean;
}

interface FeatureToggleProps {
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    title: string;
    description: string;
    enabled: boolean;
    isAdminOnly?: boolean;
    isAdmin: boolean;
    isDarkMode: boolean;
    onToggle: () => void;
    isLoading?: boolean;
}

const FeatureToggle: React.FC<FeatureToggleProps> = ({
    icon: Icon,
    iconColor,
    iconBg,
    title,
    description,
    enabled,
    isAdminOnly = false,
    isAdmin,
    isDarkMode,
    onToggle,
    isLoading,
}) => {
    const canToggle = !isAdminOnly || isAdmin;

    return (
        <div className={cn(
            "flex items-start gap-5 p-5 rounded-2xl border transition-all duration-200 group",
            isDarkMode
                ? "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/10"
                : "bg-white border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md"
        )}>
            {/* Icon */}
            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5", iconBg)}>
                <Icon size={20} className={iconColor} />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
                <p className={cn("font-semibold text-sm mb-1", isDarkMode ? "text-white" : "text-slate-900")}>{title}</p>
                <p className={cn("text-xs leading-relaxed", isDarkMode ? "text-slate-400" : "text-slate-500")}>{description}</p>
                {isAdminOnly && !isAdmin && (
                    <div className={cn("mt-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest", isDarkMode ? "text-amber-400/70" : "text-amber-600/80")}>
                        <Lock size={10} /> Admin only
                    </div>
                )}
            </div>

            {/* Toggle */}
            <div className="shrink-0 flex items-center gap-2 mt-0.5">
                {!canToggle && <Lock size={14} className={isDarkMode ? "text-slate-600" : "text-slate-300"} />}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (canToggle && !isLoading) onToggle();
                    }}
                    disabled={!canToggle || isLoading}
                    className={cn(
                        "relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none",
                        !canToggle ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                        enabled
                            ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                            : isDarkMode ? "bg-white/10" : "bg-slate-200"
                    )}
                    aria-label={`Toggle ${title}`}
                >
                    <span className={cn(
                        "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300",
                        enabled ? "translate-x-6" : "translate-x-0"
                    )}>
                    </span>
                </button>
            </div>
        </div>
    );
};

export const GeneralSettingsView = () => {
    const { isDarkMode } = useTheme();
    const { user } = useAuth();
    const isAdmin = user?.role === 'tenant_admin';

    const [activeTab, setActiveTab] = useState<SettingsTab>('capabilities');
    const [localSettings, setLocalSettings] = useState<AiSettings | null>(null);

    const { data: settingsData, isLoading: isSettingsLoading } = useGetTenantSettingsQuery();
    const { mutate: updateAiSettings, isPending: isUpdating } = useUpdateTenantAiSettingsMutation();
    const { mutate: updateGeneralSettings, isPending: isUpdatingGeneral } = useUpdateTenantGeneralSettingsMutation();

    const [defaultContactName, setDefaultContactName] = useState<string>('');
    const [selectedInputModel, setSelectedInputModel] = useState<string | null>(null);
    const [selectedOutputModel, setSelectedOutputModel] = useState<string | null>(null);
    const hasSyncedContactName = useRef(false);
    const hasSyncedModels = useRef(false);

    const { data: modelsData, isLoading: isModelsLoading } = useGetAvailableAiModelsQuery();

    // Sync state ONCE on initial data load — never overwrite after that (to avoid race condition after save)
    useEffect(() => {
        if (!hasSyncedContactName.current && settingsData?.data !== undefined) {
            hasSyncedContactName.current = true;
            setDefaultContactName(settingsData.data.default_contact_name || '');
        }
        if (!hasSyncedModels.current && settingsData?.data?.ai_settings !== undefined) {
            hasSyncedModels.current = true;
            setSelectedInputModel(settingsData.data.ai_settings?.input_model || 'gpt-4o-mini');
            setSelectedOutputModel(settingsData.data.ai_settings?.output_model || 'gpt-4o');
        }
    }, [settingsData?.data]);

    const aiSettings: AiSettings = localSettings ?? {
        auto_responder: settingsData?.data?.ai_settings?.auto_responder ?? true,
        smart_reply: settingsData?.data?.ai_settings?.smart_reply ?? true,
        neural_summary: settingsData?.data?.ai_settings?.neural_summary ?? true,
        content_generation: settingsData?.data?.ai_settings?.content_generation ?? true,
    };

    const handleToggle = (key: keyof AiSettings) => {
        if (!isAdmin) return;
        const newVal = !aiSettings[key];
        const newSettings = { ...aiSettings, [key]: newVal };
        setLocalSettings(newSettings); // Optimistic

        updateAiSettings(
            { ai_settings: { [key]: newVal } },
            {
                onSuccess: () => {
                    toast.success(`"${key.replace(/_/g, ' ')}" updated successfully`);
                },
                onError: (err: any) => {
                    toast.error(err?.message || "Failed to update settings");
                },
                onSettled: () => {
                    // Only clear correctly once the cache is updated in the hook or reverted by the server
                    setLocalSettings(null);
                }
            }
        );
    };

    const handleSaveContactSettings = () => {
        if (!isAdmin) return;

        const trimmedName = defaultContactName.trim();
        if (!trimmedName) {
            toast.error("Default contact name is required.");
            return;
        }
        if (trimmedName.length > 50) {
            toast.error("Contact name cannot exceed 50 characters.");
            return;
        }

        updateGeneralSettings(
            { default_contact_name: trimmedName },
            {
                onSuccess: () => {
                    toast.success("Contact settings updated successfully");
                    setDefaultContactName(trimmedName); // Update UI to reflect trimmed name
                },
                onError: (err: any) => {
                    console.error("API Error in handleSaveContactSettings:", err);
                    toast.error(err?.response?.data?.message || err?.message || "Failed to update contact settings");
                }
            }
        );
    };

    const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
        { id: 'capabilities', label: 'AI Capabilities', icon: Sparkles },
        { id: 'models', label: 'AI Models', icon: Cpu },
        { id: 'contacts', label: 'Contact Settings', icon: Users },
        // { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    const handleModelChange = (type: 'input' | 'output', model: string) => {
        if (!isAdmin) return;

        if (type === 'input') {
            setSelectedInputModel(model);
        } else {
            setSelectedOutputModel(model);
        }

        updateAiSettings(
            { ai_settings: { [`${type}_model`]: model } },
            {
                onSuccess: () => {
                    toast.success(`${type === 'input' ? 'Input' : 'Output'} model updated to ${model}`);
                },
                onError: (err: any) => {
                    toast.error(err?.response?.data?.message || err?.message || "Failed to update model");
                    // Revert on error
                    if (type === 'input') {
                        setSelectedInputModel(settingsData?.data?.ai_settings?.input_model || 'gpt-4o-mini');
                    } else {
                        setSelectedOutputModel(settingsData?.data?.ai_settings?.output_model || 'gpt-4o');
                    }
                }
            }
        );
    };

    const aiFeatures: {
        key: keyof AiSettings;
        icon: React.ElementType;
        iconColor: string;
        iconBg: string;
        title: string;
        description: string;
        isAdminOnly?: boolean;
    }[] = [
            {
                key: 'auto_responder',
                icon: Bot,
                iconColor: 'text-emerald-500',
                iconBg: isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50',
                title: 'AI Auto-Responder',
                description: 'Automatically reply to incoming WhatsApp messages using your AI knowledge base. When disabled, all incoming messages will require manual human responses.',
                isAdminOnly: true,
            },
            {
                key: 'smart_reply',
                icon: Wand2,
                iconColor: 'text-violet-500',
                iconBg: isDarkMode ? 'bg-violet-500/10' : 'bg-violet-50',
                title: 'Smart Reply Suggestions',
                description: 'Show AI-generated smart reply options for human agents inside the live chat interface. Agents can click to auto-fill and send with one click.',
            },
            {
                key: 'neural_summary',
                icon: Brain,
                iconColor: 'text-blue-500',
                iconBg: isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50',
                title: 'Neural Chat Summary',
                description: 'Enable AI to generate a real-time conversation summary from the live chat details panel. Provides quick context without reading entire message history.',
            },
            {
                key: 'content_generation',
                icon: Zap,
                iconColor: 'text-amber-500',
                iconBg: isDarkMode ? 'bg-amber-500/10' : 'bg-amber-50',
                title: 'AI Content Generation',
                description: 'Allow AI to generate WhatsApp message template bodies, campaign content, and marketing copy for your organization.',
                isAdminOnly: true,
            },
        ];

    return (
        <div className="h-full overflow-y-auto no-scrollbar">
            <div className="max-w-7xl mx-auto px-8 py-10">
                {/* Page Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={cn("p-2 rounded-xl", isDarkMode ? "bg-emerald-500/10" : "bg-emerald-50")}>
                            <Settings2 size={22} className="text-emerald-500" />
                        </div>
                        <h1 className={cn("text-3xl font-bold tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>
                            General Settings
                        </h1>
                    </div>
                    <p className={cn("text-sm ml-[52px]", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                        Manage your workspace preferences, AI capabilities, and notification settings.
                    </p>
                </div>

                <div className="flex gap-8">
                    {/* Left Inner Sidebar */}
                    <div className="w-52 shrink-0">
                        <nav className="space-y-1 sticky top-0">
                            {tabs.map((tab) => {
                                const TabIcon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-left group",
                                            activeTab === tab.id
                                                ? isDarkMode
                                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                : isDarkMode
                                                    ? "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
                                        )}
                                    >
                                        <TabIcon size={16} className={activeTab === tab.id ? "text-emerald-500" : ""} />
                                        <span className="flex-1">{tab.label}</span>
                                        {activeTab === tab.id && (
                                            <ChevronRight size={14} className="text-emerald-500" />
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Main Content Panel */}
                    <div className="flex-1 min-w-0">

                        {/* AI Capabilities Tab */}
                        {activeTab === 'capabilities' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Sparkles size={18} className="text-emerald-500" />
                                        <h2 className={cn("text-lg font-bold", isDarkMode ? "text-white" : "text-slate-900")}>
                                            AI Capabilities
                                        </h2>
                                    </div>
                                    <p className={cn("text-xs ml-[26px]", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                                        Fine-tune which AI features are active across your workspace. Disabled features will be locked with a visual indicator wherever they appear.
                                    </p>
                                </div>

                                {!isAdmin && (
                                    <div className={cn(
                                        "mb-5 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm",
                                        isDarkMode ? "bg-amber-500/5 border-amber-500/20 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-700"
                                    )}>
                                        <Lock size={16} className="shrink-0" />
                                        <span>Only <strong>tenant admins</strong> can modify AI settings. You can view the current configuration below.</span>
                                    </div>
                                )}

                                {isSettingsLoading ? (
                                    <div className="space-y-3">
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className={cn("h-24 rounded-2xl animate-pulse", isDarkMode ? "bg-white/5" : "bg-slate-100")} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {aiFeatures.map((feature) => (
                                            <FeatureToggle
                                                key={feature.key}
                                                icon={feature.icon}
                                                iconColor={feature.iconColor}
                                                iconBg={feature.iconBg}
                                                title={feature.title}
                                                description={feature.description}
                                                enabled={aiSettings[feature.key]}
                                                isAdminOnly={feature.isAdminOnly}
                                                isAdmin={isAdmin}
                                                isDarkMode={isDarkMode}
                                                onToggle={() => handleToggle(feature.key)}
                                                isLoading={isUpdating}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Info Footer */}
                                <div className={cn(
                                    "mt-6 p-4 rounded-xl border flex items-start gap-3",
                                    isDarkMode ? "bg-blue-500/5 border-blue-500/15" : "bg-blue-50 border-blue-100"
                                )}>
                                    <CheckCircle2 size={16} className="text-blue-500 shrink-0 mt-0.5" />
                                    <p className={cn("text-xs leading-relaxed", isDarkMode ? "text-blue-300" : "text-blue-700")}>
                                        Changes to AI settings take effect immediately across the workspace. Toggling off a feature will disable it everywhere it appears and show a lock icon for non-admin users.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* AI Models Tab */}
                        {activeTab === 'models' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Cpu size={18} className="text-violet-500" />
                                        <h2 className={cn("text-lg font-bold", isDarkMode ? "text-white" : "text-slate-900")}>
                                            AI Model Configuration
                                        </h2>
                                    </div>
                                    <p className={cn("text-xs ml-[26px]", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                                        Choose which AI models power your input processing and output generation. Different models offer trade-offs between speed, quality, and cost.
                                    </p>
                                </div>

                                {!isAdmin && (
                                    <div className={cn(
                                        "mb-5 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm",
                                        isDarkMode ? "bg-amber-500/5 border-amber-500/20 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-700"
                                    )}>
                                        <Lock size={16} className="shrink-0" />
                                        <span>Only <strong>tenant admins</strong> can modify model settings.</span>
                                    </div>
                                )}

                                {isModelsLoading ? (
                                    <div className="space-y-6">
                                        {[...Array(2)].map((_, i) => (
                                            <div key={i} className={cn("h-48 rounded-2xl animate-pulse", isDarkMode ? "bg-white/5" : "bg-slate-100")} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Input Model Selection */}
                                        <div className={cn(
                                            "p-6 rounded-2xl border",
                                            isDarkMode ? "bg-white/[0.02] border-white/[0.06]" : "bg-white border-slate-200 shadow-sm"
                                        )}>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isDarkMode ? "bg-blue-500/10" : "bg-blue-50")}>
                                                    <Brain size={18} className="text-blue-500" />
                                                </div>
                                                <div>
                                                    <h3 className={cn("font-semibold text-sm", isDarkMode ? "text-white" : "text-slate-900")}>
                                                        Input Processing Model
                                                    </h3>
                                                    <p className={cn("text-xs", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                                                        For classification, language detection, and keyword extraction
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {modelsData?.data?.map((model: any) => (
                                                    <button
                                                        key={model.model}
                                                        onClick={() => isAdmin && handleModelChange('input', model.model)}
                                                        disabled={!isAdmin || isUpdating}
                                                        className={cn(
                                                            "p-4 rounded-xl border text-left transition-all",
                                                            selectedInputModel === model.model
                                                                ? isDarkMode
                                                                    ? "bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/20"
                                                                    : "bg-blue-50 border-blue-300 ring-1 ring-blue-200"
                                                                : isDarkMode
                                                                    ? "bg-white/[0.02] border-white/[0.08] hover:border-white/20"
                                                                    : "bg-slate-50 border-slate-200 hover:border-slate-300",
                                                            !isAdmin && "opacity-60 cursor-not-allowed"
                                                        )}
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className={cn("font-mono text-sm font-semibold", isDarkMode ? "text-white" : "text-slate-900")}>
                                                                    {model.model}
                                                                </span>
                                                                {(model.recommended_for === 'input' || model.recommended_for === 'both') && (
                                                                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                                                                        Recommended
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className={cn(
                                                                "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
                                                                model.category === 'budget' ? "bg-emerald-500/10 text-emerald-500" :
                                                                    model.category === 'mid-tier' ? "bg-blue-500/10 text-blue-500" :
                                                                        model.category === 'premium' ? "bg-violet-500/10 text-violet-500" :
                                                                            "bg-amber-500/10 text-amber-500"
                                                            )}>
                                                                {model.category}
                                                            </span>
                                                        </div>
                                                        <p className={cn("text-xs mb-2", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                                                            {model.description}
                                                        </p>
                                                        <div className={cn("text-xs font-medium", isDarkMode ? "text-slate-500" : "text-slate-400")}>
                                                            ₹{model.input_rate_inr?.toFixed(2)}/1M input • ₹{model.output_rate_inr?.toFixed(2)}/1M output
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Output Model Selection */}
                                        <div className={cn(
                                            "p-6 rounded-2xl border",
                                            isDarkMode ? "bg-white/[0.02] border-white/[0.06]" : "bg-white border-slate-200 shadow-sm"
                                        )}>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isDarkMode ? "bg-emerald-500/10" : "bg-emerald-50")}>
                                                    <Wand2 size={18} className="text-emerald-500" />
                                                </div>
                                                <div>
                                                    <h3 className={cn("font-semibold text-sm", isDarkMode ? "text-white" : "text-slate-900")}>
                                                        Output Generation Model
                                                    </h3>
                                                    <p className={cn("text-xs", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                                                        For WhatsApp auto-replies, playground responses, and content generation
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {modelsData?.data?.map((model: any) => (
                                                    <button
                                                        key={model.model}
                                                        onClick={() => isAdmin && handleModelChange('output', model.model)}
                                                        disabled={!isAdmin || isUpdating}
                                                        className={cn(
                                                            "p-4 rounded-xl border text-left transition-all",
                                                            selectedOutputModel === model.model
                                                                ? isDarkMode
                                                                    ? "bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/20"
                                                                    : "bg-emerald-50 border-emerald-300 ring-1 ring-emerald-200"
                                                                : isDarkMode
                                                                    ? "bg-white/[0.02] border-white/[0.08] hover:border-white/20"
                                                                    : "bg-slate-50 border-slate-200 hover:border-slate-300",
                                                            !isAdmin && "opacity-60 cursor-not-allowed"
                                                        )}
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className={cn("font-mono text-sm font-semibold", isDarkMode ? "text-white" : "text-slate-900")}>
                                                                    {model.model}
                                                                </span>
                                                                {(model.recommended_for === 'output' || model.recommended_for === 'both') && (
                                                                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                                                                        Recommended
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className={cn(
                                                                "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
                                                                model.category === 'budget' ? "bg-emerald-500/10 text-emerald-500" :
                                                                    model.category === 'mid-tier' ? "bg-blue-500/10 text-blue-500" :
                                                                        model.category === 'premium' ? "bg-violet-500/10 text-violet-500" :
                                                                            "bg-amber-500/10 text-amber-500"
                                                            )}>
                                                                {model.category}
                                                            </span>
                                                        </div>
                                                        <p className={cn("text-xs mb-2", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                                                            {model.description}
                                                        </p>
                                                        <div className={cn("text-xs font-medium", isDarkMode ? "text-slate-500" : "text-slate-400")}>
                                                            ₹{model.input_rate_inr?.toFixed(2)}/1M input • ₹{model.output_rate_inr?.toFixed(2)}/1M output
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Info Footer */}
                                <div className={cn(
                                    "mt-6 p-4 rounded-xl border flex items-start gap-3",
                                    isDarkMode ? "bg-violet-500/5 border-violet-500/15" : "bg-violet-50 border-violet-100"
                                )}>
                                    <CheckCircle2 size={16} className="text-violet-500 shrink-0 mt-0.5" />
                                    <p className={cn("text-xs leading-relaxed", isDarkMode ? "text-violet-300" : "text-violet-700")}>
                                        Model changes take effect immediately. Premium models provide higher quality responses but cost more per token. Budget models are ideal for simple classification tasks.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Contact Settings Tab */}
                        {activeTab === 'contacts' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Users size={18} className="text-blue-500" />
                                        <h2 className={cn("text-lg font-bold", isDarkMode ? "text-white" : "text-slate-900")}>
                                            Contact Management
                                        </h2>
                                    </div>
                                    <p className={cn("text-xs ml-[26px]", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                                        Configure defaults and rules for how contacts are created and managed automatically.
                                    </p>
                                </div>

                                {!isAdmin && (
                                    <div className={cn(
                                        "mb-5 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm",
                                        isDarkMode ? "bg-amber-500/5 border-amber-500/20 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-700"
                                    )}>
                                        <Lock size={16} className="shrink-0" />
                                        <span>Only <strong>tenant admins</strong> can modify contact settings.</span>
                                    </div>
                                )}

                                <div className={cn(
                                    "p-6 rounded-2xl border transition-all duration-200",
                                    isDarkMode ? "bg-white/[0.02] border-white/[0.06]" : "bg-white border-slate-200 shadow-sm"
                                )}>
                                    <h3 className={cn("font-semibold text-sm mb-2", isDarkMode ? "text-white" : "text-slate-900")}>
                                        Default Contact Name
                                    </h3>
                                    <p className={cn("text-xs mb-4 leading-relaxed", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                                        When a new user directly messages the system via WhatsApp, their contact is automatically saved. If you provide a default name here (like "Unknown Contact"), we will save them with this name instead of their WhatsApp profile name. <strong>This field is required.</strong>
                                    </p>

                                    <div className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            value={defaultContactName}
                                            onChange={(e) => setDefaultContactName(e.target.value)}
                                            placeholder="e.g. Unknown Contact"
                                            disabled={!isAdmin || isSettingsLoading}
                                            className={cn(
                                                "w-full max-w-sm px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 disabled:opacity-50",
                                                isDarkMode
                                                    ? "bg-black/20 border-white/10 text-white placeholder:text-white/20 focus:border-blue-500/50 focus:ring-blue-500/20 focus:bg-black/40"
                                                    : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/10"
                                            )}
                                        />
                                        {isAdmin && (
                                            <button
                                                onClick={handleSaveContactSettings}
                                                disabled={isUpdatingGeneral}
                                                className={cn(
                                                    "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all",
                                                    isDarkMode
                                                        ? "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                                                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20",
                                                    isUpdatingGeneral && "opacity-70 cursor-not-allowed"
                                                )}
                                            >
                                                {isUpdatingGeneral ? (
                                                    <Loader2 size={16} className="animate-spin shrink-0" />
                                                ) : (
                                                    <Save size={16} className="shrink-0" />
                                                )}
                                                <span>{isUpdatingGeneral ? 'Saving...' : 'Save Settings'}</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Bell size={18} className="text-violet-500" />
                                        <h2 className={cn("text-lg font-bold", isDarkMode ? "text-white" : "text-slate-900")}>
                                            Notifications
                                        </h2>
                                    </div>
                                    <p className={cn("text-xs ml-[26px]", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                                        Control how and when your team receives alerts and updates.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        {
                                            icon: MessageSquare,
                                            iconColor: 'text-emerald-500',
                                            iconBg: isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50',
                                            title: 'New Message Alerts',
                                            description: 'Receive browser notifications when a new incoming WhatsApp message arrives in the shared inbox.',
                                            enabled: true,
                                        },
                                        {
                                            icon: Bot,
                                            iconColor: 'text-blue-500',
                                            iconBg: isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50',
                                            title: 'AI Activity Digest',
                                            description: 'Get a daily summary of AI actions taken on your behalf, such as auto-replies and lead classifications.',
                                            enabled: false,
                                        },
                                        {
                                            icon: BellOff,
                                            iconColor: 'text-slate-500',
                                            iconBg: isDarkMode ? 'bg-slate-500/10' : 'bg-slate-100',
                                            title: 'Do Not Disturb',
                                            description: 'Mute all browser notifications during focus hours. You can still see messages in the inbox.',
                                            enabled: false,
                                        },
                                    ].map((item, i) => (
                                        <FeatureToggle
                                            key={i}
                                            icon={item.icon}
                                            iconColor={item.iconColor}
                                            iconBg={item.iconBg}
                                            title={item.title}
                                            description={item.description}
                                            enabled={item.enabled}
                                            isAdmin={true}
                                            isDarkMode={isDarkMode}
                                            onToggle={() => toast.info("Notification settings coming soon!")}
                                        />
                                    ))}
                                </div>

                                <div className={cn(
                                    "mt-6 p-4 rounded-xl border flex items-start gap-3",
                                    isDarkMode ? "bg-violet-500/5 border-violet-500/15" : "bg-violet-50 border-violet-100"
                                )}>
                                    <Sparkles size={16} className="text-violet-500 shrink-0 mt-0.5" />
                                    <p className={cn("text-xs leading-relaxed", isDarkMode ? "text-violet-300" : "text-violet-700")}>
                                        Advanced notification controls including email digests, SMS alerts, and team-level routing are on the roadmap and will be available soon.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
