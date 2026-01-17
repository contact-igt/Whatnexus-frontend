"use client";

import React, { useState } from 'react';
import { DemoModal } from './demo-modal';
import { HeaderSection } from './header-section';
import { HeroSection } from './hero-section';
import { VideoDemoSection } from './video-demo-section';
import { NarrativeSection } from './narrative-section';
import { FeatureBurstSection } from './feature-burst-section';
import { CapabilityMatrixSection } from './capability-matrix-section';
import { ApiComparisonSection } from './api-comparison-section';
import { UiPreviewSection } from './ui-preview-section';
import { DataSection } from './data-section';
import { HealthcareSection } from './healthcare-section';
import { UseCasesSection } from './use-cases-section';
import { GovernanceSection } from './governance-section';
import { CtaSection } from './cta-section';
import { FooterSection } from './footer-section';

export default function LandingPage() {
    const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

    return (
        <div className="bg-[#0A0A0B] text-[#FAFAFB] min-h-screen font-['Plus_Jakarta_Sans'] overflow-x-hidden selection:bg-emerald-500/30">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap');
        body { font-family: 'Plus_Jakarta_Sans', sans-serif; scroll-behavior: smooth; }
      `}</style>

            <DemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />

            <HeaderSection onDemoClick={() => setIsDemoModalOpen(true)} />
            <HeroSection onDemoClick={() => setIsDemoModalOpen(true)} />
            <VideoDemoSection />
            <NarrativeSection />
            <FeatureBurstSection />
            <CapabilityMatrixSection />
            <ApiComparisonSection />
            <UiPreviewSection />
            <DataSection />
            <HealthcareSection />
            <UseCasesSection />
            <GovernanceSection />
            <CtaSection onDemoClick={() => setIsDemoModalOpen(true)} />
            <FooterSection />
        </div>
    );
}
