"use client";

import React from 'react';
import { CheckCircle2, Zap } from 'lucide-react';
import { SectionHeader } from './shared-components';

export const ApiComparisonSection = () => {
    return (
        <section className="py-32 px-6">
            <div className="container mx-auto max-w-6xl">
                <SectionHeader title="WhatsApp API. Re-engineered." subtitle="Standard vs Neural" centered />
                <div className="grid md:grid-cols-2 gap-0 rounded-[40px] overflow-hidden border border-white/10 shadow-2xl">
                    <div className="p-12 bg-white/[0.02]">
                        <h4 className="text-xs font-black uppercase tracking-[0.4em] text-white/30 mb-8">Standard WhatsApp API</h4>
                        <ul className="space-y-4">
                            {["Official Messaging (Session + Templates)", "Media Support (Images/Docs)", "Delivery/Read Status Webhooks", "Broadcast Messaging Support", "Multi-Agent Shared Inbox", "Basic Tagging & Routing"].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-white/40 text-sm">
                                    <CheckCircle2 size={16} className="text-white/20" /> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="p-12 bg-emerald-500/10 border-l border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12"><Zap size={200} /></div>
                        <h4 className="text-xs font-black uppercase tracking-[0.4em] text-emerald-500 mb-8">WhatsNexus Intelligence Layer</h4>
                        <ul className="space-y-4">
                            {["AI Automatic Replies (Brand-Consistent)", "Lead Scoring + Heat States", "Conversation Summary for Takeover", "Automated Persistence Engine", "Escalation Protocols (Priority/Risk)", "Logic Simulation & Persona Control"].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-white text-sm font-bold">
                                    <Zap size={16} className="text-emerald-400 fill-emerald-400" /> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};
