"use client";

import { useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

// Helper function to get initial theme from localStorage
function getInitialTheme(): Theme {
    if (typeof window === "undefined") return "system";

    try {
        const savedTheme = localStorage.getItem("theme") as Theme | null;
        return savedTheme || "system";
    } catch {
        return "system";
    }
}

export function useTheme() {
    // Initialize with the actual saved theme, not "system"
    const [theme, setTheme] = useState<Theme>(getInitialTheme);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const changeTheme = (newTheme: Theme) => {
        console.log("🔄 Changing theme to:", newTheme);
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);

        // Apply theme immediately to DOM
        const root = document.documentElement;
        const isDark = newTheme === "dark" || (newTheme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

        root.classList.remove("light", "dark");
        root.classList.add(isDark ? "dark" : "light");

        console.log("✅ Theme applied immediately:", isDark ? "dark" : "light");
    };

    return { theme, setTheme: changeTheme, mounted };
}
