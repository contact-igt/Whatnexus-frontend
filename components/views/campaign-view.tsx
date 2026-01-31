
"use client";

import { useState } from 'react';
import { Megaphone, Plus, Search, RefreshCw, Users, Calendar, TrendingUp, Send } from 'lucide-react';
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'next/navigation';

type TabType = 'all' | 'broadcast' | 'api' | 'scheduled' | 'qrscan';

interface Campaign {
    id: string;
    name: string;
    type: string;
    createdAt: string;
    status: string;
    audience: number;
    sent?: number;
    delivered?: string;
    read?: string;
    replied?: string;
}

const SAMPLE_CAMPAIGNS: Campaign[] = [
    {
        id: '1',
        name: 'Appointment Reminders - January',
        type: 'Broadcast',
        createdAt: 'Jan 10, 2026',
        status: 'Completed',
        audience: 1250,
        sent: 1250,
        delivered: '98%',
        read: '85%',
        replied: '12%'
    },
    {
        id: '2',
        name: 'Health Checkup Campaign',
        type: 'Broadcast',
        createdAt: 'Jan 8, 2026',
        status: 'Completed',
        audience: 850,
        sent: 850,
        delivered: '97%',
        read: '78%',
        replied: '8%'
    },
    {
        id: '3',
        name: 'Lab Results Notification',
        type: 'API',
        createdAt: 'Jan 7, 2026',
        status: 'Active',
        audience: 320,
        sent: 320,
        delivered: '99%',
        read: '92%',
        replied: '5%'
    },
    {
        id: '4',
        name: 'Prescription Refill Reminder',
        type: 'Scheduled',
        createdAt: 'Jan 15, 2026',
        status: 'Scheduled',
        audience: 450,
    },
];

