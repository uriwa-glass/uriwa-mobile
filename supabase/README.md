# Supabase 프로젝트 설정

이 문서는 **우리와 Mobile** 프로젝트에서 사용하는 Supabase 설정 방법을 설명합니다.

## 개요

이 프로젝트는 Supabase를 활용하여 다음 기능을 구현합니다:

- 사용자 인증 및 권한 관리
- 클래스 및 예약 시스템
- 갤러리 및 이미지 관리
- 문의 및 응답 시스템

## 프로젝트 설정 방법

### 1. Supabase 프로젝트 생성

1. [Supabase 대시보드](https://app.supabase.io/)에 접속하여 계정 생성 또는 로그인
2. 새 프로젝트 생성:
   - **Create new project** 버튼 클릭
   - 프로젝트 이름 설정: `uriwa-mobile`
   - 강력한 비밀번호 설정
   - 리전 선택 (한국에서 접속하는 경우 `Tokyo` 또는 `Singapore` 권장)
3. 프로젝트 생성 완료 후 API 키와 URL 저장:
   - Project Settings > API 에서 확인 가능
   - `NEXT_PUBLIC_SUPABASE_URL`: 프로젝트 URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon/public 키

### 2. 마이그레이션 실행

이 프로젝트에는 다음 마이그레이션 파일이 포함되어 있습니다:

- `00000000000000_initial_schema.sql`: 기본 확장 및 함수 설정
- `00000000000001_users_schema.sql`: 사용자 및 세션 관련 테이블
- `00000000000002_classes_schema.sql`: 클래스 및 예약 관련 테이블
- `00000000000003_gallery_schema.sql`: 갤러리 관련 테이블
- `00000000000004_inquiry_schema.sql`: 문의 관련 테이블
- `00000000000005_rls_policies.sql`: 테이블 권한 관리를 위한 RLS 정책

Supabase 콘솔에서 SQL 편집기를 사용하여 각 마이그레이션 파일을 순서대로 실행하세요.

### 3. 환경 변수 설정

웹 및 모바일 앱 모두 다음 환경 변수가 필요합니다:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

웹 앱:

- `.env.local` 파일에 위 환경 변수 추가

모바일 앱:

- `app.config.js` 파일의 `extra` 항목에 추가하거나
- 빌드 환경에 따라 적절한 방식으로 구성

### 4. 저장소 버킷 설정

Supabase Storage에 다음 버킷을 생성하세요:

1. `gallery` - 갤러리 이미지용
2. `avatars` - 사용자 프로필 이미지용
3. `attachments` - 문의 첨부 파일용

각 버킷에 대한 RLS 정책:

- `gallery`: 누구나 읽기 가능, 관리자만 쓰기 가능
- `avatars`: 인증된 사용자만 읽기 가능, 각 사용자는 자신의 폴더만 쓰기 가능
- `attachments`: 관련 문의 작성자 및 관리자만 읽기/쓰기 가능

## 로컬 개발 환경 설정

로컬 개발 환경에서는 다음 방법으로 Supabase에 연결할 수 있습니다:

1. 클라우드의 Supabase 프로젝트 연결:

   - 각 환경 변수 파일에 실제 Supabase 프로젝트 URL과 키 사용

2. 로컬 Supabase 인스턴스 실행 (선택 사항):
   - [Supabase CLI](https://supabase.com/docs/guides/cli) 설치
   - `npx supabase start` 실행
   - 로컬 환경 변수 파일에 로컬 Supabase URL 및 키 설정

## API 예제

### 인증

```typescript
import { supabase } from "../utils/supabaseClient";

// 이메일/비밀번호 로그인
const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

// 로그아웃
const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};
```

### 클래스 조회

```typescript
import { supabase } from "../utils/supabaseClient";

// 모든 클래스 가져오기
const getClasses = async () => {
  const { data, error } = await supabase.from("classes").select("*");
  return { data, error };
};

// 특정 클래스 및 일정 가져오기
const getClassWithSchedules = async (classId: string) => {
  const { data, error } = await supabase
    .from("classes")
    .select(
      `
      *,
      class_schedules(*)
    `
    )
    .eq("id", classId);
  return { data, error };
};
```

### 예약 생성

```typescript
import { supabase } from "../utils/supabaseClient";

// 예약 생성
const createReservation = async (scheduleId: string, sessionId: string) => {
  const { data, error } = await supabase.from("class_reservations").insert([
    {
      schedule_id: scheduleId,
      session_id: sessionId,
      user_id: supabase.auth.user()?.id,
    },
  ]);
  return { data, error };
};
```

## 테이블 관계 다이어그램

```
auth.users
  ↑
  |--- public.user_profiles
  |
  |--- public.user_sessions
  |      ↑
  |      |
public.class_schedules --- public.class_reservations
  ↑
  |
public.classes

public.gallery_categories --- public.gallery_items

public.inquiry_templates --- public.inquiries --- public.inquiry_attachments
                              ↑
                              |--- public.inquiry_responses
```

## 권한 관리

이 프로젝트는 두 가지 사용자 역할을 사용합니다:

1. `user`: 일반 사용자 (기본값)
2. `admin`: 관리자

역할은 `user_profiles` 테이블의 `role` 필드에 저장되며, RLS 정책은 이 역할을 확인하여 접근 권한을 부여합니다.
