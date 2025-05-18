# URIWA 모바일 스타일 가이드

## 목차

1. [소개](#소개)
2. [스타일 시스템 구조](#스타일-시스템-구조)
3. [Tailwind CSS 컴포넌트 사용하기](#tailwind-css-컴포넌트-사용하기)
4. [테마 색상과 변수](#테마-색상과-변수)
5. [컴포넌트 예제](#컴포넌트-예제)
6. [마이그레이션 가이드](#마이그레이션-가이드)

## 소개

URIWA 모바일은 Tailwind CSS를 사용하여 스타일링됩니다. 이 가이드는 스타일 시스템 구조, 컴포넌트 사용법, 그리고 일관된 디자인을 유지하기 위한 모범 사례를 설명합니다.

## 스타일 시스템 구조

프로젝트의 스타일 시스템은 다음 파일들로 구성됩니다:

- `web/src/styles/variables.css`: CSS 변수 정의
- `web/src/styles/theme.ts`: TypeScript 테마 상수와 타입
- `web/src/styles/tailwind.css`: Tailwind 컴포넌트 및 유틸리티 확장
- `tailwind.config.js`: Tailwind CSS 설정 및 테마 확장

## Tailwind CSS 컴포넌트 사용하기

### 기본 클래스

```jsx
// 마진, 패딩, 텍스트 색상 등 기본 유틸리티 클래스
<div className="m-4 p-5 text-text-primary">
  기본 텍스트
</div>

// 레이아웃 유틸리티
<div className="flex justify-between items-center">
  <span>왼쪽 항목</span>
  <span>오른쪽 항목</span>
</div>
```

### 컴포넌트 클래스

프로젝트는 재사용 가능한 컴포넌트 클래스를 제공합니다:

```jsx
// 버튼 컴포넌트 클래스
<button className="btn-primary">기본 버튼</button>
<button className="btn-outline">외곽선 버튼</button>

// 폼 요소
<div className="form-group">
  <label className="form-label">이름</label>
  <input className="input-field" />
</div>

// 알림 메시지
<div className="alert-success">성공!</div>
<div className="alert-error">오류가 발생했습니다.</div>
```

## 테마 색상과 변수

모든 색상과 스타일 변수는 CSS 변수로 정의되어 있으며, Tailwind 설정에 매핑되어 있습니다:

### 색상

- `primary`: 주요 브랜드 색상 (`primary-main`, `primary-light`, `primary-dark`, `primary-contrast`)
- `secondary`: 보조 브랜드 색상
- `text`: 텍스트 색상 (`text-primary`, `text-secondary`, `text-disabled`)
- `background`: 배경 색상 (`background-default`, `background-paper`, `background-light`)
- `border`: 테두리 색상 (`border-light`, `border-medium`)
- `error`, `success`, `info`, `neutral`: 상태 색상
- `pastel`: 특별 파스텔 색상 팔레트

### 크기 및 간격

- 테두리 반경: `border-radius-sm`, `border-radius-md`, `border-radius-lg`
- 글꼴 크기: `font-size-xs`에서 `font-size-xxl`까지
- 간격: Tailwind의 표준 간격 시스템 (예: `m-1`, `p-4` 등)

## 컴포넌트 예제

### Button

```jsx
// 기본 버튼
<Button variant="primary">버튼 텍스트</Button>

// 옵션 포함
<Button
  variant="outline"
  size="large"
  fullWidth
  onClick={handleClick}
>
  전체 너비 버튼
</Button>
```

### Card

```jsx
// 기본 카드
<Card>
  컨텐츠가 여기에 들어갑니다
</Card>

// 제목과 하단 요소 포함
<Card
  title="카드 제목"
  subtitle="카드 부제목"
  variant="elevated"
  footer={<Button>자세히 보기</Button>}
>
  카드 내용이 여기에 들어갑니다.
</Card>
```

### Layout

```jsx
<Layout title="페이지 제목" showBackButton>
  페이지 컨텐츠가 여기에 들어갑니다
</Layout>
```

// Tailwind CSS 방식
const Button = ({ primary, children, ...props }) => (
<button
className={`      py-2.5 px-4 
      rounded-md 
      ${primary ? "bg-primary-main text-primary-contrast" : "bg-transparent text-primary-main"}
   `}
{...props}

>

    {children}

  </button>
);
```

이 마이그레이션은 다음과 같은 이점을 제공합니다:

- 번들 크기 감소
- 향상된 개발 경험
- 더 나은 TypeScript 통합
- 디자인 일관성 개선
- 성능 향상
