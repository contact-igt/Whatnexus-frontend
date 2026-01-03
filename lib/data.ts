
import {
    TrendingUp,
    ShieldAlert,
    Target,
    Lock,
    UserCheck,
    AlertCircle,
    Brain,
    Smartphone,
    ShieldCheck,
    Sliders,
    Zap,
    Activity,
    LayoutDashboard,
    Users,
    MessageSquare,
    Users2,
    Calendar,
    Radio,
    Database
} from 'lucide-react';

export const BRAND_NAME = "WhatsNexus";
export const BRAND_SUB = "AI RECEPTIONIST HUB";

export const AGENTS = [
    { id: 1, name: 'John Doe', role: 'Super Admin', status: 'Online', avatar: 'JD' },
    { id: 2, name: 'Alice Smith', role: 'Agent', status: 'Busy', avatar: 'AS' },
    { id: 3, name: 'Bob Wilson', role: 'Agent', status: 'Offline', avatar: 'BW' },
    { id: 4, name: 'Sarah Lee', role: 'Viewer', status: 'Online', avatar: 'SL' },
];

export const CONTACTS_MOCK = [
    { id: 1, name: 'Rahul Khanna', lastMsg: 'I need the API pricing.', time: '10:45 AM', sentiment: 'positive', active: true, assignedTo: 1 },
    { id: 2, name: 'Sarah Jenkins', lastMsg: 'When is the next webinar?', time: '10:12 AM', sentiment: 'neutral', active: true, assignedTo: 2 },
    { id: 3, name: 'Mike Ross', lastMsg: 'Neural sync complete.', time: 'Yesterday', sentiment: 'positive', active: false, assignedTo: null },
    { id: 4, name: 'Priya Sharma', lastMsg: 'System latency detected.', time: 'Monday', sentiment: 'negative', active: false, assignedTo: 1 },
];

export const KPI_DATA = [
    { label: 'Total Leads', value: '1,284', trend: '+12%', color: 'emerald', percent: 85 },
    { label: 'Dormant Leads', value: '412', trend: '+2%', color: 'orange', percent: 40 },
    { label: 'Avg AI Reply', value: '0.8s', trend: '-0.2s', color: 'purple', percent: 98 },
    { label: 'Human Takeover', value: '4m 12s', trend: '-18s', color: 'blue', percent: 75 },
];

export const LEADS = [
    { id: 'LD-441', name: 'Rahul Khanna', source: 'Meta Ads', status: 'Hot', score: 92, language: 'English', lastMsg: '2 mins ago', agent: 'AI' },
    { id: 'LD-442', name: 'Sarah Jenkins', source: 'Website', status: 'Warm', score: 74, language: 'English', lastMsg: '1 hour ago', agent: 'AI' },
    { id: 'LD-443', name: 'Mike Ross', source: 'Google Ads', status: 'Cold', score: 32, language: 'Spanish', lastMsg: 'Yesterday', agent: 'John' },
    { id: 'LD-444', name: 'Anita Desai', source: 'Referral', status: 'Hot', score: 88, language: 'Hindi', lastMsg: 'Just now', agent: 'AI' },
];

export const MESSAGES_MOCK = [
    { id: 1, sender: 'Rahul Khanna', text: 'Hi, I saw your ad on Meta. Interested in the Enterprise plan.', time: '10:30 AM', type: 'incoming' },
    { id: 2, sender: 'AI Assistant', text: 'Hello Rahul! I can certainly help with that. Our Enterprise plan includes unlimited neural nodes, multi-agent support, and 24/7 automated receptionist capabilities.', time: '10:32 AM', type: 'ai' },
    { id: 3, sender: 'Rahul Khanna', text: 'I need the API pricing for the receptionist module specifically.', time: '10:45 AM', type: 'incoming' },
];

export const KNOWLEDGE_SOURCES = [
    { id: 1, name: 'Pricing_Details_2024.pdf', type: 'Pricing', version: 'v2.4', size: '1.2 MB', active: true, validity: 'Dec 2024', tokens: '4k', content: "Enterprise: $499/mo. Pro: $199/mo. Basic: $49/mo. Receptionist module adds $20/line." },
    { id: 2, name: 'Support_FAQ_Base', type: 'FAQs', version: 'v8.1', size: '4.8 MB', active: true, validity: 'Permanent', tokens: '42k', content: "WhatsNexus supports WhatsApp, Telegram, and Meta Messenger. Setup time is typically < 10 minutes." },
    { id: 3, name: 'Product_Roadmap_Q3.docx', type: 'Product', version: 'v1.0', size: '2.5 MB', active: false, validity: 'Sep 2024', tokens: '12k', content: "Q3 focuses on voice-integration and CRM deeper hooks with Salesforce and HubSpot." },
];

