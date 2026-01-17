"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { SectionHeader } from './shared-components';

export const FeatureBurstSection = () => {
    const features = [
        "Responds immediately 24/7",
        "Captures intent + details",
        "Filters high-intent leads",
        "Escalates to human when needed",
        "Automated warm follow-ups",
        "Language-agnostic intelligence"
    ];

    return (
        <section className="py-32 px-6">
            <div className="container mx-auto">
                <SectionHeader title="Instant action. Not just replies." subtitle="Immediate Impact" centered />
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {features.map((text, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-4"
                        >
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            <span className="text-lg font-bold text-white/80">{text}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
