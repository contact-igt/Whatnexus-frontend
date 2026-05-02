"use client";

import { useParams } from "next/navigation";
import { CampaignDetailsView } from "@/components/views/campaignDetailsView";

export default function CampaignDetailsPage() {
    const params = useParams();
    const campaignId = params?.id as string;
    return <CampaignDetailsView campaignId={campaignId} />;
}
