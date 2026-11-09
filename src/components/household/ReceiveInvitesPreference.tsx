import { useEffect, useState } from 'react';
import { Switch, StyleSheet, View } from 'react-native';
import { getReceiveInvitesPreference, setReceiveInvitesPreference } from '../../services/householdService';
import { Text } from '../primitives/Text';

export function ReceiveInvitesPreference() {
  const [enabled, setEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void getReceiveInvitesPreference()
      .then((preference) => {
        if (active) setEnabled(preference);
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Unable to load invite preferences.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => { active = false; };
  }, []);

  const handleChange = async (value: boolean) => {
    const previousValue = enabled;
    setEnabled(value);
    setError('');
    try {
      await setReceiveInvitesPreference(value);
    } catch (saveError) {
      setEnabled(previousValue);
      setError(saveError instanceof Error ? saveError.message : 'Unable to update invite preferences.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text weight="bold">Receive household invitations</Text>
          <Text size="sm" color="#52606D">You can change this setting at any time.</Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={handleChange}
          disabled={isLoading}
          accessibilityLabel="Receive household invitations"
          trackColor={{ false: '#CBD2D9', true: '#8FC5B9' }}
          thumbColor={enabled ? '#176B5B' : '#F4F4F5'}
        />
      </View>
      {error ? <Text size="sm" color="#B42318">{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  copy: { flex: 1, gap: 4 },
});
