"use client";

import { useState } from 'react';
import { Bot, Brain, Wand2, Sparkles, Bell, BellOff, Settings2, CheckCircle2, Lock, Loader2, MessageSquare, Zap, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useTheme } from '@/hooks/useTheme';
import { useGetTenantSettingsQuery, useUpdateTenantAiSettingsMutation } from '@/hooks/useTenantSettingsQuery';
import { useAuth } from '@/redux/selectors/auth/authSelector';
import { toast } from 'sonner';

type SettingsTab = 'capabilities' | 'notifications';

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
        { id: 'notifications', label: 'Notifications', icon: Bell },
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
