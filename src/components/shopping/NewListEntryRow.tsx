import { StyleSheet, View, type TextInputProps } from 'react-native';
import type { ReactNode } from 'react';
import { Card } from '../primitives/Card';
import { EditableListText } from './EditableListText';

interface NewListEntryRowProps {
  accessibilityLabel: string;
  placeholder?: string;
  maxLength?: number;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  disabled?: boolean;
  onDraftChange: (value: string) => void;
  onCommit: (value: string) => Promise<boolean>;
  trailingAccessory?: (focusInput: () => void) => ReactNode;
}

export function NewListEntryRow({
  accessibilityLabel,
  placeholder = 'New item',
  maxLength = 240,
  autoCapitalize = 'none',
  disabled = false,
  onDraftChange,
  onCommit,
  trailingAccessory,
}: NewListEntryRowProps) {
  return (
    <Card variant="listItem">
      <View style={styles.row}>
        <View style={styles.checkbox} />
        <EditableListText
          value=""
          accessibilityLabel={accessibilityLabel}
          placeholder={placeholder}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          autoFocus
          commitOnBlur={false}
          disabled={disabled}
          onDraftChange={onDraftChange}
          onCommit={onCommit}
          trailingAccessory={trailingAccessory}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 34, flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: { width: 26, height: 26, borderRadius: 7, borderWidth: 2, borderColor: '#8A9691' },
});
