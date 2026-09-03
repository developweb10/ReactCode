import styles from "./sidebar.module.scss";
import classNames from "classnames";
import React, { useMemo } from "react";
import { UserAuthModel } from "@models/authorization.models";
import { ReactComponent as Logo } from "@assets/images/side-bar-logo.svg";
import DashboardIcon from "@assets/images/dashboard-icon.svg";
import EmployeesIcon from "@assets/images/employees-icon.svg";
import SettingIcon from "@assets/images/SVGsetting.svg";
import SystemSettingIcon from "@assets/images/settings-icon.svg";
import CalculatorIcon from "@assets/images/calculator-icon.svg";
import TaskListViewIcon from "@assets/images/task-list-view-icon.svg";
import MoneyStackIcon from "@assets/images/money-stack-icon.svg";
import RequestsIcon from "@assets/images/requests-icon.svg";
import CalendarIcon from "@assets/images/calendar-icon.svg";
import StoreIcon from "@assets/images/shop-icon.svg";
import { Drawer } from "@material-ui/core";
import { SidebarNavLink } from "@home/layouts/home-layout/components/sidebar-nav-link/sidebar-nav-link";
import { SidebarCasesLink } from "@home/layouts/home-layout/components/sidebar-cases-link/sidebar-cases-link";
import { HomeRouterNames } from "@modules/home/config/home-router.names";
import { ReactComponent as SidebarFullLogo } from "@assets/images/sidebar-full-logo.svg";
import { isMobile } from "react-device-detect";

import { tasksQuery } from "@store/tasks/tasks.query";
import { useObservableState } from "observable-hooks";

interface SidebarProps {
  open: boolean;
  currentUser: UserAuthModel;
  onSidebarClose: () => void;
}
export const Sidebar: React.FC<SidebarProps> = ({
  open,
  onSidebarClose,
  currentUser,
}) => {
  const newTasksCount = useObservableState(tasksQuery.newTasksCount$, 0);
  const drawerContent = useMemo(
    () => (
      <React.Fragment>
        <div className={styles.LogoWrap}>
          <Logo />
        </div>
        <div className={styles.NavLinkListWrap}>
          <SidebarNavLink
            to={`/${HomeRouterNames.DASHBOARD}`}
            label="Dashboard"
            imgSrc={DashboardIcon}
          />
          <SidebarNavLink
            to={`/${HomeRouterNames.EMPLOYEES}`}
            label="Employees"
            imgSrc={EmployeesIcon}
          />

          <SidebarCasesLink />

          <SidebarNavLink
            to={`/${HomeRouterNames.REDUNDANCY_CALCULATOR}`}
            label="Redundancy Calculator"
            imgSrc={CalculatorIcon}
          />
          <SidebarNavLink
            to={`/${HomeRouterNames.TASKS}`}
            label="Tasks"
            imgSrc={TaskListViewIcon}
            count={newTasksCount}
          />
          <SidebarNavLink
            to={`/${HomeRouterNames.TIME_ATTENDANCE}`}
            label={`Time & Attendance`}
            imgSrc={MoneyStackIcon}
          />

          <SidebarNavLink
            to={`/${HomeRouterNames.REQUESTS}`}
            label="Requests"
            imgSrc={RequestsIcon}
          />

          <SidebarNavLink
            to={`/${HomeRouterNames.CALENDAR}`}
            label="Calendar"
            imgSrc={CalendarIcon}
          />
          <SidebarNavLink
            to={`/${HomeRouterNames.STORE_DETAILS}`}
            label="Locations"
            imgSrc={StoreIcon}
          />
          <SidebarNavLink
            to={`/${HomeRouterNames.SCHEDULING}`}
            label="Scheduling"
            imgSrc={EmployeesIcon}
          />
          <SidebarNavLink
            to={`/${HomeRouterNames.NOTIFICATION_LOGS}`}
            label="Notification Logs"
            imgSrc={TaskListViewIcon}
          />
          <SidebarNavLink
            to={`/${HomeRouterNames.CANDIDATES}`}
            label="Candidates"
            imgSrc={EmployeesIcon}
          />
          <SidebarNavLink
            to={`/${HomeRouterNames.SYSTEM_USER}`}
            label="System Users"
            imgSrc={SettingIcon}
          />
          <SidebarNavLink
            to={`/${HomeRouterNames.SYSTEM_SETTING}`}
            label="System Settings"
            imgSrc={SystemSettingIcon}
          />
        </div>
        <div className={styles.SidebarFullLogoWrap}>
          <SidebarFullLogo />
        </div>
      </React.Fragment>
    ),
    [newTasksCount]
  );
  return (
    <div>
      <Drawer
        anchor={"left"}
        open
        variant="permanent"
        classes={{
          paper: classNames(styles.Container, { [styles.IsMobile]: isMobile }),
        }}
      >
        <div className={styles.Wrap}>{drawerContent}</div>
      </Drawer>
      <Drawer
        variant="temporary"
        anchor={"left"}
        open={open}
        classes={{
          paper: classNames(styles.MobileContainer, {
            [styles.IsMobile]: isMobile,
          }),
        }}
        onClose={onSidebarClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
      >
        <div className={styles.Wrap}>{drawerContent}</div>
      </Drawer>
    </div>
  );
};
