// 반응형 웹 디자인을 위한 브레이크포인트 정의
// 모바일 퍼스트 접근 방식으로 구성

/**
 * 반응형 디자인 브레이크포인트
 * - xs: 모바일 (0px 이상)
 * - sm: 태블릿 세로 (640px 이상)
 * - md: 태블릿 가로 (768px 이상)
 * - lg: 노트북 (1024px 이상)
 * - xl: 데스크탑 (1280px 이상)
 * - 2xl: 대형 디스플레이 (1536px 이상)
 */
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

export type Breakpoint = keyof typeof breakpoints;

/**
 * 미디어 쿼리 문자열 생성
 * 예시: mediaQuery('sm') => '@media (min-width: 640px)'
 */
export const mediaQuery = (breakpoint: Breakpoint): string => {
  return `@media (min-width: ${breakpoints[breakpoint]}px)`;
};

/**
 * 모든 브레이크포인트에 대한 미디어 쿼리 문자열
 * 스타일 컴포넌트 또는 CSS-in-JS 라이브러리에서 사용
 */
export const mediaQueries = {
  xs: `@media (min-width: ${breakpoints.xs}px)`,
  sm: `@media (min-width: ${breakpoints.sm}px)`,
  md: `@media (min-width: ${breakpoints.md}px)`,
  lg: `@media (min-width: ${breakpoints.lg}px)`,
  xl: `@media (min-width: ${breakpoints.xl}px)`,
  "2xl": `@media (min-width: ${breakpoints["2xl"]}px)`,
};

/**
 * 현재 화면 크기가 지정된 브레이크포인트보다 작은지 확인
 * 예시: isSmallScreen('md') => 화면 너비가 768px 미만이면 true
 */
export const isSmallScreen = (breakpoint: Breakpoint): boolean => {
  if (typeof window === "undefined") return false;
  return window.innerWidth < breakpoints[breakpoint];
};

/**
 * 현재 화면 크기가 지정된 브레이크포인트보다 큰지 확인
 * 예시: isLargeScreen('md') => 화면 너비가 768px 이상이면 true
 */
export const isLargeScreen = (breakpoint: Breakpoint): boolean => {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= breakpoints[breakpoint];
};

/**
 * 현재 화면 크기에 해당하는 브레이크포인트 반환
 * 예시: 화면 너비가 800px인 경우 getCurrentBreakpoint() => 'md'
 */
export const getCurrentBreakpoint = (): Breakpoint => {
  if (typeof window === "undefined") return "xs";

  const width = window.innerWidth;

  if (width >= breakpoints["2xl"]) return "2xl";
  if (width >= breakpoints.xl) return "xl";
  if (width >= breakpoints.lg) return "lg";
  if (width >= breakpoints.md) return "md";
  if (width >= breakpoints.sm) return "sm";
  return "xs";
};

/**
 * 브레이크포인트별 값 반환
 * 화면 크기에 따라 다른 값을 반환해야 할 때 사용
 *
 * 예시:
 * const padding = responsiveValue({
 *   xs: '1rem',
 *   md: '2rem',
 *   xl: '3rem'
 * });
 */
export const responsiveValue = <T>(values: Partial<Record<Breakpoint, T>>): T | undefined => {
  const currentBreakpoint = getCurrentBreakpoint();
  const breakpointOrder: Breakpoint[] = ["xs", "sm", "md", "lg", "xl", "2xl"];

  // 현재 브레이크포인트부터 시작해서 작은 브레이크포인트로 이동하며 값을 찾음
  const index = breakpointOrder.indexOf(currentBreakpoint);
  for (let i = index; i >= 0; i--) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp];
    }
  }

  return undefined;
};

export default breakpoints;
