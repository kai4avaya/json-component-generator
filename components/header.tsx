"use client";

import { HatGlasses } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { SimulationTrigger } from "./simulation-trigger";
import { Tooltip } from "./tooltip";
import { useIncognito } from "./incognito-context";

export function Header() {
  const { isIncognito, toggleIncognito } = useIncognito();

  return (
    <>
      <header className="site-header header-normal sticky top-0 z-50 backdrop-blur-sm bg-background/80">
        <div className="max-w-5xl mx-auto px-6 h-14 flex justify-between items-center">
          <nav className="flex gap-4 items-center text-sm ml-auto">
            <Tooltip content="Run simulation">
              <SimulationTrigger />
            </Tooltip>

            <Tooltip content="Enter incognito (iframe-friendly)">
              <button
                type="button"
                onClick={toggleIncognito}
                className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label="Enter incognito"
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

      <header className="site-header header-incognito fixed top-3 right-3 z-50 hidden">
        <Tooltip content="Exit incognito">
          <button
            type="button"
            onClick={toggleIncognito}
            className="p-2 rounded-md bg-transparent hover:bg-accent/40 hover:text-accent-foreground transition-colors"
            aria-label="Exit incognito"
          >
            <HatGlasses className="h-[1.2rem] w-[1.2rem]" />
          </button>
        </Tooltip>
      </header>
    </>
  );
}
