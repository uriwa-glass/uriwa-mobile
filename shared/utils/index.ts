/**
 * 공통 유틸리티 함수
 *
 * 웹과 모바일 앱 모두에서 사용되는 유틸리티 함수들입니다.
 */

/**
 * 날짜를 포맷팅하는 함수
 *
 * @param date - Date 객체 또는 날짜 문자열
 * @param format - 출력 형식 (기본값: 'YYYY-MM-DD')
 * @returns 포맷팅된 날짜 문자열
 */
export function formatDate(date: Date | string, format: string = "YYYY-MM-DD"): string {
  const d = typeof date === "string" ? new Date(date) : date;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  return format
    .replace("YYYY", String(year))
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
}

/**
 * 문자열의 유효성을 검사하는 함수
 *
 * @param value - 검사할 문자열
 * @param minLength - 최소 길이 (기본값: 1)
 * @param maxLength - 최대 길이 (기본값: Infinity)
 * @returns 유효성 여부
 */
export function validateString(
  value: string,
  minLength: number = 1,
  maxLength: number = Infinity
): boolean {
  if (typeof value !== "string") return false;
  const length = value.trim().length;
  return length >= minLength && length <= maxLength;
}

/**
 * 이메일 주소의 유효성을 검사하는 함수
 *
 * @param email - 검사할 이메일 주소
 * @returns 유효성 여부
 */
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * 객체에서 지정된 속성만 추출하는 함수
 *
 * @param obj - 원본 객체
 * @param keys - 추출할 속성 키 배열
 * @returns 추출된 속성들로 이루어진 새 객체
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return keys.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
    return result;
  }, {} as Pick<T, K>);
}

/**
 * 객체에서 지정된 속성을 제외한 나머지를 추출하는 함수
 *
 * @param obj - 원본 객체
 * @param keys - 제외할 속성 키 배열
 * @returns 지정된 속성을 제외한 새 객체
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj } as Omit<T, K>;
  keys.forEach((key) => delete (result as any)[key]);
  return result;
}
