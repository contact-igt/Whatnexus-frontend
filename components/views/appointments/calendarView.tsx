
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
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, LayoutGrid, Tablet, Clock, User, Stethoscope } from 'lucide-react';

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
            <div className={cn(
                "flex items-center space-x-1 p-1.5 rounded-[1.2rem] border shadow-2xl",
                isDarkMode ? "bg-[#1a1c1e] border-white/5" : "bg-slate-100 border-slate-200"
            )}>
                <button
                    onClick={goToToday}
                    className={cn(
                        "px-6 py-2 rounded-[0.9rem] text-[0.6rem] font-black uppercase tracking-widest transition-all active:scale-95",
                        isDarkMode ? "bg-[#2d3035] text-white hover:bg-[#383c42]" : "bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
                    )}
                >
                    Today
                </button>
                <div className="flex items-center">
                    <button
                        onClick={goToBack}
                        className={cn(
                            "p-2.5 rounded-xl transition-all active:scale-90",
                            isDarkMode ? "hover:bg-white/5 text-white/40 hover:text-white" : "hover:bg-slate-200 text-slate-400 hover:text-slate-700"
                        )}
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={goToNext}
                        className={cn(
                            "p-2.5 rounded-xl transition-all active:scale-90",
                            isDarkMode ? "hover:bg-white/5 text-white/40 hover:text-white" : "hover:bg-slate-200 text-slate-400 hover:text-slate-700"
                        )}
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Center Date Range */}
            <div className="lg:absolute lg:left-1/2 lg:-translate-x-1/2">
                <h2 className={cn(
                    "text-[1.75rem] font-[900] tracking-tighter",
                    isDarkMode ? "text-white/90" : "text-slate-900"
                )}>
                    {label}
                </h2>
            </div>

            {/* Right View Switcher */}
            <div className={cn(
                "flex items-center p-1.5 rounded-[1.2rem] border shadow-2xl",
                isDarkMode ? "bg-[#1a1c1e] border-white/5" : "bg-slate-100 border-slate-200"
            )}>
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
                                : isDarkMode ? "text-white/30 hover:text-white/60" : "text-slate-400 hover:text-slate-700"
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
            "flex items-center space-x-2 px-3 py-1.5 rounded-xl border backdrop-blur-md h-full w-full shadow-lg transition-transform",
            isDarkMode ? "border-white/5" : "border-black/5",
            bgClass
        )}>
            <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dotClass)} />
            <span className={cn("text-[0.65rem] font-black truncate uppercase tracking-tight", colorClass)}>
                {event.title}
            </span>
        </div>
    );
};

const CustomTimeGutterHeader = () => {
    return (
        <div className="flex items-center justify-center h-full opacity-30">
            <span className="text-[0.5rem] font-black uppercase tracking-tighter transform -rotate-90">Time</span>
        </div>
    );
};

const getStatusStyle = (status: string, isDarkMode: boolean) => {
    switch (status?.toLowerCase()) {
        case 'confirmed':
            return {
                dot: 'bg-emerald-500',
                badge: isDarkMode ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
                accent: 'border-l-emerald-500',
            };
        case 'pending':
            return {
                dot: 'bg-amber-500',
                badge: isDarkMode ? 'bg-amber-500/15 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200',
                accent: 'border-l-amber-500',
            };
        case 'cancelled':
            return {
                dot: 'bg-red-500',
                badge: isDarkMode ? 'bg-red-500/15 text-red-400 border-red-500/20' : 'bg-red-50 text-red-700 border-red-200',
                accent: 'border-l-red-500',
            };
        case 'completed':
            return {
                dot: 'bg-blue-500',
                badge: isDarkMode ? 'bg-blue-500/15 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-700 border-blue-200',
                accent: 'border-l-blue-500',
            };
        case 'noshow':
            return {
                dot: 'bg-orange-500',
                badge: isDarkMode ? 'bg-orange-500/15 text-orange-400 border-orange-500/20' : 'bg-orange-50 text-orange-700 border-orange-200',
                accent: 'border-l-orange-500',
            };
        default:
            return {
                dot: 'bg-slate-500',
                badge: isDarkMode ? 'bg-white/10 text-white/60 border-white/10' : 'bg-slate-100 text-slate-600 border-slate-200',
                accent: 'border-l-slate-500',
            };
    }
};

