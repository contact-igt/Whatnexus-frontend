import { CampaignView } from "@/components/views/campaignView";
import { ErrorBoundary } from "@/components/ui/errorBoundary";

export default function CampaignPage() {
  return (
    <ErrorBoundary fallbackTitle="Campaigns unavailable">
      <CampaignView />
    </ErrorBoundary>
  );
}
