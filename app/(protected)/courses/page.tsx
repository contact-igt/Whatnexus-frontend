"use client";
import React, { useState } from "react";
import type {
  Course,
  Mentor,
  Category,
  Level,
  Status,
  CreateCourseDto,
  CreateMentorDto,
} from "@/services/courses/courses.types";
import {
  useGetAllCoursesQuery,
  useGetAllMentorsQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useCreateMentorMutation,
  useUpdateMentorMutation,
  useDeleteMentorMutation,
} from "@/hooks/useCoursesQuery";

/* ══════════════════════════════════════════════════════════════
   INLINE SVG ICON COMPONENTS
══════════════════════════════════════════════════════════════ */
const Icon = {
  BookOpen: (p?: React.SVGProps<SVGSVGElement>) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  Users: (p?: React.SVGProps<SVGSVGElement>) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  TrendingUp: (p?: React.SVGProps<SVGSVGElement>) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  Award: (p?: React.SVGProps<SVGSVGElement>) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  ),
  Search: (p?: React.SVGProps<SVGSVGElement>) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  ),
  Plus: (p?: React.SVGProps<SVGSVGElement>) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 5v14M5 12h14"/>
    </svg>
  ),
  Pencil: (p?: React.SVGProps<SVGSVGElement>) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>
    </svg>
  ),
  Trash: (p?: React.SVGProps<SVGSVGElement>) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
    </svg>
  ),
  X: (p?: React.SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  ),
  AlertTriangle: (p?: React.SVGProps<SVGSVGElement>) => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
    </svg>
  ),
  Clock: (p?: React.SVGProps<SVGSVGElement>) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Layers: (p?: React.SVGProps<SVGSVGElement>) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
    </svg>
  ),
  UsersSmall: (p?: React.SVGProps<SVGSVGElement>) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Star: (p?: React.SVGProps<SVGSVGElement>) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  Spinner: (p?: React.SVGProps<SVGSVGElement>) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" {...p} style={{ animation: "spin 0.8s linear infinite", ...(p?.style ?? {}) }}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  ),
  Inbox: (p?: React.SVGProps<SVGSVGElement>) => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
    </svg>
  ),
  Video: (p?: React.SVGProps<SVGSVGElement>) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>
  ),
  Calendar: (p?: React.SVGProps<SVGSVGElement>) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Mic: (p?: React.SVGProps<SVGSVGElement>) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  ),
  PlayCircle: (p?: React.SVGProps<SVGSVGElement>) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
    </svg>
  ),
  ExternalLink: (p?: React.SVGProps<SVGSVGElement>) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  ),
  CheckCircle: (p?: React.SVGProps<SVGSVGElement>) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  RadioTower: (p?: React.SVGProps<SVGSVGElement>) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4.9 16.1C1 12.2 1 5.8 4.9 1.9"/><path d="M7.8 4.7a6.14 6.14 0 0 0-.8 7.5"/><circle cx="12" cy="9" r="2"/><path d="M16.2 4.8c2 2 2.26 5.11.6 7.4"/><path d="M19.1 1.9a10.15 10.15 0 0 1 0 14.3"/><line x1="12" y1="9" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  ),
};

/* ══════════════════════════════════════════════════════════════
   CONSTANTS & DESIGN TOKENS
══════════════════════════════════════════════════════════════ */
const CATEGORIES: Category[] = ["Technology","Healthcare","Marketing","Design","Business","Finance","Science"];
const LEVELS:     Level[]    = ["Beginner","Intermediate","Advanced"];
const STATUSES:   Status[]   = ["Active","Draft","Archived"];
const PRESET_COLORS = ["#059669","#7C3AED","#D97706","#DB2777","#0284C7","#DC2626","#0891B2","#9333EA"];

const CATEGORY_GRADIENTS: Record<Category, string> = {
  Technology: "linear-gradient(135deg,#064E3B,#065F46)",
  Healthcare:  "linear-gradient(135deg,#4C1D95,#5B21B6)",
  Marketing:   "linear-gradient(135deg,#78350F,#92400E)",
  Design:      "linear-gradient(135deg,#831843,#9D174D)",
  Business:    "linear-gradient(135deg,#1E3A5F,#1E40AF)",
  Finance:     "linear-gradient(135deg,#134E4A,#115E59)",
  Science:     "linear-gradient(135deg,#1F2937,#374151)",
};

const LEVEL_COLORS: Record<Level, string> = {
  Beginner:     "#059669",
  Intermediate: "#2563EB",
  Advanced:     "#DC2626",
};

