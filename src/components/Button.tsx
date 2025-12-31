import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.button,
      ...styles[`${size}Button`],
    };

    if (disabled || loading) {
      return { ...baseStyle, ...styles.disabled };
    }

    switch (variant) {
      case 'secondary':
        return { ...baseStyle, ...styles.secondary };
      case 'danger':
        return { ...baseStyle, ...styles.danger };
      case 'ghost':
        return { ...baseStyle, ...styles.ghost };
      default:
        return { ...baseStyle, ...styles.primary };
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      ...styles.text,
      ...styles[`${size}Text`],
    };

    if (variant === 'ghost') {
      return { ...baseStyle, color: COLORS.primary };
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' ? COLORS.primary : COLORS.text} />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.sm,
  },
  smallButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  mediumButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  largeButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.surfaceLight,
  },
  danger: {
    backgroundColor: COLORS.error,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  disabled: {
    backgroundColor: COLORS.surface,
    opacity: 0.5,
  },
  text: {
    color: COLORS.text,
    fontWeight: '600',
  },
  smallText: {
    fontSize: FONT_SIZES.sm,
  },
  mediumText: {
    fontSize: FONT_SIZES.md,
  },
  largeText: {
    fontSize: FONT_SIZES.lg,
  },
});
