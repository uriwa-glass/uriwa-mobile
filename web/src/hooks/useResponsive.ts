import { useState, useEffect } from "react";
import { breakpoints, Breakpoint, getCurrentBreakpoint } from "../styles/breakpoints";

/**
 * 반응형 디자인을 위한 React Hook
 * 화면 크기 변경을 감지하고 현재 브레이크포인트에 따른 값 반환
 *
 * @returns 현재 브레이크포인트, 화면 크기 정보, 유틸리티 함수
 *
 * @example
 * const { breakpoint, isMobile, isTablet, isDesktop, below, above, between } = useResponsive();
 *
 * // 사용 예시
 * if (isMobile) {
 *   // 모바일 전용 로직
 * }
 *
 * if (above('md')) {
 *   // 중간 크기 이상의 화면에서만 렌더링
 * }
 *
 * if (between('sm', 'lg')) {
 *   // 태블릿 크기 화면에서만 렌더링
 * }
 */
export function useResponsive() {
  // 현재 브레이크포인트 상태
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("xs");
  // 화면 크기 정보
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    // 초기화: 서버 사이드 렌더링을 고려하여 window 객체 확인
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setBreakpoint(getCurrentBreakpoint());
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      // 초기 설정
      handleResize();

      // 화면 크기 변경 이벤트 리스너 등록
      window.addEventListener("resize", handleResize);

      // 정리 함수
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  // 브레이크포인트 순서
  const breakpointOrder: Breakpoint[] = ["xs", "sm", "md", "lg", "xl", "2xl"];

  // 특정 브레이크포인트보다 작은 화면인지 확인
  const below = (bp: Breakpoint): boolean => {
    const currentIndex = breakpointOrder.indexOf(breakpoint);
    const targetIndex = breakpointOrder.indexOf(bp);
    return currentIndex < targetIndex;
  };

  // 특정 브레이크포인트보다 크거나 같은 화면인지 확인
  const above = (bp: Breakpoint): boolean => {
    const currentIndex = breakpointOrder.indexOf(breakpoint);
    const targetIndex = breakpointOrder.indexOf(bp);
    return currentIndex >= targetIndex;
  };

  // 두 브레이크포인트 사이의 화면인지 확인
  const between = (start: Breakpoint, end: Breakpoint): boolean => {
    const currentIndex = breakpointOrder.indexOf(breakpoint);
    const startIndex = breakpointOrder.indexOf(start);
    const endIndex = breakpointOrder.indexOf(end);
    return currentIndex >= startIndex && currentIndex <= endIndex;
  };

  // 유용한 플래그들
  const isMobile = below("sm");
  const isTablet = between("sm", "lg");
  const isDesktop = above("lg");

  return {
    // 현재 브레이크포인트
    breakpoint,
    // 화면 크기 정보
    width: dimensions.width,
    height: dimensions.height,
    // 플랫폼 타입 플래그
    isMobile,
    isTablet,
    isDesktop,
    // 유틸리티 함수
    below,
    above,
    between,
    // 원본 브레이크포인트 값
    breakpoints,
  };
}

export default useResponsive;
