import { Redirect, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HouseholdHeader } from '../../src/components/household/HouseholdHeader';
import { LoadingState } from '../../src/components/common/LoadingState';
import { HouseholdShellProvider, useHouseholdShell } from '../../src/state/HouseholdShellContext';
import { useAuthStore } from '../../src/state/useAuthStore';
import { OfflineNotice } from '../../src/components/common/OfflineNotice';
import { useNetworkStatus } from '../../src/hooks/useNetworkStatus';
import { StyleSheet, View } from 'react-native';

export default function AppLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.authError);
  const user = useAuthStore((state) => state.user);

  if (isLoading) return <LoadingState />;
  if (authError || !isAuthenticated) return <Redirect href="/login" />;

  return (
    <HouseholdShellProvider key={user?.id ?? 'anonymous'} userId={user?.id ?? null}>
      <AuthenticatedShell />
    </HouseholdShellProvider>
  );
}

function AuthenticatedShell() {
  const user = useAuthStore((state) => state.user);
  const { household } = useHouseholdShell();
  const isOnline = useNetworkStatus();

  return (
    <SafeAreaView style={styles.container}>
      <HouseholdHeader householdName={household?.name ?? null} userName={user?.name} />
      <OfflineNotice isOnline={isOnline} />
      <View style={styles.navigator}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F8F6' },
  navigator: { flex: 1 },
});
