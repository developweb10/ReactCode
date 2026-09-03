import React from "react";
import styles from "./sidebar-nav-link.module.scss";
import { NavLink } from "react-router-dom";
import Image from "material-ui-image";

interface InjectedProps {
  to: string;
  label: string;
  imgSrc: string;
  count?: number;
}

export const SidebarNavLink: React.FC<InjectedProps> = (props) => {
  return (
    <NavLink
      to={props.to}
      className={styles.Container}
      activeClassName={styles.Active}
    >
      <div className={styles.ImageWrapper}>
        <Image
          src={props.imgSrc}
          alt=""
          disableSpinner
          animationDuration={700}
        />
      </div>

      <span className={styles.Label}>{props.label}</span>
      {!!props.count && props.count > 0 && (
        <div className={styles.Count}>{props.count}</div>
      )}
    </NavLink>
  );
};
