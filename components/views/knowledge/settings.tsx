
"use client";

import { useState } from 'react';
import { Settings as SettingsIcon, Database, Bell, Globe } from 'lucide-react';
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ActionMenu } from "@/components/ui/action-menu";
import { useActivateSettingMutation, useGetAllSettingQuery } from '@/hooks/useSettingQuery';

interface SettingsProps {
    isDarkMode: boolean;
    handleEdit: (item: any, mode: string) => void;
    handleView: (item: any, mode: string) => void;
}

export const Settings = ({ isDarkMode, handleEdit, handleView }: SettingsProps) => {
    const { data: settingsData, isLoading: settingsPending } = useGetAllSettingQuery();
    const { mutate: activateSettingMutate, isPending: activatePending } = useActivateSettingMutation();    // Mock State for Settings - In real app, this would come from API
    const [settings, setSettings] = useState([
        {
            id: 'autoSync',
            title: "Auto-Sync Knowledge Base",
            description: "Automatically sync changes from linked data sources.",
            icon: <Database size={18} />,
            enabled: true
        },
        {
            id: 'publicAccess',
            title: "Public Access",
            description: "Allow external users to query the knowledge base.",
            icon: <Globe size={18} />,
            enabled: false
        },
        {
            id: 'notifications',
            title: "System Notifications",
            description: "Receive alerts for system updates and errors.",
            icon: <Bell size={18} />,
            enabled: true
        }
    ]);

    const handleToggleActive = (id: string, isActive: string) => {
        const data = {
            setting_value: isActive == "true" ? "false" : "true"
        }
        activateSettingMutate({ id, data })
    };

    return (
        <div className="max-w-4xl animate-in fade-in duration-500">
            <GlassCard isDarkMode={isDarkMode} className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                    <div className={cn("p-2 rounded-lg", isDarkMode ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600")}>
                        <SettingsIcon size={20} />
                    </div>
                    <div>
                        <h3 className={cn("text-lg font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                            General Configuration
                        </h3>
                        <p className={cn("text-xs", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                            Manage system preferences and sync options.
                        </p>
                    </div>
                </div>
                

                <div className="space-y-2">
                    {settingsPending ? (
                        Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "flex items-center justify-between p-4 rounded-xl border animate-pulse",
                                    isDarkMode
                                        ? "bg-white/5 border-white/5"
                                        : "bg-slate-50 border-slate-100"
                                )}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full shrink-0",
                                        isDarkMode ? "bg-white/10" : "bg-slate-200"
                                    )} />
                                    <div className="space-y-2">
                                        <div className={cn("h-4 w-40 rounded", isDarkMode ? "bg-white/10" : "bg-slate-200")} />
                                        <div className={cn("h-3 w-64 rounded", isDarkMode ? "bg-white/10" : "bg-slate-200")} />
                                    </div>
                                </div>
                                <div className={cn(
                                    "w-11 h-6 rounded-full",
                                    isDarkMode ? "bg-white/10" : "bg-slate-200"
                                )} />
                            </div>
                        ))
                    ) : settingsData?.data?.map((setting: any, index: number) => (
                        <div
                            key={index}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-xl transition-all border group",
                                isDarkMode
                                    ? "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10"
                                    : "bg-slate-50 border-slate-100 hover:border-slate-200 hover:bg-slate-100"
                            )}
                        >
                            <div className="flex items-center space-x-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
                                    isDarkMode ? "bg-white/5 text-white/60 group-hover:bg-white/10 group-hover:text-white" : "bg-slate-200/50 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700"
                                )}>
                                    <Globe size={18} />
                                </div>
                                <div>
                                    <h4 className={cn("text-sm font-semibold", isDarkMode ? "text-white" : "text-slate-900")}>
                                        {setting?.label}
                                    </h4>
                                    <p className={cn("text-xs mt-0.5", isDarkMode ? "text-white/40" : "text-slate-500")}>
                                        {setting?.description}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={setting.setting_value == "true"}
                                        onChange={() => handleToggleActive(setting.id, setting.setting_value)}
                                    />
                                    <div className={cn(
                                        "w-11 h-6 rounded-full peer transition-all",
                                        "peer-checked:bg-emerald-500",
                                        isDarkMode ? 'bg-white/10' : 'bg-slate-300'
                                    )}>
                                        <div className={cn(
                                            "absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-all shadow-sm",
                                            setting.setting_value == "true" ? "translate-x-5" : "translate-x-0"
                                        )} />
                                    </div>
                                </label>

                                {/* <div className="pl-4 border-l border-slate-200 dark:border-white/10">
                                    <ActionMenu
                                        isDarkMode={isDarkMode}
                                        isView={true}
                                        isEdit={true}
                                        onView={() => handleView(setting, 'settings')}
                                        onEdit={() => handleEdit(setting, 'settings')}
                                    />
                                </div> */}
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>
    );
};