// 테마 및 스타일 상수
export const theme = {
  colors: {
    primary: {
      main: "var(--primary-main)",
      light: "var(--primary-light)",
      dark: "var(--primary-dark)",
      contrast: "var(--primary-contrast)",
    },
    secondary: {
      main: "var(--secondary-main)",
      light: "var(--secondary-light)",
      dark: "var(--secondary-dark)",
      contrast: "var(--secondary-contrast)",
    },
    text: {
      primary: "var(--text-primary)",
      secondary: "var(--text-secondary)",
      disabled: "var(--text-disabled)",
    },
    background: {
      default: "var(--background-default)",
      paper: "var(--background-paper)",
      light: "var(--background-light)",
    },
    error: {
      main: "var(--error-main)",
      light: "var(--error-light)",
      dark: "var(--error-dark)",
    },
    success: {
      main: "var(--success-main)",
      light: "var(--success-light)",
      dark: "var(--success-dark)",
    },
    info: {
      main: "var(--info-main)",
      light: "var(--info-light)",
      dark: "var(--info-dark)",
    },
    neutral: {
      main: "var(--neutral-main)",
      light: "var(--neutral-light)",
      dark: "var(--neutral-dark)",
    },
    border: {
      light: "var(--border-light)",
      medium: "var(--border-medium)",
    },
    pastel: {
      pink: "var(--pastel-pink)",
      yellow: "var(--pastel-yellow)",
      green: "var(--pastel-green)",
      blue: "var(--pastel-blue)",
      purple: "var(--pastel-purple)",
    },
  },
  borderRadius: {
    sm: "var(--border-radius-sm)",
    md: "var(--border-radius-md)",
    lg: "var(--border-radius-lg)",
  },
  fontSize: {
    xs: "var(--font-size-xs)",
    sm: "var(--font-size-sm)",
    md: "var(--font-size-md)",
    lg: "var(--font-size-lg)",
    xl: "var(--font-size-xl)",
    xxl: "var(--font-size-xxl)",
  },
  spacing: {
    "0.5": "2px",
    "1": "4px",
    "1.5": "6px",
    "2": "8px",
    "2.5": "10px",
    "3": "12px",
    "3.5": "14px",
    "4": "16px",
    "5": "20px",
    "6": "24px",
    "8": "32px",
    "10": "40px",
    "12": "48px",
    "16": "64px",
    "20": "80px",
    "24": "96px",
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
  // 직접 사용되는 테마 유틸리티 함수들
  mediaQueries: {
    sm: `@media (min-width: 640px)`,
    md: `@media (min-width: 768px)`,
    lg: `@media (min-width: 1024px)`,
    xl: `@media (min-width: 1280px)`,
    "2xl": `@media (min-width: 1536px)`,
  },
};

// 편의성 타입
export type Theme = typeof theme;

// 자주 사용되는 스타일 타입
export interface FlexProps {
  alignItems?: "flex-start" | "flex-end" | "center" | "stretch" | "baseline";
  justifyContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly";
  flexDirection?: "row" | "row-reverse" | "column" | "column-reverse";
  flexWrap?: "nowrap" | "wrap" | "wrap-reverse";
  gap?: keyof typeof theme.spacing | string;
}

export interface SpacingProps {
  m?: keyof typeof theme.spacing | string;
  mt?: keyof typeof theme.spacing | string;
  mr?: keyof typeof theme.spacing | string;
  mb?: keyof typeof theme.spacing | string;
  ml?: keyof typeof theme.spacing | string;
  mx?: keyof typeof theme.spacing | string;
  my?: keyof typeof theme.spacing | string;
  p?: keyof typeof theme.spacing | string;
  pt?: keyof typeof theme.spacing | string;
  pr?: keyof typeof theme.spacing | string;
  pb?: keyof typeof theme.spacing | string;
  pl?: keyof typeof theme.spacing | string;
  px?: keyof typeof theme.spacing | string;
  py?: keyof typeof theme.spacing | string;
}

export default theme;
