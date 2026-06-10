import { apiClient } from "./apiClient";

export interface UploadResult {
  url: string;
  publicId: string;
}

export const uploadImage = async (file: File): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<UploadResult>("/api/upload/image", formData);

  return response;
};
