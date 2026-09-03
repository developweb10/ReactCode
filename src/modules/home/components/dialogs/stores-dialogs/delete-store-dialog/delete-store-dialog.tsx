import styles from "./delete-store-dialog.module.scss";
import classNames from "classnames";
import { ReactComponent as DeleteIcon } from "@assets/images/delete-yellow-icon.svg";
import React, { useState } from "react";
import { storesService } from "@store/stores/stores.service";

import {
  useMediaQuery,
  Button,
  CircularProgress,
  DialogContent,
} from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";

import { Dialog } from "@components/dialog/dialog";

interface Props {
  open: boolean;
  storeId: number;
  onClose: () => void;
  handleRefetch: () => void;
}

export const DeleteStoreDialog: React.FC<Props> = ({
  open,
  onClose,
  storeId,
  handleRefetch,
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(
    theme.breakpoints.down(theme.breakpoints.values.smartphone)
  );

  const handleStoreDelete = async () => {
    setLoading(true);
    try {
      await storesService.deleteStore(storeId);
      setSuccess(true);
    } catch (error) {}

    setLoading(false);
  };

  const onExited = () => {
    if (success && handleRefetch) {
      handleRefetch();
    }
    setSuccess(false);
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      onExited={onExited}
      fullWidth
      headerTitle="Remove Location"
      fullScreen={fullScreen}
      PaperProps={{
        className: styles.DialogPaper,
      }}
    >
      {success ? (
        <DialogContent className={styles.SuccessWrapper}>
          <div className={styles.IconWrapper}>
            <div className={styles.Icon}>
              <DeleteIcon />
            </div>
          </div>
          <div className={styles.Title}>
            <span className={styles.TitleText}>Location successfully</span>
            <strong className={styles.TitleText}>removed</strong>
          </div>
        </DialogContent>
      ) : (
        <DialogContent className={styles.Wrapper}>
          {loading && (
            <div className="overlay-loader with-opacity">
              <CircularProgress
                size="6rem"
                variant="indeterminate"
                disableShrink
              />
            </div>
          )}
          <div className={styles.Heading}>
            <div className={styles.IconWrapper}>
              <div className={styles.Icon}>
                <DeleteIcon />
              </div>
            </div>
            <div className={styles.Title}>
              <span className={styles.TitleText}>Are you sure you want to</span>
              <strong className={styles.TitleText}>remove Location?</strong>
            </div>
          </div>
          <div className={styles.ButtonsWrapper}>
            <Button
              disabled={loading}
              disableElevation
              disableRipple
              className="button-tertiary"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              disabled={loading}
              disableElevation
              className={classNames("button-primary", styles.RemoveButton)}
              color="primary"
              variant="contained"
              onClick={handleStoreDelete}
            >
              Remove
            </Button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
};
