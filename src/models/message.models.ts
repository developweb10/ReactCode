import { UserModel } from "./users.models";
import { FileModel } from "./files.models";

export interface MessageModel {
  id: number;
  message: string;
  createdDate: string;
  createdBy: UserModel;
  isOwner: boolean;
  isNew?: boolean;
  attachments?: FileModel[];
}

export interface AddMessageDto {
  message: string;
  attachmentIds?: number[];
}
