import styles from "./add-store-dialog.module.scss";

import React, { useState } from "react";
import { useMediaQuery, DialogContent } from "@material-ui/core";

import { useTheme } from "@material-ui/core/styles";

import { Dialog } from "@components/dialog/dialog";

import { storesService } from "@store/stores/stores.service";

import { StoreForm } from "@modules/home/components/forms/store-form/store-form";

import { removeEmptyStringNullValues } from "@utils/object-clear";

interface Props {
  open: boolean;
  onClose: () => void;
  handleRefetch: () => void;
}

export const AddStoreDialog: React.FC<Props> = ({
  open,
  onClose,
  handleRefetch,
}) => {
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(
    theme.breakpoints.down(theme.breakpoints.values.tablet)
  );

  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      await storesService.createStore(removeEmptyStringNullValues(values));
      setLoading(false);
      onClose();
      handleRefetch();
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      headerTitle="Add Location"
      fullScreen={fullScreen}
    >
      <DialogContent className={styles.Wrapper}>
        <StoreForm
          onHandleSubmit={onSubmit}
          loading={loading}
          textButton="+ Add Location"
        />
      </DialogContent>
    </Dialog>
  );
};
