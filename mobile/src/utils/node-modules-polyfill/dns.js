// dns 모듈 폴리필 (빈 구현체)
console.warn("dns 모듈이 필요한 기능은 React Native 환경에서 지원되지 않습니다.");

module.exports = {
  lookup: (hostname, options, callback) => {
    if (typeof options === "function") {
      callback = options;
      options = {};
    }

    // 항상 실패로 응답
    setTimeout(() => {
      callback(new Error("dns.lookup은 React Native 환경에서 지원되지 않습니다."), null);
    }, 0);
  },
  // 그 외 필요한 메서드 추가
};
