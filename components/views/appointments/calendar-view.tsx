
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { Appointment } from './booking-list';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { AppointmentModal } from './appointment-modal';

interface CalendarViewProps {
    isDarkMode: boolean;
}

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

export const CalendarView = ({ isDarkMode }: CalendarViewProps) => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState<View>('month');
    const [date, setDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    // Load appointments from localStorage
    useEffect(() => {
        const loadAppointments = () => {
            const stored = localStorage.getItem('appointments');
            if (stored) {
                const parsed = JSON.parse(stored);
                const appointmentsWithDates = parsed.map((apt: any) => ({
                    ...apt,
                    date: new Date(apt.date)
                }));
                setAppointments(appointmentsWithDates);
            }
            setIsLoading(false);
        };

        loadAppointments();

        // Listen for storage changes
        const handleStorageChange = () => {
            loadAppointments();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Convert appointments to calendar events
    const events = useMemo(() => {
        return appointments.map(apt => ({
            id: apt.id,
            title: apt.doctorName
                ? `${apt.doctorName} - ${apt.patientName}`
                : apt.patientName,
            start: apt.date,
            end: new Date(apt.date.getTime() + 30 * 60000), // 30 minutes
            resource: apt,
        }));
    }, [appointments]);

    const handleSelectEvent = useCallback((event: any) => {
        setSelectedAppointment(event.resource);
        setIsModalOpen(true);
    }, []);

    const handleNavigate = useCallback((newDate: Date) => {
        setDate(newDate);
    }, []);

    const handleViewChange = useCallback((newView: View) => {
        setView(newView);
    }, []);

    const eventStyleGetter = useCallback((event: any) => {
        const appointment = event.resource as Appointment;
        let backgroundColor = '#10b981'; // emerald-500

        switch (appointment.status) {
            case 'confirmed':
                backgroundColor = '#10b981'; // emerald-500
                break;
            case 'pending':
                backgroundColor = '#f59e0b'; // amber-500
                break;
            case 'cancelled':
                backgroundColor = '#ef4444'; // red-500
                break;
            case 'completed':
                backgroundColor = '#3b82f6'; // blue-500
                break;
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '6px',
                opacity: 0.9,
                color: 'white',
                border: '0px',
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
            }
        };
    }, []);

    if (isLoading) {
        return (
            <div className={cn("h-[600px] rounded-xl animate-pulse", isDarkMode ? "bg-white/5" : "bg-slate-100")} />
        );
    }

    return (
        <div className="space-y-6">
            <div
                className={cn(
                    "rounded-xl p-6 border calendar-container",
                    isDarkMode
                        ? 'bg-white/5 border-white/10'
                        : 'bg-white border-slate-200'
                )}
                style={{ minHeight: '600px' }}
            >
                <BigCalendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%', minHeight: '550px' }}
                    view={view}
                    onView={handleViewChange}
                    date={date}
                    onNavigate={handleNavigate}
                    onSelectEvent={handleSelectEvent}
                    eventPropGetter={eventStyleGetter}
                    views={['month', 'week', 'day', 'agenda']}
                    popup
                    className={isDarkMode ? 'dark-calendar' : 'light-calendar'}
                />
            </div>

            <AppointmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={() => {
                    setIsModalOpen(false);
                    // Reload appointments
                    const stored = localStorage.getItem('appointments');
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        const appointmentsWithDates = parsed.map((apt: any) => ({
                            ...apt,
                            date: new Date(apt.date)
                        }));
                        setAppointments(appointmentsWithDates);
                    }
                }}
                appointment={selectedAppointment}
                mode="view"
                isDarkMode={isDarkMode}
            />

            <style jsx global>{`
                .calendar-container .rbc-calendar {
                    font-family: inherit;
                }

                ${isDarkMode ? `
                    .dark-calendar .rbc-header {
                        background: rgba(255, 255, 255, 0.05);
                        color: rgba(255, 255, 255, 0.9);
                        border-color: rgba(255, 255, 255, 0.1);
                        padding: 12px 8px;
                        font-weight: 600;
                        font-size: 0.875rem;
                    }

                    .dark-calendar .rbc-today {
                        background-color: rgba(16, 185, 129, 0.1);
                    }

                    .dark-calendar .rbc-off-range-bg {
                        background: rgba(255, 255, 255, 0.02);
                    }

                    .dark-calendar .rbc-date-cell {
                        color: rgba(255, 255, 255, 0.6);
                        padding: 8px;
                    }

                    .dark-calendar .rbc-now .rbc-button-link {
                        color: #10b981;
                        font-weight: 700;
                    }

                    .dark-calendar .rbc-day-bg,
                    .dark-calendar .rbc-month-view,
                    .dark-calendar .rbc-time-view {
                        background: transparent;
                        border-color: rgba(255, 255, 255, 0.1);
                    }

                    .dark-calendar .rbc-month-row,
                    .dark-calendar .rbc-day-slot,
                    .dark-calendar .rbc-time-slot {
                        border-color: rgba(255, 255, 255, 0.1);
                    }

                    .dark-calendar .rbc-toolbar {
                        margin-bottom: 20px;
                    }

                    .dark-calendar .rbc-toolbar button {
                        color: rgba(255, 255, 255, 0.7);
                        background: rgba(255, 255, 255, 0.05);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        padding: 8px 16px;
                        border-radius: 8px;
                        font-weight: 500;
                        transition: all 0.2s;
                    }

                    .dark-calendar .rbc-toolbar button:hover {
                        background: rgba(255, 255, 255, 0.1);
                        color: white;
                    }

                    .dark-calendar .rbc-toolbar button.rbc-active {
                        background: rgba(16, 185, 129, 0.2);
                        color: #10b981;
                        border-color: rgba(16, 185, 129, 0.3);
                    }

                    .dark-calendar .rbc-toolbar-label {
                        color: white;
                        font-weight: 700;
                        font-size: 1.125rem;
                    }

                    .dark-calendar .rbc-event {
                        padding: 4px 8px;
                    }

                    .dark-calendar .rbc-event:hover {
                        opacity: 1 !important;
                    }

                    .dark-calendar .rbc-time-content {
                        border-color: rgba(255, 255, 255, 0.1);
                    }

                    .dark-calendar .rbc-time-header-content {
                        border-color: rgba(255, 255, 255, 0.1);
                    }

                    .dark-calendar .rbc-time-slot {
                        color: rgba(255, 255, 255, 0.4);
                    }

                    .dark-calendar .rbc-current-time-indicator {
                        background-color: #10b981;
                    }

                    .dark-calendar .rbc-agenda-view {
                        background: transparent;
                    }

                    .dark-calendar .rbc-agenda-table {
                        border-color: rgba(255, 255, 255, 0.1);
                    }

                    .dark-calendar .rbc-agenda-date-cell,
                    .dark-calendar .rbc-agenda-time-cell {
                        color: rgba(255, 255, 255, 0.7);
                    }

                    .dark-calendar .rbc-agenda-event-cell {
                        color: rgba(255, 255, 255, 0.9);
                    }
                ` : `
                    .light-calendar .rbc-header {
                        background: #f8fafc;
                        color: #0f172a;
                        border-color: #e2e8f0;
                        padding: 12px 8px;
                        font-weight: 600;
                        font-size: 0.875rem;
                    }

                    .light-calendar .rbc-today {
                        background-color: rgba(16, 185, 129, 0.08);
                    }

                    .light-calendar .rbc-off-range-bg {
                        background: #f8fafc;
                    }

                    .light-calendar .rbc-date-cell {
                        color: #64748b;
                        padding: 8px;
                    }

                    .light-calendar .rbc-now .rbc-button-link {
                        color: #10b981;
                        font-weight: 700;
                    }

                    .light-calendar .rbc-day-bg,
                    .light-calendar .rbc-month-view,
                    .light-calendar .rbc-time-view {
                        background: white;
                        border-color: #e2e8f0;
                    }

                    .light-calendar .rbc-month-row,
                    .light-calendar .rbc-day-slot,
                    .light-calendar .rbc-time-slot {
                        border-color: #e2e8f0;
                    }

                    .light-calendar .rbc-toolbar {
                        margin-bottom: 20px;
                    }

                    .light-calendar .rbc-toolbar button {
                        color: #475569;
                        background: white;
                        border: 1px solid #e2e8f0;
                        padding: 8px 16px;
                        border-radius: 8px;
                        font-weight: 500;
                        transition: all 0.2s;
                    }

                    .light-calendar .rbc-toolbar button:hover {
                        background: #f8fafc;
                        color: #0f172a;
                        border-color: #cbd5e1;
                    }

                    .light-calendar .rbc-toolbar button.rbc-active {
                        background: rgba(16, 185, 129, 0.1);
                        color: #10b981;
                        border-color: rgba(16, 185, 129, 0.3);
                    }

                    .light-calendar .rbc-toolbar-label {
                        color: #0f172a;
                        font-weight: 700;
                        font-size: 1.125rem;
                    }

                    .light-calendar .rbc-event {
                        padding: 4px 8px;
                    }

                    .light-calendar .rbc-event:hover {
                        opacity: 1 !important;
                    }

                    .light-calendar .rbc-time-content {
                        border-color: #e2e8f0;
                    }

                    .light-calendar .rbc-time-header-content {
                        border-color: #e2e8f0;
                    }

                    .light-calendar .rbc-time-slot {
                        color: #94a3b8;
                    }

                    .light-calendar .rbc-current-time-indicator {
                        background-color: #10b981;
                    }

                    .light-calendar .rbc-agenda-view {
                        background: white;
                    }

                    .light-calendar .rbc-agenda-table {
                        border-color: #e2e8f0;
                    }

                    .light-calendar .rbc-agenda-date-cell,
                    .light-calendar .rbc-agenda-time-cell {
                        color: #475569;
                    }

                    .light-calendar .rbc-agenda-event-cell {
                        color: #0f172a;
                    }
                `}
            `}</style>
        </div>
    );
};
