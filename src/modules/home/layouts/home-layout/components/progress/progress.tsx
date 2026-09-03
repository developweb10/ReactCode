import { useEffect } from "react";

import NProgress from "nprogress";

export const Progress = () => {
  useEffect(() => {
    NProgress.start();
    return () => {
      NProgress.done();
    };
  }, []);
  return null;
};
