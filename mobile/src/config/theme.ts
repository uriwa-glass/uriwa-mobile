// 모바일 앱 테마 설정
// 웹 버전과 동일한 색상 시스템을 사용합니다.

/**
 * 앱 테마 색상
 * 웹 버전의 variables.css와 동일한 색상 값을 사용합니다.
 */
export const colors = {
  primary: {
    main: "#FF7648", // 웹의 #6200ee에서 변경된 통합 색상
    light: "#FF9B7B", // 웹의 #bb86fc에서 변경된 통합 색상
    dark: "#D35A33", // 웹의 #3700b3에서 변경된 통합 색상
    contrast: "#FFFFFF",
  },
  secondary: {
    main: "#03dac6",
    light: "#66fff9",
    dark: "#00a896",
    contrast: "#000000",
  },
  text: {
    primary: "#3F414E", // 웹의 #212121에서 변경된 통합 색상
    secondary: "#7B7F9E", // 웹의 #757575에서 변경된 통합 색상
    disabled: "#9e9e9e",
  },
  background: {
    default: "#f5f5f5",
    paper: "#ffffff",
    light: "#fafafa",
  },
  error: {
    main: "#B91C1C", // 웹의 #b00020에서 변경된 통합 색상
    light: "#FEE2E2", // 웹의 #ef9a9a에서 변경된 통합 색상
    dark: "#991B1B",
    border: "#F87171", // 추가된 에러 테두리 색상
  },
  success: {
    main: "#00c853",
    light: "#a5d6a7",
    dark: "#2e7d32",
  },
  info: {
    main: "#2196f3",
    light: "#bbdefb",
    dark: "#0d47a1",
  },
  neutral: {
    main: "#757575",
    light: "#e0e0e0",
    dark: "#424242",
  },
  border: {
    light: "#EBEAEC", // 웹의 #e0e0e0에서 변경된 통합 색상
    medium: "#bdbdbd",
  },
  pastel: {
    pink: "#f8bbd0",
    yellow: "#fff9c4",
    green: "#c8e6c9",
    blue: "#bbdefb",
    purple: "#d1c4e9",
  },
};

/**
 * 앱 테마 설정
 */
export const theme = {
  colors,
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  },
  spacing: {
    "0.5": 2,
    "1": 4,
    "1.5": 6,
    "2": 8,
    "2.5": 10,
    "3": 12,
    "3.5": 14,
    "4": 16,
    "5": 20,
    "6": 24,
    "8": 32,
    "10": 40,
    "12": 48,
    "16": 64,
    "20": 80,
    "24": 96,
  },
};

export default theme;
