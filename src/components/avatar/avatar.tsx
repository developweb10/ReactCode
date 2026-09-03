import styles from "./avatar.module.scss";
import classNames from "classnames";

import { UserRoleEnum } from "@models/users.models";

import { Avatar as MuiAvatar, AvatarProps } from "@material-ui/core";

interface Props extends AvatarProps {
  role: UserRoleEnum;
  size?: "small" | "medium" | "large";
}

export const Avatar: React.FC<Props> = ({
  className,
  role,
  size = "medium",
  children,
  ...props
}) => {
  return (
    <MuiAvatar
      className={classNames(
        styles.Avatar,
        {
          [styles.HRAvatar]: role === UserRoleEnum.ROLE_HR,
          [styles.SUAvatar]: role === UserRoleEnum.ROLE_ADMIN,
        },
        styles[size],
        className
      )}
      {...props}
    >
      {children}
    </MuiAvatar>
  );
};
