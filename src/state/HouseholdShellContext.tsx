import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import type { Household } from '../services/householdService';

interface HouseholdShellContextValue {
  household: Household | null;
  setHousehold: (household: Household | null) => void;
}

const HouseholdShellContext = createContext<HouseholdShellContextValue | null>(null);

export function HouseholdShellProvider({ children }: PropsWithChildren) {
  const [household, setHousehold] = useState<Household | null>(null);
  const value = useMemo(() => ({ household, setHousehold }), [household, setHousehold]);

  return (
    <HouseholdShellContext.Provider value={value}>
      {children}
    </HouseholdShellContext.Provider>
  );
}

export function useHouseholdShell() {
  const context = useContext(HouseholdShellContext);
  if (!context) throw new Error('useHouseholdShell must be used within HouseholdShellProvider.');
  return context;
}
