"use client";

import { useState, useEffect, useRef } from 'react';
import { Bot, Brain, Wand2, Sparkles, Bell, BellOff, Settings2, CheckCircle2, Lock, Loader2, MessageSquare, Zap, ChevronRight, Cpu, ArrowRight, AlertTriangle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useTheme } from '@/hooks/useTheme';
import { useGetTenantSettingsQuery, useUpdateTenantAiSettingsMutation } from '@/hooks/useTenantSettingsQuery';
import { useAuth } from '@/redux/selectors/auth/authSelector';
import { toast } from 'sonner';
import Link from 'next/link';

type SettingsTab = 'capabilities' | 'models' | 'notifications';

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
    const { user, whatsappApiDetails } = useAuth();
    const isAdmin = user?.role === 'tenant_admin';
    const isWhatsAppConnected = whatsappApiDetails?.status === 'active';

    const [activeTab, setActiveTab] = useState<SettingsTab>('capabilities');
    const [localSettings, setLocalSettings] = useState<AiSettings | null>(null);

    const { data: settingsData, isLoading: isSettingsLoading } = useGetTenantSettingsQuery();
    const { mutate: updateAiSettings, isPending: isUpdating } = useUpdateTenantAiSettingsMutation();
    const [selectedInputModel, setSelectedInputModel] = useState<string | null>(null);
    const [selectedOutputModel, setSelectedOutputModel] = useState<string | null>(null);

    const hasSyncedModels = useRef(false);

    // Sync state ONCE on initial data load — never overwrite after that (to avoid race condition after save)
    useEffect(() => {
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

    const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
        { id: 'capabilities', label: 'AI Capabilities', icon: Sparkles },
        { id: 'models', label: 'AI Models', icon: Cpu },
        // { id: 'notifications', label: 'Notifications', icon: Bell },
    ];



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
                isAdminOnly: true,
            },
            {
                key: 'neural_summary',
                icon: Brain,
                iconColor: 'text-blue-500',
                iconBg: isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50',
                title: 'Neural Chat Summary',
                description: 'Enable AI to generate a real-time conversation summary from the live chat details panel. Provides quick context without reading entire message history.',
                isAdminOnly: true,
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

                {/* WhatsApp Not Connected Banner */}
                {!isWhatsAppConnected && (
                    <div className={cn(
                        "mb-8 rounded-2xl border overflow-hidden relative",
                        isDarkMode
                            ? "bg-[#ef4444]/[0.04] border-[#ef4444]/20"
                            : "bg-red-50/80 border-red-200"
                    )}>
                        {/* Subtle gradient accent */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#ef4444]/[0.06] via-transparent to-[#ef4444]/[0.03]" />

                        <div className="relative px-6 py-5 flex items-center gap-5 flex-wrap sm:flex-nowrap">
                            {/* WhatsApp Icon */}
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                                isDarkMode ? "bg-[#ef4444]/10 border border-[#ef4444]/20" : "bg-red-100 border border-red-200"
                            )}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="#ef4444">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h3 className={cn("text-sm font-bold mb-0.5", isDarkMode ? "text-[#fca5a5]" : "text-red-700")}>
                                    WhatsApp Not Connected
                                </h3>
                                <p className={cn("text-xs leading-relaxed", isDarkMode ? "text-white/50" : "text-red-600/70")}>
                                    Connect your WhatsApp Business Account to unlock AI features. These settings will take effect once your WABA is active.
                                </p>
                            </div>

                            {/* Connect Button */}
                            <Link
                                href="/settings/whatsapp-settings"
                                className={cn(
                                    "shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200",
                                    isDarkMode
                                        ? "bg-[#ef4444] hover:bg-[#dc2626] text-white"
                                        : "bg-red-600 hover:bg-red-700 text-white"
                                )}
                            >
                                Connect Now
                                <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                )}

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

                                {isSettingsLoading ? (
                                    <div className="space-y-6">
                                        {[...Array(2)].map((_, i) => (
                                            <div key={i} className={cn("h-24 rounded-2xl animate-pulse", isDarkMode ? "bg-white/5" : "bg-slate-100")} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Current Input Model Display */}
                                        <div className={cn(
                                            "p-5 rounded-2xl border",
                                            isDarkMode ? "bg-white/[0.02] border-white/[0.06]" : "bg-white border-slate-200 shadow-sm"
                                        )}>
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isDarkMode ? "bg-blue-500/10" : "bg-blue-50")}>
                                                    <Brain size={18} className="text-blue-500" />
                                                </div>
                                                <div>
                                                    <h3 className={cn("font-semibold text-sm", isDarkMode ? "text-white" : "text-slate-900")}>
                                                        Input Processing Model
                                                    </h3>
                                                    <p className={cn("text-xs", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                                                        For classification & extraction
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "p-3 rounded-xl border",
                                                isDarkMode ? "bg-blue-500/10 border-blue-500/20" : "bg-blue-50 border-blue-200"
                                            )}>
                                                <span className={cn("font-mono text-sm font-semibold", isDarkMode ? "text-white" : "text-slate-900")}>
                                                    {selectedInputModel || 'gpt-4o-mini'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Current Output Model Display */}
                                        <div className={cn(
                                            "p-5 rounded-2xl border",
                                            isDarkMode ? "bg-white/[0.02] border-white/[0.06]" : "bg-white border-slate-200 shadow-sm"
                                        )}>
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isDarkMode ? "bg-emerald-500/10" : "bg-emerald-50")}>
                                                    <Wand2 size={18} className="text-emerald-500" />
                                                </div>
                                                <div>
                                                    <h3 className={cn("font-semibold text-sm", isDarkMode ? "text-white" : "text-slate-900")}>
                                                        Output Generation Model
                                                    </h3>
                                                    <p className={cn("text-xs", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                                                        For responses & generation
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "p-3 rounded-xl border",
                                                isDarkMode ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-200"
                                            )}>
                                                <span className={cn("font-mono text-sm font-semibold", isDarkMode ? "text-white" : "text-slate-900")}>
                                                    {selectedOutputModel || 'gpt-4o'}
                                                </span>
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
