import React from "react";
import { useResponsive } from "../hooks/useResponsive";

interface BreakpointDisplayProps {
  show?: boolean;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  showDetails?: boolean;
}

/**
 * 현재 브레이크포인트를 시각적으로 표시하는 디버깅 컴포넌트
 * 개발 중 반응형 디자인 확인용으로 사용
 *
 * @example
 * <BreakpointDisplay show={true} position="bottom-right" showDetails={true} />
 */
const BreakpointDisplay: React.FC<BreakpointDisplayProps> = ({
  show = true,
  position = "bottom-right",
  showDetails = false,
}) => {
  const { breakpoint, width, height, isMobile, isTablet, isDesktop } = useResponsive();

  if (!show) return null;

  // 위치에 따른 스타일 클래스
  let positionClass = "";
  switch (position) {
    case "top-left":
      positionClass = "top-2 left-2";
      break;
    case "top-right":
      positionClass = "top-2 right-2";
      break;
    case "bottom-left":
      positionClass = "bottom-2 left-2";
      break;
    case "bottom-right":
    default:
      positionClass = "bottom-2 right-2";
      break;
  }

  // 브레이크포인트에 따른 색상
  const colorClass =
    breakpoint === "xs"
      ? "bg-red-500"
      : breakpoint === "sm"
      ? "bg-orange-500"
      : breakpoint === "md"
      ? "bg-yellow-500"
      : breakpoint === "lg"
      ? "bg-green-500"
      : breakpoint === "xl"
      ? "bg-blue-500"
      : "bg-purple-500"; // 2xl

  return (
    <div className={`fixed ${positionClass} z-50 flex flex-col items-end`}>
      {showDetails && (
        <div className="mb-2 bg-gray-800 text-white text-xs p-2 rounded shadow">
          <div>Width: {width}px</div>
          <div>Height: {height}px</div>
          <div>
            Type:
            {isMobile && " Mobile"}
            {isTablet && " Tablet"}
            {isDesktop && " Desktop"}
          </div>
        </div>
      )}

      <div
        className={`${colorClass} text-white text-xs font-bold py-1 px-2 rounded shadow flex items-center`}
      >
        {breakpoint}
      </div>
    </div>
  );
};

export default BreakpointDisplay;
