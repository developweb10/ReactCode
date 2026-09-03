import { useRef, useEffect } from "react";

export const useInterval = (callback: () => void, delay: number | null) => {
  const intervalRef = useRef<number | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (typeof delay === "number") {
      intervalRef.current = window.setInterval(
        () => callbackRef.current(),
        delay
      );

      return () => {
        if (intervalRef.current) {
          return window.clearInterval(intervalRef.current);
        }
      };
    }
  }, [delay]);

  return intervalRef;
};
