import { useRef, useEffect } from "react";

export const useSleepCheck = (callback: () => void) => {
  const intervalRef = useRef<number | null>(null);
  const lastTime = useRef(new Date().getTime());
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      const current = new Date().getTime();
      if (current - lastTime.current > 3000) {
        callbackRef.current();
      }
      lastTime.current = current;
    }, 1000);

    return () => {
      if (intervalRef.current) {
        return window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  return intervalRef;
};
