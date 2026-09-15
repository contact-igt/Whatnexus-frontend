import { GroupDetailView } from "@/components/views/contacts/groups/detail/groupDetailView";

export default async function GroupDetailPage({ searchParams }: {
    searchParams: Promise<{ addMembers?: string }>;
}) {
    const { addMembers } = await searchParams;
    return <GroupDetailView initiallyOpenAddMembers={addMembers === 'true'} />;
}
