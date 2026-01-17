"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const UseCasesSection = () => {
    const [useCaseTab, setUseCaseTab] = useState('sales');

    const salesCases = [
        { t: "Qualify Instantly", d: "Don't wait for Monday. Qualify while they are browsing." },
        { t: "Heat States", d: "Prioritize hot leads with neural heat scoring." },
        { t: "Persistence Engine", d: "Automated follow-ups until booked or converted." },
        { t: "Smart Takeover", d: "Humans enter with full context and strategy briefs." }
    ];

    const supportCases = [
        { t: "FAQ Automation", d: "Answer 80% of routine enquiries without human delay." },
        { t: "Issue Context", d: "AI collects logs and context before routing to agents." },
        { t: "Priority Routing", d: "Upset customers or risks are bumped to top of queue." },
        { t: "Reduce Backlog", d: "Clean up queues while your team is offline." }
    ];

    return (
        <section className="py-32 px-6">
            <div className="container mx-auto max-w-4xl">
                <div className="flex justify-center gap-4 mb-16">
                    <button
                        onClick={() => setUseCaseTab('sales')}
                        className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${useCaseTab === 'sales' ? 'bg-emerald-600 text-white shadow-xl' : 'bg-white/5 text-white/40'}`}
                    >
                        Sales Mode
                    </button>
                    <button
                        onClick={() => setUseCaseTab('support')}
                        className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${useCaseTab === 'support' ? 'bg-emerald-600 text-white shadow-xl' : 'bg-white/5 text-white/40'}`}
                    >
                        Support Mode
                    </button>
                </div>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={useCaseTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid md:grid-cols-2 gap-8"
                    >
                        {(useCaseTab === 'sales' ? salesCases : supportCases).map((item, i) => (
                            <div key={i} className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5">
                                <h5 className="font-black text-lg mb-2 text-white">{item.t}</h5>
                                <p className="text-white/40 text-sm leading-relaxed">{item.d}</p>
                            </div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
};
