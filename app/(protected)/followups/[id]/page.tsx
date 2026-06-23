import { FollowUpDetailPageView } from "@/components/views/followup-hub/FollowUpDetailPageView";

export default async function FollowUpDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FollowUpDetailPageView followUpId={id} />;
}
