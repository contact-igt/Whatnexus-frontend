import { CampaignDetailsView } from "@/components/views/campaignDetailsView";

interface CampaignDetailsPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function CampaignDetailsPage({ params }: CampaignDetailsPageProps) {
    const { id } = await params;
    return <CampaignDetailsView campaignId={id} />;
}
