import { CampaignDetailsView } from "@/components/views/campaign-details-view";

interface CampaignDetailsPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function CampaignDetailsPage({ params }: CampaignDetailsPageProps) {
    const { id } = await params;
    return <CampaignDetailsView campaignId={id} />;
}
