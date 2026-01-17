"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, Send, CheckCircle2 } from 'lucide-react';
import { GlassCard, Button } from './shared-components';
import { Select } from '@/components/ui/select';

export const DemoModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [industry, setIndustry] = useState("");

    const industryOptions = [
        { value: "healthcare", label: "Healthcare / Hospitals" },
        { value: "realestate", label: "Real Estate" },
        { value: "saas", label: "SaaS / Tech" },
        { value: "ecommerce", label: "E-commerce" },
        { value: "other", label: "Other" }
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitted(true);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl"
                    >
                        <GlassCard className="p-8 md:p-12 border-emerald-500/20">
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                            {!isSubmitted ? (
                                <div className="space-y-6">
                                    <div>
                                        <div className="inline-flex items-center gap-2 text-emerald-500 mb-2">
                                            <Zap size={20} className="fill-emerald-500" />
                                            <span className="font-bold tracking-widest text-[10px] uppercase">Neural Briefing</span>
                                        </div>
                                        <h2 className="text-3xl font-black text-white tracking-tighter">Request Demo</h2>
                                        <p className="text-white/40 text-sm mt-2">Deploy an AI receptionist layer that responds instantly.</p>
                                    </div>
                                    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2 col-span-2 md:col-span-1">
                                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Name</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="John Doe"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2 col-span-2 md:col-span-1">
                                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Organization</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="Acme Corp"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2 col-span-2 md:col-span-1">
                                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Work Email</label>
                                            <input
                                                required
                                                type="email"
                                                placeholder="john@company.com"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2 col-span-2 md:col-span-1">
                                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Phone / WhatsApp</label>
                                            <input
                                                required
                                                type="tel"
                                                placeholder="+1 (555) 000-0000"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Industry</label>
                                            <Select
                                                isDarkMode={true}
                                                options={industryOptions}
                                                value={industry}
                                                onChange={setIndustry}
                                                placeholder="Select Industry"
                                            />
                                        </div>
                                        <Button type="submit" className="col-span-2 w-full py-4 text-lg mt-4">
                                            Request Neural Sync <Send size={18} />
                                        </Button>
                                    </form>
                                </div>
                            ) : (
                                <div className="py-12 text-center space-y-6">
                                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <h2 className="text-3xl font-black text-white">Neural Sync Scheduled.</h2>
                                    <p className="text-white/40 max-w-xs mx-auto">A strategist will reach out within 4 processing cycles.</p>
                                    <Button onClick={onClose} variant="secondary" className="mx-auto">Close Hub</Button>
                                </div>
                            )}
                        </GlassCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
