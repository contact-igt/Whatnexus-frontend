"use client";

import React from 'react';
import { Zap } from 'lucide-react';

export const FooterSection = () => {
    return (
        <footer className="py-20 px-6 border-t border-white/5 bg-[#080809]">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                        <Zap size={14} className="text-emerald-500" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-xl tracking-tighter">WhatsNexus<span className="text-emerald-500">.</span></span>
                        <span className="text-[8px] text-white/20 font-bold uppercase tracking-widest">Powered by Invictus Global Tech</span>
                    </div>
                </div>
                <div className="text-white/20 text-[10px] font-bold tracking-widest uppercase text-center md:text-right">
                    © 2024 WhatsNexus. Beta Version. All Rights Reserved.
                </div>
            </div>
        </footer>
    );
};