/* ── Sessions / Webinars ── */
type SessionTopic = "Leadership" | "Compliance" | "Soft Skills" | "Technical" | "Sales" | "HR" | "Finance";
type SessionTab   = "Upcoming"   | "Past";
interface Session {
  id:            string;
  title:         string;
  dateLabel:     string;
  timeLabel:     string;
  scheduledMs:   number;
  duration:      string;
  host:          string;
  topic:         SessionTopic;
  meetingLink:   string;
  recordingLink: string | null;
  isLive:        boolean;
  tab:           SessionTab;
  attendees:     number;
}
const TOPIC_COLORS: Record<SessionTopic, { text: string; bg: string; bar: string }> = {
  Leadership:    { text: "#A78BFA", bg: "rgba(124,58,237,0.12)",  bar: "#7C3AED" },
  Compliance:    { text: "#F87171", bg: "rgba(220,38,38,0.10)",   bar: "#DC2626" },
  "Soft Skills": { text: "#34D399", bg: "rgba(5,150,105,0.12)",   bar: "#059669" },
  Technical:     { text: "#60A5FA", bg: "rgba(2,132,199,0.12)",   bar: "#0284C7" },
  Sales:         { text: "#FCD34D", bg: "rgba(217,119,6,0.12)",   bar: "#D97706" },
  HR:            { text: "#F9A8D4", bg: "rgba(219,39,119,0.12)",  bar: "#DB2777" },
  Finance:       { text: "#67E8F9", bg: "rgba(8,145,178,0.12)",   bar: "#0891B2" },
};
const SESSIONS: Session[] = [
  { id:"ws1",  title:"Leadership Communication Skills",  dateLabel:"May 20, 2026", timeLabel:"3:00 PM IST",  scheduledMs:Date.UTC(2026,4,20,9,30),  duration:"60 mins",  host:"John Smith",   topic:"Leadership",   meetingLink:"https://zoom.us/j/928374651",                   recordingLink:null,                                          isLive:false, tab:"Upcoming", attendees:0   },
  { id:"ws2",  title:"Workplace Compliance 2026 Update", dateLabel:"May 25, 2026", timeLabel:"11:00 AM IST", scheduledMs:Date.UTC(2026,4,25,5,30),  duration:"90 mins",  host:"Priya Nair",   topic:"Compliance",   meetingLink:"https://teams.microsoft.com/l/compliance2026",  recordingLink:null,                                          isLive:false, tab:"Upcoming", attendees:0   },
  { id:"ws3",  title:"Mastering Data-Driven Sales",      dateLabel:"May 28, 2026", timeLabel:"2:00 PM IST",  scheduledMs:Date.UTC(2026,4,28,8,30),  duration:"75 mins",  host:"Arjun Mehta",  topic:"Sales",        meetingLink:"https://meet.google.com/abc-defg-hij",         recordingLink:null,                                          isLive:false, tab:"Upcoming", attendees:0   },
  { id:"ws4",  title:"AI in Healthcare Operations",      dateLabel:"Jun 5, 2026",  timeLabel:"4:00 PM IST",  scheduledMs:Date.UTC(2026,5,5,10,30),  duration:"120 mins", host:"Dr. Sarah Lee", topic:"Technical",    meetingLink:"https://zoom.us/j/102938475",                   recordingLink:null,                                          isLive:false, tab:"Upcoming", attendees:0   },
  { id:"ws5",  title:"Inclusive HR Practices 2026",      dateLabel:"Jun 12, 2026", timeLabel:"10:00 AM IST", scheduledMs:Date.UTC(2026,5,12,4,30),  duration:"60 mins",  host:"Ravi Sharma",  topic:"HR",           meetingLink:"https://teams.microsoft.com/l/hrpractices",     recordingLink:null,                                          isLive:false, tab:"Upcoming", attendees:0   },
  { id:"ws6",  title:"Financial Risk Management — Live", dateLabel:"May 12, 2026", timeLabel:"3:00 PM IST",  scheduledMs:Date.UTC(2026,4,12,9,30),  duration:"90 mins",  host:"Maya Patel",   topic:"Finance",      meetingLink:"https://zoom.us/j/567382910",                   recordingLink:null,                                          isLive:true,  tab:"Upcoming", attendees:142 },
  { id:"ws7",  title:"Product Leadership Masterclass",   dateLabel:"Apr 15, 2026", timeLabel:"2:00 PM IST",  scheduledMs:Date.UTC(2026,3,15,8,30),  duration:"90 mins",  host:"Tom Wilson",   topic:"Leadership",   meetingLink:"",  recordingLink:"https://vimeo.com/product-leadership-rec",    isLive:false, tab:"Past",     attendees:287 },
  { id:"ws8",  title:"POSH & Compliance Workshop",       dateLabel:"Apr 28, 2026", timeLabel:"11:00 AM IST", scheduledMs:Date.UTC(2026,3,28,5,30),  duration:"60 mins",  host:"Anita Desai",  topic:"Compliance",   meetingLink:"",  recordingLink:null,                                          isLive:false, tab:"Past",     attendees:194 },
  { id:"ws9",  title:"Emotional Intelligence at Work",   dateLabel:"Mar 20, 2026", timeLabel:"3:00 PM IST",  scheduledMs:Date.UTC(2026,2,20,9,30),  duration:"60 mins",  host:"Sarah Kumar",  topic:"Soft Skills",  meetingLink:"",  recordingLink:"https://vimeo.com/ei-at-work-rec",            isLive:false, tab:"Past",     attendees:356 },
  { id:"ws10", title:"Excel & Automation Bootcamp",      dateLabel:"Mar 5, 2026",  timeLabel:"10:00 AM IST", scheduledMs:Date.UTC(2026,2,5,4,30),   duration:"120 mins", host:"Vikram Singh", topic:"Technical",    meetingLink:"",  recordingLink:"https://vimeo.com/excel-automation-rec",      isLive:false, tab:"Past",     attendees:421 },
];

const T = {
  bg:      "#0D1117",
  card:    "#000000",
  input:   "#0D1117",
  border:  "#1F2937",
  borderH: "#374151",
  text:    "#F9FAFB",
  sub:     "#9CA3AF",
  muted:   "#6B7280",
  green:   "#059669",
  greenL:  "#10B981",
  greenV:  "#34D399",
  red:     "#991B1B",
  redT:    "#F87171",
  yellow:  "#FBBF24",
};

