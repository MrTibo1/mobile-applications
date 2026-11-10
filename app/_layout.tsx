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
    if (
      process.env.NODE_ENV === 'production' &&
      typeof navigator !== 'undefined' &&
      'serviceWorker' in navigator
    ) {
      const manifestUrl = document.querySelector<HTMLLinkElement>('link[rel="manifest"]')?.href;
      if (!manifestUrl) {
        console.error('Unable to register the service worker: PWA manifest link not found.');
      } else {
        void navigator.serviceWorker
          .register(new URL('service-worker.js', manifestUrl))
          .catch((error: unknown) => {
            console.error('Unable to register the service worker.', error);
          });
      }
    }

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
