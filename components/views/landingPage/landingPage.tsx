"use client";

import React, { useState } from 'react';
import { DemoModal } from './demoModal';
import { HeaderSection } from './headerSection';
import { HeroSection } from './heroSection';
import { VideoDemoSection } from './videoDemoSection';
import { NarrativeSection } from './narrativeSection';
import { FeatureBurstSection } from './featureBurstSection';
import { CapabilityMatrixSection } from './capabilityMatrixSection';
import { ApiComparisonSection } from './apiComparisonSection';
import { UiPreviewSection } from './uiPreviewSection';
import { DataSection } from './dataSection';
import { HealthcareSection } from './healthcareSection';
import { UseCasesSection } from './useCasesSection';
import { GovernanceSection } from './governanceSection';
import { CtaSection } from './ctaSection';
import { FooterSection } from './footerSection';

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
