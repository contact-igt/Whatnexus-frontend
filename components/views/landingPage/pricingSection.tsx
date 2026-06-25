"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Info } from "lucide-react";
import { GlassCard } from "./sharedComponents";

// Pricing calculations & dynamic data structures
export const pricingContent = {
  standard: {
    monthly: "₹2,499",
    quarterly: "₹2,374",
    halfyear: "₹2,249",
    annual: "₹2,083"
  },
  pro: {
    monthly: "₹4,999",
    quarterly: "₹4,749",
    halfyear: "₹4,499",
    annual: "₹4,166"
  }
};

export const comparisonCategories = [
  {
    name: "Communication & Routing",
    features: [
      {
        name: "Staff seats included",
        standard: "5 seats",
        pro: "10 seats",
        enterprise: "Custom / Unlimited",
        tooltip: "Number of staff members who can access the WhatsNexus dashboard simultaneously."
      },
      {
        name: "AI Chat & Templates",
        standard: "✓",
        pro: "✓",
        enterprise: "✓",
        tooltip: "Pre-built templates and AI assistance for chat workflows."
      },
      {
        name: "AI Appointment Booking",
        standard: "✓",
        pro: "✓",
        enterprise: "✓",
        tooltip: "Let patients book appointments and receive automated reminders via WhatsApp."
      },
      {
        name: "Bulk Campaigns",
        standard: "✓",
        pro: "✓",
        enterprise: "✓",
        tooltip: "Broadcast messaging to multiple contacts at once within official Meta API limits."
      },
      {
        name: "Automated Follow-ups",
        standard: "✓",
        pro: "✓",
        enterprise: "✓",
        tooltip: "Schedule auto-messages after appointments or visits."
      },
      {
        name: "Complex Journeys",
        standard: "✗",
        pro: "✗",
        enterprise: "✓",
        tooltip: "Fully customized multi-step interactive patient flows and department routing."
      }
    ]
  },
  {
    name: "Patient & CRM Features",
    features: [
      {
        name: "Lead pool & scoring",
        standard: "✓",
        pro: "✓",
        enterprise: "✓",
        tooltip: "Central patient dashboard with automated scoring based on booking intent."
      },
      {
        name: "10 Custom Attributes",
        standard: "✓",
        pro: "Unlimited",
        enterprise: "Unlimited",
        tooltip: "Additional custom data points you can attach to patient profiles (e.g. blood group, allergies)."
      },
      {
        name: "Number Masking for Privacy",
        standard: "✗",
        pro: "✓",
        enterprise: "✓",
        tooltip: "Hide patient phone numbers from agents to protect privacy."
      }
    ]
  },
  {
    name: "Integrations & Data",
    features: [
      {
        name: "Excel export & import",
        standard: "✓",
        pro: "✓",
        enterprise: "✓",
        tooltip: "Download patient data and import contacts via CSV/Excel spreadsheets."
      },
      {
        name: "Google Sheets Integration",
        standard: "✗",
        pro: "✓",
        enterprise: "✓",
        tooltip: "Automatically sync patient records and leads to Google Sheets in real-time."
      },
      {
        name: "3rd Party Integrations",
        standard: "✗",
        pro: "✓",
        enterprise: "✓",
        tooltip: "Connect with WhatsApp official APIs and popular third-party systems."
      },
      {
        name: "Special Integrations",
        standard: "✗",
        pro: "✗",
        enterprise: "✓",
        tooltip: "Direct sync with custom Hospital Information Systems (HIS), EMR, or HMS databases."
      }
    ]
  },
  {
    name: "Governance, Analytics & Support",
    features: [
      {
        name: "Customized AI Model",
        standard: "✗",
        pro: "✓",
        enterprise: "✓",
        tooltip: "Dedicated AI models trained on your specific healthcare specialty guidelines."
      },
      {
        name: "Roles & Permissions",
        standard: "✗",
        pro: "✓",
        enterprise: "✓",
        tooltip: "Assign different levels of access for admin, coordinators, and doctors."
      },
      {
        name: "Agent & Organisation Analytics",
        standard: "✗",
        pro: "✓",
        enterprise: "✓",
        tooltip: "Detailed performance tracking for agents and overall branch metrics."
      },
      {
        name: "Reports",
        standard: "✗",
        pro: "✓",
        enterprise: "✓",
        tooltip: "Exportable analytics report summaries on chat volumes, CSAT, and response times."
      },
      {
        name: "Special Customizations",
        standard: "✗",
        pro: "✗",
        enterprise: "✓",
        tooltip: "Bespoke platform tailoring and custom development for hospital networks."
      },
      {
        name: "Custom pricing per agent",
        standard: "✗",
        pro: "✗",
        enterprise: "✓",
        tooltip: "Flexible pricing plans tailored around per-agent or per-branch volumes."
      }
    ]
  }
];

