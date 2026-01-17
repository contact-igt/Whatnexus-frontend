"use client";

import React from 'react';
import { SectionHeader } from './shared-components';

export const DataSection = () => {
    const stats = [
        { label: "Live States", val: "Active" },
        { label: "Response Latency", val: "< 1s" },
        { label: "Queue Load", val: "Optimized" },
        { label: "Sync Freq", val: "Minute-Level" }
    ];

    return (
        <section className="py-32 px-6">
            <div className="container mx-auto">
                <div className="max-w-4xl mx-auto text-center">
                    <SectionHeader title="Real-time visibility." subtitle="Operational Layer" centered />
                    <p className="text-white/40 text-xl leading-relaxed mb-16">
                        WhatsNexus maintains a real-time operational view of your conversations and lead flow—so you know what's happening right now, not after the shift ends.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, i) => (
                            <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/5">
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-2">{stat.label}</div>
                                <div className="text-2xl font-black">{stat.val}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