export const CampaignView = () => {
    const { isDarkMode } = useTheme();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [campaigns, setCampaigns] = useState<Campaign[]>(SAMPLE_CAMPAIGNS);

    const tabs: { id: TabType; label: string }[] = [
        { id: 'all', label: 'All' },
        { id: 'broadcast', label: 'Broadcast' },
        { id: 'api', label: 'API' },
        { id: 'scheduled', label: 'Scheduled' },
        { id: 'qrscan', label: 'QRScan' },
    ];

    const filteredCampaigns = campaigns.filter(campaign => {
        if (activeTab === 'all') return true;
        return campaign.type.toLowerCase() === activeTab;
    });

    return (
        <div className="h-full overflow-y-auto p-10 space-y-8 animate-in slide-in-from-bottom-8 duration-700 max-w-[1600px] mx-auto no-scrollbar pb-32">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-emerald-500">
                        <Megaphone size={16} className="animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Campaign Management</span>
                    </div>
                    <h1 className={cn("text-4xl font-bold tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>
                        Campaigns
                    </h1>
                </div>
                {/* <RoleBasedWrapper allowedRoles={['admin', 'super_admin']}> */}
                <button
                    onClick={() => router.push('/compose-message')}
                    className="h-12 px-6 rounded-xl font-bold text-xs uppercase tracking-wide bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
                >
                    <Plus size={16} />
                    <span>Launch</span>
                </button>
                {/* </RoleBasedWrapper> */}
            </div>

            {/* Quick Guide */}
            {/* <GlassCard isDarkMode={isDarkMode} className="p-6 bg-blue-500/5 border-blue-500/20">
                <div className="space-y-3">
                    <h3 className="font-bold text-sm uppercase tracking-wide">Quick Guide</h3>
                    <p className={cn("text-xs", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                        Tap on any Campaign to see detailed analytics. Launch a campaign now to initiate new conversations with users on WhatsApp.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <a href="#" className="text-blue-500 hover:text-blue-400 flex items-center gap-2">
                            <Send size={12} />
                            Audience segregation for WhatsApp Broadcast
                        </a>
                        <a href="#" className="text-blue-500 hover:text-blue-400 flex items-center gap-2">
                            <TrendingUp size={12} />
                            Upgrade WhatsApp Tier Limit
                        </a>
                    </div>
                </div>
            </GlassCard> */}

            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search size={18} className={cn("absolute left-4 top-1/2 -translate-y-1/2", isDarkMode ? 'text-white/30' : 'text-slate-400')} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by campaign name"
                        className={cn(
                            "w-full pl-12 pr-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all",
                            isDarkMode
                                ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30'
                                : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                        )}
                    />
                </div>
                <button
                    className={cn(
                        "px-6 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 flex items-center gap-2",
                        isDarkMode
                            ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    )}
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            <div className="flex gap-2 border-b border-white/5 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "px-4 py-3 text-sm font-semibold transition-all duration-200 border-b-2 whitespace-nowrap",
                            activeTab === tab.id
                                ? 'border-emerald-500 text-emerald-500'
                                : isDarkMode
                                    ? 'border-transparent text-white/50 hover:text-white/80'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <GlassCard isDarkMode={isDarkMode} className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead>
                            <tr className={cn("text-[10px] font-bold uppercase tracking-wider border-b", isDarkMode ? 'text-white/30 border-white/5' : 'text-slate-400 border-slate-200')}>
                                <th className="px-6 py-4">Campaign</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Created At</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Audience</th>
                                <th className="px-6 py-4 text-center">Delivered</th>
                                <th className="px-6 py-4 text-center">Read</th>
                                <th className="px-6 py-4 text-center">Replied</th>
                            </tr>
                        </thead>
                        <tbody className={cn("divide-y", isDarkMode ? 'divide-white/5' : 'divide-slate-100')}>
                            {filteredCampaigns.length > 0 ? (
                                filteredCampaigns.map((campaign) => (
                                    <tr key={campaign.id} className="group transition-all hover:bg-emerald-500/5">
                                        <td className="px-6 py-5">
                                            <p className={cn("text-sm font-semibold", isDarkMode ? 'text-white' : 'text-slate-800')}>{campaign.name}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={cn("text-xs font-medium", isDarkMode ? 'text-white/60' : 'text-slate-600')}>{campaign.type}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={cn("text-xs", isDarkMode ? 'text-white/40' : 'text-slate-500')}>{campaign.createdAt}</span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={cn(
                                                "text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wide",
                                                campaign.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' :
                                                    campaign.status === 'Active' ? 'bg-blue-500/10 text-blue-500 animate-pulse' :
                                                        'bg-yellow-500/10 text-yellow-500'
                                            )}>
                                                {campaign.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Users size={12} className={cn(isDarkMode ? 'text-white/40' : 'text-slate-400')} />
                                                <span className={cn("text-xs font-semibold", isDarkMode ? 'text-white' : 'text-slate-700')}>
                                                    {campaign.audience.toLocaleString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={cn("text-xs font-semibold", isDarkMode ? 'text-emerald-400' : 'text-emerald-600')}>
                                                {campaign.delivered || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={cn("text-xs font-semibold", isDarkMode ? 'text-blue-400' : 'text-blue-600')}>
                                                {campaign.read || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={cn("text-xs font-semibold", isDarkMode ? 'text-purple-400' : 'text-purple-600')}>
                                                {campaign.replied || '-'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center">
                                        <p className={cn("text-sm", isDarkMode ? 'text-white/40' : 'text-slate-400')}>
                                            No campaigns found
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            <div className="flex items-center justify-between">
                <p className={cn("text-xs", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                    Showing {filteredCampaigns.length} of {campaigns.length} campaigns
                </p>
                <div className="flex gap-2">
                    <button className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                        isDarkMode ? 'bg-white/5 text-white/40 hover:bg-white/10' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    )}>
                        Previous
                    </button>
                    <button className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                        isDarkMode ? 'bg-white/5 text-white/40 hover:bg-white/10' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    )}>
                        Next
                    </button>
                </div>
            </div>
        </div >
    );
};
