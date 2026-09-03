import React from "react";
import styles from "./note-reason-dialog.module.scss";
import { Dialog } from "@components/dialog/dialog";
import { useMediaQuery, DialogContent } from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";

interface Props {
  open: boolean;
  content: { label: string; text: string; header: string };
  onClose: () => void;
}

export const NoteReasonDialog: React.FC<Props> = ({
  open,
  onClose,
  content,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(
    theme.breakpoints.down(theme.breakpoints.values.smartphone)
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      headerTitle={content.header}
      fullScreen={fullScreen}
      PaperProps={{
        className: styles.DialogPaper,
      }}
    >
      <DialogContent className={styles.Wrapper}>
        <div className={styles.Label}>{content.label}</div>
        <div className={styles.Text}>{content.text}</div>
      </DialogContent>
    </Dialog>
  );
};
