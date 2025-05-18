import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import theme from "../styles/theme";
import typography from "../styles/typography";

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  helperStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
  variant?: "outlined" | "filled" | "underlined";
  fullWidth?: boolean;
  disabled?: boolean;
}

/**
 * 입력 필드 컴포넌트
 */
const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  labelStyle,
  helperStyle,
  errorStyle,
  variant = "outlined",
  fullWidth = false,
  value,
  onFocus,
  onBlur,
  disabled = false,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // 포커스 이벤트 핸들러
  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  // 블러 이벤트 핸들러
  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  // 컨테이너 스타일
  const containerStyles = [styles.container, fullWidth && styles.fullWidth, containerStyle];

  // 입력 필드 래퍼 스타일
  const inputWrapperStyles = [
    styles.inputWrapper,
    styles[`${variant}Wrapper`],
    isFocused && styles[`${variant}WrapperFocused`],
    error && styles.errorWrapper,
    fullWidth && styles.fullWidth,
    disabled && styles.disabledWrapper,
  ];

  // 입력 필드 스타일
  const inputStyles = [
    styles.input,
    leftIcon && styles.inputWithLeftIcon,
    rightIcon && styles.inputWithRightIcon,
    variant === "filled" && styles.filledInput,
    isFocused && styles.inputFocused,
    disabled && styles.disabledInput,
    inputStyle,
  ] as StyleProp<TextStyle>;

  // 라벨 스타일
  const labelStyles = [
    styles.label,
    disabled && styles.disabledLabel,
    labelStyle,
  ] as StyleProp<TextStyle>;

  // 헬퍼 텍스트 스타일
  const helperStyles = [
    styles.helper,
    helper && !error && helperStyle,
    error && styles.error,
    error && errorStyle,
    disabled && styles.disabledHelper,
  ] as StyleProp<TextStyle>;

  return (
    <View style={containerStyles}>
      {label && <Text style={labelStyles}>{label}</Text>}

      <View style={inputWrapperStyles}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={inputStyles}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={disabled ? theme.colors.text.disabled : theme.colors.text.hint}
          editable={!disabled}
          {...rest}
        />

        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={onRightIconPress}
            disabled={!onRightIconPress || disabled}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {(helper || error) && <Text style={helperStyles}>{error || helper}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  outlinedWrapper: {
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    borderRadius: theme.borderRadius.md,
    backgroundColor: "transparent",
  },
  outlinedWrapperFocused: {
    borderColor: theme.colors.primary.main,
  },
  filledWrapper: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.medium,
    borderRadius: theme.borderRadius.sm,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: theme.colors.background.light,
  },
  filledWrapperFocused: {
    borderBottomColor: theme.colors.primary.main,
    backgroundColor: theme.colors.primary.light + "20", // 20% 투명도
  },
  underlinedWrapper: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.medium,
    backgroundColor: "transparent",
  },
  underlinedWrapperFocused: {
    borderBottomColor: theme.colors.primary.main,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: theme.spacing.md,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: theme.colors.text.primary,
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  filledInput: {
    backgroundColor: "transparent",
  },
  inputFocused: {
    color: theme.colors.text.primary,
  },
  helper: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  error: {
    color: theme.colors.error.main,
  },
  errorWrapper: {
    borderColor: theme.colors.error.main,
  },
  leftIcon: {
    paddingLeft: theme.spacing.md,
  },
  rightIcon: {
    paddingRight: theme.spacing.md,
  },
  fullWidth: {
    width: "100%",
  },
  // 비활성화 스타일
  disabledWrapper: {
    borderColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.light,
    opacity: 0.7,
  },
  disabledInput: {
    color: theme.colors.text.disabled,
  },
  disabledLabel: {
    color: theme.colors.text.disabled,
  },
  disabledHelper: {
    color: theme.colors.text.disabled,
  },
});

export default Input;
