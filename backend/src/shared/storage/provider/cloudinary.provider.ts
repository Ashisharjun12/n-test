import { IStorageProvider, PresignedUrlResult } from "../storage.interface.js";
import { _config } from "../../../config/config.js";
import { v2 as cloudinary } from "cloudinary";
import { logger } from "../../../utils/logger.js";

// configure cloudinary
cloudinary.config({
  cloud_name: _config.CLOUDINARY_CLOUD_NAME,
  api_key: _config.CLOUDINARY_API_KEY,
  api_secret: _config.CLOUDINARY_SECRET,
});

export class CloudinaryProvider implements IStorageProvider {

  async delete(publicId: string): Promise<void> {
    logger.info(`CloudinaryProvider delete called: ${publicId}`);
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      logger.error(`CloudinaryProvider failed to delete: ${error}`);
      throw error;
    }
  }

  async getPresignedUploadUrl(filename: string, contentType: string): Promise<PresignedUrlResult> {
    const timestamp = Math.round(new Date().getTime() / 1000);
    // Cloudinary folder mapping
    let folder = "others";
    if (contentType.startsWith('image/')) folder = 'images';
    if (contentType === 'application/pdf') folder = 'pdf';

    const public_id = `uploads/${folder}/${timestamp}-${filename.replace(/\.[^/.]+$/, "")}`; // Remove extension for public_id

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        public_id: public_id,
      },
      _config.CLOUDINARY_SECRET!
    );

    return {
      uploadUrl: `https://api.cloudinary.com/v1_1/${_config.CLOUDINARY_CLOUD_NAME}/auto/upload`,
      key: public_id,
      signature,
      timestamp,
      apiKey: _config.CLOUDINARY_API_KEY,
    };
  }
}
