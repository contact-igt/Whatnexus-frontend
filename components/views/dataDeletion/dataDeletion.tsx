"use client";

import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowLeft, Mail, MapPin, Trash2, ShieldCheck, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FooterSection } from "../landingPage/footerSection";

const LAST_UPDATED = "March 5, 2026";

export default function DataDeletionPage() {
    const { isDarkMode } = useTheme();
    const [showScrollTop, setShowScrollTop] = useState(false);

    const D = isDarkMode;

    useEffect(() => {
        const onScroll = () => setShowScrollTop(window.scrollY > 500);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    /* ── Color shortcuts ─────────────────────── */
    const bg = D ? "bg-slate-950" : "bg-white";
    const body = D ? "text-slate-300" : "text-slate-700";
    const strong = D ? "text-slate-100" : "text-slate-900";
    const muted = D ? "text-slate-500" : "text-slate-500";
    const hr = D ? "border-slate-800" : "border-slate-200";

    return (
        <div className={cn("min-h-screen font-sans transition-colors duration-500", bg)}>

            {/* ── Sticky Header ──────────────────────────────── */}
            <header className={cn(
                "fixed top-0 inset-x-0 z-50 h-20 flex items-center justify-between px-6 sm:px-10",
                "border-b backdrop-blur-xl transition-colors duration-300",
                D ? "bg-slate-950/85 border-slate-800" : "bg-white/90 border-slate-200"
            )}>
                <Link href="/" className="flex items-center gap-3">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                            <span className={cn("font-black text-2xl tracking-tighter", D ? "text-white" : "text-slate-900")}>
                                WhatsNexus<span className="text-emerald-500">.</span>
                            </span>
                            <span className="text-[9px] mb-1 font-black bg-white/10 px-2 py-0.5 rounded-full uppercase text-emerald-400 border border-white/5">
                                Beta
                            </span>
                        </div>
                        <span className={cn("text-[8.9px] font-bold tracking-widest uppercase", D ? "text-white/30" : "text-slate-400")}>
                            Powered by Kingpin Ventures
                        </span>
                    </div>
                </Link>

                <div className="flex items-center gap-4">
                    <Link
                        href="/"
                        className={cn(
                            "group flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-colors",
                            D ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-600 hover:text-emerald-500"
                        )}
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Back to Home
                    </Link>
                </div>
            </header>

            {/* ── Main Document ──────────────────────────────── */}
            <main className="max-w-8xl mx-auto px-6 sm:px-10 pt-36 pb-28">

                {/* Title block */}
                <div className="flex items-start gap-5 mb-4">
                    <div>
                        <h1 className={cn("text-5xl sm:text-6xl font-black tracking-tight leading-none mb-2", strong)}>
                            Data Deletion<br />Instructions
                        </h1>
                        <p className={cn("text-sm", muted)}>Last Updated: {LAST_UPDATED}</p>
                    </div>
                </div>

                <hr className={cn("mb-10 mt-8", hr)} />

                {/* ── Intro ─────────────────────────────────────── */}
                <P cls={body}>
                    <B d={D}>Kingpin Ventures</B> provides <B d={D}>WhatsNexus</B>, an AI-powered messaging automation
                    platform built for managing customer conversations and workflows on the WhatsApp Business Platform.
                    If you would like to request deletion of data associated with your use of WhatsNexus, this page
                    explains how to submit that request and what to expect.
                </P>

                {/* ── Quick summary card ─────────────────────────── */}
                <div className={cn(
                    "my-8 p-5 rounded-2xl border",
                    D ? "bg-emerald-500/8 border-emerald-500/20" : "bg-emerald-50 border-emerald-200"
                )}>
                    <div className="flex items-start gap-3">
                        <ShieldCheck className={cn("w-5 h-5 mt-0.5 shrink-0", D ? "text-emerald-400" : "text-emerald-600")} />
                        <div>
                            <p className={cn("text-sm font-black mb-1", D ? "text-emerald-400" : "text-emerald-700")}>Quick Summary</p>
                            <p className={cn("text-sm leading-relaxed", body)}>
                                Send an email to{" "}
                                <A href="mailto:sushilathithiyaa@gmail.com" d={D}>sushilathithiyaa@gmail.com</A> with
                                the subject <B d={D}>Data Deletion Request</B>. Include your name, organisation, WhatsApp
                                number(s), account email, and the type of deletion you need. After verifying your identity,
                                we will process the deletion in accordance with applicable law.
                            </p>
                        </div>
                    </div>
                </div>

                <hr className={cn("my-10", hr)} />

                {/* ── 1. How to Submit a Deletion Request ─────────── */}
                <section id="how-to-request">
                    <SecHeading d={D}>1. How to Submit a Deletion Request</SecHeading>
                    <P cls={body}>
                        To request deletion of your data, please send an email to:
                    </P>

                    {/* Email highlight box */}
                    <div className={cn(
                        "flex items-center gap-4 p-4 rounded-xl border mb-6",
                        D ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200"
                    )}>
                        <Mail className={cn("w-5 h-5 shrink-0", D ? "text-emerald-400" : "text-emerald-600")} />
                        <div>
                            <p className={cn("text-[10px] font-bold uppercase tracking-widest mb-0.5", muted)}>Email</p>
                            <A href="mailto:sushilathithiyaa@gmail.com" d={D}>sushilathithiyaa@gmail.com</A>
                        </div>
                    </div>

                    <P cls={body}>Please use the following subject line in your email:</P>
                    <div className={cn(
                        "px-4 py-3 rounded-xl border mb-6 font-mono text-sm",
                        D ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-800"
                    )}>
                        Subject: Data Deletion Request
                    </div>
                </section>

                <hr className={cn("my-10", hr)} />

                {/* ── 2. Information to Include ────────────────────── */}
                <section id="information-to-include">
                    <SecHeading d={D}>2. Information to Include in Your Request</SecHeading>
                    <P cls={body}>
                        To help us identify and process your request efficiently, please include the following details
                        in your email:
                    </P>
                    <ul className={cn("mt-2 mb-5 space-y-2 text-sm leading-relaxed", body)}>
                        <Bullet><B d={D}>Full Name</B> — your first and last name</Bullet>
                        <Bullet><B d={D}>Organisation Name</B> — the name of your organisation or business (if applicable)</Bullet>
                        <Bullet><B d={D}>WhatsApp Number(s)</B> — the WhatsApp number(s) associated with the request</Bullet>
                        <Bullet><B d={D}>Account Email</B> — the email address registered with your WhatsNexus account</Bullet>
                        <Bullet>
                            <B d={D}>Type of Deletion Requested</B> — please specify one of the following:
                            <ul className="mt-2 space-y-1 ml-4">
                                <li className="flex items-start gap-2">
                                    <span className="mt-[6px] block w-1 h-1 rounded-full bg-current shrink-0 opacity-40" />
                                    <span>Account deletion</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-[6px] block w-1 h-1 rounded-full bg-current shrink-0 opacity-40" />
                                    <span>Contact data deletion</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-[6px] block w-1 h-1 rounded-full bg-current shrink-0 opacity-40" />
                                    <span>Conversation data deletion</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-[6px] block w-1 h-1 rounded-full bg-current shrink-0 opacity-40" />
                                    <span>Complete data deletion (all data associated with your account)</span>
                                </li>
                            </ul>
                        </Bullet>
                    </ul>
                </section>

                <hr className={cn("my-10", hr)} />

                {/* ── 3. Verification Process ──────────────────────── */}
                <section id="verification">
                    <SecHeading d={D}>3. Verification Process</SecHeading>
                    <P cls={body}>
                        To protect the data of users and customers, we may need to verify your identity or confirm
                        that you are authorised to make the deletion request before we process it. This may include:
                    </P>
                    <ul className={cn("mt-2 mb-5 space-y-2 text-sm leading-relaxed", body)}>
                        <Bullet>Verifying your identity using the information provided in your request</Bullet>
                        <Bullet>Confirming ownership of the account email or WhatsApp number(s) specified</Bullet>
                        <Bullet>Requesting additional information if needed to confirm your authorisation</Bullet>
                    </ul>
                    <P cls={body}>
                        We will communicate with you via the contact information provided in your request during
                        the verification process.
                    </P>
                </section>

                <hr className={cn("my-10", hr)} />

                {/* ── 4. What Happens After Your Request ───────────── */}
                <section id="what-happens-after">
                    <SecHeading d={D}>4. What Happens After Your Request</SecHeading>
                    <P cls={body}>
                        Once your request has been received and verified, we will review and process the deletion
                        or anonymisation of the requested data in accordance with:
                    </P>
                    <ul className={cn("mt-2 mb-6 space-y-2 text-sm leading-relaxed", body)}>
                        <Bullet>Applicable data protection and privacy laws</Bullet>
                        <Bullet>Contractual obligations we may have with you or your organisation</Bullet>
                        <Bullet>Legitimate operational or security requirements</Bullet>
                    </ul>

                    {/* Retention exceptions */}
                    <div className={cn(
                        "p-5 rounded-2xl border mb-5",
                        D ? "bg-amber-500/8 border-amber-500/20" : "bg-amber-50 border-amber-200"
                    )}>
                        <div className="flex items-start gap-3">
                            <AlertCircle className={cn("w-5 h-5 mt-0.5 shrink-0", D ? "text-amber-400" : "text-amber-600")} />
                            <div>
                                <p className={cn("text-sm font-black mb-2", D ? "text-amber-400" : "text-amber-700")}>
                                    Please note — some data may be retained
                                </p>
                                <p className={cn("text-sm leading-relaxed mb-3", body)}>
                                    In some cases, certain information may be retained where required for legitimate
                                    purposes, including:
                                </p>
                                <ul className={cn("space-y-1.5 text-sm leading-relaxed", body)}>
                                    <li className="flex items-start gap-2">
                                        <span className="mt-[7px] block w-1.5 h-1.5 rounded-full bg-current shrink-0 opacity-50" />
                                        <span>Legal compliance and regulatory obligations</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="mt-[7px] block w-1.5 h-1.5 rounded-full bg-current shrink-0 opacity-50" />
                                        <span>Security and fraud prevention</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="mt-[7px] block w-1.5 h-1.5 rounded-full bg-current shrink-0 opacity-50" />
                                        <span>Audit and operational recordkeeping</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="mt-[7px] block w-1.5 h-1.5 rounded-full bg-current shrink-0 opacity-50" />
                                        <span>Enforcement of contractual obligations</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <hr className={cn("my-10", hr)} />

                {/* ── 5. Processing Timeline ───────────────────────── */}
                <section id="processing-timeline">
                    <SecHeading d={D}>5. Processing Timeline</SecHeading>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        {[
                            { icon: <Mail className="w-5 h-5" />, step: "Step 1", title: "Submit Request", desc: "Send your email to sushilathithiyaa@gmail.com with all required details.", hex: "#10b981" },
                            { icon: <ShieldCheck className="w-5 h-5" />, step: "Step 2", title: "Verification", desc: "We verify your identity and confirm your authorisation to make the request.", hex: "#6366f1" },
                            { icon: <CheckCircle2 className="w-5 h-5" />, step: "Step 3", title: "Deletion Processed", desc: "We process your deletion request within a commercially reasonable timeframe.", hex: "#3b82f6" },
                        ].map((card, i) => (
                            <div key={i} className={cn(
                                "p-4 rounded-2xl border flex flex-col gap-3",
                                D ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"
                            )}>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                        style={{ background: `${card.hex}20`, color: card.hex }}>
                                        {card.icon}
                                    </div>
                                    <span className={cn("text-[9px] font-black uppercase tracking-widest", muted)}>{card.step}</span>
                                </div>
                                <div>
                                    <p className={cn("text-sm font-black mb-1", strong)}>{card.title}</p>
                                    <p className={cn("text-xs leading-relaxed", body)}>{card.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <P cls={body}>
                        We will make reasonable efforts to process verified deletion requests within a commercially
                        reasonable timeframe. The exact duration may vary depending on the complexity of the request
                        and the type of data involved.
                    </P>
                </section>

                <hr className={cn("my-10", hr)} />

                {/* ── 6. Additional Rights ─────────────────────────── */}
                <section id="additional-rights">
                    <SecHeading d={D}>6. Additional Privacy Rights</SecHeading>
                    <P cls={body}>
                        Depending on your location and applicable law, you may also have additional rights with
                        respect to your personal data, including the right to access, correct, or restrict processing
                        of your data. To exercise any of these rights, please contact us using the information below.
                    </P>
                    <P cls={body}>
                        For full details on how we collect, use, and protect your data, please refer to our{" "}
                        <A href="/privacyPolicy" d={D}>Privacy Policy</A>.
                    </P>
                </section>

                <hr className={cn("my-10", hr)} />

                {/* ── 7. Contact Information ───────────────────────── */}
                <section id="contact">
                    <SecHeading d={D}>7. Contact Information</SecHeading>
                    <P cls={body}>
                        For any privacy-related questions, data deletion requests, or additional inquiries, contact:
                    </P>

                    <div className={cn(
                        "p-5 rounded-2xl border space-y-4",
                        D ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"
                    )}>
                        <div>
                            <p className={cn("text-base font-black mb-1", strong)}>Kingpin Ventures</p>
                            <p className={cn("text-[10px] font-bold uppercase tracking-widest", muted)}>
                                Data Controller / Platform Provider
                            </p>
                        </div>
                        <div className={cn("border-t pt-4 space-y-3", D ? "border-slate-800" : "border-slate-200")}>
                            <div className="flex items-center gap-3">
                                <Mail className={cn("w-4 h-4 shrink-0", D ? "text-emerald-400" : "text-emerald-600")} />
                                <div>
                                    <p className={cn("text-[9px] font-bold uppercase tracking-widest mb-0.5", muted)}>Email</p>
                                    <A href="mailto:sushilathithiyaa@gmail.com" d={D}>sushilathithiyaa@gmail.com</A>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className={cn("w-4 h-4 shrink-0 mt-0.5", D ? "text-emerald-400" : "text-emerald-600")} />
                                <div>
                                    <p className={cn("text-[9px] font-bold uppercase tracking-widest mb-0.5", muted)}>Address</p>
                                    <p className={cn("text-sm", body)}>
                                        LIG 13/19, NH3<br />
                                        Vanjinathan Street<br />
                                        Maraimalai Nagar<br />
                                        Chennai – 603209<br />
                                        India
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Related pages ────────────────────────────────── */}
                <div className={cn("mt-12 p-5 rounded-2xl border", D ? "border-slate-800" : "border-slate-200")}>
                    <p className={cn("text-[10px] font-black uppercase tracking-widest mb-4", muted)}>Related Policies</p>
                    <div className="flex flex-wrap gap-3">
                        <A href="/privacyPolicy" d={D}>Privacy Policy</A>
                        <span className={muted}>·</span>
                        <A href="/termsAndConditions" d={D}>Terms and Conditions</A>
                    </div>
                </div>

            </main>

            <FooterSection />

            {/* ── Scroll-to-top ─────────────────────────────── */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                aria-label="Back to top"
                className={cn(
                    "fixed bottom-8 right-8 z-50 p-3 rounded-2xl border shadow-2xl",
                    "transition-all duration-300 hover:scale-110 active:scale-95",
                    showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
                    D ? "bg-emerald-600 border-emerald-500/40 text-white shadow-emerald-950"
                        : "bg-emerald-600 border-emerald-500 text-white shadow-emerald-500/30"
                )}
            >
                <ArrowUp className="w-5 h-5" />
            </button>
        </div>
    );
}

/* ── Atoms (identical to privacy-policy / terms pages) ──────────────────── */

function P({ cls, children }: { cls: string; children: React.ReactNode }) {
    return <p className={cn("text-sm leading-relaxed mb-4", cls)}>{children}</p>;
}

function SecHeading({ d, children }: { d: boolean; children: React.ReactNode }) {
    return (
        <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug",
            d ? "text-slate-100" : "text-slate-900"
        )}>
            {children}
        </h2>
    );
}

function B({ d, children }: { d: boolean; children: React.ReactNode }) {
    return <strong className={d ? "text-slate-100" : "text-slate-900"}>{children}</strong>;
}

function A({ href, d, children }: { href: string; d: boolean; children: React.ReactNode }) {
    return (
        <a href={href} className={cn(
            "underline underline-offset-2 transition-colors",
            d ? "text-emerald-400 hover:text-emerald-300"
                : "text-emerald-600 hover:text-emerald-700"
        )}>
            {children}
        </a>
    );
}

function Bullet({ children }: { children: React.ReactNode }) {
    return (
        <li className="flex items-start gap-2 text-sm leading-relaxed">
            <span className="mt-[7px] block w-1.5 h-1.5 rounded-full bg-current shrink-0 opacity-50" />
            <span>{children}</span>
        </li>
    );
}
