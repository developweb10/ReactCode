import { useEffect } from "react";

export const useScrollTopMount = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return null;
};
