import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { getHouseholdForUser, type Household } from '../services/householdService';
import { getCachedHousehold, saveCachedHousehold } from '../services/offlineCache';
import { reportNetworkFailure, useNetworkStatus } from '../hooks/useNetworkStatus';

interface HouseholdShellContextValue {
  household: Household | null;
  isLoading: boolean;
  refreshHousehold: () => Promise<Household | null>;
  setHousehold: (household: Household | null) => void;
}

interface HouseholdShellProviderProps extends PropsWithChildren {
  userId: string | null;
}

const HouseholdShellContext = createContext<HouseholdShellContextValue | null>(null);

export function HouseholdShellProvider({ children, userId }: HouseholdShellProviderProps) {
  const isOnline = useNetworkStatus();
  const [household, setHouseholdState] = useState<Household | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setHousehold = useCallback((value: Household | null) => {
    setHouseholdState(value);
    if (userId) void saveCachedHousehold(userId, value);
  }, [userId]);

  const refreshHousehold = useCallback(async () => {
    if (!userId) {
      setHousehold(null);
      setIsLoading(false);
      return null;
    }

    if (!isOnline) {
      const cachedHousehold = await getCachedHousehold(userId);
      setHouseholdState(cachedHousehold);
      return cachedHousehold;
    }

    try {
      const currentHousehold = await getHouseholdForUser(userId);
      setHousehold(currentHousehold);
      return currentHousehold;
    } catch (error) {
      reportNetworkFailure(error);
      throw error;
    }
  }, [isOnline, setHousehold, userId]);

  useEffect(() => {
    if (!userId) {
      setHouseholdState(null);
      setIsLoading(false);
      return undefined;
    }

    let active = true;
    const loadHousehold = async () => {
      const cachedHousehold = await getCachedHousehold(userId);
      if (!active) return;
      setHouseholdState(cachedHousehold);
      if (!isOnline) {
        setIsLoading(false);
        return;
      }

      try {
        const currentHousehold = await getHouseholdForUser(userId);
        if (active) setHousehold(currentHousehold);
      } catch (error) {
        reportNetworkFailure(error);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadHousehold();
    return () => { active = false; };
  }, [isOnline, setHousehold, userId]);

  const value = useMemo(
    () => ({ household, isLoading, refreshHousehold, setHousehold }),
    [household, isLoading, refreshHousehold, setHousehold],
  );

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
