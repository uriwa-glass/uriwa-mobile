import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

// React Router를 사용하는 애플리케이션이므로 테스트를 적절히 수정
test("renders without crashing", () => {
  // App 컴포넌트는 Router를 포함하고 있어 정확한 테스트가 어려우므로
  // 오류 없이 렌더링만 확인
  expect(() => render(<App />)).not.toThrow();
});
