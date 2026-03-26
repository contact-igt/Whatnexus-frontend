
"use client";

import { useState, useMemo, useCallback } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { Appointment } from './bookingList';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { AppointmentDrawer } from './appointmentDrawer';
import { useGetAllAppointmentsQuery } from '@/hooks/useAppointmentQuery';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, LayoutGrid, Tablet } from 'lucide-react';

import { GlassCard } from '@/components/ui/glassCard';

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

const CustomToolbar = (toolbar: any) => {
    const { label, view, views, onNavigate, onView, isDarkMode } = toolbar;

    const goToBack = () => onNavigate('PREV');
    const goToNext = () => onNavigate('NEXT');
    const goToToday = () => onNavigate('TODAY');

    return (
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-16 relative">
            {/* Left Nav Group */}
            <div className="flex items-center space-x-1 bg-[#1a1c1e] p-1.5 rounded-[1.2rem] border border-white/5 shadow-2xl">
                <button
                    onClick={goToToday}
                    className="px-6 py-2 rounded-[0.9rem] text-[0.6rem] font-black uppercase tracking-widest transition-all bg-[#2d3035] text-white hover:bg-[#383c42] active:scale-95"
                >
                    Today
                </button>
                <div className="flex items-center">
                    <button
                        onClick={goToBack}
                        className="p-2.5 rounded-xl transition-all hover:bg-white/5 text-white/40 hover:text-white active:scale-90"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={goToNext}
                        className="p-2.5 rounded-xl transition-all hover:bg-white/5 text-white/40 hover:text-white active:scale-90"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Center Date Range */}
            <div className="lg:absolute lg:left-1/2 lg:-translate-x-1/2">
                <h2 className="text-[1.75rem] font-[900] tracking-tighter text-white/90">
                    {label}
                </h2>
            </div>

            {/* Right View Switcher */}
            <div className="flex items-center bg-[#1a1c1e] p-1.5 rounded-[1.2rem] border border-white/5 shadow-2xl">
                {[
                    { id: 'month', label: 'Month', icon: LayoutGrid },
                    { id: 'week', label: 'Week', icon: Tablet },
                    { id: 'day', label: 'Day', icon: CalendarIcon },
                    { id: 'agenda', label: 'Agenda', icon: List }
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onView(item.id)}
                        className={cn(
                            "flex items-center space-x-2 px-5 py-2.5 rounded-[0.9rem] text-[0.6rem] font-bold uppercase tracking-widest transition-all duration-500",
                            view === item.id
                                ? "bg-[#10b981] text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                                : "text-white/30 hover:text-white/60"
                        )}
                    >
                        <item.icon size={12} className={cn("transition-transform", view === item.id ? "scale-110" : "")} />
                        <span>{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

const CustomDateHeader = ({ label, date, isDarkMode }: any) => {
    const isToday = new Date().toDateString() === date.toDateString();
    return (
        <div className="group relative flex flex-col items-center">
            <span className={cn(
                "text-[0.85rem] font-black transition-all duration-300 mb-1",
                isToday ? "text-emerald-400" : (isDarkMode ? "text-white/70 group-hover:text-white" : "text-slate-500 group-hover:text-slate-900")
            )}>
                {label}
            </span>
            {isToday && (
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
            )}
        </div>
    );
};

const CustomEvent = ({ event, isDarkMode }: any) => {
    const appointment = event.resource as Appointment;
    let colorClass = "text-emerald-400";
    let bgClass = "bg-emerald-500/10";
    let dotClass = "bg-emerald-500";

    switch (appointment.status?.toLowerCase()) {
        case 'confirmed':
            colorClass = "text-emerald-400";
            bgClass = "bg-emerald-500/10";
            dotClass = "bg-emerald-500 shadow-[0_0_8px_#10b981]";
            break;
        case 'pending':
            colorClass = "text-amber-400";
            bgClass = "bg-amber-500/10";
            dotClass = "bg-amber-500 shadow-[0_0_8px_#fbbf24]";
            break;
        case 'cancelled':
            colorClass = "text-red-400";
            bgClass = "bg-red-500/10";
            dotClass = "bg-red-500 shadow-[0_0_8px_#ef4444]";
            break;
        case 'completed':
            colorClass = "text-blue-400";
            bgClass = "bg-blue-500/10";
            dotClass = "bg-blue-500 shadow-[0_0_8px_#3b82f6]";
            break;
    }

    return (
        <div className={cn(
            "flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-white/5 backdrop-blur-md h-full w-full shadow-lg transition-transform",
            bgClass
        )}>
            <div className={cn("w-1.5 h-1.5 rounded-full", dotClass)} />
            <span className={cn("text-[0.65rem] font-black truncate uppercase tracking-tight", colorClass)}>
                {event.title}
            </span>
        </div>
    );
};

const CustomTimeGutterHeader = () => {
    return (
        <div className="flex items-center justify-center h-full opacity-20">
            <span className="text-[0.5rem] font-black uppercase tracking-tighter transform -rotate-90">Time</span>
        </div>
    );
};

export const CalendarView = ({ isDarkMode }: CalendarViewProps) => {
    const [view, setView] = useState<View>('month');
    const [date, setDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    const { data, isLoading } = useGetAllAppointmentsQuery();
    const appointments: Appointment[] = data?.data || [];

    // Convert appointments to calendar events
    const events = useMemo(() => {
        return appointments.map(apt => {
            const dateStr = apt.appointment_date
                ? apt.appointment_date.split('T')[0]
                : new Date().toISOString().split('T')[0];

            // Parse appointment_time (can be "10:30 AM" or "14:30")
            let hours = 0, minutes = 0;
            const timeStr = apt.appointment_time || '';
            if (timeStr.includes('AM') || timeStr.includes('PM')) {
                const [timePart, period] = timeStr.split(' ');
                const [h, m] = timePart.split(':').map(Number);
                hours = period === 'PM' && h !== 12 ? h + 12 : (period === 'AM' && h === 12 ? 0 : h);
                minutes = m || 0;
            } else if (timeStr.includes(':')) {
                const [h, m] = timeStr.split(':').map(Number);
                hours = h || 0;
                minutes = m || 0;
            }

            const startDate = new Date(`${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);

            return {
                id: apt.appointment_id,
                title: apt.patient_name,
                start: startDate,
                end: new Date(startDate.getTime() + 30 * 60000),
                resource: apt,
            };
        });
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
        let color = '#10b981';
        let bg = 'rgba(16, 185, 129, 0.1)';

        switch (appointment.status?.toLowerCase()) {
            case 'confirmed':
                color = '#10b981';
                bg = isDarkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)';
                break;
            case 'pending':
                color = '#f59e0b';
                bg = isDarkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)';
                break;
            case 'cancelled':
                color = '#ef4444';
                bg = isDarkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)';
                break;
            case 'completed':
                color = '#3b82f6';
                bg = isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)';
                break;
        }

        return {
            style: {
                backgroundColor: 'transparent',
                border: 'none',
                display: 'block',
            }
        };
    }, []);

    if (isLoading) {
        return (
            <GlassCard isDarkMode={isDarkMode} className="h-[600px] animate-pulse" />
        );
    }

    return (
        <div className="space-y-6 relative">
            {/* Neural Mesh Gradient Layer */}
            <div className="absolute inset-0 -z-10 pointer-events-none opacity-40">
                <div className={cn(
                    "absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] animate-pulse transition-colors duration-1000",
                    isDarkMode ? "bg-emerald-500/10" : "bg-emerald-500/5"
                )} />
                <div className={cn(
                    "absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] animate-pulse delay-700 transition-colors duration-1000",
                    isDarkMode ? "bg-blue-500/5" : "bg-blue-500/5"
                )} />
            </div>

            <GlassCard
                isDarkMode={isDarkMode}
                className="p-10 calendar-container overflow-hidden border-white/5"
                style={{
                    minHeight: '800px',
                    background: isDarkMode ? '#0d0f12' : '#ffffff',
                    boxShadow: isDarkMode ? '0 25px 50px -12px rgba(0, 0, 0, 0.7)' : '0 25px 50px -12px rgba(0, 0, 0, 0.05)'
                }}
            >
                <BigCalendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '700px' }}
                    view={view}
                    onView={handleViewChange}
                    date={date}
                    onNavigate={handleNavigate}
                    onSelectEvent={handleSelectEvent}
                    eventPropGetter={eventStyleGetter}
                    components={{
                        toolbar: (props) => <CustomToolbar {...props} isDarkMode={isDarkMode} />,
                        event: (props) => <CustomEvent {...props} isDarkMode={isDarkMode} />,
                        month: {
                            dateHeader: (props) => <CustomDateHeader {...props} isDarkMode={isDarkMode} />,
                        },
                        week: {
                            header: ({ label, date }: any) => (
                                <div className="py-4 flex flex-col items-center">
                                    <span className={cn("text-[0.65rem] font-black uppercase tracking-widest mb-1", isDarkMode ? "text-white/60" : "text-slate-400")}>
                                        {format(date, 'EEE')}
                                    </span>
                                    <span className={cn("text-sm font-black tracking-tighter", isDarkMode ? "text-white" : "text-slate-900")}>
                                        {format(date, 'dd')}
                                    </span>
                                </div>
                            ),
                        },
                        day: {
                            header: ({ date }: any) => (
                                <div className="py-4 flex flex-col items-center">
                                    <span className={cn("text-[0.7rem] font-black uppercase tracking-widest mb-1 px-3 py-1 rounded-lg bg-emerald-500/10", isDarkMode ? "text-emerald-400" : "text-emerald-600")}>
                                        {format(date, 'EEEE')}
                                    </span>
                                    <span className={cn("text-3xl font-black tracking-tighter", isDarkMode ? "text-white" : "text-slate-900")}>
                                        {format(date, 'd MMMM yyyy')}
                                    </span>
                                </div>
                            ),
                        },
                        timeGutterHeader: CustomTimeGutterHeader,
                    }}
                    views={['month', 'week', 'day', 'agenda']}
                    popup
                    className={isDarkMode ? 'dark-calendar' : 'light-calendar'}
                />
            </GlassCard>

            <AppointmentDrawer
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={() => setIsModalOpen(false)}
                appointment={selectedAppointment}
                mode="view"
                isDarkMode={isDarkMode}
            />

            <style jsx global>{`
                .calendar-container .rbc-calendar {
                    font-family: inherit;
                    color: ${isDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#1e293b'};
                    border: none !important;
                }

                /* Deep neural grid - invisible borders, only depth */
                .rbc-month-view, .rbc-time-view {
                    border: none !important;
                    background: transparent !important;
                }

                .rbc-month-row {
                    border-top: none !important;
                    position: relative;
                }

                /* Use very soft box-shadows or gradients for depth instead of lines */
                .rbc-day-bg + .rbc-day-bg, .rbc-header + .rbc-header, .rbc-time-column + .rbc-time-column {
                    border-left: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)'} !important;
                }

                .rbc-month-row + .rbc-month-row, .rbc-timeslot-group {
                    border-top: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)'} !important;
                }

                /* Header and Time Gutter Alignment */
                .rbc-time-header-content {
                    border-left: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'} !important;
                }
                
                .rbc-time-gutter {
                    width: 70px !important;
                }

                .rbc-header {
                    border-bottom: none !important;
                    padding: 0 0 30px 0 !important;
                    font-weight: 900 !important;
                    text-transform: uppercase;
                    letter-spacing: 0.3em;
                    font-size: 0.7rem !important;
                    color: ${isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)'} !important;
                    background: transparent !important;
                }

                /* Today / Selected Glow - Deep Neural 2.0 */
                .rbc-today {
                    background: ${isDarkMode ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.03)'} !important;
                    position: relative;
                }
                
                .rbc-today::after {
                    content: '';
                    position: absolute;
                    inset: 4px;
                    border-radius: 20px;
                    background: ${isDarkMode ? 'radial-gradient(circle at top right, rgba(16, 185, 129, 0.05), transparent)' : 'radial-gradient(circle at top right, rgba(16, 185, 129, 0.03), transparent)'};
                    pointer-events: none;
                }

                .rbc-off-range-bg {
                    background: transparent !important;
                    opacity: 0.2;
                }

                /* Scrollbar Refinement */
                .rbc-time-content::-webkit-scrollbar {
                  width: 5px;
                }
                .rbc-time-content::-webkit-scrollbar-track {
                  background: transparent;
                }
                .rbc-time-content::-webkit-scrollbar-thumb {
                  background: ${isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
                  border-radius: 10px;
                }
                
                /* Modern Time Indicator */
                .rbc-current-time-indicator {
                    background-color: #10b981 !important;
                    height: 2px !important;
                    box-shadow: 0 0 20px rgba(16, 185, 129, 0.8);
                    z-index: 5;
                }

                .rbc-current-time-indicator::before {
                    content: '';
                    position: absolute;
                    left: -4px;
                    top: -5px;
                    width: 12px;
                    height: 12px;
                    background-color: #10b981;
                    border-radius: 50%;
                    box-shadow: 0 0 25px #10b981;
                    border: 2px solid ${isDarkMode ? '#0f172a' : '#fff'};
                }

                /* Agenda View - Floating Cards */
                .rbc-agenda-view {
                    border: none !important;
                }

                .rbc-agenda-table {
                    border: none !important;
                    border-collapse: separate !important;
                    border-spacing: 0 10px !important;
                    background: transparent !important;
                }

                .rbc-agenda-table tr {
                    background: ${isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.8)'} !important;
                    border-radius: 20px !important;
                    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)'} !important;
                }

                .rbc-agenda-table tr:hover {
                    background: ${isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff'} !important;
                    transform: scale(1.01) translateY(-4px);
                    border-color: #10b98140 !important;
                    box-shadow: 0 20px 40px -15px ${isDarkMode ? 'rgba(0,0,0,0.4)' : 'rgba(16, 185, 129, 0.1)'};
                }

                .rbc-agenda-date-cell {
                    padding: 30px !important;
                    color: #10b981 !important;
                    border-radius: 24px 0 0 24px !important;
                }

                .rbc-agenda-time-cell {
                    padding: 30px !important;
                    color: ${isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.4)'} !important;
                }

                .rbc-agenda-event-cell {
                    padding: 30px !important;
                    font-size: 1.1rem !important;
                    color: ${isDarkMode ? '#fff' : '#0f172a'} !important;
                    border-radius: 0 24px 24px 0 !important;
                }

                .rbc-agenda-empty {
                    padding: 40px 0 !important;
                    color: ${isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0,0,0,0.5)'} !important;
                    font-size: 1.1rem !important;
                    font-weight: 500 !important;
                }

                /* Events - Floating Glass Slivers */
                .rbc-event {
                    background-color: transparent !important;
                    padding: 0 4px !important;
                    margin: 2px 0 !important;
                    transition: all 0.3s ease;
                }

                .rbc-event:hover {
                    z-index: 10 !important;
                    transform: scale(1.05);
                }

                .rbc-event-content {
                    font-size: 0.7rem !important;
                    font-weight: 800 !important;
                    letter-spacing: 0.02em;
                    line-height: 1.4;
                }

                .rbc-show-more {
                    color: #10b981 !important;
                    font-weight: 900 !important;
                    font-size: 0.65rem !important;
                    text-transform: uppercase;
                    background: rgba(16, 185, 129, 0.1);
                    padding: 4px 8px;
                    border-radius: 6px;
                    margin: 4px;
                    display: inline-block;
                }
                
                /* Selection & Hover */
                .rbc-day-bg:hover, .rbc-time-slot:hover {
                    background: ${isDarkMode ? 'rgba(255, 255, 255, 0.01)' : 'rgba(0, 0, 0, 0.005)'} !important;
                    transition: background 0.2s ease;
                }

                /* Timegutter text */
                .rbc-time-gutter .rbc-label {
                  font-size: 0.7rem !important;
                  font-weight: 900 !important;
                  text-transform: lowercase;
                  color: ${isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)'} !important;
                  padding: 0 10px !important;
                }
            `}</style>
        </div>
    );
};
