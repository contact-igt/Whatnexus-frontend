
"use client";

import { useTheme } from '@/hooks/useTheme';
import { DoctorManagement } from './doctor-management';
import { cn } from "@/lib/utils";


export const DoctorsView = () => {
    const {isDarkMode} = useTheme();
    return (
        <div className="h-full overflow-y-auto p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 max-w-[1400px] mx-auto no-scrollbar pb-32">
            <div className="space-y-2">
                <h1 className={cn("text-3xl font-bold tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>
                    Doctors
                </h1>
                <p className={cn("text-sm", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                    Manage doctor profiles, availability schedules, and specializations.
                </p>
            </div>

            <DoctorManagement isDarkMode={isDarkMode} />
        </div>
    );
};
