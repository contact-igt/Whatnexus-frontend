"use client";

import React, { useState } from 'react';
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, Send, CheckCircle2 } from 'lucide-react';
import { GlassCard, Button } from './shared-components';
import { Select } from '@/components/ui/select';

const requestDemoSchema = z.object({
    name: z.string().min(1, "Name is required"),
    organization: z.string().min(1, "Organization is required"),
    email: z
        .string()
        .min(1, "Email is required")
        .refine(
            (value) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(value);
            },
            {
                message: "Please enter a valid email",
            }
        ),
    mobile: z.string().min(1, "mobile is required"),
    industry: z.string().min(1, "Industry is required"),
});

type RequestDemoFormData = z.infer<typeof requestDemoSchema>;

export const DemoModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isDemoRequesting, setIsDemoRequesting] = useState(false);
    const {
        control,
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RequestDemoFormData>({
        resolver: zodResolver(requestDemoSchema),
        defaultValues: {
            name: "",
            organization: "",
            email: "",
            mobile: "",
            industry: "",
        },
    });
    const industryOptions = [
        { value: "healthcare", label: "Healthcare / Hospitals" },
        { value: "realestate", label: "Real Estate" },
        { value: "saas", label: "SaaS / Tech" },
        { value: "ecommerce", label: "E-commerce" },
        { value: "other", label: "Other" }
    ];

    const onSubmit = async (data: RequestDemoFormData) => {
        try {
            setIsDemoRequesting(true);
            const ipResponse = await fetch("https://api.ipify.org?format=json");
            const ipData = await ipResponse.json();

            const formData = {
                name: data?.name,
                organization: data?.organization,
                email: data?.email,
                mobile: data?.mobile,
                industry: data?.industry,
                ip_address: ipData?.ip,
                utm_source: localStorage.getItem("utm_source") || ""
            }
            const params = new URLSearchParams();
            (Object.keys(formData) as Array<keyof typeof formData>).forEach((key) => {
                const value = formData[key];
                params.append(key, value !== null ? String(value) : '');
            })
            setIsDemoRequesting(false);
            await handleGoogleSheetForm(params);
        } catch (error) {
            console.log(error);
            setIsDemoRequesting(false);
        }
        setIsSubmitted(true);
    };

    const handleGoogleSheetForm = async (formData: URLSearchParams) => {
        try {
            const res = await fetch("https://script.google.com/macros/s/AKfycbxTIuIQRP01F0cJQ2fXGGixghd4EAfPNSrGf_do98dFsvpmjNYuFkbCmum67EEdeA10/exec", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: formData.toString() })
            const data = await res.json();
            console.log(data);
        } catch (error) {
            console.log(error);
        }
    }
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
                                    <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2 col-span-2 md:col-span-1">
                                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Name</label>
                                            <input
                                                {...register("name")}
                                                type="text"
                                                placeholder="John Doe"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                                            />
                                            {errors.name && <p className="text-red-400 text-xs mt-1 ml-1 font-medium">{errors.name.message}</p>}
                                        </div>
                                        <div className="space-y-2 col-span-2 md:col-span-1">
                                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Organization</label>
                                            <input
                                                {...register("organization")}
                                                type="text"
                                                placeholder="Acme Corp"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                                            />
                                            {errors.organization && <p className="text-red-400 text-xs mt-1 ml-1 font-medium">{errors.organization.message}</p>}
                                        </div>
                                        <div className="space-y-2 col-span-2 md:col-span-1">
                                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Work Email</label>
                                            <input
                                                {...register("email")}
                                                type="text"
                                                placeholder="john@company.com"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                                            />
                                            {errors.email && <p className="text-red-400 text-xs mt-1 ml-1 font-medium">{errors.email.message}</p>}
                                        </div>
                                        <div className="space-y-2 col-span-2 md:col-span-1">
                                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Phone / WhatsApp</label>
                                            <input
                                                {...register("mobile")}
                                                type="tel"
                                                placeholder="+1 (555) 000-0000"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                                            />
                                            {errors.mobile && <p className="text-red-400 text-xs mt-1 ml-1 font-medium">{errors.mobile.message}</p>}
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Industry</label>
                                            <Controller
                                                name="industry"
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        {...field}
                                                        isDarkMode={true}
                                                        options={industryOptions}
                                                        placeholder="Select Industry"
                                                    />
                                                )}
                                            />
                                            {errors.industry && <p className="text-red-400 text-xs mt-1 ml-1 font-medium">{errors.industry.message}</p>}
                                        </div>
                                            <Button disabled={isDemoRequesting} type="submit" className="col-span-2 w-full py-4 text-lg mt-4">
                                                {isDemoRequesting ? (
                                                    "Requesting..."
                                                ) : (
                                                    <span className='flex items-center justify-center gap-2'>
                                                        Request Demo
                                                        <Send size={18} />
                                                    </span>
                                                )}
                                            </Button>
                                    </form>
                                </div>
                            ) : (
                                <div className="py-12 text-center space-y-6">
                                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <h2 className="text-3xl font-black text-white">Demo Scheduled.</h2>
                                    <p className="text-white/40 max-w-xs mx-auto">Our team will reach out within 4 processing cycles.</p>
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
