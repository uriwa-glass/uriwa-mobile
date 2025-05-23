// 카카오 SDK 타입 정의
declare global {
  interface Window {
    Kakao: any;
  }
}

export interface KakaoUserInfo {
  id: number;
  kakao_account: {
    email?: string;
    profile?: {
      nickname?: string;
      profile_image_url?: string;
    };
  };
}

/**
 * 카카오 SDK 초기화
 */
export const initKakaoSDK = () => {
  console.log('🔵 카카오 SDK 초기화 시도...');
  
  if (!window.Kakao) {
    console.error('🔴 카카오 SDK가 로드되지 않았습니다.');
    return false;
  }

  console.log('🟢 카카오 SDK 로드 확인됨');
  console.log('🔵 카카오 SDK 버전:', window.Kakao.VERSION);
  console.log('🔵 카카오 SDK 객체:', Object.keys(window.Kakao));

  if (!window.Kakao.isInitialized()) {
    const kakaoClientId = process.env.REACT_APP_KAKAO_CLIENT_ID;
    if (kakaoClientId) {
      try {
        window.Kakao.init(kakaoClientId);
        console.log('🟢 카카오 SDK 초기화 완료, Client ID:', kakaoClientId);
        console.log('🟢 초기화 상태:', window.Kakao.isInitialized());
        return true;
      } catch (error) {
        console.error('🔴 카카오 SDK 초기화 실패:', error);
        return false;
      }
    } else {
      console.error('🔴 카카오 클라이언트 ID가 설정되지 않았습니다.');
      return false;
    }
  } else {
    console.log('🟢 카카오 SDK가 이미 초기화되어 있습니다.');
    return true;
  }
};

/**
 * 카카오 로그인 (SDK v2.x 방식 - authorize 리디렉션)
 */
export const loginWithKakao = (): Promise<KakaoUserInfo> => {
  return new Promise((resolve, reject) => {
    console.log('🔵 카카오 로그인 함수 시작');
    
    if (!window.Kakao || !window.Kakao.isInitialized()) {
      console.error('🔴 카카오 SDK가 초기화되지 않았습니다.');
      reject(new Error('카카오 SDK가 초기화되지 않았습니다.'));
      return;
    }

    console.log('🟢 카카오 SDK 확인 완료');
    console.log('🔵 사용 가능한 카카오 API:', Object.keys(window.Kakao));
    console.log('🔵 카카오 Auth 객체:', window.Kakao.Auth ? Object.keys(window.Kakao.Auth) : 'Auth 없음');

    // 먼저 기존 토큰이 있는지 확인
    try {
      const accessToken = window.Kakao.Auth.getAccessToken();
      
      if (accessToken) {
        console.log('🟢 기존 액세스 토큰 발견:', accessToken);
        
        // 토큰이 있으면 바로 사용자 정보 요청
        window.Kakao.API.request({
          url: '/v2/user/me',
          success: function (response: KakaoUserInfo) {
            console.log('🟢 카카오 사용자 정보 (기존 토큰):', response);
            resolve(response);
          },
          fail: function (error: any) {
            console.error('🔴 기존 토큰으로 사용자 정보 요청 실패:', error);
            // 토큰이 만료되었을 수 있으니 새로 로그인 시도
            performDirectLogin();
          }
        });
        return;
      }
    } catch (tokenError) {
      console.log('🟡 기존 토큰 확인 실패, 새 로그인 진행:', tokenError);
    }
    
    // 직접 로그인 수행
    performDirectLogin();

    function performDirectLogin() {
      console.log('🔵 카카오 직접 로그인 시작');
      
      try {
        // 카카오 로그인 창을 팝업으로 열기
        const kakaoLoginUrl = `https://kauth.kakao.com/oauth/authorize?` +
          `client_id=${process.env.REACT_APP_KAKAO_CLIENT_ID}` +
          `&redirect_uri=${encodeURIComponent(window.location.origin + '/kakao/callback')}` +
          `&response_type=code` +
          `&scope=profile_nickname,profile_image,account_email`;
        
        console.log('🔵 카카오 로그인 URL:', kakaoLoginUrl);
        
        // 현재 URL을 세션 스토리지에 저장
        sessionStorage.setItem('kakao_login_return_url', window.location.href);
        
        // 직접 리디렉션
        window.location.href = kakaoLoginUrl;
        
        console.log('🟢 카카오 로그인 리디렉션 시작...');
        
      } catch (loginError) {
        console.error('🔴 카카오 직접 로그인 실패:', loginError);
        reject(new Error('카카오 로그인을 시작할 수 없습니다: ' + String(loginError)));
      }
    }
  });
};

/**
 * 카카오 인증 리디렉션 처리 (콜백 페이지에서 사용)
 */
