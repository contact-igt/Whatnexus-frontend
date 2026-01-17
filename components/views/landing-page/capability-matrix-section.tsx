"use client";

import React from 'react';
import { BarChart3, MessageSquare, Target, Database, Brain, Clock, Megaphone, ShieldCheck } from 'lucide-react';
import { GlassCard, SectionHeader } from './shared-components';

export const CapabilityMatrixSection = () => {
    const capabilityMatrix = [
        { title: "Neural Hub", items: ["Pulse metrics + funnel matrix", "Live escalation feed + health"], icon: <BarChart3 /> },
        { title: "Shared Inbox", items: ["AI receptionist layer", "Chat summaries + smart replies"], icon: <MessageSquare /> },
        { title: "Lead Intelligence", items: ["Neural scoring + heat states", "Origin tracking + strategy"], icon: <Target /> },
        { title: "Knowledge Hub", items: ["Knowledge shard injection", "Sandbox testing + briefs"], icon: <Database /> },
        { title: "Logic & Persona", items: ["Persona control + boundaries", "Escalation protocols"], icon: <Brain /> },
        { title: "Persistence Core", items: ["Engagement timeline", "AI follow-up planner"], icon: <Clock /> },
        { title: "Broadcast Engine", items: ["Campaign matrix tracking", "AI campaign drafter"], icon: <Megaphone /> },
        { title: "Team Governance", items: ["Agent matrix permissions", "Auditor logs + API bridge"], icon: <ShieldCheck /> },
    ];

    return (
        <section id="matrix" className="py-32 px-6 bg-white/[0.01]">
            <div className="container mx-auto">
                <SectionHeader title="Capability Matrix" subtitle="The Neural Roadmap" centered />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {capabilityMatrix.map((cap, i) => (
                        <GlassCard key={i} delay={i * 0.05} className="p-8 hover:bg-white/10 transition-colors group">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-emerald-500">
                                {cap.icon}
                            </div>
                            <h4 className="text-xl font-black mb-4">{cap.title}</h4>
                            <ul className="space-y-2">
                                {cap.items.map((item, j) => (
                                    <li key={j} className="text-sm text-white/40 flex items-start gap-2">
                                        <div className="mt-1.5 w-1 h-1 bg-emerald-500 rounded-full" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </GlassCard>
                    ))}
                </div>
            </div>
        </section>
    );
};