const CustomAgendaDate = ({ label, day, isDarkMode }: any) => {
    const isToday = new Date().toDateString() === day.toDateString();
    return (
        <div className="flex flex-col items-center min-w-[80px] py-2">
            <span className={cn(
                "text-[0.6rem] font-black uppercase tracking-widest mb-1",
                isDarkMode ? "text-white/40" : "text-slate-400"
            )}>
                {format(day, 'EEE')}
            </span>
            <span className={cn(
                "text-2xl font-black tracking-tighter leading-none",
                isToday ? "text-emerald-500" : (isDarkMode ? "text-white" : "text-slate-900")
            )}>
                {format(day, 'd')}
            </span>
            <span className={cn(
                "text-[0.55rem] font-bold uppercase tracking-wider mt-0.5",
                isDarkMode ? "text-white/30" : "text-slate-400"
            )}>
                {format(day, 'MMM')}
            </span>
            {isToday && (
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] mt-1.5" />
            )}
        </div>
    );
};

const CustomAgendaTime = ({ event, isDarkMode }: any) => {
    return (
        <div className={cn(
            "flex items-center space-x-2 py-2 px-1 min-w-[100px]",
        )}>
            <Clock size={12} className={cn("flex-shrink-0", isDarkMode ? "text-white/30" : "text-slate-400")} />
            <span className={cn(
                "text-xs font-bold tracking-tight whitespace-nowrap",
                isDarkMode ? "text-white/50" : "text-slate-500"
            )}>
                {event.resource?.appointment_time || format(event.start, 'hh:mm a')}
            </span>
        </div>
    );
};