/* ══════════════════════════════════════════════════════════════
   SHARED STYLES
══════════════════════════════════════════════════════════════ */
const inputStyle: React.CSSProperties = {
  background: T.input, border: `1px solid ${T.borderH}`,
  borderRadius: 8, color: T.text, padding: "10px 12px",
  fontSize: 13, width: "100%", outline: "none", boxSizing: "border-box",
};
const selectStyle: React.CSSProperties = {
  background: T.input, border: `1px solid ${T.borderH}`,
  borderRadius: 8, color: T.text, padding: "10px 12px",
  fontSize: 13, outline: "none",
};
const cardStyle: React.CSSProperties = {
  background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
};
const btnGreen: React.CSSProperties = {
  background: T.green, color: "#fff", border: "none",
  borderRadius: 8, padding: "10px 18px", fontSize: 13,
  fontWeight: 600, cursor: "pointer", display: "flex",
  alignItems: "center", gap: 6, whiteSpace: "nowrap",
};
const btnGhost: React.CSSProperties = {
  background: "transparent", color: T.sub,
  border: `1px solid ${T.border}`, borderRadius: 8,
  padding: "9px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer",
};
const iconBtnStyle = (danger = false): React.CSSProperties => ({
  border: "none", borderRadius: 6, width: 28, height: 28,
  cursor: "pointer", display: "flex", alignItems: "center",
  justifyContent: "center", background: "rgba(0,0,0,0.45)",
  color: danger ? T.redT : "#fff",
});

function pill(color: string, bg: string): React.CSSProperties {
  return { background: bg, color, borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center" };
}

function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("") || "?";
}

