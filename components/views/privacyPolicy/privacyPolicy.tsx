"use client";

import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FooterSection } from "../landingPage/footerSection";

const LAST_UPDATED = "September 16, 2026";

export default function PrivacyPolicyPage() {
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
                    Privacy Policy
                </h1>
                <p className={cn("text-sm mb-10", muted)}>Last Updated: {LAST_UPDATED}</p>

                <hr className={cn("mb-10", hr)} />

                <p className={cn("text-sm leading-relaxed mb-4", body)}>This Privacy Policy explains how <strong className={strong}>Invictus Global Tech</strong> and <strong className={strong}>Kingpin Ventures</strong>, as business partners involved in the development, operation, administration, support, and delivery of the <strong className={strong}>WhatsNexus Platform</strong>, collect, use, store, process, and share information when you use WhatsNexus.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>WhatsNexus</strong> is an AI-powered messaging automation platform operated through the business partnership between <strong className={strong}>Invictus Global Tech</strong> and <strong className={strong}>Kingpin Ventures</strong>.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>WhatsNexus helps organizations manage customer conversations, qualify leads, automate communication workflows, and connect their businesses to the <strong className={strong}>WhatsApp Business Platform (Cloud API)</strong>.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Invictus Global Tech and Kingpin Ventures collaborate in providing, developing, administering, securing, maintaining, and supporting the WhatsNexus platform and its associated Meta and WhatsApp Business Platform integrations.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>Corporate and Platform Relationship</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>Invictus Global Tech</strong> and <strong className={strong}>Kingpin Ventures</strong> are business partners collaborating in connection with the WhatsNexus platform.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Their activities may include, as applicable:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">development and maintenance of the WhatsNexus software platform</li>
                <li className="ml-5 list-disc pl-1">platform administration and infrastructure</li>
                <li className="ml-5 list-disc pl-1">customer onboarding and support</li>
                <li className="ml-5 list-disc pl-1">Meta and WhatsApp Business Platform integrations</li>
                <li className="ml-5 list-disc pl-1">security and operational monitoring</li>
                <li className="ml-5 list-disc pl-1">technical support</li>
                <li className="ml-5 list-disc pl-1">product development</li>
                <li className="ml-5 list-disc pl-1">service administration</li>
                <li className="ml-5 list-disc pl-1">compliance and platform management</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>The Meta Business Portfolio used to support and administer certain WhatsNexus integrations with Meta and the WhatsApp Business Platform is associated with <strong className={strong}>Kingpin Ventures</strong>.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>WhatsNexus is the public-facing platform and product. For Meta platform integration purposes, WhatsNexus uses a Meta application named “Nexus Connect.” Nexus Connect is the technical application name used for WhatsNexus integrations, not a separate customer-facing service or company.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Invictus Global Tech and Kingpin Ventures may each perform different operational, technical, administrative, or support responsibilities as part of their business partnership relating to WhatsNexus.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>References in this Privacy Policy to <strong className={strong}>“WhatsNexus,” “we,” “us,” or “our”</strong> refer collectively, where applicable, to <strong className={strong}>Invictus Global Tech and Kingpin Ventures</strong> in connection with their respective roles in providing and supporting the WhatsNexus platform.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>This business relationship does not change the ownership of a Customer&apos;s own Meta Business Portfolio, WhatsApp Business Account, phone numbers, contacts, conversations, or other Customer-controlled business assets.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>Data Controller and Business Partnership</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>Kingpin Ventures</strong> is the legal entity responsible for determining the purposes and means of processing personal data received through the Nexus Connect Meta application in connection with the WhatsNexus platform.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>Invictus Global Tech</strong> collaborates with <strong className={strong}>Kingpin Ventures</strong> in developing, operating, maintaining, and supporting WhatsNexus. Where Invictus Global Tech processes personal data on behalf of Kingpin Ventures, it does so in accordance with their respective responsibilities and applicable data protection requirements.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Customer organizations remain responsible for determining the purposes of their own customer communications and the personal data they collect and process through WhatsNexus, subject to applicable law.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>1. Scope</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>This Privacy Policy applies to:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1"><strong className={strong}>Customers (organizations)</strong> that use WhatsNexus and their authorized users, including admins, agents, team members, and other authorized personnel.</li>
                <li className="ml-5 list-disc pl-1"><strong className={strong}>End users / message recipients</strong> who communicate with a Customer through WhatsApp where WhatsNexus is used to manage those communications.</li>
                </ul>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>2. Information We Process</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Depending on how WhatsNexus is configured and used, we may process the following categories of data.</p>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>2.1 Account and Organization Data</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We may process information including:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">Organization name and account settings</li>
                <li className="ml-5 list-disc pl-1">Admin/user names and email addresses</li>
                <li className="ml-5 list-disc pl-1">Authentication and access details</li>
                <li className="ml-5 list-disc pl-1">Role-based access permissions</li>
                </ul>
                <hr className={cn("my-10", hr)} />
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>2.2 WhatsApp Business Platform Data</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>When a Customer connects WhatsApp to WhatsNexus, we may process:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">WhatsApp Business Account identifiers, such as WABA ID</li>
                <li className="ml-5 list-disc pl-1">Phone number identifiers and configuration metadata</li>
                <li className="ml-5 list-disc pl-1">Conversation identifiers and timestamps</li>
                <li className="ml-5 list-disc pl-1">Message delivery and read status events</li>
                <li className="ml-5 list-disc pl-1">Message content, including text and media metadata, as required to provide platform features such as:</li>
                <li className="ml-10 list-disc pl-1">automated responses</li>
                <li className="ml-10 list-disc pl-1">routing</li>
                <li className="ml-10 list-disc pl-1">summaries</li>
                <li className="ml-10 list-disc pl-1">human handover</li>
                <li className="ml-10 list-disc pl-1">follow-ups</li>
                <li className="ml-10 list-disc pl-1">analytics</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>The Customer&apos;s WhatsApp Business Account and related WhatsApp business assets remain associated with and controlled by the Customer, subject to Meta&apos;s and WhatsApp&apos;s applicable terms and policies.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>WhatsNexus may receive authorization from Customers to access permitted WhatsApp Business Account information and functionality through Meta&apos;s APIs in order to provide the services requested by the Customer.</p>
                <hr className={cn("my-10", hr)} />
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>2.3 Contacts and Lead Data (Customer-Controlled)</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We may process:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">Customer-provided phone numbers</li>
                <li className="ml-5 list-disc pl-1">Contact names</li>
                <li className="ml-5 list-disc pl-1">Contact attributes</li>
                <li className="ml-5 list-disc pl-1">Tags</li>
                <li className="ml-5 list-disc pl-1">Segmentation fields</li>
                <li className="ml-5 list-disc pl-1">Other Customer-configured contact information</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Lead-related information derived from conversations may include:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">intent labels</li>
                <li className="ml-5 list-disc pl-1">lead scoring</li>
                <li className="ml-5 list-disc pl-1">engagement indicators</li>
                <li className="ml-5 list-disc pl-1">source tracking</li>
                </ul>
                <hr className={cn("my-10", hr)} />
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>2.4 Knowledge Hub Content (Customer-Provided)</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Content uploaded by Customers to guide AI responses may include:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">Business FAQs</li>
                <li className="ml-5 list-disc pl-1">Product information</li>
                <li className="ml-5 list-disc pl-1">Service descriptions</li>
                <li className="ml-5 list-disc pl-1">Operational procedures</li>
                <li className="ml-5 list-disc pl-1">Business policies</li>
                <li className="ml-5 list-disc pl-1">Customer-provided reference documents</li>
                <li className="ml-5 list-disc pl-1">Other knowledge materials</li>
                </ul>
                <hr className={cn("my-10", hr)} />
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>2.5 Operational, Analytics, and Technical Data</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We may process:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">Activity logs</li>
                <li className="ml-5 list-disc pl-1">Performance and reliability metrics</li>
                <li className="ml-5 list-disc pl-1">System health indicators</li>
                <li className="ml-5 list-disc pl-1">Device and browser information</li>
                <li className="ml-5 list-disc pl-1">Diagnostic logs used for troubleshooting</li>
                <li className="ml-5 list-disc pl-1">Security monitoring information</li>
                <li className="ml-5 list-disc pl-1">Application events</li>
                <li className="ml-5 list-disc pl-1">Integration status information</li>
                </ul>
                <hr className={cn("my-10", hr)} />
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>2.6 Meta and WhatsApp Integration Information</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Where a Customer connects a Meta or WhatsApp Business Account to WhatsNexus, we may process information necessary to establish, operate, and maintain that integration, including:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">Meta Business Portfolio identifiers where applicable</li>
                <li className="ml-5 list-disc pl-1">WhatsApp Business Account identifiers</li>
                <li className="ml-5 list-disc pl-1">WhatsApp business phone number identifiers</li>
                <li className="ml-5 list-disc pl-1">Business configuration information</li>
                <li className="ml-5 list-disc pl-1">Connection and authorization status</li>
                <li className="ml-5 list-disc pl-1">Webhook events received from the WhatsApp Business Platform</li>
                <li className="ml-5 list-disc pl-1">Message template information</li>
                <li className="ml-5 list-disc pl-1">WhatsApp Business profile information</li>
                <li className="ml-5 list-disc pl-1">Other Meta or WhatsApp asset information that the Customer authorizes WhatsNexus to access</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Such information is processed only to the extent required to provide, support, secure, and administer the WhatsNexus integration and related services.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>3. How We Use Information</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We use information to provide, operate, maintain, secure, and improve WhatsNexus.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>This includes providing platform features such as:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">shared inbox</li>
                <li className="ml-5 list-disc pl-1">team collaboration</li>
                <li className="ml-5 list-disc pl-1">campaigns</li>
                <li className="ml-5 list-disc pl-1">follow-ups</li>
                <li className="ml-5 list-disc pl-1">analytics</li>
                <li className="ml-5 list-disc pl-1">operational monitoring</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We may use information to power AI-assisted features, including:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">intent recognition</li>
                <li className="ml-5 list-disc pl-1">automated response generation</li>
                <li className="ml-5 list-disc pl-1">conversation summarization</li>
                <li className="ml-5 list-disc pl-1">lead qualification</li>
                <li className="ml-5 list-disc pl-1">escalation detection</li>
                <li className="ml-5 list-disc pl-1">multilingual understanding</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We may also use information to:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">Route conversations to human agents</li>
                <li className="ml-5 list-disc pl-1">Assign conversations</li>
                <li className="ml-5 list-disc pl-1">Apply tags</li>
                <li className="ml-5 list-disc pl-1">Manage workloads</li>
                <li className="ml-5 list-disc pl-1">Connect Customer-authorized WhatsApp Business Accounts to WhatsNexus</li>
                <li className="ml-5 list-disc pl-1">Send and receive WhatsApp messages on behalf of Customers where authorized</li>
                <li className="ml-5 list-disc pl-1">Receive and process WhatsApp webhook events</li>
                <li className="ml-5 list-disc pl-1">Manage Customer-authorized WhatsApp Business Platform assets and configuration where required</li>
                <li className="ml-5 list-disc pl-1">Manage or assist with WhatsApp message templates where such functionality is enabled</li>
                <li className="ml-5 list-disc pl-1">Maintain the relationship between connected WhatsApp phone numbers and the corresponding Customer organization within WhatsNexus</li>
                <li className="ml-5 list-disc pl-1">Monitor performance and improve reliability, quality, and user experience</li>
                <li className="ml-5 list-disc pl-1">Secure the platform</li>
                <li className="ml-5 list-disc pl-1">Prevent abuse, fraud, misuse, or unauthorized access</li>
                <li className="ml-5 list-disc pl-1">Provide customer support</li>
                <li className="ml-5 list-disc pl-1">Communicate service and product updates</li>
                <li className="ml-5 list-disc pl-1">Troubleshoot technical issues</li>
                <li className="ml-5 list-disc pl-1">Comply with legal obligations</li>
                <li className="ml-5 list-disc pl-1">Enforce applicable policies and agreements</li>
                </ul>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>4. How We Share Information</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We may share information only as necessary to provide, secure, administer, or support the WhatsNexus service.</p>
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>4.1 Meta / WhatsApp</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We may exchange information with <strong className={strong}>Meta Platforms and WhatsApp</strong> as necessary to send and receive messages and manage WhatsApp Business Platform operations through the Cloud API.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>This may include information necessary to:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">authenticate and authorize integrations</li>
                <li className="ml-5 list-disc pl-1">identify authorized WhatsApp Business Accounts</li>
                <li className="ml-5 list-disc pl-1">identify authorized business phone numbers</li>
                <li className="ml-5 list-disc pl-1">send and receive WhatsApp messages</li>
                <li className="ml-5 list-disc pl-1">receive message delivery and read events</li>
                <li className="ml-5 list-disc pl-1">process webhook notifications</li>
                <li className="ml-5 list-disc pl-1">manage authorized WhatsApp Business Platform functionality</li>
                <li className="ml-5 list-disc pl-1">manage message templates</li>
                <li className="ml-5 list-disc pl-1">access authorized business assets</li>
                <li className="ml-5 list-disc pl-1">maintain WhatsApp Business Platform integrations</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Customers remain responsible for complying with Meta&apos;s and WhatsApp&apos;s applicable terms, policies, messaging requirements, and other platform rules.</p>
                <hr className={cn("my-10", hr)} />
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>4.2 Invictus Global Tech and Kingpin Ventures</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>Invictus Global Tech and Kingpin Ventures are business partners in connection with WhatsNexus.</strong></p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Information may be processed by either business partner where necessary for their applicable role in:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">operating WhatsNexus</li>
                <li className="ml-5 list-disc pl-1">developing the platform</li>
                <li className="ml-5 list-disc pl-1">maintaining infrastructure</li>
                <li className="ml-5 list-disc pl-1">administering accounts</li>
                <li className="ml-5 list-disc pl-1">providing customer support</li>
                <li className="ml-5 list-disc pl-1">maintaining Meta and WhatsApp Business Platform integrations</li>
                <li className="ml-5 list-disc pl-1">technical troubleshooting</li>
                <li className="ml-5 list-disc pl-1">maintaining security</li>
                <li className="ml-5 list-disc pl-1">preventing abuse</li>
                <li className="ml-5 list-disc pl-1">product development</li>
                <li className="ml-5 list-disc pl-1">compliance</li>
                <li className="ml-5 list-disc pl-1">service administration</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>The partners process information only where necessary in connection with the operation and provision of WhatsNexus and according to their applicable responsibilities.</p>
                <hr className={cn("my-10", hr)} />
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>4.3 Service Providers</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We may use hosting providers, monitoring systems, analytics services, infrastructure providers, artificial intelligence providers, and other technical vendors that process data on our behalf.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>These providers may provide services such as:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">cloud infrastructure</li>
                <li className="ml-5 list-disc pl-1">database hosting</li>
                <li className="ml-5 list-disc pl-1">application monitoring</li>
                <li className="ml-5 list-disc pl-1">analytics</li>
                <li className="ml-5 list-disc pl-1">system security</li>
                <li className="ml-5 list-disc pl-1">communication infrastructure</li>
                <li className="ml-5 list-disc pl-1">artificial intelligence processing where applicable</li>
                <li className="ml-5 list-disc pl-1">file storage</li>
                <li className="ml-5 list-disc pl-1">logging</li>
                <li className="ml-5 list-disc pl-1">technical support</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We expect service providers processing information on our behalf to use such information only for the services they provide and subject to appropriate contractual, privacy, confidentiality, and security obligations where applicable.</p>
                <hr className={cn("my-10", hr)} />
                <h3 className={cn("text-sm font-bold mb-2 mt-4", strong)}>4.4 Legal and Compliance</h3>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We may disclose information where required by:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">law</li>
                <li className="ml-5 list-disc pl-1">regulation</li>
                <li className="ml-5 list-disc pl-1">court order</li>
                <li className="ml-5 list-disc pl-1">legal process</li>
                <li className="ml-5 list-disc pl-1">government request</li>
                <li className="ml-5 list-disc pl-1">regulatory obligation</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We may also disclose information where reasonably necessary to:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">protect our rights</li>
                <li className="ml-5 list-disc pl-1">protect Customers</li>
                <li className="ml-5 list-disc pl-1">protect users</li>
                <li className="ml-5 list-disc pl-1">investigate abuse or fraud</li>
                <li className="ml-5 list-disc pl-1">maintain platform security</li>
                <li className="ml-5 list-disc pl-1">enforce applicable agreements</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>We do not sell personal data.</strong></p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>5. Data Retention</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We retain information only for as long as reasonably necessary to:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">Provide the WhatsNexus platform and its features</li>
                <li className="ml-5 list-disc pl-1">Maintain Customer accounts</li>
                <li className="ml-5 list-disc pl-1">Maintain Customer-authorized WhatsApp Business Platform integrations</li>
                <li className="ml-5 list-disc pl-1">Maintain security, audit, and operational logs</li>
                <li className="ml-5 list-disc pl-1">Provide customer support</li>
                <li className="ml-5 list-disc pl-1">Troubleshoot technical issues</li>
                <li className="ml-5 list-disc pl-1">Prevent abuse or fraud</li>
                <li className="ml-5 list-disc pl-1">Resolve disputes</li>
                <li className="ml-5 list-disc pl-1">Comply with legal, regulatory, and contractual obligations</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Retention periods may vary depending on:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">Customer configuration</li>
                <li className="ml-5 list-disc pl-1">type of information</li>
                <li className="ml-5 list-disc pl-1">service requirements</li>
                <li className="ml-5 list-disc pl-1">legal requirements</li>
                <li className="ml-5 list-disc pl-1">contractual obligations</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Where a Customer disconnects its WhatsApp Business Account from WhatsNexus, certain integration information may still be retained where necessary for:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">security</li>
                <li className="ml-5 list-disc pl-1">auditing</li>
                <li className="ml-5 list-disc pl-1">fraud prevention</li>
                <li className="ml-5 list-disc pl-1">dispute resolution</li>
                <li className="ml-5 list-disc pl-1">contractual requirements</li>
                <li className="ml-5 list-disc pl-1">regulatory requirements</li>
                <li className="ml-5 list-disc pl-1">legal compliance</li>
                </ul>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>6. Data Deletion and Requests</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Customers may request deletion of data associated with their use of WhatsNexus by contacting us at:</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>sushilathithiyaa@gmail.com</strong></p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>To help us process a request, please include:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">Organization name, if applicable</li>
                <li className="ml-5 list-disc pl-1">WhatsApp number(s) associated with the account</li>
                <li className="ml-5 list-disc pl-1">Account email associated with the request</li>
                <li className="ml-5 list-disc pl-1">The type of deletion requested, such as:</li>
                <li className="ml-10 list-disc pl-1">account</li>
                <li className="ml-10 list-disc pl-1">contacts</li>
                <li className="ml-10 list-disc pl-1">conversations</li>
                <li className="ml-10 list-disc pl-1">uploaded content</li>
                <li className="ml-10 list-disc pl-1">integration information</li>
                <li className="ml-10 list-disc pl-1">all applicable data</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We may verify the identity or authority of the person making the request before processing it.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We will complete deletion or anonymization as required by applicable law and contractual obligations.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Where applicable, disconnecting a Meta or WhatsApp Business Account from WhatsNexus may revoke or terminate WhatsNexus access to certain Meta or WhatsApp assets.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>However, disconnecting an integration does not necessarily delete information that must be retained for:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">legal obligations</li>
                <li className="ml-5 list-disc pl-1">security</li>
                <li className="ml-5 list-disc pl-1">auditing</li>
                <li className="ml-5 list-disc pl-1">fraud prevention</li>
                <li className="ml-5 list-disc pl-1">contractual obligations</li>
                <li className="ml-5 list-disc pl-1">dispute resolution</li>
                <li className="ml-5 list-disc pl-1">compliance requirements</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Customers may also contact us regarding deletion of information associated with their Meta or WhatsApp integration.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>7. Security</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We use reasonable technical and organizational measures designed to protect information.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>These measures may include:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">Role-based access controls</li>
                <li className="ml-5 list-disc pl-1">Secure API integrations</li>
                <li className="ml-5 list-disc pl-1">Monitoring and logging for operational security</li>
                <li className="ml-5 list-disc pl-1">Restricted access to integration credentials</li>
                <li className="ml-5 list-disc pl-1">Authorization controls</li>
                <li className="ml-5 list-disc pl-1">Secure webhook handling</li>
                <li className="ml-5 list-disc pl-1">Tenant-level access controls</li>
                <li className="ml-5 list-disc pl-1">Authentication controls</li>
                <li className="ml-5 list-disc pl-1">Infrastructure security controls</li>
                <li className="ml-5 list-disc pl-1">Logging and monitoring</li>
                <li className="ml-5 list-disc pl-1">Measures designed to prevent unauthorized cross-customer data access</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Where applicable, access to Meta and WhatsApp Business Platform integrations is limited according to operational and technical requirements.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>No system is completely secure.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>While we work to protect information from unauthorized access, loss, alteration, misuse, or disclosure, we cannot guarantee absolute security.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>8. Customer Responsibilities</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Customers are responsible for:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">Ensuring they have appropriate rights and notices to collect and use contact data and message content</li>
                <li className="ml-5 list-disc pl-1">Complying with applicable laws and regulations, including data protection and messaging regulations</li>
                <li className="ml-5 list-disc pl-1">Following WhatsApp Business messaging policies when sending templates and campaigns</li>
                <li className="ml-5 list-disc pl-1">Ensuring users authorized to access WhatsNexus have appropriate permissions</li>
                <li className="ml-5 list-disc pl-1">Maintaining appropriate security for their own accounts and login credentials</li>
                <li className="ml-5 list-disc pl-1">Maintaining appropriate control over their Meta Business Portfolio and WhatsApp Business Account</li>
                <li className="ml-5 list-disc pl-1">Ensuring they have authority to connect any WhatsApp Business Account or phone number to WhatsNexus</li>
                <li className="ml-5 list-disc pl-1">Obtaining any notices, permissions, or consents required for communications with their contacts</li>
                <li className="ml-5 list-disc pl-1">Using WhatsNexus according to applicable agreements and laws</li>
                <li className="ml-5 list-disc pl-1">Using the WhatsApp Business Platform in accordance with applicable Meta and WhatsApp policies</li>
                <li className="ml-5 list-disc pl-1">Reviewing automated or AI-generated communications where appropriate for their business or industry</li>
                </ul>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>9. Healthcare Mode Notice</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>WhatsNexus may be configured for healthcare messaging workflows.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Customers using WhatsNexus for healthcare communications are responsible for ensuring compliance with applicable:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">healthcare privacy requirements</li>
                <li className="ml-5 list-disc pl-1">security requirements</li>
                <li className="ml-5 list-disc pl-1">patient communication requirements</li>
                <li className="ml-5 list-disc pl-1">consent requirements</li>
                <li className="ml-5 list-disc pl-1">medical recordkeeping requirements</li>
                <li className="ml-5 list-disc pl-1">regulatory requirements</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>These requirements may differ depending on the Customer&apos;s jurisdiction.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>WhatsNexus does not automatically make a Customer compliant with any healthcare-specific law or regulatory framework merely because the platform is used for healthcare communications.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Customers should configure and use WhatsNexus according to their own legal, regulatory, organizational, privacy, and information-security requirements.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>10. Children’s Privacy</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>WhatsNexus is designed for business use and is not directed toward children.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Customers must ensure their messaging and data practices comply with applicable age-related privacy requirements and messaging policies.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Where a Customer communicates with minors or processes information relating to minors, that Customer is responsible for ensuring it has any:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">appropriate legal basis</li>
                <li className="ml-5 list-disc pl-1">parental consent</li>
                <li className="ml-5 list-disc pl-1">guardian authorization</li>
                <li className="ml-5 list-disc pl-1">other permission</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>required under applicable law.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>11. Meta and WhatsApp Business Platform Integration</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>WhatsNexus integrates with the <strong className={strong}>WhatsApp Business Platform (Cloud API)</strong> provided by Meta.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Customers may connect their own WhatsApp Business Accounts and business phone numbers to WhatsNexus through Meta-authorized onboarding and authentication processes.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>WhatsNexus does not require Customers to provide their Facebook or Meta account passwords directly to WhatsNexus.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Authentication and authorization involving Meta accounts are handled through Meta-provided authentication and authorization systems.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>As part of the business partnership supporting WhatsNexus, a Meta Business Portfolio associated with <strong className={strong}>Kingpin Ventures</strong> may be used to support or administer relevant WhatsNexus Meta and WhatsApp Business Platform integrations.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>For Meta platform integration purposes, WhatsNexus uses a Meta application named “Nexus Connect.” Nexus Connect is the technical Meta application used to enable authorized Meta and WhatsApp Business Platform functionality for WhatsNexus and is not a separate customer-facing service. This includes customer onboarding, account authorization, messaging, webhook processing, and related integration management. Use of Nexus Connect does not change Customer ownership or control of their own Meta and WhatsApp business assets.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>Invictus Global Tech and Kingpin Ventures collaborate in operating and supporting the WhatsNexus platform and associated integrations.</strong></p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>The use of a Kingpin Ventures Meta Business Portfolio for integration administration does not mean that Kingpin Ventures or Invictus Global Tech owns a Customer&apos;s:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">Meta Business Portfolio</li>
                <li className="ml-5 list-disc pl-1">WhatsApp Business Account</li>
                <li className="ml-5 list-disc pl-1">WhatsApp phone number</li>
                <li className="ml-5 list-disc pl-1">business information</li>
                <li className="ml-5 list-disc pl-1">contacts</li>
                <li className="ml-5 list-disc pl-1">conversations</li>
                <li className="ml-5 list-disc pl-1">Customer-controlled WhatsApp assets</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Customers retain responsibility for and control over their own Meta and WhatsApp business assets, subject to Meta&apos;s and WhatsApp&apos;s applicable terms and policies.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>WhatsNexus accesses Customer WhatsApp Business Platform information and functionality only where authorized and as necessary to provide the requested services.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Meta and WhatsApp operate under their own:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">terms</li>
                <li className="ml-5 list-disc pl-1">privacy policies</li>
                <li className="ml-5 list-disc pl-1">data-processing practices</li>
                <li className="ml-5 list-disc pl-1">messaging policies</li>
                <li className="ml-5 list-disc pl-1">business policies</li>
                <li className="ml-5 list-disc pl-1">platform requirements</li>
                </ul>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>12. Artificial Intelligence Processing</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>WhatsNexus may use artificial intelligence and automated processing to provide functionality including:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">automated response generation</li>
                <li className="ml-5 list-disc pl-1">intent recognition</li>
                <li className="ml-5 list-disc pl-1">conversation summarization</li>
                <li className="ml-5 list-disc pl-1">lead qualification</li>
                <li className="ml-5 list-disc pl-1">categorization</li>
                <li className="ml-5 list-disc pl-1">multilingual understanding</li>
                <li className="ml-5 list-disc pl-1">escalation detection</li>
                <li className="ml-5 list-disc pl-1">knowledge-based responses</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Information processed by AI features may include:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">Customer-provided knowledge materials</li>
                <li className="ml-5 list-disc pl-1">relevant conversation content</li>
                <li className="ml-5 list-disc pl-1">contact context</li>
                <li className="ml-5 list-disc pl-1">business configuration</li>
                <li className="ml-5 list-disc pl-1">Customer-defined instructions</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Customers are responsible for determining whether AI-assisted functionality is appropriate for their use case and for configuring WhatsNexus according to their:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">operational requirements</li>
                <li className="ml-5 list-disc pl-1">legal requirements</li>
                <li className="ml-5 list-disc pl-1">regulatory obligations</li>
                <li className="ml-5 list-disc pl-1">industry requirements</li>
                <li className="ml-5 list-disc pl-1">internal policies</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>AI-generated responses may not always be accurate, complete, or appropriate.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Customers should use suitable human review, escalation, or approval processes where appropriate, particularly for:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">healthcare communications</li>
                <li className="ml-5 list-disc pl-1">financial communications</li>
                <li className="ml-5 list-disc pl-1">legal communications</li>
                <li className="ml-5 list-disc pl-1">regulated industries</li>
                <li className="ml-5 list-disc pl-1">sensitive information</li>
                <li className="ml-5 list-disc pl-1">high-impact decisions</li>
                </ul>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>13. Customer Data and Tenant Separation</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>WhatsNexus is designed as a multi-tenant platform serving multiple Customer organizations.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Customer information is logically associated with the applicable Customer account or organization.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We use access controls and application-level safeguards designed to prevent one Customer from accessing another Customer&apos;s information.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Information associated with individual Customer organizations may include:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">WhatsApp Business Account identifiers</li>
                <li className="ml-5 list-disc pl-1">phone number identifiers</li>
                <li className="ml-5 list-disc pl-1">conversations</li>
                <li className="ml-5 list-disc pl-1">messages</li>
                <li className="ml-5 list-disc pl-1">contacts</li>
                <li className="ml-5 list-disc pl-1">knowledge content</li>
                <li className="ml-5 list-disc pl-1">platform configuration</li>
                <li className="ml-5 list-disc pl-1">AI configuration</li>
                <li className="ml-5 list-disc pl-1">user accounts</li>
                <li className="ml-5 list-disc pl-1">integrations</li>
                <li className="ml-5 list-disc pl-1">Customer settings</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Such information is associated with the applicable Customer organization within WhatsNexus.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Invictus Global Tech and Kingpin Ventures may access Customer information only where reasonably necessary for their respective roles in:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">platform operations</li>
                <li className="ml-5 list-disc pl-1">technical support</li>
                <li className="ml-5 list-disc pl-1">security</li>
                <li className="ml-5 list-disc pl-1">troubleshooting</li>
                <li className="ml-5 list-disc pl-1">service administration</li>
                <li className="ml-5 list-disc pl-1">compliance</li>
                </ul>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>14. International and Third-Party Processing</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Depending on the infrastructure, integrations, service providers, and features used by WhatsNexus, information may be processed using systems or service providers located in jurisdictions different from the Customer or end user.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Where required, we take reasonable measures designed to ensure that service providers processing information on our behalf are subject to appropriate:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">contractual obligations</li>
                <li className="ml-5 list-disc pl-1">privacy requirements</li>
                <li className="ml-5 list-disc pl-1">confidentiality requirements</li>
                <li className="ml-5 list-disc pl-1">security obligations</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Third-party platforms such as Meta and WhatsApp process information according to their own applicable terms and privacy practices.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Customers should review applicable third-party policies where appropriate.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>15. Changes to This Privacy Policy</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>We may update this Privacy Policy from time to time.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Updates will be posted on this page, and the <strong className={strong}>“Last Updated”</strong> date will be revised accordingly.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Changes may be made to reflect:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">new platform functionality</li>
                <li className="ml-5 list-disc pl-1">new integrations</li>
                <li className="ml-5 list-disc pl-1">operational changes</li>
                <li className="ml-5 list-disc pl-1">changes to our business partnership</li>
                <li className="ml-5 list-disc pl-1">legal requirements</li>
                <li className="ml-5 list-disc pl-1">regulatory requirements</li>
                <li className="ml-5 list-disc pl-1">security requirements</li>
                <li className="ml-5 list-disc pl-1">changes to third-party platforms</li>
                </ul>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Where required by applicable law or where changes materially affect how information is processed, we may provide additional notice to Customers.</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>16. Contact</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>For privacy questions, data requests, deletion requests, or questions regarding the WhatsNexus platform, contact:</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>WhatsNexus</strong></p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Operated and supported through the business partnership between:</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>Invictus Global Tech</strong></p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>and</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>Kingpin Ventures</strong></p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Email:</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>sushilathithiyaa@gmail.com</strong></p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Address:</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>LIG 13/19, NH3 Vanjinathan Street Maraimalai Nagar Chennai – 603209 India</p>
                <hr className={cn("my-10", hr)} />
                <h2 className={cn("text-sm font-bold uppercase mb-4 leading-snug", strong)}>17. Platform and Business Information</h2>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>Platform:</strong> WhatsNexus</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>Business Partners:</strong> Invictus Global Tech Kingpin Ventures</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>Platform Relationship:</strong> WhatsNexus is developed, operated, administered, maintained, and supported through the business partnership between Invictus Global Tech and Kingpin Ventures according to their respective business and operational responsibilities.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}><strong className={strong}>Meta / WhatsApp Business Platform Integration:</strong> Relevant Meta and WhatsApp Business Platform integration activities may be administered through the Meta Business Portfolio associated with Kingpin Ventures as part of the partners&apos; operation and support of WhatsNexus.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>WhatsNexus, Invictus Global Tech, and Kingpin Ventures are independent from Meta Platforms, Inc. and WhatsApp LLC.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>WhatsApp and Meta names, trademarks, and related marks belong to their respective owners.</p>
                <p className={cn("text-sm leading-relaxed mb-4", body)}>Use of WhatsNexus with the WhatsApp Business Platform remains subject to applicable:</p>
                <ul className={cn("mt-2 mb-5 space-y-1 text-sm leading-relaxed", body)}>
                <li className="ml-5 list-disc pl-1">Meta terms</li>
                <li className="ml-5 list-disc pl-1">WhatsApp terms</li>
                <li className="ml-5 list-disc pl-1">Meta platform policies</li>
                <li className="ml-5 list-disc pl-1">WhatsApp Business policies</li>
                <li className="ml-5 list-disc pl-1">messaging policies</li>
                <li className="ml-5 list-disc pl-1">permissions</li>
                <li className="ml-5 list-disc pl-1">technical requirements</li>
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

