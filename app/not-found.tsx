"use client";

import { NotFoundView } from "@/components/views/notFoundView";
import { useTheme } from "@/hooks/useTheme";

export default function NotFound() {
    const { theme } = useTheme();
    const isDarkMode = theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    return <NotFoundView isDarkMode={isDarkMode} />;
}
