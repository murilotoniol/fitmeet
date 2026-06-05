import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';
import {Eye, EyeSlash} from 'phosphor-react-native';
import {colors} from '../../styles/colors';

type PasswordInputProps = {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

function PasswordInput({
  label,
  placeholder = 'Ex.: joao123',
  value,
  onChangeText,
  error,
  required,
  disabled = false,
  style,
}: PasswordInputProps) {
  const [focused, setFocused] = useState(false);
  const [secureEntry, setSecureEntry] = useState(true);

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
        ]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={secureEntry}
          editable={!disabled}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setSecureEntry(!secureEntry)}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          {secureEntry ? (
            <EyeSlash size={20} color={colors.placeholder} />
          ) : (
            <Eye size={20} color={colors.placeholder} />
          )}
        </TouchableOpacity>
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
    height: 48,
  },
  inputWrapperFocused: {
    borderColor: colors.borderFocus,
  },
  inputWrapperError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.title,
  },
  eyeButton: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    height: '100%',
  },
  error: {
    fontSize: 12,
    color: colors.danger,
  },
});

export {PasswordInput};
