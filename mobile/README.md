# URIWA 모바일 앱

## Supabase OAuth 설정 가이드

소셜 로그인(Google, Apple, Kakao)을 정상적으로 사용하기 위해 다음 단계대로 Supabase 설정을 완료해주세요.

### 1. Supabase 프로젝트 설정

1. [Supabase 대시보드](https://app.supabase.io)에 로그인합니다.
2. 프로젝트를 선택하고 "Authentication" 메뉴로 이동합니다.
3. "URL Configuration" 섹션에서 다음 URL을 추가합니다:

   - 개발 환경:
     - `http://localhost:8081`
     - `http://10.0.2.2:8081` (Android 에뮬레이터용)
   - 프로덕션 환경:
     - `https://uriwa.com`
     - `uriwa://login-callback`

   **중요**: 현재 웹 버전 URL인 `https://uriwa.netlify.app`이 리디렉션 URL로 설정되어 있다면, 이로 인해 모바일 앱에서 로그인 후 웹뷰가 닫히지 않고 웹 사이트로 이동하는 문제가 발생할 수 있습니다. 이 URL은 웹 버전에서만 사용해야 하며, 모바일 앱에서는 `uriwa://login-callback` URL을 사용해야 합니다.

4. "Site URL"을 `https://uriwa.com`으로 설정합니다.

### 2. Google 로그인 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트를 생성합니다.
2. "API 및 서비스" > "OAuth 동의 화면"에서 필요한 정보를 입력합니다.
3. "사용자 인증 정보" > "사용자 인증 정보 만들기" > "OAuth 클라이언트 ID"를 선택합니다.
4. 애플리케이션 유형으로 "웹 애플리케이션"을 선택합니다.
5. 승인된 자바스크립트 원본에 `https://[YOUR_PROJECT_REF].supabase.co`를 추가합니다.
6. 승인된 리디렉션 URI에 다음을 추가합니다:

   - `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`
   - `uriwa://login-callback`
   - 개발 환경: `http://localhost:8081`, `http://10.0.2.2:8081`

   **중요**: 리디렉션 URI에 웹 버전 URL(`https://uriwa.netlify.app` 등)이 포함되어 있다면, 모바일 앱용 OAuth 흐름과 구분하기 위해 별도의 OAuth 클라이언트를 만드는 것이 좋습니다. 하나는 웹용, 하나는 모바일 앱용으로 사용하세요.

7. 클라이언트 ID와 클라이언트 보안 비밀번호를 받아 Supabase의 Auth > Providers > Google 설정에 입력합니다.

### 3. Apple 로그인 설정

1. [Apple Developer Portal](https://developer.apple.com)에 로그인합니다.
2. "Certificates, Identifiers & Profiles" > "Identifiers"로 이동합니다.
3. "+" 버튼을 클릭하고 "App IDs"를 선택합니다.
4. 앱 설명과 Bundle ID를 입력합니다 (예: "com.uriwa.mobile").
5. "Sign In with Apple" 기능을 체크하고 구성합니다.
6. "Register" 버튼을 클릭합니다.
7. "Keys" 섹션으로 이동하여 새 키를 등록합니다.
8. "Sign In with Apple" 옵션을 체크하고 구성합니다.
9. 키 ID, 팀 ID, 클라이언트 ID (Bundle ID)를 Supabase의 Auth > Providers > Apple 설정에 입력합니다.
10. 다운로드한 키 파일에서 개인 키를 Supabase의 "Private Key" 필드에 붙여넣습니다.

### 4. Kakao 로그인 설정

1. [Kakao Developers](https://developers.kakao.com/)에 로그인합니다.
2. 애플리케이션을 생성하고 설정합니다.
3. "플랫폼" 섹션에서 "Web" 플랫폼을 추가하고 사이트 도메인에 `https://[YOUR_PROJECT_REF].supabase.co`를 입력합니다.
4. "제품 설정" > "카카오 로그인"에서 활성화 상태를 "ON"으로 설정합니다.
5. "Redirect URI"에 다음을 추가합니다:
   - `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`
   - `uriwa://login-callback`
   - 개발 환경: `http://localhost:8081`, `http://10.0.2.2:8081`
6. "동의항목" 섹션에서 필요한 항목을 설정합니다 (이메일, 프로필 정보 등).
7. "앱 키" 섹션의 REST API 키를 Supabase의 Auth > Providers > Kakao 설정의 "Client ID" 필드에 입력합니다.
8. "Client Secret"을 생성하고 이를 Supabase의 "Client Secret" 필드에 입력합니다.

### 5. 앱 설정 확인

1. `app.config.js` 파일에서 `scheme`이 `"uriwa"`로 설정되어 있는지 확인합니다.
2. `ios` 및 `android` 섹션에서 딥링크 설정이 올바르게 되어 있는지 확인합니다.
3. `.env` 파일에 Supabase URL과 Anon Key가 올바르게 설정되어 있는지 확인합니다.

### 6. 리디렉션 문제 해결

모바일 앱에서 소셜 로그인 후 WebView가 닫히지 않고 웹 버전(uriwa.netlify.app)으로 리디렉션되는 문제가 발생하는 경우:

1. **Supabase 설정 확인**:

   - Supabase 대시보드의 Authentication > URL Configuration에서 모바일 앱용 리디렉션 URL(`uriwa://login-callback`)이 올바르게 설정되어 있는지 확인합니다.
   - 웹 사이트와 모바일 앱이 같은 Supabase 프로젝트를 사용하는 경우, 리디렉션 URL이 모두 제대로 설정되어 있어야 합니다.

2. **OAuth 제공자 설정 확인**:

   - Google/Apple/Kakao 개발자 콘솔에서 리디렉션 URL이 올바르게 설정되어 있는지 확인합니다.
   - 웹 앱과 모바일 앱에 서로 다른 OAuth 클라이언트 ID를 사용하는 것이 좋습니다.

3. **앱 코드 확인**:

   - `LoginScreen.tsx`의 `getRedirectUrl()` 함수가 올바른 URL을 반환하는지 확인합니다.
   - 개발 환경과 프로덕션 환경에 맞는 URL이 각각 설정되어 있어야 합니다.

4. **직접 테스트**:
   - 앱을 다시 빌드하고 실행하여 소셜 로그인이 올바르게 작동하는지 확인합니다.
   - 개발 모드에서는 콘솔 로그를 확인하여 사용된 리디렉션 URL과 인증 결과를 분석합니다.

모든 설정을 완료한 후 앱을 다시 시작하면 소셜 로그인이 정상적으로 작동할 것입니다.

## 앱 실행 방법

1. 필요한 패키지 설치:

```bash
yarn install
```

2. 개발 서버 시작:

```bash
npx expo start
```
