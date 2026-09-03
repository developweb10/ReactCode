import React, { useState, useEffect } from "react";
import styles from "./sidebar-cases-link.module.scss";
import classNames from "classnames";
import AllCasesIcon from "@assets/images/all-cases-icon.svg";
import { NavLink, useLocation, matchPath } from "react-router-dom";
import { usePrevious } from "@hooks/usePrevious";
import { HomeRouterNames } from "@modules/home/config/home-router.names";
import Image from "material-ui-image";
import { Collapse, List, ListItem } from "@material-ui/core";

export const SidebarCasesLink: React.FC = (props) => {
  const location = useLocation();
  const prevLocation = usePrevious(location);
  const match = matchPath<{ caseType: string }>(location.pathname, {
    path: `/${HomeRouterNames.ALL_CASES}/:caseType`,
  });

  const [open, setOpen] = useState(!!match);

  const handleClick = () => {
    if (!match) {
      setOpen(!open);
    }
  };

  useEffect(() => {
    if (location !== prevLocation && !match && open) {
      setOpen(false);
    } else if (match && !open) {
      setOpen(true);
    }
  }, [location, match, open, prevLocation]);

  return (
    <>
      <div
        onClick={handleClick}
        className={classNames(styles.Container, {
          [styles.Active]: open && match?.params.caseType,
        })}
      >
        <div className={styles.ImageWrapper}>
          <Image
            src={AllCasesIcon}
            alt=""
            disableSpinner
            animationDuration={700}
          />
        </div>

        <span>All Cases</span>
      </div>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem
            className={styles.ListItem}
            component={NavLink}
            to={`/${HomeRouterNames.ALL_CASES}/investigations`}
            activeClassName={styles.ListItemActive}
          >
            - Investigation
          </ListItem>
          <ListItem
            className={styles.ListItem}
            component={NavLink}
            to={`/${HomeRouterNames.ALL_CASES}/disciplinary`}
            activeClassName={styles.ListItemActive}
          >
            - Disciplinary
          </ListItem>
          <ListItem
            className={styles.ListItem}
            component={NavLink}
            to={`/${HomeRouterNames.ALL_CASES}/lts`}
            activeClassName={styles.ListItemActive}
          >
            - LTS
          </ListItem>
          <ListItem
            className={styles.ListItem}
            component={NavLink}
            to={`/${HomeRouterNames.ALL_CASES}/grievance`}
            activeClassName={styles.ListItemActive}
          >
            - Grievance
          </ListItem>
          <ListItem
            className={styles.ListItem}
            component={NavLink}
            to={`/${HomeRouterNames.ALL_CASES}/appeal`}
            activeClassName={styles.ListItemActive}
          >
            - Appeal
          </ListItem>
          <ListItem
            className={styles.ListItem}
            component={NavLink}
            to={`/${HomeRouterNames.ALL_CASES}/performance`}
            activeClassName={styles.ListItemActive}
          >
            - Performance
          </ListItem>
        </List>
      </Collapse>
    </>
  );
};
