"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { GlassCard, Button } from './sharedComponents';

export const CtaSection = ({ onDemoClick }: { onDemoClick: () => void }) => {
    return (
        <section className="py-20 md:py-48 px-6 relative">
            <div className="container mx-auto max-w-5xl text-center relative z-10">
                <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <GlassCard className="p-8 md:p-32 border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent">
                        <h2 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[1] md:leading-[0.85]">
                            Ready to activate <br className="hidden md:block" /> <span className="text-emerald-500">WhatsNexus?</span>
                        </h2>
                        <p className="text-white/40 text-xl mb-12 max-w-2xl mx-auto">
                            Deploy an AI receptionist layer that responds instantly, summarizes clearly, and follows up automatically.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button onClick={onDemoClick} className="w-full sm:w-auto px-10 md:px-16 py-4 md:py-6 text-lg md:text-xl">Request Demo</Button>
                            <Button variant="secondary" className="w-full sm:w-auto px-10 md:px-16 py-4 md:py-6 text-lg md:text-xl">
                                <MessageSquare className="text-emerald-500" /> WhatsApp Sales
                            </Button>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </section>
    );
};
