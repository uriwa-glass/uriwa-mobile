# URI-WA Mobile App

## 개요

URI-WA 모바일 애플리케이션 프로젝트입니다.

## 개발 환경 설정

### 의존성 설치

```bash
npm install
```

### 환경 변수 설정

1. `supabase/.env.example` 파일을 복사하여 `supabase/.env` 파일을 생성합니다.
2. `.env` 파일에 실제 OAuth 자격 증명 및 기타 민감한 정보를 입력합니다.
3. config.toml 파일에서는 `env(VARIABLE_NAME)` 형식으로 환경 변수를 참조합니다.

```bash
# .env 파일 생성 예시
cp supabase/.env.example supabase/.env
```

### 개발 서버 실행

```bash
cd web
npm run dev
```

### Supabase 로컬 서버 실행

```bash
cd supabase
supabase start
```

## 프로젝트 구조

### SQL 파일 관리

- `supabase/migrations/` - 실제 마이그레이션에 사용되는 SQL 파일
- `supabase/seed.sql` - 초기 데이터 시드 파일
- `supabase/storage.sql` - 스토리지 관련 설정 파일
- `web/create_enum_types.sql` - 열거 타입 생성 스크립트
- `web/create_user_profile_procedure.sql` - 사용자 프로필 생성 프로시저

### 불필요한 SQL 파일 관리

- 임시 및 덤프 SQL 파일들은 `.gitignore`에 추가되어 버전 관리되지 않습니다.
- 백업 파일들은 `supabase/migrations_backup_archive/` 폴더에 보관됩니다.

## 알려진 이슈

- RLS 정책의 무한 재귀 문제가 있으나 클라이언트 측에서 임시 조치로 처리 중입니다.
- 자세한 내용은 `web/src/api/supabaseClient.ts` 파일의 주석을 참고하세요.
