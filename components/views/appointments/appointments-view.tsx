
"use client";

import { useState } from 'react';
import { Calendar, List } from 'lucide-react';
import { cn } from "@/lib/utils";
import { BookingList } from './booking-list';
import { CalendarView } from './calendar-view';

interface AppointmentsViewProps {
    isDarkMode: boolean;
}

type TabType = 'booking-list' | 'calendar';

export const AppointmentsView = ({ isDarkMode }: AppointmentsViewProps) => {
    const [activeTab, setActiveTab] = useState<TabType>('booking-list');

    const appointmentTabs = [
        { value: "booking-list", label: "Booking List", icon: List },
        { value: "calendar", label: "Calendar", icon: Calendar }
    ];

    const handleTabChange = (value: TabType) => {
        setActiveTab(value);
        localStorage.setItem("selectedAppointmentTab", value);
    };

    return (
        <div className="h-full overflow-y-auto p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 max-w-[1400px] mx-auto no-scrollbar pb-32">
            <div className="space-y-2">
                <h1 className={cn("text-3xl font-bold tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>
                    Appointments
                </h1>
                <p className={cn("text-sm", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                    Manage patient appointments, view your schedule, and track bookings.
                </p>
            </div>

            <div className={cn("flex items-center space-x-1 p-1 rounded-xl w-fit", isDarkMode ? 'bg-white/5' : 'bg-slate-100')}>
                {
                    appointmentTabs?.map((tab, index) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={index}
                                onClick={() => handleTabChange(tab?.value as TabType)}
                                className={cn(
                                    "px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center space-x-2",
                                    activeTab === tab?.value
                                        ? (isDarkMode ? 'bg-white/10 text-white shadow-lg' : 'bg-white text-slate-900 shadow-md')
                                        : (isDarkMode ? 'text-white/50 hover:text-white/80' : 'text-slate-500 hover:text-slate-700')
                                )}
                            >
                                <Icon size={16} />
                                <span>{tab?.label}</span>
                            </button>
                        );
                    })
                }
            </div>

            {activeTab === 'booking-list' && (
                <BookingList isDarkMode={isDarkMode} />
            )}

            {activeTab === 'calendar' && (
                <CalendarView isDarkMode={isDarkMode} />
            )}
        </div>
    );
};
