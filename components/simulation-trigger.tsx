"use client";

import { Play } from "lucide-react";
import { useSimulation } from "./simulation-context";

export function SimulationTrigger() {
  const { triggerSimulation } = useSimulation();

  return (
    <button
      onClick={triggerSimulation}
      className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
      title="Run Simulation"
      aria-label="Run Simulation"
    >
      <Play className="h-[1.2rem] w-[1.2rem]" />
    </button>
  );
}
