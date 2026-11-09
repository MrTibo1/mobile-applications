import { StyleSheet, View } from 'react-native';
import type { HouseholdMember } from '../../services/householdService';
import { Card } from '../primitives/Card';
import { Text } from '../primitives/Text';

interface HouseholdMembersProps {
  members: HouseholdMember[];
  currentUserId: string;
}

export function HouseholdMembers({ members, currentUserId }: HouseholdMembersProps) {
  return (
    <Card>
      <View style={styles.container}>
        <View style={styles.heading}>
          <Text size="lg" weight="bold">Members</Text>
          <Text size="sm" color="#69756F">{members.length}</Text>
        </View>
        {members.map((member) => {
          const isCurrentUser = member.id === currentUserId;
          return (
            <View key={member.id} style={styles.member}>
              <View style={styles.avatar}>
                <Text weight="bold" color="#176B5B">{member.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.memberInfo}>
                <Text weight="medium">{member.name}{isCurrentUser ? ' (you)' : ''}</Text>
                <Text size="sm" color="#69756F">{member.isOwner ? 'Household owner' : 'Member'}</Text>
              </View>
            </View>
          );
        })}
        {members.length === 0 ? <Text size="sm" color="#69756F">No members found.</Text> : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  member: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAF5F1' },
  memberInfo: { flex: 1, gap: 2 },
});
