import { IUpload } from "./upload.schema.js";
import { StorageService } from "../../infrastructure/storage/storage.service.js";
import { PresignedUrlResult } from "../../shared/storage/storage.interface.js";
import { CreateUploadDto, IUploadRepository, IUploadService } from "./upload.interface.js";

export class UploadService implements IUploadService {
  constructor(private readonly uploadRepo: IUploadRepository) { }

  // request upload url
  async requestUploadUrl(filename: string, contentType: string): Promise<PresignedUrlResult> {
    return await StorageService.getPresignedUploadUrl(filename, contentType);
  }

 // save file record
  async saveFileRecord(data: CreateUploadDto): Promise<IUpload> {
    return await this.uploadRepo.create(data);
  }

 // delete file
  async deleteFile(uploadId: string): Promise<boolean> {
    const upload = await this.uploadRepo.findById(uploadId);
    if (!upload) return false;

    try {
      // 1. Delete from Cloud
      await StorageService.deleteFile(upload.publicId);
    } catch (error) {
      console.error(`Failed to delete file from cloud: ${upload.publicId}`, error);
    }

    // 2. Delete from Database
    await this.uploadRepo.delete(uploadId);
    return true;
  }

 // list files
  async listFiles(purpose?: string): Promise<IUpload[]> {
    return await this.uploadRepo.findAll(purpose);
  }
}
