import { ApiServiceInstance } from "../api-service";
import { FileModel } from "@models/files.models";

export class FilesApi {
  static async uploadFile(formData: FormData) {
    return await ApiServiceInstance.post<FileModel>("/public/files", formData);
  }

  static async getFile(id: number) {
    return await ApiServiceInstance.get<Blob>(`/public/files/${id}`, {
      responseType: "blob",
    });
  }
}
