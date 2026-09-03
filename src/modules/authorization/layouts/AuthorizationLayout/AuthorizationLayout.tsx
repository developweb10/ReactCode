import styles from "./authorization-layout.module.scss";
import React from "react";
import { ReactComponent as Logo } from "@assets/images/auth-logo.svg";
import { useLocation } from "react-router";
import { Location } from "history";

interface InjectedProps {
  children: (location: Location) => JSX.Element;
}
export const AuthorizationLayout: React.FC<InjectedProps> = (props) => {
  const location = useLocation();

  return (
    <div className={styles.Container}>
      <div className={styles.Wrapper}>
        <Logo className={styles.Logo} />
        {props.children(location)}
      </div>
    </div>
  );
};
