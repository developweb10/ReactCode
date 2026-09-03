import styles from "./dialog.module.scss";
import { ReactComponent as CrossIcon } from "@assets/images/cross-icon.svg";
import IconButton from "@material-ui/core/IconButton";
import {
  Dialog as MuiDialog,
  DialogProps,
  DialogTitle,
  Typography,
} from "@material-ui/core/";

interface Props extends DialogProps {
  headerTitle: string;
  headerEntity?: string;
}

export const Dialog: React.FC<Props> = ({
  children,
  open,
  headerTitle,
  headerEntity,

  onClose,
  ...props
}) => {
  return (
    <MuiDialog
      open={open}
      className={styles.Dialog}
      PaperProps={{
        className: styles.DialogPaper,
      }}
      onClose={onClose}
      {...props}
    >
      <DialogTitle className={styles.DialogTitle} disableTypography>
        <Typography className={styles.DialogTitleText}>
          {headerTitle}
        </Typography>
        {headerEntity && (
          <Typography className={styles.DialogTitleEntityText}>
            {headerEntity}
          </Typography>
        )}

        <IconButton
          onClick={() => {
            if (onClose) onClose({}, "backdropClick");
          }}
          className={styles.CrossIcon}
          disableRipple
        >
          <CrossIcon />
        </IconButton>
      </DialogTitle>

      {children}
    </MuiDialog>
  );
};
