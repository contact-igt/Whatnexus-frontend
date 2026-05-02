"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    CalendarDays, ChevronLeft, ChevronRight,
    ChevronsLeft, ChevronsRight, Clock
} from 'lucide-react';
import { tx } from './glassStyles';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DateRange {
    startDate: Date;
    endDate: Date;
}

interface DashboardDateFilterProps {
    isDarkMode: boolean;
    dateRange: DateRange;
    onDateRangeChange: (range: DateRange) => void;
    isFetching?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function startOfDay(d: Date): Date {
    const r = new Date(d);
    r.setHours(0, 0, 0, 0);
    return r;
}

function endOfDay(d: Date): Date {
    const r = new Date(d);
    r.setHours(23, 59, 59, 999);
    return r;
}

function today(): Date { return startOfDay(new Date()); }
function todayEnd(): Date { return endOfDay(new Date()); }

function isSameDay(a: Date, b: Date) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

function isInRange(date: Date, start: Date, end: Date) {
    const d = date.getTime();
    return d > start.getTime() && d < end.getTime();
}

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

function addDays(d: Date, n: number): Date {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
}

function startOfWeek(d: Date): Date {
    const r = new Date(d);
    r.setDate(r.getDate() - r.getDay());
    return startOfDay(r);
}

function startOfMonth(d: Date): Date {
    return startOfDay(new Date(d.getFullYear(), d.getMonth(), 1));
}

function endOfMonth(d: Date): Date {
    return endOfDay(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}

function formatShort(d: Date): string {
    return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatMini(d: Date): string {
    return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
}

function formatMiniWithYear(d: Date): string {
    return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// ─── Presets ─────────────────────────────────────────────────────────────────

interface Preset {
    label: string;
    group: 'quick' | 'period';
    resolve: () => DateRange;
}

function buildPresets(): Preset[] {
    const now = new Date();
    return [
        {
            label: 'Today',
            group: 'quick',
            resolve: () => ({ startDate: today(), endDate: todayEnd() }),
        },
        {
            label: 'Yesterday',
            group: 'quick',
            resolve: () => {
                const y = addDays(today(), -1);
                return { startDate: startOfDay(y), endDate: endOfDay(y) };
            },
        },
        {
            label: 'Last 7 Days',
            group: 'period',
            resolve: () => ({ startDate: startOfDay(addDays(now, -6)), endDate: todayEnd() }),
        },
        {
            label: 'Last 30 Days',
            group: 'period',
            resolve: () => ({ startDate: startOfDay(addDays(now, -29)), endDate: todayEnd() }),
        },
        {
            label: 'Last Week',
            group: 'period',
            resolve: () => {
                const thisWeekStart = startOfWeek(now);
                const lastWeekStart = addDays(thisWeekStart, -7);
                const lastWeekEnd = endOfDay(addDays(thisWeekStart, -1));
                return { startDate: startOfDay(lastWeekStart), endDate: lastWeekEnd };
            },
        },
        {
            label: 'Last Month',
            group: 'period',
            resolve: () => {
                const firstOfThisMonth = startOfMonth(now);
                const lastMonth = addDays(firstOfThisMonth, -1);
                return { startDate: startOfMonth(lastMonth), endDate: endOfMonth(lastMonth) };
            },
        },
        {
            label: 'All Time',
            group: 'period',
            resolve: () => ({
                startDate: new Date(2000, 0, 1),
                endDate: todayEnd(),
            }),
        },
    ];
}

function getActivePresetLabel(range: DateRange, presets: Preset[]): string {
    for (const p of presets) {
        const r = p.resolve();
        if (isSameDay(r.startDate, range.startDate) && isSameDay(r.endDate, range.endDate)) {
            return p.label;
        }
    }
    // Custom range - always include year
    if (isSameDay(range.startDate, range.endDate)) {
        return formatShort(range.startDate);
    }
    return `${formatMiniWithYear(range.startDate)} – ${formatMiniWithYear(range.endDate)}`;
}

// ─── Mini Calendar ────────────────────────────────────────────────────────────

interface MiniCalendarProps {
    isDarkMode: boolean;
    year: number;
    month: number;
    tempStart: Date | null;
    tempEnd: Date | null;
    selecting: 'start' | 'end';
    onDayClick: (day: number, year: number, month: number) => void;
}

function MiniCalendar({ isDarkMode, year, month, tempStart, tempEnd, selecting, onDayClick }: MiniCalendarProps) {
    const t = tx(isDarkMode);
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const now = new Date();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
        <div style={{ width: 252 }}>
            <div style={{
                textAlign: 'center', fontWeight: 700, fontSize: '13px',
                marginBottom: 10, color: t.primary
            }}>
                {MONTHS[month]} {year}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 0 }}>
                {DAYS.map(d => (
                    <div key={d} style={{
                        textAlign: 'center', fontSize: '10px', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                        padding: '4px 0', color: t.micro
                    }}>{d}</div>
                ))}
                {cells.map((day, i) => {
                    if (day === null) return <div key={`e-${i}`} style={{ height: 34 }} />;
                    const date = new Date(year, month, day);
                    const isTodayCell = isSameDay(date, now);
                    const isStart = tempStart ? isSameDay(date, tempStart) : false;
                    const isEnd = tempEnd ? isSameDay(date, tempEnd) : false;
                    const inRange = tempStart && tempEnd ? isInRange(date, tempStart, tempEnd) : false;
                    const isFuture = date > now;

                    let bg = 'transparent';
                    let color = t.secondary;
                    let borderRadius = '8px';
                    let fontWeight: number | string = 500;
                    let cursor: string = isFuture ? 'not-allowed' : 'pointer';
                    let opacity = isFuture ? 0.25 : 1;
                    let outline = 'none';

                    if (isStart || isEnd) {
                        bg = 'linear-gradient(135deg, #059669 0%, #10b981 100%)';
                        color = '#ffffff';
                        fontWeight = 700;
                    } else if (inRange) {
                        bg = isDarkMode ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.1)';
                        color = isDarkMode ? '#34d399' : '#059669';
                        borderRadius = '0';
                    } else if (isTodayCell) {
                        outline = `1px solid ${isDarkMode ? 'rgba(16,185,129,0.4)' : 'rgba(16,185,129,0.5)'}`;
                        color = isDarkMode ? '#34d399' : '#059669';
                        fontWeight = 700;
                    } else if (!isFuture) {
                        color = t.secondary;
                    }

                    return (
                        <button
                            key={`d-${day}-${i}`}
                            disabled={isFuture}
                            onClick={() => !isFuture && onDayClick(day, year, month)}
                            style={{
                                height: 34,
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight,
                                background: bg,
                                color,
                                borderRadius,
                                cursor,
                                opacity,
                                outline,
                                border: 'none',
                                transition: 'all 0.15s',
                            }}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const DashboardDateFilter = ({
    isDarkMode,
    dateRange,
    onDateRangeChange,
    isFetching = false,
}: DashboardDateFilterProps) => {
    const t = tx(isDarkMode);
    const presets = buildPresets();
    const activeLabel = getActivePresetLabel(dateRange, presets);

    const [isOpen, setIsOpen] = useState(false);
    const [tempStart, setTempStart] = useState<Date | null>(dateRange.startDate);
    const [tempEnd, setTempEnd] = useState<Date | null>(dateRange.endDate);
    const [selecting, setSelecting] = useState<'start' | 'end'>('start');
    const [leftMonth, setLeftMonth] = useState(() => ({
        year: dateRange.startDate.getFullYear(),
        month: dateRange.startDate.getMonth(),
    }));
    const ref = useRef<HTMLDivElement>(null);

    const rightMonth = {
        year: leftMonth.month === 11 ? leftMonth.year + 1 : leftMonth.year,
        month: leftMonth.month === 11 ? 0 : leftMonth.month + 1,
    };

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Sync temp state when opening
    const handleOpen = useCallback(() => {
        setTempStart(dateRange.startDate);
        setTempEnd(dateRange.endDate);
        setSelecting('start');
        setLeftMonth({
            year: dateRange.startDate.getFullYear(),
            month: dateRange.startDate.getMonth(),
        });
        setIsOpen(o => !o);
    }, [dateRange]);

    const prevMonth = () => setLeftMonth(p => p.month === 0 ? { year: p.year - 1, month: 11 } : { ...p, month: p.month - 1 });
    const nextMonth = () => setLeftMonth(p => p.month === 11 ? { year: p.year + 1, month: 0 } : { ...p, month: p.month + 1 });
    const prevYear = () => setLeftMonth(p => ({ ...p, year: p.year - 1 }));
    const nextYear = () => setLeftMonth(p => ({ ...p, year: p.year + 1 }));

    const handleDayClick = (day: number, year: number, month: number) => {
        const clicked = startOfDay(new Date(year, month, day));
        if (selecting === 'start') {
            setTempStart(clicked);
            setTempEnd(null);
            setSelecting('end');
        } else {
            if (tempStart && clicked < tempStart) {
                setTempStart(clicked);
                setTempEnd(null);
                setSelecting('end');
            } else {
                const end = endOfDay(clicked);
                setTempEnd(end);
                setSelecting('start');
            }
        }
    };

    const handleApply = () => {
        if (tempStart) {
            // Single date selected: treat start = end (full day range)
            const end = tempEnd || endOfDay(tempStart);
            onDateRangeChange({ startDate: tempStart, endDate: end });
            setIsOpen(false);
        }
    };

    const handlePreset = (preset: Preset) => {
        const range = preset.resolve();
        onDateRangeChange(range);
        setIsOpen(false);
    };

    const handleClear = () => {
        const range = { startDate: today(), endDate: todayEnd() };
        onDateRangeChange(range);
        setTempStart(range.startDate);
        setTempEnd(range.endDate);
        setSelecting('start');
    };

    // Divider style
    const dividerColor = isDarkMode ? 'rgba(255,255,255,0.07)' : '#e4e4e7';
    const panelBg = isDarkMode ? '#111113' : '#ffffff';
    const panelBorder = isDarkMode ? '#27272a' : '#e4e4e7';
    const presetActiveBg = isDarkMode ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)';
    const presetHoverBg = isDarkMode ? 'rgba(255,255,255,0.05)' : '#f4f4f5';

    const isPresetActive = (preset: Preset) => {
        const r = preset.resolve();
        return isSameDay(r.startDate, dateRange.startDate) && isSameDay(r.endDate, dateRange.endDate);
    };

    const canApply = !!tempStart;

    return (
        <div ref={ref} style={{ position: 'relative' }}>

            {/* ── Trigger Button ── */}
            <button
                onClick={handleOpen}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: `1px solid ${isOpen ? 'rgba(16,185,129,0.45)' : (isDarkMode ? '#27272a' : '#e4e4e7')}`,
                    background: isOpen
                        ? (isDarkMode ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.06)')
                        : (isDarkMode ? '#18181b' : '#f4f4f5'),
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: isOpen ? '#10b981' : t.secondary,
                    whiteSpace: 'nowrap',
                    minWidth: 0,
                }}
            >
                <CalendarDays size={13} style={{ color: isOpen ? '#10b981' : t.micro, flexShrink: 0 }} />
                <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {activeLabel}
                </span>
                {isFetching && (
                    <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: '#10b981', flexShrink: 0,
                        animation: 'pulse 1s ease-in-out infinite',
                    }} />
                )}
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{
                    color: t.micro, flexShrink: 0,
                    transform: isOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s',
                }}>
                    <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {/* ── Dropdown Panel ── */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    zIndex: 9999,
                    background: panelBg,
                    border: `1px solid ${panelBorder}`,
                    borderRadius: 16,
                    boxShadow: isDarkMode
                        ? '0 20px 60px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.5)'
                        : '0 20px 60px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.06)',
                    display: 'flex',
                    overflow: 'hidden',
                }}>

