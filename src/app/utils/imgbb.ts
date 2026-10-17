import axios from "axios";
import FormData from "form-data";
import { envVars } from "../config/env";

export interface ImgBBUploadResponse {
  id: string;
  title: string;
  url: string;
  display_url: string;
  thumb_url?: string;
  delete_url?: string;
}

export const uploadToImgBB = async (
  fileBuffer: Buffer,
  fileName: string,
): Promise<ImgBBUploadResponse> => {
  try {
    const formData = new FormData();
    formData.append("image", fileBuffer.toString("base64"));
    formData.append("name", fileName);

    const apiKey = envVars.IMGBB.API_KEY;
    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      },
    );

    if (response.data && response.data.success) {
      const data = response.data.data;
      return {
        id: data.id,
        title: data.title,
        url: data.url,
        display_url: data.display_url,
        thumb_url: data.thumb?.url,
        delete_url: data.delete_url,
      };
    } else {
      throw new Error("imgBB upload failed with unspecific error");
    }
  } catch (error: any) {
    console.error("imgBB upload error:", error?.response?.data || error.message);
    throw new Error(
      error?.response?.data?.error?.message || "Failed to upload image to imgBB",
    );
  }
};
