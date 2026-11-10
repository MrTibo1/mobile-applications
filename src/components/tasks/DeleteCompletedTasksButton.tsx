import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../primitives/Text';

interface DeleteCompletedTasksButtonProps {
  completedTaskCount: number;
  isDeleting: boolean;
  disabled?: boolean;
  onDelete: () => void;
}

export function DeleteCompletedTasksButton({
  completedTaskCount,
  isDeleting,
  disabled = false,
  onDelete,
}: DeleteCompletedTasksButtonProps) {
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);

  if (completedTaskCount === 0) return null;

  const confirmDelete = () => {
    setIsConfirmationVisible(false);
    onDelete();
  };

  return (
    <>
      <Pressable
        style={[styles.trigger, (isDeleting || disabled) && styles.disabled]}
        onPress={() => setIsConfirmationVisible(true)}
        disabled={isDeleting || disabled}
        accessibilityRole="button"
        accessibilityLabel={`Delete ${completedTaskCount} completed tasks`}
      >
        {isDeleting
          ? <ActivityIndicator size="small" color="#B42318" />
          : <Ionicons name="trash-outline" size={17} color="#B42318" />}
        <Text size="sm" weight="medium" color="#B42318">
          {isDeleting ? 'Deleting…' : `Delete completed (${completedTaskCount})`}
        </Text>
      </Pressable>

      <Modal
        visible={isConfirmationVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsConfirmationVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setIsConfirmationVisible(false)}>
          <Pressable style={styles.dialog} onPress={(event) => event.stopPropagation()}>
            <Text size="lg" weight="bold">Delete completed tasks?</Text>
            <Text color="#52606D">
              This will permanently delete {completedTaskCount} completed {completedTaskCount === 1 ? 'task' : 'tasks'}.
            </Text>
            <View style={styles.actions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setIsConfirmationVisible(false)}
                accessibilityRole="button"
              >
                <Text weight="medium" color="#52606D">Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.deleteButton}
                onPress={confirmDelete}
                disabled={disabled || isDeleting}
                accessibilityRole="button"
                accessibilityState={{ disabled: disabled || isDeleting }}
              >
                <Text weight="bold" color="#FFFFFF">Delete</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: '#FEF3F2' },
  disabled: { opacity: 0.6 },
  backdrop: { flex: 1, backgroundColor: 'rgba(17, 24, 39, 0.4)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  dialog: { width: '100%', maxWidth: 400, padding: 20, gap: 16, borderRadius: 18, backgroundColor: '#FFFFFF', elevation: 10, shadowColor: '#111827', shadowOpacity: 0.18, shadowRadius: 20, shadowOffset: { width: 0, height: 8 } },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 10 },
  cancelButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 14 },
  deleteButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 18, borderRadius: 10, backgroundColor: '#B42318' },
});
