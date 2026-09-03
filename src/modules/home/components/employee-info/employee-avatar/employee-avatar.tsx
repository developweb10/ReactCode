import { useState, useEffect, useRef } from "react";
import styles from "./employee-avatar.module.scss";
import { FilesApi } from "@api/files/files.api";
import Image from "material-ui-image";
import AvatarPlaceholder from "@assets/images/avatar.jpg";
import { ReactComponent as DeleteIcon } from "@assets/images/delete-icon.svg";
import { ReactComponent as EditIcon } from "@assets/images/edit-icon.svg";

import { employeesService } from "@store/employees/employees.service";

import { IconButton, CircularProgress } from "@material-ui/core";

interface Props {
  avatarId?: number;
  editable?: boolean;
  onAvatarUpload: (avatarId: number) => void;
  handleAvatarDelete: () => Promise<void>;
}
export const EmployeeAvatar: React.FC<Props> = ({
  avatarId,
  editable,
  onAvatarUpload,
  handleAvatarDelete,
}) => {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const inputEl = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    try {
      const avatarId = await employeesService.uploadAvatar(formData);
      if (avatarId) {
        onAvatarUpload(avatarId);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const onAvatarDelete = async () => {
    setLoading(true);
    try {
      await handleAvatarDelete();
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      if (avatarId) {
        try {
          const res = await FilesApi.getFile(avatarId);

          const reader = new FileReader();

          reader.readAsDataURL(res.data);
          reader.onload = function () {
            if (typeof reader.result === "string") {
              setImage(reader.result);
            }
          };
        } catch (error) {}
      }
    })();
  }, [avatarId]);

  const onFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    let file = event.target.files && event.target.files[0];
    if (file) {
      //max 20mb
      if (file.size < 20971520) {
        setImage(URL.createObjectURL(file));
        handleAvatarUpload(file);
        if (inputEl.current) {
          inputEl.current.value = "";
        }
      }
    }
  };

  return (
    <div className={styles.ProfilePicCard}>
      {loading && (
        <div className="overlay-loader with-opacity">
          <CircularProgress size="6rem" variant="indeterminate" disableShrink />
        </div>
      )}
      <Image
        src={avatarId ? image || "" : AvatarPlaceholder}
        className={styles.ProfilePic}
        style={{
          ...(avatarId ? {} : { backgroundColor: "none" }),
          borderRadius: 8,
        }}
      />
      {editable && (
        <div className={styles.ActionButtons}>
          <IconButton
            className={styles.EditButton}
            onClick={() => {
              inputEl.current?.click();
            }}
          >
            <EditIcon />
          </IconButton>
          {avatarId && (
            <IconButton
              className={styles.DeleteButton}
              onClick={onAvatarDelete}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </div>
      )}

      <input
        className={styles.Input}
        accept="image/*"
        type="file"
        ref={inputEl}
        onChange={onFileUpload}
      />
    </div>
  );
};
