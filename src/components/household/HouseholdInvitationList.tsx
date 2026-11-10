import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { PendingHouseholdInvite } from '../../services/householdService';
import { ListGroup } from '../shopping/ListGroup';
import { Card } from '../primitives/Card';
import { Text } from '../primitives/Text';

interface HouseholdInvitationListProps {
  invites: PendingHouseholdInvite[];
  workingInviteId: string | null;
  disabled?: boolean;
  onRespond: (invite: PendingHouseholdInvite, accept: boolean) => void;
}

export function HouseholdInvitationList({
  invites,
  workingInviteId,
  disabled = false,
  onRespond,
}: HouseholdInvitationListProps) {
  if (invites.length === 0) return null;

  return (
    <Card>
      <Text size="lg" weight="bold">Household invitations</Text>
      <ListGroup>
        {invites.map((invite) => (
          <Card key={invite.inviteId} variant="listItem">
            <View style={styles.row}>
              <View style={styles.details}>
                <Text weight="bold">{invite.householdName}</Text>
                <Text size="sm" color="#52606D">
                  Invited by {invite.inviterUsername} ({invite.inviterEmail})
                </Text>
                <Text size="sm" color="#52606D">
                  Invited {new Date(invite.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.actions}>
                <Pressable
                  style={[styles.action, styles.acceptAction]}
                  onPress={() => onRespond(invite, true)}
                  disabled={disabled || workingInviteId !== null}
                  accessibilityRole="button"
                  accessibilityLabel={`Accept invitation to ${invite.householdName}`}
                  accessibilityState={{ disabled: disabled || workingInviteId !== null, busy: workingInviteId === invite.inviteId }}
                >
                  {workingInviteId === invite.inviteId
                    ? <ActivityIndicator size="small" color="#176B5B" />
                    : <Ionicons name="checkmark" size={22} color="#176B5B" />}
                </Pressable>
                <Pressable
                  style={styles.action}
                  onPress={() => onRespond(invite, false)}
                  disabled={disabled || workingInviteId !== null}
                  accessibilityRole="button"
                  accessibilityLabel={`Ignore invitation to ${invite.householdName}`}
                  accessibilityState={{ disabled: disabled || workingInviteId !== null, busy: workingInviteId === invite.inviteId }}
                >
                  {workingInviteId === invite.inviteId
                    ? <ActivityIndicator size="small" color="#52606D" />
                    : <Ionicons name="close" size={22} color="#52606D" />}
                </Pressable>
              </View>
            </View>
          </Card>
        ))}
      </ListGroup>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  details: { flex: 1, gap: 4 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  action: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EDF2EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptAction: { backgroundColor: '#E6F0EB' },
});
