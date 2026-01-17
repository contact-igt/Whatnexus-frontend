"use client";

import React, { useState, useEffect } from 'react';
import { Zap, Menu, LogIn } from 'lucide-react';
import Link from 'next/link';
import { Button } from './shared-components';

export const HeaderSection = ({ onDemoClick }: { onDemoClick: () => void }) => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-md py-3 border-b border-white/5' : 'bg-transparent py-5'}`}>
            <div className="container mx-auto px-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center rotate-12 shadow-xl">
                        <Zap size={20} className="text-emerald-600 fill-emerald-600" />
                    </div> */}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                            <span className="font-black text-2xl tracking-tighter">WhatsNexus<span className="text-emerald-500">.</span></span>
                            <span className="text-[9px] mb-1 font-black bg-white/10 px-2 py-0.5 rounded-full uppercase text-emerald-400 border border-white/5">Beta</span>
                        </div>
                        <span className="text-[8.9px] text-white/30 font-bold tracking-widest uppercase">Powered by Invictus Global Tech</span>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-8">
                    <nav className="flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-white/40">
                        <a href="#matrix" className="hover:text-emerald-400 transition-colors">Matrix</a>
                        <a href="#ui" className="hover:text-emerald-400 transition-colors">UI Preview</a>
                        <a href="#healthcare" className="hover:text-emerald-400 transition-colors">Healthcare</a>
                    </nav>
                    <Link href="/login">
                        <Button variant="secondary" className="py-2 text-[11px] uppercase tracking-widest">
                            <LogIn size={16} /> Login
                        </Button>
                    </Link>
                    <Button onClick={onDemoClick} className="py-2 text-[11px] uppercase tracking-widest">Request Demo</Button>
                </div>
                <button className="md:hidden text-white/50"><Menu /></button>
            </div>
        </header>
    );
};
