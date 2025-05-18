# 웹 및 모바일 애플리케이션 통합 가이드

이 문서는 React 웹 애플리케이션과 React Native 모바일 애플리케이션 간의 통합을 위한 가이드라인을 제공합니다.

## 프로젝트 구조

프로젝트는 다음과 같은 구조로 구성되어 있습니다:

```
uriwa-mobile/
├── web/                  # 웹 애플리케이션 (React)
│   ├── src/              # 웹 앱 소스 코드
│   ├── public/           # 정적 파일
│   └── mobile/           # 모바일 애플리케이션 (React Native + Expo)
│       ├── app/          # 모바일 앱 소스 코드
│       └── components/   # 모바일 전용 컴포넌트
└── shared/               # 웹과 모바일 간 공유 코드
    ├── api/              # API 호출 및 데이터 액세스 계층
    ├── types/            # 타입 정의
    ├── utils/            # 유틸리티 함수
    └── hooks/            # 커스텀 훅
```

## 통합 접근 방식

이 프로젝트는 다음과 같은 통합 접근 방식을 사용합니다:

1. **WebView 통합**: 모바일 앱은 React Native의 WebView 컴포넌트를 사용하여 웹 앱을 표시합니다.
2. **공유 코드**: 공통 로직은 `shared/` 디렉토리에 작성하여 웹과 모바일 앱 모두에서 재사용합니다.
3. **API 통합**: API 호출 및 데이터 접근 로직은 공유 코드로 구현하여 일관성을 유지합니다.

## WebView 통합 가이드라인

### 웹 앱

1. 웹 앱은 반응형으로 설계하여 모바일 화면 크기에 적합하게 렌더링되어야 합니다.
2. 모바일 환경에서의 웹 앱과 네이티브 앱 간 통신을 위해 `window.postMessage`와 `window.addEventListener('message')`를 활용할 수 있습니다.
3. 웹 앱 빌드 후, 정적 파일들은 모바일 앱에서도 접근 가능한 서버에 호스팅되어야 합니다.

### 모바일 앱

1. WebView 컴포넌트는 `onMessage` 이벤트 핸들러를 통해 웹 앱으로부터 메시지를 수신할 수 있습니다.
2. `injectJavaScript` 메소드를 사용하여 웹 앱에 JavaScript 코드를 주입하고 상호작용할 수 있습니다.
3. 네이티브 기능(카메라, 위치 등)이 필요한 경우, 웹 앱에서 모바일 앱으로 메시지를 보내 처리할 수 있습니다.

## 예제 코드

### 웹 앱에서 모바일 앱으로 메시지 보내기

```javascript
// 웹 앱 코드
function sendMessageToMobile(message) {
  window.ReactNativeWebView.postMessage(JSON.stringify(message));
}

// 예시: 버튼 클릭 시 메시지 보내기
document.getElementById("sendButton").addEventListener("click", () => {
  sendMessageToMobile({ type: "SOME_ACTION", data: { value: "test" } });
});
```

### 모바일 앱에서 웹 앱 메시지 처리하기

```tsx
// 모바일 앱 코드 (React Native)
<WebView
  source={{ uri: "https://your-web-app-url.com" }}
  onMessage={(event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      // 메시지 유형에 따라 처리
      switch (message.type) {
        case "SOME_ACTION":
          // 메시지 처리 로직
          console.log("데이터 수신:", message.data);
          break;
        default:
          console.log("알 수 없는 메시지 유형:", message.type);
      }
    } catch (error) {
      console.error("메시지 파싱 오류:", error);
    }
  }}
/>
```

### 모바일 앱에서 웹 앱으로 메시지 보내기

```tsx
// 모바일 앱 코드 (React Native)
// webViewRef는 useRef를 사용하여 WebView에 대한 참조입니다
const webViewRef = useRef(null);

// 웹 앱으로 메시지 보내기
const sendMessageToWebApp = (message) => {
  const injectedJavaScript = `
    (function() {
      window.dispatchEvent(new MessageEvent('message', {
        data: ${JSON.stringify(message)}
      }));
      true;
    })();
  `;
  webViewRef.current?.injectJavaScript(injectedJavaScript);
};
```

## 공유 데이터 및 상태 관리

1. Supabase API 호출은 `shared/api/` 디렉토리에 구현하여 웹과 모바일 앱에서 공통으로 사용합니다.
2. 타입 정의는 `shared/types/` 디렉토리에 관리하여 타입 안전성을 보장합니다.
3. 유틸리티 함수는 `shared/utils/` 디렉토리에 구현하여 웹과 모바일 앱에서 재사용합니다.

## 시작하기

### 웹 앱 개발

```bash
cd web
npm start
```

### 모바일 앱 개발

```bash
cd web/mobile
npx expo start
```

## 통합 테스트

WebView 통합 테스트는 다음과 같이 할 수 있습니다:

1. 웹 앱 서버 실행 (기본적으로 `http://localhost:3000`)
2. 모바일 앱 실행 및 WebView 탭 선택
3. "로컬 웹 앱 로드" 버튼 클릭하여 통합 확인

## 주의사항

1. 로컬 개발 시 WebView에서 로컬 웹 서버(localhost)에 접근하려면 실제 IP 주소를 사용해야 합니다.
2. CORS 이슈가 발생할 수 있으니 웹 서버 설정에서 적절한 CORS 헤더를 제공해야 합니다.
3. 모바일 앱과 웹 앱 간의 통신은 보안에 주의해야 합니다.
