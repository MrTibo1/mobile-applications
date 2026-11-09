import { useState } from 'react';
import { TextInput, View, StyleSheet, type TextInputProps } from 'react-native';
import { Text } from './Text';

interface InputFieldProps extends Omit<TextInputProps, 'style' | 'value' | 'onChangeText'> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
}

export function InputField({ label, value, onChangeText, error, ...inputProps }: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text size="sm" weight="medium">{label}</Text>
      <TextInput
        {...inputProps}
        value={value}
        onChangeText={onChangeText}
        onFocus={(event) => {
          setIsFocused(true);
          inputProps.onFocus?.(event);
        }}
        onBlur={(event) => {
          setIsFocused(false);
          inputProps.onBlur?.(event);
        }}
        autoCapitalize={inputProps.autoCapitalize ?? 'none'}
        placeholderTextColor="#87948E"
        style={[styles.input, isFocused && styles.inputFocused, error ? styles.inputError : undefined]}
      />
      {error ? <Text size="sm" color="#B42318">{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  input: { minHeight: 48, borderWidth: 1, borderColor: '#D5DED9', borderRadius: 9, paddingHorizontal: 14, paddingVertical: 11, backgroundColor: '#FFFFFF', color: '#182722', fontSize: 16 },
  inputFocused: { borderColor: '#176B5B' },
  inputError: { borderColor: '#B42318' },
});
