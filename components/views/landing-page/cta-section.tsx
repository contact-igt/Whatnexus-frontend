"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { GlassCard, Button } from './shared-components';

export const CtaSection = ({ onDemoClick }: { onDemoClick: () => void }) => {
    return (
        <section className="py-48 px-6 relative">
            <div className="container mx-auto max-w-5xl text-center relative z-10">
                <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <GlassCard className="p-16 md:p-32 border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent">
                        <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.85]">
                            Ready to activate <br /> <span className="text-emerald-500">WhatsNexus?</span>
                        </h2>
                        <p className="text-white/40 text-xl mb-12 max-w-2xl mx-auto">
                            Deploy an AI receptionist layer that responds instantly, summarizes clearly, and follows up automatically.
                        </p>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                            <Button onClick={onDemoClick} className="w-full md:w-auto px-16 py-6 text-xl">Request Demo</Button>
                            <Button variant="secondary" className="w-full md:w-auto px-16 py-6 text-xl">
                                <MessageSquare className="text-emerald-500" /> WhatsApp Sales
                            </Button>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </section>
    );
};
