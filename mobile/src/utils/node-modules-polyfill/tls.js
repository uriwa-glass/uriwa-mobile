// tls 모듈 폴리필 (빈 구현체)
console.warn("tls 모듈이 필요한 기능은 React Native 환경에서 지원되지 않습니다.");

module.exports = {
  connect: () => {
    throw new Error("tls.connect는 React Native 환경에서 지원되지 않습니다.");
  },
  // 그 외 필요한 메서드 추가
};