const CustomAgendaEvent = ({ event, isDarkMode }: any) => {
    const appointment = event.resource as Appointment;
    const style = getStatusStyle(appointment?.status, isDarkMode);

    return (
        <div className={cn(
            "flex items-center justify-between py-3 px-4 rounded-xl border-l-[3px] transition-all cursor-pointer group",
            isDarkMode
                ? "bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] hover:border-white/[0.08]"
                : "bg-white hover:bg-slate-50 border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md",
            style.accent
        )}>
            <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    isDarkMode ? "bg-white/5" : "bg-slate-100"
                )}>
                    <User size={14} className={cn(isDarkMode ? "text-white/50" : "text-slate-500")} />
                </div>
                <div className="min-w-0 flex-1">
                    <p className={cn(
                        "text-sm font-bold truncate leading-tight",
                        isDarkMode ? "text-white" : "text-slate-900"
                    )}>
                        {appointment?.patient_name || event.title}
                    </p>
                    {appointment?.doctor?.name && (
                        <div className="flex items-center space-x-1 mt-0.5">
                            <Stethoscope size={10} className={cn(isDarkMode ? "text-white/30" : "text-slate-400")} />
                            <span className={cn(
                                "text-[0.65rem] font-medium truncate",
                                isDarkMode ? "text-white/40" : "text-slate-500"
                            )}>
                                {appointment?.doctor?.title} {appointment?.doctor?.name}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center space-x-3 flex-shrink-0 ml-3">
                {appointment?.token_number && (
                    <span className={cn(
                        "text-[0.6rem] font-black px-2 py-0.5 rounded-md",
                        isDarkMode ? "bg-white/5 text-white/40" : "bg-slate-100 text-slate-500"
                    )}>
                        #{appointment.token_number}
                    </span>
                )}
                <span className={cn(
                    "text-[0.6rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border capitalize",
                    style.badge
                )}>
                    {appointment?.status || 'Pending'}
                </span>
            </div>
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
                        agenda: {
                            date: (props: any) => <CustomAgendaDate {...props} isDarkMode={isDarkMode} />,
                            time: (props: any) => <CustomAgendaTime {...props} isDarkMode={isDarkMode} />,
                            event: (props: any) => <CustomAgendaEvent {...props} isDarkMode={isDarkMode} />,
                        },
                    }}
                    views={['month', 'week', 'day', 'agenda']}
                    popup
                    showAllEvents
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
                    overflow: visible !important;
                }

                .rbc-row-content-scrollable {
                    max-height: 150px !important;
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                    scrollbar-width: thin;
                    scrollbar-color: ${isDarkMode ? 'rgba(255,255,255,0.08) transparent' : 'rgba(0,0,0,0.06) transparent'};
                }

                .rbc-row-content-scrollable::-webkit-scrollbar {
                    width: 3px;
                }
                .rbc-row-content-scrollable::-webkit-scrollbar-track {
                    background: transparent;
                }
                .rbc-row-content-scrollable::-webkit-scrollbar-thumb {
                    background: ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
                    border-radius: 10px;
                }
                .rbc-row-content-scrollable:hover::-webkit-scrollbar-thumb {
                    background: ${isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'};
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

                /* ─── Agenda View - Redesigned ─── */
                .rbc-agenda-view {
                    border: none !important;
                    overflow: hidden !important;
                    border-radius: 16px !important;
                }

                .rbc-agenda-view table.rbc-agenda-table {
                    border: none !important;
                    border-collapse: separate !important;
                    border-spacing: 0 6px !important;
                    background: transparent !important;
                }

                .rbc-agenda-view table.rbc-agenda-table thead > tr > th {
                    border-bottom: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} !important;
                    padding: 12px 16px !important;
                    font-size: 0.6rem !important;
                    font-weight: 800 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.15em !important;
                    color: ${isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)'} !important;
                    background: transparent !important;
                }

                .rbc-agenda-view table.rbc-agenda-table tbody > tr {
                    background: transparent !important;
                    border: none !important;
                    transition: none !important;
                }

                .rbc-agenda-view table.rbc-agenda-table tbody > tr:hover {
                    background: transparent !important;
                    transform: none !important;
                    box-shadow: none !important;
                }

                .rbc-agenda-view table.rbc-agenda-table tbody > tr > td {
                    border: none !important;
                    padding: 4px 8px !important;
                    vertical-align: middle !important;
                }

                .rbc-agenda-view table.rbc-agenda-table tbody > tr > td + td + td {
                    width: 100% !important;
                }

                .rbc-agenda-view table.rbc-agenda-table tbody > tr > td.rbc-agenda-date-cell {
                    white-space: nowrap !important;
                    padding-left: 0 !important;
                }

                .rbc-agenda-view table.rbc-agenda-table tbody > tr > td.rbc-agenda-time-cell {
                    white-space: nowrap !important;
                }

                .rbc-agenda-empty {
                    padding: 60px 20px !important;
                    text-align: center !important;
                    color: ${isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'} !important;
                    font-size: 0.9rem !important;
                    font-weight: 600 !important;
                }

                /* Agenda scrollbar */
                .rbc-agenda-view::-webkit-scrollbar {
                    width: 4px;
                }
                .rbc-agenda-view::-webkit-scrollbar-track {
                    background: transparent;
                }
                .rbc-agenda-view::-webkit-scrollbar-thumb {
                    background: ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'};
                    border-radius: 10px;
                }

                /* Events - Floating Glass Slivers */
                .rbc-event {
                    background-color: transparent !important;
                    padding: 0 4px !important;
                    margin: 2px 0 !important;
                    transition: all 0.3s ease;
                    border: none !important;
                    outline: none !important;
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

                /* ─── Week & Day View Specific Styles ─── */
                .rbc-time-view {
                    border-radius: 16px !important;
                    overflow: hidden !important;
                }

                .rbc-time-view .rbc-time-header {
                    border-bottom: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} !important;
                }

                .rbc-time-view .rbc-allday-cell {
                    background: ${isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'} !important;
                    border-top: none !important;
                    min-height: 30px !important;
                }

                .rbc-time-view .rbc-time-content {
                    border-top: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} !important;
                }

                .rbc-time-view .rbc-time-column {
                    background: transparent !important;
                }

                .rbc-time-view .rbc-day-slot .rbc-time-slot {
                    border-top: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} !important;
                }

                /* Events inside week/day time grid */
                .rbc-time-view .rbc-event {
                    background: transparent !important;
                    border: none !important;
                    border-radius: 12px !important;
                    padding: 0 !important;
                    margin: 1px 2px !important;
                    overflow: hidden !important;
                }

                .rbc-time-view .rbc-event:hover {
                    transform: scale(1.02) !important;
                }

                .rbc-time-view .rbc-event-label {
                    display: none !important;
                }

                .rbc-time-view .rbc-event-content {
                    height: 100% !important;
                    font-size: 0.65rem !important;
                }

                .rbc-time-view .rbc-event-content > div {
                    height: 100% !important;
                    border-radius: 12px !important;
                }

                /* Day slot events - ensure they fill the column */
                .rbc-day-slot .rbc-events-container {
                    margin-right: 2px !important;
                }

                /* Overlapping events in week/day */
                .rbc-day-slot .rbc-event {
                    border-left: 3px solid transparent !important;
                }

                /* Time header row in week view */
                .rbc-time-header-cell {
                    min-height: auto !important;
                }

                .rbc-time-view .rbc-row.rbc-row-resource {
                    border-bottom: none !important;
                }

                .rbc-time-view .rbc-header {
                    padding: 12px 0 16px 0 !important;
                    border-bottom: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'} !important;
                }

                /* Label in time gutter for week/day */
                .rbc-time-view .rbc-time-gutter .rbc-timeslot-group {
                    border-bottom: none !important;
                    min-height: 60px !important;
                }

                .rbc-time-view .rbc-label {
                    font-size: 0.65rem !important;
                    font-weight: 700 !important;
                    color: ${isDarkMode ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'} !important;
                    padding: 0 12px !important;
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
