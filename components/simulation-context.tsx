"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface SimulationContextType {
  triggerSimulation: () => void;
  simulationTriggered: number; // Use a counter to allow re-triggering
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [simulationTriggered, setSimulationTriggered] = useState(0);

  const triggerSimulation = useCallback(() => {
    setSimulationTriggered((prev) => prev + 1);
  }, []);

  return (
    <SimulationContext.Provider value={{ triggerSimulation, simulationTriggered }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error("useSimulation must be used within a SimulationProvider");
  }
  return context;
}
