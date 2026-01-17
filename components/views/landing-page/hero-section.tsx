"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Button } from './shared-components';

export const HeroSection = ({ onDemoClick }: { onDemoClick: () => void }) => {
    return (
        <section className="relative pt-48 pb-32 px-6 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0,transparent_70%)] pointer-events-none" />
            <div className="container mx-auto text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8"
                >
                    <Zap size={14} className="text-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold tracking-[0.2em] text-white/60 uppercase">Neural Receptionist Core</span>
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8"
                >
                    Your AI receptionist <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">that never sleeps.</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="max-w-2xl mx-auto text-white/50 text-lg md:text-xl leading-relaxed mb-10"
                >
                    Instant replies, lead qualification, and automated follow-ups—built on WhatsApp API with Neural Intelligence.
                </motion.p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                    <Button onClick={onDemoClick} className="w-full md:w-auto px-12 py-5 text-lg">Request Demo</Button>
                    <Button onClick={() => document.getElementById('ui')?.scrollIntoView()} variant="secondary" className="w-full md:w-auto px-12 py-5 text-lg">See Live UI</Button>
                </div>
                <div className="mt-12 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
                    Sales + Support focused • 24/7 Response Layer • Human Takeover
                </div>
            </div>
        </section>
    );
};
