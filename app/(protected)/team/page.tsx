"use client";
import dynamic from 'next/dynamic';

const TeamManagementView = dynamic(
    () => import('@/components/views/team/teamView').then((m) => ({ default: m.TeamManagementView })),
    { ssr: false }
);

export default function TeamPage() {
    return <TeamManagementView />;
}
