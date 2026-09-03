import { useState, useRef } from "react";
import styles from "./avatar-upload.module.scss";
import classNames from "classnames";
import { ReactComponent as DeleteIcon } from "@assets/images/delete-icon.svg";
import { ReactComponent as EditIcon } from "@assets/images/edit-icon.svg";

import { Typography, Button, IconButton } from "@material-ui/core";

interface Props {
  setAvatarFile: (file: File | null) => void;
}

export const AvatarUpload: React.FC<Props> = ({ setAvatarFile }) => {
  const inputEl = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState("");

  const onFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    let file = event.target.files && event.target.files[0];

    if (file) {
      //max 20mb
      if (file.size < 20971520) {
        setPreview(URL.createObjectURL(file));
        setAvatarFile(file);
      }
    }
  };

  return (
    <div className={styles.UploadWrapper}>
      {preview && (
        <div className={styles.PreviewWrapper}>
          <img className={styles.Preview} src={preview} alt="" />
          <div className={styles.ActionButtons}>
            <IconButton
              className={styles.EditButton}
              onClick={() => {
                inputEl.current?.click();
              }}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              className={styles.DeleteButton}
              onClick={() => {
                setPreview("");
                if (inputEl.current) {
                  inputEl.current.value = "";
                  setAvatarFile(null);
                }
              }}
            >
              <DeleteIcon />
            </IconButton>
          </div>
        </div>
      )}
      <input
        className={styles.Input}
        accept="image/*"
        type="file"
        ref={inputEl}
        onChange={onFileUpload}
      />
      {!preview && (
        <Button
          disableElevation
          className={classNames("button-primary", styles.AddButton)}
          color="primary"
          variant="contained"
          onClick={() => {
            inputEl.current?.click();
          }}
        >
          <Typography variant="button">Add Avatar</Typography>
        </Button>
      )}
    </div>
  );
};
