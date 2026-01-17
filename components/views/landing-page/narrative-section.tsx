"use client";

import React from 'react';

export const NarrativeSection = () => {
    return (
        <section className="py-24 bg-[#0D0D0F] border-y border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-[#10B981] font-bold tracking-[0.4em] uppercase text-[10px] mb-6">Neural Promise</p>
                    <h3 className="text-3xl md:text-5xl font-black text-white leading-tight mb-8">
                        Picture a world where your receptionist never sleeps—where every enquiry is met with an instant response.
                    </h3>
                    <p className="text-white/40 text-xl leading-relaxed mb-12">
                        WhatsNexus trades screen time for face time—so your team focuses on patients, while the <span className="text-white">Neural Layer</span> handles the digital flood.
                    </p>
                    <div className="text-2xl font-black text-emerald-500 tracking-tight">No conversation lost. No lead left waiting.</div>
                </div>
            </div>
        </section>
    );
};
