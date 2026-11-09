import { useEffect } from 'react';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { subscribeToAuthChanges } from '../src/services/authService';
import { useAuthStore } from '../src/state/useAuthStore';

export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      unsubscribe = subscribeToAuthChanges(setUser);
    } catch (error) {
      useAuthStore.setState({
        authError: error instanceof Error ? error.message : 'Unable to connect to Supabase.',
        isLoading: false,
      });
    }
    void initialize();
    return unsubscribe;
  }, [initialize, setUser]);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Slot />
    </SafeAreaProvider>
  );
}
