import { FollowUpDetailPageView } from "@/components/views/followup-hub/FollowUpDetailPageView";

export default function FollowUpHubDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  return <FollowUpDetailPageView followUpId={params.id} />;
}
