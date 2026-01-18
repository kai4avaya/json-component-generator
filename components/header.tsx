"use client";

import Link from "next/link";
import { HatGlasses } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { SimulationTrigger } from "./simulation-trigger";
import { Tooltip } from "./tooltip";
import { useIncognito } from "./incognito-context";

export function Header() {
  const { isIncognito, toggleIncognito } = useIncognito();

  return (
    <header className="site-header sticky top-0 z-50 backdrop-blur-sm bg-background/80">
      <div className="max-w-5xl mx-auto px-6 h-14 flex justify-between items-center">
     
        <nav className="flex gap-4 items-center text-sm ml-auto">
          <Tooltip content="Run simulation">
            <SimulationTrigger />
          </Tooltip>

          <Tooltip content={isIncognito ? "Exit incognito" : "Incognito (iframe-friendly)"}>
            <button
              type="button"
              onClick={toggleIncognito}
              className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label={isIncognito ? "Exit incognito" : "Enter incognito"}
            >
              <HatGlasses className="h-[1.2rem] w-[1.2rem]" />
            </button>
          </Tooltip>

          <Tooltip content="Toggle theme">
            <ThemeToggle />
          </Tooltip>
        </nav>
      </div>
    </header>
  );
}