/* ══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════════════════ */

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div style={{ ...cardStyle, padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 46, height: 46, borderRadius: 12, background: "rgba(5,150,105,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: T.greenL }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, color: T.text }}>{value}</div>
        <div style={{ fontSize: 12, color: T.sub, marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
      <div style={{ height: 100, background: "linear-gradient(135deg,#1F2937,#374151)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)", animation: "shimmer 1.5s infinite" }} />
      </div>
      <div style={{ padding: 16 }}>
        {[60, 90, 70].map((w, i) => (
          <div key={i} style={{ height: 10, borderRadius: 6, background: "#1F2937", marginBottom: 12, width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", animation: "fadeIn 0.3s ease-out" }}>
      <div onClick={e => e.stopPropagation()} className="right-drawer" style={{ 
        position: "absolute", 
        right: 0, 
        top: 0, 
        height: "100vh", 
        background: T.card, 
        borderLeft: `1px solid ${T.borderH}`,
        width: "100%",
        maxWidth: 480,
        overflowY: "auto",
        padding: 28,
        animation: "slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
      <span style={{ fontSize: 17, fontWeight: 700 }}>{title}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: T.sub, cursor: "pointer", display: "flex", padding: 4 }}>
        <Icon.X />
      </button>
    </div>
  );
}

/* ── Course Form ── */
interface CourseFormState {
  title: string; category: Category; level: Level;
  mentorId: string; lessons: number | ""; duration: string;
  price: number | ""; status: Status; description: string;
  registrationLink: string;
  meetingLink: string;
}

function CourseForm({ initial, mentors, onSave, onClose, loading }: {
  initial?: Partial<Course>; mentors: Mentor[];
  onSave: (data: CreateCourseDto) => void;
  onClose: () => void; loading?: boolean;
}) {
  const [f, setF] = useState<CourseFormState>({
    title:       initial?.title       ?? "",
    category:    initial?.category    ?? "Technology",
    level:       initial?.level       ?? "Beginner",
    mentorId:    initial?.mentorId    ?? (mentors[0]?.id ?? ""),
    lessons:     initial?.lessons     ?? "",
    duration:    initial?.duration    ?? "",
    price:       initial?.price       ?? "",
    status:      initial?.status      ?? "Draft",
    description: initial?.description ?? "",
    registrationLink: initial?.registrationLink ?? "",
    meetingLink:      initial?.meetingLink      ?? "",
  });

  const upd = <K extends keyof CourseFormState>(k: K, v: CourseFormState[K]) => setF(p => ({ ...p, [k]: v }));
  const valid = !!f.title.trim() && f.lessons !== "" && !!f.duration.trim();

  return (
    <>
      <ModalHeader title={initial?.id ? "Edit Course" : "Add Course"} onClose={onClose} />
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <input placeholder="Course Title *" style={inputStyle} value={f.title} onChange={e => upd("title", e.target.value)} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <select style={selectStyle} value={f.category} onChange={e => upd("category", e.target.value as Category)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select style={selectStyle} value={f.level} onChange={e => upd("level", e.target.value as Level)}>
            {LEVELS.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
        <select style={selectStyle} value={f.mentorId} onChange={e => upd("mentorId", e.target.value)}>
          <option value="">— No Mentor —</option>
          {mentors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <input placeholder="Lessons *" type="number" style={inputStyle} value={f.lessons}
            onChange={e => upd("lessons", e.target.value === "" ? "" : Number(e.target.value))} />
          <input placeholder="e.g. 4h 30m *" style={inputStyle} value={f.duration} onChange={e => upd("duration", e.target.value)} />
          <input placeholder="Price ₹" type="number" style={inputStyle} value={f.price}
            onChange={e => upd("price", e.target.value === "" ? "" : Number(e.target.value))} />
        </div>
        <select style={selectStyle} value={f.status} onChange={e => upd("status", e.target.value as Status)}>
          {STATUSES.map(st => <option key={st}>{st}</option>)}
        </select>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <input placeholder="Registration URL (optional)" style={inputStyle} value={f.registrationLink}
            onChange={e => upd("registrationLink", e.target.value)} />
          <input placeholder="Meeting / Join URL (optional)" style={inputStyle} value={f.meetingLink}
            onChange={e => upd("meetingLink", e.target.value)} />
        </div>
        <textarea placeholder="Description" style={{ ...inputStyle, height: 80, resize: "vertical" }}
          value={f.description} onChange={e => upd("description", e.target.value)} />
        <button disabled={!valid || loading}
          onClick={() => onSave({ ...f, lessons: Number(f.lessons) || 0, price: Number(f.price) || 0, registrationLink: f.registrationLink || undefined, meetingLink: f.meetingLink || undefined })}
          style={{ ...btnGreen, opacity: valid && !loading ? 1 : 0.4 }}>
          {loading && <Icon.Spinner />}
          {loading ? "Saving…" : "Save Course"}
        </button>
      </div>
    </>
  );
}

/* ── Mentor Form ── */
interface MentorFormState { name: string; expertise: Category; rating: number; color: string; }

function MentorForm({ initial, onSave, onClose, loading }: {
  initial?: Partial<Mentor>;
  onSave: (data: CreateMentorDto) => void;
  onClose: () => void; loading?: boolean;
}) {
  const [f, setF] = useState<MentorFormState>({
    name:      initial?.name      ?? "",
    expertise: initial?.expertise ?? "Technology",
    rating:    initial?.rating    ?? 4,
    color:     initial?.color     ?? PRESET_COLORS[0],
  });
  const upd = <K extends keyof MentorFormState>(k: K, v: MentorFormState[K]) => setF(p => ({ ...p, [k]: v }));

  return (
    <>
      <ModalHeader title={initial?.id ? "Edit Mentor" : "Add Mentor"} onClose={onClose} />
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "#0D1117", borderRadius: 10, border: `1px solid ${T.border}`, marginBottom: 20 }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: f.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, color: "#fff", flexShrink: 0 }}>
          {getInitials(f.name)}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{f.name || "Your Name"}</div>
          <div style={{ fontSize: 12, color: T.sub, marginTop: 2 }}>{f.expertise}</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <input placeholder="Full Name *" style={inputStyle} value={f.name} onChange={e => upd("name", e.target.value)} />
        <select style={selectStyle} value={f.expertise} onChange={e => upd("expertise", e.target.value as Category)}>
          {CATEGORIES.map(x => <option key={x}>{x}</option>)}
        </select>
        <input placeholder="Rating (1–5)" type="number" min={1} max={5} step={0.1} style={inputStyle}
          value={f.rating} onChange={e => upd("rating", Number(e.target.value))} />
        <div>
          <div style={{ fontSize: 12, color: T.sub, marginBottom: 8 }}>Avatar Color</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {PRESET_COLORS.map(c => (
              <div key={c} onClick={() => upd("color", c)}
                style={{ width: 30, height: 30, borderRadius: "50%", background: c, cursor: "pointer", border: f.color === c ? "3px solid #fff" : "3px solid transparent", boxSizing: "border-box", transition: "border 0.15s" }} />
            ))}
          </div>
        </div>
        <button disabled={!f.name.trim() || loading} onClick={() => onSave(f)}
          style={{ ...btnGreen, opacity: f.name.trim() && !loading ? 1 : 0.4 }}>
          {loading && <Icon.Spinner />}
          {loading ? "Saving…" : "Save Mentor"}
        </button>
      </div>
    </>
  );
}

/* ── Delete Confirm Modal ── */
function DeleteModal({ name, warning, onConfirm, onClose, loading }: {
  name: string; warning?: string; onConfirm: () => void; onClose: () => void; loading?: boolean;
}) {
  return (
    <Modal onClose={onClose}>
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14, color: T.yellow }}>
          <Icon.AlertTriangle />
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Delete "{name}"?</div>
        <div style={{ fontSize: 13, color: T.sub, marginBottom: warning ? 12 : 24 }}>This action cannot be undone.</div>
        {warning && (
          <div style={{ background: "rgba(251,191,36,0.1)", border: "1px solid #FBBF24", borderRadius: 8, padding: "10px 14px", color: T.yellow, fontSize: 12, marginBottom: 24, textAlign: "left" }}>
            {warning}
          </div>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={onClose} style={btnGhost}>Cancel</button>
          <button onClick={onConfirm} disabled={loading}
            style={{ ...btnGreen, background: T.red, color: T.redT, opacity: loading ? 0.6 : 1 }}>
            {loading ? <Icon.Spinner /> : <Icon.Trash />}
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
type ViewType = "courses" | "webinars" | "mentors";
type SortKey  = "Newest First" | "A–Z" | "Most Enrolled" | "Completion Rate";

type CourseModal =
  | { type: "add" }
  | { type: "edit";   course: Course }
  | { type: "delete"; course: Course };

type MentorModal =
  | { type: "add" }
  | { type: "edit";   mentor: Mentor }
  | { type: "delete"; mentor: Mentor };

export default function CoursesPage() {
  /* ── Data ── */
  const { data: coursesRes, isLoading: coursesLoading, isError: coursesError } = useGetAllCoursesQuery();
  const { data: mentorsRes, isLoading: mentorsLoading }                         = useGetAllMentorsQuery();
  const courses = coursesRes?.data ?? [];
  const mentors = mentorsRes?.data ?? [];

  /* ── Mutations ── */
  const createCourse = useCreateCourseMutation();
  const updateCourse = useUpdateCourseMutation();
  const deleteCourse = useDeleteCourseMutation();
  const createMentor = useCreateMentorMutation();
  const updateMentor = useUpdateMentorMutation();
  const deleteMentor = useDeleteMentorMutation();

  /* ── UI State ── */
  const [view,        setView]        = useState<ViewType>("courses");
  const [tab,         setTab]         = useState<Status>("Active");
  const [search,      setSearch]      = useState("");
  const [catFilter,   setCat]         = useState<"All" | Category>("All");
  const [levelFilter, setLevel]       = useState<"All" | Level>("All");
  const [sort,        setSort]        = useState<SortKey>("Newest First");
  const [courseModal, setCourseModal] = useState<CourseModal | null>(null);
  const [mentorModal, setMentorModal] = useState<MentorModal | null>(null);

  /* ── Sessions state ── */
  const [sessionTab,    setSessionTab]    = useState<SessionTab>("Upcoming");
  const [sessionSearch, setSessionSearch] = useState("");
  const [sessionTopic,  setSessionTopic]  = useState<"All" | SessionTopic>("All");
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set(["ws2"]));

  /* ── Computed Stats (live from API data) ── */
  const activeCourses = courses.filter(c => c.status === "Active");
  const totalEnrolled = activeCourses.reduce((a, c) => a + (c.enrolled ?? 0), 0);
  const avgCompletion = activeCourses.length
    ? Math.round(activeCourses.reduce((a, c) => a + (c.completion ?? 0), 0) / activeCourses.length)
    : 0;
  const certificates = activeCourses.reduce((a, c) => a + Math.round((c.enrolled ?? 0) * ((c.completion ?? 0) / 100)), 0);

  /* ── Session stats ── */
  const upcomingSessions = SESSIONS.filter(s => s.tab === "Upcoming");
  const liveSessions     = SESSIONS.filter(s => s.isLive);
  const pastSessions     = SESSIONS.filter(s => s.tab === "Past");
  const totalAttendees   = pastSessions.reduce((a, s) => a + s.attendees, 0);

  /* ── Handlers: Courses ── */
  const handleSaveCourse = (data: CreateCourseDto) => {
    if (courseModal?.type === "edit") {
      updateCourse.mutate({ id: courseModal.course.id, data }, { onSuccess: () => setCourseModal(null) });
    } else {
      createCourse.mutate(data, { onSuccess: () => setCourseModal(null) });
    }
  };
  const handleDeleteCourse = () => {
    if (courseModal?.type !== "delete") return;
    deleteCourse.mutate(courseModal.course.id, { onSuccess: () => setCourseModal(null) });
  };

  /* ── Handlers: Mentors ── */
  const handleSaveMentor = (data: CreateMentorDto) => {
    if (mentorModal?.type === "edit") {
      updateMentor.mutate({ id: mentorModal.mentor.id, data }, { onSuccess: () => setMentorModal(null) });
    } else {
      createMentor.mutate(data, { onSuccess: () => setMentorModal(null) });
    }
  };
  const handleDeleteMentor = () => {
    if (mentorModal?.type !== "delete") return;
    deleteMentor.mutate(mentorModal.mentor.id, { onSuccess: () => setMentorModal(null) });
  };

  /* ── Filter + Sort ── */
  const tabCount = (st: Status) => courses.filter(c => c.status === st).length;
  const filtered = courses
    .filter(c => c.status === tab)
    .filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase()))
    .filter(c => catFilter === "All"   || c.category === catFilter)
    .filter(c => levelFilter === "All" || c.level    === levelFilter)
    .sort((a, b) => {
      if (sort === "A–Z")             return a.title.localeCompare(b.title);
      if (sort === "Most Enrolled")   return (b.enrolled ?? 0) - (a.enrolled ?? 0);
      if (sort === "Completion Rate") return (b.completion ?? 0) - (a.completion ?? 0);
      return String(b.id) > String(a.id) ? -1 : 1;
    });

  const getMentor = (id: string) => mentors.find(m => m.id === id);

  /* ── Filtered sessions ── */
  const SESSION_TOPICS: SessionTopic[] = ["Leadership","Compliance","Soft Skills","Technical","Sales","HR","Finance"];
  const filteredSessions = SESSIONS
    .filter(s => s.tab === sessionTab)
    .filter(s => !sessionSearch || s.title.toLowerCase().includes(sessionSearch.toLowerCase()) || s.host.toLowerCase().includes(sessionSearch.toLowerCase()))
    .filter(s => sessionTopic === "All" || s.topic === sessionTopic)
    .sort((a, b) => sessionTab === "Upcoming" ? a.scheduledMs - b.scheduledMs : b.scheduledMs - a.scheduledMs);
  const sessionTabCount = (t: SessionTab) => SESSIONS.filter(s => s.tab === t).length;

  /* ══════════ RENDER ══════════ */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        select option { background: #111827; color: #F9FAFB; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #374151; border-radius: 3px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes livePulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.7); } }
        @media (max-width: 768px) {
          .right-drawer { max-width: 100% !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto", padding: "28px 28px" }}>

          {/* ── Top Nav ── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>Course Management</h1>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: T.sub }}>Manage courses, mentors and enrollments</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {([
                { key: "courses"  as ViewType, label: "Courses",  navIcon: <Icon.BookOpen width={15} height={15} /> },
                { key: "webinars" as ViewType, label: "Sessions", navIcon: <Icon.Video   width={15} height={15} /> },
                { key: "mentors"  as ViewType, label: "Mentors",  navIcon: <Icon.Users   width={15} height={15} /> },
              ]).map(({ key, label, navIcon }) => (
                <button key={key} onClick={() => setView(key)} style={{
                  ...btnGhost,
                  background:  view === key ? "rgba(5,150,105,0.15)" : "transparent",
                  color:       view === key ? T.greenL : T.sub,
                  borderColor: view === key ? T.green  : T.border,
                  fontWeight: 600, display: "flex", alignItems: "center", gap: 6,
                }}>
                  {navIcon}
                  {label}
                  {key === "webinars" && liveSessions.length > 0 && (
                    <span style={{ background: "#DC2626", color: "#fff", borderRadius: 99, padding: "1px 6px", fontSize: 9, fontWeight: 700 }}>LIVE</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Stat Cards ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 16, marginBottom: 32 }}>
            {view === "webinars" ? (<>
              <StatCard label="Total Sessions"    value={SESSIONS.length}                  icon={<Icon.Video      width={22} height={22} />} />
              <StatCard label="Upcoming Sessions" value={upcomingSessions.length}          icon={<Icon.Calendar   width={22} height={22} />} />
              <StatCard label="Live Now"          value={liveSessions.length}              icon={<Icon.RadioTower width={22} height={22} />} />
              <StatCard label="Total Attendees"   value={totalAttendees.toLocaleString()}  icon={<Icon.UsersSmall width={22} height={22} />} />
            </>) : (<>
              <StatCard label="Total Active Courses" value={activeCourses.length}           icon={<Icon.BookOpen   width={22} height={22} />} />
              <StatCard label="Enrolled Students"    value={totalEnrolled.toLocaleString()} icon={<Icon.Users      width={22} height={22} />} />
              <StatCard label="Avg Completion %"     value={`${avgCompletion}%`}            icon={<Icon.TrendingUp width={22} height={22} />} />
              <StatCard label="Certificates Issued"  value={certificates.toLocaleString()}  icon={<Icon.Award      width={22} height={22} />} />
            </>)}
          </div>

          {/* ════════ COURSES VIEW ════════ */}
          {view === "courses" && (
            <>
              {/* Status Tabs */}
              <div style={{ display: "flex", gap: 4, marginBottom: 18, borderBottom: `1px solid ${T.border}` }}>
                {STATUSES.map(st => (
                  <button key={st} onClick={() => { setTab(st); setSearch(""); setCat("All"); setLevel("All"); }}
                    style={{
                      background: tab === st ? "rgba(5,150,105,0.12)" : "transparent",
                      color:      tab === st ? T.greenL : T.sub,
                      border: "none", borderBottom: tab === st ? `2px solid ${T.green}` : "2px solid transparent",
                      padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                      borderRadius: "6px 6px 0 0", transition: "all 0.15s",
                    }}>
                    {st}
                    <span style={{ background: tab === st ? T.green : "#1F2937", color: "#fff", borderRadius: 99, padding: "1px 7px", fontSize: 10, marginLeft: 6, fontWeight: 700 }}>
                      {tabCount(st)}
                    </span>
                  </button>
                ))}
              </div>

              {/* Filter Bar */}
              <div style={{ display: "flex", gap: 10, marginBottom: 22, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ position: "relative", flex: "0 0 220px" }}>
                  <div style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: T.muted, pointerEvents: "none" }}>
                    <Icon.Search />
                  </div>
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses…"
                    style={{ ...inputStyle, paddingLeft: 34 }} />
                </div>
                <select value={catFilter}   onChange={e => setCat(e.target.value as "All" | Category)} style={selectStyle}>
                  <option value="All">All Categories</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <select value={levelFilter} onChange={e => setLevel(e.target.value as "All" | Level)} style={selectStyle}>
                  <option value="All">All Levels</option>
                  {LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
                <select value={sort} onChange={e => setSort(e.target.value as SortKey)} style={selectStyle}>
                  {(["Newest First","A–Z","Most Enrolled","Completion Rate"] as SortKey[]).map(o => <option key={o}>{o}</option>)}
                </select>
                <button onClick={() => setCourseModal({ type: "add" })} style={{ ...btnGreen, marginLeft: "auto" }}>
                  <Icon.Plus /> Add Course
                </button>
              </div>

              {/* Course Grid */}
              {coursesLoading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 18 }}>
                  {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : coursesError ? (
                <div style={{ textAlign: "center", padding: "80px 0", color: T.redT }}>
                  <div style={{ fontSize: 14 }}>Failed to load courses. Please refresh the page.</div>
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 0", color: T.muted }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 14, opacity: 0.4 }}><Icon.Inbox /></div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No courses found</div>
                  <div style={{ fontSize: 13 }}>Try adjusting your filters or add a new course.</div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 18 }}>
                  {filtered.map(course => {
                    const mentor = getMentor(course.mentorId);
                    return (
                      <div key={course.id}
                        style={{ ...cardStyle, padding: 0, overflow: "hidden", transition: "border-color 0.2s" }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = T.borderH)}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}
                      >
                        {/* Banner */}
                        <div style={{ background: CATEGORY_GRADIENTS[course.category] ?? CATEGORY_GRADIENTS.Technology, height: 100, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon.BookOpen width={40} height={40} style={{ opacity: 0.3 }} />
                          <div style={{ position: "absolute", top: 10, left: 10, ...pill("#fff", LEVEL_COLORS[course.level] ?? "#6B7280") }}>
                            {course.level}
                          </div>
                          <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 6 }}>
                            <button onClick={() => setCourseModal({ type: "edit", course })} style={iconBtnStyle()} title="Edit">
                              <Icon.Pencil />
                            </button>
                            <button onClick={() => setCourseModal({ type: "delete", course })} style={iconBtnStyle(true)} title="Delete">
                              <Icon.Trash />
                            </button>
                          </div>
                        </div>

                        {/* Body */}
                        <div style={{ padding: "16px 16px 14px" }}>
                          <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
                            {course.category}
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, lineHeight: 1.4, minHeight: 42 }}>
                            {course.title}
                          </div>

                          {mentor ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                              <div style={{ width: 26, height: 26, borderRadius: "50%", background: mentor.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                                {mentor.initials || getInitials(mentor.name)}
                              </div>
                              <span style={{ fontSize: 12, color: T.sub }}>{mentor.name}</span>
                            </div>
                          ) : (
                            <div style={{ height: 34, marginBottom: 14 }} />
                          )}

                          <div style={{ display: "flex", gap: 14, fontSize: 11, color: T.muted, marginBottom: 14, flexWrap: "wrap" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <Icon.Layers />{course.lessons} lessons
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <Icon.Clock />{course.duration}
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <Icon.UsersSmall />{(course.enrolled ?? 0).toLocaleString()}
                            </span>
                          </div>

                          {course.status === "Active" && (
                            <div style={{ marginBottom: 14 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.sub, marginBottom: 5 }}>
                                <span>Completion</span>
                                <span style={{ fontWeight: 700, color: T.greenL }}>{course.completion ?? 0}%</span>
                              </div>
                              <div style={{ height: 5, background: "#1F2937", borderRadius: 99, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${course.completion ?? 0}%`, background: `linear-gradient(90deg,${T.green},${T.greenV})`, borderRadius: 99, transition: "width 0.4s" }} />
                              </div>
                            </div>
                          )}

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
                            <span style={{ fontSize: 12, color: T.sub, fontWeight: 600 }}>
                              ₹{(course.price ?? 0).toLocaleString()}
                            </span>
                            <span style={pill(
                              course.status === "Active"  ? T.greenL :
                              course.status === "Draft"   ? T.yellow : T.muted,
                              course.status === "Active"  ? "rgba(16,185,129,0.12)" :
                              course.status === "Draft"   ? "rgba(251,191,36,0.12)" : "rgba(107,114,128,0.15)"
                            )}>
                              {course.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ════════ WEBINARS VIEW ════════ */}
          {view === "webinars" && (
            <>
              {/* Tabs + Schedule button */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {(["Upcoming", "Past"] as SessionTab[]).map(t => (
                    <button key={t} onClick={() => { setSessionTab(t); setSessionSearch(""); setSessionTopic("All"); }}
                      style={{
                        background: sessionTab === t ? "rgba(5,150,105,0.12)" : "transparent",
                        color:      sessionTab === t ? T.greenL : T.sub,
                        border: "none", borderBottom: sessionTab === t ? `2px solid ${T.green}` : "2px solid transparent",
                        padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                        borderRadius: "6px 6px 0 0", transition: "all 0.15s",
                      }}>
                      {t}
                      <span style={{ background: sessionTab === t ? T.green : "#1F2937", color: "#fff", borderRadius: 99, padding: "1px 7px", fontSize: 10, marginLeft: 6, fontWeight: 700 }}>
                        {sessionTabCount(t)}
                      </span>
                    </button>
                  ))}
                </div>
                <button style={{ ...btnGreen, marginBottom: 2 }}>
                  <Icon.Plus /> Schedule Session
                </button>
              </div>

              {/* Filter bar */}
              <div style={{ display: "flex", gap: 10, margin: "18px 0 22px", flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ position: "relative", flex: "0 0 260px" }}>
                  <div style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: T.muted, pointerEvents: "none" }}>
                    <Icon.Search />
                  </div>
                  <input value={sessionSearch} onChange={e => setSessionSearch(e.target.value)} placeholder="Search sessions or trainers…"
                    style={{ ...inputStyle, paddingLeft: 34 }} />
                </div>
                <select value={sessionTopic} onChange={e => setSessionTopic(e.target.value as "All" | SessionTopic)} style={selectStyle}>
                  <option value="All">All Topics</option>
                  {SESSION_TOPICS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              {/* Card grid / empty state */}
              {filteredSessions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 0", color: T.muted }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 14, opacity: 0.4 }}><Icon.Inbox /></div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No sessions found</div>
                  <div style={{ fontSize: 13 }}>Try adjusting your filters.</div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 20 }}>
                  {filteredSessions.map(session => {
                    const isRegistered = registeredIds.has(session.id);
                    const tc           = TOPIC_COLORS[session.topic];
                    const showLink     = isRegistered || session.isLive;
                    const hasRecording = !!session.recordingLink;
                    return (
                      <div key={session.id}
                        style={{ ...cardStyle, padding: 0, overflow: "hidden", transition: "border-color 0.2s" }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = T.borderH)}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}
                      >
                        {/* Topic accent bar */}
                        <div style={{ height: 4, background: tc.bar }} />

                        <div style={{ padding: "18px 20px 20px" }}>
                          {/* Topic pill + live badge */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                            <span style={{ ...pill(tc.text, tc.bg), fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                              {session.topic}
                            </span>
                            {session.isLive && (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(220,38,38,0.15)", color: "#F87171", borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#F87171", display: "inline-block", animation: "livePulse 1.4s ease-in-out infinite" }} />
                                LIVE
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.45, marginBottom: 16, color: T.text }}>
                            {session.title}
                          </div>

                          {/* Meta rows */}
                          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 16 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: T.sub }}>
                              <Icon.Calendar style={{ flexShrink: 0, color: T.muted }} />
                              <span>{session.dateLabel} &middot; {session.timeLabel}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: T.sub }}>
                              <Icon.Clock style={{ flexShrink: 0, color: T.muted }} />
                              <span>{session.duration}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: T.sub }}>
                              <Icon.Mic style={{ flexShrink: 0, color: T.muted }} />
                              <span>{session.host}</span>
                            </div>
                            {session.attendees > 0 && (
                              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: T.sub }}>
                                <Icon.UsersSmall style={{ flexShrink: 0, color: T.muted }} />
                                <span>{session.attendees.toLocaleString()} attendees</span>
                              </div>
                            )}
                          </div>

                          {/* Meeting link row (upcoming only) */}
                          {session.tab === "Upcoming" && (
                            <div style={{ marginBottom: 16, padding: "9px 12px", background: "#0D1117", borderRadius: 8, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                              <Icon.ExternalLink style={{ color: T.muted, flexShrink: 0 }} />
                              {showLink ? (
                                <a href={session.meetingLink} target="_blank" rel="noopener noreferrer"
                                  style={{ fontSize: 11, color: T.greenL, textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                                  {session.meetingLink}
                                </a>
                              ) : (
                                <span style={{ fontSize: 11, color: T.muted, flex: 1 }}>
                                  Register to access meeting link
                                </span>
                              )}
                            </div>
                          )}

                          {/* CTA */}
                          {session.isLive ? (
                            <a href={session.meetingLink} target="_blank" rel="noopener noreferrer"
                              style={{ ...btnGreen, display: "flex", width: "100%", justifyContent: "center", textDecoration: "none", background: "#DC2626" }}>
                              <Icon.RadioTower />
                              Join Now
                            </a>
                          ) : session.tab === "Upcoming" ? (
                            isRegistered ? (
                              <button style={{ ...btnGreen, width: "100%", justifyContent: "center", background: "rgba(5,150,105,0.15)", color: T.greenL, border: `1px solid ${T.green}` }} disabled>
                                <Icon.CheckCircle />
                                Registered
                              </button>
                            ) : (
                              <button
                                onClick={() => setRegisteredIds(prev => new Set([...prev, session.id]))}
                                style={{ ...btnGreen, width: "100%", justifyContent: "center" }}>
                                <Icon.Plus />
                                Register
                              </button>
                            )
                          ) : hasRecording ? (
                            <a href={session.recordingLink!} target="_blank" rel="noopener noreferrer"
                              style={{ ...btnGhost, display: "flex", width: "100%", justifyContent: "center", alignItems: "center", gap: 6, textDecoration: "none", color: "#60A5FA", borderColor: "#0284C7" }}>
                              <Icon.PlayCircle />
                              Watch Now
                            </a>
                          ) : (
                            <button disabled
                              style={{ ...btnGhost, display: "flex", width: "100%", justifyContent: "center", alignItems: "center", gap: 6, opacity: 0.4, cursor: "not-allowed" }}>
                              No Recording Available
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ════════ MENTORS VIEW ════════ */}
          {view === "mentors" && (
            <>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 22 }}>
                <button onClick={() => setMentorModal({ type: "add" })} style={btnGreen}>
                  <Icon.Plus /> Add Mentor
                </button>
              </div>

              {mentorsLoading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 18 }}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} style={{ ...cardStyle, padding: 20 }}>
                      {[50, 70, 100].map((w, j) => (
                        <div key={j} style={{ height: 12, borderRadius: 6, background: "#1F2937", marginBottom: 12, width: `${w}%` }} />
                      ))}
                    </div>
                  ))}
                </div>
              ) : mentors.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 0", color: T.muted }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 14, opacity: 0.4 }}><Icon.Users width={40} height={40} /></div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No mentors yet</div>
                  <div style={{ fontSize: 13 }}>Add your first mentor to get started.</div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 18 }}>
                  {mentors.map(mentor => {
                    const assignedCount = courses.filter(c => c.mentorId === mentor.id).length;
                    return (
                      <div key={mentor.id}
                        style={{ ...cardStyle, padding: 20, position: "relative", transition: "border-color 0.2s" }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = T.borderH)}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}
                      >
                        <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 6 }}>
                          <button onClick={() => setMentorModal({ type: "edit", mentor })}
                            style={{ ...iconBtnStyle(), background: "#1F2937", color: T.sub }} title="Edit">
                            <Icon.Pencil />
                          </button>
                          <button onClick={() => setMentorModal({ type: "delete", mentor })}
                            style={{ ...iconBtnStyle(true), background: "#1F2937" }} title="Delete">
                            <Icon.Trash />
                          </button>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18, paddingRight: 52 }}>
                          <div style={{ width: 44, height: 44, borderRadius: "50%", background: mentor.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: "#fff", flexShrink: 0 }}>
                            {mentor.initials || getInitials(mentor.name)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{mentor.name}</div>
                            <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>{mentor.expertise}</div>
                          </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          <div style={{ background: "#0D1117", borderRadius: 8, padding: "10px 14px", textAlign: "center" }}>
                            <div style={{ fontSize: 22, fontWeight: 700 }}>{assignedCount}</div>
                            <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>Courses</div>
                          </div>
                          <div style={{ background: "#0D1117", borderRadius: 8, padding: "10px 14px", textAlign: "center" }}>
                            <div style={{ fontSize: 18, fontWeight: 700, color: T.yellow, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                              <Icon.Star style={{ color: T.yellow }} />{mentor.rating}
                            </div>
                            <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>Rating</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* ════════ COURSE MODALS ════════ */}
      {courseModal?.type === "add" && (
        <Modal onClose={() => setCourseModal(null)}>
          <CourseForm mentors={mentors} onSave={handleSaveCourse} onClose={() => setCourseModal(null)} loading={createCourse.isPending} />
        </Modal>
      )}
      {courseModal?.type === "edit" && (
        <Modal onClose={() => setCourseModal(null)}>
          <CourseForm initial={courseModal.course} mentors={mentors} onSave={handleSaveCourse} onClose={() => setCourseModal(null)} loading={updateCourse.isPending} />
        </Modal>
      )}
      {courseModal?.type === "delete" && (
        <DeleteModal name={courseModal.course.title} onConfirm={handleDeleteCourse} onClose={() => setCourseModal(null)} loading={deleteCourse.isPending} />
      )}

      {/* ════════ MENTOR MODALS ════════ */}
      {mentorModal?.type === "add" && (
        <Modal onClose={() => setMentorModal(null)}>
          <MentorForm onSave={handleSaveMentor} onClose={() => setMentorModal(null)} loading={createMentor.isPending} />
        </Modal>
      )}
      {mentorModal?.type === "edit" && (
        <Modal onClose={() => setMentorModal(null)}>
          <MentorForm initial={mentorModal.mentor} onSave={handleSaveMentor} onClose={() => setMentorModal(null)} loading={updateMentor.isPending} />
        </Modal>
      )}
      {mentorModal?.type === "delete" && (
        <DeleteModal
          name={mentorModal.mentor.name}
          warning={
            courses.some(c => c.mentorId === mentorModal.mentor.id)
              ? "This mentor has assigned courses. They will be unassigned if you proceed."
              : undefined
          }
          onConfirm={handleDeleteMentor}
          onClose={() => setMentorModal(null)}
          loading={deleteMentor.isPending}
        />
      )}
    </>
  );
}
