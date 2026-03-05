"use client";

import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Sun, Moon, Home, ArrowUp, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FooterSection } from "../landing-page/footer-section";

const LAST_UPDATED = "March 5, 2026";

export default function PrivacyPolicyPage() {
    const { setTheme, isDarkMode } = useTheme();
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
                            Powered by Invictus Global Tech
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
                    Privacy Policy
                </h1>
                <p className={cn("text-sm mb-10", muted)}>Last Updated: {LAST_UPDATED}</p>

                <hr className={cn("mb-10", hr)} />

                {/* ── Intro ─────────────────────────────────────── */}
                <P cls={body}>
                    This Privacy Policy explains how <B d={D}>Invictus Global Tech Pvt Ltd</B> collects, uses, stores, and shares information when you use <B d={D}>WhatsNexus Platform</B>. WhatsNexus is an AI-powered messaging automation platform that helps organizations manage customer conversations, qualify leads, and automate communication workflows using the WhatsApp Business Platform (Cloud API).
                </P>

                <hr className={cn("my-10", hr)} />

                {/* ── 1. Scope ──────────────────────────────────── */}
                <section id="scope">
                    <SecHeading d={D}>1. Scope</SecHeading>
                    <P cls={body}>This Privacy Policy applies to:</P>
                    <ul className={cn("mt-2 mb-5 space-y-2 text-sm leading-relaxed", body)}>
                        <Bullet>
                            <B d={D}>Customers (organizations)</B> that use WhatsNexus and their authorized users (admins, agents, team members).
                        </Bullet>
                        <Bullet>
                            <B d={D}>End users / message recipients</B> who communicate with a Customer through WhatsApp where WhatsNexus is used to manage those communications.
                        </Bullet>
                    </ul>
                </section>

                <hr className={cn("my-10", hr)} />

                {/* ── 2. Information We Process ─────────────────── */}
                <section id="information-we-process">
                    <SecHeading d={D}>2. Information We Process</SecHeading>
                    <P cls={body}>Depending on how WhatsNexus is configured and used, we may process the following categories of data:</P>

                    <SubH d={D}>2.1 Account and Organization Data</SubH>
                    <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                        <Bullet>Organization name and account settings</Bullet>
                        <Bullet>Admin/user names, email addresses, authentication and access details</Bullet>
                        <Bullet>Role-based access and permissions</Bullet>
                    </ul>

                    <SubH d={D}>2.2 WhatsApp Business Platform Data</SubH>
                    <P cls={body}>When a Customer connects WhatsApp to WhatsNexus, we may process:</P>
                    <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                        <Bullet>WhatsApp Business Account identifiers (e.g., WABA ID), phone number identifiers, and related configuration metadata</Bullet>
                        <Bullet>Conversation identifiers, timestamps, message delivery/read status events</Bullet>
                        <Bullet>Message content (text and media metadata) to the extent needed to provide platform features such as automated responses, routing, summaries, human handover, follow-ups, and analytics</Bullet>
                    </ul>

                    <SubH d={D}>2.3 Contacts and Lead Data (Customer-Controlled)</SubH>
                    <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                        <Bullet>Customer-provided phone numbers and contact attributes (e.g., name, tags, segmentation fields)</Bullet>
                        <Bullet>Lead-related data derived from conversations (e.g., intent labels, lead scoring, engagement indicators, source tracking)</Bullet>
                    </ul>

                    <SubH d={D}>2.4 Knowledge Hub Content (Customer-Provided)</SubH>
                    <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                        <Bullet>Business FAQs, service descriptions, product information, operational procedures, and other materials uploaded by Customers to guide AI responses</Bullet>
                    </ul>

                    <SubH d={D}>2.5 Operational, Analytics, and Technical Data</SubH>
                    <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                        <Bullet>Activity logs, performance and reliability metrics, system health indicators</Bullet>
                        <Bullet>Device/browser information and diagnostic logs for security and troubleshooting</Bullet>
                    </ul>
                </section>

                <hr className={cn("my-10", hr)} />

                {/* ── 3. How We Use Information ─────────────────── */}
                <section id="how-we-use">
                    <SecHeading d={D}>3. How We Use Information</SecHeading>
                    <P cls={body}>We use information to:</P>
                    <ul className={cn("mt-2 mb-5 space-y-2 text-sm leading-relaxed", body)}>
                        <Bullet>Provide, operate, and maintain WhatsNexus features (shared inbox, team collaboration, campaigns, follow-ups, analytics, and operational monitoring)</Bullet>
                        <Bullet>Power AI-assisted functions (intent recognition, automated response generation, summarization, lead qualification, escalation detection, multilingual understanding)</Bullet>
                        <Bullet>Route conversations to human agents and enable collaboration tools (assignment, tagging, workload balancing)</Bullet>
                        <Bullet>Monitor performance and improve reliability, quality, and user experience</Bullet>
                        <Bullet>Secure the Platform, prevent abuse, and detect fraud or unauthorized access</Bullet>
                        <Bullet>Provide customer support and communicate with Customers regarding service updates</Bullet>
                        <Bullet>Comply with legal obligations and enforce applicable policies</Bullet>
                    </ul>
                </section>

                <hr className={cn("my-10", hr)} />

                {/* ── 4. How We Share Information ───────────────── */}
                <section id="how-we-share">
                    <SecHeading d={D}>4. How We Share Information</SecHeading>
                    <P cls={body}>We may share information only as necessary to provide the service, including:</P>
                    <ul className={cn("mt-2 mb-5 space-y-2 text-sm leading-relaxed", body)}>
                        <Bullet><B d={D}>Meta/WhatsApp:</B> to send/receive messages and manage WhatsApp Business Platform operations through the Cloud API</Bullet>
                        <Bullet><B d={D}>Service Providers:</B> hosting, monitoring, analytics, and support vendors that process data on our behalf under contractual protections</Bullet>
                        <Bullet><B d={D}>Legal/Compliance:</B> where required by law, regulation, court order, or to protect rights, safety, and security</Bullet>
                    </ul>
                    <P cls={body}><B d={D}>We do not sell personal data.</B></P>
                </section>

                <hr className={cn("my-10", hr)} />

                {/* ── 5. Data Retention ─────────────────────────── */}
                <section id="data-retention">
                    <SecHeading d={D}>5. Data Retention</SecHeading>
                    <P cls={body}>We retain information only as long as necessary to:</P>
                    <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                        <Bullet>Provide the Platform and its features</Bullet>
                        <Bullet>Maintain security, audit, and operational logs</Bullet>
                        <Bullet>Comply with legal, regulatory, and contractual obligations</Bullet>
                    </ul>
                    <P cls={body}>Retention periods may vary depending on Customer configuration and applicable law.</P>
                </section>

                <hr className={cn("my-10", hr)} />

                {/* ── 6. Data Deletion and Requests ──────────────── */}
                <section id="data-deletion">
                    <SecHeading d={D}>6. Data Deletion and Requests</SecHeading>
                    <P cls={body}>Customers may request deletion of data associated with their use of WhatsNexus by contacting us at:</P>
                    <P cls={body}><B d={D}>contact@invictusglobaltech.com</B></P>
                    <P cls={body}>To help us process requests, include:</P>
                    <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                        <Bullet>Organization name (if applicable)</Bullet>
                        <Bullet>The WhatsApp number(s) or account email associated with the request</Bullet>
                        <Bullet>The type of deletion requested (account, contacts, conversations, or all data)</Bullet>
                    </ul>
                    <P cls={body}>We will verify the request where appropriate and complete deletion or anonymization as required by applicable law and contractual obligations.</P>
                </section>

                <hr className={cn("my-10", hr)} />

                {/* ── 7. Security ───────────────────────────────── */}
                <section id="security">
                    <SecHeading d={D}>7. Security</SecHeading>
                    <P cls={body}>We use reasonable technical and organizational measures designed to protect information, including:</P>
                    <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                        <Bullet>Role-based access controls</Bullet>
                        <Bullet>Secure API integrations</Bullet>
                        <Bullet>Monitoring and logging for operational security</Bullet>
                    </ul>
                    <P cls={body}>No system is completely secure. We cannot guarantee absolute security, but we work to protect data against unauthorized access, alteration, or misuse.</P>
                </section>

                <hr className={cn("my-10", hr)} />

                {/* ── 8. Customer Responsibilities ─────────────── */}
                <section id="customer-responsibilities">
                    <SecHeading d={D}>8. Customer Responsibilities</SecHeading>
                    <P cls={body}>Customers are responsible for:</P>
                    <ul className={cn("mt-2 mb-5 space-y-2 text-sm leading-relaxed", body)}>
                        <Bullet>Ensuring they have appropriate rights and notices to collect and use contact data and message content</Bullet>
                        <Bullet>Complying with applicable laws and regulations (including data protection and messaging rules)</Bullet>
                        <Bullet>Complying with WhatsApp Business messaging policies when sending templates and campaigns</Bullet>
                    </ul>
                </section>

                <hr className={cn("my-10", hr)} />

                {/* ── 9. Healthcare Mode Notice ─────────────────── */}
                <section id="healthcare-mode">
                    <SecHeading d={D}>9. Healthcare Mode Notice</SecHeading>
                    <P cls={body}>WhatsNexus may be configured for healthcare messaging workflows. Customers are responsible for ensuring compliance with any healthcare privacy, security, and recordkeeping regulations applicable in their region when using WhatsNexus for patient communications.</P>
                </section>

                <hr className={cn("my-10", hr)} />

                {/* ── 10. Children’s Privacy ────────────────────── */}
                <section id="childrens-privacy">
                    <SecHeading d={D}>10. Children’s Privacy</SecHeading>
                    <P cls={body}>WhatsNexus is intended for business use and is not directed to children. Customers must ensure their messaging and data practices comply with applicable age-related requirements and messaging policies.</P>
                </section>

                <hr className={cn("my-10", hr)} />

                {/* ── 11. Changes to This Privacy Policy ────────── */}
                <section id="changes">
                    <SecHeading d={D}>11. Changes to This Privacy Policy</SecHeading>
                    <P cls={body}>We may update this Privacy Policy from time to time. Updates will be posted on this page and the “Last Updated” date will be revised.</P>
                </section>

                <hr className={cn("my-10", hr)} />

                {/* ── 12. Contact ───────────────────────────────── */}
                <section id="contact">
                    <SecHeading d={D}>12. Contact</SecHeading>
                    <P cls={body}>For privacy questions or requests, contact:</P>
                    <P cls={body}>
                        <B d={D}>Invictus Global Tech Pvt Ltd</B><br />
                        Email: <A href="mailto:contact@invictusglobaltech.com" d={D}>contact@invictusglobaltech.com</A><br />
                        Address: LIG 13/19, NH3, Vanjinathan Street, Maraimalai Nagar, Chennai - 603209
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

function SubH({ d, children }: { d: boolean; children: React.ReactNode }) {
    return (
        <h3 className={cn("text-sm font-bold mb-2 mt-4", d ? "text-slate-200" : "text-slate-900")}>
            {children}
        </h3>
    );
}

function B({ d, children }: { d: boolean; children: React.ReactNode }) {
    return <strong className={d ? "text-slate-100" : "text-slate-900"}>{children}</strong>;
}

function InShort({ d, children }: { d: boolean; children: React.ReactNode }) {
    return (
        <>
            <strong className={cn("not-italic", d ? "text-slate-100" : "text-slate-900")}>In Short: </strong>
            <em>{children}</em>
        </>
    );
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
