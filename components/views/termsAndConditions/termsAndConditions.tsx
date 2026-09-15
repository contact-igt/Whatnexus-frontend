"use client";

import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FooterSection } from "../landingPage/footerSection";

const LAST_UPDATED = "September 15, 2026";

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
                    Terms of Service
                </h1>
                <p className={cn("text-sm mb-10", muted)}>Last Updated: {LAST_UPDATED}</p>

                <hr className={cn("mb-10", hr)} />

                <p className={cn("text-sm leading-relaxed mb-4", body)}>These Terms of Service (“Terms”) govern access to and use of the <strong className={strong}>WhatsNexus</strong> platform, an AI-powered messaging automation and customer communication platform developed, operated, supported, and administered through the business collaboration between <strong className={strong}>Invictus Global Tech</strong> and <strong className={strong}>Kingpin Ventures</strong>.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Invictus Global Tech and Kingpin Ventures are business partners collaborating in connection with the development, operation, administration, support, security, Meta/WhatsApp integration, and delivery of the WhatsNexus platform according to their respective roles and responsibilities.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>The Meta Business Portfolio used to support and administer certain WhatsNexus integrations with Meta and the WhatsApp Business Platform is associated with <strong className={strong}>Kingpin Ventures</strong>.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>References in these Terms to <strong className={strong}>“WhatsNexus,” “we,” “us,” or “our”</strong> refer, where applicable, to <strong className={strong}>Invictus Global Tech and Kingpin Ventures</strong> in connection with their respective roles in operating and supporting the WhatsNexus platform.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>By accessing or using WhatsNexus, you agree to be bound by these Terms.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>Corporate and Platform Relationship</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>Invictus Global Tech</strong> and <strong className={strong}>Kingpin Ventures</strong> are business partners collaborating in connection with the WhatsNexus platform.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Their respective activities may include, as applicable:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">platform development and maintenance</li>
                <li className="ml-5 list-disc pl-1">infrastructure and technical operations</li>
                <li className="ml-5 list-disc pl-1">customer onboarding and support</li>
                <li className="ml-5 list-disc pl-1">Meta and WhatsApp Business Platform integrations</li>
                <li className="ml-5 list-disc pl-1">security and operational monitoring</li>
                <li className="ml-5 list-disc pl-1">product development</li>
                <li className="ml-5 list-disc pl-1">technical support</li>
                <li className="ml-5 list-disc pl-1">platform administration</li>
                <li className="ml-5 list-disc pl-1">service delivery</li>
                <li className="ml-5 list-disc pl-1">compliance and integration management</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>WhatsNexus is the public-facing platform and product. For Meta platform integration purposes, WhatsNexus uses a Meta application named “Nexus Connect.” Nexus Connect is the technical application name used for WhatsNexus integrations, not a separate customer-facing service or company.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>The involvement of Kingpin Ventures in Meta and WhatsApp Business Platform administration does not mean that Kingpin Ventures or Invictus Global Tech owns a Customer&apos;s own Meta Business Portfolio, WhatsApp Business Account, phone numbers, contacts, conversations, or other Customer-controlled business assets.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Unless specifically stated otherwise in a separate written agreement, references to the collaboration between Invictus Global Tech and Kingpin Ventures describe a <strong className={strong}>business collaboration and do not create a separate legal partnership entity, joint venture, agency, or employment relationship with the Customer</strong>.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>1. Acceptance of Terms</h2>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">By creating an account, accessing, connecting an integration to, or using WhatsNexus, you agree to comply with and be legally bound by these Terms and any applicable policies referenced herein.</li>
                <li className="ml-5 list-disc pl-1">If you are using the Platform on behalf of an organization, you represent that you have authority to bind that organization to these Terms.</li>
                <li className="ml-5 list-disc pl-1">You represent that information provided during account registration, onboarding, billing, or integration setup is accurate and complete.</li>
                <li className="ml-5 list-disc pl-1">If you do not agree to these Terms, you must not use the Platform.</li>
                </ul>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>2. Description of the Platform</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>WhatsNexus is an AI-powered messaging automation platform that enables organizations to:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">manage customer conversations via the WhatsApp Business Platform</li>
                <li className="ml-5 list-disc pl-1">automate responses and communication workflows</li>
                <li className="ml-5 list-disc pl-1">manage leads and customer engagement</li>
                <li className="ml-5 list-disc pl-1">enable collaboration between human agents and AI systems</li>
                <li className="ml-5 list-disc pl-1">operate a shared messaging inbox</li>
                <li className="ml-5 list-disc pl-1">manage follow-ups</li>
                <li className="ml-5 list-disc pl-1">run messaging campaigns</li>
                <li className="ml-5 list-disc pl-1">use analytics and operational monitoring</li>
                <li className="ml-5 list-disc pl-1">manage or assist with WhatsApp message templates where supported</li>
                <li className="ml-5 list-disc pl-1">connect authorized WhatsApp Business Accounts</li>
                <li className="ml-5 list-disc pl-1">use AI-assisted conversation and customer engagement features</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>The Platform may integrate with:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">Meta</li>
                <li className="ml-5 list-disc pl-1">WhatsApp Business Platform</li>
                <li className="ml-5 list-disc pl-1">WhatsApp Cloud API</li>
                <li className="ml-5 list-disc pl-1">CRM systems</li>
                <li className="ml-5 list-disc pl-1">artificial intelligence services</li>
                <li className="ml-5 list-disc pl-1">analytics providers</li>
                <li className="ml-5 list-disc pl-1">infrastructure providers</li>
                <li className="ml-5 list-disc pl-1">other third-party platforms and services</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Features may change, be added, modified, restricted, or discontinued from time to time.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>3. Account Registration and Access</h2>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>3.1 Account Registration</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>To use the Platform, you may need to create an account and provide accurate and complete information.</p>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>3.2 Account Security</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>You are responsible for maintaining the confidentiality and security of your:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">login credentials</li>
                <li className="ml-5 list-disc pl-1">passwords</li>
                <li className="ml-5 list-disc pl-1">authentication methods</li>
                <li className="ml-5 list-disc pl-1">organization access</li>
                <li className="ml-5 list-disc pl-1">authorized user accounts</li>
                </ul>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>3.3 Authorized Users</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>You are responsible for all activity that occurs under your account, including actions taken by your:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">administrators</li>
                <li className="ml-5 list-disc pl-1">agents</li>
                <li className="ml-5 list-disc pl-1">employees</li>
                <li className="ml-5 list-disc pl-1">contractors</li>
                <li className="ml-5 list-disc pl-1">representatives</li>
                <li className="ml-5 list-disc pl-1">other authorized users</li>
                </ul>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>3.4 Unauthorized Access</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>You must notify WhatsNexus, Invictus Global Tech, or Kingpin Ventures promptly if you suspect:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">unauthorized access</li>
                <li className="ml-5 list-disc pl-1">account compromise</li>
                <li className="ml-5 list-disc pl-1">credential theft</li>
                <li className="ml-5 list-disc pl-1">security incidents</li>
                <li className="ml-5 list-disc pl-1">unauthorized integration activity</li>
                </ul>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>3.5 Role-Based Access</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Customers are responsible for appropriately configuring user roles and access permissions within their organization.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>4. Customer Responsibilities</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Customers using WhatsNexus agree to:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">use the Platform only for lawful business purposes</li>
                <li className="ml-5 list-disc pl-1">comply with WhatsApp Business Platform policies and messaging guidelines</li>
                <li className="ml-5 list-disc pl-1">comply with Meta platform requirements applicable to their use</li>
                <li className="ml-5 list-disc pl-1">obtain necessary consent before sending messages where required by law</li>
                <li className="ml-5 list-disc pl-1">ensure all Customer Data complies with applicable laws and regulations</li>
                <li className="ml-5 list-disc pl-1">ensure message templates comply with applicable laws, regulations, and WhatsApp policies</li>
                <li className="ml-5 list-disc pl-1">maintain appropriate control over their own Meta Business Portfolio</li>
                <li className="ml-5 list-disc pl-1">maintain appropriate control over their WhatsApp Business Account</li>
                <li className="ml-5 list-disc pl-1">maintain appropriate control over connected phone numbers</li>
                <li className="ml-5 list-disc pl-1">ensure they are authorized to connect any Meta or WhatsApp asset to WhatsNexus</li>
                <li className="ml-5 list-disc pl-1">protect their account credentials</li>
                <li className="ml-5 list-disc pl-1">provide accurate business information</li>
                <li className="ml-5 list-disc pl-1">configure human oversight where appropriate</li>
                <li className="ml-5 list-disc pl-1">comply with privacy, consumer protection, marketing, messaging, and industry-specific requirements applicable to their activities</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Customers are responsible for the conduct of their:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">users</li>
                <li className="ml-5 list-disc pl-1">agents</li>
                <li className="ml-5 list-disc pl-1">employees</li>
                <li className="ml-5 list-disc pl-1">administrators</li>
                <li className="ml-5 list-disc pl-1">contractors</li>
                <li className="ml-5 list-disc pl-1">representatives</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Customers are also responsible for communications sent using their connected WhatsApp Business Account.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>5. Prohibited Use</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>You may not use WhatsNexus to:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">violate any applicable law or regulation</li>
                <li className="ml-5 list-disc pl-1">violate consumer protection laws</li>
                <li className="ml-5 list-disc pl-1">violate privacy or data protection laws</li>
                <li className="ml-5 list-disc pl-1">violate Meta or WhatsApp policies</li>
                <li className="ml-5 list-disc pl-1">send unlawful, harmful, threatening, abusive, harassing, defamatory, discriminatory, deceptive, or fraudulent content</li>
                <li className="ml-5 list-disc pl-1">send unlawful spam or unsolicited messages</li>
                <li className="ml-5 list-disc pl-1">impersonate another person or organization</li>
                <li className="ml-5 list-disc pl-1">misrepresent your identity or affiliation</li>
                <li className="ml-5 list-disc pl-1">transmit malware or malicious code</li>
                <li className="ml-5 list-disc pl-1">attempt to compromise platform security</li>
                <li className="ml-5 list-disc pl-1">gain unauthorized access to systems, accounts, or data</li>
                <li className="ml-5 list-disc pl-1">interfere with platform availability or performance</li>
                <li className="ml-5 list-disc pl-1">perform unauthorized scraping</li>
                <li className="ml-5 list-disc pl-1">perform automated access not authorized by WhatsNexus</li>
                <li className="ml-5 list-disc pl-1">reverse engineer security controls</li>
                <li className="ml-5 list-disc pl-1">bypass usage, access, or technical restrictions</li>
                <li className="ml-5 list-disc pl-1">use the Platform for activities that could cause a WhatsApp Business Account, phone number, Meta account, or other third-party asset to be restricted or suspended</li>
                <li className="ml-5 list-disc pl-1">use Customer Data for purposes for which you do not have appropriate authorization</li>
                <li className="ml-5 list-disc pl-1">use WhatsNexus in a manner that creates unreasonable legal, security, operational, or reputational risk</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We may suspend or terminate access for violations of these Terms or applicable policies.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>6. AI Features and Human Oversight</h2>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>6.1 AI Features</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>WhatsNexus may provide artificial intelligence features that generate or assist with:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">automated responses</li>
                <li className="ml-5 list-disc pl-1">suggestions</li>
                <li className="ml-5 list-disc pl-1">summaries</li>
                <li className="ml-5 list-disc pl-1">intent detection</li>
                <li className="ml-5 list-disc pl-1">lead qualification</li>
                <li className="ml-5 list-disc pl-1">classification</li>
                <li className="ml-5 list-disc pl-1">multilingual understanding</li>
                <li className="ml-5 list-disc pl-1">escalation detection</li>
                <li className="ml-5 list-disc pl-1">knowledge-based responses</li>
                <li className="ml-5 list-disc pl-1">workflow decisions</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>AI features may use Customer-provided knowledge, configuration, and relevant conversation context.</p>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>6.2 Accuracy</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>AI-generated output may be inaccurate, incomplete, outdated, inappropriate, or unsuitable for a particular situation.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>You are responsible for reviewing and validating AI output before relying on it where appropriate.</p>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>6.3 Sensitive and Regulated Use Cases</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Human review is particularly important for sensitive or regulated use cases, including:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">healthcare</li>
                <li className="ml-5 list-disc pl-1">financial services</li>
                <li className="ml-5 list-disc pl-1">legal matters</li>
                <li className="ml-5 list-disc pl-1">regulated industries</li>
                <li className="ml-5 list-disc pl-1">high-impact decisions</li>
                <li className="ml-5 list-disc pl-1">sensitive personal information</li>
                </ul>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>6.4 Human Escalation</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Customers are responsible for configuring escalation to human agents where appropriate and for providing accurate and appropriate knowledge base content.</p>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>6.5 No Professional Advice</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Unless expressly agreed otherwise in writing, AI-generated content provided through WhatsNexus should not be treated as professional medical, legal, financial, or other regulated professional advice.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>7. Data and Privacy</h2>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>7.1 Customer Data Ownership</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Customer retains ownership of Customer Data, subject to applicable law and third-party platform terms.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Connecting WhatsNexus to a Customer&apos;s Meta or WhatsApp account does not transfer ownership of that Customer&apos;s business assets to WhatsNexus, Invictus Global Tech, or Kingpin Ventures.</p>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>7.2 Processing</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>Invictus Global Tech and Kingpin Ventures</strong>, according to their respective operational and technical roles, may process Customer Data as necessary to:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">provide the Platform</li>
                <li className="ml-5 list-disc pl-1">operate integrations</li>
                <li className="ml-5 list-disc pl-1">maintain infrastructure</li>
                <li className="ml-5 list-disc pl-1">provide technical support</li>
                <li className="ml-5 list-disc pl-1">maintain security</li>
                <li className="ml-5 list-disc pl-1">troubleshoot issues</li>
                <li className="ml-5 list-disc pl-1">administer Meta and WhatsApp integrations</li>
                <li className="ml-5 list-disc pl-1">provide authorized WhatsNexus functionality</li>
                </ul>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>7.3 Privacy Policy</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Your use of the Platform is also governed by our Privacy Policy available at:</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><Link href="/privacyPolicy" className="underline underline-offset-2 text-emerald-500">https://whatsnexus.com/privacy-policy</Link></p>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>7.4 Data Deletion Requests</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Customers may request deletion as described in the Privacy Policy or by contacting:</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><a href="mailto:sushilathithiyaa@gmail.com" className="underline underline-offset-2 text-emerald-500">sushilathithiyaa@gmail.com</a></p>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>7.5 Customer Obligations</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Customers are responsible for ensuring they have an appropriate legal basis, notice, permission, consent, or other authorization required to process Customer Data using WhatsNexus.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>8. Meta and WhatsApp Business Platform Integration</h2>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>8.1 Integration</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>WhatsNexus may integrate with the <strong className={strong}>WhatsApp Business Platform (Cloud API)</strong> and other Meta services.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Customers may connect their own:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">Meta Business Portfolio</li>
                <li className="ml-5 list-disc pl-1">WhatsApp Business Account</li>
                <li className="ml-5 list-disc pl-1">WhatsApp business phone numbers</li>
                <li className="ml-5 list-disc pl-1">message templates</li>
                <li className="ml-5 list-disc pl-1">related authorized business assets</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>through Meta-approved authorization and onboarding processes.</p>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>8.2 Meta Authentication</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>WhatsNexus does not require Customers to provide their Facebook or Meta account password directly to WhatsNexus.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Authentication and authorization involving Meta accounts are handled through Meta-provided authentication and authorization mechanisms.</p>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>8.3 Kingpin Ventures Meta Business Portfolio</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>As part of the business collaboration supporting WhatsNexus, a Meta Business Portfolio associated with <strong className={strong}>Kingpin Ventures</strong> may be used to support, administer, or enable relevant WhatsNexus integrations with Meta and the WhatsApp Business Platform.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>For Meta platform integration purposes, WhatsNexus uses a Meta application named “Nexus Connect.” Nexus Connect is the technical Meta application used to enable authorized Meta and WhatsApp Business Platform functionality for WhatsNexus and is not a separate customer-facing service. This includes customer onboarding, account authorization, messaging, webhook processing, and related integration management. Use of Nexus Connect does not change Customer ownership or control of their own Meta and WhatsApp business assets.</p>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>8.4 Customer Ownership</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Use of the Kingpin Ventures Meta Business Portfolio for integration administration does not transfer ownership of the Customer&apos;s:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">Meta Business Portfolio</li>
                <li className="ml-5 list-disc pl-1">WhatsApp Business Account</li>
                <li className="ml-5 list-disc pl-1">WhatsApp business phone number</li>
                <li className="ml-5 list-disc pl-1">contacts</li>
                <li className="ml-5 list-disc pl-1">conversations</li>
                <li className="ml-5 list-disc pl-1">Customer Data</li>
                <li className="ml-5 list-disc pl-1">other Customer-controlled assets</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>to Kingpin Ventures, Invictus Global Tech, or WhatsNexus.</p>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>8.5 Customer Authorization</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Customers represent that they have the necessary rights and administrative authority to connect the Meta or WhatsApp assets they authorize WhatsNexus to access.</p>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>8.6 Meta and WhatsApp Policies</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Customers must comply with applicable:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">Meta terms</li>
                <li className="ml-5 list-disc pl-1">WhatsApp terms</li>
                <li className="ml-5 list-disc pl-1">WhatsApp Business Messaging Policy</li>
                <li className="ml-5 list-disc pl-1">WhatsApp Business Platform requirements</li>
                <li className="ml-5 list-disc pl-1">message template requirements</li>
                <li className="ml-5 list-disc pl-1">consent requirements</li>
                <li className="ml-5 list-disc pl-1">messaging limits</li>
                <li className="ml-5 list-disc pl-1">platform policies</li>
                </ul>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>8.7 Third-Party Enforcement</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Meta or WhatsApp may independently:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">restrict accounts</li>
                <li className="ml-5 list-disc pl-1">restrict phone numbers</li>
                <li className="ml-5 list-disc pl-1">reject templates</li>
                <li className="ml-5 list-disc pl-1">impose messaging limits</li>
                <li className="ml-5 list-disc pl-1">suspend services</li>
                <li className="ml-5 list-disc pl-1">modify APIs</li>
                <li className="ml-5 list-disc pl-1">modify platform requirements</li>
                <li className="ml-5 list-disc pl-1">change pricing</li>
                <li className="ml-5 list-disc pl-1">discontinue features</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>WhatsNexus does not control such decisions.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>9. Third-Party Services and Integrations</h2>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>9.1 Third-Party Services</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>The Platform may connect to third-party services, including:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">Meta</li>
                <li className="ml-5 list-disc pl-1">WhatsApp</li>
                <li className="ml-5 list-disc pl-1">CRM systems</li>
                <li className="ml-5 list-disc pl-1">AI providers</li>
                <li className="ml-5 list-disc pl-1">hosting providers</li>
                <li className="ml-5 list-disc pl-1">analytics providers</li>
                <li className="ml-5 list-disc pl-1">communication services</li>
                <li className="ml-5 list-disc pl-1">other integration partners</li>
                </ul>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>9.2 Third-Party Responsibility</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Invictus Global Tech and Kingpin Ventures are not responsible for third-party services, including their:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">availability</li>
                <li className="ml-5 list-disc pl-1">outages</li>
                <li className="ml-5 list-disc pl-1">acts or omissions</li>
                <li className="ml-5 list-disc pl-1">data practices</li>
                <li className="ml-5 list-disc pl-1">pricing</li>
                <li className="ml-5 list-disc pl-1">policy changes</li>
                <li className="ml-5 list-disc pl-1">API changes</li>
                <li className="ml-5 list-disc pl-1">account restrictions</li>
                <li className="ml-5 list-disc pl-1">service discontinuation</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>except where responsibility cannot legally be excluded.</p>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>9.3 Third-Party Terms</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Third-party fees, restrictions, licenses, policies, and terms may apply.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Customers are responsible for complying with applicable third-party requirements.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>10. Fees, Billing, and Taxes</h2>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>10.1 Fees</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Some Platform features may require payment under:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">a subscription plan</li>
                <li className="ml-5 list-disc pl-1">order form</li>
                <li className="ml-5 list-disc pl-1">commercial agreement</li>
                <li className="ml-5 list-disc pl-1">enterprise agreement</li>
                <li className="ml-5 list-disc pl-1">usage-based arrangement</li>
                </ul>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>10.2 Payment</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Customer agrees to pay applicable fees according to the selected plan and billing terms.</p>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>10.3 Third-Party Charges</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Charges imposed by third parties, including Meta or WhatsApp messaging charges where applicable, may be:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">included in the Customer&apos;s plan</li>
                <li className="ml-5 list-disc pl-1">billed separately</li>
                <li className="ml-5 list-disc pl-1">passed through to the Customer</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>depending on the applicable commercial agreement.</p>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>10.4 Taxes</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Taxes, including GST, VAT, or other applicable taxes, may apply and are the Customer&apos;s responsibility unless stated otherwise.</p>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>10.5 Failed or Late Payments</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Late or failed payments may result in:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">service limitation</li>
                <li className="ml-5 list-disc pl-1">feature restriction</li>
                <li className="ml-5 list-disc pl-1">account suspension</li>
                <li className="ml-5 list-disc pl-1">termination</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>subject to applicable agreement and law.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>11. Service Availability and Support</h2>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>11.1 Availability</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We aim to provide reliable service but do not guarantee uninterrupted, error-free, or continuous availability.</p>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>11.2 Service Interruptions</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Availability may be affected by:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">scheduled maintenance</li>
                <li className="ml-5 list-disc pl-1">emergency maintenance</li>
                <li className="ml-5 list-disc pl-1">updates</li>
                <li className="ml-5 list-disc pl-1">software defects</li>
                <li className="ml-5 list-disc pl-1">infrastructure outages</li>
                <li className="ml-5 list-disc pl-1">telecommunications issues</li>
                <li className="ml-5 list-disc pl-1">internet failures</li>
                <li className="ml-5 list-disc pl-1">Meta or WhatsApp outages</li>
                <li className="ml-5 list-disc pl-1">third-party platform issues</li>
                <li className="ml-5 list-disc pl-1">events outside our reasonable control</li>
                </ul>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>11.3 Support</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Support channels and response times may vary according to:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">subscription plan</li>
                <li className="ml-5 list-disc pl-1">order form</li>
                <li className="ml-5 list-disc pl-1">commercial agreement</li>
                <li className="ml-5 list-disc pl-1">support agreement</li>
                </ul>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>11.4 Platform Updates</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We may modify, upgrade, improve, replace, or discontinue Platform functionality where reasonably necessary.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>12. Intellectual Property</h2>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>12.1 Platform Rights</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>All intellectual property rights in or relating to WhatsNexus, including its:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">software</li>
                <li className="ml-5 list-disc pl-1">interface</li>
                <li className="ml-5 list-disc pl-1">design</li>
                <li className="ml-5 list-disc pl-1">workflows</li>
                <li className="ml-5 list-disc pl-1">documentation</li>
                <li className="ml-5 list-disc pl-1">technology</li>
                <li className="ml-5 list-disc pl-1">branding</li>
                <li className="ml-5 list-disc pl-1">proprietary systems</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>are owned by <strong className={strong}>Invictus Global Tech, Kingpin Ventures, and/or their respective licensors or rights holders, as applicable</strong>.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Nothing in these Terms transfers intellectual property ownership to the Customer.</p>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>12.2 Customer License</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Subject to these Terms and applicable commercial agreements, WhatsNexus grants the Customer a limited, non-exclusive, non-transferable, revocable right to use the Platform for authorized business purposes during the applicable subscription or service term.</p>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>12.3 Restrictions</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Customer may not, except where permitted by applicable law:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">copy the Platform</li>
                <li className="ml-5 list-disc pl-1">modify proprietary software</li>
                <li className="ml-5 list-disc pl-1">reverse engineer the Platform</li>
                <li className="ml-5 list-disc pl-1">attempt to extract source code</li>
                <li className="ml-5 list-disc pl-1">circumvent technical restrictions</li>
                <li className="ml-5 list-disc pl-1">create unauthorized derivative works</li>
                <li className="ml-5 list-disc pl-1">sublicense or resell the Platform without permission</li>
                </ul>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>12.4 Customer Data</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Nothing in this Section transfers ownership of Customer Data to Invictus Global Tech or Kingpin Ventures.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>13. Confidentiality</h2>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>13.1 Confidential Information</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Each party may receive confidential or proprietary information from another party.</p>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>13.2 Protection</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Confidential information must be protected using reasonable safeguards and used only for purposes related to:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">providing the Platform</li>
                <li className="ml-5 list-disc pl-1">using the Platform</li>
                <li className="ml-5 list-disc pl-1">performing contractual obligations</li>
                <li className="ml-5 list-disc pl-1">providing support</li>
                <li className="ml-5 list-disc pl-1">administering integrations</li>
                </ul>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>13.3 Exceptions</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Confidentiality obligations do not apply to information that:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">is publicly available without breach</li>
                <li className="ml-5 list-disc pl-1">was lawfully known before disclosure</li>
                <li className="ml-5 list-disc pl-1">is independently developed</li>
                <li className="ml-5 list-disc pl-1">is lawfully received from a third party</li>
                <li className="ml-5 list-disc pl-1">must be disclosed under applicable law or legal process</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Where legally permitted, reasonable notice may be provided before compelled disclosure.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>14. Suspension and Termination</h2>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>14.1 Suspension</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We may suspend or restrict access where:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">you violate these Terms</li>
                <li className="ml-5 list-disc pl-1">you violate applicable law</li>
                <li className="ml-5 list-disc pl-1">you violate Meta or WhatsApp policies</li>
                <li className="ml-5 list-disc pl-1">your use creates a security risk</li>
                <li className="ml-5 list-disc pl-1">your use creates a legal or compliance risk</li>
                <li className="ml-5 list-disc pl-1">fraudulent or abusive activity is suspected</li>
                <li className="ml-5 list-disc pl-1">required payments are overdue</li>
                <li className="ml-5 list-disc pl-1">a connected third-party account is restricted</li>
                <li className="ml-5 list-disc pl-1">continued operation could harm the Platform, other Customers, or third parties</li>
                </ul>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>14.2 Customer Termination</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Customer may terminate use in accordance with applicable:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">subscription terms</li>
                <li className="ml-5 list-disc pl-1">order forms</li>
                <li className="ml-5 list-disc pl-1">commercial agreements</li>
                <li className="ml-5 list-disc pl-1">cancellation policies</li>
                </ul>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>14.3 Effect of Termination</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Upon termination:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">Platform access may be disabled</li>
                <li className="ml-5 list-disc pl-1">integrations may be disconnected</li>
                <li className="ml-5 list-disc pl-1">authorization to access certain third-party assets may be revoked</li>
                <li className="ml-5 list-disc pl-1">Customer Data retention or deletion will follow the Privacy Policy and applicable agreements</li>
                <li className="ml-5 list-disc pl-1">outstanding payment obligations may remain payable</li>
                </ul>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>14.4 Survival</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Provisions that by their nature should continue after termination, including provisions relating to:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">intellectual property</li>
                <li className="ml-5 list-disc pl-1">confidentiality</li>
                <li className="ml-5 list-disc pl-1">liability</li>
                <li className="ml-5 list-disc pl-1">indemnification</li>
                <li className="ml-5 list-disc pl-1">payment obligations</li>
                <li className="ml-5 list-disc pl-1">dispute resolution</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>may survive termination.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>15. Disclaimers</h2>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>15.1 Platform</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>The Platform is provided <strong className={strong}>“as is”</strong> and <strong className={strong}>“as available”</strong> to the maximum extent permitted by applicable law.</p>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>15.2 Warranties</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We disclaim warranties to the maximum extent permitted by law, including implied warranties of:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">merchantability</li>
                <li className="ml-5 list-disc pl-1">fitness for a particular purpose</li>
                <li className="ml-5 list-disc pl-1">non-infringement</li>
                </ul>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>15.3 AI Features</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We do not warrant that AI Features will be:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">error-free</li>
                <li className="ml-5 list-disc pl-1">completely accurate</li>
                <li className="ml-5 list-disc pl-1">complete</li>
                <li className="ml-5 list-disc pl-1">suitable for every business purpose</li>
                <li className="ml-5 list-disc pl-1">appropriate for every regulated use case</li>
                </ul>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>15.4 Third-Party Platforms</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We do not guarantee the continuous availability, functionality, approval, or policy status of third-party services such as Meta or WhatsApp.</p>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>15.5 Messaging Delivery</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We do not guarantee that:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">every WhatsApp message will be delivered</li>
                <li className="ml-5 list-disc pl-1">every message template will be approved</li>
                <li className="ml-5 list-disc pl-1">a Customer&apos;s Meta or WhatsApp account will remain unrestricted</li>
                <li className="ml-5 list-disc pl-1">third-party messaging limits will remain unchanged</li>
                </ul>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>16. Limitation of Liability</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>To the maximum extent permitted by applicable law:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1"><strong className={strong}>Invictus Global Tech and Kingpin Ventures</strong>, including their respective directors, officers, employees, representatives, and agents, will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages arising out of or relating to the use of WhatsNexus.</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>This includes, where permitted by law, losses relating to:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">lost profits</li>
                <li className="ml-5 list-disc pl-1">lost revenue</li>
                <li className="ml-5 list-disc pl-1">loss of business opportunities</li>
                <li className="ml-5 list-disc pl-1">loss of goodwill</li>
                <li className="ml-5 list-disc pl-1">loss of data</li>
                <li className="ml-5 list-disc pl-1">interruption of business</li>
                <li className="ml-5 list-disc pl-1">third-party platform suspension</li>
                <li className="ml-5 list-disc pl-1">Meta or WhatsApp account restrictions</li>
                <li className="ml-5 list-disc pl-1">failure of third-party services</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Our aggregate liability for claims related to the Platform will not exceed the amount paid by the Customer for WhatsNexus during the <strong className={strong}>12 months immediately preceding the event giving rise to the claim</strong>, unless a different liability cap is agreed in writing.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Nothing in these Terms excludes liability that cannot legally be excluded or limited under applicable law.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>17. Indemnification</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>To the extent permitted by applicable law, Customer agrees to indemnify and hold harmless:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1"><strong className={strong}>Invictus Global Tech</strong></li>
                <li className="ml-5 list-disc pl-1"><strong className={strong}>Kingpin Ventures</strong></li>
                <li className="ml-5 list-disc pl-1">their respective directors</li>
                <li className="ml-5 list-disc pl-1">officers</li>
                <li className="ml-5 list-disc pl-1">employees</li>
                <li className="ml-5 list-disc pl-1">contractors</li>
                <li className="ml-5 list-disc pl-1">representatives</li>
                <li className="ml-5 list-disc pl-1">agents</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>from claims, damages, losses, liabilities, penalties, costs, and reasonable expenses arising from or relating to:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">Customer Data</li>
                <li className="ml-5 list-disc pl-1">Customer-created message templates</li>
                <li className="ml-5 list-disc pl-1">campaigns</li>
                <li className="ml-5 list-disc pl-1">Customer communications</li>
                <li className="ml-5 list-disc pl-1">messages sent through connected accounts</li>
                <li className="ml-5 list-disc pl-1">violation of applicable law</li>
                <li className="ml-5 list-disc pl-1">violation of third-party rights</li>
                <li className="ml-5 list-disc pl-1">violation of Meta or WhatsApp policies</li>
                <li className="ml-5 list-disc pl-1">misuse of WhatsNexus</li>
                <li className="ml-5 list-disc pl-1">misuse of third-party platforms</li>
                <li className="ml-5 list-disc pl-1">unauthorized use of connected Meta or WhatsApp assets</li>
                <li className="ml-5 list-disc pl-1">breach of these Terms by Customer</li>
                <li className="ml-5 list-disc pl-1">actions of Customer&apos;s Authorized Users</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>This obligation does not apply to the extent a claim results directly from conduct for which Invictus Global Tech or Kingpin Ventures is legally responsible and liability cannot lawfully be excluded.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>18. Healthcare and Regulated Use</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>WhatsNexus may be configured for healthcare or other regulated communication workflows.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Customers remain responsible for determining whether WhatsNexus is appropriate for their intended use and for complying with applicable:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">healthcare privacy requirements</li>
                <li className="ml-5 list-disc pl-1">patient consent requirements</li>
                <li className="ml-5 list-disc pl-1">recordkeeping requirements</li>
                <li className="ml-5 list-disc pl-1">industry regulations</li>
                <li className="ml-5 list-disc pl-1">security obligations</li>
                <li className="ml-5 list-disc pl-1">data protection requirements</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Use of WhatsNexus does not automatically make a Customer compliant with any particular healthcare, privacy, financial, legal, or industry-specific regulatory framework.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Customers should implement appropriate human oversight and organizational controls when using WhatsNexus for sensitive or regulated communications.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>19. Governing Law and Dispute Resolution</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>These Terms are governed by the laws of <strong className={strong}>India</strong>, without regard to conflict-of-law principles.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Subject to applicable law, courts located in <strong className={strong}>Tamil Nadu, India</strong> will have exclusive jurisdiction over disputes arising from or relating to these Terms or use of WhatsNexus.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Where required by applicable law, Customers retain any mandatory rights or remedies available to them.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>20. Changes to These Terms</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We may update these Terms from time to time.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Updates may be made to reflect:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">new platform features</li>
                <li className="ml-5 list-disc pl-1">new integrations</li>
                <li className="ml-5 list-disc pl-1">technical changes</li>
                <li className="ml-5 list-disc pl-1">security changes</li>
                <li className="ml-5 list-disc pl-1">changes to third-party platforms</li>
                <li className="ml-5 list-disc pl-1">changes to our business operations</li>
                <li className="ml-5 list-disc pl-1">changes to the collaboration between Invictus Global Tech and Kingpin Ventures</li>
                <li className="ml-5 list-disc pl-1">legal or regulatory requirements</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Updated Terms will be posted on this page and the <strong className={strong}>“Last Updated”</strong> date will be revised accordingly.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Where required by applicable law, we may provide additional notice of material changes.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Continued use of the Platform after updated Terms become effective constitutes acceptance of the updated Terms, to the extent permitted by applicable law.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>21. General Provisions</h2>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>21.1 Entire Agreement</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>These Terms, together with applicable:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">Privacy Policy</li>
                <li className="ml-5 list-disc pl-1">subscription terms</li>
                <li className="ml-5 list-disc pl-1">order forms</li>
                <li className="ml-5 list-disc pl-1">commercial agreements</li>
                <li className="ml-5 list-disc pl-1">other expressly incorporated policies</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>constitute the applicable agreement concerning use of WhatsNexus unless otherwise agreed in writing.</p>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>21.2 Severability</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>If any provision of these Terms is found unenforceable, the remaining provisions will continue in effect to the extent permitted by law.</p>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>21.3 Waiver</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Failure to enforce a provision of these Terms does not constitute a waiver of that provision.</p>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>21.4 Assignment</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Customer may not assign or transfer its rights or obligations under these Terms without prior written authorization where required.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>WhatsNexus-related rights or obligations may be assigned or transferred as part of a business restructuring, merger, acquisition, partnership arrangement, asset transfer, or similar transaction, subject to applicable law and contractual obligations.</p>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>21.5 No Transfer of Customer Assets</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Nothing in these Terms transfers ownership of a Customer&apos;s Meta Business Portfolio, WhatsApp Business Account, business phone numbers, Customer Data, contacts, or other Customer-controlled business assets to Invictus Global Tech or Kingpin Ventures.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>22. Contact</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>For questions regarding these Terms, WhatsNexus, privacy matters, or account-related requests, contact:</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>WhatsNexus</strong></p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Operated and supported through the business collaboration between:</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>Invictus Global Tech</strong></p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>and</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>Kingpin Ventures</strong></p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Email: <a href="mailto:sushilathithiyaa@gmail.com" className="underline underline-offset-2 text-emerald-500">sushilathithiyaa@gmail.com</a></p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Address:<br />LIG 13/19, NH3<br />Vanjinathan Street<br />Maraimalai Nagar<br />Chennai – 603209<br />India</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>23. Platform and Business Information</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>Platform:</strong> WhatsNexus</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>Business Partners:</strong><br />Invictus Global Tech<br />Kingpin Ventures</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>Platform Relationship:</strong> WhatsNexus is developed, operated, administered, maintained, and supported through the business collaboration between Invictus Global Tech and Kingpin Ventures according to their respective responsibilities.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>Meta / WhatsApp Business Platform Integration:</strong> Relevant Meta and WhatsApp Business Platform integration activities may be supported or administered through the Meta Business Portfolio associated with Kingpin Ventures as part of the business partners&apos; operation and support of WhatsNexus.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>WhatsNexus, Invictus Global Tech, and Kingpin Ventures are independent from <strong className={strong}>Meta Platforms, Inc.</strong> and <strong className={strong}>WhatsApp LLC</strong>.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Meta, WhatsApp, and related names and trademarks belong to their respective owners.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Use of WhatsNexus with the WhatsApp Business Platform remains subject to applicable:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">Meta terms</li>
                <li className="ml-5 list-disc pl-1">WhatsApp terms</li>
                <li className="ml-5 list-disc pl-1">Meta platform policies</li>
                <li className="ml-5 list-disc pl-1">WhatsApp Business policies</li>
                <li className="ml-5 list-disc pl-1">messaging policies</li>
                <li className="ml-5 list-disc pl-1">technical requirements</li>
                <li className="ml-5 list-disc pl-1">permissions</li>
                <li className="ml-5 list-disc pl-1">third-party platform rules</li>
                </ul>

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
