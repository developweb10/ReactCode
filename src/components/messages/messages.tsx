import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import styles from "./messages.module.scss";
import { ReactComponent as ArrowIcon } from "@assets/images/arrow-left-icon.svg";
import { ReactComponent as MessagesIcon } from "@assets/images/messages-yellow-icon.svg";

import classNames from "classnames";
import { useState } from "react";
import { useTheme } from "@material-ui/core/styles";
import { Box, ButtonBase, Collapse, useMediaQuery } from "@material-ui/core";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import CloseIcon from "@material-ui/icons/Close";
import { TextArea } from "@components/text-area/text-area";
import { MessageItem } from "./message-item/message-item";
import { MessageModel } from "@models/message.models";
import { UserAuthModel } from "@models/authorization.models";
import { UserRoleEnum } from "@models/users.models";
import { FileModel } from "@models/files.models";
import { FilesApi } from "@api/files/files.api";

interface Props {
  isCreateForm?: boolean;
  authUser: UserAuthModel;
  initialMessages?: MessageModel[];
  showNew?: boolean;
  onMessageAdded: (
    message: string,
    id?: number,
    attachmentIds?: number[]
  ) => void | Promise<void>;
  onMessageDeleted?: (id: number) => void;
  onMessageUpdated?: (id: number, message: string) => void;
  isComment?: boolean;
}

export interface PendingMessage {
  message: string;
  id: number;
  attachmentIds?: number[];
}

