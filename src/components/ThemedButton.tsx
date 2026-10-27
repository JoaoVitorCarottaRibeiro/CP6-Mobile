/**
 * Botão reutilizável com variações de cor e estado desabilitado.
 */
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../context/ThemeContext';

type Variant = 'primary' | 'success' | 'danger' | 'neutral';

interface ThemedButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function ThemedButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: ThemedButtonProps): React.JSX.Element {
  const { colors } = useTheme();

  const backgroundByVariant: Record<Variant, string> = {
    primary: colors.primary,
    success: colors.success,
    danger: colors.danger,
    neutral: colors.surfaceAlt,
  };

  const textByVariant: Record<Variant, string> = {
    primary: colors.primaryText,
    success: '#FFFFFF',
    danger: '#FFFFFF',
    neutral: colors.text,
  };

  const isInactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isInactive }}
      disabled={isInactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: backgroundByVariant[variant] },
        pressed && !isInactive ? styles.pressed : null,
        isInactive ? styles.disabled : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textByVariant[variant]} />
      ) : (
        <Text style={[styles.label, { color: textByVariant[variant] }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
});
