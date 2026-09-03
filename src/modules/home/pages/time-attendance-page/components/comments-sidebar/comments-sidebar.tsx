import { ReactComponent as CrossIcon } from "@assets/images/cross-icon.svg";
import { ReactComponent as EditIcon } from "@assets/images/edit-icon.svg";
import styles from "./comments-sidebar.module.scss";

import { Drawer, IconButton, Typography } from "@material-ui/core/";

import { UserAuthModel } from "@models/authorization.models";

import { CommentsSidebarBody } from "./comments-sidebar-body";

interface Props {
  commentsDrawer: {
    initialDay: string;
    initialAssignmentId: number;
  } | null;
  handleClose: () => void;
  currentUser: UserAuthModel;
}
export const CommentsSidebar: React.FC<Props> = ({
  commentsDrawer,
  currentUser,
  handleClose,
}) => {
  return (
    <Drawer
      classes={{ paper: styles.Paper }}
      anchor={"right"}
      open={Boolean(commentsDrawer)}
      onClose={handleClose}
    >
      <div className={styles.DrawerHeader}>
        <div className={styles.EditIconWrapper}>
          <EditIcon />
        </div>
        <Typography className={styles.HeaderText}>Add comment</Typography>
        <IconButton
          onClick={handleClose}
          className={styles.CloseButton}
          disableRipple
        >
          <CrossIcon />
        </IconButton>
      </div>
      {commentsDrawer && (
        <CommentsSidebarBody
          currentUser={currentUser}
          drawerInitialData={commentsDrawer}
        />
      )}
    </Drawer>
  );
};
