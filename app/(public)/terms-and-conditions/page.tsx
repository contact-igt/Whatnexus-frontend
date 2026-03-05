import TermsAndConditionsPage from "@/components/views/terms-and-conditions/terms-and-conditions";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms & Conditions | WhatsNexus",
    description: "Read our terms and conditions for using the WhatsNexus platform and services.",
};

export default function Page() {
    return <TermsAndConditionsPage />;
}
