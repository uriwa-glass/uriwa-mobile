import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import theme from "../styles/theme";
import typography from "../styles/typography";

export type ButtonVariant = "primary" | "secondary" | "outline" | "text";
export type ButtonSize = "small" | "medium" | "large";

export interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  title: string;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

/**
 * 기본 버튼 컴포넌트
 */
const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "medium",
  title,
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = "left",
  style,
  textStyle,
  ...rest
}) => {
  // 버튼 스타일
  const buttonStyles = [
    styles.button,
    styles[`${variant}Button`],
    styles[`${size}Button`],
    fullWidth && styles.fullWidth,
    disabled && styles.disabledButton,
    style,
  ];

  // 텍스트 스타일
  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? "white" : theme.colors.primary.main}
        />
      ) : (
        <View style={styles.contentContainer}>
          {icon && iconPosition === "left" && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={textStyles}>{title}</Text>
          {icon && iconPosition === "right" && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    fontWeight: "500",
    textAlign: "center",
  },
  iconLeft: {
    marginRight: theme.spacing.sm,
  },
  iconRight: {
    marginLeft: theme.spacing.sm,
  },
  fullWidth: {
    width: "100%",
  },

  // 버튼 변형
  primaryButton: {
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: theme.spacing.lg,
  },
  secondaryButton: {
    backgroundColor: theme.colors.secondary.main,
    paddingHorizontal: theme.spacing.lg,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colors.primary.main,
    paddingHorizontal: theme.spacing.lg,
  },
  textButton: {
    backgroundColor: "transparent",
    paddingHorizontal: theme.spacing.md,
  },

  // 버튼 크기
  smallButton: {
    height: 32,
    paddingVertical: theme.spacing.xs,
  },
  mediumButton: {
    height: 44,
    paddingVertical: theme.spacing.sm,
  },
  largeButton: {
    height: 56,
    paddingVertical: theme.spacing.md,
  },

  // 텍스트 변형
  primaryText: {
    color: theme.colors.primary.contrast,
    fontWeight: "500",
  },
  secondaryText: {
    color: theme.colors.secondary.contrast,
    fontWeight: "500",
  },
  outlineText: {
    color: theme.colors.primary.main,
    fontWeight: "500",
  },
  textText: {
    color: theme.colors.primary.main,
    fontWeight: "500",
  },

  // 텍스트 크기
  smallText: {
    fontSize: typography.fontSize.sm,
  },
  mediumText: {
    fontSize: typography.fontSize.md,
  },
  largeText: {
    fontSize: typography.fontSize.lg,
  },

  // 비활성화 상태
  disabledButton: {
    backgroundColor: theme.colors.neutral.light,
    borderColor: theme.colors.neutral.light,
    opacity: 0.7,
  },
  disabledText: {
    color: theme.colors.text.disabled,
  },
});

export default Button;
