/**
 * 공통 React Hooks
 *
 * 웹과 모바일 앱 모두에서 사용 가능한 공통 훅 함수들입니다.
 * 주의: 이 훅들은 React 환경에서만 사용할 수 있습니다.
 */

import { useState, useEffect, useCallback } from "react";

/**
 * 로컬 스토리지에 상태를 저장하는 훅
 *
 * @param key - 로컬 스토리지 키
 * @param initialValue - 초기 값
 * @returns [상태, 상태 설정 함수]
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // 초기 상태는 함수로 지정하여 로컬 스토리지 접근은 처음 랜더링 시에만 실행
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === "undefined") {
        return initialValue;
      }

      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("로컬 스토리지에서 값을 가져오는 중 오류 발생:", error);
      return initialValue;
    }
  });

  // storedValue가 변경될 때 로컬 스토리지 업데이트
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error("로컬 스토리지에 값을 저장하는 중 오류 발생:", error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
}

/**
 * 화면 크기 변화를 감지하는 훅
 *
 * @returns { width, height } - 현재 화면 크기
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}

/**
 * 데이터를 가져오는 훅
 *
 * @param url - 데이터를 가져올 URL
 * @param options - fetch 옵션
 * @returns { data, loading, error } - 데이터, 로딩 상태, 오류
 */
export function useFetch<T>(url: string, options?: RequestInit) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchData = async () => {
      setLoading(true);

      try {
        const response = await fetch(url, {
          ...options,
          signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP 오류! 상태: ${response.status}`);
        }

        const result = await response.json();
        setData(result as T);
        setError(null);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setError(error as Error);
          setData(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      abortController.abort();
    };
  }, [url, options]);

  return { data, loading, error };
}