export const BROADCAST_CAMPAIGNS = [
    { id: 'BC-101', name: 'Flash Sale: Q1 2024', sent: 12400, delivered: '98.2%', read: '65.4%', replied: '12.1%', status: 'Completed', date: 'Jan 12, 2024' },
    { id: 'BC-102', name: 'Webinar RSVP: AI Nodes', sent: 5200, delivered: '99.1%', read: '82.0%', replied: '24.5%', status: 'Processing', date: 'Today' },
    { id: 'BC-103', name: 'Lead Retargeting: Meta', sent: 2100, delivered: '94.0%', read: '45.2%', replied: '4.8%', status: 'Scheduled', date: 'Tomorrow' },
];

export const NEURAL_RULES = [
    { id: 1, name: 'Aggressive Retargeting', description: 'Triggered when lead score > 80 and no reply for 4h', active: true, icon: TrendingUp },
    { id: 2, name: 'Sentiment Override', description: 'Escalate to human if sentiment < 0.2', active: true, icon: ShieldAlert },
    { id: 3, name: 'Lead Qualification Protocol', description: 'Ask 3 specific vetting questions before pricing', active: true, icon: Target },
    { id: 4, name: 'Compliance Guard', description: 'Reject any message containing PII or card info', active: false, icon: Lock },
];

export const SYSTEM_LOGS = [
    { id: 1, type: 'Security', event: 'New Agent JD authorized', time: '2h ago', level: 'Success' },
    { id: 2, type: 'Neural', event: 'Latency spike in Token Gen (1.2s)', time: '4h ago', level: 'Warning' },
    { id: 3, type: 'Network', event: 'WhatsApp Webhook re-synced', time: '6h ago', level: 'Success' },
    { id: 4, type: 'Alert', event: 'Potential PII detected in chat #LD-443', time: '12h ago', level: 'Critical' },
];

export const FOLLOW_UPS_MOCK = [
    { id: 1, leadName: 'Sarah Jenkins', time: '2:30 PM', status: 'Due Today', type: 'WhatsApp', score: 74 },
    { id: 2, leadName: 'Mike Ross', time: '4:45 PM', status: 'Upcoming', type: 'Email', score: 32 },
    { id: 3, leadName: 'Priya Sharma', time: 'Yesterday', status: 'Overdue', type: 'WhatsApp', score: 55 },
    { id: 4, leadName: 'Anita Desai', time: 'Monday', status: 'Upcoming', type: 'Call', score: 88 },
];

export const ALERTS_MOCK = [
    { icon: UserCheck, text: "Hot lead waiting: Rahul Khanna", time: "2m", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { icon: AlertCircle, text: "Escalated chat: #LD-442", time: "14m", color: "text-rose-500", bg: "bg-rose-500/10" },
    { icon: Brain, text: "New Knowledge shard learned", time: "1h", color: "text-blue-500", bg: "bg-blue-500/10" },
    { icon: Smartphone, text: "WhatsApp Link Stabilized", time: "3h", color: "text-purple-500", bg: "bg-purple-500/10" },
];

export const NAV_ITEMS = [
    { icon: LayoutDashboard, label: "Neural Hub", id: "dashboard", urgent: false },
    { icon: Users, label: "Lead Pool", id: "leads", urgent: false },
    { icon: MessageSquare, label: "Shared Inbox", id: "chats", urgent: true },
    { icon: Users2, label: "Agent Matrix", id: "team", urgent: false },
    { icon: Calendar, label: "Follow-ups", id: "followups", urgent: false },
    { icon: Radio, label: "Broadcasts", id: "broadcast", urgent: false },
    { icon: Database, label: "Knowledge", id: "knowledge", urgent: false },
    { icon: Brain, label: "AI Logic", id: "logic", urgent: false },
    { icon: Smartphone, label: "Governance", id: "system", urgent: false },
];
