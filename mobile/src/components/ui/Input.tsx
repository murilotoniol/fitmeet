import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import {colors} from '../../styles/colors';

type InputProps = {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  editable?: boolean;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  inputStyle?: TextInputProps['style'];
  trailingIcon?: React.ReactNode;
  maxLength?: number;
  autoCapitalize?: TextInputProps['autoCapitalize'];
};

function Input({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  required,
  disabled = false,
  editable = true,
  keyboardType,
  multiline = false,
  numberOfLines,
  style,
  inputStyle,
  trailingIcon,
  maxLength,
  autoCapitalize,
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? ' *' : ''}
        </Text>
      ) : null}
      <View
        style={[
          styles.inputWrapper,
          focused && styles.inputWrapperFocused,
          error ? styles.inputWrapperError : null,
          !editable && styles.inputWrapperDisabled,
        ]}>
        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          editable={editable && !disabled}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
        {trailingIcon ? (
          <View style={styles.trailingIcon}>{trailingIcon}</View>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.title,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
    minHeight: 48,
  },
  inputWrapperFocused: {
    borderColor: colors.borderFocus,
  },
  inputWrapperError: {
    borderColor: colors.danger,
  },
  inputWrapperDisabled: {
    backgroundColor: '#F5F5F5',
    opacity: 0.7,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.title,
  },
  inputMultiline: {
    minHeight: 100,
    paddingTop: 12,
  },
  trailingIcon: {
    paddingRight: 12,
  },
  error: {
    fontSize: 12,
    color: colors.danger,
  },
});

export {Input};
