import { ApiServiceInstance } from "../api-service";
import { MessageModel } from "@models/message.models";

export class MessagesApi {
  static async updateMessage(id: number, newMessage: string) {
    return await ApiServiceInstance.put<MessageModel>(
      `/private/messages/${id}`,
      newMessage,
      { headers: { "Content-Type": "text/plain" } }
    );
  }

  static async deleteMessage(id: number) {
    return await ApiServiceInstance.delete(`/private/messages/${id}`);
  }
}
