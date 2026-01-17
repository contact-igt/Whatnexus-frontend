import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/provider/provider";
// import { useTheme } from "@/hooks/useTheme";


const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "WhatsNexus - AI Receptionist Hub",
  description: "AI Receptionist Hub for Business Automation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDarkMode = true;
  return (
    <html lang="en">
      <body className={`${jakarta.variable} antialiased`}>
        <Providers>
          {children}  
        </Providers>
      </body>
    </html>
  );
}
