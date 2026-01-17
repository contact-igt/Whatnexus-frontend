"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, MessageSquare, FileText, Clock, Users } from 'lucide-react';
import { GlassCard, SectionHeader } from './shared-components';
import Image from 'next/image';

export const UiPreviewSection = () => {
    const [activeUI, setActiveUI] = useState(0);

    const uiSlides = [
        { label: "Neural Hub", sub: "Operational Matrix", image: "/image/neuralhub1.png", icon: <BarChart3 /> },
        { label: "Shared Inbox", sub: "Collaborative Layer", image: "/image/chat.png", icon: <MessageSquare /> },
        { label: "Chat Brief", sub: "AI Summaries", image: "/image/summarize.png", icon: <FileText /> },
        { label: "Follow-up Hub", sub: "Persistence Core", image: "/image/followup.png", icon: <Clock /> },
        { label: "Agent Matrix", sub: "Load Management", image: "/image/agentmatrix.png", icon: <Users /> },
    ];

    return (
        <section id="ui" className="py-32 px-6 bg-[#080809]">
            <div className="container mx-auto">
                <SectionHeader title="One hub. Total visibility." subtitle="Platform Experience" centered />
                <div className="grid lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-4 flex flex-col gap-3">
                        {uiSlides.map((slide, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveUI(i)}
                                className={`p-6 text-left rounded-2xl border transition-all duration-300 group ${activeUI === i
                                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] scale-[1.02]'
                                        : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:border-white/10'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`transition-transform duration-300 ${activeUI === i ? 'text-white scale-110' : 'text-emerald-500 group-hover:scale-110'}`}>
                                        {slide.icon}
                                    </div>
                                    <div>
                                        <div className="font-black text-sm uppercase tracking-widest mb-1">{slide.label}</div>
                                        <div className={`text-[10px] uppercase tracking-widest transition-colors ${activeUI === i ? 'text-white/70' : 'text-white/30'}`}>
                                            {slide.sub}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                    <div className="lg:col-span-8 relative">
                        <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] scale-125" />
                        <GlassCard className="aspect-[16/10] bg-[#0A0A0B]/80 flex flex-col items-center justify-center relative p-0 overflow-hidden border-white/10 backdrop-blur-md">
                            {/* Window Header */}
                            <div className="w-full h-10 border-b border-white/5 bg-white/5 flex items-center px-4 gap-2 absolute top-0 z-10">
                                <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-inner" />
                                <div className="w-3 h-3 rounded-full bg-[#FEBC2E] shadow-inner" />
                                <div className="w-3 h-3 rounded-full bg-[#28C840] shadow-inner" />
                            </div>

                            {/* Content Area */}
                            <div className="w-full h-full pt-10 relative">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeUI}
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                        className="w-full h-full relative"
                                    >
                                        <Image
                                            src={uiSlides[activeUI].image}
                                            fill
                                            className='object-contain p-4'
                                            alt={uiSlides[activeUI].label}
                                            priority
                                        />
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </section>
    );
};
