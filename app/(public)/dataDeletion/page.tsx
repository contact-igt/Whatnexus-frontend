import type { Metadata } from "next";
import DataDeletionPage from "@/components/views/dataDeletion/dataDeletion";

export const metadata: Metadata = {
    title: "Data Deletion Instructions | WhatsNexus",
    description:
        "Learn how to request deletion of your data associated with WhatsNexus. Submit a data deletion request to Invictus Global Tech by following the instructions on this page.",
};

export default function DataDeletion() {
    return <DataDeletionPage />;
}
