import styles from "./message-item.module.scss";
import { useCallback, useEffect, useState } from "react";
import { ReactComponent as DeleteIcon } from "@assets/images/delete-icon.svg";
import { ReactComponent as EditIcon } from "@assets/images/edit-icon.svg";
import { Avatar } from "@components/avatar/avatar";
import { TextArea } from "@components/text-area/text-area";
import { Typography, IconButton, Tooltip, Button } from "@material-ui/core";
import AttachFileIcon from "@material-ui/icons/AttachFile";

import { MessageModel } from "@models/message.models";
import moment from "moment";
import { getRole } from "@utils/get-user-role";
import { getUserInitials } from "@utils/get-user-initials";
import { FilesApi } from "@api/files/files.api";
import { downloadBlob } from "@utils/saveFile";
import { FileModel } from "@models/files.models";

interface Props {
  editForm: boolean;
  isComment?: boolean;
  message: MessageModel;
  isSuperAdmin: boolean;
  isMobile: boolean;
  showNew?: boolean;
  onDelete: (id: number) => void;
  onEdit: (id: number, message: string) => void;
  onEditClick: (id: number) => void;
}

const AttachmentPreview = ({
  attachment,
  onDownload,
}: {
  attachment: FileModel;
  onDownload: (attachment: FileModel) => void;
}) => {
  const handleOpenAttachment = () => {
    onDownload(attachment);
  };

  return (
    <button
      type="button"
      className={styles.AttachmentLink}
      onClick={handleOpenAttachment}
    >
      <AttachFileIcon />
      <span>{attachment.originalName}</span>
    </button>
  );
};

export const MessageItem: React.FC<Props> = ({
  message,
  editForm,
  isComment,
  isSuperAdmin,
  isMobile,
  showNew,
  onEditClick,
  onEdit,
  onDelete,
}) => {
  const [editedMessage, setEditedMessage] = useState(message.message);

  useEffect(() => {
    if (editForm) {
      setEditedMessage(message.message);
    }
  }, [editForm, message.message]);

  const handleEditSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const nextMessage = editedMessage.trim();
      if (!nextMessage) return;
      onEdit(message.id, nextMessage);
    },
    [editedMessage, onEdit, message.id]
  );

  const handleDownloadAttachment = async (attachment: FileModel) => {
    const response = await FilesApi.getFile(attachment.id);
    downloadBlob(response, undefined, attachment.originalName);
  };

  return (
    <div className={styles.MessageItem}>
      <div className={styles.MessageHeader}>
        <div className={styles.MessageAuthor}>
          <Avatar
            className={styles.AuthorAvatar}
            role={message.createdBy.role}
            size={isMobile ? "small" : "medium"}
          >
            {getUserInitials(
              message.createdBy.firstname,
              message.createdBy.surname
            )}
          </Avatar>

          <div className={styles.AuthorInfo}>
            <Typography className={styles.AuthorName}>
              {`${message.createdBy.firstname} ${message.createdBy.surname}`}{" "}
              {message.isOwner ? "(You)" : null}
            </Typography>
            <Typography className={styles.AuthorPosition}>
              {getRole(message.createdBy.role)}
            </Typography>
          </div>
        </div>
        {showNew && message.isNew && !message.isOwner && (
          <div className={styles.MessageNewWrap}>
            <div className={styles.NewCircle}></div>
          </div>
        )}

        <Typography className={styles.MessageDate}>
          {moment(message.createdDate).format("DD MMM YYYY [at] hh:mm a")}
        </Typography>
      </div>
      <div className={styles.MessageBody}>
        {editForm ? (
          <form onSubmit={handleEditSubmit}>
            <TextArea
              autoFocus
              className={styles.EditMessageTextarea}
              value={editedMessage}
              onChange={(event) => setEditedMessage(event.target.value)}
              name="edit_message"
              rows={4}
            />
            <div className={styles.EditModeBtns}>
              <Button
                disableElevation
                disableRipple
                className="button-tertiary"
                onClick={() => onEditClick(message.id)}
              >
                Cancel
              </Button>
              <Button
                className="button-primary"
                color="primary"
                variant="contained"
                disableElevation
                disableRipple
                type="submit"
              >
                Save
              </Button>
            </div>
          </form>
        ) : (
          <Typography className={styles.MessageText}>
            {message.message}
          </Typography>
        )}
        {!!message.attachments?.length && (
          <div className={styles.AttachmentsList}>
            {message.attachments.map((attachment) => (
              <AttachmentPreview
                key={attachment.id}
                attachment={attachment}
                onDownload={handleDownloadAttachment}
              />
            ))}
          </div>
        )}
      </div>

      {(message.isOwner || isSuperAdmin) && !editForm && (
        <div className={styles.MessageActions}>
          <Tooltip title={`Edit ${isComment ? 'Comment': 'Message'}`}>
            <IconButton
              className={styles.EditBtn}
              onClick={() => onEditClick(message.id)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={`Delete ${isComment ? 'Comment': 'Message'}`}>
            <IconButton
              className={styles.DeleteBtn}
              onClick={() => onDelete(message.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </div>
      )}
    </div>
  );
};