                    {/* ── Left: Presets ── */}
                    <div style={{
                        width: 160,
                        borderRight: `1px solid ${dividerColor}`,
                        padding: '12px 8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}>
                        {/* Header */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            paddingLeft: 8, paddingBottom: 8, borderBottom: `1px solid ${dividerColor}`,
                            marginBottom: 4,
                        }}>
                            <Clock size={11} style={{ color: t.micro }} />
                            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: t.micro }}>
                                Quick Select
                            </span>
                        </div>

                        {presets.map((preset) => {
                            const active = isPresetActive(preset);
                            return (
                                <button
                                    key={preset.label}
                                    onClick={() => handlePreset(preset)}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '7px 10px',
                                        borderRadius: 8,
                                        border: 'none',
                                        background: active ? presetActiveBg : 'transparent',
                                        color: active ? '#10b981' : t.secondary,
                                        fontSize: '12px',
                                        fontWeight: active ? 700 : 500,
                                        cursor: 'pointer',
                                        transition: 'all 0.1s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                    }}
                                    onMouseEnter={e => {
                                        if (!active) (e.currentTarget as HTMLElement).style.background = presetHoverBg;
                                    }}
                                    onMouseLeave={e => {
                                        if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
                                    }}
                                >
                                    {active && (
                                        <span style={{
                                            width: 5, height: 5, borderRadius: '50%',
                                            background: '#10b981', flexShrink: 0,
                                        }} />
                                    )}
                                    {!active && <span style={{ width: 5, flexShrink: 0 }} />}
                                    {preset.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* ── Right: Custom Range Calendar ── */}
                    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>

                        {/* Header: Custom Range label + nav */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: t.micro }}>
                                Custom Range
                            </span>
                            {/* Navigation */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                {([
                                    { icon: <ChevronsLeft size={13} />, action: prevYear, title: 'Prev year' },
                                    { icon: <ChevronLeft size={13} />, action: prevMonth, title: 'Prev month' },
                                    { icon: <ChevronRight size={13} />, action: nextMonth, title: 'Next month' },
                                    { icon: <ChevronsRight size={13} />, action: nextYear, title: 'Next year' },
                                ] as const).map(({ icon, action, title }, i) => (
                                    <button key={i} onClick={action} title={title} style={{
                                        width: 26, height: 26, borderRadius: 6, border: 'none',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: 'transparent', cursor: 'pointer',
                                        color: t.micro, transition: 'all 0.1s',
                                    }}
                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = presetHoverBg}
                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                                    >
                                        {icon}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dual Calendar */}
                        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                            <MiniCalendar
                                isDarkMode={isDarkMode}
                                year={leftMonth.year}
                                month={leftMonth.month}
                                tempStart={tempStart}
                                tempEnd={tempEnd}
                                selecting={selecting}
                                onDayClick={handleDayClick}
                            />
                            <div style={{ width: 1, alignSelf: 'stretch', background: dividerColor }} />
                            <MiniCalendar
                                isDarkMode={isDarkMode}
                                year={rightMonth.year}
                                month={rightMonth.month}
                                tempStart={tempStart}
                                tempEnd={tempEnd}
                                selecting={selecting}
                                onDayClick={handleDayClick}
                            />
                        </div>

                        {/* Footer */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            paddingTop: 10, borderTop: `1px solid ${dividerColor}`,
                        }}>
                            {/* Status hint */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{
                                    padding: '3px 8px', borderRadius: 6,
                                    background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f4f4f5',
                                    fontSize: '10px', fontWeight: 600, color: t.micro,
                                }}>
                                    {selecting === 'start' ? 'Select start date' : 'Select end date'}
                                </div>
                                {tempStart && !tempEnd && (
                                    <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 600 }}>
                                        {formatMini(tempStart)} →
                                    </span>
                                )}
                                {tempStart && tempEnd && (
                                    <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 600 }}>
                                        {formatMini(tempStart)} – {formatMini(tempEnd)}
                                    </span>
                                )}
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <button
                                    onClick={handleClear}
                                    style={{
                                        padding: '5px 10px', borderRadius: 7, border: 'none',
                                        background: 'transparent', cursor: 'pointer',
                                        fontSize: '11px', fontWeight: 600,
                                        color: t.micro, transition: 'all 0.1s',
                                        textTransform: 'uppercase', letterSpacing: '0.04em',
                                    }}
                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = t.secondary}
                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = t.micro}
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={handleApply}
                                    disabled={!canApply}
                                    style={{
                                        padding: '5px 14px', borderRadius: 7, border: 'none',
                                        background: canApply
                                            ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                                            : (isDarkMode ? 'rgba(255,255,255,0.07)' : '#e4e4e7'),
                                        cursor: canApply ? 'pointer' : 'not-allowed',
                                        fontSize: '11px', fontWeight: 700,
                                        color: canApply ? '#ffffff' : t.micro,
                                        transition: 'all 0.15s',
                                        textTransform: 'uppercase', letterSpacing: '0.04em',
                                        boxShadow: canApply ? '0 2px 8px rgba(16,185,129,0.25)' : 'none',
                                    }}
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Export helpers for dashboardView ────────────────────────────────────────

export { today, todayEnd, isSameDay as isSameDayExport, formatMini, formatShort, buildPresets, getActivePresetLabel };
