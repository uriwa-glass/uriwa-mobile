import CryptoJS from 'crypto-js';

// 환경변수에서 암호화 키 가져오기 (개발용)
const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'default-key-for-dev';

/**
 * 비밀번호를 암호화합니다.
 * @param password - 암호화할 비밀번호
 * @returns 암호화된 비밀번호
 */
export const encryptPassword = (password: string): string => {
  return CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString();
};

/**
 * 비밀번호를 복호화합니다 (디버깅 목적)
 * @param encryptedPassword - 암호화된 비밀번호
 * @returns 복호화된 비밀번호
 */
export const decryptPassword = (encryptedPassword: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedPassword, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

/**
 * 비밀번호를 해시화합니다 (일방향 암호화)
 * @param password - 해시화할 비밀번호
 * @returns 해시화된 비밀번호
 */
export const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password + ENCRYPTION_KEY).toString();
}; 