import React from "react";
import { View, StyleSheet, TouchableOpacity, ViewStyle, StyleProp, Text } from "react-native";
import theme from "../styles/theme";
import typography from "../styles/typography";

export type CardVariant = "elevated" | "outlined" | "filled";

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  title?: string;
  subtitle?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  footer?: React.ReactNode;
}

/**
 * 카드 컴포넌트
 *
 * 컨텐츠를 담는 컨테이너 역할을 하는 카드 컴포넌트입니다.
 */
const Card: React.FC<CardProps> = ({
  children,
  variant = "elevated",
  style,
  onPress,
  title,
  subtitle,
  fullWidth = false,
  disabled = false,
  footer,
}) => {
  // 카드 스타일
  const cardStyles = [
    styles.card,
    styles[variant],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  // Wrapper 컴포넌트 (터치 가능 여부에 따라)
  const CardWrapper = onPress ? TouchableOpacity : View;

  // 추가 props (터치 가능 여부에 따라)
  const wrapperProps = onPress ? { onPress, disabled, activeOpacity: 0.7 } : {};

  return (
    <CardWrapper style={cardStyles} {...wrapperProps}>
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
      <View style={styles.content}>{children}</View>
      {footer && <View style={styles.footer}>{footer}</View>}
    </CardWrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
    backgroundColor: theme.colors.background.default,
    margin: theme.spacing.sm,
  },
  elevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  filled: {
    backgroundColor: theme.colors.background.paper,
  },
  header: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: theme.colors.text.secondary,
  },
  content: {
    padding: theme.spacing.md,
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  fullWidth: {
    width: "100%",
    marginLeft: 0,
    marginRight: 0,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default Card;
