const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// tls, net, dns, dgram 모듈에 대한 mock 파일 경로
const modulesPath = path.resolve(__dirname, "src/utils/node-modules-polyfill");

// 리졸버 추가 설정
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    // Node.js 모듈 폴리필
    stream: require.resolve("stream-browserify"),
    zlib: require.resolve("browserify-zlib"),
    util: require.resolve("util/"),
    crypto: require.resolve("crypto-browserify"),
    url: require.resolve("react-native-url-polyfill"),
    assert: require.resolve("assert"),
    net: require.resolve("react-native-tcp"),
    http: require.resolve("@tradle/react-native-http"),
    https: require.resolve("https-browserify"),
    path: require.resolve("path-browserify"),
    fs: require.resolve("react-native-level-fs"),
    os: require.resolve("os-browserify"),
    querystring: require.resolve("querystring-es3"),
    events: require.resolve("events"),
    tls: path.resolve(modulesPath, "tls.js"),
    dgram: path.resolve(modulesPath, "dgram.js"),
    dns: path.resolve(modulesPath, "dns.js"),
  },
};

module.exports = config;
