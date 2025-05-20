import React, { ReactNode } from "react";
import { breakpoints } from "./breakpoints";

type FlexDirection = "row" | "column" | "row-reverse" | "column-reverse";
type JustifyContent =
  | "flex-start"
  | "flex-end"
  | "center"
  | "space-between"
  | "space-around"
  | "space-evenly";
type AlignItems = "flex-start" | "flex-end" | "center" | "stretch" | "baseline";

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  fluid?: boolean; // 전체 너비 사용 여부
  fullHeight?: boolean; // 전체 높이 사용 여부
  padding?: string | number; // 내부 패딩
  maxWidth?: string; // 최대 너비 제한
  minHeight?: string; // 최소 높이 설정
  center?: boolean; // 가로 중앙 정렬
  verticalCenter?: boolean; // 세로 중앙 정렬
  flexDirection?: FlexDirection; // 플렉스 방향
  justifyContent?: JustifyContent; // 가로 정렬
  alignItems?: AlignItems; // 세로 정렬
  gap?: string | number; // 요소 간 간격
  forwardedRef?: React.RefObject<HTMLDivElement>; // ref 전달
}

/**
 * 반응형 컨테이너 컴포넌트
 * 화면 크기에 따라 자동으로 너비와 패딩을 조정하며, 콘텐츠를 센터링합니다.
 *
 * @example
 * <ResponsiveContainer>
 *   <h1>콘텐츠</h1>
 * </ResponsiveContainer>
 *
 * <ResponsiveContainer fluid padding="2rem" center>
 *   <p>유동적인 너비의 중앙 정렬 컨테이너</p>
 * </ResponsiveContainer>
 */
const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = "",
  fluid = false,
  fullHeight = false,
  padding,
  maxWidth,
  minHeight,
  center = false,
  verticalCenter = false,
  flexDirection,
  justifyContent,
  alignItems,
  gap,
  forwardedRef,
}) => {
  // 기본 스타일
  const containerStyle: React.CSSProperties = {
    width: "100%",
    height: fullHeight ? "100%" : "auto",
    minHeight: minHeight,
    margin: center ? "0 auto" : undefined,
    padding: padding !== undefined ? padding : "0 1rem",
    boxSizing: "border-box",
    position: "relative",
  };

  // 플렉스 설정이 있는 경우 스타일 추가
  if (flexDirection || justifyContent || alignItems || verticalCenter || gap) {
    containerStyle.display = "flex";
    containerStyle.flexDirection = flexDirection;
    containerStyle.justifyContent = verticalCenter ? "center" : justifyContent;
    containerStyle.alignItems = verticalCenter ? "center" : alignItems;
    containerStyle.gap = gap;
  }

  // 반응형 최대 너비 설정 (fluid가 아닌 경우)
  if (!fluid) {
    if (maxWidth) {
      containerStyle.maxWidth = maxWidth;
    } else {
      // 브레이크포인트에 따른 기본 최대 너비
      // 클래스 이름으로 처리해서 미디어 쿼리 적용
      className += ` responsive-container`;
    }
  }

  return (
    <div ref={forwardedRef} className={className.trim()} style={containerStyle}>
      {children}
    </div>
  );
};

// 반응형 컨테이너 스타일 생성 (HTML 헤드에 추가해야 함)
export const ResponsiveContainerStyles = `
  .responsive-container {
    max-width: 100%;
    margin-left: auto;
    margin-right: auto;
  }
  
  @media (min-width: ${breakpoints.sm}px) {
    .responsive-container {
      max-width: ${breakpoints.sm - 32}px;
    }
  }
  
  @media (min-width: ${breakpoints.md}px) {
    .responsive-container {
      max-width: ${breakpoints.md - 48}px;
    }
  }
  
  @media (min-width: ${breakpoints.lg}px) {
    .responsive-container {
      max-width: ${breakpoints.lg - 64}px;
    }
  }
  
  @media (min-width: ${breakpoints.xl}px) {
    .responsive-container {
      max-width: ${breakpoints.xl - 96}px;
    }
  }
  
  @media (min-width: ${breakpoints["2xl"]}px) {
    .responsive-container {
      max-width: ${breakpoints["2xl"] - 128}px;
    }
  }
`;

export default ResponsiveContainer;
