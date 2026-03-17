"use client";

import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Home, ArrowUp, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FooterSection } from "../landingPage/footerSection";

const LAST_UPDATED = "March 5, 2026";

export default function TermsAndConditionsPage() {
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
    const accent = D ? "text-emerald-400" : "text-emerald-600";
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
                <h1 className={cn("text-5xl sm:text-6xl font-black tracking-tight leading-none mb-4", strong)}>
                    Terms of Service
                </h1>
                <p className={cn("text-sm mb-10", muted)}>Last Updated: {LAST_UPDATED}</p>

                <hr className={cn("mb-10", hr)} />

                {/* ── Intro ─────────────────────────────────────── */}
                <P cls={body}>
                    These Terms of Service (“Terms”) govern access to and use of the <B d={D}>WhatsNexus</B> platform, a messaging automation and customer communication platform operated by <B d={D}>Kingpin Ventures</B>. By accessing or using WhatsNexus, you agree to be bound by these Terms.
                </P>

                <hr className={cn("my-10", hr)} />

                {/* ── 1. Acceptance ────────────────────────────── */}
                <section id="acceptance">
                    <SecHeading d={D}>1. Acceptance of Terms</SecHeading>
                    <ul className={cn("mt-2 mb-5 space-y-2 text-sm leading-relaxed", body)}>
                        <Bullet>By creating an account, accessing, or using WhatsNexus, you agree to comply with and be legally bound by these Terms and any applicable policies referenced herein.</Bullet>
                        <Bullet>If you are using the Platform on behalf of an organization, you represent that you have authority to bind that organization to these Terms.</Bullet>
                        <Bullet>If you do not agree to these Terms, you must not use the Platform.</Bullet>
                    </ul>
                </section>

                <hr className={cn("my-10", hr)} />

                {/* ── 2. Description ────────────────────────────── */}
                <section id="description">
                    <SecHeading d={D}>2. Description of the Platform</SecHeading>
                    <P cls={body}>WhatsNexus is an AI-powered messaging automation platform that enables organizations to:</P>
                    <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                        <Bullet>manage customer conversations via the WhatsApp Business Platform</Bullet>
                        <Bullet>automate responses and workflows</Bullet>
                        <Bullet>manage leads and customer engagement</Bullet>
                        <Bullet>enable collaboration between human agents and AI systems</Bullet>
                        <Bullet>run messaging campaigns and analytics</Bullet>
                    </ul>
                    <P cls={body}>The Platform may integrate with WhatsApp/Meta services and other third-party platforms.</P>
                </section>

                <hr className={cn("my-10", hr)} />

                {/* ── 3. Account Registration ──────────────────── */}
                <section id="accounts">
                    <SecHeading d={D}>3. Account Registration and Access</SecHeading>
                    <ul className={cn("mt-2 mb-5 space-y-2 text-sm leading-relaxed", body)}>
                        <Bullet><B d={D}>3.1</B> To use the Platform, you may need to create an account and provide accurate and complete information.</Bullet>
                        <Bullet><B d={D}>3.2</B> You are responsible for maintaining the confidentiality of your login credentials.</Bullet>
                        <Bullet><B d={D}>3.3</B> You are responsible for all activity that occurs under your account, including actions taken by authorized users.</Bullet>
                        <Bullet><B d={D}>3.4</B> You must notify Kingpin Ventures immediately if you suspect unauthorized access to your account.</Bullet>
                    </ul>
                </section>

                <hr className={cn("my-10", hr)} />

                {/* ── 4. Customer Responsibilities ──────────────── */}
                <section id="responsibilities">
                    <SecHeading d={D}>4. Customer Responsibilities</SecHeading>
                    <P cls={body}>Customers using WhatsNexus agree to:</P>
                    <ul className={cn("mt-2 mb-5 space-y-2 text-sm leading-relaxed", body)}>
                        <Bullet>use the Platform only for lawful business purposes</Bullet>
                        <Bullet>comply with WhatsApp Business Platform policies and messaging guidelines</Bullet>
                        <Bullet>obtain necessary consent before sending messages where required by law</Bullet>
                        <Bullet>ensure all Customer Data and message templates comply with applicable laws and regulations</Bullet>
                    </ul>
                    <P cls={body}>Customers are responsible for the conduct of their users, agents, and administrators.</P>
                </section>

                <hr className={cn("my-10", hr)} />

                {/* ── 5. Prohibited Use ─────────────────────────── */}
                <section id="prohibited">
                    <SecHeading d={D}>5. Prohibited Use</SecHeading>
                    <P cls={body}>You may not use WhatsNexus to:</P>
                    <ul className={cn("mt-2 mb-5 space-y-2 text-sm leading-relaxed", body)}>
                        <Bullet>violate any applicable laws or consumer protection laws</Bullet>
                        <Bullet>send unlawful, harmful, threatening, abusive, harassing, defamatory, or discriminatory content</Bullet>
                        <Bullet>impersonate others or misrepresent affiliation</Bullet>
                        <Bullet>transmit malware, malicious code, or attempt to compromise platform security</Bullet>
                        <Bullet>engage in unauthorized scraping or automated access not approved by <B d={D}>Kingpin Ventures</B></Bullet>
                        <Bullet>use the Platform for activities that could cause WhatsApp account suspension or policy violations</Bullet>
                    </ul>
                    <P cls={body}>We may suspend or terminate access for violations of these Terms or applicable policies.</P>
                </section>

                <hr className={cn("my-10", hr)} />

                {/* ── 6. AI Features ────────────────────────────── */}
                <section id="ai-features">
                    <SecHeading d={D}>6. AI Features and Human Oversight</SecHeading>
                    <ul className={cn("mt-2 mb-5 space-y-2 text-sm leading-relaxed", body)}>
                        <Bullet><B d={D}>6.1</B> AI Features may generate automated suggestions or responses based on Customer-provided knowledge and conversation context.</Bullet>
                        <Bullet><B d={D}>6.2</B> AI output may be inaccurate or incomplete. You are responsible for reviewing and validating AI output before relying on it, especially for sensitive or regulated use cases.</Bullet>
                        <Bullet><B d={D}>6.3</B> You are responsible for configuring escalation to human agents where appropriate and for providing accurate knowledge base content.</Bullet>
                    </ul>
                </section>

                <hr className={cn("my-10", hr)} />

                {/* ── 7. Data and Privacy ───────────────────────── */}
                <section id="data-privacy">
                    <SecHeading d={D}>7. Data and Privacy</SecHeading>
                    <ul className={cn("mt-2 mb-5 space-y-3 text-sm leading-relaxed", body)}>
                        <Bullet><B d={D}>7.1 Customer Data Ownership.</B> Customer retains ownership of Customer Data.</Bullet>
                        <Bullet><B d={D}>7.2 Processing.</B> <B d={D}>Kingpin Ventures</B> processes Customer Data to provide the Platform and related support.</Bullet>
                        <Bullet><B d={D}>7.3 Privacy Policy.</B> Your use of the Platform is also governed by our Privacy Policy available at: <A href="/privacyPolicy" d={D}>https://whatsnexus.com/privacy-policy</A>.</Bullet>
                        <Bullet><B d={D}>7.4 Data Deletion Requests.</B> Customer may request deletion as described in the Privacy Policy or via <A href="mailto:sushilathithiyaa@gmail.com" d={D}>sushilathithiyaa@gmail.com</A>.</Bullet>
                    </ul>
                </section>

                <hr className={cn("my-10", hr)} />

                {/* ── 8. Third-Party Services ────────────────────── */}
                <section id="third-party">
                    <SecHeading d={D}>8. Third-Party Services and Integrations</SecHeading>
                    <ul className={cn("mt-2 mb-5 space-y-2 text-sm leading-relaxed", body)}>
                        <Bullet><B d={D}>8.1</B> The Platform may connect to third-party services (e.g., WhatsApp/Meta, CRM systems).</Bullet>
                        <Bullet><B d={D}>8.2</B> <B d={D}>Kingpin Ventures</B> is not responsible for third-party services, their availability, their acts or omissions, or their terms.</Bullet>
                        <Bullet><B d={D}>8.3</B> Third-party fees, restrictions, and policies may apply, and Customer is responsible for compliance.</Bullet>
                    </ul>
                </section>

                <hr className={cn("my-10", hr)} />

                {/* ── 9. Fees and Billing ───────────────────────── */}
                <section id="fees">
                    <SecHeading d={D}>9. Fees, Billing, and Taxes (If Applicable)</SecHeading>
                    <ul className={cn("mt-2 mb-5 space-y-2 text-sm leading-relaxed", body)}>
                        <Bullet><B d={D}>9.1</B> Some Platform features may require payment under a separate subscription or order form.</Bullet>
                        <Bullet><B d={D}>9.2</B> Customer agrees to pay fees according to the selected plan and billing terms.</Bullet>
                        <Bullet><B d={D}>9.3</B> Taxes (GST/VAT or other) may apply and are Customer’s responsibility unless stated otherwise.</Bullet>
                        <Bullet><B d={D}>9.4</B> Late or failed payments may result in suspension or limitation of service.</Bullet>
                    </ul>
                </section>

                <hr className={cn("my-10", hr)} />

                {/* ── 10. Availability ───────────────────────────── */}
                <section id="availability">
                    <SecHeading d={D}>10. Service Availability and Support</SecHeading>
                    <ul className={cn("mt-2 mb-5 space-y-2 text-sm leading-relaxed", body)}>
                        <Bullet><B d={D}>10.1</B> We aim to provide reliable service but do not guarantee uninterrupted availability.</Bullet>
                        <Bullet><B d={D}>10.2</B> Maintenance, updates, outages, or third-party platform issues may affect availability.</Bullet>
                        <Bullet><B d={D}>10.3</B> Support channels and response times may vary by plan or agreement.</Bullet>
                    </ul>
                </section>

                <hr className={cn("my-10", hr)} />

                {/* ── 11. Intellectual Property ──────────────────── */}
                <section id="ip">
                    <SecHeading d={D}>11. Intellectual Property</SecHeading>
                    <ul className={cn("mt-2 mb-5 space-y-2 text-sm leading-relaxed", body)}>
                        <Bullet><B d={D}>11.1</B> <B d={D}>Kingpin Ventures</B> and its licensors own all rights in the Platform, including software, design, and documentation, except Customer Data.</Bullet>
                        <Bullet><B d={D}>11.2</B> Subject to these Terms, <B d={D}>Kingpin Ventures</B> grants Customer a limited, non-exclusive, non-transferable right to use the Platform for internal business purposes during the subscription term.</Bullet>
                        <Bullet><B d={D}>11.3</B> Customer may not copy, modify, reverse engineer, or create derivative works of the Platform except as permitted by law.</Bullet>
                    </ul>
                </section>

                <hr className={cn("my-10", hr)} />

                {/* ── 12. Confidentiality ────────────────────────── */}
                <section id="confidentiality">
                    <SecHeading d={D}>12. Confidentiality</SecHeading>
                    <ul className={cn("mt-2 mb-5 space-y-2 text-sm leading-relaxed", body)}>
                        <Bullet><B d={D}>12.1</B> Each party may receive confidential information from the other.</Bullet>
                        <Bullet><B d={D}>12.2</B> Confidential information must be protected and used only for the purpose of providing or using the Platform.</Bullet>
                        <Bullet><B d={D}>12.3</B> This obligation does not apply to information that is publicly known, independently developed, or disclosed under legal requirement.</Bullet>
                    </ul>
                </section>

                <hr className={cn("my-10", hr)} />

                {/* ── 13. Suspension ─────────────────────────────── */}
                <section id="termination">
                    <SecHeading d={D}>13. Suspension and Termination</SecHeading>
                    <P cls={body}>13.1 We may suspend access immediately if:</P>
                    <ul className={cn("ml-6 mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                        <Bullet>you violate these Terms or applicable policies</Bullet>
                        <Bullet>your use poses a security or legal risk</Bullet>
                        <Bullet>required payments are overdue (if applicable)</Bullet>
                    </ul>
                    <P cls={body}><B d={D}>13.2</B> Customer may terminate use by providing notice in accordance with applicable subscription terms.</P>
                    <P cls={body}><B d={D}>13.3</B> Upon termination, access may be disabled and Customer Data retention/deletion will follow the Privacy Policy and any applicable agreement.</P>
                </section>

                <hr className={cn("my-10", hr)} />

                {/* ── 14. Disclaimers ────────────────────────────── */}
                <section id="disclaimers">
                    <SecHeading d={D}>14. Disclaimers</SecHeading>
                    <ul className={cn("mt-2 mb-5 space-y-2 text-sm leading-relaxed", body)}>
                        <Bullet><B d={D}>14.1</B> The Platform is provided &quot;as is&quot; and &quot;as available.&quot;</Bullet>
                        <Bullet><B d={D}>14.2</B> We disclaim all warranties to the maximum extent permitted by law, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</Bullet>
                        <Bullet><B d={D}>14.3</B> We do not warrant that AI Features will be error-free, accurate, or suitable for any particular purpose.</Bullet>
                    </ul>
                </section>

                <hr className={cn("my-10", hr)} />

                {/* ── 15. Liability ──────────────────────────────── */}
                <section id="liability">
                    <SecHeading d={D}>15. Limitation of Liability</SecHeading>
                    <P cls={body}>To the maximum extent permitted by law:</P>
                    <ul className={cn("mt-2 mb-5 space-y-3 text-sm leading-relaxed", body)}>
                        <Bullet>
                            <B d={D}>Kingpin Ventures</B> will not be liable for indirect, incidental, special, consequential, or punitive damages.
                        </Bullet>
                        <Bullet>
                            Our total liability for claims related to the Platform will not exceed the amount paid by Customer to <B d={D}>Kingpin Ventures</B> for the Platform in the [3/6/12] months preceding the event giving rise to the claim (or a different cap if agreed in writing).
                        </Bullet>
                    </ul>
                </section>

                <hr className={cn("my-10", hr)} />

                {/* ── 16. Indemnification ────────────────────────── */}
                <section id="indemnification">
                    <SecHeading d={D}>16. Indemnification</SecHeading>
                    <P cls={body}>Customer agrees to indemnify and hold harmless <B d={D}>Kingpin Ventures</B>, its directors, officers, employees, and agents from claims, damages, liabilities, and expenses arising from:</P>
                    <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                        <Bullet>Customer Data, templates, campaigns, or messages</Bullet>
                        <Bullet>violation of laws or third-party rights</Bullet>
                        <Bullet>misuse of WhatsNexus or third-party platforms</Bullet>
                        <Bullet>breach of these Terms by Customer or Authorized Users</Bullet>
                    </ul>
                </section>

                <hr className={cn("my-10", hr)} />

                {/* ── 17. Governing Law ──────────────────────────── */}
                <section id="law">
                    <SecHeading d={D}>17. Governing Law and Dispute Resolution</SecHeading>
                    <P cls={body}>These Terms are governed by the laws of India. Courts located in Tamil Nadu will have exclusive jurisdiction unless otherwise required by applicable law.</P>
                </section>

                <hr className={cn("my-10", hr)} />

                {/* ── 18. Changes ───────────────────────────────── */}
                <section id="changes">
                    <SecHeading d={D}>18. Changes to These Terms</SecHeading>
                    <P cls={body}>We may update these Terms from time to time. Updates will be posted on this page and the &quot;Last Updated&quot; date will be revised. Continued use of the Platform after updates constitutes acceptance of the updated Terms.</P>
                </section>

                <hr className={cn("my-10", hr)} />

                {/* ── 19. Contact ───────────────────────────────── */}
                <section id="contact">
                    <SecHeading d={D}>19. Contact</SecHeading>
                    <P cls={body}>For questions about these Terms, contact:</P>
                    <P cls={body}>
                        <B d={D}>Kingpin Ventures</B><br />
                        Email: <A href="mailto:sushilathithiyaa@gmail.com" d={D}>sushilathithiyaa@gmail.com</A><br />
                        Address:<br />
                        LIG 13/19, NH3<br />
                        Vanjinathan Street<br />
                        Maraimalai Nagar<br />
                        Chennai – 603209<br />
                        India
                    </P>
                </section>

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

/* ── Atoms ──────────────────────────────────────────────── */

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
