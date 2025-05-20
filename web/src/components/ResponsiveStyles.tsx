import React, { useEffect } from "react";
import { ResponsiveContainerStyles } from "../styles/ResponsiveContainer";

/**
 * 반응형 디자인에 필요한 전역 스타일을 문서 head에 추가하는 컴포넌트
 * 앱 최상위 컴포넌트에서 한 번만 사용하면 됩니다.
 */
const ResponsiveStyles: React.FC = () => {
  useEffect(() => {
    // 이미 존재하는 스타일 태그가 있는지 확인
    const existingStyle = document.getElementById("responsive-container-styles");
    if (existingStyle) {
      return;
    }

    // 새로운 스타일 태그 생성
    const styleTag = document.createElement("style");
    styleTag.id = "responsive-container-styles";
    styleTag.innerHTML = ResponsiveContainerStyles;
    document.head.appendChild(styleTag);

    // 정리 함수
    return () => {
      const styleToRemove = document.getElementById("responsive-container-styles");
      if (styleToRemove) {
        document.head.removeChild(styleToRemove);
      }
    };
  }, []);

  // 이 컴포넌트는 DOM에 아무것도 렌더링하지 않습니다
  return null;
};

export default ResponsiveStyles;
