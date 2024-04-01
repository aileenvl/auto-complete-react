import { useEffect, useRef, useCallback } from "react";

export function useDebounce<T extends (...args: any[]) => any>(callback: T, delay: number): () => void {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(() => {
    const timer = setTimeout(() => {
      callbackRef.current();
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return debouncedCallback;
}