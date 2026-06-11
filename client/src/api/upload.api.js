import apiClient from "./api";
import axios from "axios";

export const uploadApi = {
  //Ask the backend for a presigned URL
  requestUploadUrl: async (filename, contentType) => {
    const response = await apiClient.post("/upload/request-url", {
      filename,
      contentType,
    });
    return response.data.data;
  },

 // Upload the file directly to the cloud (R2 or Cloudinary)
 // The logic auto-detects Cloudinary vs R2 based on the presence of a signature.
  uploadToCloud: async (file, presignedData) => {
    const { uploadUrl, key, signature, timestamp, apiKey } = presignedData;

    // IF CLOUDINARY (Uses POST & form-data)
    if (signature && timestamp && apiKey) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("public_id", key);

      const response = await axios.post(uploadUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Cloudinary returns secure_url
      return {
        url: response.data.secure_url,
        publicId: key,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
      };
    }

    // IF R2 / S3 (Uses PUT & binary body)
    else {
      await axios.put(uploadUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
      });
      
      const baseUrl = uploadUrl.split("?")[0];
      return {
        url: presignedData.publicUrl || baseUrl,
        publicId: key,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
      };
    }
  },

// save the final file record to the backend DB
  saveFileRecord: async (metadata) => {
    const response = await apiClient.post("/upload", metadata);
    return response.data.data;
  },

 //
  uploadFile: async (file, purpose = "other") => {
    try {
      // Step 1: Get secure URL
      const presignedData = await uploadApi.requestUploadUrl(file.name, file.type);
      
      // Step 2: Push to Cloud
      const uploadedData = await uploadApi.uploadToCloud(file, presignedData);
      
      // Step 3: Save to DB
      const record = await uploadApi.saveFileRecord({
        ...uploadedData,
        purpose,
      });
      
      return record;
    } catch (error) {
      console.error("Upload flow failed", error);
      throw error;
    }
  }
};