export const handleKakaoCallback = (): Promise<KakaoUserInfo> => {
  return new Promise((resolve, reject) => {
    console.log('🔵 카카오 콜백 처리 시작');
    
    if (!window.Kakao || !window.Kakao.isInitialized()) {
      console.error('🔴 카카오 SDK가 초기화되지 않았습니다.');
      reject(new Error('카카오 SDK가 초기화되지 않았습니다.'));
      return;
    }

    try {
      // URL에서 인증 코드 확인
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      
      if (error) {
        console.error('🔴 카카오 인증 오류:', error);
        reject(new Error('카카오 로그인이 취소되었거나 실패했습니다.'));
        return;
      }
      
      if (!code) {
        console.error('🔴 카카오 인증 코드가 없습니다.');
        reject(new Error('카카오 인증 코드를 받지 못했습니다.'));
        return;
      }
      
      console.log('🟢 카카오 인증 코드 수신:', code);
      
      // 카카오 SDK가 authorization code를 처리할 수 있도록 URL을 정리하고 다시 시도
      console.log('🔵 카카오 SDK를 통한 토큰 처리 시도...');
      
      // URL을 정리하여 SDK가 인식할 수 있도록 함
      if (window.history && window.history.replaceState) {
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
      
      // 잠시 대기 후 SDK 상태 확인
      setTimeout(() => {
        console.log('🔵 카카오 SDK 토큰 상태 확인...');
        
        const attemptTokenExchange = () => {
          console.log('🔵 토큰 교환 시도 중...');
          
          // 방법 1: SDK의 authorize 함수 재시도 (백그라운드에서 토큰 처리)
          try {
            window.Kakao.Auth.authorize({
              redirectUri: window.location.origin + '/kakao/callback',
              scope: 'profile_nickname,profile_image,account_email',
              throughTalk: false,
              success: function(authObj: any) {
                console.log('🟢 카카오 인증 성공:', authObj);
                if (authObj.access_token) {
                  window.Kakao.Auth.setAccessToken(authObj.access_token);
                  getUserInfo();
                } else {
                  console.error('🔴 액세스 토큰이 없습니다.');
                  reject(new Error('액세스 토큰을 받지 못했습니다.'));
                }
              },
              fail: function(err: any) {
                console.error('🔴 카카오 authorize 실패:', err);
                // 방법 2: 직접 API 호출 시도
                attemptDirectAPICall();
              }
            });
          } catch (authorizeError) {
            console.error('🔴 authorize 호출 실패:', authorizeError);
            attemptDirectAPICall();
          }
        };
        
        const attemptDirectAPICall = () => {
          console.log('🔵 직접 API 호출 시도...');
          
          // 카카오 REST API를 직접 호출하여 토큰 교환
          const clientId = process.env.REACT_APP_KAKAO_CLIENT_ID;
          if (!clientId) {
            reject(new Error('카카오 클라이언트 ID가 설정되지 않았습니다.'));
            return;
          }
          
          const formData = new FormData();
          formData.append('grant_type', 'authorization_code');
          formData.append('client_id', clientId);
          formData.append('redirect_uri', window.location.origin + '/kakao/callback');
          formData.append('code', code);
          
          fetch('https://kauth.kakao.com/oauth/token', {
            method: 'POST',
            body: formData
          })
          .then(response => response.json())
          .then(data => {
            console.log('🟢 토큰 교환 응답:', data);
            
            if (data.access_token) {
              window.Kakao.Auth.setAccessToken(data.access_token);
              console.log('🟢 액세스 토큰 설정 완료');
              getUserInfo();
            } else {
              console.error('🔴 토큰 교환 실패:', data);
              reject(new Error('토큰 교환에 실패했습니다: ' + (data.error_description || data.error)));
            }
          })
          .catch(fetchError => {
            console.error('🔴 토큰 교환 요청 실패:', fetchError);
            reject(new Error('토큰 교환 요청에 실패했습니다.'));
          });
        };
        
        const getUserInfo = () => {
          console.log('🔵 사용자 정보 요청...');
          
          window.Kakao.API.request({
            url: '/v2/user/me',
            success: function (response: KakaoUserInfo) {
              console.log('🟢 카카오 사용자 정보 성공:', response);
              resolve(response);
            },
            fail: function (error: any) {
              console.error('🔴 사용자 정보 요청 실패:', error);
              reject(new Error('사용자 정보를 가져오는데 실패했습니다: ' + JSON.stringify(error)));
            }
          });
        };
        
        try {
          const accessToken = window.Kakao.Auth.getAccessToken();
          console.log('🔵 현재 액세스 토큰:', accessToken);
          
          if (accessToken) {
            console.log('🟢 기존 액세스 토큰 사용');
            getUserInfo();
          } else {
            console.log('🔵 새로운 토큰 획득 시도...');
            // 새로운 로그인 시도 (SDK가 authorization code를 자동 처리)
            attemptTokenExchange();
          }
        } catch (tokenCheckError) {
          console.error('🔴 토큰 확인 실패:', tokenCheckError);
          attemptTokenExchange();
        }
      }, 500);
      
    } catch (callbackError) {
      console.error('🔴 카카오 콜백 처리 실패:', callbackError);
      reject(new Error('카카오 콜백 처리에 실패했습니다: ' + String(callbackError)));
    }
  });
};

/**
 * 카카오 로그아웃
 */
export const logoutFromKakao = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!window.Kakao || !window.Kakao.isInitialized()) {
      reject(new Error('카카오 SDK가 초기화되지 않았습니다.'));
      return;
    }

    try {
      window.Kakao.Auth.logout(() => {
        console.log('🟢 카카오 로그아웃 완료');
        resolve();
      });
    } catch (error) {
      console.error('🔴 카카오 로그아웃 실패:', error);
      reject(new Error('카카오 로그아웃에 실패했습니다.'));
    }
  });
}; 