import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FeedbackMessage } from '../common/FeedbackMessage';
import { InputField } from '../primitives/InputField';
import { Text } from '../primitives/Text';
import { StyledButton } from '../common/StyledButton';

interface ShoppingEntryDialogProps {
  visible: boolean;
  title: string;
  fieldLabel: string;
  placeholder: string;
  submitLabel: string;
  value: string;
  error: string;
  isSaving: boolean;
  onClose: () => void;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
}

export function ShoppingEntryDialog({
  visible,
  title,
  fieldLabel,
  placeholder,
  submitLabel,
  value,
  error,
  isSaving,
  onClose,
  onValueChange,
  onSubmit,
}: ShoppingEntryDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.dialog} onPress={(event) => event.stopPropagation()}>
          <View style={styles.header}>
            <Text size="lg" weight="bold">{title}</Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close dialog">
              <Ionicons name="close" size={24} color="#52606D" />
            </Pressable>
          </View>
          <InputField
            label={fieldLabel}
            value={value}
            onChangeText={onValueChange}
            placeholder={placeholder}
            maxLength={160}
            returnKeyType="done"
            autoCapitalize="sentences"
          />
          <FeedbackMessage message={error} />
          <StyledButton label={submitLabel} onPress={onSubmit} isLoading={isSaving} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(24, 39, 34, 0.42)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  dialog: { width: '100%', maxWidth: 480, padding: 22, gap: 16, borderRadius: 14, backgroundColor: '#FFFFFF', elevation: 8, shadowColor: '#182722', shadowOpacity: 0.12, shadowRadius: 18, shadowOffset: { width: 0, height: 6 } },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
