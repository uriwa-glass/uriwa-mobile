/**
 * 타이포그래피 스타일 정의
 *
 * 애플리케이션에서 일관된 텍스트 스타일을 사용하기 위한 정의입니다.
 */

import { Platform, TextStyle } from "react-native";

// 기본 폰트 패밀리
const fontFamily = {
  regular: Platform.OS === "ios" ? "Pretendard-Regular" : "Pretendard-Regular",
  medium: Platform.OS === "ios" ? "Pretendard-Medium" : "Pretendard-Medium",
  bold: Platform.OS === "ios" ? "Pretendard-Bold" : "Pretendard-Bold",
  light: Platform.OS === "ios" ? "Pretendard-Light" : "Pretendard-Light",
  thin: Platform.OS === "ios" ? "Pretendard-Thin" : "Pretendard-Thin",
};

// 폰트 크기
const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 36,
  giant: 48,
};

// 폰트 가중치
const fontWeight: { [key: string]: TextStyle["fontWeight"] } = {
  thin: "100",
  extraLight: "200",
  light: "300",
  regular: "normal",
  medium: "500",
  semiBold: "600",
  bold: "bold",
  extraBold: "800",
  black: "900",
};

// 줄 높이
const lineHeight = {
  xs: 1.2,
  sm: 1.4,
  md: 1.5,
  lg: 1.6,
  xl: 1.8,
  xxl: 2,
};

// 문자 간격
const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
  widest: 2,
};

// 텍스트 스타일 변형
const variants = {
  // 제목
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.giant,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.xs,
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.xs,
    letterSpacing: letterSpacing.tight,
  },
  h3: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.sm,
    letterSpacing: letterSpacing.tight,
  },
  h4: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.sm,
    letterSpacing: letterSpacing.normal,
  },
  h5: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.md,
    letterSpacing: letterSpacing.normal,
  },
  h6: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.md,
    letterSpacing: letterSpacing.normal,
  },

  // 본문
  body1: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.lg,
    letterSpacing: letterSpacing.normal,
  },
  body2: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.lg,
    letterSpacing: letterSpacing.normal,
  },

  // 기타
  button: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.md,
    letterSpacing: letterSpacing.wide,
    textTransform: "uppercase" as const,
  },
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.md,
    letterSpacing: letterSpacing.normal,
  },
  overline: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.md,
    letterSpacing: letterSpacing.wider,
    textTransform: "uppercase" as const,
  },
};

// 타이포그래피 객체
const typography = {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  variants,
};

export default typography;