export default function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState("monthly"); // monthly | quarterly | halfyear | annual
  const [compareTab, setCompareTab] = useState("standard"); // standard | pro | enterprise
  const [isCompareAllExpanded, setIsCompareAllExpanded] = useState(false);
  const [tableOverflow, setTableOverflow] = useState("hidden");
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "Communication & Routing": true,
    "Patient & CRM Features": true,
    "Integrations & Data": true,
    "Governance, Analytics & Support": true
  });

  const handleToggleCompareAll = () => {
    setIsCompareAllExpanded(!isCompareAllExpanded);
    setTableOverflow("hidden");
  };

  const toggleCategory = (catName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catName]: !prev[catName]
    }));
  };

  return (
    <section className="pricing-section" id="pricing">
      <div className="glow-blob pricing-blob"></div>
      
      <div className="section-heading centered mb-12">
        <p className="eyebrow">Plans and pricing</p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-4 text-center">
          Transparent pricing built for Indian healthcare
        </h2>
        <p className="text-white/60 text-sm max-w-xl mx-auto text-center">
          No per-user billing surprises. All listed prices exclude 18% GST.
        </p>
      </div>
      
      {/* Billing toggle duration */}
      <div className="billing-toggle mb-12 flex justify-center" aria-label="Billing duration">
        <div className="billing-toggle-container">
          {["monthly", "quarterly", "halfyear", "annual"].map((period) => (
            <button 
              key={period}
              className={`billing-option ${billingPeriod === period ? "active" : ""}`} 
              type="button" 
              onClick={() => setBillingPeriod(period)}
            >
              {period === "monthly" && "Monthly"}
              {period === "quarterly" && "3 Months"}
              {period === "halfyear" && "6 Months"}
              {period === "annual" && "Annual"}
            </button>
          ))}
        </div>
      </div>
      
      {/* Pricing Cards Grid */}
      <div className="pricing-grid mb-16">
        <GlassCard className="price-card popular">
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="popular-tag">Most popular</div>
              <h3>Standard</h3>
              <div className="price">{pricingContent.standard[billingPeriod as keyof typeof pricingContent.standard]}</div>
              <span className="price-note">per month (+ 18% GST)</span>
              <ul>
                <li>5 seats</li>
                <li>AI chat & templates</li>
                <li>Bulk campaigns</li>
                <li>Lead pool & scoring</li>
                <li>Appointment booking</li>
                <li>Follow-up</li>
                <li>Excel export and import</li>
                <li>10 custom attributes</li>
              </ul>
            </div>
            <a className="button" href="#contact">Book a demo</a>
          </div>
        </GlassCard>
        
        <GlassCard className="price-card">
          <div className="flex flex-col h-full justify-between font-sans">
            <div>
              <div className="popular-tag opacity-0 pointer-events-none select-none h-[28px] mb-[14px]">Placeholder</div>
              <h3>Pro</h3>
              <div className="price">{pricingContent.pro[billingPeriod as keyof typeof pricingContent.pro]}</div>
              <span className="price-note">per month (+ 18% GST)</span>
              <ul>
                <li>10 seats</li>
                <li>Customized AI model</li>
                <li>Roles & permissions</li>
                <li>Number masking</li>
                <li>3rd party integrations</li>
                <li>Agent & Organisation Analytics</li>
                <li>Reports</li>
              </ul>
            </div>
            <a className="button button-secondary" href="#contact">Book a demo</a>
          </div>
        </GlassCard>
        
        <GlassCard className="price-card">
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="popular-tag opacity-0 pointer-events-none select-none h-[28px] mb-[14px]">Placeholder</div>
              <h3>Enterprise</h3>
              <div className="price custom-price">Custom Pricing</div>
              <span className="price-note">tailored per-agent pricing (+ 18% GST)</span>
              <ul>
                <li>Custom pricing per agent</li>
                <li>Complex journeys</li>
                <li>Special customizations</li>
                <li>Special integrations</li>
              </ul>
            </div>
            <a className="button button-secondary" href="#contact">Request quote</a>
          </div>
        </GlassCard>
      </div>

      {/* Collapsible trigger for comparison table */}
      <div className="compare-all-trigger-wrapper">
        <button 
          className="compare-all-trigger-btn"
          type="button"
          onClick={handleToggleCompareAll}
          aria-expanded={isCompareAllExpanded}
        >
          <span className="compare-all-text">Compare all features</span>
          <span className="compare-all-icon">{isCompareAllExpanded ? "−" : "+"}</span>
        </button>
      </div>

      {/* Comparison Table */}
      <AnimatePresence initial={false}>
        {isCompareAllExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={{ overflow: tableOverflow }}
            onAnimationComplete={() => {
              if (isCompareAllExpanded) {
                setTableOverflow("visible");
              }
            }}
          >
            <div className="PricingCompare-root">
              <h3 className="PricingCompare-title">Compare Features</h3>
              
              <div className="PricingCompare-tabs">
                <button className={`PricingCompare-tab ${compareTab === "standard" ? "active" : ""}`} type="button" onClick={() => setCompareTab("standard")}>Standard</button>
                <button className={`PricingCompare-tab ${compareTab === "pro" ? "active" : ""}`} type="button" onClick={() => setCompareTab("pro")}>Pro</button>
                <button className={`PricingCompare-tab ${compareTab === "enterprise" ? "active" : ""}`} type="button" onClick={() => setCompareTab("enterprise")}>Enterprise</button>
              </div>

              <div className="PricingCompare-table">
                <div className="PricingCompare-row PricingCompare-row--header sticky-table-header">
                  <div className="PricingCompare-cell PricingCompare-cell--feature">Feature</div>
                  <div className={`PricingCompare-cell ${compareTab === "standard" ? "PricingCompare-cell--active" : ""}`}>
                    <div className="header-plan-title">Standard</div>
                    <a className="button button-small header-plan-cta" href="#contact">Book demo</a>
                  </div>
                  <div className={`PricingCompare-cell ${compareTab === "pro" ? "PricingCompare-cell--active" : ""}`}>
                    <div className="header-plan-title">Pro</div>
                    <a className="button button-small header-plan-cta" href="#contact">Book demo</a>
                  </div>
                  <div className={`PricingCompare-cell ${compareTab === "enterprise" ? "PricingCompare-cell--active" : ""}`}>
                    <div className="header-plan-title">Enterprise</div>
                    <a className="button button-small header-plan-cta" href="#contact">Get quote</a>
                  </div>
                </div>

                {comparisonCategories.map((category, catIdx) => {
                  const isExpanded = expandedCategories[category.name];
                  return (
                    <div key={catIdx} className="PricingCompare-category-group">
                      <div 
                        className="PricingCompare-category-header" 
                        onClick={() => toggleCategory(category.name)}
                        role="button"
                        aria-expanded={isExpanded}
                      >
                        <span className="category-title">{category.name}</span>
                        <span className={`category-chevron ${isExpanded ? "expanded" : ""}`}>
                          <ChevronDown size={18} />
                        </span>
                      </div>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            style={{ overflow: "hidden" }}
                          >
                            {category.features.map((f, fIdx) => {
                              const isTooltipActive = activeTooltip === f.name;
                              return (
                                <div 
                                  className="PricingCompare-row" 
                                  key={fIdx}
                                  style={{ zIndex: isTooltipActive ? 50 : 1, position: "relative" }}
                                >
                                  <div className="PricingCompare-cell PricingCompare-cell--feature">
                                    <div className="feature-name-with-tooltip flex items-center gap-1.5">
                                      <span className="feature-text">{f.name}</span>
                                      <button 
                                        type="button"
                                        className="info-trigger text-white/40 hover:text-white transition-colors relative"
                                        aria-label={`More info about ${f.name}`}
                                        onMouseEnter={() => setActiveTooltip(f.name)}
                                        onMouseLeave={() => setActiveTooltip(null)}
                                        onClick={() => setActiveTooltip(activeTooltip === f.name ? null : f.name)}
                                      >
                                        <Info size={13} />
                                        {activeTooltip === f.name && (
                                          <div className="PricingCompare-tooltip" onClick={(e) => e.stopPropagation()}>
                                            {f.tooltip}
                                          </div>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                  <div className={`PricingCompare-cell ${compareTab === "standard" ? "PricingCompare-cell--active" : ""}`}>
                                    {f.standard === "✓" ? <Check size={16} className="text-emerald-400 font-bold mx-auto" /> : f.standard === "✗" ? <span className="text-white/20 mx-auto">—</span> : <span className="mx-auto">{f.standard}</span>}
                                  </div>
                                  <div className={`PricingCompare-cell ${compareTab === "pro" ? "PricingCompare-cell--active" : ""}`}>
                                    {f.pro === "✓" ? <Check size={16} className="text-emerald-400 font-bold mx-auto" /> : f.pro === "✗" ? <span className="text-white/20 mx-auto">—</span> : <span className="mx-auto">{f.pro}</span>}
                                  </div>
                                  <div className={`PricingCompare-cell ${compareTab === "enterprise" ? "PricingCompare-cell--active" : ""}`}>
                                    {f.enterprise === "✓" ? <Check size={16} className="text-emerald-400 font-bold mx-auto" /> : f.enterprise === "✗" ? <span className="text-white/20 mx-auto">—</span> : <span className="mx-auto">{f.enterprise}</span>}
                                  </div>
                                </div>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
