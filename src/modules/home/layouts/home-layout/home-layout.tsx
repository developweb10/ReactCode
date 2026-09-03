import styles from "./home-layout.module.scss";
import classNames from "classnames";
import React, { Suspense, useState, useCallback, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { UserAuthModel } from "@models/authorization.models";
import { Sidebar } from "@home/layouts/home-layout/components/sidebar/sidebar";
import { Header } from "@home/layouts/home-layout/components/header/header";
import { Progress } from "@home/layouts/home-layout/components/progress/progress";
import { isMobile } from "react-device-detect";
interface HomeLayoutProps {
  currentUser: UserAuthModel;
}

export const HomeLayout: React.FC<HomeLayoutProps> = ({
  currentUser,
  children,
}) => {
  const [sidebarOpen, setSidebar] = useState(false);
  const history = useHistory();

  const handleSidebarState = useCallback(() => {
    setSidebar(!sidebarOpen);
  }, [sidebarOpen]);

  useEffect(() => {
    return history.listen(() => {
      if (sidebarOpen) {
        handleSidebarState();
      }
    });
  }, [handleSidebarState, history, sidebarOpen]);

  return (
    <div className={styles.Container}>
      <Sidebar
        open={sidebarOpen}
        onSidebarClose={handleSidebarState}
        currentUser={currentUser}
      />
      <div
        className={classNames(styles.Content, { [styles.IsMobile]: isMobile })}
      >
        <Header
          onMobileIconClick={handleSidebarState}
          currentUser={currentUser}
        />
        <Suspense fallback={<Progress />}>{children}</Suspense>
      </div>
    </div>
  );
};
