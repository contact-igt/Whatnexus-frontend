"use client";

import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FooterSection } from "../landingPage/footerSection";

const LAST_UPDATED = "September 15, 2026";

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
                <div className="flex items-start gap-5 mb-4">
                    <div>
                        <h1 className={cn("text-5xl sm:text-6xl font-black tracking-tight leading-none mb-2", strong)}>
                            Data Deletion<br />Instructions
                        </h1>
                        <p className={cn("text-sm", muted)}>Last Updated: {LAST_UPDATED}</p>
                    </div>
                </div>

                <hr className={cn("mb-10 mt-8", hr)} />

                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>WhatsNexus</strong> is an AI-powered messaging automation and customer communication platform developed, operated, supported, and administered through the business collaboration between <strong className={strong}>Invictus Global Tech</strong> and <strong className={strong}>Kingpin Ventures</strong>.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>WhatsNexus helps organizations manage customer conversations, leads, workflows, AI-assisted communications, and integrations with the <strong className={strong}>WhatsApp Business Platform (Cloud API)</strong>.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>As part of this business collaboration, a Meta Business Portfolio associated with <strong className={strong}>Kingpin Ventures</strong> may be used to support or administer relevant WhatsNexus integrations with Meta and the WhatsApp Business Platform.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>If you would like to request deletion of data associated with your use of WhatsNexus, this page explains how to submit a request, what information you should provide, how we verify requests, and what happens after a deletion request is received.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>References on this page to <strong className={strong}>“WhatsNexus,” “we,” “us,” or “our”</strong> refer, where applicable, to <strong className={strong}>Invictus Global Tech and Kingpin Ventures</strong> according to their respective roles in operating and supporting the WhatsNexus platform.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>Quick Summary</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>To request deletion of data associated with WhatsNexus, send an email to:</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><a href="mailto:sushilathithiyaa@gmail.com" className="underline underline-offset-2 text-emerald-500">sushilathithiyaa@gmail.com</a></p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Use the subject:</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>Data Deletion Request</strong></p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Please include:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">your full name</li>
                <li className="ml-5 list-disc pl-1">organisation name, if applicable</li>
                <li className="ml-5 list-disc pl-1">WhatsApp number(s) associated with the request</li>
                <li className="ml-5 list-disc pl-1">WhatsNexus account email</li>
                <li className="ml-5 list-disc pl-1">the type of deletion requested</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>After verifying your identity or authority to make the request, we will process the request in accordance with applicable law, contractual obligations, security requirements, and legitimate recordkeeping requirements.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>1. How to Submit a Deletion Request</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>To request deletion of your data, please send an email to:</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>Email:</strong> <a href="mailto:sushilathithiyaa@gmail.com" className="underline underline-offset-2 text-emerald-500">sushilathithiyaa@gmail.com</a></p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Please use the following subject line:</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>Subject: Data Deletion Request</strong></p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>You may submit a request relating to:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">your WhatsNexus account</li>
                <li className="ml-5 list-disc pl-1">contact information</li>
                <li className="ml-5 list-disc pl-1">conversation information</li>
                <li className="ml-5 list-disc pl-1">uploaded knowledge content</li>
                <li className="ml-5 list-disc pl-1">Meta / WhatsApp integration information</li>
                <li className="ml-5 list-disc pl-1">WhatsApp Business Platform configuration associated with your WhatsNexus account</li>
                <li className="ml-5 list-disc pl-1">other Customer Data processed through WhatsNexus</li>
                </ul>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>2. Information to Include in Your Request</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>To help us identify and process your request efficiently, please include the following details where applicable:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1"><strong className={strong}>Full Name</strong> — your first and last name</li>
                <li className="ml-5 list-disc pl-1"><strong className={strong}>Organisation Name</strong> — the name of your organisation or business</li>
                <li className="ml-5 list-disc pl-1"><strong className={strong}>WhatsApp Number(s)</strong> — WhatsApp number(s) associated with the request</li>
                <li className="ml-5 list-disc pl-1"><strong className={strong}>Account Email</strong> — the email address registered with your WhatsNexus account</li>
                <li className="ml-5 list-disc pl-1"><strong className={strong}>WhatsApp Business Account Information</strong> — where applicable, information that helps identify the connected WhatsApp Business Account</li>
                <li className="ml-5 list-disc pl-1"><strong className={strong}>Type of Deletion Requested</strong></li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>You may request deletion of one or more of the following:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">Account deletion</li>
                <li className="ml-5 list-disc pl-1">Contact data deletion</li>
                <li className="ml-5 list-disc pl-1">Conversation data deletion</li>
                <li className="ml-5 list-disc pl-1">Message-related data deletion</li>
                <li className="ml-5 list-disc pl-1">Knowledge Hub content deletion</li>
                <li className="ml-5 list-disc pl-1">Uploaded document or business content deletion</li>
                <li className="ml-5 list-disc pl-1">Lead data deletion</li>
                <li className="ml-5 list-disc pl-1">Meta / WhatsApp integration data deletion</li>
                <li className="ml-5 list-disc pl-1">WhatsApp Business Account connection removal</li>
                <li className="ml-5 list-disc pl-1">Complete data deletion for all applicable data associated with your account</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>If you are requesting deletion on behalf of an organisation, we may also ask you to confirm that you are authorised to make the request.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>3. Verification Process</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>To protect the privacy and security of Customers, users, and end users, we may need to verify your identity or confirm that you are authorised to make the deletion request before processing it.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Verification may include:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">Verifying your identity using information provided in the request</li>
                <li className="ml-5 list-disc pl-1">Confirming ownership of the account email address</li>
                <li className="ml-5 list-disc pl-1">Confirming access to the WhatsApp number(s) specified</li>
                <li className="ml-5 list-disc pl-1">Confirming your role within the relevant organisation</li>
                <li className="ml-5 list-disc pl-1">Confirming your authority to request deletion of organisation-level data</li>
                <li className="ml-5 list-disc pl-1">Requesting additional information where reasonably necessary</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We will communicate with you using the contact information provided in your request during the verification process.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We may refuse or delay a request where we cannot reasonably verify the identity or authority of the requester.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>4. What Happens After Your Request</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Once your deletion request has been received and verified, we will review the request and determine which information is eligible for deletion, anonymisation, disconnection, or other appropriate action.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Depending on the type of request, this may include deletion or anonymisation of:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">WhatsNexus account information</li>
                <li className="ml-5 list-disc pl-1">user profile information</li>
                <li className="ml-5 list-disc pl-1">contacts</li>
                <li className="ml-5 list-disc pl-1">lead information</li>
                <li className="ml-5 list-disc pl-1">conversations</li>
                <li className="ml-5 list-disc pl-1">message-related records</li>
                <li className="ml-5 list-disc pl-1">uploaded knowledge materials</li>
                <li className="ml-5 list-disc pl-1">AI configuration data</li>
                <li className="ml-5 list-disc pl-1">organisation settings</li>
                <li className="ml-5 list-disc pl-1">integration configuration</li>
                <li className="ml-5 list-disc pl-1">operational data associated with the Customer account</li>
                <li className="ml-5 list-disc pl-1">Meta / WhatsApp integration information where applicable</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Deletion requests will be processed in accordance with:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">applicable data protection and privacy laws</li>
                <li className="ml-5 list-disc pl-1">contractual obligations</li>
                <li className="ml-5 list-disc pl-1">legitimate security requirements</li>
                <li className="ml-5 list-disc pl-1">operational requirements</li>
                <li className="ml-5 list-disc pl-1">legal and regulatory obligations</li>
                </ul>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>5. Meta and WhatsApp Business Platform Data</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>WhatsNexus integrates with the <strong className={strong}>WhatsApp Business Platform (Cloud API)</strong> provided by Meta.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Where a Customer has connected a WhatsApp Business Account to WhatsNexus, the platform may process information such as:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">WhatsApp Business Account identifiers</li>
                <li className="ml-5 list-disc pl-1">WABA IDs</li>
                <li className="ml-5 list-disc pl-1">WhatsApp business phone number identifiers</li>
                <li className="ml-5 list-disc pl-1">configuration metadata</li>
                <li className="ml-5 list-disc pl-1">connection status information</li>
                <li className="ml-5 list-disc pl-1">webhook event information</li>
                <li className="ml-5 list-disc pl-1">message status information</li>
                <li className="ml-5 list-disc pl-1">message template information</li>
                <li className="ml-5 list-disc pl-1">other authorised Meta / WhatsApp Business Platform data</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>As part of the business collaboration supporting WhatsNexus, relevant Meta and WhatsApp integration administration may involve a Meta Business Portfolio associated with <strong className={strong}>Kingpin Ventures</strong>.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>For Meta platform integration purposes, WhatsNexus uses a Meta application named “Nexus Connect.” Nexus Connect is the technical Meta application used to enable authorized Meta and WhatsApp Business Platform functionality for WhatsNexus and is not a separate customer-facing service. This includes customer onboarding, account authorization, messaging, webhook processing, and related integration management. WhatsNexus remains the public-facing platform and product; Nexus Connect is only the technical Meta application name and does not represent a separate company or change Customer ownership or control of their own Meta and WhatsApp business assets.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>A request to delete WhatsNexus data does not automatically delete or transfer ownership of a Customer&apos;s own:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">Meta Business Portfolio</li>
                <li className="ml-5 list-disc pl-1">WhatsApp Business Account</li>
                <li className="ml-5 list-disc pl-1">WhatsApp business phone number</li>
                <li className="ml-5 list-disc pl-1">Meta account</li>
                <li className="ml-5 list-disc pl-1">other Customer-controlled Meta or WhatsApp assets</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Those assets remain subject to the Customer&apos;s control and to applicable Meta and WhatsApp policies.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>6. Disconnecting Meta or WhatsApp Integrations</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Where applicable, a Customer may also request that its WhatsApp Business Platform integration be disconnected from WhatsNexus.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>After disconnection, WhatsNexus may no longer be authorised to access or use the applicable connected WhatsApp Business Account or business phone number for platform functionality.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Disconnection may involve actions such as:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">disabling the connection within WhatsNexus</li>
                <li className="ml-5 list-disc pl-1">revoking or removing applicable integration authorisation</li>
                <li className="ml-5 list-disc pl-1">stopping processing of new WhatsApp webhook events for the disconnected connection where applicable</li>
                <li className="ml-5 list-disc pl-1">preventing WhatsNexus from sending new messages through the disconnected integration</li>
                <li className="ml-5 list-disc pl-1">removing stored integration configuration where appropriate</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Disconnecting WhatsNexus from a Meta or WhatsApp integration does not necessarily delete data directly controlled or retained by Meta or WhatsApp.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Customers may need to use Meta&apos;s or WhatsApp&apos;s own account management tools for information or assets maintained independently by those platforms.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>7. Some Data May Be Retained</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>In some circumstances, certain information may be retained even after a deletion request has been processed.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Information may be retained where reasonably necessary for:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">legal compliance</li>
                <li className="ml-5 list-disc pl-1">regulatory obligations</li>
                <li className="ml-5 list-disc pl-1">security</li>
                <li className="ml-5 list-disc pl-1">fraud prevention</li>
                <li className="ml-5 list-disc pl-1">abuse prevention</li>
                <li className="ml-5 list-disc pl-1">audit requirements</li>
                <li className="ml-5 list-disc pl-1">operational recordkeeping</li>
                <li className="ml-5 list-disc pl-1">financial or tax requirements</li>
                <li className="ml-5 list-disc pl-1">dispute resolution</li>
                <li className="ml-5 list-disc pl-1">enforcement of contractual obligations</li>
                <li className="ml-5 list-disc pl-1">protection of legal rights</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Where appropriate, retained information may be:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">restricted</li>
                <li className="ml-5 list-disc pl-1">archived</li>
                <li className="ml-5 list-disc pl-1">anonymised</li>
                <li className="ml-5 list-disc pl-1">isolated from normal platform use</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We will not retain information longer than reasonably necessary for the applicable purpose.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>8. Processing Timeline</h2>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>Step 1 — Submit Request</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Send your email to:</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><a href="mailto:sushilathithiyaa@gmail.com" className="underline underline-offset-2 text-emerald-500">sushilathithiyaa@gmail.com</a></p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>with the subject:</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>Data Deletion Request</strong></p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>and include the information described above.</p>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>Step 2 — Verification</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We verify your identity and, where applicable, confirm your authority to make the request on behalf of an organisation.</p>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>Step 3 — Review</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We identify the relevant:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">account data</li>
                <li className="ml-5 list-disc pl-1">Customer Data</li>
                <li className="ml-5 list-disc pl-1">conversation data</li>
                <li className="ml-5 list-disc pl-1">contact data</li>
                <li className="ml-5 list-disc pl-1">uploaded information</li>
                <li className="ml-5 list-disc pl-1">integration information</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>covered by the request.</p>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>Step 4 — Deletion, Anonymisation, or Disconnection</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We process the appropriate deletion, anonymisation, integration disconnection, or other applicable action.</p>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>Step 5 — Confirmation</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Where appropriate, we will confirm that the request has been processed or advise you if additional information is required.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We will make reasonable efforts to process verified deletion requests within a <strong className={strong}>commercially reasonable timeframe</strong>.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>The exact processing time may vary depending on:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">the complexity of the request</li>
                <li className="ml-5 list-disc pl-1">the amount of information involved</li>
                <li className="ml-5 list-disc pl-1">the type of deletion requested</li>
                <li className="ml-5 list-disc pl-1">verification requirements</li>
                <li className="ml-5 list-disc pl-1">legal requirements</li>
                <li className="ml-5 list-disc pl-1">technical dependencies</li>
                <li className="ml-5 list-disc pl-1">third-party platform requirements</li>
                </ul>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>9. Organisation and Administrator Requests</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>WhatsNexus is designed for use by organisations and may contain data belonging to or controlled by a Customer organisation.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>An individual user may not always have authority to request deletion of all organisation-level information.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>For example, deletion of:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">an entire organisation account</li>
                <li className="ml-5 list-disc pl-1">all organisation contacts</li>
                <li className="ml-5 list-disc pl-1">all conversations</li>
                <li className="ml-5 list-disc pl-1">organisation-wide knowledge content</li>
                <li className="ml-5 list-disc pl-1">WhatsApp Business Account integrations</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>may require approval from an authorised organisation administrator or account owner.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We may verify administrator or account-owner authority before processing such requests.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>10. End-User and Message Recipient Requests</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>If you are an individual who communicated through WhatsApp with a business using WhatsNexus, the business you communicated with may be the primary organisation responsible for determining how your information is used.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Where appropriate, we may:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">process your request directly where we are able to do so</li>
                <li className="ml-5 list-disc pl-1">request additional information to identify the relevant Customer</li>
                <li className="ml-5 list-disc pl-1">coordinate with the relevant Customer organisation</li>
                <li className="ml-5 list-disc pl-1">direct you to the Customer where the Customer is responsible for the requested action</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>This helps ensure that information is not deleted or disclosed without appropriate authorisation.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>11. Additional Privacy Rights</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Depending on your location and applicable law, you may have additional rights relating to personal data.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>These rights may include the ability to request:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">access to personal data</li>
                <li className="ml-5 list-disc pl-1">correction of inaccurate information</li>
                <li className="ml-5 list-disc pl-1">deletion of personal data</li>
                <li className="ml-5 list-disc pl-1">restriction of processing</li>
                <li className="ml-5 list-disc pl-1">information regarding processing</li>
                <li className="ml-5 list-disc pl-1">other rights available under applicable privacy law</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>The availability and scope of these rights depend on applicable law and the context in which information is processed.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>To exercise any applicable privacy rights, contact:</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><a href="mailto:sushilathithiyaa@gmail.com" className="underline underline-offset-2 text-emerald-500">sushilathithiyaa@gmail.com</a></p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>For full details regarding how WhatsNexus collects, uses, processes, stores, and shares information, please review our:</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><a href="/privacyPolicy" className="underline underline-offset-2 text-emerald-500">Privacy Policy</a></p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>12. Security of Deletion Requests</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We take reasonable measures designed to prevent unauthorised deletion or disclosure of Customer information.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>For this reason, we may not process a deletion request solely based on information contained in an email where we are unable to verify the requester&apos;s identity or authority.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We may request additional verification where necessary to protect:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">Customer accounts</li>
                <li className="ml-5 list-disc pl-1">organisation data</li>
                <li className="ml-5 list-disc pl-1">conversations</li>
                <li className="ml-5 list-disc pl-1">contacts</li>
                <li className="ml-5 list-disc pl-1">WhatsApp Business integrations</li>
                <li className="ml-5 list-disc pl-1">other Customer-controlled information</li>
                </ul>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>13. Business and Platform Relationship</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>WhatsNexus</strong> is developed, operated, supported, and administered through the business collaboration between:</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>Invictus Global Tech</strong></p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>and</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>Kingpin Ventures</strong></p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>The two businesses collaborate in connection with WhatsNexus according to their respective technical, operational, administrative, integration, security, support, and service responsibilities.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>This collaboration may include:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">WhatsNexus platform operations</li>
                <li className="ml-5 list-disc pl-1">product development</li>
                <li className="ml-5 list-disc pl-1">technical infrastructure</li>
                <li className="ml-5 list-disc pl-1">customer support</li>
                <li className="ml-5 list-disc pl-1">security</li>
                <li className="ml-5 list-disc pl-1">Meta and WhatsApp Business Platform integrations</li>
                <li className="ml-5 list-disc pl-1">service administration</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>The description of Invictus Global Tech and Kingpin Ventures as business partners does not, by itself, represent that they have formed a separate legal partnership entity unless expressly stated in a separate legal agreement.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>14. Changes to These Data Deletion Instructions</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We may update these Data Deletion Instructions from time to time.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Updates may be made to reflect:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">changes to WhatsNexus functionality</li>
                <li className="ml-5 list-disc pl-1">changes to privacy requirements</li>
                <li className="ml-5 list-disc pl-1">new integrations</li>
                <li className="ml-5 list-disc pl-1">changes to Meta or WhatsApp platform requirements</li>
                <li className="ml-5 list-disc pl-1">changes to our operational processes</li>
                <li className="ml-5 list-disc pl-1">changes to the business collaboration between Invictus Global Tech and Kingpin Ventures</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Updates will be published on this page, and the <strong className={strong}>“Last Updated”</strong> date will be revised accordingly.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>15. Contact Information</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>For privacy-related questions, data deletion requests, integration removal requests, or other related inquiries, contact:</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>WhatsNexus</strong></p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Operated and supported through the business collaboration between:</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>Invictus Global Tech</strong></p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>and</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>Kingpin Ventures</strong></p>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>Email</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><a href="mailto:sushilathithiyaa@gmail.com" className="underline underline-offset-2 text-emerald-500">sushilathithiyaa@gmail.com</a></p>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>Address</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>LIG 13/19, NH3<br />Vanjinathan Street<br />Maraimalai Nagar<br />Chennai – 603209<br />India</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>Related Policies</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><a href="/privacyPolicy" className="underline underline-offset-2 text-emerald-500">Privacy Policy</a></p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><a href="/termsAndConditions" className="underline underline-offset-2 text-emerald-500">Terms and Conditions</a></p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>Platform Information</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>Platform:</strong> WhatsNexus</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>Business Partners:</strong><br />Invictus Global Tech<br />Kingpin Ventures</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>Meta / WhatsApp Business Platform Integration:</strong> Relevant Meta and WhatsApp Business Platform integration activities may be supported or administered through the Meta Business Portfolio associated with Kingpin Ventures as part of the business partners&apos; operation and support of WhatsNexus.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>WhatsNexus, Invictus Global Tech, and Kingpin Ventures are independent from Meta Platforms, Inc. and WhatsApp LLC.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Meta, WhatsApp, and their respective names, trademarks, and associated marks belong to their respective owners.</p>

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