export interface MessagesComponentRef {
  flushPendingMessage: () => Promise<PendingMessage | null>;
}

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const SelectedFilePreview = ({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) => {
  const previewUrl = useMemo(
    () => (file.type.startsWith("image/") ? URL.createObjectURL(file) : null),
    [file]
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className={styles.SelectedFile}>
      {previewUrl ? (
        <img
          src={previewUrl}
          alt={file.name}
          className={styles.SelectedFilePreview}
        />
      ) : (
        <AttachFileIcon className={styles.SelectedFileIcon} />
      )}
      <span className={styles.SelectedFileInfo}>
        <strong>{file.name}</strong>
        <small>{formatFileSize(file.size)}</small>
      </span>
      <button
        type="button"
        className={styles.RemoveFileBtn}
        onClick={onRemove}
      >
        <CloseIcon />
      </button>
    </div>
  );
};

export const MessagesComponent = forwardRef<MessagesComponentRef, Props>(
  ({
    isCreateForm,
    authUser,
    initialMessages,
    isComment,
    showNew,
    onMessageAdded,
    onMessageDeleted,
    onMessageUpdated,
  },
  ref
) => {
  const [open, setOpen] = useState(!!initialMessages?.length || isComment);
  const [messages, setMessages] = useState<MessageModel[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const textAreaRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [editMessageId, setEditId] = useState<number | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(
    theme.breakpoints.down(theme.breakpoints.values.tablet)
  );

  const renderMessages = initialMessages || messages;

  const addPendingMessage = useCallback(
    async (): Promise<PendingMessage | null> => {
      const messageValue = textAreaRef.current?.value.trim() || "";

      if (!messageValue && !selectedFiles.length) return null;
      const randomId = Math.random();
      setUploading(true);
      let attachments: FileModel[] = [];
      try {
        attachments = await Promise.all(
          selectedFiles.map(async (file) => {
            const formData = new FormData();
            formData.append("file", file);
            const response = await FilesApi.uploadFile(formData);
            return response.data;
          })
        );
      } catch (error) {
        setUploading(false);
        return null;
      }

      const savedMessage = messageValue || "Attachment";

      if (isCreateForm) {
        const [firstname, surname] = authUser.name.split(" ");
        setMessages([
          {
            message: savedMessage,
            createdDate: new Date().toISOString(),
            id: randomId,
            isOwner: true,
            createdBy: {
              userId: authUser.userId,
              email: authUser.email,
              firstname,
              surname,
              role: authUser.role,
            },
            attachments,
          },
          ...messages,
        ]);
      }
      try {
        await onMessageAdded(
          savedMessage,
          randomId,
          attachments.map((attachment) => attachment.id)
        );
      } catch (error) {
        setUploading(false);
        return null;
      }
      if (!open) {
        setOpen(true);
      }

      if (textAreaRef.current) {
        textAreaRef.current.value = "";
      }
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setUploading(false);

      return {
        message: savedMessage,
        id: randomId,
        attachmentIds: attachments.map((attachment) => attachment.id),
      };
    },
    [
      authUser.email,
      authUser.name,
      authUser.role,
      authUser.userId,
      isCreateForm,
      messages,
      onMessageAdded,
      open,
      selectedFiles,
    ]
  );

  useImperativeHandle(
    ref,
    () => ({
      flushPendingMessage: addPendingMessage,
    }),
    [addPendingMessage]
  );

  const handleAddMessage = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      await addPendingMessage();
    },
    [addPendingMessage]
  );

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((currentFiles) => [...currentFiles, ...files]);
    e.target.value = "";
  };

  const handleRemoveSelectedFile = (fileIndex: number) => {
    setSelectedFiles((currentFiles) =>
      currentFiles.filter((_, index) => index !== fileIndex)
    );
  };

  const handleDeleteMessage = (id: number) => {
    if (isCreateForm) {
      const newMessages = messages.filter((m) => m.id !== id);
      setMessages(newMessages);
    }
    if (onMessageDeleted) {
      onMessageDeleted(id);
    }
  };

  const handleEditMessage = async (id: number, message: string) => {
    if (isCreateForm) {
      setMessages(messages.map((m) => (m.id === id ? { ...m, message } : m)));
    }
    if (onMessageUpdated) {
      await onMessageUpdated(id, message);
    }
    setEditId(null);
  };

  const handleEditClick = (id: number) => {
    setEditId(id === editMessageId ? null : id);
  };

  const handleCancelClick = () => {
    if (textAreaRef.current) {
      textAreaRef.current.value = "";
    }
  };

  const messagesCount = () => {
    let text = isComment ? 'comments': "messages";

    const count = renderMessages.length;

    if (count === 1) {
      text = isComment? 'comment': "message";
    }

    return `${count} ${text}`;
  };

  const hasMessages = renderMessages.length > 0;

  return (
    <div className={styles.Wrapper}>
      <div className={styles.MessagesHeading}>
        <Box display="flex" alignItems="center">
          <h4>{isComment ? 'Comments': 'Messages'}</h4>
          {!isComment && hasMessages && (
            <ButtonBase
              onClick={() => {
                setOpen(!open);
              }}
              className={styles.ArrowButton}
              disableRipple
              disableTouchRipple
            >
              <ArrowIcon
                className={classNames(styles.ArrowIcon, {
                  [styles.Expanded]: open,
                })}
              />
            </ButtonBase>
          )}
        </Box>
        <Box>
          <span className={styles.MessagesCount}>{messagesCount()}</span>
        </Box>
      </div>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <div className={styles.MessagesList}>
          {renderMessages.map((message) => (
            <MessageItem
            isComment={isComment}
              isMobile={isMobile}
              editForm={message.id === editMessageId}
              message={message}
              key={message.id}
              showNew={showNew}
              onDelete={handleDeleteMessage}
              onEdit={handleEditMessage}
              onEditClick={handleEditClick}
              isSuperAdmin={authUser.role === UserRoleEnum.ROLE_ADMIN}
            />
          ))}
        </div>
      </Collapse>
      <form className={styles.MessagesForm} onSubmit={handleAddMessage}>
        <div className={styles.Label}>
          <MessagesIcon />
          {isComment ? (
            <span className={styles.LabelText}>Add Comment</span>
          ) : (
            <span className={styles.LabelText}>Add Message</span>
          )}
        </div>
        <TextArea
          placeholder="Your text here"
          rows={8}
          name="message"
          inputRef={textAreaRef}
        />
        {selectedFiles.length > 0 && (
          <div className={styles.SelectedFiles}>
            {selectedFiles.map((file, index) => (
              <SelectedFilePreview
                file={file}
                key={`${file.name}-${file.lastModified}-${index}`}
                onRemove={() => handleRemoveSelectedFile(index)}
              />
            ))}
          </div>
        )}
        <div className={styles.TextAreaBottomBlock}>
          <input
            ref={fileInputRef}
            className={styles.FileInput}
            type="file"
            multiple
            onChange={handleFilesSelected}
          />
          <ButtonBase
            className={styles.AttachBtn}
            disableTouchRipple
            disableRipple
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            <AttachFileIcon />
            <span className={styles.AttachText}>Attach</span>
          </ButtonBase>
          <ButtonBase
            className={styles.CancelBtn}
            disableTouchRipple
            disableRipple
            onClick={handleCancelClick}
          >
            <span className={styles.CancelText}>Cancel</span>
          </ButtonBase>
          <ButtonBase
            className={styles.SendMessageBtn}
            disableTouchRipple
            disableRipple
            type="submit"
            disabled={uploading}
          >
            <MessagesIcon />
            {isComment ? (
              <span className={styles.SendMessageBtnText}>Send Comment</span>
            ) : (
              <span className={styles.SendMessageBtnText}>Send Message</span>
            )}
          </ButtonBase>
        </div>
      </form>
    </div>
  );
});
