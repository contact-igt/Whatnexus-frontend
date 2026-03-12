import TermsAndConditionsPage from "@/components/views/termsAndConditions/termsAndConditions";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms & Conditions | WhatsNexus",
    description: "Read our terms and conditions for using the WhatsNexus platform and services.",
};

export default function Page() {
    return <TermsAndConditionsPage />;
}
