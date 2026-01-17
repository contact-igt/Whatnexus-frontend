"use client";

import React from 'react';
import { Users, ShieldCheck, Link } from 'lucide-react';
import { SectionHeader } from './shared-components';

const Sliders = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="21" x2="4" y2="14" />
        <line x1="4" y1="10" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="16" />
        <line x1="20" y1="12" x2="20" y2="3" />
        <line x1="2" y1="14" x2="6" y2="14" />
        <line x1="10" y1="8" x2="14" y2="8" />
        <line x1="18" y1="16" x2="22" y2="16" />
    </svg>
);

export const GovernanceSection = () => {
    const governance = [
        { t: "Agent Matrix", d: "Live load balancing", icon: <Users /> },
        { t: "Permission Matrix", d: "Override AI logic", icon: <Sliders size={24} /> },
        { t: "Neural Auditor", d: "Accountability logs", icon: <ShieldCheck /> },
        { t: "API Bridge", d: "CRM deeper hooks", icon: <Link /> }
    ];

    return (
        <section className="py-32 px-6 bg-[#0D0D0F]">
            <div className="container mx-auto">
                <SectionHeader title="Governance & Control" subtitle="Enterprise Trust" centered />
                <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
                    {governance.map((item, i) => (
                        <div key={i} className="text-center p-6 space-y-4">
                            <div className="w-14 h-14 bg-white/5 rounded-2xl mx-auto flex items-center justify-center text-emerald-500 border border-white/10">
                                {item.icon}
                            </div>
                            <div className="font-bold text-white uppercase text-[10px] tracking-widest">{item.t}</div>
                            <div className="text-white/30 text-xs">{item.d}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
