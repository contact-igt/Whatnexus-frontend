"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CalendarRange, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface DateRangePickerProps {
  isDarkMode: boolean;
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (start: Date | null, end: Date | null) => void;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isInRange(date: Date, start: Date | null, end: Date | null) {
  if (!start || !end) return false;
  return date > start && date < end;
}

function formatDate(date: Date | null): string {
  if (!date) return '';
  const d = date.getDate().toString().padStart(2, '0');
  const m = MONTHS[date.getMonth()].slice(0, 3);
  const y = date.getFullYear();
  return `${m} ${d}, ${y}`;
}

export const DateRangePicker = ({ isDarkMode, startDate, endDate, onDateChange }: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [leftMonth, setLeftMonth] = useState(() => {
    const now = startDate || new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selecting, setSelecting] = useState<'start' | 'end'>('start');
  const [tempStart, setTempStart] = useState<Date | null>(startDate);
  const [tempEnd, setTempEnd] = useState<Date | null>(endDate);
  const ref = useRef<HTMLDivElement>(null);

  const rightMonth = {
    year: leftMonth.month === 11 ? leftMonth.year + 1 : leftMonth.year,
    month: leftMonth.month === 11 ? 0 : leftMonth.month + 1,
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const prevMonth = () => setLeftMonth(p => p.month === 0 ? { year: p.year - 1, month: 11 } : { year: p.year, month: p.month - 1 });
  const nextMonth = () => setLeftMonth(p => p.month === 11 ? { year: p.year + 1, month: 0 } : { year: p.year, month: p.month + 1 });
  const prevYear = () => setLeftMonth(p => ({ ...p, year: p.year - 1 }));
  const nextYear = () => setLeftMonth(p => ({ ...p, year: p.year + 1 }));

  const handleDayClick = (day: number, year: number, month: number) => {
    const clicked = new Date(year, month, day);
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
        setTempEnd(clicked);
        setSelecting('start');
        onDateChange(tempStart, clicked);
        setIsOpen(false);
      }
    }
  };

  const renderCalendar = (year: number, month: number) => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();
    const cells: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
      <div className="w-[280px]">
        <div className={cn("text-center font-bold text-sm mb-3", isDarkMode ? 'text-white/80' : 'text-slate-800')}>
          {MONTHS[month]} {year}
        </div>
        <div className="grid grid-cols-7 gap-0">
          {DAYS.map(d => (
            <div key={d} className={cn("text-center text-[10px] font-bold uppercase tracking-wider py-1.5", isDarkMode ? 'text-white/30' : 'text-slate-400')}>
              {d}
            </div>
          ))}
          {cells.map((day, i) => {
            if (day === null) {
              return <div key={`e-${i}`} className="h-9" />;
            }
            const date = new Date(year, month, day);
            const isToday = isSameDay(date, today);
            const isStart = tempStart && isSameDay(date, tempStart);
            const isEnd = tempEnd && isSameDay(date, tempEnd);
            const inRange = isInRange(date, tempStart, tempEnd);
            const isFuture = date > today;

            return (
              <button
                key={`d-${day}`}
                onClick={() => handleDayClick(day, year, month)}
                disabled={isFuture}
                className={cn(
                  "h-9 w-full flex items-center justify-center text-xs font-medium transition-all duration-200 relative",
                  isFuture
                    ? isDarkMode ? 'text-white/15 cursor-not-allowed' : 'text-slate-300 cursor-not-allowed'
                    : 'cursor-pointer',
                  // Selected start/end
                  (isStart || isEnd) && 'rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-sm shadow-emerald-500/20',
                  // In range
                  inRange && !isStart && !isEnd && (isDarkMode ? 'bg-emerald-500/10 text-emerald-300' : 'bg-emerald-50 text-emerald-700'),
                  // Today
                  isToday && !isStart && !isEnd && (isDarkMode ? 'ring-1 ring-emerald-500/30 rounded-lg text-emerald-400 font-bold' : 'ring-1 ring-emerald-300 rounded-lg text-emerald-600 font-bold'),
                  // Default
                  !isStart && !isEnd && !inRange && !isToday && !isFuture && (isDarkMode ? 'text-white/60 hover:bg-white/5 hover:text-white rounded-lg' : 'text-slate-700 hover:bg-slate-100 rounded-lg'),
                )}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const displayText = tempStart && tempEnd
    ? `${formatDate(tempStart)} – ${formatDate(tempEnd)}`
    : tempStart
      ? `${formatDate(tempStart)} – End date`
      : 'Start date → End date';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 border",
          isOpen
            ? isDarkMode
              ? 'bg-white/[0.06] text-white/70 border-emerald-500/30 shadow-sm shadow-emerald-500/10'
              : 'bg-white text-slate-700 border-emerald-300 shadow-sm shadow-emerald-100'
            : isDarkMode
              ? 'bg-white/[0.03] text-white/50 border-white/10 hover:bg-white/[0.06] hover:border-white/15 hover:text-white/70'
              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700'
        )}
      >
        <CalendarRange size={13} className={isOpen ? 'text-emerald-400' : ''} />
        <span>{displayText}</span>
      </button>

      {isOpen && (
        <div className={cn(
          "absolute top-full right-0 mt-2 z-50 p-5 rounded-2xl border shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300",
          isDarkMode
            ? 'bg-[#1a1a1f] border-white/10 shadow-black/60'
            : 'bg-white border-slate-200 shadow-slate-300/50'
        )}>
          {/* Navigation */}
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-1">
              <button onClick={prevYear} className={cn("p-1.5 rounded-lg transition-all", isDarkMode ? 'hover:bg-white/5 text-white/30 hover:text-white/60' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700')}>
                <ChevronsLeft size={14} />
              </button>
              <button onClick={prevMonth} className={cn("p-1.5 rounded-lg transition-all", isDarkMode ? 'hover:bg-white/5 text-white/30 hover:text-white/60' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700')}>
                <ChevronLeft size={14} />
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={nextMonth} className={cn("p-1.5 rounded-lg transition-all", isDarkMode ? 'hover:bg-white/5 text-white/30 hover:text-white/60' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700')}>
                <ChevronRight size={14} />
              </button>
              <button onClick={nextYear} className={cn("p-1.5 rounded-lg transition-all", isDarkMode ? 'hover:bg-white/5 text-white/30 hover:text-white/60' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700')}>
                <ChevronsRight size={14} />
              </button>
            </div>
          </div>

          {/* Dual Calendar */}
          <div className="flex gap-6">
            {renderCalendar(leftMonth.year, leftMonth.month)}
            <div className={cn("w-px self-stretch", isDarkMode ? 'bg-white/5' : 'bg-slate-200')} />
            {renderCalendar(rightMonth.year, rightMonth.month)}
          </div>

          {/* Footer */}
          <div className={cn("mt-4 pt-3 border-t flex items-center justify-between", isDarkMode ? 'border-white/5' : 'border-slate-100')}>
            <span className={cn("text-[10px] font-medium", isDarkMode ? 'text-white/25' : 'text-slate-400')}>
              {selecting === 'start' ? 'Select start date' : 'Select end date'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setTempStart(null);
                  setTempEnd(null);
                  setSelecting('start');
                  onDateChange(null, null);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                  isDarkMode ? 'text-white/35 hover:text-white/60 hover:bg-white/5' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                )}
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-teal-600 text-white transition-all hover:shadow-sm hover:shadow-emerald-500/20"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
