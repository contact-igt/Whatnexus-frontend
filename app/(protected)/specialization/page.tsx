import { SpecializationView } from "@/components/views/specialization/specializationView";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Specializations | WhatNexus",
    description: "Manage medical specializations.",
};

export default function SpecializationsPage() {
    return <SpecializationView />;
}
