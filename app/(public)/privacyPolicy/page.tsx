import type { Metadata } from "next";
import PrivacyPolicyPage from "@/components/views/privacyPolicy/privacyPolicy";

export const metadata: Metadata = {
    title: "Privacy Policy | WhatsNexus",
    description:
        "Read the WhatsNexus Privacy Policy to understand how we collect, use, and protect your personal information.",
};

export default function PrivacyPolicy() {
    return <PrivacyPolicyPage />;
}
