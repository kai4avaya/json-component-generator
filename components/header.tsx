import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { SimulationTrigger } from "./simulation-trigger";

export function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-sm bg-background/80">
      <div className="max-w-5xl mx-auto px-6 h-14 flex justify-between items-center">
     
        <nav className="flex gap-4 items-center text-sm ml-auto">
          <SimulationTrigger />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
