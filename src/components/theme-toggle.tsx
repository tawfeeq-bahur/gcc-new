"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="relative h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 group"
            aria-label="Toggle theme"
        >
            <Sun className="h-5 w-5 text-amber-400 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 absolute" />
            <Moon className="h-5 w-5 text-blue-300 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 absolute" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
