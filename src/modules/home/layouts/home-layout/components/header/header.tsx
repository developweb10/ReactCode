import React, { useCallback, useState, useMemo } from "react";
import styles from "./header.module.scss";
import classNames from "classnames";
import { ReactComponent as Logo } from "@assets/images/side-bar-logo.svg";
import { IconButton, Menu, MenuItem, ButtonBase } from "@material-ui/core";
import { Avatar } from "@components/avatar/avatar";
import { UserAuthModel } from "@models/authorization.models";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import MenuIcon from "@material-ui/icons/Menu";
import { authorizationService } from "@store/authorization/authorization.service";
import { getAuthUserInitials } from "@utils/get-user-initials";
import { getRole } from "@utils/get-user-role";
import { isMobile } from "react-device-detect";
import { NotificationBell } from "@components/notification-bell/notification-bell";
interface HeaderProps {
  onMobileIconClick: () => void;
  currentUser: UserAuthModel;
}
export const Header: React.FC<HeaderProps> = ({
  onMobileIconClick,
  currentUser,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    },
    []
  );

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const logout = useCallback(() => {
    authorizationService.logout();
    handleClose();
  }, [handleClose]);

  const mobileHeader = useMemo(
    () => (
      <div
        className={classNames(styles.MobileContainer, {
          [styles.IsMobile]: isMobile,
        })}
      >
        <div className={styles.LeftSection}>
          <ButtonBase
            disableRipple
            onClick={onMobileIconClick}
            className={styles.MenuButton}
          >
            <MenuIcon className={styles.MenuIcon} />
          </ButtonBase>
        </div>
        <div className={styles.LogoWrap}>
          <Logo />
        </div>
        <div className={styles.RightSection}>
          <NotificationBell />
          <div className={styles.AvatarWrap}>
            <div className={styles.Avatar}>
              <IconButton
                size="small"
                aria-controls="header0profile-menu"
                aria-haspopup="true"
                onClick={handleClick}
              >
                <Avatar alt="Remy Sharp" role={currentUser.role} size="small">
                  {getAuthUserInitials(currentUser.name)}
                </Avatar>
              </IconButton>

              <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "center",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "center",
                }}
                getContentAnchorEl={null}
                elevation={1}
                classes={{ paper: styles.Paper }}
              >
                <MenuItem onClick={logout}>Log out</MenuItem>
              </Menu>
            </div>
          </div>
        </div>
      </div>
    ),
    [
      anchorEl,
      currentUser.name,
      currentUser.role,
      handleClick,
      handleClose,
      logout,
      onMobileIconClick,
    ]
  );

  return (
    <>
      {mobileHeader}
      {/* Desktop header is commented out as the profile was moved to PageHeader
      <div
        className={classNames(styles.Container, {
          [styles.IsMobile]: isMobile,
        })}
      >
      </div>
      */}
    </>
  );
};
