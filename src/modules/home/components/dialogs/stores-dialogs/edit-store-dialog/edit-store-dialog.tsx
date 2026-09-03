import styles from "./edit-store-dialog.module.scss";

import React, { useState } from "react";
import { useMediaQuery, DialogContent } from "@material-ui/core";

import { useTheme } from "@material-ui/core/styles";
import { Dialog } from "@components/dialog/dialog";
import { storesService } from "@store/stores/stores.service";
import { StoreModel } from "@models/store.models";

import { StoreForm } from "@modules/home/components/forms/store-form/store-form";
import { removeEmptyStringNullValues } from "@utils/object-clear";
interface Props {
  open: boolean;
  selectedStore: StoreModel;
  onClose: () => void;
}

export const EditStoreDialog: React.FC<Props> = ({
  open,
  selectedStore,
  onClose,
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const fullScreen = useMediaQuery(
    theme.breakpoints.down(theme.breakpoints.values.tablet)
  );

  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      await storesService.editStore(
        removeEmptyStringNullValues({ ...selectedStore, ...values }),
        selectedStore.id
      );
      setLoading(false);
      onClose();
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      headerTitle="Edit Location"
      fullScreen={fullScreen}
    >
      <DialogContent className={styles.Wrapper}>
        <StoreForm
          onHandleSubmit={onSubmit}
          loading={loading}
          initialValuesProps={selectedStore}
          textButton="Save"
        />
      </DialogContent>
    </Dialog>
  );
};
