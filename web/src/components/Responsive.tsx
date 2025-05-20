import React, { ReactNode } from "react";
import { useResponsive } from "../hooks/useResponsive";
import { Breakpoint } from "../styles/breakpoints";

// 모바일에서만 보이는 컴포넌트
interface MobileOnlyProps {
  children: ReactNode;
  inline?: boolean;
}

export const MobileOnly: React.FC<MobileOnlyProps> = ({ children, inline = false }) => {
  const { isMobile } = useResponsive();

  if (!isMobile) return null;

  return inline ? <>{children}</> : <div>{children}</div>;
};

// 태블릿에서만 보이는 컴포넌트
interface TabletOnlyProps {
  children: ReactNode;
  inline?: boolean;
}

export const TabletOnly: React.FC<TabletOnlyProps> = ({ children, inline = false }) => {
  const { isTablet } = useResponsive();

  if (!isTablet) return null;

  return inline ? <>{children}</> : <div>{children}</div>;
};

// 데스크톱에서만 보이는 컴포넌트
interface DesktopOnlyProps {
  children: ReactNode;
  inline?: boolean;
}

export const DesktopOnly: React.FC<DesktopOnlyProps> = ({ children, inline = false }) => {
  const { isDesktop } = useResponsive();

  if (!isDesktop) return null;

  return inline ? <>{children}</> : <div>{children}</div>;
};

// 특정 브레이크포인트 이상에서 보이는 컴포넌트
interface AboveBreakpointProps {
  breakpoint: Breakpoint;
  children: ReactNode;
  inline?: boolean;
}

export const AboveBreakpoint: React.FC<AboveBreakpointProps> = ({
  breakpoint,
  children,
  inline = false,
}) => {
  const { above } = useResponsive();

  if (!above(breakpoint)) return null;

  return inline ? <>{children}</> : <div>{children}</div>;
};

// 특정 브레이크포인트 이하에서 보이는 컴포넌트
interface BelowBreakpointProps {
  breakpoint: Breakpoint;
  children: ReactNode;
  inline?: boolean;
}

export const BelowBreakpoint: React.FC<BelowBreakpointProps> = ({
  breakpoint,
  children,
  inline = false,
}) => {
  const { below } = useResponsive();

  if (!below(breakpoint)) return null;

  return inline ? <>{children}</> : <div>{children}</div>;
};

// 두 브레이크포인트 사이에서 보이는 컴포넌트
interface BetweenBreakpointsProps {
  start: Breakpoint;
  end: Breakpoint;
  children: ReactNode;
  inline?: boolean;
}

export const BetweenBreakpoints: React.FC<BetweenBreakpointsProps> = ({
  start,
  end,
  children,
  inline = false,
}) => {
  const { between } = useResponsive();

  if (!between(start, end)) return null;

  return inline ? <>{children}</> : <div>{children}</div>;
};

// 브레이크포인트별 렌더링 컴포넌트
interface ResponsiveRenderProps {
  renderXs?: () => ReactNode;
  renderSm?: () => ReactNode;
  renderMd?: () => ReactNode;
  renderLg?: () => ReactNode;
  renderXl?: () => ReactNode;
  render2xl?: () => ReactNode;
}

export const ResponsiveRender: React.FC<ResponsiveRenderProps> = ({
  renderXs,
  renderSm,
  renderMd,
  renderLg,
  renderXl,
  render2xl,
}) => {
  const { breakpoint } = useResponsive();

  switch (breakpoint) {
    case "xs":
      return <>{renderXs?.()}</>;
    case "sm":
      return <>{renderSm?.() || renderXs?.()}</>;
    case "md":
      return <>{renderMd?.() || renderSm?.() || renderXs?.()}</>;
    case "lg":
      return <>{renderLg?.() || renderMd?.() || renderSm?.() || renderXs?.()}</>;
    case "xl":
      return <>{renderXl?.() || renderLg?.() || renderMd?.() || renderSm?.() || renderXs?.()}</>;
    case "2xl":
      return (
        <>
          {render2xl?.() ||
            renderXl?.() ||
            renderLg?.() ||
            renderMd?.() ||
            renderSm?.() ||
            renderXs?.()}
        </>
      );
    default:
      return null;
  }
};
