"use client";

import { useParams } from "next/navigation";
import { CampaignDetailsView } from "@/components/views/campaignDetailsView";
import { ErrorBoundary } from "@/components/ui/errorBoundary";

export default function CampaignDetailsPage() {
    const params = useParams();
    const campaignId = params?.id as string;
    return (
        <ErrorBoundary fallbackTitle="Campaign details unavailable">
            <CampaignDetailsView campaignId={campaignId} />
        </ErrorBoundary>
    );
}
