import { useEffect, useRef, useState, type ComponentRef, type ReactNode } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { Text } from '../primitives/Text';

interface EditableListTextProps {
  value: string;
  accessibilityLabel: string;
  placeholder?: string;
  maxLength?: number;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoFocus?: boolean;
  commitOnBlur?: boolean;
  disabled?: boolean;
  completed?: boolean;
  onDraftChange?: (value: string) => void;
  onCommit: (value: string) => Promise<boolean>;
  trailingAccessory?: (focusInput: () => void) => ReactNode;
}

export function EditableListText({
  value,
  accessibilityLabel,
  placeholder,
  maxLength = 240,
  autoCapitalize = 'none',
  autoFocus = false,
  commitOnBlur = true,
  disabled = false,
  completed = false,
  onDraftChange,
  onCommit,
  trailingAccessory,
}: EditableListTextProps) {
  const [isEditing, setIsEditing] = useState(autoFocus);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const isCommitting = useRef(false);
  const focusInput = () => inputRef.current?.focus();

  useEffect(() => {
    if (!isEditing && !autoFocus) setDraft(value);
  }, [autoFocus, isEditing, value]);

  useEffect(() => {
    if (isEditing) focusInput();
  }, [isEditing]);

  const commit = async () => {
    if (isCommitting.current) return;
    const cleanValue = draft.trim();
    if (!cleanValue && !autoFocus) {
      setDraft(value);
      setIsEditing(false);
      return;
    }
    if (!autoFocus && cleanValue === value.trim()) {
      setIsEditing(false);
      return;
    }

    isCommitting.current = true;
    const saved = await onCommit(cleanValue);
    isCommitting.current = false;
    if (saved) {
      setDraft(cleanValue);
      setIsEditing(false);
    }
  };

  if (!isEditing) {
    return (
      <Pressable
        style={styles.valueContainer}
        onPress={() => {
          setDraft(value);
          setIsEditing(true);
        }}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <Text weight="medium" style={completed ? styles.completed : undefined}>{value}</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.editor}>
      <TextInput
        ref={inputRef}
        style={[styles.input, completed && styles.completed]}
        value={draft}
        onChangeText={(text) => {
          setDraft(text);
          onDraftChange?.(text);
        }}
        onBlur={() => {
          if (commitOnBlur) void commit();
        }}
        onSubmitEditing={() => void commit()}
        placeholder={placeholder}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
        returnKeyType="done"
        editable={!disabled}
        accessibilityLabel={accessibilityLabel}
      />
      {trailingAccessory?.(focusInput)}
    </View>
  );
}

const styles = StyleSheet.create({
  valueContainer: { flex: 1, minWidth: 0 },
  editor: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, minWidth: 0, paddingVertical: 6, color: '#17312B', fontSize: 16 },
  completed: { textDecorationLine: 'line-through', color: '#748078' },
});
