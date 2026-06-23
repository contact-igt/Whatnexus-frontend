"use client";

import { useState } from "react";
import { Bell, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { ReminderRulesView } from "@/components/views/appointments/ReminderRulesView";
import { AllRemindersView } from "./allRemindersView";

type TabType = "reminder-rules" | "all-reminders";

export const RemindersView = () => {
    const { isDarkMode } = useTheme();
    const [dirty, setDirty] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("selectedReminderTab");
            if (saved === "reminder-rules" || saved === "all-reminders") return saved as TabType;
        }
        return "all-reminders";
    });

    const tabs = [
        { value: "all-reminders",  label: "All Reminders", icon: List },
        { value: "reminder-rules", label: "Reminder Rules",  icon: Bell },
    ];

    const handleTabChange = (value: TabType) => {
        if (activeTab === "reminder-rules" && dirty && value !== "reminder-rules") {
            if (!window.confirm("You have unsaved reminder rule changes. Leave without saving?")) return;
        }
        setActiveTab(value);
        localStorage.setItem("selectedReminderTab", value);
    };

    return (
        <div className="h-full overflow-y-auto p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 max-w-[1400px] mx-auto no-scrollbar pb-32">
            {/* Header */}
            <div className="space-y-2">
                <h1 className={cn("text-3xl font-bold tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>
                    Reminders
                </h1>
                <p className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                    Configure reminder rules and view all scheduled appointment reminders.
                </p>
            </div>

            {/* Tab bar */}
            <div className={cn("flex items-center space-x-1 p-1 rounded-xl w-fit", isDarkMode ? "bg-white/5" : "bg-slate-100")}>
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.value;
                    return (
                        <button
                            key={tab.value}
                            onClick={() => handleTabChange(tab.value as TabType)}
                            className={cn(
                                "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                active
                                    ? isDarkMode
                                        ? "bg-white/10 text-white shadow-sm"
                                        : "bg-white text-slate-900 shadow-sm"
                                    : isDarkMode
                                        ? "text-white/50 hover:text-white/70"
                                        : "text-slate-500 hover:text-slate-700",
                            )}
                        >
                            <Icon size={14} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Tab content */}
            {activeTab === "all-reminders" && (
                <AllRemindersView isDarkMode={isDarkMode} />
            )}
            {activeTab === "reminder-rules" && (
                <ReminderRulesView isDarkMode={isDarkMode} onDirtyChange={setDirty} />
            )}
        </div>
    );
};
