"use client";

import React from 'react';
import { motion } from 'framer-motion';

export const GlassCard = ({ children, className = "", delay = 0 }: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: delay }}
        className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-[24px] shadow-2xl ${className}`}
    >
        {children}
    </motion.div>
);

export const Button = ({
    children,
    variant = 'primary',
    className = "",
    disabled=false,
    onClick,
    type = "button"
}: {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost';
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    type?: "button" | "submit";
}) => {
    const base = "px-6 py-3 rounded-[16px] font-bold transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
    const styles = {
        primary: `bg-gradient-to-r from-[#10B981] to-[#0F766E] text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:brightness-110`,
        secondary: `bg-white/10 text-white border border-white/20 hover:bg-white/20`,
        ghost: `text-white/70 hover:text-white`
    };
    return (
        <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${styles[variant]} ${className}`}>
            {children}
        </button>
    );
};

export const SectionHeader = ({
    title,
    subtitle,
    centered = false,
    mobileCenter = false
}: {
    title: string;
    subtitle: string;
    centered?: boolean;
    mobileCenter?: boolean;
}) => (
    <div className={`mb-12 ${centered ? 'text-center' : ''} ${mobileCenter && window.innerWidth < 768 ? 'text-center' : ''}`}>
        <p className="text-[#10B981] font-bold tracking-[0.2em] uppercase text-[10px] mb-3">{subtitle}</p>
        <h2 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tighter">{title}</h2>
    </div>
);
