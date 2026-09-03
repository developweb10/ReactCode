import styles from "./page-header.module.scss";
import classNames from "classnames";
import React, { useState, useCallback } from "react";
import {
  Button,
  Typography,
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem,
} from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { useObservableState } from "observable-hooks";
import { authorizationQuery } from "@store/authorization/authorization.query";
import { authorizationService } from "@store/authorization/authorization.service";
import { getAuthUserInitials } from "@utils/get-user-initials";
import { getRole } from "@utils/get-user-role";
import { Avatar } from "@components/avatar/avatar";
import { IconImage } from "@components/icon-image/icon-image";
import { NotificationBell } from "@components/notification-bell/notification-bell";

interface PageHeaderProps {
  // General Props
  title: string;
  icon?: string;

  // Button Props
  buttonTitle?: string | React.ReactNode;
  buttonIcon?: string | React.ReactNode;
  onButtonClick?: () => void;

  // Search Props
  search?: React.ReactNode;
  // Tabs Props
  tabs?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  icon,
  buttonTitle,
  buttonIcon,
  onButtonClick,
  tabs,
  search,
}) => {
  const theme = useTheme();
  const tabletBreakpoint = useMediaQuery(
    theme.breakpoints.down(theme.breakpoints.values.tablet)
  );

  const currentUser = useObservableState(authorizationQuery.user$);

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

  return (
    <div className={styles.HeaderWrapper}>
      <div className={styles.Header}>
        <div className={styles.TitleWrapper}>
          {icon && <IconImage path={icon} size="md" filled />}

          <Typography className={styles.Title} variant="h5">
            {title}
          </Typography>
        </div>
        <div className={styles.rightSection}>
          {!!search && (
            <div className={styles.HeaderSearchWrapper}>{search}</div>
          )}
          {!!buttonTitle && (
            <Button
              className={classNames("button-primary", styles.HeaderButton, {
                [styles.MobileButton]: tabletBreakpoint,
              })}
              color="primary"
              variant="contained"
              disableElevation
              onClick={onButtonClick}
              startIcon={buttonIcon}
              classes={{
                startIcon: classNames({
                  [styles.MobileStartIcon]: tabletBreakpoint,
                }),
              }}
            >
              {!tabletBreakpoint && buttonTitle}
            </Button>
          )}
          {!tabletBreakpoint && currentUser && (
            <>
              <NotificationBell />
              <div className={styles.HeaderProfileSection}>
                <div className={styles.AvatarWrap}>
                <div className={styles.Avatar}>
                  <Avatar alt="Remy Sharp" role={currentUser.role}>
                    {getAuthUserInitials(currentUser.name)}
                  </Avatar>
                </div>

                <div className={styles.ProfileSimpleInfo}>
                  <span className={styles.Name}>{currentUser.name}</span>
                  <span className={styles.Position}>
                    {getRole(currentUser.role)}
                  </span>
                </div>
              </div>
              <div>
                <IconButton
                  size="small"
                  aria-controls="header-profile-menu"
                  aria-haspopup="true"
                  onClick={handleClick}
                >
                  <ExpandMoreIcon style={{ fontSize: 18 }} />
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
            </>
          )}
        </div>
      </div>
      {tabs && <div className={styles.HeaderTabsWrapper}>{tabs}</div>}
    </div>
  );
};
