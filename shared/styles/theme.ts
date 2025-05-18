/**
 * 테마 및 색상 정의
 *
 * 애플리케이션 전체에서 사용할 색상 및 디자인 값을 정의합니다.
 * 미니멀한 디자인 미학과 파스텔 색상 강조를 따릅니다.
 */

// 색상 팔레트
export const colors = {
  // 주요 색상
  primary: {
    main: "#4A90E2",
    light: "#6BAAFF",
    dark: "#3570B2",
    contrast: "#FFFFFF",
  },

  // 보조 색상
  secondary: {
    main: "#F8BBD0",
    light: "#FFF0F5",
    dark: "#E899B3",
    contrast: "#333333",
  },

  // 성공, 오류, 경고, 정보 상태 색상
  success: {
    main: "#4CAF50",
    light: "#A5D6A7",
    dark: "#388E3C",
    contrast: "#FFFFFF",
  },

  error: {
    main: "#F44336",
    light: "#FFCDD2",
    dark: "#D32F2F",
    contrast: "#FFFFFF",
  },

  warning: {
    main: "#FFC107",
    light: "#FFECB3",
    dark: "#FFA000",
    contrast: "#333333",
  },

  info: {
    main: "#2196F3",
    light: "#BBDEFB",
    dark: "#1976D2",
    contrast: "#FFFFFF",
  },

  // 중립 색상
  neutral: {
    main: "#9E9E9E",
    light: "#E0E0E0",
    dark: "#616161",
    contrast: "#FFFFFF",
  },

  // 파스텔 색상 강조
  pastel: {
    blue: "#BBDEFB",
    pink: "#F8BBD0",
    green: "#C8E6C9",
    purple: "#E1BEE7",
    yellow: "#FFF9C4",
    orange: "#FFCCBC",
  },

  // 텍스트 색상
  text: {
    primary: "#212121",
    secondary: "#757575",
    disabled: "#9E9E9E",
    hint: "#BDBDBD",
  },

  // 배경 색상
  background: {
    default: "#F5F5F5",
    paper: "#FFFFFF",
    light: "#FAFAFA",
    dark: "#F0F0F0",
  },

  // 테두리 색상
  border: {
    light: "#E0E0E0",
    medium: "#BDBDBD",
    dark: "#9E9E9E",
  },
};

// 간격
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// 그림자
export const shadows = {
  none: "none",
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

// 반경
export const borderRadius = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 500,
};

// 반응형 중단점
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
};

// z-index 값
export const zIndex = {
  mobileStepper: 1000,
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500,
};

// 애니메이션 지속 시간
export const transitions = {
  short: "0.15s",
  medium: "0.3s",
  long: "0.5s",
};

// 테마 객체
const theme = {
  colors,
  spacing,
  shadows,
  borderRadius,
  breakpoints,
  zIndex,
  transitions,
};

export default theme;
