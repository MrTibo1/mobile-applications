import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname, type Href } from 'expo-router';
import { useAuthStore } from '../../state/useAuthStore';
import { Text } from '../primitives/Text';

interface HouseholdHeaderProps {
  householdName: string | null;
  userName?: string;
}

const navigationTabs: { label: string; href: Href; activePath: string }[] = [
  { label: 'Overview', href: '/', activePath: '/' },
  { label: 'Tasks', href: '/tasks' as Href, activePath: '/tasks' },
  { label: 'Shopping', href: '/shopping' as Href, activePath: '/shopping' },
];

export function HouseholdHeader({ householdName, userName }: HouseholdHeaderProps) {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      Alert.alert('Unable to log out', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.heading}>
        <View style={styles.titleContainer}>
          <Text size="lg" weight="bold" color="#182722" numberOfLines={1}>{householdName ?? 'Your household'}</Text>
          <Text size="sm" color="#69756F">
            {householdName ? 'Household' : userName ? `Welcome, ${userName}` : 'Home'}
          </Text>
        </View>
        <Pressable
          style={styles.logoutButton}
          onPress={() => { void handleLogout(); }}
          accessibilityRole="button"
          accessibilityLabel="Log out"
        >
          <Ionicons name="log-out-outline" size={20} color="#52645D" />
        </Pressable>
      </View>
      {householdName ? (
        <View style={styles.tabs}>
          {navigationTabs.map((tab) => {
            const isActive = tab.activePath === '/'
              ? pathname === '/'
              : pathname.startsWith(tab.activePath);
            return (
              <Pressable
                key={tab.label}
                style={[styles.tab, isActive && styles.activeTab]}
                onPress={() => router.replace(tab.href)}
                accessibilityRole="button"
                accessibilityLabel={tab.label}
                accessibilityState={{ selected: isActive }}
              >
                <Text
                  size="sm"
                  weight={isActive ? 'bold' : 'medium'}
                  color={isActive ? '#176B5B' : '#69756F'}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 0, gap: 8, backgroundColor: '#F6F8F6' },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  titleContainer: { flex: 1, gap: 2 },
  logoutButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#E9EFEB' },
  tabs: { flexDirection: 'row', gap: 20, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#DDE4E0' },
  tab: { minWidth: 64, minHeight: 42, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#176B5B' },
});
