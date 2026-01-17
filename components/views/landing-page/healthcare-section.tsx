"use client";

import React from 'react';
import { CheckCircle2, Shield } from 'lucide-react';
import { GlassCard, SectionHeader } from './shared-components';

export const HealthcareSection = () => {
    const benefits = [
        { t: "Instant Handling", d: "Patient enquiries handled instantly, reducing front-desk pressure." },
        { t: "Appointment Intent", d: "Routed to correct departments based on captured diagnostic intent." },
        { t: "Care Reminders", d: "Automated pre & post-op medication reminders via WhatsApp." },
        { t: "Risk Flagging", d: "Neural layer detects sentiment risks for immediate human attention." }
    ];

    return (
        <section id="healthcare" className="py-32 px-6 bg-emerald-500/[0.02]">
            <div className="container mx-auto max-w-6xl">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <SectionHeader title="Built for hospitals." subtitle="Healthcare Mode" />
                        <ul className="space-y-6">
                            {benefits.map((item, i) => (
                                <li key={i} className="flex gap-4">
                                    <div className="mt-1 flex-shrink-0 text-emerald-500"><CheckCircle2 size={20} /></div>
                                    <div>
                                        <div className="font-bold text-white text-lg">{item.t}</div>
                                        <div className="text-white/40 text-sm">{item.d}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-10 flex gap-4">
                            <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold text-white/40">GDPR Compliance: In Progress</div>
                            <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold text-white/40">HIPAA: In Progress</div>
                        </div>
                    </div>
                    <GlassCard className="p-12 border-emerald-500/30 bg-emerald-500/5 aspect-square flex items-center justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-500 blur-[80px] opacity-20 animate-pulse" />
                            <Shield size={120} className="text-emerald-500 relative z-10" />
                        </div>
                    </GlassCard>
                </div>
            </div>
        </section>
    );
};
